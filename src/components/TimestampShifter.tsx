import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubtitleStore } from '../store/subtitleStore';
import { formatDuration } from '../utils/timestampCalculator';
import toast from 'react-hot-toast';
import { Target } from 'lucide-react';

export function TimestampShifter() {
  const [offset, setOffset] = useState<string>('0');
  const [unit, setUnit] = useState<'seconds' | 'milliseconds'>('seconds');
  const [showPreview, setShowPreview] = useState(false);
  const { entries, shiftAllTimestamps } = useSubtitleStore();

  const offsetMs = unit === 'seconds' ? parseFloat(offset) * 1000 : parseFloat(offset);
  const isValidOffset = !isNaN(offsetMs) && isFinite(offsetMs);

  // Preview first and last subtitle with offset applied
  const firstEntry = entries[0];
  const lastEntry = entries[entries.length - 1];

  const previewFirst = firstEntry
    ? {
        original: formatDuration(firstEntry.startTime),
        adjusted: formatDuration(Math.max(0, firstEntry.startTime + offsetMs)),
      }
    : null;

  const previewLast = lastEntry
    ? {
        original: formatDuration(lastEntry.endTime),
        adjusted: formatDuration(Math.max(0, lastEntry.endTime + offsetMs)),
      }
    : null;

  const handleApply = () => {
    if (!isValidOffset) return;

    shiftAllTimestamps(offsetMs);

    const offsetSeconds = offsetMs / 1000;
    const sign = offsetSeconds >= 0 ? '+' : '';
    toast.success(`Timestamps shifted by ${sign}${offsetSeconds.toFixed(2)}s for ${entries.length} subtitles`);

    setOffset('0');
    setShowPreview(false);
  };

  const handleReset = () => {
    setOffset('0');
    setShowPreview(false);
  };

  const handleQuickShift = (seconds: number) => {
    setOffset(String(seconds));
    setUnit('seconds');
  };

  if (entries.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary-500" />
        Timestamp Adjuster
      </h2>

      <div className="space-y-4">
        {/* Offset Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Shift all subtitles by:
          </label>

          <div className="flex items-center space-x-3">
            {/* Input Field */}
            <div className="flex-1 max-w-xs">
              <input
                type="number"
                step={unit === 'seconds' ? '0.1' : '100'}
                value={offset}
                onChange={(e) => setOffset(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Unit Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setUnit('seconds')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  unit === 'seconds'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Seconds
              </button>
              <button
                onClick={() => setUnit('milliseconds')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  unit === 'milliseconds'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                ms
              </button>
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Use negative values to shift earlier, positive to shift later
          </p>
        </div>

        {/* Quick Shift Buttons */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick shifts:
          </p>
          <div className="flex flex-wrap gap-2">
            {[-5, -2, -1, -0.5, 0.5, 1, 2, 5].map((seconds, index) => (
              <motion.button
                key={seconds}
                onClick={() => handleQuickShift(seconds)}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                         rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {seconds > 0 ? '+' : ''}
                {seconds}s
              </motion.button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <AnimatePresence>
          {showPreview && isValidOffset && (previewFirst || previewLast) && (
            <motion.div
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Preview
              </h3>
              <div className="space-y-2 text-sm">
                {previewFirst && (
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    <span className="text-gray-600 dark:text-gray-400">First subtitle starts:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400 line-through">
                        {previewFirst.original}
                      </span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        → {previewFirst.adjusted}
                      </span>
                    </div>
                  </motion.div>
                )}
                {previewLast && (
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.15 }}
                  >
                    <span className="text-gray-600 dark:text-gray-400">Last subtitle ends:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400 line-through">
                        {previewLast.original}
                      </span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        → {previewLast.adjusted}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <motion.button
            onClick={() => setShowPreview(!showPreview)}
            disabled={!isValidOffset || offsetMs === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                     bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={isValidOffset && offsetMs !== 0 ? { scale: 1.02 } : {}}
            whileTap={isValidOffset && offsetMs !== 0 ? { scale: 0.98 } : {}}
          >
            {showPreview ? 'Hide' : 'Show'} Preview
          </motion.button>

          <motion.button
            onClick={handleApply}
            disabled={!isValidOffset || offsetMs === 0}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg
                     hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-sm"
            whileHover={isValidOffset && offsetMs !== 0 ? { scale: 1.05, y: -2 } : {}}
            whileTap={isValidOffset && offsetMs !== 0 ? { scale: 0.95 } : {}}
          >
            Apply Shift
          </motion.button>

          <motion.button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                     hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Reset
          </motion.button>
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p>
                <strong>Tip:</strong> If your subtitles are consistently late, use a negative value to
                shift them earlier. If they're early, use a positive value.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
