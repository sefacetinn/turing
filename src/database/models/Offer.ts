/**
 * Offer Model
 *
 * WatermelonDB model for offers with offline support.
 */

import { Model, Q, Relation } from '@nozbe/watermelondb';
import { field, relation, lazy, writer } from '@nozbe/watermelondb/decorators';
import { TableNames } from '../schema';
import Event from './Event';

export default class Offer extends Model {
  static table = TableNames.OFFERS;

  static associations = {
    [TableNames.EVENTS]: { type: 'belongs_to' as const, key: 'event_id' },
  };

  // Firebase ID for sync
  @field('firebase_id') firebaseId!: string;

  // Relations
  @field('event_id') eventId!: string;
  @field('provider_id') providerId!: string;
  @field('organizer_id') organizerId!: string;
  @field('artist_id') artistId?: string;

  // Offer details
  @field('service_type') serviceType!: string;
  @field('status') status!: string;

  // Pricing
  @field('requested_price') requestedPrice?: number;
  @field('offered_price') offeredPrice?: number;
  @field('final_price') finalPrice?: number;

  // Messages
  @field('message') message?: string;
  @field('provider_note') providerNote?: string;

  // Performance details
  @field('performance_date') performanceDate?: number;
  @field('performance_duration') performanceDuration?: number;

  // Timestamps
  @field('created_at') createdAtTimestamp!: number;
  @field('updated_at') updatedAtTimestamp!: number;
  @field('responded_at') respondedAt?: number;
  @field('synced_at') syncedAt?: number;

  // Sync status
  @field('is_dirty') isDirty!: boolean;

  // Relations
  @relation(TableNames.EVENTS, 'event_id') event!: Relation<Event>;

  // Computed properties
  get performanceDateTime(): Date | undefined {
    return this.performanceDate ? new Date(this.performanceDate) : undefined;
  }

  get currentPrice(): number | undefined {
    return this.finalPrice || this.offeredPrice || this.requestedPrice;
  }

  get formattedPrice(): string {
    const price = this.currentPrice;
    if (!price) return 'Fiyat belirtilmemis';
    return `${price.toLocaleString('tr-TR')} TL`;
  }

  get durationHours(): number | undefined {
    return this.performanceDuration ? this.performanceDuration / 60 : undefined;
  }

  get isPending(): boolean {
    return this.status === 'pending';
  }

  get isAccepted(): boolean {
    return this.status === 'accepted';
  }

  get isRejected(): boolean {
    return this.status === 'rejected';
  }

  get isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  get statusLabel(): string {
    const labels: Record<string, string> = {
      pending: 'Beklemede',
      quote_requested: 'Teklif Bekleniyor',
      quote_sent: 'Teklif Gonderildi',
      accepted: 'Kabul Edildi',
      rejected: 'Reddedildi',
      cancelled: 'Iptal Edildi',
      completed: 'Tamamlandi',
    };
    return labels[this.status] || this.status;
  }

  // Writers for updating
  @writer
  async updateOffer(data: Partial<{
    status: string;
    offeredPrice: number;
    finalPrice: number;
    providerNote: string;
    performanceDate: number;
    performanceDuration: number;
  }>) {
    await this.update((offer) => {
      if (data.status !== undefined) offer.status = data.status;
      if (data.offeredPrice !== undefined) offer.offeredPrice = data.offeredPrice;
      if (data.finalPrice !== undefined) offer.finalPrice = data.finalPrice;
      if (data.providerNote !== undefined) offer.providerNote = data.providerNote;
      if (data.performanceDate !== undefined) offer.performanceDate = data.performanceDate;
      if (data.performanceDuration !== undefined) offer.performanceDuration = data.performanceDuration;
      offer.updatedAtTimestamp = Date.now();
      offer.isDirty = true;
    });
  }

  @writer
  async acceptOffer(finalPrice?: number) {
    await this.update((offer) => {
      offer.status = 'accepted';
      if (finalPrice !== undefined) {
        offer.finalPrice = finalPrice;
      }
      offer.respondedAt = Date.now();
      offer.updatedAtTimestamp = Date.now();
      offer.isDirty = true;
    });
  }

  @writer
  async rejectOffer(note?: string) {
    await this.update((offer) => {
      offer.status = 'rejected';
      if (note) {
        offer.providerNote = note;
      }
      offer.respondedAt = Date.now();
      offer.updatedAtTimestamp = Date.now();
      offer.isDirty = true;
    });
  }

  @writer
  async submitQuote(price: number, note?: string) {
    await this.update((offer) => {
      offer.status = 'quote_sent';
      offer.offeredPrice = price;
      if (note) {
        offer.providerNote = note;
      }
      offer.respondedAt = Date.now();
      offer.updatedAtTimestamp = Date.now();
      offer.isDirty = true;
    });
  }

  @writer
  async cancelOffer() {
    await this.update((offer) => {
      offer.status = 'cancelled';
      offer.updatedAtTimestamp = Date.now();
      offer.isDirty = true;
    });
  }

  @writer
  async markAsSynced() {
    await this.update((offer) => {
      offer.syncedAt = Date.now();
      offer.isDirty = false;
    });
  }

  // Convert to plain object for Firestore
  toFirestoreData(): Record<string, any> {
    return {
      id: this.firebaseId,
      eventId: this.eventId,
      providerId: this.providerId,
      organizerId: this.organizerId,
      artistId: this.artistId,
      serviceType: this.serviceType,
      status: this.status,
      pricing: {
        requested: this.requestedPrice,
        offered: this.offeredPrice,
        final: this.finalPrice,
      },
      message: this.message,
      providerNote: this.providerNote,
      performance: {
        date: this.performanceDate ? new Date(this.performanceDate) : null,
        duration: this.performanceDuration,
      },
      createdAt: new Date(this.createdAtTimestamp),
      updatedAt: new Date(this.updatedAtTimestamp),
      respondedAt: this.respondedAt ? new Date(this.respondedAt) : null,
    };
  }
}
