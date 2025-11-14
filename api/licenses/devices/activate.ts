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
