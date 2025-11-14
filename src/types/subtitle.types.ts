/**
 * Core subtitle entry interface
 * Represents a single subtitle with timing and text
 */
export interface SubtitleEntry {
  id: string;                    // Unique identifier (UUID)
  index: number;                 // Sequence number (1, 2, 3...)
  startTime: number;             // Start time in milliseconds
  endTime: number;               // End time in milliseconds
  text: string;                  // Subtitle text content
  originalStartTime?: number;    // For undo/comparison
  originalEndTime?: number;      // For undo/comparison
}

/**
 * Application state interface
 */
export interface SubtitleState {
  entries: SubtitleEntry[];      // Array of subtitles
  currentEntry: string | null;   // Selected entry ID
  history: SubtitleEntry[][];    // Undo/redo stack
  historyIndex: number;          // Current position in history
  videoUrl: string | null;       // Loaded video file URL
  playbackTime: number;          // Current video position (ms)
  isPlaying: boolean;            // Video playback state
  fileName: string;              // Original file name
  isDirty: boolean;              // Has unsaved changes
}

/**
 * State actions interface
 */
export interface SubtitleActions {
  loadFile: (file: File) => Promise<void>;
  updateEntry: (id: string, updates: Partial<SubtitleEntry>) => void;
  shiftAllTimestamps: (offset: number) => void;
  findReplace: (find: string, replace: string, caseSensitive?: boolean) => void;
  splitEntry: (id: string, time: number) => void;
  mergeEntries: (id1: string, id2: string) => void;
  exportSRT: () => Blob;
  undo: () => void;
  redo: () => void;
  setCurrentEntry: (id: string | null) => void;
  setPlaybackTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setVideoUrl: (url: string | null) => void;
  clearEntries: () => void;
}

/**
 * File validation result
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Parsed SRT entry from srt-parser-2
 */
export interface ParsedSRTEntry {
  id: string;
  startTime: string;
  startSeconds: number;
  endTime: string;
  endSeconds: number;
  text: string;
}
