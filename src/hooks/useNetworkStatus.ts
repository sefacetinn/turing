import { useState, useEffect, useCallback } from 'react';
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
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
  });

  const updateStatus = useCallback((state: NetInfoState) => {
    setStatus({
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
    });
  }, []);

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then(updateStatus);

    // Subscribe to updates
    const unsubscribe: NetInfoSubscription = NetInfo.addEventListener(updateStatus);

    return () => {
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
