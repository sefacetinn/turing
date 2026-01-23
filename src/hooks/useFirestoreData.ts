/**
 * Firestore Data Hooks
 *
 * Custom hooks for fetching user-specific data from Firebase
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  limit,
  Timestamp,
  QueryConstraint,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../services/firebase/config';

// Types
export interface FirestoreEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  startTime?: string;
  endTime?: string;
  endDate?: string;
  city: string;
  district?: string;
  venue: string;
  venueAddress?: string;
  venueCapacity?: string;
  venueImage?: string;
  venuePhone?: string;
  status: 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled';
  organizerId: string;
  // Organizer info (populated by useProviderJobs)
  organizerName?: string;
  organizerImage?: string;
  organizerPhone?: string;
  // Organizer company info (new - company profile)
  organizerCompanyId?: string;
  organizerCompanyName?: string;
  organizerCompanyLogo?: string;
  organizerUserId?: string;      // Kişi ID (organizerId'den farklı olabilir)
  organizerUserName?: string;    // Kişi adı
  organizerUserRole?: string;    // Şirketteki rolü (Sahip, Yönetici vb.)
  providerIds?: string[]; // Providers assigned to this event
  artistId?: string;
  artistName?: string;
  artistImage?: string;
  image?: string;
  budget?: number;
  spent?: number; // Amount spent so far
  expectedAttendees?: number;
  attendees?: number; // Actual attendees count
  guestCount?: string;
  // Event type and category
  eventType?: string; // 'concert', 'festival', 'corporate', etc.
  category?: string;
  // Ticketing
  isTicketed?: boolean;
  ticketCapacity?: number;
  ticketsSold?: number;
  // Progress tracking
  progress?: number; // 0-100 percentage
  // Event detail fields
  ageLimit?: string; // 'all_ages', '18+', '21+'
  isAllAges?: boolean;
  seatingType?: string; // 'standing', 'seated', 'mixed'
  seatingArrangement?: string; // 'standing', 'seated', 'mixed'
  indoorOutdoor?: string; // 'indoor', 'outdoor', 'mixed'
  services?: EventService[];
  // Provider-specific: contract amount from accepted offer (populated by useProviderJobs)
  contractAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventService {
  id: string;
  category: string;
  name: string;
  provider?: string;
  providerId?: string;
  providerPhone?: string;
  providerImage?: string;
  status: 'pending' | 'confirmed' | 'contract_pending' | 'cancelled' | 'offered';
  price?: number;
  offerId?: string;
  contractId?: string;
  // Artist info for booking services (multiple artists per event supported)
  artistId?: string;
  artistName?: string;
  artistImage?: string;
}

export interface FirestoreOffer {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  eventCity?: string;
  eventDistrict?: string;
  eventVenue?: string;
  // Legacy fields (backward compatible)
  organizerId: string;
  organizerName: string;
  organizerImage?: string;
  organizerPhone?: string;
  providerId: string;
  providerName: string;
  providerImage?: string;
  providerPhone?: string;
  providerBio?: string;
  responseTime?: string;
  // Company-based fields (new)
  organizerCompanyId?: string;
  organizerCompanyName?: string;
  organizerCompanyLogo?: string;
  organizerUserId?: string;
  organizerUserName?: string;
  organizerUserRole?: string;
  providerCompanyId?: string;
  providerCompanyName?: string;
  providerCompanyLogo?: string;
  providerUserId?: string;
  providerUserName?: string;
  providerUserRole?: string;
  // For booking/artist requests
  artistId?: string;
  artistName?: string;
  artistImage?: string;
  artistBio?: string;
  artistGenres?: string[];
  artistAlbumCount?: number;
  artistFollowers?: number;
  artistConcertCount?: number;
  // Contract reference
  contractId?: string;
  serviceCategory: string;
  // Request details
  requestType: 'request' | 'offer'; // request = organizer asking, offer = provider responding
  amount?: number;
  requestedBudget?: string;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'expired' | 'counter_offered' | 'cancelled';
  message?: string;
  notes?: string;
  responseMessage?: string;
  // Counter offer tracking
  counterAmount?: number;
  counterMessage?: string;
  counterBy?: 'organizer' | 'provider';
  counterAt?: Date;
  // Final accepted amount
  finalAmount?: number;
  acceptedBy?: 'organizer' | 'provider';
  acceptedAt?: Date;
  // Rejection info
  rejectedBy?: 'organizer' | 'provider';
  rejectedAt?: Date;
  rejectionReason?: string;
  // Cancellation info
  cancelledBy?: 'organizer' | 'provider';
  cancelledAt?: Date;
  cancellationReason?: string;
  // Form data for the request
  formData?: Record<string, any>;
  serviceDates?: string[];
  validUntil?: Date;
  // Inclusions/Exclusions from provider
  inclusions?: string[];
  exclusions?: string[];
  // Full offer history for timeline
  offerHistory?: {
    type: 'quote' | 'counter' | 'accepted' | 'rejected';
    by: 'organizer' | 'provider';
    amount?: number;
    message?: string | null;
    timestamp: Date;
  }[];
  // Contract signature fields
  contractSigned?: boolean;
  contractSignedByOrganizer?: boolean;
  contractSignedByProvider?: boolean;
  contractSignedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreConversation {
  id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  participantImages: Record<string, string>;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: Record<string, number>;
  eventId?: string;
  eventTitle?: string;
  // Company-based fields (new)
  participantCompanyIds?: Record<string, string>;   // userId -> companyId
  participantCompanyNames?: Record<string, string>; // userId -> companyName
  participantCompanyLogos?: Record<string, string>; // userId -> companyLogo
  participantRoles?: Record<string, string>;        // userId -> role
}

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  pendingOffers: number;
  totalRevenue: number;
  upcomingEventsCount: number;
}

// Helper to convert Firestore timestamp to Date
const toDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
};

// Helper to convert Firestore doc to typed object
const docToEvent = (doc: any): FirestoreEvent => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title || '',
    description: data.description,
    date: data.date || '',
    time: data.time || '',
    startTime: data.startTime,
    endTime: data.endTime,
    endDate: data.endDate,
    city: data.city || '',
    district: data.district,
    venue: data.venue || '',
    venueAddress: data.venueAddress,
    venueCapacity: data.venueCapacity,
    venueImage: data.venueImage,
    venuePhone: data.venuePhone,
    status: data.status || 'draft',
    organizerId: data.organizerId || '',
    // Organizer personal info
    organizerName: data.organizerName,
    organizerImage: data.organizerImage,
    organizerPhone: data.organizerPhone,
    // Organizer company info
    organizerCompanyId: data.organizerCompanyId,
    organizerCompanyName: data.organizerCompanyName,
    organizerCompanyLogo: data.organizerCompanyLogo,
    organizerUserId: data.organizerUserId,
    organizerUserName: data.organizerUserName,
    organizerUserRole: data.organizerUserRole,
    providerIds: data.providerIds,
    artistId: data.artistId,
    artistName: data.artistName,
    artistImage: data.artistImage,
    image: data.image,
    budget: data.budget,
    spent: data.spent,
    expectedAttendees: data.expectedAttendees,
    attendees: data.attendees,
    guestCount: data.guestCount,
    // Event type and category
    eventType: data.eventType,
    category: data.category,
    // Ticketing
    isTicketed: data.isTicketed,
    ticketCapacity: data.ticketCapacity,
    ticketsSold: data.ticketsSold,
    // Progress tracking
    progress: data.progress,
    // Event detail fields
    ageLimit: data.ageLimit,
    isAllAges: data.isAllAges,
    seatingType: data.seatingType,
    seatingArrangement: data.seatingArrangement,
    indoorOutdoor: data.indoorOutdoor,
    services: data.services || [],
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
};

const docToOffer = (doc: any): FirestoreOffer => {
  const data = doc.data();
  return {
    id: doc.id,
    eventId: data.eventId || '',
    eventTitle: data.eventTitle || '',
    eventDate: data.eventDate,
    eventTime: data.eventTime,
    eventCity: data.eventCity,
    // Legacy fields
    organizerId: data.organizerId || '',
    organizerName: data.organizerCompanyName || data.organizerName || '',
    organizerImage: data.organizerCompanyLogo || data.organizerImage,
    organizerPhone: data.organizerPhone,
    providerId: data.providerId || '',
    providerName: data.providerCompanyName || data.providerName || '',
    providerImage: data.providerCompanyLogo || data.providerImage,
    providerPhone: data.providerPhone,
    providerBio: data.providerBio,
    responseTime: data.responseTime,
    // Company-based fields
    organizerCompanyId: data.organizerCompanyId,
    organizerCompanyName: data.organizerCompanyName,
    organizerCompanyLogo: data.organizerCompanyLogo,
    organizerUserId: data.organizerUserId || data.organizerId,
    organizerUserName: data.organizerUserName,
    organizerUserRole: data.organizerUserRole,
    providerCompanyId: data.providerCompanyId,
    providerCompanyName: data.providerCompanyName,
    providerCompanyLogo: data.providerCompanyLogo,
    providerUserId: data.providerUserId || data.providerId,
    providerUserName: data.providerUserName,
    providerUserRole: data.providerUserRole,
    // Artist fields
    artistId: data.artistId,
    artistName: data.artistName,
    artistImage: data.artistImage,
    artistBio: data.artistBio,
    artistGenres: data.artistGenres,
    artistAlbumCount: data.artistAlbumCount,
    artistFollowers: data.artistFollowers,
    artistConcertCount: data.artistConcertCount,
    serviceCategory: data.serviceCategory || '',
    requestType: data.requestType || 'request',
    amount: data.amount,
    requestedBudget: data.requestedBudget,
    status: data.status || 'pending',
    message: data.message,
    notes: data.notes,
    responseMessage: data.responseMessage,
    counterAmount: data.counterAmount,
    counterMessage: data.counterMessage,
    counterBy: data.counterBy,
    counterAt: data.counterAt ? toDate(data.counterAt) : undefined,
    formData: data.formData,
    serviceDates: data.serviceDates,
    validUntil: data.validUntil ? toDate(data.validUntil) : undefined,
    inclusions: data.inclusions,
    exclusions: data.exclusions,
    offerHistory: data.offerHistory?.map((h: any) => ({
      ...h,
      timestamp: toDate(h.timestamp),
    })),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    // Contract signature fields
    contractSigned: data.contractSigned || false,
    contractSignedByOrganizer: data.contractSignedByOrganizer || false,
    contractSignedByProvider: data.contractSignedByProvider || false,
    contractSignedAt: data.contractSignedAt ? toDate(data.contractSignedAt) : undefined,
    finalAmount: data.finalAmount,
    acceptedBy: data.acceptedBy,
    acceptedAt: data.acceptedAt ? toDate(data.acceptedAt) : undefined,
  };
};

const docToConversation = (doc: any): FirestoreConversation => {
  const data = doc.data();
  return {
    id: doc.id,
    // Support both 'participantIds' and 'participants' for backward compatibility
    participantIds: data.participantIds || data.participants || [],
    participantNames: data.participantNames || {},
    participantImages: data.participantImages || {},
    lastMessage: data.lastMessage || '',
    // Support both 'lastMessageAt' and 'lastMessageTime' for backward compatibility
    lastMessageAt: toDate(data.lastMessageAt || data.lastMessageTime),
    unreadCount: data.unreadCount || {},
    eventId: data.eventId,
    eventTitle: data.eventTitle,
    // Company-based fields
    participantCompanyIds: data.participantCompanyIds || {},
    participantCompanyNames: data.participantCompanyNames || {},
    participantCompanyLogos: data.participantCompanyLogos || {},
    participantRoles: data.participantRoles || {},
  };
};

/**
 * Hook to fetch user's events (for organizers)
 */
export function useUserEvents(userId: string | undefined, statusFilter?: string) {
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Build query constraints - removed orderBy to avoid composite index requirement
    const constraints: QueryConstraint[] = [
      where('organizerId', '==', userId),
    ];

    if (statusFilter && statusFilter !== 'all') {
      constraints.push(where('status', '==', statusFilter));
    }

    const q = query(collection(db, 'events'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventsList = snapshot.docs.map(docToEvent);
        // Sort client-side by createdAt descending
        eventsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setEvents(eventsList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching events:', err?.message || err);
        setError('Etkinlikler yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, statusFilter]);

  return { events, loading, error };
}

/**
 * Hook to fetch provider's jobs/events
 * Fetches events where:
 * 1. Provider is in the providerIds array, OR
 * 2. Provider is the organizer (for self-created events)
 */
export function useProviderJobs(providerId: string | undefined) {
  const [jobs, setJobs] = useState<FirestoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refetch function to manually trigger refresh
  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!providerId) {
      setJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query accepted offers for this provider (each offer = separate job)
    const acceptedOffersQuery = query(
      collection(db, 'offers'),
      where('providerId', '==', providerId),
      where('status', '==', 'accepted')
    );

    // Use onSnapshot for realtime updates
    const unsubscribe = onSnapshot(
      acceptedOffersQuery,
      async (offersSnapshot) => {
        try {
          console.log('[useProviderJobs] Accepted offers:', offersSnapshot.docs.length);

          if (offersSnapshot.empty) {
            setJobs([]);
            setLoading(false);
            return;
          }

          // Group offers by eventId to fetch events efficiently
          const offersByEvent = new Map<string, any[]>();
          offersSnapshot.docs.forEach(offerDoc => {
            const offerData = { id: offerDoc.id, ...offerDoc.data() } as any;
            const eventId = offerData.eventId;
            if (eventId) {
              if (!offersByEvent.has(eventId)) {
                offersByEvent.set(eventId, []);
              }
              offersByEvent.get(eventId)!.push(offerData);
            }
          });

          console.log('[useProviderJobs] Unique events:', offersByEvent.size);

          // Fetch all events
          const eventIds = Array.from(offersByEvent.keys());
          const eventMap = new Map<string, any>();

          const eventPromises = eventIds.map(async (eventId) => {
            try {
              const eventDoc = await getDoc(doc(db, 'events', eventId));
              if (eventDoc.exists()) {
                return { id: eventDoc.id, ...eventDoc.data() };
              }
            } catch (e) {
              console.warn('[useProviderJobs] Error fetching event:', eventId, e);
            }
            return null;
          });

          const eventResults = await Promise.all(eventPromises);
          eventResults.forEach(eventData => {
            if (eventData) {
              eventMap.set(eventData.id, eventData);
            }
          });

          // Fetch organizer data
          const organizerIds = [...new Set(Array.from(eventMap.values()).map(e => e.organizerId).filter(Boolean))];
          const organizerMap = new Map<string, { name: string; image?: string; phone?: string }>();

          if (organizerIds.length > 0) {
            const organizerPromises = organizerIds.map(async (orgId) => {
              try {
                const userDoc = await getDoc(doc(db, 'users', orgId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  return {
                    id: orgId,
                    name: userData.displayName || userData.name || userData.companyName || 'Organizatör',
                    image: userData.photoURL || userData.userPhotoURL || userData.profileImage || userData.image,
                    phone: userData.phone || userData.phoneNumber,
                  };
                }
              } catch (e) {
                console.warn('[useProviderJobs] Error fetching organizer:', orgId, e);
              }
              return null;
            });

            const organizerResults = await Promise.all(organizerPromises);
            organizerResults.forEach(org => {
              if (org) {
                organizerMap.set(org.id, { name: org.name, image: org.image, phone: org.phone });
              }
            });
          }

          // Create a job entry for EACH accepted offer (not per event!)
          // This allows multiple jobs per event when provider provides multiple services
          const jobsList: FirestoreEvent[] = [];

          offersByEvent.forEach((offers, eventId) => {
            const eventData = eventMap.get(eventId);
            if (!eventData) return;

            // Create a separate job for each offer
            offers.forEach(offer => {
              const event = docToEvent({ id: eventData.id, data: () => eventData });

              // Add organizer info
              const orgInfo = organizerMap.get(event.organizerId);
              if (orgInfo) {
                event.organizerName = orgInfo.name;
                event.organizerImage = orgInfo.image;
                event.organizerPhone = orgInfo.phone;
              }

              // Add offer-specific info to make each job unique
              // Use offerId as part of the job's unique identifier
              event.id = `${eventData.id}_${offer.id}`; // Unique job ID
              event.contractAmount = offer.finalAmount ?? offer.counterAmount ?? offer.amount ?? 0;

              // Store artist/service info for this specific job
              if (offer.artistId) {
                event.artistId = offer.artistId;
                event.artistName = offer.artistName;
                event.artistImage = offer.artistImage;
              }

              // Store the original eventId and offerId for navigation
              (event as any).originalEventId = eventData.id;
              (event as any).offerId = offer.id;
              (event as any).serviceCategory = offer.serviceCategory;

              jobsList.push(event);
            });
          });

          // Sort by date descending
          jobsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          console.log('[useProviderJobs] Total jobs (one per offer):', jobsList.length);
          setJobs(jobsList);
          setLoading(false);
          setError(null);
        } catch (err: any) {
          console.warn('Error fetching provider jobs:', err?.message || err);
          setError('İşler yüklenirken hata oluştu');
          setLoading(false);
        }
      },
      (err) => {
        console.warn('Error in provider jobs listener:', err?.message || err);
        setError('İşler yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [providerId, refreshKey]);

  return { jobs, loading, error, refetch };
}

/**
 * Hook to fetch offers (for organizer or provider)
 */
export function useOffers(userId: string | undefined, role: 'organizer' | 'provider') {
  const [offers, setOffers] = useState<FirestoreOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh function
  const refetch = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  useEffect(() => {
    if (!userId) {
      setOffers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fieldName = role === 'organizer' ? 'organizerId' : 'providerId';
    // Use simple query without orderBy to avoid composite index requirement
    const q = query(
      collection(db, 'offers'),
      where(fieldName, '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('[useOffers] Snapshot received:', snapshot.docs.length, 'offers');
        // Sort client-side by createdAt desc
        const offersList = snapshot.docs
          .map(docToOffer)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        // Log status changes for debugging
        offersList.forEach(o => console.log(`[useOffers] Offer ${o.id}: status=${o.status}`));
        setOffers(offersList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching offers:', err?.message || err);
        setError('Teklifler yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, role, refreshKey]);

  return { offers, loading, error, refetch };
}

/**
 * Hook to fetch conversations
 * Queries both 'participantIds' and 'participants' fields for backward compatibility
 */
export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<FirestoreConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query for both field names to support old and new conversation formats
    const q1 = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userId)
    );

    const q2 = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId)
    );

    // Track results from both queries
    let results1: FirestoreConversation[] = [];
    let results2: FirestoreConversation[] = [];
    let query1Done = false;
    let query2Done = false;

    const mergeAndDeduplicate = () => {
      if (!query1Done || !query2Done) return;

      // Merge results from both queries, using Map to avoid duplicates by document ID
      const allConvsById = new Map<string, FirestoreConversation>();
      [...results1, ...results2].forEach(conv => {
        // If same document ID exists, keep the one with more recent lastMessageAt
        const existing = allConvsById.get(conv.id);
        if (!existing || conv.lastMessageAt > existing.lastMessageAt) {
          allConvsById.set(conv.id, conv);
        }
      });

      // Sort by lastMessageAt desc
      const convList = Array.from(allConvsById.values())
        .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

      // Deduplicate conversations by other participant
      // If multiple conversations exist with the same person, keep the one with most recent message
      const deduplicatedMap = new Map<string, FirestoreConversation>();
      for (const conv of convList) {
        // Get the other participant's ID
        const otherParticipantId = conv.participantIds.find(id => id !== userId);

        if (!otherParticipantId) {
          continue;
        }

        const existing = deduplicatedMap.get(otherParticipantId);
        if (!existing || conv.lastMessageAt > existing.lastMessageAt) {
          deduplicatedMap.set(otherParticipantId, conv);
        }
      }

      // Convert back to array and sort by lastMessageAt desc
      const deduplicatedList = Array.from(deduplicatedMap.values())
        .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

      setConversations(deduplicatedList);
      setLoading(false);
      setError(null);
    };

    const unsubscribe1 = onSnapshot(
      q1,
      (snapshot) => {
        results1 = snapshot.docs.map(docToConversation);
        query1Done = true;
        mergeAndDeduplicate();
      },
      (err) => {
        console.warn('Error fetching conversations (participantIds):', err?.message || err);
        query1Done = true;
        mergeAndDeduplicate();
      }
    );

    const unsubscribe2 = onSnapshot(
      q2,
      (snapshot) => {
        results2 = snapshot.docs.map(docToConversation);
        query2Done = true;
        mergeAndDeduplicate();
      },
      (err) => {
        console.warn('Error fetching conversations (participants):', err?.message || err);
        query2Done = true;
        mergeAndDeduplicate();
      }
    );

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [userId]);

  return { conversations, loading, error };
}

/**
 * Hook to fetch dashboard stats for organizer
 */
export function useOrganizerDashboard(userId: string | undefined) {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeEvents: 0,
    completedEvents: 0,
    pendingOffers: 0,
    totalRevenue: 0,
    upcomingEventsCount: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<FirestoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch all user events
      const eventsQuery = query(
        collection(db, 'events'),
        where('organizerId', '==', userId)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(docToEvent);

      // Calculate stats
      const now = new Date();
      const activeEvents = events.filter(e => e.status === 'confirmed' || e.status === 'planning');
      const completedEvents = events.filter(e => e.status === 'completed');
      const upcoming = events
        .filter(e => new Date(e.date) >= now && e.status !== 'cancelled')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

      // Fetch offers that need organizer's attention
      // This includes: 'quoted' (provider sent quote), 'counter_offered' (when counterBy is 'provider')
      const offersQuery = query(
        collection(db, 'offers'),
        where('organizerId', '==', userId)
      );
      const offersSnapshot = await getDocs(offersQuery);
      const pendingOffersCount = offersSnapshot.docs.filter(doc => {
        const data = doc.data();
        // Offers waiting for organizer action:
        // - 'quoted': provider sent a quote, organizer needs to respond
        // - 'counter_offered': provider sent a counter offer
        if (data.status === 'quoted') return true;
        if (data.status === 'counter_offered' && data.counterBy === 'provider') return true;
        return false;
      }).length;

      setStats({
        totalEvents: events.length,
        activeEvents: activeEvents.length,
        completedEvents: completedEvents.length,
        pendingOffers: pendingOffersCount,
        totalRevenue: completedEvents.reduce((sum, e) => sum + (e.budget || 0), 0),
        upcomingEventsCount: upcoming.length,
      });
      setUpcomingEvents(upcoming);
      setError(null);
    } catch (err: any) {
      console.warn('Error fetching dashboard:', err?.message || err);
      setError('Dashboard yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, upcomingEvents, loading, error, refresh };
}

/**
 * Hook to fetch dashboard stats for provider
 */
export function useProviderDashboard(userId: string | undefined) {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    rating: 0,
    reviewCount: 0,
    responseRate: 0,
    completionRate: 0,
    satisfactionRate: 0,
  });
  const [upcomingJobs, setUpcomingJobs] = useState<FirestoreEvent[]>([]);
  const [pendingOffers, setPendingOffers] = useState<FirestoreOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch provider's jobs
      const jobsQuery = query(
        collection(db, 'events'),
        where('providerIds', 'array-contains', userId)
      );
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobs = jobsSnapshot.docs.map(docToEvent);

      // Fetch offers for this provider (single where to avoid composite index)
      const offersQuery = query(
        collection(db, 'offers'),
        where('providerId', '==', userId)
      );
      const offersSnapshot = await getDocs(offersQuery);
      const allOffers = offersSnapshot.docs.map(docToOffer);
      // Offers waiting for provider action:
      // - 'pending': new request from organizer, needs quote
      // - 'counter_offered': organizer sent a counter offer
      const offers = allOffers.filter(o =>
        o.status === 'pending' ||
        (o.status === 'counter_offered' && o.counterBy === 'organizer')
      );

      // Calculate stats
      const now = new Date();
      const activeJobsFromEvents = jobs.filter(j => j.status === 'confirmed' || j.status === 'planning');
      const completedJobsFromEvents = jobs.filter(j => j.status === 'completed');

      // Also count accepted offers as active work if event not yet linked
      const acceptedOffersWithFutureEvents = allOffers.filter(o => {
        if (o.status !== 'accepted') return false;
        // Check if event date is in the future
        const eventDate = o.eventDate ? new Date(o.eventDate) : null;
        return eventDate && eventDate >= now;
      });

      // Count completed offers (events in the past with accepted offer)
      const completedOffersFromPast = allOffers.filter(o => {
        if (o.status !== 'accepted') return false;
        const eventDate = o.eventDate ? new Date(o.eventDate) : null;
        return eventDate && eventDate < now;
      });

      // Use the maximum count between events and accepted offers
      // This ensures we show work even if events aren't linked with providerIds yet
      const activeJobs = Math.max(activeJobsFromEvents.length, acceptedOffersWithFutureEvents.length);
      const completedJobs = Math.max(completedJobsFromEvents.length, completedOffersFromPast.length);

      // Get accepted offers to attach contract amounts
      // Group by eventId and sum amounts (provider may have multiple services for same event)
      const contractAmountsByEvent = new Map<string, number>();
      allOffers
        .filter(o => o.status === 'accepted')
        .forEach(offer => {
          const offerAmount = offer.finalAmount || offer.counterAmount || offer.amount || 0;
          const currentTotal = contractAmountsByEvent.get(offer.eventId) || 0;
          contractAmountsByEvent.set(offer.eventId, currentTotal + offerAmount);
        });

      // Attach contract amount from accepted offers to each job
      const upcoming = jobs
        .filter(j => new Date(j.date) >= now && j.status !== 'cancelled')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5)
        .map(job => {
          const contractAmount = contractAmountsByEvent.get(job.id);
          if (contractAmount) {
            // Use total contract amount from all accepted offers for this event
            job.contractAmount = contractAmount;
          }
          return job;
        });

      // Calculate total earnings from accepted offers
      const acceptedOffers = allOffers.filter(o => o.status === 'accepted');
      const totalEarnings = acceptedOffers.reduce((sum, offer) => {
        const amount = offer.finalAmount || offer.counterAmount || offer.amount || 0;
        return sum + amount;
      }, 0);

      // Calculate response rate (responded offers / total offers received)
      const respondedOffers = allOffers.filter(o =>
        o.status !== 'pending' && o.status !== 'expired'
      );
      const responseRate = allOffers.length > 0
        ? Math.round((respondedOffers.length / allOffers.length) * 100)
        : 100; // Default to 100% if no offers yet

      // Calculate completion rate (completed jobs / total non-cancelled jobs)
      const nonCancelledJobs = jobs.filter(j => j.status !== 'cancelled');
      const completionRate = nonCancelledJobs.length > 0
        ? Math.round((completedJobs / nonCancelledJobs.length) * 100)
        : 100;

      // Fetch reviews for this provider
      let rating = 0;
      let reviewCount = 0;
      let satisfactionRate = 0;
      try {
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('providerId', '==', userId)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviews = reviewsSnapshot.docs.map(doc => doc.data());
        reviewCount = reviews.length;

        if (reviewCount > 0) {
          // Calculate average rating
          const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
          rating = Math.round((totalRating / reviewCount) * 10) / 10; // Round to 1 decimal

          // Satisfaction rate = percentage of 4+ star reviews
          const satisfiedReviews = reviews.filter(r => (r.rating || 0) >= 4);
          satisfactionRate = Math.round((satisfiedReviews.length / reviewCount) * 100);
        }
      } catch (reviewError) {
        console.warn('Could not fetch reviews:', reviewError);
      }

      // Total jobs = all accepted offers (unique events)
      const totalJobsCount = Math.max(jobs.length, allOffers.filter(o => o.status === 'accepted').length);

      setStats({
        totalJobs: totalJobsCount,
        activeJobs: activeJobs,
        completedJobs: completedJobs,
        pendingRequests: offers.length,
        totalEarnings,
        rating,
        reviewCount,
        responseRate,
        completionRate,
        satisfactionRate,
      });
      setUpcomingJobs(upcoming);
      setPendingOffers(offers);
      setError(null);
    } catch (err: any) {
      console.warn('Error fetching provider dashboard:', err?.message || err);
      setError('Dashboard yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, upcomingJobs, pendingOffers, loading, error, refresh };
}

/**
 * Hook to fetch a single event by ID
 */
export function useEvent(eventId: string | undefined) {
  const [event, setEvent] = useState<FirestoreEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[useEvent] Fetching event with ID:', eventId);

    if (!eventId) {
      console.log('[useEvent] No eventId provided');
      setEvent(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      doc(db, 'events', eventId),
      (docSnap) => {
        console.log('[useEvent] Document exists:', docSnap.exists(), 'ID:', docSnap.id);
        if (docSnap.exists()) {
          const eventData = docToEvent(docSnap);
          console.log('[useEvent] Event data:', eventData.title);
          setEvent(eventData);
        } else {
          console.log('[useEvent] Event not found for ID:', eventId);
          setEvent(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('[useEvent] Error fetching event:', err?.message || err);
        setError('Etkinlik yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [eventId]);

  return { event, loading, error };
}

// Artist type for Firestore
export interface FirestoreArtist {
  id: string;
  name: string;
  stageName?: string;
  genre: string[];
  description?: string;
  bio?: string;
  image?: string;
  coverImage?: string;
  priceMin?: number;
  priceMax?: number;
  priceRange?: string;
  status: 'active' | 'inactive' | 'on_tour';
  availability: 'available' | 'busy' | 'limited';
  rating: number;
  reviewCount: number;
  totalShows: number;
  totalRevenue: number;
  socialMedia?: {
    instagram?: string;
    spotify?: string;
    youtube?: string;
  };
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const docToArtist = (doc: any): FirestoreArtist => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    stageName: data.stageName,
    genre: data.genre || [],
    description: data.description,
    bio: data.bio,
    image: data.image,
    coverImage: data.coverImage,
    priceMin: data.priceMin,
    priceMax: data.priceMax,
    priceRange: data.priceRange,
    status: data.status || 'active',
    availability: data.availability || 'available',
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    totalShows: data.totalShows || 0,
    totalRevenue: data.totalRevenue || 0,
    socialMedia: data.socialMedia,
    ownerId: data.ownerId || '',
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
};

/**
 * Hook to fetch user's artists (for booking providers)
 */
export function useArtists(ownerId: string | undefined) {
  const [artists, setArtists] = useState<FirestoreArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerId) {
      setArtists([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'artists'),
      where('ownerId', '==', ownerId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const artistsList = snapshot.docs.map(docToArtist);
        // Sort by createdAt descending
        artistsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setArtists(artistsList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching artists:', err?.message || err);
        setError('Sanatçılar yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ownerId]);

  return { artists, loading, error };
}

/**
 * Hook to fetch a single artist by ID
 */
export function useArtist(artistId: string | undefined) {
  const [artist, setArtist] = useState<FirestoreArtist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistId) {
      setArtist(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      doc(db, 'artists', artistId),
      (docSnap) => {
        if (docSnap.exists()) {
          setArtist(docToArtist(docSnap));
        } else {
          setArtist(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching artist:', err?.message || err);
        setError('Sanatçı yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [artistId]);

  return { artist, loading, error };
}

/**
 * Hook to fetch all public/active artists (for organizer search)
 */
export function useAllArtists() {
  const [artists, setArtists] = useState<FirestoreArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    // Fetch all artists (no status filter to include all)
    const artistsRef = collection(db, 'artists');

    const unsubscribe = onSnapshot(
      artistsRef,
      (snapshot) => {
        console.log('useAllArtists: Found', snapshot.docs.length, 'artists');
        const artistsList = snapshot.docs.map(docToArtist);
        // Sort by rating descending
        artistsList.sort((a, b) => b.rating - a.rating);
        setArtists(artistsList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching all artists:', err?.message || err);
        setError('Sanatçılar yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { artists, loading, error };
}

// Booking Provider type
export interface FirestoreBookingProvider {
  id: string;
  uid: string;
  displayName: string;
  companyName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  coverImage?: string;
  bio?: string;
  city?: string;
  address?: string;
  website?: string;
  providerServices: string[];
  serviceCategories?: string[];
  serviceRegions?: string[];
  isVerified: boolean;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  completedJobs?: number;
  foundedYear?: string;
  employeeCount?: string;
  socialMedia?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  workingHours?: {
    day: string;
    enabled: boolean;
    start: string;
    end: string;
  }[];
  responseRate?: number;
  createdAt: Date;
}

const docToBookingProvider = (doc: any): FirestoreBookingProvider => {
  const data = doc.data();
  return {
    id: doc.id,
    uid: data.uid || doc.id,
    displayName: data.displayName || '',
    companyName: data.companyName || data.displayName || '',
    email: data.email || '',
    phone: data.phone || data.phoneNumber,
    photoURL: data.photoURL,
    coverImage: data.coverImage,
    bio: data.bio,
    city: data.city,
    address: data.address,
    website: data.website,
    providerServices: data.providerServices || [],
    serviceCategories: data.serviceCategories || [],
    serviceRegions: data.serviceRegions || [],
    isVerified: data.isVerified || false,
    isActive: data.isActive !== false,
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    completedJobs: data.completedJobs || 0,
    foundedYear: data.foundedYear,
    employeeCount: data.employeeCount,
    socialMedia: data.socialMedia || {},
    workingHours: data.workingHours || [],
    responseRate: data.responseRate || 95,
    createdAt: toDate(data.createdAt),
  };
};

/**
 * Hook to fetch booking providers (users with 'booking' in providerServices)
 */
export function useBookingProviders() {
  const [providers, setProviders] = useState<FirestoreBookingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    // Query users who are providers with booking service
    const q = query(
      collection(db, 'users'),
      where('providerServices', 'array-contains', 'booking')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('useBookingProviders: Found', snapshot.docs.length, 'booking providers');
        const providersList = snapshot.docs
          .map(docToBookingProvider)
          .filter(p => p.isActive && p.isVerified); // Only show verified providers
        // Sort by rating descending
        providersList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setProviders(providersList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching booking providers:', err?.message || err);
        setError('Booking firmaları yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { providers, loading, error };
}

/**
 * Hook to fetch a single booking provider by ID
 */
export function useBookingProvider(providerId: string | undefined) {
  const [provider, setProvider] = useState<FirestoreBookingProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) {
      setProvider(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      doc(db, 'users', providerId),
      (docSnap) => {
        if (docSnap.exists()) {
          setProvider(docToBookingProvider(docSnap));
        } else {
          setProvider(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching booking provider:', err?.message || err);
        setError('Firma bilgileri yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [providerId]);

  return { provider, loading, error };
}

/**
 * Hook to fetch artists owned by a specific provider
 */
export function useProviderArtists(providerId: string | undefined) {
  const [artists, setArtists] = useState<FirestoreArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) {
      setArtists([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'artists'),
      where('ownerId', '==', providerId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const artistsList = snapshot.docs.map(docToArtist);
        artistsList.sort((a, b) => b.rating - a.rating);
        setArtists(artistsList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching provider artists:', err?.message || err);
        setError('Sanatçılar yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [providerId]);

  return { artists, loading, error };
}

// ========== CHAT / MESSAGING ==========

export interface FirestoreChatMessage {
  id: string;
  senderId: string;
  text?: string;
  time: string;
  date: string;
  type: 'text' | 'offer' | 'meeting' | 'file' | 'image';
  createdAt: Date;
  // Offer specific
  offerAmount?: number;
  offerDescription?: string;
  offerStatus?: 'pending' | 'accepted' | 'rejected';
  eventTitle?: string;
  eventId?: string;
  // Meeting specific
  meetingTitle?: string;
  meetingDate?: string;
  meetingTime?: string;
  meetingLocation?: string;
  meetingStatus?: 'pending' | 'accepted' | 'rejected';
  // File specific
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  fileUrl?: string;
}

export interface FirestoreChatConversation {
  id: string;
  participants: string[]; // User IDs
  participantNames: { [userId: string]: string };
  participantImages: { [userId: string]: string };
  lastMessage: string;
  lastMessageTime: Date;
  lastMessageSenderId: string;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
  archived: { [userId: string]: boolean };
  serviceCategory?: string;
}

const docToChatMessage = (doc: any): FirestoreChatMessage => {
  const data = doc.data();
  return {
    id: doc.id,
    senderId: data.senderId || '',
    text: data.text,
    time: data.time || '',
    date: data.date || '',
    type: data.type || 'text',
    createdAt: toDate(data.createdAt),
    offerAmount: data.offerAmount,
    offerDescription: data.offerDescription,
    offerStatus: data.offerStatus,
    eventTitle: data.eventTitle,
    eventId: data.eventId,
    meetingTitle: data.meetingTitle,
    meetingDate: data.meetingDate,
    meetingTime: data.meetingTime,
    meetingLocation: data.meetingLocation,
    meetingStatus: data.meetingStatus,
    fileName: data.fileName,
    fileSize: data.fileSize,
    fileType: data.fileType,
    fileUrl: data.fileUrl,
  };
};

const docToChatConversation = (doc: any): FirestoreChatConversation => {
  const data = doc.data();
  return {
    id: doc.id,
    // Support both 'participants' and 'participantIds' for backward compatibility
    participants: data.participants || data.participantIds || [],
    participantNames: data.participantNames || {},
    participantImages: data.participantImages || {},
    lastMessage: data.lastMessage || '',
    // Support both 'lastMessageTime' and 'lastMessageAt' for backward compatibility
    lastMessageTime: toDate(data.lastMessageTime || data.lastMessageAt),
    lastMessageSenderId: data.lastMessageSenderId || '',
    unreadCount: data.unreadCount || {},
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    archived: data.archived || {},
    serviceCategory: data.serviceCategory,
  };
};

/**
 * Get a single conversation by ID (for fetching participant info)
 */
export async function getConversationById(conversationId: string): Promise<FirestoreConversation | null> {
  try {
    const docSnap = await getDoc(doc(db, 'conversations', conversationId));
    if (docSnap.exists()) {
      return docToConversation(docSnap);
    }
    return null;
  } catch (error: any) {
    console.warn('Error fetching conversation:', error?.message || error);
    return null;
  }
}

/**
 * Hook to fetch all conversations for a user
 */
export function useChatConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<FirestoreChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const convList = snapshot.docs.map(docToChatConversation);

        // Deduplicate conversations by other participant
        // If multiple conversations exist with the same person, keep the one with most recent message
        const deduplicatedMap = new Map<string, FirestoreChatConversation>();
        for (const conv of convList) {
          // Get the other participant's ID
          const otherParticipantId = conv.participants.find(id => id !== userId);

          if (!otherParticipantId) {
            continue;
          }

          const existing = deduplicatedMap.get(otherParticipantId);
          if (!existing || conv.lastMessageTime > existing.lastMessageTime) {
            deduplicatedMap.set(otherParticipantId, conv);
          }
        }

        // Convert back to array and sort by lastMessageTime desc
        const deduplicatedList = Array.from(deduplicatedMap.values())
          .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

        setConversations(deduplicatedList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching conversations:', err?.message || err);
        setError('Sohbetler yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { conversations, loading, error };
}

/**
 * Hook to fetch messages for a specific conversation
 */
export function useChatMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<FirestoreChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgList = snapshot.docs.map(docToChatMessage);
        setMessages(msgList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching messages:', err?.message || err);
        setError('Mesajlar yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  return { messages, loading, error };
}

/**
 * Send a chat message
 */
export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  message: Omit<FirestoreChatMessage, 'id' | 'createdAt'>
): Promise<string> {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('tr-TR');

  // Add message to subcollection
  const msgRef = await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    ...message,
    senderId,
    time: timeStr,
    date: dateStr,
    createdAt: Timestamp.now(),
  });

  // Update conversation's last message (use lastMessageTime to match query orderBy field)
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: message.text || (message.type === 'offer' ? 'Teklif gönderildi' : message.type === 'meeting' ? 'Toplantı daveti' : 'Dosya gönderildi'),
    lastMessageTime: Timestamp.now(),
  });

  return msgRef.id;
}

/**
 * Create a new conversation or get existing one between two users
 * Uses same schema as existing useConversations hook (participantIds, lastMessageAt)
 */
/**
 * Generate a deterministic conversation ID from two user IDs
 * Sorts the IDs alphabetically to ensure consistency regardless of who initiates
 */
function generateConversationId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  return `conv_${sorted[0]}_${sorted[1]}`;
}

/**
 * Participant info for conversation
 */
export interface ConversationParticipantInfo {
  userId: string;
  userName: string;
  userImage?: string;
  companyId?: string;
  companyName?: string;
  companyLogo?: string;
  userRole?: string;
}

export async function createOrGetConversation(
  userId: string,
  userName: string,
  userImage: string,
  otherUserId: string,
  otherUserName: string,
  otherUserImage: string,
  serviceCategory?: string
): Promise<string> {
  console.log('[createOrGetConversation] Starting with:', { userId, otherUserId, userName, otherUserName });

  // Generate deterministic conversation ID to prevent race conditions
  const conversationId = generateConversationId(userId, otherUserId);
  console.log('[createOrGetConversation] Generated conversationId:', conversationId);

  const conversationRef = doc(db, 'conversations', conversationId);

  // Check if conversation already exists
  console.log('[createOrGetConversation] Checking if conversation exists...');
  let existingDoc;
  let conversationExists = false;

  try {
    existingDoc = await getDoc(conversationRef);
    conversationExists = existingDoc.exists();
    console.log('[createOrGetConversation] Conversation exists:', conversationExists);
  } catch (readError: any) {
    // If we get a permission error, the conversation might exist but user can't read it
    // This can happen if the conversation format changed or there's a data inconsistency
    console.warn('[createOrGetConversation] Read error (might be permission issue):', readError?.code, readError?.message);
    // We'll try to create a new conversation instead
    conversationExists = false;
  }

  if (conversationExists && existingDoc) {
    // Update participant info in case names/images have changed
    console.log('[createOrGetConversation] Updating existing conversation...');
    try {
      await updateDoc(conversationRef, {
        [`participantNames.${userId}`]: userName,
        [`participantNames.${otherUserId}`]: otherUserName,
        [`participantImages.${userId}`]: userImage || '',
        [`participantImages.${otherUserId}`]: otherUserImage || '',
      });
      console.log('[createOrGetConversation] Updated successfully');
    } catch (updateError: any) {
      console.error('[createOrGetConversation] Update error:', updateError?.code, updateError?.message);
      // If update fails, try to continue - maybe we need to recreate
      if (updateError?.code === 'permission-denied') {
        console.log('[createOrGetConversation] Permission denied on update, will try to use existing or create new');
        return conversationId; // Return existing ID, user might still be able to send messages
      }
      throw updateError;
    }
    return conversationId;
  }

  // Create new conversation with deterministic ID using setDoc
  // This prevents duplicates even if two users create simultaneously
  console.log('[createOrGetConversation] Creating new conversation...');
  const now = Timestamp.now();
  try {
    // Use merge: true to avoid overwriting if document somehow exists
    await setDoc(conversationRef, {
      // Write both field names for backward compatibility
      participantIds: [userId, otherUserId].sort(), // Used by query
      participants: [userId, otherUserId].sort(), // Legacy field
      participantNames: {
        [userId]: userName,
        [otherUserId]: otherUserName,
      },
      participantImages: {
        [userId]: userImage || '',
        [otherUserId]: otherUserImage || '',
      },
      lastMessage: '',
      // Write both field names for backward compatibility
      lastMessageAt: now, // Used by query
      lastMessageTime: now, // Legacy field
      unreadCount: {
        [userId]: 0,
        [otherUserId]: 0,
      },
      createdAt: now,
    }, { merge: true });
    console.log('[createOrGetConversation] Conversation created successfully');
  } catch (setDocError: any) {
    console.error('[createOrGetConversation] setDoc error:', setDocError?.code, setDocError?.message);

    // If permission denied, the conversation might exist but we can't access it
    // Return the conversation ID anyway - user might be able to send messages
    if (setDocError?.code === 'permission-denied') {
      console.warn('[createOrGetConversation] Permission denied on create - returning ID anyway');
      return conversationId;
    }
    throw setDocError;
  }

  // Add welcome message
  try {
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId: 'system',
      text: `Sohbet başlatıldı. ${otherUserName} ile iletişime geçebilirsiniz.`,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('tr-TR'),
      type: 'text',
      createdAt: now,
    });
    console.log('[createOrGetConversation] Welcome message added');
  } catch (msgError: any) {
    console.warn('[createOrGetConversation] Welcome message error (non-critical):', msgError?.message);
    // Don't throw - the conversation was created, message is optional
  }

  return conversationId;
}

/**
 * Create or get conversation with company info
 * Enhanced version that includes company information for display
 */
export async function createOrGetConversationWithCompany(
  participant1: ConversationParticipantInfo,
  participant2: ConversationParticipantInfo,
  serviceCategory?: string
): Promise<string> {
  // Generate deterministic conversation ID to prevent race conditions
  const conversationId = generateConversationId(participant1.userId, participant2.userId);
  const conversationRef = doc(db, 'conversations', conversationId);

  // Check if conversation already exists
  const existingDoc = await getDoc(conversationRef);

  // Prepare display names: prioritize company name if available
  const name1 = participant1.companyName || participant1.userName;
  const name2 = participant2.companyName || participant2.userName;
  const image1 = participant1.companyLogo || participant1.userImage || '';
  const image2 = participant2.companyLogo || participant2.userImage || '';

  if (existingDoc.exists()) {
    // Update participant info in case names/images have changed
    const updateData: Record<string, any> = {
      [`participantNames.${participant1.userId}`]: name1,
      [`participantNames.${participant2.userId}`]: name2,
      [`participantImages.${participant1.userId}`]: image1,
      [`participantImages.${participant2.userId}`]: image2,
    };

    // Update company info if available
    if (participant1.companyId) {
      updateData[`participantCompanyIds.${participant1.userId}`] = participant1.companyId;
      updateData[`participantCompanyNames.${participant1.userId}`] = participant1.companyName || '';
      updateData[`participantCompanyLogos.${participant1.userId}`] = participant1.companyLogo || '';
    }
    if (participant2.companyId) {
      updateData[`participantCompanyIds.${participant2.userId}`] = participant2.companyId;
      updateData[`participantCompanyNames.${participant2.userId}`] = participant2.companyName || '';
      updateData[`participantCompanyLogos.${participant2.userId}`] = participant2.companyLogo || '';
    }
    if (participant1.userRole) {
      updateData[`participantRoles.${participant1.userId}`] = participant1.userRole;
    }
    if (participant2.userRole) {
      updateData[`participantRoles.${participant2.userId}`] = participant2.userRole;
    }

    await updateDoc(conversationRef, updateData);
    return conversationId;
  }

  // Create new conversation with deterministic ID using setDoc
  const now = Timestamp.now();
  const conversationData: Record<string, any> = {
    // Write both field names for backward compatibility
    participantIds: [participant1.userId, participant2.userId].sort(), // Used by query
    participants: [participant1.userId, participant2.userId].sort(), // Legacy field
    participantNames: {
      [participant1.userId]: name1,
      [participant2.userId]: name2,
    },
    participantImages: {
      [participant1.userId]: image1,
      [participant2.userId]: image2,
    },
    participantCompanyIds: {},
    participantCompanyNames: {},
    participantCompanyLogos: {},
    participantRoles: {},
    lastMessage: '',
    // Write both field names for backward compatibility
    lastMessageAt: now, // Used by query
    lastMessageTime: now, // Legacy field
    unreadCount: {
      [participant1.userId]: 0,
      [participant2.userId]: 0,
    },
    createdAt: now,
  };

  // Add company info if available
  if (participant1.companyId) {
    conversationData.participantCompanyIds[participant1.userId] = participant1.companyId;
    conversationData.participantCompanyNames[participant1.userId] = participant1.companyName || '';
    conversationData.participantCompanyLogos[participant1.userId] = participant1.companyLogo || '';
  }
  if (participant2.companyId) {
    conversationData.participantCompanyIds[participant2.userId] = participant2.companyId;
    conversationData.participantCompanyNames[participant2.userId] = participant2.companyName || '';
    conversationData.participantCompanyLogos[participant2.userId] = participant2.companyLogo || '';
  }
  if (participant1.userRole) {
    conversationData.participantRoles[participant1.userId] = participant1.userRole;
  }
  if (participant2.userRole) {
    conversationData.participantRoles[participant2.userId] = participant2.userRole;
  }

  await setDoc(conversationRef, conversationData);

  // Add welcome message with company name if available
  const welcomeName = participant2.companyName
    ? `${participant2.companyName} (${participant2.userName})`
    : participant2.userName;

  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderId: 'system',
    text: `Sohbet başlatıldı. ${welcomeName} ile iletişime geçebilirsiniz.`,
    time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString('tr-TR'),
    type: 'text',
    createdAt: now,
  });

  return conversationId;
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'conversations', conversationId), {
    [`unreadCount.${userId}`]: 0,
  });
}

// ==================== FAVORITES ====================

export interface FirestoreFavorite {
  id: string;
  type: 'artist' | 'provider';
  itemId: string;
  itemName: string;
  itemImage?: string;
  createdAt: Date;
}

/**
 * Hook to fetch user's favorites
 */
export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<FirestoreFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const favRef = collection(db, 'users', userId, 'favorites');

    const unsubscribe = onSnapshot(
      favRef,
      (snapshot) => {
        const favList = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        })) as FirestoreFavorite[];
        setFavorites(favList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching favorites:', err?.message || err);
        setError('Favoriler yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Helper to check if an item is favorited
  const isFavorite = (type: 'artist' | 'provider', itemId: string): boolean => {
    return favorites.some(f => f.type === type && f.itemId === itemId);
  };

  return { favorites, loading, error, isFavorite };
}

/**
 * Toggle favorite status for an artist or provider
 */
export async function toggleFavorite(
  userId: string,
  type: 'artist' | 'provider',
  itemId: string,
  itemName: string,
  itemImage?: string
): Promise<boolean> {
  const favRef = collection(db, 'users', userId, 'favorites');

  // Check if already favorited
  const q = query(favRef, where('type', '==', type), where('itemId', '==', itemId));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // Remove from favorites
    await deleteDoc(snapshot.docs[0].ref);
    return false;
  } else {
    // Add to favorites
    await addDoc(favRef, {
      type,
      itemId,
      itemName,
      itemImage: itemImage || '',
      createdAt: Timestamp.now(),
    });
    return true;
  }
}

// ==================== OFFER REQUESTS ====================

export interface CreateOfferRequestParams {
  // Event info
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  eventCity?: string;
  eventDistrict?: string;
  eventVenue?: string;
  // Organizer info (legacy)
  organizerId: string;
  organizerName: string;
  organizerImage?: string;
  // Provider info (legacy)
  providerId: string;
  providerName: string;
  providerImage?: string;
  // Organizer company info (new)
  organizerCompanyId?: string;
  organizerCompanyName?: string;
  organizerCompanyLogo?: string;
  organizerUserId?: string;
  organizerUserName?: string;
  organizerUserRole?: string;
  // Provider company info (new)
  providerCompanyId?: string;
  providerCompanyName?: string;
  providerCompanyLogo?: string;
  providerUserId?: string;
  providerUserName?: string;
  providerUserRole?: string;
  // Artist info (for booking requests)
  artistId?: string;
  artistName?: string;
  artistImage?: string;
  // Request details
  serviceCategory: string;
  requestedBudget?: string;
  notes?: string;
  formData?: Record<string, any>;
  serviceDates?: string[];
}

/**
 * Create an offer request from organizer to provider
 */
export async function createOfferRequest(params: CreateOfferRequestParams): Promise<string> {
  const now = Timestamp.now();

  // Clean up undefined values - Firebase doesn't accept them
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined)
  );

  // Also clean up nested formData if present
  if (cleanParams.formData && typeof cleanParams.formData === 'object') {
    cleanParams.formData = Object.fromEntries(
      Object.entries(cleanParams.formData).filter(([_, value]) => value !== undefined)
    );
  }

  const offerData = {
    ...cleanParams,
    requestType: 'request',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  const offerRef = await addDoc(collection(db, 'offers'), offerData);

  // Also create a conversation between organizer and provider if it doesn't exist
  try {
    await createOrGetConversation(
      params.organizerId,
      params.organizerName,
      params.organizerImage || '',
      params.providerId,
      params.providerName,
      params.providerImage || '',
      params.serviceCategory
    );
  } catch (error: any) {
    console.warn('Error creating conversation:', error?.message || error);
  }

  return offerRef.id;
}

/**
 * Provider responds to a request with a quote
 */
export async function respondToOfferRequest(
  offerId: string,
  amount: number,
  message?: string,
  validDays: number = 7,
  inclusions?: string[],
  exclusions?: string[]
): Promise<void> {
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + validDays);
  const now = Timestamp.now();

  // Create history entry for provider's quote
  const historyEntry = {
    type: 'quote',
    by: 'provider',
    amount,
    message: message || null,
    timestamp: now,
  };

  const updateData: Record<string, any> = {
    amount,
    status: 'quoted',
    validUntil: Timestamp.fromDate(validUntil),
    updatedAt: now,
    offerHistory: arrayUnion(historyEntry),
  };

  // Only add message if it's defined (Firebase doesn't accept undefined)
  if (message !== undefined && message !== null && message !== '') {
    updateData.message = message;
  }

  if (inclusions && inclusions.length > 0) {
    updateData.inclusions = inclusions;
  }
  if (exclusions && exclusions.length > 0) {
    updateData.exclusions = exclusions;
  }

  await updateDoc(doc(db, 'offers', offerId), updateData);
}

/**
 * Organizer accepts or rejects a quote
 */
export async function respondToQuote(
  offerId: string,
  accept: boolean,
  message?: string
): Promise<void> {
  const updateData: Record<string, any> = {
    status: accept ? 'accepted' : 'rejected',
    updatedAt: Timestamp.now(),
  };

  // Only add responseMessage if it's defined (Firebase doesn't accept undefined)
  if (message !== undefined && message !== null) {
    updateData.responseMessage = message;
  }

  await updateDoc(doc(db, 'offers', offerId), updateData);
}

/**
 * Provider submits initial quote for a request
 * This is the first response from provider to organizer's request
 */
export async function submitProviderQuote(
  offerId: string,
  quoteAmount: number,
  message?: string
): Promise<void> {
  const updateData: Record<string, any> = {
    amount: quoteAmount,
    status: 'quoted',
    updatedAt: Timestamp.now(),
  };

  if (message) {
    updateData.responseMessage = message;
  }

  await updateDoc(doc(db, 'offers', offerId), updateData);
}

/**
 * Send a counter offer (negotiation between organizer and provider)
 * Use this after provider has already submitted initial quote
 */
export async function sendCounterOffer(
  offerId: string,
  counterAmount: number,
  counterBy: 'organizer' | 'provider',
  message?: string
): Promise<void> {
  // Validate state transition: can only counter from quoted or counter_offered
  const offerDoc = await getDoc(doc(db, 'offers', offerId));
  if (!offerDoc.exists()) {
    throw new Error('Teklif bulunamadı');
  }
  const currentData = offerDoc.data();
  const currentStatus = currentData?.status;
  if (currentStatus !== 'quoted' && currentStatus !== 'counter_offered') {
    throw new Error(`Bu durumda karşı teklif gönderilemez. Mevcut durum: ${currentStatus}`);
  }

  const now = Timestamp.now();

  // Create history entry for this counter offer
  const historyEntry = {
    type: 'counter',
    by: counterBy,
    amount: counterAmount,
    message: message || null,
    timestamp: now,
  };

  // Get existing history or create new array
  const existingHistory = currentData?.offerHistory || [];

  const updateData: Record<string, any> = {
    counterAmount,
    counterBy,
    counterAt: now,
    counterMessage: message || null,
    status: 'counter_offered',
    updatedAt: now,
    offerHistory: [...existingHistory, historyEntry],
  };

  await updateDoc(doc(db, 'offers', offerId), updateData);
}

/**
 * Valid state transitions for offer state machine:
 * pending -> quoted (provider submits quote)
 * quoted -> accepted | rejected | counter_offered
 * counter_offered -> accepted | rejected | counter_offered
 * accepted -> (terminal state)
 * rejected -> (terminal state)
 * expired -> (terminal state)
 * cancelled -> (terminal state)
 */
type OfferStatus = 'pending' | 'quoted' | 'counter_offered' | 'accepted' | 'rejected' | 'expired' | 'cancelled';

const VALID_TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  'pending': ['quoted', 'cancelled', 'accepted', 'rejected'], // accepted/rejected when organizer sends budget
  'quoted': ['accepted', 'rejected', 'counter_offered', 'expired'],
  'counter_offered': ['accepted', 'rejected', 'counter_offered', 'expired'],
  'accepted': [], // terminal
  'rejected': [], // terminal
  'expired': [], // terminal
  'cancelled': [], // terminal
};

function isValidTransition(from: OfferStatus, to: OfferStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) || false;
}

/**
 * Accept the current offer or counter offer
 * Sets final amount and marks as accepted
 */
export async function acceptOffer(
  offerId: string,
  acceptedBy: 'organizer' | 'provider'
): Promise<void> {
  const offerDoc = await getDoc(doc(db, 'offers', offerId));
  if (!offerDoc.exists()) {
    throw new Error('Teklif bulunamadı');
  }

  const data = offerDoc.data();
  const currentStatus = data?.status as OfferStatus;

  // Check valid transition
  if (!isValidTransition(currentStatus, 'accepted')) {
    throw new Error(`Bu durumda teklif kabul edilemez. Mevcut durum: ${currentStatus}`);
  }

  // Determine final amount: use counterAmount if exists, otherwise use amount or requestedBudget
  // For pending state (when organizer sends budget directly), use requestedBudget
  const requestedBudget = data?.requestedBudget ? parseInt(data.requestedBudget) : 0;
  const finalAmount = data?.counterAmount || data?.amount || requestedBudget || 0;

  await updateDoc(doc(db, 'offers', offerId), {
    status: 'accepted',
    acceptedBy,
    acceptedAt: Timestamp.now(),
    finalAmount,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Reject the current offer or counter offer
 */
export async function rejectOffer(
  offerId: string,
  rejectedBy: 'organizer' | 'provider',
  reason?: string
): Promise<void> {
  const offerDoc = await getDoc(doc(db, 'offers', offerId));
  if (!offerDoc.exists()) {
    throw new Error('Teklif bulunamadı');
  }

  const currentStatus = offerDoc.data()?.status as OfferStatus;

  // Can reject from quoted or counter_offered states
  if (!isValidTransition(currentStatus, 'rejected')) {
    throw new Error(`Bu durumda teklif reddedilemez. Mevcut durum: ${currentStatus}`);
  }

  const updateData: Record<string, any> = {
    status: 'rejected',
    rejectedBy,
    rejectedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  if (reason) {
    updateData.rejectionReason = reason;
  }

  await updateDoc(doc(db, 'offers', offerId), updateData);
}

/**
 * Cancel an offer (only from pending state)
 */
export async function cancelOffer(
  offerId: string,
  cancelledBy: 'organizer' | 'provider',
  reason?: string
): Promise<void> {
  const offerDoc = await getDoc(doc(db, 'offers', offerId));
  if (!offerDoc.exists()) {
    throw new Error('Teklif bulunamadı');
  }

  const currentStatus = offerDoc.data()?.status as OfferStatus;

  if (currentStatus !== 'pending') {
    throw new Error(`Sadece bekleyen teklifler iptal edilebilir. Mevcut durum: ${currentStatus}`);
  }

  const updateData: Record<string, any> = {
    status: 'cancelled',
    cancelledBy,
    cancelledAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  if (reason) {
    updateData.cancellationReason = reason;
  }

  await updateDoc(doc(db, 'offers', offerId), updateData);
}

/**
 * Hook to fetch offers for a provider (incoming requests)
 */
export function useProviderOffers(providerId: string | undefined) {
  const [offers, setOffers] = useState<FirestoreOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) {
      setOffers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'offers'),
      where('providerId', '==', providerId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const offersList = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
          validUntil: docSnap.data().validUntil?.toDate(),
        })) as FirestoreOffer[];

        // Sort by createdAt desc
        offersList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        setOffers(offersList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching provider offers:', err?.message || err);
        setError('Teklifler yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [providerId]);

  return { offers, loading, error };
}

/**
 * Hook to fetch provider's accepted/signed offer for a specific event
 * Returns the contract amount (finalAmount or amount) for the provider's job
 */
export function useProviderEventOffer(providerId: string | undefined, eventId: string | undefined, offerId?: string) {
  const [offer, setOffer] = useState<FirestoreOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have a specific offerId, fetch that directly
    if (offerId) {
      setLoading(true);
      const unsubscribe = onSnapshot(
        doc(db, 'offers', offerId),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const offerData = docToOffer(docSnapshot);
            console.log('[useProviderEventOffer] Found offer by ID:', {
              offerId: offerData.id,
              artistName: offerData.artistName,
              finalAmount: offerData.finalAmount,
              amount: offerData.amount,
            });
            setOffer(offerData);
          } else {
            console.log('[useProviderEventOffer] Offer not found by ID:', offerId);
            setOffer(null);
          }
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.warn('Error fetching offer by ID:', err?.message || err);
          setError('Teklif yüklenirken hata oluştu');
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }

    // Fallback: query by providerId and eventId
    if (!providerId || !eventId) {
      setOffer(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query for accepted offers for this provider and event
    const q = query(
      collection(db, 'offers'),
      where('providerId', '==', providerId),
      where('eventId', '==', eventId),
      where('status', '==', 'accepted')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          // Get the first accepted offer (there should only be one per event/provider)
          const offerData = docToOffer(snapshot.docs[0]);
          console.log('[useProviderEventOffer] Found accepted offer:', {
            offerId: offerData.id,
            artistName: offerData.artistName,
            finalAmount: offerData.finalAmount,
            amount: offerData.amount,
            contractSigned: offerData.contractSigned,
          });
          setOffer(offerData);
        } else {
          console.log('[useProviderEventOffer] No accepted offer found for provider:', providerId, 'event:', eventId);
          setOffer(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching provider event offer:', err?.message || err);
        setError('Teklif yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [providerId, eventId, offerId]);

  // Return the contract amount (finalAmount takes priority, then amount)
  const contractAmount = offer?.finalAmount ?? offer?.amount ?? 0;

  return { offer, contractAmount, loading, error };
}

/**
 * Hook to fetch a single offer by ID
 */
export function useOffer(offerId: string | undefined) {
  const [offer, setOffer] = useState<FirestoreOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offerId) {
      setOffer(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      doc(db, 'offers', offerId),
      (docSnap) => {
        if (docSnap.exists()) {
          setOffer(docToOffer(docSnap));
        } else {
          setOffer(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching offer:', err?.message || err);
        setError('Teklif yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [offerId]);

  return { offer, loading, error };
}

/**
 * Contract interface for the contracts list
 */
export interface UserContract {
  id: string;
  offerId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  serviceName: string;
  serviceCategory: string;
  otherPartyId: string;
  otherPartyName: string;
  otherPartyImage: string;
  amount: number;
  status: 'pending_signature' | 'signed' | 'completed' | 'cancelled';
  createdAt: Date;
  needsMySignature: boolean;
  contractSignedByProvider: boolean;
  contractSignedByOrganizer: boolean;
}

/**
 * Hook to fetch user's contracts (accepted offers)
 * Works for both providers and organizers
 */
export function useUserContracts(userId: string | undefined) {
  const [contracts, setContracts] = useState<UserContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setContracts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // We need to fetch offers where user is either provider or organizer
    // and status is 'accepted'
    // Since Firestore doesn't support OR queries easily, we'll do two queries

    const fetchContracts = async () => {
      try {
        // Query 1: User is provider
        const providerQuery = query(
          collection(db, 'offers'),
          where('providerId', '==', userId),
          where('status', '==', 'accepted')
        );

        // Query 2: User is organizer
        const organizerQuery = query(
          collection(db, 'offers'),
          where('organizerId', '==', userId),
          where('status', '==', 'accepted')
        );

        const [providerSnapshot, organizerSnapshot] = await Promise.all([
          getDocs(providerQuery),
          getDocs(organizerQuery)
        ]);

        // Combine results, avoiding duplicates
        const offerMap = new Map<string, FirestoreOffer>();

        providerSnapshot.docs.forEach(doc => {
          const offer = docToOffer(doc);
          offerMap.set(offer.id, offer);
        });

        organizerSnapshot.docs.forEach(doc => {
          const offer = docToOffer(doc);
          offerMap.set(offer.id, offer);
        });

        // Convert offers to contracts
        const contractsList: UserContract[] = [];
        const isUserProvider = (offer: FirestoreOffer) => offer.providerId === userId;

        offerMap.forEach((offer) => {
          const userIsProvider = isUserProvider(offer);

          // Determine contract status
          let status: UserContract['status'] = 'pending_signature';
          if (offer.contractSigned) {
            status = 'signed';
          } else if (offer.contractSignedByProvider && offer.contractSignedByOrganizer) {
            status = 'signed';
          }

          // Determine if user needs to sign
          const needsMySignature = userIsProvider
            ? !offer.contractSignedByProvider
            : !offer.contractSignedByOrganizer;

          contractsList.push({
            id: offer.contractId || offer.id,
            offerId: offer.id,
            eventId: offer.eventId,
            eventName: offer.eventTitle || 'Etkinlik',
            eventDate: offer.eventDate || '',
            serviceName: offer.artistName || offer.serviceCategory || 'Hizmet',
            serviceCategory: offer.serviceCategory || 'booking',
            otherPartyId: userIsProvider ? offer.organizerId : offer.providerId,
            otherPartyName: userIsProvider
              ? (offer.organizerCompanyName || offer.organizerName || 'Organizatör')
              : (offer.providerCompanyName || offer.providerName || 'Tedarikçi'),
            otherPartyImage: userIsProvider
              ? (offer.organizerCompanyLogo || offer.organizerImage || '')
              : (offer.providerCompanyLogo || offer.providerImage || ''),
            amount: offer.finalAmount || offer.counterAmount || offer.amount || 0,
            status,
            createdAt: offer.acceptedAt || offer.createdAt || new Date(),
            needsMySignature,
            contractSignedByProvider: offer.contractSignedByProvider || false,
            contractSignedByOrganizer: offer.contractSignedByOrganizer || false,
          });
        });

        // Sort by date (newest first)
        contractsList.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        console.log('[useUserContracts] Found contracts:', contractsList.length);
        setContracts(contractsList);
        setError(null);
      } catch (err: any) {
        console.warn('[useUserContracts] Error:', err?.message || err);
        setError('Sözleşmeler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [userId]);

  // Calculate stats
  const stats = {
    pending: contracts.filter(c => c.status === 'pending_signature').length,
    needsSignature: contracts.filter(c => c.needsMySignature).length,
    signed: contracts.filter(c => c.status === 'signed' || c.status === 'completed').length,
    totalValue: contracts
      .filter(c => c.status === 'signed' || c.status === 'completed')
      .reduce((sum, c) => sum + c.amount, 0),
  };

  return { contracts, stats, loading, error };
}

/**
 * Hook to fetch offers sent by organizer
 */
export function useOrganizerOffers(organizerId: string | undefined) {
  const [offers, setOffers] = useState<FirestoreOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizerId) {
      setOffers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'offers'),
      where('organizerId', '==', organizerId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const offersList = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
          validUntil: docSnap.data().validUntil?.toDate(),
        })) as FirestoreOffer[];

        // Sort by createdAt desc
        offersList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        setOffers(offersList);
        setLoading(false);
        setError(null);
      },
      (err: any) => {
        // Use console.warn to avoid red error screen
        console.warn('Error fetching organizer offers:', err?.message || err);
        setOffers([]);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [organizerId]);

  return { offers, loading, error };
}

/**
 * Debug version of syncOffersToEventServices that returns info
 */
export async function syncOffersToEventServicesWithDebug(eventId: string): Promise<{
  allOffers: number;
  acceptedOffers: number;
  services: string;
  updated: boolean;
  error?: string;
}> {
  const result = {
    allOffers: -1,
    acceptedOffers: -1,
    services: '',
    updated: false,
    error: undefined as string | undefined,
  };

  // First, try to read the event
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (eventDoc.exists()) {
      const data = eventDoc.data();
      const services = data?.services || [];
      result.services = services.map((s: any) => `${s.category}:${s.status}:${s.provider || 'yok'}`).join('\n') || 'Hizmet yok';
    } else {
      result.services = 'Event bulunamadı';
    }
  } catch (err: any) {
    result.services = `Event okuma hatası: ${err?.message}`;
  }

  // Try to query offers - need to include organizerId for security rules
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) {
      result.error = 'Event bulunamadı';
      return result;
    }
    const organizerId = eventDoc.data()?.organizerId;

    if (!organizerId) {
      result.error = 'Event organizerId yok';
      return result;
    }

    // Query offers with organizerId (required for security rules)
    const allOffersQuery = query(
      collection(db, 'offers'),
      where('eventId', '==', eventId),
      where('organizerId', '==', organizerId)
    );
    const allOffersSnapshot = await getDocs(allOffersQuery);
    result.allOffers = allOffersSnapshot.size;

    // Check accepted offers
    const acceptedQuery = query(
      collection(db, 'offers'),
      where('eventId', '==', eventId),
      where('organizerId', '==', organizerId),
      where('status', '==', 'accepted')
    );
    const acceptedSnapshot = await getDocs(acceptedQuery);
    result.acceptedOffers = acceptedSnapshot.size;

    // If we got here, try to sync
    if (result.acceptedOffers > 0) {
      await syncOffersToEventServices(eventId);
      result.updated = true;
    }
  } catch (err: any) {
    result.error = `Teklif okuma hatası: ${err?.code || ''} - ${err?.message || err}`;
  }

  return result;
}

/**
 * Sync accepted offers to event services
 * Uses organizerId in queries to satisfy Firebase security rules
 */
export async function syncOffersToEventServices(eventId: string): Promise<void> {
  console.log('[syncOffersToEventServices] Starting sync for event:', eventId);
  try {
    // First, fetch the event to get organizerId (needed for security rules)
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      console.log('[syncOffersToEventServices] Event not found:', eventId);
      return;
    }

    const eventData = eventDoc.data();
    const organizerId = eventData?.organizerId;

    if (!organizerId) {
      console.log('[syncOffersToEventServices] Event has no organizerId');
      return;
    }

    // Query offers with organizerId (required for Firebase security rules)
    const offersQuery = query(
      collection(db, 'offers'),
      where('eventId', '==', eventId),
      where('organizerId', '==', organizerId),
      where('status', '==', 'accepted')
    );
    const offersSnapshot = await getDocs(offersQuery);
    console.log('[syncOffersToEventServices] Found accepted offers:', offersSnapshot.size);

    if (offersSnapshot.empty) {
      console.log('[syncOffersToEventServices] No accepted offers found for event:', eventId);
      return;
    }

    let services = eventData?.services || [];
    let servicesUpdated = false;

    // Category mapping
    const categoryMapping: Record<string, string[]> = {
      'booking': ['artist', 'booking'],
      'artist': ['artist', 'booking'],
      'technical': ['sound-light', 'technical'],
      'sound-light': ['sound-light', 'technical'],
    };

    // IMPORTANT: Preserve all existing confirmed/contract_pending booking services
    // This prevents accidental deletion when syncing new offers
    const existingBookingServices = services.filter(
      (s: any) => (s.category === 'booking' || s.category === 'artist') &&
                  (s.status === 'confirmed' || s.status === 'contract_pending') &&
                  s.offerId // Only preserve services that have an offerId (came from accepted offers)
    );
    console.log('[syncOffersToEventServices] Preserving existing booking services:', existingBookingServices.length);

    // Process each accepted offer
    for (const offerDoc of offersSnapshot.docs) {
      const offer = offerDoc.data();
      const serviceCategory = offer.serviceCategory || 'other';
      const finalAmount = offer.finalAmount || offer.counterAmount || offer.amount || 0;

      // Determine service status based on contract signing
      const isContractSigned = offer.contractSigned === true ||
        (offer.contractSignedByOrganizer === true && offer.contractSignedByProvider === true);
      const serviceStatus = isContractSigned ? 'confirmed' : 'contract_pending';

      // First, check if this specific offer already has a service (by offerId)
      const existingServiceByOfferId = services.findIndex(
        (s: any) => s.offerId === offerDoc.id
      );

      if (existingServiceByOfferId !== -1) {
        // Update existing service for this offer (status might have changed)
        services[existingServiceByOfferId] = {
          ...services[existingServiceByOfferId],
          status: serviceStatus,
          price: finalAmount,
          contractId: offer.contractId || offerDoc.id,
        };
        servicesUpdated = true;
        continue;
      }

      // Check if this provider already has a confirmed service for this event
      const alreadyConfirmedForProvider = services.some(
        (s: any) => s.providerId === offer.providerId &&
                    s.offerId === offerDoc.id
      );

      if (alreadyConfirmedForProvider) {
        continue;
      }

      // For booking/artist category: Allow multiple artists
      // Each accepted offer creates its own service entry
      // For other categories: Find and update pending service OR add new

      const isBookingCategory = serviceCategory === 'booking' || serviceCategory === 'artist';

      if (isBookingCategory) {
        // For booking: Always add as new service (multiple artists allowed)
        services.push({
          id: `svc_${offerDoc.id}`,
          category: serviceCategory,
          name: offer.artistName || offer.providerName || 'Sanatçı',
          status: serviceStatus,
          price: finalAmount,
          provider: offer.providerName,
          providerId: offer.providerId,
          providerImage: offer.providerImage || offer.artistImage || '',
          providerPhone: offer.providerPhone || '',
          offerId: offerDoc.id,
          contractId: offer.contractId || offerDoc.id,
          // Store artist info separately for booking services
          artistId: offer.artistId,
          artistName: offer.artistName,
          artistImage: offer.artistImage,
        });
        servicesUpdated = true;
      } else {
        // For non-booking categories: Find pending service to update or add new
        const matchCategories = categoryMapping[serviceCategory] || [serviceCategory];
        const serviceIndex = services.findIndex(
          (s: any) => matchCategories.includes(s.category) &&
            (s.status === 'pending' || s.status === 'offered') &&
            !s.offerId // Only update services that don't have an offerId yet
        );

        if (serviceIndex !== -1) {
          services[serviceIndex] = {
            ...services[serviceIndex],
            status: serviceStatus,
            price: finalAmount,
            provider: offer.providerName,
            providerId: offer.providerId,
            providerImage: offer.providerImage || '',
            providerPhone: offer.providerPhone || '',
            name: offer.artistName || services[serviceIndex].name,
            offerId: offerDoc.id,
            contractId: offer.contractId || offerDoc.id,
          };
          servicesUpdated = true;
        } else {
          // Add new service
          const hasProviderService = services.some((s: any) => s.offerId === offerDoc.id);
          if (!hasProviderService) {
            services.push({
              id: `svc_${offerDoc.id}`,
              category: serviceCategory,
              name: offer.artistName || offer.providerName || serviceCategory,
              status: serviceStatus,
              price: finalAmount,
              provider: offer.providerName,
              providerId: offer.providerId,
              providerImage: offer.providerImage || '',
              providerPhone: offer.providerPhone || '',
              offerId: offerDoc.id,
              contractId: offer.contractId || offerDoc.id,
            });
            servicesUpdated = true;
          }
        }
      }
    }

    // SAFETY CHECK: Ensure all preserved booking services are still present
    // This prevents accidental deletion of existing artists
    for (const preservedService of existingBookingServices) {
      const stillExists = services.some((s: any) => s.offerId === preservedService.offerId);
      if (!stillExists) {
        console.log('[syncOffersToEventServices] Re-adding missing booking service:', preservedService.artistName || preservedService.name);
        services.push(preservedService);
        servicesUpdated = true;
      }
    }

    // Update event if services changed
    if (servicesUpdated) {
      console.log('[syncOffersToEventServices] Final services count:', services.length);
      console.log('[syncOffersToEventServices] Booking services:', services.filter((s: any) => s.category === 'booking' || s.category === 'artist').length);
      await updateDoc(eventRef, {
        services,
        updatedAt: Timestamp.now(),
      });
      console.log('[syncOffersToEventServices] Event services updated successfully');
    }
  } catch (error: any) {
    console.warn('[syncOffersToEventServices] Error:', error?.code, error?.message || error);
  }
}

// ============================================
// ARTIST TEAM MANAGEMENT
// ============================================

export interface ArtistTeamMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  roleCategory: string;
  notes?: string;
  status: 'active' | 'inactive';
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArtistRider {
  id: string;
  type: 'technical' | 'hospitality' | 'general';
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

/**
 * Hook to fetch artist team members
 */
export function useArtistTeam(artistId: string | undefined) {
  const [teamMembers, setTeamMembers] = useState<ArtistTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    if (!artistId) {
      setTeamMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const teamRef = collection(db, 'artists', artistId, 'team');
    const teamQuery = query(teamRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      teamQuery,
      (snapshot) => {
        const members = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || '',
            email: data.email,
            phone: data.phone,
            role: data.role || '',
            roleCategory: data.roleCategory || 'other',
            notes: data.notes,
            status: data.status || 'active',
            joinedAt: toDate(data.joinedAt),
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
          } as ArtistTeamMember;
        });
        setTeamMembers(members);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching artist team:', err?.message || err);
        setError('Ekip üyeleri yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [artistId, refreshKey]);

  return { teamMembers, loading, error, refetch };
}

/**
 * Add a team member to an artist
 */
export async function addArtistTeamMember(
  artistId: string,
  memberData: {
    name: string;
    email?: string;
    phone?: string;
    role: string;
    roleCategory: string;
    notes?: string;
  }
): Promise<string> {
  const teamRef = collection(db, 'artists', artistId, 'team');
  const now = Timestamp.now();

  const docRef = await addDoc(teamRef, {
    ...memberData,
    status: 'active',
    joinedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

/**
 * Remove a team member from an artist
 */
export async function removeArtistTeamMember(artistId: string, memberId: string): Promise<void> {
  const memberRef = doc(db, 'artists', artistId, 'team', memberId);
  await deleteDoc(memberRef);
}

/**
 * Hook to fetch artist riders
 */
export function useArtistRiders(artistId: string | undefined) {
  const [riders, setRiders] = useState<ArtistRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    if (!artistId) {
      setRiders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const ridersRef = collection(db, 'artists', artistId, 'riders');
    const ridersQuery = query(ridersRef, orderBy('uploadedAt', 'desc'));

    const unsubscribe = onSnapshot(
      ridersQuery,
      (snapshot) => {
        const ridersList = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            type: data.type || 'general',
            fileName: data.fileName || '',
            fileSize: data.fileSize || 0,
            mimeType: data.mimeType || 'application/pdf',
            url: data.url || '',
            uploadedAt: toDate(data.uploadedAt),
            uploadedBy: data.uploadedBy || '',
          } as ArtistRider;
        });
        setRiders(ridersList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching artist riders:', err?.message || err);
        setError('Rider dosyaları yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [artistId, refreshKey]);

  return { riders, loading, error, refetch };
}

/**
 * Upload a rider document for an artist
 */
export async function uploadArtistRider(
  artistId: string,
  riderData: {
    type: 'technical' | 'hospitality' | 'general';
    fileName: string;
    fileUri: string;
    fileSize: number;
    mimeType: string;
  }
): Promise<string> {
  // For now, store the file URI directly (in production, upload to Firebase Storage)
  // This is a simplified version - real implementation would upload to storage
  const ridersRef = collection(db, 'artists', artistId, 'riders');
  const now = Timestamp.now();

  const docRef = await addDoc(ridersRef, {
    type: riderData.type,
    fileName: riderData.fileName,
    fileSize: riderData.fileSize,
    mimeType: riderData.mimeType,
    url: riderData.fileUri, // In production, this would be the storage URL
    uploadedAt: now,
    uploadedBy: '', // Add current user ID in real implementation
  });

  return docRef.id;
}

/**
 * Delete a rider document from an artist
 */
export async function deleteArtistRider(artistId: string, riderId: string): Promise<void> {
  const riderRef = doc(db, 'artists', artistId, 'riders', riderId);
  // In production, also delete from Firebase Storage
  await deleteDoc(riderRef);
}

// Artist show type for display
export interface ArtistShow {
  id: string;
  offerId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  venue: string;
  city: string;
  organizerName: string;
  organizerImage?: string;
  contractAmount: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  eventImage?: string;
}

/**
 * Hook to fetch shows/events for a specific artist
 * Fetches accepted offers where artistId matches
 */
export function useArtistShows(artistId: string | undefined) {
  const [shows, setShows] = useState<ArtistShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistId) {
      setShows([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query offers where artistId matches and status is accepted
    const offersRef = collection(db, 'offers');
    const q = query(
      offersRef,
      where('artistId', '==', artistId),
      where('status', '==', 'accepted'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const showsList: ArtistShow[] = [];

        for (const offerDoc of snapshot.docs) {
          const offerData = offerDoc.data();

          // Determine show status based on event date
          let showStatus: 'upcoming' | 'completed' | 'cancelled' = 'upcoming';
          if (offerData.eventDate) {
            const eventDate = new Date(offerData.eventDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (eventDate < today) {
              showStatus = 'completed';
            }
          }

          showsList.push({
            id: offerDoc.id,
            offerId: offerDoc.id,
            eventId: offerData.eventId || '',
            eventTitle: offerData.eventTitle || offerData.eventName || 'Etkinlik',
            eventDate: offerData.eventDate || '',
            eventTime: offerData.eventTime,
            venue: offerData.eventVenue || offerData.venue || '',
            city: offerData.eventCity || '',
            organizerName: offerData.organizerName || 'Organizatör',
            organizerImage: offerData.organizerImage,
            contractAmount: offerData.finalAmount || offerData.amount || 0,
            status: showStatus,
            eventImage: offerData.eventImage,
          });
        }

        setShows(showsList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching artist shows:', err?.message || err);
        setError('Gösteriler yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [artistId]);

  return { shows, loading, error };
}
