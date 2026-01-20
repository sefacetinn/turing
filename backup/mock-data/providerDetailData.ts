// Types
export interface Artist {
  id: string;
  name: string;
  genre: string;
  image: string;
  priceRange: string;
  rating: number;
  description: string;
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  eventType: string;
}

export interface ProviderDetail {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  image: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  location: string;
  verified: boolean;
  priceRange: string;
  description: string;
  aboutLong: string;
  completedEvents: number;
  responseTime: string;
  yearsExperience: number;
  teamSize: string;
  phone: string;
  email: string;
  website: string;
  specialties: string[];
  services: string[];
  portfolio: string[];
  highlights: { icon: string; label: string; value: string }[];
  artists?: Artist[];
  reviews: Review[];
}

// Detailed providers data
export const providersDetail: Record<string, ProviderDetail> = {
  'b1': {
    id: 'b1',
    name: 'Atlantis Yapım',
    category: 'booking',
    subcategory: 'Sanatçı Yönetimi & Booking',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    rating: 4.9,
    reviewCount: 342,
    location: 'İstanbul, Türkiye',
    verified: true,
    priceRange: '₺50K - ₺500K',
    description: 'Türkiye\'nin önde gelen sanatçı yönetim ve booking ajansı',
    aboutLong: 'Atlantis Yapım, 2002 yılından bu yana Türkiye\'nin en prestijli sanatçı yönetim ve booking ajanslarından biridir. Rock, pop ve alternatif müzik alanında birçok ödüllü sanatçıyı temsil etmekteyiz. Konser, festival ve kurumsal etkinlikler için profesyonel booking hizmeti sunuyoruz.',
    completedEvents: 850,
    responseTime: '1 saat',
    yearsExperience: 22,
    teamSize: '15+ Sanatçı',
    phone: '+905321234567',
    email: 'booking@atlantisyapim.com',
    website: 'www.atlantisyapim.com',
    specialties: ['Rock', 'Pop', 'Alternatif', 'Festival', 'Kurumsal'],
    services: ['Sanatçı Booking', 'Konser Organizasyonu', 'Festival Koordinasyonu', 'Kurumsal Etkinlik', 'Özel Gece'],
    portfolio: [
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    ],
    highlights: [
      { icon: 'people', label: 'Sanatçı', value: '15+ Sanatçı' },
      { icon: 'calendar', label: 'Etkinlik', value: '850+ Etkinlik' },
      { icon: 'trophy', label: 'Deneyim', value: '22 Yıl' },
    ],
    artists: [
      { id: 'a1', name: 'Athena', genre: 'Ska / Rock', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', priceRange: '₺150K - ₺300K', rating: 4.9, description: 'Türkiye\'nin efsane ska-rock grubu' },
      { id: 'a2', name: 'Melike Şahin', genre: 'Alternatif Pop', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', priceRange: '₺80K - ₺180K', rating: 4.8, description: 'Alternatif pop müziğin yükselen yıldızı' },
      { id: 'a3', name: 'Pinhani', genre: 'Pop Rock', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400', priceRange: '₺100K - ₺220K', rating: 4.7, description: 'Türkçe pop rock\'un sevilen ismi' },
      { id: 'a4', name: 'Yüzyüzeyken Konuşuruz', genre: 'İndie Pop', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', priceRange: '₺120K - ₺250K', rating: 4.8, description: 'Yeni nesil indie müziğin temsilcisi' },
      { id: 'a5', name: 'Can Bonomo', genre: 'Pop', image: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=400', priceRange: '₺90K - ₺200K', rating: 4.6, description: 'Eurovision temsilcisi pop sanatçısı' },
    ],
    reviews: [
      { id: 'r1', name: 'Festival Org. A.Ş.', avatar: 'FO', rating: 5, date: '2 hafta önce', text: 'Athena ile festivalde çalıştık. Atlantis Yapım\'ın profesyonelliği ve hızlı dönüşleri harikaydı.', eventType: 'Festival' },
      { id: 'r2', name: 'Kurumsal Events', avatar: 'KE', rating: 5, date: '1 ay önce', text: 'Melike Şahin\'i kurumsal etkinliğimizde ağırladık. Her şey mükemmel koordine edildi.', eventType: 'Kurumsal' },
    ],
  },
  'b2': {
    id: 'b2',
    name: 'Poll Production',
    category: 'booking',
    subcategory: 'Sanatçı Yönetimi & Booking',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    rating: 4.8,
    reviewCount: 287,
    location: 'İstanbul, Türkiye',
    verified: true,
    priceRange: '₺100K - ₺1M',
    description: 'Uluslararası sanatçı booking ve prodüksiyon',
    aboutLong: 'Poll Production, Türkiye\'nin en büyük sanatçı yönetim şirketlerinden biridir. 1996 yılından bu yana pop müziğinin en büyük isimlerini temsil etmekte ve uluslararası standartlarda prodüksiyon hizmetleri sunmaktadır.',
    completedEvents: 1200,
    responseTime: '2 saat',
    yearsExperience: 28,
    teamSize: '20+ Sanatçı',
    phone: '+905321234568',
    email: 'booking@pollproduction.com',
    website: 'www.pollproduction.com',
    specialties: ['Pop', 'Türk Pop', 'Gala', 'Kurumsal', 'Düğün'],
    services: ['Sanatçı Booking', 'Konser Prodüksiyon', 'TV Programları', 'Reklam Projeleri', 'Marka İşbirlikleri'],
    portfolio: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400',
    ],
    highlights: [
      { icon: 'star', label: 'A-List', value: 'Türkiye\'nin #1' },
      { icon: 'globe', label: 'Global', value: 'Uluslararası' },
      { icon: 'trophy', label: 'Ödül', value: '50+ Ödül' },
    ],
    artists: [
      { id: 'a1', name: 'Tarkan', genre: 'Pop', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', priceRange: '₺500K - ₺1M', rating: 5.0, description: 'Megastar - Türk pop müziğinin dünya çapında tanınan yüzü' },
      { id: 'a2', name: 'Sıla', genre: 'Pop / R&B', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', priceRange: '₺300K - ₺600K', rating: 4.9, description: 'Güçlü vokali ile pop müziğin divası' },
      { id: 'a3', name: 'Murat Boz', genre: 'Pop', image: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=400', priceRange: '₺250K - ₺500K', rating: 4.8, description: 'Pop müziğin enerjik yıldızı' },
      { id: 'a4', name: 'Hadise', genre: 'Pop / Dance', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', priceRange: '₺350K - ₺700K', rating: 4.9, description: 'Eurovision ikincisi, dans pop kraliçesi' },
    ],
    reviews: [
      { id: 'r1', name: 'Grand Events', avatar: 'GE', rating: 5, date: '1 hafta önce', text: 'Tarkan konseri için Poll Production ile çalıştık. Kusursuz bir organizasyon oldu.', eventType: 'Konser' },
      { id: 'r2', name: 'Luxury Weddings', avatar: 'LW', rating: 5, date: '3 hafta önce', text: 'Sıla\'yı düğünümüzde ağırladık. Profesyonel ekip, harika performans.', eventType: 'Düğün' },
    ],
  },
  'b3': {
    id: 'b3',
    name: 'BKM Organizasyon',
    category: 'booking',
    subcategory: 'Komedi & Stand-up Booking',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400',
    coverImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800',
    rating: 4.9,
    reviewCount: 456,
    location: 'İstanbul, Türkiye',
    verified: true,
    priceRange: '₺80K - ₺800K',
    description: 'Türkiye\'nin lider komedi ve stand-up booking ajansı',
    aboutLong: 'BKM (Beşiktaş Kültür Merkezi), 1989 yılından bu yana Türk komedi ve tiyatro sahnesinin en önemli yapım şirketidir. Cem Yılmaz, Ata Demirer gibi efsanevi isimleri bünyesinde barındıran BKM, stand-up, tiyatro ve sinema prodüksiyonlarında öncü konumdadır.',
    completedEvents: 2500,
    responseTime: '3 saat',
    yearsExperience: 35,
    teamSize: '30+ Sanatçı',
    phone: '+905321234569',
    email: 'booking@bkm.com.tr',
    website: 'www.bkmkitap.com',
    specialties: ['Stand-up', 'Komedi', 'Tiyatro', 'Sinema', 'Kurumsal'],
    services: ['Stand-up Show Booking', 'Tiyatro Prodüksiyon', 'Kurumsal Eğlence', 'Özel Gösterimler', 'Festival Koordinasyonu'],
    portfolio: [
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400',
      'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400',
    ],
    highlights: [
      { icon: 'happy', label: 'Komedi', value: '#1 Türkiye' },
      { icon: 'film', label: 'Sinema', value: '30+ Film' },
      { icon: 'people', label: 'Seyirci', value: '10M+' },
    ],
    artists: [
      { id: 'a1', name: 'Cem Yılmaz', genre: 'Stand-up', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400', priceRange: '₺400K - ₺800K', rating: 5.0, description: 'Türkiye\'nin en başarılı komedyeni' },
      { id: 'a2', name: 'Ata Demirer', genre: 'Komedi', image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400', priceRange: '₺200K - ₺450K', rating: 4.9, description: 'Sevilen komedyen ve oyuncu' },
      { id: 'a3', name: 'Yılmaz Erdoğan', genre: 'Tiyatro / Sinema', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', priceRange: '₺300K - ₺600K', rating: 4.9, description: 'Usta oyuncu, yönetmen ve senarist' },
      { id: 'a4', name: 'Demet Akbağ', genre: 'Komedi', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', priceRange: '₺150K - ₺350K', rating: 4.8, description: 'Türk komedisinin vazgeçilmez ismi' },
    ],
    reviews: [
      { id: 'r1', name: 'Corporate Fun', avatar: 'CF', rating: 5, date: '5 gün önce', text: 'Cem Yılmaz show\'u kurumsal etkinliğimizin yıldızı oldu. BKM ekibi çok profesyonel.', eventType: 'Kurumsal' },
    ],
  },
  'b4': {
    id: 'b4',
    name: 'Pozitif Live',
    category: 'booking',
    subcategory: 'Rock & Alternatif Booking',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400',
    coverImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    rating: 4.7,
    reviewCount: 198,
    location: 'İstanbul, Türkiye',
    verified: true,
    priceRange: '₺60K - ₺400K',
    description: 'Alternatif ve indie müzik odaklı booking ajansı',
    aboutLong: 'Pozitif Live, 2006 yılından bu yana Türkiye\'nin alternatif müzik sahnesinin nabzını tutuyor. Rock, indie ve alternatif müzik alanında öncü sanatçıları temsil eden ajansımız, festival ve konser organizasyonlarında uzmanlaşmıştır.',
    completedEvents: 620,
    responseTime: '1 saat',
    yearsExperience: 18,
    teamSize: '12+ Sanatçı',
    phone: '+905321234570',
    email: 'info@pozitiflive.com',
    website: 'www.pozitiflive.com',
    specialties: ['Rock', 'Alternatif', 'Indie', 'Festival', 'Club'],
    services: ['Band Booking', 'Festival Koordinasyonu', 'Turne Yönetimi', 'Konser Prodüksiyon', 'Club Night'],
    portfolio: [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    ],
    highlights: [
      { icon: 'musical-notes', label: 'Genre', value: 'Rock & Indie' },
      { icon: 'flame', label: 'Festival', value: '50+ Festival' },
      { icon: 'heart', label: 'Hayran', value: 'Kült Takipçi' },
    ],
    artists: [
      { id: 'a1', name: 'Duman', genre: 'Rock', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', priceRange: '₺200K - ₺400K', rating: 4.9, description: 'Türk rock müziğinin efsanesi' },
      { id: 'a2', name: 'Model', genre: 'Rock', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400', priceRange: '₺120K - ₺250K', rating: 4.7, description: 'Alternatif rock\'un güçlü sesi' },
      { id: 'a3', name: 'Manga', genre: 'Alternative Rock', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400', priceRange: '₺150K - ₺300K', rating: 4.8, description: 'Eurovision ikincisi, alternative rock grubu' },
      { id: 'a4', name: 'maNga', genre: 'Nu Metal', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', priceRange: '₺100K - ₺220K', rating: 4.6, description: 'Türkiye\'nin nu metal öncüsü' },
    ],
    reviews: [
      { id: 'r1', name: 'Rock Fest TR', avatar: 'RF', rating: 5, date: '1 hafta önce', text: 'Duman\'ı festivalimize Pozitif Live ile aldık. Her şey sorunsuz ilerledi.', eventType: 'Festival' },
    ],
  },
  'b5': {
    id: 'b5',
    name: 'DMC Turkey',
    category: 'booking',
    subcategory: 'DJ & Elektronik Müzik',
    image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400',
    coverImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
    rating: 4.8,
    reviewCount: 167,
    location: 'İstanbul, Türkiye',
    verified: true,
    priceRange: '₺30K - ₺300K',
    description: 'Uluslararası DJ ve elektronik müzik booking',
    aboutLong: 'DMC Turkey, elektronik müzik ve DJ booking alanında Türkiye\'nin lider ajansıdır. Yerli ve yabancı DJ\'leri temsil eden ajansımız, club night\'lardan festivallere kadar geniş bir yelpazede hizmet vermektedir.',
    completedEvents: 480,
    responseTime: '30 dk',
    yearsExperience: 15,
    teamSize: '25+ DJ',
    phone: '+905321234571',
    email: 'booking@dmcturkey.com',
    website: 'www.dmcturkey.com',
    specialties: ['EDM', 'House', 'Techno', 'Club', 'Festival'],
    services: ['DJ Booking', 'Club Night', 'Festival Set', 'Private Party', 'Corporate Event'],
    portfolio: [
      'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400',
      'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400',
    ],
    highlights: [
      { icon: 'disc', label: 'DJ', value: '25+ DJ' },
      { icon: 'musical-note', label: 'Genre', value: 'EDM / House' },
      { icon: 'globe', label: 'Network', value: 'Global' },
    ],
    artists: [
      { id: 'a1', name: 'DJ Burak Yeter', genre: 'EDM', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400', priceRange: '₺80K - ₺200K', rating: 4.8, description: 'Tuesday hit\'i ile dünya çapında tanınan DJ' },
      { id: 'a2', name: 'Mahmut Orhan', genre: 'Deep House', image: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400', priceRange: '₺60K - ₺150K', rating: 4.7, description: 'Deep house\'un Türk temsilcisi' },
      { id: 'a3', name: 'Ilkay Sencan', genre: 'House', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400', priceRange: '₺50K - ₺120K', rating: 4.6, description: 'Viral hit\'lerin prodüktörü' },
    ],
    reviews: [
      { id: 'r1', name: 'Club Istanbul', avatar: 'CI', rating: 5, date: '3 gün önce', text: 'DJ Burak Yeter performansı muhteşemdi. DMC Turkey ile çalışmak çok kolay.', eventType: 'Club' },
    ],
  },
  't1': {
    id: 't1',
    name: 'Pro Sound Istanbul',
    category: 'technical',
    subcategory: 'Ses Sistemleri',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
    rating: 4.9,
    reviewCount: 128,
    location: 'İstanbul, Türkiye',
    verified: true,
    priceRange: '₺50K - ₺150K',
    description: 'Profesyonel ses sistemleri ve akustik çözümler',
    aboutLong: 'Pro Sound Istanbul, 2006 yılından bu yana Türkiye\'nin önde gelen ses sistemi sağlayıcısıdır. D&B Audiotechnik, L-Acoustics ve JBL gibi dünya markalarının yetkili distribütörü olarak, konser, festival ve kurumsal etkinlikler için en kaliteli ses sistemlerini sunmaktayız.',
    completedEvents: 450,
    responseTime: '1 saat',
    yearsExperience: 18,
    teamSize: '12 kişilik teknik ekip',
    phone: '+905331234567',
    email: 'info@prosound.com.tr',
    website: 'www.prosound.com.tr',
    specialties: ['Line Array', 'Festival', 'Kurumsal', 'Arena', 'Açık Hava'],
    services: ['Ses Sistemi Kiralama', 'Teknik Kurulum', 'FOH/Monitor Mühendisliği', 'Akustik Danışmanlık', 'Backline'],
    portfolio: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
      'https://images.unsplash.com/photo-1504501650895-2441b7915699?w=400',
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
    ],
    highlights: [
      { icon: 'hardware-chip', label: 'Ekipman', value: 'D&B / L-Acoustics' },
      { icon: 'volume-high', label: 'Kapasite', value: '100K+ Kişi' },
      { icon: 'ribbon', label: 'Sertifika', value: 'ISO 9001' },
    ],
    reviews: [
      { id: 'r1', name: 'Event Masters', avatar: 'EM', rating: 5, date: '2 hafta önce', text: 'Çok profesyonel bir ekip. Etkinliğimiz için mükemmel bir ses sistemi kurdular. Kesinlikle tavsiye ederim.', eventType: 'Konser' },
      { id: 'r2', name: 'Festival Co.', avatar: 'FC', rating: 5, date: '1 ay önce', text: 'Büyük festivalde sorunsuz bir ses deneyimi sundular. Teknik destek harikaydı.', eventType: 'Festival' },
    ],
  },
  'tr1': {
    id: 'tr1',
    name: 'Elite VIP Transfer',
    category: 'transport',
    subcategory: 'VIP Ulaşım',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
    coverImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    rating: 4.8,
    reviewCount: 89,
    location: 'İstanbul, Türkiye',
    verified: true,
    priceRange: '₺5K - ₺25K',
    description: 'Premium VIP transfer ve lüks araç filosu',
    aboutLong: 'Elite VIP Transfer, 2012 yılından bu yana İstanbul\'un önde gelen VIP transfer hizmeti sağlayıcısıdır. Mercedes-Maybach, BMW 7 Series ve Mercedes V-Class araçlardan oluşan prestijli filomuzla, etkinlikleriniz için kusursuz bir ulaşım deneyimi sunuyoruz.',
    completedEvents: 890,
    responseTime: '30 dk',
    yearsExperience: 12,
    teamSize: '20 araçlık filo + 25 şoför',
    phone: '+905341234567',
    email: 'rezervasyon@elitevip.com.tr',
    website: 'www.elitevip.com.tr',
    specialties: ['VIP', 'Havalimanı', 'Kurumsal', 'Düğün', 'Protokol'],
    services: ['VIP Transfer', 'Havalimanı Karşılama', 'Şehir İçi Transfer', 'Şehirlerarası Transfer', 'Protokol Hizmeti'],
    portfolio: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400',
    ],
    highlights: [
      { icon: 'car-sport', label: 'Filo', value: '20+ Lüks Araç' },
      { icon: 'time', label: '7/24', value: 'Hizmet' },
      { icon: 'shield-checkmark', label: 'Sigorta', value: 'Tam Kapsamlı' },
    ],
    reviews: [
      { id: 'r1', name: 'Konser Org.', avatar: 'KO', rating: 5, date: '1 hafta önce', text: 'Sanatçı transferleri için mükemmel hizmet. Şoförler son derece profesyonel.', eventType: 'Konser' },
    ],
  },
  'v1': {
    id: 'v1',
    name: 'KüçükÇiftlik Park',
    category: 'venue',
    subcategory: 'Açık Hava Mekanı',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
    coverImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    rating: 4.9,
    reviewCount: 312,
    location: 'İstanbul, Maçka',
    verified: true,
    priceRange: '₺100K - ₺300K',
    description: 'İstanbul\'un ikonik açık hava konser mekanı',
    aboutLong: 'KüçükÇiftlik Park, İstanbul\'un kalbinde yer alan ve 15.000 kişi kapasiteli açık hava etkinlik mekanıdır. Eşsiz atmosferi ve merkezi konumuyla yerli ve yabancı sanatçıların vazgeçilmez tercihi olmuştur.',
    completedEvents: 180,
    responseTime: '3 saat',
    yearsExperience: 20,
    teamSize: '15.000 kişi kapasite',
    phone: '+905351234567',
    email: 'etkinlik@kucukciftlik.com',
    website: 'www.kucukciftlikpark.com',
    specialties: ['Konser', 'Festival', 'Açık Hava', 'Kurumsal', 'Lansman'],
    services: ['Mekan Kiralama', 'Teknik Altyapı', 'Backstage', 'Catering Alanı', 'VIP Bölüm'],
    portfolio: [
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400',
    ],
    highlights: [
      { icon: 'people', label: 'Kapasite', value: '15.000 Kişi' },
      { icon: 'location', label: 'Konum', value: 'Şehir Merkezi' },
      { icon: 'star', label: 'Puan', value: '4.9/5' },
    ],
    reviews: [
      { id: 'r1', name: 'Major Events', avatar: 'ME', rating: 5, date: '3 gün önce', text: 'Harika bir mekan, teknik altyapı çok iyi. Her etkinlik için tercih ediyoruz.', eventType: 'Festival' },
    ],
  },
};

// Get provider detail by ID
export const getProviderDetail = (id: string): ProviderDetail => {
  if (providersDetail[id]) {
    return providersDetail[id];
  }
  return providersDetail['t1'];
};
