import { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Calendar,
  MapPin,
  Filter,
  Music,
  Speaker,
  Hotel,
  Building2,
  Plane,
  Car,
  Settings
} from 'lucide-react';
import type { ServiceCategory } from '../../types';

interface OffersPageProps {
  isProviderMode: boolean;
}

const categoryIcons: Record<ServiceCategory, typeof Music> = {
  booking: Music,
  technical: Speaker,
  accommodation: Hotel,
  venue: Building2,
  flight: Plane,
  transport: Car,
  operation: Settings,
};

const categoryColors: Record<ServiceCategory, string> = {
  booking: 'bg-purple-500/15 text-purple-400',
  technical: 'bg-emerald-500/15 text-emerald-400',
  accommodation: 'bg-pink-500/15 text-pink-400',
  venue: 'bg-blue-500/15 text-blue-400',
  flight: 'bg-gray-500/15 text-gray-400',
  transport: 'bg-red-500/15 text-red-400',
  operation: 'bg-orange-500/15 text-orange-400',
};

// Mock data - Organizer'ın gönderdiği teklif istekleri
const organizerOffers = [
  {
    id: '1',
    eventName: 'Yılbaşı Konseri',
    category: 'booking' as ServiceCategory,
    artistName: 'Mavi Gri',
    date: '31 Aralık 2025',
    city: 'İstanbul',
    status: 'pending',
    receivedOffers: 3,
    createdAt: '2 saat önce',
  },
  {
    id: '2',
    eventName: 'Yılbaşı Konseri',
    category: 'technical' as ServiceCategory,
    services: ['Ses Sistemi', 'Işık Sistemi'],
    date: '31 Aralık 2025',
    city: 'İstanbul',
    status: 'received',
    receivedOffers: 5,
    createdAt: '3 saat önce',
  },
  {
    id: '3',
    eventName: 'Kurumsal Lansman',
    category: 'venue' as ServiceCategory,
    guestCount: 200,
    date: '15 Ocak 2026',
    city: 'Ankara',
    status: 'accepted',
    receivedOffers: 2,
    acceptedProvider: 'Hilton Ankara',
    createdAt: '1 gün önce',
  },
];

// Mock data - Provider'a gelen teklif istekleri
const providerOffers = [
  {
    id: '1',
    eventName: 'Yılbaşı Konseri',
    organizerName: 'MegaEvent Organizasyon',
    category: 'technical' as ServiceCategory,
    services: ['Ses Sistemi', 'Işık Sistemi', 'Sahne'],
    date: '31 Aralık 2025',
    city: 'İstanbul',
    venue: 'Volkswagen Arena',
    budget: '₺45.000',
    status: 'new',
    createdAt: '30 dakika önce',
  },
  {
    id: '2',
    eventName: 'Kurumsal Lansman',
    organizerName: 'ABC Holding',
    category: 'technical' as ServiceCategory,
    services: ['Ses Sistemi', 'LED Ekran'],
    date: '15 Ocak 2026',
    city: 'Ankara',
    venue: 'JW Marriott',
    budget: '₺28.000',
    status: 'pending',
    createdAt: '2 saat önce',
  },
  {
    id: '3',
    eventName: 'Festival Sahne',
    organizerName: 'Fest Organizasyon',
    category: 'technical' as ServiceCategory,
    services: ['Sahne Kurulum', 'Truss/Rigging'],
    date: '20 Şubat 2026',
    city: 'İzmir',
    venue: 'Kültürpark',
    budget: '₺65.000',
    status: 'sent',
    myOffer: '₺58.000',
    createdAt: '1 gün önce',
  },
];

const statusConfig = {
  pending: { label: 'Bekliyor', color: 'bg-yellow-500/15 text-yellow-400', icon: Clock },
  received: { label: 'Teklif Geldi', color: 'bg-purple-500/15 text-purple-400', icon: FileText },
  accepted: { label: 'Onaylandı', color: 'bg-emerald-500/15 text-emerald-400', icon: CheckCircle },
  rejected: { label: 'Reddedildi', color: 'bg-red-500/15 text-red-400', icon: XCircle },
  new: { label: 'Yeni', color: 'bg-orange-500/15 text-orange-400', icon: FileText },
  sent: { label: 'Teklif Gönderildi', color: 'bg-blue-500/15 text-blue-400', icon: CheckCircle },
};

export function OffersPage({ isProviderMode }: OffersPageProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const offers = isProviderMode ? providerOffers : organizerOffers;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isProviderMode ? 'Gelen Teklifler' : 'Tekliflerim'}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {isProviderMode ? 'Size gelen teklif talepleri' : 'Gönderdiğiniz teklif talepleri'}
            </p>
          </div>
          <button className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <Filter size={18} className="text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 py-3">
        <div className="tab-selector">
          <button
            onClick={() => setActiveTab('active')}
            className={`tab-item ${activeTab === 'active' ? 'active' : ''}`}
          >
            Aktif ({offers.filter((o) => o.status !== 'accepted').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`tab-item ${activeTab === 'completed' ? 'active' : ''}`}
          >
            Tamamlanan
          </button>
        </div>
      </div>

      {/* Offers List */}
      <div className="px-5 py-3 space-y-3">
        {offers.map((offer, index) => {
          const CategoryIcon = categoryIcons[offer.category];
          const status = statusConfig[offer.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <button
              key={offer.id}
              className={`w-full list-item-card animate-slideUp stagger-${index + 1}`}
              style={{ animationFillMode: 'backwards' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`icon-container-md ${categoryColors[offer.category]}`}>
                    <CategoryIcon size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">{offer.eventName}</h3>
                    <p className="text-sm text-zinc-500">
                      {isProviderMode
                        ? (offer as typeof providerOffers[0]).organizerName
                        : offer.category === 'booking'
                        ? (offer as typeof organizerOffers[0]).artistName
                        : `${(offer as typeof organizerOffers[0]).receivedOffers} teklif`}
                    </p>
                  </div>
                </div>
                <span className={`badge ${status.color} flex items-center gap-1`}>
                  <StatusIcon size={12} />
                  {status.label}
                </span>
              </div>

              {/* Details */}
              <div className="flex items-center gap-4 text-zinc-500 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{offer.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{offer.city}</span>
                </div>
              </div>

              {/* Provider Mode - Budget & Action */}
              {isProviderMode && (
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                  <div>
                    <span className="text-xs text-zinc-500">Bütçe: </span>
                    <span className="text-lg font-bold text-emerald-400">
                      {(offer as typeof providerOffers[0]).budget}
                    </span>
                  </div>
                  {offer.status === 'sent' ? (
                    <span className="text-sm text-blue-400">
                      Teklifiniz: {(offer as typeof providerOffers[0]).myOffer}
                    </span>
                  ) : (
                    <ChevronRight size={18} className="text-zinc-600" />
                  )}
                </div>
              )}

              {/* Organizer Mode - Accepted Provider */}
              {!isProviderMode && offer.status === 'accepted' && (
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <span className="text-sm text-emerald-400">
                      {(offer as typeof organizerOffers[0]).acceptedProvider}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-zinc-600" />
                </div>
              )}

              {/* Organizer Mode - Received Offers */}
              {!isProviderMode && offer.status === 'received' && (
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                  <span className="text-sm text-purple-400 font-medium">
                    {(offer as typeof organizerOffers[0]).receivedOffers} teklif değerlendir
                  </span>
                  <ChevronRight size={18} className="text-zinc-600" />
                </div>
              )}

              {/* Footer - Time */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/30">
                <span className="text-xs text-zinc-600">{offer.createdAt}</span>
                {!isProviderMode && offer.status === 'pending' && (
                  <span className="text-xs text-yellow-500">Teklif bekleniyor...</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {offers.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileText size={32} className="text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Henüz teklif yok</h3>
          <p className="text-sm text-zinc-500">
            {isProviderMode
              ? 'Size gelen teklif talepleri burada görünecek'
              : 'Hizmet kategorilerinden teklif isteyin'}
          </p>
        </div>
      )}

      {/* Bottom Spacer */}
      <div className="h-8" />
    </div>
  );
}
