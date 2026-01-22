/**
 * Offline Data Hooks
 *
 * React hooks for accessing WatermelonDB data with offline support.
 * These hooks provide real-time updates from the local database
 * and automatic sync with Firestore when online.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Q, Query } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/hooks';

import { getDatabase } from '../database';
import { TableNames, SyncOperations } from '../database/schema';
import {
  Event,
  Offer,
  Artist,
  Conversation,
  Message,
} from '../database/models';
import {
  addToSyncQueue,
  pullFromFirestore,
  processSyncQueue,
  getSyncStatus,
} from '../services/sync';
import { useAuth } from '../context/AuthContext';

// Types
export interface UseOfflineDataResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isOffline: boolean;
}

export interface UseOfflineItemResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for observing a collection with real-time updates
 */
export function useOfflineCollection<T>(
  tableName: string,
  queryFn?: (collection: any) => Query<any>
): UseOfflineDataResult<T> {
  const database = useDatabase();
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Create query
  const query = useMemo(() => {
    const collection = database.get(tableName);
    return queryFn ? queryFn(collection) : collection.query();
  }, [database, tableName, queryFn]);

  // Subscribe to query changes
  useEffect(() => {
    setIsLoading(true);

    const subscription = query.observe().subscribe({
      next: (records) => {
        setData(records as T[]);
        setIsLoading(false);
        setError(null);
      },
      error: (err) => {
        console.error(`[useOfflineCollection] Error observing ${tableName}:`, err);
        setError(err);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [query, tableName]);

  // Refresh from Firestore
  const refresh = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      await pullFromFirestore(tableName, user.uid);
    } catch (err: any) {
      console.error(`[useOfflineCollection] Error refreshing ${tableName}:`, err);
      setError(err);
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  }, [tableName, user?.uid]);

  return { data, isLoading, error, refresh, isOffline };
}

/**
 * Hook for observing a single record by ID
 */
export function useOfflineItem<T>(
  tableName: string,
  id: string | undefined
): UseOfflineItemResult<T> {
  const database = useDatabase();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const collection = database.get(tableName);
    const subscription = collection.findAndObserve(id).subscribe({
      next: (record) => {
        setData(record as T);
        setIsLoading(false);
        setError(null);
      },
      error: (err) => {
        console.error(`[useOfflineItem] Error observing ${tableName}/${id}:`, err);
        setError(err);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [database, tableName, id]);

  const refresh = useCallback(async () => {
    // Single item refresh would require fetching from Firestore by ID
    // For now, just re-trigger the query
  }, []);

  return { data, isLoading, error, refresh };
}

/**
 * Hook for user's events
 */
export function useOfflineEvents(): UseOfflineDataResult<Event> & {
  createEvent: (data: Partial<Event>) => Promise<Event>;
} {
  const { user } = useAuth();
  const database = useDatabase();

  const queryFn = useCallback(
    (collection: any) =>
      collection.query(
        Q.where('organizer_id', user?.uid || ''),
        Q.where('status', Q.notEq('deleted')),
        Q.sortBy('start_date', Q.desc)
      ),
    [user?.uid]
  );

  const result = useOfflineCollection<Event>(TableNames.EVENTS, queryFn);

  const createEvent = useCallback(
    async (data: Partial<Event>): Promise<Event> => {
      const eventsCollection = database.get<Event>(TableNames.EVENTS);

      const event = await database.write(async () => {
        return await eventsCollection.create((e: any) => {
          e.firebaseId = ''; // Will be set after sync
          e.organizerId = user?.uid || '';
          e.title = data.title || '';
          e.description = data.description;
          e.eventType = data.eventType || 'other';
          e.status = 'draft';
          e.venueName = data.venueName;
          e.venueAddress = data.venueAddress;
          e.venueCity = data.venueCity;
          e.startDate = data.startDate || Date.now();
          e.endDate = data.endDate;
          e.guestCount = data.guestCount;
          e.budgetMin = data.budgetMin;
          e.budgetMax = data.budgetMax;
          e.imageUrl = data.imageUrl;
          e.isPublic = data.isPublic ?? true;
          e.createdAtTimestamp = Date.now();
          e.updatedAtTimestamp = Date.now();
          e.isDirty = true;
        });
      });

      // Add to sync queue
      await addToSyncQueue(
        TableNames.EVENTS,
        event.id,
        SyncOperations.CREATE,
        event.toFirestoreData()
      );

      return event;
    },
    [database, user?.uid]
  );

  return { ...result, createEvent };
}

/**
 * Hook for user's offers (as organizer or provider)
 */
export function useOfflineOffers(
  role: 'organizer' | 'provider' = 'organizer'
): UseOfflineDataResult<Offer> {
  const { user } = useAuth();

  const queryFn = useCallback(
    (collection: any) => {
      const userField = role === 'organizer' ? 'organizer_id' : 'provider_id';
      return collection.query(
        Q.where(userField, user?.uid || ''),
        Q.sortBy('updated_at', Q.desc)
      );
    },
    [user?.uid, role]
  );

  return useOfflineCollection<Offer>(TableNames.OFFERS, queryFn);
}

/**
 * Hook for provider's artists
 */
export function useOfflineArtists(): UseOfflineDataResult<Artist> & {
  createArtist: (data: Partial<Artist>) => Promise<Artist>;
} {
  const { user } = useAuth();
  const database = useDatabase();

  const queryFn = useCallback(
    (collection: any) =>
      collection.query(
        Q.where('provider_id', user?.uid || ''),
        Q.sortBy('name', Q.asc)
      ),
    [user?.uid]
  );

  const result = useOfflineCollection<Artist>(TableNames.ARTISTS, queryFn);

  const createArtist = useCallback(
    async (data: Partial<Artist>): Promise<Artist> => {
      const artistsCollection = database.get<Artist>(TableNames.ARTISTS);

      const artist = await database.write(async () => {
        return await artistsCollection.create((a: any) => {
          a.firebaseId = '';
          a.providerId = user?.uid || '';
          a.name = data.name || '';
          a.stageName = data.stageName;
          a.bio = data.bio;
          a.genre = data.genre;
          a.genresJson = data.genresJson;
          a.profileImage = data.profileImage;
          a.coverImage = data.coverImage;
          a.hourlyRate = data.hourlyRate;
          a.minBookingHours = data.minBookingHours;
          a.rating = 0;
          a.reviewCount = 0;
          a.isVerified = false;
          a.isFeatured = false;
          a.city = data.city;
          a.socialLinksJson = data.socialLinksJson;
          a.createdAtTimestamp = Date.now();
          a.updatedAtTimestamp = Date.now();
          a.isDirty = true;
        });
      });

      await addToSyncQueue(
        TableNames.ARTISTS,
        artist.id,
        SyncOperations.CREATE,
        artist.toFirestoreData()
      );

      return artist;
    },
    [database, user?.uid]
  );

  return { ...result, createArtist };
}

/**
 * Hook for user's conversations
 */
export function useOfflineConversations(): UseOfflineDataResult<Conversation> {
  const { user } = useAuth();

  const queryFn = useCallback(
    (collection: any) =>
      collection.query(
        Q.where('is_archived', false),
        Q.sortBy('last_message_at', Q.desc)
      ),
    []
  );

  const result = useOfflineCollection<Conversation>(
    TableNames.CONVERSATIONS,
    queryFn
  );

  // Filter by participant after fetching
  const filteredData = useMemo(
    () => result.data.filter((conv) => conv.isParticipant(user?.uid || '')),
    [result.data, user?.uid]
  );

  return { ...result, data: filteredData };
}

/**
 * Hook for messages in a conversation
 */
export function useOfflineMessages(
  conversationId: string | undefined
): UseOfflineDataResult<Message> & {
  sendMessage: (content: string, type?: string) => Promise<Message>;
} {
  const { user } = useAuth();
  const database = useDatabase();

  const queryFn = useCallback(
    (collection: any) =>
      collection.query(
        Q.where('conversation_id', conversationId || ''),
        Q.sortBy('created_at', Q.asc)
      ),
    [conversationId]
  );

  const result = useOfflineCollection<Message>(TableNames.MESSAGES, queryFn);

  const sendMessage = useCallback(
    async (content: string, type: string = 'text'): Promise<Message> => {
      if (!conversationId || !user?.uid) {
        throw new Error('Missing conversation or user');
      }

      const messagesCollection = database.get<Message>(TableNames.MESSAGES);
      const conversationsCollection = database.get<Conversation>(
        TableNames.CONVERSATIONS
      );

      const message = await database.write(async () => {
        // Create message
        const msg = await messagesCollection.create((m: any) => {
          m.firebaseId = '';
          m.conversationId = conversationId;
          m.senderId = user.uid;
          m.content = content;
          m.messageType = type;
          m.isRead = false;
          m.createdAtTimestamp = Date.now();
          m.isDirty = true;
          m.isPending = true;
        });

        // Update conversation last message
        const conversation = await conversationsCollection.find(conversationId);
        await conversation.updateLastMessage(content, user.uid);

        return msg;
      });

      await addToSyncQueue(
        TableNames.MESSAGES,
        message.id,
        SyncOperations.CREATE,
        message.toFirestoreData()
      );

      return message;
    },
    [database, conversationId, user?.uid]
  );

  return { ...result, sendMessage };
}

/**
 * Hook for sync status
 */
export function useSyncStatus() {
  const [status, setStatus] = useState(getSyncStatus());
  const { user } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getSyncStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const triggerSync = useCallback(async () => {
    await processSyncQueue();
    setStatus(getSyncStatus());
  }, []);

  const refreshAll = useCallback(async () => {
    if (!user?.uid) return;

    const tables = [
      TableNames.EVENTS,
      TableNames.OFFERS,
      TableNames.ARTISTS,
      TableNames.CONVERSATIONS,
    ];

    for (const table of tables) {
      try {
        await pullFromFirestore(table, user.uid);
      } catch (error) {
        console.error(`[useSyncStatus] Error refreshing ${table}:`, error);
      }
    }

    await processSyncQueue();
    setStatus(getSyncStatus());
  }, [user?.uid]);

  return {
    ...status,
    triggerSync,
    refreshAll,
  };
}

/**
 * Hook for pending sync count
 */
export function usePendingSyncCount(): number {
  const database = useDatabase();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const syncQueueCollection = database.get(TableNames.SYNC_QUEUE);
    const query = syncQueueCollection.query(
      Q.where('status', Q.oneOf(['pending', 'processing', 'failed']))
    );

    const subscription = query.observeCount().subscribe({
      next: setCount,
      error: console.error,
    });

    return () => subscription.unsubscribe();
  }, [database]);

  return count;
}

export default {
  useOfflineCollection,
  useOfflineItem,
  useOfflineEvents,
  useOfflineOffers,
  useOfflineArtists,
  useOfflineConversations,
  useOfflineMessages,
  useSyncStatus,
  usePendingSyncCount,
};
