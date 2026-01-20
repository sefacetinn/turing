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
// ORGANİZATÖR ANALİTİKS - Empty for new users
// TODO: Fetch from Firebase
// ============================================

export const organizerAnalytics: OrganizerAnalytics = {
  summary: {
    totalEvents: 0,
    completedEvents: 0,
    totalSpent: 0,
    averageEventCost: 0,
    activeProviders: 0,
    pendingOffers: 0,
  },
  monthlySpending: [],
  spendingByCategory: [],
  topProviders: [],
  eventsByStatus: [],
  upcomingPayments: [],
};

// ============================================
// PROVİDER ANALİTİKS - Empty for new users
// TODO: Fetch from Firebase
// ============================================

export const providerAnalytics: ProviderAnalytics = {
  summary: {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingPayments: 0,
    completedJobs: 0,
    averageJobValue: 0,
    responseRate: 0,
    satisfactionRate: 0,
  },
  monthlyEarnings: [],
  revenueByService: [],
  topClients: [],
  performanceMetrics: {
    responseRate: 0,
    completionRate: 0,
    satisfactionRate: 0,
    repeatClientRate: 0,
  },
  recentTransactions: [],
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
