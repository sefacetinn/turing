/**
 * SyncQueue Model
 *
 * WatermelonDB model for tracking pending sync operations.
 * This ensures data changes are synced to Firestore when online.
 */

import { Model, Q } from '@nozbe/watermelondb';
import { field, writer } from '@nozbe/watermelondb/decorators';
import { TableNames, SyncOperation, SyncStatusType, SyncStatus } from '../schema';

export const MAX_RETRY_ATTEMPTS = 5;

export default class SyncQueue extends Model {
  static table = TableNames.SYNC_QUEUE;

  // Target table and record
  @field('table_name') tableName!: string;
  @field('record_id') recordId!: string;
  @field('firebase_id') firebaseId?: string;

  // Operation type
  @field('operation') operation!: SyncOperation;

  // Data to sync (JSON stringified)
  @field('data') dataJson!: string;

  // Timestamps
  @field('created_at') createdAtTimestamp!: number;
  @field('last_attempt_at') lastAttemptAt?: number;

  // Retry tracking
  @field('attempts') attempts!: number;
  @field('error') error?: string;
  @field('status') status!: SyncStatusType;

  // Computed properties
  get data(): Record<string, any> {
    try {
      return JSON.parse(this.dataJson);
    } catch {
      return {};
    }
  }

  get createdAt(): Date {
    return new Date(this.createdAtTimestamp);
  }

  get lastAttemptDateTime(): Date | undefined {
    return this.lastAttemptAt ? new Date(this.lastAttemptAt) : undefined;
  }

  get canRetry(): boolean {
    return this.attempts < MAX_RETRY_ATTEMPTS && this.status !== SyncStatus.COMPLETED;
  }

  get isPending(): boolean {
    return this.status === SyncStatus.PENDING;
  }

  get isProcessing(): boolean {
    return this.status === SyncStatus.PROCESSING;
  }

  get isFailed(): boolean {
    return this.status === SyncStatus.FAILED;
  }

  get isCompleted(): boolean {
    return this.status === SyncStatus.COMPLETED;
  }

  get isCreate(): boolean {
    return this.operation === 'create';
  }

  get isUpdate(): boolean {
    return this.operation === 'update';
  }

  get isDelete(): boolean {
    return this.operation === 'delete';
  }

  // Writers for updating
  @writer
  async markAsProcessing() {
    await this.update((item) => {
      item.status = SyncStatus.PROCESSING;
      item.lastAttemptAt = Date.now();
      item.attempts += 1;
    });
  }

  @writer
  async markAsCompleted(firebaseId?: string) {
    await this.update((item) => {
      item.status = SyncStatus.COMPLETED;
      if (firebaseId) {
        item.firebaseId = firebaseId;
      }
    });
  }

  @writer
  async markAsFailed(errorMessage: string) {
    await this.update((item) => {
      item.status = item.attempts >= MAX_RETRY_ATTEMPTS
        ? SyncStatus.FAILED
        : SyncStatus.PENDING;
      item.error = errorMessage;
    });
  }

  @writer
  async resetForRetry() {
    await this.update((item) => {
      item.status = SyncStatus.PENDING;
      item.error = undefined;
    });
  }

  @writer
  async updateData(newData: Record<string, any>) {
    await this.update((item) => {
      item.dataJson = JSON.stringify(newData);
    });
  }
}

// Helper function to create sync queue queries
export const SyncQueueQueries = {
  pending: () => [
    Q.where('status', SyncStatus.PENDING),
    Q.sortBy('created_at', Q.asc),
  ],

  processing: () => [
    Q.where('status', SyncStatus.PROCESSING),
  ],

  failed: () => [
    Q.where('status', SyncStatus.FAILED),
  ],

  byTable: (tableName: string) => [
    Q.where('table_name', tableName),
    Q.where('status', Q.notEq(SyncStatus.COMPLETED)),
  ],

  byRecord: (tableName: string, recordId: string) => [
    Q.where('table_name', tableName),
    Q.where('record_id', recordId),
    Q.where('status', Q.notEq(SyncStatus.COMPLETED)),
  ],

  retryable: () => [
    Q.where('status', Q.oneOf([SyncStatus.PENDING, SyncStatus.FAILED])),
    Q.where('attempts', Q.lt(MAX_RETRY_ATTEMPTS)),
    Q.sortBy('created_at', Q.asc),
  ],
};
