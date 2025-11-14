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
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      database: 'disconnected'
    });
  }
}
