import { useState, useEffect } from 'react';
import { getLicenseInfo, validateLicenseKeyServer, deactivateLicense, type LicenseInfo } from '../utils/license';

const LAST_VALIDATION_KEY = 'subtitleshift_last_validation';
const VALIDATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export function useProStatus() {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo>(() => getLicenseInfo());

  // Listen for storage changes (in case user activates in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      setLicenseInfo(getLicenseInfo());
    };

    // Listen for custom license activation event
    const handleLicenseActivated = () => {
      setLicenseInfo(getLicenseInfo());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('license-activated', handleLicenseActivated);

    // Also check periodically in case of localStorage changes in the same tab
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('license-activated', handleLicenseActivated);
      clearInterval(interval);
    };
  }, []);

  // Force re-check when component mounts (catches cases where events were missed)
  useEffect(() => {
    const currentInfo = getLicenseInfo();
    if (currentInfo.isPro !== licenseInfo.isPro) {
      setLicenseInfo(currentInfo);
    }
  }, []);

  // Periodic server-side revalidation (every 24 hours)
  useEffect(() => {
    const revalidate = async () => {
      if (!licenseInfo.isPro || !licenseInfo.licenseKey) return;

      const lastValidation = localStorage.getItem(LAST_VALIDATION_KEY);
      const now = Date.now();

      // Check if 24 hours have passed since last validation
      if (lastValidation) {
        const timeSinceValidation = now - parseInt(lastValidation, 10);
        if (timeSinceValidation < VALIDATION_INTERVAL) {
          return; // Skip validation
        }
      }

      // Validate with server
      const isValid = await validateLicenseKeyServer(licenseInfo.licenseKey);
      if (!isValid) {
        // Server says license is invalid - deactivate
        console.warn('License validation failed - deactivating');
        deactivateLicense();
        setLicenseInfo(getLicenseInfo());
      }

      // Update last validation timestamp
      localStorage.setItem(LAST_VALIDATION_KEY, now.toString());
    };

    // Run validation immediately on mount
    revalidate();

    // Re-run validation every hour (but it will only validate if 24hrs passed)
    const interval = setInterval(revalidate, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [licenseInfo.isPro, licenseInfo.licenseKey]);

  const refreshLicenseInfo = () => {
    setLicenseInfo(getLicenseInfo());
  };

  return {
    ...licenseInfo,
    refreshLicenseInfo,
  };
}
