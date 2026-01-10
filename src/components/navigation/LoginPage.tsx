import { useState } from 'react';
import { Music, Users, Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (asProvider: boolean) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedMode, setSelectedMode] = useState<'organizer' | 'provider'>('organizer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedMode === 'provider');
  };

  return (
    <div className="mobile-container min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[#09090b]">
        {/* Gradient Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[40%] rounded-full bg-purple-600/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[30%] rounded-full bg-indigo-600/15 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] right-[-20%] w-[40%] h-[30%] rounded-full bg-violet-500/10 blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col px-6 pt-16 pb-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 animate-slideUp">
          {/* Logo with Glow */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full scale-150" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl">
              <Music size={38} className="text-white" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles size={20} className="text-purple-300 animate-pulse" />
            </div>
          </div>

          {/* Brand */}
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">TURING</h1>
          <p className="text-zinc-400 text-sm">Etkinlik & Müzik Sektörü Platformu</p>
        </div>

        {/* Glass Card */}
        <div className="glass-elevated rounded-3xl p-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          {/* Mode Selection Tabs */}
          <div className="tab-selector mb-6">
            <button
              onClick={() => setSelectedMode('organizer')}
              className={`tab-item ${selectedMode === 'organizer' ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Organizatör</span>
            </button>
            <button
              onClick={() => setSelectedMode('provider')}
              className={`tab-item ${selectedMode === 'provider' ? 'active' : ''}`}
            >
              <Music size={18} />
              <span>Sağlayıcı</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-400 pl-1">
                E-posta
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="input-premium input-with-icon"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-400 pl-1">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-premium input-with-icon pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Şifremi Unuttum
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-premium w-full flex items-center justify-center gap-2 group"
            >
              <span>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</span>
              <ArrowRight size={18} className="group-active:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">veya</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-secondary flex items-center justify-center gap-2 py-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm">Google</span>
            </button>
            <button className="btn-secondary flex items-center justify-center gap-2 py-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              <span className="text-sm">Apple</span>
            </button>
          </div>
        </div>

        {/* Toggle Login/Register */}
        <div className="mt-8 text-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <span className="text-zinc-500">
            {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-purple-400 font-semibold hover:text-purple-300 transition-colors"
          >
            {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="text-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Devam ederek{' '}
            <button className="text-zinc-500 underline underline-offset-2">Kullanım Şartları</button>
            {' '}ve{' '}
            <button className="text-zinc-500 underline underline-offset-2">Gizlilik Politikası</button>
            'nı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
}
