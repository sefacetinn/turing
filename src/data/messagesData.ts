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

// TODO: Fetch from Firebase
export const conversations: Conversation[] = [];

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
