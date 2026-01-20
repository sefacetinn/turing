import { gradients } from '../theme/colors';
import {
  events as coreEvents,
  providers as coreProviders,
  organizers as coreOrganizers,
  getVenue,
  getArtist,
} from './mockDataCore';

// ============================================
// TEKLİF DURUM MAKİNESİ (OFFER STATE MACHINE)
// ============================================
/**
 * DURUMLAR VE TANIMI:
 * ------------------
 *
 * 1. PENDING (Beklemede)
 *    - Provider teklifi yeni gönderdi
 *    - Organizatör henüz yanıt vermedi
 *    - Organizatör için: AKSİYON GEREKLİ (kabul/red/pazarlık)
 *    - Provider için: Cevap bekleniyor
 *    - Tab: "Aktif" sekmesinde gösterilir
 *
 * 2. COUNTER_OFFERED (Pazarlık Sürecinde)
 *    - Taraflardan biri karşı teklif yaptı
 *    - counterOffer.by = 'organizer': Organizatör pazarlık yaptı, PROVIDER aksiyon almalı
 *    - counterOffer.by = 'provider': Provider pazarlık yaptı, ORGANİZATÖR aksiyon almalı
 *    - Tab: "Aktif" sekmesinde gösterilir
 *    - DİKKAT: Bu durum ASLA "Onaylanan" sekmesinde gösterilmez!
 *
 * 3. ACCEPTED (Onaylandı)
 *    - Her iki taraf da teklifi kabul etti (karşılıklı onay)
 *    - acceptedBy = 'both': Karşılıklı onay tamamlandı
 *    - Sözleşme aşamasına geçilebilir
 *    - Tab: SADECE "Onaylanan" sekmesinde gösterilir
 *    - Artık pazarlık yapılamaz
 *
 * 4. REJECTED (Reddedildi)
 *    - Teklif tamamen reddedildi
 *    - rejectedBy: Kimin reddettiği
 *    - rejectionReason: Red sebebi
 *    - Tab: "Reddedilen" sekmesinde gösterilir
 *    - Süreç sonlandı
 *
 * 5. EXPIRED (Süresi Doldu) - Opsiyonel
 *    - Teklif geçerlilik süresi doldu
 *    - Otomatik olarak geçersiz
 *    - Tab: "Reddedilen" sekmesinde gösterilir
 *
 * 6. CANCELLED (İptal Edildi) - Opsiyonel
 *    - Taraflardan biri teklifi iptal etti
 *    - Tab: "Reddedilen" sekmesinde gösterilir
 *
 * DURUM GEÇİŞLERİ:
 * ----------------
 *
 *                    ┌─────────────────────────────────────────┐
 *                    │              PENDING                    │
 *                    │         (Provider teklif verdi)         │
 *                    └────────────────┬────────────────────────┘
 *                                     │
 *              ┌──────────────────────┼──────────────────────┐
 *              │                      │                      │
 *              ▼                      ▼                      ▼
 *    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
 *    │    ACCEPTED     │    │ COUNTER_OFFERED │    │    REJECTED     │
 *    │  (Direkt kabul) │    │   (Pazarlık)    │    │  (Direkt red)   │
 *    └─────────────────┘    └────────┬────────┘    └─────────────────┘
 *                                    │
 *              ┌─────────────────────┼─────────────────────┐
 *              │                     │                     │
 *              ▼                     ▼                     ▼
 *    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
 *    │    ACCEPTED     │    │ COUNTER_OFFERED │    │    REJECTED     │
 *    │  (Pazarlık      │    │  (Yeni pazarlık)│    │(Pazarlık reddi) │
 *    │   sonucu kabul) │    └─────────────────┘    └─────────────────┘
 *    └─────────────────┘
 *
 * SEKME - DURUM EŞLEŞTİRMESİ:
 * --------------------------
 *
 * | Sekme      | Gösterilen Durumlar                        |
 * |------------|---------------------------------------------|
 * | Aktif      | pending, counter_offered                    |
 * | Onaylanan  | SADECE accepted (acceptedBy: 'both')        |
 * | Reddedilen | rejected, expired, cancelled                |
 * | Taslaklar  | draft (henüz gönderilmemiş talepler)        |
 *
 */

// Status types - types/index.ts'den import ediyoruz (circular dependency'yi önlemek için)
import type { OfferStatus, OfferTabType } from '../types';

// Re-export for backwards compatibility
export type { OfferStatus, OfferTabType };

// Status-Tab mapping helper
export const getTabForStatus = (status: OfferStatus): OfferTabType => {
  switch (status) {
    case 'pending':
    case 'counter_offered':
      return 'active';
    case 'accepted':
      return 'accepted';
    case 'rejected':
    case 'expired':
    case 'cancelled':
      return 'rejected';
    default:
      return 'active';
  }
};

// Check if offer needs action from user
export const offerNeedsAction = (
  status: OfferStatus,
  counterOfferBy: 'organizer' | 'provider' | null,
  isProviderMode: boolean
): boolean => {
  if (status === 'pending') {
    // pending teklifler organizatör tarafından aksiyon gerektirir
    return !isProviderMode;
  }
  if (status === 'counter_offered' && counterOfferBy) {
    // Karşı tarafın yaptığı pazarlık için aksiyon gerekli
    if (isProviderMode) {
      return counterOfferBy === 'organizer'; // Organizatör pazarlık yaptı, provider cevap vermeli
    } else {
      return counterOfferBy === 'provider'; // Provider pazarlık yaptı, organizatör cevap vermeli
    }
  }
  return false;
};

// Draft request interface - Taslak teklif talepleri
export interface DraftRequest {
  id: string;
  eventId: string;
  eventTitle: string;
  category: string;
  categoryName: string;
  formData: Record<string, any>;
  budget?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CounterOffer {
  amount: number;
  by: 'organizer' | 'provider';
  date: string;
  message?: string;
}

export interface OrganizerOffer {
  id: string;
  eventId: string; // mockDataCore events ile uyumlu (EVT001, EVT002, vb.)
  eventTitle: string;
  eventCity?: string;
  eventDistrict?: string;
  eventVenue?: string;
  eventDate?: string;
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
  // Acceptance details
  acceptedAt?: string;
  acceptedBy?: 'both' | 'organizer' | 'provider';
  // Rejection details
  rejectedAt?: string;
  rejectedBy?: 'organizer' | 'provider';
  rejectionReason?: string;
}

// Offer history item for timeline
export interface OfferHistoryItem {
  id: string;
  type: 'submitted' | 'viewed' | 'counter' | 'accepted' | 'rejected' | 'message';
  by: 'provider' | 'organizer';
  amount?: number;
  message?: string;
  date: string;
}

export interface ProviderOffer {
  id: string;
  eventId: string;
  eventTitle: string;
  organizer: {
    id?: string;
    name: string;
    image: string;
  };
  serviceCategory: string;
  role: string;
  artistName?: string; // For booking category - artist name separate from role
  amount: number;
  status: OfferStatus;
  date: string;
  eventDate: string;
  location: string;
  counterOffer: CounterOffer | null;
  // Rejection details
  rejectedAt?: string;
  rejectedBy?: 'organizer' | 'provider';
  rejectionReason?: string;
  // Offer history/timeline
  history?: OfferHistoryItem[];
}

// Organizer offers (received from providers) - Organizatörün aldığı teklifler
// eventId'ler mockDataCore events ile uyumlu
export const organizerOffers: OrganizerOffer[] = [
  {
    id: 'o1',
    eventId: 'EVT001', // Big Bang Summer Festival
    eventTitle: 'Big Bang Summer Festival 2026',
    serviceCategory: 'technical',
    serviceName: 'Işık Sistemi',
    provider: {
      name: 'LightShow Pro',
      image: 'https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=200',
      rating: 4.8,
      verified: true,
    },
    amount: 138000,
    originalBudget: 145000,
    status: 'pending',
    date: '2 saat önce',
    deliveryTime: '3 gün',
    message: 'Festival ana sahne için komple ışık sistemi. 40 adet moving head, LED bar ve lazer sistemi dahil.',
    counterOffer: null,
  },
  {
    id: 'o2',
    eventId: 'EVT002', // Vodafone Park Konseri - Sıla
    eventTitle: 'Vodafone Park Konseri - Sıla',
    serviceCategory: 'technical',
    serviceName: 'Stadyum Ses Sistemi',
    provider: {
      name: 'Mega Sound Pro',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
      rating: 4.9,
      verified: true,
    },
    amount: 245000,
    originalBudget: 280000,
    status: 'counter_offered',
    date: '1 gün önce',
    deliveryTime: '2 gün',
    message: 'L-Acoustics K2 line array sistemi ile 35.000 kişilik stadyum için profesyonel ses çözümü.',
    counterOffer: {
      amount: 230000,
      by: 'organizer',
      date: '5 saat önce',
      message: 'Bütçemiz 250.000 TL. 230.000 TL kabul edebilir misiniz?',
    },
  },
  {
    id: 'o3',
    eventId: 'EVT001', // Big Bang Summer Festival
    eventTitle: 'Big Bang Summer Festival 2026',
    serviceCategory: 'technical',
    serviceName: 'LED Ekran & Görsel',
    provider: {
      name: 'Visual FX Turkey',
      image: 'https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=200',
      rating: 4.7,
      verified: true,
    },
    amount: 115000,
    originalBudget: 120000,
    status: 'counter_offered',
    date: '8 saat önce',
    deliveryTime: '3 gün',
    message: 'P3.9 outdoor LED ekran (80m²), video switcher ve 4 kameralı IMAG sistemi.',
    counterOffer: {
      amount: 108000,
      by: 'provider',
      date: '3 saat önce',
      message: "108.000 TL'ye indirim yapabiliriz. Kamera sayısını 3'e düşürebiliriz.",
    },
  },
  {
    id: 'o4',
    eventId: 'EVT001', // Big Bang Summer Festival
    eventTitle: 'Big Bang Summer Festival 2026',
    serviceCategory: 'accommodation',
    serviceName: 'Sanatçı Konaklama',
    provider: {
      name: 'Swissotel The Bosphorus',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
      rating: 4.8,
      verified: true,
    },
    amount: 92000,
    originalBudget: 95000,
    status: 'accepted',
    date: '2 gün önce',
    deliveryTime: '1 gün',
    message: 'Sanatçı ve ekip için 4 gece lüks konaklama. Presidential suite, junior suite ve deluxe odalar.',
    counterOffer: null,
    acceptedAt: '2 gün önce',
    acceptedBy: 'both', // Karşılıklı onay
  },
  {
    id: 'o5',
    eventId: 'EVT007', // Türkiye İnovasyon Zirvesi
    eventTitle: 'Türkiye İnovasyon Zirvesi 2026',
    serviceCategory: 'technical',
    serviceName: 'Canlı Yayın & Streaming',
    provider: {
      name: 'LiveStream Turkey',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=200',
      rating: 4.6,
      verified: true,
    },
    amount: 115000,
    originalBudget: 125000,
    status: 'accepted',
    date: '3 gün önce',
    deliveryTime: '2 gün',
    message: 'Multi-kamera prodüksiyon, YouTube ve LinkedIn Live streaming, grafik sistemi dahil.',
    counterOffer: {
      amount: 115000,
      by: 'organizer',
      date: '4 gün önce',
      message: 'Karşı teklif kabul edildi.',
    },
    acceptedAt: '3 gün önce',
    acceptedBy: 'both',
  },
  {
    id: 'o6',
    eventId: 'pe7', // Düğün - Zeynep & Emre
    eventTitle: 'Düğün - Zeynep & Emre',
    serviceCategory: 'media',
    serviceName: 'Düğün Fotoğraf & Video',
    provider: {
      name: 'Wedding Story',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200',
      rating: 4.9,
      verified: true,
    },
    amount: 95000,
    originalBudget: 100000,
    status: 'rejected',
    date: '5 gün önce',
    deliveryTime: '30 gün',
    message: 'Premium düğün fotoğraf ve video paketi. Drone çekimi, same day edit dahil.',
    counterOffer: null,
    rejectedAt: '5 gün önce',
    rejectedBy: 'organizer',
    rejectionReason: 'Başka bir firma ile anlaştık.',
  },
  {
    id: 'o7',
    eventId: 'EVT004', // Zeytinli Rock Festivali
    eventTitle: 'Zeytinli Rock Festivali 2026',
    serviceCategory: 'security',
    serviceName: 'Festival Güvenliği',
    provider: {
      name: 'SecurePro Events',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200',
      rating: 4.9,
      verified: true,
    },
    amount: 395000,
    originalBudget: 420000,
    status: 'pending',
    date: '4 saat önce',
    deliveryTime: '4 gün',
    message: '4 günlük festival için 250 güvenlik personeli, VIP koruma, giriş kontrol sistemi.',
    counterOffer: null,
  },
  {
    id: 'o8',
    eventId: 'EVT006', // Mercedes-Benz Fashion Week
    eventTitle: 'Mercedes-Benz Fashion Week Istanbul',
    serviceCategory: 'technical',
    serviceName: 'Podyum Işık Tasarımı',
    provider: {
      name: 'Fashion Light Studio',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
      rating: 4.8,
      verified: true,
    },
    amount: 285000,
    originalBudget: 320000,
    status: 'pending',
    date: '6 saat önce',
    deliveryTime: '5 gün',
    message: 'Defile podyumu için özel ışık tasarımı. Follow spot, LED bar, moving head dahil.',
    counterOffer: null,
  },
  {
    id: 'o9',
    eventId: 'EVT008', // Garanti BBVA Kurumsal Gala
    eventTitle: 'Garanti BBVA Kurumsal Gala 2026',
    serviceCategory: 'catering',
    serviceName: 'Gala Catering',
    provider: {
      name: 'GourmetEvents Catering',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200',
      rating: 4.9,
      verified: true,
    },
    amount: 325000,
    originalBudget: 350000,
    status: 'rejected',
    date: '1 hafta önce',
    deliveryTime: '1 gün',
    message: 'Premium kurumsal gala catering. Fine dining menü, 1200 kişilik kapasite.',
    counterOffer: null, // Reddedilen tekliflerde counterOffer olmamalı
    rejectedAt: '1 hafta önce',
    rejectedBy: 'provider',
    rejectionReason: 'Teklif edilen bütçe karşılanamadı.',
  },
  {
    id: 'o10',
    eventId: 'EVT002', // Vodafone Park Konseri - Sıla
    eventTitle: 'Vodafone Park Konseri - Sıla',
    serviceCategory: 'transport',
    serviceName: 'VIP Transfer Hizmeti',
    provider: {
      name: 'Premium Transfer Istanbul',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200',
      rating: 4.7,
      verified: true,
    },
    amount: 48000,
    originalBudget: 55000,
    status: 'accepted',
    date: '4 gün önce',
    deliveryTime: '1 gün',
    message: 'Sanatçı ve 8 kişilik ekip için VIP Mercedes Sprinter transfer hizmeti.',
    counterOffer: null,
    acceptedAt: '4 gün önce',
    acceptedBy: 'both',
  },
  {
    id: 'o11',
    eventId: 'EVT006', // Mercedes-Benz Fashion Week
    eventTitle: 'Mercedes-Benz Fashion Week Istanbul',
    serviceCategory: 'catering',
    serviceName: 'Backstage Catering',
    provider: {
      name: 'Deluxe Catering Co.',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200',
      rating: 4.6,
      verified: true,
    },
    amount: 78000,
    originalBudget: 85000,
    status: 'rejected',
    date: '6 gün önce',
    deliveryTime: '1 gün',
    message: 'Model ve ekip için backstage catering. 4 gün, 200 kişi kapasiteli.',
    counterOffer: null, // Reddedilen tekliflerde counterOffer olmamalı
    rejectedAt: '6 gün önce',
    rejectedBy: 'organizer',
    rejectionReason: 'Rakip firma daha uygun teklif sundu.',
  },
];

// Provider offers (sent to organizers) - Sağlayıcının gönderdiği teklifler
// Organized by service category for filtering
// eventId'ler mockDataCore events ile uyumlu
export const providerOffers: ProviderOffer[] = [
  // ================== TECHNICAL OFFERS ==================
  {
    id: 'po1',
    eventId: 'EVT001', // Big Bang Summer Festival
    eventTitle: coreEvents.EVT001.title,
    organizer: {
      name: coreOrganizers.ORG001.name,
      image: coreOrganizers.ORG001.logo,
    },
    serviceCategory: 'technical',
    role: 'Ana Sahne Ses Sistemi',
    amount: 185000,
    status: 'accepted',
    date: '3 gün önce',
    eventDate: '10-12 Temmuz 2026',
    location: 'İstanbul, Maçka',
    counterOffer: null,
  },
  {
    id: 'po2',
    eventId: 'EVT002', // Vodafone Park Konseri - Sıla
    eventTitle: coreEvents.EVT002.title,
    organizer: {
      name: coreOrganizers.ORG002.name,
      image: coreOrganizers.ORG002.logo,
    },
    serviceCategory: 'technical',
    role: 'Stadyum Ses Sistemi',
    amount: 245000,
    status: 'counter_offered',
    date: '1 gün önce',
    eventDate: '28 Ağustos 2026',
    location: 'İstanbul, Beşiktaş',
    counterOffer: {
      amount: 230000,
      by: 'organizer',
      date: '5 saat önce',
      message: 'Bütçemiz 250.000 TL. 230.000 TL kabul edebilir misiniz?',
    },
  },
  {
    id: 'po3',
    eventId: 'EVT007', // Türkiye İnovasyon Zirvesi
    eventTitle: coreEvents.EVT007.title,
    organizer: {
      name: coreOrganizers.ORG004.name,
      image: coreOrganizers.ORG004.logo,
    },
    serviceCategory: 'technical',
    role: 'Konferans Ses & Görsel',
    amount: 95000,
    status: 'pending',
    date: '2 saat önce',
    eventDate: '22-23 Nisan 2026',
    location: 'İstanbul, Şişli',
    counterOffer: null,
  },
  {
    id: 'po4',
    eventId: 'EVT004', // Zeytinli Rock Festivali
    eventTitle: coreEvents.EVT004.title,
    organizer: {
      name: coreOrganizers.ORG001.name,
      image: coreOrganizers.ORG001.logo,
    },
    serviceCategory: 'technical',
    role: 'Festival Ses Sistemi',
    amount: 280000,
    status: 'accepted',
    date: '1 hafta önce',
    eventDate: '16-19 Temmuz 2026',
    location: 'Balıkesir, Edremit',
    counterOffer: null,
  },
  {
    id: 'po5',
    eventId: 'EVT006', // Mercedes-Benz Fashion Week
    eventTitle: coreEvents.EVT006.title,
    organizer: {
      name: coreOrganizers.ORG005.name,
      image: coreOrganizers.ORG005.logo,
    },
    serviceCategory: 'technical',
    role: 'Defile Ses & Işık Sistemi',
    amount: 145000,
    status: 'pending',
    date: '8 saat önce',
    eventDate: '12-16 Ekim 2026',
    location: 'İstanbul, Beşiktaş',
    counterOffer: null,
  },
  {
    id: 'po6',
    eventId: 'EVT005', // Harbiye Açıkhava - Tarkan
    eventTitle: coreEvents.EVT005.title,
    organizer: {
      name: coreOrganizers.ORG003.name,
      image: coreOrganizers.ORG003.logo,
    },
    serviceCategory: 'technical',
    role: 'Konser Ses Sistemi',
    amount: 165000,
    status: 'rejected',
    date: '4 gün önce',
    eventDate: '15 Ağustos 2026',
    location: 'İstanbul, Şişli',
    counterOffer: null,
  },

  // ================== BOOKING OFFERS ==================
  {
    id: 'po_book_1',
    eventId: 'EVT002', // Vodafone Park - Sıla
    eventTitle: coreEvents.EVT002.title,
    organizer: {
      id: 'ORG002',
      name: coreOrganizers.ORG002.name,
      image: coreOrganizers.ORG002.logo,
    },
    serviceCategory: 'booking',
    role: 'Sıla - Ana Sahne Performansı',
    artistName: 'Sıla',
    amount: 650000,
    status: 'accepted',
    date: '3 gün önce',
    eventDate: '28 Ağustos 2026',
    location: 'İstanbul, Beşiktaş',
    counterOffer: null,
    history: [
      { id: 'h1', type: 'submitted', by: 'provider', amount: 650000, date: '5 gün önce' },
      { id: 'h2', type: 'viewed', by: 'organizer', date: '4 gün önce' },
      { id: 'h3', type: 'accepted', by: 'organizer', date: '3 gün önce' },
    ],
  },
  {
    id: 'po_book_2',
    eventId: 'EVT004', // Zeytinli Rock Festivali - Mabel Matiz
    eventTitle: coreEvents.EVT004.title,
    organizer: {
      id: 'ORG001',
      name: coreOrganizers.ORG001.name,
      image: coreOrganizers.ORG001.logo,
    },
    serviceCategory: 'booking',
    role: 'Mabel Matiz - Sahne Performansı',
    artistName: 'Mabel Matiz',
    amount: 380000,
    status: 'pending',
    date: '1 gün önce',
    eventDate: '16-19 Temmuz 2026',
    location: 'Balıkesir, Edremit',
    counterOffer: null,
    history: [
      { id: 'h1', type: 'submitted', by: 'provider', amount: 380000, date: '1 gün önce' },
    ],
  },
  {
    id: 'po_book_3',
    eventId: 'EVT001', // Big Bang Festival - Tarkan
    eventTitle: coreEvents.EVT001.title,
    organizer: {
      id: 'ORG001',
      name: coreOrganizers.ORG001.name,
      image: coreOrganizers.ORG001.logo,
    },
    serviceCategory: 'booking',
    role: 'Tarkan - Headliner',
    artistName: 'Tarkan',
    amount: 950000,
    status: 'counter_offered',
    date: '5 saat önce',
    eventDate: '10-12 Temmuz 2026',
    location: 'İstanbul, Maçka',
    counterOffer: {
      amount: 850000,
      by: 'organizer',
      date: '2 saat önce',
      message: 'Festival bütçemiz kısıtlı. 850.000 TL kabul edebilir misiniz?',
    },
    history: [
      { id: 'h1', type: 'submitted', by: 'provider', amount: 950000, date: '5 saat önce' },
      { id: 'h2', type: 'viewed', by: 'organizer', date: '4 saat önce' },
      { id: 'h3', type: 'counter', by: 'organizer', amount: 850000, message: 'Festival bütçemiz kısıtlı. 850.000 TL kabul edebilir misiniz?', date: '2 saat önce' },
    ],
  },
  {
    id: 'po_book_4',
    eventId: 'EVT003', // Kurumsal Yılbaşı Gecesi - Sıla
    eventTitle: coreEvents.EVT003.title,
    organizer: {
      id: 'ORG004',
      name: coreOrganizers.ORG004.name,
      image: coreOrganizers.ORG004.logo,
    },
    serviceCategory: 'booking',
    role: 'Sıla - Özel Performans',
    artistName: 'Sıla',
    amount: 550000,
    status: 'accepted',
    date: '1 hafta önce',
    eventDate: '31 Aralık 2026',
    location: 'İstanbul, Beşiktaş',
    counterOffer: null,
    history: [
      { id: 'h1', type: 'submitted', by: 'provider', amount: 580000, date: '2 hafta önce' },
      { id: 'h2', type: 'viewed', by: 'organizer', date: '12 gün önce' },
      { id: 'h3', type: 'counter', by: 'organizer', amount: 520000, message: 'Bütçemiz 520.000 TL civarı.', date: '10 gün önce' },
      { id: 'h4', type: 'counter', by: 'provider', amount: 550000, message: '550.000 TL son teklifimizdir.', date: '9 gün önce' },
      { id: 'h5', type: 'accepted', by: 'organizer', date: '1 hafta önce' },
    ],
  },
  {
    id: 'po_book_5',
    eventId: 'EVT005', // Harbiye - Tarkan
    eventTitle: coreEvents.EVT005.title,
    organizer: {
      id: 'ORG003',
      name: coreOrganizers.ORG003.name,
      image: coreOrganizers.ORG003.logo,
    },
    serviceCategory: 'booking',
    role: 'Tarkan - Yaz Konseri',
    artistName: 'Tarkan',
    amount: 850000,
    status: 'rejected',
    date: '3 gün önce',
    eventDate: '15 Ağustos 2026',
    location: 'İstanbul, Şişli',
    counterOffer: null,
    rejectedAt: '3 gün önce',
    rejectedBy: 'organizer',
    rejectionReason: 'Başka bir ajans ile anlaşma sağlandı.',
    history: [
      { id: 'h1', type: 'submitted', by: 'provider', amount: 850000, date: '5 gün önce' },
      { id: 'h2', type: 'viewed', by: 'organizer', date: '4 gün önce' },
      { id: 'h3', type: 'rejected', by: 'organizer', message: 'Başka bir ajans ile anlaşma sağlandı.', date: '3 gün önce' },
    ],
  },
  // ================== NEW BOOKING OFFERS ==================
  {
    id: 'po_book_6',
    eventId: 'EVT001', // Big Bang Summer Festival
    eventTitle: coreEvents.EVT001.title,
    organizer: {
      id: 'ORG001',
      name: coreOrganizers.ORG001.name,
      image: coreOrganizers.ORG001.logo,
    },
    serviceCategory: 'booking',
    role: 'Duman - Rock Sahne',
    artistName: 'Duman',
    amount: 420000,
    status: 'pending',
    date: '4 saat önce',
    eventDate: '10-12 Temmuz 2026',
    location: 'İstanbul, Maçka',
    counterOffer: null,
    history: [
      { id: 'h1', type: 'submitted', by: 'provider', amount: 420000, date: '4 saat önce' },
    ],
  },
  {
    id: 'po_book_7',
    eventId: 'EVT004', // Zeytinli Rock Festivali
    eventTitle: coreEvents.EVT004.title,
    organizer: {
      id: 'ORG001',
      name: coreOrganizers.ORG001.name,
      image: coreOrganizers.ORG001.logo,
    },
    serviceCategory: 'booking',
    role: 'Mor ve Ötesi - Ana Sahne',
    artistName: 'Mor ve Ötesi',
    amount: 380000,
    status: 'counter_offered',
    date: '2 gün önce',
    eventDate: '16-19 Temmuz 2026',
    location: 'Balıkesir, Edremit',
    counterOffer: {
      amount: 350000,
      by: 'organizer',
      date: '1 gün önce',
      message: 'Festival bütçemiz kısıtlı, 350.000 TL önerebiliriz.',
    },
    history: [
      { id: 'h1', type: 'submitted', by: 'provider', amount: 380000, date: '2 gün önce' },
      { id: 'h2', type: 'viewed', by: 'organizer', date: '2 gün önce' },
      { id: 'h3', type: 'counter', by: 'organizer', amount: 350000, message: 'Festival bütçemiz kısıtlı, 350.000 TL önerebiliriz.', date: '1 gün önce' },
    ],
  },
  {
    id: 'po_book_8',
    eventId: 'EVT002', // Vodafone Park
    eventTitle: coreEvents.EVT002.title,
    organizer: {
      id: 'ORG002',
      name: coreOrganizers.ORG002.name,
      image: coreOrganizers.ORG002.logo,
    },
    serviceCategory: 'booking',
    role: 'Teoman - Açılış Performansı',
    artistName: 'Teoman',
    amount: 280000,
    status: 'pending',
    date: '6 saat önce',
    eventDate: '28 Ağustos 2026',
    location: 'İstanbul, Beşiktaş',
    counterOffer: null,
    history: [
      { id: 'h1', type: 'submitted', by: 'provider', amount: 280000, date: '6 saat önce' },
    ],
  },
  {
    id: 'po_book_9',
    eventId: 'EVT008', // Garanti BBVA Gala
    eventTitle: coreEvents.EVT008.title,
    organizer: {
      id: 'ORG004',
      name: coreOrganizers.ORG004.name,
      image: coreOrganizers.ORG004.logo,
    },
    serviceCategory: 'booking',
    role: 'Kenan Doğulu - Özel Gece',
    artistName: 'Kenan Doğulu',
    amount: 320000,
    status: 'counter_offered',
    date: '1 gün önce',
    eventDate: '5 Eylül 2026',
    location: 'İstanbul, Beşiktaş',
    counterOffer: {
      amount: 290000,
      by: 'organizer',
      date: '12 saat önce',
      message: 'Kurumsal bütçemiz dahilinde 290.000 TL önerebiliriz.',
    },
    history: [
      { id: 'h1', type: 'submitted', by: 'provider', amount: 320000, date: '1 gün önce' },
      { id: 'h2', type: 'viewed', by: 'organizer', date: '20 saat önce' },
      { id: 'h3', type: 'counter', by: 'organizer', amount: 290000, message: 'Kurumsal bütçemiz dahilinde 290.000 TL önerebiliriz.', date: '12 saat önce' },
    ],
  },
  {
    id: 'po_book_10',
    eventId: 'EVT006', // Fashion Week Istanbul
    eventTitle: coreEvents.EVT006.title,
    organizer: {
      id: 'ORG005',
      name: coreOrganizers.ORG005.name,
      image: coreOrganizers.ORG005.logo,
    },
    serviceCategory: 'booking',
    role: 'Simge Sağın - DJ Set',
    artistName: 'Simge Sağın',
    amount: 180000,
    status: 'rejected',
    date: '4 gün önce',
    eventDate: '12-16 Ekim 2026',
    location: 'İstanbul, Beşiktaş',
    counterOffer: null,
    rejectedAt: '4 gün önce',
    rejectedBy: 'organizer',
    rejectionReason: 'Etkinlik konseptine daha uygun bir sanatçı tercih edildi.',
    history: [
      { id: 'h1', type: 'submitted', by: 'provider', amount: 180000, date: '6 gün önce' },
      { id: 'h2', type: 'viewed', by: 'organizer', date: '5 gün önce' },
      { id: 'h3', type: 'rejected', by: 'organizer', message: 'Etkinlik konseptine daha uygun bir sanatçı tercih edildi.', date: '4 gün önce' },
    ],
  },

  // ================== CATERING OFFERS ==================
  {
    id: 'po_cat_1',
    eventId: 'EVT001', // Big Bang Summer Festival
    eventTitle: coreEvents.EVT001.title,
    organizer: {
      name: coreOrganizers.ORG001.name,
      image: coreOrganizers.ORG001.logo,
    },
    serviceCategory: 'catering',
    role: 'Festival VIP & Backstage Catering',
    amount: 280000,
    status: 'pending',
    date: '2 saat önce',
    eventDate: '10-12 Temmuz 2026',
    location: 'İstanbul, Maçka',
    counterOffer: null,
  },
  {
    id: 'po_cat_2',
    eventId: 'EVT008', // Garanti BBVA Kurumsal Gala
    eventTitle: coreEvents.EVT008.title,
    organizer: {
      name: coreOrganizers.ORG004.name,
      image: coreOrganizers.ORG004.logo,
    },
    serviceCategory: 'catering',
    role: 'Premium Kurumsal Catering',
    amount: 325000,
    status: 'accepted',
    date: '5 gün önce',
    eventDate: '5 Eylül 2026',
    location: 'İstanbul, Beşiktaş',
    counterOffer: null,
  },
  {
    id: 'po_cat_3',
    eventId: 'EVT007', // Türkiye İnovasyon Zirvesi
    eventTitle: coreEvents.EVT007.title,
    organizer: {
      name: coreOrganizers.ORG004.name,
      image: coreOrganizers.ORG004.logo,
    },
    serviceCategory: 'catering',
    role: 'Konferans Catering - 3000 Kişi',
    amount: 195000,
    status: 'counter_offered',
    date: '1 gün önce',
    eventDate: '22-23 Nisan 2026',
    location: 'İstanbul, Şişli',
    counterOffer: {
      amount: 180000,
      by: 'organizer',
      date: '6 saat önce',
      message: 'Menüyü biraz sadeleştirirsek 180.000 TL\'ye anlaşabilir miyiz?',
    },
  },
  {
    id: 'po_cat_4',
    eventId: 'EVT004', // Zeytinli Rock Festivali
    eventTitle: coreEvents.EVT004.title,
    organizer: {
      name: coreOrganizers.ORG001.name,
      image: coreOrganizers.ORG001.logo,
    },
    serviceCategory: 'catering',
    role: 'Festival Catering - 4 Gün',
    amount: 350000,
    status: 'pending',
    date: '8 saat önce',
    eventDate: '16-19 Temmuz 2026',
    location: 'Balıkesir, Edremit',
    counterOffer: null,
  },
  {
    id: 'po_cat_5',
    eventId: 'EVT006', // Mercedes-Benz Fashion Week
    eventTitle: coreEvents.EVT006.title,
    organizer: {
      name: coreOrganizers.ORG005.name,
      image: coreOrganizers.ORG005.logo,
    },
    serviceCategory: 'catering',
    role: 'Backstage Catering',
    amount: 220000,
    status: 'rejected',
    date: '1 hafta önce',
    eventDate: '12-16 Ekim 2026',
    location: 'İstanbul, Beşiktaş',
    counterOffer: null,
  },

  // ================== TRANSPORT OFFERS ==================
  {
    id: 'po_trans_1',
    eventId: 'EVT001', // Big Bang Summer Festival
    eventTitle: coreEvents.EVT001.title,
    organizer: {
      name: coreOrganizers.ORG001.name,
      image: coreOrganizers.ORG001.logo,
    },
    serviceCategory: 'transport',
    role: 'VIP Sanatçı Transferi',
    amount: 85000,
    status: 'accepted',
    date: '4 gün önce',
    eventDate: '10-12 Temmuz 2026',
    location: 'İstanbul, Maçka',
    counterOffer: null,
  },
  {
    id: 'po_trans_2',
    eventId: 'EVT002', // Vodafone Park Konseri - Sıla
    eventTitle: coreEvents.EVT002.title,
    organizer: {
      name: coreOrganizers.ORG002.name,
      image: coreOrganizers.ORG002.logo,
    },
    serviceCategory: 'transport',
    role: 'Sanatçı & Ekip Transfer',
    amount: 48000,
    status: 'pending',
    date: '2 saat önce',
    eventDate: '28 Ağustos 2026',
    location: 'İstanbul, Beşiktaş',
    counterOffer: null,
  },
  {
    id: 'po_trans_3',
    eventId: 'EVT007', // Türkiye İnovasyon Zirvesi
    eventTitle: coreEvents.EVT007.title,
    organizer: {
      name: coreOrganizers.ORG004.name,
      image: coreOrganizers.ORG004.logo,
    },
    serviceCategory: 'transport',
    role: 'VIP Transfer & Shuttle',
    amount: 185000,
    status: 'counter_offered',
    date: '12 saat önce',
    eventDate: '22-23 Nisan 2026',
    location: 'İstanbul, Şişli',
    counterOffer: {
      amount: 170000,
      by: 'organizer',
      date: '4 saat önce',
      message: '170.000 TL son bütçemiz. Araç sayısını 20\'ye düşürebilir misiniz?',
    },
  },
  {
    id: 'po_trans_4',
    eventId: 'EVT005', // Harbiye Açıkhava - Tarkan
    eventTitle: coreEvents.EVT005.title,
    organizer: {
      name: coreOrganizers.ORG003.name,
      image: coreOrganizers.ORG003.logo,
    },
    serviceCategory: 'transport',
    role: 'Tarkan & Ekip Transfer',
    amount: 65000,
    status: 'accepted',
    date: '1 hafta önce',
    eventDate: '15 Ağustos 2026',
    location: 'İstanbul, Şişli',
    counterOffer: null,
  },
  {
    id: 'po_trans_5',
    eventId: 'EVT004', // Zeytinli Rock Festivali
    eventTitle: coreEvents.EVT004.title,
    organizer: {
      name: coreOrganizers.ORG001.name,
      image: coreOrganizers.ORG001.logo,
    },
    serviceCategory: 'transport',
    role: 'Festival Shuttle Servisi',
    amount: 120000,
    status: 'rejected',
    date: '5 gün önce',
    eventDate: '16-19 Temmuz 2026',
    location: 'Balıkesir, Edremit',
    counterOffer: null,
  },

  // ================== SECURITY OFFERS ==================
  {
    id: 'po_sec_1',
    eventId: 'EVT002', // Vodafone Park Konseri - Sıla
    eventTitle: coreEvents.EVT002.title,
    organizer: {
      name: coreOrganizers.ORG002.name,
      image: coreOrganizers.ORG002.logo,
    },
    serviceCategory: 'security',
    role: 'Stadyum Güvenlik Hizmeti',
    amount: 280000,
    status: 'counter_offered',
    date: '1 gün önce',
    eventDate: '28 Ağustos 2026',
    location: 'İstanbul, Beşiktaş',
    counterOffer: {
      amount: 250000,
      by: 'organizer',
      date: '5 saat önce',
      message: 'Bütçemiz kısıtlı. 250.000 TL\'ye anlaşabilir miyiz?',
    },
  },
  {
    id: 'po_sec_2',
    eventId: 'EVT004', // Zeytinli Rock Festivali
    eventTitle: coreEvents.EVT004.title,
    organizer: {
      name: coreOrganizers.ORG001.name,
      image: coreOrganizers.ORG001.logo,
    },
    serviceCategory: 'security',
    role: '4 Günlük Festival Güvenliği',
    amount: 395000,
    status: 'pending',
    date: '2 saat önce',
    eventDate: '16-19 Temmuz 2026',
    location: 'Balıkesir, Edremit',
    counterOffer: null,
  },
  {
    id: 'po_sec_3',
    eventId: 'EVT008', // Garanti BBVA Kurumsal Gala
    eventTitle: coreEvents.EVT008.title,
    organizer: {
      name: coreOrganizers.ORG004.name,
      image: coreOrganizers.ORG004.logo,
    },
    serviceCategory: 'security',
    role: 'VIP Güvenlik Hizmeti',
    amount: 95000,
    status: 'accepted',
    date: '3 gün önce',
    eventDate: '5 Eylül 2026',
    location: 'İstanbul, Beşiktaş',
    counterOffer: null,
  },
  {
    id: 'po_sec_4',
    eventId: 'EVT006', // Mercedes-Benz Fashion Week
    eventTitle: coreEvents.EVT006.title,
    organizer: {
      name: coreOrganizers.ORG005.name,
      image: coreOrganizers.ORG005.logo,
    },
    serviceCategory: 'security',
    role: '5 Günlük Fashion Week Güvenliği',
    amount: 185000,
    status: 'pending',
    date: '6 saat önce',
    eventDate: '12-16 Ekim 2026',
    location: 'İstanbul, Beşiktaş',
    counterOffer: null,
  },
  {
    id: 'po_sec_5',
    eventId: 'EVT001', // Big Bang Summer Festival
    eventTitle: coreEvents.EVT001.title,
    organizer: {
      name: coreOrganizers.ORG001.name,
      image: coreOrganizers.ORG001.logo,
    },
    serviceCategory: 'security',
    role: 'Festival Ana Güvenlik',
    amount: 380000,
    status: 'accepted',
    date: '1 hafta önce',
    eventDate: '10-12 Temmuz 2026',
    location: 'İstanbul, Maçka',
    counterOffer: null,
  },
  {
    id: 'po_sec_6',
    eventId: 'EVT005', // Harbiye Açıkhava - Tarkan
    eventTitle: coreEvents.EVT005.title,
    organizer: {
      name: coreOrganizers.ORG003.name,
      image: coreOrganizers.ORG003.logo,
    },
    serviceCategory: 'security',
    role: 'Konser Güvenliği',
    amount: 65000,
    status: 'rejected',
    date: '4 gün önce',
    eventDate: '15 Ağustos 2026',
    location: 'İstanbul, Şişli',
    counterOffer: null,
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

/**
 * Teklif durumu için görsel bilgileri döndürür
 * State machine'e göre tutarlı status bilgisi sağlar
 */
export const getStatusInfo = (
  status: OfferStatus,
  counterOffer: CounterOffer | null,
  isProvider: boolean
): { color: string; text: string; icon: string; actionRequired: boolean } => {
  // Temel durum konfigürasyonu
  const statusConfig: Record<OfferStatus, { color: string; text: string; icon: string }> = {
    accepted: { color: 'success', text: 'Onaylandı', icon: 'checkmark-circle' },
    pending: { color: 'warning', text: 'Beklemede', icon: 'time' },
    quoted: { color: 'brand', text: 'Teklif Geldi', icon: 'document-text' },
    rejected: { color: 'error', text: 'Reddedildi', icon: 'close-circle' },
    counter_offered: { color: 'brand', text: 'Pazarlık Devam Ediyor', icon: 'swap-horizontal' },
    expired: { color: 'textMuted', text: 'Süresi Doldu', icon: 'timer-outline' },
    cancelled: { color: 'textMuted', text: 'İptal Edildi', icon: 'ban' },
  };

  let actionRequired = false;

  // Pending durumu - organizatör için aksiyon gerekli
  if (status === 'pending') {
    actionRequired = !isProvider;
    const config = statusConfig[status];
    return {
      ...config,
      text: isProvider ? 'Cevap Bekleniyor' : 'Yanıt Bekliyor',
      actionRequired,
    };
  }

  // Counter offered durumu - karşı taraf için aksiyon gerekli
  if (status === 'counter_offered' && counterOffer) {
    // Kim cevap vermeli?
    const waitingForProvider = counterOffer.by === 'organizer';
    const waitingForOrganizer = counterOffer.by === 'provider';

    if (isProvider) {
      // Provider bakış açısı
      actionRequired = waitingForProvider;
      return {
        ...statusConfig[status],
        text: waitingForProvider ? 'Karşı Teklif Geldi' : 'Pazarlık Devam Ediyor',
        actionRequired,
      };
    } else {
      // Organizatör bakış açısı
      actionRequired = waitingForOrganizer;
      return {
        ...statusConfig[status],
        text: waitingForOrganizer ? 'Karşı Teklif Geldi' : 'Pazarlık Devam Ediyor',
        actionRequired,
      };
    }
  }

  // Diğer durumlar
  return {
    ...(statusConfig[status] || { color: 'textMuted', text: status, icon: 'help-circle' }),
    actionRequired: false,
  };
};

/**
 * Durum için uygun badge rengini döndürür
 */
export const getStatusBadgeStyle = (
  status: OfferStatus,
  counterOffer: CounterOffer | null,
  isProvider: boolean
): { backgroundColor: string; textColor: string } => {
  const statusInfo = getStatusInfo(status, counterOffer, isProvider);

  const colorMap: Record<string, { backgroundColor: string; textColor: string }> = {
    success: { backgroundColor: 'rgba(34, 197, 94, 0.15)', textColor: '#22c55e' },
    warning: { backgroundColor: 'rgba(245, 158, 11, 0.15)', textColor: '#f59e0b' },
    error: { backgroundColor: 'rgba(239, 68, 68, 0.15)', textColor: '#ef4444' },
    brand: { backgroundColor: 'rgba(75, 48, 184, 0.15)', textColor: '#4b30b8' },
    textMuted: { backgroundColor: 'rgba(156, 163, 175, 0.15)', textColor: '#9ca3af' },
  };

  return colorMap[statusInfo.color] || colorMap.textMuted;
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
    eventTitle: 'Big Bang Summer Festival 2026',
    serviceId: 's5',
    serviceName: 'Işık Sistemi',
    category: 'technical',
    type: 'open',
    invitedProviders: [],
    deadline: '2026-06-25',
    budget: '130.000 - 150.000 ₺',
    budgetMin: 130000,
    budgetMax: 150000,
    notes: 'Ana sahne için profesyonel ışık sistemi gerekiyor. Moving head, LED bar, lazer dahil olmalı.',
    organizerName: 'Event Masters Turkey',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    status: 'open',
    offerCount: 4,
    createdAt: '2026-06-05',
  },
  {
    id: 'qr2',
    eventId: '1',
    eventTitle: 'Big Bang Summer Festival 2026',
    serviceId: 's11',
    serviceName: 'Festival Catering',
    category: 'catering',
    type: 'invited',
    invitedProviders: ['p6', 'p10', 'p11'],
    deadline: '2026-06-28',
    budget: '250.000 - 300.000 ₺',
    budgetMin: 250000,
    budgetMax: 300000,
    notes: 'VIP alan, backstage ve staff için ayrı menüler. Vegan ve gluten-free seçenekler olmalı.',
    organizerName: 'Event Masters Turkey',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    status: 'open',
    offerCount: 3,
    createdAt: '2026-06-06',
  },
  {
    id: 'qr3',
    eventId: '2',
    eventTitle: 'Vodafone Park Konseri - Sıla',
    serviceId: 's3',
    serviceName: 'Stadyum Ses Sistemi',
    category: 'technical',
    type: 'open',
    invitedProviders: [],
    deadline: '2026-07-15',
    budget: '220.000 - 280.000 ₺',
    budgetMin: 220000,
    budgetMax: 280000,
    notes: '35.000 kişilik stadyum konseri için profesyonel ses sistemi.',
    organizerName: 'Event Masters Turkey',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    status: 'open',
    offerCount: 3,
    createdAt: '2026-06-15',
  },
  {
    id: 'qr4',
    eventId: '6',
    eventTitle: 'Zeytinli Rock Festivali 2026',
    serviceId: 's6',
    serviceName: 'Festival Güvenliği',
    category: 'security',
    type: 'invited',
    invitedProviders: ['p4', 'p12', 'p13'],
    deadline: '2026-06-30',
    budget: '380.000 - 450.000 ₺',
    budgetMin: 380000,
    budgetMax: 450000,
    notes: '4 günlük rock festivali için komple güvenlik çözümü. 40.000 katılımcı bekleniyor.',
    organizerName: 'Pozitif Live',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    status: 'open',
    offerCount: 2,
    createdAt: '2026-06-01',
  },
];

// Enhanced Offers for Comparison
export const enhancedOffers: EnhancedOffer[] = [
  // Işık Sistemi Teklifleri (qr1)
  {
    id: 'eo1',
    quoteRequestId: 'qr1',
    eventId: '1',
    eventTitle: 'Big Bang Summer Festival 2026',
    serviceId: 's5',
    serviceName: 'Işık Sistemi',
    category: 'technical',
    provider: {
      id: 'p5',
      name: 'LightShow Pro',
      image: 'https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=200',
      rating: 4.8,
      reviewCount: 198,
      verified: true,
      completedJobs: 520,
      responseTime: '2 saat',
    },
    amount: 138000,
    originalBudget: 145000,
    discountPercent: 5,
    deliveryTime: '3 gün',
    deliveryDays: 3,
    message: '40 adet Clay Paky moving head, 24 LED bar, lazer show sistemi. Truss ve rigging dahil.',
    status: 'pending',
    createdAt: '2026-06-08',
  },
  {
    id: 'eo2',
    quoteRequestId: 'qr1',
    eventId: '1',
    eventTitle: 'Big Bang Summer Festival 2026',
    serviceId: 's5',
    serviceName: 'Işık Sistemi',
    category: 'technical',
    provider: {
      id: 'p14',
      name: 'Bright Events Turkey',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200',
      rating: 4.6,
      reviewCount: 145,
      verified: true,
      completedJobs: 380,
      responseTime: '4 saat',
    },
    amount: 128000,
    originalBudget: 145000,
    discountPercent: 12,
    deliveryTime: '4 gün',
    deliveryDays: 4,
    message: '36 moving head, 20 LED bar, lazer sistemi. Kurulum ve söküm dahil.',
    status: 'pending',
    createdAt: '2026-06-09',
  },
  {
    id: 'eo3',
    quoteRequestId: 'qr1',
    eventId: '1',
    eventTitle: 'Big Bang Summer Festival 2026',
    serviceId: 's5',
    serviceName: 'Işık Sistemi',
    category: 'technical',
    provider: {
      id: 'p15',
      name: 'Festival Light Co.',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200',
      rating: 4.5,
      reviewCount: 89,
      verified: false,
      completedJobs: 210,
      responseTime: '6 saat',
    },
    amount: 118000,
    originalBudget: 145000,
    discountPercent: 19,
    deliveryTime: '5 gün',
    deliveryDays: 5,
    message: 'Ekonomik festival ışık paketi. 30 moving head, 16 LED bar.',
    status: 'pending',
    createdAt: '2026-06-10',
  },
  {
    id: 'eo4',
    quoteRequestId: 'qr1',
    eventId: '1',
    eventTitle: 'Big Bang Summer Festival 2026',
    serviceId: 's5',
    serviceName: 'Işık Sistemi',
    category: 'technical',
    provider: {
      id: 'p16',
      name: 'Premium Light Design',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
      rating: 4.9,
      reviewCount: 234,
      verified: true,
      completedJobs: 620,
      responseTime: '1 saat',
    },
    amount: 155000,
    originalBudget: 145000,
    discountPercent: -7,
    deliveryTime: '2 gün',
    deliveryDays: 2,
    message: 'Premium paket: 50 moving head, 32 LED bar, 2 lazer sistemi, haze makineleri, özel efektler.',
    status: 'pending',
    createdAt: '2026-06-07',
  },

  // Catering Teklifleri (qr2)
  {
    id: 'eo5',
    quoteRequestId: 'qr2',
    eventId: '1',
    eventTitle: 'Big Bang Summer Festival 2026',
    serviceId: 's11',
    serviceName: 'Festival Catering',
    category: 'catering',
    provider: {
      id: 'p6',
      name: 'GourmetEvents Catering',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200',
      rating: 4.9,
      reviewCount: 345,
      verified: true,
      completedJobs: 680,
      responseTime: '3 saat',
    },
    amount: 275000,
    originalBudget: 280000,
    discountPercent: 2,
    deliveryTime: '1 gün',
    deliveryDays: 1,
    message: 'Premium festival catering. VIP fine dining, backstage açık büfe, staff paket yemek. Tüm diyet seçenekleri.',
    status: 'pending',
    createdAt: '2026-06-12',
  },
  {
    id: 'eo6',
    quoteRequestId: 'qr2',
    eventId: '1',
    eventTitle: 'Big Bang Summer Festival 2026',
    serviceId: 's11',
    serviceName: 'Festival Catering',
    category: 'catering',
    provider: {
      id: 'p10',
      name: 'Feast & Festival',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200',
      rating: 4.7,
      reviewCount: 178,
      verified: true,
      completedJobs: 420,
      responseTime: '4 saat',
    },
    amount: 248000,
    originalBudget: 280000,
    discountPercent: 11,
    deliveryTime: '2 gün',
    deliveryDays: 2,
    message: 'Festival catering paketi. Açık büfe, food truck konsepti, 24 saat hizmet.',
    status: 'pending',
    createdAt: '2026-06-13',
  },
  {
    id: 'eo7',
    quoteRequestId: 'qr2',
    eventId: '1',
    eventTitle: 'Big Bang Summer Festival 2026',
    serviceId: 's11',
    serviceName: 'Festival Catering',
    category: 'catering',
    provider: {
      id: 'p11',
      name: 'Urban Kitchen Events',
      image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=200',
      rating: 4.5,
      reviewCount: 112,
      verified: false,
      completedJobs: 280,
      responseTime: '5 saat',
    },
    amount: 225000,
    originalBudget: 280000,
    discountPercent: 20,
    deliveryTime: '3 gün',
    deliveryDays: 3,
    message: 'Ekonomik festival yemek çözümü. Street food konsepti, hızlı servis.',
    status: 'pending',
    createdAt: '2026-06-14',
  },

  // Stadyum Ses Sistemi Teklifleri (qr3)
  {
    id: 'eo8',
    quoteRequestId: 'qr3',
    eventId: '2',
    eventTitle: 'Vodafone Park Konseri - Sıla',
    serviceId: 's3',
    serviceName: 'Stadyum Ses Sistemi',
    category: 'technical',
    provider: {
      id: 'p1',
      name: 'Mega Sound Pro',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
      rating: 4.9,
      reviewCount: 312,
      verified: true,
      completedJobs: 890,
      responseTime: '1 saat',
    },
    amount: 245000,
    originalBudget: 260000,
    discountPercent: 6,
    deliveryTime: '2 gün',
    deliveryDays: 2,
    message: 'L-Acoustics K2 line array, KS28 subwoofer, delay tower sistemi. 35.000 kişilik stadyum için optimize.',
    status: 'counter_offered',
    createdAt: '2026-06-20',
  },
  {
    id: 'eo9',
    quoteRequestId: 'qr3',
    eventId: '2',
    eventTitle: 'Vodafone Park Konseri - Sıla',
    serviceId: 's3',
    serviceName: 'Stadyum Ses Sistemi',
    category: 'technical',
    provider: {
      id: 'p17',
      name: 'Pro Sound Istanbul',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
      rating: 4.9,
      reviewCount: 312,
      verified: true,
      completedJobs: 890,
      responseTime: '1 saat',
    },
    amount: 258000,
    originalBudget: 260000,
    discountPercent: 1,
    deliveryTime: '3 gün',
    deliveryDays: 3,
    message: 'd&b audiotechnik GSL sistemi. Premium ses kalitesi, teknik ekip ve 24 saat destek dahil.',
    status: 'pending',
    createdAt: '2026-06-21',
  },
  {
    id: 'eo10',
    quoteRequestId: 'qr3',
    eventId: '2',
    eventTitle: 'Vodafone Park Konseri - Sıla',
    serviceId: 's3',
    serviceName: 'Stadyum Ses Sistemi',
    category: 'technical',
    provider: {
      id: 'p18',
      name: 'Concert Sound TR',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
      rating: 4.6,
      reviewCount: 156,
      verified: true,
      completedJobs: 340,
      responseTime: '3 saat',
    },
    amount: 228000,
    originalBudget: 260000,
    discountPercent: 12,
    deliveryTime: '4 gün',
    deliveryDays: 4,
    message: 'JBL VTX serisi line array. Ekonomik stadyum paketi, kurulum ve söküm dahil.',
    status: 'pending',
    createdAt: '2026-06-22',
  },

  // Festival Güvenliği Teklifleri (qr4)
  {
    id: 'eo11',
    quoteRequestId: 'qr4',
    eventId: '6',
    eventTitle: 'Zeytinli Rock Festivali 2026',
    serviceId: 's6',
    serviceName: 'Festival Güvenliği',
    category: 'security',
    provider: {
      id: 'p4',
      name: 'SecurePro Events',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200',
      rating: 4.9,
      reviewCount: 289,
      verified: true,
      completedJobs: 780,
      responseTime: '1 saat',
    },
    amount: 395000,
    originalBudget: 420000,
    discountPercent: 6,
    deliveryTime: '4 gün',
    deliveryDays: 4,
    message: '250 güvenlik personeli, VIP koruma, giriş kontrol, CCTV izleme merkezi, acil müdahale ekibi.',
    status: 'pending',
    createdAt: '2026-06-15',
  },
  {
    id: 'eo12',
    quoteRequestId: 'qr4',
    eventId: '6',
    eventTitle: 'Zeytinli Rock Festivali 2026',
    serviceId: 's6',
    serviceName: 'Festival Güvenliği',
    category: 'security',
    provider: {
      id: 'p12',
      name: 'Guard Istanbul',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200',
      rating: 4.7,
      reviewCount: 198,
      verified: true,
      completedJobs: 540,
      responseTime: '2 saat',
    },
    amount: 365000,
    originalBudget: 420000,
    discountPercent: 13,
    deliveryTime: '5 gün',
    deliveryDays: 5,
    message: '220 güvenlik personeli, giriş kontrol sistemi, VIP güvenlik ekibi.',
    status: 'pending',
    createdAt: '2026-06-16',
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

// ============================================
// Draft Requests - Taslak Teklif Talepleri
// ============================================

// DraftRequests eventId'leri mockDataCore events ile uyumlu
export const draftRequests: DraftRequest[] = [
  {
    id: 'draft1',
    eventId: 'EVT001', // Big Bang Summer Festival
    eventTitle: 'Big Bang Summer Festival 2026',
    category: 'booking',
    categoryName: 'Sanatçı',
    formData: {
      eventType: 'Festival',
      venueType: 'Açık Alan',
      guestCount: '5000+',
      duration: '90 dk',
      ageRestriction: '+18',
      seatingType: 'Ayakta',
    },
    budget: '250000',
    notes: 'Rock sahnesine uygun sanatçı aranıyor',
    createdAt: '2026-01-10T14:30:00',
    updatedAt: '2026-01-10T15:45:00',
  },
  {
    id: 'draft2',
    eventId: 'EVT002', // Vodafone Park Konseri
    eventTitle: 'Vodafone Park Konseri - Sıla',
    category: 'technical',
    categoryName: 'Teknik Ekipman',
    formData: {
      indoorOutdoor: 'Açık Alan',
      venueSize: 'Çok Büyük (1000m²+)',
      soundRequirements: ['Line Array', 'Subwoofer', 'Sahne Monitör'],
      lightingRequirements: ['Moving Head', 'LED Bar', 'Lazer'],
      stageSize: '12x10m',
      powerAvailable: '125A',
    },
    budget: '',
    notes: '',
    createdAt: '2026-01-08T10:00:00',
    updatedAt: '2026-01-08T10:00:00',
  },
  {
    id: 'draft3',
    eventId: 'pe7', // Düğün - Zeynep & Emre
    eventTitle: 'Düğün - Zeynep & Emre',
    category: 'decoration',
    categoryName: 'Dekorasyon',
    formData: {
      decorTheme: 'Klasik',
      decorAreas: ['Giriş', 'Sahne', 'Masa'],
      floralsNeeded: true,
    },
    budget: '85000',
    notes: 'Beyaz ve pembe renk tonları tercih ediliyor',
    createdAt: '2026-01-05T09:15:00',
    updatedAt: '2026-01-12T11:30:00',
  },
];

// Helper to get draft by id
export const getDraftById = (id: string): DraftRequest | undefined => {
  return draftRequests.find((draft) => draft.id === id);
};

// Helper to get drafts by event
export const getDraftsByEvent = (eventId: string): DraftRequest[] => {
  return draftRequests.filter((draft) => draft.eventId === eventId);
};
