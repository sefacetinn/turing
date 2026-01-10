import { useState } from 'react';
import {
  Music,
  Speaker,
  Hotel,
  Building2,
  Plane,
  Car,
  Settings,
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronDown,
  Check,
  Search,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { Modal } from './Modal';
import type { ServiceCategory } from '../../types';
import { popularCities, getDistricts } from '../../utils/cityData';
import { artists } from '../../utils/artistData';

interface RequestOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ServiceCategory;
  onSubmit: (data: RequestOfferData) => void;
}

export interface RequestOfferData {
  category: ServiceCategory;
  eventName: string;
  eventDate: string;
  eventTime: string;
  city: string;
  district: string;
  venue?: string;
  budget?: string;
  guestCount?: string;
  description?: string;
  artistId?: string;
  artistName?: string;
  technicalServices?: string[];
  roomCount?: string;
  nights?: string;
  starRating?: string;
  vehicleType?: string;
  passengers?: string;
  departureCity?: string;
  arrivalCity?: string;
  flightDate?: string;
  passengerCount?: string;
}

const categoryConfig = {
  booking: {
    title: 'Booking Teklifi',
    icon: Music,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
    color: 'text-purple-400',
    steps: ['Etkinlik', 'Sanatci', 'Detaylar'],
  },
  technical: {
    title: 'Teknik Teklif',
    icon: Speaker,
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
    color: 'text-emerald-400',
    steps: ['Etkinlik', 'Hizmetler', 'Detaylar'],
  },
  accommodation: {
    title: 'Konaklama Teklifi',
    icon: Hotel,
    gradient: 'from-pink-500 to-rose-500',
    bgGradient: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20',
    color: 'text-pink-400',
    steps: ['Etkinlik', 'Konaklama', 'Detaylar'],
  },
  venue: {
    title: 'Mekan Teklifi',
    icon: Building2,
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20',
    color: 'text-blue-400',
    steps: ['Etkinlik', 'Mekan', 'Detaylar'],
  },
  flight: {
    title: 'Ucus Teklifi',
    icon: Plane,
    gradient: 'from-slate-400 to-zinc-500',
    bgGradient: 'bg-gradient-to-br from-slate-400/20 to-zinc-500/20',
    color: 'text-slate-300',
    steps: ['Etkinlik', 'Ucus', 'Detaylar'],
  },
  transport: {
    title: 'Ulasim Teklifi',
    icon: Car,
    gradient: 'from-red-500 to-orange-500',
    bgGradient: 'bg-gradient-to-br from-red-500/20 to-orange-500/20',
    color: 'text-red-400',
    steps: ['Etkinlik', 'Arac', 'Detaylar'],
  },
  operation: {
    title: 'Operasyon Teklifi',
    icon: Settings,
    gradient: 'from-orange-500 to-amber-500',
    bgGradient: 'bg-gradient-to-br from-orange-500/20 to-amber-500/20',
    color: 'text-orange-400',
    steps: ['Etkinlik', 'Operasyon', 'Detaylar'],
  },
};

const technicalServiceOptions = [
  { id: 'sound', label: 'Ses Sistemi', icon: '🔊' },
  { id: 'light', label: 'Isik Sistemi', icon: '💡' },
  { id: 'led', label: 'LED Ekran', icon: '📺' },
  { id: 'stage', label: 'Sahne Kurulum', icon: '🎭' },
  { id: 'backline', label: 'Backline', icon: '🎸' },
  { id: 'generator', label: 'Jenerator', icon: '⚡' },
  { id: 'truss', label: 'Truss/Rigging', icon: '🔩' },
];

const vehicleTypes = [
  { id: 'vito', label: 'Mercedes Vito', capacity: '6 kisi', icon: '🚐' },
  { id: 'sprinter', label: 'Mercedes Sprinter', capacity: '12 kisi', icon: '🚌' },
  { id: 'minibus', label: 'Minibus', capacity: '15-20 kisi', icon: '🚌' },
  { id: 'bus', label: 'Otobus', capacity: '40+ kisi', icon: '🚎' },
  { id: 'sedan', label: 'Luks Sedan', capacity: '3 kisi', icon: '🚗' },
];

const starRatings = [
  { value: '3', label: '3 Yildiz', stars: '⭐⭐⭐' },
  { value: '4', label: '4 Yildiz', stars: '⭐⭐⭐⭐' },
  { value: '5', label: '5 Yildiz', stars: '⭐⭐⭐⭐⭐' },
];

export function RequestOfferModal({ isOpen, onClose, category, onSubmit }: RequestOfferModalProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState<Partial<RequestOfferData>>({
    category,
    eventName: '',
    eventDate: '',
    eventTime: '',
    city: '',
    district: '',
  });

  const [showCitySelect, setShowCitySelect] = useState(false);
  const [showArtistSelect, setShowArtistSelect] = useState(false);
  const [artistSearch, setArtistSearch] = useState('');
  const [selectedTechnicalServices, setSelectedTechnicalServices] = useState<string[]>([]);

  const districts = formData.city ? getDistricts(formData.city) : [];

  const filteredArtists = artists.filter(
    (artist) =>
      artist.name.toLowerCase().includes(artistSearch.toLowerCase()) ||
      artist.genre?.toLowerCase().includes(artistSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const data: RequestOfferData = {
      ...formData,
      category,
      technicalServices: selectedTechnicalServices,
    } as RequestOfferData;

    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      onSubmit(data);
      onClose();
      setCurrentStep(0);
      setIsSuccess(false);
    }, 2000);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setCurrentStep(0);
      setIsSuccess(false);
    }, 300);
  };

  // Success State
  if (isSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="" showClose={false}>
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-6 animate-pulse`}>
            <CheckCircle size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Teklif Istendi!</h3>
          <p className="text-zinc-400 text-center">
            Saglayicilar en kisa surede sizinle iletisime gececek.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={config.title} size="full">
      <div className="p-5 space-y-5">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-2">
          {config.steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    index < currentStep
                      ? `bg-gradient-to-br ${config.gradient} text-white`
                      : index === currentStep
                      ? `bg-gradient-to-br ${config.gradient} text-white ring-4 ring-white/10`
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {index < currentStep ? <Check size={16} /> : index + 1}
                </div>
                <span className={`text-[10px] mt-1.5 ${index === currentStep ? 'text-white' : 'text-zinc-500'}`}>
                  {step}
                </span>
              </div>
              {index < config.steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-1 mt-[-12px] rounded-full ${
                  index < currentStep ? `bg-gradient-to-r ${config.gradient}` : 'bg-zinc-800'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Category Badge */}
        <div className={`${config.bgGradient} rounded-2xl p-4 flex items-center gap-4 border border-white/5`}>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
            <Icon size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{config.title}</h3>
            <p className="text-sm text-white/60">Adim {currentStep + 1}/{config.steps.length}</p>
          </div>
          <Sparkles size={20} className={config.color} />
        </div>

        {/* Step 1: Event Info */}
        {currentStep === 0 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Event Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Etkinlik Adi *</label>
              <input
                type="text"
                value={formData.eventName}
                onChange={(e) => updateField('eventName', e.target.value)}
                placeholder="Orn: Yilbasi Konseri"
                className="input-premium"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Tarih *</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => updateField('eventDate', e.target.value)}
                    className="input-premium pl-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Saat *</label>
                <div className="relative">
                  <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => updateField('eventTime', e.target.value)}
                    className="input-premium pl-12"
                  />
                </div>
              </div>
            </div>

            {/* City Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Sehir *</label>
              <button
                onClick={() => setShowCitySelect(!showCitySelect)}
                className="input-premium flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-zinc-500" />
                  <span className={formData.city ? 'text-white' : 'text-zinc-500'}>
                    {formData.city || 'Sehir secin'}
                  </span>
                </div>
                <ChevronDown size={18} className={`text-zinc-500 transition-transform ${showCitySelect ? 'rotate-180' : ''}`} />
              </button>
              {showCitySelect && (
                <div className="glass-card p-2 max-h-48 overflow-y-auto space-y-1">
                  {popularCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        updateField('city', city);
                        updateField('district', '');
                        setShowCitySelect(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                        formData.city === city
                          ? `bg-gradient-to-r ${config.gradient} text-white`
                          : 'text-zinc-300 hover:bg-zinc-800 active:scale-[0.98]'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* District Selection */}
            {formData.city && districts.length > 0 && (
              <div className="space-y-2 animate-fadeIn">
                <label className="block text-sm font-medium text-zinc-300">Ilce</label>
                <select
                  value={formData.district}
                  onChange={(e) => updateField('district', e.target.value)}
                  className="input-premium"
                >
                  <option value="">Ilce secin</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Category Specific */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            {category === 'booking' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-300">Sanatci Secin *</label>
                <button
                  onClick={() => setShowArtistSelect(!showArtistSelect)}
                  className="input-premium flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-3">
                    <Music size={18} className="text-zinc-500" />
                    <span className={formData.artistName ? 'text-white' : 'text-zinc-500'}>
                      {formData.artistName || 'Sanatci secin'}
                    </span>
                  </div>
                  <ChevronDown size={18} className={`text-zinc-500 transition-transform ${showArtistSelect ? 'rotate-180' : ''}`} />
                </button>
                {showArtistSelect && (
                  <div className="glass-card p-3 space-y-3">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        value={artistSearch}
                        onChange={(e) => setArtistSearch(e.target.value)}
                        placeholder="Sanatci ara..."
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-800/80 rounded-xl text-sm text-white placeholder-zinc-500 border border-zinc-700/50 focus:border-purple-500/50 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {filteredArtists.map((artist) => (
                        <button
                          key={artist.id}
                          onClick={() => {
                            updateField('artistId', artist.id);
                            updateField('artistName', artist.name);
                            setShowArtistSelect(false);
                            setArtistSearch('');
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] ${
                            formData.artistId === artist.id
                              ? 'bg-purple-500/20 border border-purple-500/30'
                              : 'hover:bg-zinc-800'
                          }`}
                        >
                          <img
                            src={artist.image}
                            alt={artist.name}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                          <div className="text-left flex-1">
                            <p className="text-sm font-medium text-white">{artist.name}</p>
                            <p className="text-xs text-zinc-500">{artist.genre}</p>
                          </div>
                          {formData.artistId === artist.id && (
                            <Check size={16} className="text-purple-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {category === 'technical' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-300">Hizmetler *</label>
                <div className="grid grid-cols-2 gap-2">
                  {technicalServiceOptions.map((service) => {
                    const isSelected = selectedTechnicalServices.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTechnicalServices((prev) => prev.filter((s) => s !== service.id));
                          } else {
                            setSelectedTechnicalServices((prev) => [...prev, service.id]);
                          }
                        }}
                        className={`p-3 rounded-xl text-left transition-all active:scale-[0.97] ${
                          isSelected
                            ? 'bg-emerald-500/20 border-2 border-emerald-500/50'
                            : 'bg-zinc-800/50 border-2 border-zinc-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{service.icon}</span>
                          {isSelected && <Check size={14} className="text-emerald-400" />}
                        </div>
                        <p className={`text-sm font-medium ${isSelected ? 'text-emerald-400' : 'text-zinc-300'}`}>
                          {service.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {category === 'accommodation' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">Oda Sayisi *</label>
                    <input
                      type="number"
                      value={formData.roomCount || ''}
                      onChange={(e) => updateField('roomCount', e.target.value)}
                      placeholder="Orn: 5"
                      className="input-premium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">Gece Sayisi *</label>
                    <input
                      type="number"
                      value={formData.nights || ''}
                      onChange={(e) => updateField('nights', e.target.value)}
                      placeholder="Orn: 2"
                      className="input-premium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Otel Sinifi</label>
                  <div className="grid grid-cols-3 gap-2">
                    {starRatings.map((rating) => (
                      <button
                        key={rating.value}
                        onClick={() => updateField('starRating', rating.value)}
                        className={`p-3 rounded-xl text-center transition-all active:scale-[0.97] ${
                          formData.starRating === rating.value
                            ? 'bg-pink-500/20 border-2 border-pink-500/50'
                            : 'bg-zinc-800/50 border-2 border-zinc-700/50'
                        }`}
                      >
                        <p className="text-xs mb-1">{rating.stars}</p>
                        <p className={`text-xs font-medium ${formData.starRating === rating.value ? 'text-pink-400' : 'text-zinc-400'}`}>
                          {rating.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {category === 'transport' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Arac Tipi *</label>
                  <div className="space-y-2">
                    {vehicleTypes.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => updateField('vehicleType', vehicle.id)}
                        className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all active:scale-[0.98] ${
                          formData.vehicleType === vehicle.id
                            ? 'bg-red-500/20 border-2 border-red-500/50'
                            : 'bg-zinc-800/50 border-2 border-zinc-700/50'
                        }`}
                      >
                        <span className="text-2xl">{vehicle.icon}</span>
                        <div className="flex-1 text-left">
                          <p className={`font-medium ${formData.vehicleType === vehicle.id ? 'text-red-400' : 'text-zinc-300'}`}>
                            {vehicle.label}
                          </p>
                          <p className="text-xs text-zinc-500">{vehicle.capacity}</p>
                        </div>
                        {formData.vehicleType === vehicle.id && <Check size={18} className="text-red-400" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Yolcu Sayisi</label>
                  <div className="relative">
                    <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="number"
                      value={formData.passengers || ''}
                      onChange={(e) => updateField('passengers', e.target.value)}
                      placeholder="Orn: 6"
                      className="input-premium pl-12"
                    />
                  </div>
                </div>
              </div>
            )}

            {category === 'flight' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">Kalkis *</label>
                    <div className="relative">
                      <Plane size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 rotate-[-45deg]" />
                      <input
                        type="text"
                        value={formData.departureCity || ''}
                        onChange={(e) => updateField('departureCity', e.target.value)}
                        placeholder="Istanbul"
                        className="input-premium pl-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">Varis *</label>
                    <div className="relative">
                      <Plane size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 rotate-45" />
                      <input
                        type="text"
                        value={formData.arrivalCity || ''}
                        onChange={(e) => updateField('arrivalCity', e.target.value)}
                        placeholder="Ankara"
                        className="input-premium pl-12"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Yolcu Sayisi *</label>
                  <div className="relative">
                    <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="number"
                      value={formData.passengerCount || ''}
                      onChange={(e) => updateField('passengerCount', e.target.value)}
                      placeholder="Orn: 8"
                      className="input-premium pl-12"
                    />
                  </div>
                </div>
              </div>
            )}

            {(category === 'venue' || category === 'operation') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Tahmini Katilimci *</label>
                  <div className="relative">
                    <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="number"
                      value={formData.guestCount || ''}
                      onChange={(e) => updateField('guestCount', e.target.value)}
                      placeholder="Orn: 500"
                      className="input-premium pl-12"
                    />
                  </div>
                </div>
                {category === 'venue' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">Mekan Tercihi (Opsiyonel)</label>
                    <input
                      type="text"
                      value={formData.venue || ''}
                      onChange={(e) => updateField('venue', e.target.value)}
                      placeholder="Orn: Otel balonu, Acik hava..."
                      className="input-premium"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Details */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Budget */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Butce (Opsiyonel)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">₺</span>
                <input
                  type="text"
                  value={formData.budget || ''}
                  onChange={(e) => updateField('budget', e.target.value)}
                  placeholder="Orn: 50.000"
                  className="input-premium pl-10"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Aciklama (Opsiyonel)</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Ek bilgiler, ozel istekler..."
                rows={4}
                className="input-premium resize-none"
              />
            </div>

            {/* Summary */}
            <div className={`${config.bgGradient} rounded-2xl p-4 border border-white/5`}>
              <h4 className="text-sm font-semibold text-white mb-3">Ozet</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Etkinlik</span>
                  <span className="text-white font-medium">{formData.eventName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tarih</span>
                  <span className="text-white font-medium">{formData.eventDate || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Konum</span>
                  <span className="text-white font-medium">{formData.city || '-'}</span>
                </div>
                {category === 'booking' && formData.artistName && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Sanatci</span>
                    <span className={`font-medium ${config.color}`}>{formData.artistName}</span>
                  </div>
                )}
                {category === 'technical' && selectedTechnicalServices.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Hizmetler</span>
                    <span className="text-white font-medium">{selectedTechnicalServices.length} secili</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-4 pb-6 flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Geri
            </button>
          )}
          {currentStep < config.steps.length - 1 ? (
            <button
              onClick={nextStep}
              className={`flex-1 btn-premium flex items-center justify-center gap-2`}
            >
              Devam
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 btn-premium flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Gonderiliyor...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Teklif Iste
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
