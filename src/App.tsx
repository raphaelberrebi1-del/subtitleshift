import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileUpload } from './components/FileUpload';
import { TimestampShifter } from './components/TimestampShifter';
import { FindReplace } from './components/FindReplace';
import { SubtitleEditor } from './components/SubtitleEditor';
import { ExportPanel } from './components/ExportPanel';
import { VideoPlayer } from './components/VideoPlayer';
import { Timeline } from './components/Timeline';
import { BatchProcessor } from './components/BatchProcessor';
import { DarkModeToggle } from './components/DarkModeToggle';
import { ProBadge } from './components/ProBadge';
import { ProWelcomeBanner } from './components/ProWelcomeBanner';
import { useSubtitleStore } from './store/subtitleStore';
import { useProStatus } from './hooks/useProStatus';
import { Toaster } from 'react-hot-toast';
import { initializePaddle, openDemoCheckout } from './utils/paddle';
import { Zap, Target, Edit, Search, Lock, Heart, Sparkles, Infinity, Video, Upload } from 'lucide-react';

function App() {
  const { entries, fileName } = useSubtitleStore();
  const { isPro } = useProStatus();
  const navigate = useNavigate();

  // Initialize Paddle on component mount
  useEffect(() => {
    initializePaddle();
  }, []);

  const handleUpgradeToPro = () => {
    openDemoCheckout(navigate); // TODO: Replace with openPaddleCheckout() when you have Paddle credentials
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                SubtitleShift
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                Fix subtitle timing in 30 seconds <Zap className="w-4 h-4 text-primary-500" />
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ProBadge />
              <DarkModeToggle />

              {entries.length > 0 && (
                <button
                  onClick={() => useSubtitleStore.setState({ entries: [], fileName: '', isDirty: false })}
                  className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300
                           bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600
                           transition-colors whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Load New File</span>
                  <span className="sm:hidden">New File</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Pro Welcome Banner */}
      <ProWelcomeBanner />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {entries.length === 0 ? (
          // Show file upload when no file is loaded
          <div className="max-w-6xl mx-auto">
            {/* Conditional View: Hero for Free Users, Streamlined for Pro Users */}
            {!isPro ? (
              // Hero Section for Free Users
              <section className="bg-gray-50 dark:bg-gray-900 py-12 sm:py-16">
            <div className="text-center mb-6 sm:mb-8 px-4 max-w-6xl mx-auto">
              <motion.h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                The Fastest Way to Fix Subtitle Timing
              </motion.h2>
              <motion.p
                className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                No upload. No subscription. 100% private.
              </motion.p>
              <motion.p
                className="text-sm text-gray-500 dark:text-gray-500 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                Join 1,000+ content creators who fixed their subtitles in seconds
              </motion.p>

              {/* Dual CTAs */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.button
                  onClick={() => document.getElementById('file-upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-primary-500 rounded-lg
                           hover:bg-primary-600 transition-colors shadow-lg"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  Try for Free
                </motion.button>
                <motion.button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300
                           bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600
                           transition-colors border-2 border-gray-200 dark:border-gray-600"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  See How It Works
                </motion.button>
              </motion.div>
            </div>
            </section>
            ) : (
              // Pro Welcome View - Streamlined Experience for Pro Users
              <section className="bg-white dark:bg-gray-800 py-16 sm:py-20">
                <div className="max-w-3xl mx-auto text-center px-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-6">
                      <Sparkles className="w-5 h-5 text-white" />
                      <span className="text-white font-bold">PRO USER</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      Welcome Back!
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                      All premium features are unlocked. Upload a subtitle file to get started with unlimited editing power.
                    </p>
                  </motion.div>

                  {/* Pro Features Showcase */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
                  >
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Infinity className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Unlimited</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">No subtitle limits</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Video className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Video Sync</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Preview with video</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Advanced Tools</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Inline edit & more</p>
                    </div>
                  </motion.div>

                  {/* CTA to Upload */}
                  <motion.button
                    onClick={() => document.getElementById('file-upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold text-lg shadow-lg transition-colors inline-flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Upload className="w-5 h-5" />
                    Upload Subtitle File
                  </motion.button>
                </div>
              </section>
            )}

            {/* File Upload Section */}
            <section id="file-upload-section" className="bg-white dark:bg-gray-800 py-8 sm:py-12">
              <div className="max-w-3xl mx-auto w-full px-4">
                <FileUpload />
              </div>
            </section>

            {/* Features List */}
            <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-20">
            <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Timestamp Adjuster</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Shift all subtitles forward or backward by any amount - the killer feature
                </p>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <Edit className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Inline Editing</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click any subtitle to edit text directly - simple and fast
                </p>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Find & Replace</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fix repeated errors across all subtitles in one click
                </p>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">100% Private</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All processing happens in your browser - files never leave your device
                </p>
              </motion.div>
            </div>
            </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="bg-white dark:bg-gray-800 py-16 sm:py-20">
            <div className="max-w-6xl mx-auto px-4 py-16 w-full">
              <motion.div
                className="text-center mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  How It Works
                </h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Fix your subtitle timing in three simple steps
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-5xl mx-auto">
                {/* Step 1 */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">1</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Upload Your SRT File
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Drag and drop or click to select your .srt subtitle file. All processing happens in your browser - no upload to servers.
                  </p>
                </motion.div>

                {/* Step 2 */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">2</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Adjust Timestamps
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Use the timestamp shifter to move all subtitles forward or backward. Edit text inline or use find & replace for bulk changes.
                  </p>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">3</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Download Fixed File
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Export your corrected subtitle file in standard SRT format. Works with all media players and platforms.
                  </p>
                </motion.div>
              </div>
            </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing-section" className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-20">
            <div className="max-w-6xl mx-auto px-4 py-16 w-full">
              <motion.div
                className="text-center mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Simple, One-Time Pricing
                </h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  No subscriptions. No recurring fees. Pay once, use forever.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className="text-center mb-6">
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h4>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$0</div>
                    <p className="text-gray-500 dark:text-gray-400">Forever free</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400">Basic timestamp shifting</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400">Edit up to 50 subtitles</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400">100% private & secure</span>
                    </li>
                    <li className="flex items-start opacity-50">
                      <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-400 line-through">Unlimited subtitles</span>
                    </li>
                    <li className="flex items-start opacity-50">
                      <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-400 line-through">Video preview sync</span>
                    </li>
                    <li className="flex items-start opacity-50">
                      <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-400 line-through">Find & replace</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => document.getElementById('file-upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full px-6 py-3 text-base font-semibold text-gray-700 dark:text-gray-300
                             bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600
                             transition-colors"
                  >
                    Start Free
                  </button>
                </motion.div>

                {/* Pro Plan */}
                <motion.div
                  className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-2xl p-8 border-2 border-primary-400 relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-bold">
                    BEST VALUE
                  </div>
                  <div className="text-center mb-6">
                    <h4 className="text-2xl font-bold text-white mb-2">Pro</h4>
                    <div className="text-4xl font-bold text-white mb-2">$4.99</div>
                    <p className="text-primary-100">One-time payment</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white font-medium">Everything in Free</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white font-medium">Unlimited subtitles</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white font-medium">Video preview with subtitle sync</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white font-medium">Advanced find & replace</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white font-medium">Inline text editing</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white font-medium">Priority support</span>
                    </li>
                  </ul>
                  <button
                    onClick={handleUpgradeToPro}
                    className="w-full px-6 py-3 text-base font-bold text-primary-600 bg-white rounded-lg
                             hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    Upgrade to Pro
                  </button>
                </motion.div>
              </div>
            </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-white dark:bg-gray-800 py-16 sm:py-20">
            <div className="max-w-3xl mx-auto px-4">
              <motion.div
                className="text-center mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Frequently Asked Questions
                </h3>
              </motion.div>

              <div className="space-y-6">
                <details className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 group">
                  <summary className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer list-none
                                     flex items-center justify-between">
                    <span>Is my subtitle file uploaded to a server?</span>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    No! SubtitleShift runs 100% in your browser. Your files never leave your device. All processing happens locally on your computer using JavaScript.
                  </p>
                </details>

                <details className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 group">
                  <summary className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer list-none
                                     flex items-center justify-between">
                    <span>What subtitle formats are supported?</span>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Currently, SubtitleShift supports SRT (.srt) files, which is the most common subtitle format. Support for additional formats (VTT, ASS, SSA) is coming soon.
                  </p>
                </details>

                <details className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 group">
                  <summary className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer list-none
                                     flex items-center justify-between">
                    <span>Do I need to pay a monthly subscription?</span>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    No subscriptions! SubtitleShift Pro is a one-time payment of $4.99. Pay once and use all premium features forever. The free version is also available with limited features.
                  </p>
                </details>

                <details className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 group">
                  <summary className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer list-none
                                     flex items-center justify-between">
                    <span>How does the timestamp shifter work?</span>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Enter a positive or negative value in seconds or milliseconds. All subtitle timestamps will be shifted by that amount. For example, +2 seconds moves all subtitles 2 seconds later, while -1.5 seconds moves them 1.5 seconds earlier.
                  </p>
                </details>

                <details className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 group">
                  <summary className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer list-none
                                     flex items-center justify-between">
                    <span>Can I edit the subtitle text?</span>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Yes! With SubtitleShift Pro, you can click on any subtitle to edit the text inline. You can also use the find & replace feature to fix common typos or update terminology across all subtitles at once.
                  </p>
                </details>

                <details className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 group">
                  <summary className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer list-none
                                     flex items-center justify-between">
                    <span>What's the difference between Free and Pro?</span>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    The free version limits you to 50 subtitles and basic timestamp shifting. Pro unlocks unlimited subtitles, video preview with subtitle sync, find & replace, inline text editing, and priority support.
                  </p>
                </details>

                <details className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 group">
                  <summary className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer list-none
                                     flex items-center justify-between">
                    <span>Will the exported file work with all media players?</span>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Yes! SubtitleShift exports in standard SRT format with UTF-8 encoding, which is compatible with VLC, YouTube, Plex, Kodi, and virtually all media players and platforms.
                  </p>
                </details>
              </div>

              {/* CTA Section */}
              <motion.div
                className="mt-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-2xl p-8 sm:p-12 text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Fix Your Subtitles?
              </h3>
              <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
                Join thousands of content creators who trust SubtitleShift for fast, private subtitle editing.
              </p>
              <motion.button
                onClick={() => document.getElementById('file-upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 text-lg font-bold text-primary-600 bg-white rounded-lg
                         hover:bg-gray-100 transition-colors shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                Get Started for Free
              </motion.button>
            </motion.div>
            </div>
            </section>
          </div>
        ) : (
          // Show subtitle editor when file is loaded
          <div className="max-w-7xl mx-auto">
            {/* File Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {fileName}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {entries.length} subtitle{entries.length !== 1 ? 's' : ''} loaded
                  </p>
                </div>
              </div>
            </div>

            {/* Video Preview */}
            <div className="mb-4 sm:mb-6">
              <VideoPlayer />
            </div>

            {/* Visual Timeline */}
            <div className="mb-4 sm:mb-6">
              <Timeline />
            </div>

            {/* Batch Processor */}
            <div className="mb-4 sm:mb-6">
              <BatchProcessor />
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <TimestampShifter />
              <FindReplace />
            </div>

            {/* Export Panel */}
            <ExportPanel />

            {/* Subtitle Editor */}
            <SubtitleEditor />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8 sm:mt-12">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
              <span className="block sm:inline">100% client-side - Your files never leave your browser</span>
              <span className="hidden sm:inline"> • </span>
              <span className="block sm:inline mt-1 sm:mt-0 flex items-center justify-center gap-1.5">
                Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for content creators
              </span>
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <Link to="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Terms of Service
              </Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <a href="mailto:info@subtitleshift.com" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Contact
              </a>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              © 2025 SubtitleShift. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
