import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPurchaseInfo } from '../utils/paddle';
import toast from 'react-hot-toast';

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [licenseKey, setLicenseKey] = useState('');
  const [purchaseInfo, setPurchaseInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Get license key from URL or purchase info
    const keyFromUrl = searchParams.get('key');
    const purchaseData = getPurchaseInfo();

    if (keyFromUrl) {
      setLicenseKey(keyFromUrl);
    } else if (purchaseData?.licenseKey) {
      setLicenseKey(purchaseData.licenseKey);
    }

    if (purchaseData) {
      setPurchaseInfo(purchaseData);
    }
  }, [searchParams]);

  // Auto-redirect countdown
  useEffect(() => {
    if (!licenseKey) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [licenseKey, navigate]);

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      toast.success('License key copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy. Please select and copy manually.');
    }
  };

  const handleReturnToApp = async () => {
    // Dispatch event to ensure ProBadge refreshes when returning to app
    window.dispatchEvent(new Event('license-activated'));

    // Allow React to process state updates before navigating
    await new Promise(resolve => setTimeout(resolve, 100));

    navigate('/');
  };

  if (!licenseKey) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No License Key Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't find your license key. If you just completed a purchase, please check your email.
          </p>
          <button
            onClick={handleReturnToApp}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Return to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 sm:p-12 max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-fadeIn">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Pro!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you for your purchase. Your license key is ready.
          </p>
        </div>

        {/* License Key Display */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Your License Key
          </label>
          <div className="relative">
            <input
              type="text"
              value={licenseKey}
              readOnly
              className="w-full px-4 py-4 pr-24 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600
                       rounded-lg text-gray-900 dark:text-white font-mono text-sm sm:text-base text-center cursor-text
                       focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-colors"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopyKey}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary-500 text-white rounded-md
                       hover:bg-primary-600 transition-colors text-sm font-medium"
            >
              {copied ? (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </span>
              ) : (
                'Copy'
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Your Pro Account is Already Active!
          </h3>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Your license key has been automatically activated on this device.</span>
            </p>
            <p className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>All Pro features are now unlocked and ready to use.</span>
            </p>
            <p className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span><strong>Save your license key!</strong> Use it to activate Pro on other devices or browsers.</span>
            </p>
          </div>
        </div>

        {/* Purchase Info */}
        {purchaseInfo && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-8 text-sm">
            <div className="grid grid-cols-2 gap-3 text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Order ID:</span>
                <p className="font-mono text-xs mt-1">{purchaseInfo.orderId}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                <p className="text-xs mt-1">{purchaseInfo.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pro Features Reminder */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            What's included in Pro:
          </h3>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {[
              'Unlimited subtitles',
              'Video preview & sync',
              'Advanced find & replace',
              'Inline text editing',
              'Lifetime updates',
              'Priority support'
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={handleReturnToApp}
          className="w-full px-6 py-4 bg-primary-500 text-white text-lg font-bold rounded-lg
                   hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl"
        >
          {countdown > 0 ? (
            <span>Start Using SubtitleShift Pro → (Redirecting in {countdown}s)</span>
          ) : (
            <span>Start Using SubtitleShift Pro →</span>
          )}
        </button>

        {/* Support */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          Need help? Contact support at{' '}
          <a href="mailto:info@subtitleshift.com" className="text-primary-600 dark:text-primary-400 hover:underline">
            info@subtitleshift.com
          </a>
        </p>
      </div>
    </div>
  );
}
