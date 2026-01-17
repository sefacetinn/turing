/**
 * Navigation Types
 * Tüm ekranlar ve parametreleri için tip tanımlamaları
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// ============================================
// ROOT STACK PARAMS
// ============================================

export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ProviderRegistration: undefined;

  // Main
  MainTabs: NavigatorScreenParams<MainTabParamList>;
};

// ============================================
// MAIN TAB PARAMS
// ============================================

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  EventsTab: NavigatorScreenParams<EventsStackParamList>;
  OffersTab: NavigatorScreenParams<OffersStackParamList>;
  MessagesTab: NavigatorScreenParams<MessagesStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// ============================================
// HOME STACK PARAMS
// ============================================

export type HomeStackParamList = {
  HomeMain: undefined;
  ArtistDetail: { artistId: string };
  ArtistProfile: { artistId: string };
  ProviderDetail: { providerId: string };
  Search: { initialFilter?: string };
  Notifications: undefined;
  CreateEvent: { step?: number };
  ServiceProviders: { category?: string; subcategory?: string };
  OperationSubcategories: { category: string };
  RequestOffer: { provider?: ProviderParam; category?: string };
  CategoryRequest: { category: string; provider?: ProviderParam };
  Chat: { conversationId: string };
  OfferDetail: { offerId: string };
  Contract: { offerId: string };
  ProviderEventDetail: { eventId: string };
  OrganizerEventDetail: { eventId: string };
  OrganizerProfile: { organizerId: string };
  PortfolioGallery: { providerId: string; initialIndex?: number };
  ProviderReviews: { providerId: string };
  ProviderFinance: undefined;
  EventOperations: { eventId: string };
  ServiceOperations: { eventId: string; serviceId: string };
  CalendarView: undefined;
};

// ============================================
// EVENTS STACK PARAMS
// ============================================

export type EventsStackParamList = {
  Events: undefined;
  OrganizerEventDetail: { eventId: string };
  ProviderEventDetail: { eventId: string };
  ServiceOperations: { eventId: string; serviceId: string };
  EventOperations: { eventId: string };
  CreateEvent: { step?: number };
  ProviderDetail: { providerId: string };
  Chat: { conversationId: string };
  CalendarView: undefined;
};

// ============================================
// OFFERS STACK PARAMS
// ============================================

export type OffersStackParamList = {
  Offers: undefined;
  OfferDetail: { offerId: string };
  ProviderRequestDetail: { requestId: string };
  OfferComparison: { eventId: string; serviceCategory: string };
  Contract: { offerId: string };
  ProviderDetail: { providerId: string };
  Chat: { conversationId: string };
};

// ============================================
// MESSAGES STACK PARAMS
// ============================================

export type MessagesStackParamList = {
  Messages: undefined;
  Chat: { conversationId: string };
  ProviderDetail: { providerId: string };
  OrganizerProfile: { organizerId: string };
};

// ============================================
// PROFILE STACK PARAMS
// ============================================

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  EditCompanyProfile: undefined;
  Settings: undefined;
  ProviderFinance: undefined;
  MyReviews: undefined;
  Favorites: undefined;
  ProviderArtistRoster: undefined;
  AddArtist: { artistId?: string };
  SetupServicesHub: undefined;
  AccountSettings: undefined;
  ProviderProfileCompletion: undefined;
};

// ============================================
// NAVIGATION PROPS
// ============================================

// Combined navigation prop that works across all stacks
export type AppNavigationProp = NativeStackNavigationProp<
  HomeStackParamList & EventsStackParamList & OffersStackParamList & MessagesStackParamList & ProfileStackParamList
>;

// Individual stack navigation props
export type HomeStackNavigationProp = NativeStackNavigationProp<HomeStackParamList>;
export type EventsStackNavigationProp = NativeStackNavigationProp<EventsStackParamList>;
export type OffersStackNavigationProp = NativeStackNavigationProp<OffersStackParamList>;
export type MessagesStackNavigationProp = NativeStackNavigationProp<MessagesStackParamList>;
export type ProfileStackNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

// Tab navigation prop
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

// ============================================
// HELPER TYPES
// ============================================

// Provider parameter type (used in multiple screens)
export interface ProviderParam {
  id: string;
  name: string;
  category?: string;
  subCategory?: string;
  rating?: number;
  image?: string;
}

// Route params helper
export type RouteParams<T extends keyof HomeStackParamList> = HomeStackParamList[T];

// ============================================
// CUSTOM TAB BAR TYPES
// ============================================

export interface TabBarState {
  index: number;
  routes: Array<{
    key: string;
    name: keyof MainTabParamList;
    params?: object;
  }>;
}

export interface TabBarDescriptor {
  options: {
    tabBarLabel?: string;
    tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
    tabBarBadge?: string | number;
  };
}

export interface TabBarDescriptors {
  [key: string]: TabBarDescriptor;
}

export interface CustomTabBarProps {
  state: TabBarState;
  descriptors: TabBarDescriptors;
  navigation: MainTabNavigationProp;
}
