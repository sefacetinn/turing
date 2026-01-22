/**
 * Analytics Service
 *
 * Expo Go compatible analytics implementation.
 * Logs events to console in development.
 * Can be extended to use Firebase Analytics in production builds.
 */

// Event types for type safety
export type AnalyticsEventType =
  | 'screen_view'
  | 'login'
  | 'sign_up'
  | 'logout'
  | 'search'
  | 'share'
  | 'select_content'
  | 'view_item'
  | 'add_to_favorites'
  | 'remove_from_favorites'
  | 'create_event'
  | 'send_offer'
  | 'accept_offer'
  | 'reject_offer'
  | 'send_message'
  | 'view_profile'
  | 'edit_profile'
  | 'toggle_mode'
  | 'view_contract'
  | 'sign_contract'
  | 'payment_initiated'
  | 'payment_completed'
  | 'error';

// User properties
export interface UserProperties {
  user_id?: string;
  user_role?: 'organizer' | 'provider' | 'dual';
  is_provider?: boolean;
  is_organizer?: boolean;
  provider_services?: string[];
  city?: string;
  is_verified?: boolean;
  app_version?: string;
  preferred_mode?: 'organizer' | 'provider';
}

// Store user properties in memory for logging context
let currentUserProperties: UserProperties = {};

const isDev = __DEV__;

/**
 * Initialize analytics (call in App.tsx)
 */
export async function initializeAnalytics(): Promise<void> {
  if (isDev) {
    console.log('[Analytics] Initialized (development mode - console logging only)');
  }
}

/**
 * Set user properties for segmentation
 */
export async function setUserProperties(properties: UserProperties): Promise<void> {
  currentUserProperties = { ...currentUserProperties, ...properties };
  if (isDev) {
    console.log('[Analytics] User properties set:', properties);
  }
}

/**
 * Clear user properties on logout
 */
export async function clearUserProperties(): Promise<void> {
  currentUserProperties = {};
  if (isDev) {
    console.log('[Analytics] User properties cleared');
  }
}

/**
 * Log a screen view
 */
export async function logScreenView(
  screenName: string,
  screenClass?: string
): Promise<void> {
  if (isDev) {
    console.log('[Analytics] Screen view:', screenName, screenClass || '');
  }
}

/**
 * Log a custom event
 */
export async function logEvent(
  eventName: AnalyticsEventType,
  params?: Record<string, any>
): Promise<void> {
  if (isDev) {
    console.log('[Analytics] Event:', eventName, params || {});
  }
}

// Pre-defined event logging functions

/**
 * Log user login
 */
export async function logLogin(method: 'email' | 'google' | 'apple' | 'biometric'): Promise<void> {
  await logEvent('login', { method });
}

/**
 * Log user sign up
 */
export async function logSignUp(method: 'email' | 'google' | 'apple'): Promise<void> {
  await logEvent('sign_up', { method });
}

/**
 * Log search
 */
export async function logSearch(searchTerm: string): Promise<void> {
  await logEvent('search', { search_term: searchTerm });
}

/**
 * Log content selection
 */
export async function logSelectContent(
  contentType: string,
  itemId: string
): Promise<void> {
  await logEvent('select_content', {
    content_type: contentType,
    item_id: itemId,
  });
}

/**
 * Log item view
 */
export async function logViewItem(
  itemId: string,
  itemName: string,
  itemCategory: string
): Promise<void> {
  await logEvent('view_item', {
    item_id: itemId,
    item_name: itemName,
    item_category: itemCategory,
  });
}

/**
 * Log share
 */
export async function logShare(
  contentType: string,
  itemId: string,
  method: string
): Promise<void> {
  await logEvent('share', {
    content_type: contentType,
    item_id: itemId,
    method,
  });
}

// App-specific event logging

/**
 * Log event creation
 */
export async function logCreateEvent(eventData: {
  eventId: string;
  eventType: string;
  hasServices: boolean;
  serviceCount: number;
}): Promise<void> {
  await logEvent('create_event', eventData);
}

/**
 * Log offer sent
 */
export async function logSendOffer(offerData: {
  offerId: string;
  eventId: string;
  serviceType: string;
  amount: number;
}): Promise<void> {
  await logEvent('send_offer', offerData);
}

/**
 * Log offer acceptance
 */
export async function logAcceptOffer(offerData: {
  offerId: string;
  eventId: string;
  serviceType: string;
  amount: number;
}): Promise<void> {
  await logEvent('accept_offer', offerData);
}

/**
 * Log offer rejection
 */
export async function logRejectOffer(offerData: {
  offerId: string;
  eventId: string;
  reason?: string;
}): Promise<void> {
  await logEvent('reject_offer', offerData);
}

/**
 * Log message sent
 */
export async function logSendMessage(messageData: {
  conversationId: string;
  messageType: 'text' | 'image' | 'file';
}): Promise<void> {
  await logEvent('send_message', messageData);
}

/**
 * Log mode toggle (organizer/provider)
 */
export async function logToggleMode(newMode: 'organizer' | 'provider'): Promise<void> {
  await logEvent('toggle_mode', { new_mode: newMode });
}

/**
 * Log error for analytics
 */
export async function logError(errorData: {
  error_type: string;
  error_message: string;
  screen?: string;
}): Promise<void> {
  await logEvent('error', errorData);
}

/**
 * Log add to favorites
 */
export async function logAddToFavorites(itemData: {
  itemId: string;
  itemType: 'artist' | 'provider' | 'venue';
}): Promise<void> {
  await logEvent('add_to_favorites', itemData);
}

/**
 * Log remove from favorites
 */
export async function logRemoveFromFavorites(itemData: {
  itemId: string;
  itemType: 'artist' | 'provider' | 'venue';
}): Promise<void> {
  await logEvent('remove_from_favorites', itemData);
}

// Mock analytics object for compatibility
export const analytics = () => ({
  logEvent: logEvent,
  logScreenView: logScreenView,
  setUserId: async (id: string | null) => {
    if (id) {
      currentUserProperties.user_id = id;
    } else {
      delete currentUserProperties.user_id;
    }
  },
  setUserProperty: async (name: string, value: string | null) => {
    if (value !== null) {
      (currentUserProperties as any)[name] = value;
    }
  },
  setAnalyticsCollectionEnabled: async (_enabled: boolean) => {},
  resetAnalyticsData: async () => {
    currentUserProperties = {};
  },
});
