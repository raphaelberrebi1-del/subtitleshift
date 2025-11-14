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
