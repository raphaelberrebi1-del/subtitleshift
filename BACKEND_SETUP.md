# Backend Setup Guide - SubtitleShift Pro License Validation

This guide will help you set up the Vercel Postgres database and environment variables for production-ready license validation.

## Table of Contents
1. [Database Setup (Vercel Postgres)](#database-setup)
2. [Environment Variables](#environment-variables)
3. [Paddle Configuration](#paddle-configuration)
3a. [Device Limits & Anti-Sharing](#device-limits--anti-sharing)
4. [Testing](#testing)
5. [Deployment](#deployment)

---

## 1. Database Setup (Vercel Postgres)

### Step 1: Create Database in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project → **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Name it: `subtitleshift-licenses`
6. Choose region closest to your users
7. Click **Create**

### Step 2: Connect Database to Project

1. In the database page, click **Connect Project**
2. Select your `subtitleshift` project
3. Vercel will automatically inject environment variables

### Step 3: Initialize Database Schema

You can initialize the database in two ways:

#### Option A: Using Vercel Postgres Dashboard

1. In Vercel Dashboard → Storage → Your Database → **Query** tab
2. Paste the following SQL and click **Run Query**:

```sql
-- Create licenses table
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

-- Create webhook_logs table for debugging
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

-- Create device_activations table for 2-device limit enforcement
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
```

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Pull environment variables
vercel env pull .env.local

# Connect to database
vercel postgres connect

# You'll be in a PostgreSQL shell - paste the SQL from Option A
```

### Step 4: Verify Database

Run this query to verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see:
- `licenses`
- `webhook_logs`
- `device_activations`

---

## 2. Environment Variables

### Step 1: Generate License Secret Key

```bash
# On Mac/Linux
openssl rand -hex 32

# On Windows (PowerShell)
-join ((48..57) + (97..102) | Get-Random -Count 64 | % {[char]$_})
```

Copy the output - you'll need it below.

### Step 2: Add Variables to Vercel

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add the following variables for **Production**, **Preview**, and **Development**:

#### Database Variables (Auto-added by Vercel)
These are automatically added when you connect the database:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

#### Paddle Variables (You need to add these)

**For Sandbox/Testing:**
```
PADDLE_VENDOR_ID=YOUR_SANDBOX_VENDOR_ID
PADDLE_API_KEY=test_YOUR_SANDBOX_API_KEY
PADDLE_WEBHOOK_SECRET=pdl_ntfset_YOUR_SANDBOX_WEBHOOK_SECRET
PADDLE_ENVIRONMENT=sandbox
```

**For Production** (update later):
```
PADDLE_VENDOR_ID=YOUR_PRODUCTION_VENDOR_ID
PADDLE_API_KEY=live_YOUR_PRODUCTION_API_KEY
PADDLE_WEBHOOK_SECRET=pdl_ntfset_YOUR_PRODUCTION_WEBHOOK_SECRET
PADDLE_ENVIRONMENT=production
```

#### License Validation Secret (You need to add this)
```
LICENSE_SECRET_KEY=<paste the 64-character hex string you generated>
```

#### App Configuration
```
VITE_API_BASE_URL=https://your-domain.vercel.app
```

### Step 3: Create Local .env.local File

For local development, create a `.env.local` file in the project root:

```bash
# Database (copy from Vercel dashboard)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# Paddle Sandbox
PADDLE_VENDOR_ID="YOUR_SANDBOX_VENDOR_ID"
PADDLE_API_KEY="test_..."
PADDLE_WEBHOOK_SECRET="pdl_ntfset_..."
PADDLE_ENVIRONMENT="sandbox"

# License Secret
LICENSE_SECRET_KEY="<your 64-char hex>"

# App
VITE_API_BASE_URL="http://localhost:5173"
```

**Important:** Add `.env.local` to `.gitignore` (already done)

---

## 3. Paddle Configuration

### Step 1: Create Paddle Account

1. Sign up at [Paddle.com](https://www.paddle.com/)
2. Verify your email
3. Complete seller profile

### Step 2: Create a Product

1. In Paddle Dashboard → **Products** → **Add Product**
2. Product details:
   - Name: `SubtitleShift Pro`
   - Description: `Lifetime access to SubtitleShift Pro features`
   - Price: `$4.99` (or your chosen price)
   - Type: `One-time purchase`
3. Click **Create Product**
4. Copy the **Product ID** → Add to environment variables as `PADDLE_PRODUCT_ID`

### Step 3: Get API Credentials

1. Go to **Developer Tools** → **Authentication**
2. Create a new API key (Sandbox):
   - Name: `SubtitleShift Sandbox`
   - Click **Create Key**
   - Copy the key → Add to environment variables as `PADDLE_API_KEY`
3. Copy your **Vendor ID** from the dashboard → Add as `PADDLE_VENDOR_ID`

### Step 4: Configure Webhooks

1. Go to **Developer Tools** → **Webhooks**
2. Click **Add Webhook**
3. Configuration:
   - **Endpoint URL**: `https://your-domain.vercel.app/api/webhooks/paddle`
   - **Events to subscribe**:
     - `transaction.completed`
     - `transaction.refunded`
   - **Active**: Yes
4. Click **Create Webhook**
5. Copy the **Webhook Secret** → Add to environment variables as `PADDLE_WEBHOOK_SECRET`

### Step 5: Test Webhook

1. In the webhook details page, click **Send Test Event**
2. Select `transaction.completed`
3. Click **Send Test**
4. Check Vercel logs: `vercel logs --follow`
5. You should see: "Received webhook: transaction.completed"

---

## 3a. Device Limits & Anti-Sharing

SubtitleShift Pro implements a **2-device limit** to prevent license key sharing while allowing legitimate multi-device usage.

### How It Works

1. **Device Fingerprinting**: When a user activates Pro, a unique device fingerprint is generated from:
   - User agent
   - Screen resolution
   - Color depth
   - Timezone
   - Language
   - Platform
   - Hardware concurrency
   - Device memory
   - Touch support

2. **Device Tracking**: Each activation is stored in the `device_activations` table with:
   - Device fingerprint (unique identifier)
   - Device name (e.g., "Chrome on macOS")
   - Device info (additional metadata)
   - Activation timestamp
   - Last seen timestamp

3. **Limit Enforcement**:
   - Maximum 2 active devices per license
   - Attempting to activate on a 3rd device shows error: "Device limit reached (2/2 devices)"
   - Users can deactivate old devices to free slots

### API Endpoints

#### 1. Activate Device
```bash
POST /api/licenses/devices/activate
Content-Type: application/json

{
  "license_key": "XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "device_fingerprint": "abc123def456",
  "device_name": "Chrome on macOS",
  "device_info": {
    "browser": "Chrome",
    "os": "macOS",
    "version": "120.0"
  }
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Device activated successfully",
  "activation_id": 42,
  "device_count": 1,
  "max_devices": 2
}
```

**Response (Device Limit Reached)**:
```json
{
  "success": false,
  "error": "device_limit_reached",
  "message": "This license is already active on 2 devices. Please deactivate a device first.",
  "device_count": 2,
  "max_devices": 2
}
```

#### 2. List Devices
```bash
POST /api/licenses/devices/list
Content-Type: application/json

{
  "license_key": "XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
}
```

**Response**:
```json
{
  "success": true,
  "devices": [
    {
      "id": 42,
      "device_name": "Chrome on macOS",
      "device_info": { "browser": "Chrome", "os": "macOS" },
      "activated_at": "2025-01-15T10:00:00.000Z",
      "last_seen_at": "2025-01-15T12:30:00.000Z"
    },
    {
      "id": 43,
      "device_name": "Safari on iOS",
      "device_info": { "browser": "Safari", "os": "iOS" },
      "activated_at": "2025-01-16T09:00:00.000Z",
      "last_seen_at": "2025-01-16T14:00:00.000Z"
    }
  ],
  "count": 2
}
```

#### 3. Deactivate Device
```bash
DELETE /api/licenses/devices/{device_id}
```

**Response**:
```json
{
  "success": true,
  "message": "Device deactivated successfully"
}
```

### User Interface

Users can manage their devices via the Pro badge dropdown:
1. Click **PRO** badge in header
2. Select **Manage Devices**
3. See list of all active devices with:
   - Device name
   - Activation date
   - Last seen timestamp
4. Click **Deactivate** to remove a device

### Testing Device Limits

#### Test 1: Activate on First Device
1. Generate a valid license key
2. Activate on first device
3. Verify `device_count: 1` in response
4. Check database:
   ```sql
   SELECT * FROM device_activations WHERE license_id = <license_id>;
   ```

#### Test 2: Activate on Second Device
1. Use a different browser or incognito mode (different fingerprint)
2. Activate same license key
3. Verify `device_count: 2` in response
4. Both devices should show in database

#### Test 3: Hit Device Limit
1. Open a third browser/device
2. Try to activate same license key
3. Verify error: `"error": "device_limit_reached"`
4. User should see: "Device limit reached (2/2 devices)"

#### Test 4: Deactivate and Reactivate
1. Get device list via `/api/licenses/devices/list`
2. Deactivate one device via DELETE endpoint
3. Verify device is marked with `revoked_at` timestamp
4. Now activation on a new device should succeed

#### Test 5: Same Device Re-activation
1. Activate on a device
2. Clear localStorage
3. Activate again with same license
4. Should succeed without incrementing count (same fingerprint)
5. Response: `"message": "Device already activated"`

### Database Queries

**View all activations for a license:**
```sql
SELECT
  da.id,
  da.device_name,
  da.device_fingerprint,
  da.activated_at,
  da.last_seen_at,
  da.revoked_at
FROM device_activations da
JOIN licenses l ON da.license_id = l.id
WHERE l.license_key = 'YOUR-LICENSE-KEY'
  AND da.revoked_at IS NULL;
```

**Count active devices:**
```sql
SELECT COUNT(*) as active_devices
FROM device_activations
WHERE license_id = <license_id>
  AND revoked_at IS NULL;
```

**Manually revoke a device:**
```sql
UPDATE device_activations
SET revoked_at = CURRENT_TIMESTAMP
WHERE id = <device_id>;
```

---

## 4. Testing

### Test 1: Health Check

```bash
curl https://your-domain.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:00:00.000Z",
  "database": "connected"
}
```

### Test 2: License Validation (Invalid Key)

```bash
curl -X POST https://your-domain.vercel.app/api/licenses/validate \
  -H "Content-Type: application/json" \
  -d '{"license_key":"INVALID-KEY"}'
```

Expected response:
```json
{
  "valid": false,
  "error": "Invalid license key format"
}
```

### Test 3: Generate a Test License

For testing, you can manually insert a test license:

```sql
INSERT INTO licenses (
  license_key,
  email,
  paddle_transaction_id,
  status
) VALUES (
  'TEST1234-5678-90AB-CDEF-123456789012-ABCD1234',
  'test@example.com',
  'test-txn-123',
  'active'
);
```

Then test validation:
```bash
curl -X POST https://your-domain.vercel.app/api/licenses/validate \
  -H "Content-Type: application/json" \
  -d '{"license_key":"TEST1234-5678-90AB-CDEF-123456789012-ABCD1234"}'
```

Expected response:
```json
{
  "valid": true,
  "status": "active",
  "email": "test@example.com",
  "created_at": "2025-01-15T10:00:00.000Z"
}
```

### Test 4: Complete Purchase Flow (Sandbox)

1. Visit your app: `https://your-domain.vercel.app`
2. Click **Upgrade to Pro**
3. Use Paddle test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
4. Complete checkout
5. Webhook should fire → License created
6. You'll be redirected to `/success` page with license key
7. License should auto-activate

### Test 5: License Revalidation

1. Activate a license
2. Change `status` in database to `'revoked'`:
   ```sql
   UPDATE licenses SET status = 'revoked' WHERE email = 'test@example.com';
   ```
3. Wait 24 hours OR modify `VALIDATION_INTERVAL` in `useProStatus.ts` to 1 minute for testing
4. License should auto-deactivate on next validation

---

## 5. Deployment

### Option A: Deploy via GitHub (Recommended)

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Add backend license validation"
   git push origin main
   ```

2. Vercel auto-deploys from GitHub

3. Check deployment logs:
   ```bash
   vercel logs --follow
   ```

### Option B: Deploy via CLI

```bash
vercel --prod
```

### Post-Deployment Checklist

- [ ] Health check endpoint responds: `/api/health`
- [ ] Validation endpoint works: `/api/licenses/validate`
- [ ] Webhook endpoint configured in Paddle
- [ ] Webhook test succeeds
- [ ] Test purchase flow works
- [ ] License activation works
- [ ] Pro features unlock after activation
- [ ] All environment variables set correctly

---

## Troubleshooting

### Issue: "Database not connected"

**Solution:**
1. Check environment variables in Vercel Dashboard
2. Verify database is in same region as function
3. Check Vercel Postgres connection limit (increase if needed)

### Issue: "Invalid webhook signature"

**Solution:**
1. Verify `PADDLE_WEBHOOK_SECRET` matches Paddle dashboard
2. Check that raw body is being parsed (not JSON parsed)
3. Check timestamp isn't too old (max 5 minutes)

### Issue: "License validation always fails"

**Solution:**
1. Check license exists in database: `SELECT * FROM licenses WHERE license_key = '...'`
2. Verify `LICENSE_SECRET_KEY` is the same on server and when key was generated
3. Check `status` is `'active'` not `'revoked'` or `'refunded'`

### Issue: "Cannot read properties of undefined"

**Solution:**
1. Check all environment variables are set
2. Restart Vercel function: `vercel env pull && vercel dev`
3. Check function logs for specific error: `vercel logs`

---

## Next Steps

1. **Email License Keys**: Integrate email service (SendGrid, Resend, or Paddle built-in emails)
2. **Admin Dashboard**: Build UI to view/manage licenses
3. **Analytics**: Track license activations and usage
4. **Migration**: Grandfather existing demo users

---

## Support

For issues:
1. Check Vercel function logs: `vercel logs --follow`
2. Check database queries: Vercel Dashboard → Storage → Query tab
3. Check Paddle webhook logs: Paddle Dashboard → Developer Tools → Webhooks
4. Review this setup guide

**Need help?** Create an issue at `https://github.com/YOUR_REPO/issues`
