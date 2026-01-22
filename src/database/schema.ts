/**
 * WatermelonDB Schema
 *
 * Defines the database schema for offline-first data storage.
 * This schema mirrors the Firestore collections for seamless sync.
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb';

// Schema version - increment when making changes
export const SCHEMA_VERSION = 1;

export const schema = appSchema({
  version: SCHEMA_VERSION,
  tables: [
    // Events table
    tableSchema({
      name: 'events',
      columns: [
        { name: 'firebase_id', type: 'string', isIndexed: true },
        { name: 'organizer_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'event_type', type: 'string' },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'venue_name', type: 'string', isOptional: true },
        { name: 'venue_address', type: 'string', isOptional: true },
        { name: 'venue_city', type: 'string', isOptional: true },
        { name: 'latitude', type: 'number', isOptional: true },
        { name: 'longitude', type: 'number', isOptional: true },
        { name: 'start_date', type: 'number' }, // timestamp
        { name: 'end_date', type: 'number', isOptional: true },
        { name: 'guest_count', type: 'number', isOptional: true },
        { name: 'budget_min', type: 'number', isOptional: true },
        { name: 'budget_max', type: 'number', isOptional: true },
        { name: 'image_url', type: 'string', isOptional: true },
        { name: 'is_public', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_dirty', type: 'boolean' }, // needs sync
      ],
    }),

    // Offers table
    tableSchema({
      name: 'offers',
      columns: [
        { name: 'firebase_id', type: 'string', isIndexed: true },
        { name: 'event_id', type: 'string', isIndexed: true },
        { name: 'provider_id', type: 'string', isIndexed: true },
        { name: 'organizer_id', type: 'string', isIndexed: true },
        { name: 'artist_id', type: 'string', isOptional: true },
        { name: 'service_type', type: 'string' },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'requested_price', type: 'number', isOptional: true },
        { name: 'offered_price', type: 'number', isOptional: true },
        { name: 'final_price', type: 'number', isOptional: true },
        { name: 'message', type: 'string', isOptional: true },
        { name: 'provider_note', type: 'string', isOptional: true },
        { name: 'performance_date', type: 'number', isOptional: true },
        { name: 'performance_duration', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'responded_at', type: 'number', isOptional: true },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_dirty', type: 'boolean' },
      ],
    }),

    // Artists table
    tableSchema({
      name: 'artists',
      columns: [
        { name: 'firebase_id', type: 'string', isIndexed: true },
        { name: 'provider_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'stage_name', type: 'string', isOptional: true },
        { name: 'bio', type: 'string', isOptional: true },
        { name: 'genre', type: 'string', isOptional: true },
        { name: 'genres', type: 'string', isOptional: true }, // JSON array
        { name: 'profile_image', type: 'string', isOptional: true },
        { name: 'cover_image', type: 'string', isOptional: true },
        { name: 'hourly_rate', type: 'number', isOptional: true },
        { name: 'min_booking_hours', type: 'number', isOptional: true },
        { name: 'rating', type: 'number', isOptional: true },
        { name: 'review_count', type: 'number', isOptional: true },
        { name: 'is_verified', type: 'boolean' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'city', type: 'string', isOptional: true },
        { name: 'social_links', type: 'string', isOptional: true }, // JSON
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_dirty', type: 'boolean' },
      ],
    }),

    // Conversations table
    tableSchema({
      name: 'conversations',
      columns: [
        { name: 'firebase_id', type: 'string', isIndexed: true },
        { name: 'participant_ids', type: 'string' }, // JSON array
        { name: 'event_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'offer_id', type: 'string', isOptional: true },
        { name: 'last_message', type: 'string', isOptional: true },
        { name: 'last_message_at', type: 'number', isOptional: true },
        { name: 'last_sender_id', type: 'string', isOptional: true },
        { name: 'unread_count', type: 'number' },
        { name: 'is_archived', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_dirty', type: 'boolean' },
      ],
    }),

    // Messages table
    tableSchema({
      name: 'messages',
      columns: [
        { name: 'firebase_id', type: 'string', isIndexed: true },
        { name: 'conversation_id', type: 'string', isIndexed: true },
        { name: 'sender_id', type: 'string', isIndexed: true },
        { name: 'content', type: 'string' },
        { name: 'message_type', type: 'string' }, // text, image, file, system
        { name: 'attachment_url', type: 'string', isOptional: true },
        { name: 'attachment_name', type: 'string', isOptional: true },
        { name: 'is_read', type: 'boolean' },
        { name: 'read_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_dirty', type: 'boolean' },
        { name: 'is_pending', type: 'boolean' }, // pending send
      ],
    }),

    // Favorites table
    tableSchema({
      name: 'favorites',
      columns: [
        { name: 'firebase_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'item_id', type: 'string', isIndexed: true },
        { name: 'item_type', type: 'string' }, // artist, venue, event
        { name: 'created_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_dirty', type: 'boolean' },
      ],
    }),

    // Users cache table (for displaying user info offline)
    tableSchema({
      name: 'users_cache',
      columns: [
        { name: 'firebase_id', type: 'string', isIndexed: true },
        { name: 'display_name', type: 'string' },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'profile_image', type: 'string', isOptional: true },
        { name: 'role', type: 'string' },
        { name: 'company_name', type: 'string', isOptional: true },
        { name: 'city', type: 'string', isOptional: true },
        { name: 'is_verified', type: 'boolean' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),

    // Sync queue table (for tracking pending changes)
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'table_name', type: 'string', isIndexed: true },
        { name: 'record_id', type: 'string', isIndexed: true },
        { name: 'firebase_id', type: 'string', isOptional: true },
        { name: 'operation', type: 'string' }, // create, update, delete
        { name: 'data', type: 'string' }, // JSON stringified data
        { name: 'created_at', type: 'number' },
        { name: 'attempts', type: 'number' },
        { name: 'last_attempt_at', type: 'number', isOptional: true },
        { name: 'error', type: 'string', isOptional: true },
        { name: 'status', type: 'string' }, // pending, processing, failed, completed
      ],
    }),
  ],
});

// Table names enum for type safety
export const TableNames = {
  EVENTS: 'events',
  OFFERS: 'offers',
  ARTISTS: 'artists',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  FAVORITES: 'favorites',
  USERS_CACHE: 'users_cache',
  SYNC_QUEUE: 'sync_queue',
} as const;

export type TableName = typeof TableNames[keyof typeof TableNames];

// Sync operation types
export const SyncOperations = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export type SyncOperation = typeof SyncOperations[keyof typeof SyncOperations];

// Sync status types
export const SyncStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  FAILED: 'failed',
  COMPLETED: 'completed',
} as const;

export type SyncStatusType = typeof SyncStatus[keyof typeof SyncStatus];

export default schema;
