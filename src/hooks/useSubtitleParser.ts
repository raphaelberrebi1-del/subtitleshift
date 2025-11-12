import { useState } from 'react';
import srtParser2 from 'srt-parser-2';
import { SubtitleEntry, ParsedSRTEntry } from '../types/subtitle.types';
import { v4 as uuidv4 } from 'uuid';

interface UseSubtitleParserReturn {
  parseFile: (file: File) => Promise<SubtitleEntry[]>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for parsing subtitle files using srt-parser-2
 */
export function useSubtitleParser(): UseSubtitleParserReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = async (file: File): Promise<SubtitleEntry[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Read file content
      const text = await file.text();

      // Parse with srt-parser-2
      const parser = new srtParser2();
      const parsedEntries: ParsedSRTEntry[] = parser.fromSrt(text);

      // Convert to our SubtitleEntry format
      const entries: SubtitleEntry[] = parsedEntries.map((entry, index) => ({
        id: uuidv4(),
        index: index + 1,
        startTime: entry.startSeconds * 1000, // Convert to milliseconds
        endTime: entry.endSeconds * 1000,     // Convert to milliseconds
        text: entry.text,
        originalStartTime: entry.startSeconds * 1000,
        originalEndTime: entry.endSeconds * 1000,
      }));

      setIsLoading(false);
      return entries;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse subtitle file';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    parseFile,
    isLoading,
    error,
  };
}
