/**
 * Firestore Database Schema
 * Bu dosya veritabanı yapısını ve tip tanımlamalarını içerir.
 */

import { Timestamp } from 'firebase/firestore';

// ============================================
// BASE TYPES
// ============================================

export interface BaseDocument {
  id?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// USER SCHEMA
// ============================================

export interface UserDocument extends BaseDocument {
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'organizer' | 'provider' | 'dual';
  isProvider: boolean;
  isOrganizer: boolean;
  companyName?: string;
  phone?: string;
  address?: string;
  city?: string;
  bio?: string;
  website?: string;
  taxId?: string;
  providerServices?: string[]; // ['booking', 'technical', 'catering', etc.]
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Timestamp;
  settings: {
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
    currency: string;
  };
}

// ============================================
// PROVIDER SCHEMA
// ============================================

export interface ProviderDocument extends BaseDocument {
  userId: string;
  companyName: string;
  logo?: string;
  coverImage?: string;
  description: string;
  services: string[]; // Service categories
  portfolio: string[]; // Image URLs
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseRate: number;
  location: {
    city: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  workingHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  pricing: {
    minPrice: number;
    maxPrice: number;
    currency: string;
  };
  tags: string[];
  isVerified: boolean;
  isActive: boolean;
  isFeatured: boolean;
}

// ============================================
// ARTIST SCHEMA
// ============================================

export interface ArtistDocument extends BaseDocument {
  providerId?: string; // If managed by a provider
  name: string;
  stageName?: string;
  image: string;
  coverImage?: string;
  genre: string[];
  bio: string;
  nationality?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    spotify?: string;
    youtube?: string;
  };
  stats: {
    monthlyListeners?: number;
    followers?: number;
    rating: number;
    reviewCount: number;
  };
  pricing: {
    minPrice: number;
    maxPrice: number;
    currency: string;
  };
  availability: 'available' | 'limited' | 'unavailable';
  rider?: {
    technical: string[];
    hospitality: string[];
    other: string[];
  };
  isVerified: boolean;
  isFeatured: boolean;
}

// ============================================
// EVENT SCHEMA
// ============================================

export interface EventDocument extends BaseDocument {
  organizerId: string;
  title: string;
  description: string;
  image: string;
  images: string[];
  date: Timestamp;
  endDate?: Timestamp;
  venue: {
    name: string;
    address: string;
    city: string;
    capacity?: number;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  status: 'draft' | 'planning' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  category: string;
  budget: {
    estimated: number;
    spent: number;
    currency: string;
  };
  attendees: {
    expected: number;
    confirmed?: number;
  };
  services: EventService[];
  artists: EventArtist[];
  progress: number; // 0-100
  isPublic: boolean;
}

export interface EventService {
  id: string;
  category: string;
  providerId?: string;
  providerName?: string;
  providerPhone?: string;
  providerImage?: string;
  status: 'pending' | 'requested' | 'offered' | 'contract_pending' | 'confirmed' | 'completed';
  budget: number;
  notes?: string;
  offerId?: string;
  contractId?: string;
}

export interface EventArtist {
  id: string;
  artistId: string;
  artistName: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  fee: number;
  performanceTime?: string;
}

// ============================================
// OFFER SCHEMA
// ============================================

export interface OfferDocument extends BaseDocument {
  eventId: string;
  eventTitle: string;
  organizerId: string;
  organizerName: string;
  providerId: string;
  providerName: string;
  serviceCategory: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  amount: number;
  currency: string;
  description: string;
  scope: string[];
  validUntil: Timestamp;
  notes?: string;
  counterOffer?: {
    amount: number;
    description: string;
    createdAt: Timestamp;
  };
  messages: OfferMessage[];
}

export interface OfferMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Timestamp;
}

// ============================================
// CONTRACT SCHEMA
// ============================================

export interface ContractDocument extends BaseDocument {
  offerId: string;
  eventId: string;
  organizerId: string;
  providerId: string;
  title: string;
  amount: number;
  currency: string;
  paymentTerms: {
    type: 'full' | 'installment';
    schedule: PaymentSchedule[];
  };
  terms: string;
  status: 'draft' | 'pending_signature' | 'active' | 'completed' | 'cancelled';
  signatures: {
    organizer?: {
      signedAt: Timestamp;
      ipAddress?: string;
    };
    provider?: {
      signedAt: Timestamp;
      ipAddress?: string;
    };
  };
  documents: string[]; // PDF URLs
}

export interface PaymentSchedule {
  id: string;
  dueDate: Timestamp;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: Timestamp;
}

// ============================================
// MESSAGE SCHEMA
// ============================================

export interface ConversationDocument extends BaseDocument {
  participants: string[]; // User IDs
  participantNames: { [userId: string]: string };
  participantPhotos: { [userId: string]: string };
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
  };
  unreadCount: { [userId: string]: number };
  eventId?: string;
  eventTitle?: string;
  isArchived: boolean;
}

export interface MessageDocument extends BaseDocument {
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  type: 'text' | 'image' | 'file' | 'offer' | 'system';
  attachments?: {
    url: string;
    type: string;
    name: string;
  }[];
  metadata?: {
    offerId?: string;
    offerAmount?: number;
    eventId?: string;
  };
  isRead: boolean;
}

// ============================================
// REVIEW SCHEMA
// ============================================

export interface ReviewDocument extends BaseDocument {
  eventId: string;
  eventTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerPhoto?: string;
  targetId: string; // Provider or Artist ID
  targetType: 'provider' | 'artist';
  rating: number; // 1-5
  text: string;
  categories?: {
    communication: number;
    quality: number;
    punctuality: number;
    value: number;
  };
  response?: {
    text: string;
    createdAt: Timestamp;
  };
  isVerified: boolean;
}

// ============================================
// NOTIFICATION SCHEMA
// ============================================

export interface NotificationDocument extends BaseDocument {
  userId: string;
  type: 'offer' | 'message' | 'event' | 'payment' | 'review' | 'system';
  title: string;
  body: string;
  data?: {
    eventId?: string;
    offerId?: string;
    conversationId?: string;
    providerId?: string;
  };
  isRead: boolean;
  readAt?: Timestamp;
}

// ============================================
// TRANSACTION SCHEMA
// ============================================

export interface TransactionDocument extends BaseDocument {
  userId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  description: string;
  eventId?: string;
  eventTitle?: string;
  contractId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  reference?: string;
}
