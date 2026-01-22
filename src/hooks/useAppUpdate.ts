import { useState, useEffect, useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for update skip timestamp
const UPDATE_SKIP_KEY = '@turing_update_skip';
const SKIP_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface AppUpdateInfo {
  currentVersion: string;
  latestVersion: string;
  isUpdateAvailable: boolean;
  isForceUpdate: boolean;
  releaseNotes: string[];
  storeUrl: {
    ios: string;
    android: string;
  };
}

export interface UseAppUpdateReturn {
  updateInfo: AppUpdateInfo | null;
  isLoading: boolean;
  isUpdateSkipped: boolean;
  checkForUpdate: () => Promise<void>;
  skipUpdate: () => Promise<void>;
  openStore: () => void;
}

// Default store URLs
const DEFAULT_STORE_URLS = {
  ios: 'https://apps.apple.com/app/turing/id123456789',
  android: 'https://play.google.com/store/apps/details?id=com.turing.mobile',
};

/**
 * Hook for checking and managing app updates
 */
export function useAppUpdate(): UseAppUpdateReturn {
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateSkipped, setIsUpdateSkipped] = useState(false);

  const currentVersion = Constants.expoConfig?.version || '1.0.0';

  // Check if update was recently skipped
  const checkSkipStatus = useCallback(async () => {
    try {
      const skipTimestamp = await AsyncStorage.getItem(UPDATE_SKIP_KEY);
      if (skipTimestamp) {
        const skipTime = parseInt(skipTimestamp, 10);
        const now = Date.now();
        if (now - skipTime < SKIP_DURATION) {
          setIsUpdateSkipped(true);
          return true;
        }
        // Clear expired skip
        await AsyncStorage.removeItem(UPDATE_SKIP_KEY);
      }
      setIsUpdateSkipped(false);
      return false;
    } catch {
      return false;
    }
  }, []);

  // Check for updates
  const checkForUpdate = useCallback(async () => {
    setIsLoading(true);

    try {
      // In a real implementation, this would call your backend API
      // to get the latest version info
      const response = await fetchVersionInfo();

      const isUpdateAvailable = compareVersions(currentVersion, response.latestVersion) < 0;
      const isForceUpdate = Boolean(
        isUpdateAvailable &&
        response.minimumVersion &&
        compareVersions(currentVersion, response.minimumVersion) < 0
      );

      setUpdateInfo({
        currentVersion,
        latestVersion: response.latestVersion,
        isUpdateAvailable,
        isForceUpdate,
        releaseNotes: response.releaseNotes || [],
        storeUrl: response.storeUrl || DEFAULT_STORE_URLS,
      });
    } catch (error) {
      console.error('[AppUpdate] Error checking for updates:', error);
      setUpdateInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentVersion]);

  // Skip update for 24 hours
  const skipUpdate = useCallback(async () => {
    try {
      await AsyncStorage.setItem(UPDATE_SKIP_KEY, Date.now().toString());
      setIsUpdateSkipped(true);
    } catch (error) {
      console.error('[AppUpdate] Error skipping update:', error);
    }
  }, []);

  // Open app store
  const openStore = useCallback(() => {
    const url =
      Platform.OS === 'ios'
        ? updateInfo?.storeUrl.ios || DEFAULT_STORE_URLS.ios
        : updateInfo?.storeUrl.android || DEFAULT_STORE_URLS.android;

    Linking.openURL(url).catch((err) => {
      console.error('[AppUpdate] Error opening store:', err);
    });
  }, [updateInfo]);

  // Check skip status on mount
  useEffect(() => {
    checkSkipStatus();
  }, [checkSkipStatus]);

  return {
    updateInfo,
    isLoading,
    isUpdateSkipped,
    checkForUpdate,
    skipUpdate,
    openStore,
  };
}

// Helper function to compare version strings
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }

  return 0;
}

// Mock function - replace with actual API call
async function fetchVersionInfo(): Promise<{
  latestVersion: string;
  minimumVersion?: string;
  releaseNotes?: string[];
  storeUrl?: {
    ios: string;
    android: string;
  };
}> {
  // In production, this would be:
  // const response = await fetch('https://api.turing.app/version');
  // return response.json();

  // Mock response for development
  return {
    latestVersion: '1.0.0',
    minimumVersion: '1.0.0',
    releaseNotes: [
      'Performans iyilestirmeleri',
      'Hata duzeltmeleri',
      'Yeni ozellikler',
    ],
    storeUrl: DEFAULT_STORE_URLS,
  };
}

export default useAppUpdate;
