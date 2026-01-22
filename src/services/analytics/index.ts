import analytics from '@react-native-firebase/analytics';

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

/**
 * Initialize analytics (call in App.tsx)
 */
export async function initializeAnalytics(): Promise<void> {
  try {
    // Enable analytics collection
    await analytics().setAnalyticsCollectionEnabled(true);
    console.log('[Analytics] Initialized');
  } catch (error) {
    console.error('[Analytics] Initialization error:', error);
  }
}

/**
 * Set user properties for segmentation
 */
export async function setUserProperties(properties: UserProperties): Promise<void> {
  try {
    if (properties.user_id) {
      await analytics().setUserId(properties.user_id);
    }

    // Set individual user properties
    const { user_id, ...otherProperties } = properties;

    for (const [key, value] of Object.entries(otherProperties)) {
      if (value !== undefined) {
        const stringValue = Array.isArray(value)
          ? value.join(',')
          : String(value);
        await analytics().setUserProperty(key, stringValue);
      }
    }
  } catch (error) {
    console.error('[Analytics] Error setting user properties:', error);
  }
}

/**
 * Clear user properties on logout
 */
export async function clearUserProperties(): Promise<void> {
  try {
    await analytics().setUserId(null);
    await analytics().resetAnalyticsData();
  } catch (error) {
    console.error('[Analytics] Error clearing user properties:', error);
  }
}

/**
 * Log a screen view
 */
export async function logScreenView(
  screenName: string,
  screenClass?: string
): Promise<void> {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    console.error('[Analytics] Error logging screen view:', error);
  }
}

/**
 * Log a custom event
 */
export async function logEvent(
  eventName: AnalyticsEventType,
  params?: Record<string, any>
): Promise<void> {
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.error('[Analytics] Error logging event:', error);
  }
}

// Pre-defined event logging functions

/**
 * Log user login
 */
export async function logLogin(method: 'email' | 'google' | 'apple' | 'biometric'): Promise<void> {
  await analytics().logLogin({ method });
}

/**
 * Log user sign up
 */
export async function logSignUp(method: 'email' | 'google' | 'apple'): Promise<void> {
  await analytics().logSignUp({ method });
}

/**
 * Log search
 */
export async function logSearch(searchTerm: string): Promise<void> {
  await analytics().logSearch({ search_term: searchTerm });
}

/**
 * Log content selection
 */
export async function logSelectContent(
  contentType: string,
  itemId: string
): Promise<void> {
  await analytics().logSelectContent({
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
  await analytics().logViewItem({
    items: [
      {
        item_id: itemId,
        item_name: itemName,
        item_category: itemCategory,
      },
    ],
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
  await analytics().logShare({
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

// Export analytics instance for advanced usage
export { analytics };
