// License key validation with server-side verification

const LICENSE_KEY_STORAGE = 'subtitleshift_license_key';
const PRO_STATUS_STORAGE = 'subtitleshift_pro_status';

export interface LicenseInfo {
  isPro: boolean;
  licenseKey: string | null;
  activatedAt: number | null;
}

// License key pattern (UUID + signature format)
// Old format: 8-4-4-4-12
// New format: 8-4-4-4-12-8 (with signature)
const LICENSE_KEY_PATTERN_OLD = /^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$/;
const LICENSE_KEY_PATTERN_NEW = /^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}-[A-Z0-9]{8}$/;

/**
 * Basic client-side format validation
 */
export function validateLicenseKey(key: string): boolean {
  return LICENSE_KEY_PATTERN_OLD.test(key) || LICENSE_KEY_PATTERN_NEW.test(key);
}

/**
 * Server-side license validation with backend API
 */
export async function validateLicenseKeyServer(licenseKey: string): Promise<boolean> {
  try {
    const response = await fetch('/api/licenses/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: licenseKey })
    });

    const result = await response.json();
    return result.valid === true;
  } catch (error) {
    console.error('License validation error:', error);
    // Fallback to client-side validation if server is unreachable
    return validateLicenseKey(licenseKey);
  }
}

/**
 * Activate a license key (with server validation and device activation)
 */
export async function activateLicense(licenseKey: string): Promise<boolean | string> {
  // Step 1: Validate format (client-side quick check)
  if (!validateLicenseKey(licenseKey)) {
    return false;
  }

  // Step 2: Get device fingerprint
  const { generateDeviceFingerprint, getDeviceName, getDeviceInfo } = await import('./deviceFingerprint');
  const deviceFingerprint = generateDeviceFingerprint();
  const deviceName = getDeviceName();
  const deviceInfo = getDeviceInfo();

  // Step 3: Activate device with server
  try {
    const response = await fetch('/api/licenses/devices/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey,
        device_fingerprint: deviceFingerprint,
        device_name: deviceName,
        device_info: deviceInfo
      })
    });

    const result = await response.json();

    if (!result.success) {
      // Return error message for device limit
      if (result.error === 'device_limit_reached') {
        return 'device_limit_reached';
      }
      return false;
    }

    // Step 4: Store locally
    localStorage.setItem(LICENSE_KEY_STORAGE, licenseKey);
    localStorage.setItem(PRO_STATUS_STORAGE, 'true');
    localStorage.setItem('subtitleshift_activated_at', Date.now().toString());

    return true;
  } catch (error) {
    console.error('Device activation error:', error);
    // Fallback to simple validation if server is unreachable
    const isValid = await validateLicenseKeyServer(licenseKey);
    if (isValid) {
      localStorage.setItem(LICENSE_KEY_STORAGE, licenseKey);
      localStorage.setItem(PRO_STATUS_STORAGE, 'true');
      localStorage.setItem('subtitleshift_activated_at', Date.now().toString());
      return true;
    }
    return false;
  }
}

export function getLicenseInfo(): LicenseInfo {
  const licenseKey = localStorage.getItem(LICENSE_KEY_STORAGE);
  const isPro = localStorage.getItem(PRO_STATUS_STORAGE) === 'true';
  const activatedAt = localStorage.getItem('subtitleshift_activated_at');

  return {
    isPro,
    licenseKey,
    activatedAt: activatedAt ? parseInt(activatedAt, 10) : null,
  };
}

export function deactivateLicense(): void {
  localStorage.removeItem(LICENSE_KEY_STORAGE);
  localStorage.removeItem(PRO_STATUS_STORAGE);
  localStorage.removeItem('subtitleshift_activated_at');
}

// Generate a demo license key for testing
export function generateDemoLicenseKey(): string {
  // Generate random alphanumeric string with exact length
  const randomHex = (length: number) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  // Format: 8-4-4-4-12 (matches LICENSE_KEY_PATTERN)
  return `${randomHex(8)}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(12)}`;
}
