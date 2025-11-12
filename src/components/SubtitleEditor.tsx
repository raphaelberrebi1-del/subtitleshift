import { useState } from 'react';
import { useSubtitleStore } from '../store/subtitleStore';
import { millisecondsToSRTTime } from '../utils/timestampCalculator';

export function SubtitleEditor() {
  const { entries, updateEntry, currentEntry, setCurrentEntry } = useSubtitleStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleEditStart = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
    setCurrentEntry(id);
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

  if (entries.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          ✏️ Subtitle Entries ({entries.length})
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Click any subtitle to edit
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {entries.map((entry) => {
          const isEditing = editingId === entry.id;
          const isCurrent = currentEntry === entry.id;
          const warning = hasWarning(entry.text);

          return (
            <div
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
                  <button
                    onClick={() => handleEditStart(entry.id, entry.text)}
                    className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400
                             dark:hover:text-primary-300 font-medium"
                  >
                    Edit
                  </button>
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
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditSave(entry.id)}
                      className="px-3 py-1 text-sm font-medium text-white bg-primary-500 rounded-md
                               hover:bg-primary-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-400
                               hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Press Enter to save, Esc to cancel
                    </span>
                  </div>
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
                <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>Line exceeds 50 characters (recommended limit)</span>
                </div>
              )}
            </div>
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
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <p>
              <strong>Best practices:</strong> Keep lines under 50 characters for better readability.
              Use Shift+Enter for multi-line subtitles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
