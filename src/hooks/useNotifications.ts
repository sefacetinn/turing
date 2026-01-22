import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  savePushTokenToFirestore,
  removePushTokenFromFirestore,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  removeNotificationSubscription,
  clearBadge,
  NotificationType,
} from '../services/notifications';
import { addBreadcrumb } from '../services/sentry';

interface UseNotificationsOptions {
  userId?: string;
  onNotificationReceived?: (notification: Notifications.Notification) => void;
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void;
}

interface UseNotificationsReturn {
  pushToken: string | null;
  isPermissionGranted: boolean;
  requestPermission: () => Promise<string | null>;
  clearPushToken: () => Promise<void>;
}

/**
 * Hook for managing push notifications
 */
export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { userId, onNotificationReceived, onNotificationResponse } = options;
  const navigation = useNavigation<any>();

  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  const notificationReceivedRef = useRef<Notifications.Subscription | null>(null);
  const notificationResponseRef = useRef<Notifications.Subscription | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Handle notification received in foreground
  const handleNotificationReceived = useCallback(
    (notification: Notifications.Notification) => {
      addBreadcrumb({
        category: 'notifications',
        message: 'Notification received in foreground',
        level: 'info',
        data: {
          title: notification.request.content.title,
          type: notification.request.content.data?.type,
        },
      });

      // Call custom handler if provided
      onNotificationReceived?.(notification);
    },
    [onNotificationReceived]
  );

  // Handle notification response (user tapped)
  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;

      addBreadcrumb({
        category: 'notifications',
        message: 'Notification tapped',
        level: 'info',
        data: {
          type: data?.type,
          screen: data?.screen,
        },
      });

      // Navigate based on notification type
      if (data?.screen) {
        const params = (data?.params as Record<string, string>) || {};
        navigateToScreen(data.screen as string, params);
      } else if (data?.type) {
        handleNavigationByType(data.type as NotificationType, data);
      }

      // Call custom handler if provided
      onNotificationResponse?.(response);
    },
    [onNotificationResponse, navigation]
  );

  // Navigate to a specific screen
  const navigateToScreen = useCallback(
    (screen: string, params: Record<string, string> = {}) => {
      try {
        navigation.navigate(screen, params);
      } catch (error) {
        console.error('[Notifications] Navigation error:', error);
      }
    },
    [navigation]
  );

  // Handle navigation by notification type
  const handleNavigationByType = useCallback(
    (type: NotificationType, data: Record<string, any>) => {
      switch (type) {
        case 'new_message':
          if (data.conversationId) {
            navigation.navigate('MessagesTab', {
              screen: 'Chat',
              params: { conversationId: data.conversationId },
            });
          }
          break;

        case 'new_offer':
        case 'offer_accepted':
        case 'offer_rejected':
          if (data.offerId) {
            navigation.navigate('OffersTab', {
              screen: 'OfferDetail',
              params: { offerId: data.offerId },
            });
          }
          break;

        case 'event_reminder':
        case 'event_update':
          if (data.eventId) {
            navigation.navigate('EventsTab', {
              screen: 'EventDetail',
              params: { eventId: data.eventId },
            });
          }
          break;

        case 'contract_signed':
          if (data.contractId) {
            navigation.navigate('OffersTab', {
              screen: 'Contract',
              params: { contractId: data.contractId },
            });
          }
          break;

        case 'review_request':
          if (data.eventId) {
            navigation.navigate('EventsTab', {
              screen: 'EventDetail',
              params: { eventId: data.eventId, showReview: true },
            });
          }
          break;

        default:
          // Navigate to notifications screen for generic notifications
          navigation.navigate('HomeTab', {
            screen: 'Notifications',
          });
      }
    },
    [navigation]
  );

  // Request notification permission and get token
  const requestPermission = useCallback(async (): Promise<string | null> => {
    const token = await registerForPushNotificationsAsync();

    if (token) {
      setPushToken(token);
      setIsPermissionGranted(true);

      // Save token to Firestore if userId is provided
      if (userId) {
        await savePushTokenToFirestore(userId, token);
      }
    }

    return token;
  }, [userId]);

  // Clear push token (on logout)
  const clearPushToken = useCallback(async (): Promise<void> => {
    if (userId) {
      await removePushTokenFromFirestore(userId);
    }
    setPushToken(null);
  }, [userId]);

  // Initialize notifications on mount
  useEffect(() => {
    // Register for push notifications
    requestPermission();

    // Set up notification listeners
    notificationReceivedRef.current = addNotificationReceivedListener(
      handleNotificationReceived
    );

    notificationResponseRef.current = addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    // Clean up on unmount
    return () => {
      if (notificationReceivedRef.current) {
        removeNotificationSubscription(notificationReceivedRef.current);
      }
      if (notificationResponseRef.current) {
        removeNotificationSubscription(notificationResponseRef.current);
      }
    };
  }, [requestPermission, handleNotificationReceived, handleNotificationResponse]);

  // Clear badge when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground
        clearBadge();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // Update token when userId changes
  useEffect(() => {
    if (userId && pushToken) {
      savePushTokenToFirestore(userId, pushToken);
    }
  }, [userId, pushToken]);

  return {
    pushToken,
    isPermissionGranted,
    requestPermission,
    clearPushToken,
  };
}

export default useNotifications;
