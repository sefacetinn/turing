// Artist Roster Data for Booking Providers

export interface Artist {
  id: string;
  name: string;
  stageName?: string;
  genre: string[];
  image: string;
  coverImage: string;
  priceRange: string;
  priceMin: number;
  priceMax: number;
  rating: number;
  reviewCount: number;
  description: string;
  bio: string;
  status: 'active' | 'inactive' | 'on_tour';
  availability: 'available' | 'busy' | 'limited';
  socialMedia: {
    instagram?: string;
    spotify?: string;
    youtube?: string;
  };
  stats: {
    totalShows: number;
    monthlyListeners: string;
    followers: string;
  };
  requirements: {
    minFee: number;
    travelIncluded: boolean;
    accommodationRequired: boolean;
    technicalRider: boolean;
    backlineRequired: boolean;
  };
  upcomingShows: ArtistShow[];
  pastShows: ArtistShow[];
}

export interface ArtistShow {
  id: string;
  eventName: string;
  venue: string;
  city: string;
  date: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  fee: number;
}

export interface ArtistContract {
  id: string;
  artistId: string;
  artistName: string;
  eventName: string;
  eventDate: string;
  venue: string;
  fee: number;
  status: 'draft' | 'sent' | 'signed' | 'completed';
  createdAt: string;
  signedAt?: string;
}

// Mock Artists Data
export const mockArtists: Artist[] = [
  {
    id: 'art1',
    name: 'Ahmet Yılmaz',
    stageName: 'DJ Phantom',
    genre: ['Electronic', 'House', 'Techno'],
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    priceRange: '₺75.000 - ₺150.000',
    priceMin: 75000,
    priceMax: 150000,
    rating: 4.9,
    reviewCount: 127,
    description: 'Türkiye\'nin en çok talep edilen DJ\'lerinden biri',
    bio: 'DJ Phantom olarak bilinen Ahmet Yılmaz, 15 yıllık kariyerinde 500\'den fazla etkinlikte sahne aldı. Tomorrowland, Ultra Music Festival gibi dünya çapındaki festivallerde performans sergiledi.',
    status: 'active',
    availability: 'limited',
    socialMedia: {
      instagram: '@djphantom',
      spotify: 'djphantom',
      youtube: 'DJPhantomOfficial',
    },
    stats: {
      totalShows: 523,
      monthlyListeners: '2.5M',
      followers: '850K',
    },
    requirements: {
      minFee: 75000,
      travelIncluded: false,
      accommodationRequired: true,
      technicalRider: true,
      backlineRequired: false,
    },
    upcomingShows: [
      { id: 'sh1', eventName: 'Summer Fest 2024', venue: 'KüsarArena', city: 'İstanbul', date: '15 Temmuz 2024', status: 'confirmed', fee: 120000 },
      { id: 'sh2', eventName: 'Beach Party', venue: 'Sunset Beach', city: 'Bodrum', date: '22 Temmuz 2024', status: 'pending', fee: 90000 },
    ],
    pastShows: [
      { id: 'sh3', eventName: 'New Year Party', venue: 'Zorlu PSM', city: 'İstanbul', date: '31 Aralık 2023', status: 'completed', fee: 150000 },
    ],
  },
  {
    id: 'art2',
    name: 'Elif Deniz',
    genre: ['Pop', 'R&B'],
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    coverImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    priceRange: '₺200.000 - ₺400.000',
    priceMin: 200000,
    priceMax: 400000,
    rating: 4.8,
    reviewCount: 89,
    description: 'Ödüllü pop sanatçısı',
    bio: 'Elif Deniz, 2018\'den bu yana müzik sahnesinde yer alıyor. 3 albüm ve 15 single\'ın sahibi. Altın Kelebek ve Kral Müzik Ödülleri sahibi.',
    status: 'active',
    availability: 'available',
    socialMedia: {
      instagram: '@elifdeniz',
      spotify: 'elifdeniz',
      youtube: 'ElifDenizOfficial',
    },
    stats: {
      totalShows: 234,
      monthlyListeners: '5.2M',
      followers: '1.2M',
    },
    requirements: {
      minFee: 200000,
      travelIncluded: true,
      accommodationRequired: true,
      technicalRider: true,
      backlineRequired: true,
    },
    upcomingShows: [
      { id: 'sh4', eventName: 'Yaz Konserleri', venue: 'Harbiye Açıkhava', city: 'İstanbul', date: '20 Ağustos 2024', status: 'confirmed', fee: 350000 },
    ],
    pastShows: [],
  },
  {
    id: 'art3',
    name: 'Kaan Tangöze',
    stageName: 'Duman',
    genre: ['Rock', 'Alternative'],
    image: 'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=400',
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    priceRange: '₺500.000 - ₺800.000',
    priceMin: 500000,
    priceMax: 800000,
    rating: 5.0,
    reviewCount: 312,
    description: 'Türk Rock müziğinin efsanesi',
    bio: 'Duman grubu ile 25 yılı aşkın süredir müzik yapan Kaan Tangöze, Türk Rock müziğinin en önemli isimlerinden biri.',
    status: 'active',
    availability: 'limited',
    socialMedia: {
      instagram: '@dumanofficial',
      spotify: 'duman',
      youtube: 'DumanOfficial',
    },
    stats: {
      totalShows: 1250,
      monthlyListeners: '8.5M',
      followers: '3.5M',
    },
    requirements: {
      minFee: 500000,
      travelIncluded: true,
      accommodationRequired: true,
      technicalRider: true,
      backlineRequired: true,
    },
    upcomingShows: [],
    pastShows: [],
  },
  {
    id: 'art4',
    name: 'Merve Aydın',
    stageName: 'DJ Merva',
    genre: ['Electronic', 'Deep House', 'Melodic Techno'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    priceRange: '₺40.000 - ₺80.000',
    priceMin: 40000,
    priceMax: 80000,
    rating: 4.7,
    reviewCount: 56,
    description: 'Yükselen yıldız DJ',
    bio: 'DJ Merva, melodic techno ve deep house türlerinde uzmanlaşmış genç bir DJ. Son 3 yılda hızla yükselişte.',
    status: 'active',
    availability: 'available',
    socialMedia: {
      instagram: '@djmerva',
      spotify: 'djmerva',
    },
    stats: {
      totalShows: 89,
      monthlyListeners: '450K',
      followers: '120K',
    },
    requirements: {
      minFee: 40000,
      travelIncluded: false,
      accommodationRequired: false,
      technicalRider: true,
      backlineRequired: false,
    },
    upcomingShows: [
      { id: 'sh5', eventName: 'Rooftop Sessions', venue: 'W Hotel Terrace', city: 'İstanbul', date: '28 Haziran 2024', status: 'confirmed', fee: 45000 },
      { id: 'sh6', eventName: 'Sunset Party', venue: 'Macakizi', city: 'Bodrum', date: '5 Temmuz 2024', status: 'pending', fee: 60000 },
    ],
    pastShows: [],
  },
  {
    id: 'art5',
    name: 'Sertab Erener Cover',
    genre: ['Pop', 'Turkish Pop'],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    coverImage: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800',
    priceRange: '₺25.000 - ₺50.000',
    priceMin: 25000,
    priceMax: 50000,
    rating: 4.5,
    reviewCount: 34,
    description: 'Profesyonel cover sanatçısı',
    bio: 'Düğün ve özel etkinliklerde profesyonel cover performansları sunan deneyimli sanatçı.',
    status: 'active',
    availability: 'available',
    socialMedia: {
      instagram: '@coverband_tr',
    },
    stats: {
      totalShows: 450,
      monthlyListeners: '50K',
      followers: '25K',
    },
    requirements: {
      minFee: 25000,
      travelIncluded: false,
      accommodationRequired: false,
      technicalRider: false,
      backlineRequired: true,
    },
    upcomingShows: [],
    pastShows: [],
  },
];

// Mock Contracts
export const mockContracts: ArtistContract[] = [
  {
    id: 'con1',
    artistId: 'art1',
    artistName: 'DJ Phantom',
    eventName: 'Summer Fest 2024',
    eventDate: '15 Temmuz 2024',
    venue: 'KüsarArena',
    fee: 120000,
    status: 'signed',
    createdAt: '2024-05-15',
    signedAt: '2024-05-20',
  },
  {
    id: 'con2',
    artistId: 'art2',
    artistName: 'Elif Deniz',
    eventName: 'Yaz Konserleri',
    eventDate: '20 Ağustos 2024',
    venue: 'Harbiye Açıkhava',
    fee: 350000,
    status: 'sent',
    createdAt: '2024-06-01',
  },
  {
    id: 'con3',
    artistId: 'art4',
    artistName: 'DJ Merva',
    eventName: 'Rooftop Sessions',
    eventDate: '28 Haziran 2024',
    venue: 'W Hotel Terrace',
    fee: 45000,
    status: 'draft',
    createdAt: '2024-06-10',
  },
];

// Helper functions
export function getArtistById(id: string): Artist | undefined {
  return mockArtists.find(a => a.id === id);
}

export function getArtistsByGenre(genre: string): Artist[] {
  return mockArtists.filter(a => a.genre.includes(genre));
}

export function getAvailableArtists(): Artist[] {
  return mockArtists.filter(a => a.availability === 'available' && a.status === 'active');
}

export function getArtistContracts(artistId: string): ArtistContract[] {
  return mockContracts.filter(c => c.artistId === artistId);
}

export function getContractsByStatus(status: ArtistContract['status']): ArtistContract[] {
  return mockContracts.filter(c => c.status === status);
}

// Stats
export function getArtistStats() {
  const totalArtists = mockArtists.length;
  const activeArtists = mockArtists.filter(a => a.status === 'active').length;
  const availableArtists = mockArtists.filter(a => a.availability === 'available').length;
  const upcomingShows = mockArtists.reduce((acc, a) => acc + a.upcomingShows.length, 0);
  const totalRevenue = mockContracts.filter(c => c.status === 'signed').reduce((acc, c) => acc + c.fee, 0);

  return {
    totalArtists,
    activeArtists,
    availableArtists,
    upcomingShows,
    totalRevenue,
    pendingContracts: mockContracts.filter(c => c.status === 'sent').length,
  };
}
