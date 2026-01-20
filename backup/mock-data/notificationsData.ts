/**
 * Notifications Data
 * Bildirim tipleri ve mock veriler
 */

// Bildirim tipleri
export type NotificationType =
  | 'offer_received'      // Yeni teklif alındı
  | 'offer_accepted'      // Teklif kabul edildi
  | 'offer_rejected'      // Teklif reddedildi
  | 'offer_counter'       // Karşı teklif geldi
  | 'message'             // Yeni mesaj
  | 'payment_received'    // Ödeme alındı
  | 'payment_reminder'    // Ödeme hatırlatması
  | 'event_reminder'      // Etkinlik hatırlatması
  | 'event_update'        // Etkinlik güncellendi
  | 'event_cancelled'     // Etkinlik iptal edildi
  | 'booking_confirmed'   // Rezervasyon onaylandı
  | 'task_assigned'       // Görev atandı
  | 'task_completed'      // Görev tamamlandı
  | 'review_received'     // Yorum alındı
  | 'profile_incomplete'  // Profil tamamlanmadı
  | 'system';             // Sistem bildirimi

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  date: string;
  read: boolean;
  // Navigation data
  action?: string;
  navigateTo?: {
    screen: string;
    params?: Record<string, any>;
  };
  // Related entity
  relatedId?: string;
  relatedType?: 'event' | 'offer' | 'message' | 'provider' | 'organizer';
  // Additional data
  amount?: number;
  providerName?: string;
  eventName?: string;
  avatar?: string;
}

// Bildirim ikonları ve renkleri
export const getNotificationStyle = (type: NotificationType) => {
  const styles: Record<NotificationType, { icon: string; color: string; bgColor: string }> = {
    offer_received: { icon: 'document-text', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.15)' },
    offer_accepted: { icon: 'checkmark-circle', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' },
    offer_rejected: { icon: 'close-circle', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
    offer_counter: { icon: 'swap-horizontal', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)' },
    message: { icon: 'chatbubble', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)' },
    payment_received: { icon: 'wallet', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' },
    payment_reminder: { icon: 'card', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)' },
    event_reminder: { icon: 'alarm', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.15)' },
    event_update: { icon: 'refresh', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)' },
    event_cancelled: { icon: 'ban', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
    booking_confirmed: { icon: 'calendar-check', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' },
    task_assigned: { icon: 'clipboard', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.15)' },
    task_completed: { icon: 'checkmark-done', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' },
    review_received: { icon: 'star', color: '#FBBF24', bgColor: 'rgba(251, 191, 36, 0.15)' },
    profile_incomplete: { icon: 'person', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.15)' },
    system: { icon: 'information-circle', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.15)' },
  };
  return styles[type] || styles.system;
};

// Bildirim kategorileri
export type NotificationCategory = 'all' | 'offers' | 'messages' | 'payments' | 'events' | 'system';

export const notificationCategories: { key: NotificationCategory; label: string; icon: string; types: NotificationType[] }[] = [
  { key: 'all', label: 'Tümü', icon: 'notifications', types: [] },
  { key: 'offers', label: 'Teklifler', icon: 'document-text', types: ['offer_received', 'offer_accepted', 'offer_rejected', 'offer_counter'] },
  { key: 'messages', label: 'Mesajlar', icon: 'chatbubble', types: ['message'] },
  { key: 'payments', label: 'Ödemeler', icon: 'wallet', types: ['payment_received', 'payment_reminder'] },
  { key: 'events', label: 'Etkinlikler', icon: 'calendar', types: ['event_reminder', 'event_update', 'event_cancelled', 'booking_confirmed', 'task_assigned', 'task_completed'] },
  { key: 'system', label: 'Sistem', icon: 'settings', types: ['profile_incomplete', 'system', 'review_received'] },
];

// Provider bildirimleri (hizmet sağlayıcı modunda)
export const providerNotifications: Notification[] = [
  {
    id: 'pn1',
    type: 'offer_received',
    title: 'Yeni Teklif Talebi',
    message: 'Zeytinburnu Kültür Merkezi "Cumhuriyet Bayramı Konseri" etkinliği için ses sistemi teklifi istiyor.',
    time: '5 dk önce',
    date: 'Bugün',
    read: false,
    action: 'Teklif Ver',
    navigateTo: { screen: 'ProviderRequestDetail', params: { requestId: 'pr1' } },
    eventName: 'Cumhuriyet Bayramı Konseri',
    relatedType: 'event',
  },
  {
    id: 'pn2',
    type: 'offer_accepted',
    title: 'Teklifiniz Kabul Edildi',
    message: 'Harbiye Açıkhava "Tarkan Konseri" etkinliği için teklifiniz onaylandı. Sözleşme hazırlanıyor.',
    time: '1 saat önce',
    date: 'Bugün',
    read: false,
    action: 'Detayları Gör',
    navigateTo: { screen: 'ProviderEventDetail', params: { eventId: 'pe_tr_01' } },
    eventName: 'Tarkan Konseri',
    amount: 185000,
    relatedType: 'event',
  },
  {
    id: 'pn3',
    type: 'payment_received',
    title: 'Ödeme Alındı',
    message: 'Red Bull Air Race etkinliği için ₺45.000 ön ödeme hesabınıza yatırıldı.',
    time: '3 saat önce',
    date: 'Bugün',
    read: false,
    amount: 45000,
    eventName: 'Red Bull Air Race',
    navigateTo: { screen: 'ProviderEventDetail', params: { eventId: 'pe5' } },
    relatedType: 'event',
  },
  {
    id: 'pn4',
    type: 'message',
    title: 'Yeni Mesaj',
    message: 'Pozitif Yapım size "Zeytinburnu Yaz Festivali" hakkında mesaj gönderdi.',
    time: '4 saat önce',
    date: 'Bugün',
    read: true,
    action: 'Mesajı Oku',
    navigateTo: { screen: 'Chat', params: { conversationId: 'c1' } },
    providerName: 'Pozitif Yapım',
    avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
    relatedType: 'message',
  },
  {
    id: 'pn5',
    type: 'event_reminder',
    title: 'Etkinlik Yaklaşıyor',
    message: 'Chill-Out Festival 3 gün sonra başlıyor. Ekipman kontrollerinizi tamamlayın.',
    time: '10:00',
    date: 'Dün',
    read: true,
    action: 'Etkinliğe Git',
    navigateTo: { screen: 'ProviderEventDetail', params: { eventId: 'pe1' } },
    eventName: 'Chill-Out Festival',
    relatedType: 'event',
  },
  {
    id: 'pn6',
    type: 'task_assigned',
    title: 'Yeni Görev Atandı',
    message: 'Electronica Festival için "Sahne B Ses Kurulumu" görevi size atandı.',
    time: '14:30',
    date: 'Dün',
    read: true,
    action: 'Görevi Gör',
    navigateTo: { screen: 'ProviderEventDetail', params: { eventId: 'pe3' } },
    eventName: 'Electronica Festival',
    relatedType: 'event',
  },
  {
    id: 'pn7',
    type: 'offer_counter',
    title: 'Karşı Teklif Geldi',
    message: 'İstanbul Jazz Festival organizatörü teklifinize ₺78.000 karşı teklif gönderdi.',
    time: '09:15',
    date: 'Dün',
    read: true,
    action: 'Teklifi İncele',
    navigateTo: { screen: 'OfferDetail', params: { offerId: 'o3' } },
    amount: 78000,
    eventName: 'İstanbul Jazz Festival',
    relatedType: 'offer',
  },
  {
    id: 'pn8',
    type: 'review_received',
    title: 'Yeni Değerlendirme',
    message: 'Koç Holding "Kurumsal Lansman" etkinliği için 5 yıldız değerlendirme aldınız.',
    time: '16:45',
    date: '2 gün önce',
    read: true,
    eventName: 'Kurumsal Lansman',
    relatedType: 'event',
  },
  {
    id: 'pn9',
    type: 'payment_reminder',
    title: 'Ödeme Bekliyor',
    message: 'Fashion Week Istanbul etkinliği için ₺32.000 bakiye ödemesi bekliyor.',
    time: '11:00',
    date: '3 gün önce',
    read: true,
    amount: 32000,
    eventName: 'Fashion Week Istanbul',
    navigateTo: { screen: 'ProviderEventDetail', params: { eventId: 'pe9' } },
    relatedType: 'event',
  },
  {
    id: 'pn10',
    type: 'profile_incomplete',
    title: 'Profilinizi Tamamlayın',
    message: 'Portföyünüze fotoğraf ekleyerek daha fazla iş fırsatı yakalayın.',
    time: '09:00',
    date: '1 hafta önce',
    read: true,
    action: 'Profili Düzenle',
    navigateTo: { screen: 'EditCompanyProfile' },
    relatedType: 'provider',
  },
];

// Organizer bildirimleri (organizatör modunda)
export const organizerNotifications: Notification[] = [
  {
    id: 'on1',
    type: 'offer_received',
    title: 'Yeni Teklif Alındı',
    message: 'Pro Sound Istanbul "Yaz Festivali 2026" için ses sistemi teklifi gönderdi: ₺85.000',
    time: '10 dk önce',
    date: 'Bugün',
    read: false,
    action: 'Teklifi İncele',
    navigateTo: { screen: 'OfferDetail', params: { offerId: 'o1' } },
    providerName: 'Pro Sound Istanbul',
    amount: 85000,
    eventName: 'Yaz Festivali 2026',
    avatar: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100',
    relatedType: 'offer',
  },
  {
    id: 'on2',
    type: 'offer_received',
    title: 'Yeni Teklif Alındı',
    message: 'SecurePro Güvenlik "Yaz Festivali 2026" için güvenlik hizmeti teklifi gönderdi: ₺45.000',
    time: '30 dk önce',
    date: 'Bugün',
    read: false,
    action: 'Teklifi İncele',
    navigateTo: { screen: 'OfferDetail', params: { offerId: 'o2' } },
    providerName: 'SecurePro Güvenlik',
    amount: 45000,
    eventName: 'Yaz Festivali 2026',
    avatar: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=100',
    relatedType: 'offer',
  },
  {
    id: 'on3',
    type: 'message',
    title: 'Yeni Mesaj',
    message: 'Elite Transfer VIP ulaşım detayları hakkında mesaj gönderdi.',
    time: '1 saat önce',
    date: 'Bugün',
    read: false,
    action: 'Mesajı Oku',
    navigateTo: { screen: 'Chat', params: { conversationId: 'c2' } },
    providerName: 'Elite Transfer',
    avatar: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100',
    relatedType: 'message',
  },
  {
    id: 'on4',
    type: 'booking_confirmed',
    title: 'Rezervasyon Onaylandı',
    message: 'Grand Hotel konaklama rezervasyonunuz onaylandı. 50 oda - 3 gece.',
    time: '2 saat önce',
    date: 'Bugün',
    read: true,
    action: 'Detayları Gör',
    navigateTo: { screen: 'OrganizerEventDetail', params: { eventId: 'e1' } },
    providerName: 'Grand Hotel',
    eventName: 'Yaz Festivali 2026',
    relatedType: 'event',
  },
  {
    id: 'on5',
    type: 'event_reminder',
    title: 'Etkinlik Yaklaşıyor',
    message: 'Yaz Festivali 2026 için 45 gün kaldı. Hizmet onaylarını kontrol edin.',
    time: '09:00',
    date: 'Dün',
    read: true,
    action: 'Etkinliğe Git',
    navigateTo: { screen: 'OrganizerEventDetail', params: { eventId: 'e1' } },
    eventName: 'Yaz Festivali 2026',
    relatedType: 'event',
  },
  {
    id: 'on6',
    type: 'offer_accepted',
    title: 'Teklif Onaylandı',
    message: 'LightShow Pro ışık sistemi teklifini kabul ettiniz: ₺62.000',
    time: '14:00',
    date: 'Dün',
    read: true,
    providerName: 'LightShow Pro',
    amount: 62000,
    eventName: 'Kurumsal Gala',
    relatedType: 'offer',
  },
  {
    id: 'on7',
    type: 'payment_reminder',
    title: 'Ödeme Hatırlatması',
    message: 'Dream Decor dekorasyon hizmeti için ₺25.000 ön ödeme bekleniyor.',
    time: '10:30',
    date: '2 gün önce',
    read: true,
    action: 'Ödeme Yap',
    providerName: 'Dream Decor',
    amount: 25000,
    relatedType: 'provider',
  },
  {
    id: 'on8',
    type: 'task_completed',
    title: 'Görev Tamamlandı',
    message: 'Mekan keşif ziyareti görevi tamamlandı. Rapor hazır.',
    time: '16:00',
    date: '3 gün önce',
    read: true,
    eventName: 'Tech Summit 2026',
    relatedType: 'event',
  },
  {
    id: 'on9',
    type: 'system',
    title: 'Bütçe Uyarısı',
    message: 'Yaz Festivali 2026 bütçesinin %75\'i kullanıldı.',
    time: '08:00',
    date: '4 gün önce',
    read: true,
    action: 'Bütçeyi Gör',
    navigateTo: { screen: 'OrganizerEventDetail', params: { eventId: 'e1' } },
    eventName: 'Yaz Festivali 2026',
    relatedType: 'event',
  },
  {
    id: 'on10',
    type: 'offer_rejected',
    title: 'Teklif Reddedildi',
    message: 'Budget Sound teklifini reddettiniz.',
    time: '11:00',
    date: '1 hafta önce',
    read: true,
    providerName: 'Budget Sound',
    relatedType: 'offer',
  },
];

// Bildirim sayılarını hesapla
export const getNotificationCounts = (notifications: Notification[]) => {
  const unread = notifications.filter(n => !n.read).length;
  const offers = notifications.filter(n =>
    ['offer_received', 'offer_accepted', 'offer_rejected', 'offer_counter'].includes(n.type)
  ).length;
  const messages = notifications.filter(n => n.type === 'message').length;
  const payments = notifications.filter(n =>
    ['payment_received', 'payment_reminder'].includes(n.type)
  ).length;
  const events = notifications.filter(n =>
    ['event_reminder', 'event_update', 'event_cancelled', 'booking_confirmed', 'task_assigned', 'task_completed'].includes(n.type)
  ).length;
  const system = notifications.filter(n =>
    ['profile_incomplete', 'system', 'review_received'].includes(n.type)
  ).length;

  return { unread, offers, messages, payments, events, system, total: notifications.length };
};

// Bildirimleri kategoriye göre filtrele
export const filterNotificationsByCategory = (
  notifications: Notification[],
  category: NotificationCategory
): Notification[] => {
  if (category === 'all') return notifications;

  const categoryConfig = notificationCategories.find(c => c.key === category);
  if (!categoryConfig) return notifications;

  return notifications.filter(n => categoryConfig.types.includes(n.type));
};

// Bildirimleri tarihe göre grupla
export const groupNotificationsByDate = (notifications: Notification[]): Record<string, Notification[]> => {
  const grouped: Record<string, Notification[]> = {};

  for (const notification of notifications) {
    const date = notification.date || 'Diğer';
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(notification);
  }

  return grouped;
};
