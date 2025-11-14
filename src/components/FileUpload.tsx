import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { validateFile, formatFileSize } from '../utils/fileValidator';
import { useSubtitleParser } from '../hooks/useSubtitleParser';
import { useSubtitleStore } from '../store/subtitleStore';
import { useProStatus } from '../hooks/useProStatus';
import { PaywallModal } from './PaywallModal';
import toast from 'react-hot-toast';

const FREE_SUBTITLE_LIMIT = 200; // Temporarily increased for demo testing

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { parseFile, isLoading } = useSubtitleParser();
  const { loadFile } = useSubtitleStore();
  const { isPro } = useProStatus();

  const handleFile = async (file: File) => {
    setError(null);
    setWarnings([]);

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    if (validation.warnings) {
      setWarnings(validation.warnings);
    }

    try {
      // Parse the file
      const entries = await parseFile(file);

      // Check if free user is over the limit
      if (!isPro && entries.length > FREE_SUBTITLE_LIMIT) {
        const limitedEntries = entries.slice(0, FREE_SUBTITLE_LIMIT);
        useSubtitleStore.setState({ entries: limitedEntries, fileName: file.name, isDirty: false });
        await loadFile(file);

        toast.error(
          `Free version limited to ${FREE_SUBTITLE_LIMIT} subtitles. File has ${entries.length} subtitles. Showing first ${FREE_SUBTITLE_LIMIT}.`,
          { duration: 6000 }
        );
        setShowPaywall(true);
        return;
      }

      // Update store with parsed entries
      useSubtitleStore.setState({ entries, fileName: file.name, isDirty: false });

      // Load file metadata
      await loadFile(file);

      toast.success(`Loaded ${entries.length} subtitle${entries.length !== 1 ? 's' : ''} successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
    }
  };

  const handleUpgrade = () => {
    setShowPaywall(false);
    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".srt,.vtt"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          {/* Upload Icon */}
          <svg
            className="w-16 h-16 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {/* Upload Text */}
          <div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
              {isLoading ? 'Loading...' : 'Drop your SRT file here'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              or click to browse
            </p>
          </div>

          {/* File Info */}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Supports .srt and .vtt files up to 50MB
          </p>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2 last:mb-0">
              <svg
                className="w-5 h-5 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">{warning}</p>
            </div>
          ))}
        </div>
      )}

      {/* YouTube Caption Helper */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Editing YouTube Captions?
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
          SubtitleShift edits existing subtitle files. To edit YouTube's auto-captions:
        </p>
        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 ml-4">
          <li className="flex items-start">
            <span className="font-semibold mr-2">1.</span>
            <span>Go to <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 dark:hover:text-blue-300">YouTube Studio</a> → Subtitles</span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">2.</span>
            <span>Select your video → Download subtitle file (.srt)</span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">3.</span>
            <span>Upload it here, edit timestamps/text, then export</span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">4.</span>
            <span>Re-upload the edited file to YouTube Studio</span>
          </li>
        </ol>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-3 italic">
          Or load your video first using the Video Preview section below →
        </p>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="Unlimited subtitles"
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
