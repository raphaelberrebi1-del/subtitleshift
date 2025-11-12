import { SubtitleEntry } from '../types/subtitle.types';
import { millisecondsToSRTTime } from './timestampCalculator';

/**
 * Formats subtitle entries back to SRT file format
 */
export function formatToSRT(entries: SubtitleEntry[]): string {
  const BOM = '\uFEFF'; // UTF-8 BOM for better compatibility with Windows apps

  // Sort entries by start time to ensure proper order
  const sortedEntries = [...entries].sort((a, b) => a.startTime - b.startTime);

  const srtContent = sortedEntries
    .map((entry, index) => {
      const startTimestamp = millisecondsToSRTTime(entry.startTime);
      const endTimestamp = millisecondsToSRTTime(entry.endTime);

      // SRT format: index, timestamp, text, blank line
      return `${index + 1}\n${startTimestamp} --> ${endTimestamp}\n${entry.text}\n`;
    })
    .join('\n');

  return BOM + srtContent;
}

/**
 * Creates a Blob from SRT content for download
 */
export function createSRTBlob(srtContent: string): Blob {
  return new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
}

/**
 * Triggers download of SRT file in browser
 */
export function downloadSRT(content: string, filename: string = 'subtitles.srt'): void {
  const blob = createSRTBlob(content);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;

  // Append to body, click, and cleanup
  document.body.appendChild(link);
  link.click();

  // Cleanup - remove link and revoke URL
  document.body.removeChild(link);

  // Delay revocation slightly for Firefox compatibility
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Validates SRT content format
 */
export function validateSRTFormat(entries: SubtitleEntry[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (entries.length === 0) {
    errors.push('No subtitle entries found');
  }

  entries.forEach((entry, index) => {
    // Check for empty text
    if (!entry.text || entry.text.trim() === '') {
      errors.push(`Entry ${index + 1}: Empty text content`);
    }

    // Check for invalid timing
    if (entry.endTime <= entry.startTime) {
      errors.push(`Entry ${index + 1}: End time must be after start time`);
    }

    // Check for negative timestamps
    if (entry.startTime < 0 || entry.endTime < 0) {
      errors.push(`Entry ${index + 1}: Negative timestamps not allowed`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
