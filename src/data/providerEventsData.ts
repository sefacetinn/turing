import { gradients, ThemeColors } from '../theme/colors';
import {
  events as coreEvents,
  organizers as coreOrganizers,
  getVenue,
} from './mockDataCore';
import { calculateDaysUntil } from '../utils/calendarUtils';

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
// Updated for 2026 with realistic Turkish event industry examples
// eventId'ler mockDataCore events ile uyumlu (EVT001, EVT002, vb.)
export const providerEvents: ProviderEvent[] = [
  // TEKNİK - Ses Sistemi - Big Bang Summer Festival
  {
    id: 'EVT001', // mockDataCore event ID
    eventTitle: coreEvents.EVT001.title,
    eventDate: '10-12 Temmuz 2026',
    eventTime: '14:00 - 04:00',
    venue: 'KüçükÇiftlik Park',
    location: 'İstanbul, Maçka',
    organizerName: coreOrganizers.ORG001.name,
    organizerImage: coreOrganizers.ORG001.logo,
    eventImage: coreEvents.EVT001.image,
    serviceType: 'technical',
    serviceLabel: 'Ana Sahne Ses & Işık',
    status: 'active',
    earnings: 485000,
    paidAmount: 242500,
    paymentStatus: 'partial',
    daysUntil: 176,
    teamSize: 18,
    tasks: { total: 24, completed: 16 },
  },
  // SAHNE PRODÜKSIYON - Vodafone Park Konseri - Sıla
  {
    id: 'EVT002', // mockDataCore event ID
    eventTitle: coreEvents.EVT002.title,
    eventDate: '28 Ağustos 2026',
    eventTime: '20:00 - 00:00',
    venue: 'Vodafone Park',
    location: 'İstanbul, Beşiktaş',
    organizerName: coreOrganizers.ORG002.name,
    organizerImage: coreOrganizers.ORG002.logo,
    eventImage: coreEvents.EVT002.image,
    serviceType: 'technical',
    serviceLabel: 'Sahne Prodüksiyon',
    status: 'planned',
    earnings: 650000,
    paidAmount: 325000,
    paymentStatus: 'partial',
    daysUntil: 225,
    teamSize: 35,
    tasks: { total: 30, completed: 12 },
  },
  // TEKNİK - Işık Tasarımı - Fashion Week
  {
    id: 'EVT006', // mockDataCore event ID
    eventTitle: coreEvents.EVT006.title,
    eventDate: '12-16 Ekim 2026',
    eventTime: '10:00 - 23:00',
    venue: 'Zorlu PSM',
    location: 'İstanbul, Beşiktaş',
    organizerName: coreOrganizers.ORG005.name,
    organizerImage: coreOrganizers.ORG005.logo,
    eventImage: coreEvents.EVT006.image,
    serviceType: 'technical',
    serviceLabel: 'Işık Tasarımı & Kurulum',
    status: 'planned',
    earnings: 380000,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    daysUntil: 270,
    teamSize: 22,
    tasks: { total: 28, completed: 6 },
  },
  // GÜVENLİK - Zeytinli Rock Festivali
  {
    id: 'EVT004', // mockDataCore event ID
    eventTitle: coreEvents.EVT004.title,
    eventDate: '16-19 Temmuz 2026',
    eventTime: '14:00 - 04:00',
    venue: 'Zeytinli Açık Hava',
    location: 'Balıkesir, Edremit',
    organizerName: coreOrganizers.ORG001.name,
    organizerImage: coreOrganizers.ORG001.logo,
    eventImage: coreEvents.EVT004.image,
    serviceType: 'security',
    serviceLabel: 'Festival Güvenliği',
    status: 'active',
    earnings: 380000,
    paidAmount: 190000,
    paymentStatus: 'partial',
    daysUntil: 182,
    teamSize: 85,
    tasks: { total: 18, completed: 14 },
  },
  // CATERING - Kurumsal Gala
  {
    id: 'EVT008', // mockDataCore event ID
    eventTitle: coreEvents.EVT008.title,
    eventDate: '5 Eylül 2026',
    eventTime: '18:00 - 00:00',
    venue: 'Four Seasons Bosphorus',
    location: 'İstanbul, Beşiktaş',
    organizerName: coreOrganizers.ORG004.name,
    organizerImage: coreOrganizers.ORG004.logo,
    eventImage: coreEvents.EVT008.image,
    serviceType: 'catering',
    serviceLabel: 'Premium Catering (800 kişi)',
    status: 'planned',
    earnings: 325000,
    paidAmount: 162500,
    paymentStatus: 'partial',
    daysUntil: 233,
    teamSize: 45,
    tasks: { total: 20, completed: 8 },
  },
  // ULAŞIM - VIP Transfer - İnovasyon Zirvesi
  {
    id: 'EVT007', // mockDataCore event ID
    eventTitle: coreEvents.EVT007.title,
    eventDate: '22-23 Nisan 2026',
    eventTime: '08:00 - 20:00',
    venue: 'Lütfi Kırdar Kongre Merkezi',
    location: 'İstanbul, Şişli',
    organizerName: coreOrganizers.ORG004.name,
    organizerImage: coreOrganizers.ORG004.logo,
    eventImage: coreEvents.EVT007.image,
    serviceType: 'transport',
    serviceLabel: 'VIP Transfer & Shuttle',
    status: 'active',
    earnings: 185000,
    paidAmount: 185000,
    paymentStatus: 'paid',
    daysUntil: 97,
    teamSize: 25,
    tasks: { total: 15, completed: 12 },
  },
  // DEKORASYON - Düğün
  {
    id: 'pe7',
    eventTitle: 'Düğün - Zeynep & Emre',
    eventDate: '12 Haziran 2026',
    eventTime: '18:00 - 03:00',
    venue: 'Four Seasons Bosphorus',
    location: 'İstanbul, Beşiktaş',
    organizerName: coreOrganizers.ORG_PRIV_01.name,
    organizerImage: coreOrganizers.ORG_PRIV_01.logo,
    eventImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    serviceType: 'decoration',
    serviceLabel: 'Dekorasyon & Çiçek',
    status: 'planned',
    earnings: 185000,
    paidAmount: 92500,
    paymentStatus: 'partial',
    daysUntil: 148,
    teamSize: 18,
    tasks: { total: 22, completed: 8 },
  },
  // MEDYA & PRODÜKSIYON - Red Bull
  {
    id: 'pe8',
    eventTitle: 'Red Bull Music Academy Night',
    eventDate: '8 Mart 2026',
    eventTime: '21:00 - 05:00',
    venue: 'Babylon',
    location: 'İstanbul, Beyoğlu',
    organizerName: coreOrganizers.ORG006.name,
    organizerImage: coreOrganizers.ORG006.logo,
    eventImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
    serviceType: 'media',
    serviceLabel: 'Canlı Yayın & Prodüksiyon',
    status: 'active',
    earnings: 245000,
    paidAmount: 122500,
    paymentStatus: 'partial',
    daysUntil: 52,
    teamSize: 28,
    tasks: { total: 16, completed: 10 },
  },
  // JENERATÖR - Cappadox
  {
    id: 'pe9',
    eventTitle: 'Cappadox Festival 2026',
    eventDate: '11-14 Haziran 2026',
    eventTime: 'Tüm Gün',
    venue: 'Kapadokya Açık Hava',
    location: 'Nevşehir, Ürgüp',
    organizerName: coreOrganizers.ORG001.name,
    organizerImage: coreOrganizers.ORG001.logo,
    eventImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    serviceType: 'generator',
    serviceLabel: 'Jeneratör & Enerji Sistemi',
    status: 'planned',
    earnings: 145000,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    daysUntil: 147,
    teamSize: 12,
    tasks: { total: 12, completed: 3 },
  },
  // KONAKLAMA - Film Festivali
  {
    id: 'pe10',
    eventTitle: 'Antalya Altın Portakal Film Festivali',
    eventDate: '5-12 Ekim 2026',
    eventTime: 'Tüm Gün',
    venue: 'Regnum Carya',
    location: 'Antalya, Belek',
    organizerName: coreOrganizers.ORG007.name,
    organizerImage: coreOrganizers.ORG007.logo,
    eventImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    serviceType: 'accommodation',
    serviceLabel: 'VIP Konaklama Koordinasyonu',
    status: 'planned',
    earnings: 420000,
    paidAmount: 210000,
    paymentStatus: 'partial',
    daysUntil: 264,
    teamSize: 8,
    tasks: { total: 18, completed: 5 },
  },
  // BARİYER - Harbiye Açıkhava - Tarkan Konseri
  {
    id: 'EVT005', // mockDataCore event ID
    eventTitle: coreEvents.EVT005.title,
    eventDate: '15 Ağustos 2026',
    eventTime: '21:00 - 00:00',
    venue: 'Harbiye Cemil Topuzlu',
    location: 'İstanbul, Şişli',
    organizerName: coreOrganizers.ORG003.name,
    organizerImage: coreOrganizers.ORG003.logo,
    eventImage: coreEvents.EVT005.image,
    serviceType: 'barrier',
    serviceLabel: 'Sahne Bariyeri & Crowd Control',
    status: 'planned',
    earnings: 65000,
    paidAmount: 65000,
    paymentStatus: 'paid',
    daysUntil: 212,
    teamSize: 8,
    tasks: { total: 10, completed: 2 },
  },
  // MEDİKAL - Maraton
  {
    id: 'pe12',
    eventTitle: 'N Kolay İstanbul Maratonu 2026',
    eventDate: '1 Kasım 2026',
    eventTime: '06:00 - 14:00',
    venue: '15 Temmuz Şehitler Köprüsü',
    location: 'İstanbul',
    organizerName: coreOrganizers.ORG008.name,
    organizerImage: coreOrganizers.ORG008.logo,
    eventImage: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800',
    serviceType: 'medical',
    serviceLabel: 'Sağlık Ekibi & İlk Yardım',
    status: 'planned',
    earnings: 185000,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    daysUntil: 290,
    teamSize: 65,
    tasks: { total: 20, completed: 4 },
  },
  // BOOKING - DJ Performance (Geçmiş)
  {
    id: 'pe13',
    eventTitle: 'Suma Beach Opening Party 2025',
    eventDate: '15 Mayıs 2025',
    eventTime: '16:00 - 04:00',
    venue: 'Suma Beach',
    location: 'İstanbul, Kilyos',
    organizerName: coreOrganizers.ORG009.name,
    organizerImage: coreOrganizers.ORG009.logo,
    eventImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
    serviceType: 'booking',
    serviceLabel: 'DJ Mahmut Orhan Performance',
    status: 'past',
    earnings: 125000,
    paidAmount: 125000,
    paymentStatus: 'paid',
    daysUntil: 0,
    teamSize: 4,
    tasks: { total: 8, completed: 8 },
  },
  // TEKNİK (Geçmiş) - TRT Forum
  {
    id: 'pe14',
    eventTitle: 'TRT World Forum 2025',
    eventDate: '1-2 Aralık 2025',
    eventTime: '09:00 - 20:00',
    venue: 'Haliç Kongre Merkezi',
    location: 'İstanbul, Beyoğlu',
    organizerName: coreOrganizers.ORG010.name,
    organizerImage: coreOrganizers.ORG010.logo,
    eventImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
    serviceType: 'media',
    serviceLabel: 'Canlı Yayın & Prodüksiyon',
    status: 'past',
    earnings: 480000,
    paidAmount: 480000,
    paymentStatus: 'paid',
    daysUntil: 0,
    teamSize: 42,
    tasks: { total: 35, completed: 35 },
  },
  // CATERING (Geçmiş) - Yılbaşı Galası
  {
    id: 'pe15',
    eventTitle: 'Koç Holding Yılbaşı Galası 2025',
    eventDate: '28 Aralık 2025',
    eventTime: '19:00 - 02:00',
    venue: 'Çırağan Palace',
    location: 'İstanbul, Beşiktaş',
    organizerName: coreOrganizers.ORG011.name,
    organizerImage: coreOrganizers.ORG011.logo,
    eventImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    serviceType: 'catering',
    serviceLabel: 'Gala Yemeği (800 kişi)',
    status: 'past',
    earnings: 385000,
    paidAmount: 385000,
    paymentStatus: 'paid',
    daysUntil: 0,
    teamSize: 55,
    tasks: { total: 25, completed: 25 },
  },
  // F1 VIP - Yaklaşan
  {
    id: 'pe16',
    eventTitle: 'Formula 1 Turkish Grand Prix VIP',
    eventDate: '4-6 Eylül 2026',
    eventTime: '10:00 - 20:00',
    venue: 'Intercity Istanbul Park',
    location: 'İstanbul, Tuzla',
    organizerName: coreOrganizers.ORG012.name,
    organizerImage: coreOrganizers.ORG012.logo,
    eventImage: 'https://images.unsplash.com/photo-1504817343863-5092a923803e?w=800',
    serviceType: 'catering',
    serviceLabel: 'VIP Hospitality Catering',
    status: 'planned',
    earnings: 520000,
    paidAmount: 260000,
    paymentStatus: 'partial',
    daysUntil: 233,
    teamSize: 65,
    tasks: { total: 22, completed: 6 },
  },
  // BOOKING - Sıla Konseri
  {
    id: 'pe17',
    eventTitle: 'Harbiye Yaz Konserleri',
    eventDate: '20 Ağustos 2026',
    eventTime: '21:00 - 00:00',
    venue: 'Harbiye Cemil Topuzlu',
    location: 'İstanbul, Şişli',
    organizerName: coreOrganizers.ORG003.name,
    organizerImage: coreOrganizers.ORG003.logo,
    eventImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    serviceType: 'booking',
    serviceLabel: 'Sıla - Yaz Konseri',
    status: 'active',
    earnings: 480000,
    paidAmount: 240000,
    paymentStatus: 'partial',
    daysUntil: 216,
    teamSize: 6,
    tasks: { total: 10, completed: 7 },
  },
  // BOOKING - Tarkan Stadyum Konseri
  {
    id: 'pe18',
    eventTitle: 'Vodafone Park Yaz Konseri',
    eventDate: '15 Temmuz 2026',
    eventTime: '20:30 - 00:00',
    venue: 'Vodafone Park',
    location: 'İstanbul, Beşiktaş',
    organizerName: coreOrganizers.ORG002.name,
    organizerImage: coreOrganizers.ORG002.logo,
    eventImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    serviceType: 'booking',
    serviceLabel: 'Tarkan - Stadyum Konseri',
    status: 'planned',
    earnings: 950000,
    paidAmount: 475000,
    paymentStatus: 'partial',
    daysUntil: 180,
    teamSize: 12,
    tasks: { total: 14, completed: 5 },
  },
  // BOOKING - Festival Headliner
  {
    id: 'pe19',
    eventTitle: 'Zeytinli Rock Festivali',
    eventDate: '24-26 Temmuz 2026',
    eventTime: '22:00 - 01:00',
    venue: 'Zeytinli Açık Hava',
    location: 'Balıkesir, Edremit',
    organizerName: coreOrganizers.ORG001.name,
    organizerImage: coreOrganizers.ORG001.logo,
    eventImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
    serviceType: 'booking',
    serviceLabel: 'Duman - Festival Headliner',
    status: 'active',
    earnings: 420000,
    paidAmount: 210000,
    paymentStatus: 'partial',
    daysUntil: 189,
    teamSize: 6,
    tasks: { total: 10, completed: 7 },
  },
  // BOOKING - Kurumsal Yılbaşı Gecesi - Sıla
  {
    id: 'EVT003', // mockDataCore event ID - Kurumsal Yılbaşı Gecesi
    eventTitle: 'TÜSİAD Yılbaşı Galası',
    eventDate: '31 Aralık 2026',
    eventTime: '21:00 - 02:00',
    venue: 'Zorlu PSM',
    location: 'İstanbul, Beşiktaş',
    organizerName: coreOrganizers.ORG004.name,
    organizerImage: coreOrganizers.ORG004.logo,
    eventImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    serviceType: 'booking',
    serviceLabel: 'Sıla - Gala Performansı',
    status: 'planned',
    earnings: 550000,
    paidAmount: 275000,
    paymentStatus: 'partial',
    daysUntil: 349,
    teamSize: 5,
    tasks: { total: 8, completed: 2 },
  },
  // BOOKING - Düğün Performansı - Mabel Matiz
  {
    id: 'pe21',
    eventTitle: 'Kaya & Yılmaz Düğünü',
    eventDate: '28 Eylül 2026',
    eventTime: '22:00 - 23:30',
    venue: 'Çırağan Palace',
    location: 'İstanbul, Beşiktaş',
    organizerName: coreOrganizers.ORG_PRIV_02.name,
    organizerImage: coreOrganizers.ORG_PRIV_02.logo,
    eventImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    serviceType: 'booking',
    serviceLabel: 'Mabel Matiz - Düğün Performansı',
    status: 'planned',
    earnings: 280000,
    paidAmount: 140000,
    paymentStatus: 'partial',
    daysUntil: 255,
    teamSize: 4,
    tasks: { total: 6, completed: 2 },
  },
  // BOOKING - Geçmiş - Festival
  {
    id: 'pe22',
    eventTitle: 'Big Bang 2025 - Mor ve Ötesi',
    eventDate: '12 Temmuz 2025',
    eventTime: '23:00 - 01:30',
    venue: 'KüçükÇiftlik Park',
    location: 'İstanbul, Maçka',
    organizerName: coreOrganizers.ORG001.name,
    organizerImage: coreOrganizers.ORG001.logo,
    eventImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    serviceType: 'booking',
    serviceLabel: 'Mor ve Ötesi - Co-Headliner',
    status: 'past',
    earnings: 380000,
    paidAmount: 380000,
    paymentStatus: 'paid',
    daysUntil: 0,
    teamSize: 6,
    tasks: { total: 10, completed: 10 },
  },
  // BOOKING - Tarkan Ankara Konseri (HomeData ile eşleşen)
  {
    id: 'EVT010',
    eventTitle: 'Congresium Ankara Konseri',
    eventDate: '15 Nisan 2026',
    eventTime: '20:30 - 00:00',
    venue: 'Congresium',
    location: 'Ankara, Söğütözü',
    organizerName: coreOrganizers.ORG002.name,
    organizerImage: coreOrganizers.ORG002.logo,
    eventImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    serviceType: 'booking',
    serviceLabel: 'Tarkan - Ankara Konseri',
    status: 'active',
    earnings: 1200000,
    paidAmount: 600000,
    paymentStatus: 'partial',
    daysUntil: 88,
    teamSize: 12,
    tasks: { total: 14, completed: 10 },
  },
  // BOOKING - Duman İzmir Festivali (HomeData ile eşleşen)
  {
    id: 'EVT011',
    eventTitle: 'İzmir Kültürpark Festivali',
    eventDate: '8 Mayıs 2026',
    eventTime: '22:00 - 01:00',
    venue: 'Kültürpark Açıkhava',
    location: 'İzmir, Konak',
    organizerName: coreOrganizers.ORG013.name,
    organizerImage: coreOrganizers.ORG013.logo,
    eventImage: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800',
    serviceType: 'booking',
    serviceLabel: 'Duman - Festival Konseri',
    status: 'planned',
    earnings: 750000,
    paidAmount: 375000,
    paymentStatus: 'partial',
    daysUntil: 111,
    teamSize: 6,
    tasks: { total: 10, completed: 4 },
  },
  // BOOKING - Mabel Matiz Parkorman (HomeData ile eşleşen)
  {
    id: 'EVT012',
    eventTitle: 'Parkorman Yaz Konserleri',
    eventDate: '30 Mayıs 2026',
    eventTime: '21:00 - 00:00',
    venue: 'Parkorman',
    location: 'İstanbul, Maslak',
    organizerName: coreOrganizers.ORG001.name,
    organizerImage: coreOrganizers.ORG001.logo,
    eventImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    serviceType: 'booking',
    serviceLabel: 'Mabel Matiz - Yaz Konseri',
    status: 'active',
    earnings: 620000,
    paidAmount: 310000,
    paymentStatus: 'partial',
    daysUntil: 133,
    teamSize: 5,
    tasks: { total: 8, completed: 5 },
  },
  // BOOKING - Sertab Erener Bodrum (HomeData ile eşleşen)
  {
    id: 'EVT013',
    eventTitle: 'Bodrum Antik Tiyatro Konseri',
    eventDate: '18 Temmuz 2026',
    eventTime: '21:30 - 00:00',
    venue: 'Bodrum Antik Tiyatro',
    location: 'Muğla, Bodrum',
    organizerName: coreOrganizers.ORG014.name,
    organizerImage: coreOrganizers.ORG014.logo,
    eventImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    serviceType: 'booking',
    serviceLabel: 'Sertab Erener - Yaz Konseri',
    status: 'active',
    earnings: 680000,
    paidAmount: 340000,
    paymentStatus: 'partial',
    daysUntil: 183,
    teamSize: 6,
    tasks: { total: 10, completed: 6 },
  },
  // TRANSPORT - Sıla VIP Transfer (homeData ile eşleşen)
  {
    id: 'pe_tr_01',
    eventTitle: 'Sıla Harbiye Konseri VIP Transfer',
    eventDate: '22 Mart 2026',
    eventTime: '18:00 - 02:00',
    venue: 'İstanbul Havalimanı',
    location: 'İstanbul, Arnavutköy',
    organizerName: coreOrganizers.ORG003.name,
    organizerImage: coreOrganizers.ORG003.logo,
    eventImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    serviceType: 'transport',
    serviceLabel: 'Sanatçı VIP Transfer',
    status: 'active',
    earnings: 45000,
    paidAmount: 22500,
    paymentStatus: 'partial',
    daysUntil: 66,
    teamSize: 4,
    tasks: { total: 6, completed: 4 },
  },
  // TRANSPORT - Kongre Shuttle (homeData ile eşleşen)
  {
    id: 'pe_tr_02',
    eventTitle: 'TÜSİAD İnovasyon Zirvesi Transfer',
    eventDate: '10-12 Nisan 2026',
    eventTime: '06:00 - 22:00',
    venue: 'Esenboğa Havalimanı',
    location: 'Ankara, Çubuk',
    organizerName: coreOrganizers.ORG004.name,
    organizerImage: coreOrganizers.ORG004.logo,
    eventImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
    serviceType: 'transport',
    serviceLabel: 'Shuttle Servisi (25 araç)',
    status: 'planned',
    earnings: 125000,
    paidAmount: 62500,
    paymentStatus: 'partial',
    daysUntil: 85,
    teamSize: 30,
    tasks: { total: 12, completed: 5 },
  },
  // ACCOMMODATION - Festival VIP (homeData ile eşleşen)
  {
    id: 'pe_acc_01',
    eventTitle: 'Big Bang Festival VIP Konaklama',
    eventDate: '15-17 Temmuz 2026',
    eventTime: 'Tüm Gün',
    venue: 'Four Seasons Bosphorus',
    location: 'İstanbul, Beşiktaş',
    organizerName: coreOrganizers.ORG001.name,
    organizerImage: coreOrganizers.ORG001.logo,
    eventImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    serviceType: 'accommodation',
    serviceLabel: 'Sanatçı Konaklama Paketi',
    status: 'planned',
    earnings: 185000,
    paidAmount: 92500,
    paymentStatus: 'partial',
    daysUntil: 182,
    teamSize: 6,
    tasks: { total: 10, completed: 3 },
  },
  // SECURITY - Vodafone Park Konseri (homeData ile eşleşen)
  {
    id: 'pe_sec_01',
    eventTitle: 'Tarkan Vodafone Park Konseri Güvenlik',
    eventDate: '28 Ağustos 2026',
    eventTime: '16:00 - 02:00',
    venue: 'Vodafone Park',
    location: 'İstanbul, Beşiktaş',
    organizerName: coreOrganizers.ORG002.name,
    organizerImage: coreOrganizers.ORG002.logo,
    eventImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
    serviceType: 'security',
    serviceLabel: 'VIP & Genel Güvenlik (200 kişi)',
    status: 'planned',
    earnings: 280000,
    paidAmount: 140000,
    paymentStatus: 'partial',
    daysUntil: 226,
    teamSize: 200,
    tasks: { total: 15, completed: 5 },
  },
  // CATERING - Kongre Catering (homeData ile eşleşen)
  {
    id: 'pe_cat_01',
    eventTitle: 'TÜSİAD İnovasyon Zirvesi Catering',
    eventDate: '22-23 Nisan 2026',
    eventTime: '08:00 - 20:00',
    venue: 'Lütfi Kırdar Kongre Merkezi',
    location: 'İstanbul, Şişli',
    organizerName: coreOrganizers.ORG004.name,
    organizerImage: coreOrganizers.ORG004.logo,
    eventImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
    serviceType: 'catering',
    serviceLabel: 'Kongre Catering (3000 kişi)',
    status: 'active',
    earnings: 165000,
    paidAmount: 82500,
    paymentStatus: 'partial',
    daysUntil: 97,
    teamSize: 35,
    tasks: { total: 18, completed: 12 },
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
export const getStatusInfo = (status: string, themeColors: ThemeColors) => {
  switch (status) {
    case 'planned':
      return { label: 'Planlandı', color: themeColors.warning, icon: 'calendar' as const };
    case 'active':
      return { label: 'Aktif', color: themeColors.success, icon: 'play-circle' as const };
    case 'past':
      return { label: 'Tamamlandı', color: themeColors.textMuted, icon: 'checkmark-circle' as const };
    default:
      return { label: status, color: themeColors.textMuted, icon: 'help-circle' as const };
  }
};

// Get payment status info
export const getPaymentInfo = (status: string, themeColors: ThemeColors) => {
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

// Get events by status
export const getActiveEvents = () => providerEvents.filter(e => e.status === 'active' || e.status === 'planned');
export const getPastEvents = () => providerEvents.filter(e => e.status === 'past');

// Get upcoming events (sorted by daysUntil)
export const getUpcomingEvents = (limit?: number) => {
  const upcoming = providerEvents
    .filter(e => e.status === 'active' || e.status === 'planned')
    .sort((a, b) => a.daysUntil - b.daysUntil);
  return limit ? upcoming.slice(0, limit) : upcoming;
};

// Get event by ID
export const getEventById = (id: string) => providerEvents.find(e => e.id === id);

// Get events with dynamically calculated daysUntil
export const getProviderEventsWithDaysUntil = (): ProviderEvent[] => {
  return providerEvents.map(event => ({
    ...event,
    daysUntil: calculateDaysUntil(event.eventDate),
  }));
};

// Get upcoming events with dynamic daysUntil (sorted)
export const getUpcomingEventsWithDaysUntil = (limit?: number) => {
  const events = getProviderEventsWithDaysUntil()
    .filter(e => e.daysUntil >= 0) // Sadece gelecek etkinlikler
    .sort((a, b) => a.daysUntil - b.daysUntil);
  return limit ? events.slice(0, limit) : events;
};
