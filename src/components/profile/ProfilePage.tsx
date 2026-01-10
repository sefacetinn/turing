import {
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Camera,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

interface ProfilePageProps {
  isProviderMode: boolean;
  onToggleMode: () => void;
  onLogout: () => void;
}

// Mock user data
const organizerProfile = {
  name: 'Ahmet Yılmaz',
  email: 'ahmet@example.com',
  phone: '+90 532 123 4567',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  company: 'MegaEvent Organizasyon',
  location: 'İstanbul',
  eventsCreated: 24,
  totalSpent: '₺450.000',
};

const providerProfile = {
  name: 'Pro Sound Istanbul',
  email: 'info@prosound.com',
  phone: '+90 212 555 8899',
  avatar: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200&h=200&fit=crop',
  category: 'Teknik Hizmetler',
  location: 'İstanbul',
  rating: 4.9,
  reviews: 128,
  completedJobs: 156,
  totalEarned: '₺1.2M',
  verified: true,
};

const menuItems = [
  { icon: User, label: 'Profil Bilgileri', action: 'profile' },
  { icon: Bell, label: 'Bildirim Ayarları', action: 'notifications' },
  { icon: Shield, label: 'Gizlilik ve Güvenlik', action: 'privacy' },
  { icon: HelpCircle, label: 'Yardım ve Destek', action: 'help' },
];

export function ProfilePage({ isProviderMode, onToggleMode, onLogout }: ProfilePageProps) {
  const profile = isProviderMode ? providerProfile : organizerProfile;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <h1 className="text-2xl font-bold text-white">Profil</h1>
      </div>

      {/* Profile Card */}
      <div className="px-5 py-3">
        <div className="glass-card p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 rounded-2xl object-cover"
              />
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center border-2 border-[#0f0f12]">
                <Camera size={14} className="text-white" />
              </button>
              {isProviderMode && (providerProfile as typeof providerProfile).verified && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#0f0f12]">
                  <CheckCircle size={12} className="text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{profile.name}</h2>
              {isProviderMode ? (
                <p className="text-sm text-purple-400 font-medium">
                  {(profile as typeof providerProfile).category}
                </p>
              ) : (
                <p className="text-sm text-zinc-400">
                  {(profile as typeof organizerProfile).company}
                </p>
              )}
              <div className="flex items-center gap-1 mt-2 text-zinc-500">
                <MapPin size={14} />
                <span className="text-sm">{profile.location}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-zinc-800/50">
            {isProviderMode ? (
              <>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    <span className="text-xl font-bold text-white">
                      {(profile as typeof providerProfile).rating}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {(profile as typeof providerProfile).reviews} değerlendirme
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">
                    {(profile as typeof providerProfile).completedJobs}
                  </p>
                  <p className="text-xs text-zinc-500">Tamamlanan İş</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-400">
                    {(profile as typeof providerProfile).totalEarned}
                  </p>
                  <p className="text-xs text-zinc-500">Toplam Kazanç</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">
                    {(profile as typeof organizerProfile).eventsCreated}
                  </p>
                  <p className="text-xs text-zinc-500">Etkinlik</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-purple-400">
                    {(profile as typeof organizerProfile).totalSpent}
                  </p>
                  <p className="text-xs text-zinc-500">Toplam Harcama</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">12</p>
                  <p className="text-xs text-zinc-500">Favori Sağlayıcı</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="px-5 py-3">
        <div className="glass-card divide-y divide-zinc-800/50">
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Mail size={18} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500">E-posta</p>
              <p className="text-sm text-white">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Phone size={18} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500">Telefon</p>
              <p className="text-sm text-white">{profile.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switch */}
      <div className="px-5 py-3">
        <button
          onClick={onToggleMode}
          className="w-full feature-card flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <RefreshCw size={22} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">
                {isProviderMode ? 'Organizatör Moduna Geç' : 'Sağlayıcı Moduna Geç'}
              </h3>
              <p className="text-sm text-zinc-400">
                {isProviderMode ? 'Etkinlik organize edin' : 'Hizmet sunmaya başlayın'}
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-zinc-500" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="px-5 py-3">
        <div className="glass-card divide-y divide-zinc-800/50">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.action}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                  <Icon size={18} className="text-zinc-400" />
                </div>
                <span className="flex-1 text-white">{item.label}</span>
                <ChevronRight size={18} className="text-zinc-600" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-5 py-4">
        <button
          onClick={onLogout}
          className="w-full btn-secondary flex items-center justify-center gap-2 text-red-400 border-red-500/20"
        >
          <LogOut size={18} />
          <span>Çıkış Yap</span>
        </button>
      </div>

      {/* App Version */}
      <div className="px-5 py-4 text-center">
        <p className="text-xs text-zinc-600">Turing v1.0.0</p>
      </div>

      {/* Bottom Spacer */}
      <div className="h-8" />
    </div>
  );
}
