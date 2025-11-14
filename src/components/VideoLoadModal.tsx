import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link } from 'lucide-react';
import toast from 'react-hot-toast';

interface VideoLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUrlSubmit: (url: string, clearSubtitles: boolean) => void;
  hasExistingSubtitles: boolean;
}

type VideoType = 'youtube' | 'vimeo' | 'direct' | 'unsupported';

export function VideoLoadModal({
  isOpen,
  onClose,
  onFileSelect,
  onUrlSubmit,
  hasExistingSubtitles,
}: VideoLoadModalProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');

  const detectVideoType = (url: string): VideoType => {
    if (!url.trim()) return 'unsupported';

    // YouTube patterns
    if (url.match(/(?:youtube\.com|youtu\.be|youtube-nocookie\.com)/i)) {
      return 'youtube';
    }

    // Vimeo patterns
    if (url.match(/vimeo\.com/i)) {
      return 'vimeo';
    }

    // Direct video file URLs
    if (url.match(/\.(mp4|webm|ogg|mov|avi)(\?|$)/i)) {
      return 'direct';
    }

    // Blob URLs (uploaded files)
    if (url.startsWith('blob:')) {
      return 'direct';
    }

    return 'unsupported';
  };

  const validateAndSubmitUrl = () => {
    setUrlError('');

    if (!urlInput.trim()) {
      setUrlError('Please enter a video URL');
      return;
    }

    const videoType = detectVideoType(urlInput);

    if (videoType === 'unsupported') {
      // Check for specific unsupported platforms
      if (urlInput.match(/tiktok\.com/i)) {
        setUrlError('TikTok videos are not supported. Please use YouTube or Vimeo, or download the video and upload it.');
        return;
      }
      if (urlInput.match(/instagram\.com/i)) {
        setUrlError('Instagram videos are not supported. Please use YouTube or Vimeo, or download the video and upload it.');
        return;
      }
      if (urlInput.match(/twitter\.com|x\.com/i)) {
        setUrlError('Twitter/X videos are not supported. Please use YouTube or Vimeo, or download the video and upload it.');
        return;
      }

      setUrlError('Please enter a valid YouTube or Vimeo URL, or a direct video file link (MP4, WebM, etc.)');
      return;
    }

    // Check if there are existing subtitles
    if (hasExistingSubtitles) {
      setPendingUrl(urlInput);
      setShowConfirmation(true);
      return;
    }

    // Submit the URL directly if no existing subtitles
    onUrlSubmit(urlInput, false);
    setUrlInput('');
    setUrlError('');
    onClose();

    toast.success(`Loading ${videoType === 'youtube' ? 'YouTube' : videoType === 'vimeo' ? 'Vimeo' : ''} video...`);
  };

  const handleConfirmation = (clearSubtitles: boolean) => {
    const videoType = detectVideoType(pendingUrl);
    onUrlSubmit(pendingUrl, clearSubtitles);
    setUrlInput('');
    setUrlError('');
    setPendingUrl('');
    setShowConfirmation(false);
    onClose();

    toast.success(`Loading ${videoType === 'youtube' ? 'YouTube' : videoType === 'vimeo' ? 'Vimeo' : ''} video...`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              // Don't close if confirmation dialog is showing
              if (!showConfirmation) {
                onClose();
              }
            }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Load Video
                </h3>
                <button
                  onClick={() => {
                    // Don't close if confirmation dialog is showing
                    if (!showConfirmation) {
                      onClose();
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('url')}
                  className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'url'
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Link className="w-4 h-4" />
                  Paste URL
                </button>
                <button
                  onClick={() => setActiveTab('file')}
                  className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'file'
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'url' ? (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Paste a YouTube or Vimeo URL to preview with your subtitles
                    </p>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        setUrlError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          validateAndSubmitUrl();
                        }
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none
                               focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                        urlError
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {urlError && (
                      <p className="text-sm text-red-500 dark:text-red-400 mt-2">{urlError}</p>
                    )}
                    <motion.button
                      onClick={validateAndSubmitUrl}
                      className="w-full mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600
                               text-white rounded-lg font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Load Video
                    </motion.button>

                    {/* Examples */}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-blue-800 dark:text-blue-300 mb-2">
                        <strong>Supported platforms:</strong>
                      </p>
                      <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• YouTube (youtube.com, youtu.be)</li>
                        <li>• Vimeo (vimeo.com)</li>
                        <li>• Direct video files (MP4, WebM, MOV)</li>
                      </ul>
                    </div>

                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-xs text-yellow-800 dark:text-yellow-300">
                        <strong>Note:</strong> TikTok, Instagram, and Twitter videos are not supported.
                        Please download them first and use the "Upload File" tab.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Upload a video file from your computer (MP4, WebM, MOV, etc.)
                    </p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600
                               rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500
                               file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                               file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700
                               hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300
                               dark:hover:file:bg-primary-800"
                    />
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Privacy:</strong> Your video stays in your browser. Nothing is uploaded
                        to our servers - all processing happens locally on your device.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Confirmation Dialog */}
          <AnimatePresence>
            {showConfirmation && (
              <motion.div
                className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-md shadow-2xl border border-gray-200 dark:border-gray-700"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                >
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Existing Subtitles Detected
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    You have subtitle entries currently loaded. What would you like to do with them?
                  </p>
                  <div className="flex flex-col gap-3">
                    <motion.button
                      onClick={() => handleConfirmation(false)}
                      className="w-full px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-semibold">Keep Current Subtitles</div>
                      <div className="text-xs opacity-90 mt-1">Use the same subtitle file with this new video</div>
                    </motion.button>
                    <motion.button
                      onClick={() => handleConfirmation(true)}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-semibold">Clear All Subtitles</div>
                      <div className="text-xs opacity-75 mt-1">Start fresh with a blank slate</div>
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setShowConfirmation(false);
                        setPendingUrl('');
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 py-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
