/**
 * Event Model
 *
 * WatermelonDB model for events with offline support.
 */

import { Model, Q } from '@nozbe/watermelondb';
import { field, date, readonly, children, lazy, writer } from '@nozbe/watermelondb/decorators';
import { TableNames } from '../schema';

export default class Event extends Model {
  static table = TableNames.EVENTS;

  static associations = {
    [TableNames.OFFERS]: { type: 'has_many' as const, foreignKey: 'event_id' },
  };

  // Firebase ID for sync
  @field('firebase_id') firebaseId!: string;

  // Owner
  @field('organizer_id') organizerId!: string;

  // Basic info
  @field('title') title!: string;
  @field('description') description?: string;
  @field('event_type') eventType!: string;
  @field('status') status!: string;

  // Venue info
  @field('venue_name') venueName?: string;
  @field('venue_address') venueAddress?: string;
  @field('venue_city') venueCity?: string;
  @field('latitude') latitude?: number;
  @field('longitude') longitude?: number;

  // Dates (stored as timestamps)
  @field('start_date') startDate!: number;
  @field('end_date') endDate?: number;

  // Event details
  @field('guest_count') guestCount?: number;
  @field('budget_min') budgetMin?: number;
  @field('budget_max') budgetMax?: number;
  @field('image_url') imageUrl?: string;
  @field('is_public') isPublic!: boolean;

  // Timestamps
  @field('created_at') createdAtTimestamp!: number;
  @field('updated_at') updatedAtTimestamp!: number;
  @field('synced_at') syncedAt?: number;

  // Sync status
  @field('is_dirty') isDirty!: boolean;

  // Relations
  @children(TableNames.OFFERS) offers: any;

  // Lazy queries
  @lazy
  activeOffers = this.collections
    .get(TableNames.OFFERS)
    .query(
      Q.where('event_id', this.id),
      Q.where('status', Q.notEq('cancelled'))
    );

  // Computed properties
  get startDateTime(): Date {
    return new Date(this.startDate);
  }

  get endDateTime(): Date | undefined {
    return this.endDate ? new Date(this.endDate) : undefined;
  }

  get budgetRange(): string {
    if (this.budgetMin && this.budgetMax) {
      return `${this.budgetMin.toLocaleString('tr-TR')} - ${this.budgetMax.toLocaleString('tr-TR')} TL`;
    }
    if (this.budgetMin) {
      return `${this.budgetMin.toLocaleString('tr-TR')} TL+`;
    }
    if (this.budgetMax) {
      return `${this.budgetMax.toLocaleString('tr-TR')} TL'ye kadar`;
    }
    return 'Belirtilmemis';
  }

  get location(): string {
    if (this.venueName && this.venueCity) {
      return `${this.venueName}, ${this.venueCity}`;
    }
    return this.venueName || this.venueCity || 'Konum belirtilmemis';
  }

  get isUpcoming(): boolean {
    return this.startDate > Date.now();
  }

  get isPast(): boolean {
    const endTime = this.endDate || this.startDate;
    return endTime < Date.now();
  }

  // Writers for updating
  @writer
  async updateEvent(data: Partial<{
    title: string;
    description: string;
    eventType: string;
    status: string;
    venueName: string;
    venueAddress: string;
    venueCity: string;
    latitude: number;
    longitude: number;
    startDate: number;
    endDate: number;
    guestCount: number;
    budgetMin: number;
    budgetMax: number;
    imageUrl: string;
    isPublic: boolean;
  }>) {
    await this.update((event) => {
      if (data.title !== undefined) event.title = data.title;
      if (data.description !== undefined) event.description = data.description;
      if (data.eventType !== undefined) event.eventType = data.eventType;
      if (data.status !== undefined) event.status = data.status;
      if (data.venueName !== undefined) event.venueName = data.venueName;
      if (data.venueAddress !== undefined) event.venueAddress = data.venueAddress;
      if (data.venueCity !== undefined) event.venueCity = data.venueCity;
      if (data.latitude !== undefined) event.latitude = data.latitude;
      if (data.longitude !== undefined) event.longitude = data.longitude;
      if (data.startDate !== undefined) event.startDate = data.startDate;
      if (data.endDate !== undefined) event.endDate = data.endDate;
      if (data.guestCount !== undefined) event.guestCount = data.guestCount;
      if (data.budgetMin !== undefined) event.budgetMin = data.budgetMin;
      if (data.budgetMax !== undefined) event.budgetMax = data.budgetMax;
      if (data.imageUrl !== undefined) event.imageUrl = data.imageUrl;
      if (data.isPublic !== undefined) event.isPublic = data.isPublic;
      event.updatedAtTimestamp = Date.now();
      event.isDirty = true;
    });
  }

  @writer
  async markAsSynced() {
    await this.update((event) => {
      event.syncedAt = Date.now();
      event.isDirty = false;
    });
  }

  @writer
  async softDelete() {
    await this.update((event) => {
      event.status = 'deleted';
      event.updatedAtTimestamp = Date.now();
      event.isDirty = true;
    });
  }

  // Convert to plain object for Firestore
  toFirestoreData(): Record<string, any> {
    return {
      id: this.firebaseId,
      organizerId: this.organizerId,
      title: this.title,
      description: this.description,
      eventType: this.eventType,
      status: this.status,
      venue: {
        name: this.venueName,
        address: this.venueAddress,
        city: this.venueCity,
        coordinates: this.latitude && this.longitude
          ? { lat: this.latitude, lng: this.longitude }
          : null,
      },
      startDate: new Date(this.startDate),
      endDate: this.endDate ? new Date(this.endDate) : null,
      guestCount: this.guestCount,
      budget: {
        min: this.budgetMin,
        max: this.budgetMax,
      },
      imageUrl: this.imageUrl,
      isPublic: this.isPublic,
      createdAt: new Date(this.createdAtTimestamp),
      updatedAt: new Date(this.updatedAtTimestamp),
    };
  }
}
