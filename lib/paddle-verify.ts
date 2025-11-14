import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET || '';

/**
 * Verify Paddle webhook signature
 * Based on: https://developer.paddle.com/webhooks/signature-verification
 */
export function verifyPaddleWebhook(
  signature: string,
  rawBody: string
): boolean {
  try {
    if (!WEBHOOK_SECRET) {
      console.error('PADDLE_WEBHOOK_SECRET not configured');
      return false;
    }

    // Parse signature header: "ts=1234567890;h1=abc123..."
    const parts = signature.split(';');
    const tsMatch = parts.find(p => p.startsWith('ts='));
    const sigMatch = parts.find(p => p.startsWith('h1='));

    if (!tsMatch || !sigMatch) {
      console.error('Invalid signature format');
      return false;
    }

    const timestamp = tsMatch.split('=')[1];
    const providedSignature = sigMatch.split('=')[1];

    // Verify timestamp is recent (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const ts = parseInt(timestamp, 10);
    if (Math.abs(now - ts) > 300) {
      console.error('Webhook timestamp too old or in future');
      return false;
    }

    // Compute expected signature
    const signedPayload = `${timestamp}:${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(signedPayload)
      .digest('hex');

    // Constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(providedSignature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
}
