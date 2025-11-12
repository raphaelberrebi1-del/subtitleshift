import { useState } from 'react';
import { useSubtitleStore } from '../store/subtitleStore';
import { downloadSRT } from '../utils/srtFormatter';
import { formatToSRT } from '../utils/srtFormatter';

export function ExportPanel() {
  const [customFilename, setCustomFilename] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { entries, fileName, isDirty } = useSubtitleStore();

  const handleExport = () => {
    const srtContent = formatToSRT(entries);

    // Use custom filename or default to original filename
    const exportFilename = customFilename.trim()
      ? customFilename.endsWith('.srt')
        ? customFilename
        : `${customFilename}.srt`
      : fileName || 'subtitles.srt';

    downloadSRT(srtContent, exportFilename);

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Mark as not dirty after export
    useSubtitleStore.setState({ isDirty: false });
  };

  if (entries.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        💾 Export Subtitle File
      </h2>

      <div className="space-y-4">
        {/* Filename Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filename (optional)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder={fileName || 'subtitles.srt'}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       placeholder-gray-400 dark:placeholder-gray-500"
            />
            {customFilename && (
              <button
                onClick={() => setCustomFilename('')}
                className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Clear
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Leave empty to use original filename
          </p>
        </div>

        {/* File Info */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Total Subtitles</p>
              <p className="text-gray-900 dark:text-white font-medium">{entries.length}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {isDirty ? (
                  <span className="text-yellow-600 dark:text-yellow-400">● Unsaved changes</span>
                ) : (
                  <span className="text-green-600 dark:text-green-400">● Saved</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="w-full px-6 py-3 text-sm font-medium text-white bg-primary-500 rounded-lg
                   hover:bg-primary-600 transition-colors shadow-sm flex items-center justify-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>Download SRT File</span>
        </button>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                File downloaded successfully!
              </p>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex items-start space-x-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
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
              Your file will be exported in standard SRT format with UTF-8 encoding for maximum compatibility.
              All processing happens in your browser - no data is sent to any server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
