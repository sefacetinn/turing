// View Types
export type ViewType =
  | 'home'
  | 'browse'
  | 'create'
  | 'events'
  | 'offers'
  | 'profile'
  | 'service-list'
  | 'messages'
  | 'calendar'
  | 'notifications'
  | 'provider-artist-roster'
  | 'add-artist'
  | 'reviews'
  | 'provider-profile-completion'
  | 'setup-services-hub'
  | 'account-settings'
  | 'provider-detail'
  | 'offer-detail'
  | 'event-detail';

// Service Categories
export type ServiceCategory =
  | 'booking'
  | 'technical'
  | 'accommodation'
  | 'venue'
  | 'flight'
  | 'transport'
  | 'operation';

// Operation Sub-categories
export type OperationSubCategory =
  | 'security'
  | 'catering'
  | 'generator'
  | 'beverage'
  | 'medical'
  | 'sanitation'
  | 'media'
  | 'barrier'
  | 'tent'
  | 'ticketing'
  | 'decoration'
  | 'production';

// Artist Interface
export interface Artist {
  id: string;
  name: string;
  image?: string;
  genre?: string;
  flightRiderFile?: string;
  flightRiderSize?: string;
  flightRiderDate?: string;
  flightRiderUrl?: string;
  technicalRiderFile?: string;
  technicalRiderSize?: string;
  technicalRiderDate?: string;
  technicalRiderUrl?: string;
  accommodationRiderFile?: string;
  accommodationRiderSize?: string;
  accommodationRiderDate?: string;
  accommodationRiderUrl?: string;
  transportRiderFile?: string;
  transportRiderSize?: string;
  transportRiderDate?: string;
  transportRiderUrl?: string;
}

// Provider Interface
export interface Provider {
  id: string;
  name: string;
  category: ServiceCategory;
  subCategory?: OperationSubCategory;
  image?: string;
  rating: number;
  reviewCount: number;
  location: string;
  description?: string;
  verified: boolean;
  priceRange?: string;
  services?: string[];
}

// Event Interface
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  city: string;
  district: string;
  venue: string;
  status: 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled';
  budget?: number;
  artistId?: string;
  artistName?: string;
  services: EventService[];
}

// Event Service
export interface EventService {
  id: string;
  category: ServiceCategory;
  subCategory?: OperationSubCategory;
  providerId?: string;
  providerName?: string;
  status: 'pending' | 'requested' | 'offered' | 'confirmed' | 'completed';
  budget?: number;
}

// Offer Interface
export interface Offer {
  id: string;
  eventId: string;
  eventTitle: string;
  providerId: string;
  providerName: string;
  category: ServiceCategory;
  subCategory?: OperationSubCategory;
  status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired';
  amount: number;
  description: string;
  createdAt: string;
  expiresAt: string;
}

// Navigation State
export interface NavigationState {
  view: ViewType;
  scrollPosition: number;
  data?: Record<string, unknown>;
}

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  isProvider: boolean;
  providerCategory?: ServiceCategory;
  providerSubCategory?: OperationSubCategory;
  companyName?: string;
  location?: string;
  verified: boolean;
}

// Message Interface
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Notification Interface
export interface Notification {
  id: string;
  type: 'offer' | 'event' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Category Config
export interface CategoryConfig {
  id: ServiceCategory;
  name: string;
  icon: string;
  gradient: string;
  description: string;
}

// Operation Category Config
export interface OperationCategoryConfig {
  id: OperationSubCategory;
  name: string;
  icon: string;
  description: string;
}

// ============================================
// Quote Request Requirement Types
// ============================================

// Booking (Sanatçı/DJ) Requirements
export interface BookingRequirements {
  eventType: string;
  venueType: string;
  guestCount: string;
  duration: string;
  setCount: string;
  soundSystem: boolean;
  accommodation: boolean;
  travel: boolean;
  backstageNeeds: string;
}

// Technical (Teknik) Requirements
export interface TechnicalRequirements {
  indoorOutdoor: string;
  venueSize: string;
  soundRequirements: string[];
  lightingRequirements: string[];
  stageSize: string;
  powerAvailable: string;
  setupTime: string;
}

// Venue (Mekan) Requirements
export interface VenueRequirements {
  venueStyle: string;
  venueCapacity: string;
  indoorOutdoor: string;
  cateringIncluded: boolean;
  parkingNeeded: boolean;
  accessibilityNeeded: boolean;
}

// Transport (Ulaşım) Requirements
export interface TransportRequirements {
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  passengerCount: string;
  vehicleType: string;
  returnTrip: boolean;
}

// Accommodation (Konaklama) Requirements
export interface AccommodationRequirements {
  checkInDate: string;
  checkOutDate: string;
  roomCount: string;
  roomType: string;
  starRating: string;
  breakfastIncluded: boolean;
}

// Flight (Uçuş) Requirements
export interface FlightRequirements {
  departureCity: string;
  arrivalCity: string;
  passengerCount: string;
  flightClass: string;
  baggageNeeds: string;
  roundTrip: boolean;
}

// Security (Güvenlik) Requirements
export interface SecurityRequirements {
  guardCount: string;
  shiftHours: string;
  securityAreas: string[];
  armedSecurity: boolean;
}

// Catering Requirements
export interface CateringRequirements {
  guestCount: string;
  mealType: string[];
  serviceStyle: string;
  dietaryRestrictions: string[];
}

// Generator (Jeneratör) Requirements
export interface GeneratorRequirements {
  powerRequirement: string;
  generatorDuration: string;
  backupNeeded: boolean;
}

// Beverage (İçecek) Requirements
export interface BeverageRequirements {
  barType: string;
  beverageTypes: string[];
  guestCount: string;
  bartenderCount: string;
}

// Medical (Medikal) Requirements
export interface MedicalRequirements {
  medicalServices: string[];
  guestCount: string;
  duration: string;
  ambulanceStandby: boolean;
}

// Media (Medya) Requirements
export interface MediaRequirements {
  mediaServices: string[];
  duration: string;
  deliveryFormat: string[];
}

// Barrier (Bariyer) Requirements
export interface BarrierRequirements {
  barrierType: string;
  barrierLength: string;
  duration: string;
}

// Tent (Çadır) Requirements
export interface TentRequirements {
  tentType: string;
  tentSize: string;
  tentFeatures: string[];
}

// Ticketing (Biletleme) Requirements
export interface TicketingRequirements {
  ticketCapacity: string;
  ticketTypes: string[];
  ticketTech: string[];
}

// Decoration (Dekorasyon) Requirements
export interface DecorationRequirements {
  decorTheme: string;
  decorAreas: string[];
  guestCount: string;
  floralsNeeded: boolean;
}

// Production (Prodüksiyon) Requirements
export interface ProductionRequirements {
  productionServices: string[];
  eventType: string;
  crewSize: string;
  duration: string;
}

// Union type for all requirements
export type CategoryRequirements =
  | BookingRequirements
  | TechnicalRequirements
  | VenueRequirements
  | TransportRequirements
  | AccommodationRequirements
  | FlightRequirements
  | SecurityRequirements
  | CateringRequirements
  | GeneratorRequirements
  | BeverageRequirements
  | MedicalRequirements
  | MediaRequirements
  | BarrierRequirements
  | TentRequirements
  | TicketingRequirements
  | DecorationRequirements
  | ProductionRequirements;

// Quote Request Interface
export interface QuoteRequest {
  id: string;
  eventId: string;
  eventTitle: string;
  category: ServiceCategory | OperationSubCategory;
  eventDate: string;
  budget: string;
  notes: string;
  requirements: CategoryRequirements;
  organizerName: string;
  organizerImage: string;
  createdAt: string;
  status: 'pending' | 'offered' | 'accepted' | 'rejected';
}

// ============================================
// Navigation Types
// ============================================

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

// Root Tab Navigator Params
export type RootTabParamList = {
  HomeTab: undefined;
  EventsTab: undefined;
  OffersTab: undefined;
  MessagesTab: undefined;
  ProfileTab: undefined;
};

// Home Stack Params
export type HomeStackParamList = {
  HomeMain: undefined;
  ArtistDetail: { artistId: string };
  ProviderDetail: { providerId: string; category?: ServiceCategory };
  Search: { initialQuery?: string };
  Notifications: undefined;
  CreateEvent: undefined;
  ServiceProviders: { category: ServiceCategory | OperationSubCategory };
  OperationSubcategories: undefined;
  RequestOffer: { providerId: string; category: ServiceCategory };
  CategoryRequest: { category: ServiceCategory | OperationSubCategory; eventId?: string };
  Chat: { chatId: string; recipientName: string };
};

// Events Stack Params
export type EventsStackParamList = {
  EventsMain: undefined;
  EventDetail: { eventId: string };
  OrganizerEventDetail: { eventId: string };
  ProviderEventDetail: { eventId: string };
  CalendarView: undefined;
  ProviderDetail: { providerId: string; category?: ServiceCategory };
  CreateEvent: undefined;
  ServiceProviders: { category: ServiceCategory | OperationSubCategory };
  Chat: { chatId: string; recipientName: string };
};

// Offers Stack Params
export type OffersStackParamList = {
  OffersMain: undefined;
  OfferDetail: { offerId: string };
  Contract: { contractId: string };
  Contracts: undefined;
};

// Messages Stack Params
export type MessagesStackParamList = {
  MessagesMain: undefined;
  Chat: { chatId: string; recipientName: string };
};

// Profile Stack Params
export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  EditProfile: undefined;
  Favorites: undefined;
  NotificationSettings: undefined;
  Security: undefined;
  PaymentMethods: undefined;
  HelpSupport: undefined;
  About: undefined;
  ArtistDetail: { artistId: string };
  ProviderDetail: { providerId: string; category?: ServiceCategory };
  AddCard: undefined;
  ChangePassword: undefined;
  QuietHours: undefined;
  ProviderServices: undefined;
  Chat: { chatId: string; recipientName: string };
  Contract: { contractId: string };
  Contracts: undefined;
  Language: undefined;
  Currency: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
  ContactSupport: undefined;
};

// Navigation Props Types
export type HomeStackNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

export type EventsStackNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<EventsStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

export type OffersStackNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<OffersStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

export type MessagesStackNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MessagesStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

export type ProfileStackNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

// Route Props Types
export type ArtistDetailRouteProp = RouteProp<HomeStackParamList, 'ArtistDetail'>;
export type ProviderDetailRouteProp = RouteProp<HomeStackParamList, 'ProviderDetail'>;
export type EventDetailRouteProp = RouteProp<EventsStackParamList, 'EventDetail'>;
export type OfferDetailRouteProp = RouteProp<OffersStackParamList, 'OfferDetail'>;
export type ChatRouteProp = RouteProp<HomeStackParamList, 'Chat'>;
export type ServiceProvidersRouteProp = RouteProp<HomeStackParamList, 'ServiceProviders'>;
export type CategoryRequestRouteProp = RouteProp<HomeStackParamList, 'CategoryRequest'>;
export type ContractRouteProp = RouteProp<OffersStackParamList, 'Contract'>;
