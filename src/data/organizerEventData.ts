import { Ionicons } from '@expo/vector-icons';
import { gradients } from '../theme/colors';

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
  };
  return categories[category] || { name: category, icon: 'help-circle' as const, gradient: gradients.primary };
};

// Mock timeline data
export const mockTimeline: TimelineItem[] = [
  { id: 't1', title: 'Etkinlik Oluşturuldu', description: 'Etkinlik taslağı hazırlandı', date: '1 Haziran 2024', type: 'milestone', completed: true },
  { id: 't2', title: 'Mekan Onayı', description: 'KüsümPark mekan rezervasyonu onaylandı', date: '5 Haziran 2024', type: 'task', completed: true },
  { id: 't3', title: 'Sanatçı Anlaşması', description: 'Mabel Matiz ile sözleşme imzalandı', date: '8 Haziran 2024', type: 'milestone', completed: true },
  { id: 't4', title: 'Ön Ödeme', description: '₺250.000 ön ödeme yapıldı', date: '10 Haziran 2024', type: 'payment', completed: true },
  { id: 't5', title: 'Teknik Ekipman Teslimi', description: 'Ses ve ışık sistemi kurulumu', date: '14 Temmuz 2024', type: 'task', completed: false },
  { id: 't6', title: 'Etkinlik Günü', description: 'Yaz Festivali 2024 başlıyor!', date: '15 Temmuz 2024', type: 'milestone', completed: false },
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

export const getTimelineTypeColor = (type: string, colors: any) => {
  switch (type) {
    case 'milestone': return colors.brand[500];
    case 'task': return colors.success;
    case 'payment': return colors.warning;
    case 'update': return colors.info;
    default: return colors.zinc[500];
  }
};

// Service status info helper
export const getServiceStatusInfo = (status: string, colors: any) => {
  switch (status) {
    case 'confirmed':
      return { label: 'Onaylandı', color: colors.success, icon: 'checkmark-circle' as const };
    case 'pending':
      return { label: 'Bekliyor', color: colors.warning, icon: 'time' as const };
    case 'offered':
      return { label: 'Teklif Geldi', color: colors.info, icon: 'document-text' as const };
    case 'draft':
      return { label: 'Taslak', color: colors.zinc[500], icon: 'create' as const };
    default:
      return { label: status, color: colors.zinc[500], icon: 'help-circle' as const };
  }
};
