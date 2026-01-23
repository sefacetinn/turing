import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useUserContracts, type UserContract } from '../hooks';
import { useAuth } from '../context/AuthContext';

const colors = defaultColors;

type TabType = 'pending' | 'signed' | 'all';

interface ContractsListScreenProps {
  isProviderMode?: boolean;
}

const getCategoryColor = (category: string) => {
  const categoryColors: Record<string, string> = {
    technical: '#3b82f6',
    booking: '#ec4899',
    venue: '#10b981',
    transport: '#f59e0b',
    operation: '#8b5cf6',
  };
  return categoryColors[category] || colors.brand[400];
};

export function ContractsListScreen({ isProviderMode = true }: ContractsListScreenProps) {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch contracts from Firebase
  const { contracts, stats, loading, error } = useUserContracts(user?.uid);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // The hook will automatically refetch when we trigger a refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredContracts = useMemo(() => {
    if (activeTab === 'pending') {
      return contracts.filter(c => c.status === 'pending_signature');
    }
    if (activeTab === 'signed') {
      return contracts.filter(c => c.status === 'signed' || c.status === 'completed');
    }
    return contracts;
  }, [activeTab, contracts]);

  const getStatusInfo = (contract: UserContract) => {
    if (contract.status === 'pending_signature') {
      if (contract.needsMySignature) {
        return { label: 'İmzanız Bekleniyor', color: colors.warning, icon: 'create-outline' as const };
      }
      return { label: 'Karşı Taraf İmzası Bekleniyor', color: colors.brand[400], icon: 'hourglass-outline' as const };
    }
    if (contract.status === 'signed') {
      return { label: 'İmzalandı', color: colors.success, icon: 'checkmark-circle' as const };
    }
    if (contract.status === 'completed') {
      return { label: 'Tamamlandı', color: colors.success, icon: 'checkmark-done-circle' as const };
    }
    return { label: 'İptal', color: colors.error, icon: 'close-circle' as const };
  };

  const renderContractCard = (contract: UserContract) => {
    const statusInfo = getStatusInfo(contract);
    const categoryColor = getCategoryColor(contract.serviceCategory);
    const contractDate = contract.createdAt instanceof Date
      ? contract.createdAt.toLocaleDateString('tr-TR')
      : new Date(contract.createdAt).toLocaleDateString('tr-TR');

    return (
      <TouchableOpacity
        key={contract.id}
        style={[
          styles.contractCard,
          { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground },
          ...(isDark ? [] : [helpers.getShadow('sm')]),
          contract.needsMySignature && styles.contractCardUrgent
        ]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Contract', {
          contractId: contract.id,
          offerId: contract.offerId,
          eventId: contract.eventId,
        })}
      >
        {/* Category Top Bar */}
        <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />

        {/* Urgent Banner */}
        {contract.needsMySignature && (
          <View style={styles.urgentBanner}>
            <Ionicons name="alert-circle" size={14} color={colors.warning} />
            <Text style={[styles.urgentBannerText, { color: colors.warning }]}>İmzanız Gerekli</Text>
          </View>
        )}

        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={[styles.contractId, { color: colors.textSecondary }]}>#{contract.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={[styles.contractDate, { color: colors.textMuted }]}>{contractDate}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}15` }]}>
            <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Event Info */}
        <Text style={[styles.eventName, { color: colors.text }]}>{contract.eventName}</Text>
        <View style={styles.serviceBadge}>
          <View style={[styles.serviceDot, { backgroundColor: categoryColor }]} />
          <Text style={[styles.serviceName, { color: colors.textSecondary }]}>{contract.serviceName}</Text>
        </View>

        {/* Other Party */}
        <View style={styles.otherPartyRow}>
          <Ionicons name="person-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.otherPartyText, { color: colors.textMuted }]}>{contract.otherPartyName}</Text>
        </View>

        {/* Footer */}
        <View style={[styles.cardFooter, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
          <View style={styles.footerLeft}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.eventDateText, { color: colors.textMuted }]}>Etkinlik: {contract.eventDate}</Text>
          </View>
          <Text style={[styles.amountText, { color: colors.success }]}>₺{contract.amount.toLocaleString('tr-TR')}</Text>
        </View>

        {/* Action Button for urgent */}
        {contract.needsMySignature && (
          <TouchableOpacity
            style={styles.signNowButton}
            onPress={() => navigation.navigate('Contract', {
              contractId: contract.id,
              offerId: contract.offerId,
              eventId: contract.eventId,
            })}
          >
            <LinearGradient
              colors={gradients.primary}
              style={styles.signNowGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="finger-print" size={16} color="white" />
              <Text style={styles.signNowText}>Şimdi İmzala</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sözleşmelerim</Text>
        <TouchableOpacity style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surface }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsSection}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="document-text-outline" size={18} color={colors.warning} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.pending}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Bekleyen</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="create-outline" size={18} color={colors.error} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.needsSignature}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>İmza Bekliyor</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.signed}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>İmzalı</Text>
            </View>
          </View>
        </View>

        {/* Total Value */}
        <View style={styles.totalValueSection}>
          <Text style={[styles.totalValueLabel, { color: colors.textMuted }]}>Toplam Sözleşme Değeri</Text>
          <Text style={[styles.totalValueAmount, { color: colors.success }]}>₺{stats.totalValue.toLocaleString('tr-TR')}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Ionicons
            name={activeTab === 'pending' ? 'time' : 'time-outline'}
            size={16}
            color={activeTab === 'pending' ? colors.warning : colors.textMuted}
          />
          <Text style={[styles.tabText, { color: activeTab === 'pending' ? colors.warning : colors.textMuted }]}>
            Bekleyen
          </Text>
          <View style={[styles.tabBadge, activeTab === 'pending' && styles.tabBadgePending]}>
            <Text style={[styles.tabBadgeText, { color: activeTab === 'pending' ? colors.warning : colors.textMuted }]}>
              {stats.pending}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'signed' && styles.tabActive]}
          onPress={() => setActiveTab('signed')}
        >
          <Ionicons
            name={activeTab === 'signed' ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={16}
            color={activeTab === 'signed' ? colors.success : colors.textMuted}
          />
          <Text style={[styles.tabText, { color: activeTab === 'signed' ? colors.success : colors.textMuted }]}>
            İmzalı
          </Text>
          <View style={[styles.tabBadge, activeTab === 'signed' && styles.tabBadgeSigned]}>
            <Text style={[styles.tabBadgeText, { color: activeTab === 'signed' ? colors.success : colors.textMuted }]}>
              {stats.signed}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Ionicons
            name={activeTab === 'all' ? 'documents' : 'documents-outline'}
            size={16}
            color={activeTab === 'all' ? colors.brand[400] : colors.textMuted}
          />
          <Text style={[styles.tabText, { color: activeTab === 'all' ? colors.brand[400] : colors.textMuted }]}>
            Tümü
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contracts List */}
      <ScrollView
        style={styles.contractsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contractsListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[400]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.brand[400]} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Sözleşmeler yükleniyor...</Text>
          </View>
        ) : filteredContracts.length > 0 ? (
          filteredContracts.map(renderContractCard)
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Sözleşme Bulunamadı</Text>
            <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
              {activeTab === 'pending'
                ? 'Bekleyen sözleşmeniz bulunmuyor.'
                : activeTab === 'signed'
                ? 'İmzalanmış sözleşmeniz bulunmuyor.'
                : 'Henüz sözleşmeniz bulunmuyor. Teklifler kabul edildiğinde burada görünecektir.'}
            </Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: 8,
  },
  totalValueSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  totalValueLabel: {
    fontSize: 12,
  },
  totalValueAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabTextPending: {},
  tabTextSigned: {},
  tabTextAll: {},
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabBadgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  tabBadgeSigned: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabBadgeTextPending: {},
  tabBadgeTextSigned: {},
  contractsList: {
    flex: 1,
  },
  contractsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
  },
  contractCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
  },
  contractCardUrgent: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.03)',
  },
  categoryBar: {
    height: 4,
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  urgentBannerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  cardHeaderLeft: {
    gap: 2,
  },
  contractId: {
    fontSize: 12,
    fontWeight: '600',
  },
  contractDate: {
    fontSize: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  serviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serviceName: {
    fontSize: 13,
  },
  otherPartyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  otherPartyText: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDateText: {
    fontSize: 11,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  signNowButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  signNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  signNowText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
