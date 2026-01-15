// =============================================================================
// MEKAN VERİ HAVUZU - Admin tarafından yönetilebilir mekan listesi
// =============================================================================
// Bu dosya tüm etkinlik mekanlarını içerir
// Mekan kategorileri: stadyum, arena, acik-hava, kapali-salon, otel, kongre-merkezi,
// antik-tiyatro, bar-club, kultur-merkezi, universite, festival-alani, beach-club

// =============================================================================
// TİP TANIMLARI
// =============================================================================

export type VenueType =
  | 'stadyum'
  | 'arena'
  | 'acik-hava'
  | 'kapali-salon'
  | 'otel'
  | 'kongre-merkezi'
  | 'antik-tiyatro'
  | 'bar-club'
  | 'kultur-merkezi'
  | 'universite'
  | 'festival-alani'
  | 'beach-club'
  | 'tiyatro'
  | 'avm'
  | 'diger';

export type VenueStatus = 'aktif' | 'pasif' | 'bakim' | 'kapali';

export interface VenueCapacity {
  seated?: number;
  standing?: number;
  total: number;
}

export interface VenueContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface VenueLocation {
  city: string;
  district: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  location: VenueLocation;
  capacity: VenueCapacity;
  contact?: VenueContact;
  description?: string;
  amenities?: string[];
  images?: string[];
  rating?: number;
  status: VenueStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// MEKAN VERİSİ
// =============================================================================

export const venues: Venue[] = [
  // =====================================================================
  // STADYUMLAR
  // =====================================================================
  {
    id: 'VEN_STD_001',
    name: 'Vodafone Park (Tüpraş Stadyumu)',
    type: 'stadyum',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Vişnezade, Dolmabahçe Cd. No:1, 34357 Beşiktaş/İstanbul',
      coordinates: { lat: 41.0392, lng: 29.0010 },
    },
    capacity: { seated: 42590, total: 42590 },
    contact: { website: 'https://www.bjk.com.tr' },
    description: 'Beşiktaş JK stadyumu, konser ve büyük etkinlikler için ideal',
    amenities: ['VIP Loca', 'Basın Odası', 'Catering', 'Otopark'],
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_STD_002',
    name: 'RAMS Park',
    type: 'stadyum',
    location: {
      city: 'İstanbul',
      district: 'Sarıyer',
      address: 'Seyrantepe, Türk Telekom Arena, 34396 Sarıyer/İstanbul',
      coordinates: { lat: 41.1034, lng: 28.9946 },
    },
    capacity: { seated: 53978, total: 53978 },
    contact: { website: 'https://www.galatasaray.org' },
    description: 'Galatasaray SK stadyumu, Türkiye\'nin en büyük kapasiteli stadyumu',
    amenities: ['VIP Loca', 'Basın Odası', 'Catering', 'Otopark', 'Metro Bağlantısı'],
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_STD_003',
    name: 'Fenerbahçe Şükrü Saracoğlu Stadyumu',
    type: 'stadyum',
    location: {
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Bağdat Cad, Kızıltoprak, No:2, 34724 Kadıköy/İstanbul',
      coordinates: { lat: 40.9878, lng: 29.0371 },
    },
    capacity: { seated: 50530, total: 50530 },
    contact: { website: 'https://www.fenerbahce.org' },
    description: 'Fenerbahçe SK stadyumu, UEFA 4 yıldızlı stadyum',
    amenities: ['VIP Loca', 'Basın Odası', 'Catering', 'Otopark'],
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_STD_004',
    name: 'Diyarbakır Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Diyarbakır',
      district: 'Kayapınar',
      address: 'Peyas Mah. Stadyum Cad., Kayapınar/Diyarbakır',
    },
    capacity: { seated: 33000, total: 33000 },
    description: 'Diyarbakırspor ev sahipliği stadyumu',
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_STD_005',
    name: 'İTÜ Stadyumu',
    type: 'stadyum',
    location: {
      city: 'İstanbul',
      district: 'Sarıyer',
      address: 'Maslak, İTÜ Ayazağa Yerleşkesi, Sarıyer/İstanbul',
    },
    capacity: { seated: 32000, total: 32000 },
    description: 'İstanbul Teknik Üniversitesi stadyumu',
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ARENALAR / KAPALI SPOR SALONLARI
  // =====================================================================
  {
    id: 'VEN_ARN_001',
    name: 'Sinan Erdem Spor Salonu',
    type: 'arena',
    location: {
      city: 'İstanbul',
      district: 'Bakırköy',
      address: 'Zuhuratbaba, Ataköy Blv. No:14, 34147 Bakırköy/İstanbul',
      coordinates: { lat: 40.9872, lng: 28.8347 },
    },
    capacity: { seated: 16000, standing: 22500, total: 22500 },
    contact: { website: 'https://www.sinanerdemdome.com' },
    description: 'Türkiye\'nin en büyük kapalı spor ve etkinlik salonu',
    amenities: ['VIP Loca', 'Catering', 'Otopark', 'Metro Bağlantısı'],
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ARN_002',
    name: 'Ülker Spor ve Etkinlik Salonu',
    type: 'arena',
    location: {
      city: 'İstanbul',
      district: 'Ataşehir',
      address: 'Barbaros Mah. Ihlamur Sok., 34746 Ataşehir/İstanbul',
      coordinates: { lat: 40.9842, lng: 29.1281 },
    },
    capacity: { seated: 13059, standing: 15000, total: 15000 },
    contact: { website: 'https://www.ulkerspor.com' },
    description: 'Fenerbahçe Basketbol ev sahipliği, konser ve etkinlikler',
    amenities: ['VIP Loca', 'Catering', 'Otopark'],
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ARN_003',
    name: 'Volkswagen Arena',
    type: 'arena',
    location: {
      city: 'İstanbul',
      district: 'Sarıyer',
      address: 'Huzur Mahallesi, Maslak Ayazağa Caddesi, No: 4A, 34396 Sarıyer/İstanbul',
      coordinates: { lat: 41.1072, lng: 29.0178 },
    },
    capacity: { seated: 4500, standing: 6500, total: 6500 },
    contact: { website: 'https://www.vwarena.com' },
    description: 'İstanbul\'un premium konser arenası',
    amenities: ['VIP Loca', 'Premium Bar', 'Catering', 'Otopark'],
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ARN_004',
    name: 'Ankara Arena',
    type: 'arena',
    location: {
      city: 'Ankara',
      district: 'Altındağ',
      address: 'Hipodrom Caddesi No:2, 06050 Altındağ/Ankara',
    },
    capacity: { seated: 10400, total: 10400 },
    description: 'Ankara\'nın en büyük kapalı etkinlik salonu',
    amenities: ['VIP Loca', 'Catering', 'Otopark'],
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ARN_005',
    name: 'Tofaş Spor Salonu',
    type: 'arena',
    location: {
      city: 'Bursa',
      district: 'Nilüfer',
      address: 'Ataevler Mah., Nilüfer/Bursa',
    },
    capacity: { seated: 7500, total: 7500 },
    description: 'Tofaş Basketbol ev sahipliği salonu',
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // AÇIK HAVA MEKANLARI
  // =====================================================================
  {
    id: 'VEN_ACK_001',
    name: 'KüçükÇiftlik Park',
    type: 'acik-hava',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Harbiye Mah. Kadırgalar Cad. No:5, 34367 Maçka/İstanbul',
      coordinates: { lat: 41.0456, lng: 28.9947 },
    },
    capacity: { standing: 17000, total: 17000 },
    contact: { website: 'https://www.kucukciftlik.com' },
    description: 'İstanbul\'un en popüler açık hava konser alanı',
    amenities: ['VIP Alan', 'Bar', 'Yiyecek Alanları', 'Tuvalet'],
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ACK_002',
    name: 'Harbiye Cemil Topuzlu Açıkhava Tiyatrosu',
    type: 'acik-hava',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Harbiye, Taşkışla Cd. No:8, 34367 Şişli/İstanbul',
      coordinates: { lat: 41.0469, lng: 28.9906 },
    },
    capacity: { seated: 4000, total: 4500 },
    contact: { website: 'https://www.ibb.istanbul' },
    description: 'İstanbul\'un tarihi açık hava tiyatrosu, yaz konserleri için ideal',
    amenities: ['Sahne', 'Soyunma Odaları', 'Tuvalet'],
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ACK_003',
    name: 'Kuruçeşme Açıkhava',
    type: 'acik-hava',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Kuruçeşme, Beşiktaş/İstanbul',
    },
    capacity: { standing: 3500, total: 3500 },
    description: 'Boğaz manzaralı açık hava konser alanı',
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ACK_004',
    name: 'BtcTurk Vadi Açıkhava',
    type: 'acik-hava',
    location: {
      city: 'İstanbul',
      district: 'Sarıyer',
      address: 'Vadistanbul, Ayazağa/Sarıyer/İstanbul',
    },
    capacity: { standing: 10000, total: 10000 },
    description: 'Vadistanbul\'daki modern açık hava etkinlik alanı',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ACK_005',
    name: 'Antalya Açıkhava',
    type: 'acik-hava',
    location: {
      city: 'Antalya',
      district: 'Muratpaşa',
      address: 'Konyaaltı Sahil Şeridi, Sahil Antalya Yaşam Parkı No:18, Muratpaşa/Antalya',
    },
    capacity: { seated: 4000, total: 4000 },
    description: 'Antalya\'nın deniz manzaralı açık hava sahnesi',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ACK_006',
    name: 'Çeşme Açıkhava Tiyatrosu',
    type: 'acik-hava',
    location: {
      city: 'İzmir',
      district: 'Çeşme',
      address: 'Çeşme Kalesi Yanı, Çeşme/İzmir',
    },
    capacity: { seated: 3000, total: 3000 },
    description: 'Çeşme Kalesi yanındaki tarihi açık hava tiyatrosu',
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ANTİK TİYATROLAR
  // =====================================================================
  {
    id: 'VEN_ANT_001',
    name: 'Aspendos Antik Tiyatro',
    type: 'antik-tiyatro',
    location: {
      city: 'Antalya',
      district: 'Serik',
      address: 'Sarıabalı Mahallesi, Aspendos Yolu, 07500 Serik/Antalya',
      coordinates: { lat: 36.9389, lng: 31.1719 },
    },
    capacity: { seated: 15000, total: 15000 },
    description: 'Dünyanın en iyi korunmuş Roma tiyatrosu, muhteşem akustik',
    amenities: ['Tarihi Alan', 'Otopark', 'Turist Rehberi'],
    rating: 5.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANT_002',
    name: 'Efes Antik Tiyatrosu',
    type: 'antik-tiyatro',
    location: {
      city: 'İzmir',
      district: 'Selçuk',
      address: 'Atatürk Mah., 35920 Selçuk/İzmir',
      coordinates: { lat: 37.9394, lng: 27.3417 },
    },
    capacity: { seated: 24000, total: 24000 },
    description: 'Antik dünyanın en büyük tiyatrolarından biri',
    amenities: ['Tarihi Alan', 'Otopark', 'Müze'],
    rating: 5.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANT_003',
    name: 'Bodrum Antik Tiyatro',
    type: 'antik-tiyatro',
    location: {
      city: 'Muğla',
      district: 'Bodrum',
      address: 'Yeniköy, Kıbrıs Şehitleri Cad., 48400 Bodrum/Muğla',
      coordinates: { lat: 37.0339, lng: 27.4256 },
    },
    capacity: { seated: 4000, total: 4000 },
    description: 'Bodrum\'un tarihi antik tiyatrosu, deniz manzaralı',
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANT_004',
    name: 'Hierapolis Antik Kenti',
    type: 'antik-tiyatro',
    location: {
      city: 'Denizli',
      district: 'Pamukkale',
      address: 'Pamukkale, Denizli',
    },
    capacity: { seated: 12000, total: 12000 },
    description: 'Pamukkale\'deki UNESCO Dünya Mirası antik tiyatro',
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // PERFORMANS SALONLARI / KONSER MEKANLARI
  // =====================================================================
  {
    id: 'VEN_PRF_001',
    name: 'Zorlu PSM - Turkcell Sahnesi',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Levazım Mah. Koru Sok. No:2, 34340 Zincirlikuyu/Beşiktaş/İstanbul',
      coordinates: { lat: 41.0678, lng: 29.0172 },
    },
    capacity: { seated: 2190, total: 2190 },
    contact: { website: 'https://www.zorlupsm.com' },
    description: 'İstanbul\'un premium performans sanatları merkezi',
    amenities: ['VIP Loca', 'Restaurant', 'Bar', 'Otopark'],
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_PRF_002',
    name: 'Zorlu PSM - Drama Sahnesi',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Levazım Mah. Koru Sok. No:2, 34340 Zincirlikuyu/Beşiktaş/İstanbul',
    },
    capacity: { seated: 742, total: 742 },
    contact: { website: 'https://www.zorlupsm.com' },
    description: 'Zorlu PSM drama ve tiyatro sahnesi',
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_PRF_003',
    name: 'Babylon',
    type: 'bar-club',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Merkez, Silahşör Caddesi & Birahane Sokak, Tarihi Bomonti Bira Fabrikası No:1, 34384 Şişli/İstanbul',
      coordinates: { lat: 41.0578, lng: 28.9778 },
    },
    capacity: { standing: 1000, total: 1000 },
    contact: { website: 'https://www.babylon.com.tr' },
    description: 'İstanbul\'un efsanevi canlı müzik mekanı',
    amenities: ['Bar', 'Sahne', 'Yiyecek Servisi'],
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_PRF_004',
    name: 'DasDas',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Ataşehir',
      address: 'Atatürk, Ataşehir Boulevard, 34758 Ataşehir/İstanbul (Metropol İstanbul AVM içi)',
    },
    capacity: { seated: 550, standing: 1300, total: 1300 },
    description: 'Modern performans ve konser salonu',
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_PRF_005',
    name: 'Bostancı Gösteri Merkezi',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Bostancı, Bostanlararası Sokağı No:8, 34744 Kadıköy/İstanbul',
    },
    capacity: { seated: 2377, standing: 6000, total: 6000 },
    description: 'Anadolu Yakası\'nın en büyük gösteri merkezi',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_PRF_006',
    name: 'Maximum UNIQ Hall',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Sarıyer',
      address: 'Huzur Mah. Maslak Ayazağa Cad. No.4, Sarıyer/İstanbul',
    },
    capacity: { seated: 1156, total: 1156 },
    description: 'Premium tiyatro ve konser salonu',
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_PRF_007',
    name: 'IF Performance Hall Beşiktaş',
    type: 'bar-club',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Cihannuma, Hasfırın Cd. No:26, 34353 Beşiktaş/İstanbul',
    },
    capacity: { standing: 400, total: 400 },
    description: 'Alternatif müzik ve performans mekanı',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_PRF_008',
    name: 'IF Performance Hall Ankara',
    type: 'bar-club',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Kavaklıdere, Tunus Cd 14/A, 06410 Çankaya/Ankara',
    },
    capacity: { standing: 1200, total: 1200 },
    description: 'Ankara\'nın önde gelen canlı müzik mekanı',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_PRF_009',
    name: 'Ahmed Adnan Saygun Sanat Merkezi',
    type: 'kapali-salon',
    location: {
      city: 'İzmir',
      district: 'Konak',
      address: 'Mithatpaşa Caddesi 1087, 35290 Güzelyalı/Konak/İzmir',
    },
    capacity: { seated: 1150, total: 1150 },
    contact: { website: 'https://www.aassm.org.tr' },
    description: 'İzmir\'in prestijli sanat ve konser merkezi',
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_PRF_010',
    name: 'CSO Ada Ankara - Ana Salon',
    type: 'kapali-salon',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Söğütözü, Söğütözü Cd. No:1, 06510 Çankaya/Ankara',
    },
    capacity: { seated: 2023, total: 2023 },
    description: 'Cumhurbaşkanlığı Senfoni Orkestrası konser salonu',
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // KONGRE MERKEZLERİ
  // =====================================================================
  {
    id: 'VEN_KNG_001',
    name: 'Haliç Kongre Merkezi',
    type: 'kongre-merkezi',
    location: {
      city: 'İstanbul',
      district: 'Beyoğlu',
      address: 'Sütlüce Mah. Karaağaç Cd. No:48, 34445 Beyoğlu/İstanbul',
      coordinates: { lat: 41.0456, lng: 28.9589 },
    },
    capacity: { seated: 3008, total: 10000 },
    contact: { website: 'https://halic.com' },
    description: 'İstanbul\'un merkezi kongre ve etkinlik merkezi',
    amenities: ['Çoklu Salon', 'Catering', 'Otopark', 'Teknik Ekipman'],
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_KNG_002',
    name: 'Lütfi Kırdar Kongre ve Sergi Sarayı',
    type: 'kongre-merkezi',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Harbiye, Darülbedai Cad., 34367 Şişli/İstanbul',
    },
    capacity: { seated: 2000, total: 5000 },
    contact: { website: 'https://icec.org' },
    description: 'Harbiye\'deki tarihi kongre merkezi',
    amenities: ['Çoklu Salon', 'Catering', 'Otopark'],
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_KNG_003',
    name: 'Congresium Ankara',
    type: 'kongre-merkezi',
    location: {
      city: 'Ankara',
      district: 'Söğütözü',
      address: 'Söğütözü Caddesi No: 1/A, 06510 Ankara',
    },
    capacity: { seated: 3200, total: 10000 },
    contact: { website: 'https://www.congresium.com' },
    description: 'Ankara\'nın en büyük kongre ve fuar merkezi',
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_KNG_004',
    name: 'İstanbul Kongre Merkezi',
    type: 'kongre-merkezi',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Harbiye, Taşkışla Cad., Şişli/İstanbul',
    },
    capacity: { seated: 2400, total: 6000 },
    description: 'Harbiye\'deki modern kongre merkezi',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // JOLLY JOKER ZİNCİRİ
  // =====================================================================
  {
    id: 'VEN_JJ_001',
    name: 'Jolly Joker Vadistanbul',
    type: 'bar-club',
    location: {
      city: 'İstanbul',
      district: 'Sarıyer',
      address: 'Vadistanbul AVM, Ayazağa Cendere Cad. 109/C, Sarıyer/İstanbul',
    },
    capacity: { standing: 2000, total: 2000 },
    description: 'Jolly Joker zincirinin Vadistanbul şubesi',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_JJ_002',
    name: 'JJ Arena',
    type: 'bar-club',
    location: {
      city: 'İstanbul',
      district: 'Ataşehir',
      address: 'Watergarden AVM, Ataşehir/İstanbul',
    },
    capacity: { standing: 3500, total: 3500 },
    description: 'Jolly Joker\'ın en büyük mekanı',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_JJ_003',
    name: 'Jolly Joker Ankara',
    type: 'bar-club',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Kızılay, Ankara',
    },
    capacity: { standing: 1200, total: 1200 },
    description: 'Jolly Joker\'ın Ankara şubesi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_JJ_004',
    name: 'Jolly Joker Bursa',
    type: 'bar-club',
    location: {
      city: 'Bursa',
      district: 'Nilüfer',
      address: 'Nilüfer, Bursa',
    },
    capacity: { standing: 800, total: 800 },
    description: 'Jolly Joker\'ın Bursa şubesi',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_JJ_005',
    name: 'Jolly Joker Adana',
    type: 'bar-club',
    location: {
      city: 'Adana',
      district: 'Seyhan',
      address: 'Seyhan, Adana',
    },
    capacity: { standing: 1000, total: 1000 },
    description: 'Jolly Joker\'ın Adana şubesi',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_JJ_006',
    name: 'Jolly Joker Mersin',
    type: 'bar-club',
    location: {
      city: 'Mersin',
      district: 'Yenişehir',
      address: 'Yenişehir, Mersin',
    },
    capacity: { standing: 800, total: 800 },
    description: 'Jolly Joker\'ın Mersin şubesi',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_JJ_007',
    name: 'Jolly Joker Gaziantep',
    type: 'bar-club',
    location: {
      city: 'Gaziantep',
      district: 'Şehitkamil',
      address: 'Şehitkamil, Gaziantep',
    },
    capacity: { standing: 900, total: 900 },
    description: 'Jolly Joker\'ın Gaziantep şubesi',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_JJ_008',
    name: 'Jolly Joker Denizli',
    type: 'bar-club',
    location: {
      city: 'Denizli',
      district: 'Merkezefendi',
      address: 'Merkezefendi, Denizli',
    },
    capacity: { standing: 700, total: 700 },
    description: 'Jolly Joker\'ın Denizli şubesi',
    rating: 4.1,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // HAYAL KAHVESİ ZİNCİRİ
  // =====================================================================
  {
    id: 'VEN_HK_001',
    name: 'Hayal Kahvesi Ankara',
    type: 'bar-club',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Tunalı Hilmi Cad., Çankaya/Ankara',
    },
    capacity: { standing: 500, total: 500 },
    description: 'Hayal Kahvesi\'nin Ankara şubesi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_HK_002',
    name: 'Hayal Kahvesi İzmir',
    type: 'bar-club',
    location: {
      city: 'İzmir',
      district: 'Konak',
      address: 'Alsancak, Konak/İzmir',
    },
    capacity: { standing: 600, total: 600 },
    description: 'Hayal Kahvesi\'nin İzmir şubesi',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_HK_003',
    name: 'Hayal Kahvesi Bursa',
    type: 'bar-club',
    location: {
      city: 'Bursa',
      district: 'Osmangazi',
      address: 'Osmangazi, Bursa',
    },
    capacity: { standing: 400, total: 400 },
    description: 'Hayal Kahvesi\'nin Bursa şubesi',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_HK_004',
    name: 'Hayal Kahvesi Antalya',
    type: 'bar-club',
    location: {
      city: 'Antalya',
      district: 'Muratpaşa',
      address: 'Konyaaltı, Muratpaşa/Antalya',
    },
    capacity: { standing: 500, total: 500 },
    description: 'Hayal Kahvesi\'nin Antalya şubesi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // KÜLTÜR MERKEZLERİ
  // =====================================================================
  {
    id: 'VEN_KLT_001',
    name: 'AKM - Atatürk Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'İstanbul',
      district: 'Beyoğlu',
      address: 'Gümüşsuyu, Taksim Meydanı, Beyoğlu/İstanbul',
    },
    capacity: { seated: 2500, total: 2500 },
    description: 'İstanbul\'un yenilenen kültür merkezi, opera ve bale sahnesi',
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_KLT_002',
    name: 'CRR Konser Salonu',
    type: 'kultur-merkezi',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Harbiye, Şişli/İstanbul',
    },
    capacity: { seated: 864, total: 864 },
    description: 'Cemal Reşit Rey Konser Salonu',
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // FESTİVAL ALANLARI
  // =====================================================================
  {
    id: 'VEN_FST_001',
    name: 'Zeytinli Rock Festival Alanı',
    type: 'festival-alani',
    location: {
      city: 'Balıkesir',
      district: 'Edremit',
      address: 'Akçay-Dalyan Sahili, Zeytinli Mahallesi, Edremit/Balıkesir',
    },
    capacity: { standing: 40000, total: 40000 },
    description: 'Türkiye\'nin en büyük rock festivali alanı',
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_FST_002',
    name: 'Bonus Parkorman',
    type: 'festival-alani',
    location: {
      city: 'İstanbul',
      district: 'Sarıyer',
      address: 'Maslak, Sarıyer/İstanbul',
    },
    capacity: { standing: 30000, total: 30000 },
    description: 'İstanbul\'un büyük açık hava festival alanı',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // BEACH CLUB / PLAJ MEKANLARI
  // =====================================================================
  {
    id: 'VEN_BCH_001',
    name: 'Suma Beach',
    type: 'beach-club',
    location: {
      city: 'İstanbul',
      district: 'Sarıyer',
      address: 'Kilyos, Sarıyer/İstanbul',
    },
    capacity: { standing: 5000, total: 5000 },
    description: 'İstanbul\'un popüler beach club\'ı',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_BCH_002',
    name: 'Milyon Beach Kilyos',
    type: 'beach-club',
    location: {
      city: 'İstanbul',
      district: 'Sarıyer',
      address: 'Kilyos, Sarıyer/İstanbul',
    },
    capacity: { standing: 3000, total: 3000 },
    description: 'Kilyos\'taki modern beach club',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // İZMİR MEKANLARI
  // =====================================================================
  {
    id: 'VEN_IZM_001',
    name: 'İzmir Arena',
    type: 'arena',
    location: {
      city: 'İzmir',
      district: 'Bayraklı',
      address: 'Turan, 1649. Sk. No:107, 35540 Bayraklı/İzmir',
    },
    capacity: { standing: 15000, total: 15000 },
    description: 'İzmir\'in en büyük etkinlik kompleksi',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IZM_002',
    name: 'Fuar İzmir',
    type: 'festival-alani',
    location: {
      city: 'İzmir',
      district: 'Gaziemir',
      address: 'Zafer Mah. 840 Sk. Fuar Alanı No:2, 35410 Gaziemir/İzmir',
    },
    capacity: { total: 50000 },
    description: 'İzmir Enternasyonal Fuar Alanı',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ANTALYA MEKANLARI
  // =====================================================================
  {
    id: 'VEN_ANT_005',
    name: 'Gloria Sports Arena',
    type: 'arena',
    location: {
      city: 'Antalya',
      district: 'Serik',
      address: 'Belek Mah. Turizm Cad. No: 4B/1, 07506 Serik/Antalya',
    },
    capacity: { seated: 1200, total: 5000 },
    description: 'Belek\'teki uluslararası spor ve etkinlik kompleksi',
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANT_006',
    name: 'The Land of Legends',
    type: 'festival-alani',
    location: {
      city: 'Antalya',
      district: 'Serik',
      address: 'Belek, Serik/Antalya',
    },
    capacity: { total: 10000 },
    description: 'Tema park ve etkinlik kompleksi',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // İSTANBUL - TİYATROLAR VE SAHNELER (EK)
  // =====================================================================
  {
    id: 'VEN_TYT_001',
    name: 'İş Sanat Konser Salonu',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Pınarbaşı Mah. Büyükdere Cad. İş Kuleleri No:4, 34330 Levent/İstanbul',
      coordinates: { lat: 41.0784, lng: 29.0103 },
    },
    capacity: { seated: 780, total: 780 },
    contact: { website: 'https://www.issanat.com.tr' },
    description: 'İş Sanat bünyesinde klasik müzik ve caz konserleri',
    amenities: ['VIP Loca', 'Cafe', 'Otopark'],
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TYT_002',
    name: 'Süreyya Operası',
    type: 'tiyatro',
    location: {
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Caferağa Mah. Bahariye Cad. No:29, 34710 Kadıköy/İstanbul',
      coordinates: { lat: 40.9891, lng: 29.0278 },
    },
    capacity: { seated: 570, total: 570 },
    contact: { website: 'https://www.sureyyaoperasi.org' },
    description: 'Tarihi opera binası, opera, bale ve konserler',
    amenities: ['Tarihi Bina', 'Cafe'],
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TYT_003',
    name: 'Moda Sahnesi',
    type: 'bar-club',
    location: {
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Caferağa Mah. Moda Cad. No:136, 34710 Kadıköy/İstanbul',
    },
    capacity: { standing: 350, total: 350 },
    description: 'Kadıköy\'ün alternatif müzik sahnesi',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TYT_004',
    name: 'Zorlu PSM Studio',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Levazım Mah. Koru Sok. No:2, Zorlu Center, 34340 Beşiktaş/İstanbul',
    },
    capacity: { seated: 210, total: 210 },
    contact: { website: 'https://www.zorlupsm.com' },
    description: 'Zorlu PSM\'nin küçük ve samimi sahnesi',
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TYT_005',
    name: 'Trump Sahne',
    type: 'bar-club',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Trump Towers, Kuştepe Mah. Mecidiyeköy Yolu Cad. No:12, Şişli/İstanbul',
    },
    capacity: { standing: 1500, total: 1500 },
    description: 'Trump Towers\'daki büyük etkinlik mekanı',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TYT_006',
    name: 'Pera Müzesi Oditoryum',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Beyoğlu',
      address: 'Asmalımescit Mah. Meşrutiyet Cad. No:65, 34430 Beyoğlu/İstanbul',
    },
    capacity: { seated: 290, total: 290 },
    contact: { website: 'https://www.peramuzesi.org.tr' },
    description: 'Pera Müzesi bünyesinde konser ve etkinlik salonu',
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TYT_007',
    name: 'Salon İKSV',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Beyoğlu',
      address: 'Sadi Konuralp Cad. No:5, Şişhane, 34433 Beyoğlu/İstanbul',
    },
    capacity: { seated: 200, standing: 750, total: 750 },
    contact: { website: 'https://www.iksv.org' },
    description: 'İKSV\'nin canlı müzik mekanı',
    amenities: ['Bar', 'Cafe'],
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TYT_008',
    name: 'Ghetto',
    type: 'bar-club',
    location: {
      city: 'İstanbul',
      district: 'Beyoğlu',
      address: 'Kamer Hatun Mah. Hayriye Cad. No:10, Galata, 34425 Beyoğlu/İstanbul',
    },
    capacity: { standing: 300, total: 300 },
    description: 'Galata\'nın underground müzik mekanı',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TYT_009',
    name: 'Klein Garden',
    type: 'bar-club',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Harbiye Mah. Cumhuriyet Cad. No:30, Şişli/İstanbul',
    },
    capacity: { standing: 800, total: 800 },
    description: 'Harbiye\'deki elektronik müzik mekanı',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TYT_010',
    name: 'Dorock XL Kadıköy',
    type: 'bar-club',
    location: {
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Caferağa Mah. Moda Cad. No:46, 34710 Kadıköy/İstanbul',
    },
    capacity: { standing: 600, total: 600 },
    description: 'Rock ve metal müzik odaklı konser mekanı',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TYT_011',
    name: 'Bronx',
    type: 'bar-club',
    location: {
      city: 'İstanbul',
      district: 'Beyoğlu',
      address: 'Asmalımescit Mah. Sofyalı Sok. No:8, 34430 Beyoğlu/İstanbul',
    },
    capacity: { standing: 250, total: 250 },
    description: 'Asmalımescit\'in caz ve blues mekanı',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TYT_012',
    name: 'Nardis Jazz Club',
    type: 'bar-club',
    location: {
      city: 'İstanbul',
      district: 'Beyoğlu',
      address: 'Kuledibi Sok. No:14, Galata, 34421 Beyoğlu/İstanbul',
    },
    capacity: { seated: 80, total: 80 },
    description: 'İstanbul\'un efsanevi caz kulübü',
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TYT_013',
    name: 'Kadıköy Halk Eğitim Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Caferağa Mah. Moda Cad. No:25, 34710 Kadıköy/İstanbul',
    },
    capacity: { seated: 450, total: 450 },
    description: 'Kadıköy\'ün toplum etkinlikleri salonu',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TYT_014',
    name: 'Turkcell Platinum Sahne',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Süzer Plaza, Elmadag, Şişli/İstanbul',
    },
    capacity: { seated: 350, total: 500 },
    description: 'Premium müzik etkinlikleri mekanı',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TYT_015',
    name: 'HOT',
    type: 'bar-club',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Abide-i Hürriyet Cad. No:211, Şişli/İstanbul',
    },
    capacity: { standing: 500, total: 500 },
    description: 'Pop ve dans müziği konserleri',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // İSTANBUL - OTELLER VE KONGRE (EK)
  // =====================================================================
  {
    id: 'VEN_OTL_001',
    name: 'Hilton Istanbul Bosphorus',
    type: 'otel',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Harbiye Mah. Cumhuriyet Cad. No:50, 34367 Şişli/İstanbul',
      coordinates: { lat: 41.0477, lng: 28.9920 },
    },
    capacity: { seated: 2000, total: 3000 },
    contact: { website: 'https://www.hilton.com' },
    description: 'İstanbul\'un ikonik oteli, geniş balo salonu ve bahçe',
    amenities: ['Balo Salonu', 'Bahçe', 'Catering', 'Otopark', 'Konaklama'],
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_OTL_002',
    name: 'Swissotel The Bosphorus',
    type: 'otel',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Vişnezade Mah. Acısu Sok. No:19, 34357 Beşiktaş/İstanbul',
      coordinates: { lat: 41.0431, lng: 29.0108 },
    },
    capacity: { seated: 1200, total: 1800 },
    contact: { website: 'https://www.swissotel.com' },
    description: 'Boğaz manzaralı lüks otel ve etkinlik mekanı',
    amenities: ['Balo Salonu', 'Teras', 'Catering', 'Otopark', 'Spa'],
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_OTL_003',
    name: 'Four Seasons Hotel Bosphorus',
    type: 'otel',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Çırağan Cad. No:28, 34349 Beşiktaş/İstanbul',
      coordinates: { lat: 41.0460, lng: 29.0238 },
    },
    capacity: { seated: 400, total: 600 },
    contact: { website: 'https://www.fourseasons.com' },
    description: 'Ultra lüks Boğaz kıyısı düğün ve etkinlik mekanı',
    amenities: ['Boğaz Manzarası', 'Bahçe', 'Catering', 'Valet'],
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_OTL_004',
    name: 'Çırağan Palace Kempinski',
    type: 'otel',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Çırağan Cad. No:32, 34349 Beşiktaş/İstanbul',
      coordinates: { lat: 41.0452, lng: 29.0213 },
    },
    capacity: { seated: 800, total: 1200 },
    contact: { website: 'https://www.kempinski.com' },
    description: 'Tarihi Osmanlı sarayında ultra lüks etkinlikler',
    amenities: ['Tarihi Saray', 'Boğaz Manzarası', 'Catering', 'Valet'],
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_OTL_005',
    name: 'Raffles Istanbul',
    type: 'otel',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Levazım Mah. Zorlu Center, 34340 Beşiktaş/İstanbul',
    },
    capacity: { seated: 600, total: 900 },
    contact: { website: 'https://www.raffles.com' },
    description: 'Zorlu Center\'daki ultra lüks otel',
    amenities: ['Balo Salonu', 'Spa', 'Catering', 'Otopark'],
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_OTL_006',
    name: 'The Ritz-Carlton Istanbul',
    type: 'otel',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Suzer Plaza, Elmadag Asker Ocagi Cad. No:6, 34367 Şişli/İstanbul',
    },
    capacity: { seated: 500, total: 700 },
    contact: { website: 'https://www.ritzcarlton.com' },
    description: 'Boğaz manzaralı lüks otel ve etkinlik mekanı',
    amenities: ['Boğaz Manzarası', 'Balo Salonu', 'Spa', 'Catering'],
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_OTL_007',
    name: 'Conrad Istanbul Bosphorus',
    type: 'otel',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Cihannüma Mah. Saray Cad. No:5, 34353 Beşiktaş/İstanbul',
    },
    capacity: { seated: 700, total: 1000 },
    contact: { website: 'https://www.conradhotels.com' },
    description: 'Beşiktaş\'ta Boğaz manzaralı kongre oteli',
    amenities: ['Balo Salonu', 'Teras', 'Catering', 'Otopark'],
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_OTL_008',
    name: 'Grand Hyatt Istanbul',
    type: 'otel',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Taşkışla Cad. No:1, Taksim, 34437 Şişli/İstanbul',
    },
    capacity: { seated: 800, total: 1200 },
    contact: { website: 'https://www.hyatt.com' },
    description: 'Taksim\'in büyük kongre oteli',
    amenities: ['Balo Salonu', 'Toplantı Odaları', 'Catering', 'Spa'],
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_OTL_009',
    name: 'JW Marriott Istanbul Marmara Sea',
    type: 'otel',
    location: {
      city: 'İstanbul',
      district: 'Beylikdüzü',
      address: 'Cumhuriyet Mah. Bağlantı Yolu Cad. No:1, 34520 Beylikdüzü/İstanbul',
    },
    capacity: { seated: 1500, total: 2500 },
    contact: { website: 'https://www.marriott.com' },
    description: 'İstanbul\'un en büyük kongre otellerinden biri',
    amenities: ['Büyük Balo Salonu', 'Kongre Merkezi', 'Otopark', 'Spa'],
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_OTL_010',
    name: 'Fairmont Quasar Istanbul',
    type: 'otel',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Büyükdere Cad. No:8, 34394 Mecidiyeköy/İstanbul',
    },
    capacity: { seated: 600, total: 800 },
    contact: { website: 'https://www.fairmont.com' },
    description: 'Mecidiyeköy\'ün modern iş oteli',
    amenities: ['Balo Salonu', 'Toplantı Odaları', 'Spa'],
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_OTL_011',
    name: 'St. Regis Istanbul',
    type: 'otel',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Mim Kemal Öke Cad. No:35, 34367 Nişantaşı/İstanbul',
    },
    capacity: { seated: 300, total: 400 },
    contact: { website: 'https://www.stregis.com' },
    description: 'Nişantaşı\'nın butik lüks oteli',
    amenities: ['Balo Salonu', 'Spa', 'Catering'],
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ANKARA MEKANLARI (EK)
  // =====================================================================
  {
    id: 'VEN_ANK_001',
    name: 'MEB Şura Salonu',
    type: 'kongre-merkezi',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Bakanlıklar, Atatürk Bulvarı, 06648 Çankaya/Ankara',
    },
    capacity: { seated: 1600, total: 1600 },
    description: 'Milli Eğitim Bakanlığı\'nın büyük konferans salonu',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANK_002',
    name: 'Bilkent ODEON',
    type: 'kapali-salon',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Bilkent Üniversitesi, 06800 Bilkent/Ankara',
    },
    capacity: { seated: 500, total: 500 },
    contact: { website: 'https://www.bilkent.edu.tr' },
    description: 'Bilkent Üniversitesi konser ve tiyatro salonu',
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANK_003',
    name: 'Bilkent Konser Salonu',
    type: 'kapali-salon',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Bilkent Üniversitesi, 06800 Bilkent/Ankara',
    },
    capacity: { seated: 1500, total: 1500 },
    contact: { website: 'https://www.bilkent.edu.tr' },
    description: 'Bilkent\'in büyük senfoni orkestrası salonu',
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANK_004',
    name: 'Cer Modern',
    type: 'kultur-merkezi',
    location: {
      city: 'Ankara',
      district: 'Altındağ',
      address: 'Altınsoy Cad. No:3, 06050 Altındağ/Ankara',
      coordinates: { lat: 39.9339, lng: 32.8541 },
    },
    capacity: { seated: 400, standing: 1000, total: 1000 },
    contact: { website: 'https://www.cermodern.org' },
    description: 'Çağdaş sanat merkezi ve etkinlik alanı',
    amenities: ['Sergi Alanı', 'Cafe', 'Açık Alan'],
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANK_005',
    name: 'ODTÜ Kültür ve Kongre Merkezi',
    type: 'kongre-merkezi',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'ODTÜ Kampüsü, Üniversiteler Mah., 06800 Çankaya/Ankara',
    },
    capacity: { seated: 1800, total: 1800 },
    contact: { website: 'https://www.odtu.edu.tr' },
    description: 'ODTÜ\'nün büyük kongre ve konser merkezi',
    amenities: ['Büyük Salon', 'Toplantı Odaları', 'Otopark'],
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANK_006',
    name: 'Ankara Devlet Opera ve Balesi',
    type: 'tiyatro',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Opera Meydanı, Ulus, 06050 Ankara',
    },
    capacity: { seated: 900, total: 900 },
    description: 'Türkiye\'nin ilk devlet opera binası',
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANK_007',
    name: 'Hacettepe Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Hacettepe Üniversitesi, Beytepe Kampüsü, Çankaya/Ankara',
    },
    capacity: { seated: 800, total: 800 },
    description: 'Hacettepe Üniversitesi kültür merkezi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANK_008',
    name: 'Nazım Hikmet Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Çankaya Belediyesi, Ankara',
    },
    capacity: { seated: 500, total: 500 },
    description: 'Çankaya\'nın kültür ve sanat merkezi',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANK_009',
    name: 'Ankara Açıkhava Tiyatrosu',
    type: 'acik-hava',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Atatürk Orman Çiftliği, Ankara',
    },
    capacity: { seated: 3000, total: 3000 },
    description: 'Ankara\'nın yaz konserleri mekanı',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANK_010',
    name: 'Beğendik Düğün ve Davet',
    type: 'otel',
    location: {
      city: 'Ankara',
      district: 'Etimesgut',
      address: 'Etimesgut, Ankara',
    },
    capacity: { seated: 2000, total: 2500 },
    description: 'Ankara\'nın büyük düğün salonu',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANK_011',
    name: 'Sheraton Ankara',
    type: 'otel',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Noktali Sok. No:1, 06700 Kavaklıdere/Ankara',
    },
    capacity: { seated: 800, total: 1200 },
    contact: { website: 'https://www.marriott.com' },
    description: 'Ankara\'nın köklü kongre oteli',
    amenities: ['Balo Salonu', 'Toplantı Odaları', 'Otopark'],
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANK_012',
    name: 'JW Marriott Ankara',
    type: 'otel',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Kızılırmak Mah. Muhsin Yazıcıoğlu Cad. No:1, 06520 Çankaya/Ankara',
    },
    capacity: { seated: 1000, total: 1500 },
    contact: { website: 'https://www.marriott.com' },
    description: 'Ankara\'nın en yeni lüks oteli',
    amenities: ['Büyük Balo Salonu', 'Spa', 'Otopark'],
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // İZMİR MEKANLARI (EK)
  // =====================================================================
  {
    id: 'VEN_IZM_003',
    name: 'Kültürpark Açıkhava Tiyatrosu',
    type: 'acik-hava',
    location: {
      city: 'İzmir',
      district: 'Konak',
      address: 'Kültürpark, Alsancak, 35220 Konak/İzmir',
    },
    capacity: { seated: 5000, total: 5000 },
    description: 'İzmir\'in tarihi açık hava konser alanı',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IZM_004',
    name: 'İzmir Devlet Opera ve Balesi',
    type: 'tiyatro',
    location: {
      city: 'İzmir',
      district: 'Konak',
      address: 'Konak Mah. Milli Kütüphane Cad. No:2, 35250 Konak/İzmir',
    },
    capacity: { seated: 700, total: 700 },
    description: 'İzmir\'in devlet opera binası',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IZM_005',
    name: 'İzmir Atatürk Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'İzmir',
      district: 'Konak',
      address: 'Konak Meydanı, 35250 Konak/İzmir',
    },
    capacity: { seated: 800, total: 800 },
    description: 'İzmir\'in merkezi kültür merkezi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IZM_006',
    name: 'Tepekule Kongre ve Sergi Merkezi',
    type: 'kongre-merkezi',
    location: {
      city: 'İzmir',
      district: 'Bayraklı',
      address: 'Tepekule İş Merkezi, Bayraklı/İzmir',
    },
    capacity: { seated: 1500, total: 2000 },
    contact: { website: 'https://www.tepekule.com.tr' },
    description: 'İzmir\'in modern kongre merkezi',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IZM_007',
    name: 'Bostanlı Suat Taşer Açıkhava',
    type: 'acik-hava',
    location: {
      city: 'İzmir',
      district: 'Karşıyaka',
      address: 'Bostanlı, Karşıyaka/İzmir',
    },
    capacity: { seated: 3000, total: 3000 },
    description: 'Karşıyaka\'nın açık hava konser alanı',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IZM_008',
    name: 'Bergama Antik Tiyatro',
    type: 'antik-tiyatro',
    location: {
      city: 'İzmir',
      district: 'Bergama',
      address: 'Bergama Akropol, 35700 Bergama/İzmir',
      coordinates: { lat: 39.1333, lng: 27.1833 },
    },
    capacity: { seated: 10000, total: 10000 },
    description: 'UNESCO Dünya Mirası listesindeki antik tiyatro',
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IZM_009',
    name: 'Swissotel Büyük Efes İzmir',
    type: 'otel',
    location: {
      city: 'İzmir',
      district: 'Konak',
      address: 'Gaziosmanpasa Bulvarı No:1, 35210 Alsancak/İzmir',
    },
    capacity: { seated: 1200, total: 1800 },
    contact: { website: 'https://www.swissotel.com' },
    description: 'İzmir\'in en büyük kongre oteli',
    amenities: ['Balo Salonu', 'Teras', 'Otopark', 'Spa'],
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IZM_010',
    name: 'Alaçatı Wine Republic',
    type: 'bar-club',
    location: {
      city: 'İzmir',
      district: 'Çeşme',
      address: '17100 Sok. No:8, 35937 Alaçatı/Çeşme/İzmir',
    },
    capacity: { standing: 500, total: 500 },
    description: 'Alaçatı\'nın popüler açık hava mekanı',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IZM_011',
    name: 'Alaçatı Surf Paradise',
    type: 'beach-club',
    location: {
      city: 'İzmir',
      district: 'Çeşme',
      address: 'Alaçatı Liman Mevkii, 35937 Çeşme/İzmir',
    },
    capacity: { standing: 1500, total: 1500 },
    description: 'Sörf ve plaj partileri mekanı',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ANTALYA MEKANLARI (EK)
  // =====================================================================
  {
    id: 'VEN_ANT_007',
    name: 'Antalya Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Antalya',
      district: 'Muratpaşa',
      address: 'Deniz Mah. Atatürk Cad. No:20, 07100 Muratpaşa/Antalya',
    },
    capacity: { seated: 1200, total: 1200 },
    description: 'Antalya\'nın merkezi kültür ve konser salonu',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANT_008',
    name: 'Side Antik Tiyatrosu',
    type: 'antik-tiyatro',
    location: {
      city: 'Antalya',
      district: 'Manavgat',
      address: 'Side Antik Kenti, 07330 Manavgat/Antalya',
      coordinates: { lat: 36.7672, lng: 31.3903 },
    },
    capacity: { seated: 15000, total: 15000 },
    description: 'Side\'nin iyi korunmuş Roma tiyatrosu',
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANT_009',
    name: 'Regnum Carya Golf & Spa Resort',
    type: 'otel',
    location: {
      city: 'Antalya',
      district: 'Serik',
      address: 'İleribaşı Mevkii, 07525 Belek/Serik/Antalya',
    },
    capacity: { seated: 2000, total: 3000 },
    contact: { website: 'https://www.regnum.com.tr' },
    description: 'Belek\'in lüks kongre ve etkinlik oteli',
    amenities: ['Büyük Kongre Salonu', 'Beach', 'Golf', 'Spa'],
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANT_010',
    name: 'Maxx Royal Belek Golf Resort',
    type: 'otel',
    location: {
      city: 'Antalya',
      district: 'Serik',
      address: 'İskele Mevkii, 07506 Belek/Serik/Antalya',
    },
    capacity: { seated: 1500, total: 2000 },
    contact: { website: 'https://www.maxxroyal.com' },
    description: 'Ultra lüks Belek tatil köyü',
    amenities: ['Plaj', 'Kongre Salonu', 'Golf', 'Spa'],
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANT_011',
    name: 'Titanic Deluxe Belek',
    type: 'otel',
    location: {
      city: 'Antalya',
      district: 'Serik',
      address: 'Üçkum Tepesi Mevkii, 07506 Belek/Serik/Antalya',
    },
    capacity: { seated: 1800, total: 2500 },
    contact: { website: 'https://www.titanic.com.tr' },
    description: 'Belek\'in mega tatil köyü',
    amenities: ['Kongre Merkezi', 'Beach', 'Aquapark'],
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANT_012',
    name: 'Kemer Moonlight Arena',
    type: 'acik-hava',
    location: {
      city: 'Antalya',
      district: 'Kemer',
      address: 'Kemer Marina, 07980 Kemer/Antalya',
    },
    capacity: { standing: 5000, total: 5000 },
    description: 'Kemer\'in yaz konserleri mekanı',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANT_013',
    name: 'Alanya Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Antalya',
      district: 'Alanya',
      address: 'Çarşı Mah. İskele Cad. No:10, 07400 Alanya/Antalya',
    },
    capacity: { seated: 600, total: 600 },
    description: 'Alanya\'nın merkezi etkinlik salonu',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANT_014',
    name: 'EXPO 2016 Antalya Alanı',
    type: 'festival-alani',
    location: {
      city: 'Antalya',
      district: 'Aksu',
      address: 'EXPO 2016 Alanı, Aksu/Antalya',
    },
    capacity: { total: 50000 },
    description: 'EXPO 2016 mirası büyük etkinlik alanı',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // MUĞLA MEKANLARI (EK)
  // =====================================================================
  {
    id: 'VEN_MGL_001',
    name: 'Bodrum Halikarnassos',
    type: 'bar-club',
    location: {
      city: 'Muğla',
      district: 'Bodrum',
      address: 'Cumhuriyet Cad. No:178, 48400 Bodrum/Muğla',
    },
    capacity: { standing: 5000, total: 5000 },
    description: 'Bodrum\'un efsanevi gece kulübü',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_MGL_002',
    name: 'Xuma Beach Club',
    type: 'beach-club',
    location: {
      city: 'Muğla',
      district: 'Bodrum',
      address: 'Yalıkavak Marina, 48990 Yalıkavak/Bodrum/Muğla',
    },
    capacity: { standing: 2000, total: 2000 },
    description: 'Yalıkavak\'ın lüks beach club\'ı',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_MGL_003',
    name: 'Lujo Hotel Beach Club',
    type: 'beach-club',
    location: {
      city: 'Muğla',
      district: 'Bodrum',
      address: 'Güvercinlik Mah., 48990 Bodrum/Muğla',
    },
    capacity: { standing: 1500, total: 1500 },
    description: 'Ultra lüks otel plaj kulübü',
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_MGL_004',
    name: 'Marmaris Amfi Tiyatro',
    type: 'acik-hava',
    location: {
      city: 'Muğla',
      district: 'Marmaris',
      address: 'Kenan Evren Bulvarı, 48700 Marmaris/Muğla',
    },
    capacity: { seated: 4000, total: 4000 },
    description: 'Marmaris\'in açık hava konser alanı',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_MGL_005',
    name: 'Fethiye Ölüdeniz Beach',
    type: 'beach-club',
    location: {
      city: 'Muğla',
      district: 'Fethiye',
      address: 'Ölüdeniz, 48340 Fethiye/Muğla',
    },
    capacity: { standing: 3000, total: 3000 },
    description: 'Ölüdeniz plaj etkinlik alanı',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_MGL_006',
    name: 'D-Marin Turgutreis',
    type: 'otel',
    location: {
      city: 'Muğla',
      district: 'Bodrum',
      address: 'Turgutreis Marina, 48960 Turgutreis/Bodrum/Muğla',
    },
    capacity: { seated: 500, total: 800 },
    description: 'Turgutreis marina etkinlik alanı',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_MGL_007',
    name: 'Datça Amfi Tiyatro',
    type: 'acik-hava',
    location: {
      city: 'Muğla',
      district: 'Datça',
      address: 'Datça Merkez, 48900 Datça/Muğla',
    },
    capacity: { seated: 2000, total: 2000 },
    description: 'Datça\'nın yaz festivalleri mekanı',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // BURSA MEKANLARI (EK)
  // =====================================================================
  {
    id: 'VEN_BRS_001',
    name: 'Merinos AKKM',
    type: 'kongre-merkezi',
    location: {
      city: 'Bursa',
      district: 'Osmangazi',
      address: 'Merinos, Atatürk Kongre Kültür Merkezi, 16050 Osmangazi/Bursa',
    },
    capacity: { seated: 3500, total: 5000 },
    contact: { website: 'https://www.merinosakkm.com' },
    description: 'Bursa\'nın en büyük kongre ve etkinlik merkezi',
    amenities: ['Ana Salon', 'Sergi Alanı', 'Otopark'],
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_BRS_002',
    name: 'Bursa Açıkhava Tiyatrosu',
    type: 'acik-hava',
    location: {
      city: 'Bursa',
      district: 'Osmangazi',
      address: 'Kültürpark, Osmangazi/Bursa',
    },
    capacity: { seated: 4500, total: 4500 },
    description: 'Bursa\'nın tarihi açık hava sahnesi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_BRS_003',
    name: 'Nilüfer Belediyesi Tiyatro Salonu',
    type: 'tiyatro',
    location: {
      city: 'Bursa',
      district: 'Nilüfer',
      address: 'Nilüfer Belediyesi, İhsaniye Mah., Nilüfer/Bursa',
    },
    capacity: { seated: 450, total: 450 },
    description: 'Nilüfer\'in tiyatro ve konser salonu',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_BRS_004',
    name: 'Bursa Timsah Arena',
    type: 'stadyum',
    location: {
      city: 'Bursa',
      district: 'Osmangazi',
      address: 'Kükürtlü Mah. Timsah Arena, 16080 Osmangazi/Bursa',
      coordinates: { lat: 40.2217, lng: 28.9033 },
    },
    capacity: { seated: 43877, total: 43877 },
    description: 'Bursaspor stadyumu, konserler için de kullanılır',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_BRS_005',
    name: 'Crowne Plaza Bursa',
    type: 'otel',
    location: {
      city: 'Bursa',
      district: 'Osmangazi',
      address: 'Santral Garaj Mah. Ulubatlı Hasan Bulvarı No:2, 16060 Osmangazi/Bursa',
    },
    capacity: { seated: 800, total: 1200 },
    description: 'Bursa\'nın büyük kongre oteli',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ESKİŞEHİR MEKANLARI
  // =====================================================================
  {
    id: 'VEN_ESK_001',
    name: 'Anadolu Üniversitesi Kongre Merkezi',
    type: 'kongre-merkezi',
    location: {
      city: 'Eskişehir',
      district: 'Tepebaşı',
      address: 'Anadolu Üniversitesi Kampüsü, 26470 Tepebaşı/Eskişehir',
    },
    capacity: { seated: 2000, total: 2000 },
    description: 'Anadolu Üniversitesi\'nin büyük kongre merkezi',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ESK_002',
    name: 'Haller Gençlik Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Eskişehir',
      district: 'Odunpazarı',
      address: 'Haller, Odunpazarı/Eskişehir',
    },
    capacity: { standing: 2500, total: 2500 },
    description: 'Eskişehir\'in konser ve etkinlik merkezi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ESK_003',
    name: 'Taşbaşı Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Eskişehir',
      district: 'Odunpazarı',
      address: 'Odunpazarı Evleri, Odunpazarı/Eskişehir',
    },
    capacity: { seated: 400, total: 400 },
    description: 'Tarihi bölgede butik etkinlik mekanı',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ESK_004',
    name: 'Eskişehir Atatürk Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Eskişehir',
      district: 'Tepebaşı',
      address: '71 Evler Mah. Yeni Stadyum, 26180 Tepebaşı/Eskişehir',
    },
    capacity: { seated: 34930, total: 34930 },
    description: 'Eskişehirspor stadyumu',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // KOCAELİ MEKANLARI
  // =====================================================================
  {
    id: 'VEN_KCL_001',
    name: 'Gebze Kongre Merkezi',
    type: 'kongre-merkezi',
    location: {
      city: 'Kocaeli',
      district: 'Gebze',
      address: 'Gebze Belediyesi, Gebze/Kocaeli',
    },
    capacity: { seated: 1500, total: 1500 },
    description: 'Gebze\'nin kongre ve etkinlik merkezi',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_KCL_002',
    name: 'İzmit Uluslararası Fuar Alanı',
    type: 'festival-alani',
    location: {
      city: 'Kocaeli',
      district: 'İzmit',
      address: 'Karabaş Mah. İzmit/Kocaeli',
    },
    capacity: { total: 30000 },
    description: 'Kocaeli\'nin büyük fuar ve etkinlik alanı',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // GAZİANTEP MEKANLARI
  // =====================================================================
  {
    id: 'VEN_GZT_001',
    name: 'Gaziantep Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Gaziantep',
      district: 'Şehitkamil',
      address: 'Karataş Mah. Gaziantep Stadyumu, 27110 Şehitkamil/Gaziantep',
      coordinates: { lat: 37.0569, lng: 37.3500 },
    },
    capacity: { seated: 35574, total: 35574 },
    description: 'Gaziantep\'in yeni stadyumu',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_GZT_002',
    name: 'Gaziantep Kongre Merkezi',
    type: 'kongre-merkezi',
    location: {
      city: 'Gaziantep',
      district: 'Şahinbey',
      address: 'Şahinbey/Gaziantep',
    },
    capacity: { seated: 2000, total: 2500 },
    description: 'Gaziantep\'in modern kongre merkezi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_GZT_003',
    name: 'Sanko Park AVM Etkinlik Alanı',
    type: 'avm',
    location: {
      city: 'Gaziantep',
      district: 'Şehitkamil',
      address: 'Sanko Park AVM, Şehitkamil/Gaziantep',
    },
    capacity: { standing: 1500, total: 1500 },
    description: 'AVM etkinlik ve konser alanı',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // KONYA MEKANLARI
  // =====================================================================
  {
    id: 'VEN_KNY_001',
    name: 'Konya Büyükşehir Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Konya',
      district: 'Selçuklu',
      address: 'Yazır Mah. Konya Büyükşehir Stadyumu, 42130 Selçuklu/Konya',
      coordinates: { lat: 37.9087, lng: 32.5149 },
    },
    capacity: { seated: 42276, total: 42276 },
    description: 'Konyaspor stadyumu, büyük konserler için uygun',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_KNY_002',
    name: 'Mevlana Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Konya',
      district: 'Karatay',
      address: 'Karatay/Konya',
    },
    capacity: { seated: 3000, total: 3000 },
    description: 'Mevlana etkinlikleri ve konserler için',
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_KNY_003',
    name: 'Konya Fuar Merkezi',
    type: 'kongre-merkezi',
    location: {
      city: 'Konya',
      district: 'Selçuklu',
      address: 'Selçuklu/Konya',
    },
    capacity: { total: 20000 },
    description: 'Konya fuar ve sergi merkezi',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ADANA MEKANLARI
  // =====================================================================
  {
    id: 'VEN_ADN_001',
    name: 'Yeni Adana Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Adana',
      district: 'Yüreğir',
      address: 'Kiremithane Mah. Yeni Adana Stadyumu, 01220 Yüreğir/Adana',
      coordinates: { lat: 36.9867, lng: 35.3400 },
    },
    capacity: { seated: 33543, total: 33543 },
    description: 'Adana\'nın yeni modern stadyumu',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ADN_002',
    name: 'Seyhan Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Adana',
      district: 'Seyhan',
      address: 'Seyhan/Adana',
    },
    capacity: { seated: 800, total: 800 },
    description: 'Adana\'nın merkezi kültür salonu',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ADN_003',
    name: 'Çukurova Üniversitesi Mithat Özsan Amfi',
    type: 'acik-hava',
    location: {
      city: 'Adana',
      district: 'Sarıçam',
      address: 'Çukurova Üniversitesi Kampüsü, 01330 Sarıçam/Adana',
    },
    capacity: { seated: 5000, total: 5000 },
    description: 'Üniversite kampüsünde açık hava amfi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // MERSİN MEKANLARI
  // =====================================================================
  {
    id: 'VEN_MRS_001',
    name: 'Mersin Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Mersin',
      district: 'Toroslar',
      address: 'Yeni Mahalle, Mersin Stadyumu, 33210 Toroslar/Mersin',
      coordinates: { lat: 36.8283, lng: 34.6300 },
    },
    capacity: { seated: 25534, total: 25534 },
    description: 'Akdeniz Oyunları için yapılan modern stadyum',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_MRS_002',
    name: 'Mersin Kongre Merkezi',
    type: 'kongre-merkezi',
    location: {
      city: 'Mersin',
      district: 'Yenişehir',
      address: 'Yenişehir/Mersin',
    },
    capacity: { seated: 2000, total: 2500 },
    description: 'Mersin\'in modern kongre merkezi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // SAMSUN MEKANLARI
  // =====================================================================
  {
    id: 'VEN_SMS_001',
    name: 'Samsunspor Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Samsun',
      district: 'Atakum',
      address: '19 Mayıs Stadyumu, 55200 Atakum/Samsun',
      coordinates: { lat: 41.2800, lng: 36.3333 },
    },
    capacity: { seated: 33919, total: 33919 },
    description: 'Samsunspor\'un modern stadyumu',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_SMS_002',
    name: 'Atatürk Kültür Merkezi Samsun',
    type: 'kultur-merkezi',
    location: {
      city: 'Samsun',
      district: 'İlkadım',
      address: 'İlkadım/Samsun',
    },
    capacity: { seated: 1200, total: 1200 },
    description: 'Samsun\'un merkezi kültür salonu',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // TRABZON MEKANLARI
  // =====================================================================
  {
    id: 'VEN_TRB_001',
    name: 'Şenol Güneş Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Trabzon',
      district: 'Ortahisar',
      address: 'Akyazı Mah. Şenol Güneş Stadyumu, 61080 Ortahisar/Trabzon',
      coordinates: { lat: 41.0027, lng: 39.7500 },
    },
    capacity: { seated: 41461, total: 41461 },
    description: 'Trabzonspor\'un modern stadyumu',
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TRB_002',
    name: 'Trabzon Kongre Merkezi',
    type: 'kongre-merkezi',
    location: {
      city: 'Trabzon',
      district: 'Ortahisar',
      address: 'Ortahisar/Trabzon',
    },
    capacity: { seated: 1500, total: 1800 },
    description: 'Trabzon\'un kongre ve etkinlik merkezi',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // KAYSERİ MEKANLARI
  // =====================================================================
  {
    id: 'VEN_KYS_001',
    name: 'Kadir Has Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Kayseri',
      district: 'Kocasinan',
      address: 'Kadir Has Stadyumu, 38090 Kocasinan/Kayseri',
      coordinates: { lat: 38.6917, lng: 35.5333 },
    },
    capacity: { seated: 32864, total: 32864 },
    description: 'Kayserispor stadyumu',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_KYS_002',
    name: 'Kayseri Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Kayseri',
      district: 'Melikgazi',
      address: 'Melikgazi/Kayseri',
    },
    capacity: { seated: 1000, total: 1000 },
    description: 'Kayseri\'nin merkezi kültür salonu',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // DİĞER ANADOLU ŞEHİRLERİ
  // =====================================================================
  {
    id: 'VEN_MLT_001',
    name: 'Malatya İnönü Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Malatya',
      district: 'Yeşilyurt',
      address: 'Yeni Malatya Stadyumu, 44900 Yeşilyurt/Malatya',
    },
    capacity: { seated: 28500, total: 28500 },
    description: 'Malatyaspor\'un modern stadyumu',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ERZ_001',
    name: 'Kazım Karabekir Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Erzurum',
      district: 'Yakutiye',
      address: 'Kazım Karabekir Stadyumu, 25100 Yakutiye/Erzurum',
    },
    capacity: { seated: 25000, total: 25000 },
    description: 'Erzurumspor stadyumu',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_VAN_001',
    name: 'Van Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Van',
      district: 'Tusba',
      address: 'Van Stadyumu, 65100 Tusba/Van',
    },
    capacity: { seated: 20000, total: 20000 },
    description: 'Van\'ın modern stadyumu',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_DNZ_001',
    name: 'Denizli Atatürk Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Denizli',
      district: 'Merkezefendi',
      address: 'Denizli Stadyumu, 20100 Merkezefendi/Denizli',
    },
    capacity: { seated: 22000, total: 22000 },
    description: 'Denizlispor stadyumu',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ANT_015',
    name: 'Antalya Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Antalya',
      district: 'Kepez',
      address: 'Antalya Stadyumu, 07090 Kepez/Antalya',
    },
    capacity: { seated: 32537, total: 32537 },
    description: 'Antalyaspor stadyumu',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_KPD_001',
    name: 'Kapadokya Açık Hava Müzesi Alanı',
    type: 'festival-alani',
    location: {
      city: 'Nevşehir',
      district: 'Göreme',
      address: 'Göreme Açık Hava Müzesi, 50180 Göreme/Nevşehir',
    },
    capacity: { total: 10000 },
    description: 'Kapadokya\'nın eşsiz etkinlik alanı',
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_KPD_002',
    name: 'Kapadokya Kültür ve Sanat Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Nevşehir',
      district: 'Ürgüp',
      address: 'Ürgüp, 50400 Nevşehir',
    },
    capacity: { seated: 500, total: 500 },
    description: 'Kapadokya\'nın kültür merkezi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // SAKARYA MEKANLARI
  // =====================================================================
  {
    id: 'VEN_SKR_001',
    name: 'Sakarya Atatürk Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Sakarya',
      district: 'Adapazarı',
      address: 'Sakarya Stadyumu, 54100 Adapazarı/Sakarya',
    },
    capacity: { seated: 28000, total: 28000 },
    description: 'Sakaryaspor stadyumu',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // AVM ETKİNLİK ALANLARI
  // =====================================================================
  {
    id: 'VEN_AVM_001',
    name: 'İstinyePark Etkinlik Alanı',
    type: 'avm',
    location: {
      city: 'İstanbul',
      district: 'Sarıyer',
      address: 'İstinye Mah. İstinye Bayırı Cad. No:73, 34460 Sarıyer/İstanbul',
    },
    capacity: { standing: 2000, total: 2000 },
    description: 'İstinyePark AVM etkinlik alanı',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_AVM_002',
    name: 'Kanyon AVM Etkinlik Alanı',
    type: 'avm',
    location: {
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Büyükdere Cad. No:185, 34394 Levent/Şişli/İstanbul',
    },
    capacity: { standing: 1500, total: 1500 },
    description: 'Kanyon AVM açık alan etkinlikleri',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_AVM_003',
    name: 'Zorlu Center Meydanı',
    type: 'avm',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Levazım Mah. Koru Sok. No:2, 34340 Beşiktaş/İstanbul',
    },
    capacity: { standing: 3000, total: 3000 },
    description: 'Zorlu Center açık hava etkinlik alanı',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_AVM_004',
    name: 'Mall of Istanbul Etkinlik Alanı',
    type: 'avm',
    location: {
      city: 'İstanbul',
      district: 'Başakşehir',
      address: 'Ziya Gökalp Mah. Süleyman Demirel Bulv. No:7, 34480 Başakşehir/İstanbul',
    },
    capacity: { standing: 5000, total: 5000 },
    description: 'Mall of Istanbul\'un büyük etkinlik alanı',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_AVM_005',
    name: 'Forum İstanbul Etkinlik Alanı',
    type: 'avm',
    location: {
      city: 'İstanbul',
      district: 'Bayrampaşa',
      address: 'Kocatepe Mah. Paşa Cad. No:2, 34045 Bayrampaşa/İstanbul',
    },
    capacity: { standing: 4000, total: 4000 },
    description: 'Forum İstanbul açık alan etkinlikleri',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // HATAY / ANTAKYA MEKANLARI
  // =====================================================================
  {
    id: 'VEN_HTY_001',
    name: 'Hatay Büyükşehir Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Hatay',
      district: 'Antakya',
      address: 'Antakya Stadyumu, 31000 Antakya/Hatay',
    },
    capacity: { seated: 25000, total: 25000 },
    description: 'Hatayspor stadyumu',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_HTY_002',
    name: 'Antakya Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Hatay',
      district: 'Antakya',
      address: 'Antakya Merkez, 31000 Antakya/Hatay',
    },
    capacity: { seated: 600, total: 600 },
    description: 'Hatay\'ın kültür ve sanat merkezi',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // MANİSA MEKANLARI
  // =====================================================================
  {
    id: 'VEN_MNS_001',
    name: 'Manisa 19 Mayıs Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Manisa',
      district: 'Şehzadeler',
      address: '19 Mayıs Stadyumu, 45000 Şehzadeler/Manisa',
    },
    capacity: { seated: 15000, total: 15000 },
    description: 'Manisaspor stadyumu',
    rating: 4.1,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_MNS_002',
    name: 'Manisa Celal Bayar Üniversitesi Amfi',
    type: 'acik-hava',
    location: {
      city: 'Manisa',
      district: 'Yunusemre',
      address: 'CBÜ Kampüsü, 45140 Yunusemre/Manisa',
    },
    capacity: { seated: 3000, total: 3000 },
    description: 'Üniversite açık hava amfisi',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // TEKİRDAĞ MEKANLARI
  // =====================================================================
  {
    id: 'VEN_TKR_001',
    name: 'Tekirdağ Atatürk Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Tekirdağ',
      district: 'Süleymanpaşa',
      address: 'Tekirdağ Stadyumu, 59000 Süleymanpaşa/Tekirdağ',
    },
    capacity: { seated: 15000, total: 15000 },
    description: 'Tekirdağspor stadyumu',
    rating: 4.1,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_TKR_002',
    name: 'Çorlu Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Tekirdağ',
      district: 'Çorlu',
      address: 'Çorlu Belediyesi, 59850 Çorlu/Tekirdağ',
    },
    capacity: { seated: 800, total: 800 },
    description: 'Çorlu\'nun kültür merkezi',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ÇANAKKALE MEKANLARI
  // =====================================================================
  {
    id: 'VEN_CNK_001',
    name: 'Çanakkale 18 Mart Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Çanakkale',
      district: 'Merkez',
      address: '18 Mart Stadyumu, 17000 Çanakkale',
    },
    capacity: { seated: 12000, total: 12000 },
    description: 'Çanakkale Dardanelspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_CNK_002',
    name: 'Troya Antik Tiyatrosu',
    type: 'antik-tiyatro',
    location: {
      city: 'Çanakkale',
      district: 'Merkez',
      address: 'Tevfikiye Köyü, Troya Antik Kenti, 17100 Çanakkale',
      coordinates: { lat: 39.9575, lng: 26.2389 },
    },
    capacity: { seated: 5000, total: 5000 },
    description: 'UNESCO Dünya Mirası Troya antik alanı',
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_CNK_003',
    name: 'Çanakkale Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Çanakkale',
      district: 'Merkez',
      address: 'İsmetpaşa Mah. Çanakkale Merkez',
    },
    capacity: { seated: 500, total: 500 },
    description: 'Çanakkale\'nin kültür ve etkinlik merkezi',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // BALIKESİR MEKANLARI
  // =====================================================================
  {
    id: 'VEN_BLK_001',
    name: 'Balıkesir Atatürk Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Balıkesir',
      district: 'Karesi',
      address: 'Atatürk Stadyumu, 10000 Karesi/Balıkesir',
    },
    capacity: { seated: 16000, total: 16000 },
    description: 'Balıkesirspor stadyumu',
    rating: 4.1,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_BLK_002',
    name: 'Ayvalık Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Balıkesir',
      district: 'Ayvalık',
      address: 'Ayvalık Merkez, 10400 Ayvalık/Balıkesir',
    },
    capacity: { seated: 400, total: 400 },
    description: 'Ayvalık\'ın kültür merkezi',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_BLK_003',
    name: 'Cunda Adası Açık Hava Sahnesi',
    type: 'acik-hava',
    location: {
      city: 'Balıkesir',
      district: 'Ayvalık',
      address: 'Cunda Adası, 10405 Ayvalık/Balıkesir',
    },
    capacity: { standing: 2000, total: 2000 },
    description: 'Cunda\'nın yaz konserleri mekanı',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // AYDIN MEKANLARI
  // =====================================================================
  {
    id: 'VEN_AYD_001',
    name: 'Aydın Atatürk Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Aydın',
      district: 'Efeler',
      address: 'Atatürk Stadyumu, 09000 Efeler/Aydın',
    },
    capacity: { seated: 13000, total: 13000 },
    description: 'Aydınspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_AYD_002',
    name: 'Kuşadası Marina Etkinlik Alanı',
    type: 'acik-hava',
    location: {
      city: 'Aydın',
      district: 'Kuşadası',
      address: 'Kuşadası Marina, 09400 Kuşadası/Aydın',
    },
    capacity: { standing: 3000, total: 3000 },
    description: 'Kuşadası\'nın yaz etkinlik mekanı',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_AYD_003',
    name: 'Didim Altınkum Beach Arena',
    type: 'beach-club',
    location: {
      city: 'Aydın',
      district: 'Didim',
      address: 'Altınkum, 09270 Didim/Aydın',
    },
    capacity: { standing: 2500, total: 2500 },
    description: 'Didim\'in plaj konser alanı',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_AYD_004',
    name: 'Afrodisias Antik Stadyumu',
    type: 'antik-tiyatro',
    location: {
      city: 'Aydın',
      district: 'Karacasu',
      address: 'Geyre Köyü, 09390 Karacasu/Aydın',
      coordinates: { lat: 37.7089, lng: 28.7256 },
    },
    capacity: { seated: 30000, total: 30000 },
    description: 'UNESCO Dünya Mirası, antik stadyum',
    rating: 4.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // DÜZCE MEKANLARI
  // =====================================================================
  {
    id: 'VEN_DZC_001',
    name: 'Düzce Atatürk Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Düzce',
      district: 'Merkez',
      address: 'Atatürk Stadyumu, 81000 Düzce',
    },
    capacity: { seated: 8000, total: 8000 },
    description: 'Düzcespor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // BOLU MEKANLARI
  // =====================================================================
  {
    id: 'VEN_BLU_001',
    name: 'Bolu Atatürk Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Bolu',
      district: 'Merkez',
      address: 'Atatürk Stadyumu, 14000 Bolu',
    },
    capacity: { seated: 10000, total: 10000 },
    description: 'Boluspor stadyumu',
    rating: 4.1,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_BLU_002',
    name: 'Kartalkaya Kongre Oteli',
    type: 'otel',
    location: {
      city: 'Bolu',
      district: 'Merkez',
      address: 'Kartalkaya Kayak Merkezi, 14000 Bolu',
    },
    capacity: { seated: 500, total: 800 },
    description: 'Kayak merkezinde kongre oteli',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ZONGULDAK MEKANLARI
  // =====================================================================
  {
    id: 'VEN_ZNG_001',
    name: 'Zonguldak Karaelmas Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Zonguldak',
      district: 'Merkez',
      address: 'Karaelmas Stadyumu, 67000 Zonguldak',
    },
    capacity: { seated: 14000, total: 14000 },
    description: 'Zonguldakspor stadyumu',
    rating: 4.1,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // KASTAMONU MEKANLARI
  // =====================================================================
  {
    id: 'VEN_KST_001',
    name: 'Kastamonu Gazi Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Kastamonu',
      district: 'Merkez',
      address: 'Gazi Stadyumu, 37000 Kastamonu',
    },
    capacity: { seated: 8000, total: 8000 },
    description: 'Kastamonuspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // TOKAT MEKANLARI
  // =====================================================================
  {
    id: 'VEN_TKT_001',
    name: 'Tokat Gaziosmanpaşa Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Tokat',
      district: 'Merkez',
      address: 'GOP Stadyumu, 60000 Tokat',
    },
    capacity: { seated: 12000, total: 12000 },
    description: 'Tokatspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ÇORUM MEKANLARI
  // =====================================================================
  {
    id: 'VEN_CRM_001',
    name: 'Çorum Dr. Turhan Kılıçcıoğlu Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Çorum',
      district: 'Merkez',
      address: 'Dr. Turhan Kılıçcıoğlu Stadyumu, 19000 Çorum',
    },
    capacity: { seated: 12000, total: 12000 },
    description: 'Çorumspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // SİVAS MEKANLARI
  // =====================================================================
  {
    id: 'VEN_SVS_001',
    name: 'Sivas Yeni 4 Eylül Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Sivas',
      district: 'Merkez',
      address: 'Yeni 4 Eylül Stadyumu, 58000 Sivas',
      coordinates: { lat: 39.7500, lng: 37.0167 },
    },
    capacity: { seated: 27500, total: 27500 },
    description: 'Sivasspor\'un modern stadyumu',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_SVS_002',
    name: 'Sivas Kongre Merkezi',
    type: 'kongre-merkezi',
    location: {
      city: 'Sivas',
      district: 'Merkez',
      address: 'Sivas Merkez, 58000 Sivas',
    },
    capacity: { seated: 1500, total: 1500 },
    description: 'Sivas\'ın kongre ve etkinlik merkezi',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ELAZIĞ MEKANLARI
  // =====================================================================
  {
    id: 'VEN_ELZ_001',
    name: 'Elazığ Atatürk Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Elazığ',
      district: 'Merkez',
      address: 'Atatürk Stadyumu, 23000 Elazığ',
    },
    capacity: { seated: 15000, total: 15000 },
    description: 'Elazığspor stadyumu',
    rating: 4.1,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // KAHRAMANMARAŞ MEKANLARI
  // =====================================================================
  {
    id: 'VEN_KMR_001',
    name: 'Kahramanmaraş Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Kahramanmaraş',
      district: 'Onikişubat',
      address: 'Kahramanmaraş Stadyumu, 46000 Onikişubat/Kahramanmaraş',
    },
    capacity: { seated: 20000, total: 20000 },
    description: 'Kahramanmaraş\'ın modern stadyumu',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ŞANLIURFA MEKANLARI
  // =====================================================================
  {
    id: 'VEN_SRF_001',
    name: 'Şanlıurfa GAP Arena',
    type: 'stadyum',
    location: {
      city: 'Şanlıurfa',
      district: 'Karaköprü',
      address: 'GAP Arena, 63000 Karaköprü/Şanlıurfa',
      coordinates: { lat: 37.1833, lng: 38.8000 },
    },
    capacity: { seated: 33000, total: 33000 },
    description: 'Şanlıurfaspor\'un yeni stadyumu',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_SRF_002',
    name: 'Göbeklitepe Etkinlik Alanı',
    type: 'festival-alani',
    location: {
      city: 'Şanlıurfa',
      district: 'Haliliye',
      address: 'Göbeklitepe, 63290 Haliliye/Şanlıurfa',
      coordinates: { lat: 37.2233, lng: 38.9225 },
    },
    capacity: { total: 5000 },
    description: 'UNESCO Dünya Mirası yanında etkinlik alanı',
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // MARDİN MEKANLARI
  // =====================================================================
  {
    id: 'VEN_MRD_001',
    name: 'Mardin Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Mardin',
      district: 'Artuklu',
      address: 'Mardin Stadyumu, 47000 Artuklu/Mardin',
    },
    capacity: { seated: 15000, total: 15000 },
    description: 'Mardinspor stadyumu',
    rating: 4.1,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_MRD_002',
    name: 'Mardin Artuklu Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Mardin',
      district: 'Artuklu',
      address: 'Eski Mardin, 47100 Artuklu/Mardin',
    },
    capacity: { seated: 400, total: 400 },
    description: 'Tarihi Mardin\'de kültür merkezi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // BATMAN MEKANLARI
  // =====================================================================
  {
    id: 'VEN_BTM_001',
    name: 'Batman Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Batman',
      district: 'Merkez',
      address: 'Batman Stadyumu, 72000 Batman',
    },
    capacity: { seated: 15000, total: 15000 },
    description: 'Batman Petrolspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // AĞRI MEKANLARI
  // =====================================================================
  {
    id: 'VEN_AGR_001',
    name: 'Ağrı Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Ağrı',
      district: 'Merkez',
      address: 'Ağrı Stadyumu, 04000 Ağrı',
    },
    capacity: { seated: 10000, total: 10000 },
    description: 'Ağrı 1970 Spor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // IĞDIR MEKANLARI
  // =====================================================================
  {
    id: 'VEN_IGD_001',
    name: 'Iğdır Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Iğdır',
      district: 'Merkez',
      address: 'Iğdır Stadyumu, 76000 Iğdır',
    },
    capacity: { seated: 8000, total: 8000 },
    description: 'Iğdırspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // KARS MEKANLARI
  // =====================================================================
  {
    id: 'VEN_KRS_001',
    name: 'Kars Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Kars',
      district: 'Merkez',
      address: 'Kars Stadyumu, 36000 Kars',
    },
    capacity: { seated: 8000, total: 8000 },
    description: 'Kars 36 Spor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ARDAHAN MEKANLARI
  // =====================================================================
  {
    id: 'VEN_ARD_001',
    name: 'Ardahan Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Ardahan',
      district: 'Merkez',
      address: 'Ardahan Stadyumu, 75000 Ardahan',
    },
    capacity: { seated: 5000, total: 5000 },
    description: 'Ardahan Hoçvanspor stadyumu',
    rating: 3.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // RİZE MEKANLARI
  // =====================================================================
  {
    id: 'VEN_RZE_001',
    name: 'Çaykur Didi Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Rize',
      district: 'Merkez',
      address: 'Çaykur Didi Stadyumu, 53000 Rize',
      coordinates: { lat: 41.0250, lng: 40.5175 },
    },
    capacity: { seated: 15000, total: 15000 },
    description: 'Rizespor stadyumu',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ARTVİN MEKANLARI
  // =====================================================================
  {
    id: 'VEN_ART_001',
    name: 'Artvin Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Artvin',
      district: 'Merkez',
      address: 'Artvin Stadyumu, 08000 Artvin',
    },
    capacity: { seated: 6000, total: 6000 },
    description: 'Artvin Hopaspor stadyumu',
    rating: 3.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // GİRESUN MEKANLARI
  // =====================================================================
  {
    id: 'VEN_GRS_001',
    name: 'Giresun Atatürk Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Giresun',
      district: 'Merkez',
      address: 'Atatürk Stadyumu, 28000 Giresun',
    },
    capacity: { seated: 14000, total: 14000 },
    description: 'Giresunspor stadyumu',
    rating: 4.1,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ORDU MEKANLARI
  // =====================================================================
  {
    id: 'VEN_ORD_001',
    name: 'Ordu 19 Eylül Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Ordu',
      district: 'Altınordu',
      address: '19 Eylül Stadyumu, 52000 Altınordu/Ordu',
    },
    capacity: { seated: 10000, total: 10000 },
    description: 'Orduspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // AMASYA MEKANLARI
  // =====================================================================
  {
    id: 'VEN_AMS_001',
    name: 'Amasya Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Amasya',
      district: 'Merkez',
      address: 'Amasya Stadyumu, 05000 Amasya',
    },
    capacity: { seated: 8000, total: 8000 },
    description: 'Amasyaspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_AMS_002',
    name: 'Amasya Kral Kaya Mezarları Etkinlik Alanı',
    type: 'acik-hava',
    location: {
      city: 'Amasya',
      district: 'Merkez',
      address: 'Kral Kaya Mezarları, 05000 Amasya',
    },
    capacity: { standing: 2000, total: 2000 },
    description: 'Tarihi kaya mezarları önünde etkinlik alanı',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // SİNOP MEKANLARI
  // =====================================================================
  {
    id: 'VEN_SNP_001',
    name: 'Sinop Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Sinop',
      district: 'Merkez',
      address: 'Sinop Stadyumu, 57000 Sinop',
    },
    capacity: { seated: 5000, total: 5000 },
    description: 'Sinopspor stadyumu',
    rating: 3.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // BARTIN MEKANLARI
  // =====================================================================
  {
    id: 'VEN_BRT_001',
    name: 'Bartın Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Bartın',
      district: 'Merkez',
      address: 'Bartın Stadyumu, 74000 Bartın',
    },
    capacity: { seated: 6000, total: 6000 },
    description: 'Bartınspor stadyumu',
    rating: 3.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // KARABÜK MEKANLARI
  // =====================================================================
  {
    id: 'VEN_KRB_001',
    name: 'Karabük Atatürk Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Karabük',
      district: 'Merkez',
      address: 'Atatürk Stadyumu, 78000 Karabük',
    },
    capacity: { seated: 10000, total: 10000 },
    description: 'Kardemir Karabükspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_KRB_002',
    name: 'Safranbolu Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Karabük',
      district: 'Safranbolu',
      address: 'Safranbolu Merkez, 78600 Safranbolu/Karabük',
    },
    capacity: { seated: 300, total: 300 },
    description: 'UNESCO şehri Safranbolu\'nun kültür merkezi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // YOZGAT MEKANLARI
  // =====================================================================
  {
    id: 'VEN_YZG_001',
    name: 'Yozgat Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Yozgat',
      district: 'Merkez',
      address: 'Yozgat Stadyumu, 66000 Yozgat',
    },
    capacity: { seated: 10000, total: 10000 },
    description: 'Yozgatspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // KIRŞEHİR MEKANLARI
  // =====================================================================
  {
    id: 'VEN_KSH_001',
    name: 'Kırşehir Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Kırşehir',
      district: 'Merkez',
      address: 'Kırşehir Stadyumu, 40000 Kırşehir',
    },
    capacity: { seated: 8000, total: 8000 },
    description: 'Kırşehirspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // AKSARAY MEKANLARI
  // =====================================================================
  {
    id: 'VEN_AKS_001',
    name: 'Aksaray Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Aksaray',
      district: 'Merkez',
      address: 'Aksaray Stadyumu, 68000 Aksaray',
    },
    capacity: { seated: 10000, total: 10000 },
    description: 'Aksarayspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // NİĞDE MEKANLARI
  // =====================================================================
  {
    id: 'VEN_NGD_001',
    name: 'Niğde Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Niğde',
      district: 'Merkez',
      address: 'Niğde Stadyumu, 51000 Niğde',
    },
    capacity: { seated: 8000, total: 8000 },
    description: 'Niğde Belediyespor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // KARAMAN MEKANLARI
  // =====================================================================
  {
    id: 'VEN_KRM_001',
    name: 'Karaman Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Karaman',
      district: 'Merkez',
      address: 'Karaman Stadyumu, 70000 Karaman',
    },
    capacity: { seated: 8000, total: 8000 },
    description: 'Karamanspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ISPARTA MEKANLARI
  // =====================================================================
  {
    id: 'VEN_ISP_001',
    name: 'Isparta Atatürk Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Isparta',
      district: 'Merkez',
      address: 'Atatürk Stadyumu, 32000 Isparta',
    },
    capacity: { seated: 12000, total: 12000 },
    description: 'Ispartaspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_ISP_002',
    name: 'Eğirdir Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Isparta',
      district: 'Eğirdir',
      address: 'Eğirdir Gölü Kıyısı, 32500 Eğirdir/Isparta',
    },
    capacity: { seated: 300, total: 300 },
    description: 'Eğirdir Gölü manzaralı kültür merkezi',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // BURDUR MEKANLARI
  // =====================================================================
  {
    id: 'VEN_BRD_001',
    name: 'Burdur Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Burdur',
      district: 'Merkez',
      address: 'Burdur Stadyumu, 15000 Burdur',
    },
    capacity: { seated: 8000, total: 8000 },
    description: 'Burdurspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // AFYON MEKANLARI
  // =====================================================================
  {
    id: 'VEN_AFY_001',
    name: 'Afyon Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Afyonkarahisar',
      district: 'Merkez',
      address: 'Afyon Stadyumu, 03000 Afyonkarahisar',
    },
    capacity: { seated: 15000, total: 15000 },
    description: 'Afyonspor stadyumu',
    rating: 4.1,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_AFY_002',
    name: 'Afyon Termal Otel Kongre Merkezi',
    type: 'otel',
    location: {
      city: 'Afyonkarahisar',
      district: 'Merkez',
      address: 'Ömer-Gecek Termal, 03000 Afyonkarahisar',
    },
    capacity: { seated: 800, total: 1000 },
    description: 'Termal bölgede kongre oteli',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // KÜTAHYA MEKANLARI
  // =====================================================================
  {
    id: 'VEN_KTH_001',
    name: 'Kütahya Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Kütahya',
      district: 'Merkez',
      address: 'Kütahya Stadyumu, 43000 Kütahya',
    },
    capacity: { seated: 12000, total: 12000 },
    description: 'Kütahyaspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // BİLECİK MEKANLARI
  // =====================================================================
  {
    id: 'VEN_BLC_001',
    name: 'Bilecik Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Bilecik',
      district: 'Merkez',
      address: 'Bilecik Stadyumu, 11000 Bilecik',
    },
    capacity: { seated: 6000, total: 6000 },
    description: 'Bilecikspor stadyumu',
    rating: 3.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // YALOVA MEKANLARI
  // =====================================================================
  {
    id: 'VEN_YLV_001',
    name: 'Yalova Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Yalova',
      district: 'Merkez',
      address: 'Yalova Stadyumu, 77000 Yalova',
    },
    capacity: { seated: 8000, total: 8000 },
    description: 'Yalovaspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_YLV_002',
    name: 'Yalova Termal Otel Kongre',
    type: 'otel',
    location: {
      city: 'Yalova',
      district: 'Termal',
      address: 'Termal, 77400 Termal/Yalova',
    },
    capacity: { seated: 600, total: 800 },
    description: 'Termal bölgede kongre oteli',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // KIRIKKALE MEKANLARI
  // =====================================================================
  {
    id: 'VEN_KRK_001',
    name: 'Kırıkkale Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Kırıkkale',
      district: 'Merkez',
      address: 'Kırıkkale Stadyumu, 71000 Kırıkkale',
    },
    capacity: { seated: 10000, total: 10000 },
    description: 'Kırıkkalespor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ÇANKIRI MEKANLARI
  // =====================================================================
  {
    id: 'VEN_CKR_001',
    name: 'Çankırı Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Çankırı',
      district: 'Merkez',
      address: 'Çankırı Stadyumu, 18000 Çankırı',
    },
    capacity: { seated: 6000, total: 6000 },
    description: 'Çankırı Belediyespor stadyumu',
    rating: 3.9,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // EDİRNE MEKANLARI
  // =====================================================================
  {
    id: 'VEN_EDR_001',
    name: 'Edirne Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Edirne',
      district: 'Merkez',
      address: 'Edirne Stadyumu, 22000 Edirne',
    },
    capacity: { seated: 12000, total: 12000 },
    description: 'Edirnespor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_EDR_002',
    name: 'Kırkpınar Yağlı Güreş Alanı',
    type: 'festival-alani',
    location: {
      city: 'Edirne',
      district: 'Merkez',
      address: 'Sarayiçi, 22000 Edirne',
    },
    capacity: { total: 20000 },
    description: 'UNESCO Dünya Mirası Kırkpınar güreşleri alanı',
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // KIRKLARELİ MEKANLARI
  // =====================================================================
  {
    id: 'VEN_KKL_001',
    name: 'Kırklareli Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Kırklareli',
      district: 'Merkez',
      address: 'Kırklareli Stadyumu, 39000 Kırklareli',
    },
    capacity: { seated: 8000, total: 8000 },
    description: 'Kırklarelispor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // UŞAK MEKANLARI
  // =====================================================================
  {
    id: 'VEN_USK_001',
    name: 'Uşak Stadyumu',
    type: 'stadyum',
    location: {
      city: 'Uşak',
      district: 'Merkez',
      address: 'Uşak Stadyumu, 64000 Uşak',
    },
    capacity: { seated: 10000, total: 10000 },
    description: 'Uşakspor stadyumu',
    rating: 4.0,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // MUĞLA - EK MEKANLAR
  // =====================================================================
  {
    id: 'VEN_MGL_008',
    name: 'Milas Ören Beach',
    type: 'beach-club',
    location: {
      city: 'Muğla',
      district: 'Milas',
      address: 'Ören Sahil, 48450 Milas/Muğla',
    },
    capacity: { standing: 2000, total: 2000 },
    description: 'Milas\'ın popüler plaj etkinlik mekanı',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_MGL_009',
    name: 'Köyceğiz Kültür Evi',
    type: 'kultur-merkezi',
    location: {
      city: 'Muğla',
      district: 'Köyceğiz',
      address: 'Köyceğiz Merkez, 48800 Köyceğiz/Muğla',
    },
    capacity: { seated: 200, total: 200 },
    description: 'Köyceğiz\'in butik kültür mekanı',
    rating: 4.1,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // ÜNİVERSİTE MEKANLARI
  // =====================================================================
  {
    id: 'VEN_UNI_001',
    name: 'Boğaziçi Üniversitesi Albert Long Hall',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Boğaziçi Üniversitesi Güney Kampüs, 34342 Bebek/İstanbul',
    },
    capacity: { seated: 800, total: 800 },
    description: 'Boğaziçi\'nin tarihi konser salonu',
    rating: 4.7,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_UNI_002',
    name: 'İTÜ Süleyman Demirel Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'İstanbul',
      district: 'Sarıyer',
      address: 'İTÜ Ayazağa Kampüsü, 34469 Maslak/İstanbul',
    },
    capacity: { seated: 1500, total: 1500 },
    description: 'İTÜ\'nün büyük kültür merkezi',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_UNI_003',
    name: 'Marmara Üniversitesi Rektörlük Konferans Salonu',
    type: 'kongre-merkezi',
    location: {
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Marmara Üniversitesi, Göztepe Kampüsü, 34722 Kadıköy/İstanbul',
    },
    capacity: { seated: 600, total: 600 },
    description: 'Marmara Üniversitesi konferans salonu',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_UNI_004',
    name: 'Yıldız Teknik Üniversitesi Oditoryum',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'YTÜ Davutpaşa Kampüsü, 34220 Esenler/İstanbul',
    },
    capacity: { seated: 500, total: 500 },
    description: 'YTÜ\'nün ana etkinlik salonu',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_UNI_005',
    name: 'Sabancı Üniversitesi FASS Oditoryum',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Tuzla',
      address: 'Sabancı Üniversitesi, Orhanlı, 34956 Tuzla/İstanbul',
    },
    capacity: { seated: 400, total: 400 },
    description: 'Sabancı Üniversitesi etkinlik salonu',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_UNI_006',
    name: 'Koç Üniversitesi Sevgi Gönül Oditoryumu',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Sarıyer',
      address: 'Koç Üniversitesi, Rumelifeneri, 34450 Sarıyer/İstanbul',
    },
    capacity: { seated: 600, total: 600 },
    description: 'Koç Üniversitesi\'nin modern oditoryumu',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_UNI_007',
    name: 'Ege Üniversitesi Atatürk Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'İzmir',
      district: 'Bornova',
      address: 'Ege Üniversitesi Kampüsü, 35100 Bornova/İzmir',
    },
    capacity: { seated: 1200, total: 1200 },
    description: 'Ege Üniversitesi\'nin büyük kültür merkezi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_UNI_008',
    name: 'Dokuz Eylül Üniversitesi Sabancı Kültür Sarayı',
    type: 'kultur-merkezi',
    location: {
      city: 'İzmir',
      district: 'Buca',
      address: 'DEÜ Tınaztepe Kampüsü, 35390 Buca/İzmir',
    },
    capacity: { seated: 1000, total: 1000 },
    description: 'DEÜ\'nün konser ve etkinlik salonu',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_UNI_009',
    name: 'Gazi Üniversitesi Mimar Kemalettin Salonu',
    type: 'kapali-salon',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Gazi Üniversitesi, Beşevler Kampüsü, 06500 Çankaya/Ankara',
    },
    capacity: { seated: 800, total: 800 },
    description: 'Gazi Üniversitesi\'nin tarihi salonu',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_UNI_010',
    name: 'Akdeniz Üniversitesi Amfi Tiyatro',
    type: 'acik-hava',
    location: {
      city: 'Antalya',
      district: 'Konyaaltı',
      address: 'Akdeniz Üniversitesi Kampüsü, 07058 Konyaaltı/Antalya',
    },
    capacity: { seated: 3000, total: 3000 },
    description: 'Akdeniz Üniversitesi açık hava amfisi',
    rating: 4.4,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_UNI_011',
    name: 'Uludağ Üniversitesi Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'Bursa',
      district: 'Nilüfer',
      address: 'Uludağ Üniversitesi Görükle Kampüsü, 16059 Nilüfer/Bursa',
    },
    capacity: { seated: 800, total: 800 },
    description: 'Uludağ Üniversitesi etkinlik merkezi',
    rating: 4.2,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // =====================================================================
  // İSTANBUL - EK MEKANLAR
  // =====================================================================
  {
    id: 'VEN_IST_001',
    name: 'Sakıp Sabancı Müzesi',
    type: 'kultur-merkezi',
    location: {
      city: 'İstanbul',
      district: 'Sarıyer',
      address: 'Sakıp Sabancı Cad. No:42, 34467 Emirgan/İstanbul',
      coordinates: { lat: 41.1069, lng: 29.0564 },
    },
    capacity: { seated: 300, total: 500 },
    contact: { website: 'https://www.sakipsabancimuzesi.org' },
    description: 'Boğaz kıyısında tarihi köşk, sergi ve konser mekanı',
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IST_002',
    name: 'Rahmi M. Koç Müzesi',
    type: 'kultur-merkezi',
    location: {
      city: 'İstanbul',
      district: 'Beyoğlu',
      address: 'Hasköy Cad. No:5, 34445 Hasköy/İstanbul',
    },
    capacity: { seated: 400, total: 1000 },
    contact: { website: 'https://www.rmk-museum.org.tr' },
    description: 'Sanayi müzesi, özel etkinlikler için',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IST_003',
    name: 'Borusan Müzik Evi',
    type: 'kapali-salon',
    location: {
      city: 'İstanbul',
      district: 'Beyoğlu',
      address: 'İstiklal Cad. No:160, 34433 Beyoğlu/İstanbul',
    },
    capacity: { seated: 230, total: 230 },
    contact: { website: 'https://www.borusansanat.com' },
    description: 'Klasik müzik ve caz konserleri salonu',
    rating: 4.8,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IST_004',
    name: 'Beykoz Kundura',
    type: 'kultur-merkezi',
    location: {
      city: 'İstanbul',
      district: 'Beykoz',
      address: 'Yalıköy Mah. Süreyya İlmen Cad. No:1, 34820 Beykoz/İstanbul',
    },
    capacity: { seated: 500, standing: 2000, total: 2000 },
    description: 'Tarihi fabrikada etkinlik ve sinema mekanı',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IST_005',
    name: 'Müze Gazhane',
    type: 'kultur-merkezi',
    location: {
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Hasanpaşa Mah. Kurbağalıdere Cad., 34722 Kadıköy/İstanbul',
    },
    capacity: { standing: 5000, total: 5000 },
    description: 'Tarihi gazhanede kültür ve etkinlik merkezi',
    rating: 4.6,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IST_006',
    name: 'Ara Güler Müzesi & Kültür Merkezi',
    type: 'kultur-merkezi',
    location: {
      city: 'İstanbul',
      district: 'Beyoğlu',
      address: 'Bomontiada, Birahane Sok. No:1, 34381 Şişli/İstanbul',
    },
    capacity: { seated: 200, total: 300 },
    description: 'Bomontiada\'da kültür ve sergi mekanı',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IST_007',
    name: 'UNIQ Açıkhava',
    type: 'acik-hava',
    location: {
      city: 'İstanbul',
      district: 'Sarıyer',
      address: 'UNIQ İstanbul, Maslak Ayazağa Cad. No:4, Sarıyer/İstanbul',
    },
    capacity: { standing: 5000, total: 5000 },
    description: 'Maslak\'taki açık hava konser alanı',
    rating: 4.5,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'VEN_IST_008',
    name: 'Life Park',
    type: 'acik-hava',
    location: {
      city: 'İstanbul',
      district: 'Beylikdüzü',
      address: 'Beylikdüzü Sahil Yolu, 34520 Beylikdüzü/İstanbul',
    },
    capacity: { standing: 15000, total: 15000 },
    description: 'Beylikdüzü\'nün büyük açık hava konser alanı',
    rating: 4.3,
    status: 'aktif',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
];

// =============================================================================
// HELPER FONKSİYONLARI
// =============================================================================

// Tüm mekanları getir
export const getAllVenues = (): Venue[] => venues;

// ID ile mekan getir
export const getVenueById = (id: string): Venue | undefined =>
  venues.find((v) => v.id === id);

// Şehre göre mekanları getir
export const getVenuesByCity = (city: string): Venue[] =>
  venues.filter((v) => v.location.city.toLowerCase() === city.toLowerCase());

// Türe göre mekanları getir
export const getVenuesByType = (type: VenueType): Venue[] =>
  venues.filter((v) => v.type === type);

// Kapasiteye göre mekanları getir
export const getVenuesByCapacity = (minCapacity: number, maxCapacity?: number): Venue[] =>
  venues.filter((v) => {
    const capacity = v.capacity.total;
    if (maxCapacity) {
      return capacity >= minCapacity && capacity <= maxCapacity;
    }
    return capacity >= minCapacity;
  });

// Aktif mekanları getir
export const getActiveVenues = (): Venue[] =>
  venues.filter((v) => v.status === 'aktif');

// Doğrulanmış mekanları getir
export const getVerifiedVenues = (): Venue[] =>
  venues.filter((v) => v.isVerified);

// Şehir listesini getir
export const getUniqueCities = (): string[] => {
  const cities = venues.map((v) => v.location.city);
  return [...new Set(cities)].sort();
};

// Mekan türü etiketleri
export const getVenueTypeLabel = (type: VenueType): string => {
  const labels: Record<VenueType, string> = {
    stadyum: 'Stadyum',
    arena: 'Arena / Spor Salonu',
    'acik-hava': 'Açık Hava',
    'kapali-salon': 'Kapalı Salon',
    otel: 'Otel',
    'kongre-merkezi': 'Kongre Merkezi',
    'antik-tiyatro': 'Antik Tiyatro',
    'bar-club': 'Bar / Club',
    'kultur-merkezi': 'Kültür Merkezi',
    universite: 'Üniversite',
    'festival-alani': 'Festival Alanı',
    'beach-club': 'Beach Club',
    tiyatro: 'Tiyatro',
    avm: 'AVM',
    diger: 'Diğer',
  };
  return labels[type] || type;
};

// Kapasite formatla
export const formatCapacity = (capacity: VenueCapacity): string => {
  if (capacity.seated && capacity.standing) {
    return `${capacity.seated.toLocaleString('tr-TR')} oturma / ${capacity.standing.toLocaleString('tr-TR')} ayakta`;
  }
  if (capacity.seated) {
    return `${capacity.seated.toLocaleString('tr-TR')} oturma`;
  }
  if (capacity.standing) {
    return `${capacity.standing.toLocaleString('tr-TR')} ayakta`;
  }
  return `${capacity.total.toLocaleString('tr-TR')} kişi`;
};

// Mekan ara
export const searchVenues = (query: string): Venue[] => {
  const lowercaseQuery = query.toLowerCase();
  return venues.filter(
    (v) =>
      v.name.toLowerCase().includes(lowercaseQuery) ||
      v.location.city.toLowerCase().includes(lowercaseQuery) ||
      v.location.district.toLowerCase().includes(lowercaseQuery) ||
      v.description?.toLowerCase().includes(lowercaseQuery)
  );
};

// İstatistikler
export const getVenueStats = () => {
  const totalVenues = venues.length;
  const activeVenues = venues.filter((v) => v.status === 'aktif').length;
  const verifiedVenues = venues.filter((v) => v.isVerified).length;
  const uniqueCities = getUniqueCities().length;

  const byType: Record<string, number> = {};
  venues.forEach((v) => {
    byType[v.type] = (byType[v.type] || 0) + 1;
  });

  const byCity: Record<string, number> = {};
  venues.forEach((v) => {
    byCity[v.location.city] = (byCity[v.location.city] || 0) + 1;
  });

  return {
    totalVenues,
    activeVenues,
    verifiedVenues,
    uniqueCities,
    byType,
    byCity,
  };
};

// Export default
export default venues;
