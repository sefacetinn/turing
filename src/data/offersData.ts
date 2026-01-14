import { gradients } from '../theme/colors';

// Status types
export type OfferStatus = 'pending' | 'counter_offered' | 'accepted' | 'rejected';
export type OfferTabType = 'active' | 'accepted' | 'rejected';

export interface CounterOffer {
  amount: number;
  by: 'organizer' | 'provider';
  date: string;
  message?: string;
}

export interface OrganizerOffer {
  id: string;
  eventTitle: string;
  serviceCategory: string;
  serviceName: string;
  provider: {
    name: string;
    image: string;
    rating: number;
    verified: boolean;
  };
  amount: number;
  originalBudget: number;
  status: OfferStatus;
  date: string;
  deliveryTime: string;
  message: string;
  counterOffer: CounterOffer | null;
}

export interface ProviderOffer {
  id: string;
  eventTitle: string;
  organizer: {
    name: string;
    image: string;
  };
  serviceCategory: string;
  role: string;
  amount: number;
  status: OfferStatus;
  date: string;
  eventDate: string;
  location: string;
  counterOffer: CounterOffer | null;
}

// Organizer offers (received from providers)
export const organizerOffers: OrganizerOffer[] = [
  {
    id: 'o1',
    eventTitle: 'Yaz Festivali 2024',
    serviceCategory: 'technical',
    serviceName: 'Ses Sistemi',
    provider: {
      name: 'Pro Sound Istanbul',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
      rating: 4.9,
      verified: true,
    },
    amount: 85000,
    originalBudget: 100000,
    status: 'pending',
    date: '2 saat önce',
    deliveryTime: '3 gün',
    message: 'Festival için komple ses sistemi kurulumu teklifi.',
    counterOffer: null,
  },
  {
    id: 'o2',
    eventTitle: 'Tech Conference 2024',
    serviceCategory: 'technical',
    serviceName: 'Sahne Kurulum',
    provider: {
      name: 'Stage Masters',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200',
      rating: 4.8,
      verified: true,
    },
    amount: 75000,
    originalBudget: 60000,
    status: 'counter_offered',
    date: '1 gün önce',
    deliveryTime: '2 gün',
    message: 'Profesyonel sahne kurulumu ve teknik ekipman.',
    counterOffer: {
      amount: 65000,
      by: 'organizer',
      date: '5 saat önce',
      message: 'Bütçemiz 60.000 TL. 65.000 TL kabul edebiliriz.',
    },
  },
  {
    id: 'o3',
    eventTitle: 'Düğün - Zeynep & Can',
    serviceCategory: 'venue',
    serviceName: 'Çiçek Dekorasyon',
    provider: {
      name: 'Flora Design',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200',
      rating: 4.7,
      verified: true,
    },
    amount: 35000,
    originalBudget: 30000,
    status: 'counter_offered',
    date: '6 saat önce',
    deliveryTime: '3 gün',
    message: 'Premium çiçek düzenlemeleri ve mekan dekorasyonu.',
    counterOffer: {
      amount: 32000,
      by: 'provider',
      date: '2 saat önce',
      message: "32.000 TL'ye indirim yapabiliriz. Son teklifimiz.",
    },
  },
  {
    id: 'o4',
    eventTitle: 'Kurumsal Gala',
    serviceCategory: 'transport',
    serviceName: 'VIP Transfer',
    provider: {
      name: 'Elite Transfer',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200',
      rating: 4.8,
      verified: true,
    },
    amount: 12500,
    originalBudget: 15000,
    status: 'accepted',
    date: '1 gün önce',
    deliveryTime: '1 gün',
    message: 'VIP misafirler için lüks araç transferi.',
    counterOffer: null,
  },
  {
    id: 'o5',
    eventTitle: 'Yaz Festivali 2024',
    serviceCategory: 'technical',
    serviceName: 'Işık Sistemi',
    provider: {
      name: 'LightShow Pro',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200',
      rating: 4.6,
      verified: true,
    },
    amount: 65000,
    originalBudget: 70000,
    status: 'accepted',
    date: '2 gün önce',
    deliveryTime: '3 gün',
    message: 'Profesyonel sahne aydınlatma sistemi.',
    counterOffer: {
      amount: 62000,
      by: 'organizer',
      date: '2 gün önce',
      message: 'Kabul edilen karşı teklif.',
    },
  },
  {
    id: 'o6',
    eventTitle: 'Düğün - Ayşe & Mehmet',
    serviceCategory: 'venue',
    serviceName: 'Dekorasyon',
    provider: {
      name: 'Dream Decor',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200',
      rating: 4.7,
      verified: false,
    },
    amount: 28000,
    originalBudget: 25000,
    status: 'rejected',
    date: '3 gün önce',
    deliveryTime: '2 gün',
    message: 'Düğün dekorasyonu ve çiçek düzenlemeleri.',
    counterOffer: null,
  },
  {
    id: 'o7',
    eventTitle: 'Konser - Rock Night',
    serviceCategory: 'technical',
    serviceName: 'Ses & Işık',
    provider: {
      name: 'Mega Sound',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
      rating: 4.5,
      verified: true,
    },
    amount: 120000,
    originalBudget: 80000,
    status: 'rejected',
    date: '4 gün önce',
    deliveryTime: '5 gün',
    message: 'Full konser ses ve ışık sistemi.',
    counterOffer: {
      amount: 90000,
      by: 'organizer',
      date: '4 gün önce',
      message: 'Karşı teklif reddedildi.',
    },
  },
];

// Provider offers (sent to organizers)
export const providerOffers: ProviderOffer[] = [
  {
    id: 'po1',
    eventTitle: 'Yaz Festivali 2024',
    organizer: {
      name: 'Event Masters',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    },
    serviceCategory: 'technical',
    role: 'Ses Sistemi Sağlayıcı',
    amount: 85000,
    status: 'pending',
    date: '2 saat önce',
    eventDate: '15-17 Temmuz 2024',
    location: 'İstanbul, Kadıköy',
    counterOffer: null,
  },
  {
    id: 'po2',
    eventTitle: 'Kurumsal Lansman',
    organizer: {
      name: 'ABC Teknoloji',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    },
    serviceCategory: 'technical',
    role: 'Işık Sistemi',
    amount: 45000,
    status: 'counter_offered',
    date: '1 gün önce',
    eventDate: '20 Ağustos 2024',
    location: 'İstanbul, Maslak',
    counterOffer: {
      amount: 38000,
      by: 'organizer',
      date: '6 saat önce',
      message: 'Bütçemiz sınırlı, 38.000 TL önerebiliriz.',
    },
  },
  {
    id: 'po3',
    eventTitle: 'Düğün - Selin & Burak',
    organizer: {
      name: 'Selin Demir',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    },
    serviceCategory: 'booking',
    role: 'DJ Set',
    amount: 25000,
    status: 'counter_offered',
    date: '8 saat önce',
    eventDate: '15 Eylül 2024',
    location: 'İstanbul, Beşiktaş',
    counterOffer: {
      amount: 22000,
      by: 'provider',
      date: '3 saat önce',
      message: "22.000 TL'ye yapabilirim, ekipman dahil.",
    },
  },
  {
    id: 'po4',
    eventTitle: 'Kurumsal Gala Gecesi',
    organizer: {
      name: 'XYZ Holding',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    },
    serviceCategory: 'technical',
    role: 'Işık & Ses Operatörü',
    amount: 55000,
    status: 'accepted',
    date: '1 gün önce',
    eventDate: '22 Ağustos 2024',
    location: 'Ankara',
    counterOffer: null,
  },
  {
    id: 'po5',
    eventTitle: 'Düğün - Ayşe & Mehmet',
    organizer: {
      name: 'Ayşe Yılmaz',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    },
    serviceCategory: 'booking',
    role: 'Canlı Müzik',
    amount: 35000,
    status: 'accepted',
    date: '2 gün önce',
    eventDate: '1 Eylül 2024',
    location: 'İstanbul, Beşiktaş',
    counterOffer: {
      amount: 32000,
      by: 'organizer',
      date: '2 gün önce',
      message: 'Anlaştık!',
    },
  },
  {
    id: 'po6',
    eventTitle: 'Tech Conference 2024',
    organizer: {
      name: 'TechTR',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
    },
    serviceCategory: 'technical',
    role: 'Sahne Kurulum',
    amount: 45000,
    status: 'rejected',
    date: '5 gün önce',
    eventDate: '10-11 Ekim 2024',
    location: 'İstanbul',
    counterOffer: null,
  },
  {
    id: 'po7',
    eventTitle: 'Festival Anatolia',
    organizer: {
      name: 'Festival Org.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    },
    serviceCategory: 'technical',
    role: 'LED Ekran',
    amount: 80000,
    status: 'rejected',
    date: '4 gün önce',
    eventDate: '25-27 Ağustos 2024',
    location: 'Antalya',
    counterOffer: {
      amount: 70000,
      by: 'provider',
      date: '4 gün önce',
      message: 'Karşı teklif kabul edilmedi.',
    },
  },
];

// Helper functions
export const getCategoryGradient = (category: string): readonly [string, string, ...string[]] => {
  const categoryColors: Record<string, readonly [string, string]> = {
    booking: gradients.booking,
    technical: gradients.technical,
    venue: gradients.venue,
    accommodation: gradients.accommodation,
    transport: gradients.transport,
    flight: gradients.flight,
    operation: gradients.operation,
  };
  return categoryColors[category] || gradients.primary;
};

export const getStatusInfo = (
  status: OfferStatus,
  counterOffer: CounterOffer | null,
  isProvider: boolean
): { color: string; text: string; icon: string } => {
  const statusConfig: Record<string, { color: string; text: string; icon: string }> = {
    accepted: { color: 'success', text: 'Kabul Edildi', icon: 'checkmark-circle' },
    pending: { color: 'warning', text: 'Beklemede', icon: 'time' },
    rejected: { color: 'error', text: 'Reddedildi', icon: 'close-circle' },
    counter_offered: { color: 'brand', text: 'Pazarlık', icon: 'swap-horizontal' },
  };

  if (status === 'counter_offered' && counterOffer) {
    if ((isProvider && counterOffer.by === 'provider') || (!isProvider && counterOffer.by === 'organizer')) {
      return { ...statusConfig[status], text: 'Cevap Bekleniyor' };
    }
    return { ...statusConfig[status], text: 'Karşı Teklif Geldi' };
  }

  return statusConfig[status] || { color: 'textMuted', text: status, icon: 'help-circle' };
};

export const needsResponse = (
  offer: OrganizerOffer | ProviderOffer,
  isProviderMode: boolean
): boolean => {
  if (offer.status === 'pending') {
    return !isProviderMode;
  }
  if (offer.status === 'counter_offered' && offer.counterOffer) {
    if (isProviderMode) {
      return offer.counterOffer.by === 'organizer';
    } else {
      return offer.counterOffer.by === 'provider';
    }
  }
  return false;
};

// ============================================
// Enhanced Offers for Multi-Offer Comparison
// ============================================

import type { EnhancedOffer, QuoteRequest as ComparisonQuoteRequest } from '../types/comparison';

// Quote Requests (Teklif Talepleri)
export const quoteRequests: ComparisonQuoteRequest[] = [
  {
    id: 'qr1',
    eventId: '1',
    eventTitle: 'Yaz Festivali 2024',
    serviceId: 's3',
    serviceName: 'Ses Sistemi',
    category: 'technical',
    type: 'open',
    invitedProviders: [],
    deadline: '2024-06-25',
    budget: '80.000 - 100.000 ₺',
    budgetMin: 80000,
    budgetMax: 100000,
    notes: 'Ana sahne için profesyonel ses sistemi gerekiyor.',
    organizerName: 'Ahmet Yılmaz',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    status: 'open',
    offerCount: 3,
    createdAt: '2024-06-10',
  },
  {
    id: 'qr2',
    eventId: '1',
    eventTitle: 'Yaz Festivali 2024',
    serviceId: 's4',
    serviceName: 'Işık Sistemi',
    category: 'technical',
    type: 'invited',
    invitedProviders: ['p5', 'p6', 'p7'],
    deadline: '2024-06-28',
    budget: '60.000 - 80.000 ₺',
    budgetMin: 60000,
    budgetMax: 80000,
    notes: 'Sahne aydınlatma ve efekt ışıkları.',
    organizerName: 'Ahmet Yılmaz',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    status: 'open',
    offerCount: 2,
    createdAt: '2024-06-12',
  },
  {
    id: 'qr3',
    eventId: '1',
    eventTitle: 'Yaz Festivali 2024',
    serviceId: 's9',
    serviceName: 'Catering',
    category: 'catering',
    type: 'open',
    invitedProviders: [],
    deadline: '2024-06-30',
    budget: '150.000 - 200.000 ₺',
    budgetMin: 150000,
    budgetMax: 200000,
    notes: 'VIP alan ve backstage için yemek servisi.',
    organizerName: 'Ahmet Yılmaz',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    status: 'open',
    offerCount: 4,
    createdAt: '2024-06-14',
  },
];

// Enhanced Offers for Comparison
export const enhancedOffers: EnhancedOffer[] = [
  // Ses Sistemi Teklifleri (qr1)
  {
    id: 'eo1',
    quoteRequestId: 'qr1',
    eventId: '1',
    eventTitle: 'Yaz Festivali 2024',
    serviceId: 's3',
    serviceName: 'Ses Sistemi',
    category: 'technical',
    provider: {
      id: 'p1',
      name: 'Pro Sound Istanbul',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
      rating: 4.9,
      reviewCount: 128,
      verified: true,
      completedJobs: 450,
      responseTime: '2 saat',
    },
    amount: 85000,
    originalBudget: 100000,
    discountPercent: 15,
    deliveryTime: '3 gün',
    deliveryDays: 3,
    message: 'Festival için komple ses sistemi kurulumu. Line array sistem, 4 adet sub bass, dijital mikser dahil.',
    status: 'pending',
    createdAt: '2024-06-15',
  },
  {
    id: 'eo2',
    quoteRequestId: 'qr1',
    eventId: '1',
    eventTitle: 'Yaz Festivali 2024',
    serviceId: 's3',
    serviceName: 'Ses Sistemi',
    category: 'technical',
    provider: {
      id: 'p2',
      name: 'Mega Sound',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
      rating: 4.7,
      reviewCount: 95,
      verified: true,
      completedJobs: 320,
      responseTime: '4 saat',
    },
    amount: 92000,
    originalBudget: 100000,
    discountPercent: 8,
    deliveryTime: '2 gün',
    deliveryDays: 2,
    message: 'Profesyonel konser ses sistemi. JBL VTX serisi, teknik ekip dahil.',
    status: 'pending',
    createdAt: '2024-06-16',
  },
  {
    id: 'eo3',
    quoteRequestId: 'qr1',
    eventId: '1',
    eventTitle: 'Yaz Festivali 2024',
    serviceId: 's3',
    serviceName: 'Ses Sistemi',
    category: 'technical',
    provider: {
      id: 'p3',
      name: 'Sound Tech Pro',
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200',
      rating: 4.5,
      reviewCount: 67,
      verified: false,
      completedJobs: 180,
      responseTime: '6 saat',
    },
    amount: 78000,
    originalBudget: 100000,
    discountPercent: 22,
    deliveryTime: '4 gün',
    deliveryDays: 4,
    message: 'Ekonomik ses sistemi paketi. d&b audiotechnik, kurulum ve söküm dahil.',
    status: 'pending',
    createdAt: '2024-06-17',
  },

  // Işık Sistemi Teklifleri (qr2)
  {
    id: 'eo4',
    quoteRequestId: 'qr2',
    eventId: '1',
    eventTitle: 'Yaz Festivali 2024',
    serviceId: 's4',
    serviceName: 'Işık Sistemi',
    category: 'technical',
    provider: {
      id: 'p5',
      name: 'LightShow Pro',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200',
      rating: 4.8,
      reviewCount: 112,
      verified: true,
      completedJobs: 380,
      responseTime: '3 saat',
    },
    amount: 72000,
    originalBudget: 80000,
    discountPercent: 10,
    deliveryTime: '3 gün',
    deliveryDays: 3,
    message: 'Profesyonel sahne aydınlatma. Moving head, LED bar, lazer show dahil.',
    status: 'pending',
    createdAt: '2024-06-18',
  },
  {
    id: 'eo5',
    quoteRequestId: 'qr2',
    eventId: '1',
    eventTitle: 'Yaz Festivali 2024',
    serviceId: 's4',
    serviceName: 'Işık Sistemi',
    category: 'technical',
    provider: {
      id: 'p6',
      name: 'Bright Events',
      image: 'https://images.unsplash.com/photo-1504704911898-68304a7d2807?w=200',
      rating: 4.6,
      reviewCount: 84,
      verified: true,
      completedJobs: 245,
      responseTime: '5 saat',
    },
    amount: 68000,
    originalBudget: 80000,
    discountPercent: 15,
    deliveryTime: '2 gün',
    deliveryDays: 2,
    message: 'Festival ışık paketi. 20 adet moving head, truss sistemi, operatör dahil.',
    status: 'pending',
    createdAt: '2024-06-19',
  },

  // Catering Teklifleri (qr3)
  {
    id: 'eo6',
    quoteRequestId: 'qr3',
    eventId: '1',
    eventTitle: 'Yaz Festivali 2024',
    serviceId: 's9',
    serviceName: 'Catering',
    category: 'catering',
    provider: {
      id: 'p10',
      name: 'GourmetEvents',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200',
      rating: 4.9,
      reviewCount: 156,
      verified: true,
      completedJobs: 520,
      responseTime: '2 saat',
    },
    amount: 180000,
    originalBudget: 200000,
    discountPercent: 10,
    deliveryTime: '1 gün',
    deliveryDays: 1,
    message: 'Premium catering hizmeti. VIP menü, açık büfe, içecek servisi dahil.',
    status: 'pending',
    createdAt: '2024-06-20',
  },
  {
    id: 'eo7',
    quoteRequestId: 'qr3',
    eventId: '1',
    eventTitle: 'Yaz Festivali 2024',
    serviceId: 's9',
    serviceName: 'Catering',
    category: 'catering',
    provider: {
      id: 'p11',
      name: 'Feast & Co',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200',
      rating: 4.7,
      reviewCount: 98,
      verified: true,
      completedJobs: 340,
      responseTime: '4 saat',
    },
    amount: 165000,
    originalBudget: 200000,
    discountPercent: 17,
    deliveryTime: '2 gün',
    deliveryDays: 2,
    message: 'Festival catering paketi. 500 kişilik kapasite, vegan seçenekler mevcut.',
    status: 'pending',
    createdAt: '2024-06-21',
  },
  {
    id: 'eo8',
    quoteRequestId: 'qr3',
    eventId: '1',
    eventTitle: 'Yaz Festivali 2024',
    serviceId: 's9',
    serviceName: 'Catering',
    category: 'catering',
    provider: {
      id: 'p12',
      name: 'Urban Kitchen',
      image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=200',
      rating: 4.5,
      reviewCount: 72,
      verified: false,
      completedJobs: 190,
      responseTime: '6 saat',
    },
    amount: 155000,
    originalBudget: 200000,
    discountPercent: 22,
    deliveryTime: '3 gün',
    deliveryDays: 3,
    message: 'Ekonomik festival yemek hizmeti. Street food konsepti, hızlı servis.',
    status: 'pending',
    createdAt: '2024-06-22',
  },
  {
    id: 'eo9',
    quoteRequestId: 'qr3',
    eventId: '1',
    eventTitle: 'Yaz Festivali 2024',
    serviceId: 's9',
    serviceName: 'Catering',
    category: 'catering',
    provider: {
      id: 'p13',
      name: 'Elite Catering',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200',
      rating: 4.8,
      reviewCount: 134,
      verified: true,
      completedJobs: 410,
      responseTime: '3 saat',
    },
    amount: 195000,
    originalBudget: 200000,
    discountPercent: 2,
    deliveryTime: '1 gün',
    deliveryDays: 1,
    message: 'Lüks catering deneyimi. Michelin şef, özel menü tasarımı.',
    status: 'pending',
    createdAt: '2024-06-23',
  },
];

// Helper to get enhanced offers by quote request
export const getEnhancedOffersByQuoteRequest = (quoteRequestId: string): EnhancedOffer[] => {
  return enhancedOffers.filter((offer) => offer.quoteRequestId === quoteRequestId);
};

// Helper to get quote request by id
export const getQuoteRequestById = (id: string): ComparisonQuoteRequest | undefined => {
  return quoteRequests.find((qr) => qr.id === id);
};
