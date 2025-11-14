import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubtitleStore } from '../store/subtitleStore';
import { useProStatus } from '../hooks/useProStatus';
import { PaywallModal } from './PaywallModal';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

export function FindReplace() {
  const { isPro } = useProStatus();
  const [showPaywall, setShowPaywall] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { entries, findReplace } = useSubtitleStore();

  // Count matches
  const countMatches = () => {
    if (!findText) return 0;

    const regex = new RegExp(
      findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      caseSensitive ? 'g' : 'gi'
    );

    let count = 0;
    entries.forEach((entry) => {
      const matches = entry.text.match(regex);
      if (matches) {
        count += matches.length;
      }
    });

    return count;
  };

  const matchCount = findText ? countMatches() : 0;

  const handleReplace = () => {
    if (!findText) return;

    // TODO: DEMO MODE - RESTORE BEFORE PRODUCTION LAUNCH
    // Check Pro status
    // if (!isPro) {
    //   setShowPaywall(true);
    //   return;
    // }

    const count = matchCount;
    findReplace(findText, replaceText, caseSensitive);

    if (count > 0) {
      toast.success(`Replaced ${count} occurrence${count !== 1 ? 's' : ''} of "${findText}"`);
    } else {
      toast('No matches found');
    }

    setShowResults(true);
    setTimeout(() => setShowResults(false), 3000);
  };

  const handleUpgrade = () => {
    setShowPaywall(false);
    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClear = () => {
    setFindText('');
    setReplaceText('');
    setShowResults(false);
  };

  if (entries.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-primary-500" />
        Find & Replace
      </h2>

      <div className="space-y-4">
        {/* Find Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Find
          </label>
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Enter text to find..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Replace Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Replace with
          </label>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Enter replacement text..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Options */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="w-4 h-4 text-primary-500 border-gray-300 dark:border-gray-600 rounded
                       focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Case sensitive</span>
          </label>
        </div>

        {/* Match Count */}
        <AnimatePresence>
          {findText && (
            <motion.div
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm text-blue-900 dark:text-blue-100">
                {matchCount === 0 ? (
                  <span>No matches found</span>
                ) : (
                  <span>
                    Found <motion.strong
                      key={matchCount}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >{matchCount}</motion.strong> match{matchCount !== 1 ? 'es' : ''} across{' '}
                    {entries.filter((entry) => {
                      const regex = new RegExp(
                        findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                        caseSensitive ? 'g' : 'gi'
                      );
                      return regex.test(entry.text);
                    }).length}{' '}
                    subtitle{entries.filter((entry) => {
                      const regex = new RegExp(
                        findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                        caseSensitive ? 'g' : 'gi'
                      );
                      return regex.test(entry.text);
                    }).length !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={handleReplace}
            disabled={!findText || matchCount === 0}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg
                     hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-sm"
            whileHover={findText && matchCount > 0 ? { scale: 1.05, y: -2 } : {}}
            whileTap={findText && matchCount > 0 ? { scale: 0.95 } : {}}
          >
            Replace All ({matchCount})
          </motion.button>

          <motion.button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                     hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Clear
          </motion.button>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {showResults && matchCount > 0 && (
            <motion.div
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center space-x-2">
                <motion.svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </motion.svg>
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  Replaced {matchCount} occurrence{matchCount !== 1 ? 's' : ''}!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
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
                <strong>Tip:</strong> Use find & replace to fix common typos or update terminology across
                all subtitles at once. Changes can be undone with Ctrl+Z (Cmd+Z on Mac).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="Find & Replace"
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
