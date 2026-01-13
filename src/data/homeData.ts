import { gradients } from '../theme/colors';

// Artist data
export const artists = [
  {
    id: '1',
    name: 'Mabel Matiz',
    genre: 'Alternatif Pop',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    rating: 4.9,
  },
  {
    id: '2',
    name: 'DJ Burak Yeter',
    genre: 'EDM / House',
    image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Sezen Aksu',
    genre: 'Pop / Türk Sanat',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    rating: 5.0,
  },
  {
    id: '4',
    name: 'Duman',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400',
    rating: 4.9,
  },
];

// Service categories
export const categories = [
  {
    id: 'booking',
    name: 'Booking',
    description: 'Sanatçı & DJ',
    icon: 'musical-notes',
    gradient: gradients.booking,
    popular: true,
  },
  {
    id: 'technical',
    name: 'Teknik',
    description: 'Ses & Işık & Sahne',
    icon: 'volume-high',
    gradient: gradients.technical,
    popular: true,
  },
  {
    id: 'venue',
    name: 'Mekan',
    description: 'Etkinlik Alanları',
    icon: 'business',
    gradient: gradients.venue,
    popular: false,
  },
  {
    id: 'accommodation',
    name: 'Konaklama',
    description: 'Otel & Konut',
    icon: 'bed',
    gradient: gradients.accommodation,
    popular: false,
  },
  {
    id: 'transport',
    name: 'Ulaşım',
    description: 'VIP Transfer',
    icon: 'car',
    gradient: gradients.transport,
    popular: false,
  },
  {
    id: 'flight',
    name: 'Uçak',
    description: 'Uçuş Hizmetleri',
    icon: 'airplane',
    gradient: gradients.flight,
    popular: false,
  },
];

// Recent providers
export const recentProviders = [
  {
    id: '1',
    name: 'Pro Sound Istanbul',
    category: 'Teknik',
    rating: 4.9,
    reviews: 128,
    location: 'İstanbul',
    verified: true,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200&h=200&fit=crop',
  },
  {
    id: '2',
    name: 'Elite Transfer',
    category: 'Ulaşım',
    rating: 4.8,
    reviews: 89,
    location: 'İstanbul',
    verified: true,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=200&fit=crop',
  },
  {
    id: '3',
    name: 'Grand Hotel',
    category: 'Konaklama',
    rating: 4.7,
    reviews: 256,
    location: 'Ankara',
    verified: false,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop',
  },
];

// Provider stats
export const providerStats = {
  monthlyEarnings: 1285000,
  pendingPayments: 485000,
  completedJobs: 156,
  upcomingJobs: 8,
  pendingOffers: 23,
  rating: 4.9,
  responseRate: 98,
  reviewCount: 312,
  profileViews: 1847,
  conversionRate: 34,
};

// Upcoming jobs for provider
export const upcomingJobs = [
  {
    id: '1',
    title: 'Zeytinli Rock Festivali 2025',
    date: '18-20 Temmuz',
    location: 'Edremit, Balıkesir',
    role: 'Ana Sahne Ses',
    earnings: 245000,
    daysUntil: 8,
    status: 'confirmed',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
  },
  {
    id: '2',
    title: 'MegaFon Arena - Tarkan',
    date: '25 Temmuz',
    location: 'İstanbul',
    role: 'Etkinlik Güvenliği',
    earnings: 185000,
    daysUntil: 15,
    status: 'confirmed',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
  },
  {
    id: '3',
    title: 'Koç Holding Yıllık Toplantısı',
    date: '5 Ağustos',
    location: 'İstanbul',
    role: 'Premium Catering',
    earnings: 320000,
    daysUntil: 25,
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
  },
];

// Recent requests for provider
export const recentRequests = [
  {
    id: '1',
    title: 'Istanbul Fashion Week After Party',
    category: 'Komple Organizasyon',
    organizer: 'Fashion Week TR',
    organizerImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
    location: 'İstanbul',
    date: '15-22 Eylül 2025',
    budget: '450.000 - 600.000 ₺',
    isNew: true,
    isHot: true,
    timeAgo: '1 saat önce',
    matchScore: 95,
  },
  {
    id: '2',
    title: 'Formula 1 VIP Hospitality',
    category: 'Catering & Konaklama',
    organizer: 'Intercity',
    organizerImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
    location: 'İstanbul Park',
    date: '28 Eylül 2025',
    budget: '280.000 - 350.000 ₺',
    isNew: true,
    isHot: false,
    timeAgo: '3 saat önce',
    matchScore: 88,
  },
  {
    id: '3',
    title: 'Büyük Ankara Festivali',
    category: 'Teknik & Güvenlik',
    organizer: 'Ankara BB',
    organizerImage: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=100',
    location: 'Ankara',
    date: '29-30 Ekim 2025',
    budget: '520.000 - 680.000 ₺',
    isNew: false,
    isHot: false,
    timeAgo: '1 gün önce',
    matchScore: 82,
  },
];

// User data
export const organizerUser = {
  name: 'Ahmet Yılmaz',
  role: 'Organizatör',
  image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
};

export const providerUser = {
  name: 'EventPro 360',
  role: 'Sağlayıcı',
  image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
};

// Stats for organizer home
export const homeStats = [
  { label: 'Sanatçı', value: '270+' },
  { label: 'Mekan', value: '150+' },
  { label: 'Sağlayıcı', value: '500+' },
];
