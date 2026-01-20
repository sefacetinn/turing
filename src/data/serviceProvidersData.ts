import { gradients } from '../theme/colors';

// Types
export interface Filters {
  city: string | null;
  minRating: number | null;
  budgetRange: string | null;
}

export interface Provider {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  description: string;
  city: string;
  teamSize: string;
  image: string;
  previouslyWorked: boolean;
  phone: string;
  verified: boolean;
  yearsExperience: number;
  completedEvents: number;
  priceRange: string;
  responseTime: string;
  specialties: string[];
  subcategory?: string; // For operation subcategories
}

export type FilterTab = 'all' | 'worked';

// Constants
export const cities = ['İstanbul', 'Ankara', 'İzmir'];
export const ratingOptions = [4.5, 4.0, 3.5];
export const budgetRanges = [
  { id: 'low', label: '₺0 - ₺50.000', min: 0, max: 50000 },
  { id: 'mid', label: '₺50.000 - ₺150.000', min: 50000, max: 150000 },
  { id: 'high', label: '₺150.000+', min: 150000, max: Infinity },
];

// Category configurations
export const categoryConfig: Record<string, { title: string; gradient: readonly [string, string, ...string[]]; icon: string }> = {
  booking: { title: 'Booking', gradient: ['#4b30b8', '#7c3aed'], icon: 'musical-notes' },
  artist: { title: 'Booking', gradient: ['#4b30b8', '#7c3aed'], icon: 'musical-notes' }, // Alias for booking
  technical: { title: 'Teknik', gradient: ['#059669', '#34d399'], icon: 'volume-high' },
  transport: { title: 'Ulaşım', gradient: ['#dc2626', '#f87171'], icon: 'car' },
  venue: { title: 'Mekan', gradient: ['#2563eb', '#60a5fa'], icon: 'business' },
  accommodation: { title: 'Konaklama', gradient: ['#db2777', '#f472b6'], icon: 'bed' },
  operation: { title: 'Operasyon', gradient: ['#d97706', '#fbbf24'], icon: 'settings' },
  flight: { title: 'Uçak', gradient: ['#475569', '#94a3b8'], icon: 'airplane' },
  // Operation sub-categories (all orange)
  security: { title: 'Güvenlik', gradient: ['#d97706', '#fbbf24'], icon: 'shield' },
  catering: { title: 'Catering', gradient: ['#d97706', '#fbbf24'], icon: 'restaurant' },
  generator: { title: 'Jeneratör', gradient: ['#d97706', '#fbbf24'], icon: 'flash' },
  beverage: { title: 'İçecek', gradient: ['#d97706', '#fbbf24'], icon: 'cafe' },
  medical: { title: 'Medikal', gradient: ['#d97706', '#fbbf24'], icon: 'medkit' },
  sanitation: { title: 'Sanitasyon', gradient: ['#d97706', '#fbbf24'], icon: 'trash' },
  media: { title: 'Medya', gradient: ['#d97706', '#fbbf24'], icon: 'camera' },
  barrier: { title: 'Bariyer', gradient: ['#d97706', '#fbbf24'], icon: 'remove' },
  tent: { title: 'Çadır', gradient: ['#d97706', '#fbbf24'], icon: 'home' },
  ticketing: { title: 'Ticketing', gradient: ['#d97706', '#fbbf24'], icon: 'ticket' },
  decoration: { title: 'Dekorasyon', gradient: ['#d97706', '#fbbf24'], icon: 'color-palette' },
  production: { title: 'Prodüksiyon', gradient: ['#d97706', '#fbbf24'], icon: 'film' },
};

// TODO: Fetch providers from Firebase
// Returns empty arrays for production - will be populated from Firebase
export const getProvidersByCategory = (category: string): Provider[] => {
  // All categories return empty arrays until Firebase integration is complete
  return [];
};
