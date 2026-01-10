import { useState, useEffect } from 'react';
import { Share, X, Plus } from 'lucide-react';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone
      || document.referrer.includes('android-app://');

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Show prompt if not standalone and not dismissed recently
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    if (!isStandalone && daysSinceDismissed > 7) {
      // Delay showing prompt
      setTimeout(() => setShowPrompt(true), 2000);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Prompt Card */}
      <div className="relative w-full max-w-[393px] glass-elevated rounded-3xl p-5 animate-slideUp">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center"
        >
          <X size={16} className="text-zinc-400" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
          <span className="text-3xl font-bold text-white">T</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2">
          Turing'i Yukle
        </h3>
        <p className="text-zinc-400 text-sm mb-5">
          Daha iyi bir deneyim icin uygulamayi ana ekranina ekle.
        </p>

        {/* iOS Instructions */}
        {isIOS ? (
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Share size={20} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">1. Paylas butonuna tikla</p>
                <p className="text-xs text-zinc-500">Safari alt menusunde</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Plus size={20} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">2. "Ana Ekrana Ekle"yi sec</p>
                <p className="text-xs text-zinc-500">Asagi kaydirarak bul</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-400 mb-5">
            Tarayici menusunden "Uygulamayi yukle" veya "Ana ekrana ekle" secenegini kullanin.
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 btn-secondary text-sm"
          >
            Sonra
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 btn-premium text-sm"
          >
            Anladim
          </button>
        </div>
      </div>
    </div>
  );
}
