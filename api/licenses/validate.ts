import type { VercelRequest, VercelResponse } from '@vercel/node';
import { findLicenseByKey } from '../../lib/db';
import { isValidLicenseFormat } from '../../lib/crypto';

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      valid: false,
      error: 'Rate limit exceeded. Please try again later.'
    });
  }

  try {
    const { license_key } = req.body;

    if (!license_key || typeof license_key !== 'string') {
      return res.status(400).json({
        valid: false,
        error: 'Invalid request. license_key required.'
      });
    }

    // Basic format validation
    if (!isValidLicenseFormat(license_key)) {
      return res.status(200).json({
        valid: false,
        error: 'Invalid license key format'
      });
    }

    // Look up in database
    const license = await findLicenseByKey(license_key);

    if (!license) {
      return res.status(200).json({
        valid: false,
        error: 'License key not found'
      });
    }

    // Check status
    if (license.status !== 'active') {
      return res.status(200).json({
        valid: false,
        error: `License is ${license.status}`
      });
    }

    // Return success
    return res.status(200).json({
      valid: true,
      status: license.status,
      email: license.email,
      created_at: license.created_at,
    });

  } catch (error: any) {
    console.error('Validation error:', error);
    return res.status(500).json({
      valid: false,
      error: 'Internal server error'
    });
  }
}
