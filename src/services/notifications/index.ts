import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { addBreadcrumb } from '../sentry';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Notification types
export type NotificationType =
  | 'new_offer'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'new_message'
  | 'event_reminder'
  | 'event_update'
  | 'event_revision_request'
  | 'event_revision_approved'
  | 'event_revision_rejected'
  | 'contract_signed'
  | 'payment_received'
  | 'review_request'
  | 'system';

export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: {
    eventId?: string;
    offerId?: string;
    conversationId?: string;
    contractId?: string;
    screen?: string;
    params?: Record<string, string>;
  };
}

/**
 * Request notification permissions and get the push token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  // Check if running on a physical device
  if (!Device.isDevice) {
    console.log('[Notifications] Push notifications require a physical device');
    return null;
  }

  // Check if platform is supported
  if (Platform.OS === 'android') {
    // Set up Android notification channel
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Varsayilan',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7c3aed',
    });

    // Additional channels
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Mesajlar',
      description: 'Yeni mesaj bildirimleri',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7c3aed',
    });

    await Notifications.setNotificationChannelAsync('offers', {
      name: 'Teklifler',
      description: 'Teklif bildirimleri',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7c3aed',
    });

    await Notifications.setNotificationChannelAsync('events', {
      name: 'Etkinlikler',
      description: 'Etkinlik hatirlatmalari ve guncellemeleri',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7c3aed',
    });
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Notifications] Permission not granted');
    return null;
  }

  try {
    // Get the Expo push token
    const response = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-eas-project-id', // Replace with your EAS project ID
    });
    token = response.data;

    addBreadcrumb({
      category: 'notifications',
      message: 'Push token obtained',
      level: 'info',
    });

    console.log('[Notifications] Push token:', token);
  } catch (error) {
    console.error('[Notifications] Error getting push token:', error);
  }

  return token;
}

/**
 * Save the push token to Firestore for the given user
 */
export async function savePushTokenToFirestore(
  userId: string,
  token: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      expoPushToken: token,
      pushTokenUpdatedAt: new Date(),
      devicePlatform: Platform.OS,
    });

    addBreadcrumb({
      category: 'notifications',
      message: 'Push token saved to Firestore',
      level: 'info',
      data: { userId },
    });
  } catch (error) {
    console.error('[Notifications] Error saving push token:', error);
  }
}

/**
 * Remove push token from Firestore (on logout)
 */
export async function removePushTokenFromFirestore(userId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      expoPushToken: null,
      pushTokenUpdatedAt: new Date(),
    });
  } catch (error) {
    console.error('[Notifications] Error removing push token:', error);
  }
}

/**
 * Get the channel for a notification type (Android only)
 */
function getNotificationChannel(type: NotificationType): string {
  switch (type) {
    case 'new_message':
      return 'messages';
    case 'new_offer':
    case 'offer_accepted':
    case 'offer_rejected':
      return 'offers';
    case 'event_reminder':
    case 'event_update':
    case 'event_revision_request':
    case 'event_revision_approved':
    case 'event_revision_rejected':
      return 'events';
    default:
      return 'default';
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  notification: NotificationData,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
  const content: Notifications.NotificationContentInput = {
    title: notification.title,
    body: notification.body,
    data: notification.data,
    sound: true,
  };

  const scheduleOptions: Notifications.NotificationRequestInput = {
    content,
    trigger: trigger || null, // null = immediate
  };

  // Add Android channel if on Android
  if (Platform.OS === 'android') {
    (scheduleOptions as any).channelId = getNotificationChannel(notification.type);
  }

  return Notifications.scheduleNotificationAsync(scheduleOptions);
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(
  notificationId: string
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get the badge count
 */
export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

/**
 * Set the badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear the badge
 */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

/**
 * Get all pending notifications
 */
export async function getPendingNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Dismiss all notifications from the notification center
 */
export async function dismissAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

// Notification response handler type
export type NotificationResponseHandler = (
  response: Notifications.NotificationResponse
) => void;

// Notification received handler type
export type NotificationReceivedHandler = (
  notification: Notifications.Notification
) => void;

/**
 * Add a listener for notification received (foreground)
 */
export function addNotificationReceivedListener(
  handler: NotificationReceivedHandler
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(handler);
}

/**
 * Add a listener for notification response (user tapped)
 */
export function addNotificationResponseReceivedListener(
  handler: NotificationResponseHandler
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

/**
 * Remove a notification listener
 */
export function removeNotificationSubscription(
  subscription: Notifications.Subscription
): void {
  subscription.remove();
}

// ============================================
// REVISION NOTIFICATION HELPERS
// ============================================

/**
 * Send a local notification for event revision request
 * This notifies providers about pending revision approvals
 */
export async function sendRevisionRequestNotification(
  eventTitle: string,
  revisionType: string,
  eventId: string,
  revisionId: string
): Promise<string> {
  const typeLabels: Record<string, string> = {
    date: 'Tarih Değişikliği',
    venue: 'Mekan Değişikliği',
    budget: 'Bütçe Güncelleme',
    other: 'Değişiklik Talebi',
  };

  return scheduleLocalNotification({
    type: 'event_update',
    title: 'Etkinlik Değişiklik Talebi',
    body: `"${eventTitle}" etkinliği için ${typeLabels[revisionType] || 'değişiklik'} talebi var. Onayınız bekleniyor.`,
    data: {
      eventId,
      screen: 'ProviderEventDetail',
      params: { eventId, revisionId },
    },
  });
}

/**
 * Send a notification when revision is approved by a provider
 */
export async function sendRevisionApprovedNotification(
  eventTitle: string,
  providerName: string,
  isFullyApproved: boolean,
  eventId: string
): Promise<string> {
  return scheduleLocalNotification({
    type: 'event_update',
    title: isFullyApproved ? 'Değişiklik Onaylandı' : 'Tedarikçi Onayı',
    body: isFullyApproved
      ? `"${eventTitle}" için değişiklik tüm tedarikçiler tarafından onaylandı.`
      : `${providerName} "${eventTitle}" için değişikliği onayladı.`,
    data: {
      eventId,
      screen: 'OrganizerEventDetail',
      params: { eventId },
    },
  });
}

/**
 * Send a notification when revision is rejected by a provider
 */
export async function sendRevisionRejectedNotification(
  eventTitle: string,
  providerName: string,
  eventId: string,
  comment?: string
): Promise<string> {
  return scheduleLocalNotification({
    type: 'event_update',
    title: 'Değişiklik Reddedildi',
    body: `${providerName} "${eventTitle}" için değişikliği reddetti.${comment ? ` Sebep: ${comment}` : ''}`,
    data: {
      eventId,
      screen: 'OrganizerEventDetail',
      params: { eventId },
    },
  });
}

// Export Notifications for advanced usage
export { Notifications };
