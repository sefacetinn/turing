import { useEffect, useRef, useCallback } from 'react';
import { useNavigationState, useRoute } from '@react-navigation/native';
import {
  logScreenView,
  setUserProperties,
  clearUserProperties,
  UserProperties,
} from '../services/analytics';

interface UseAnalyticsTrackingOptions {
  userId?: string;
  userProperties?: Partial<UserProperties>;
  enabled?: boolean;
}

/**
 * Hook for automatic screen tracking with React Navigation
 */
export function useAnalyticsTracking(options: UseAnalyticsTrackingOptions = {}) {
  const { userId, userProperties, enabled = true } = options;
  const previousScreenRef = useRef<string | null>(null);

  // Set user properties when they change
  useEffect(() => {
    if (!enabled) return;

    if (userId || userProperties) {
      setUserProperties({
        user_id: userId,
        ...userProperties,
      });
    }
  }, [userId, userProperties, enabled]);

  // Clear user properties on unmount (logout)
  useEffect(() => {
    return () => {
      if (userId) {
        clearUserProperties();
      }
    };
  }, [userId]);

  // Track screen manually
  const trackScreen = useCallback(
    (screenName: string, screenClass?: string) => {
      if (!enabled) return;
      if (screenName === previousScreenRef.current) return;

      previousScreenRef.current = screenName;
      logScreenView(screenName, screenClass);
    },
    [enabled]
  );

  return { trackScreen };
}

/**
 * Hook for tracking the current screen automatically
 * Use this in screens that need automatic tracking
 */
export function useScreenTracking(screenName?: string) {
  const route = useRoute();
  const effectiveScreenName = screenName || route.name;

  useEffect(() => {
    logScreenView(effectiveScreenName, effectiveScreenName);
  }, [effectiveScreenName]);
}

/**
 * Get current route name from navigation state
 */
function getActiveRouteName(state: any): string | undefined {
  if (!state) return undefined;

  const route = state.routes[state.index];

  if (route.state) {
    // Dive into nested navigators
    return getActiveRouteName(route.state);
  }

  return route.name;
}

/**
 * Hook for tracking navigation changes
 * Use this at the top level with NavigationContainer
 */
export function useNavigationTracking() {
  const previousRouteNameRef = useRef<string | undefined>();

  const onStateChange = useCallback((state: any) => {
    const currentRouteName = getActiveRouteName(state);

    if (currentRouteName && previousRouteNameRef.current !== currentRouteName) {
      logScreenView(currentRouteName, currentRouteName);
    }

    previousRouteNameRef.current = currentRouteName;
  }, []);

  return { onStateChange };
}

export default useAnalyticsTracking;
