import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ScrollHeader, LargeTitle } from '../../components/navigation';
import { useTheme } from '../../theme/ThemeContext';
import { useAdminFinance } from '../../hooks/useAdminFinance';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { PayoutItem } from '../../components/admin/PayoutItem';
import { ActionModal } from '../../components/admin/ActionModal';
import { BarChart, CategoryBreakdown } from '../../components/analytics';
import type { Payout } from '../../types/admin';

type TabType = 'overview' | 'payouts' | 'transactions';

export function AdminFinanceScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    filteredPayouts,
    summary,
    categoryBreakdown,
    monthlyRevenue,
    isRefreshing,
    isProcessing,
    refresh,
    processPayout,
    completePayout,
    failPayout,
    stats,
  } = useAdminFinance();
  const { canApproveFinance } = useAdminPermissions();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showFailModal, setShowFailModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  // Handle process payout
  const handleProcess = useCallback(async (payout: Payout) => {
    await processPayout(payout.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [processPayout]);

  // Handle complete payout
  const handleComplete = useCallback(async (payout: Payout) => {
    await completePayout(payout.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [completePayout]);

  // Handle fail payout
  const handleFail = useCallback((payout: Payout) => {
    setSelectedPayout(payout);
    setShowFailModal(true);
  }, []);

  const confirmFail = useCallback(async (reason?: string) => {
    if (selectedPayout && reason) {
      await failPayout(selectedPayout.id, reason);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowFailModal(false);
    setSelectedPayout(null);
  }, [selectedPayout, failPayout]);

  // Transform monthly revenue for chart - matches MonthlyData type
  const chartData = monthlyRevenue.map((item, index) => ({
    month: item.month,
    year: new Date().getFullYear(),
    income: item.revenue,
    expenses: item.payouts,
  }));

  // Transform category breakdown for component - matches CategoryData type
  const categoryData = categoryBreakdown.map(item => ({
    name: item.categoryName,
    amount: item.amount,
    percentage: item.percentage,
    color: getCategoryColor(item.category as string),
    icon: getCategoryIcon(item.category as string),
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollHeader
        title="Finans"
        scrollY={scrollY}
        showBackButton
        rightAction={
          <TouchableOpacity
            style={[
              styles.headerAction,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBackground },
            ]}
          >
            <Ionicons name="download-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        }
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 44 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.brand[500]}
          />
        }
      >
        <LargeTitle
          title="Finans"
          subtitle="Gelir ve ödeme yönetimi"
          scrollY={scrollY}
        />

        {/* Tab Bar */}
        <View style={styles.tabBarSection}>
          <View
            style={[
              styles.tabBar,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBackground },
            ]}
          >
            {(['overview', 'payouts', 'transactions'] as TabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabItem,
                  activeTab === tab && { backgroundColor: colors.brand[500] },
                ]}
                onPress={() => handleTabChange(tab)}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    { color: activeTab === tab ? '#fff' : colors.textSecondary },
                  ]}
                >
                  {tab === 'overview' ? 'Genel Bakış' : tab === 'payouts' ? 'Ödemeler' : 'İşlemler'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Summary Cards */}
            <View style={styles.section}>
              <View style={styles.summaryGrid}>
                <View
                  style={[
                    styles.summaryCard,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
                  ]}
                >
                  <Ionicons name="trending-up" size={24} color="#10b981" />
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {formatCurrency(summary.totalRevenue)}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                    Toplam Gelir
                  </Text>
                </View>

                <View
                  style={[
                    styles.summaryCard,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
                  ]}
                >
                  <Ionicons name="cash" size={24} color="#8b5cf6" />
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {formatCurrency(summary.totalCommission)}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                    Toplam Komisyon
                  </Text>
                </View>
              </View>

              <View style={[styles.summaryGrid, { marginTop: 12 }]}>
                <View
                  style={[
                    styles.summaryCard,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
                  ]}
                >
                  <Ionicons name="wallet" size={24} color="#3b82f6" />
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {formatCurrency(summary.totalPayouts)}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                    Toplam Ödeme
                  </Text>
                </View>

                <View
                  style={[
                    styles.summaryCard,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
                  ]}
                >
                  <Ionicons name="time" size={24} color="#f59e0b" />
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {formatCurrency(summary.pendingPayouts)}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                    Bekleyen ({summary.pendingPayoutCount})
                  </Text>
                </View>
              </View>
            </View>

            {/* Monthly Chart */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Aylık Gelir</Text>
              <BarChart data={chartData} showExpenses title="" />
            </View>

            {/* Category Breakdown */}
            <View style={styles.section}>
              <CategoryBreakdown data={categoryData} title="Kategori Dağılımı" />
            </View>
          </>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <View style={styles.section}>
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
                <Text style={[styles.statValue, { color: '#f59e0b' }]}>{stats.pending}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Bekleyen</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
                <Text style={[styles.statValue, { color: '#3b82f6' }]}>{stats.processing}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>İşleniyor</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
                <Text style={[styles.statValue, { color: '#10b981' }]}>{stats.completed}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Tamamlandı</Text>
              </View>
            </View>

            {/* Payout List */}
            <View
              style={[
                styles.payoutList,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
              ]}
            >
              {filteredPayouts.map((payout, index) => (
                <PayoutItem
                  key={payout.id}
                  payout={payout}
                  isLast={index === filteredPayouts.length - 1}
                  onProcess={canApproveFinance && payout.status === 'pending' ? () => handleProcess(payout) : undefined}
                  onComplete={canApproveFinance && payout.status === 'processing' ? () => handleComplete(payout) : undefined}
                />
              ))}

              {filteredPayouts.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    Ödeme bulunamadı
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <View style={styles.section}>
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                İşlem geçmişi
              </Text>
              <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
                Tüm finansal işlemler burada listelenecek
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Fail Modal */}
      <ActionModal
        visible={showFailModal}
        onClose={() => {
          setShowFailModal(false);
          setSelectedPayout(null);
        }}
        onConfirm={confirmFail}
        title="Ödeme Başarısız"
        message={`${selectedPayout?.providerName} ödemesini başarısız olarak işaretlemek istediğinize emin misiniz?`}
        confirmLabel="Başarısız İşaretle"
        icon="alert-circle"
        iconColor="#ef4444"
        requireReason
        reasonPlaceholder="Başarısızlık sebebini yazın..."
        isDestructive
        isLoading={isProcessing}
      />
    </View>
  );
}

// Helper function for category colors
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    technical: '#8b5cf6',
    booking: '#3b82f6',
    venue: '#10b981',
    catering: '#f59e0b',
    transport: '#ec4899',
  };
  return colors[category] || '#6b7280';
}

// Helper function for category icons
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    technical: 'hardware-chip',
    booking: 'musical-notes',
    venue: 'business',
    catering: 'restaurant',
    transport: 'car',
  };
  return icons[category] || 'ellipse';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  payoutList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default AdminFinanceScreen;
