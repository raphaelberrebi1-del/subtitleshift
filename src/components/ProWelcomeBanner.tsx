import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Video, Infinity, Zap } from 'lucide-react';
import { getLicenseInfo } from '../utils/license';

const BANNER_DISMISSAL_KEY = 'subtitleshift_pro_welcome_dismissed';
const BANNER_DISPLAY_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function ProWelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = localStorage.getItem(BANNER_DISMISSAL_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const now = Date.now();
      // If dismissed less than 24 hours ago, don't show
      if (now - dismissedAt < BANNER_DISPLAY_DURATION) {
        return;
      }
    }

    // Check if user just activated Pro (within last 24 hours)
    const licenseInfo = getLicenseInfo();

    if (licenseInfo.isPro && licenseInfo.activatedAt) {
      const now = Date.now();

      // Show banner if activated within last 24 hours
      if (now - licenseInfo.activatedAt < BANNER_DISPLAY_DURATION) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(BANNER_DISMISSAL_KEY, Date.now().toString());
  };

  const handleGetStarted = () => {
    // Scroll to file upload section
    const uploadSection = document.getElementById('file-upload-section');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gradient-to-r from-primary-500 to-primary-600 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />
          </div>

          <div className="container mx-auto px-4 py-6 relative">
            <div className="flex items-start justify-between gap-4">
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      Welcome to SubtitleShift Pro!
                    </h3>
                    <p className="text-white/90 text-sm">
                      All premium features are now unlocked and ready to use
                    </p>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Infinity className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm">Unlimited Subtitles</p>
                      <p className="text-white/75 text-xs">No more 200 subtitle limit</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm">Video Preview</p>
                      <p className="text-white/75 text-xs">Sync subtitles with video</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm">Advanced Tools</p>
                      <p className="text-white/75 text-xs">Inline edit & batch process</p>
                    </div>
                  </motion.div>
                </div>

                {/* CTA */}
                <div className="mt-4">
                  <button
                    onClick={handleGetStarted}
                    className="px-6 py-2.5 bg-white text-primary-600 rounded-lg font-semibold text-sm
                             hover:bg-gray-100 transition-colors shadow-lg inline-flex items-center gap-2"
                  >
                    Get Started
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white p-1 transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
