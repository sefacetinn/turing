/**
 * Messages Data
 * Mesajlar ve sohbetler için mock veri
 */

export interface Conversation {
  id: string;
  participantName: string;
  participantImage: string;
  participantType: 'provider' | 'organizer';
  serviceCategory?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  archived: boolean;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  senderId: 'me' | 'provider' | 'organizer';
  text?: string;
  time: string;
  date: string;
  type: 'text' | 'offer' | 'meeting' | 'file' | 'image';
  // Offer specific
  offerAmount?: number;
  offerDescription?: string;
  offerStatus?: 'pending' | 'accepted' | 'rejected';
  eventTitle?: string;
  // Meeting specific
  meetingTitle?: string;
  meetingDate?: string;
  meetingTime?: string;
  meetingLocation?: string;
  meetingStatus?: 'pending' | 'accepted' | 'rejected';
  // File specific
  fileName?: string;
  fileSize?: string;
  fileType?: string;
}

export const conversations: Conversation[] = [
  // AKTIF SOHBETLER
  {
    id: 'c1',
    participantName: 'Pro Sound Istanbul',
    participantImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    participantType: 'provider',
    serviceCategory: 'technical',
    lastMessage: 'Teknik detayları görüşmek isteriz...',
    lastMessageTime: '2 dk',
    unreadCount: 3,
    online: true,
    archived: false,
    messages: [
      { id: 'm1', senderId: 'provider', text: 'Merhaba! Etkinliğiniz için ses sistemi hizmeti konusunda size yardımcı olabilirim.', time: '10:30', date: 'Bugün', type: 'text' },
      { id: 'm2', senderId: 'me', text: 'Merhaba, 500 kişilik açık alan için profesyonel ses sistemi arıyoruz.', time: '10:32', date: 'Bugün', type: 'text' },
      { id: 'm3', senderId: 'provider', text: 'Harika! Bu tarz etkinliklerde deneyimli ekibimiz var. Line array sistemimiz 1000 kişiye kadar açık alanları rahatlıkla karşılayabilir.', time: '10:35', date: 'Bugün', type: 'text' },
      { id: 'm4', senderId: 'me', text: 'Fiyat teklifinizi alabilir miyim?', time: '10:36', date: 'Bugün', type: 'text' },
      { id: 'm5', senderId: 'provider', text: 'Tabii ki! Size özel bir teklif hazırladım:', time: '10:40', date: 'Bugün', type: 'text' },
      { id: 'm6', senderId: 'provider', offerAmount: 85000, offerDescription: 'Line Array Ses Sistemi + 2 Teknisyen + Kurulum/Söküm', eventTitle: 'Yaz Festivali 2026', offerStatus: 'pending', time: '10:41', date: 'Bugün', type: 'offer' },
      { id: 'm7', senderId: 'provider', text: 'Teknik detayları görüşmek isteriz. Yarın müsait misiniz?', time: '10:45', date: 'Bugün', type: 'text' },
    ],
  },
  {
    id: 'c2',
    participantName: 'Elite VIP Transfer',
    participantImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
    participantType: 'provider',
    serviceCategory: 'transport',
    lastMessage: 'Araç hazır, onayınızı bekliyoruz.',
    lastMessageTime: '1 saat',
    unreadCount: 0,
    online: true,
    archived: false,
    messages: [
      { id: 'm1', senderId: 'provider', text: 'Merhaba! VIP transfer hizmetlerimiz hakkında bilgi almak ister misiniz?', time: '09:00', date: 'Bugün', type: 'text' },
      { id: 'm2', senderId: 'me', text: 'Evet, 20 kişilik VIP konuk grubumuz için havalimanı transferi gerekiyor.', time: '09:15', date: 'Bugün', type: 'text' },
      { id: 'm3', senderId: 'provider', text: 'Anlıyorum. Mercedes Sprinter VIP araçlarımız bu iş için ideal olacaktır. 2 araç ile tüm misafirlerinizi konforlu şekilde taşıyabiliriz.', time: '09:20', date: 'Bugün', type: 'text' },
      { id: 'm4', senderId: 'me', text: 'Fiyat ve araç detayları alabilir miyim?', time: '09:25', date: 'Bugün', type: 'text' },
      { id: 'm5', senderId: 'provider', offerAmount: 12500, offerDescription: '2x Mercedes Sprinter VIP (10+1) - Havalimanı Transferi', eventTitle: 'Kurumsal Lansman', offerStatus: 'accepted', time: '09:30', date: 'Bugün', type: 'offer' },
      { id: 'm6', senderId: 'me', text: 'Teklifi onaylıyorum. Araçların zamanında hazır olması önemli.', time: '09:45', date: 'Bugün', type: 'text' },
      { id: 'm7', senderId: 'provider', text: 'Araç hazır, onayınızı bekliyoruz. Şoförlerimiz 1 saat önceden lokasyonda olacak.', time: '10:00', date: 'Bugün', type: 'text' },
    ],
  },
  {
    id: 'c3',
    participantName: 'Grand Hyatt Istanbul',
    participantImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    participantType: 'provider',
    serviceCategory: 'accommodation',
    lastMessage: 'Oda rezervasyonu tamamlandı.',
    lastMessageTime: '3 saat',
    unreadCount: 1,
    online: false,
    archived: false,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Merhaba, 10-12 Temmuz tarihleri için 15 oda rezervasyonu yapmak istiyoruz.', time: '14:00', date: 'Dün', type: 'text' },
      { id: 'm2', senderId: 'provider', text: 'Merhaba! İstediğiniz tarihler için müsaitlik durumumuzu kontrol ediyorum.', time: '14:15', date: 'Dün', type: 'text' },
      { id: 'm3', senderId: 'provider', text: 'İyi haberlerim var! 15 deluxe oda müsait. Kurumsal etkinlik indirimi ile gecelik ₺3.500 fiyat sunabiliriz.', time: '14:30', date: 'Dün', type: 'text' },
      { id: 'm4', senderId: 'me', text: 'Kahvaltı dahil mi?', time: '14:35', date: 'Dün', type: 'text' },
      { id: 'm5', senderId: 'provider', text: 'Evet, açık büfe kahvaltı ve fitness/spa kullanımı dahildir.', time: '14:40', date: 'Dün', type: 'text' },
      { id: 'm6', senderId: 'provider', offerAmount: 157500, offerDescription: '15 Deluxe Oda x 3 Gece - Kahvaltı Dahil', eventTitle: 'Yaz Festivali 2026', offerStatus: 'accepted', time: '15:00', date: 'Dün', type: 'offer' },
      { id: 'm7', senderId: 'provider', text: 'Oda rezervasyonu tamamlandı. Onay belgesi ekte.', time: '09:00', date: 'Bugün', type: 'text' },
    ],
  },
  {
    id: 'c4',
    participantName: 'Dream Event Dekor',
    participantImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
    participantType: 'provider',
    serviceCategory: 'decoration',
    lastMessage: 'Renk paletiyle ilgili sorunuz var mı?',
    lastMessageTime: 'Dün',
    unreadCount: 0,
    online: true,
    archived: false,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Düğün dekorasyonu için teklif alabilir miyim?', time: '11:00', date: '2 gün önce', type: 'text' },
      { id: 'm2', senderId: 'provider', text: 'Tabii! Düğün temanız ve renk tercihiniz nedir?', time: '11:30', date: '2 gün önce', type: 'text' },
      { id: 'm3', senderId: 'me', text: 'Romantik tema, pembe ve beyaz tonları düşünüyoruz. 200 kişilik salon.', time: '11:45', date: '2 gün önce', type: 'text' },
      { id: 'm4', senderId: 'provider', text: 'Harika bir seçim! Benzer çalışmalarımızdan bazı görseller paylaşıyorum.', time: '12:00', date: '2 gün önce', type: 'text' },
      { id: 'm5', senderId: 'provider', fileName: 'portfolio_romantic_theme.pdf', fileSize: '4.2 MB', fileType: 'pdf', time: '12:01', date: '2 gün önce', type: 'file' },
      { id: 'm6', senderId: 'provider', text: 'Renk paletiyle ilgili sorunuz var mı?', time: '10:00', date: 'Dün', type: 'text' },
    ],
  },
  {
    id: 'c5',
    participantName: 'SecurePro Güvenlik',
    participantImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400',
    participantType: 'provider',
    serviceCategory: 'security',
    lastMessage: 'Güvenlik planı hazır.',
    lastMessageTime: '2 gün',
    unreadCount: 2,
    online: false,
    archived: false,
    messages: [
      { id: 'm1', senderId: 'me', text: '5000 kişilik festival için güvenlik hizmeti gerekiyor.', time: '16:00', date: '3 gün önce', type: 'text' },
      { id: 'm2', senderId: 'provider', text: 'Merhaba! Festival güvenliği konusunda uzmanız. Kaç gün sürecek etkinlik?', time: '16:30', date: '3 gün önce', type: 'text' },
      { id: 'm3', senderId: 'me', text: '3 gün, gece konserleri de olacak.', time: '16:45', date: '3 gün önce', type: 'text' },
      { id: 'm4', senderId: 'provider', text: 'Anladım. Bu ölçekte bir festival için 30 güvenlik personeli + 2 amir öneriyoruz. Giriş kontrolü, VIP alan ve backstage ayrı ekipler olacak.', time: '17:00', date: '3 gün önce', type: 'text' },
      { id: 'm5', senderId: 'provider', offerAmount: 225000, offerDescription: '32 Güvenlik Personeli x 3 Gün - 7/24 Vardiya', eventTitle: 'Yaz Festivali 2026', offerStatus: 'pending', time: '17:30', date: '3 gün önce', type: 'offer' },
      { id: 'm6', senderId: 'provider', text: 'Güvenlik planı hazır. İncelemeniz için gönderiyorum.', time: '10:00', date: '2 gün önce', type: 'text' },
      { id: 'm7', senderId: 'provider', fileName: 'guvenlik_plani_festival.pdf', fileSize: '2.8 MB', fileType: 'pdf', time: '10:01', date: '2 gün önce', type: 'file' },
    ],
  },
  {
    id: 'c6',
    participantName: 'Sila Management',
    participantImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    participantType: 'provider',
    serviceCategory: 'booking',
    lastMessage: 'Sıla hanım 22 Ağustos için onay verdi!',
    lastMessageTime: '4 saat',
    unreadCount: 1,
    online: true,
    archived: false,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Sıla için 22 Ağustos konseri müsaitlik durumunu öğrenebilir miyim?', time: '09:00', date: 'Dün', type: 'text' },
      { id: 'm2', senderId: 'provider', text: 'Merhaba! Takvime bakıyorum, bir dakika lütfen.', time: '09:30', date: 'Dün', type: 'text' },
      { id: 'm3', senderId: 'provider', text: '22 Ağustos için müsaitiz. Vodafone Park konseri için değil mi?', time: '09:45', date: 'Dün', type: 'text' },
      { id: 'm4', senderId: 'me', text: 'Evet, doğru. Şartları görüşebilir miyiz?', time: '10:00', date: 'Dün', type: 'text' },
      { id: 'm5', senderId: 'provider', text: 'Tabii. Sıla hanımın stadyum konseri ücreti ₺2.500.000 + teknik rider gereksinimleri. Detaylı rider dökümanını gönderiyorum.', time: '10:30', date: 'Dün', type: 'text' },
      { id: 'm6', senderId: 'provider', fileName: 'sila_teknik_rider_2026.pdf', fileSize: '1.5 MB', fileType: 'pdf', time: '10:31', date: 'Dün', type: 'file' },
      { id: 'm7', senderId: 'provider', text: 'Sıla hanım 22 Ağustos için onay verdi! Sözleşme hazırlanıyor.', time: '14:00', date: 'Bugün', type: 'text' },
    ],
  },
  {
    id: 'c7',
    participantName: 'Lezzet Catering',
    participantImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
    participantType: 'provider',
    serviceCategory: 'catering',
    lastMessage: 'Menü seçeneklerini gönderdik.',
    lastMessageTime: '5 saat',
    unreadCount: 0,
    online: false,
    archived: false,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Kurumsal lansman için 300 kişilik kokteyl catering arıyoruz.', time: '11:00', date: 'Dün', type: 'text' },
      { id: 'm2', senderId: 'provider', text: 'Merhaba! Kokteyl usulü mü yoksa oturmalı yemek mi tercih edersiniz?', time: '11:30', date: 'Dün', type: 'text' },
      { id: 'm3', senderId: 'me', text: 'Kokteyl usulü, canape ve finger food ağırlıklı. Vegan seçenekler de olmalı.', time: '11:45', date: 'Dün', type: 'text' },
      { id: 'm4', senderId: 'provider', text: 'Harika! Premium kokteyl paketimiz tam size göre. 3 farklı menü alternatifi hazırladık.', time: '12:00', date: 'Dün', type: 'text' },
      { id: 'm5', senderId: 'provider', text: 'Menü seçeneklerini gönderdik. İncelemenizi rica ederiz.', time: '13:00', date: 'Bugün', type: 'text' },
      { id: 'm6', senderId: 'provider', fileName: 'kokteyl_menu_2026.pdf', fileSize: '3.1 MB', fileType: 'pdf', time: '13:01', date: 'Bugün', type: 'file' },
    ],
  },
  {
    id: 'c8',
    participantName: 'Stage Masters',
    participantImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
    participantType: 'provider',
    serviceCategory: 'technical',
    lastMessage: 'LED ekran kurulumu için ölçüler lazım.',
    lastMessageTime: '6 saat',
    unreadCount: 0,
    online: true,
    archived: false,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Festival için ana sahne + 2 yan sahne kurulumu gerekiyor.', time: '15:00', date: '2 gün önce', type: 'text' },
      { id: 'm2', senderId: 'provider', text: 'Sahne boyutları ve yükseklik tercihiniz nedir?', time: '15:30', date: '2 gün önce', type: 'text' },
      { id: 'm3', senderId: 'me', text: 'Ana sahne 20x15m, yan sahneler 10x8m olabilir. Yükseklik 2m platform.', time: '15:45', date: '2 gün önce', type: 'text' },
      { id: 'm4', senderId: 'provider', text: 'Tamam, LED ekran da dahil mi hesaplamamıza?', time: '16:00', date: '2 gün önce', type: 'text' },
      { id: 'm5', senderId: 'me', text: 'Evet, ana sahnede 8x4m LED wall istiyoruz.', time: '16:15', date: '2 gün önce', type: 'text' },
      { id: 'm6', senderId: 'provider', offerAmount: 485000, offerDescription: '3 Sahne Kurulumu + 8x4m LED Wall + Truss Sistemi', eventTitle: 'Yaz Festivali 2026', offerStatus: 'pending', time: '09:00', date: 'Dün', type: 'offer' },
      { id: 'm7', senderId: 'provider', text: 'LED ekran kurulumu için ölçüler lazım. Sahne arkası derinliği ne kadar?', time: '12:00', date: 'Bugün', type: 'text' },
    ],
  },
  {
    id: 'c9',
    participantName: 'PowerGen Jeneratör',
    participantImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
    participantType: 'provider',
    serviceCategory: 'generator',
    lastMessage: 'Jeneratörler test edildi, hazır.',
    lastMessageTime: '1 gün',
    unreadCount: 0,
    online: false,
    archived: false,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Açık alan festivali için jeneratör kiralama fiyatı alabilir miyim?', time: '10:00', date: '3 gün önce', type: 'text' },
      { id: 'm2', senderId: 'provider', text: 'Toplam güç ihtiyacınız ne kadar?', time: '10:30', date: '3 gün önce', type: 'text' },
      { id: 'm3', senderId: 'me', text: 'Ses ve ışık için yaklaşık 500kVA lazım.', time: '10:45', date: '3 gün önce', type: 'text' },
      { id: 'm4', senderId: 'provider', text: '2 adet 300kVA sessiz jeneratör öneriyorum. Yedekli sistem güvenli olur.', time: '11:00', date: '3 gün önce', type: 'text' },
      { id: 'm5', senderId: 'provider', offerAmount: 75000, offerDescription: '2x 300kVA Sessiz Jeneratör - 3 Gün (Yakıt Dahil)', eventTitle: 'Yaz Festivali 2026', offerStatus: 'accepted', time: '11:30', date: '3 gün önce', type: 'offer' },
      { id: 'm6', senderId: 'provider', text: 'Jeneratörler test edildi, hazır. Kurulum için saha koordinatları lazım.', time: '09:00', date: 'Dün', type: 'text' },
    ],
  },
  {
    id: 'c10',
    participantName: 'MedTeam Sağlık',
    participantImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400',
    participantType: 'provider',
    serviceCategory: 'medical',
    lastMessage: 'Sağlık ekibi ve ambulans hazır.',
    lastMessageTime: '1 gün',
    unreadCount: 0,
    online: false,
    archived: false,
    messages: [
      { id: 'm1', senderId: 'me', text: '5000 kişilik festival için sağlık hizmeti teklifi alabilir miyim?', time: '14:00', date: '2 gün önce', type: 'text' },
      { id: 'm2', senderId: 'provider', text: 'Tabii. Bu ölçekte etkinlik için 2 doktor, 4 sağlık personeli ve 1 ambulans öneriyoruz.', time: '14:30', date: '2 gün önce', type: 'text' },
      { id: 'm3', senderId: 'me', text: '3 gün boyunca sürekli bulunacaklar mı?', time: '14:45', date: '2 gün önce', type: 'text' },
      { id: 'm4', senderId: 'provider', text: 'Evet, 12 saatlik vardiyalarla 24 saat hizmet veriyoruz. İlk yardım çadırı da kuruyoruz.', time: '15:00', date: '2 gün önce', type: 'text' },
      { id: 'm5', senderId: 'provider', offerAmount: 95000, offerDescription: 'Sağlık Ekibi + Ambulans + İlk Yardım Çadırı - 3 Gün', eventTitle: 'Yaz Festivali 2026', offerStatus: 'accepted', time: '15:30', date: '2 gün önce', type: 'offer' },
      { id: 'm6', senderId: 'provider', text: 'Sağlık ekibi ve ambulans hazır. Koordinasyon için site planı gerekiyor.', time: '11:00', date: 'Dün', type: 'text' },
    ],
  },

  // ARŞİVLENMİŞ SOHBETLER
  {
    id: 'c11',
    participantName: 'Eski Proje - ABC Ses',
    participantImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    participantType: 'provider',
    serviceCategory: 'technical',
    lastMessage: 'Etkinlik başarıyla tamamlandı, teşekkürler!',
    lastMessageTime: '1 hafta',
    unreadCount: 0,
    online: false,
    archived: true,
    messages: [
      { id: 'm1', senderId: 'provider', text: 'Etkinlik başarıyla tamamlandı, teşekkürler!', time: '22:00', date: '1 hafta önce', type: 'text' },
    ],
  },
  {
    id: 'c12',
    participantName: 'Royal Organizasyon',
    participantImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400',
    participantType: 'organizer',
    lastMessage: 'Harika bir iş çıkardınız!',
    lastMessageTime: '2 hafta',
    unreadCount: 0,
    online: false,
    archived: true,
    messages: [
      { id: 'm1', senderId: 'organizer', text: 'Harika bir iş çıkardınız! Bir sonraki projede tekrar çalışmak isteriz.', time: '18:00', date: '2 hafta önce', type: 'text' },
    ],
  },
];

// Helper: Conversation listesi için özet format
export function getConversationList() {
  return conversations.map(c => ({
    id: c.id,
    name: c.participantName,
    message: c.lastMessage,
    time: c.lastMessageTime,
    unread: c.unreadCount,
    avatar: c.participantImage,
    archived: c.archived,
    online: c.online,
    serviceCategory: c.serviceCategory,
  }));
}

// Helper: ID ile conversation bul
export function getConversationById(id: string): Conversation | undefined {
  return conversations.find(c => c.id === id);
}

// Helper: Yeni conversation oluştur
export function createNewConversation(
  providerId: string,
  providerName: string,
  providerImage: string,
  serviceCategory?: string
): Conversation {
  return {
    id: `new_${providerId}`,
    participantName: providerName,
    participantImage: providerImage,
    participantType: 'provider',
    serviceCategory,
    lastMessage: '',
    lastMessageTime: 'Şimdi',
    unreadCount: 0,
    online: true,
    archived: false,
    messages: [
      {
        id: 'm1',
        senderId: 'provider',
        text: `Merhaba! ${providerName} olarak size nasıl yardımcı olabiliriz?`,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        date: 'Bugün',
        type: 'text',
      },
    ],
  };
}
