import { sql } from '@vercel/postgres';

export interface License {
  id: number;
  license_key: string;
  email: string;
  paddle_transaction_id: string;
  paddle_customer_id: string | null;
  status: 'active' | 'revoked' | 'refunded';
  created_at: Date;
  updated_at: Date;
  metadata: Record<string, any>;
}

/**
 * Create a new license in the database
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
 * Find a license by its key
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
 * Find a license by Paddle transaction ID
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
 * Revoke a license (marks as revoked, doesn't delete)
 */
export async function revokeLicense(licenseKey: string): Promise<void> {
  await sql`
    UPDATE licenses
    SET status = 'revoked', updated_at = CURRENT_TIMESTAMP
    WHERE license_key = ${licenseKey}
  `;
}

/**
 * Log a webhook event for debugging and auditing
 */
export async function logWebhook(
  eventType: string,
  paddleEventId: string,
  payload: any,
  status: 'processed' | 'failed' = 'processed',
  errorMessage?: string
): Promise<void> {
  await sql`
    INSERT INTO webhook_logs (
      event_type,
      paddle_event_id,
      payload,
      status,
      error_message
    )
    VALUES (
      ${eventType},
      ${paddleEventId},
      ${JSON.stringify(payload)},
      ${status},
      ${errorMessage || null}
    )
    ON CONFLICT (paddle_event_id) DO NOTHING
  `;
}
