import { gradients } from '../theme/colors';
import {
  artists as coreArtists,
  providers as coreProviders,
  organizers as coreOrganizers,
  events as coreEvents,
  getVenue,
  getArtist,
} from './mockDataCore';
import { calculateDaysUntil } from '../utils/calendarUtils';

// Artist data - mockDataCore'dan dönüştürülmüş
export const artists = Object.values(coreArtists).map((artist) => ({
  id: artist.id,
  name: artist.name,
  genre: artist.genre,
  image: artist.image,
  rating: artist.rating,
}));

// Service categories
export const categories = [
  {
    id: 'booking',
    name: 'Booking',
    description: 'Sanatçı & DJ',
    icon: 'musical-notes',
    gradient: gradients.booking,
    popular: true,
  },
  {
    id: 'technical',
    name: 'Teknik',
    description: 'Ses & Işık & Sahne',
    icon: 'volume-high',
    gradient: gradients.technical,
    popular: true,
  },
  {
    id: 'venue',
    name: 'Mekan',
    description: 'Etkinlik Alanları',
    icon: 'business',
    gradient: gradients.venue,
    popular: false,
  },
  {
    id: 'accommodation',
    name: 'Konaklama',
    description: 'Otel & Konut',
    icon: 'bed',
    gradient: gradients.accommodation,
    popular: false,
  },
  {
    id: 'transport',
    name: 'Ulaşım',
    description: 'VIP Transfer',
    icon: 'car',
    gradient: gradients.transport,
    popular: false,
  },
  {
    id: 'operation',
    name: 'Operasyon',
    description: 'Güvenlik, Catering & Daha',
    icon: 'settings',
    gradient: gradients.operation,
    popular: false,
  },
];

// Recent providers - mockDataCore'dan dönüştürülmüş
const getCategoryLabel = (serviceTypes: string[]): string => {
  const categoryMap: Record<string, string> = {
    technical: 'Teknik',
    sound: 'Ses',
    lighting: 'Işık',
    booking: 'Booking',
    catering: 'Catering',
    security: 'Güvenlik',
    transport: 'Ulaşım',
    accommodation: 'Konaklama',
  };
  return categoryMap[serviceTypes[0]] || serviceTypes[0];
};

export const recentProviders = Object.values(coreProviders).map((provider) => ({
  id: provider.id,
  name: provider.name,
  category: getCategoryLabel(provider.serviceTypes),
  rating: provider.rating,
  reviews: Math.floor(Math.random() * 300) + 150, // Rastgele review sayısı
  location: provider.location,
  verified: true,
  image: provider.logo,
}));

// Provider stats - EventPro 360 istatistikleri
export const providerStats = {
  monthlyEarnings: 2850000,
  pendingPayments: 780000,
  completedJobs: 234,
  upcomingJobs: 14, // homeData upcomingJobs array ile eşleşmeli
  pendingOffers: 18,
  rating: 4.9,
  responseRate: 98,
  reviewCount: 456,
  profileViews: 3247,
  conversionRate: 42,
};

// Upcoming jobs for provider - 2026 tarihleriyle
// ID'ler providerEventsData.ts ile eşleştirildi
// Status değerleri providerEventsData ile uyumlu: 'planned' | 'active' | 'past'
export const upcomingJobs = [
  // TECHNICAL JOBS - providerEventsData'daki EVT ID'leri kullanılıyor
  {
    id: 'EVT001', // Big Bang Summer Festival
    title: 'Big Bang Festival - İstanbul',
    date: '10-12 Temmuz 2026',
    location: 'KüçükÇiftlik Park, İstanbul',
    role: 'Ana Sahne Ses & Işık',
    earnings: 485000,
    daysUntil: 176,
    status: 'active', // Etkinlik onaylı ve hazırlık devam ediyor
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    serviceType: 'technical',
  },
  {
    id: 'EVT002', // Sıla konseri
    title: 'Sıla - İstanbul',
    date: '28 Ağustos 2026',
    location: 'Vodafone Park, İstanbul',
    role: 'Sahne Prodüksiyon',
    earnings: 650000,
    daysUntil: 225,
    status: 'planned', // Etkinlik planlandı
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
    serviceType: 'technical',
  },
  {
    id: 'EVT006', // Fashion Week
    title: 'Fashion Week - İstanbul',
    date: '12-16 Ekim 2026',
    location: 'Zorlu PSM, İstanbul',
    role: 'Işık Tasarımı & Kurulum',
    earnings: 380000,
    daysUntil: 270,
    status: 'planned', // Etkinlik planlandı
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    serviceType: 'technical',
  },
  {
    id: 'EVT004', // Zeytinli Rock Festivali
    title: 'Zeytinli Rock - Balıkesir',
    date: '16-19 Temmuz 2026',
    location: 'Zeytinli Açık Hava, Balıkesir',
    role: 'Festival Güvenliği',
    earnings: 380000,
    daysUntil: 182,
    status: 'active', // Etkinlik onaylı ve hazırlık devam ediyor
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400',
    serviceType: 'security',
  },
  {
    id: 'EVT008', // Kurumsal Gala
    title: 'Garanti BBVA Gala - İstanbul',
    date: '5 Eylül 2026',
    location: 'Four Seasons Bosphorus, İstanbul',
    role: 'Premium Catering (800 kişi)',
    earnings: 325000,
    daysUntil: 233,
    status: 'planned',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
    serviceType: 'catering',
  },
  // BOOKING JOBS - providerEventsData ile eşleşen
  {
    id: 'EVT010', // Booking - Tarkan
    title: 'Tarkan - Ankara',
    date: '15 Nisan 2026',
    location: 'Congresium, Ankara',
    role: 'Ana Sahne Performansı',
    earnings: 1200000,
    daysUntil: 88,
    status: 'active', // Etkinlik onaylı
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    serviceType: 'booking',
  },
  {
    id: 'EVT011', // Booking - Duman
    title: 'Duman - İzmir',
    date: '8 Mayıs 2026',
    location: 'Kültürpark, İzmir',
    role: 'Festival Headliner',
    earnings: 750000,
    daysUntil: 111,
    status: 'planned', // Etkinlik planlandı
    image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400',
    serviceType: 'booking',
  },
  {
    id: 'EVT012', // Booking - Mabel Matiz
    title: 'Mabel Matiz - İstanbul',
    date: '30 Mayıs 2026',
    location: 'Parkorman, İstanbul',
    role: 'Yaz Konseri',
    earnings: 620000,
    daysUntil: 133,
    status: 'active', // Etkinlik onaylı
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    serviceType: 'booking',
  },
  {
    id: 'EVT013', // Booking - Sertab Erener
    title: 'Sertab Erener - Bodrum',
    date: '18 Temmuz 2026',
    location: 'Antik Tiyatro, Bodrum',
    role: 'Yaz Konseri Serisi',
    earnings: 680000,
    daysUntil: 184,
    status: 'active', // Etkinlik onaylı
    image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400',
    serviceType: 'booking',
  },
  // TRANSPORT JOBS
  {
    id: 'pe_tr_01',
    title: 'Sıla - İstanbul VIP Transfer',
    date: '22 Mart 2026',
    location: 'İstanbul Havalimanı - Harbiye',
    role: 'Sanatçı VIP Transfer',
    earnings: 45000,
    daysUntil: 66,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
    serviceType: 'transport',
  },
  {
    id: 'pe_tr_02',
    title: 'Kongre Katılımcı Transfer - Ankara',
    date: '10-12 Nisan 2026',
    location: 'Esenboğa - Congresium',
    role: 'Shuttle Servisi',
    earnings: 125000,
    daysUntil: 85,
    status: 'planned',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400',
    serviceType: 'transport',
  },
  // ACCOMMODATION JOBS
  {
    id: 'pe_acc_01',
    title: 'Festival VIP Konaklama - İstanbul',
    date: '15-17 Temmuz 2026',
    location: 'Four Seasons Bosphorus',
    role: 'Sanatçı Konaklama Paketi',
    earnings: 185000,
    daysUntil: 182,
    status: 'planned',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    serviceType: 'accommodation',
  },
  // SECURITY JOBS
  {
    id: 'pe_sec_01',
    title: 'Tarkan Konseri Güvenlik - İstanbul',
    date: '28 Ağustos 2026',
    location: 'Vodafone Park, İstanbul',
    role: 'VIP & Genel Güvenlik',
    earnings: 280000,
    daysUntil: 226,
    status: 'planned',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400',
    serviceType: 'security',
  },
  // CATERING JOBS
  {
    id: 'pe_cat_01',
    title: 'Kongre Catering - Ankara',
    date: '22-23 Nisan 2026',
    location: 'Lütfi Kırdar, İstanbul',
    role: 'Premium Catering Servisi',
    earnings: 165000,
    daysUntil: 97,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
    serviceType: 'catering',
  },
];

/**
 * Dinamik daysUntil hesaplamasiyla upcomingJobs dondurur
 * Her cagrildiginda guncel tarih farki hesaplanir
 */
export const getUpcomingJobsWithDaysUntil = () => {
  return upcomingJobs.map(job => ({
    ...job,
    daysUntil: calculateDaysUntil(job.date),
  }));
};

/**
 * Sadece gelecekteki isleri daysUntil'e gore sirali dondurur
 */
export const getFutureJobsSorted = (limit?: number) => {
  const jobs = getUpcomingJobsWithDaysUntil()
    .filter(job => job.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);
  return limit ? jobs.slice(0, limit) : jobs;
};

// Recent requests for provider - Yeni talepler
// Title format: "Sanatçı Adı - Şehir" veya "Etkinlik Adı - Şehir"
export const recentRequests = [
  // TECHNICAL REQUESTS
  {
    id: '1',
    title: 'Red Bull Night - İstanbul',
    category: 'Ses & Işık Sistemi',
    organizer: 'Red Bull Türkiye',
    organizerImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
    location: 'Babylon, İstanbul',
    date: '8 Mart 2026',
    budget: '180.000 - 250.000 ₺',
    isNew: true,
    isHot: true,
    timeAgo: '30 dk önce',
    matchScore: 98,
    serviceType: 'technical',
  },
  {
    id: '2',
    title: 'İnovasyon Zirvesi - İstanbul',
    category: 'Teknik Prodüksiyon',
    organizer: 'TÜSİAD',
    organizerImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
    location: 'Lütfi Kırdar, İstanbul',
    date: '22-23 Nisan 2026',
    budget: '420.000 - 580.000 ₺',
    isNew: true,
    isHot: true,
    timeAgo: '2 saat önce',
    matchScore: 95,
    serviceType: 'technical',
  },
  {
    id: '3',
    title: 'F1 Grand Prix - İstanbul',
    category: 'Sahne & Işık',
    organizer: 'Intercity',
    organizerImage: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=100',
    location: 'İstanbul Park',
    date: '4-6 Eylül 2026',
    budget: '350.000 - 480.000 ₺',
    isNew: true,
    isHot: false,
    timeAgo: '5 saat önce',
    matchScore: 92,
    serviceType: 'technical',
  },
  {
    id: '4',
    title: 'Deniz & Can - İstanbul',
    category: 'Ses & Işık & DJ',
    organizer: 'Özel Müşteri',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    location: 'Çırağan Palace, İstanbul',
    date: '19 Eylül 2026',
    budget: '85.000 - 120.000 ₺',
    isNew: false,
    isHot: false,
    timeAgo: '1 gün önce',
    matchScore: 88,
    serviceType: 'technical',
  },
  {
    id: '5',
    title: 'Beşiktaş JK - İstanbul',
    category: 'Komple Etkinlik Prodüksiyonu',
    organizer: 'Beşiktaş JK',
    organizerImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
    location: 'Vodafone Park, İstanbul',
    date: '3 Mart 2026',
    budget: '850.000 - 1.200.000 ₺',
    isNew: false,
    isHot: true,
    timeAgo: '2 gün önce',
    matchScore: 94,
    serviceType: 'technical',
  },
  // BOOKING REQUESTS
  {
    id: '6',
    title: 'Yaz Festivali - İzmir',
    category: 'Sanatçı Booking',
    organizer: 'İzmir Büyükşehir',
    organizerImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
    location: 'Kültürpark, İzmir',
    date: '20-22 Haziran 2026',
    budget: '2.500.000 - 4.000.000 ₺',
    isNew: true,
    isHot: true,
    timeAgo: '1 saat önce',
    matchScore: 96,
    serviceType: 'booking',
  },
  {
    id: '7',
    title: 'Kurumsal Gala - İstanbul',
    category: 'Sanatçı Performansı',
    organizer: 'Koç Holding',
    organizerImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
    location: 'Four Seasons Bosphorus',
    date: '15 Mayıs 2026',
    budget: '800.000 - 1.200.000 ₺',
    isNew: true,
    isHot: false,
    timeAgo: '3 saat önce',
    matchScore: 94,
    serviceType: 'booking',
  },
  {
    id: '8',
    title: 'Düğün Organizasyonu - Bodrum',
    category: 'Canlı Performans',
    organizer: 'VIP Müşteri',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    location: 'Mandarin Oriental, Bodrum',
    date: '28 Haziran 2026',
    budget: '600.000 - 900.000 ₺',
    isNew: false,
    isHot: true,
    timeAgo: '6 saat önce',
    matchScore: 91,
    serviceType: 'booking',
  },
  {
    id: '9',
    title: 'Açılış Konseri - Ankara',
    category: 'Headliner Sanatçı',
    organizer: 'Bilkent Center',
    organizerImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
    location: 'Bilkent Center, Ankara',
    date: '1 Ekim 2026',
    budget: '1.000.000 - 1.500.000 ₺',
    isNew: false,
    isHot: false,
    timeAgo: '1 gün önce',
    matchScore: 89,
    serviceType: 'booking',
  },
  // TRANSPORT REQUESTS
  {
    id: '10',
    title: 'Festival VIP Transfer - İstanbul',
    category: 'Sanatçı Ulaşım',
    organizer: 'Live Nation TR',
    organizerImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
    location: 'İstanbul',
    date: '15-17 Temmuz 2026',
    budget: '75.000 - 120.000 ₺',
    isNew: true,
    isHot: false,
    timeAgo: '4 saat önce',
    matchScore: 95,
    serviceType: 'transport',
  },
  // ACCOMMODATION REQUESTS
  {
    id: '11',
    title: 'Kongre Konaklama - İstanbul',
    category: 'Grup Konaklama',
    organizer: 'TÜSİAD',
    organizerImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
    location: 'İstanbul',
    date: '22-24 Nisan 2026',
    budget: '450.000 - 650.000 ₺',
    isNew: true,
    isHot: false,
    timeAgo: '2 saat önce',
    matchScore: 93,
    serviceType: 'accommodation',
  },
  // SECURITY REQUESTS
  {
    id: '12',
    title: 'Stadyum Konseri Güvenlik - İstanbul',
    category: 'Etkinlik Güvenliği',
    organizer: 'Pasion Events',
    organizerImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
    location: 'Vodafone Park',
    date: '28 Ağustos 2026',
    budget: '320.000 - 450.000 ₺',
    isNew: true,
    isHot: true,
    timeAgo: '1 saat önce',
    matchScore: 97,
    serviceType: 'security',
  },
  // CATERING REQUESTS
  {
    id: '13',
    title: 'Gala Yemeği Catering - İstanbul',
    category: 'Premium Catering',
    organizer: 'Sabancı Holding',
    organizerImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
    location: 'Sakıp Sabancı Müzesi',
    date: '10 Nisan 2026',
    budget: '280.000 - 380.000 ₺',
    isNew: false,
    isHot: false,
    timeAgo: '5 saat önce',
    matchScore: 90,
    serviceType: 'catering',
  },
];

// User data - mockDataCore'dan
export const organizerUser = {
  name: coreOrganizers.ORG001.contactPerson,
  role: 'Organizatör',
  company: coreOrganizers.ORG001.name,
  image: coreOrganizers.ORG001.logo,
};

// Provider user data - will be populated from Firebase auth
export const providerUser = {
  name: coreProviders.PROV001?.name || 'Sağlayıcı',
  role: 'Sağlayıcı',
  subtitle: coreProviders.PROV001?.description || '',
  image: coreProviders.PROV001?.logo || '',
};

// Stats for organizer home
export const homeStats = [
  { label: 'Sanatçı', value: '350+' },
  { label: 'Mekan', value: '200+' },
  { label: 'Sağlayıcı', value: '750+' },
];

// Organizer dashboard data - mockData ile uyumlu
const organizerDashboardData = {
  // Summary stats
  activeEvents: 4,
  upcomingEvents: 8,
  pendingOffers: 6,
  pendingServices: 11,
  totalBudget: 4850000,
  totalSpent: 2180000,

  // Next upcoming event - Big Bang Summer Festival
  nextEvent: {
    id: '1',
    title: 'Sıla & Tarkan - İstanbul',
    date: '15-17 Temmuz 2026',
    daysUntil: 182, // Dinamik hesaplama getOrganizerDashboard() ile yapilir
    venue: 'KüçükÇiftlik Park',
    location: 'İstanbul',
    progress: 72,
    servicesConfirmed: 8,
    servicesTotal: 12,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
  },

  // Active events list - mockData'daki etkinlikler
  // Title format: "Sanatçı Adı - Şehir" veya "Etkinlik Adı - Şehir"
  activeEventsList: [
    {
      id: '1',
      title: 'Sıla & Tarkan - İstanbul',
      date: '15-17 Temmuz',
      status: 'planning',
      progress: 72,
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    },
    {
      id: '2',
      title: 'Tarkan - İstanbul',
      date: '28 Ağustos',
      status: 'planning',
      progress: 45,
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
    },
    {
      id: '3',
      title: 'İnovasyon Zirvesi - İstanbul',
      date: '22-23 Nisan',
      status: 'confirmed',
      progress: 88,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    },
    {
      id: '4',
      title: 'Zeynep & Emre - İstanbul',
      date: '12 Haziran',
      status: 'planning',
      progress: 58,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    },
    {
      id: '5',
      title: 'Garanti BBVA - İstanbul',
      date: '5 Eylül',
      status: 'confirmed',
      progress: 82,
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
    },
  ],

  // Pending actions - Bekleyen işlemler
  // offerId links to actual offers in offersData.ts
  pendingActions: [
    {
      id: 'pa1',
      type: 'offer',
      offerId: 'o1', // LightShow Pro offer
      title: 'LightShow Pro - Işık Sistemi',
      subtitle: 'Big Bang Summer Festival',
      amount: 138000,
      timeAgo: '2 saat önce',
      urgent: true,
    },
    {
      id: 'pa2',
      type: 'offer',
      offerId: 'o2', // Mega Sound Pro offer
      title: 'Mega Sound Pro - Ses Sistemi',
      subtitle: 'Vodafone Park Konseri - Sıla',
      amount: 245000,
      timeAgo: '1 gün önce',
      urgent: true,
    },
    {
      id: 'pa3',
      type: 'offer',
      offerId: 'o3', // Visual FX offer
      title: 'Visual FX Turkey - LED Ekran',
      subtitle: 'Big Bang Summer Festival',
      amount: 115000,
      timeAgo: '8 saat önce',
      urgent: false,
    },
    {
      id: 'pa4',
      type: 'service',
      serviceCategory: 'security',
      title: 'Güvenlik Hizmeti',
      subtitle: 'Tedarikçi seçimi bekliyor',
      amount: 180000,
      timeAgo: null,
      urgent: false,
    },
    {
      id: 'pa5',
      type: 'offer',
      offerId: 'o5', // Catering offer
      title: 'Gourmet Catering - VIP Yemek',
      subtitle: 'Garanti BBVA Gala',
      amount: 95000,
      timeAgo: '1 gün önce',
      urgent: false,
    },
  ],

  // Recent activity - Son aktiviteler
  recentActivity: [
    {
      id: 'ra1',
      type: 'offer_received',
      message: 'LightShow Pro yeni teklif gönderdi',
      time: '1 saat önce',
      icon: 'pricetag',
    },
    {
      id: 'ra2',
      type: 'counter_offer',
      message: 'Mega Sound Pro karşı teklif aldınız',
      time: '3 saat önce',
      icon: 'swap-horizontal',
    },
    {
      id: 'ra3',
      type: 'message',
      message: 'VIP Transfer Istanbul mesaj gönderdi',
      time: '4 saat önce',
      icon: 'chatbubble',
    },
    {
      id: 'ra4',
      type: 'contract_signed',
      message: 'SecureGuard Events sözleşmeyi onayladı',
      time: '6 saat önce',
      icon: 'checkmark-circle',
    },
    {
      id: 'ra5',
      type: 'payment',
      message: 'Mega Sound Pro ön ödemesi tamamlandı',
      time: 'Dün',
      icon: 'wallet',
    },
    {
      id: 'ra6',
      type: 'artist_confirmed',
      message: 'Tarkan sözleşmesi imzalandı',
      time: 'Dün',
      icon: 'musical-notes',
    },
    {
      id: 'ra7',
      type: 'venue_confirmed',
      message: 'KüçükÇiftlik Park rezervasyonu onaylandı',
      time: '2 gün önce',
      icon: 'business',
    },
  ],
};

/**
 * Dinamik daysUntil hesaplamasiyla organizerDashboard dondurur
 */
export const getOrganizerDashboard = () => {
  return {
    ...organizerDashboardData,
    nextEvent: {
      ...organizerDashboardData.nextEvent,
      daysUntil: calculateDaysUntil(organizerDashboardData.nextEvent.date),
    },
  };
};

// Backwards-compatible export (statik deger kullanir)
export const organizerDashboard = organizerDashboardData;

// Quick action buttons for organizer
export const organizerQuickActions = [
  {
    id: 'create',
    label: 'Etkinlik Oluştur',
    icon: 'add-circle',
    gradient: ['#4b30b8', '#7c3aed'] as const,
    route: 'CreateEvent',
  },
  {
    id: 'offers',
    label: 'Teklifler',
    icon: 'pricetags',
    gradient: ['#f59e0b', '#d97706'] as const,
    route: 'OffersTab',
    badge: 6,
  },
  {
    id: 'calendar',
    label: 'Takvim',
    icon: 'calendar',
    gradient: ['#3b82f6', '#2563eb'] as const,
    route: 'CalendarView',
  },
  {
    id: 'messages',
    label: 'Mesajlar',
    icon: 'chatbubbles',
    gradient: ['#10b981', '#059669'] as const,
    route: 'MessagesTab',
    badge: 4,
  },
];

// Provider quick actions
export const providerQuickActions = [
  {
    id: 'requests',
    label: 'Talepler',
    icon: 'documents',
    gradient: ['#f59e0b', '#d97706'] as const,
    route: 'RequestsScreen',
    badge: 5,
  },
  {
    id: 'offers',
    label: 'Tekliflerim',
    icon: 'pricetags',
    gradient: ['#4b30b8', '#7c3aed'] as const,
    route: 'MyOffersScreen',
    badge: 3,
  },
  {
    id: 'calendar',
    label: 'Takvim',
    icon: 'calendar',
    gradient: ['#3b82f6', '#2563eb'] as const,
    route: 'CalendarView',
  },
  {
    id: 'earnings',
    label: 'Kazançlar',
    icon: 'wallet',
    gradient: ['#10b981', '#059669'] as const,
    route: 'EarningsScreen',
  },
];

// Featured events for discover section
export const featuredEvents = [
  {
    id: 'fe1',
    title: 'Chill-Out Festival 2026',
    date: '20-22 Haziran 2026',
    location: 'Çeşme, İzmir',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    category: 'Festival',
    attendees: 15000,
  },
  {
    id: 'fe2',
    title: 'Jazz Days Istanbul',
    date: '5-8 Mayıs 2026',
    location: 'Nardis Jazz Club, İstanbul',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
    category: 'Konser',
    attendees: 2500,
  },
  {
    id: 'fe3',
    title: 'Cappadox 2026',
    date: '11-14 Haziran 2026',
    location: 'Kapadokya, Nevşehir',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    category: 'Festival',
    attendees: 8000,
  },
];

// Trending services
export const trendingServices = [
  {
    id: 'ts1',
    name: 'LED Wall Kiralama',
    category: 'Teknik',
    searchCount: 1247,
    trend: 'up',
    trendPercent: 34,
  },
  {
    id: 'ts2',
    name: 'VIP Transfer',
    category: 'Ulaşım',
    searchCount: 892,
    trend: 'up',
    trendPercent: 22,
  },
  {
    id: 'ts3',
    name: 'Etkinlik Güvenliği',
    category: 'Operasyon',
    searchCount: 756,
    trend: 'up',
    trendPercent: 18,
  },
  {
    id: 'ts4',
    name: 'Drone Show',
    category: 'Özel Efekt',
    searchCount: 634,
    trend: 'up',
    trendPercent: 45,
  },
];
