import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { ScrollHeader, LargeTitle } from '../components/navigation';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../../App';
import {
  KPICard,
  TrendBadge,
  PeriodSelector,
  BarChart,
  CategoryBreakdown,
  PerformanceRing,
  TopListCard,
  TransactionItem,
} from '../components/analytics';
import {
  organizerAnalytics,
  providerAnalytics,
  formatCurrency,
  formatCompactCurrency,
  getDataByPeriod,
  PeriodType,
} from '../data/analyticsData';

export function AnalyticsDashboardScreen() {
  const { colors, isDark } = useTheme();
  const { isProviderMode } = useApp();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const accentColor = colors.brand[400];
  const accentBg = isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.08)';

  // Get data based on mode
  const analytics = isProviderMode ? providerAnalytics : organizerAnalytics;
  const chartData = isProviderMode
    ? getDataByPeriod(providerAnalytics.monthlyEarnings, selectedPeriod)
    : getDataByPeriod(organizerAnalytics.monthlySpending, selectedPeriod);

  // Provider View
  const renderProviderDashboard = () => (
    <>
      {/* KPI Cards */}
      <View style={styles.section}>
        <View style={styles.kpiGrid}>
          <KPICard
            title="Toplam Gelir"
            value={formatCompactCurrency(providerAnalytics.summary.totalRevenue)}
            icon="cash-outline"
            iconColor="#10b981"
            trend={23}
          />
          <KPICard
            title="Net Kar"
            value={formatCompactCurrency(providerAnalytics.summary.netProfit)}
            icon="trending-up-outline"
            iconColor="#7c3aed"
            trend={18}
          />
        </View>
        <View style={[styles.kpiGrid, { marginTop: 12 }]}>
          <KPICard
            title="Bekleyen Ödeme"
            value={formatCompactCurrency(providerAnalytics.summary.pendingPayments)}
            icon="time-outline"
            iconColor="#f59e0b"
          />
          <KPICard
            title="Tamamlanan İş"
            value={String(providerAnalytics.summary.completedJobs)}
            icon="checkmark-circle-outline"
            iconColor="#3b82f6"
            subtitle={`Ort. ${formatCompactCurrency(providerAnalytics.summary.averageJobValue)}`}
          />
        </View>
      </View>

      {/* Performance Rings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Performans Metrikleri</Text>
        <View
          style={[
            styles.performanceCard,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
          ]}
        >
          <View style={styles.ringsRow}>
            <PerformanceRing
              value={providerAnalytics.performanceMetrics.responseRate}
              label="Yanıt Oranı"
              color="#10b981"
            />
            <PerformanceRing
              value={providerAnalytics.performanceMetrics.completionRate}
              label="Tamamlama"
              color="#3b82f6"
            />
            <PerformanceRing
              value={providerAnalytics.performanceMetrics.satisfactionRate}
              label="Memnuniyet"
              color="#7c3aed"
            />
            <PerformanceRing
              value={providerAnalytics.performanceMetrics.repeatClientRate}
              label="Tekrar Müşteri"
              color="#f59e0b"
            />
          </View>
        </View>
      </View>

      {/* Period Selector & Chart */}
      <View style={styles.section}>
        <View style={styles.chartHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Gelir / Gider Grafiği</Text>
        </View>
        <View style={{ marginBottom: 12 }}>
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </View>
        <BarChart data={chartData} showExpenses title="" />
      </View>

      {/* Revenue by Service */}
      <View style={styles.section}>
        <CategoryBreakdown
          data={providerAnalytics.revenueByService}
          title="Hizmet Bazlı Gelir"
        />
      </View>

      {/* Top Clients */}
      <View style={styles.sectionNoHorizontalPadding}>
        <TopListCard
          title="En İyi Müşteriler"
          data={providerAnalytics.topClients}
          type="client"
        />
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Son İşlemler</Text>
        <View
          style={[
            styles.transactionsCard,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
          ]}
        >
          {providerAnalytics.recentTransactions.map((transaction, index) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              isLast={index === providerAnalytics.recentTransactions.length - 1}
            />
          ))}
        </View>
      </View>
    </>
  );

  // Organizer View
  const renderOrganizerDashboard = () => (
    <>
      {/* KPI Cards */}
      <View style={styles.section}>
        <View style={styles.kpiGrid}>
          <KPICard
            title="Toplam Etkinlik"
            value={String(organizerAnalytics.summary.totalEvents)}
            icon="calendar-outline"
            iconColor="#7c3aed"
            subtitle={`${organizerAnalytics.summary.completedEvents} tamamlandı`}
          />
          <KPICard
            title="Toplam Harcama"
            value={formatCompactCurrency(organizerAnalytics.summary.totalSpent)}
            icon="wallet-outline"
            iconColor="#f59e0b"
            trend={-12}
          />
        </View>
        <View style={[styles.kpiGrid, { marginTop: 12 }]}>
          <KPICard
            title="Aktif Provider"
            value={String(organizerAnalytics.summary.activeProviders)}
            icon="people-outline"
            iconColor="#3b82f6"
          />
          <KPICard
            title="Ort. Etkinlik Maliyeti"
            value={formatCompactCurrency(organizerAnalytics.summary.averageEventCost)}
            icon="stats-chart-outline"
            iconColor="#10b981"
          />
        </View>
      </View>

      {/* Period Selector & Chart */}
      <View style={styles.section}>
        <View style={styles.chartHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aylık Harcama Trendi</Text>
        </View>
        <View style={{ marginBottom: 12 }}>
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </View>
        <BarChart data={chartData} showExpenses={false} title="" />
      </View>

      {/* Spending by Category */}
      <View style={styles.section}>
        <CategoryBreakdown
          data={organizerAnalytics.spendingByCategory}
          title="Kategori Bazlı Harcama"
        />
      </View>

      {/* Event Status Distribution */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Etkinlik Durumları</Text>
        <View
          style={[
            styles.statusCard,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
          ]}
        >
          <View style={styles.statusBar}>
            {organizerAnalytics.eventsByStatus.map((status, index) => (
              <View
                key={status.status}
                style={[
                  styles.statusSegment,
                  {
                    flex: status.percentage,
                    backgroundColor: status.color,
                    borderTopLeftRadius: index === 0 ? 6 : 0,
                    borderBottomLeftRadius: index === 0 ? 6 : 0,
                    borderTopRightRadius:
                      index === organizerAnalytics.eventsByStatus.length - 1 ? 6 : 0,
                    borderBottomRightRadius:
                      index === organizerAnalytics.eventsByStatus.length - 1 ? 6 : 0,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.statusLegend}>
            {organizerAnalytics.eventsByStatus.map((status) => (
              <View key={status.status} style={styles.statusLegendItem}>
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                  {status.status}: {status.count}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Top Providers */}
      <View style={styles.sectionNoHorizontalPadding}>
        <TopListCard
          title="En Çok Çalışılan Provider'lar"
          data={organizerAnalytics.topProviders}
          type="provider"
        />
      </View>

      {/* Upcoming Payments */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Yaklaşan Ödemeler</Text>
        <View
          style={[
            styles.paymentsCard,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
          ]}
        >
          {organizerAnalytics.upcomingPayments.map((payment, index) => (
            <View
              key={payment.id}
              style={[
                styles.paymentRow,
                index !== organizerAnalytics.upcomingPayments.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
                },
              ]}
            >
              <View style={styles.paymentLeft}>
                <Text style={[styles.paymentProvider, { color: colors.text }]}>
                  {payment.providerName}
                </Text>
                <Text style={[styles.paymentEvent, { color: colors.textMuted }]}>
                  {payment.eventName}
                </Text>
              </View>
              <View style={styles.paymentRight}>
                <Text style={[styles.paymentAmount, { color: colors.text }]}>
                  {formatCurrency(payment.amount)}
                </Text>
                <View
                  style={[
                    styles.paymentDueBadge,
                    {
                      backgroundColor:
                        payment.daysUntilDue <= 7
                          ? 'rgba(239, 68, 68, 0.15)'
                          : payment.daysUntilDue <= 14
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(16, 185, 129, 0.15)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.paymentDueText,
                      {
                        color:
                          payment.daysUntilDue <= 7
                            ? '#ef4444'
                            : payment.daysUntilDue <= 14
                            ? '#f59e0b'
                            : '#10b981',
                      },
                    ]}
                  >
                    {payment.daysUntilDue} gün
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollHeader
        title="Analizler"
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
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
            colors={[colors.brand[500]]}
          />
        }
      >
        <LargeTitle
          title="Analizler"
          subtitle={isProviderMode ? 'Gelir ve performans takibi' : 'Harcama ve etkinlik takibi'}
          scrollY={scrollY}
        />

        {/* Mode Indicator */}
        <View style={styles.modeSection}>
          <View
            style={[
              styles.modeBadge,
              { backgroundColor: accentBg, borderColor: accentColor },
            ]}
          >
            <Ionicons
              name={isProviderMode ? 'briefcase' : 'calendar'}
              size={14}
              color={accentColor}
            />
            <Text style={[styles.modeText, { color: accentColor }]}>
              {isProviderMode ? 'Provider Dashboard' : 'Organizatör Dashboard'}
            </Text>
          </View>
        </View>

        {isProviderMode ? renderProviderDashboard() : renderOrganizerDashboard()}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
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
  modeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionNoHorizontalPadding: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  performanceCard: {
    borderRadius: 16,
    padding: 20,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  statusCard: {
    borderRadius: 16,
    padding: 16,
  },
  statusBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  statusSegment: {
    height: '100%',
  },
  statusLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statusLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
  },
  paymentsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  paymentLeft: {
    flex: 1,
  },
  paymentProvider: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentEvent: {
    fontSize: 12,
    marginTop: 2,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  paymentDueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  paymentDueText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
