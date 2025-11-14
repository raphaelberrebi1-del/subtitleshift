import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { initializePaddle, openDemoCheckout } from '../utils/paddle';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  onUpgrade: () => void;
}

export function PaywallModal({ isOpen, onClose, feature, onUpgrade }: PaywallModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    initializePaddle();
  }, []);

  const handleUpgradeClick = () => {
    onClose();
    openDemoCheckout(navigate); // TODO: Replace with openPaddleCheckout() when you have Paddle credentials
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative z-10"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Unlock Pro Features
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {feature} is a Pro feature. Upgrade to access all premium tools.
        </p>

        {/* Features List */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Pro includes:
          </p>
          <ul className="space-y-2 text-sm">
            {['Unlimited subtitles', 'Video preview with subtitle sync', 'Advanced find & replace', 'Inline text editing'].map((feature, i) => (
              <motion.li
                key={feature}
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
              >
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600 dark:text-gray-400">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            $4.99
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            One-time payment • Use forever
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleUpgradeClick}
            className="w-full px-6 py-3 text-base font-bold text-white bg-primary-500 rounded-lg
                     hover:bg-primary-600 transition-colors shadow-lg"
          >
            Upgrade to Pro
          </button>
          <button
            onClick={onClose}
            className="w-full px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                     hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Maybe Later
          </button>
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface UpgradeBannerProps {
  message: string;
  onUpgrade: () => void;
}

export function UpgradeBanner({ message, onUpgrade }: UpgradeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    initializePaddle();
  }, []);

  const handleUpgradeClick = () => {
    openDemoCheckout(navigate); // TODO: Replace with openPaddleCheckout() when you have Paddle credentials
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 mb-4 shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="bg-white/20 rounded-full p-2">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-white font-medium text-sm sm:text-base">
            {message}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleUpgradeClick}
            className="px-4 py-2 text-sm font-bold text-primary-600 bg-white rounded-lg
                     hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Upgrade
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/80 hover:text-white p-1"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
