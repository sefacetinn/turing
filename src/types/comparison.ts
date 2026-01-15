import type { ServiceCategory, OperationSubCategory, OfferStatus } from './index';

// Enhanced provider info for comparison
export interface ComparisonProvider {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  completedJobs: number;
  responseTime: string;
  memberSince?: string;
}

// Enhanced offer for comparison
export interface EnhancedOffer {
  id: string;
  quoteRequestId: string;
  eventId: string;
  eventTitle: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory | OperationSubCategory;
  provider: ComparisonProvider;
  amount: number;
  originalBudget: number;
  discountPercent?: number;
  deliveryTime: string;
  deliveryDays: number;
  message: string;
  status: OfferStatus;
  createdAt: string;
  // Computed scores (0-100)
  priceScore?: number;
  ratingScore?: number;
  deliveryScore?: number;
  overallScore?: number;
}

// Quote Request (Teklif Talebi)
export interface QuoteRequest {
  id: string;
  eventId: string;
  eventTitle: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory | OperationSubCategory;
  type: 'open' | 'invited';
  invitedProviders: string[];
  deadline: string;
  budget: string;
  budgetMin: number;
  budgetMax: number;
  requirements?: Record<string, any>;
  notes: string;
  organizerName: string;
  organizerImage: string;
  status: 'open' | 'closed' | 'awarded';
  offerCount: number;
  selectedOfferId?: string;
  createdAt: string;
}

// Grouped offers for comparison view
export interface GroupedOffers {
  quoteRequestId: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: ServiceCategory | OperationSubCategory;
  eventId: string;
  eventTitle: string;
  requestType: 'open' | 'invited';
  budget: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  status: 'pending' | 'comparing' | 'awarded' | 'expired';
  offers: EnhancedOffer[];
  totalOffers: number;
  pendingOffers: number;
  lowestPrice: number;
  highestPrice: number;
  avgRating: number;
  recommendedOfferId?: string;
}

// Comparison criteria
export interface ComparisonCriterion {
  id: string;
  label: string;
  key: string;
  type: 'price' | 'rating' | 'number' | 'boolean' | 'text' | 'time';
  weight: number;
  icon: string;
  higherIsBetter: boolean;
}

export const defaultComparisonCriteria: ComparisonCriterion[] = [
  { id: 'price', label: 'Fiyat', key: 'amount', type: 'price', weight: 0.35, icon: 'cash-outline', higherIsBetter: false },
  { id: 'rating', label: 'Puan', key: 'provider.rating', type: 'rating', weight: 0.25, icon: 'star', higherIsBetter: true },
  { id: 'reviews', label: 'Değerlendirme', key: 'provider.reviewCount', type: 'number', weight: 0.10, icon: 'chatbubbles-outline', higherIsBetter: true },
  { id: 'verified', label: 'Onaylı', key: 'provider.verified', type: 'boolean', weight: 0.10, icon: 'shield-checkmark', higherIsBetter: true },
  { id: 'delivery', label: 'Teslim', key: 'deliveryDays', type: 'time', weight: 0.15, icon: 'time-outline', higherIsBetter: false },
  { id: 'experience', label: 'Deneyim', key: 'provider.completedJobs', type: 'number', weight: 0.05, icon: 'briefcase-outline', higherIsBetter: true },
];

// Sort options
export type OfferSortOption = 'price' | 'rating' | 'delivery' | 'score';

// Best in category badges
export interface BestInCategory {
  price: string | null;
  rating: string | null;
  delivery: string | null;
  reviews: string | null;
}
