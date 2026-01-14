import { gradients } from '../theme/colors';

// Types
export type TabType = 'active' | 'past';

export type ServiceCategory =
  | 'booking'
  | 'technical'
  | 'venue'
  | 'accommodation'
  | 'transport'
  | 'flight'
  | 'security'
  | 'catering'
  | 'generator'
  | 'beverage'
  | 'medical'
  | 'sanitation'
  | 'media'
  | 'barrier'
  | 'tent'
  | 'ticketing'
  | 'decoration';

export interface ProviderEvent {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  location: string;
  organizerName: string;
  organizerImage: string;
  eventImage: string;
  serviceType: ServiceCategory;
  serviceLabel: string;
  status: 'planned' | 'active' | 'past';
  earnings: number;
  paidAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  daysUntil: number;
  teamSize: number;
  tasks: { total: number; completed: number };
}

// Mock provider events data - EventPro 360 (Full-Service Provider)
export const providerEvents: ProviderEvent[] = [
  // TEKNİK - Ses Sistemi
  {
    id: 'pe1',
    eventTitle: 'Zeytinli Rock Festivali 2025',
    eventDate: '18-20 Temmuz 2025',
    eventTime: '14:00 - 04:00',
    venue: 'Zeytinli Açık Hava',
    location: 'Balıkesir, Edremit',
    organizerName: 'Pozitif Live',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    eventImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    serviceType: 'technical',
    serviceLabel: 'Ses Sistemi',
    status: 'active',
    earnings: 245000,
    paidAmount: 122500,
    paymentStatus: 'partial',
    daysUntil: 8,
    teamSize: 12,
    tasks: { total: 18, completed: 14 },
  },
  // GÜVENLİK
  {
    id: 'pe2',
    eventTitle: 'MegaFon Arena Konseri - Tarkan',
    eventDate: '25 Temmuz 2025',
    eventTime: '20:00 - 00:00',
    venue: 'Volkswagen Arena',
    location: 'İstanbul, Maslak',
    organizerName: 'BKM Organizasyon',
    organizerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    eventImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    serviceType: 'security',
    serviceLabel: 'Etkinlik Güvenliği',
    status: 'active',
    earnings: 185000,
    paidAmount: 185000,
    paymentStatus: 'paid',
    daysUntil: 15,
    teamSize: 45,
    tasks: { total: 12, completed: 10 },
  },
  // CATERING
  {
    id: 'pe3',
    eventTitle: 'Koç Holding Yıllık Toplantısı',
    eventDate: '5 Ağustos 2025',
    eventTime: '09:00 - 18:00',
    venue: 'Raffles Istanbul',
    location: 'İstanbul, Zorlu Center',
    organizerName: 'Koç Holding A.Ş.',
    organizerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    eventImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    serviceType: 'catering',
    serviceLabel: 'Premium Catering',
    status: 'planned',
    earnings: 320000,
    paidAmount: 160000,
    paymentStatus: 'partial',
    daysUntil: 25,
    teamSize: 28,
    tasks: { total: 15, completed: 8 },
  },
  // ULAŞIM - VIP Transfer
  {
    id: 'pe4',
    eventTitle: 'F1 Turkish Grand Prix VIP',
    eventDate: '14-16 Ağustos 2025',
    eventTime: '08:00 - 22:00',
    venue: 'Intercity Istanbul Park',
    location: 'İstanbul, Tuzla',
    organizerName: 'Intercity',
    organizerImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
    eventImage: 'https://images.unsplash.com/photo-1504817343863-5092a923803e?w=800',
    serviceType: 'transport',
    serviceLabel: 'VIP Transfer',
    status: 'planned',
    earnings: 175000,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    daysUntil: 35,
    teamSize: 18,
    tasks: { total: 10, completed: 3 },
  },
  // TEKNİK - Işık Sistemi
  {
    id: 'pe5',
    eventTitle: 'Mercedes-Benz Fashion Week',
    eventDate: '10-14 Eylül 2025',
    eventTime: '10:00 - 23:00',
    venue: 'Zorlu PSM',
    location: 'İstanbul, Beşiktaş',
    organizerName: 'IMG Turkey',
    organizerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    eventImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    serviceType: 'technical',
    serviceLabel: 'Işık Tasarımı',
    status: 'planned',
    earnings: 285000,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    daysUntil: 62,
    teamSize: 15,
    tasks: { total: 20, completed: 5 },
  },
  // DEKORASYON
  {
    id: 'pe6',
    eventTitle: 'Düğün - Elif & Kerem',
    eventDate: '21 Eylül 2025',
    eventTime: '18:00 - 03:00',
    venue: 'Esma Sultan Yalısı',
    location: 'İstanbul, Ortaköy',
    organizerName: 'Elif Demir',
    organizerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    eventImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    serviceType: 'decoration',
    serviceLabel: 'Dekorasyon & Çiçek',
    status: 'planned',
    earnings: 215000,
    paidAmount: 107500,
    paymentStatus: 'partial',
    daysUntil: 72,
    teamSize: 14,
    tasks: { total: 16, completed: 4 },
  },
  // JENERATÖR
  {
    id: 'pe7',
    eventTitle: 'Cappadox Festival 2025',
    eventDate: '5-8 Haziran 2025',
    eventTime: '00:00 - 23:59',
    venue: 'Kapadokya Açık Hava',
    location: 'Nevşehir, Ürgüp',
    organizerName: 'Pozitif Live',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    eventImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    serviceType: 'generator',
    serviceLabel: 'Jeneratör & Enerji',
    status: 'past',
    earnings: 95000,
    paidAmount: 95000,
    paymentStatus: 'paid',
    daysUntil: 0,
    teamSize: 8,
    tasks: { total: 10, completed: 10 },
  },
  // MEDYA & PRODÜKSIYON
  {
    id: 'pe8',
    eventTitle: 'TRT World Forum 2025',
    eventDate: '1-2 Haziran 2025',
    eventTime: '09:00 - 20:00',
    venue: 'Haliç Kongre Merkezi',
    location: 'İstanbul, Beyoğlu',
    organizerName: 'TRT',
    organizerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    eventImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
    serviceType: 'media',
    serviceLabel: 'Canlı Yayın & Prodüksiyon',
    status: 'past',
    earnings: 380000,
    paidAmount: 380000,
    paymentStatus: 'paid',
    daysUntil: 0,
    teamSize: 35,
    tasks: { total: 25, completed: 25 },
  },
  // KONAKLAMA
  {
    id: 'pe9',
    eventTitle: 'Antalya Film Festivali',
    eventDate: '5-12 Ekim 2025',
    eventTime: 'Tüm Gün',
    venue: 'Regnum Carya',
    location: 'Antalya, Belek',
    organizerName: 'Kültür Bakanlığı',
    organizerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    eventImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    serviceType: 'accommodation',
    serviceLabel: 'VIP Konaklama',
    status: 'planned',
    earnings: 420000,
    paidAmount: 210000,
    paymentStatus: 'partial',
    daysUntil: 95,
    teamSize: 5,
    tasks: { total: 12, completed: 3 },
  },
  // BARİYER & SAHNE BARİYERİ
  {
    id: 'pe10',
    eventTitle: 'Harbiye Açıkhava - Sıla',
    eventDate: '28 Ağustos 2025',
    eventTime: '21:00 - 00:00',
    venue: 'Harbiye Cemil Topuzlu',
    location: 'İstanbul, Şişli',
    organizerName: 'Pasion Türk',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    eventImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    serviceType: 'barrier',
    serviceLabel: 'Sahne Bariyeri',
    status: 'planned',
    earnings: 45000,
    paidAmount: 45000,
    paymentStatus: 'paid',
    daysUntil: 48,
    teamSize: 6,
    tasks: { total: 8, completed: 8 },
  },
  // MEDİKAL
  {
    id: 'pe11',
    eventTitle: 'İstanbul Maratonu 2025',
    eventDate: '2 Kasım 2025',
    eventTime: '06:00 - 14:00',
    venue: '15 Temmuz Şehitler Köprüsü',
    location: 'İstanbul',
    organizerName: 'Spor İstanbul',
    organizerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    eventImage: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800',
    serviceType: 'medical',
    serviceLabel: 'Sağlık Ekibi',
    status: 'planned',
    earnings: 125000,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    daysUntil: 112,
    teamSize: 40,
    tasks: { total: 15, completed: 2 },
  },
  // BOOKING - DJ
  {
    id: 'pe12',
    eventTitle: 'Suma Beach Opening Party',
    eventDate: '15 Mayıs 2025',
    eventTime: '16:00 - 04:00',
    venue: 'Suma Beach',
    location: 'İstanbul, Kilyos',
    organizerName: 'Suma Beach',
    organizerImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
    eventImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
    serviceType: 'booking',
    serviceLabel: 'DJ Performance',
    status: 'past',
    earnings: 75000,
    paidAmount: 75000,
    paymentStatus: 'paid',
    daysUntil: 0,
    teamSize: 2,
    tasks: { total: 6, completed: 6 },
  },
];

// Get service type info (gradient and icon)
export const getServiceTypeInfo = (serviceType: ServiceCategory) => {
  const serviceMap: Record<ServiceCategory, { gradient: readonly [string, string]; icon: string }> = {
    booking: { gradient: gradients.booking, icon: 'musical-notes' },
    technical: { gradient: gradients.technical, icon: 'volume-high' },
    venue: { gradient: gradients.venue, icon: 'business' },
    accommodation: { gradient: gradients.accommodation, icon: 'bed' },
    transport: { gradient: gradients.transport, icon: 'car' },
    flight: { gradient: gradients.flight, icon: 'airplane' },
    security: { gradient: ['#ef4444', '#dc2626'] as const, icon: 'shield' },
    catering: { gradient: ['#f97316', '#ea580c'] as const, icon: 'restaurant' },
    generator: { gradient: ['#eab308', '#ca8a04'] as const, icon: 'flash' },
    beverage: { gradient: ['#84cc16', '#65a30d'] as const, icon: 'cafe' },
    medical: { gradient: ['#ef4444', '#b91c1c'] as const, icon: 'medkit' },
    sanitation: { gradient: ['#6b7280', '#4b5563'] as const, icon: 'trash' },
    media: { gradient: ['#8b5cf6', '#7c3aed'] as const, icon: 'camera' },
    barrier: { gradient: ['#64748b', '#475569'] as const, icon: 'remove' },
    tent: { gradient: ['#14b8a6', '#0d9488'] as const, icon: 'home' },
    ticketing: { gradient: ['#f43f5e', '#e11d48'] as const, icon: 'ticket' },
    decoration: { gradient: ['#ec4899', '#db2777'] as const, icon: 'color-palette' },
  };
  return serviceMap[serviceType] || { gradient: gradients.primary, icon: 'help-circle' };
};

// Get status info
export const getStatusInfo = (status: string, themeColors: any) => {
  switch (status) {
    case 'planned':
      return { label: 'Planlandı', color: themeColors.warning, icon: 'calendar' as const };
    case 'active':
      return { label: 'Aktif', color: themeColors.success, icon: 'play-circle' as const };
    case 'past':
      return { label: 'Geçmiş', color: themeColors.textMuted, icon: 'checkmark-circle' as const };
    default:
      return { label: status, color: themeColors.textMuted, icon: 'help-circle' as const };
  }
};

// Get payment status info
export const getPaymentInfo = (status: string, themeColors: any) => {
  switch (status) {
    case 'paid':
      return { label: 'Ödendi', color: themeColors.success };
    case 'partial':
      return { label: 'Kısmi Ödeme', color: themeColors.warning };
    case 'unpaid':
      return { label: 'Ödenmedi', color: themeColors.textMuted };
    default:
      return { label: status, color: themeColors.textMuted };
  }
};

// Calculate stats from events
export const calculateStats = (events: ProviderEvent[]) => {
  const totalEarnings = events.reduce((sum, e) => sum + e.earnings, 0);
  const paidEarnings = events.reduce((sum, e) => sum + e.paidAmount, 0);
  const pendingEarnings = totalEarnings - paidEarnings;
  const activeCount = events.filter(e => ['active', 'planned'].includes(e.status)).length;
  const pastCount = events.filter(e => e.status === 'past').length;
  return {
    totalEarnings,
    paidEarnings,
    pendingEarnings,
    activeCount,
    pastCount,
    totalEvents: events.length,
  };
};
