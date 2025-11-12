import { create } from 'zustand';
import { SubtitleEntry, SubtitleState, SubtitleActions } from '../types/subtitle.types';
import { formatToSRT, createSRTBlob } from '../utils/srtFormatter';
import { shiftTimestamp } from '../utils/timestampCalculator';

const MAX_HISTORY_SIZE = 50;

interface SubtitleStore extends SubtitleState, SubtitleActions {}

export const useSubtitleStore = create<SubtitleStore>((set, get) => ({
  // Initial state
  entries: [],
  currentEntry: null,
  history: [],
  historyIndex: -1,
  videoUrl: null,
  playbackTime: 0,
  isPlaying: false,
  fileName: '',
  isDirty: false,

  // Actions
  loadFile: async (file: File) => {
    // Note: Actual parsing happens in component using useSubtitleParser hook
    // This just updates the filename
    set({ fileName: file.name, isDirty: false });
  },

  updateEntry: (id: string, updates: Partial<SubtitleEntry>) => {
    set((state) => {
      const entries = state.entries.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      );

      // Add to history
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.entries]); // Save previous state

      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      }

      return {
        entries,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      };
    });
  },

  shiftAllTimestamps: (offsetMs: number) => {
    set((state) => {
      const entries = state.entries.map((entry) => ({
        ...entry,
        startTime: shiftTimestamp(entry.startTime, offsetMs),
        endTime: shiftTimestamp(entry.endTime, offsetMs),
      }));

      // Add to history
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.entries]);

      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      }

      return {
        entries,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      };
    });
  },

  findReplace: (find: string, replace: string, caseSensitive: boolean = false) => {
    set((state) => {
      const regex = new RegExp(
        find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        caseSensitive ? 'g' : 'gi'
      );

      const entries = state.entries.map((entry) => ({
        ...entry,
        text: entry.text.replace(regex, replace),
      }));

      // Add to history
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.entries]);

      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      }

      return {
        entries,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      };
    });
  },

  splitEntry: (id: string, time: number) => {
    set((state) => {
      const entryIndex = state.entries.findIndex((e) => e.id === id);
      if (entryIndex === -1) return state;

      const entry = state.entries[entryIndex];

      // Can't split if time is not within entry's time range
      if (time <= entry.startTime || time >= entry.endTime) return state;

      // Create two new entries
      const firstHalf: SubtitleEntry = {
        ...entry,
        endTime: time,
        text: entry.text.split('\n')[0] || entry.text, // First line if multi-line
      };

      const secondHalf: SubtitleEntry = {
        ...entry,
        id: crypto.randomUUID(),
        startTime: time,
        text: entry.text.split('\n')[1] || entry.text, // Second line if multi-line
        index: entry.index + 1,
      };

      // Update entries
      const entries = [...state.entries];
      entries.splice(entryIndex, 1, firstHalf, secondHalf);

      // Re-index
      entries.forEach((e, i) => {
        e.index = i + 1;
      });

      // Add to history
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.entries]);

      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      }

      return {
        entries,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      };
    });
  },

  mergeEntries: (id1: string, id2: string) => {
    set((state) => {
      const index1 = state.entries.findIndex((e) => e.id === id1);
      const index2 = state.entries.findIndex((e) => e.id === id2);

      if (index1 === -1 || index2 === -1) return state;

      const entry1 = state.entries[index1];
      const entry2 = state.entries[index2];

      // Merge into single entry
      const merged: SubtitleEntry = {
        ...entry1,
        endTime: entry2.endTime,
        text: `${entry1.text}\n${entry2.text}`,
      };

      // Remove both and add merged
      const entries = state.entries.filter((e) => e.id !== id1 && e.id !== id2);
      entries.splice(Math.min(index1, index2), 0, merged);

      // Re-index
      entries.forEach((e, i) => {
        e.index = i + 1;
      });

      // Add to history
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.entries]);

      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      }

      return {
        entries,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      };
    });
  },

  exportSRT: () => {
    const state = get();
    const srtContent = formatToSRT(state.entries);
    return createSRTBlob(srtContent);
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex <= 0) return state;

      const previousEntries = state.history[state.historyIndex - 1];

      return {
        entries: previousEntries,
        historyIndex: state.historyIndex - 1,
        isDirty: true,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;

      const nextEntries = state.history[state.historyIndex + 1];

      return {
        entries: nextEntries,
        historyIndex: state.historyIndex + 1,
        isDirty: true,
      };
    });
  },

  setCurrentEntry: (id: string | null) => {
    set({ currentEntry: id });
  },

  setPlaybackTime: (time: number) => {
    set({ playbackTime: time });
  },

  setIsPlaying: (playing: boolean) => {
    set({ isPlaying: playing });
  },

  setVideoUrl: (url: string | null) => {
    set({ videoUrl: url });
  },
}));
