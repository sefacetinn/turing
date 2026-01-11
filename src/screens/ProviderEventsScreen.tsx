import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';

type TabType = 'upcoming' | 'active' | 'completed' | 'all';

interface ProviderEvent {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  location: string;
  organizerName: string;
  organizerImage: string;
  eventImage: string;
  role: string;
  category: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  earnings: number;
  paidAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  daysUntil: number;
  teamSize: number;
  tasks: { total: number; completed: number };
}

// Mock provider events data
const providerEvents: ProviderEvent[] = [
  {
    id: 'pe1',
    eventTitle: 'Yaz Festivali 2024',
    eventDate: '15-17 Temmuz 2024',
    eventTime: '16:00 - 04:00',
    venue: 'KüsümPark Açık Hava',
    location: 'İstanbul, Kadıköy',
    organizerName: 'Event Masters',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    eventImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    role: 'Ses Sistemi Sağlayıcı',
    category: 'technical',
    status: 'confirmed',
    earnings: 85000,
    paidAmount: 42500,
    paymentStatus: 'partial',
    daysUntil: 15,
    teamSize: 8,
    tasks: { total: 12, completed: 7 },
  },
  {
    id: 'pe2',
    eventTitle: 'Kurumsal Gala Gecesi',
    eventDate: '22 Ağustos 2024',
    eventTime: '19:00 - 01:00',
    venue: 'JW Marriott Ballroom',
    location: 'Ankara, Çankaya',
    organizerName: 'XYZ Holding',
    organizerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    eventImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    role: 'Işık & Ses Operatörü',
    category: 'technical',
    status: 'pending',
    earnings: 55000,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    daysUntil: 45,
    teamSize: 4,
    tasks: { total: 8, completed: 2 },
  },
  {
    id: 'pe3',
    eventTitle: 'Düğün - Ayşe & Mehmet',
    eventDate: '1 Eylül 2024',
    eventTime: '18:00 - 02:00',
    venue: 'Çırağan Palace',
    location: 'İstanbul, Beşiktaş',
    organizerName: 'Ayşe Yılmaz',
    organizerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    eventImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    role: 'DJ Set',
    category: 'booking',
    status: 'confirmed',
    earnings: 25000,
    paidAmount: 25000,
    paymentStatus: 'paid',
    daysUntil: 55,
    teamSize: 2,
    tasks: { total: 6, completed: 6 },
  },
  {
    id: 'pe4',
    eventTitle: 'Tech Conference 2024',
    eventDate: '10-11 Ekim 2024',
    eventTime: '09:00 - 18:00',
    venue: 'Haliç Kongre Merkezi',
    location: 'İstanbul, Beyoğlu',
    organizerName: 'TechTR',
    organizerImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
    eventImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
    role: 'Sahne Kurulum',
    category: 'technical',
    status: 'pending',
    earnings: 45000,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    daysUntil: 90,
    teamSize: 6,
    tasks: { total: 10, completed: 0 },
  },
];

// Get category color
const getCategoryGradient = (category: string): readonly [string, string, ...string[]] => {
  const categoryColors: Record<string, readonly [string, string]> = {
    booking: gradients.booking,
    technical: gradients.technical,
    venue: gradients.venue,
    accommodation: gradients.accommodation,
    transport: gradients.transport,
    flight: gradients.flight,
    operation: gradients.operation,
  };
  return categoryColors[category] || gradients.primary;
};

// Get status info
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'confirmed':
      return { label: 'Onaylandı', color: colors.success, icon: 'checkmark-circle' as const };
    case 'pending':
      return { label: 'Beklemede', color: colors.warning, icon: 'time' as const };
    case 'in_progress':
      return { label: 'Devam Ediyor', color: colors.brand[400], icon: 'play-circle' as const };
    case 'completed':
      return { label: 'Tamamlandı', color: colors.info, icon: 'checkbox' as const };
    case 'cancelled':
      return { label: 'İptal', color: colors.error, icon: 'close-circle' as const };
    default:
      return { label: status, color: colors.zinc[500], icon: 'help-circle' as const };
  }
};

// Get payment status info
const getPaymentInfo = (status: string) => {
  switch (status) {
    case 'paid':
      return { label: 'Ödendi', color: colors.success };
    case 'partial':
      return { label: 'Kısmi Ödeme', color: colors.warning };
    case 'unpaid':
      return { label: 'Ödenmedi', color: colors.zinc[500] };
    default:
      return { label: status, color: colors.zinc[500] };
  }
};

export function ProviderEventsScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = providerEvents;

    // Tab filter
    switch (activeTab) {
      case 'upcoming':
        filtered = filtered.filter(e => ['pending', 'confirmed'].includes(e.status) && e.daysUntil > 0);
        break;
      case 'active':
        filtered = filtered.filter(e => e.status === 'in_progress');
        break;
      case 'completed':
        filtered = filtered.filter(e => e.status === 'completed');
        break;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.eventTitle.toLowerCase().includes(query) ||
        e.venue.toLowerCase().includes(query) ||
        e.organizerName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeTab, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const totalEarnings = providerEvents.reduce((sum, e) => sum + e.earnings, 0);
    const paidEarnings = providerEvents.reduce((sum, e) => sum + e.paidAmount, 0);
    const pendingEarnings = totalEarnings - paidEarnings;
    const upcomingEvents = providerEvents.filter(e => ['pending', 'confirmed'].includes(e.status)).length;
    return {
      totalEarnings,
      paidEarnings,
      pendingEarnings,
      upcomingEvents,
      totalEvents: providerEvents.length,
    };
  }, []);

  const renderEventCard = (event: ProviderEvent) => {
    const statusInfo = getStatusInfo(event.status);
    const paymentInfo = getPaymentInfo(event.paymentStatus);
    const taskProgress = (event.tasks.completed / event.tasks.total) * 100;

    return (
      <TouchableOpacity
        key={event.id}
        style={styles.eventCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProviderEventDetail', { eventId: event.id })}
      >
        {/* Event Image Header */}
        <View style={styles.eventImageContainer}>
          <Image source={{ uri: event.eventImage }} style={styles.eventImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.eventImageGradient}
          />

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Ionicons name={statusInfo.icon} size={11} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>

          {/* Days Until Badge */}
          {event.daysUntil > 0 && (
            <View style={styles.daysUntilBadge}>
              <Ionicons name="time" size={11} color={colors.brand[400]} />
              <Text style={styles.daysUntilText}>{event.daysUntil} gün</Text>
            </View>
          )}

          {/* Role Badge */}
          <View style={styles.roleBadgeContainer}>
            <LinearGradient
              colors={getCategoryGradient(event.category)}
              style={styles.roleBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.roleBadgeText}>{event.role}</Text>
            </LinearGradient>
          </View>

          {/* Event Title on Image */}
          <View style={styles.eventImageContent}>
            <Text style={styles.eventImageTitle} numberOfLines={1}>{event.eventTitle}</Text>
            <View style={styles.eventImageMeta}>
              <Ionicons name="location" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.eventImageMetaText}>{event.venue}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContent}>
          {/* Organizer Info */}
          <View style={styles.cardHeader}>
            <View style={styles.organizerInfo}>
              <Image source={{ uri: event.organizerImage }} style={styles.organizerImage} />
              <View>
                <Text style={styles.organizerName}>{event.organizerName}</Text>
                <View style={styles.eventDateRow}>
                  <Ionicons name="calendar-outline" size={12} color={colors.zinc[500]} />
                  <Text style={styles.eventDateText}>{event.eventDate}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.paymentStatusBadge, { backgroundColor: `${paymentInfo.color}15` }]}>
              <Text style={[styles.paymentStatusText, { color: paymentInfo.color }]}>
                {paymentInfo.label}
              </Text>
            </View>
          </View>

          {/* Earnings Row */}
          <View style={styles.earningsRow}>
            <View style={styles.earningItem}>
              <Text style={styles.earningLabel}>Kazanç</Text>
              <Text style={styles.earningValue}>₺{event.earnings.toLocaleString('tr-TR')}</Text>
            </View>
            <View style={styles.earningDivider} />
            <View style={styles.earningItem}>
              <Text style={styles.earningLabel}>Ödenen</Text>
              <Text style={[styles.earningValue, { color: colors.success }]}>
                ₺{event.paidAmount.toLocaleString('tr-TR')}
              </Text>
            </View>
            <View style={styles.earningDivider} />
            <View style={styles.earningItem}>
              <Text style={styles.earningLabel}>Kalan</Text>
              <Text style={[styles.earningValue, { color: colors.warning }]}>
                ₺{(event.earnings - event.paidAmount).toLocaleString('tr-TR')}
              </Text>
            </View>
          </View>

          {/* Progress Row */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Görev İlerlemesi</Text>
              <Text style={styles.progressPercent}>{Math.round(taskProgress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={gradients.primary}
                style={[styles.progressFill, { width: `${taskProgress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <View style={styles.progressFooter}>
              <View style={styles.progressInfo}>
                <Ionicons name="checkbox-outline" size={12} color={colors.zinc[500]} />
                <Text style={styles.progressText}>
                  {event.tasks.completed}/{event.tasks.total} tamamlandı
                </Text>
              </View>
              <View style={styles.teamInfo}>
                <Ionicons name="people-outline" size={12} color={colors.zinc[500]} />
                <Text style={styles.teamText}>{event.teamSize} kişi</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color={colors.zinc[500]} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>İşlerim</Text>
          <Text style={styles.headerSubtitle}>
            {stats.upcomingEvents} yaklaşan iş
          </Text>
        </View>
        <TouchableOpacity style={styles.calendarButton}>
          <Ionicons name="calendar" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Earnings Summary Card */}
      <View style={styles.earningsSummary}>
        <LinearGradient
          colors={gradients.primary}
          style={styles.earningsSummaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.earningsSummaryContent}>
            <View style={styles.earningsSummaryItem}>
              <Text style={styles.earningsSummaryLabel}>Toplam Kazanç</Text>
              <Text style={styles.earningsSummaryValue}>
                ₺{stats.totalEarnings.toLocaleString('tr-TR')}
              </Text>
            </View>
            <View style={styles.earningsSummaryDivider} />
            <View style={styles.earningsSummaryItem}>
              <Text style={styles.earningsSummaryLabel}>Ödenen</Text>
              <Text style={styles.earningsSummaryValue}>
                ₺{stats.paidEarnings.toLocaleString('tr-TR')}
              </Text>
            </View>
            <View style={styles.earningsSummaryDivider} />
            <View style={styles.earningsSummaryItem}>
              <Text style={styles.earningsSummaryLabel}>Bekleyen</Text>
              <Text style={styles.earningsSummaryValue}>
                ₺{stats.pendingEarnings.toLocaleString('tr-TR')}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.zinc[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="İş ara..."
            placeholderTextColor={colors.zinc[500]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.zinc[500]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Yaklaşan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Devam Eden
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Tamamlanan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Tümü
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Events List */}
      <ScrollView
        style={styles.eventsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[400]}
            colors={[colors.brand[400]]}
          />
        }
      >
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => renderEventCard(event))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={48} color={colors.zinc[600]} />
            <Text style={styles.emptyStateTitle}>İş Bulunamadı</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'Arama kriterlerinize uygun iş yok.'
                : 'Bu kategoride henüz iş yok.'}
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.zinc[500],
    marginTop: 2,
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  earningsSummary: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  earningsSummaryGradient: {
    borderRadius: 16,
    padding: 16,
  },
  earningsSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningsSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningsSummaryLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  earningsSummaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  earningsSummaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 6,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.zinc[400],
  },
  tabTextActive: {
    color: colors.brand[400],
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
  },
  eventImageContainer: {
    height: 130,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  daysUntilBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  daysUntilText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.brand[400],
  },
  roleBadgeContainer: {
    position: 'absolute',
    bottom: 44,
    left: 12,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  eventImageContent: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
  },
  eventImageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  eventImageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  eventImageMetaText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  organizerImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  organizerName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  eventDateText: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  earningItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningLabel: {
    fontSize: 9,
    color: colors.zinc[500],
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  earningValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  earningDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressSection: {
    marginBottom: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand[400],
  },
  progressBar: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontSize: 10,
    color: colors.zinc[500],
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamText: {
    fontSize: 10,
    color: colors.zinc[500],
  },
  arrowContainer: {
    position: 'absolute',
    right: 14,
    top: 145,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.zinc[500],
    textAlign: 'center',
  },
});
