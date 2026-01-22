import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { OptimizedImage } from '../components/OptimizedImage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { ScrollHeader, LargeTitle } from '../components/navigation';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useProviderFinance } from '../hooks/useProviderFinance';
import {
  Invoice,
} from '../data/financeData';

const { width } = Dimensions.get('window');

type TabType = 'overview' | 'transactions' | 'invoices';

export function ProviderFinanceScreen() {
  const navigation = useNavigation();
  const { colors, isDark, helpers } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real financial data from Firebase
  const {
    summary: financialSummary,
    monthlyEarnings,
    incomeByService,
    transactions: recentTransactions,
    loading: financeLoading,
  } = useProviderFinance(user?.uid);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Genel Bakış', icon: 'stats-chart' },
    { id: 'transactions', label: 'İşlemler', icon: 'swap-horizontal' },
    { id: 'invoices', label: 'Faturalar', icon: 'document-text' },
  ];

  const accentColor = colors.brand[400];
  const accentBg = isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.08)';

  const formatCurrency = (amount: number) => {
    return `₺${amount.toLocaleString('tr-TR')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return colors.success;
      case 'pending':
      case 'processing':
        return colors.warning;
      case 'overdue':
        return colors.error;
      case 'cancelled':
        return colors.textMuted;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'paid':
        return 'Ödendi';
      case 'pending':
        return 'Bekliyor';
      case 'processing':
        return 'İşleniyor';
      case 'overdue':
        return 'Gecikmiş';
      case 'cancelled':
        return 'İptal';
      default:
        return status;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return 'arrow-down-circle';
      case 'expense':
        return 'arrow-up-circle';
      case 'pending':
        return 'time';
      case 'refund':
        return 'return-down-back';
      default:
        return 'swap-horizontal';
    }
  };

  // No invoices for now - will be implemented later
  const allInvoices: Invoice[] = [];

  const renderOverviewTab = () => (
    <>
      {/* Main Stats Card */}
      <View style={styles.section}>
        <LinearGradient
          colors={
            isDark
              ? ['rgba(75, 48, 184, 0.2)', 'rgba(75, 48, 184, 0.1)']
              : ['rgba(75, 48, 184, 0.12)', 'rgba(75, 48, 184, 0.06)']
          }
          style={[styles.mainStatsCard, { borderColor: isDark ? 'rgba(75, 48, 184, 0.3)' : 'rgba(75, 48, 184, 0.2)' }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.mainStatHeader}>
            <View>
              <View style={styles.statLabelRow}>
                <Ionicons name="wallet-outline" size={18} color={accentColor} />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bu Ay Kazanç</Text>
              </View>
              <Text style={[styles.mainStatValue, { color: colors.text }]}>
                {formatCurrency(financialSummary.thisMonthEarnings)}
              </Text>
            </View>
            {financialSummary.growthPercentage !== 0 && (
              <View style={[styles.growthBadge, { backgroundColor: financialSummary.growthPercentage >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name={financialSummary.growthPercentage >= 0 ? 'trending-up' : 'trending-down'} size={14} color={financialSummary.growthPercentage >= 0 ? colors.success : colors.error} />
                <Text style={[styles.growthText, { color: financialSummary.growthPercentage >= 0 ? colors.success : colors.error }]}>{financialSummary.growthPercentage >= 0 ? '+' : ''}{financialSummary.growthPercentage}%</Text>
              </View>
            )}
          </View>

          <View style={[styles.mainStatDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statItemValue, { color: colors.text }]}>
                {formatCurrency(financialSummary.pendingPayments)}
              </Text>
              <Text style={[styles.statItemLabel, { color: colors.textMuted }]}>Bekleyen Ödeme</Text>
            </View>
            <View style={[styles.statItemDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statItemValue, { color: colors.text }]}>{financialSummary.completedJobs}</Text>
              <Text style={[styles.statItemLabel, { color: colors.textMuted }]}>Tamamlanan İş</Text>
            </View>
            <View style={[styles.statItemDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statItemValue, { color: colors.text }]}>
                {formatCurrency(financialSummary.averageJobValue)}
              </Text>
              <Text style={[styles.statItemLabel, { color: colors.textMuted }]}>Ort. İş Değeri</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Monthly Chart */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Aylık Kazanç Grafiği</Text>
        <View style={[styles.chartCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
          <View style={styles.chartContainer}>
            {monthlyEarnings.map((item, index) => {
              const maxAmount = Math.max(...monthlyEarnings.map(m => m.amount), 1);
              const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 10;
              return (
                <View key={index} style={styles.chartBarContainer}>
                  <View style={[styles.chartBar, { height: `${Math.max(height, 5)}%`, backgroundColor: accentColor }]}>
                    <LinearGradient
                      colors={[accentColor, isDark ? 'rgba(75, 48, 184, 0.5)' : 'rgba(75, 48, 184, 0.3)']}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    />
                  </View>
                  <Text style={[styles.chartLabel, { color: colors.textMuted }]}>{item.month}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.chartLegend}>
            <Text style={[styles.chartLegendText, { color: colors.textMuted }]}>
              Son 6 ay toplam: {formatCurrency(monthlyEarnings.reduce((sum, m) => sum + m.amount, 0))}
            </Text>
          </View>
        </View>
      </View>

      {/* Pending Payments Alert */}
      {financialSummary.pendingPayments > 0 && (
        <View style={styles.section}>
          <View style={[styles.alertCard, { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
            <View style={[styles.alertIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="time" size={20} color={colors.warning} />
            </View>
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: colors.warning }]}>Bekleyen Ödeme</Text>
              <Text style={[styles.alertText, { color: colors.textSecondary }]}>
                {formatCurrency(financialSummary.pendingPayments)} tutarında ödeme bekleniyor
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.warning} />
          </View>
        </View>
      )}

      {/* Income by Service */}
      {incomeByService.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hizmet Bazlı Gelir</Text>
          <View style={[styles.serviceCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
            {incomeByService.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.serviceRow,
                  index !== incomeByService.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border },
                ]}
              >
                <View style={[styles.serviceDot, { backgroundColor: item.color }]} />
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceName, { color: colors.text }]}>{item.category}</Text>
                  <View style={[styles.serviceProgressBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                    <View style={[styles.serviceProgress, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
                <View style={styles.serviceValue}>
                  <Text style={[styles.serviceAmount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
                  <Text style={[styles.servicePercent, { color: colors.textMuted }]}>{item.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Empty State for no data */}
      {!financeLoading && financialSummary.totalEarnings === 0 && (
        <View style={styles.section}>
          <View style={[styles.emptyCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
            <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Henüz Kazanç Yok</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Sözleşme imzaladığınızda kazançlarınız burada görünecek
            </Text>
          </View>
        </View>
      )}

    </>
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderTransactionsTab = () => (
    <View style={styles.section}>
      {recentTransactions.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
          <Ionicons name="swap-horizontal-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Henüz İşlem Yok</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Tamamlanan işlemleriniz burada görünecek
          </Text>
        </View>
      ) : (
        <View style={[styles.transactionsCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
          {recentTransactions.map((transaction, index) => (
            <View
              key={transaction.id}
              style={[
                styles.transactionRow,
                index !== recentTransactions.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border },
              ]}
            >
              <View
                style={[
                  styles.transactionIcon,
                  {
                    backgroundColor:
                      transaction.type === 'income'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)',
                  },
                ]}
              >
                <Ionicons
                  name={getTransactionIcon(transaction.type) as any}
                  size={18}
                  color={transaction.type === 'income' ? colors.success : colors.error}
                />
              </View>
              <View style={styles.transactionContent}>
                <Text style={[styles.transactionTitle, { color: colors.text }]} numberOfLines={1}>
                  {transaction.description}
                </Text>
                <Text style={[styles.transactionMeta, { color: colors.textMuted }]}>
                  {formatDate(transaction.date)}
                </Text>
                {transaction.eventTitle && (
                  <Text style={[styles.transactionEvent, { color: colors.textSecondary }]}>{transaction.eventTitle}</Text>
                )}
              </View>
              <View style={styles.transactionAmount}>
                <Text
                  style={[
                    styles.transactionValue,
                    { color: transaction.type === 'income' ? colors.success : colors.error },
                  ]}
                >
                  {transaction.type === 'expense' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                </Text>
                <View
                  style={[
                    styles.transactionStatus,
                    { backgroundColor: `${getStatusColor(transaction.status)}15` },
                  ]}
                >
                  <Text style={[styles.transactionStatusText, { color: getStatusColor(transaction.status) }]}>
                    {getStatusLabel(transaction.status)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderInvoicesTab = () => (
    <View style={styles.section}>
      {/* Empty State for invoices - to be implemented */}
      <View style={[styles.emptyCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
        <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Faturalar Yakında</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Fatura yönetimi özelliği yakında eklenecek
        </Text>
      </View>
      {/* Original Invoice Stats - hidden for now
      <View style={styles.invoiceStatsRow}>
        <View style={[styles.invoiceStatCard, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
          <Text style={[styles.invoiceStatValue, { color: colors.success }]}>
            {allInvoices.filter(i => i.status === 'paid').length}
          </Text>
          <Text style={[styles.invoiceStatLabel, { color: colors.success }]}>Ödendi</Text>
        </View>
        <View style={[styles.invoiceStatCard, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
          <Text style={[styles.invoiceStatValue, { color: colors.warning }]}>
            {allInvoices.filter(i => i.status === 'pending').length}
          </Text>
          <Text style={[styles.invoiceStatLabel, { color: colors.warning }]}>Bekliyor</Text>
        </View>
        <View style={[styles.invoiceStatCard, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
          <Text style={[styles.invoiceStatValue, { color: colors.error }]}>
            {allInvoices.filter(i => i.status === 'overdue').length}
          </Text>
          <Text style={[styles.invoiceStatLabel, { color: colors.error }]}>Gecikmiş</Text>
        </View>
      </View>
      */}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollHeader
        title="Finans Yönetimi"
        scrollY={scrollY}
        showBackButton
        rightAction={
          <TouchableOpacity
            style={[styles.headerAction, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBackground }]}
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
        <LargeTitle title="Finans Yönetimi" subtitle="Gelir, gider ve fatura takibi" scrollY={scrollY} />

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  activeTab === tab.id && { backgroundColor: accentBg },
                  { borderColor: activeTab === tab.id ? accentColor : isDark ? 'rgba(255,255,255,0.1)' : colors.border },
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={activeTab === tab.id ? accentColor : colors.textMuted}
                />
                <Text
                  style={[styles.tabText, { color: activeTab === tab.id ? accentColor : colors.textSecondary }]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'transactions' && renderTransactionsTab()}
        {activeTab === 'invoices' && renderInvoicesTab()}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Invoice Detail Modal */}
      <Modal
        visible={selectedInvoice !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedInvoice(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Fatura Detayı</Text>
                {selectedInvoice && (
                  <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>{selectedInvoice.invoiceNumber}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setSelectedInvoice(null)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedInvoice && (
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Invoice Header */}
                <View style={styles.invoiceDetailHeader}>
                  <OptimizedImage source={selectedInvoice.organizerLogo} style={styles.invoiceDetailLogo} />
                  <View style={styles.invoiceDetailInfo}>
                    <Text style={[styles.invoiceDetailEvent, { color: colors.text }]}>{selectedInvoice.eventName}</Text>
                    <Text style={[styles.invoiceDetailOrganizer, { color: colors.textSecondary }]}>{selectedInvoice.organizerName}</Text>
                    <Text style={[styles.invoiceDetailDate, { color: colors.textMuted }]}>Etkinlik: {selectedInvoice.eventDate}</Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View style={[styles.invoiceDetailStatus, { backgroundColor: `${getStatusColor(selectedInvoice.status)}15` }]}>
                  <Ionicons
                    name={selectedInvoice.status === 'paid' ? 'checkmark-circle' : selectedInvoice.status === 'overdue' ? 'alert-circle' : 'time'}
                    size={20}
                    color={getStatusColor(selectedInvoice.status)}
                  />
                  <Text style={[styles.invoiceDetailStatusText, { color: getStatusColor(selectedInvoice.status) }]}>
                    {getStatusLabel(selectedInvoice.status)}
                    {selectedInvoice.paymentDate && ` - ${selectedInvoice.paymentDate}`}
                  </Text>
                </View>

                {/* Items */}
                <View style={[styles.invoiceItems, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
                  <Text style={[styles.invoiceItemsTitle, { color: colors.text }]}>Kalemler</Text>
                  {selectedInvoice.items.map((item, index) => (
                    <View
                      key={index}
                      style={[
                        styles.invoiceItem,
                        index !== selectedInvoice.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border },
                      ]}
                    >
                      <View style={styles.invoiceItemInfo}>
                        <Text style={[styles.invoiceItemDesc, { color: colors.text }]}>{item.description}</Text>
                        <Text style={[styles.invoiceItemQty, { color: colors.textMuted }]}>
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </Text>
                      </View>
                      <Text style={[styles.invoiceItemTotal, { color: colors.text }]}>{formatCurrency(item.total)}</Text>
                    </View>
                  ))}
                </View>

                {/* Totals */}
                <View style={[styles.invoiceTotals, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
                  <View style={styles.invoiceTotalRow}>
                    <Text style={[styles.invoiceTotalLabel, { color: colors.textSecondary }]}>Ara Toplam</Text>
                    <Text style={[styles.invoiceTotalValue, { color: colors.text }]}>{formatCurrency(selectedInvoice.amount)}</Text>
                  </View>
                  <View style={styles.invoiceTotalRow}>
                    <Text style={[styles.invoiceTotalLabel, { color: colors.textSecondary }]}>KDV (%18)</Text>
                    <Text style={[styles.invoiceTotalValue, { color: colors.text }]}>{formatCurrency(selectedInvoice.tax)}</Text>
                  </View>
                  <View style={[styles.invoiceTotalRow, styles.invoiceGrandTotal, { borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}>
                    <Text style={[styles.invoiceGrandTotalLabel, { color: colors.text }]}>Toplam</Text>
                    <Text style={[styles.invoiceGrandTotalValue, { color: accentColor }]}>{formatCurrency(selectedInvoice.totalAmount)}</Text>
                  </View>
                </View>

                {/* Dates */}
                <View style={[styles.invoiceDates, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
                  <View style={styles.invoiceDateRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.invoiceDateLabel, { color: colors.textSecondary }]}>Düzenleme:</Text>
                    <Text style={[styles.invoiceDateValue, { color: colors.text }]}>{selectedInvoice.issueDate}</Text>
                  </View>
                  <View style={styles.invoiceDateRow}>
                    <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.invoiceDateLabel, { color: colors.textSecondary }]}>Vade:</Text>
                    <Text style={[styles.invoiceDateValue, { color: colors.text }]}>{selectedInvoice.dueDate}</Text>
                  </View>
                </View>

                {selectedInvoice.notes && (
                  <View style={[styles.invoiceNotes, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
                    <Text style={[styles.invoiceNotesTitle, { color: colors.textMuted }]}>Notlar</Text>
                    <Text style={[styles.invoiceNotesText, { color: colors.textSecondary }]}>{selectedInvoice.notes}</Text>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.invoiceActions}>
                  <TouchableOpacity style={[styles.invoiceActionBtn, { backgroundColor: accentBg, borderColor: accentColor }]}>
                    <Ionicons name="download-outline" size={18} color={accentColor} />
                    <Text style={[styles.invoiceActionText, { color: accentColor }]}>PDF İndir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.invoiceActionBtn, { backgroundColor: accentBg, borderColor: accentColor }]}>
                    <Ionicons name="share-outline" size={18} color={accentColor} />
                    <Text style={[styles.invoiceActionText, { color: accentColor }]}>Paylaş</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

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

  // Tabs
  tabsContainer: {
    marginBottom: 16,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Section
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  // Empty State
  emptyCard: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Main Stats Card
  mainStatsCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  mainStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainStatValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  growthText: {
    fontSize: 13,
    fontWeight: '600',
  },
  mainStatDivider: {
    height: 1,
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statItemLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  statItemDivider: {
    width: 1,
    height: 30,
  },

  // Chart
  chartCard: {
    borderRadius: 16,
    padding: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 12,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 8,
    overflow: 'hidden',
  },
  chartLabel: {
    fontSize: 10,
    marginTop: 8,
  },
  chartLegend: {
    marginTop: 16,
    alignItems: 'center',
  },
  chartLegendText: {
    fontSize: 12,
  },

  // Alert
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertText: {
    fontSize: 12,
    marginTop: 2,
  },

  // Service
  serviceCard: {
    borderRadius: 16,
    padding: 4,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  serviceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  serviceProgressBg: {
    height: 4,
    borderRadius: 2,
  },
  serviceProgress: {
    height: '100%',
    borderRadius: 2,
  },
  serviceValue: {
    alignItems: 'flex-end',
  },
  serviceAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  servicePercent: {
    fontSize: 11,
    marginTop: 2,
  },

  // Clients
  clientsScroll: {
    gap: 12,
  },
  clientCard: {
    width: 120,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  clientLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 10,
  },
  clientName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  clientRevenue: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  clientJobs: {
    fontSize: 11,
  },

  // Expenses
  expenseCard: {
    borderRadius: 16,
    padding: 16,
  },
  expenseChart: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  expenseSegment: {
    height: '100%',
  },
  expenseLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  expenseLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expenseLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  expenseLegendText: {
    fontSize: 11,
  },
  expenseTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  expenseTotalLabel: {
    fontSize: 12,
  },
  expenseTotalValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Transactions
  transactionsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  transactionEvent: {
    fontSize: 11,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  transactionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  transactionStatusText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Invoices
  invoiceStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  invoiceStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  invoiceStatValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  invoiceStatLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  invoicesCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  invoiceLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  invoiceContent: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 10,
    marginBottom: 2,
  },
  invoiceEvent: {
    fontSize: 14,
    fontWeight: '500',
  },
  invoiceOrganizer: {
    fontSize: 12,
    marginTop: 2,
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  invoiceStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  invoiceStatusText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalScroll: {
    padding: 20,
  },

  // Invoice Detail
  invoiceDetailHeader: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  invoiceDetailLogo: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  invoiceDetailInfo: {
    flex: 1,
  },
  invoiceDetailEvent: {
    fontSize: 16,
    fontWeight: '600',
  },
  invoiceDetailOrganizer: {
    fontSize: 13,
    marginTop: 4,
  },
  invoiceDetailDate: {
    fontSize: 12,
    marginTop: 4,
  },
  invoiceDetailStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  invoiceDetailStatusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  invoiceItems: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  invoiceItemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  invoiceItemInfo: {
    flex: 1,
  },
  invoiceItemDesc: {
    fontSize: 13,
    fontWeight: '500',
  },
  invoiceItemQty: {
    fontSize: 11,
    marginTop: 2,
  },
  invoiceItemTotal: {
    fontSize: 13,
    fontWeight: '600',
  },
  invoiceTotals: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  invoiceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  invoiceTotalLabel: {
    fontSize: 13,
  },
  invoiceTotalValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  invoiceGrandTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  invoiceGrandTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  invoiceGrandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  invoiceDates: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  invoiceDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  invoiceDateLabel: {
    fontSize: 12,
  },
  invoiceDateValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  invoiceNotes: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  invoiceNotesTitle: {
    fontSize: 11,
    marginBottom: 6,
  },
  invoiceNotesText: {
    fontSize: 13,
  },
  invoiceActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  invoiceActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  invoiceActionText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Client Detail Modal
  clientDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  clientDetailLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  clientDetailInfo: {
    flex: 1,
  },
  clientDetailName: {
    fontSize: 18,
    fontWeight: '600',
  },
  clientDetailJobs: {
    fontSize: 13,
    marginTop: 4,
  },
  clientStatsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  clientStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  clientStatLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  clientStatValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  clientStatDivider: {
    width: 1,
    height: '100%',
  },
  clientLastJob: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  clientLastJobTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  clientLastJobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clientLastJobText: {
    fontSize: 13,
  },
  clientActions: {
    flexDirection: 'row',
    gap: 10,
  },
  clientActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  clientActionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
