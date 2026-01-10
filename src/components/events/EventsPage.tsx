import { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  Plus,
  Filter,
  Music,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import type { ViewType } from '../../types';

interface EventsPageProps {
  isProviderMode: boolean;
  onNavigate: (view: ViewType) => void;
}

// Mock data - Organizer'ın etkinlikleri
const organizerEvents = [
  {
    id: '1',
    title: 'Yılbaşı Konseri',
    artist: 'Mavi Gri',
    date: '31 Aralık 2025',
    time: '22:00',
    city: 'İstanbul',
    venue: 'Volkswagen Arena',
    status: 'planning',
    completedServices: 4,
    totalServices: 6,
    budget: '₺250.000',
  },
  {
    id: '2',
    title: 'Kurumsal Lansman',
    date: '15 Ocak 2026',
    time: '19:00',
    city: 'Ankara',
    venue: 'JW Marriott',
    status: 'confirmed',
    completedServices: 5,
    totalServices: 5,
    budget: '₺180.000',
    guestCount: 200,
  },
  {
    id: '3',
    title: 'Açık Hava Festivali',
    date: '20 Şubat 2026',
    time: '18:00',
    city: 'İzmir',
    venue: 'Kültürpark',
    status: 'draft',
    completedServices: 1,
    totalServices: 8,
    budget: '₺500.000',
    guestCount: 5000,
  },
];

// Mock data - Provider'ın işleri
const providerJobs = [
  {
    id: '1',
    title: 'Yılbaşı Konseri - Ses Sistemi',
    organizerName: 'MegaEvent',
    artist: 'Mavi Gri',
    date: '31 Aralık 2025',
    time: '22:00',
    city: 'İstanbul',
    venue: 'Volkswagen Arena',
    status: 'confirmed',
    payment: '₺45.000',
    daysLeft: 5,
  },
  {
    id: '2',
    title: 'Kurumsal Lansman - Teknik',
    organizerName: 'ABC Holding',
    date: '15 Ocak 2026',
    time: '19:00',
    city: 'Ankara',
    venue: 'JW Marriott',
    status: 'confirmed',
    payment: '₺28.000',
    daysLeft: 20,
  },
  {
    id: '3',
    title: 'Düğün - Ses & Işık',
    organizerName: 'Kişisel',
    date: '25 Ocak 2026',
    time: '18:00',
    city: 'İstanbul',
    venue: 'Four Seasons',
    status: 'pending',
    payment: '₺15.000',
    daysLeft: 30,
  },
];

const statusConfig = {
  draft: { label: 'Taslak', color: 'bg-zinc-500/15 text-zinc-400', icon: AlertCircle },
  planning: { label: 'Planlanıyor', color: 'bg-yellow-500/15 text-yellow-400', icon: Clock },
  confirmed: { label: 'Onaylandı', color: 'bg-emerald-500/15 text-emerald-400', icon: CheckCircle },
  completed: { label: 'Tamamlandı', color: 'bg-blue-500/15 text-blue-400', icon: CheckCircle },
  pending: { label: 'Bekliyor', color: 'bg-orange-500/15 text-orange-400', icon: Clock },
};

export function EventsPage({ isProviderMode, onNavigate }: EventsPageProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const items = isProviderMode ? providerJobs : organizerEvents;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isProviderMode ? 'İşlerim' : 'Etkinliklerim'}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {isProviderMode ? 'Aktif ve tamamlanan işler' : 'Etkinliklerinizi yönetin'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl glass flex items-center justify-center">
              <Filter size={18} className="text-zinc-400" />
            </button>
            {!isProviderMode && (
              <button
                onClick={() => onNavigate('create')}
                className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center"
              >
                <Plus size={20} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 py-3">
        <div className="tab-selector">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`tab-item ${activeTab === 'upcoming' ? 'active' : ''}`}
          >
            <PlayCircle size={16} />
            Yaklaşan
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`tab-item ${activeTab === 'past' ? 'active' : ''}`}
          >
            <CheckCircle size={16} />
            Tamamlanan
          </button>
        </div>
      </div>

      {/* Calendar Quick View */}
      <div className="px-5 py-3">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Bu Hafta</h3>
            <button className="text-sm text-purple-400">Takvim</button>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, i) => {
              const date = 27 + i;
              const hasEvent = i === 4; // Friday has an event
              return (
                <div
                  key={day}
                  className={`flex-shrink-0 w-12 py-3 rounded-xl text-center ${
                    hasEvent
                      ? 'bg-purple-500 text-white'
                      : i === 0
                      ? 'bg-zinc-800 text-white'
                      : 'bg-zinc-800/50 text-zinc-400'
                  }`}
                >
                  <p className="text-xs mb-1">{day}</p>
                  <p className="text-lg font-semibold">{date}</p>
                  {hasEvent && <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-1" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Events/Jobs List */}
      <div className="px-5 py-3 space-y-3">
        {items.map((item, index) => {
          const status = statusConfig[item.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <button
              key={item.id}
              className={`w-full list-item-card animate-slideUp stagger-${index + 1}`}
              style={{ animationFillMode: 'backwards' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-left">{item.title}</h3>
                  {isProviderMode ? (
                    <p className="text-sm text-zinc-500">
                      {(item as typeof providerJobs[0]).organizerName}
                    </p>
                  ) : (
                    (item as typeof organizerEvents[0]).artist && (
                      <div className="flex items-center gap-1 mt-1">
                        <Music size={12} className="text-purple-400" />
                        <span className="text-sm text-purple-400">
                          {(item as typeof organizerEvents[0]).artist}
                        </span>
                      </div>
                    )
                  )}
                </div>
                <span className={`badge ${status.color} flex items-center gap-1`}>
                  <StatusIcon size={12} />
                  {status.label}
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-wrap items-center gap-3 text-zinc-500 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{item.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{item.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{item.city}</span>
                </div>
              </div>

              {/* Venue */}
              <p className="text-sm text-zinc-400 mb-3">{item.venue}</p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                {isProviderMode ? (
                  <>
                    <div>
                      <span className="text-lg font-bold text-emerald-400">
                        {(item as typeof providerJobs[0]).payment}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">
                        {(item as typeof providerJobs[0]).daysLeft} gün kaldı
                      </span>
                      <ChevronRight size={16} className="text-zinc-600" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden w-20">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${
                              ((item as typeof organizerEvents[0]).completedServices /
                                (item as typeof organizerEvents[0]).totalServices) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500">
                        {(item as typeof organizerEvents[0]).completedServices}/
                        {(item as typeof organizerEvents[0]).totalServices} hizmet
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {(item as typeof organizerEvents[0]).budget}
                    </span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Calendar size={32} className="text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {isProviderMode ? 'Henüz iş yok' : 'Henüz etkinlik yok'}
          </h3>
          <p className="text-sm text-zinc-500">
            {isProviderMode
              ? 'Teklif kabul ettiğinizde işleriniz burada görünecek'
              : 'İlk etkinliğinizi oluşturmak için + butonuna tıklayın'}
          </p>
        </div>
      )}

      {/* Bottom Spacer */}
      <div className="h-8" />
    </div>
  );
}
