import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubtitleStore } from '../store/subtitleStore';
import { useProStatus } from '../hooks/useProStatus';
import { PaywallModal } from './PaywallModal';
import { millisecondsToSRTTime } from '../utils/timestampCalculator';
import toast from 'react-hot-toast';
import { Edit } from 'lucide-react';

export function SubtitleEditor() {
  const { entries, updateEntry, currentEntry, setCurrentEntry, videoUrl, splitEntry, mergeEntries, playbackTime } = useSubtitleStore();
  const { isPro } = useProStatus();
  const [showPaywall, setShowPaywall] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleEditStart = (id: string, text: string) => {
    // TODO: DEMO MODE - RESTORE BEFORE PRODUCTION LAUNCH
    // Check Pro status for inline editing
    // if (!isPro) {
    //   setShowPaywall(true);
    //   return;
    // }

    setEditingId(id);
    setEditText(text);
    setCurrentEntry(id);
  };

  const handleUpgrade = () => {
    setShowPaywall(false);
    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEditSave = (id: string) => {
    if (editText.trim()) {
      updateEntry(id, { text: editText.trim() });
    }
    setEditingId(null);
    setEditText('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave(id);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const getCharacterCount = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line) => line.length);
  };

  const hasWarning = (text: string) => {
    const counts = getCharacterCount(text);
    return counts.some((count) => count > 50);
  };

  const handleJumpToVideo = (entry: any) => {
    if ((window as any).seekToSubtitle) {
      (window as any).seekToSubtitle(entry);
      setCurrentEntry(entry.id);
    }
  };

  const handleSplit = (entryId: string) => {
    // TODO: DEMO MODE - RESTORE BEFORE PRODUCTION LAUNCH
    // if (!isPro) {
    //   setShowPaywall(true);
    //   return;
    // }

    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    // Split at the midpoint of the subtitle
    const midpoint = entry.startTime + (entry.endTime - entry.startTime) / 2;
    splitEntry(entryId, midpoint);
    toast.success('Subtitle split successfully');
  };

  const handleMerge = (entryId: string) => {
    // TODO: DEMO MODE - RESTORE BEFORE PRODUCTION LAUNCH
    // if (!isPro) {
    //   setShowPaywall(true);
    //   return;
    // }

    const entryIndex = entries.findIndex(e => e.id === entryId);
    if (entryIndex === -1 || entryIndex === entries.length - 1) {
      toast.error('Cannot merge: No subtitle below this one');
      return;
    }

    const nextEntry = entries[entryIndex + 1];
    mergeEntries(entryId, nextEntry.id);
    toast.success('Subtitles merged successfully');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not editing
      if (editingId) return;

      // Check for Cmd/Ctrl + Shift + S (Split)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (currentEntry) {
          handleSplit(currentEntry);
        } else {
          toast.error('Please select a subtitle first');
        }
      }

      // Check for Cmd/Ctrl + Shift + M (Merge)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        if (currentEntry) {
          handleMerge(currentEntry);
        } else {
          toast.error('Please select a subtitle first');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentEntry, editingId, isPro]);

  // Show helpful message when video is loaded but no subtitles
  if (entries.length === 0) {
    if (!videoUrl) return null; // Don't show anything if no video loaded

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Subtitles Loaded
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your video is ready! Upload a subtitle file to start editing, or scroll up to the file upload section.
          </p>
          <motion.button
            onClick={() => {
              const uploadSection = document.querySelector('.w-full.max-w-2xl.mx-auto.p-6');
              uploadSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Subtitle File
          </motion.button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Tip: Download YouTube captions from YouTube Studio first
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Edit className="w-5 h-5 text-primary-500" />
          Subtitle Entries ({entries.length})
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Click any subtitle to edit
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {entries.map((entry, index) => {
          const isEditing = editingId === entry.id;
          const isCurrent = currentEntry === entry.id;
          const warning = hasWarning(entry.text);

          return (
            <motion.div
              key={entry.id}
              className={`
                p-4 rounded-lg border transition-all
                ${isCurrent
                  ? 'border-primary-400 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                }
                ${warning ? 'border-l-4 border-l-yellow-500' : ''}
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    #{entry.index}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {millisecondsToSRTTime(entry.startTime)} → {millisecondsToSRTTime(entry.endTime)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {Math.round((entry.endTime - entry.startTime) / 1000)}s
                  </span>
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-2">
                    {videoUrl && (
                      <motion.button
                        onClick={() => handleJumpToVideo(entry)}
                        className="text-xs text-gray-500 hover:text-primary-500 dark:text-gray-400
                                 dark:hover:text-primary-400 font-medium flex items-center gap-1"
                        title="Jump to this subtitle in video"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Jump
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => handleSplit(entry.id)}
                      className="text-xs text-gray-500 hover:text-blue-500 dark:text-gray-400
                               dark:hover:text-blue-400 font-medium flex items-center gap-1"
                      title="Split subtitle (Cmd+Shift+S)"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Split
                    </motion.button>
                    <motion.button
                      onClick={() => handleMerge(entry.id)}
                      className="text-xs text-gray-500 hover:text-green-500 dark:text-gray-400
                               dark:hover:text-green-400 font-medium flex items-center gap-1"
                      title="Merge with next subtitle (Cmd+Shift+M)"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                      Merge
                    </motion.button>
                    <motion.button
                      onClick={() => handleEditStart(entry.id, entry.text)}
                      className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400
                               dark:hover:text-primary-300 font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Edit
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Content */}
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, entry.id)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             resize-none"
                    rows={Math.max(2, editText.split('\n').length)}
                    autoFocus
                  />

                  {/* Character Count */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-gray-500 dark:text-gray-400">
                      {getCharacterCount(editText).map((count, idx) => (
                        <span
                          key={idx}
                          className={count > 50 ? 'text-yellow-600 dark:text-yellow-400 font-medium' : ''}
                        >
                          Line {idx + 1}: {count} chars
                          {idx < getCharacterCount(editText).length - 1 && ' | '}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Edit Actions */}
                  <motion.div
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    <motion.button
                      onClick={() => handleEditSave(entry.id)}
                      className="px-3 py-1 text-sm font-medium text-white bg-primary-500 rounded-md
                               hover:bg-primary-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Save
                    </motion.button>
                    <motion.button
                      onClick={handleEditCancel}
                      className="px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-400
                               hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Press Enter to save, Esc to cancel
                    </span>
                  </motion.div>
                </div>
              ) : (
                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap cursor-pointer
                              hover:text-gray-900 dark:hover:text-gray-100"
                     onClick={() => handleEditStart(entry.id, entry.text)}>
                  {entry.text}
                </div>
              )}

              {/* Warning */}
              {warning && !isEditing && (
                <motion.div
                  className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 flex items-center space-x-1"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>Line exceeds 50 characters (recommended limit)</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
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
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p>
              <strong>Best practices:</strong> Keep lines under 50 characters for better readability.
              Use Shift+Enter for multi-line subtitles.
            </p>
            <p>
              <strong>Keyboard shortcuts:</strong> Cmd/Ctrl+Shift+S to split • Cmd/Ctrl+Shift+M to merge with next
            </p>
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="Inline text editing"
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
