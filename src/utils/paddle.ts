import { generateDemoLicenseKey, activateLicense } from './license';

// Paddle configuration
// TODO: Replace with your actual Paddle credentials after setting up product
export const PADDLE_VENDOR_ID = 'YOUR_PADDLE_VENDOR_ID'; // Get from Paddle Dashboard
export const PADDLE_PRODUCT_ID = 'YOUR_PADDLE_PRODUCT_ID'; // Get after creating product

// Initialize Paddle
export function initializePaddle() {
  if (typeof window === 'undefined') return;

  // Load Paddle script if not already loaded
  if (!(window as any).Paddle) {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/paddle.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // Use sandbox for testing, remove .Sandbox for production
      (window as any).Paddle.Environment.set('sandbox');
      (window as any).Paddle.Setup({ vendor: parseInt(PADDLE_VENDOR_ID) });
    };
  }
}

// Open Paddle checkout
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
    product: PADDLE_PRODUCT_ID,
    email: options?.email,
    successCallback: (data: any) => {
      handlePurchaseSuccess(data, options?.navigate);
      if (options?.successCallback) {
        options.successCallback(data);
      }
    },
    closeCallback: options?.closeCallback,
  };

  (window as any).Paddle.Checkout.open(checkoutOptions);
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
