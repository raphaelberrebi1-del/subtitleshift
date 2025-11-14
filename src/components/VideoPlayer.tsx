import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import { useSubtitleStore } from '../store/subtitleStore';
import { useProStatus } from '../hooks/useProStatus';
import { PaywallModal } from './PaywallModal';
import { VideoLoadModal } from './VideoLoadModal';
import type { SubtitleEntry } from '../types/subtitle.types';
import toast from 'react-hot-toast';

export function VideoPlayer() {
  const { } = useProStatus();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const playerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    entries,
    videoUrl,
    playbackTime,
    isPlaying,
    setVideoUrl,
    setPlaybackTime,
    setIsPlaying,
    setCurrentEntry,
    clearEntries,
  } = useSubtitleStore();

  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  // Find current subtitle(s) based on playback time
  const getCurrentSubtitles = (): SubtitleEntry[] => {
    return entries.filter(
      (entry) =>
        playbackTime >= entry.startTime && playbackTime <= entry.endTime
    );
  };

  const currentSubtitles = getCurrentSubtitles();

  // Handle video file upload
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: DEMO MODE - RESTORE BEFORE PRODUCTION LAUNCH
    // Check Pro status
    // if (!isPro) {
    //   event.target.value = ''; // Reset file input
    //   setShowPaywall(true);
    //   return;
    // }

    const file = event.target.files?.[0];
    if (!file) return;

    // Validate video file
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a valid video file (MP4, WebM, MOV, etc.)');
      return;
    }

    // Create object URL for video
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    toast.success('Video file loaded successfully!');
  };

  // Handle video URL submission
  const handleUrlSubmit = (url: string, clearSubtitles: boolean) => {
    // TODO: DEMO MODE - RESTORE BEFORE PRODUCTION LAUNCH
    // Check Pro status
    // if (!isPro) {
    //   setShowPaywall(true);
    //   return;
    // }

    // Clear subtitles if requested
    if (clearSubtitles) {
      clearEntries();
    }

    setVideoUrl(url);
  };

  const handleUpgrade = () => {
    setShowPaywall(false);
    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle time updates from react-player
  const handleProgress = (state: { playedSeconds: number; played: number; loadedSeconds: number; loaded: number }) => {
    setPlaybackTime(state.playedSeconds * 1000); // Convert to milliseconds
  };

  // Handle video ready/loaded
  const handleReady = () => {
    console.log('Video ready');
    // Capture duration when player is ready
    if (playerRef.current) {
      const videoDuration = playerRef.current.getDuration();
      if (videoDuration) {
        setDuration(videoDuration);
      }
    }
  };

  // Handle video errors
  const handleError = (error: any) => {
    console.error('Video load error:', error);
    toast.error('Failed to load video. Please check the URL and try again.');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const player = playerRef.current;
      if (!player || !videoUrl) return;

      // Don't interfere with input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const currentTime = playbackTime / 1000;
      const videoDuration = player.getDuration() || duration;

      switch (e.key.toLowerCase()) {
        case ' ': // Spacebar - play/pause
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;

        case 'k': // K - play/pause (video editor standard)
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;

        case 'j': // J - rewind 10 seconds
          e.preventDefault();
          player.seekTo(Math.max(0, currentTime - 10), 'seconds');
          break;

        case 'l': // L - forward 10 seconds
          e.preventDefault();
          player.seekTo(Math.min(videoDuration, currentTime + 10), 'seconds');
          break;

        case 'arrowleft': // Left arrow - rewind 5 seconds
          e.preventDefault();
          player.seekTo(Math.max(0, currentTime - 5), 'seconds');
          break;

        case 'arrowright': // Right arrow - forward 5 seconds
          e.preventDefault();
          player.seekTo(Math.min(videoDuration, currentTime + 5), 'seconds');
          break;

        case ',': // Comma - previous subtitle
          e.preventDefault();
          jumpToPreviousSubtitle();
          break;

        case '.': // Period - next subtitle
          e.preventDefault();
          jumpToNextSubtitle();
          break;

        case 'm': // M - toggle mute
          e.preventDefault();
          setIsMuted(!isMuted);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [videoUrl, isMuted, isPlaying, playbackTime]);

  // Jump to previous subtitle
  const jumpToPreviousSubtitle = () => {
    const player = playerRef.current;
    if (!player) return;

    const currentTime = playbackTime;
    const previousEntry = entries
      .filter((e) => e.startTime < currentTime - 100) // Give 100ms buffer
      .sort((a, b) => b.startTime - a.startTime)[0]; // Get latest before current

    if (previousEntry) {
      player.seekTo((previousEntry.startTime - 2000) / 1000, 'seconds'); // Start 2 seconds before
      setCurrentEntry(previousEntry.id);
    }
  };

  // Jump to next subtitle
  const jumpToNextSubtitle = () => {
    const player = playerRef.current;
    if (!player) return;

    const currentTime = playbackTime;
    const nextEntry = entries
      .filter((e) => e.startTime > currentTime + 100) // Give 100ms buffer
      .sort((a, b) => a.startTime - b.startTime)[0]; // Get earliest after current

    if (nextEntry) {
      player.seekTo((nextEntry.startTime - 2000) / 1000, 'seconds'); // Start 2 seconds before
      setCurrentEntry(nextEntry.id);
    }
  };

  // Seek to specific subtitle (called from editor)
  const seekToSubtitle = (entry: SubtitleEntry) => {
    if (playerRef.current) {
      playerRef.current.seekTo((entry.startTime - 2000) / 1000, 'seconds'); // Start 2 seconds before
      setCurrentEntry(entry.id);
    }
  };

  // Expose seekToSubtitle via store (for SubtitleEditor to use)
  useEffect(() => {
    (window as any).seekToSubtitle = seekToSubtitle;
    return () => {
      delete (window as any).seekToSubtitle;
    };
  }, []);

  // Format time for display (HH:MM:SS)
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Video Preview
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Preview subtitles with your video
            </p>
          </div>

          {!videoUrl && (
            <motion.button
              onClick={() => setShowLoadModal(true)}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg
                       text-sm font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Load Video
            </motion.button>
          )}

          {videoUrl && (
            <motion.button
              onClick={() => {
                // Only revoke blob URLs (uploaded files)
                if (videoUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(videoUrl);
                }
                setVideoUrl(null);
                setDuration(0);
              }}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                       text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Remove Video
            </motion.button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />

      {/* Video Player */}
      {!videoUrl ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            No video loaded
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            Load a video to preview your subtitles in real-time
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            You can load a video before or after uploading subtitle files
          </p>
        </div>
      ) : (
        <div className="relative bg-black">
          {/* React Player */}
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            playing={isPlaying}
            volume={volume}
            muted={isMuted}
            playbackRate={playbackSpeed}
            onProgress={handleProgress as any}
            onReady={handleReady}
            onError={handleError}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            progressInterval={100}
            width="100%"
            height="500px"
            style={{ maxHeight: '500px' }}
            controls={false}
            config={{
              youtube: {
                playerVars: { showinfo: 0, modestbranding: 1 }
              } as any,
              vimeo: {
                playerOptions: { byline: false, portrait: false }
              } as any
            }}
          />

          {/* Subtitle Overlay */}
          <AnimatePresence>
            {currentSubtitles.length > 0 && (
              <motion.div
                className="absolute bottom-16 left-0 right-0 flex flex-col items-center px-4 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {currentSubtitles.map((subtitle, index) => (
                  <motion.div
                    key={subtitle.id}
                    className="bg-black/80 text-white px-4 py-2 rounded-lg text-center
                             max-w-3xl shadow-lg"
                    style={{
                      fontSize: '1.25rem',
                      lineHeight: '1.5',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {subtitle.text}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Controls */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Progress Bar */}
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max={duration}
                value={playbackTime / 1000}
                onChange={(e) => {
                  if (playerRef.current) {
                    playerRef.current.seekTo(parseFloat(e.target.value), 'seconds');
                  }
                }}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                         [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-primary-500"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <motion.button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:text-primary-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={isPlaying ? 'pause' : 'play'}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {isPlaying ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>

                {/* Time Display */}
                <span className="text-white text-sm font-mono">
                  {formatTime(playbackTime / 1000)} /{' '}
                  {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Playback Speed */}
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-gray-600"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:text-primary-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={isMuted || volume === 0 ? 'muted' : 'unmuted'}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {isMuted || volume === 0 ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setVolume(newVolume);
                      if (newVolume > 0) setIsMuted(false);
                    }}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2
                             [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full
                             [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      {videoUrl && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Shortcuts:</strong> Space/K = Play/Pause • J/L = -10s/+10s • ←/→ = -5s/+5s • ,/. = Prev/Next subtitle • M = Mute
          </p>
        </div>
      )}

      {/* Video Load Modal */}
      <VideoLoadModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onFileSelect={handleVideoUpload}
        onUrlSubmit={handleUrlSubmit}
        hasExistingSubtitles={entries.length > 0}
      />

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="Video preview with subtitle sync"
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
