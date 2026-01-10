import { useState } from 'react';
import { Search, MoreVertical, CheckCheck } from 'lucide-react';

interface MessagesPageProps {
  isProviderMode: boolean;
}

// Mock data
const conversations = [
  {
    id: '1',
    name: 'MegaEvent Organizasyon',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
    lastMessage: 'Teknik rider dosyasını aldık, teşekkürler!',
    time: '14:32',
    unread: 2,
    online: true,
    isProvider: false,
  },
  {
    id: '2',
    name: 'Pro Sound Istanbul',
    avatar: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100&h=100&fit=crop',
    lastMessage: 'Fiyat teklifimizi gönderdik.',
    time: '12:15',
    unread: 0,
    online: true,
    isProvider: true,
  },
  {
    id: '3',
    name: 'Elite Transfer',
    avatar: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&h=100&fit=crop',
    lastMessage: 'Mercedes Vito müsait. 31 Aralık için ayırdık.',
    time: 'Dün',
    unread: 0,
    online: false,
    isProvider: true,
  },
  {
    id: '4',
    name: 'Hilton Istanbul',
    avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop',
    lastMessage: '5 oda için onay verdik. İyi çalışmalar.',
    time: 'Dün',
    unread: 0,
    online: false,
    isProvider: true,
  },
  {
    id: '5',
    name: 'ABC Holding',
    avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
    lastMessage: 'Lansman için detayları konuşalım.',
    time: '2 gün önce',
    unread: 0,
    online: false,
    isProvider: false,
  },
];

export function MessagesPage({ isProviderMode: _isProviderMode }: MessagesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Mesajlar</h1>
          <button className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <MoreVertical size={18} className="text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-3">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mesajlarda ara..."
            className="search-bar"
          />
        </div>
      </div>

      {/* Online Now */}
      <div className="px-5 py-3">
        <h2 className="text-sm font-medium text-zinc-500 mb-3">Çevrimiçi</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {conversations
            .filter((c) => c.online)
            .map((conv) => (
              <button key={conv.id} className="flex flex-col items-center gap-2">
                <div className="relative">
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-purple-500"
                  />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0f0f12]" />
                </div>
                <span className="text-xs text-zinc-400 w-16 truncate text-center">
                  {conv.name.split(' ')[0]}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* Conversations */}
      <div className="px-5 py-3">
        <h2 className="text-sm font-medium text-zinc-500 mb-3">Son Mesajlar</h2>
        <div className="space-y-2">
          {filteredConversations.map((conv, index) => (
            <button
              key={conv.id}
              className={`w-full list-item-card flex items-center gap-4 animate-slideUp stagger-${index + 1}`}
              style={{ animationFillMode: 'backwards' }}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={conv.avatar}
                  alt={conv.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0f0f12]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white truncate pr-2">{conv.name}</h3>
                  <span className="text-xs text-zinc-500 flex-shrink-0">{conv.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  {conv.unread === 0 && (
                    <CheckCheck size={14} className="text-purple-400 flex-shrink-0" />
                  )}
                  <p className="text-sm text-zinc-400 truncate">{conv.lastMessage}</p>
                </div>
              </div>

              {/* Unread Badge */}
              {conv.unread > 0 && (
                <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{conv.unread}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredConversations.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search size={32} className="text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Sonuç bulunamadı</h3>
          <p className="text-sm text-zinc-500">"{searchQuery}" ile eşleşen mesaj yok</p>
        </div>
      )}

      {/* Bottom Spacer */}
      <div className="h-8" />
    </div>
  );
}
