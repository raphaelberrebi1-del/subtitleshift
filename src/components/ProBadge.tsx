import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProStatus } from '../hooks/useProStatus';
import { activateLicense, deactivateLicense, generateDemoLicenseKey, getLicenseInfo } from '../utils/license';
import { initializePaddle, openPaddleCheckout } from '../utils/paddle';
import toast from 'react-hot-toast';

interface Device {
  id: number;
  device_name: string;
  device_info: any;
  activated_at: string;
  last_seen_at: string;
}

export function ProBadge() {
  const { isPro, refreshLicenseInfo } = useProStatus();
  const navigate = useNavigate();
  const [showActivation, setShowActivation] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  // Initialize Paddle on component mount
  useEffect(() => {
    initializePaddle();
  }, []);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      toast.error('Please enter a license key');
      return;
    }

    setIsActivating(true);

    try {
      const success = await activateLicense(licenseKey.trim());
      if (success === true) {
        toast.success('Pro activated successfully!');
        setShowActivation(false);
        setLicenseKey('');
        refreshLicenseInfo();
      } else if (success === 'device_limit_reached') {
        toast.error('Device limit reached (2/2 devices). Please deactivate a device first.');
      } else {
        toast.error('Invalid license key. Please check and try again.');
      }
    } catch (error) {
      console.error('Activation error:', error);
      toast.error('Failed to activate license. Please try again.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeactivate = () => {
    if (window.confirm('Are you sure you want to deactivate Pro? You can reactivate anytime with your license key.')) {
      deactivateLicense();
      toast('Pro deactivated');
      refreshLicenseInfo();
    }
  };

  const handleUseDemoKey = () => {
    const demoKey = generateDemoLicenseKey();
    setLicenseKey(demoKey);
    toast.success('Demo license key generated!');
  };

  const fetchDevices = async () => {
    const licenseInfo = getLicenseInfo();
    if (!licenseInfo.licenseKey) {
      toast.error('No license key found');
      return;
    }

    setIsLoadingDevices(true);

    try {
      const response = await fetch('/api/licenses/devices/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: licenseInfo.licenseKey })
      });

      const result = await response.json();

      if (result.success) {
        setDevices(result.devices || []);
      } else {
        toast.error('Failed to load devices');
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const handleManageDevices = async () => {
    setShowDevices(true);
    await fetchDevices();
  };

  const handleDeactivateDevice = async (deviceId: number, deviceName: string) => {
    if (!window.confirm(`Are you sure you want to deactivate "${deviceName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/licenses/devices/${deviceId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Device deactivated successfully');
        await fetchDevices(); // Refresh the list
      } else {
        toast.error('Failed to deactivate device');
      }
    } catch (error) {
      console.error('Failed to deactivate device:', error);
      toast.error('Failed to deactivate device');
    }
  };

  if (isPro) {
    return (
      <div className="relative group">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg cursor-pointer">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-bold text-white">PRO</span>
        </div>

        {/* Dropdown on hover */}
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Pro Status: Active</p>
            <div className="space-y-1">
              <button
                onClick={handleManageDevices}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                Manage Devices
              </button>
              <button
                onClick={handleDeactivate}
                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                Deactivate Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleUpgradeClick = () => {
    // Open Paddle checkout in sandbox mode
    openPaddleCheckout({ navigate });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleUpgradeClick}
          className="px-3 py-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors border border-primary-200 dark:border-primary-800"
        >
          Upgrade to Pro
        </button>
        <button
          onClick={() => setShowActivation(true)}
          className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          title="Already have a license key?"
        >
          Have a key?
        </button>
      </div>

      {/* Activation Modal */}
      {showActivation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setShowActivation(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Activate Pro
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Enter your license key to unlock all Pro features.
            </p>

            {/* License Key Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                License Key
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleActivate()}
                placeholder="XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         placeholder-gray-400 dark:placeholder-gray-500 font-mono text-sm"
              />
            </div>

            {/* Demo Key Button */}
            <button
              onClick={handleUseDemoKey}
              className="w-full mb-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Generate Demo Key (for testing)
            </button>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleActivate}
                disabled={isActivating || !licenseKey.trim()}
                className="w-full px-6 py-3 text-base font-bold text-white bg-primary-500 rounded-lg
                         hover:bg-primary-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isActivating ? 'Activating...' : 'Activate Pro'}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Don't have a license key?
                </p>
                <button
                  onClick={() => {
                    setShowActivation(false);
                    openPaddleCheckout({ navigate });
                  }}
                  className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
                >
                  Get Pro for $4.99
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Devices Modal */}
      {showDevices && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setShowDevices(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Manage Devices
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your license can be active on up to 2 devices. Deactivate a device to free up a slot.
            </p>

            {/* Devices List */}
            {isLoadingDevices ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No devices found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {device.device_name || 'Unknown Device'}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Activated: {new Date(device.activated_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Last seen: {new Date(device.last_seen_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeactivateDevice(device.id, device.device_name || 'Unknown Device')}
                      className="ml-4 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
                    >
                      Deactivate
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Device Count */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                <span className="font-semibold">{devices.length}/2</span> devices active
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
