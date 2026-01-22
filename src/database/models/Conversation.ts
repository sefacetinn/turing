/**
 * Conversation Model
 *
 * WatermelonDB model for chat conversations with offline support.
 */

import { Model, Q } from '@nozbe/watermelondb';
import { field, children, lazy, writer } from '@nozbe/watermelondb/decorators';
import { TableNames } from '../schema';

export default class Conversation extends Model {
  static table = TableNames.CONVERSATIONS;

  static associations = {
    [TableNames.MESSAGES]: { type: 'has_many' as const, foreignKey: 'conversation_id' },
  };

  // Firebase ID for sync
  @field('firebase_id') firebaseId!: string;

  // Participants (JSON array stored as string)
  @field('participant_ids') participantIdsJson!: string;

  // Related entities
  @field('event_id') eventId?: string;
  @field('offer_id') offerId?: string;

  // Last message info
  @field('last_message') lastMessage?: string;
  @field('last_message_at') lastMessageAt?: number;
  @field('last_sender_id') lastSenderId?: string;

  // Status
  @field('unread_count') unreadCount!: number;
  @field('is_archived') isArchived!: boolean;

  // Timestamps
  @field('created_at') createdAtTimestamp!: number;
  @field('updated_at') updatedAtTimestamp!: number;
  @field('synced_at') syncedAt?: number;

  // Sync status
  @field('is_dirty') isDirty!: boolean;

  // Relations
  @children(TableNames.MESSAGES) messages: any;

  // Lazy queries
  @lazy
  recentMessages = this.collections
    .get(TableNames.MESSAGES)
    .query(
      Q.where('conversation_id', this.id),
      Q.sortBy('created_at', Q.desc),
      Q.take(50)
    );

  @lazy
  unreadMessages = this.collections
    .get(TableNames.MESSAGES)
    .query(
      Q.where('conversation_id', this.id),
      Q.where('is_read', false)
    );

  // Computed properties
  get participantIds(): string[] {
    try {
      return JSON.parse(this.participantIdsJson);
    } catch {
      return [];
    }
  }

  get lastMessageDateTime(): Date | undefined {
    return this.lastMessageAt ? new Date(this.lastMessageAt) : undefined;
  }

  get hasUnreadMessages(): boolean {
    return this.unreadCount > 0;
  }

  get formattedLastMessageTime(): string {
    if (!this.lastMessageAt) return '';

    const date = new Date(this.lastMessageAt);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isYesterday) {
      return 'Dun';
    }

    // Check if same week
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (date > weekAgo) {
      return date.toLocaleDateString('tr-TR', { weekday: 'short' });
    }

    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  }

  get truncatedLastMessage(): string {
    if (!this.lastMessage) return '';
    const maxLength = 50;
    if (this.lastMessage.length <= maxLength) return this.lastMessage;
    return this.lastMessage.substring(0, maxLength) + '...';
  }

  // Helper to check if user is participant
  isParticipant(userId: string): boolean {
    return this.participantIds.includes(userId);
  }

  // Get other participant (for 1-1 chats)
  getOtherParticipant(currentUserId: string): string | undefined {
    return this.participantIds.find((id) => id !== currentUserId);
  }

  // Writers for updating
  @writer
  async updateLastMessage(message: string, senderId: string) {
    await this.update((conversation) => {
      conversation.lastMessage = message;
      conversation.lastMessageAt = Date.now();
      conversation.lastSenderId = senderId;
      conversation.updatedAtTimestamp = Date.now();
      conversation.isDirty = true;
    });
  }

  @writer
  async incrementUnreadCount() {
    await this.update((conversation) => {
      conversation.unreadCount += 1;
      conversation.isDirty = true;
    });
  }

  @writer
  async resetUnreadCount() {
    if (this.unreadCount === 0) return;

    await this.update((conversation) => {
      conversation.unreadCount = 0;
      conversation.isDirty = true;
    });
  }

  @writer
  async archive() {
    await this.update((conversation) => {
      conversation.isArchived = true;
      conversation.updatedAtTimestamp = Date.now();
      conversation.isDirty = true;
    });
  }

  @writer
  async unarchive() {
    await this.update((conversation) => {
      conversation.isArchived = false;
      conversation.updatedAtTimestamp = Date.now();
      conversation.isDirty = true;
    });
  }

  @writer
  async markAsSynced() {
    await this.update((conversation) => {
      conversation.syncedAt = Date.now();
      conversation.isDirty = false;
    });
  }

  // Convert to plain object for Firestore
  toFirestoreData(): Record<string, any> {
    return {
      id: this.firebaseId,
      participantIds: this.participantIds,
      eventId: this.eventId,
      offerId: this.offerId,
      lastMessage: this.lastMessage,
      lastMessageAt: this.lastMessageAt ? new Date(this.lastMessageAt) : null,
      lastSenderId: this.lastSenderId,
      isArchived: this.isArchived,
      createdAt: new Date(this.createdAtTimestamp),
      updatedAt: new Date(this.updatedAtTimestamp),
    };
  }
}
