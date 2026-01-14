import { gradients } from '../theme/colors';

// Types
export interface Filters {
  city: string | null;
  minRating: number | null;
  budgetRange: string | null;
}

export interface Provider {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  description: string;
  city: string;
  teamSize: string;
  image: string;
  previouslyWorked: boolean;
  phone: string;
  verified: boolean;
  yearsExperience: number;
  completedEvents: number;
  priceRange: string;
  responseTime: string;
  specialties: string[];
  subcategory?: string; // For operation subcategories
}

export type FilterTab = 'all' | 'worked';

// Constants
export const cities = ['İstanbul', 'Ankara', 'İzmir'];
export const ratingOptions = [4.5, 4.0, 3.5];
export const budgetRanges = [
  { id: 'low', label: '₺0 - ₺50.000', min: 0, max: 50000 },
  { id: 'mid', label: '₺50.000 - ₺150.000', min: 50000, max: 150000 },
  { id: 'high', label: '₺150.000+', min: 150000, max: Infinity },
];

// Category configurations
export const categoryConfig: Record<string, { title: string; gradient: readonly [string, string, ...string[]]; icon: string }> = {
  booking: { title: 'Booking', gradient: ['#9333ea', '#7c3aed'], icon: 'musical-notes' },
  technical: { title: 'Teknik', gradient: ['#059669', '#34d399'], icon: 'volume-high' },
  transport: { title: 'Ulaşım', gradient: ['#dc2626', '#f87171'], icon: 'car' },
  venue: { title: 'Mekan', gradient: ['#2563eb', '#60a5fa'], icon: 'business' },
  accommodation: { title: 'Konaklama', gradient: ['#db2777', '#f472b6'], icon: 'bed' },
  operation: { title: 'Operasyon', gradient: ['#d97706', '#fbbf24'], icon: 'settings' },
  flight: { title: 'Uçak', gradient: ['#475569', '#94a3b8'], icon: 'airplane' },
  // Operation sub-categories (all orange)
  security: { title: 'Güvenlik', gradient: ['#d97706', '#fbbf24'], icon: 'shield' },
  catering: { title: 'Catering', gradient: ['#d97706', '#fbbf24'], icon: 'restaurant' },
  generator: { title: 'Jeneratör', gradient: ['#d97706', '#fbbf24'], icon: 'flash' },
  beverage: { title: 'İçecek', gradient: ['#d97706', '#fbbf24'], icon: 'cafe' },
  medical: { title: 'Medikal', gradient: ['#d97706', '#fbbf24'], icon: 'medkit' },
  sanitation: { title: 'Sanitasyon', gradient: ['#d97706', '#fbbf24'], icon: 'trash' },
  media: { title: 'Medya', gradient: ['#d97706', '#fbbf24'], icon: 'camera' },
  barrier: { title: 'Bariyer', gradient: ['#d97706', '#fbbf24'], icon: 'remove' },
  tent: { title: 'Çadır', gradient: ['#d97706', '#fbbf24'], icon: 'home' },
  ticketing: { title: 'Ticketing', gradient: ['#d97706', '#fbbf24'], icon: 'ticket' },
  decoration: { title: 'Dekorasyon', gradient: ['#d97706', '#fbbf24'], icon: 'color-palette' },
  production: { title: 'Prodüksiyon', gradient: ['#d97706', '#fbbf24'], icon: 'film' },
};

// Mock providers by category
export const getProvidersByCategory = (category: string): Provider[] => {
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory === 'booking') {
    return [
      { id: 'b1', name: 'Atlantis Yapım', rating: 4.9, reviewCount: 342, description: 'Türkiye\'nin önde gelen sanatçı yönetim ve booking ajansı. Athena, Melike Şahin, Pinhani gibi sanatçıların temsilcisi.', city: 'İstanbul', teamSize: '15+ Sanatçı', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', previouslyWorked: true, phone: '+905321234567', verified: true, yearsExperience: 22, completedEvents: 850, priceRange: '₺50K - ₺500K', responseTime: '1 saat', specialties: ['Rock', 'Pop', 'Alternatif', 'Festival'] },
      { id: 'b2', name: 'Poll Production', rating: 4.8, reviewCount: 287, description: 'Uluslararası sanatçı booking ve prodüksiyon. Tarkan, Sıla, Murat Boz temsilcisi.', city: 'İstanbul', teamSize: '20+ Sanatçı', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', previouslyWorked: true, phone: '+905321234568', verified: true, yearsExperience: 28, completedEvents: 1200, priceRange: '₺100K - ₺1M', responseTime: '2 saat', specialties: ['Pop', 'Türk Pop', 'Gala', 'Kurumsal'] },
      { id: 'b3', name: 'BKM Organizasyon', rating: 4.9, reviewCount: 456, description: 'Komedi ve stand-up booking. Cem Yılmaz, Ata Demirer, Yılmaz Erdoğan prodüksiyonları.', city: 'İstanbul', teamSize: '30+ Sanatçı', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400', previouslyWorked: false, phone: '+905321234569', verified: true, yearsExperience: 35, completedEvents: 2500, priceRange: '₺80K - ₺800K', responseTime: '3 saat', specialties: ['Stand-up', 'Komedi', 'Tiyatro', 'Sinema'] },
      { id: 'b4', name: 'Pozitif Live', rating: 4.7, reviewCount: 198, description: 'Alternatif ve indie müzik odaklı booking ajansı. Duman, Model, Manga temsilcisi.', city: 'İstanbul', teamSize: '12+ Sanatçı', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400', previouslyWorked: false, phone: '+905321234570', verified: true, yearsExperience: 18, completedEvents: 620, priceRange: '₺60K - ₺400K', responseTime: '1 saat', specialties: ['Rock', 'Alternatif', 'Indie', 'Festival'] },
      { id: 'b5', name: 'DMC Turkey', rating: 4.8, reviewCount: 167, description: 'Uluslararası DJ ve elektronik müzik booking. DJ\'ler ve prodüktörler için Türkiye temsilcisi.', city: 'İstanbul', teamSize: '25+ DJ', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400', previouslyWorked: true, phone: '+905321234571', verified: true, yearsExperience: 15, completedEvents: 480, priceRange: '₺30K - ₺300K', responseTime: '30 dk', specialties: ['EDM', 'House', 'Techno', 'Club'] },
      { id: 'b6', name: 'Türk Sanat Müziği Ajansı', rating: 4.6, reviewCount: 134, description: 'Geleneksel Türk müziği ve sanat müziği sanatçıları. Muazzez Ersoy, Ferdi Tayfur temsilcisi.', city: 'Ankara', teamSize: '18+ Sanatçı', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400', previouslyWorked: false, phone: '+905321234572', verified: true, yearsExperience: 32, completedEvents: 920, priceRange: '₺40K - ₺250K', responseTime: '2 saat', specialties: ['TSM', 'Arabesk', 'Nostalji', 'Gala'] },
    ];
  }

  if (normalizedCategory === 'technical') {
    return [
      { id: 't1', name: 'Pro Sound Istanbul', rating: 4.9, reviewCount: 128, description: 'Türkiye\'nin lider ses sistemi sağlayıcısı. Line array ve festival sistemleri.', city: 'İstanbul', teamSize: '12 kişilik ekip', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400', previouslyWorked: true, phone: '+905331234567', verified: true, yearsExperience: 18, completedEvents: 450, priceRange: '₺50K - ₺150K', responseTime: '1 saat', specialties: ['Line Array', 'Festival', 'Kurumsal'] },
      { id: 't2', name: 'LightShow Pro', rating: 4.7, reviewCount: 98, description: 'Yaratıcı sahne aydınlatması ve görsel efektler.', city: 'İzmir', teamSize: '8 kişilik ekip', image: 'https://images.unsplash.com/photo-1504501650895-2441b7915699?w=400', previouslyWorked: false, phone: '+905331234568', verified: true, yearsExperience: 10, completedEvents: 280, priceRange: '₺30K - ₺100K', responseTime: '2 saat', specialties: ['LED', 'Lazer', 'Moving Head'] },
      { id: 't3', name: 'Stage Tech', rating: 4.6, reviewCount: 156, description: 'Komple sahne kurulum ve teknik prodüksiyon.', city: 'Ankara', teamSize: '15 kişilik ekip', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400', previouslyWorked: true, phone: '+905331234569', verified: true, yearsExperience: 14, completedEvents: 380, priceRange: '₺40K - ₺120K', responseTime: '1 saat', specialties: ['Sahne', 'Rigging', 'Backline'] },
      { id: 't4', name: 'Audio Masters', rating: 4.8, reviewCount: 87, description: 'Stüdyo kalitesinde canlı ses mühendisliği.', city: 'İstanbul', teamSize: '6 kişilik ekip', image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400', previouslyWorked: false, phone: '+905331234570', verified: true, yearsExperience: 12, completedEvents: 320, priceRange: '₺25K - ₺80K', responseTime: '45 dk', specialties: ['FOH', 'Monitor', 'Broadcast'] },
    ];
  }

  if (normalizedCategory === 'transport') {
    return [
      { id: 'tr1', name: 'Elite VIP Transfer', rating: 4.8, reviewCount: 89, description: 'Premium VIP transfer ve lüks araç filosu.', city: 'İstanbul', teamSize: '20 araçlık filo', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400', previouslyWorked: true, phone: '+905341234567', verified: true, yearsExperience: 12, completedEvents: 890, priceRange: '₺5K - ₺25K', responseTime: '30 dk', specialties: ['VIP', 'Havalimanı', 'Kurumsal'] },
      { id: 'tr2', name: 'Star Limousine', rating: 4.6, reviewCount: 67, description: 'Özel limuzin ve protokol araçları.', city: 'Ankara', teamSize: '15 araçlık filo', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400', previouslyWorked: false, phone: '+905341234568', verified: true, yearsExperience: 8, completedEvents: 450, priceRange: '₺3K - ₺15K', responseTime: '1 saat', specialties: ['Limuzin', 'Düğün', 'Protokol'] },
      { id: 'tr3', name: 'Comfort Fleet', rating: 4.5, reviewCount: 112, description: 'Grup transferleri ve şehirlerarası ulaşım.', city: 'İzmir', teamSize: '30 araçlık filo', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400', previouslyWorked: false, phone: '+905341234569', verified: true, yearsExperience: 15, completedEvents: 680, priceRange: '₺2K - ₺10K', responseTime: '45 dk', specialties: ['Grup', 'Tur', 'Festival'] },
    ];
  }

  if (normalizedCategory === 'venue') {
    return [
      { id: 'v1', name: 'KüçükÇiftlik Park', rating: 4.9, reviewCount: 312, description: 'İstanbul\'un ikonik açık hava konser mekanı.', city: 'İstanbul', teamSize: '15.000 kapasite', image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400', previouslyWorked: true, phone: '+905351234567', verified: true, yearsExperience: 20, completedEvents: 180, priceRange: '₺100K - ₺300K', responseTime: '3 saat', specialties: ['Konser', 'Festival', 'Açık Hava'] },
      { id: 'v2', name: 'Volkswagen Arena', rating: 4.8, reviewCount: 245, description: 'Modern kapalı arena ve kongre merkezi.', city: 'İstanbul', teamSize: '5.000 kapasite', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400', previouslyWorked: false, phone: '+905351234568', verified: true, yearsExperience: 10, completedEvents: 420, priceRange: '₺80K - ₺250K', responseTime: '2 saat', specialties: ['Arena', 'Kongre', 'Kapalı'] },
      { id: 'v3', name: 'Congresium', rating: 4.7, reviewCount: 178, description: 'Ankara\'nın en büyük kongre ve etkinlik merkezi.', city: 'Ankara', teamSize: '3.000 kapasite', image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400', previouslyWorked: false, phone: '+905351234569', verified: true, yearsExperience: 15, completedEvents: 350, priceRange: '₺60K - ₺180K', responseTime: '2 saat', specialties: ['Kongre', 'Kurumsal', 'Fuar'] },
    ];
  }

  if (normalizedCategory === 'accommodation') {
    return [
      { id: 'a1', name: 'Grand Hyatt', rating: 4.9, reviewCount: 420, description: 'Ultra lüks konaklama ve MICE hizmetleri.', city: 'İstanbul', teamSize: '400 oda', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', previouslyWorked: true, phone: '+905361234567', verified: true, yearsExperience: 25, completedEvents: 560, priceRange: '₺2K - ₺10K/gece', responseTime: '1 saat', specialties: ['MICE', 'Gala', 'VIP'] },
      { id: 'a2', name: 'Swissotel', rating: 4.8, reviewCount: 380, description: 'Business ve etkinlik odaklı 5 yıldızlı otel.', city: 'İstanbul', teamSize: '600 oda', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', previouslyWorked: false, phone: '+905361234568', verified: true, yearsExperience: 20, completedEvents: 480, priceRange: '₺1.5K - ₺8K/gece', responseTime: '1 saat', specialties: ['Business', 'Toplantı', 'Balo'] },
      { id: 'a3', name: 'JW Marriott', rating: 4.7, reviewCount: 290, description: 'Lüks konaklama ve kurumsal etkinlik çözümleri.', city: 'Ankara', teamSize: '350 oda', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', previouslyWorked: false, phone: '+905361234569', verified: true, yearsExperience: 12, completedEvents: 320, priceRange: '₺1.5K - ₺6K/gece', responseTime: '2 saat', specialties: ['Kurumsal', 'Düğün', 'Kokteyl'] },
    ];
  }

  if (normalizedCategory === 'flight') {
    return [
      { id: 'f1', name: 'Jet Aviation', rating: 4.9, reviewCount: 56, description: 'VIP jet kiralama ve özel uçuş hizmetleri.', city: 'İstanbul', teamSize: '12 uçak', image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400', previouslyWorked: false, phone: '+905371234567', verified: true, yearsExperience: 18, completedEvents: 890, priceRange: '₺50K - ₺200K', responseTime: '1 saat', specialties: ['Jet', 'VIP', 'Uluslararası'] },
      { id: 'f2', name: 'Sky Charter', rating: 4.7, reviewCount: 34, description: 'Charter uçuş ve grup seyahatleri.', city: 'Ankara', teamSize: '8 uçak', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400', previouslyWorked: false, phone: '+905371234568', verified: true, yearsExperience: 10, completedEvents: 450, priceRange: '₺30K - ₺120K', responseTime: '2 saat', specialties: ['Charter', 'Grup', 'Yurtiçi'] },
      { id: 'f3', name: 'Heli Turkey', rating: 4.6, reviewCount: 28, description: 'Helikopter kiralama ve hava taksi.', city: 'İstanbul', teamSize: '6 helikopter', image: 'https://images.unsplash.com/photo-1534321238895-da3ab632df3e?w=400', previouslyWorked: true, phone: '+905371234569', verified: true, yearsExperience: 8, completedEvents: 320, priceRange: '₺15K - ₺60K', responseTime: '30 dk', specialties: ['Helikopter', 'Transfer', 'Çekim'] },
    ];
  }

  // Operation - return all or filter by subcategory
  const operationProviders: Provider[] = [
    // Security - Güvenlik
    { id: 'sec1', name: 'SecurePro Güvenlik', rating: 4.8, reviewCount: 156, description: 'Profesyonel etkinlik güvenliği ve kalabalık yönetimi.', city: 'İstanbul', teamSize: '50 kişilik ekip', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400', previouslyWorked: true, phone: '+905381234567', verified: true, yearsExperience: 15, completedEvents: 380, priceRange: '₺20K - ₺80K', responseTime: '2 saat', specialties: ['Güvenlik', 'VIP Koruma', 'Kalabalık'], subcategory: 'security' },
    { id: 'sec2', name: 'Shield Security', rating: 4.7, reviewCount: 124, description: 'Festival ve konser güvenliği uzmanı.', city: 'İstanbul', teamSize: '80 kişilik ekip', image: 'https://images.unsplash.com/photo-1553531889-56cc480ac5cb?w=400', previouslyWorked: false, phone: '+905381234580', verified: true, yearsExperience: 12, completedEvents: 290, priceRange: '₺15K - ₺60K', responseTime: '1 saat', specialties: ['Festival', 'Konser', 'Giriş Kontrol'], subcategory: 'security' },
    { id: 'sec3', name: 'Elite Guard', rating: 4.6, reviewCount: 89, description: 'VIP koruma ve özel güvenlik hizmetleri.', city: 'Ankara', teamSize: '35 kişilik ekip', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', previouslyWorked: true, phone: '+905381234581', verified: true, yearsExperience: 20, completedEvents: 450, priceRange: '₺25K - ₺100K', responseTime: '30 dk', specialties: ['VIP', 'Kurumsal', 'Protokol'], subcategory: 'security' },

    // Catering
    { id: 'cat1', name: 'Lezzet Catering', rating: 4.7, reviewCount: 203, description: 'Premium catering ve gastronomi deneyimleri.', city: 'İstanbul', teamSize: '30 kişilik ekip', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400', previouslyWorked: false, phone: '+905381234568', verified: true, yearsExperience: 12, completedEvents: 520, priceRange: '₺30K - ₺150K', responseTime: '1 saat', specialties: ['Catering', 'Fine Dining', 'Kokteyl'], subcategory: 'catering' },
    { id: 'cat2', name: 'Feast Events', rating: 4.9, reviewCount: 287, description: 'Büyük ölçekli etkinlik catering ve tabldot hizmetleri.', city: 'İstanbul', teamSize: '45 kişilik ekip', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', previouslyWorked: true, phone: '+905381234582', verified: true, yearsExperience: 18, completedEvents: 680, priceRange: '₺50K - ₺250K', responseTime: '2 saat', specialties: ['Tabldot', 'Festival', 'Kurumsal'], subcategory: 'catering' },
    { id: 'cat3', name: 'Gourmet Station', rating: 4.6, reviewCount: 145, description: 'Butik catering ve özel menü tasarımı.', city: 'İzmir', teamSize: '20 kişilik ekip', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', previouslyWorked: false, phone: '+905381234583', verified: true, yearsExperience: 8, completedEvents: 340, priceRange: '₺20K - ₺80K', responseTime: '1 saat', specialties: ['Butik', 'Düğün', 'Kokteyl'], subcategory: 'catering' },

    // Generator - Jeneratör
    { id: 'gen1', name: 'Power Gen', rating: 4.6, reviewCount: 89, description: 'Mobil enerji çözümleri ve jeneratör hizmetleri.', city: 'Ankara', teamSize: '20 jeneratör', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', previouslyWorked: true, phone: '+905381234569', verified: true, yearsExperience: 18, completedEvents: 450, priceRange: '₺10K - ₺50K', responseTime: '1 saat', specialties: ['Jeneratör', 'Enerji', 'Açık Hava'], subcategory: 'generator' },
    { id: 'gen2', name: 'Energy Solutions', rating: 4.8, reviewCount: 112, description: 'Sessiz jeneratörler ve kesintisiz güç sistemleri.', city: 'İstanbul', teamSize: '35 jeneratör', image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400', previouslyWorked: false, phone: '+905381234584', verified: true, yearsExperience: 15, completedEvents: 520, priceRange: '₺15K - ₺70K', responseTime: '45 dk', specialties: ['Sessiz', 'Festival', 'Kurumsal'], subcategory: 'generator' },

    // Beverage - İçecek Hizmetleri
    { id: 'bev1', name: 'Bar Masters', rating: 4.8, reviewCount: 178, description: 'Profesyonel bar hizmetleri ve miksoloji.', city: 'İstanbul', teamSize: '15 barmen', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400', previouslyWorked: true, phone: '+905381234585', verified: true, yearsExperience: 10, completedEvents: 420, priceRange: '₺15K - ₺60K', responseTime: '1 saat', specialties: ['Kokteyl', 'Bar', 'Miksoloji'], subcategory: 'beverage' },
    { id: 'bev2', name: 'Drink Station', rating: 4.5, reviewCount: 95, description: 'Mobil bar ve içecek istasyonları.', city: 'Ankara', teamSize: '10 barmen', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400', previouslyWorked: false, phone: '+905381234586', verified: true, yearsExperience: 6, completedEvents: 180, priceRange: '₺8K - ₺35K', responseTime: '2 saat', specialties: ['Mobil Bar', 'Festival', 'Açık Hava'], subcategory: 'beverage' },

    // Medical - Medikal
    { id: 'med1', name: 'Event Medical', rating: 4.9, reviewCount: 134, description: 'Etkinlik sağlık hizmetleri ve ilk yardım ekipleri.', city: 'İstanbul', teamSize: '20 sağlık personeli', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400', previouslyWorked: true, phone: '+905381234587', verified: true, yearsExperience: 12, completedEvents: 380, priceRange: '₺12K - ₺45K', responseTime: '15 dk', specialties: ['İlk Yardım', 'Ambulans', 'Festival'], subcategory: 'medical' },
    { id: 'med2', name: 'SafeHealth', rating: 4.7, reviewCount: 89, description: 'Mobil sağlık ünitesi ve acil müdahale.', city: 'İzmir', teamSize: '15 sağlık personeli', image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400', previouslyWorked: false, phone: '+905381234588', verified: true, yearsExperience: 8, completedEvents: 220, priceRange: '₺10K - ₺40K', responseTime: '20 dk', specialties: ['Mobil Ünite', 'Konser', 'Spor'], subcategory: 'medical' },

    // Sanitation - Sanitasyon
    { id: 'san1', name: 'Clean Event', rating: 4.5, reviewCount: 67, description: 'Etkinlik temizlik ve çevre düzenleme hizmetleri.', city: 'İzmir', teamSize: '25 kişilik ekip', image: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=400', previouslyWorked: false, phone: '+905381234570', verified: true, yearsExperience: 8, completedEvents: 280, priceRange: '₺8K - ₺35K', responseTime: '2 saat', specialties: ['Temizlik', 'Atık', 'Sanitasyon'], subcategory: 'sanitation' },
    { id: 'san2', name: 'Eco Sanitation', rating: 4.6, reviewCount: 98, description: 'Çevre dostu sanitasyon ve portatif tuvalet hizmetleri.', city: 'İstanbul', teamSize: '40 ünite', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400', previouslyWorked: true, phone: '+905381234589', verified: true, yearsExperience: 14, completedEvents: 450, priceRange: '₺15K - ₺60K', responseTime: '1 saat', specialties: ['Portatif WC', 'Festival', 'Açık Hava'], subcategory: 'sanitation' },

    // Media - Medya
    { id: 'med_a1', name: 'Event Media Pro', rating: 4.8, reviewCount: 156, description: 'Profesyonel etkinlik fotoğraf ve video çekimi.', city: 'İstanbul', teamSize: '12 kişilik ekip', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400', previouslyWorked: true, phone: '+905381234590', verified: true, yearsExperience: 15, completedEvents: 620, priceRange: '₺10K - ₺50K', responseTime: '1 saat', specialties: ['Fotoğraf', 'Video', 'Drone'], subcategory: 'media' },
    { id: 'med_a2', name: 'Live Broadcast', rating: 4.7, reviewCount: 89, description: 'Canlı yayın ve streaming hizmetleri.', city: 'Ankara', teamSize: '8 kişilik ekip', image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400', previouslyWorked: false, phone: '+905381234591', verified: true, yearsExperience: 8, completedEvents: 280, priceRange: '₺20K - ₺80K', responseTime: '2 saat', specialties: ['Canlı Yayın', 'Streaming', 'Kurumsal'], subcategory: 'media' },

    // Barrier - Bariyer
    { id: 'bar1', name: 'Barrier Systems', rating: 4.6, reviewCount: 78, description: 'Profesyonel bariyer ve kalabalık yönetim sistemleri.', city: 'İstanbul', teamSize: '500+ bariyer', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400', previouslyWorked: true, phone: '+905381234592', verified: true, yearsExperience: 12, completedEvents: 380, priceRange: '₺8K - ₺40K', responseTime: '1 saat', specialties: ['Bariyer', 'Festival', 'Konser'], subcategory: 'barrier' },
    { id: 'bar2', name: 'CrowdControl TR', rating: 4.5, reviewCount: 56, description: 'Kalabalık kontrol ekipmanları ve VIP bölme sistemleri.', city: 'Ankara', teamSize: '300+ bariyer', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400', previouslyWorked: false, phone: '+905381234593', verified: true, yearsExperience: 9, completedEvents: 220, priceRange: '₺5K - ₺25K', responseTime: '2 saat', specialties: ['VIP Bölme', 'Kuyruk', 'Giriş'], subcategory: 'barrier' },

    // Tent - Çadır
    { id: 'ten1', name: 'Tent Masters', rating: 4.8, reviewCount: 134, description: 'Premium çadır ve tente sistemleri.', city: 'İstanbul', teamSize: '50+ çadır', image: 'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=400', previouslyWorked: true, phone: '+905381234594', verified: true, yearsExperience: 18, completedEvents: 520, priceRange: '₺20K - ₺100K', responseTime: '3 saat', specialties: ['Çadır', 'Festival', 'Düğün'], subcategory: 'tent' },
    { id: 'ten2', name: 'Event Structures', rating: 4.6, reviewCount: 89, description: 'Geçici yapı ve büyük ölçekli çadır kurulumları.', city: 'İzmir', teamSize: '30+ çadır', image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400', previouslyWorked: false, phone: '+905381234595', verified: true, yearsExperience: 10, completedEvents: 280, priceRange: '₺15K - ₺70K', responseTime: '4 saat', specialties: ['Büyük Çadır', 'Fuar', 'Kurumsal'], subcategory: 'tent' },

    // Ticketing
    { id: 'tic1', name: 'Biletix Pro', rating: 4.9, reviewCount: 245, description: 'Entegre bilet satış ve giriş kontrol sistemleri.', city: 'İstanbul', teamSize: '20 kişilik ekip', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400', previouslyWorked: true, phone: '+905381234596', verified: true, yearsExperience: 15, completedEvents: 850, priceRange: '%3-5 komisyon', responseTime: '30 dk', specialties: ['Online Satış', 'Giriş Kontrol', 'RFID'], subcategory: 'ticketing' },
    { id: 'tic2', name: 'Ticket Stream', rating: 4.7, reviewCount: 167, description: 'Mobil bilet ve QR kod giriş sistemleri.', city: 'Ankara', teamSize: '12 kişilik ekip', image: 'https://images.unsplash.com/photo-1485872299829-c673f5194813?w=400', previouslyWorked: false, phone: '+905381234597', verified: true, yearsExperience: 8, completedEvents: 420, priceRange: '%2-4 komisyon', responseTime: '1 saat', specialties: ['Mobil Bilet', 'QR', 'Festival'], subcategory: 'ticketing' },

    // Decoration - Dekorasyon
    { id: 'dec1', name: 'Decor Events', rating: 4.8, reviewCount: 189, description: 'Yaratıcı etkinlik dekorasyonu ve sahne tasarımı.', city: 'İstanbul', teamSize: '25 kişilik ekip', image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400', previouslyWorked: true, phone: '+905381234598', verified: true, yearsExperience: 14, completedEvents: 480, priceRange: '₺25K - ₺120K', responseTime: '2 saat', specialties: ['Sahne', 'Tema', 'Kurumsal'], subcategory: 'decoration' },
    { id: 'dec2', name: 'Floral Design', rating: 4.6, reviewCount: 123, description: 'Çiçek düzenlemeleri ve botanik dekorasyon.', city: 'İzmir', teamSize: '15 kişilik ekip', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400', previouslyWorked: false, phone: '+905381234599', verified: true, yearsExperience: 10, completedEvents: 320, priceRange: '₺10K - ₺50K', responseTime: '1 saat', specialties: ['Çiçek', 'Düğün', 'Gala'], subcategory: 'decoration' },

    // Production - Prodüksiyon
    { id: 'pro1', name: 'Stage Production', rating: 4.9, reviewCount: 198, description: 'Komple sahne prodüksiyonu ve teknik koordinasyon.', city: 'İstanbul', teamSize: '40 kişilik ekip', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', previouslyWorked: true, phone: '+905381234600', verified: true, yearsExperience: 20, completedEvents: 680, priceRange: '₺80K - ₺400K', responseTime: '3 saat', specialties: ['Sahne', 'Festival', 'Konser'], subcategory: 'production' },
    { id: 'pro2', name: 'Creative Productions', rating: 4.7, reviewCount: 145, description: 'Kurumsal etkinlik prodüksiyonu ve içerik üretimi.', city: 'Ankara', teamSize: '25 kişilik ekip', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400', previouslyWorked: false, phone: '+905381234601', verified: true, yearsExperience: 12, completedEvents: 380, priceRange: '₺40K - ₺200K', responseTime: '2 saat', specialties: ['Kurumsal', 'Lansman', 'Kongre'], subcategory: 'production' },

    // Flight - Uçak Hizmetleri (now under operation)
    { id: 'fli1', name: 'Jet Set Travel', rating: 4.8, reviewCount: 45, description: 'Sanatçı ve VIP uçuş organizasyonları.', city: 'İstanbul', teamSize: '12 uçak', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400', previouslyWorked: true, phone: '+905371234567', verified: true, yearsExperience: 15, completedEvents: 380, priceRange: '₺50K - ₺200K', responseTime: '1 saat', specialties: ['Özel Jet', 'VIP', 'Sanatçı'], subcategory: 'flight' },
    { id: 'fli2', name: 'Sky Charter', rating: 4.7, reviewCount: 34, description: 'Charter uçuş ve grup seyahatleri.', city: 'Ankara', teamSize: '8 uçak', image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400', previouslyWorked: false, phone: '+905371234568', verified: true, yearsExperience: 10, completedEvents: 220, priceRange: '₺30K - ₺120K', responseTime: '2 saat', specialties: ['Charter', 'Grup', 'Yurtiçi'], subcategory: 'flight' },
  ];

  // If subcategory is specified, filter by it
  if (normalizedCategory.startsWith('operation:')) {
    const subcategory = normalizedCategory.split(':')[1];
    return operationProviders.filter(p => p.subcategory === subcategory);
  }

  // Check if it's a direct subcategory request
  const subcategories = ['security', 'catering', 'generator', 'beverage', 'medical', 'sanitation', 'media', 'barrier', 'tent', 'ticketing', 'decoration', 'production', 'flight'];
  if (subcategories.includes(normalizedCategory)) {
    return operationProviders.filter(p => p.subcategory === normalizedCategory);
  }

  // Return all operation providers if just 'operation'
  return operationProviders;
};
