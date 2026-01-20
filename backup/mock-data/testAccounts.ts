/**
 * Test Accounts Data
 * Demo hesapları ve ilişkili veriler
 *
 * LOGIN BİLGİLERİ:
 *
 * ORGANIZATÖR:
 * - Email: demo@organizer.com
 * - Şifre: demo123
 *
 * BOOKING (Sanatçı Menajerliği):
 * - Email: demo@booking.com
 * - Şifre: demo123
 *
 * TEKNİK (Ses-Işık-Sahne):
 * - Email: demo@technical.com
 * - Şifre: demo123
 *
 * CATERING:
 * - Email: demo@catering.com
 * - Şifre: demo123
 *
 * ULAŞIM:
 * - Email: demo@transport.com
 * - Şifre: demo123
 *
 * GÜVENLİK:
 * - Email: demo@security.com
 * - Şifre: demo123
 */

// User Account Types
export type AccountType = 'organizer' | 'booking' | 'technical' | 'catering' | 'transport' | 'security';

export interface TestAccount {
  id: string;
  email: string;
  password: string;
  type: AccountType;
  role: 'organizer' | 'provider';
  profile: UserProfile;
  providerServices?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: 'organizer' | 'provider';
  company: string;
  companyLogo?: string;
  location: string;
  verified: boolean;
  memberSince: string;
  taxId?: string;
  iban?: string;
  stats: {
    totalEvents?: number;
    totalOffers?: number;
    completedJobs?: number;
    activeJobs?: number;
    rating: number;
    completionRate?: number;
    responseTime?: string;
  };
  bio?: string;
}

// ============================================
// TEST ACCOUNTS
// ============================================

export const testAccounts: TestAccount[] = [
  // 1. ORGANIZATÖR HESABI
  {
    id: 'acc_organizer_1',
    email: 'demo@organizer.com',
    password: 'demo123',
    type: 'organizer',
    role: 'organizer',
    profile: {
      id: 'u_org_1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@pozitif.com',
      phone: '+90 532 123 4567',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      role: 'organizer',
      company: 'Pozitif Live',
      companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
      location: 'İstanbul',
      verified: true,
      memberSince: '2020',
      stats: {
        totalEvents: 48,
        totalOffers: 312,
        rating: 4.9,
        completionRate: 98,
      },
      bio: 'Türkiye\'nin önde gelen etkinlik organizasyon şirketlerinden Pozitif Live\'ın kurucusu. Festival, konser ve kurumsal etkinlik organizasyonunda 15 yıllık deneyim.',
    },
  },

  // 2. BOOKING PROVIDER HESABI
  {
    id: 'acc_booking_1',
    email: 'demo@booking.com',
    password: 'demo123',
    type: 'booking',
    role: 'provider',
    providerServices: ['booking'],
    profile: {
      id: 'u_booking_1',
      name: 'Elif Güneş',
      email: 'demo@booking.com',
      phone: '+90 532 234 5678',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      role: 'provider',
      company: 'Star Booking Agency',
      companyLogo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
      location: 'İstanbul',
      verified: true,
      memberSince: '2018',
      taxId: '1234567890',
      iban: 'TR12 3456 7890 1234 5678 9012 34',
      stats: {
        completedJobs: 245,
        activeJobs: 12,
        rating: 4.9,
        responseTime: '< 1 saat',
      },
      bio: 'Star Booking Agency olarak Türkiye\'nin en popüler sanatçılarını temsil ediyoruz. Sıla, Mabel Matiz, Canozan ve daha birçok sanatçının menajerliğini yapıyoruz.',
    },
  },

  // 3. TEKNİK PROVIDER HESABI
  {
    id: 'acc_technical_1',
    email: 'demo@technical.com',
    password: 'demo123',
    type: 'technical',
    role: 'provider',
    providerServices: ['technical'],
    profile: {
      id: 'u_technical_1',
      name: 'Mehmet Demir',
      email: 'demo@technical.com',
      phone: '+90 532 345 6789',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      role: 'provider',
      company: 'Pro Sound Istanbul',
      companyLogo: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
      location: 'İstanbul',
      verified: true,
      memberSince: '2015',
      taxId: '2345678901',
      iban: 'TR23 4567 8901 2345 6789 0123 45',
      stats: {
        completedJobs: 890,
        activeJobs: 8,
        rating: 4.9,
        responseTime: '< 1 saat',
      },
      bio: 'Pro Sound Istanbul, 2015\'ten beri Türkiye\'nin en prestijli etkinliklerine ses, ışık ve sahne sistemleri sağlamaktadır. L-Acoustics, d&b audiotechnik yetkili distribütörüyüz.',
    },
  },

  // 4. CATERING PROVIDER HESABI
  {
    id: 'acc_catering_1',
    email: 'demo@catering.com',
    password: 'demo123',
    type: 'catering',
    role: 'provider',
    providerServices: ['catering'],
    profile: {
      id: 'u_catering_1',
      name: 'Ayşe Kaya',
      email: 'demo@catering.com',
      phone: '+90 532 456 7890',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      role: 'provider',
      company: 'GourmetEvents Catering',
      companyLogo: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200',
      location: 'İstanbul',
      verified: true,
      memberSince: '2017',
      taxId: '3456789012',
      iban: 'TR34 5678 9012 3456 7890 1234 56',
      stats: {
        completedJobs: 680,
        activeJobs: 15,
        rating: 4.9,
        responseTime: '< 3 saat',
      },
      bio: 'GourmetEvents Catering olarak düğün, kurumsal etkinlik ve festivallere premium catering hizmeti sunuyoruz. Michelin yıldızlı şeflerimizle dünya mutfağından lezzetler hazırlıyoruz.',
    },
  },

  // 5. TRANSPORT PROVIDER HESABI
  {
    id: 'acc_transport_1',
    email: 'demo@transport.com',
    password: 'demo123',
    type: 'transport',
    role: 'provider',
    providerServices: ['transport'],
    profile: {
      id: 'u_transport_1',
      name: 'Can Yılmaz',
      email: 'demo@transport.com',
      phone: '+90 532 567 8901',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      role: 'provider',
      company: 'Elite VIP Transfer',
      companyLogo: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200',
      location: 'İstanbul',
      verified: true,
      memberSince: '2016',
      taxId: '4567890123',
      iban: 'TR45 6789 0123 4567 8901 2345 67',
      stats: {
        completedJobs: 1560,
        activeJobs: 22,
        rating: 4.9,
        responseTime: '< 30 dk',
      },
      bio: 'Elite VIP Transfer, sanatçı ve VIP misafirler için premium transfer hizmeti sunmaktadır. Mercedes-Maybach, BMW 7 Serisi ve Sprinter VIP araç filomuzla hizmetinizdeyiz.',
    },
  },

  // 6. GÜVENLİK PROVIDER HESABI
  {
    id: 'acc_security_1',
    email: 'demo@security.com',
    password: 'demo123',
    type: 'security',
    role: 'provider',
    providerServices: ['security'],
    profile: {
      id: 'u_security_1',
      name: 'Ali Kara',
      email: 'demo@security.com',
      phone: '+90 532 678 9012',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
      role: 'provider',
      company: 'SecurePro Events',
      companyLogo: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200',
      location: 'İstanbul',
      verified: true,
      memberSince: '2012',
      taxId: '5678901234',
      iban: 'TR56 7890 1234 5678 9012 3456 78',
      stats: {
        completedJobs: 780,
        activeJobs: 6,
        rating: 4.9,
        responseTime: '< 1 saat',
      },
      bio: 'SecurePro Events, 20 yıllık deneyimiyle Türkiye\'nin en büyük etkinlik güvenlik şirketidir. 500+ lisanslı güvenlik personelimizle konser, festival ve kurumsal etkinliklerde güvenlik hizmeti sağlıyoruz.',
    },
  },
];

// ============================================
// ORGANIZATÖR İÇİN ETKİNLİK VERİLERİ
// ============================================

export const organizerEvents = [
  {
    id: 'e_org_1',
    ownerId: 'u_org_1',
    title: 'Big Bang Summer Festival 2026',
    description: 'Türkiye\'nin en büyük yaz festivali. 3 gün boyunca 40+ yerli ve yabancı sanatçı, 4 farklı sahne.',
    date: '10-12 Temmuz 2026',
    time: '14:00 - 04:00',
    location: 'İstanbul',
    venue: 'KüçükÇiftlik Park',
    district: 'Maçka',
    status: 'planning' as const,
    progress: 72,
    budget: 4500000,
    spent: 3240000,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    attendees: 25000,
    eventType: 'festival',
  },
  {
    id: 'e_org_2',
    ownerId: 'u_org_1',
    title: 'Vodafone Park Konseri - Sıla',
    description: 'Sıla\'nın kariyerinin en büyük konseri. Açık hava stadyum konseri.',
    date: '28 Ağustos 2026',
    time: '20:30 - 00:00',
    location: 'İstanbul',
    venue: 'Vodafone Park',
    district: 'Beşiktaş',
    status: 'planning' as const,
    progress: 55,
    budget: 2800000,
    spent: 1540000,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    attendees: 35000,
    eventType: 'concert',
  },
  {
    id: 'e_org_3',
    ownerId: 'u_org_1',
    title: 'Türkiye İnovasyon Zirvesi 2026',
    description: 'Teknoloji ve inovasyon dünyasının buluştuğu Türkiye\'nin en prestijli iş konferansı.',
    date: '15-16 Ekim 2026',
    time: '09:00 - 19:00',
    location: 'İstanbul',
    venue: 'Haliç Kongre Merkezi',
    district: 'Beyoğlu',
    status: 'planning' as const,
    progress: 40,
    budget: 1200000,
    spent: 480000,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    attendees: 3500,
    eventType: 'corporate',
  },
  {
    id: 'e_org_4',
    ownerId: 'u_org_1',
    title: 'Düğün - Zeynep & Emre',
    description: 'Boğaz manzaralı masalsı bir düğün. 400 seçkin davetli.',
    date: '21 Eylül 2026',
    time: '18:00 - 03:00',
    location: 'İstanbul',
    venue: 'Çırağan Palace Kempinski',
    district: 'Beşiktaş',
    status: 'confirmed' as const,
    progress: 85,
    budget: 2200000,
    spent: 1870000,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    attendees: 400,
    eventType: 'private',
  },
  {
    id: 'e_org_5',
    ownerId: 'u_org_1',
    title: 'Red Bull Music Academy Night',
    description: 'Elektronik müziğin öncülerini buluşturan özel gece.',
    date: '25 Mayıs 2026',
    time: '22:00 - 06:00',
    location: 'İstanbul',
    venue: 'Zorlu PSM Studio',
    district: 'Beşiktaş',
    status: 'confirmed' as const,
    progress: 90,
    budget: 650000,
    spent: 585000,
    image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
    attendees: 2000,
    eventType: 'concert',
  },
];

// ============================================
// ORGANIZATÖR İÇİN TEKLİF VERİLERİ
// ============================================

export const organizerOffers = [
  // Bekleyen Teklifler
  {
    id: 'off_org_1',
    eventId: 'e_org_1',
    eventTitle: 'Big Bang Summer Festival 2026',
    providerId: 'u_technical_1',
    providerName: 'Pro Sound Istanbul',
    providerImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
    category: 'technical',
    serviceName: 'Ana Sahne Ses Sistemi',
    status: 'pending' as const,
    amount: 185000,
    originalAmount: 195000,
    discount: 5,
    validUntil: '2026-06-25',
    createdAt: '2026-06-10',
    description: 'L-Acoustics K2 line array sistemi ile festival ana sahne ses altyapısı.',
  },
  {
    id: 'off_org_2',
    eventId: 'e_org_1',
    eventTitle: 'Big Bang Summer Festival 2026',
    providerId: 'u_catering_1',
    providerName: 'GourmetEvents Catering',
    providerImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200',
    category: 'catering',
    serviceName: 'Festival Catering (VIP + Backstage)',
    status: 'pending' as const,
    amount: 280000,
    originalAmount: 300000,
    discount: 7,
    validUntil: '2026-06-28',
    createdAt: '2026-06-12',
    description: '3 gün boyunca VIP alan, backstage ve staff için catering hizmeti.',
  },
  {
    id: 'off_org_3',
    eventId: 'e_org_2',
    eventTitle: 'Vodafone Park Konseri - Sıla',
    providerId: 'u_security_1',
    providerName: 'SecurePro Events',
    providerImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200',
    category: 'security',
    serviceName: 'Stadyum Güvenlik Hizmeti',
    status: 'counter_offered' as const,
    amount: 180000,
    originalAmount: 200000,
    discount: 10,
    validUntil: '2026-07-20',
    createdAt: '2026-07-01',
    description: '200 personel ile stadyum konseri güvenlik hizmeti.',
    counterOffer: {
      amount: 165000,
      by: 'organizer',
      date: '2026-07-05',
      message: 'Bütçemiz kısıtlı. 165.000 TL\'ye anlaşabilir miyiz?',
    },
  },

  // Onaylanan Teklifler
  {
    id: 'off_org_4',
    eventId: 'e_org_4',
    eventTitle: 'Düğün - Zeynep & Emre',
    providerId: 'u_booking_1',
    providerName: 'Star Booking Agency',
    providerImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
    category: 'booking',
    serviceName: 'Düğün Orkestrası & DJ',
    status: 'accepted' as const,
    amount: 145000,
    originalAmount: 145000,
    discount: 0,
    validUntil: '2026-08-01',
    createdAt: '2026-07-15',
    acceptedAt: '2026-07-18',
    acceptedBy: 'both' as const,
    description: 'Canlı orkestra ve DJ performansı.',
  },
  {
    id: 'off_org_5',
    eventId: 'e_org_5',
    eventTitle: 'Red Bull Music Academy Night',
    providerId: 'u_transport_1',
    providerName: 'Elite VIP Transfer',
    providerImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200',
    category: 'transport',
    serviceName: 'VIP Sanatçı Transferi',
    status: 'accepted' as const,
    amount: 45000,
    originalAmount: 50000,
    discount: 10,
    validUntil: '2026-05-10',
    createdAt: '2026-04-20',
    acceptedAt: '2026-04-25',
    acceptedBy: 'both' as const,
    description: 'DJ\'ler için havalimanı ve otel transferi.',
  },

  // Reddedilen Teklifler
  {
    id: 'off_org_6',
    eventId: 'e_org_3',
    eventTitle: 'Türkiye İnovasyon Zirvesi 2026',
    providerId: 'other_catering',
    providerName: 'Budget Catering Co.',
    providerImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200',
    category: 'catering',
    serviceName: 'Kurumsal Catering',
    status: 'rejected' as const,
    amount: 120000,
    originalAmount: 120000,
    discount: 0,
    validUntil: '2026-09-01',
    createdAt: '2026-08-10',
    rejectedAt: '2026-08-15',
    rejectedBy: 'organizer' as const,
    rejectionReason: 'Menü kalitesi beklentilerimizi karşılamıyor.',
    description: 'Standart kurumsal catering paketi.',
  },
];

// ============================================
// PROVIDER İÇİN ETKİNLİK VERİLERİ
// (Provider'ların dahil olduğu etkinlikler)
// ============================================

export const providerEvents = {
  // Booking Provider Etkinlikleri
  booking: [
    {
      id: 'pe_booking_1',
      eventId: 'e_org_4',
      eventTitle: 'Düğün - Zeynep & Emre',
      eventDate: '21 Eylül 2026',
      venue: 'Çırağan Palace Kempinski',
      organizerName: 'Ahmet Yılmaz',
      organizerCompany: 'Pozitif Live',
      organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      organizerPhone: '+90 532 123 4567',
      serviceName: 'Düğün Orkestrası & DJ',
      status: 'confirmed' as const,
      earnings: 145000,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    },
    {
      id: 'pe_booking_2',
      eventId: 'e_ext_1',
      eventTitle: 'Antalya Yaz Konseri - Mabel Matiz',
      eventDate: '15 Temmuz 2026',
      venue: 'Konyaaltı Açıkhava',
      organizerName: 'Deniz Akın',
      organizerCompany: 'Akdeniz Events',
      organizerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      organizerPhone: '+90 533 111 2222',
      serviceName: 'Sanatçı Booking - Mabel Matiz',
      status: 'pending' as const,
      earnings: 280000,
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    },
  ],

  // Technical Provider Etkinlikleri
  technical: [
    {
      id: 'pe_tech_1',
      eventId: 'e_org_1',
      eventTitle: 'Big Bang Summer Festival 2026',
      eventDate: '10-12 Temmuz 2026',
      venue: 'KüçükÇiftlik Park',
      organizerName: 'Ahmet Yılmaz',
      organizerCompany: 'Pozitif Live',
      organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      organizerPhone: '+90 532 123 4567',
      serviceName: 'Ana Sahne Ses Sistemi',
      status: 'pending' as const,
      earnings: 185000,
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    },
    {
      id: 'pe_tech_2',
      eventId: 'e_ext_2',
      eventTitle: 'Ankara Tech Summit 2026',
      eventDate: '20 Eylül 2026',
      venue: 'Congresium',
      organizerName: 'Zeynep Öztürk',
      organizerCompany: 'Tech Events Ankara',
      organizerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      organizerPhone: '+90 534 222 3333',
      serviceName: 'Konferans Ses & Görsel Sistemi',
      status: 'confirmed' as const,
      earnings: 95000,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    },
    {
      id: 'pe_tech_3',
      eventId: 'e_ext_3',
      eventTitle: 'İzmir Uluslararası Film Festivali',
      eventDate: '5-10 Kasım 2026',
      venue: 'Ahmed Adnan Saygun Sanat Merkezi',
      organizerName: 'Burak Kılıç',
      organizerCompany: 'İzmir Kültür A.Ş.',
      organizerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      organizerPhone: '+90 535 333 4444',
      serviceName: 'Sinema Ses Sistemi & LED Ekran',
      status: 'completed' as const,
      earnings: 120000,
      image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800',
    },
  ],

  // Catering Provider Etkinlikleri
  catering: [
    {
      id: 'pe_cat_1',
      eventId: 'e_org_1',
      eventTitle: 'Big Bang Summer Festival 2026',
      eventDate: '10-12 Temmuz 2026',
      venue: 'KüçükÇiftlik Park',
      organizerName: 'Ahmet Yılmaz',
      organizerCompany: 'Pozitif Live',
      organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      organizerPhone: '+90 532 123 4567',
      serviceName: 'Festival Catering',
      status: 'pending' as const,
      earnings: 280000,
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    },
    {
      id: 'pe_cat_2',
      eventId: 'e_ext_4',
      eventTitle: 'Garanti BBVA Yıllık Toplantısı',
      eventDate: '25 Mart 2026',
      venue: 'Four Seasons Bosphorus',
      organizerName: 'Selin Yılmaz',
      organizerCompany: 'Garanti BBVA Kurumsal İletişim',
      organizerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      organizerPhone: '+90 536 444 5555',
      serviceName: 'Premium Kurumsal Catering',
      status: 'confirmed' as const,
      earnings: 180000,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    },
    {
      id: 'pe_cat_3',
      eventId: 'e_ext_5',
      eventTitle: 'Boğaz Gala Gecesi',
      eventDate: '14 Şubat 2026',
      venue: 'Esma Sultan Yalısı',
      organizerName: 'Merve Aksoy',
      organizerCompany: 'Luxury Events Istanbul',
      organizerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      organizerPhone: '+90 537 555 6666',
      serviceName: 'Fine Dining Gala Catering',
      status: 'completed' as const,
      earnings: 220000,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    },
  ],

  // Transport Provider Etkinlikleri
  transport: [
    {
      id: 'pe_trans_1',
      eventId: 'e_org_5',
      eventTitle: 'Red Bull Music Academy Night',
      eventDate: '25 Mayıs 2026',
      venue: 'Zorlu PSM Studio',
      organizerName: 'Ahmet Yılmaz',
      organizerCompany: 'Pozitif Live',
      organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      organizerPhone: '+90 532 123 4567',
      serviceName: 'VIP Sanatçı Transferi',
      status: 'confirmed' as const,
      earnings: 45000,
      image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
    },
    {
      id: 'pe_trans_2',
      eventId: 'e_ext_6',
      eventTitle: 'UEFA Champions League Final',
      eventDate: '31 Mayıs 2026',
      venue: 'Atatürk Olimpiyat Stadyumu',
      organizerName: 'Mark Johnson',
      organizerCompany: 'UEFA Events',
      organizerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      organizerPhone: '+90 538 666 7777',
      serviceName: 'VIP Konuk Transfer Filosu',
      status: 'pending' as const,
      earnings: 250000,
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    },
    {
      id: 'pe_trans_3',
      eventId: 'e_ext_7',
      eventTitle: 'Rolling Stones İstanbul Konseri',
      eventDate: '18 Haziran 2026',
      venue: 'Vodafone Park',
      organizerName: 'James Wilson',
      organizerCompany: 'Live Nation Turkey',
      organizerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      organizerPhone: '+90 539 777 8888',
      serviceName: 'Band & Crew Transfer',
      status: 'completed' as const,
      earnings: 180000,
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    },
  ],

  // Security Provider Etkinlikleri
  security: [
    {
      id: 'pe_sec_1',
      eventId: 'e_org_2',
      eventTitle: 'Vodafone Park Konseri - Sıla',
      eventDate: '28 Ağustos 2026',
      venue: 'Vodafone Park',
      organizerName: 'Ahmet Yılmaz',
      organizerCompany: 'Pozitif Live',
      organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      organizerPhone: '+90 532 123 4567',
      serviceName: 'Stadyum Güvenlik Hizmeti',
      status: 'counter_offered' as const,
      earnings: 180000,
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    },
    {
      id: 'pe_sec_2',
      eventId: 'e_ext_8',
      eventTitle: 'Zeytinli Rock Festivali 2026',
      eventDate: '16-19 Temmuz 2026',
      venue: 'Zeytinli Açık Hava',
      organizerName: 'Ozan Bayraktar',
      organizerCompany: 'Pozitif Live',
      organizerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      organizerPhone: '+90 531 888 9999',
      serviceName: '4 Günlük Festival Güvenliği',
      status: 'pending' as const,
      earnings: 395000,
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    },
    {
      id: 'pe_sec_3',
      eventId: 'e_ext_9',
      eventTitle: 'Cumhurbaşkanlığı Kültür Ödülleri',
      eventDate: '29 Ekim 2026',
      venue: 'Cumhurbaşkanlığı Külliyesi',
      organizerName: 'Berk Aydın',
      organizerCompany: 'T.C. Kültür Bakanlığı',
      organizerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
      organizerPhone: '+90 532 999 0000',
      serviceName: 'VIP Güvenlik Hizmeti',
      status: 'confirmed' as const,
      earnings: 120000,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    },
  ],
};

// ============================================
// PROVIDER İÇİN TEKLİF TALEPLERİ
// (Her provider türü için gelen teklif talepleri)
// ============================================

export const providerQuoteRequests = {
  booking: [
    {
      id: 'qr_book_1',
      eventId: 'e_ext_10',
      eventTitle: 'İstanbul Jazz Festival 2026',
      organizerName: 'IKSV',
      organizerImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
      eventDate: '5-15 Temmuz 2026',
      venue: 'Harbiye Açıkhava',
      category: 'booking',
      budget: '250.000 - 400.000 TL',
      description: 'Jazz festivali için yerli sanatçı booking talebi. 3 farklı gece için ayrı performanslar.',
      requirements: {
        artistCount: 3,
        genres: ['Jazz', 'Fusion', 'Soul'],
        performanceDuration: '90 dakika',
      },
      createdAt: '2026-05-01',
      status: 'new' as const,
    },
  ],

  technical: [
    {
      id: 'qr_tech_1',
      eventId: 'e_org_1',
      eventTitle: 'Big Bang Summer Festival 2026',
      organizerName: 'Event Masters Turkey',
      organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      eventDate: '10-12 Temmuz 2026',
      venue: 'KüçükÇiftlik Park',
      category: 'technical',
      budget: '170.000 - 200.000 TL',
      description: 'Festival ana sahne ses sistemi. 25.000 kişilik açık alan için L-Acoustics veya d&b tercih edilir.',
      requirements: {
        systemType: 'Line Array',
        coverage: '25.000 kişi',
        subwoofers: 'Gerekli',
        monitors: '12 adet',
        delayTowers: '4 adet',
      },
      createdAt: '2026-06-01',
      status: 'new' as const,
    },
    {
      id: 'qr_tech_2',
      eventId: 'e_ext_11',
      eventTitle: 'Mercedes-Benz Fashion Week',
      organizerName: 'IMG Turkey',
      organizerImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
      eventDate: '8-12 Ekim 2026',
      venue: 'Zorlu Center',
      category: 'technical',
      budget: '300.000 - 400.000 TL',
      description: 'Moda haftası için podyum ışık tasarımı ve ses sistemi. 5 gün sürecek.',
      requirements: {
        lightingDesign: 'Custom',
        movingHeads: '60+ adet',
        soundSystem: 'Premium',
        videoWall: 'Gerekli',
      },
      createdAt: '2026-08-15',
      status: 'new' as const,
    },
  ],

  catering: [
    {
      id: 'qr_cat_1',
      eventId: 'e_org_1',
      eventTitle: 'Big Bang Summer Festival 2026',
      organizerName: 'Event Masters Turkey',
      organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      eventDate: '10-12 Temmuz 2026',
      venue: 'KüçükÇiftlik Park',
      category: 'catering',
      budget: '250.000 - 320.000 TL',
      description: '3 günlük festival için VIP alan ve backstage catering. Günlük 500 kişi.',
      requirements: {
        dailyGuests: 500,
        meals: ['Kahvaltı', 'Öğle', 'Akşam', 'Gece Atıştırmalık'],
        vipArea: true,
        backstage: true,
        dietaryOptions: ['Vegan', 'Gluten-Free', 'Helal'],
      },
      createdAt: '2026-06-05',
      status: 'new' as const,
    },
    {
      id: 'qr_cat_2',
      eventId: 'e_ext_12',
      eventTitle: 'Türkiye Startup Summit 2026',
      organizerName: 'TechPark Istanbul',
      organizerImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
      eventDate: '20-21 Kasım 2026',
      venue: 'Haliç Kongre Merkezi',
      category: 'catering',
      budget: '180.000 - 220.000 TL',
      description: '2 günlük teknoloji konferansı için kurumsal catering. 2000 katılımcı.',
      requirements: {
        totalGuests: 2000,
        meals: ['Coffee Break', 'Öğle Yemeği', 'Kokteyl'],
        serviceStyle: 'Açık Büfe + Stand',
        vipDinner: true,
      },
      createdAt: '2026-10-01',
      status: 'new' as const,
    },
  ],

  transport: [
    {
      id: 'qr_trans_1',
      eventId: 'e_ext_13',
      eventTitle: 'G20 İş Zirvesi',
      organizerName: 'DEIK',
      organizerImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
      eventDate: '15-17 Eylül 2026',
      venue: 'Istanbul Congress Center',
      category: 'transport',
      budget: '350.000 - 450.000 TL',
      description: 'G20 ülkelerinden gelecek iş delegasyonları için VIP transfer hizmeti.',
      requirements: {
        vehicleTypes: ['Mercedes S-Class', 'BMW 7', 'Maybach'],
        vehicleCount: 25,
        duration: '3 gün',
        airportTransfer: true,
        protocolService: true,
      },
      createdAt: '2026-08-01',
      status: 'new' as const,
    },
  ],

  security: [
    {
      id: 'qr_sec_1',
      eventId: 'e_org_2',
      eventTitle: 'Vodafone Park Konseri - Sıla',
      organizerName: 'Event Masters Turkey',
      organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      eventDate: '28 Ağustos 2026',
      venue: 'Vodafone Park',
      category: 'security',
      budget: '150.000 - 200.000 TL',
      description: '35.000 kişilik stadyum konseri için komple güvenlik çözümü.',
      requirements: {
        personnelCount: 200,
        areas: ['Giriş', 'VIP', 'Sahne', 'Backstage', 'Tribünler'],
        shiftDuration: '12 saat',
        k9Unit: true,
        cctv: true,
      },
      createdAt: '2026-07-01',
      status: 'new' as const,
    },
    {
      id: 'qr_sec_2',
      eventId: 'e_ext_14',
      eventTitle: 'Uluslararası Film Festivali Gala',
      organizerName: 'Antalya Film Festivali',
      organizerImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
      eventDate: '1-8 Ekim 2026',
      venue: 'Antalya Expo Center',
      category: 'security',
      budget: '280.000 - 350.000 TL',
      description: '8 günlük uluslararası festival için güvenlik. VIP konuk koruması dahil.',
      requirements: {
        personnelCount: 150,
        vipProtection: true,
        duration: '8 gün',
        closeProtection: true,
        mediaControl: true,
      },
      createdAt: '2026-09-01',
      status: 'new' as const,
    },
  ],
};

// ============================================
// PROVIDER İÇİN CHAT/MESAJ VERİLERİ
// ============================================

export const providerConversations = {
  booking: [
    {
      id: 'conv_book_1',
      participantId: 'u_org_1',
      participantName: 'Event Masters Turkey',
      participantImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      participantType: 'organizer',
      eventTitle: 'Düğün - Zeynep & Emre',
      serviceCategory: 'booking',
      lastMessage: 'Mabel Matiz\'in müsaitlik durumunu öğrenebilir miyiz?',
      lastMessageTime: '2 saat önce',
      unreadCount: 1,
      online: true,
      messages: [
        { id: 'm1', senderId: 'u_org_1', text: 'Merhaba, düğün için sanatçı booking teklifi almak istiyoruz.', time: '10:00', type: 'text' },
        { id: 'm2', senderId: 'me', text: 'Merhaba, hangi sanatçılarla ilgileniyorsunuz?', time: '10:15', type: 'text' },
        { id: 'm3', senderId: 'u_org_1', text: 'Mabel Matiz\'in müsaitlik durumunu öğrenebilir miyiz?', time: '10:30', type: 'text' },
      ],
    },
    {
      id: 'conv_book_2',
      participantId: 'ext_org_1',
      participantName: 'Akdeniz Events',
      participantImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      participantType: 'organizer',
      eventTitle: 'Antalya Yaz Konseri',
      serviceCategory: 'booking',
      lastMessage: 'Sözleşme şartlarını kabul ediyoruz.',
      lastMessageTime: 'Dün',
      unreadCount: 0,
      online: false,
      messages: [
        { id: 'm1', senderId: 'ext_org_1', text: 'Konser için teklif gönderir misiniz?', time: '14:00', type: 'text' },
        { id: 'm2', senderId: 'me', text: 'Tabii, teklifimizi hazırladık.', time: '15:30', type: 'text' },
        { id: 'm3', senderId: 'ext_org_1', text: 'Sözleşme şartlarını kabul ediyoruz.', time: '16:45', type: 'text' },
      ],
    },
  ],

  technical: [
    {
      id: 'conv_tech_1',
      participantId: 'u_org_1',
      participantName: 'Event Masters Turkey',
      participantImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      participantType: 'organizer',
      eventTitle: 'Big Bang Summer Festival 2026',
      serviceCategory: 'technical',
      lastMessage: 'L-Acoustics K2 sistemi tercih ediyoruz, teklifinizi güncelleyebilir misiniz?',
      lastMessageTime: '30 dk önce',
      unreadCount: 2,
      online: true,
      messages: [
        { id: 'm1', senderId: 'u_org_1', text: 'Festival için ses sistemi teklifi bekliyoruz.', time: '09:00', type: 'text' },
        { id: 'm2', senderId: 'me', text: 'Alan büyüklüğü ve katılımcı sayısını öğrenebilir miyim?', time: '09:15', type: 'text' },
        { id: 'm3', senderId: 'u_org_1', text: '25.000 kişilik açık alan, 3 gün sürecek.', time: '09:30', type: 'text' },
        { id: 'm4', senderId: 'me', text: 'Teklifimizi hazırladık, 185.000 TL.', time: '11:00', type: 'text' },
        { id: 'm5', senderId: 'u_org_1', text: 'L-Acoustics K2 sistemi tercih ediyoruz, teklifinizi güncelleyebilir misiniz?', time: '14:00', type: 'text' },
      ],
    },
    {
      id: 'conv_tech_2',
      participantId: 'ext_org_2',
      participantName: 'Tech Events Ankara',
      participantImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      participantType: 'organizer',
      eventTitle: 'Ankara Tech Summit 2026',
      serviceCategory: 'technical',
      lastMessage: 'Sözleşme onaylandı, kurulum tarihini koordine edelim.',
      lastMessageTime: '3 gün önce',
      unreadCount: 0,
      online: false,
      messages: [
        { id: 'm1', senderId: 'ext_org_2', text: 'Konferans için ses ve görsel sistem teklifi?', time: '11:00', type: 'text' },
        { id: 'm2', senderId: 'me', text: 'Mekan detaylarını paylaşabilir misiniz?', time: '11:30', type: 'text' },
        { id: 'm3', senderId: 'ext_org_2', text: 'Sözleşme onaylandı, kurulum tarihini koordine edelim.', time: '16:00', type: 'text' },
      ],
    },
  ],

  catering: [
    {
      id: 'conv_cat_1',
      participantId: 'u_org_1',
      participantName: 'Event Masters Turkey',
      participantImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      participantType: 'organizer',
      eventTitle: 'Big Bang Summer Festival 2026',
      serviceCategory: 'catering',
      lastMessage: 'Vegan menü seçeneklerini artırabilir misiniz?',
      lastMessageTime: '1 saat önce',
      unreadCount: 1,
      online: true,
      messages: [
        { id: 'm1', senderId: 'u_org_1', text: 'Festival VIP ve backstage catering için teklif istiyoruz.', time: '10:00', type: 'text' },
        { id: 'm2', senderId: 'me', text: 'Günlük kişi sayısı ve öğün detaylarını alabilir miyim?', time: '10:30', type: 'text' },
        { id: 'm3', senderId: 'u_org_1', text: 'Günde 500 kişi, 3 öğün + ara atıştırmalıklar.', time: '11:00', type: 'text' },
        { id: 'm4', senderId: 'me', text: 'Teklifimiz hazır, 280.000 TL.', time: '14:00', type: 'text' },
        { id: 'm5', senderId: 'u_org_1', text: 'Vegan menü seçeneklerini artırabilir misiniz?', time: '15:30', type: 'text' },
      ],
    },
    {
      id: 'conv_cat_2',
      participantId: 'ext_org_3',
      participantName: 'Garanti BBVA Kurumsal İletişim',
      participantImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      participantType: 'organizer',
      eventTitle: 'Garanti BBVA Yıllık Toplantısı',
      serviceCategory: 'catering',
      lastMessage: 'Menü tadım günü için tarih belirleyelim.',
      lastMessageTime: '2 gün önce',
      unreadCount: 0,
      online: false,
      messages: [
        { id: 'm1', senderId: 'ext_org_3', text: 'Kurumsal toplantı için premium catering hizmeti arıyoruz.', time: '09:00', type: 'text' },
        { id: 'm2', senderId: 'me', text: 'Kaç kişilik ve hangi tip menü düşünüyorsunuz?', time: '09:45', type: 'text' },
        { id: 'm3', senderId: 'ext_org_3', text: 'Menü tadım günü için tarih belirleyelim.', time: '14:00', type: 'text' },
      ],
    },
  ],

  transport: [
    {
      id: 'conv_trans_1',
      participantId: 'u_org_1',
      participantName: 'Event Masters Turkey',
      participantImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      participantType: 'organizer',
      eventTitle: 'Red Bull Music Academy Night',
      serviceCategory: 'transport',
      lastMessage: 'DJ ekibi yarın 14:00\'te havalimanında olacak.',
      lastMessageTime: '4 saat önce',
      unreadCount: 1,
      online: true,
      messages: [
        { id: 'm1', senderId: 'u_org_1', text: 'DJ\'ler için VIP transfer hizmeti istiyoruz.', time: '10:00', type: 'text' },
        { id: 'm2', senderId: 'me', text: 'Kaç kişi ve hangi güzergah?', time: '10:15', type: 'text' },
        { id: 'm3', senderId: 'u_org_1', text: '8 kişi, havalimanı-otel-mekan transferi.', time: '10:30', type: 'text' },
        { id: 'm4', senderId: 'me', text: 'Sprinter VIP ile 45.000 TL teklif ediyoruz.', time: '11:00', type: 'text' },
        { id: 'm5', senderId: 'u_org_1', text: 'DJ ekibi yarın 14:00\'te havalimanında olacak.', time: '16:00', type: 'text' },
      ],
    },
    {
      id: 'conv_trans_2',
      participantId: 'ext_org_4',
      participantName: 'UEFA Events',
      participantImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      participantType: 'organizer',
      eventTitle: 'UEFA Champions League Final',
      serviceCategory: 'transport',
      lastMessage: 'VIP konuk listesini ekte gönderiyoruz.',
      lastMessageTime: 'Dün',
      unreadCount: 0,
      online: false,
      messages: [
        { id: 'm1', senderId: 'ext_org_4', text: 'Final maçı için VIP transfer filosu gerekiyor.', time: '09:00', type: 'text' },
        { id: 'm2', senderId: 'me', text: 'Kaç araç ve hangi sınıf tercih ediyorsunuz?', time: '09:30', type: 'text' },
        { id: 'm3', senderId: 'ext_org_4', text: 'VIP konuk listesini ekte gönderiyoruz.', time: '11:00', type: 'text' },
      ],
    },
  ],

  security: [
    {
      id: 'conv_sec_1',
      participantId: 'u_org_1',
      participantName: 'Event Masters Turkey',
      participantImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      participantType: 'organizer',
      eventTitle: 'Vodafone Park Konseri - Sıla',
      serviceCategory: 'security',
      lastMessage: 'Bütçemiz kısıtlı. 165.000 TL\'ye anlaşabilir miyiz?',
      lastMessageTime: '5 saat önce',
      unreadCount: 2,
      online: true,
      messages: [
        { id: 'm1', senderId: 'u_org_1', text: 'Stadyum konseri için güvenlik teklifi bekliyoruz.', time: '09:00', type: 'text' },
        { id: 'm2', senderId: 'me', text: 'Kapasite ve güvenlik noktası sayısını öğrenebilir miyim?', time: '09:30', type: 'text' },
        { id: 'm3', senderId: 'u_org_1', text: '35.000 kişi, giriş + sahne + VIP + backstage.', time: '10:00', type: 'text' },
        { id: 'm4', senderId: 'me', text: '200 personel ile 180.000 TL teklif ediyoruz.', time: '14:00', type: 'text' },
        { id: 'm5', senderId: 'u_org_1', text: 'Bütçemiz kısıtlı. 165.000 TL\'ye anlaşabilir miyiz?', time: '15:00', type: 'text' },
      ],
    },
    {
      id: 'conv_sec_2',
      participantId: 'ext_org_5',
      participantName: 'Pozitif Live',
      participantImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      participantType: 'organizer',
      eventTitle: 'Zeytinli Rock Festivali 2026',
      serviceCategory: 'security',
      lastMessage: 'Güvenlik planını onayladık, sözleşmeyi hazırlayabilir misiniz?',
      lastMessageTime: '2 gün önce',
      unreadCount: 0,
      online: false,
      messages: [
        { id: 'm1', senderId: 'ext_org_5', text: '4 günlük festival güvenliği için teklif istiyoruz.', time: '10:00', type: 'text' },
        { id: 'm2', senderId: 'me', text: 'Alan haritası ve beklenen katılımcı sayısını alabilir miyim?', time: '10:30', type: 'text' },
        { id: 'm3', senderId: 'ext_org_5', text: 'Güvenlik planını onayladık, sözleşmeyi hazırlayabilir misiniz?', time: '16:00', type: 'text' },
      ],
    },
  ],
};

// Provider konuşmalarını getir
export const getProviderConversations = (providerType: AccountType) => {
  return providerConversations[providerType as keyof typeof providerConversations] || [];
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Hesap kontrolü
export const findAccountByEmail = (email: string): TestAccount | undefined => {
  return testAccounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
};

// Hesap doğrulama
export const validateCredentials = (email: string, password: string): TestAccount | null => {
  const account = findAccountByEmail(email);
  if (account && account.password === password) {
    return account;
  }
  return null;
};

// Provider etkinliklerini getir
export const getProviderEvents = (providerType: AccountType) => {
  return providerEvents[providerType as keyof typeof providerEvents] || [];
};

// Provider teklif taleplerini getir
export const getProviderQuoteRequests = (providerType: AccountType) => {
  return providerQuoteRequests[providerType as keyof typeof providerQuoteRequests] || [];
};

// Organizatör etkinliklerini getir
export const getOrganizerEvents = () => {
  return organizerEvents;
};

// Organizatör tekliflerini getir
export const getOrganizerOffers = () => {
  return organizerOffers;
};
