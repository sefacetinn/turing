/**
 * Analytics Hook
 *
 * Calculates real analytics data from Firebase for both organizers and providers
 */

import { useMemo } from 'react';
import { FirestoreEvent, FirestoreOffer } from './useFirestoreData';
import {
  OrganizerAnalytics,
  ProviderAnalytics,
  MonthlyData,
  CategoryData,
  TopProviderData,
  TopClientData,
  StatusData,
  PaymentData,
  TransactionData,
  PerformanceData,
} from '../data/analyticsData';

// Category icon and color mappings
const categoryConfig: Record<string, { color: string; icon: string; label: string }> = {
  'sound-light': { color: '#3b82f6', icon: 'volume-high', label: 'Ses & Işık' },
  'booking': { color: '#7c3aed', icon: 'musical-notes', label: 'Sanatçı' },
  'catering': { color: '#f59e0b', icon: 'restaurant', label: 'Catering' },
  'security': { color: '#ef4444', icon: 'shield-checkmark', label: 'Güvenlik' },
  'photography': { color: '#10b981', icon: 'camera', label: 'Fotoğraf' },
  'video': { color: '#ec4899', icon: 'videocam', label: 'Video' },
  'decoration': { color: '#8b5cf6', icon: 'flower', label: 'Dekorasyon' },
  'venue': { color: '#06b6d4', icon: 'business', label: 'Mekan' },
  'transport': { color: '#64748b', icon: 'car', label: 'Ulaşım' },
  'accommodation': { color: '#f97316', icon: 'bed', label: 'Konaklama' },
  'dj': { color: '#a855f7', icon: 'disc', label: 'DJ' },
  'mc': { color: '#14b8a6', icon: 'mic', label: 'MC/Sunucu' },
  'animation': { color: '#f43f5e', icon: 'happy', label: 'Animasyon' },
  'other': { color: '#6b7280', icon: 'ellipsis-horizontal', label: 'Diğer' },
};

// Status color mappings
const statusColors: Record<string, string> = {
  draft: '#6b7280',
  planning: '#3b82f6',
  confirmed: '#10b981',
  completed: '#7c3aed',
  cancelled: '#ef4444',
};

// Status labels
const statusLabels: Record<string, string> = {
  draft: 'Taslak',
  planning: 'Planlama',
  confirmed: 'Onaylı',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
};

/**
 * Calculate organizer analytics from events and offers
 */
export function useOrganizerAnalytics(
  events: FirestoreEvent[],
  offers: FirestoreOffer[]
): OrganizerAnalytics {
  return useMemo(() => {
    // Filter accepted offers for spending calculations
    const acceptedOffers = offers.filter(o => o.status === 'accepted');
    const pendingOffers = offers.filter(o =>
      o.status === 'pending' || o.status === 'quoted' || o.status === 'counter_offered'
    );

    // Calculate total spent from accepted offers
    const totalSpent = acceptedOffers.reduce((sum, offer) => {
      const amount = offer.finalAmount ?? offer.amount ?? 0;
      return sum + amount;
    }, 0);

    // Get unique providers from accepted offers
    const uniqueProviders = new Set(acceptedOffers.map(o => o.providerId));

    // Summary stats
    const totalEvents = events.length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const averageEventCost = totalEvents > 0 ? Math.round(totalSpent / totalEvents) : 0;

    // Monthly spending - group by month
    const monthlyMap = new Map<string, { income: number; expenses: number }>();
    acceptedOffers.forEach(offer => {
      const date = offer.acceptedAt || offer.createdAt;
      if (date) {
        const month = new Date(date).toLocaleDateString('tr-TR', { month: 'short' });
        const year = new Date(date).getFullYear();
        const key = `${month} ${year}`;
        const existing = monthlyMap.get(key) || { income: 0, expenses: 0 };
        const amount = offer.finalAmount ?? offer.amount ?? 0;
        existing.expenses += amount;
        monthlyMap.set(key, existing);
      }
    });

    const monthlySpending: MonthlyData[] = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month: month.split(' ')[0],
        year: parseInt(month.split(' ')[1]) || new Date().getFullYear(),
        income: data.income,
        expenses: data.expenses,
      }))
      .slice(-6);

    // Spending by category
    const categoryMap = new Map<string, number>();
    acceptedOffers.forEach(offer => {
      const category = offer.serviceCategory || 'other';
      const existing = categoryMap.get(category) || 0;
      const amount = offer.finalAmount ?? offer.amount ?? 0;
      categoryMap.set(category, existing + amount);
    });

    const categoryTotal = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
    const spendingByCategory: CategoryData[] = Array.from(categoryMap.entries())
      .map(([category, amount]) => {
        const config = categoryConfig[category] || categoryConfig['other'];
        return {
          name: config.label,
          amount,
          percentage: categoryTotal > 0 ? Math.round((amount / categoryTotal) * 100) : 0,
          color: config.color,
          icon: config.icon,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Top providers
    const providerMap = new Map<string, {
      id: string;
      name: string;
      logo?: string;
      category: string;
      totalSpent: number;
      jobCount: number;
      lastEvent: string;
    }>();

    acceptedOffers.forEach(offer => {
      const existing = providerMap.get(offer.providerId) || {
        id: offer.providerId,
        name: offer.providerCompanyName || offer.providerName || 'Provider',
        logo: offer.providerCompanyLogo || offer.providerImage,
        category: offer.serviceCategory,
        totalSpent: 0,
        jobCount: 0,
        lastEvent: '',
      };
      const amount = offer.finalAmount ?? offer.amount ?? 0;
      existing.totalSpent += amount;
      existing.jobCount += 1;
      existing.lastEvent = offer.eventTitle;
      providerMap.set(offer.providerId, existing);
    });

    const topProviders: TopProviderData[] = Array.from(providerMap.values())
      .map(p => ({
        ...p,
        rating: 4.5, // Default rating
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // Events by status
    const statusMap = new Map<string, number>();
    events.forEach(event => {
      const status = event.status || 'draft';
      const existing = statusMap.get(status) || 0;
      statusMap.set(status, existing + 1);
    });

    const eventsByStatus: StatusData[] = Array.from(statusMap.entries())
      .map(([status, count]) => ({
        status: statusLabels[status] || status,
        count,
        percentage: totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0,
        color: statusColors[status] || '#6b7280',
      }))
      .sort((a, b) => b.count - a.count);

    // Upcoming payments - accepted offers without payment confirmation
    const now = new Date();
    const upcomingPayments: PaymentData[] = acceptedOffers
      .filter(offer => {
        // Find the event for this offer
        const event = events.find(e => e.id === offer.eventId);
        if (!event) return false;
        // Show if event is upcoming or in progress
        const eventDate = new Date(event.date);
        return eventDate >= now || event.status === 'planning' || event.status === 'confirmed';
      })
      .map(offer => {
        const event = events.find(e => e.id === offer.eventId);
        const eventDate = event ? new Date(event.date) : new Date();
        const daysUntil = Math.max(0, Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        return {
          id: offer.id,
          providerName: offer.providerCompanyName || offer.providerName || 'Provider',
          providerLogo: offer.providerCompanyLogo || offer.providerImage,
          eventName: offer.eventTitle,
          amount: offer.finalAmount ?? offer.amount ?? 0,
          dueDate: eventDate.toLocaleDateString('tr-TR'),
          daysUntilDue: daysUntil,
        };
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 5);

    return {
      summary: {
        totalEvents,
        completedEvents,
        totalSpent,
        averageEventCost,
        activeProviders: uniqueProviders.size,
        pendingOffers: pendingOffers.length,
      },
      monthlySpending,
      spendingByCategory,
      topProviders,
      eventsByStatus,
      upcomingPayments,
    };
  }, [events, offers]);
}

/**
 * Calculate provider analytics from jobs/events and offers
 */
export function useProviderAnalytics(
  jobs: FirestoreEvent[],
  offers: FirestoreOffer[]
): ProviderAnalytics {
  return useMemo(() => {
    // Filter accepted offers for revenue calculations
    const acceptedOffers = offers.filter(o => o.status === 'accepted');
    const pendingOffers = offers.filter(o =>
      o.status === 'pending' || o.status === 'quoted' || o.status === 'counter_offered'
    );

    // Calculate total revenue from accepted offers
    const totalRevenue = acceptedOffers.reduce((sum, offer) => {
      const amount = offer.finalAmount ?? offer.amount ?? 0;
      return sum + amount;
    }, 0);

    // Estimate expenses (30% of revenue for now - can be enhanced later)
    const totalExpenses = Math.round(totalRevenue * 0.3);
    const netProfit = totalRevenue - totalExpenses;

    // Pending payments - offers accepted but event not yet completed
    const pendingPayments = acceptedOffers
      .filter(offer => {
        const job = jobs.find(j => j.id === offer.eventId);
        return job && job.status !== 'completed';
      })
      .reduce((sum, offer) => {
        const amount = offer.finalAmount ?? offer.amount ?? 0;
        return sum + amount;
      }, 0);

    // Completed jobs
    const completedJobs = acceptedOffers.filter(offer => {
      const job = jobs.find(j => j.id === offer.eventId);
      return job && job.status === 'completed';
    }).length;

    const averageJobValue = acceptedOffers.length > 0
      ? Math.round(totalRevenue / acceptedOffers.length)
      : 0;

    // Performance metrics
    const totalOffers = offers.length;
    const respondedOffers = offers.filter(o =>
      o.status !== 'pending' && o.status !== 'expired'
    ).length;
    const responseRate = totalOffers > 0 ? Math.round((respondedOffers / totalOffers) * 100) : 0;

    const acceptedCount = acceptedOffers.length;
    const completionRate = acceptedCount > 0
      ? Math.round((completedJobs / acceptedCount) * 100)
      : 0;

    // Satisfaction rate - default to 90% for now (can be enhanced with reviews)
    const satisfactionRate = completedJobs > 0 ? 90 : 0;

    // Repeat client rate
    const clientJobCount = new Map<string, number>();
    acceptedOffers.forEach(offer => {
      const count = clientJobCount.get(offer.organizerId) || 0;
      clientJobCount.set(offer.organizerId, count + 1);
    });
    const repeatClients = Array.from(clientJobCount.values()).filter(c => c > 1).length;
    const totalClients = clientJobCount.size;
    const repeatClientRate = totalClients > 0
      ? Math.round((repeatClients / totalClients) * 100)
      : 0;

    // Monthly earnings - group by month
    const monthlyMap = new Map<string, { income: number; expenses: number }>();
    acceptedOffers.forEach(offer => {
      const date = offer.acceptedAt || offer.createdAt;
      if (date) {
        const month = new Date(date).toLocaleDateString('tr-TR', { month: 'short' });
        const year = new Date(date).getFullYear();
        const key = `${month} ${year}`;
        const existing = monthlyMap.get(key) || { income: 0, expenses: 0 };
        const amount = offer.finalAmount ?? offer.amount ?? 0;
        existing.income += amount;
        existing.expenses += Math.round(amount * 0.3); // Estimated expenses
        monthlyMap.set(key, existing);
      }
    });

    const monthlyEarnings: MonthlyData[] = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month: month.split(' ')[0],
        year: parseInt(month.split(' ')[1]) || new Date().getFullYear(),
        income: data.income,
        expenses: data.expenses,
      }))
      .slice(-6);

    // Revenue by service category
    const categoryMap = new Map<string, number>();
    acceptedOffers.forEach(offer => {
      const category = offer.serviceCategory || 'other';
      const existing = categoryMap.get(category) || 0;
      const amount = offer.finalAmount ?? offer.amount ?? 0;
      categoryMap.set(category, existing + amount);
    });

    const categoryTotal = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
    const revenueByService: CategoryData[] = Array.from(categoryMap.entries())
      .map(([category, amount]) => {
        const config = categoryConfig[category] || categoryConfig['other'];
        return {
          name: config.label,
          amount,
          percentage: categoryTotal > 0 ? Math.round((amount / categoryTotal) * 100) : 0,
          color: config.color,
          icon: config.icon,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Top clients
    const clientMap = new Map<string, {
      id: string;
      name: string;
      logo?: string;
      totalRevenue: number;
      jobCount: number;
      lastJob: string;
    }>();

    acceptedOffers.forEach(offer => {
      const existing = clientMap.get(offer.organizerId) || {
        id: offer.organizerId,
        name: offer.organizerCompanyName || offer.organizerName || 'Organizatör',
        logo: offer.organizerCompanyLogo || offer.organizerImage,
        totalRevenue: 0,
        jobCount: 0,
        lastJob: '',
      };
      const amount = offer.finalAmount ?? offer.amount ?? 0;
      existing.totalRevenue += amount;
      existing.jobCount += 1;
      existing.lastJob = offer.eventTitle;
      clientMap.set(offer.organizerId, existing);
    });

    const topClients: TopClientData[] = Array.from(clientMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Recent transactions - from offer activity
    const recentTransactions: TransactionData[] = offers
      .filter(o => o.status === 'accepted')
      .slice(0, 10)
      .map(offer => {
        const job = jobs.find(j => j.id === offer.eventId);
        return {
          id: offer.id,
          type: 'income' as const,
          description: offer.eventTitle,
          amount: offer.finalAmount ?? offer.amount ?? 0,
          date: offer.acceptedAt
            ? new Date(offer.acceptedAt).toLocaleDateString('tr-TR')
            : new Date(offer.createdAt).toLocaleDateString('tr-TR'),
          status: job?.status === 'completed' ? 'completed' as const : 'pending' as const,
          category: categoryConfig[offer.serviceCategory]?.label || 'Diğer',
        };
      });

    const performanceMetrics: PerformanceData = {
      responseRate,
      completionRate,
      satisfactionRate,
      repeatClientRate,
    };

    return {
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        pendingPayments,
        completedJobs,
        averageJobValue,
        responseRate,
        satisfactionRate,
      },
      monthlyEarnings,
      revenueByService,
      topClients,
      performanceMetrics,
      recentTransactions,
    };
  }, [jobs, offers]);
}
