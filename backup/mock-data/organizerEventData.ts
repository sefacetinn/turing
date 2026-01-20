import { Ionicons } from '@expo/vector-icons';
import { gradients, ThemeColors } from '../theme/colors';

// Types
export interface Service {
  id: string;
  category: string;
  name: string;
  status: string;
  provider: string | null;
  providerId?: string;
  providerPhone?: string;
  providerImage?: string;
  price: number;
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'milestone' | 'task' | 'payment' | 'update';
  completed: boolean;
}

export interface EventBudgetItem {
  id: string;
  category: string;
  name: string;
  budgeted: number;
  spent: number;
  status: 'under' | 'on_track' | 'over';
}

export interface EventTeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  image: string;
  isLead: boolean;
}

// Category info helper
export const getCategoryInfo = (category: string) => {
  const categories: Record<string, { name: string; icon: keyof typeof Ionicons.glyphMap; gradient: readonly [string, string] }> = {
    booking: { name: 'Booking', icon: 'musical-notes', gradient: gradients.booking },
    technical: { name: 'Teknik', icon: 'volume-high', gradient: gradients.technical },
    venue: { name: 'Mekan', icon: 'business', gradient: gradients.venue },
    accommodation: { name: 'Konaklama', icon: 'bed', gradient: gradients.accommodation },
    transport: { name: 'Ulaşım', icon: 'car', gradient: gradients.transport },
    flight: { name: 'Uçak', icon: 'airplane', gradient: gradients.flight },
    operation: { name: 'Operasyon', icon: 'settings', gradient: gradients.operation },
    security: { name: 'Güvenlik', icon: 'shield', gradient: ['#ef4444', '#dc2626'] as const },
    catering: { name: 'Catering', icon: 'restaurant', gradient: ['#f97316', '#ea580c'] as const },
  };
  return categories[category] || { name: category, icon: 'help-circle' as const, gradient: gradients.primary };
};

// Big Bang Summer Festival 2026 - Timeline
export const bigBangFestivalTimeline: TimelineItem[] = [
  { id: 't1', title: 'Etkinlik Oluşturuldu', description: 'Festival taslağı ve konsepti hazırlandı', date: '15 Ocak 2026', type: 'milestone', completed: true },
  { id: 't2', title: 'Mekan Rezervasyonu', description: 'KüçükÇiftlik Park 3 günlük rezervasyon onaylandı', date: '22 Ocak 2026', type: 'task', completed: true },
  { id: 't3', title: 'Sanatçı Anlaşmaları - Faz 1', description: 'Tarkan ve Sıla ile ön anlaşma imzalandı', date: '5 Şubat 2026', type: 'milestone', completed: true },
  { id: 't4', title: 'Mekan Ön Ödemesi', description: '₺180.000 mekan kapora ödemesi yapıldı', date: '10 Şubat 2026', type: 'payment', completed: true },
  { id: 't5', title: 'Teknik Teklif Süreci', description: 'Ses ve ışık sistemleri için teklif talepleri gönderildi', date: '20 Şubat 2026', type: 'task', completed: true },
  { id: 't6', title: 'Sanatçı Sözleşmeleri', description: 'Tarkan, Sıla, Mor ve Ötesi, DJ Mahmut Orhan sözleşmeleri imzalandı', date: '1 Mart 2026', type: 'milestone', completed: true },
  { id: 't7', title: 'Sanatçı Ön Ödemeleri', description: '₺850.000 sanatçı avans ödemesi yapıldı', date: '5 Mart 2026', type: 'payment', completed: true },
  { id: 't8', title: 'Teknik Ekip Seçimi', description: 'Mega Sound Pro ses, LightShow Pro ışık için seçildi', date: '15 Mart 2026', type: 'task', completed: true },
  { id: 't9', title: 'Sponsor Görüşmeleri', description: 'Red Bull ve Coca-Cola sponsorluk anlaşmaları', date: '1 Nisan 2026', type: 'update', completed: true },
  { id: 't10', title: 'Bilet Satışları Başladı', description: 'Early bird biletler satışa sunuldu', date: '15 Nisan 2026', type: 'milestone', completed: true },
  { id: 't11', title: 'Güvenlik Planlaması', description: 'SecureGuard Events ile güvenlik protokolü belirlendi', date: '1 Mayıs 2026', type: 'task', completed: true },
  { id: 't12', title: 'Konaklama Anlaşmaları', description: 'Swissôtel ve Hilton ile sanatçı konaklaması onaylandı', date: '15 Mayıs 2026', type: 'task', completed: false },
  { id: 't13', title: 'Catering Onayı', description: 'VIP ve backstage catering detayları finalize edilecek', date: '1 Haziran 2026', type: 'task', completed: false },
  { id: 't14', title: 'Teknik Kurulum Başlangıcı', description: 'Sahne, ses ve ışık kurulumu', date: '13 Temmuz 2026', type: 'task', completed: false },
  { id: 't15', title: 'Ses Kontrolü', description: 'Tüm sanatçılarla ses kontrolü', date: '14 Temmuz 2026', type: 'task', completed: false },
  { id: 't16', title: 'Festival Başlangıcı', description: 'Big Bang Summer Festival 2026 başlıyor!', date: '15 Temmuz 2026', type: 'milestone', completed: false },
];

// Vodafone Park Konseri - Tarkan - Timeline
export const vodafoneParkTimeline: TimelineItem[] = [
  { id: 'vt1', title: 'Etkinlik Planlama Başladı', description: 'Tarkan Mega Konseri planlaması başlatıldı', date: '1 Mart 2026', type: 'milestone', completed: true },
  { id: 'vt2', title: 'Mekan Görüşmeleri', description: 'Vodafone Park ile tarih ve kapasite görüşmesi', date: '10 Mart 2026', type: 'task', completed: true },
  { id: 'vt3', title: 'Sanatçı Sözleşmesi', description: 'Tarkan ile konser sözleşmesi imzalandı', date: '20 Mart 2026', type: 'milestone', completed: true },
  { id: 'vt4', title: 'Sanatçı Avansı', description: '₺1.200.000 sanatçı avans ödemesi', date: '25 Mart 2026', type: 'payment', completed: true },
  { id: 'vt5', title: 'Mekan Rezervasyonu Onayı', description: 'Vodafone Park 28 Ağustos 2026 tarihi kesinleşti', date: '1 Nisan 2026', type: 'task', completed: true },
  { id: 'vt6', title: 'Teknik Rider İncelemesi', description: 'Tarkan teknik rider gereksinimleri belirlendi', date: '15 Nisan 2026', type: 'update', completed: true },
  { id: 'vt7', title: 'Bilet Satışları', description: '55.000 kapasiteli konser için biletler satışta', date: '1 Mayıs 2026', type: 'milestone', completed: false },
  { id: 'vt8', title: 'Prodüksiyon Planlaması', description: 'Sahne tasarımı ve özel efektler belirleniyor', date: '15 Mayıs 2026', type: 'task', completed: false },
  { id: 'vt9', title: 'VIP Paketler', description: 'Meet & Greet ve VIP deneyim paketleri hazırlanıyor', date: '1 Haziran 2026', type: 'task', completed: false },
  { id: 'vt10', title: 'Konser Günü', description: 'Tarkan Vodafone Park Konseri', date: '28 Ağustos 2026', type: 'milestone', completed: false },
];

// Türkiye İnovasyon Zirvesi - Timeline
export const inovasyonZirvesiTimeline: TimelineItem[] = [
  { id: 'iz1', title: 'Zirve Konsepti Belirlendi', description: 'TÜSİAD ile tema ve konuşmacı çerçevesi oluşturuldu', date: '5 Aralık 2025', type: 'milestone', completed: true },
  { id: 'iz2', title: 'Mekan Seçimi', description: 'Lütfi Kırdar Kongre Merkezi rezervasyonu yapıldı', date: '15 Aralık 2025', type: 'task', completed: true },
  { id: 'iz3', title: 'Konuşmacı Davetleri', description: 'Yerli ve yabancı konuşmacılara davet gönderildi', date: '10 Ocak 2026', type: 'task', completed: true },
  { id: 'iz4', title: 'Mekan Ödemesi', description: '₺95.000 mekan kapora ödemesi yapıldı', date: '20 Ocak 2026', type: 'payment', completed: true },
  { id: 'iz5', title: 'Sponsor Anlaşmaları', description: 'Microsoft, Google, Turkcell ana sponsor olarak belirlendi', date: '1 Şubat 2026', type: 'milestone', completed: true },
  { id: 'iz6', title: 'Teknik Altyapı', description: 'Canlı yayın ve simultane çeviri altyapısı planlandı', date: '15 Şubat 2026', type: 'task', completed: true },
  { id: 'iz7', title: 'Kayıt Sistemi', description: 'Online kayıt sistemi aktifleştirildi', date: '1 Mart 2026', type: 'task', completed: true },
  { id: 'iz8', title: 'Konuşmacı Onayları', description: 'Tüm konuşmacıların katılım onayı alındı', date: '15 Mart 2026', type: 'milestone', completed: true },
  { id: 'iz9', title: 'Catering Finalizasyonu', description: 'VIP öğle yemeği ve coffee break menüsü belirlendi', date: '1 Nisan 2026', type: 'task', completed: false },
  { id: 'iz10', title: 'Zirve Günleri', description: 'Türkiye İnovasyon Zirvesi 2026', date: '22-23 Nisan 2026', type: 'milestone', completed: false },
];

// Düğün - Zeynep & Emre - Timeline
export const dugunTimeline: TimelineItem[] = [
  { id: 'd1', title: 'Nişan Tarihi Belirlendi', description: 'Nişan ve düğün tarihleri kesinleşti', date: '15 Ocak 2026', type: 'milestone', completed: true },
  { id: 'd2', title: 'Mekan Araştırması', description: 'Four Seasons, Çırağan, Esma Sultan gezildi', date: '25 Ocak 2026', type: 'task', completed: true },
  { id: 'd3', title: 'Mekan Seçimi', description: 'Four Seasons Bosphorus düğün mekanı olarak seçildi', date: '5 Şubat 2026', type: 'milestone', completed: true },
  { id: 'd4', title: 'Mekan Kapora', description: '₺75.000 mekan kapora ödemesi yapıldı', date: '10 Şubat 2026', type: 'payment', completed: true },
  { id: 'd5', title: 'Sanatçı Görüşmeleri', description: 'Mabel Matiz ve DJ Mahmut Orhan ile görüşüldü', date: '20 Şubat 2026', type: 'task', completed: true },
  { id: 'd6', title: 'Sanatçı Anlaşması', description: 'Mabel Matiz düğün performansı için anlaştı', date: '1 Mart 2026', type: 'milestone', completed: true },
  { id: 'd7', title: 'Davetiye Tasarımı', description: 'Davetiye tasarımı onaylandı, baskıya gönderildi', date: '15 Mart 2026', type: 'task', completed: true },
  { id: 'd8', title: 'Dekorasyon Planlama', description: 'Çiçek ve dekorasyon konsepti belirlendi', date: '1 Nisan 2026', type: 'task', completed: true },
  { id: 'd9', title: 'Fotoğraf/Video Ekibi', description: 'Wedding fotoğraf ve drone ekibi seçildi', date: '15 Nisan 2026', type: 'task', completed: false },
  { id: 'd10', title: 'Gelinlik/Damatlık', description: 'Son provaları ve düzeltmeler', date: '1 Haziran 2026', type: 'task', completed: false },
  { id: 'd11', title: 'Düğün Günü', description: 'Zeynep & Emre Düğün Töreni', date: '12 Haziran 2026', type: 'milestone', completed: false },
];

// Garanti BBVA Kurumsal Gala - Timeline
export const kurumselGalaTimeline: TimelineItem[] = [
  { id: 'kg1', title: 'Brief Alındı', description: 'Garanti BBVA kurumsal iletişim ekibi ile brief toplantısı', date: '1 Mayıs 2026', type: 'milestone', completed: true },
  { id: 'kg2', title: 'Konsept Sunumu', description: '3 farklı gala konsepti sunuldu ve onaylandı', date: '15 Mayıs 2026', type: 'task', completed: true },
  { id: 'kg3', title: 'Mekan Onayı', description: 'Four Seasons Bosphorus Grand Ballroom seçildi', date: '25 Mayıs 2026', type: 'task', completed: true },
  { id: 'kg4', title: 'Bütçe Onayı', description: '₺850.000 toplam bütçe onaylandı', date: '1 Haziran 2026', type: 'milestone', completed: true },
  { id: 'kg5', title: 'Ön Ödeme', description: '₺250.000 ön ödeme alındı', date: '10 Haziran 2026', type: 'payment', completed: true },
  { id: 'kg6', title: 'Konuşmacı Koordinasyonu', description: 'CEO ve üst yönetim sunum içerikleri hazırlanıyor', date: '1 Temmuz 2026', type: 'task', completed: true },
  { id: 'kg7', title: 'Ödül Töreni Planlaması', description: 'Yılın çalışanları ödül kategorileri belirlendi', date: '15 Temmuz 2026', type: 'task', completed: false },
  { id: 'kg8', title: 'Menü Tadımı', description: 'VIP akşam yemeği menü tadımı', date: '1 Ağustos 2026', type: 'task', completed: false },
  { id: 'kg9', title: 'Gala Gecesi', description: 'Garanti BBVA Kurumsal Gala', date: '5 Eylül 2026', type: 'milestone', completed: false },
];

// Default/Generic timeline for fallback
export const mockTimeline: TimelineItem[] = bigBangFestivalTimeline;

// Event specific timelines map
export const eventTimelines: Record<string, TimelineItem[]> = {
  '1': bigBangFestivalTimeline,        // Big Bang Summer Festival
  '2': vodafoneParkTimeline,           // Vodafone Park - Tarkan
  '3': inovasyonZirvesiTimeline,       // Türkiye İnovasyon Zirvesi
  '4': dugunTimeline,                  // Düğün - Zeynep & Emre
  '5': kurumselGalaTimeline,           // Garanti BBVA Gala
};

// Event Services Data
export const bigBangFestivalServices: Service[] = [
  {
    id: 's1',
    category: 'booking',
    name: 'Ana Sahne Sanatçıları',
    status: 'confirmed',
    provider: 'Pasion Booking',
    providerId: 'pb1',
    providerPhone: '+90 212 555 0001',
    providerImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100',
    price: 1850000,
  },
  {
    id: 's2',
    category: 'technical',
    name: 'Ana Sahne Ses Sistemi',
    status: 'confirmed',
    provider: 'Mega Sound Pro',
    providerId: 'msp1',
    providerPhone: '+90 212 555 0002',
    providerImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100',
    price: 420000,
  },
  {
    id: 's3',
    category: 'technical',
    name: 'Işık & LED Wall Sistemi',
    status: 'confirmed',
    provider: 'LightShow Pro',
    providerId: 'lsp1',
    providerPhone: '+90 212 555 0003',
    providerImage: 'https://images.unsplash.com/photo-1504501650895-2441b7915699?w=100',
    price: 285000,
  },
  {
    id: 's4',
    category: 'venue',
    name: 'KüçükÇiftlik Park (3 Gün)',
    status: 'confirmed',
    provider: 'KüçükÇiftlik Park',
    providerId: 'kcp1',
    providerPhone: '+90 212 555 0004',
    providerImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100',
    price: 450000,
  },
  {
    id: 's5',
    category: 'security',
    name: 'Etkinlik Güvenliği (150 kişi)',
    status: 'confirmed',
    provider: 'SecureGuard Events',
    providerId: 'sge1',
    providerPhone: '+90 212 555 0005',
    providerImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=100',
    price: 180000,
  },
  {
    id: 's6',
    category: 'accommodation',
    name: 'Sanatçı Konaklaması',
    status: 'pending',
    provider: 'Swissôtel The Bosphorus',
    providerId: 'sw1',
    providerPhone: '+90 212 555 0006',
    providerImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100',
    price: 156000,
  },
  {
    id: 's7',
    category: 'transport',
    name: 'VIP Transfer Hizmeti',
    status: 'offered',
    provider: null,
    price: 85000,
  },
  {
    id: 's8',
    category: 'catering',
    name: 'Backstage & VIP Catering',
    status: 'offered',
    provider: null,
    price: 95000,
  },
  {
    id: 's9',
    category: 'operation',
    name: 'Sahne Kurulum & Söküm',
    status: 'confirmed',
    provider: 'Stage Masters TR',
    providerId: 'sm1',
    providerPhone: '+90 212 555 0009',
    providerImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=100',
    price: 120000,
  },
  {
    id: 's10',
    category: 'technical',
    name: 'B Sahne Ses Sistemi',
    status: 'pending',
    provider: null,
    price: 145000,
  },
  {
    id: 's11',
    category: 'operation',
    name: 'Mobil Tuvalet & Hijyen',
    status: 'draft',
    provider: null,
    price: 45000,
  },
  {
    id: 's12',
    category: 'operation',
    name: 'Jeneratör Hizmeti',
    status: 'draft',
    provider: null,
    price: 65000,
  },
];

// Event services map
export const eventServices: Record<string, Service[]> = {
  '1': bigBangFestivalServices,
};

// Event Budget Items
export const bigBangBudgetItems: EventBudgetItem[] = [
  { id: 'b1', category: 'booking', name: 'Sanatçılar', budgeted: 2000000, spent: 1850000, status: 'under' },
  { id: 'b2', category: 'technical', name: 'Ses & Işık', budgeted: 750000, spent: 705000, status: 'under' },
  { id: 'b3', category: 'venue', name: 'Mekan', budgeted: 450000, spent: 450000, status: 'on_track' },
  { id: 'b4', category: 'security', name: 'Güvenlik', budgeted: 180000, spent: 180000, status: 'on_track' },
  { id: 'b5', category: 'accommodation', name: 'Konaklama', budgeted: 150000, spent: 0, status: 'under' },
  { id: 'b6', category: 'transport', name: 'Ulaşım', budgeted: 100000, spent: 0, status: 'under' },
  { id: 'b7', category: 'catering', name: 'Catering', budgeted: 120000, spent: 0, status: 'under' },
  { id: 'b8', category: 'operation', name: 'Operasyon', budgeted: 250000, spent: 120000, status: 'under' },
];

// Event Team Members
export const bigBangTeamMembers: EventTeamMember[] = [
  {
    id: 'tm1',
    name: 'Ahmet Yılmaz',
    role: 'Proje Yöneticisi',
    phone: '+90 532 555 0001',
    email: 'ahmet@pozitif.com',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    isLead: true,
  },
  {
    id: 'tm2',
    name: 'Elif Demir',
    role: 'Prodüksiyon Koordinatörü',
    phone: '+90 532 555 0002',
    email: 'elif@pozitif.com',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    isLead: false,
  },
  {
    id: 'tm3',
    name: 'Mehmet Kaya',
    role: 'Teknik Direktör',
    phone: '+90 532 555 0003',
    email: 'mehmet@pozitif.com',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    isLead: false,
  },
  {
    id: 'tm4',
    name: 'Zeynep Arslan',
    role: 'Sanatçı İlişkileri',
    phone: '+90 532 555 0004',
    email: 'zeynep@pozitif.com',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    isLead: false,
  },
  {
    id: 'tm5',
    name: 'Can Öztürk',
    role: 'Sahne Müdürü',
    phone: '+90 532 555 0005',
    email: 'can@pozitif.com',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    isLead: false,
  },
];

// Timeline type helpers
export const getTimelineTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'milestone': return 'flag';
    case 'task': return 'checkbox';
    case 'payment': return 'card';
    case 'update': return 'refresh';
    default: return 'ellipse';
  }
};

export const getTimelineTypeColor = (type: string, colors: ThemeColors) => {
  switch (type) {
    case 'milestone': return colors.brand[500];
    case 'task': return colors.success;
    case 'payment': return colors.warning;
    case 'update': return colors.info;
    default: return colors.zinc[500];
  }
};

// Service status info helper
export const getServiceStatusInfo = (status: string, colors: ThemeColors) => {
  switch (status) {
    case 'confirmed':
      return { label: 'Onaylandı', color: colors.success, icon: 'checkmark-circle' as const };
    case 'pending':
      return { label: 'Bekliyor', color: colors.warning, icon: 'time' as const };
    case 'offered':
      return { label: 'Teklif Geldi', color: colors.info, icon: 'document-text' as const };
    case 'draft':
      return { label: 'Taslak', color: colors.zinc[500], icon: 'create' as const };
    case 'cancelled':
      return { label: 'İptal', color: colors.error, icon: 'close-circle' as const };
    default:
      return { label: status, color: colors.zinc[500], icon: 'help-circle' as const };
  }
};

// Budget status helper
export const getBudgetStatusInfo = (status: string, colors: ThemeColors) => {
  switch (status) {
    case 'under':
      return { label: 'Bütçe Altı', color: colors.success };
    case 'on_track':
      return { label: 'Hedefte', color: colors.info };
    case 'over':
      return { label: 'Bütçe Aşımı', color: colors.error };
    default:
      return { label: status, color: colors.zinc[500] };
  }
};

// Calculate event stats from services
export const calculateEventStats = (services: Service[]) => {
  const totalBudget = services.reduce((sum, s) => sum + s.price, 0);
  const confirmedServices = services.filter(s => s.status === 'confirmed');
  const confirmedSpent = confirmedServices.reduce((sum, s) => sum + s.price, 0);
  const pendingCount = services.filter(s => s.status === 'pending').length;
  const offeredCount = services.filter(s => s.status === 'offered').length;
  const draftCount = services.filter(s => s.status === 'draft').length;

  return {
    totalBudget,
    confirmedSpent,
    confirmedCount: confirmedServices.length,
    pendingCount,
    offeredCount,
    draftCount,
    totalServices: services.length,
    completionPercent: Math.round((confirmedServices.length / services.length) * 100),
  };
};

// Get timeline by event ID
export const getTimelineByEventId = (eventId: string): TimelineItem[] => {
  return eventTimelines[eventId] || mockTimeline;
};

// Get services by event ID
export const getServicesByEventId = (eventId: string): Service[] => {
  return eventServices[eventId] || bigBangFestivalServices;
};
