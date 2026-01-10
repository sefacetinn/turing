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
