# Reusable License Backend Architecture

> Complete production-ready architecture for license key management with Vercel, PostgreSQL, and Paddle

This document provides a complete, reusable architecture for implementing secure license validation with device limits, webhook integration, and anti-sharing protection. Copy and adapt this for any project requiring license key management.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Backend Implementation](#backend-implementation)
6. [Frontend Integration](#frontend-integration)
7. [Environment Variables](#environment-variables)
8. [Deployment](#deployment)
9. [Adapting for Your Project](#adapting-for-your-project)

---

## Architecture Overview

### Key Features

- **Cryptographic License Keys**: HMAC-signed UUID-based keys (tamper-proof)
- **Server-Side Validation**: PostgreSQL database with rate limiting
- **Paddle Webhook Integration**: Auto-generate licenses after purchase
- **2-Device Limit**: Browser fingerprinting with device management UI
- **24-Hour Revalidation**: Automatic license checking every 24 hours
- **Vercel Serverless**: Zero-config serverless API routes
- **TypeScript**: Full type safety across stack

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  ProBadge    │  │  useProStatus│  │  Device Fingerprint  │  │
│  │  Component   │  │  Hook        │  │  Generator           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP Requests
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Serverless Functions                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /api/licenses/validate     - Validate license key       │  │
│  │  /api/licenses/devices/activate  - Activate device       │  │
│  │  /api/licenses/devices/list      - List devices          │  │
│  │  /api/licenses/devices/[id]      - Deactivate device     │  │
│  │  /api/webhooks/paddle       - Handle Paddle webhooks     │  │
│  │  /api/health                - Health check               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Vercel Postgres Database                     │
│  ┌───────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │   licenses    │  │ device_activations│  │  webhook_logs   │  │
│  └───────────────┘  └──────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  ▲
                                  │ Webhook Events
┌─────────────────────────────────────────────────────────────────┐
│                         Paddle Payment                           │
│  transaction.completed → Create License                          │
│  transaction.refunded  → Revoke License                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend
- **Vercel Serverless Functions** - Zero-config API routes
- **Vercel Postgres** - Managed PostgreSQL with connection pooling
- **TypeScript** - Type-safe backend
- **@vercel/node** - Vercel request/response types

### Frontend
- **React** - UI framework
- **TypeScript** - Type-safe frontend
- **localStorage** - Client-side license caching

### Payment & Webhooks
- **Paddle** - Payment processing with built-in webhooks
- **HMAC Signature Verification** - Webhook security

### Security
- **HMAC-SHA256** - License key signing
- **Rate Limiting** - In-memory request throttling (10 req/min)
- **Device Fingerprinting** - Browser/device identification

---

## Project Structure

```
your-project/
├── api/                          # Vercel serverless functions
│   ├── health.ts                 # Health check endpoint
│   ├── licenses/
│   │   ├── validate.ts           # Validate license key
│   │   └── devices/
│   │       ├── activate.ts       # Activate device (2-device limit)
│   │       ├── list.ts           # List all devices for license
│   │       └── [id].ts           # Deactivate specific device
│   └── webhooks/
│       └── paddle.ts             # Paddle webhook handler
│
├── lib/                          # Backend utilities
│   ├── crypto.ts                 # License key generation & validation
│   ├── db.ts                     # PostgreSQL database operations
│   ├── device-utils.ts           # Device activation database queries
│   └── paddle-verify.ts          # Paddle webhook signature verification
│
├── src/                          # Frontend code
│   ├── components/
│   │   └── ProBadge.tsx          # Pro status badge + device management UI
│   ├── hooks/
│   │   └── useProStatus.ts       # Pro status hook with 24hr revalidation
│   └── utils/
│       ├── license.ts            # License activation/deactivation
│       └── deviceFingerprint.ts  # Browser fingerprint generator
│
├── vercel.json                   # Vercel configuration
├── package.json                  # Dependencies
└── .env.local                    # Local environment variables
```

---

## Database Schema

### Complete SQL Schema

```sql
-- ============================================
-- LICENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS licenses (
  id SERIAL PRIMARY KEY,
  license_key VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  paddle_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  paddle_customer_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_email ON licenses(email);
CREATE INDEX IF NOT EXISTS idx_paddle_transaction ON licenses(paddle_transaction_id);

-- ============================================
-- DEVICE ACTIVATIONS TABLE (2-Device Limit)
-- ============================================
CREATE TABLE IF NOT EXISTS device_activations (
  id SERIAL PRIMARY KEY,
  license_id INTEGER NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  device_fingerprint VARCHAR(255) NOT NULL,
  device_name VARCHAR(255),
  device_info JSONB DEFAULT '{}'::jsonb,
  activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP,
  UNIQUE(license_id, device_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_license_device ON device_activations(license_id, device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_revoked_at ON device_activations(revoked_at);

-- ============================================
-- WEBHOOK LOGS TABLE (Debugging)
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  paddle_event_id VARCHAR(255) UNIQUE,
  payload JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'processed',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_created_at ON webhook_logs(created_at);
```

### Schema Explanation

#### `licenses` Table
- **license_key**: Unique HMAC-signed license key (format: `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX-XXXXXXXX`)
- **email**: Customer email
- **paddle_transaction_id**: Unique Paddle transaction ID (for idempotency)
- **status**: `'active'`, `'revoked'`, or `'refunded'`
- **metadata**: Additional custom data (JSONB for flexibility)

#### `device_activations` Table
- **device_fingerprint**: Unique browser/device identifier
- **device_name**: Human-readable name (e.g., "Chrome on macOS")
- **device_info**: Additional device metadata
- **revoked_at**: NULL = active, timestamp = deactivated

#### `webhook_logs` Table
- Stores all webhook events for debugging
- **paddle_event_id**: Prevents duplicate processing

---

## Backend Implementation

### 1. License Key Cryptography (`lib/crypto.ts`)

```typescript
import crypto from 'crypto';

const LICENSE_SECRET = process.env.LICENSE_SECRET_KEY!;

export interface LicenseData {
  transactionId: string;
  email: string;
  timestamp: number;
}

/**
 * Generate a cryptographically signed license key
 * Format: UUID-SIGNATURE (e.g., 12345678-1234-1234-1234-123456789012-ABCD1234)
 */
export function generateLicenseKey(data: LicenseData): string {
  // Generate random UUID
  const uuid = crypto.randomUUID().toUpperCase().replace(/-/g, '');
  const formattedUuid = `${uuid.substring(0, 8)}-${uuid.substring(8, 12)}-${uuid.substring(12, 16)}-${uuid.substring(16, 20)}-${uuid.substring(20)}`;

  // Create HMAC signature
  const dataString = `${formattedUuid}:${data.transactionId}:${data.email}:${data.timestamp}`;
  const signature = crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(dataString)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();

  return `${formattedUuid}-${signature}`;
}

/**
 * Validate license key format (client-side quick check)
 */
export function isValidLicenseFormat(key: string): boolean {
  const pattern = /^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}(-[A-Z0-9]{8})?$/;
  return pattern.test(key);
}
```

**Why HMAC?**
- **Tamper-proof**: Changing any character invalidates the signature
- **Secure**: Requires secret key to forge licenses
- **Deterministic**: Same input always produces same signature

---

### 2. Database Operations (`lib/db.ts`)

```typescript
import { sql } from '@vercel/postgres';

export interface License {
  id: number;
  license_key: string;
  email: string;
  paddle_transaction_id: string;
  paddle_customer_id: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
  metadata: Record<string, any>;
}

/**
 * Create a new license
 */
export async function createLicense(
  licenseKey: string,
  email: string,
  transactionId: string,
  customerId?: string,
  metadata?: Record<string, any>
): Promise<License> {
  const result = await sql<License>`
    INSERT INTO licenses (
      license_key,
      email,
      paddle_transaction_id,
      paddle_customer_id,
      metadata
    )
    VALUES (
      ${licenseKey},
      ${email},
      ${transactionId},
      ${customerId || null},
      ${JSON.stringify(metadata || {})}
    )
    RETURNING *
  `;

  return result.rows[0];
}

/**
 * Find license by key
 */
export async function findLicenseByKey(licenseKey: string): Promise<License | null> {
  const result = await sql<License>`
    SELECT * FROM licenses
    WHERE license_key = ${licenseKey}
    LIMIT 1
  `;

  return result.rows[0] || null;
}

/**
 * Find license by transaction ID (for idempotency)
 */
export async function findLicenseByTransaction(transactionId: string): Promise<License | null> {
  const result = await sql<License>`
    SELECT * FROM licenses
    WHERE paddle_transaction_id = ${transactionId}
    LIMIT 1
  `;

  return result.rows[0] || null;
}

/**
 * Revoke a license
 */
export async function revokeLicense(licenseKey: string): Promise<void> {
  await sql`
    UPDATE licenses
    SET status = 'revoked', updated_at = CURRENT_TIMESTAMP
    WHERE license_key = ${licenseKey}
  `;
}

/**
 * Log webhook event
 */
export async function logWebhook(
  eventType: string,
  eventId: string,
  payload: any,
  status: string,
  errorMessage?: string
): Promise<void> {
  await sql`
    INSERT INTO webhook_logs (event_type, paddle_event_id, payload, status, error_message)
    VALUES (${eventType}, ${eventId}, ${JSON.stringify(payload)}, ${status}, ${errorMessage || null})
    ON CONFLICT (paddle_event_id) DO NOTHING
  `;
}
```

---

### 3. Device Management (`lib/device-utils.ts`)

```typescript
import { sql } from '@vercel/postgres';

export interface DeviceActivation {
  id: number;
  license_id: number;
  device_fingerprint: string;
  device_name: string | null;
  device_info: Record<string, any>;
  activated_at: Date;
  last_seen_at: Date;
  revoked_at: Date | null;
}

/**
 * Create a new device activation
 */
export async function createDeviceActivation(
  licenseId: number,
  deviceFingerprint: string,
  deviceName?: string,
  deviceInfo?: Record<string, any>
): Promise<DeviceActivation> {
  const result = await sql<DeviceActivation>`
    INSERT INTO device_activations (
      license_id,
      device_fingerprint,
      device_name,
      device_info
    )
    VALUES (
      ${licenseId},
      ${deviceFingerprint},
      ${deviceName || null},
      ${JSON.stringify(deviceInfo || {})}
    )
    ON CONFLICT (license_id, device_fingerprint)
    DO UPDATE SET last_seen_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  return result.rows[0];
}

/**
 * Find a device activation
 */
export async function findDeviceActivation(
  licenseId: number,
  deviceFingerprint: string
): Promise<DeviceActivation | null> {
  const result = await sql<DeviceActivation>`
    SELECT * FROM device_activations
    WHERE license_id = ${licenseId}
      AND device_fingerprint = ${deviceFingerprint}
      AND revoked_at IS NULL
    LIMIT 1
  `;

  return result.rows[0] || null;
}

/**
 * Count active devices for a license
 */
export async function countActiveDevices(licenseId: number): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM device_activations
    WHERE license_id = ${licenseId}
      AND revoked_at IS NULL
  `;

  return parseInt(result.rows[0].count, 10);
}

/**
 * List all active devices for a license
 */
export async function listActiveDevices(licenseId: number): Promise<DeviceActivation[]> {
  const result = await sql<DeviceActivation>`
    SELECT * FROM device_activations
    WHERE license_id = ${licenseId}
      AND revoked_at IS NULL
    ORDER BY last_seen_at DESC
  `;

  return result.rows;
}

/**
 * Revoke a device activation
 */
export async function revokeDeviceActivation(id: number): Promise<void> {
  await sql`
    UPDATE device_activations
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;
}
```

---

### 4. Paddle Webhook Verification (`lib/paddle-verify.ts`)

```typescript
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET!;

/**
 * Verify Paddle webhook signature
 * Paddle signs webhooks with HMAC-SHA256
 */
export function verifyPaddleWebhook(signature: string, rawBody: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.error('PADDLE_WEBHOOK_SECRET not configured');
    return false;
  }

  try {
    // Paddle signature format: "ts=<timestamp>,h1=<signature>"
    const parts = signature.split(',');
    const timestamp = parts.find(p => p.startsWith('ts='))?.split('=')[1];
    const providedSignature = parts.find(p => p.startsWith('h1='))?.split('=')[1];

    if (!timestamp || !providedSignature) {
      console.error('Invalid signature format');
      return false;
    }

    // Check timestamp (reject if older than 5 minutes)
    const timestampMs = parseInt(timestamp, 10) * 1000;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - timestampMs > fiveMinutes) {
      console.error('Webhook timestamp too old');
      return false;
    }

    // Verify signature
    const signedPayload = `${timestamp}:${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(signedPayload)
      .digest('hex');

    // Timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(providedSignature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
}
```

---

### 5. API Endpoints

#### Health Check (`api/health.ts`)

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Test database connection
    await sql`SELECT 1`;

    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
}
```

#### Validate License (`api/licenses/validate.ts`)

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { findLicenseByKey } from '../../lib/db';
import { isValidLicenseFormat } from '../../lib/crypto';

// Rate limiting (in-memory)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting by IP
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const rateLimit = rateLimitMap.get(clientIp as string);

  if (rateLimit) {
    if (now < rateLimit.resetTime) {
      if (rateLimit.count >= RATE_LIMIT) {
        return res.status(429).json({ error: 'Too many requests' });
      }
      rateLimit.count++;
    } else {
      rateLimitMap.set(clientIp as string, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }
  } else {
    rateLimitMap.set(clientIp as string, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  }

  try {
    const { license_key } = req.body;

    if (!license_key || typeof license_key !== 'string') {
      return res.status(200).json({ valid: false, error: 'Invalid request' });
    }

    // Validate format
    if (!isValidLicenseFormat(license_key)) {
      return res.status(200).json({ valid: false, error: 'Invalid license key format' });
    }

    // Check database
    const license = await findLicenseByKey(license_key);

    if (!license) {
      return res.status(200).json({ valid: false, error: 'License key not found' });
    }

    if (license.status !== 'active') {
      return res.status(200).json({ valid: false, error: `License is ${license.status}` });
    }

    return res.status(200).json({
      valid: true,
      status: license.status,
      email: license.email,
      created_at: license.created_at
    });
  } catch (error: any) {
    console.error('Validation error:', error);
    return res.status(500).json({ valid: false, error: 'Internal server error' });
  }
}
```

#### Activate Device (`api/licenses/devices/activate.ts`)

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { findLicenseByKey } from '../../../lib/db';
import { isValidLicenseFormat } from '../../../lib/crypto';
import {
  findDeviceActivation,
  createDeviceActivation,
  countActiveDevices,
} from '../../../lib/device-utils';

const MAX_DEVICES = 2; // Maximum devices per license

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { license_key, device_fingerprint, device_name, device_info } = req.body;

    // Validate input
    if (!license_key || typeof license_key !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'license_key is required'
      });
    }

    if (!device_fingerprint || typeof device_fingerprint !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'device_fingerprint is required'
      });
    }

    // Validate license key format
    if (!isValidLicenseFormat(license_key)) {
      return res.status(200).json({
        success: false,
        error: 'Invalid license key format'
      });
    }

    // Look up license in database
    const license = await findLicenseByKey(license_key);

    if (!license) {
      return res.status(200).json({
        success: false,
        error: 'License key not found'
      });
    }

    // Check if license is active
    if (license.status !== 'active') {
      return res.status(200).json({
        success: false,
        error: `License is ${license.status}`
      });
    }

    // Check if this device is already activated
    const existingDevice = await findDeviceActivation(license.id, device_fingerprint);
    if (existingDevice) {
      // Device already activated - just return success
      return res.status(200).json({
        success: true,
        message: 'Device already activated',
        activation_id: existingDevice.id,
        device_count: await countActiveDevices(license.id),
        max_devices: MAX_DEVICES
      });
    }

    // Check device limit
    const activeDeviceCount = await countActiveDevices(license.id);
    if (activeDeviceCount >= MAX_DEVICES) {
      return res.status(200).json({
        success: false,
        error: 'device_limit_reached',
        message: `This license is already active on ${MAX_DEVICES} devices. Please deactivate a device first.`,
        device_count: activeDeviceCount,
        max_devices: MAX_DEVICES
      });
    }

    // Create new device activation
    const activation = await createDeviceActivation(
      license.id,
      device_fingerprint,
      device_name,
      device_info
    );

    return res.status(200).json({
      success: true,
      message: 'Device activated successfully',
      activation_id: activation.id,
      device_count: await countActiveDevices(license.id),
      max_devices: MAX_DEVICES
    });

  } catch (error: any) {
    console.error('Device activation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
```

#### List Devices (`api/licenses/devices/list.ts`)

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { findLicenseByKey } from '../../../lib/db';
import { listActiveDevices } from '../../../lib/device-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { license_key } = req.body;

    if (!license_key || typeof license_key !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'license_key is required'
      });
    }

    // Look up license in database
    const license = await findLicenseByKey(license_key);

    if (!license) {
      return res.status(200).json({
        success: false,
        error: 'License key not found'
      });
    }

    // Get all active devices
    const devices = await listActiveDevices(license.id);

    // Format response
    const formattedDevices = devices.map(device => ({
      id: device.id,
      device_name: device.device_name || 'Unknown Device',
      device_info: device.device_info,
      activated_at: device.activated_at,
      last_seen_at: device.last_seen_at,
    }));

    return res.status(200).json({
      success: true,
      devices: formattedDevices,
      count: devices.length
    });

  } catch (error: any) {
    console.error('List devices error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
```

#### Deactivate Device (`api/licenses/devices/[id].ts`)

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { revokeDeviceActivation } from '../../../lib/device-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Device ID is required'
      });
    }

    const deviceId = parseInt(id, 10);
    if (isNaN(deviceId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid device ID'
      });
    }

    // Revoke the device activation
    await revokeDeviceActivation(deviceId);

    return res.status(200).json({
      success: true,
      message: 'Device deactivated successfully'
    });

  } catch (error: any) {
    console.error('Deactivate device error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
```

#### Paddle Webhook Handler (`api/webhooks/paddle.ts`)

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyPaddleWebhook } from '../../lib/paddle-verify';
import { generateLicenseKey } from '../../lib/crypto';
import { createLicense, findLicenseByTransaction, revokeLicense, logWebhook } from '../../lib/db';

export const config = {
  api: {
    bodyParser: false, // Must parse raw body for signature verification
  },
};

async function getRawBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req);
    const signature = req.headers['paddle-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Verify webhook signature
    if (!verifyPaddleWebhook(signature, rawBody)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse event
    const event = JSON.parse(rawBody);
    const { event_type, event_id, data } = event;

    // Log webhook
    await logWebhook(event_type, event_id, event, 'received');

    // Handle different event types
    switch (event_type) {
      case 'transaction.completed': {
        // Extract customer info
        const email = data.customer?.email || data.billing_details?.email;
        const customerId = data.customer?.id || data.customer_id;

        if (!email) {
          await logWebhook(event_type, event_id, event, 'error', 'Missing email');
          return res.status(400).json({ error: 'Missing customer email' });
        }

        // Check if license already exists (idempotency)
        const existing = await findLicenseByTransaction(data.id);
        if (existing) {
          console.log('License already exists for transaction:', data.id);
          return res.status(200).json({ message: 'Already processed' });
        }

        // Generate license key
        const licenseKey = generateLicenseKey({
          transactionId: data.id,
          email,
          timestamp: Date.now(),
        });

        // Create license in database
        await createLicense(licenseKey, email, data.id, customerId, {
          product_id: data.items?.[0]?.price?.product_id,
          amount: data.totals?.total,
          currency: data.currency_code,
        });

        await logWebhook(event_type, event_id, event, 'processed');

        console.log('License created:', licenseKey, 'for', email);

        // TODO: Send email with license key here
        // await sendLicenseEmail(email, licenseKey);

        return res.status(200).json({ message: 'License created', license_key: licenseKey });
      }

      case 'transaction.refunded': {
        const transactionId = data.id;

        // Find and revoke license
        const license = await findLicenseByTransaction(transactionId);
        if (license) {
          await revokeLicense(license.license_key);
          await logWebhook(event_type, event_id, event, 'processed');
          console.log('License revoked:', license.license_key);
        }

        return res.status(200).json({ message: 'License revoked' });
      }

      default:
        console.log('Unhandled event type:', event_type);
        await logWebhook(event_type, event_id, event, 'ignored');
        return res.status(200).json({ message: 'Event ignored' });
    }
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
```

---

## Frontend Integration

### 1. Device Fingerprinting (`src/utils/deviceFingerprint.ts`)

```typescript
/**
 * Simple hash function for fingerprinting
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate unique device fingerprint
 */
export function generateDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    `${screen.width}x${screen.height}`,
    `${screen.colorDepth}bit`,
    new Date().getTimezoneOffset().toString(),
    navigator.language,
    navigator.platform,
    navigator.hardwareConcurrency?.toString() || 'unknown',
    (navigator as any).deviceMemory?.toString() || 'unknown',
    navigator.maxTouchPoints?.toString() || '0',
  ];

  return simpleHash(components.join('|'));
}

/**
 * Get human-readable device name
 */
export function getDeviceName(): string {
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Detect browser
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';

  // Detect OS
  if (platform.includes('Mac')) os = 'macOS';
  else if (platform.includes('Win')) os = 'Windows';
  else if (platform.includes('Linux')) os = 'Linux';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Android')) os = 'Android';

  return `${browser} on ${os}`;
}

/**
 * Get detailed device info
 */
export function getDeviceInfo(): Record<string, any> {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: new Date().getTimezoneOffset(),
  };
}
```

**Why This Fingerprint?**
- **Stable**: Won't change during normal usage
- **Unique**: Combines multiple device characteristics
- **Simple**: No external dependencies
- **Privacy-friendly**: No tracking or PII collection

---

### 2. License Management (`src/utils/license.ts`)

```typescript
const LICENSE_KEY_STORAGE = 'your_app_license_key';
const PRO_STATUS_STORAGE = 'your_app_pro_status';

export interface LicenseInfo {
  isPro: boolean;
  licenseKey: string | null;
  activatedAt: number | null;
}

/**
 * Activate a license key (with server validation and device activation)
 */
export async function activateLicense(licenseKey: string): Promise<boolean | string> {
  // Get device fingerprint
  const { generateDeviceFingerprint, getDeviceName, getDeviceInfo } = await import('./deviceFingerprint');
  const deviceFingerprint = generateDeviceFingerprint();
  const deviceName = getDeviceName();
  const deviceInfo = getDeviceInfo();

  // Activate device with server
  try {
    const response = await fetch('/api/licenses/devices/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey,
        device_fingerprint: deviceFingerprint,
        device_name: deviceName,
        device_info: deviceInfo
      })
    });

    const result = await response.json();

    if (!result.success) {
      // Return error message for device limit
      if (result.error === 'device_limit_reached') {
        return 'device_limit_reached';
      }
      return false;
    }

    // Store locally
    localStorage.setItem(LICENSE_KEY_STORAGE, licenseKey);
    localStorage.setItem(PRO_STATUS_STORAGE, 'true');
    localStorage.setItem('your_app_activated_at', Date.now().toString());

    return true;
  } catch (error) {
    console.error('Device activation error:', error);
    return false;
  }
}

/**
 * Get current license info
 */
export function getLicenseInfo(): LicenseInfo {
  const licenseKey = localStorage.getItem(LICENSE_KEY_STORAGE);
  const isPro = localStorage.getItem(PRO_STATUS_STORAGE) === 'true';
  const activatedAt = localStorage.getItem('your_app_activated_at');

  return {
    isPro,
    licenseKey,
    activatedAt: activatedAt ? parseInt(activatedAt, 10) : null,
  };
}

/**
 * Deactivate license
 */
export function deactivateLicense(): void {
  localStorage.removeItem(LICENSE_KEY_STORAGE);
  localStorage.removeItem(PRO_STATUS_STORAGE);
  localStorage.removeItem('your_app_activated_at');
}

/**
 * Server-side license validation
 */
export async function validateLicenseKeyServer(licenseKey: string): Promise<boolean> {
  try {
    const response = await fetch('/api/licenses/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: licenseKey })
    });

    const result = await response.json();
    return result.valid === true;
  } catch (error) {
    console.error('License validation error:', error);
    return false;
  }
}
```

---

### 3. Pro Status Hook (`src/hooks/useProStatus.ts`)

```typescript
import { useState, useEffect } from 'react';
import { getLicenseInfo, deactivateLicense, validateLicenseKeyServer } from '../utils/license';
import type { LicenseInfo } from '../utils/license';

const VALIDATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const LAST_VALIDATION_KEY = 'your_app_last_validation';

export function useProStatus() {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo>(getLicenseInfo());

  // Refresh license info
  const refreshLicenseInfo = () => {
    setLicenseInfo(getLicenseInfo());
  };

  // Periodic server-side revalidation (every 24 hours)
  useEffect(() => {
    const revalidate = async () => {
      if (!licenseInfo.isPro || !licenseInfo.licenseKey) return;

      const lastValidation = localStorage.getItem(LAST_VALIDATION_KEY);
      const now = Date.now();

      if (lastValidation) {
        const timeSinceValidation = now - parseInt(lastValidation, 10);
        if (timeSinceValidation < VALIDATION_INTERVAL) return;
      }

      // Validate with server
      const isValid = await validateLicenseKeyServer(licenseInfo.licenseKey);
      if (!isValid) {
        deactivateLicense();
        setLicenseInfo(getLicenseInfo());
      }

      localStorage.setItem(LAST_VALIDATION_KEY, now.toString());
    };

    revalidate();

    // Check every hour (but only revalidate every 24 hours)
    const interval = setInterval(revalidate, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [licenseInfo.isPro, licenseInfo.licenseKey]);

  return {
    isPro: licenseInfo.isPro,
    licenseKey: licenseInfo.licenseKey,
    activatedAt: licenseInfo.activatedAt,
    refreshLicenseInfo,
  };
}
```

**Why 24-Hour Revalidation?**
- **Security**: Revoked licenses auto-deactivate within 24 hours
- **Performance**: Minimizes server requests
- **Offline-friendly**: Works without internet for up to 24 hours

---

## Environment Variables

### Required Variables

```bash
# Database (auto-added by Vercel Postgres)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# Paddle Configuration
PADDLE_VENDOR_ID="YOUR_VENDOR_ID"
PADDLE_API_KEY="test_..."  # or "live_..." for production
PADDLE_WEBHOOK_SECRET="pdl_ntfset_..."
PADDLE_ENVIRONMENT="sandbox"  # or "production"

# License Signing Secret (generate with: openssl rand -hex 32)
LICENSE_SECRET_KEY="64-character-hex-string"

# App Configuration
VITE_API_BASE_URL="https://your-domain.vercel.app"
```

### Generate License Secret

```bash
# Mac/Linux
openssl rand -hex 32

# Windows PowerShell
-join ((48..57) + (97..102) | Get-Random -Count 64 | % {[char]$_})
```

---

## Deployment

### 1. Vercel Configuration (`vercel.json`)

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ]
}
```

### 2. Deploy via GitHub

```bash
# Push to GitHub
git add .
git commit -m "Add license backend"
git push origin main

# Vercel auto-deploys
```

### 3. Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## Adapting for Your Project

### Checklist

1. **Replace App Name**
   - [ ] Search and replace `your_app` with your app name in all localStorage keys
   - [ ] Update `LICENSE_KEY_STORAGE` in `src/utils/license.ts`
   - [ ] Update `PRO_STATUS_STORAGE` in `src/utils/license.ts`

2. **Configure Paddle**
   - [ ] Create Paddle account
   - [ ] Create product
   - [ ] Get API credentials
   - [ ] Set up webhook endpoint
   - [ ] Add environment variables

3. **Set Up Database**
   - [ ] Create Vercel Postgres database
   - [ ] Run SQL schema (all 3 tables)
   - [ ] Test database connection

4. **Generate Secrets**
   - [ ] Generate `LICENSE_SECRET_KEY` with OpenSSL
   - [ ] Add to Vercel environment variables

5. **Customize Device Limit**
   - [ ] Change `MAX_DEVICES` in `api/licenses/devices/activate.ts`
   - [ ] Update UI text in components

6. **Test Everything**
   - [ ] Health check endpoint
   - [ ] License validation
   - [ ] Device activation (hit limit)
   - [ ] Device deactivation
   - [ ] Webhook handler
   - [ ] 24-hour revalidation

7. **Optional Customizations**
   - [ ] Add email integration for license delivery
   - [ ] Build admin dashboard for license management
   - [ ] Add analytics tracking
   - [ ] Customize error messages
   - [ ] Add more device info to fingerprint

### Pricing & Limits

**Change device limit:**
```typescript
// In api/licenses/devices/activate.ts
const MAX_DEVICES = 3; // Change from 2 to 3 (or any number)
```

**Different limits per plan:**
```typescript
// Add plan info to license metadata
const license = await findLicenseByKey(licenseKey);
const MAX_DEVICES = license.metadata.plan === 'team' ? 5 : 2;
```

### Security Considerations

1. **Never expose `LICENSE_SECRET_KEY`** - Only use server-side
2. **Validate all inputs** - Check types and formats
3. **Use rate limiting** - Prevent brute force attacks
4. **Verify Paddle signatures** - Reject invalid webhooks
5. **Use HTTPS** - Always encrypt traffic
6. **Sanitize database queries** - Use parameterized queries (we use Vercel's sql template strings)

---

## Testing

### Manual Testing Script

```bash
# 1. Health check
curl https://your-domain.vercel.app/api/health

# 2. Create test license (run in Vercel Postgres dashboard)
INSERT INTO licenses (license_key, email, paddle_transaction_id, status)
VALUES ('TEST1234-5678-90AB-CDEF-123456789012-ABCD1234', 'test@example.com', 'test-txn-123', 'active');

# 3. Validate license
curl -X POST https://your-domain.vercel.app/api/licenses/validate \
  -H "Content-Type: application/json" \
  -d '{"license_key":"TEST1234-5678-90AB-CDEF-123456789012-ABCD1234"}'

# 4. Activate device
curl -X POST https://your-domain.vercel.app/api/licenses/devices/activate \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "TEST1234-5678-90AB-CDEF-123456789012-ABCD1234",
    "device_fingerprint": "test-device-1",
    "device_name": "Test Device 1"
  }'

# 5. List devices
curl -X POST https://your-domain.vercel.app/api/licenses/devices/list \
  -H "Content-Type: application/json" \
  -d '{"license_key":"TEST1234-5678-90AB-CDEF-123456789012-ABCD1234"}'

# 6. Deactivate device (replace {id} with actual device ID from list)
curl -X DELETE https://your-domain.vercel.app/api/licenses/devices/{id}
```

---

## Summary

This architecture provides:

✅ **Secure License Management** - HMAC-signed keys, server-side validation
✅ **Device Limits** - 2-device limit with fingerprinting
✅ **Payment Integration** - Paddle webhooks auto-generate licenses
✅ **Anti-Sharing Protection** - Device tracking + management UI
✅ **Offline Support** - localStorage caching + 24hr revalidation
✅ **Production-Ready** - Rate limiting, error handling, logging
✅ **Fully Typed** - TypeScript across frontend and backend
✅ **Scalable** - Vercel serverless + Postgres with connection pooling

**Total Files**: ~15 files
**Lines of Code**: ~1,500 lines
**Setup Time**: ~2 hours
**Cost**: Vercel Free Tier + Paddle fees (5% + $0.50 per transaction)

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Paddle Docs**: https://developer.paddle.com
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres

Need help? Create an issue or reach out!
