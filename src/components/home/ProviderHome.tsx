import {
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  ChevronRight,
  Calendar,
  Users,
  Star,
  Music,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import type { ViewType, ServiceCategory } from '../../types';

interface ProviderHomeProps {
  onNavigate: (view: ViewType) => void;
  onSelectCategory: (category: ServiceCategory) => void;
}

const stats = [
  {
    label: 'Aktif Teklif',
    value: '12',
    icon: FileText,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    trend: '+3',
  },
  {
    label: 'Bu Ay Gelir',
    value: '₺45.2K',
    icon: TrendingUp,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    trend: '+12%',
  },
  {
    label: 'Tamamlanan',
    value: '28',
    icon: CheckCircle,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    trend: '+5',
  },
  {
    label: 'Ortalama Puan',
    value: '4.9',
    icon: Star,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
    trend: null,
  },
];

const pendingOffers = [
  {
    id: '1',
    eventName: 'Yılbaşı Konseri',
    organizerName: 'MegaEvent',
    date: '31 Aralık 2025',
    budget: '₺25.000',
    status: 'pending',
    category: 'Teknik',
    urgency: 'high',
  },
  {
    id: '2',
    eventName: 'Kurumsal Lansman',
    organizerName: 'ABC Holding',
    date: '15 Ocak 2026',
    budget: '₺18.000',
    status: 'pending',
    category: 'Ses Sistemi',
    urgency: 'medium',
  },
  {
    id: '3',
    eventName: 'Festival Sahne',
    organizerName: 'Fest Org.',
    date: '20 Ocak 2026',
    budget: '₺40.000',
    status: 'new',
    category: 'Sahne Kurulum',
    urgency: 'low',
  },
];

const upcomingJobs = [
  {
    id: '1',
    eventName: 'Mavi Gri - Ankara Konseri',
    venue: 'IF Performance Hall',
    date: '18 Ocak 2026',
    time: '21:00',
    daysLeft: 8,
  },
  {
    id: '2',
    eventName: 'Ufuk Beydemir - İzmir',
    venue: 'Kültürpark Açıkhava',
    date: '22 Ocak 2026',
    time: '20:30',
    daysLeft: 12,
  },
];

export function ProviderHome({ onNavigate, onSelectCategory: _onSelectCategory }: ProviderHomeProps) {
  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-sm mb-1">Hoş geldin</p>
            <h1 className="text-xl font-bold text-white">Pro Sound Istanbul</h1>
          </div>
          <button className="relative w-11 h-11 rounded-2xl glass flex items-center justify-center">
            <Bell size={20} className="text-zinc-400" />
            <span className="notification-badge">5</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-5 py-3">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`stats-card animate-slideUp stagger-${index + 1}`}
                style={{ animationFillMode: 'backwards' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`icon-container-md ${stat.bgColor}`}>
                    <Icon size={20} className={stat.color} />
                  </div>
                  {stat.trend && (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {stat.trend}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Offers */}
      <div className="px-5 py-4">
        <div className="section-header">
          <h2 className="section-title">Bekleyen Teklifler</h2>
          <button
            onClick={() => onNavigate('offers')}
            className="section-link"
          >
            Tümü <ChevronRight size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {pendingOffers.map((offer, index) => (
            <button
              key={offer.id}
              className={`w-full list-item-card animate-slideUp stagger-${index + 1}`}
              style={{ animationFillMode: 'backwards' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{offer.eventName}</h3>
                    {offer.status === 'new' && (
                      <span className="badge badge-new">Yeni</span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500">{offer.organizerName}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-400">{offer.budget}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Calendar size={13} />
                    <span className="text-xs">{offer.date}</span>
                  </div>
                  <span className="badge badge-pending">{offer.category}</span>
                </div>
                <ArrowUpRight size={16} className="text-zinc-600" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Jobs */}
      <div className="px-5 py-4">
        <div className="section-header">
          <h2 className="section-title">Yaklaşan İşler</h2>
          <button
            onClick={() => onNavigate('events')}
            className="section-link"
          >
            Takvim <ChevronRight size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {upcomingJobs.map((job, index) => (
            <div
              key={job.id}
              className={`feature-card animate-slideUp stagger-${index + 1}`}
              style={{ animationFillMode: 'backwards' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Music size={22} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{job.eventName}</h3>
                  <p className="text-sm text-zinc-400 truncate">{job.venue}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-purple-300">{job.daysLeft} gün</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-purple-500/20">
                <div className="flex items-center gap-1.5 text-purple-300">
                  <Calendar size={14} />
                  <span className="text-sm">{job.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-300">
                  <Clock size={14} />
                  <span className="text-sm">{job.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 py-4">
        <h2 className="section-title mb-3">Hızlı Erişim</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate('provider-artist-roster')}
            className="quick-action"
          >
            <Users size={24} className="text-purple-400" />
            <span className="text-xs text-zinc-400 text-center">Sanatçı Roster</span>
          </button>
          <button
            onClick={() => onNavigate('calendar')}
            className="quick-action"
          >
            <Calendar size={24} className="text-blue-400" />
            <span className="text-xs text-zinc-400 text-center">Takvim</span>
          </button>
          <button
            onClick={() => onNavigate('reviews')}
            className="quick-action"
          >
            <Star size={24} className="text-amber-400" />
            <span className="text-xs text-zinc-400 text-center">Değerlendirmeler</span>
          </button>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="px-5 py-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Bu Ay Performansın</h3>
              <p className="text-xs text-zinc-500">Geçen aya göre %18 artış</p>
            </div>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
              style={{ width: '78%' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-zinc-500">Hedef: ₺60.000</span>
            <span className="text-xs text-purple-400 font-medium">₺45.200 / 78%</span>
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-8" />
    </div>
  );
}
