/**
 * Message Model
 *
 * WatermelonDB model for chat messages with offline support.
 */

import { Model, Relation } from '@nozbe/watermelondb';
import { field, relation, writer } from '@nozbe/watermelondb/decorators';
import { TableNames } from '../schema';
import Conversation from './Conversation';

export type MessageType = 'text' | 'image' | 'file' | 'system';

export default class Message extends Model {
  static table = TableNames.MESSAGES;

  static associations = {
    [TableNames.CONVERSATIONS]: { type: 'belongs_to' as const, key: 'conversation_id' },
  };

  // Firebase ID for sync
  @field('firebase_id') firebaseId!: string;

  // Relations
  @field('conversation_id') conversationId!: string;
  @field('sender_id') senderId!: string;

  // Content
  @field('content') content!: string;
  @field('message_type') messageType!: MessageType;

  // Attachments
  @field('attachment_url') attachmentUrl?: string;
  @field('attachment_name') attachmentName?: string;

  // Read status
  @field('is_read') isRead!: boolean;
  @field('read_at') readAt?: number;

  // Timestamps
  @field('created_at') createdAtTimestamp!: number;
  @field('synced_at') syncedAt?: number;

  // Sync status
  @field('is_dirty') isDirty!: boolean;
  @field('is_pending') isPending!: boolean;

  // Relations
  @relation(TableNames.CONVERSATIONS, 'conversation_id') conversation!: Relation<Conversation>;

  // Computed properties
  get createdAt(): Date {
    return new Date(this.createdAtTimestamp);
  }

  get readDateTime(): Date | undefined {
    return this.readAt ? new Date(this.readAt) : undefined;
  }

  get isTextMessage(): boolean {
    return this.messageType === 'text';
  }

  get isImageMessage(): boolean {
    return this.messageType === 'image';
  }

  get isFileMessage(): boolean {
    return this.messageType === 'file';
  }

  get isSystemMessage(): boolean {
    return this.messageType === 'system';
  }

  get hasAttachment(): boolean {
    return !!this.attachmentUrl;
  }

  get formattedTime(): string {
    const date = this.createdAt;
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
      return `Dun ${date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }

    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Writers for updating
  @writer
  async markAsRead() {
    if (this.isRead) return;

    await this.update((message) => {
      message.isRead = true;
      message.readAt = Date.now();
      message.isDirty = true;
    });
  }

  @writer
  async markAsSent() {
    await this.update((message) => {
      message.isPending = false;
      message.isDirty = true;
    });
  }

  @writer
  async markAsSynced() {
    await this.update((message) => {
      message.syncedAt = Date.now();
      message.isDirty = false;
      message.isPending = false;
    });
  }

  @writer
  async updateContent(newContent: string) {
    await this.update((message) => {
      message.content = newContent;
      message.isDirty = true;
    });
  }

  // Convert to plain object for Firestore
  toFirestoreData(): Record<string, any> {
    return {
      id: this.firebaseId,
      conversationId: this.conversationId,
      senderId: this.senderId,
      content: this.content,
      messageType: this.messageType,
      attachment: this.attachmentUrl
        ? {
            url: this.attachmentUrl,
            name: this.attachmentName,
          }
        : null,
      isRead: this.isRead,
      readAt: this.readAt ? new Date(this.readAt) : null,
      createdAt: new Date(this.createdAtTimestamp),
    };
  }
}
