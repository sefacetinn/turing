import { Home, Calendar, FileText, MessageSquare, User } from 'lucide-react';
import type { ViewType } from '../../types';

interface BottomNavigationProps {
  currentView: ViewType;
  isProviderMode: boolean;
  onNavigate: (view: ViewType) => void;
}

export function BottomNavigation({ currentView, isProviderMode, onNavigate }: BottomNavigationProps) {
  const navItems = [
    {
      id: 'home' as ViewType,
      label: 'Ana Sayfa',
      icon: Home,
    },
    {
      id: 'events' as ViewType,
      label: isProviderMode ? 'Islerim' : 'Etkinlikler',
      icon: Calendar,
    },
    {
      id: 'offers' as ViewType,
      label: 'Teklifler',
      icon: FileText,
    },
    {
      id: 'messages' as ViewType,
      label: 'Mesajlar',
      icon: MessageSquare,
    },
    {
      id: 'profile' as ViewType,
      label: 'Profil',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[393px] mx-auto bottom-nav z-50">
      <div className="flex items-center justify-around py-1.5 px-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`nav-item min-touch flex-1 ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-all duration-200 ${
                    isActive ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]' : 'text-zinc-500'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-1 font-medium transition-all duration-200 ${
                  isActive ? 'text-purple-400' : 'text-zinc-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
