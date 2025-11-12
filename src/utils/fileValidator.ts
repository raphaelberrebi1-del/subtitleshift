import { FileValidationResult } from '../types/subtitle.types';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
const ALLOWED_EXTENSIONS = ['.srt', '.vtt'];
const ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/srt',
  'text/vtt',
  'application/x-subrip',
];

/**
 * Validates a subtitle file for size, type, and basic format
 */
export function validateFile(file: File): FileValidationResult {
  const warnings: string[] = [];

  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      error: 'No file provided',
    };
  }

  // Check file size
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File is empty',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds 50MB limit (${formatFileSize(file.size)})`,
    };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are supported`,
    };
  }

  // Check MIME type (if available)
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    warnings.push('File MIME type may not be standard, but will attempt to parse');
  }

  // Warn about large files
  if (file.size > 10 * 1024 * 1024) { // 10MB
    warnings.push('Large file detected. Processing may take a few seconds');
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Formats file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Detects if file content is valid SRT format
 */
export async function validateSRTContent(file: File): Promise<FileValidationResult> {
  try {
    const text = await file.text();

    // Basic SRT format check: Should have numbered entries
    const hasNumberedEntries = /^\d+$/m.test(text);

    // Should have timestamp arrows
    const hasTimestamps = /-->/g.test(text);

    if (!hasNumberedEntries) {
      return {
        isValid: false,
        error: 'File does not appear to be a valid SRT file (no numbered entries found)',
      };
    }

    if (!hasTimestamps) {
      return {
        isValid: false,
        error: 'File does not appear to be a valid SRT file (no timestamps found)',
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
