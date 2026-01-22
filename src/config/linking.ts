import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';

// URL scheme for the app
export const URL_SCHEME = 'turing';

// Create the prefix for deep links
export const linkingPrefix = Linking.createURL('/');

// Web domain for universal links
export const WEB_DOMAIN = 'app.turing.com';

/**
 * Deep linking configuration for React Navigation
 */
export const linkingConfig: LinkingOptions<any> = {
  prefixes: [
    linkingPrefix,
    `${URL_SCHEME}://`,
    `https://${WEB_DOMAIN}`,
    `http://${WEB_DOMAIN}`,
  ],
  config: {
    screens: {
      // Tab Navigators
      HomeTab: {
        screens: {
          HomeMain: 'home',
          Notifications: 'notifications',
          Search: 'search',
          ArtistDetail: 'artist/:artistId',
          ArtistProfile: 'artist-profile/:artistId',
          ProviderDetail: 'provider/:providerId',
          BookingProviderProfile: 'booking-provider/:providerId',
          CreateEvent: 'create-event',
          CalendarView: 'calendar',
        },
      },
      EventsTab: {
        screens: {
          EventsMain: 'events',
          EventDetail: 'event/:eventId',
          OrganizerEventDetail: 'organizer-event/:eventId',
          ProviderEventDetail: 'provider-event/:eventId',
        },
      },
      OffersTab: {
        screens: {
          OffersMain: 'offers',
          OfferDetail: 'offer/:offerId',
          ProviderRequestDetail: 'request/:requestId',
          Contract: 'contract/:contractId',
          Contracts: 'contracts',
          CompareOffers: 'compare-offers/:eventId',
        },
      },
      MessagesTab: {
        screens: {
          MessagesMain: 'messages',
          Chat: 'chat/:conversationId',
        },
      },
      ProfileTab: {
        screens: {
          ProfileMain: 'profile',
          Settings: 'settings',
          EditProfile: 'edit-profile',
          EditCompanyProfile: 'edit-company',
          Favorites: 'favorites',
          NotificationSettings: 'notification-settings',
          Security: 'security',
          PaymentMethods: 'payment-methods',
          Team: 'team',
          ProviderFinance: 'finance',
          AnalyticsDashboard: 'analytics',
        },
      },
      // Auth Screens (not in tabs)
      Login: 'login',
      ForgotPassword: 'forgot-password',
      RoleSelection: 'register',
      OrganizerRegistration: 'register/organizer',
      ProviderRegistration: 'register/provider',
      // Admin Screens
      AdminDashboard: 'admin',
      AdminUsers: 'admin/users',
      AdminUserDetail: 'admin/user/:userId',
      AdminEvents: 'admin/events',
      AdminEventDetail: 'admin/event/:eventId',
    },
  },
  // Custom function to get the initial URL
  async getInitialURL() {
    // Check if app was opened from a push notification
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response?.notification.request.content.data?.url) {
      return response.notification.request.content.data.url as string;
    }

    // Otherwise, check for standard deep link
    const url = await Linking.getInitialURL();
    return url;
  },
  // Subscribe to incoming links
  subscribe(listener) {
    // Listen for incoming links from deep linking
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });

    // Listen for links from push notifications
    const notificationSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const url = response.notification.request.content.data?.url;
        if (url && typeof url === 'string') {
          listener(url);
        }
      });

    return () => {
      linkingSubscription.remove();
      notificationSubscription.remove();
    };
  },
};

/**
 * Parse a deep link URL and extract route information
 */
export function parseDeepLink(url: string): {
  screen: string;
  params: Record<string, string>;
} | null {
  try {
    const { path, queryParams } = Linking.parse(url);

    if (!path) return null;

    // Route mapping
    const routes: Record<string, string> = {
      'event': 'EventDetail',
      'offer': 'OfferDetail',
      'chat': 'Chat',
      'artist': 'ArtistDetail',
      'provider': 'ProviderDetail',
      'contract': 'Contract',
      'profile': 'ProfileMain',
    };

    const segments = path.split('/').filter(Boolean);
    const routeType = segments[0];
    const id = segments[1];

    const screen = routes[routeType];
    if (!screen) return null;

    const params: Record<string, string> = {
      ...queryParams as Record<string, string>,
    };

    // Add ID param based on route type
    if (id) {
      switch (routeType) {
        case 'event':
          params.eventId = id;
          break;
        case 'offer':
          params.offerId = id;
          break;
        case 'chat':
          params.conversationId = id;
          break;
        case 'artist':
          params.artistId = id;
          break;
        case 'provider':
          params.providerId = id;
          break;
        case 'contract':
          params.contractId = id;
          break;
      }
    }

    return { screen, params };
  } catch (error) {
    console.error('[DeepLink] Error parsing URL:', error);
    return null;
  }
}

/**
 * Create a deep link URL for sharing
 */
export function createDeepLink(
  type: 'event' | 'offer' | 'artist' | 'provider' | 'contract' | 'chat',
  id: string,
  params?: Record<string, string>
): string {
  let url = `${URL_SCHEME}://${type}/${id}`;

  if (params && Object.keys(params).length > 0) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    url += `?${queryString}`;
  }

  return url;
}

/**
 * Create a web URL for universal links
 */
export function createWebLink(
  type: 'event' | 'offer' | 'artist' | 'provider' | 'contract' | 'chat',
  id: string,
  params?: Record<string, string>
): string {
  let url = `https://${WEB_DOMAIN}/${type}/${id}`;

  if (params && Object.keys(params).length > 0) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    url += `?${queryString}`;
  }

  return url;
}

export default linkingConfig;
