import { useState, useCallback } from 'react';
import './styles/globals.css';
import type { ViewType, ServiceCategory, Provider } from './types';
import { BottomNavigation } from './components/navigation/BottomNavigation';
import { OrganizerHome } from './components/home/OrganizerHome';
import { ProviderHome } from './components/home/ProviderHome';
import { LoginPage } from './components/navigation/LoginPage';
import { RequestOfferModal } from './components/modals/RequestOfferModal';
import { OffersPage } from './components/offers/OffersPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { EventsPage } from './components/events/EventsPage';
import { MessagesPage } from './components/messages/MessagesPage';
import { InstallPrompt } from './components/pwa/InstallPrompt';
import type { RequestOfferData } from './components/modals/RequestOfferModal';

function App() {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProviderMode, setIsProviderMode] = useState(false);

  // Navigation State
  const [currentView, setCurrentView] = useState<ViewType>('home');

  // Selection State
  const [_selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [_selectedProvider, _setSelectedProvider] = useState<Provider | null>(null);

  // Modal States
  const [showRequestOffer, setShowRequestOffer] = useState(false);
  const [requestOfferCategory, setRequestOfferCategory] = useState<ServiceCategory>('booking');

  // Navigation Functions
  const navigateTo = useCallback((view: ViewType) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  }, []);

  // Toggle Provider Mode
  const toggleMode = useCallback(() => {
    setIsProviderMode(prev => !prev);
    setCurrentView('home');
    window.scrollTo(0, 0);
  }, []);

  // Login Handler
  const handleLogin = (asProvider: boolean) => {
    setIsLoggedIn(true);
    setIsProviderMode(asProvider);
  };

  // Logout Handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsProviderMode(false);
    setCurrentView('home');
  };

  // Request Offer Handler
  const handleRequestOffer = (category: ServiceCategory) => {
    setRequestOfferCategory(category);
    setShowRequestOffer(true);
  };

  // Submit Offer Request
  const handleSubmitOfferRequest = (data: RequestOfferData) => {
    console.log('Offer Request Submitted:', data);
    // Here you would typically send this to your backend
    // For now, we'll just close the modal and show a success message
    setShowRequestOffer(false);
  };

  // If not logged in, show login page
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Render Content Based on View
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return isProviderMode ? (
          <ProviderHome
            onNavigate={navigateTo}
            onSelectCategory={setSelectedCategory}
          />
        ) : (
          <OrganizerHome
            onNavigate={navigateTo}
            onSelectCategory={setSelectedCategory}
            onRequestOffer={handleRequestOffer}
          />
        );

      case 'events':
        return (
          <EventsPage
            isProviderMode={isProviderMode}
            onNavigate={navigateTo}
          />
        );

      case 'offers':
        return <OffersPage isProviderMode={isProviderMode} />;

      case 'messages':
        return <MessagesPage isProviderMode={isProviderMode} />;

      case 'profile':
        return (
          <ProfilePage
            isProviderMode={isProviderMode}
            onToggleMode={toggleMode}
            onLogout={handleLogout}
          />
        );

      case 'create':
        return (
          <div className="p-5 animate-fadeIn">
            <h1 className="text-2xl font-bold text-white mb-4">Etkinlik Oluştur</h1>
            <p className="text-zinc-400">Etkinlik oluşturma sayfası yakında...</p>
            <button
              onClick={() => navigateTo('home')}
              className="mt-4 btn-secondary"
            >
              Geri Dön
            </button>
          </div>
        );

      default:
        return (
          <div className="p-5 animate-fadeIn">
            <h1 className="text-2xl font-bold text-white mb-4">Sayfa Bulunamadı</h1>
            <p className="text-zinc-400">Bu sayfa henüz yapım aşamasında.</p>
            <button
              onClick={() => navigateTo('home')}
              className="mt-4 btn-secondary"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        );
    }
  };

  return (
    <div className="mobile-container">
      {/* Main Content */}
      <main className="pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentView={currentView}
        isProviderMode={isProviderMode}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo(0, 0);
        }}
      />

      {/* Request Offer Modal */}
      <RequestOfferModal
        isOpen={showRequestOffer}
        onClose={() => setShowRequestOffer(false)}
        category={requestOfferCategory}
        onSubmit={handleSubmitOfferRequest}
      />

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}

export default App;
