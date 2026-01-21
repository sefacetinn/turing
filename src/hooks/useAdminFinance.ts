import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  getDocuments,
  Collections,
} from '../services/firebase';
import type {
  Payout,
  PayoutFilters,
  PayoutStatus,
  FinancialSummary,
  RevenueCategoryBreakdown,
  MonthlyRevenueData,
} from '../types/admin';

export interface UseAdminFinanceResult {
  // Data
  payouts: Payout[];
  filteredPayouts: Payout[];
  selectedPayout: Payout | null;
  summary: FinancialSummary;
  categoryBreakdown: RevenueCategoryBreakdown[];
  monthlyRevenue: MonthlyRevenueData[];

  // Filters
  filters: PayoutFilters;
  setFilters: (filters: PayoutFilters) => void;
  resetFilters: () => void;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isProcessing: boolean;

  // Actions
  refresh: () => Promise<void>;
  selectPayout: (payoutId: string | null) => void;
  processPayout: (payoutId: string) => Promise<void>;
  completePayout: (payoutId: string) => Promise<void>;
  failPayout: (payoutId: string, reason: string) => Promise<void>;
  cancelPayout: (payoutId: string) => Promise<void>;

  // Stats
  stats: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    totalAmount: number;
    pendingAmount: number;
  };
}

const defaultFilters: PayoutFilters = {
  search: '',
  status: 'all',
  sortBy: 'requestedAt',
  sortOrder: 'desc',
};

// Calculate financial data from events
function calculateFinancialData(events: any[]) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  // Get approved events
  const approvedEvents = events.filter((e) =>
    e.approvalStatus === 'approved' || e.isApproved
  );

  // Calculate total revenue from budgets
  const totalRevenue = approvedEvents.reduce((sum, e) => sum + (e.budget || 0), 0);
  const totalCommission = totalRevenue * 0.1; // 10% commission

  // Calculate monthly revenue
  const monthlyEvents = approvedEvents.filter((e) => {
    const eventDate = e.date ? new Date(e.date) : (e.createdAt?.toDate?.() || new Date(e.createdAt));
    return eventDate.getMonth() === thisMonth && eventDate.getFullYear() === thisYear;
  });
  const monthlyRevenue = monthlyEvents.reduce((sum, e) => sum + (e.budget || 0), 0);

  // Calculate last month revenue for growth
  const lastMonthEvents = approvedEvents.filter((e) => {
    const eventDate = e.date ? new Date(e.date) : (e.createdAt?.toDate?.() || new Date(e.createdAt));
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    return eventDate.getMonth() === lastMonth && eventDate.getFullYear() === lastMonthYear;
  });
  const lastMonthRevenue = lastMonthEvents.reduce((sum, e) => sum + (e.budget || 0), 0);
  const monthlyGrowth = lastMonthRevenue > 0
    ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0;

  // Category breakdown - analyze event categories if available
  const categoryMap: Record<string, { amount: number; count: number }> = {};
  approvedEvents.forEach((e) => {
    const category = e.category || e.type || 'other';
    if (!categoryMap[category]) {
      categoryMap[category] = { amount: 0, count: 0 };
    }
    categoryMap[category].amount += e.budget || 0;
    categoryMap[category].count += 1;
  });

  const categoryBreakdown: RevenueCategoryBreakdown[] = Object.entries(categoryMap).map(([category, data]) => ({
    category: category as RevenueCategoryBreakdown['category'],
    categoryName: getCategoryName(category),
    amount: data.amount,
    percentage: totalRevenue > 0 ? Math.round((data.amount / totalRevenue) * 100) : 0,
    transactionCount: data.count,
  })).sort((a, b) => b.amount - a.amount);

  // Monthly revenue data for chart
  const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const monthlyRevenueData: MonthlyRevenueData[] = [];

  for (let i = 5; i >= 0; i--) {
    const monthIndex = (thisMonth - i + 12) % 12;
    const year = thisMonth - i < 0 ? thisYear - 1 : thisYear;

    const monthEvents = approvedEvents.filter((e) => {
      const eventDate = e.date ? new Date(e.date) : (e.createdAt?.toDate?.() || new Date(e.createdAt));
      return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === year;
    });

    const revenue = monthEvents.reduce((sum, e) => sum + (e.budget || 0), 0);
    const commission = revenue * 0.1;

    monthlyRevenueData.push({
      month: monthNames[monthIndex],
      revenue,
      commission,
      payouts: revenue - commission,
    });
  }

  const summary: FinancialSummary = {
    totalRevenue,
    totalCommission,
    totalPayouts: totalRevenue - totalCommission,
    pendingPayouts: 0, // Would come from payouts collection
    pendingPayoutCount: 0,
    monthlyRevenue,
    monthlyGrowth,
  };

  return { summary, categoryBreakdown, monthlyRevenueData };
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    technical: 'Teknik',
    booking: 'Booking',
    venue: 'Mekan',
    catering: 'Catering',
    transport: 'Ulaşım',
    security: 'Güvenlik',
    concert: 'Konser',
    wedding: 'Düğün',
    corporate: 'Kurumsal',
    festival: 'Festival',
    other: 'Diğer',
  };
  return names[category] || category;
}

export function useAdminFinance(): UseAdminFinanceResult {
  const { logAction } = useAdmin();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [filters, setFilters] = useState<PayoutFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalCommission: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
    pendingPayoutCount: 0,
    monthlyRevenue: 0,
    monthlyGrowth: 0,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState<RevenueCategoryBreakdown[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueData[]>([]);

  // Fetch financial data from Firebase
  const fetchFinancialData = useCallback(async () => {
    try {
      // Fetch events for financial calculations
      const events = await getDocuments<any>(Collections.EVENTS, []);
      const { summary: calculatedSummary, categoryBreakdown: calculatedBreakdown, monthlyRevenueData } = calculateFinancialData(events);

      setSummary(calculatedSummary);
      setCategoryBreakdown(calculatedBreakdown);
      setMonthlyRevenue(monthlyRevenueData);

      // For now, we don't have a payouts collection, so payouts will be empty
      // In a real app, you'd fetch from a payouts collection
      setPayouts([]);
    } catch (error) {
      // Firebase permission error - show empty data
      console.log('Unable to fetch financial data (Firebase permission required)');
      setSummary({
        totalRevenue: 0,
        totalCommission: 0,
        totalPayouts: 0,
        pendingPayouts: 0,
        pendingPayoutCount: 0,
        monthlyRevenue: 0,
        monthlyGrowth: 0,
      });
      setCategoryBreakdown([]);
      setMonthlyRevenue([]);
      setPayouts([]);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    fetchFinancialData().finally(() => setIsLoading(false));
  }, [fetchFinancialData]);

  // Filter and sort payouts
  const filteredPayouts = useMemo(() => {
    let result = [...payouts];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (payout) =>
          payout.providerName.toLowerCase().includes(searchLower) ||
          payout.eventNames.some((name) => name.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      result = result.filter((payout) => payout.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start).getTime();
      const endDate = new Date(filters.dateRange.end).getTime();
      result = result.filter((payout) => {
        const payoutDate = new Date(payout.requestedAt).getTime();
        return payoutDate >= startDate && payoutDate <= endDate;
      });
    }

    // Amount range filter
    if (filters.minAmount !== undefined) {
      result = result.filter((payout) => payout.amount >= (filters.minAmount || 0));
    }
    if (filters.maxAmount !== undefined) {
      result = result.filter((payout) => payout.amount <= (filters.maxAmount || Infinity));
    }

    // Sort
    if (filters.sortBy) {
      result.sort((a, b) => {
        let aValue: number = 0;
        let bValue: number = 0;

        switch (filters.sortBy) {
          case 'amount':
            aValue = a.amount;
            bValue = b.amount;
            break;
          case 'requestedAt':
            aValue = new Date(a.requestedAt).getTime();
            bValue = new Date(b.requestedAt).getTime();
            break;
          case 'completedAt':
            aValue = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            bValue = b.completedAt ? new Date(b.completedAt).getTime() : 0;
            break;
        }

        return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return result;
  }, [payouts, filters]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: payouts.length,
    pending: payouts.filter((p) => p.status === 'pending').length,
    processing: payouts.filter((p) => p.status === 'processing').length,
    completed: payouts.filter((p) => p.status === 'completed').length,
    failed: payouts.filter((p) => p.status === 'failed').length,
    totalAmount: payouts.reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payouts
      .filter((p) => p.status === 'pending' || p.status === 'processing')
      .reduce((sum, p) => sum + p.amount, 0),
  }), [payouts]);

  // Actions
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchFinancialData();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFinancialData]);

  const selectPayout = useCallback((payoutId: string | null) => {
    if (payoutId === null) {
      setSelectedPayout(null);
    } else {
      const payout = payouts.find((p) => p.id === payoutId) || null;
      setSelectedPayout(payout);
    }
  }, [payouts]);

  const processPayout = useCallback(async (payoutId: string) => {
    setIsProcessing(true);
    try {
      // In a real app, update Firestore
      await new Promise((resolve) => setTimeout(resolve, 500));

      const payout = payouts.find((p) => p.id === payoutId);
      if (payout) {
        await logAction('payout.process', 'payout', payoutId, {
          previousValue: { status: payout.status },
          newValue: { status: 'processing' },
          description: `${payout.providerName} ödemesi işleme alındı`,
        });
      }

      setPayouts((prev) =>
        prev.map((payout) =>
          payout.id === payoutId
            ? {
                ...payout,
                status: 'processing' as PayoutStatus,
                processedAt: new Date().toISOString(),
              }
            : payout
        )
      );
    } finally {
      setIsProcessing(false);
    }
  }, [payouts, logAction]);

  const completePayout = useCallback(async (payoutId: string) => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const payout = payouts.find((p) => p.id === payoutId);
      if (payout) {
        await logAction('payout.complete', 'payout', payoutId, {
          previousValue: { status: payout.status },
          newValue: { status: 'completed' },
          description: `${payout.providerName} ödemesi tamamlandı`,
        });
      }

      setPayouts((prev) =>
        prev.map((payout) =>
          payout.id === payoutId
            ? {
                ...payout,
                status: 'completed' as PayoutStatus,
                completedAt: new Date().toISOString(),
              }
            : payout
        )
      );
    } finally {
      setIsProcessing(false);
    }
  }, [payouts, logAction]);

  const failPayout = useCallback(async (payoutId: string, reason: string) => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const payout = payouts.find((p) => p.id === payoutId);
      if (payout) {
        await logAction('payout.fail', 'payout', payoutId, {
          previousValue: { status: payout.status },
          newValue: { status: 'failed', failureReason: reason },
          description: `${payout.providerName} ödemesi başarısız: ${reason}`,
        });
      }

      setPayouts((prev) =>
        prev.map((payout) =>
          payout.id === payoutId
            ? {
                ...payout,
                status: 'failed' as PayoutStatus,
                failedAt: new Date().toISOString(),
                failureReason: reason,
              }
            : payout
        )
      );
    } finally {
      setIsProcessing(false);
    }
  }, [payouts, logAction]);

  const cancelPayout = useCallback(async (payoutId: string) => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const payout = payouts.find((p) => p.id === payoutId);
      if (payout) {
        await logAction('payout.cancel', 'payout', payoutId, {
          previousValue: { status: payout.status },
          newValue: { status: 'cancelled' },
          description: `${payout.providerName} ödemesi iptal edildi`,
        });
      }

      setPayouts((prev) =>
        prev.map((payout) =>
          payout.id === payoutId
            ? {
                ...payout,
                status: 'cancelled' as PayoutStatus,
              }
            : payout
        )
      );
    } finally {
      setIsProcessing(false);
    }
  }, [payouts, logAction]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    payouts,
    filteredPayouts,
    selectedPayout,
    summary,
    categoryBreakdown,
    monthlyRevenue,
    filters,
    setFilters,
    resetFilters,
    isLoading,
    isRefreshing,
    isProcessing,
    refresh,
    selectPayout,
    processPayout,
    completePayout,
    failPayout,
    cancelPayout,
    stats,
  };
}

export default useAdminFinance;
