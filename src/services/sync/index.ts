/**
 * Sync Service
 *
 * Handles synchronization between WatermelonDB (local) and Firestore (remote).
 * Implements offline-first architecture with conflict resolution.
 */

import { Q } from '@nozbe/watermelondb';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import NetInfo from '@react-native-community/netinfo';

import { db as firestore } from '../firebase/config';
import { getDatabase, getCollection } from '../../database';
import {
  TableNames,
  SyncOperations,
  SyncStatus,
  type SyncOperation,
} from '../../database/schema';
import {
  Event,
  Offer,
  Artist,
  Conversation,
  Message,
  SyncQueue,
  SyncQueueQueries,
  MAX_RETRY_ATTEMPTS,
} from '../../database/models';

// Sync configuration
const SYNC_BATCH_SIZE = 50;
const SYNC_INTERVAL_MS = 30000; // 30 seconds

// Sync state
let isSyncing = false;
let syncIntervalId: NodeJS.Timeout | null = null;
let lastSyncTime: number | null = null;

/**
 * Check if device is online
 */
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable === true;
}

/**
 * Add an operation to the sync queue
 */
export async function addToSyncQueue(
  tableName: string,
  recordId: string,
  operation: SyncOperation,
  data: Record<string, any>,
  firebaseId?: string
): Promise<void> {
  const database = getDatabase();
  const syncQueueCollection = database.get<SyncQueue>(TableNames.SYNC_QUEUE);

  await database.write(async () => {
    // Check if there's already a pending operation for this record
    const existing = await syncQueueCollection
      .query(
        Q.where('table_name', tableName),
        Q.where('record_id', recordId),
        Q.where('status', Q.oneOf([SyncStatus.PENDING, SyncStatus.PROCESSING]))
      )
      .fetch();

    if (existing.length > 0) {
      // Update existing queue item
      const item = existing[0];
      await item.updateData({ ...item.data, ...data });
      console.log(`[Sync] Updated existing queue item for ${tableName}/${recordId}`);
    } else {
      // Create new queue item
      await syncQueueCollection.create((item) => {
        item.tableName = tableName;
        item.recordId = recordId;
        item.firebaseId = firebaseId;
        item.operation = operation;
        item.dataJson = JSON.stringify(data);
        item.createdAtTimestamp = Date.now();
        item.attempts = 0;
        item.status = SyncStatus.PENDING;
      });
      console.log(`[Sync] Added to queue: ${operation} ${tableName}/${recordId}`);
    }
  });

  // Trigger immediate sync if online
  if (await isOnline()) {
    processSyncQueue();
  }
}

/**
 * Process pending items in the sync queue
 */
export async function processSyncQueue(): Promise<{
  processed: number;
  failed: number;
  remaining: number;
}> {
  if (isSyncing) {
    console.log('[Sync] Already syncing, skipping');
    return { processed: 0, failed: 0, remaining: 0 };
  }

  if (!(await isOnline())) {
    console.log('[Sync] Offline, skipping sync');
    return { processed: 0, failed: 0, remaining: 0 };
  }

  isSyncing = true;
  let processed = 0;
  let failed = 0;

  try {
    const database = getDatabase();
    const syncQueueCollection = database.get<SyncQueue>(TableNames.SYNC_QUEUE);

    // Get pending items
    const pendingItems = await syncQueueCollection
      .query(...SyncQueueQueries.retryable())
      .fetch();

    console.log(`[Sync] Processing ${pendingItems.length} pending items`);

    for (const item of pendingItems.slice(0, SYNC_BATCH_SIZE)) {
      try {
        await item.markAsProcessing();
        await processQueueItem(item);
        await item.markAsCompleted();
        processed++;
      } catch (error: any) {
        console.error(`[Sync] Error processing ${item.tableName}/${item.recordId}:`, error);
        await item.markAsFailed(error.message || 'Unknown error');
        failed++;
      }
    }

    // Get remaining count
    const remaining = await syncQueueCollection
      .query(...SyncQueueQueries.pending())
      .fetchCount();

    lastSyncTime = Date.now();
    console.log(`[Sync] Completed: ${processed} processed, ${failed} failed, ${remaining} remaining`);

    return { processed, failed, remaining };
  } finally {
    isSyncing = false;
  }
}

/**
 * Process a single sync queue item
 */
async function processQueueItem(item: SyncQueue): Promise<void> {
  const { tableName, operation, data, firebaseId } = item;

  switch (operation) {
    case SyncOperations.CREATE:
      await syncCreate(tableName, data);
      break;
    case SyncOperations.UPDATE:
      if (!firebaseId) throw new Error('Firebase ID required for update');
      await syncUpdate(tableName, firebaseId, data);
      break;
    case SyncOperations.DELETE:
      if (!firebaseId) throw new Error('Firebase ID required for delete');
      await syncDelete(tableName, firebaseId);
      break;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

/**
 * Sync a create operation to Firestore
 */
async function syncCreate(tableName: string, data: Record<string, any>): Promise<string> {
  const collectionName = getFirestoreCollectionName(tableName);
  const docRef = doc(collection(firestore, collectionName));

  await setDoc(docRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  console.log(`[Sync] Created ${collectionName}/${docRef.id}`);
  return docRef.id;
}

/**
 * Sync an update operation to Firestore
 */
async function syncUpdate(
  tableName: string,
  firebaseId: string,
  data: Record<string, any>
): Promise<void> {
  const collectionName = getFirestoreCollectionName(tableName);
  const docRef = doc(firestore, collectionName, firebaseId);

  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });

  console.log(`[Sync] Updated ${collectionName}/${firebaseId}`);
}

/**
 * Sync a delete operation to Firestore
 */
async function syncDelete(tableName: string, firebaseId: string): Promise<void> {
  const collectionName = getFirestoreCollectionName(tableName);
  const docRef = doc(firestore, collectionName, firebaseId);

  await deleteDoc(docRef);

  console.log(`[Sync] Deleted ${collectionName}/${firebaseId}`);
}

/**
 * Pull changes from Firestore to local database
 */
export async function pullFromFirestore(
  tableName: string,
  userId: string,
  options: {
    since?: Date;
    limit?: number;
  } = {}
): Promise<number> {
  if (!(await isOnline())) {
    console.log('[Sync] Offline, skipping pull');
    return 0;
  }

  const collectionName = getFirestoreCollectionName(tableName);
  const database = getDatabase();
  let pulled = 0;

  try {
    // Build query
    const constraints: any[] = [];

    // Add user-specific filter based on table
    switch (tableName) {
      case TableNames.EVENTS:
        constraints.push(where('organizerId', '==', userId));
        break;
      case TableNames.OFFERS:
        // Get both organizer and provider offers
        // This would need to be two queries in practice
        constraints.push(where('organizerId', '==', userId));
        break;
      case TableNames.CONVERSATIONS:
        constraints.push(where('participantIds', 'array-contains', userId));
        break;
      case TableNames.ARTISTS:
        constraints.push(where('providerId', '==', userId));
        break;
    }

    // Add time filter if specified
    if (options.since) {
      constraints.push(where('updatedAt', '>', Timestamp.fromDate(options.since)));
    }

    // Add ordering and limit
    constraints.push(orderBy('updatedAt', 'desc'));
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    const q = query(collection(firestore, collectionName), ...constraints);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`[Sync] No new ${collectionName} to pull`);
      return 0;
    }

    // Process documents
    await database.write(async () => {
      const localCollection = database.get(tableName);

      for (const docSnapshot of snapshot.docs) {
        const remoteData = docSnapshot.data();
        const firebaseId = docSnapshot.id;

        // Check if record exists locally
        const existingRecords = await localCollection
          .query(Q.where('firebase_id', firebaseId))
          .fetch();

        if (existingRecords.length > 0) {
          // Update existing record
          const record = existingRecords[0];
          const localUpdatedAt = (record as any).updatedAtTimestamp || 0;
          const remoteUpdatedAt = remoteData.updatedAt?.toMillis() || 0;

          // Only update if remote is newer and local isn't dirty
          if (remoteUpdatedAt > localUpdatedAt && !(record as any).isDirty) {
            await record.update((r: any) => {
              applyFirestoreDataToModel(r, remoteData, tableName);
              r.syncedAt = Date.now();
            });
            pulled++;
          }
        } else {
          // Create new local record
          await localCollection.create((r: any) => {
            r.firebaseId = firebaseId;
            applyFirestoreDataToModel(r, remoteData, tableName);
            r.syncedAt = Date.now();
            r.isDirty = false;
          });
          pulled++;
        }
      }
    });

    console.log(`[Sync] Pulled ${pulled} ${collectionName}`);
    return pulled;
  } catch (error) {
    console.error(`[Sync] Error pulling ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Apply Firestore document data to a WatermelonDB model
 */
function applyFirestoreDataToModel(
  model: any,
  data: Record<string, any>,
  tableName: string
): void {
  switch (tableName) {
    case TableNames.EVENTS:
      model.organizerId = data.organizerId;
      model.title = data.title;
      model.description = data.description;
      model.eventType = data.eventType;
      model.status = data.status;
      model.venueName = data.venue?.name;
      model.venueAddress = data.venue?.address;
      model.venueCity = data.venue?.city;
      model.latitude = data.venue?.coordinates?.lat;
      model.longitude = data.venue?.coordinates?.lng;
      model.startDate = data.startDate?.toMillis?.() || data.startDate;
      model.endDate = data.endDate?.toMillis?.() || data.endDate;
      model.guestCount = data.guestCount;
      model.budgetMin = data.budget?.min;
      model.budgetMax = data.budget?.max;
      model.imageUrl = data.imageUrl;
      model.isPublic = data.isPublic ?? true;
      model.createdAtTimestamp = data.createdAt?.toMillis?.() || Date.now();
      model.updatedAtTimestamp = data.updatedAt?.toMillis?.() || Date.now();
      break;

    case TableNames.OFFERS:
      model.eventId = data.eventId;
      model.providerId = data.providerId;
      model.organizerId = data.organizerId;
      model.artistId = data.artistId;
      model.serviceType = data.serviceType;
      model.status = data.status;
      model.requestedPrice = data.pricing?.requested;
      model.offeredPrice = data.pricing?.offered;
      model.finalPrice = data.pricing?.final;
      model.message = data.message;
      model.providerNote = data.providerNote;
      model.performanceDate = data.performance?.date?.toMillis?.();
      model.performanceDuration = data.performance?.duration;
      model.createdAtTimestamp = data.createdAt?.toMillis?.() || Date.now();
      model.updatedAtTimestamp = data.updatedAt?.toMillis?.() || Date.now();
      model.respondedAt = data.respondedAt?.toMillis?.();
      break;

    case TableNames.ARTISTS:
      model.providerId = data.providerId;
      model.name = data.name;
      model.stageName = data.stageName;
      model.bio = data.bio;
      model.genre = data.genre;
      model.genresJson = data.genres ? JSON.stringify(data.genres) : null;
      model.profileImage = data.profileImage;
      model.coverImage = data.coverImage;
      model.hourlyRate = data.pricing?.hourlyRate;
      model.minBookingHours = data.pricing?.minBookingHours;
      model.rating = data.rating;
      model.reviewCount = data.reviewCount;
      model.isVerified = data.isVerified ?? false;
      model.isFeatured = data.isFeatured ?? false;
      model.city = data.city;
      model.socialLinksJson = data.socialLinks ? JSON.stringify(data.socialLinks) : null;
      model.createdAtTimestamp = data.createdAt?.toMillis?.() || Date.now();
      model.updatedAtTimestamp = data.updatedAt?.toMillis?.() || Date.now();
      break;

    case TableNames.CONVERSATIONS:
      model.participantIdsJson = JSON.stringify(data.participantIds || []);
      model.eventId = data.eventId;
      model.offerId = data.offerId;
      model.lastMessage = data.lastMessage;
      model.lastMessageAt = data.lastMessageAt?.toMillis?.();
      model.lastSenderId = data.lastSenderId;
      model.unreadCount = data.unreadCount || 0;
      model.isArchived = data.isArchived ?? false;
      model.createdAtTimestamp = data.createdAt?.toMillis?.() || Date.now();
      model.updatedAtTimestamp = data.updatedAt?.toMillis?.() || Date.now();
      break;

    case TableNames.MESSAGES:
      model.conversationId = data.conversationId;
      model.senderId = data.senderId;
      model.content = data.content;
      model.messageType = data.messageType || 'text';
      model.attachmentUrl = data.attachment?.url;
      model.attachmentName = data.attachment?.name;
      model.isRead = data.isRead ?? false;
      model.readAt = data.readAt?.toMillis?.();
      model.createdAtTimestamp = data.createdAt?.toMillis?.() || Date.now();
      model.isPending = false;
      break;
  }
}

/**
 * Get Firestore collection name from table name
 */
function getFirestoreCollectionName(tableName: string): string {
  const mapping: Record<string, string> = {
    [TableNames.EVENTS]: 'events',
    [TableNames.OFFERS]: 'offers',
    [TableNames.ARTISTS]: 'artists',
    [TableNames.CONVERSATIONS]: 'conversations',
    [TableNames.MESSAGES]: 'messages',
    [TableNames.FAVORITES]: 'favorites',
    [TableNames.USERS_CACHE]: 'users',
  };
  return mapping[tableName] || tableName;
}

/**
 * Start automatic sync
 */
export function startAutoSync(): void {
  if (syncIntervalId) {
    console.log('[Sync] Auto sync already running');
    return;
  }

  syncIntervalId = setInterval(async () => {
    if (await isOnline()) {
      await processSyncQueue();
    }
  }, SYNC_INTERVAL_MS);

  console.log(`[Sync] Auto sync started (interval: ${SYNC_INTERVAL_MS}ms)`);
}

/**
 * Stop automatic sync
 */
export function stopAutoSync(): void {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log('[Sync] Auto sync stopped');
  }
}

/**
 * Get sync status
 */
export function getSyncStatus(): {
  isSyncing: boolean;
  lastSyncTime: number | null;
  isAutoSyncRunning: boolean;
} {
  return {
    isSyncing,
    lastSyncTime,
    isAutoSyncRunning: syncIntervalId !== null,
  };
}

/**
 * Force full sync (pull all data)
 */
export async function forceFullSync(userId: string): Promise<void> {
  console.log('[Sync] Starting full sync');

  // First push any pending changes
  await processSyncQueue();

  // Then pull all data
  const tables = [
    TableNames.EVENTS,
    TableNames.OFFERS,
    TableNames.ARTISTS,
    TableNames.CONVERSATIONS,
  ];

  for (const table of tables) {
    try {
      await pullFromFirestore(table, userId, { limit: 100 });
    } catch (error) {
      console.error(`[Sync] Error syncing ${table}:`, error);
    }
  }

  console.log('[Sync] Full sync completed');
}

export default {
  isOnline,
  addToSyncQueue,
  processSyncQueue,
  pullFromFirestore,
  startAutoSync,
  stopAutoSync,
  getSyncStatus,
  forceFullSync,
};
