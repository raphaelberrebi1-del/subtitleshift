import { generateDemoLicenseKey, activateLicense } from './license';

// Paddle Billing configuration
export const PADDLE_CLIENT_TOKEN = 'test_769ac252d623b4ee99e11b48893'; // Sandbox client-side token
export const PADDLE_PRICE_ID = 'pri_01ka4qk8gwrfyjm49nx805kdas'; // SubtitleShift Pro price ID
export const PADDLE_ENVIRONMENT = 'sandbox'; // 'sandbox' or 'production'

// Initialize Paddle Billing (v2)
export function initializePaddle() {
  if (typeof window === 'undefined') return;

  // Load Paddle Billing script if not already loaded
  if (!(window as any).Paddle) {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      (window as any).Paddle.Initialize({
        token: PADDLE_CLIENT_TOKEN,
        environment: PADDLE_ENVIRONMENT,
      });
    };
  } else if ((window as any).Paddle && !(window as any).Paddle.Initialized) {
    // Already loaded but not initialized
    (window as any).Paddle.Initialize({
      token: PADDLE_CLIENT_TOKEN,
      environment: PADDLE_ENVIRONMENT,
    });
  }
}

// Open Paddle Billing checkout
export function openPaddleCheckout(options?: {
  email?: string;
  successCallback?: (data: any) => void;
  closeCallback?: () => void;
  navigate?: (path: string) => void;
}) {
  if (!(window as any).Paddle) {
    console.error('Paddle not initialized');
    return;
  }

  const checkoutOptions = {
    items: [
      {
        priceId: PADDLE_PRICE_ID,
        quantity: 1,
      },
    ],
    customer: options?.email ? { email: options.email } : undefined,
    settings: {
      displayMode: 'overlay',
      theme: 'light',
      locale: 'en',
    },
  };

  (window as any).Paddle.Checkout.open(checkoutOptions)
    .then((checkout: any) => {
      // Listen for checkout completion
      checkout.on('checkout.completed', (data: any) => {
        handlePurchaseSuccess(data, options?.navigate);
        if (options?.successCallback) {
          options.successCallback(data);
        }
      });

      checkout.on('checkout.closed', () => {
        if (options?.closeCallback) {
          options.closeCallback();
        }
      });
    })
    .catch((error: any) => {
      console.error('Failed to open Paddle checkout:', error);
    });
}

// Handle successful purchase
async function handlePurchaseSuccess(data: any, navigate?: (path: string) => void) {
  console.log('Purchase successful:', data);

  // Generate a license key for the customer
  const licenseKey = generateDemoLicenseKey();

  // Store purchase information
  const purchaseInfo = {
    licenseKey,
    orderId: data.checkout?.id || 'demo-order',
    email: data.user?.email || '',
    purchaseDate: Date.now(),
    paddleData: data,
  };

  localStorage.setItem('subtitleshift_purchase_info', JSON.stringify(purchaseInfo));

  // Auto-activate the license
  activateLicense(licenseKey);

  // Notify all components that license was activated
  window.dispatchEvent(new Event('license-activated'));

  // Allow React to process state updates before navigating
  await new Promise(resolve => setTimeout(resolve, 100));

  // Redirect to success page with license key
  const successUrl = `/success?key=${encodeURIComponent(licenseKey)}`;

  if (navigate) {
    // Use React Router navigation if available
    navigate(successUrl);
  } else {
    // Fallback to window.location for backward compatibility
    window.location.href = successUrl;
  }
}

// Get purchase info from localStorage
export function getPurchaseInfo() {
  const data = localStorage.getItem('subtitleshift_purchase_info');
  return data ? JSON.parse(data) : null;
}

// For testing: Open checkout with demo mode
export function openDemoCheckout(navigate?: (path: string) => void) {
  // In demo mode, we'll just simulate a successful purchase
  const demoData = {
    checkout: { id: 'demo-checkout-' + Date.now() },
    user: { email: 'demo@example.com' },
  };

  handlePurchaseSuccess(demoData, navigate);
}
