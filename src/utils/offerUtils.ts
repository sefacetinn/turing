import type {
  EnhancedOffer,
  GroupedOffers,
  ComparisonCriterion,
  BestInCategory,
  OfferSortOption,
} from '../types/comparison';

/**
 * Normalize a value to 0-100 scale
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 100;
  return Math.round(((value - min) / (max - min)) * 100);
}

/**
 * Inverse normalize (lower is better)
 */
function normalizeInverse(value: number, min: number, max: number): number {
  if (max === min) return 100;
  return Math.round(((max - value) / (max - min)) * 100);
}

/**
 * Parse delivery time string to days
 */
export function parseDeliveryDays(deliveryTime: string): number {
  const match = deliveryTime.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 7;
}

/**
 * Calculate individual scores for an offer
 */
export function calculateOfferScores(
  offers: EnhancedOffer[],
  criteria: ComparisonCriterion[]
): EnhancedOffer[] {
  if (offers.length === 0) return [];

  // Calculate ranges
  const prices = offers.map((o) => o.amount);
  const ratings = offers.map((o) => o.provider.rating);
  const deliveryDays = offers.map((o) => o.deliveryDays);

  const priceRange = { min: Math.min(...prices), max: Math.max(...prices) };
  const ratingRange = { min: Math.min(...ratings), max: Math.max(...ratings) };
  const deliveryRange = { min: Math.min(...deliveryDays), max: Math.max(...deliveryDays) };

  return offers.map((offer) => {
    const priceScore = normalizeInverse(offer.amount, priceRange.min, priceRange.max);
    const ratingScore = normalize(offer.provider.rating, ratingRange.min, ratingRange.max);
    const deliveryScore = normalizeInverse(offer.deliveryDays, deliveryRange.min, deliveryRange.max);

    // Calculate weighted overall score
    const priceCriterion = criteria.find((c) => c.id === 'price');
    const ratingCriterion = criteria.find((c) => c.id === 'rating');
    const deliveryCriterion = criteria.find((c) => c.id === 'delivery');

    const overallScore = Math.round(
      priceScore * (priceCriterion?.weight || 0.35) +
      ratingScore * (ratingCriterion?.weight || 0.25) +
      deliveryScore * (deliveryCriterion?.weight || 0.15) +
      (offer.provider.verified ? 10 : 0) * 0.10 +
      normalize(offer.provider.reviewCount, 0, 500) * 0.10 +
      normalize(offer.provider.completedJobs, 0, 500) * 0.05
    );

    return {
      ...offer,
      priceScore,
      ratingScore,
      deliveryScore,
      overallScore,
    };
  });
}

/**
 * Find the recommended offer (highest overall score)
 */
export function getRecommendedOffer(offers: EnhancedOffer[]): EnhancedOffer | undefined {
  if (offers.length === 0) return undefined;
  return offers.reduce((best, current) =>
    (current.overallScore || 0) > (best.overallScore || 0) ? current : best
  );
}

/**
 * Find best offer in each category
 */
export function getBestInCategories(offers: EnhancedOffer[]): BestInCategory {
  if (offers.length === 0) {
    return { price: null, rating: null, delivery: null, reviews: null };
  }

  const sortedByPrice = [...offers].sort((a, b) => a.amount - b.amount);
  const sortedByRating = [...offers].sort((a, b) => b.provider.rating - a.provider.rating);
  const sortedByDelivery = [...offers].sort((a, b) => a.deliveryDays - b.deliveryDays);
  const sortedByReviews = [...offers].sort((a, b) => b.provider.reviewCount - a.provider.reviewCount);

  return {
    price: sortedByPrice[0]?.id || null,
    rating: sortedByRating[0]?.id || null,
    delivery: sortedByDelivery[0]?.id || null,
    reviews: sortedByReviews[0]?.id || null,
  };
}

/**
 * Sort offers by specified option
 */
export function sortOffers(offers: EnhancedOffer[], sortBy: OfferSortOption): EnhancedOffer[] {
  return [...offers].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.amount - b.amount;
      case 'rating':
        return b.provider.rating - a.provider.rating;
      case 'delivery':
        return a.deliveryDays - b.deliveryDays;
      case 'score':
      default:
        return (b.overallScore || 0) - (a.overallScore || 0);
    }
  });
}

/**
 * Group offers by quoteRequestId or serviceId
 */
export function groupOffersByService(
  offers: EnhancedOffer[],
  quoteRequests?: { id: string; serviceId: string; serviceName: string; budget: string; budgetMin: number; budgetMax: number; deadline: string; type: 'open' | 'invited' }[]
): GroupedOffers[] {
  const groups = new Map<string, GroupedOffers>();

  offers.forEach((offer) => {
    const key = offer.quoteRequestId || offer.serviceId;

    if (!groups.has(key)) {
      const quoteRequest = quoteRequests?.find((qr) => qr.id === offer.quoteRequestId || qr.serviceId === offer.serviceId);

      groups.set(key, {
        quoteRequestId: offer.quoteRequestId,
        serviceId: offer.serviceId,
        serviceName: offer.serviceName,
        serviceCategory: offer.category,
        eventId: offer.eventId,
        eventTitle: offer.eventTitle,
        requestType: quoteRequest?.type || 'open',
        budget: quoteRequest?.budget || '',
        budgetMin: quoteRequest?.budgetMin || 0,
        budgetMax: quoteRequest?.budgetMax || 0,
        deadline: quoteRequest?.deadline || '',
        status: 'comparing',
        offers: [],
        totalOffers: 0,
        pendingOffers: 0,
        lowestPrice: Infinity,
        highestPrice: 0,
        avgRating: 0,
        recommendedOfferId: undefined,
      });
    }

    const group = groups.get(key)!;
    group.offers.push(offer);
    group.totalOffers++;

    if (offer.status === 'pending') {
      group.pendingOffers++;
    }

    if (offer.amount < group.lowestPrice) {
      group.lowestPrice = offer.amount;
    }
    if (offer.amount > group.highestPrice) {
      group.highestPrice = offer.amount;
    }
  });

  // Calculate averages and recommended
  return Array.from(groups.values()).map((group) => {
    const totalRating = group.offers.reduce((sum, o) => sum + o.provider.rating, 0);
    group.avgRating = group.offers.length > 0 ? totalRating / group.offers.length : 0;

    const recommended = getRecommendedOffer(group.offers);
    group.recommendedOfferId = recommended?.id;

    return group;
  });
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  if (amount >= 1000000) {
    return `₺${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `₺${(amount / 1000).toFixed(0)}K`;
  }
  return `₺${amount.toLocaleString('tr-TR')}`;
}

/**
 * Format price range
 */
export function formatPriceRange(min: number, max: number): string {
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

/**
 * Get badge text for best in category
 */
export function getBadgeText(offerId: string, bestIn: BestInCategory): string | null {
  if (bestIn.price === offerId) return 'En İyi Fiyat';
  if (bestIn.rating === offerId) return 'En Yüksek Puan';
  if (bestIn.delivery === offerId) return 'En Hızlı';
  if (bestIn.reviews === offerId) return 'En Çok Değerlendirilen';
  return null;
}

/**
 * Calculate savings compared to budget max
 */
export function calculateSavings(amount: number, budgetMax: number): number {
  if (budgetMax <= 0) return 0;
  return Math.max(0, budgetMax - amount);
}

/**
 * Check if offer is within budget
 */
export function isWithinBudget(amount: number, budgetMin: number, budgetMax: number): boolean {
  return amount >= budgetMin && amount <= budgetMax;
}
