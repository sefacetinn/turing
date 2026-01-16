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

// Service Categories (Ana Hizmet Kategorileri - 6 adet)
export type ServiceCategory =
  | 'booking'        // Sanatçı / Booking
  | 'technical'      // Teknik Ekipman
  | 'accommodation'  // Konaklama
  | 'venue'          // Mekan
  | 'transport'      // Ulaşım
  | 'operation';     // Operasyon (alt kategorileri var: güvenlik, catering, uçuş, vb.)

// ============================================
// TEKLİF DURUM TİPLERİ (OFFER STATUS TYPES)
// ============================================
/**
 * Teklif Durumları:
 * - pending: Beklemede (provider teklif verdi, organizatör yanıt bekliyor)
 * - counter_offered: Pazarlık sürecinde (karşı teklif yapıldı)
 * - accepted: Onaylandı (karşılıklı kabul edildi)
 * - rejected: Reddedildi
 * - expired: Süresi doldu
 * - cancelled: İptal edildi
 */
export type OfferStatus =
  | 'pending'           // Beklemede - yanıt bekleniyor
  | 'counter_offered'   // Pazarlık sürecinde - karşı teklif yapıldı
  | 'accepted'          // Onaylandı - karşılıklı kabul edildi
  | 'rejected'          // Reddedildi
  | 'expired'           // Süresi doldu
  | 'cancelled';        // İptal edildi

// Sekme tipleri
export type OfferTabType = 'active' | 'accepted' | 'rejected' | 'drafts';

// Operation Sub-categories (Operasyon Alt Kategorileri - 13 adet)
export type OperationSubCategory =
  | 'security'       // Güvenlik
  | 'catering'       // Catering
  | 'flight'         // Uçuş
  | 'generator'      // Jeneratör
  | 'beverage'       // İçecek
  | 'medical'        // Medikal
  | 'sanitation'     // Sanitasyon
  | 'media'          // Medya
  | 'barrier'        // Bariyer
  | 'tent'           // Çadır
  | 'ticketing'      // Biletleme
  | 'decoration'     // Dekorasyon
  | 'production';    // Prodüksiyon

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

// ============================================
// Review/Rating Types
// ============================================

// Review Interface
export interface Review {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;

  // Reviewer (who is writing the review)
  reviewerId: string;
  reviewerName: string;
  reviewerImage: string;
  reviewerType: 'organizer' | 'provider';

  // Reviewee (who is being reviewed)
  revieweeId: string;
  revieweeName: string;
  revieweeType: 'organizer' | 'provider';

  // Ratings
  overallRating: number; // 1-5
  detailedRatings?: {
    communication?: number;
    professionalism?: number;
    quality?: number;
    punctuality?: number;
    valueForMoney?: number;
    organization?: number;
    paymentReliability?: number;
    workingConditions?: number;
  };

  // Tags and Comment
  tags: string[];
  comment?: string;
  wouldWorkAgain: boolean;

  // Meta
  createdAt: string;
  serviceCategory?: string;
  isPublic: boolean;
}

// Pending Review Interface
export interface PendingReview {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventImage: string;
  targets: {
    id: string;
    name: string;
    image: string;
    type: 'provider' | 'organizer';
    serviceCategory?: string;
  }[];
  dueDate: string;
}

// Review Target (person/company being reviewed)
export interface ReviewTarget {
  id: string;
  name: string;
  image: string;
  type: 'provider' | 'organizer';
  serviceCategory?: string;
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

// ============================================
// Ticketing Management Types
// ============================================

// Platform for ticket sales
export interface TicketPlatform {
  id: string;
  name: string;
  logo?: string;
  ticketsSold: number;
  revenue: number;
  commission: number;
  email: string;
  isActive: boolean;
}

// Ticket category/price tier
export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  newPrice?: number;
  capacity: number;
  sold: number;
  remaining: number;
}

// Event ticketing data
export interface EventTicketing {
  isEnabled: boolean;
  capacity: number;
  totalSold: number;
  totalRevenue: number;
  occupancyRate: number;
  platforms: TicketPlatform[];
  categories: TicketCategory[];
}

// Scanned ticket for check-in
export interface ScannedTicket {
  id: string;
  ticketNumber: string;
  platform: string;
  platformLogo?: string;
  category: string;
  price: number;
  holderName: string;
  scannedAt: string;
  status: 'valid' | 'used' | 'invalid';
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

// Quote Request Interface (Enhanced for multi-offer system)
export interface QuoteRequest {
  id: string;
  eventId: string;
  eventTitle: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory | OperationSubCategory;
  type: 'open' | 'invited';           // Request type
  invitedProviders: string[];         // Provider IDs for invited type
  eventDate: string;
  deadline: string;                   // Response deadline
  budget: string;
  budgetMin?: number;
  budgetMax?: number;
  notes: string;
  requirements: CategoryRequirements;
  organizerName: string;
  organizerImage: string;
  createdAt: string;
  status: 'open' | 'closed' | 'awarded';
  offerCount: number;
  selectedOfferId?: string;
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
  PortfolioGallery: { images: string[]; initialIndex?: number; providerName?: string };
  ProviderReviews: { providerId: string; providerName: string; reviews: { id: string; name: string; avatar: string; rating: number; date: string; text: string; eventType: string; }[]; rating: number; reviewCount: number };
  ProviderFinance: undefined;
  EventOperations: { eventId: string };
  ServiceOperations: { eventId: string; serviceId: string; serviceCategory: ServiceCategory; serviceName: string; providerName: string };
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
  CategoryRequest: { category: ServiceCategory | OperationSubCategory; eventId?: string; provider?: { id: string; name: string; rating: number; image: string; } };
  Chat: { chatId: string; recipientName: string };
  PortfolioGallery: { images: string[]; initialIndex?: number; providerName?: string };
  ProviderReviews: { providerId: string; providerName: string; reviews: { id: string; name: string; avatar: string; rating: number; date: string; text: string; eventType: string; }[]; rating: number; reviewCount: number };
  EventOperations: { eventId: string };
  ServiceOperations: { eventId: string; serviceId: string; serviceCategory: ServiceCategory; serviceName: string; providerName: string };
};

// Offers Stack Params
export type OffersStackParamList = {
  OffersMain: undefined;
  OfferDetail: { offerId: string };
  CompareOffers: { quoteRequestId: string; serviceId?: string };
  Contract: { contractId: string };
  Contracts: undefined;
  EventOperations: { eventId: string };
  ServiceOperations: { eventId: string; serviceId: string; serviceCategory: ServiceCategory; serviceName: string; providerName: string };
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
  // Team/RBAC Screens
  Team: undefined;
  InviteMember: undefined;
  MemberDetail: { memberId: string };
  RolePermissions: { roleId: string };
  // Reviews
  MyReviews: undefined;
  // Gallery & Reviews
  PortfolioGallery: { images: string[]; initialIndex?: number; providerName?: string };
  ProviderReviews: { providerId: string; providerName: string; reviews: { id: string; name: string; avatar: string; rating: number; date: string; text: string; eventType: string; }[]; rating: number; reviewCount: number };
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
export type CompareOffersRouteProp = RouteProp<OffersStackParamList, 'CompareOffers'>;

// Re-export comparison types
export * from './comparison';

// Re-export RBAC types
export * from './rbac';

// Re-export Auth types
export * from './auth';

// Team/RBAC Navigation Types
export type TeamStackParamList = {
  TeamMain: undefined;
  InviteMember: undefined;
  MemberDetail: { memberId: string };
  RolePermissions: { roleId: string };
};

// Team Navigation Props
export type TeamStackNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<TeamStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

// Team Route Props
export type MemberDetailRouteProp = RouteProp<TeamStackParamList, 'MemberDetail'>;
export type RolePermissionsRouteProp = RouteProp<TeamStackParamList, 'RolePermissions'>;
