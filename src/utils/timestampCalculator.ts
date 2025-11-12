/**
 * Converts milliseconds to SRT timestamp format (HH:MM:SS,mmm)
 */
export function millisecondsToSRTTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(milliseconds, 3)}`;
}

/**
 * Converts SRT timestamp format to milliseconds
 */
export function srtTimeToMilliseconds(timeString: string): number {
  // Handle both comma and period as millisecond separator
  const normalized = timeString.replace(',', '.');

  const [time, ms] = normalized.split('.');
  const [hours, minutes, seconds] = time.split(':').map(Number);

  return (
    hours * 3600000 +
    minutes * 60000 +
    seconds * 1000 +
    parseInt(ms || '0', 10)
  );
}

/**
 * Pads a number with zeros to reach the specified length
 */
function pad(num: number, size: number): string {
  return String(num).padStart(size, '0');
}

/**
 * Shifts a timestamp by an offset, ensuring it doesn't go negative
 */
export function shiftTimestamp(timestamp: number, offsetMs: number): number {
  const newTimestamp = timestamp + offsetMs;
  return Math.max(0, newTimestamp); // Prevent negative timestamps
}

/**
 * Calculates the duration of a subtitle entry
 */
export function calculateDuration(startTime: number, endTime: number): number {
  return Math.max(0, endTime - startTime);
}

/**
 * Formats milliseconds to a human-readable duration (MM:SS)
 */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${pad(seconds, 2)}`;
}

/**
 * Validates that end time is after start time
 */
export function validateTimingOrder(startTime: number, endTime: number): boolean {
  return endTime > startTime;
}
