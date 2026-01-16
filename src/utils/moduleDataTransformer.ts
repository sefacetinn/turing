/**
 * Module Data Transformer
 *
 * Mevcut offer/venue/event verilerini modüler sisteme dönüştürür.
 */

import {
  VenueModuleData,
  DateTimeModuleData,
  BudgetModuleData,
  ParticipantModuleData,
  ContactModuleData,
  MediaModuleData,
  TeamModuleData,
  ModuleDataMap,
  RatingModuleData,
} from '../types/modules';

// Mevcut sistemdeki offer tipi
interface LegacyOffer {
  id: string;
  serviceCategory: string;
  eventTitle: string;
  role: string;
  eventDate: string;
  location: string;
  status: string;
  organizer: {
    id: string;
    name: string;
    image: string;
    rating?: number;
    reviewCount?: number;
  };
  counterOffer?: {
    amount: number;
    message?: string;
  };
}

// Mevcut sistemdeki venue tipi
interface LegacyVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  district?: string;
  capacity: number;
  indoorOutdoor: 'indoor' | 'outdoor' | 'mixed';
  venueType: string;
  stageWidth?: number;
  stageDepth?: number;
  stageHeight?: number;
  halls?: Array<{
    id: string;
    name: string;
    capacity: number;
    seatingType: string;
    stageWidth?: number;
    stageDepth?: number;
    stageHeight?: number;
    isMainHall?: boolean;
  }>;
  selectedHallId?: string;
  backstage?: {
    hasBackstage: boolean;
    roomCount?: number;
    hasMirror?: boolean;
    hasShower?: boolean;
    hasPrivateToilet?: boolean;
    cateringAvailable?: boolean;
    notes?: string;
  };
  hasSoundSystem?: boolean;
  hasLightingSystem?: boolean;
  hasParkingArea?: boolean;
  parkingCapacity?: number;
  images?: string[];
  contactName?: string;
  contactPhone?: string;
  rating?: number;
  reviewCount?: number;
}

// Mevcut sistemdeki event details tipi
interface LegacyEventDetails {
  ageLimit: string;
  participantType: string;
  concertTime: string;
  eventDuration: string;
  images: string[];
  socialMedia: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

/**
 * Venue verisini VenueModuleData formatına dönüştürür
 */
export function transformVenueData(venue: LegacyVenue): VenueModuleData {
  const selectedHall = venue.halls?.find(h => h.id === venue.selectedHallId);

  return {
    name: venue.name,
    address: venue.address,
    city: venue.city,
    district: venue.district,
    capacity: venue.capacity,
    indoorOutdoor: venue.indoorOutdoor,
    venueType: venue.venueType as VenueModuleData['venueType'],
    stageWidth: selectedHall?.stageWidth || venue.stageWidth,
    stageDepth: selectedHall?.stageDepth || venue.stageDepth,
    stageHeight: selectedHall?.stageHeight || venue.stageHeight,
    backstage: venue.backstage ? {
      hasBackstage: venue.backstage.hasBackstage,
      roomCount: venue.backstage.roomCount,
      hasMirror: venue.backstage.hasMirror,
      hasShower: venue.backstage.hasShower,
      hasPrivateToilet: venue.backstage.hasPrivateToilet,
      cateringAvailable: venue.backstage.cateringAvailable,
      notes: venue.backstage.notes,
    } : undefined,
    halls: venue.halls?.map(h => ({
      id: h.id,
      name: h.name,
      capacity: h.capacity,
      seatingType: h.seatingType as 'standing' | 'seated' | 'mixed',
      stageWidth: h.stageWidth,
      stageDepth: h.stageDepth,
      stageHeight: h.stageHeight,
      isMainHall: h.isMainHall,
    })),
    images: venue.images,
    parkingCapacity: venue.parkingCapacity,
    hasSoundSystem: venue.hasSoundSystem,
    hasLightingSystem: venue.hasLightingSystem,
    hasParkingArea: venue.hasParkingArea,
    contactName: venue.contactName,
    contactPhone: venue.contactPhone,
    rating: venue.rating,
    reviewCount: venue.reviewCount,
  };
}

/**
 * Event tarih/saat verisini DateTimeModuleData formatına dönüştürür
 */
export function transformDateTimeData(
  offer: LegacyOffer,
  eventDetails: LegacyEventDetails
): DateTimeModuleData {
  return {
    eventDate: offer.eventDate,
    eventTime: eventDetails.concertTime,
    duration: eventDetails.eventDuration,
  };
}

/**
 * Bütçe verisini BudgetModuleData formatına dönüştürür
 */
export function transformBudgetData(
  organizerBudget: number | null,
  counterOffer?: { amount: number; message?: string }
): BudgetModuleData {
  return {
    organizerBudget: organizerBudget || undefined,
    currency: 'TRY',
    isNegotiable: true,
  };
}

/**
 * Katılımcı verisini ParticipantModuleData formatına dönüştürür
 */
export function transformParticipantData(
  venue: LegacyVenue,
  eventDetails: LegacyEventDetails
): ParticipantModuleData {
  return {
    expectedCount: venue.capacity,
    maxCount: venue.capacity,
    ageLimit: eventDetails.ageLimit,
    participantType: eventDetails.participantType,
  };
}

/**
 * İletişim verisini ContactModuleData formatına dönüştürür
 */
export function transformContactData(
  venue: LegacyVenue,
  organizer: LegacyOffer['organizer'],
  socialMedia?: LegacyEventDetails['socialMedia']
): ContactModuleData {
  return {
    primaryContact: {
      name: organizer.name,
      phone: '+905329876543', // Mevcut sistemde hardcoded
      role: 'Organizatör',
    },
    secondaryContact: venue.contactName ? {
      name: venue.contactName,
      phone: venue.contactPhone || '',
      role: 'Mekan Yetkilisi',
    } : undefined,
    socialMedia: socialMedia ? {
      instagram: socialMedia.instagram,
      twitter: socialMedia.twitter,
      website: socialMedia.website,
    } : undefined,
  };
}

/**
 * Medya verisini MediaModuleData formatına dönüştürür
 */
export function transformMediaData(
  eventImages: string[],
  venueImages?: string[]
): MediaModuleData {
  return {
    images: [...eventImages, ...(venueImages || [])],
    videos: [],
  };
}

/**
 * Rating verisini RatingModuleData formatına dönüştürür
 */
export function transformRatingData(
  organizerRating?: number,
  organizerReviewCount?: number,
  venueRating?: number,
  venueReviewCount?: number
): RatingModuleData {
  // Use the higher rating or organizer rating as primary
  const rating = organizerRating || venueRating;
  const reviewCount = organizerReviewCount || venueReviewCount;

  return {
    overallRating: rating,
    reviewCount: reviewCount,
  };
}

/**
 * Tüm verileri ModuleDataMap formatına dönüştürür
 */
export function transformOfferToModuleData(
  offer: LegacyOffer,
  venue: LegacyVenue,
  eventDetails: LegacyEventDetails,
  organizerBudget: number | null
): Partial<ModuleDataMap> {
  return {
    venue: transformVenueData(venue),
    datetime: transformDateTimeData(offer, eventDetails),
    budget: transformBudgetData(organizerBudget, offer.counterOffer),
    participant: transformParticipantData(venue, eventDetails),
    contact: transformContactData(venue, offer.organizer, eventDetails.socialMedia),
    media: transformMediaData(eventDetails.images, venue.images),
    rating: transformRatingData(
      offer.organizer.rating,
      offer.organizer.reviewCount,
      venue.rating,
      venue.reviewCount
    ),
  };
}

/**
 * Hizmet kategorisine göre varsayılan modül listesini döndürür
 */
export function getModulesForCategory(category: string): string[] {
  const categoryModules: Record<string, string[]> = {
    booking: ['venue', 'datetime', 'participant', 'budget', 'contact', 'media'],
    technical: ['venue', 'datetime', 'equipment', 'budget', 'team', 'document'],
    venue: ['venue', 'datetime', 'budget', 'contact', 'media'],
    catering: ['venue', 'datetime', 'menu', 'participant', 'budget', 'team'],
    security: ['venue', 'datetime', 'team', 'participant', 'budget', 'checklist'],
    transport: ['logistics', 'vehicle', 'datetime', 'budget', 'contact'],
    accommodation: ['logistics', 'datetime', 'budget', 'contact'],
    medical: ['datetime', 'team', 'medical', 'budget'],
    decoration: ['venue', 'datetime', 'media', 'budget', 'team'],
    generator: ['venue', 'datetime', 'equipment', 'budget'],
    ticketing: ['datetime', 'ticketing', 'budget'],
    media: ['venue', 'datetime', 'media', 'budget', 'team'],
  };

  return categoryModules[category] || ['venue', 'datetime', 'budget', 'contact'];
}
