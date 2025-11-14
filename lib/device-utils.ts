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

/**
 * Update last seen timestamp for a device
 */
export async function updateDeviceLastSeen(
  licenseId: number,
  deviceFingerprint: string
): Promise<void> {
  await sql`
    UPDATE device_activations
    SET last_seen_at = CURRENT_TIMESTAMP
    WHERE license_id = ${licenseId}
      AND device_fingerprint = ${deviceFingerprint}
      AND revoked_at IS NULL
  `;
}
