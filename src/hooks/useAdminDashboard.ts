import { useState, useCallback, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import type {
  AdminDashboardStats,
  AdminKPI,
  QuickAction,
  RecentActivity,
} from '../types/admin';

// Mock recent activities
const mockRecentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'user',
    action: 'Yeni kullanıcı kaydı',
    description: 'Ahmet Yılmaz hesap oluşturdu',
    targetId: 'user_1',
    targetName: 'Ahmet Yılmaz',
    targetImage: 'https://i.pravatar.cc/150?img=1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    type: 'event',
    action: 'Etkinlik onay bekliyor',
    description: 'Yaz Festivali 2024 onay bekliyor',
    targetId: 'event_1',
    targetName: 'Yaz Festivali 2024',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '3',
    type: 'payout',
    action: 'Ödeme talebi',
    description: 'TechSound ödeme talebi oluşturdu',
    targetId: 'payout_1',
    targetName: 'TechSound',
    targetImage: 'https://i.pravatar.cc/150?img=12',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    adminName: 'Sistem',
  },
  {
    id: '4',
    type: 'moderation',
    action: 'Etkinlik onaylandı',
    description: 'Konser Gecesi etkinliği onaylandı',
    targetId: 'event_2',
    targetName: 'Konser Gecesi',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    adminName: 'Admin Ayşe',
  },
  {
    id: '5',
    type: 'user',
    action: 'Kullanıcı doğrulandı',
    description: 'Mehmet Demir hesabı doğrulandı',
    targetId: 'user_2',
    targetName: 'Mehmet Demir',
    targetImage: 'https://i.pravatar.cc/150?img=3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    adminName: 'Admin Ali',
  },
];

// Quick actions configuration
const defaultQuickActions: QuickAction[] = [
  {
    id: 'pending_users',
    label: 'Bekleyen Doğrulamalar',
    icon: 'person-add',
    color: '#8b5cf6',
    screen: 'AdminUsers',
    params: { filter: 'pending' },
  },
  {
    id: 'pending_events',
    label: 'Onay Bekleyen Etkinlikler',
    icon: 'calendar',
    color: '#f59e0b',
    screen: 'AdminEvents',
    params: { filter: 'pending' },
  },
  {
    id: 'pending_payouts',
    label: 'Bekleyen Ödemeler',
    icon: 'wallet',
    color: '#10b981',
    screen: 'AdminFinance',
    params: { tab: 'payouts' },
  },
  {
    id: 'flagged_events',
    label: 'İşaretli Etkinlikler',
    icon: 'flag',
    color: '#ef4444',
    screen: 'AdminEvents',
    params: { filter: 'flagged' },
  },
];

export interface UseAdminDashboardResult {
  // Data
  stats: AdminDashboardStats | null;
  kpis: AdminKPI[];
  quickActions: QuickAction[];
  recentActivities: RecentActivity[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Actions
  refresh: () => Promise<void>;
}

export function useAdminDashboard(): UseAdminDashboardResult {
  const { dashboardStats, refreshDashboard, isLoading: contextLoading } = useAdmin();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(mockRecentActivities);

  // Generate KPIs from stats
  const kpis: AdminKPI[] = dashboardStats
    ? [
        {
          id: 'total_users',
          label: 'Toplam Kullanıcı',
          value: dashboardStats.totalUsers,
          change: 12.5,
          changeLabel: 'Bu ay',
          icon: 'people',
          color: '#8b5cf6',
          trend: 'up',
        },
        {
          id: 'pending_verifications',
          label: 'Bekleyen Doğrulama',
          value: dashboardStats.pendingVerifications,
          icon: 'person-add',
          color: '#f59e0b',
        },
        {
          id: 'pending_events',
          label: 'Onay Bekleyen',
          value: dashboardStats.pendingApproval,
          icon: 'calendar',
          color: '#3b82f6',
        },
        {
          id: 'monthly_revenue',
          label: 'Aylık Gelir',
          value: `₺${(dashboardStats.monthlyRevenue / 1000).toFixed(0)}K`,
          change: 8.3,
          changeLabel: 'Geçen ay',
          icon: 'trending-up',
          color: '#10b981',
          trend: 'up',
        },
        {
          id: 'active_events',
          label: 'Aktif Etkinlik',
          value: dashboardStats.activeEvents,
          icon: 'musical-notes',
          color: '#ec4899',
        },
        {
          id: 'pending_payouts',
          label: 'Bekleyen Ödeme',
          value: dashboardStats.pendingPayouts,
          icon: 'wallet',
          color: '#14b8a6',
        },
        {
          id: 'flagged_events',
          label: 'İşaretli Etkinlik',
          value: dashboardStats.flaggedEvents,
          icon: 'flag',
          color: '#ef4444',
        },
        {
          id: 'open_tickets',
          label: 'Açık Destek',
          value: dashboardStats.openTickets,
          icon: 'chatbubbles',
          color: '#6366f1',
        },
      ]
    : [];

  // Add badges to quick actions based on stats
  const quickActions: QuickAction[] = dashboardStats
    ? defaultQuickActions.map((action) => {
        let badge: number | undefined;
        switch (action.id) {
          case 'pending_users':
            badge = dashboardStats.pendingVerifications;
            break;
          case 'pending_events':
            badge = dashboardStats.pendingApproval;
            break;
          case 'pending_payouts':
            badge = dashboardStats.pendingPayouts;
            break;
          case 'flagged_events':
            badge = dashboardStats.flaggedEvents;
            break;
        }
        return { ...action, badge };
      })
    : defaultQuickActions;

  // Refresh handler
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshDashboard();
      // Simulate fetching recent activities
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshDashboard]);

  // Initial load
  useEffect(() => {
    if (!dashboardStats) {
      refreshDashboard();
    }
  }, [dashboardStats, refreshDashboard]);

  return {
    stats: dashboardStats,
    kpis,
    quickActions,
    recentActivities,
    isLoading: contextLoading,
    isRefreshing,
    refresh,
  };
}

export default useAdminDashboard;
