import crypto from 'crypto';

const LICENSE_SECRET = process.env.LICENSE_SECRET_KEY || 'dev-secret-change-in-production';

export interface LicenseData {
  transactionId: string;
  email: string;
  timestamp: number;
}

/**
 * Generate a signed license key
 * Format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX-SIGNATURE
 */
export function generateLicenseKey(data: LicenseData): string {
  // Generate UUID-style key
  const uuid = crypto.randomUUID().toUpperCase();

  // Create data string to sign
  const dataString = `${uuid}:${data.transactionId}:${data.email}:${data.timestamp}`;

  // Generate HMAC signature
  const signature = crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(dataString)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();

  // Return formatted license key
  return `${uuid}-${signature}`;
}

/**
 * Verify a license key's signature
 */
export function verifyLicenseSignature(
  licenseKey: string,
  transactionId: string,
  email: string,
  timestamp: number
): boolean {
  const parts = licenseKey.split('-');
  if (parts.length !== 6) return false; // UUID (5 parts) + signature (1 part)

  const uuid = parts.slice(0, 5).join('-');
  const providedSig = parts[5];

  // Recreate signature
  const dataString = `${uuid}:${transactionId}:${email}:${timestamp}`;
  const expectedSig = crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(dataString)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(providedSig),
      Buffer.from(expectedSig)
    );
  } catch {
    return false;
  }
}

/**
 * Simple license key format validation (client-side check)
 */
export function isValidLicenseFormat(licenseKey: string): boolean {
  // UUID format + 8-char signature
  const pattern = /^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}-[A-Z0-9]{8}$/;
  return pattern.test(licenseKey);
}
