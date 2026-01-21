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
  status: 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled';
  organizerId: string;
  // Organizer info (populated by useProviderJobs)
  organizerName?: string;
  organizerImage?: string;
  organizerPhone?: string;
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
  status: 'pending' | 'confirmed' | 'cancelled';
  price?: number;
}

export interface FirestoreOffer {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  eventCity?: string;
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
    endDate: data.endDate,
    city: data.city || '',
    district: data.district,
    venue: data.venue || '',
    venueAddress: data.venueAddress,
    status: data.status || 'draft',
    organizerId: data.organizerId || '',
    artistId: data.artistId,
    artistName: data.artistName,
    artistImage: data.artistImage,
    image: data.image,
    budget: data.budget,
    expectedAttendees: data.expectedAttendees,
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
    eventCity: data.eventCity,
    organizerId: data.organizerId || '',
    organizerName: data.organizerName || '',
    organizerImage: data.organizerImage,
    organizerPhone: data.organizerPhone,
    providerId: data.providerId || '',
    providerName: data.providerName || '',
    providerImage: data.providerImage,
    providerPhone: data.providerPhone,
    artistId: data.artistId,
    artistName: data.artistName,
    artistImage: data.artistImage,
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
    participantIds: data.participantIds || [],
    participantNames: data.participantNames || {},
    participantImages: data.participantImages || {},
    lastMessage: data.lastMessage || '',
    lastMessageAt: toDate(data.lastMessageAt),
    unreadCount: data.unreadCount || {},
    eventId: data.eventId,
    eventTitle: data.eventTitle,
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

  useEffect(() => {
    if (!providerId) {
      setJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query 1: Events where provider is in providerIds array
    const providerQuery = query(
      collection(db, 'events'),
      where('providerIds', 'array-contains', providerId)
    );

    // Query 2: Events where provider is the organizer (self-created events)
    const organizerQuery = query(
      collection(db, 'events'),
      where('organizerId', '==', providerId)
    );

    // Query 3: Offers where provider has accepted and contract is signed
    // This catches jobs from contracts signed before the providerIds fix
    const signedOffersQuery = query(
      collection(db, 'offers'),
      where('providerId', '==', providerId),
      where('status', '==', 'accepted')
    );

    // Run all queries
    const fetchJobs = async () => {
      try {
        const [providerSnapshot, organizerSnapshot, signedOffersSnapshot] = await Promise.all([
          getDocs(providerQuery),
          getDocs(organizerQuery),
          getDocs(signedOffersQuery)
        ]);

        // Build a map of eventId -> contractAmount from accepted offers
        const contractAmountMap = new Map<string, number>();
        signedOffersSnapshot.docs.forEach(d => {
          const data = d.data();
          if (data.eventId) {
            // Use finalAmount if available, otherwise use amount
            const amount = data.finalAmount ?? data.amount ?? 0;
            if (amount > 0) {
              contractAmountMap.set(data.eventId, amount);
            }
          }
        });

        console.log('[useProviderJobs] Contract amounts:', Object.fromEntries(contractAmountMap));

        // Combine results, avoiding duplicates
        const eventMap = new Map<string, FirestoreEvent>();

        console.log('[useProviderJobs] Provider query returned', providerSnapshot.docs.length, 'events');
        console.log('[useProviderJobs] Organizer query returned', organizerSnapshot.docs.length, 'events');
        console.log('[useProviderJobs] Signed offers query returned', signedOffersSnapshot.docs.length, 'offers');

        providerSnapshot.docs.forEach(docSnap => {
          const event = docToEvent(docSnap);
          // Add contract amount if available
          event.contractAmount = contractAmountMap.get(event.id);
          eventMap.set(docSnap.id, event);
        });

        organizerSnapshot.docs.forEach(docSnap => {
          if (!eventMap.has(docSnap.id)) {
            const event = docToEvent(docSnap);
            event.contractAmount = contractAmountMap.get(event.id);
            eventMap.set(docSnap.id, event);
          }
        });

        // Fetch events from signed offers (where contract is signed)
        const signedOfferDocs = signedOffersSnapshot.docs.filter(d => {
          const data = d.data();
          // Only include if contract is fully signed
          return data.contractSigned === true ||
                 (data.contractSignedByOrganizer === true && data.contractSignedByProvider === true);
        });

        const eventIdsFromOffers = signedOfferDocs
          .map(d => d.data().eventId)
          .filter((id): id is string => !!id && !eventMap.has(id));

        // Remove duplicates
        const uniqueEventIds = [...new Set(eventIdsFromOffers)];
        console.log('[useProviderJobs] Event IDs from signed offers:', uniqueEventIds);

        // Fetch these events
        if (uniqueEventIds.length > 0) {
          const eventPromises = uniqueEventIds.map(async (eventId) => {
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
            if (eventData && !eventMap.has(eventData.id)) {
              const event = docToEvent({ id: eventData.id, data: () => eventData });
              // Add contract amount
              event.contractAmount = contractAmountMap.get(event.id);
              eventMap.set(eventData.id, event);
            }
          });
        }

        // Fetch organizer data for all jobs
        const organizerIds = [...new Set(Array.from(eventMap.values()).map(e => e.organizerId).filter(Boolean))];
        console.log('[useProviderJobs] Fetching organizer data for:', organizerIds);

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

        // Add organizer info to each event
        eventMap.forEach((event, eventId) => {
          const orgInfo = organizerMap.get(event.organizerId);
          if (orgInfo) {
            event.organizerName = orgInfo.name;
            event.organizerImage = orgInfo.image;
            event.organizerPhone = orgInfo.phone;
          }
        });

        // Sort by date descending (client-side)
        const jobsList = Array.from(eventMap.values()).sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        console.log('[useProviderJobs] Total jobs:', jobsList.length);
        setJobs(jobsList);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.warn('Error fetching provider jobs:', err?.message || err);
        setError('İşler yüklenirken hata oluştu');
        setLoading(false);
      }
    };

    fetchJobs();
  }, [providerId]);

  return { jobs, loading, error };
}

/**
 * Hook to fetch offers (for organizer or provider)
 */
export function useOffers(userId: string | undefined, role: 'organizer' | 'provider') {
  const [offers, setOffers] = useState<FirestoreOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // Sort client-side by createdAt desc
        const offersList = snapshot.docs
          .map(docToOffer)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
  }, [userId, role]);

  return { offers, loading, error };
}

/**
 * Hook to fetch conversations
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

    // Use simple query without orderBy to avoid composite index requirement
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Sort client-side by lastMessageAt desc
        const convList = snapshot.docs
          .map(docToConversation)
          .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
        setConversations(convList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching conversations:', err?.message || err);
        setError('Mesajlar yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
      const activeJobs = jobs.filter(j => j.status === 'confirmed' || j.status === 'planning');
      const completedJobs = jobs.filter(j => j.status === 'completed');
      const upcoming = jobs
        .filter(j => new Date(j.date) >= now && j.status !== 'cancelled')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

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
        ? Math.round((completedJobs.length / nonCancelledJobs.length) * 100)
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

      setStats({
        totalJobs: jobs.length,
        activeJobs: activeJobs.length,
        completedJobs: completedJobs.length,
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
  bio?: string;
  city?: string;
  website?: string;
  providerServices: string[];
  isVerified: boolean;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  completedJobs?: number;
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
    bio: data.bio,
    city: data.city,
    website: data.website,
    providerServices: data.providerServices || [],
    isVerified: data.isVerified || false,
    isActive: data.isActive !== false,
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    completedJobs: data.completedJobs || 0,
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
    participants: data.participants || [],
    participantNames: data.participantNames || {},
    participantImages: data.participantImages || {},
    lastMessage: data.lastMessage || '',
    lastMessageTime: toDate(data.lastMessageTime),
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
        setConversations(convList);
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

  // Update conversation's last message (use lastMessageAt for existing hook compatibility)
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: message.text || (message.type === 'offer' ? 'Teklif gönderildi' : message.type === 'meeting' ? 'Toplantı daveti' : 'Dosya gönderildi'),
    lastMessageAt: Timestamp.now(),
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

export async function createOrGetConversation(
  userId: string,
  userName: string,
  userImage: string,
  otherUserId: string,
  otherUserName: string,
  otherUserImage: string,
  serviceCategory?: string
): Promise<string> {
  // Generate deterministic conversation ID to prevent race conditions
  const conversationId = generateConversationId(userId, otherUserId);
  const conversationRef = doc(db, 'conversations', conversationId);

  // Check if conversation already exists
  const existingDoc = await getDoc(conversationRef);

  if (existingDoc.exists()) {
    // Update participant info in case names/images have changed
    await updateDoc(conversationRef, {
      [`participantNames.${userId}`]: userName,
      [`participantNames.${otherUserId}`]: otherUserName,
      [`participantImages.${userId}`]: userImage || '',
      [`participantImages.${otherUserId}`]: otherUserImage || '',
    });
    return conversationId;
  }

  // Create new conversation with deterministic ID using setDoc
  // This prevents duplicates even if two users create simultaneously
  const now = Timestamp.now();
  await setDoc(conversationRef, {
    participantIds: [userId, otherUserId].sort(), // Sorted for consistency
    participantNames: {
      [userId]: userName,
      [otherUserId]: otherUserName,
    },
    participantImages: {
      [userId]: userImage || '',
      [otherUserId]: otherUserImage || '',
    },
    lastMessage: '',
    lastMessageAt: now,
    unreadCount: {
      [userId]: 0,
      [otherUserId]: 0,
    },
    createdAt: now,
  });

  // Add welcome message
  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderId: 'system',
    text: `Sohbet başlatıldı. ${otherUserName} ile iletişime geçebilirsiniz.`,
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
  // Organizer info
  organizerId: string;
  organizerName: string;
  organizerImage?: string;
  // Provider info
  providerId: string;
  providerName: string;
  providerImage?: string;
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
  'pending': ['quoted', 'cancelled'],
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

  // Can only accept from quoted or counter_offered states
  if (!isValidTransition(currentStatus, 'accepted')) {
    throw new Error(`Bu durumda teklif kabul edilemez. Mevcut durum: ${currentStatus}`);
  }

  // Determine final amount: use counterAmount if exists, otherwise use amount
  const finalAmount = data?.counterAmount || data?.amount || 0;

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
export function useProviderEventOffer(providerId: string | undefined, eventId: string | undefined) {
  const [offer, setOffer] = useState<FirestoreOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [providerId, eventId]);

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

    // Process each accepted offer
    for (const offerDoc of offersSnapshot.docs) {
      const offer = offerDoc.data();
      const serviceCategory = offer.serviceCategory || 'other';
      const matchCategories = categoryMapping[serviceCategory] || [serviceCategory];
      const finalAmount = offer.finalAmount || offer.counterAmount || offer.amount || 0;

      // Check if already confirmed for this provider
      const alreadyConfirmed = services.some(
        (s: any) => s.providerId === offer.providerId && s.status === 'confirmed'
      );

      if (alreadyConfirmed) {
        continue;
      }

      // Find a pending service with matching category
      const serviceIndex = services.findIndex(
        (s: any) => matchCategories.includes(s.category) && (s.status === 'pending' || s.status === 'offered')
      );

      if (serviceIndex !== -1) {
        services[serviceIndex] = {
          ...services[serviceIndex],
          status: 'confirmed',
          price: finalAmount,
          provider: offer.providerName || offer.artistName,
          providerId: offer.providerId,
          providerImage: offer.providerImage || '',
          providerPhone: offer.providerPhone || '',
          name: offer.artistName || services[serviceIndex].name,
        };
        servicesUpdated = true;
      } else {
        // Add new service if no match
        const hasProviderService = services.some((s: any) => s.providerId === offer.providerId);
        if (!hasProviderService) {
          services.push({
            id: `svc_${offerDoc.id}`,
            category: serviceCategory,
            name: offer.artistName || offer.providerName || serviceCategory,
            status: 'confirmed',
            price: finalAmount,
            provider: offer.providerName,
            providerId: offer.providerId,
            providerImage: offer.providerImage || '',
            providerPhone: offer.providerPhone || '',
          });
          servicesUpdated = true;
        }
      }
    }

    // Update event if services changed
    if (servicesUpdated) {
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
