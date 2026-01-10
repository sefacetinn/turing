import {
  Music,
  Speaker,
  Hotel,
  Building2,
  Plane,
  Car,
  Settings,
  Search,
  Bell,
  Plus,
  ChevronRight,
  Star,
  MapPin,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import type { ViewType, ServiceCategory } from '../../types';

interface OrganizerHomeProps {
  onNavigate: (view: ViewType) => void;
  onSelectCategory: (category: ServiceCategory) => void;
  onRequestOffer: (category: ServiceCategory) => void;
}

const categories = [
  {
    id: 'booking' as ServiceCategory,
    name: 'Booking',
    description: 'Sanatçı & DJ',
    icon: Music,
    gradient: 'gradient-booking',
    popular: true,
  },
  {
    id: 'technical' as ServiceCategory,
    name: 'Teknik',
    description: 'Ses & Işık & Sahne',
    icon: Speaker,
    gradient: 'gradient-technical',
    popular: true,
  },
  {
    id: 'venue' as ServiceCategory,
    name: 'Mekan',
    description: 'Etkinlik Alanları',
    icon: Building2,
    gradient: 'gradient-venue',
    popular: false,
  },
  {
    id: 'accommodation' as ServiceCategory,
    name: 'Konaklama',
    description: 'Otel & Konut',
    icon: Hotel,
    gradient: 'gradient-accommodation',
    popular: false,
  },
  {
    id: 'transport' as ServiceCategory,
    name: 'Ulaşım',
    description: 'VIP Transfer',
    icon: Car,
    gradient: 'gradient-transport',
    popular: false,
  },
  {
    id: 'flight' as ServiceCategory,
    name: 'Uçak',
    description: 'Uçuş Hizmetleri',
    icon: Plane,
    gradient: 'gradient-flight',
    popular: false,
  },
];

const operationCategory = {
  id: 'operation' as ServiceCategory,
  name: 'Operasyon',
  description: 'Güvenlik, Catering, Jeneratör ve 9 hizmet daha',
  icon: Settings,
  gradient: 'gradient-operation',
};

const recentProviders = [
  {
    id: '1',
    name: 'Pro Sound Istanbul',
    category: 'Teknik',
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200&h=200&fit=crop',
    location: 'İstanbul',
    verified: true,
  },
  {
    id: '2',
    name: 'Elite Transfer',
    category: 'Ulaşım',
    rating: 4.8,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=200&fit=crop',
    location: 'İstanbul',
    verified: true,
  },
  {
    id: '3',
    name: 'Grand Hotel',
    category: 'Konaklama',
    rating: 4.7,
    reviews: 256,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop',
    location: 'Ankara',
    verified: false,
  },
];

export function OrganizerHome({ onNavigate, onSelectCategory: _onSelectCategory, onRequestOffer }: OrganizerHomeProps) {
  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-sm">Hoş geldin</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">Merhaba! 👋</h1>
          </div>
          <button className="relative w-11 h-11 rounded-2xl glass flex items-center justify-center active:scale-95 transition-transform">
            <Bell size={20} className="text-zinc-400" />
            <span className="notification-badge">3</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-5 py-3">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Sanatçı, mekan veya hizmet ara..."
            className="search-bar"
          />
        </div>
      </div>

      {/* Feature Card - New Event */}
      <div className="px-5 py-2">
        <button
          onClick={() => onNavigate('create')}
          className="w-full feature-card active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={14} className="text-purple-400" />
                <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Hızlı Başla</span>
              </div>
              <h3 className="font-semibold text-white text-base">Etkinlik Oluştur</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Tüm hizmetleri tek yerden yönet</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Plus size={24} className="text-white" />
            </div>
          </div>
        </button>
      </div>

      {/* Categories Header */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Hizmetler</h2>
          <button className="text-sm text-purple-400 font-medium flex items-center gap-0.5 active:opacity-70">
            Tümü <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Categories Grid - 3x2 layout */}
      <div className="px-5 py-2">
        <div className="grid grid-cols-3 gap-2.5">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onRequestOffer(category.id)}
                className={`category-card ${category.gradient} animate-slideUp aspect-[1/1.1] flex flex-col items-center justify-center text-center`}
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'backwards' }}
              >
                {category.popular && (
                  <div className="absolute top-2 right-2">
                    <TrendingUp size={12} className="text-white/70" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-white text-[13px]">{category.name}</h3>
                <p className="text-[9px] text-white/60 mt-0.5 px-1 line-clamp-1">{category.description}</p>
              </button>
            );
          })}
        </div>

        {/* Operation Category - Full Width */}
        <button
          onClick={() => onRequestOffer(operationCategory.id)}
          className={`w-full mt-2.5 category-card ${operationCategory.gradient} flex items-center gap-4 py-4 animate-slideUp`}
          style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Settings size={24} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-white">{operationCategory.name}</h3>
            <p className="text-xs text-white/70 mt-0.5">{operationCategory.description}</p>
          </div>
          <ChevronRight size={20} className="text-white/50" />
        </button>
      </div>

      {/* Recent Providers */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Son Görüntülenenler</h2>
          <button className="text-sm text-purple-400 font-medium flex items-center gap-0.5 active:opacity-70">
            Tümü <ChevronRight size={16} />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentProviders.map((provider, index) => (
            <button
              key={provider.id}
              className="w-full list-item-card flex items-center gap-3 animate-slideUp active:scale-[0.99] transition-transform"
              style={{ animationDelay: `${0.35 + index * 0.05}s`, animationFillMode: 'backwards' }}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={provider.image}
                  alt={provider.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                {provider.verified && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center border-2 border-[#09090b]">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-medium text-white text-sm truncate">{provider.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-purple-400 font-medium">{provider.category}</span>
                  <span className="text-zinc-700 text-[10px]">•</span>
                  <div className="flex items-center gap-0.5">
                    <MapPin size={10} className="text-zinc-500" />
                    <span className="text-[11px] text-zinc-500">{provider.location}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold text-white">{provider.rating}</span>
                </div>
                <span className="text-[9px] text-zinc-500">{provider.reviews} yorum</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-5 py-4">
        <div className="glass-card p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-white">270+</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Sanatçı</p>
            </div>
            <div className="text-center border-x border-zinc-800">
              <p className="text-xl font-bold text-white">150+</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Mekan</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">500+</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Sağlayıcı</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-6" />
    </div>
  );
}
