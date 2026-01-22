/**
 * Artist Model
 *
 * WatermelonDB model for artists with offline support.
 */

import { Model } from '@nozbe/watermelondb';
import { field, writer } from '@nozbe/watermelondb/decorators';
import { TableNames } from '../schema';

export default class Artist extends Model {
  static table = TableNames.ARTISTS;

  // Firebase ID for sync
  @field('firebase_id') firebaseId!: string;

  // Owner
  @field('provider_id') providerId!: string;

  // Basic info
  @field('name') name!: string;
  @field('stage_name') stageName?: string;
  @field('bio') bio?: string;
  @field('genre') genre?: string;
  @field('genres') genresJson?: string; // JSON array

  // Images
  @field('profile_image') profileImage?: string;
  @field('cover_image') coverImage?: string;

  // Pricing
  @field('hourly_rate') hourlyRate?: number;
  @field('min_booking_hours') minBookingHours?: number;

  // Ratings
  @field('rating') rating?: number;
  @field('review_count') reviewCount?: number;

  // Status
  @field('is_verified') isVerified!: boolean;
  @field('is_featured') isFeatured!: boolean;

  // Location
  @field('city') city?: string;

  // Social links (JSON)
  @field('social_links') socialLinksJson?: string;

  // Timestamps
  @field('created_at') createdAtTimestamp!: number;
  @field('updated_at') updatedAtTimestamp!: number;
  @field('synced_at') syncedAt?: number;

  // Sync status
  @field('is_dirty') isDirty!: boolean;

  // Computed properties
  get displayName(): string {
    return this.stageName || this.name;
  }

  get genres(): string[] {
    if (!this.genresJson) return this.genre ? [this.genre] : [];
    try {
      return JSON.parse(this.genresJson);
    } catch {
      return this.genre ? [this.genre] : [];
    }
  }

  get socialLinks(): Record<string, string> {
    if (!this.socialLinksJson) return {};
    try {
      return JSON.parse(this.socialLinksJson);
    } catch {
      return {};
    }
  }

  get formattedHourlyRate(): string {
    if (!this.hourlyRate) return 'Fiyat icin iletisime gecin';
    return `${this.hourlyRate.toLocaleString('tr-TR')} TL/saat`;
  }

  get formattedRating(): string {
    if (!this.rating) return 'Henuz degerlendirme yok';
    return `${this.rating.toFixed(1)} (${this.reviewCount || 0} degerlendirme)`;
  }

  get hasReviews(): boolean {
    return (this.reviewCount || 0) > 0;
  }

  get minBookingPrice(): number | undefined {
    if (!this.hourlyRate || !this.minBookingHours) return undefined;
    return this.hourlyRate * this.minBookingHours;
  }

  // Writers for updating
  @writer
  async updateArtist(data: Partial<{
    name: string;
    stageName: string;
    bio: string;
    genre: string;
    genres: string[];
    profileImage: string;
    coverImage: string;
    hourlyRate: number;
    minBookingHours: number;
    city: string;
    socialLinks: Record<string, string>;
  }>) {
    await this.update((artist) => {
      if (data.name !== undefined) artist.name = data.name;
      if (data.stageName !== undefined) artist.stageName = data.stageName;
      if (data.bio !== undefined) artist.bio = data.bio;
      if (data.genre !== undefined) artist.genre = data.genre;
      if (data.genres !== undefined) artist.genresJson = JSON.stringify(data.genres);
      if (data.profileImage !== undefined) artist.profileImage = data.profileImage;
      if (data.coverImage !== undefined) artist.coverImage = data.coverImage;
      if (data.hourlyRate !== undefined) artist.hourlyRate = data.hourlyRate;
      if (data.minBookingHours !== undefined) artist.minBookingHours = data.minBookingHours;
      if (data.city !== undefined) artist.city = data.city;
      if (data.socialLinks !== undefined) artist.socialLinksJson = JSON.stringify(data.socialLinks);
      artist.updatedAtTimestamp = Date.now();
      artist.isDirty = true;
    });
  }

  @writer
  async updateRating(rating: number, reviewCount: number) {
    await this.update((artist) => {
      artist.rating = rating;
      artist.reviewCount = reviewCount;
      artist.updatedAtTimestamp = Date.now();
      artist.isDirty = true;
    });
  }

  @writer
  async markAsSynced() {
    await this.update((artist) => {
      artist.syncedAt = Date.now();
      artist.isDirty = false;
    });
  }

  // Convert to plain object for Firestore
  toFirestoreData(): Record<string, any> {
    return {
      id: this.firebaseId,
      providerId: this.providerId,
      name: this.name,
      stageName: this.stageName,
      bio: this.bio,
      genre: this.genre,
      genres: this.genres,
      profileImage: this.profileImage,
      coverImage: this.coverImage,
      pricing: {
        hourlyRate: this.hourlyRate,
        minBookingHours: this.minBookingHours,
      },
      rating: this.rating,
      reviewCount: this.reviewCount,
      isVerified: this.isVerified,
      isFeatured: this.isFeatured,
      city: this.city,
      socialLinks: this.socialLinks,
      createdAt: new Date(this.createdAtTimestamp),
      updatedAt: new Date(this.updatedAtTimestamp),
    };
  }
}
