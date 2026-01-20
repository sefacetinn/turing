// Analytics Dashboard Data - Organizatör ve Provider için kapsamlı analitik verileri

// ============================================
// ORTAK TİPLER
// ============================================

export interface MonthlyData {
  month: string;
  year: number;
  income: number;
  expenses: number;
}

export interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface PerformanceData {
  responseRate: number;
  completionRate: number;
  satisfactionRate: number;
  repeatClientRate: number;
}

export interface TopClientData {
  id: string;
  name: string;
  logo?: string;
  totalRevenue: number;
  jobCount: number;
  lastJob: string;
}

export interface TopProviderData {
  id: string;
  name: string;
  logo?: string;
  category: string;
  totalSpent: number;
  jobCount: number;
  rating: number;
  lastEvent: string;
}

export interface TransactionData {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  category: string;
}

export interface PaymentData {
  id: string;
  providerName: string;
  providerLogo?: string;
  eventName: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
}

export interface StatusData {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

// ============================================
// ORGANİZATÖR ANALİTİKS
// ============================================

export interface OrganizerAnalytics {
  summary: {
    totalEvents: number;
    completedEvents: number;
    totalSpent: number;
    averageEventCost: number;
    activeProviders: number;
    pendingOffers: number;
  };
  monthlySpending: MonthlyData[];
  spendingByCategory: CategoryData[];
  topProviders: TopProviderData[];
  eventsByStatus: StatusData[];
  upcomingPayments: PaymentData[];
}

// ============================================
// PROVİDER ANALİTİKS
// ============================================

export interface ProviderAnalytics {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    pendingPayments: number;
    completedJobs: number;
    averageJobValue: number;
    responseRate: number;
    satisfactionRate: number;
  };
  monthlyEarnings: MonthlyData[];
  revenueByService: CategoryData[];
  topClients: TopClientData[];
  performanceMetrics: PerformanceData;
  recentTransactions: TransactionData[];
}

// ============================================
// ORGANİZATÖR MOCK DATA
// ============================================

export const organizerAnalytics: OrganizerAnalytics = {
  summary: {
    totalEvents: 24,
    completedEvents: 18,
    totalSpent: 8750000,
    averageEventCost: 364583,
    activeProviders: 12,
    pendingOffers: 5,
  },
  monthlySpending: [
    { month: 'Ağustos', year: 2025, income: 0, expenses: 1250000 },
    { month: 'Eylül', year: 2025, income: 0, expenses: 980000 },
    { month: 'Ekim', year: 2025, income: 0, expenses: 1450000 },
    { month: 'Kasım', year: 2025, income: 0, expenses: 1680000 },
    { month: 'Aralık', year: 2025, income: 0, expenses: 2150000 },
    { month: 'Ocak', year: 2026, income: 0, expenses: 1240000 },
  ],
  spendingByCategory: [
    { name: 'Ses Sistemi', amount: 2450000, percentage: 28, color: '#4b30b8', icon: 'volume-high' },
    { name: 'Işık & LED', amount: 1960000, percentage: 22, color: '#7c3aed', icon: 'bulb' },
    { name: 'Catering', amount: 1575000, percentage: 18, color: '#a855f7', icon: 'restaurant' },
    { name: 'Güvenlik', amount: 1225000, percentage: 14, color: '#c084fc', icon: 'shield-checkmark' },
    { name: 'Sahne & Mekan', amount: 875000, percentage: 10, color: '#d8b4fe', icon: 'business' },
    { name: 'Diğer', amount: 665000, percentage: 8, color: '#e9d5ff', icon: 'ellipsis-horizontal' },
  ],
  topProviders: [
    {
      id: 'p1',
      name: 'Eventpro 360',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
      category: 'Teknik Prodüksiyon',
      totalSpent: 2450000,
      jobCount: 8,
      rating: 4.9,
      lastEvent: '12 Ocak 2026',
    },
    {
      id: 'p2',
      name: 'Lezzet Catering',
      logo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100',
      category: 'Catering',
      totalSpent: 1580000,
      jobCount: 6,
      rating: 4.8,
      lastEvent: '8 Ocak 2026',
    },
    {
      id: 'p3',
      name: 'GuardPro Güvenlik',
      logo: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=100',
      category: 'Güvenlik',
      totalSpent: 1225000,
      jobCount: 10,
      rating: 4.7,
      lastEvent: '15 Ocak 2026',
    },
    {
      id: 'p4',
      name: 'Stage Masters',
      logo: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=100',
      category: 'Sahne Kurulum',
      totalSpent: 875000,
      jobCount: 4,
      rating: 4.9,
      lastEvent: '5 Ocak 2026',
    },
    {
      id: 'p5',
      name: 'Artistify Booking',
      logo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100',
      category: 'Booking',
      totalSpent: 1620000,
      jobCount: 5,
      rating: 4.8,
      lastEvent: '18 Ocak 2026',
    },
  ],
  eventsByStatus: [
    { status: 'Tamamlanan', count: 18, percentage: 75, color: '#10b981' },
    { status: 'Aktif', count: 4, percentage: 17, color: '#3b82f6' },
    { status: 'Planlanan', count: 2, percentage: 8, color: '#f59e0b' },
  ],
  upcomingPayments: [
    {
      id: 'up1',
      providerName: 'Eventpro 360',
      providerLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
      eventName: 'Tarkan Konseri',
      amount: 650000,
      dueDate: '15 Şubat 2026',
      daysUntilDue: 27,
    },
    {
      id: 'up2',
      providerName: 'Lezzet Catering',
      providerLogo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100',
      eventName: 'Kurumsal Gala',
      amount: 285000,
      dueDate: '5 Şubat 2026',
      daysUntilDue: 17,
    },
    {
      id: 'up3',
      providerName: 'GuardPro Güvenlik',
      providerLogo: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=100',
      eventName: 'Festival 2026',
      amount: 180000,
      dueDate: '20 Şubat 2026',
      daysUntilDue: 32,
    },
  ],
};

// ============================================
// PROVİDER MOCK DATA
// ============================================

export const providerAnalytics: ProviderAnalytics = {
  summary: {
    totalRevenue: 32030000,
    totalExpenses: 4535000,
    netProfit: 27495000,
    pendingPayments: 1135000,
    completedJobs: 234,
    averageJobValue: 121780,
    responseRate: 94,
    satisfactionRate: 97,
  },
  monthlyEarnings: [
    { month: 'Ağustos', year: 2025, income: 3420000, expenses: 450000 },
    { month: 'Eylül', year: 2025, income: 2980000, expenses: 390000 },
    { month: 'Ekim', year: 2025, income: 2650000, expenses: 360000 },
    { month: 'Kasım', year: 2025, income: 2380000, expenses: 330000 },
    { month: 'Aralık', year: 2025, income: 2920000, expenses: 400000 },
    { month: 'Ocak', year: 2026, income: 2850000, expenses: 385000 },
  ],
  revenueByService: [
    { name: 'Ses Sistemi', amount: 8450000, percentage: 26, color: '#4b30b8', icon: 'volume-high' },
    { name: 'Işık & LED', amount: 7200000, percentage: 22, color: '#7c3aed', icon: 'bulb' },
    { name: 'Sahne Prodüksiyon', amount: 6100000, percentage: 19, color: '#a855f7', icon: 'easel' },
    { name: 'Booking', amount: 5800000, percentage: 18, color: '#c084fc', icon: 'musical-notes' },
    { name: 'Video & Mapping', amount: 2900000, percentage: 9, color: '#d8b4fe', icon: 'videocam' },
    { name: 'Diğer', amount: 1580000, percentage: 6, color: '#e9d5ff', icon: 'ellipsis-horizontal' },
  ],
  topClients: [
    {
      id: 'c1',
      name: 'Pozitif Live',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
      totalRevenue: 4850000,
      jobCount: 12,
      lastJob: '12 Ocak 2026',
    },
    {
      id: 'c2',
      name: 'BKM',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
      totalRevenue: 3920000,
      jobCount: 8,
      lastJob: '28 Ağustos 2026',
    },
    {
      id: 'c3',
      name: 'Zorlu PSM',
      logo: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100',
      totalRevenue: 3150000,
      jobCount: 15,
      lastJob: '28 Aralık 2025',
    },
    {
      id: 'c4',
      name: 'IMG Turkey',
      logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
      totalRevenue: 2480000,
      jobCount: 6,
      lastJob: '8 Ocak 2026',
    },
    {
      id: 'c5',
      name: 'Garanti BBVA',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
      totalRevenue: 1850000,
      jobCount: 4,
      lastJob: '5 Eylül 2026',
    },
  ],
  performanceMetrics: {
    responseRate: 94,
    completionRate: 98,
    satisfactionRate: 97,
    repeatClientRate: 72,
  },
  recentTransactions: [
    {
      id: 't1',
      type: 'income',
      description: 'Sıla Konseri - Ses & Işık Sistemi',
      amount: 485000,
      date: '12 Ocak 2026',
      status: 'completed',
      category: 'Teknik Prodüksiyon',
    },
    {
      id: 't2',
      type: 'income',
      description: 'Fashion Week Istanbul',
      amount: 380000,
      date: '8 Ocak 2026',
      status: 'completed',
      category: 'Işık Tasarımı',
    },
    {
      id: 't3',
      type: 'expense',
      description: 'Ses sistemi yıllık bakım',
      amount: 45000,
      date: '5 Ocak 2026',
      status: 'completed',
      category: 'Ekipman Bakım',
    },
    {
      id: 't4',
      type: 'income',
      description: 'Rock Festivali - Balıkesir',
      amount: 320000,
      date: '3 Ocak 2026',
      status: 'completed',
      category: 'Ses Sistemi',
    },
    {
      id: 't5',
      type: 'expense',
      description: 'Ocak ayı personel maaşları',
      amount: 185000,
      date: '1 Ocak 2026',
      status: 'completed',
      category: 'Personel',
    },
    {
      id: 't6',
      type: 'income',
      description: 'Mabel Matiz Konseri',
      amount: 620000,
      date: '28 Aralık 2025',
      status: 'completed',
      category: 'Booking',
    },
    {
      id: 't7',
      type: 'expense',
      description: 'Ekipman sigortası yenileme',
      amount: 68000,
      date: '25 Aralık 2025',
      status: 'completed',
      category: 'Sigorta',
    },
  ],
};

// ============================================
// HELPER FONKSİYONLAR
// ============================================

export const analyticsColors = {
  income: '#10b981',
  expense: '#ef4444',
  pending: '#f59e0b',
  primary: '#4b30b8',
  secondary: '#7c3aed',
  info: '#3b82f6',
};

export const formatCurrency = (amount: number): string => {
  return `₺${amount.toLocaleString('tr-TR')}`;
};

export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `₺${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `₺${(amount / 1000).toFixed(0)}K`;
  }
  return `₺${amount}`;
};

export const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
};

export type PeriodType = 'monthly' | 'quarterly' | 'yearly';

export const getDataByPeriod = (
  data: MonthlyData[],
  period: PeriodType
): MonthlyData[] => {
  switch (period) {
    case 'monthly':
      return data.slice(-6);
    case 'quarterly':
      // Group by quarter
      const quarters: MonthlyData[] = [];
      for (let i = 0; i < data.length; i += 3) {
        const quarter = data.slice(i, i + 3);
        if (quarter.length > 0) {
          quarters.push({
            month: `Q${Math.floor(i / 3) + 1}`,
            year: quarter[0].year,
            income: quarter.reduce((sum, m) => sum + m.income, 0),
            expenses: quarter.reduce((sum, m) => sum + m.expenses, 0),
          });
        }
      }
      return quarters.slice(-4);
    case 'yearly':
      // Group by year
      const years: { [key: number]: MonthlyData } = {};
      data.forEach((m) => {
        if (!years[m.year]) {
          years[m.year] = { month: String(m.year), year: m.year, income: 0, expenses: 0 };
        }
        years[m.year].income += m.income;
        years[m.year].expenses += m.expenses;
      });
      return Object.values(years).slice(-3);
    default:
      return data.slice(-6);
  }
};
