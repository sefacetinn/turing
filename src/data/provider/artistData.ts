// Artist Roster Data for Booking Providers

// Ekip Üyesi Arayüzü
export interface CrewMember {
  id: string;
  name: string;
  role: 'manager' | 'sound_engineer' | 'lighting_designer' | 'tour_manager' |
        'stage_manager' | 'musician' | 'backup_vocal' | 'technician' | 'security' | 'other';
  phone?: string;
  email?: string;
  image?: string;
  notes?: string;
}

// Teknik Rider Arayüzü
export interface TechnicalRider {
  stage: {
    minWidth: number;      // metre
    minDepth: number;      // metre
    minHeight?: number;    // metre
    roofRequired: boolean;
    backlineProvided: boolean;
    instrumentList?: string[];
  };
  sound: {
    systemType: 'line_array' | 'point_source' | 'any';
    minPower: number;      // watt
    monitors: number;      // adet
    inEarMonitors?: number;
    mixerChannels?: number;
    specificBrands?: string[];
  };
  lighting: {
    movingHeadCount: number;
    ledBarCount?: number;
    strobeCount?: number;
    hazeRequired: boolean;
    followSpotRequired: boolean;
    ledWallSize?: string;
    specificRequirements?: string[];
  };
  power: {
    totalKW: number;
    phases: 1 | 3;
    backupGeneratorRequired: boolean;
  };
  timing: {
    loadInHours: number;
    soundCheckHours: number;
    loadOutHours: number;
  };
  notes?: string;
}

// Ulaşım Rider Arayüzü
export interface TransportRider {
  airportTransfer: {
    required: boolean;
    vehicleType: 'sedan' | 'suv' | 'van' | 'sprinter' | 'minibus';
    passengerCount: number;
    luggageNote?: string;
  };
  localTransport: {
    required: boolean;
    vehicleType: 'sedan' | 'suv' | 'van' | 'sprinter';
    availableHours: string;
  };
  crewTransport?: {
    vehicleType: string;
    passengerCount: number;
  };
  notes?: string;
}

// Konaklama Rider Arayüzü
export interface AccommodationRider {
  artistRooms: {
    count: number;
    type: 'standard' | 'deluxe' | 'suite' | 'presidential';
    minStarRating: 3 | 4 | 5;
    bedType?: 'single' | 'double' | 'king';
  };
  crewRooms: {
    count: number;
    type: 'standard' | 'deluxe';
    minStarRating: 3 | 4 | 5;
  };
  checkIn: string;
  checkOut: string;
  earlyCheckIn?: boolean;
  lateCheckOut?: boolean;
  meals: {
    breakfast: boolean;
    lunch?: boolean;
    dinner?: boolean;
    dietaryRestrictions?: string[];
  };
  maxDistanceToVenue?: number;
  notes?: string;
}

// Backstage Rider Arayüzü
export interface BackstageRider {
  dressingRoom: {
    count: number;
    privateRequired: boolean;
    amenities: string[];
  };
  catering: {
    hotMeals: boolean;
    coldMeals: boolean;
    beverages: string[];
    snacks: string[];
    alcoholPolicy: 'none' | 'beer_wine' | 'full_bar';
    dietaryRestrictions?: string[];
  };
  other: {
    towels: number;
    bathrobeRequired?: boolean;
    ironRequired?: boolean;
    wifiRequired: boolean;
  };
  notes?: string;
}

// Rider Dokümanı Arayüzü
export interface RiderDocument {
  id: string;
  type: 'technical' | 'transport' | 'accommodation' | 'backstage' | 'general';
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'doc' | 'docx';
  uploadedAt: string;
  version: number;
  url: string;
}

// Sanatçı Arayüzü (Genişletilmiş)
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
    spotifyMonthly?: string;
    youtubeSubscribers?: string;
    instagramFollowers?: string;
    totalStreams?: string;
  };
  // Booking firma bilgisi
  bookingAgency?: {
    id: string;
    name: string;
    logo?: string;
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

  // YENİ: Ekip Üyeleri
  crew: CrewMember[];

  // YENİ: Rider'lar
  riders: {
    technical?: TechnicalRider;
    transport?: TransportRider;
    accommodation?: AccommodationRider;
    backstage?: BackstageRider;
  };

  // YENİ: Rider Dosyaları
  riderDocuments: RiderDocument[];
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

// Rol etiketleri
export const crewRoleLabels: Record<CrewMember['role'], string> = {
  manager: 'Menajer',
  sound_engineer: 'Ses Mühendisi',
  lighting_designer: 'Işık Tasarımcısı',
  tour_manager: 'Tur Menajeri',
  stage_manager: 'Sahne Amiri',
  musician: 'Müzisyen',
  backup_vocal: 'Backing Vokal',
  technician: 'Teknisyen',
  security: 'Güvenlik',
  other: 'Diğer',
};

// Rider tipi etiketleri
export const riderTypeLabels: Record<RiderDocument['type'], string> = {
  technical: 'Teknik Rider',
  transport: 'Ulaşım Rider',
  accommodation: 'Konaklama Rider',
  backstage: 'Backstage Rider',
  general: 'Genel',
};

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
      spotifyMonthly: '2.5M',
      youtubeSubscribers: '320K',
      instagramFollowers: '850K',
      totalStreams: '150M',
    },
    bookingAgency: {
      id: 'booking1',
      name: 'Prime Artist Management',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
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
    // YENİ: Ekip Üyeleri
    crew: [
      { id: 'cr1', name: 'Murat Özkan', role: 'manager', phone: '+90 532 111 2233', email: 'murat@djphantom.com' },
      { id: 'cr2', name: 'Ali Kaya', role: 'sound_engineer', phone: '+90 533 222 3344', email: 'ali@djphantom.com' },
      { id: 'cr3', name: 'Zeynep Demir', role: 'tour_manager', phone: '+90 534 333 4455', email: 'zeynep@djphantom.com' },
    ],
    // YENİ: Rider'lar
    riders: {
      technical: {
        stage: {
          minWidth: 8,
          minDepth: 6,
          minHeight: 4,
          roofRequired: true,
          backlineProvided: false,
          instrumentList: [],
        },
        sound: {
          systemType: 'line_array',
          minPower: 10000,
          monitors: 2,
          inEarMonitors: 1,
          mixerChannels: 16,
          specificBrands: ['Pioneer', 'Allen & Heath'],
        },
        lighting: {
          movingHeadCount: 12,
          ledBarCount: 8,
          strobeCount: 4,
          hazeRequired: true,
          followSpotRequired: false,
          ledWallSize: '3x2m',
        },
        power: {
          totalKW: 30,
          phases: 3,
          backupGeneratorRequired: false,
        },
        timing: {
          loadInHours: 2,
          soundCheckHours: 1,
          loadOutHours: 1,
        },
        notes: 'DJ booth minimum 2x1.5m olmalı. CDJ-3000 ve DJM-900NXS2 tercih edilir.',
      },
      transport: {
        airportTransfer: {
          required: true,
          vehicleType: 'sedan',
          passengerCount: 3,
          luggageNote: '2 büyük bavul + DJ ekipman çantası',
        },
        localTransport: {
          required: true,
          vehicleType: 'sedan',
          availableHours: '16:00-04:00',
        },
        notes: 'Şoför İngilizce bilmeli.',
      },
      accommodation: {
        artistRooms: {
          count: 1,
          type: 'suite',
          minStarRating: 4,
          bedType: 'king',
        },
        crewRooms: {
          count: 2,
          type: 'standard',
          minStarRating: 4,
        },
        checkIn: '14:00',
        checkOut: '12:00',
        lateCheckOut: true,
        meals: {
          breakfast: true,
          dietaryRestrictions: [],
        },
        maxDistanceToVenue: 15,
        notes: 'Sessiz oda tercih edilir.',
      },
    },
    riderDocuments: [
      { id: 'rd1', type: 'technical', fileName: 'DJ_Phantom_Technical_Rider_v3.pdf', fileSize: 1250000, fileType: 'pdf', uploadedAt: '2024-03-15', version: 3, url: '/documents/rd1.pdf' },
      { id: 'rd2', type: 'transport', fileName: 'DJ_Phantom_Transport_Requirements.pdf', fileSize: 450000, fileType: 'pdf', uploadedAt: '2024-03-15', version: 1, url: '/documents/rd2.pdf' },
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
      spotifyMonthly: '5.2M',
      youtubeSubscribers: '1.8M',
      instagramFollowers: '1.2M',
      totalStreams: '450M',
    },
    bookingAgency: {
      id: 'booking1',
      name: 'Prime Artist Management',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
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
    // YENİ: Ekip Üyeleri
    crew: [
      { id: 'cr4', name: 'Selin Arslan', role: 'manager', phone: '+90 535 111 2233', email: 'selin@elifdeniz.com' },
      { id: 'cr5', name: 'Burak Yıldız', role: 'sound_engineer', phone: '+90 536 222 3344', email: 'burak@elifdeniz.com' },
      { id: 'cr6', name: 'Ayşe Korkmaz', role: 'lighting_designer', phone: '+90 537 333 4455', email: 'ayse@elifdeniz.com' },
      { id: 'cr7', name: 'Emre Tan', role: 'tour_manager', phone: '+90 538 444 5566', email: 'emre@elifdeniz.com' },
      { id: 'cr8', name: 'Deniz Çelik', role: 'musician', phone: '+90 539 555 6677', notes: 'Klavyeci' },
      { id: 'cr9', name: 'Can Öztürk', role: 'musician', phone: '+90 530 666 7788', notes: 'Gitarist' },
      { id: 'cr10', name: 'Merve Acar', role: 'backup_vocal', phone: '+90 531 777 8899' },
      { id: 'cr11', name: 'Gizem Şen', role: 'backup_vocal', phone: '+90 532 888 9900' },
    ],
    // YENİ: Rider'lar
    riders: {
      technical: {
        stage: {
          minWidth: 12,
          minDepth: 10,
          minHeight: 8,
          roofRequired: true,
          backlineProvided: true,
          instrumentList: ['Yamaha Grand Piano', 'Fender Rhodes', 'Bass Amp (Ampeg)', 'Guitar Amp (Fender Twin)'],
        },
        sound: {
          systemType: 'line_array',
          minPower: 15000,
          monitors: 8,
          inEarMonitors: 6,
          mixerChannels: 48,
          specificBrands: ['d&b audiotechnik', 'L-Acoustics'],
        },
        lighting: {
          movingHeadCount: 24,
          ledBarCount: 16,
          strobeCount: 6,
          hazeRequired: true,
          followSpotRequired: true,
          ledWallSize: '6x4m',
          specificRequirements: ['Minimum 2 follow spot', 'Truss sistemi gerekli'],
        },
        power: {
          totalKW: 60,
          phases: 3,
          backupGeneratorRequired: true,
        },
        timing: {
          loadInHours: 6,
          soundCheckHours: 3,
          loadOutHours: 3,
        },
        notes: 'Sahne monitör mühendisi sanatçı tarafından sağlanacaktır. FOH mühendisi venue tarafından sağlanabilir.',
      },
      transport: {
        airportTransfer: {
          required: true,
          vehicleType: 'sprinter',
          passengerCount: 10,
          luggageNote: 'Ekip ve enstrüman taşıması için geniş bagaj alanı gerekli',
        },
        localTransport: {
          required: true,
          vehicleType: 'sprinter',
          availableHours: '10:00-02:00',
        },
        crewTransport: {
          vehicleType: 'minibus',
          passengerCount: 8,
        },
        notes: 'VIP araç tercihen Mercedes V-Class veya Sprinter.',
      },
      accommodation: {
        artistRooms: {
          count: 2,
          type: 'suite',
          minStarRating: 5,
          bedType: 'king',
        },
        crewRooms: {
          count: 6,
          type: 'deluxe',
          minStarRating: 4,
        },
        checkIn: '14:00',
        checkOut: '12:00',
        earlyCheckIn: true,
        lateCheckOut: true,
        meals: {
          breakfast: true,
          lunch: true,
          dinner: true,
          dietaryRestrictions: ['Vejetaryen seçenek olmalı'],
        },
        maxDistanceToVenue: 10,
        notes: 'Tüm odalar aynı katta olmalı. Fitness merkezi ve spa erişimi.',
      },
      backstage: {
        dressingRoom: {
          count: 2,
          privateRequired: true,
          amenities: ['Ayna (aydınlatmalı)', 'Koltuk', 'Masa', 'Klima', 'Özel tuvalet'],
        },
        catering: {
          hotMeals: true,
          coldMeals: true,
          beverages: ['Su (Erikli)', 'Taze sıkım meyve suyu', 'Çay', 'Türk kahvesi', 'Filtre kahve'],
          snacks: ['Taze meyve tabağı', 'Kuruyemiş', 'Çikolata', 'Sandviçler'],
          alcoholPolicy: 'none',
          dietaryRestrictions: ['Fıstık alerjisi - fıstık içeren ürün olmamalı'],
        },
        other: {
          towels: 20,
          bathrobeRequired: true,
          ironRequired: true,
          wifiRequired: true,
        },
        notes: 'Soyunma odası sahneye yakın olmalı. Çiçek ve mum yasak (alerji).',
      },
    },
    riderDocuments: [
      { id: 'rd3', type: 'technical', fileName: 'Elif_Deniz_Technical_Rider_2024.pdf', fileSize: 2500000, fileType: 'pdf', uploadedAt: '2024-01-10', version: 2, url: '/documents/rd3.pdf' },
      { id: 'rd4', type: 'accommodation', fileName: 'Elif_Deniz_Hospitality_Rider.pdf', fileSize: 800000, fileType: 'pdf', uploadedAt: '2024-01-10', version: 1, url: '/documents/rd4.pdf' },
      { id: 'rd5', type: 'backstage', fileName: 'Elif_Deniz_Backstage_Requirements.pdf', fileSize: 650000, fileType: 'pdf', uploadedAt: '2024-01-10', version: 1, url: '/documents/rd5.pdf' },
      { id: 'rd6', type: 'transport', fileName: 'Elif_Deniz_Transport_Rider.pdf', fileSize: 500000, fileType: 'pdf', uploadedAt: '2024-01-10', version: 1, url: '/documents/rd6.pdf' },
    ],
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
      spotifyMonthly: '8.5M',
      youtubeSubscribers: '2.8M',
      instagramFollowers: '3.5M',
      totalStreams: '1.2B',
    },
    bookingAgency: {
      id: 'booking2',
      name: 'Rock Management Turkey',
      logo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100',
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
    crew: [
      { id: 'cr12', name: 'Ozan Baysal', role: 'manager', phone: '+90 532 999 1122', email: 'ozan@duman.com' },
      { id: 'cr13', name: 'Batuhan Mutlugil', role: 'musician', notes: 'Gitarist - Grup üyesi' },
      { id: 'cr14', name: 'Ari Barokas', role: 'musician', notes: 'Basçı - Grup üyesi' },
      { id: 'cr15', name: 'Cengiz Baysal', role: 'sound_engineer', phone: '+90 533 888 2233' },
      { id: 'cr16', name: 'Hakan Yılmaz', role: 'lighting_designer', phone: '+90 534 777 3344' },
      { id: 'cr17', name: 'Serkan Aksu', role: 'tour_manager', phone: '+90 535 666 4455' },
    ],
    riders: {
      technical: {
        stage: {
          minWidth: 14,
          minDepth: 12,
          minHeight: 10,
          roofRequired: true,
          backlineProvided: true,
          instrumentList: ['Drum Kit (DW)', 'Bass Amp (Ampeg SVT)', 'Guitar Amp (Marshall JCM800)', 'Acoustic Guitar'],
        },
        sound: {
          systemType: 'line_array',
          minPower: 25000,
          monitors: 10,
          inEarMonitors: 4,
          mixerChannels: 56,
          specificBrands: ['d&b audiotechnik', 'Meyer Sound'],
        },
        lighting: {
          movingHeadCount: 32,
          ledBarCount: 20,
          strobeCount: 8,
          hazeRequired: true,
          followSpotRequired: true,
          ledWallSize: '8x5m',
        },
        power: {
          totalKW: 80,
          phases: 3,
          backupGeneratorRequired: true,
        },
        timing: {
          loadInHours: 8,
          soundCheckHours: 4,
          loadOutHours: 4,
        },
        notes: 'Işık ve ses sistemleri sanatçı teknik ekibi tarafından kontrol edilecektir.',
      },
    },
    riderDocuments: [
      { id: 'rd7', type: 'technical', fileName: 'Duman_Technical_Rider_2024.pdf', fileSize: 3200000, fileType: 'pdf', uploadedAt: '2024-02-20', version: 4, url: '/documents/rd7.pdf' },
    ],
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
      spotifyMonthly: '450K',
      youtubeSubscribers: '85K',
      instagramFollowers: '120K',
      totalStreams: '15M',
    },
    bookingAgency: {
      id: 'booking3',
      name: 'Electronic Artists Agency',
      logo: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100',
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
    crew: [
      { id: 'cr18', name: 'Ceren Yıldırım', role: 'manager', phone: '+90 536 111 5566', email: 'ceren@djmerva.com' },
    ],
    riders: {
      technical: {
        stage: {
          minWidth: 4,
          minDepth: 3,
          roofRequired: false,
          backlineProvided: false,
        },
        sound: {
          systemType: 'any',
          minPower: 5000,
          monitors: 2,
          mixerChannels: 8,
          specificBrands: ['Pioneer'],
        },
        lighting: {
          movingHeadCount: 4,
          ledBarCount: 4,
          hazeRequired: true,
          followSpotRequired: false,
        },
        power: {
          totalKW: 15,
          phases: 1,
          backupGeneratorRequired: false,
        },
        timing: {
          loadInHours: 1,
          soundCheckHours: 0.5,
          loadOutHours: 0.5,
        },
        notes: 'CDJ-2000NXS2 veya CDJ-3000 + DJM-900NXS2 gerekli.',
      },
    },
    riderDocuments: [
      { id: 'rd8', type: 'technical', fileName: 'DJ_Merva_Technical_Rider.pdf', fileSize: 680000, fileType: 'pdf', uploadedAt: '2024-04-01', version: 1, url: '/documents/rd8.pdf' },
    ],
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
      spotifyMonthly: '50K',
      instagramFollowers: '25K',
    },
    bookingAgency: {
      id: 'booking1',
      name: 'Prime Artist Management',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
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
    crew: [
      { id: 'cr19', name: 'Mehmet Demir', role: 'manager', phone: '+90 537 222 6677', email: 'mehmet@coverband.com' },
      { id: 'cr20', name: 'Kemal Yılmaz', role: 'musician', notes: 'Klavyeci' },
      { id: 'cr21', name: 'Sevgi Arslan', role: 'backup_vocal' },
    ],
    riders: {},
    riderDocuments: [],
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

// Rider kontrolü
export function getArtistRiderStatus(artist: Artist): {
  technical: boolean;
  transport: boolean;
  accommodation: boolean;
  backstage: boolean;
  completionRate: number;
} {
  const riders = artist.riders || {};
  const technical = !!riders.technical;
  const transport = !!riders.transport;
  const accommodation = !!riders.accommodation;
  const backstage = !!riders.backstage;

  const completed = [technical, transport, accommodation, backstage].filter(Boolean).length;
  const completionRate = Math.round((completed / 4) * 100);

  return { technical, transport, accommodation, backstage, completionRate };
}

// Sanatçı için rider dokümanı getir
export function getArtistRiderDocuments(artistId: string, type?: RiderDocument['type']): RiderDocument[] {
  const artist = getArtistById(artistId);
  if (!artist) return [];

  if (type) {
    return artist.riderDocuments.filter(d => d.type === type);
  }
  return artist.riderDocuments;
}

// Stats
export function getArtistStats() {
  const totalArtists = mockArtists.length;
  const activeArtists = mockArtists.filter(a => a.status === 'active').length;
  const availableArtists = mockArtists.filter(a => a.availability === 'available').length;
  const upcomingShows = mockArtists.reduce((acc, a) => acc + a.upcomingShows.length, 0);
  const totalRevenue = mockContracts.filter(c => c.status === 'signed').reduce((acc, c) => acc + c.fee, 0);

  // Rider tamamlanma oranları
  const riderStats = mockArtists.reduce((acc, artist) => {
    const status = getArtistRiderStatus(artist);
    return {
      withTechnical: acc.withTechnical + (status.technical ? 1 : 0),
      withTransport: acc.withTransport + (status.transport ? 1 : 0),
      withAccommodation: acc.withAccommodation + (status.accommodation ? 1 : 0),
      withBackstage: acc.withBackstage + (status.backstage ? 1 : 0),
    };
  }, { withTechnical: 0, withTransport: 0, withAccommodation: 0, withBackstage: 0 });

  return {
    totalArtists,
    activeArtists,
    availableArtists,
    upcomingShows,
    totalRevenue,
    pendingContracts: mockContracts.filter(c => c.status === 'sent').length,
    riderStats,
  };
}
