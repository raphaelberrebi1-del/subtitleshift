import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyPaddleWebhook } from '../../lib/paddle-verify';
import { generateLicenseKey } from '../../lib/crypto';
import { createLicense, findLicenseByTransaction, revokeLicense, logWebhook } from '../../lib/db';

export const config = {
  api: {
    bodyParser: false, // CRITICAL: Must parse raw body for signature verification
  },
};

// Helper to read raw body
async function getRawBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body and signature
    const rawBody = await getRawBody(req);
    const signature = req.headers['paddle-signature'] as string;

    if (!signature) {
      console.error('Missing Paddle-Signature header');
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Verify webhook signature
    const isValid = verifyPaddleWebhook(signature, rawBody);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse webhook payload
    const event = JSON.parse(rawBody);
    const { event_id, event_type, data } = event;

    console.log(`Received webhook: ${event_type} (${event_id})`);

    // Handle different event types
    switch (event_type) {
      case 'transaction.completed': {
        // Check if already processed (idempotency)
        const existing = await findLicenseByTransaction(data.id);
        if (existing) {
          console.log(`Transaction ${data.id} already processed`);
          await logWebhook(event_type, event_id, event, 'processed');
          return res.status(200).json({
            success: true,
            message: 'Already processed',
            license_key: existing.license_key
          });
        }

        // Extract customer email
        const email = data.customer?.email || data.checkout?.customer_email || 'unknown@example.com';

        // Generate signed license key
        const licenseKey = generateLicenseKey({
          transactionId: data.id,
          email,
          timestamp: Date.now(),
        });

        // Store in database
        await createLicense(
          licenseKey,
          email,
          data.id,
          data.customer_id,
          {
            paddle_event_id: event_id,
            amount: data.details?.totals?.total,
            currency: data.currency_code,
            occurred_at: event.occurred_at,
          }
        );

        // Log webhook
        await logWebhook(event_type, event_id, event, 'processed');

        // TODO: Send email with license key (optional)
        // await sendLicenseEmail(email, licenseKey);

        console.log(`License created: ${licenseKey} for ${email}`);

        return res.status(200).json({
          success: true,
          license_key: licenseKey
        });
      }

      case 'transaction.refunded': {
        // Revoke license on refund
        const license = await findLicenseByTransaction(data.id);
        if (license) {
          await revokeLicense(license.license_key);
          console.log(`License revoked due to refund: ${license.license_key}`);
        }

        await logWebhook(event_type, event_id, event, 'processed');
        return res.status(200).json({ success: true });
      }

      default: {
        // Log unknown events
        await logWebhook(event_type, event_id, event, 'processed');
        return res.status(200).json({ success: true, message: 'Event ignored' });
      }
    }
  } catch (error: any) {
    console.error('Webhook handler error:', error);

    // Log failed webhook
    try {
      const rawBody = await getRawBody(req);
      const event = JSON.parse(rawBody);
      await logWebhook(
        event.event_type,
        event.event_id,
        event,
        'failed',
        error.message
      );
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
