// =============================================================================
// MERKEZI MOCK DATA - Tüm örnek veriler için tek kaynak
// =============================================================================
// Bu dosya tüm mock data dosyaları için tutarlı referans sağlar
// ID'ler ve ilişkiler burada tanımlanır, diğer dosyalar bu veriyi kullanır

// =============================================================================
// ORGANIZATÖRLER
// =============================================================================
export const organizers = {
  ORG001: {
    id: 'ORG001',
    name: 'Pozitif Live',
    contactPerson: 'Ahmet Yılmaz',
    email: 'ahmet@pozitif.com',
    phone: '+90 532 111 2222',
    logo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    description: "Türkiye'nin lider etkinlik organizatörü",
    location: 'İstanbul',
  },
  ORG002: {
    id: 'ORG002',
    name: 'BKM Organizasyon',
    contactPerson: 'Mehmet Demir',
    email: 'info@bkm.com.tr',
    phone: '+90 533 222 3333',
    logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    description: 'Profesyonel konser ve etkinlik organizasyonu',
    location: 'İstanbul',
  },
  ORG003: {
    id: 'ORG003',
    name: 'Pasion Türk',
    contactPerson: 'Leyla Şahin',
    email: 'info@pasion.com.tr',
    phone: '+90 534 333 4444',
    logo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    description: 'Açıkhava konserleri uzmanı',
    location: 'İstanbul',
  },
  ORG004: {
    id: 'ORG004',
    name: 'TÜSİAD Events',
    contactPerson: 'Burak Öztürk',
    email: 'events@tusiad.org',
    phone: '+90 535 444 5555',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200',
    description: 'Kurumsal etkinlikler ve zirveler',
    location: 'İstanbul',
  },
  ORG005: {
    id: 'ORG005',
    name: 'IMG Turkey',
    contactPerson: 'Selin Kaya',
    email: 'selin@img.com.tr',
    phone: '+90 536 555 6666',
    logo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    description: 'Moda ve entertainment etkinlikleri',
    location: 'İstanbul',
  },
};

// =============================================================================
// PROVIDER FIRMALAR (Hizmet Sağlayıcılar)
// =============================================================================
export const providers = {
  // TEKNİK
  PROV001: {
    id: 'PROV001',
    name: 'Mega Sound Pro',
    serviceTypes: ['technical', 'sound'],
    contactPerson: 'Ali Vural',
    email: 'info@megasound.com.tr',
    phone: '+90 537 666 7777',
    logo: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
    rating: 4.9,
    description: 'Profesyonel ses sistemleri',
    location: 'İstanbul',
  },
  PROV002: {
    id: 'PROV002',
    name: 'LightShow Pro',
    serviceTypes: ['technical', 'lighting'],
    contactPerson: 'Can Yıldız',
    email: 'info@lightshow.com.tr',
    phone: '+90 538 777 8888',
    logo: 'https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=200',
    rating: 4.8,
    description: 'Profesyonel ışık ve görsel sistemler',
    location: 'İstanbul',
  },
  // BOOKING
  PROV003: {
    id: 'PROV003',
    name: 'Star Booking',
    serviceTypes: ['booking'],
    contactPerson: 'Deniz Akman',
    email: 'info@starbooking.com',
    phone: '+90 539 888 9999',
    logo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
    rating: 4.9,
    description: 'Sanatçı booking ve menajerlik',
    location: 'İstanbul',
  },
  // CATERING
  PROV004: {
    id: 'PROV004',
    name: 'Gourmet Events Catering',
    serviceTypes: ['catering'],
    contactPerson: 'Ayşe Şen',
    email: 'info@gourmetevents.com.tr',
    phone: '+90 540 999 0000',
    logo: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200',
    rating: 4.9,
    description: 'Premium etkinlik catering hizmetleri',
    location: 'İstanbul',
  },
  // GÜVENLİK
  PROV005: {
    id: 'PROV005',
    name: 'SecurePro Events',
    serviceTypes: ['security'],
    contactPerson: 'Murat Kılıç',
    email: 'info@securepro.com.tr',
    phone: '+90 541 000 1111',
    logo: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200',
    rating: 4.9,
    description: 'Etkinlik güvenlik hizmetleri',
    location: 'İstanbul',
  },
  // ULAŞIM
  PROV006: {
    id: 'PROV006',
    name: 'VIP Transfer Istanbul',
    serviceTypes: ['transport'],
    contactPerson: 'Hakan Demir',
    email: 'info@viptransfer.com.tr',
    phone: '+90 542 111 2222',
    logo: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200',
    rating: 4.9,
    description: 'VIP transfer ve shuttle hizmetleri',
    location: 'İstanbul',
  },
  // KONAKLAMA
  PROV007: {
    id: 'PROV007',
    name: 'Swissôtel The Bosphorus',
    serviceTypes: ['accommodation'],
    contactPerson: 'Zeynep Arslan',
    email: 'events@swissotel.com',
    phone: '+90 543 222 3333',
    logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
    rating: 4.8,
    description: '5 yıldızlı otel ve konaklama',
    location: 'İstanbul',
  },
};

// =============================================================================
// SANATÇILAR
// =============================================================================
export const artists = {
  ART001: {
    id: 'ART001',
    name: 'Sıla',
    genre: 'Pop / R&B',
    agency: 'Star Booking',
    priceMin: 500000,
    priceMax: 800000,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    rating: 4.9,
  },
  ART002: {
    id: 'ART002',
    name: 'Tarkan',
    genre: 'Pop',
    agency: 'Tarkan Entertainment',
    priceMin: 800000,
    priceMax: 1500000,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    rating: 5.0,
  },
  ART003: {
    id: 'ART003',
    name: 'Duman',
    genre: 'Rock',
    agency: 'Pozitif Booking',
    priceMin: 400000,
    priceMax: 700000,
    image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400',
    rating: 4.9,
  },
  ART004: {
    id: 'ART004',
    name: 'Mabel Matiz',
    genre: 'Alternatif Pop',
    agency: 'Star Booking',
    priceMin: 300000,
    priceMax: 500000,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    rating: 4.8,
  },
  ART005: {
    id: 'ART005',
    name: 'Mor ve Ötesi',
    genre: 'Rock',
    agency: 'Pozitif Booking',
    priceMin: 350000,
    priceMax: 600000,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    rating: 4.9,
  },
  ART006: {
    id: 'ART006',
    name: 'Sertab Erener',
    genre: 'Pop',
    agency: 'Star Booking',
    priceMin: 400000,
    priceMax: 650000,
    image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400',
    rating: 4.8,
  },
};

// =============================================================================
// MEKANLAR
// =============================================================================
export const venues = {
  VEN001: {
    id: 'VEN001',
    name: 'Harbiye Açıkhava',
    city: 'İstanbul',
    district: 'Şişli',
    capacity: 4500,
    type: 'acik-hava',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
  },
  VEN002: {
    id: 'VEN002',
    name: 'Vodafone Park',
    city: 'İstanbul',
    district: 'Beşiktaş',
    capacity: 42000,
    type: 'stadyum',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
  },
  VEN003: {
    id: 'VEN003',
    name: 'Zorlu PSM',
    city: 'İstanbul',
    district: 'Beşiktaş',
    capacity: 2500,
    type: 'kapali-salon',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  },
  VEN004: {
    id: 'VEN004',
    name: 'KüçükÇiftlik Park',
    city: 'İstanbul',
    district: 'Maçka',
    capacity: 15000,
    type: 'acik-hava',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
  },
  VEN005: {
    id: 'VEN005',
    name: 'Zeytinli Açık Hava',
    city: 'Balıkesir',
    district: 'Edremit',
    capacity: 35000,
    type: 'acik-hava',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
  },
  VEN006: {
    id: 'VEN006',
    name: 'Four Seasons Bosphorus',
    city: 'İstanbul',
    district: 'Beşiktaş',
    capacity: 800,
    type: 'otel',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  },
  VEN007: {
    id: 'VEN007',
    name: 'Lütfi Kırdar Kongre Merkezi',
    city: 'İstanbul',
    district: 'Şişli',
    capacity: 3000,
    type: 'kongre-merkezi',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
  },
};

// =============================================================================
// ETKİNLİKLER
// =============================================================================
export type EventStatus = 'teklif-asamasinda' | 'planli' | 'aktif' | 'tamamlandi' | 'iptal';
export type EventType = 'festival' | 'konser' | 'kurumsal' | 'dugun' | 'lansman' | 'konferans';

export const events = {
  EVT001: {
    id: 'EVT001',
    title: 'Big Bang Summer Festival 2026',
    type: 'festival' as EventType,
    startDate: '2026-07-10',
    endDate: '2026-07-12',
    venueId: 'VEN004',
    organizerId: 'ORG001',
    artistIds: ['ART001', 'ART002', 'ART003'],
    status: 'aktif' as EventStatus,
    expectedAttendees: 25000,
    budget: 5000000,
    description: '3 günlük yaz festivali',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
  },
  EVT002: {
    id: 'EVT002',
    title: 'Vodafone Park Konseri - Sıla',
    type: 'konser' as EventType,
    startDate: '2026-08-28',
    endDate: '2026-08-28',
    venueId: 'VEN002',
    organizerId: 'ORG002',
    artistIds: ['ART001'],
    status: 'planli' as EventStatus,
    expectedAttendees: 40000,
    budget: 3000000,
    description: 'Sıla stadyum konseri',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
  },
  EVT003: {
    id: 'EVT003',
    title: 'Kurumsal Yılbaşı Gecesi',
    type: 'kurumsal' as EventType,
    startDate: '2026-12-31',
    endDate: '2026-12-31',
    venueId: 'VEN003',
    organizerId: 'ORG004',
    artistIds: ['ART001'],
    status: 'teklif-asamasinda' as EventStatus,
    expectedAttendees: 1500,
    budget: 800000,
    description: 'Kurumsal yılbaşı gecesi',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  },
  EVT004: {
    id: 'EVT004',
    title: 'Zeytinli Rock Festivali 2026',
    type: 'festival' as EventType,
    startDate: '2026-07-16',
    endDate: '2026-07-19',
    venueId: 'VEN005',
    organizerId: 'ORG001',
    artistIds: ['ART003', 'ART004', 'ART005'],
    status: 'aktif' as EventStatus,
    expectedAttendees: 35000,
    budget: 4500000,
    description: '4 günlük rock festivali',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
  },
  EVT005: {
    id: 'EVT005',
    title: 'Harbiye Açıkhava - Tarkan',
    type: 'konser' as EventType,
    startDate: '2026-08-15',
    endDate: '2026-08-15',
    venueId: 'VEN001',
    organizerId: 'ORG003',
    artistIds: ['ART002'],
    status: 'planli' as EventStatus,
    expectedAttendees: 4500,
    budget: 1200000,
    description: 'Tarkan yaz konseri',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
  },
  EVT006: {
    id: 'EVT006',
    title: 'Mercedes-Benz Fashion Week Istanbul',
    type: 'lansman' as EventType,
    startDate: '2026-10-12',
    endDate: '2026-10-16',
    venueId: 'VEN003',
    organizerId: 'ORG005',
    artistIds: [],
    status: 'planli' as EventStatus,
    expectedAttendees: 5000,
    budget: 2500000,
    description: 'Moda haftası etkinlikleri',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  },
  EVT007: {
    id: 'EVT007',
    title: 'Türkiye İnovasyon Zirvesi 2026',
    type: 'konferans' as EventType,
    startDate: '2026-04-22',
    endDate: '2026-04-23',
    venueId: 'VEN007',
    organizerId: 'ORG004',
    artistIds: [],
    status: 'aktif' as EventStatus,
    expectedAttendees: 3000,
    budget: 1800000,
    description: 'Teknoloji ve inovasyon zirvesi',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
  },
  EVT008: {
    id: 'EVT008',
    title: 'Garanti BBVA Kurumsal Gala',
    type: 'kurumsal' as EventType,
    startDate: '2026-09-05',
    endDate: '2026-09-05',
    venueId: 'VEN006',
    organizerId: 'ORG004',
    artistIds: ['ART006'],
    status: 'planli' as EventStatus,
    expectedAttendees: 800,
    budget: 950000,
    description: 'Yıllık kurumsal gala',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  },
};

// =============================================================================
// HİZMET GEREKSİNİMLERİ
// =============================================================================
export type RequirementStatus = 'teklif-bekliyor' | 'teklif-alindi' | 'onaylandi' | 'reddedildi';

export const requirements = {
  REQ001: {
    id: 'REQ001',
    eventId: 'EVT001',
    serviceType: 'technical',
    description: 'Ana sahne ses ve ışık sistemi',
    budgetMin: 400000,
    budgetMax: 500000,
    status: 'teklif-alindi' as RequirementStatus,
  },
  REQ002: {
    id: 'REQ002',
    eventId: 'EVT001',
    serviceType: 'catering',
    description: 'VIP ve backstage catering',
    budgetMin: 200000,
    budgetMax: 300000,
    status: 'teklif-bekliyor' as RequirementStatus,
  },
  REQ003: {
    id: 'REQ003',
    eventId: 'EVT001',
    serviceType: 'security',
    description: 'Festival güvenliği',
    budgetMin: 350000,
    budgetMax: 450000,
    status: 'onaylandi' as RequirementStatus,
  },
  REQ004: {
    id: 'REQ004',
    eventId: 'EVT002',
    serviceType: 'technical',
    description: 'Stadyum ses sistemi',
    budgetMin: 200000,
    budgetMax: 280000,
    status: 'teklif-alindi' as RequirementStatus,
  },
  REQ005: {
    id: 'REQ005',
    eventId: 'EVT002',
    serviceType: 'booking',
    description: 'Sıla performansı',
    budgetMin: 500000,
    budgetMax: 800000,
    status: 'onaylandi' as RequirementStatus,
  },
  REQ006: {
    id: 'REQ006',
    eventId: 'EVT004',
    serviceType: 'security',
    description: 'Festival güvenliği (4 gün)',
    budgetMin: 380000,
    budgetMax: 450000,
    status: 'teklif-alindi' as RequirementStatus,
  },
  REQ007: {
    id: 'REQ007',
    eventId: 'EVT007',
    serviceType: 'transport',
    description: 'VIP transfer ve shuttle',
    budgetMin: 150000,
    budgetMax: 200000,
    status: 'onaylandi' as RequirementStatus,
  },
  REQ008: {
    id: 'REQ008',
    eventId: 'EVT008',
    serviceType: 'catering',
    description: 'Gala yemeği (800 kişi)',
    budgetMin: 250000,
    budgetMax: 350000,
    status: 'teklif-alindi' as RequirementStatus,
  },
};

// =============================================================================
// TEKLİFLER
// =============================================================================
export type OfferStatus = 'beklemede' | 'pazarlik' | 'onaylandi' | 'reddedildi';

export const offers = {
  OFR001: {
    id: 'OFR001',
    requirementId: 'REQ001',
    providerId: 'PROV001',
    amount: 450000,
    status: 'beklemede' as OfferStatus,
    offerDate: '2026-01-10',
    validityDays: 7,
    notes: 'Line array sistem dahil',
  },
  OFR002: {
    id: 'OFR002',
    requirementId: 'REQ001',
    providerId: 'PROV002',
    amount: 480000,
    status: 'reddedildi' as OfferStatus,
    offerDate: '2026-01-09',
    validityDays: 7,
    notes: '',
  },
  OFR003: {
    id: 'OFR003',
    requirementId: 'REQ003',
    providerId: 'PROV005',
    amount: 380000,
    status: 'onaylandi' as OfferStatus,
    offerDate: '2026-01-05',
    validityDays: 14,
    notes: '200 personel',
  },
  OFR004: {
    id: 'OFR004',
    requirementId: 'REQ004',
    providerId: 'PROV001',
    amount: 245000,
    status: 'pazarlik' as OfferStatus,
    offerDate: '2026-01-12',
    validityDays: 7,
    notes: '',
  },
  OFR005: {
    id: 'OFR005',
    requirementId: 'REQ005',
    providerId: 'PROV003',
    amount: 650000,
    status: 'onaylandi' as OfferStatus,
    offerDate: '2026-01-01',
    validityDays: 30,
    notes: 'Sıla booking',
  },
  OFR006: {
    id: 'OFR006',
    requirementId: 'REQ007',
    providerId: 'PROV006',
    amount: 185000,
    status: 'onaylandi' as OfferStatus,
    offerDate: '2026-01-08',
    validityDays: 14,
    notes: '25 araçlık filo',
  },
  OFR007: {
    id: 'OFR007',
    requirementId: 'REQ008',
    providerId: 'PROV004',
    amount: 325000,
    status: 'beklemede' as OfferStatus,
    offerDate: '2026-01-14',
    validityDays: 7,
    notes: 'Fine dining menü',
  },
};

// =============================================================================
// SÖZLEŞMELER
// =============================================================================
export type ContractStatus = 'taslak' | 'imza-bekliyor' | 'aktif' | 'tamamlandi' | 'iptal';

export const contracts = {
  CON001: {
    id: 'CON001',
    offerId: 'OFR003',
    eventId: 'EVT001',
    providerId: 'PROV005',
    organizerId: 'ORG001',
    totalAmount: 380000,
    paidAmount: 190000,
    remainingAmount: 190000,
    status: 'aktif' as ContractStatus,
    signedDate: '2026-01-06',
  },
  CON002: {
    id: 'CON002',
    offerId: 'OFR005',
    eventId: 'EVT002',
    providerId: 'PROV003',
    organizerId: 'ORG002',
    totalAmount: 650000,
    paidAmount: 325000,
    remainingAmount: 325000,
    status: 'aktif' as ContractStatus,
    signedDate: '2026-01-02',
  },
  CON003: {
    id: 'CON003',
    offerId: 'OFR006',
    eventId: 'EVT007',
    providerId: 'PROV006',
    organizerId: 'ORG004',
    totalAmount: 185000,
    paidAmount: 185000,
    remainingAmount: 0,
    status: 'aktif' as ContractStatus,
    signedDate: '2026-01-10',
  },
};

// =============================================================================
// MESAJLAR/CHATLER
// =============================================================================
export const chats = {
  CHAT001: {
    id: 'CHAT001',
    eventId: 'EVT001',
    party1Id: 'ORG001',
    party1Type: 'organizator',
    party2Id: 'PROV001',
    party2Type: 'provider',
    lastMessage: 'Teknik detayları konuşalım mı?',
    unreadCount: 2,
  },
  CHAT002: {
    id: 'CHAT002',
    eventId: 'EVT001',
    party1Id: 'ORG001',
    party1Type: 'organizator',
    party2Id: 'PROV005',
    party2Type: 'provider',
    lastMessage: 'Güvenlik planı hazır',
    unreadCount: 0,
  },
  CHAT003: {
    id: 'CHAT003',
    eventId: 'EVT002',
    party1Id: 'ORG002',
    party1Type: 'organizator',
    party2Id: 'PROV001',
    party2Type: 'provider',
    lastMessage: 'Ses kontrolü ne zaman?',
    unreadCount: 1,
  },
  CHAT004: {
    id: 'CHAT004',
    eventId: 'EVT002',
    party1Id: 'ORG002',
    party1Type: 'organizator',
    party2Id: 'PROV003',
    party2Type: 'provider',
    lastMessage: "Sıla rider'ı eklendi",
    unreadCount: 0,
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Get organizer by ID
export const getOrganizer = (id: string) => organizers[id as keyof typeof organizers];

// Get provider by ID
export const getProvider = (id: string) => providers[id as keyof typeof providers];

// Get artist by ID
export const getArtist = (id: string) => artists[id as keyof typeof artists];

// Get venue by ID
export const getVenue = (id: string) => venues[id as keyof typeof venues];

// Get event by ID
export const getEvent = (id: string) => events[id as keyof typeof events];

// Get event with full details (venue, organizer, artists)
export const getEventWithDetails = (eventId: string) => {
  const event = getEvent(eventId);
  if (!event) return null;

  return {
    ...event,
    venue: getVenue(event.venueId),
    organizer: getOrganizer(event.organizerId),
    artists: event.artistIds.map((id) => getArtist(id)).filter(Boolean),
  };
};

// Get all events as array
export const getAllEvents = () => Object.values(events);

// Get all providers as array
export const getAllProviders = () => Object.values(providers);

// Get all artists as array
export const getAllArtists = () => Object.values(artists);

// Get all venues as array
export const getAllVenues = () => Object.values(venues);

// Get requirements for an event
export const getRequirementsForEvent = (eventId: string) =>
  Object.values(requirements).filter((req) => req.eventId === eventId);

// Get offers for a requirement
export const getOffersForRequirement = (reqId: string) =>
  Object.values(offers).filter((offer) => offer.requirementId === reqId);

// Get contracts for an event
export const getContractsForEvent = (eventId: string) =>
  Object.values(contracts).filter((contract) => contract.eventId === eventId);

// Get chats for an event
export const getChatsForEvent = (eventId: string) =>
  Object.values(chats).filter((chat) => chat.eventId === eventId);

// Format event title with artist for display
export const formatEventTitle = (eventId: string): string => {
  const event = getEvent(eventId);
  if (!event) return '';

  // If event has artists, show first artist name
  if (event.artistIds.length > 0) {
    const firstArtist = getArtist(event.artistIds[0]);
    if (firstArtist) {
      return `${event.title} - ${firstArtist.name}`;
    }
  }

  return event.title;
};

// Get event location string
export const getEventLocation = (eventId: string): string => {
  const event = getEvent(eventId);
  if (!event) return '';

  const venue = getVenue(event.venueId);
  if (!venue) return '';

  return `${venue.name}, ${venue.city}`;
};
