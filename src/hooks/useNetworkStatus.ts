import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
}

/**
 * Hook to monitor network connectivity status
 *
 * Usage:
 * const { isConnected, isInternetReachable, checkConnection } = useNetworkStatus();
 */
export function useNetworkStatus() {
  // Start with optimistic defaults (assume connected) to avoid flash on startup
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null, // null means "unknown/checking"
    type: 'unknown',
    isWifi: false,
    isCellular: false,
  });

  // Track if we've completed initial fetch to avoid false negatives
  const hasInitialized = useRef(false);

  const updateStatus = useCallback((state: NetInfoState) => {
    // Only update if we have valid data or if already initialized
    // This prevents setting isConnected to false during initial unknown state
    if (hasInitialized.current || state.isConnected !== null) {
      hasInitialized.current = true;
      setStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
      });
    }
  }, []);

  useEffect(() => {
    // Get initial state with a small delay to let the system settle
    const initTimeout = setTimeout(() => {
      NetInfo.fetch().then((state) => {
        hasInitialized.current = true;
        updateStatus(state);
      });
    }, 500);

    // Subscribe to updates
    const unsubscribe: NetInfoSubscription = NetInfo.addEventListener(updateStatus);

    return () => {
      clearTimeout(initTimeout);
      unsubscribe();
    };
  }, [updateStatus]);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    updateStatus(state);
    return state.isConnected === true && state.isInternetReachable === true;
  }, [updateStatus]);

  return {
    ...status,
    checkConnection,
  };
}

/**
 * Simple function to check if device is online
 */
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable === true;
}
