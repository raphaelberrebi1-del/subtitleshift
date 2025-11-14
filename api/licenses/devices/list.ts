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
