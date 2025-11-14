/**
 * Simple hash function for fingerprinting
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate a unique device fingerprint based on browser/device characteristics
 * This is not 100% foolproof but provides reasonable device identification
 */
export function generateDeviceFingerprint(): string {
  const components = [
    // User agent
    navigator.userAgent,

    // Screen resolution
    `${screen.width}x${screen.height}`,
    `${screen.colorDepth}bit`,

    // Timezone
    new Date().getTimezoneOffset().toString(),

    // Language
    navigator.language,

    // Platform
    navigator.platform,

    // Hardware concurrency (CPU cores)
    navigator.hardwareConcurrency?.toString() || 'unknown',

    // Device memory (if available)
    (navigator as any).deviceMemory?.toString() || 'unknown',

    // Touch support
    navigator.maxTouchPoints?.toString() || '0',
  ];

  // Combine all components
  const fingerprint = components.join('|');

  // Hash to create consistent ID
  return simpleHash(fingerprint);
}

/**
 * Get a user-friendly device name
 */
export function getDeviceName(): string {
  const ua = navigator.userAgent;

  // Detect OS
  let os = 'Unknown OS';
  if (ua.indexOf('Win') !== -1) os = 'Windows';
  else if (ua.indexOf('Mac') !== -1) os = 'macOS';
  else if (ua.indexOf('Linux') !== -1) os = 'Linux';
  else if (ua.indexOf('Android') !== -1) os = 'Android';
  else if (ua.indexOf('iOS') !== -1 || ua.indexOf('iPhone') !== -1) os = 'iOS';

  // Detect browser
  let browser = 'Unknown Browser';
  if (ua.indexOf('Chrome') !== -1 && ua.indexOf('Edg') === -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (ua.indexOf('Edg') !== -1) browser = 'Edge';

  return `${browser} on ${os}`;
}

/**
 * Get device info for storage
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: new Date().getTimezoneOffset(),
    deviceName: getDeviceName(),
  };
}
