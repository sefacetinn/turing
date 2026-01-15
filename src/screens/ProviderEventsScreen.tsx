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
import { gradients, darkTheme as defaultColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../../App';
import {
  TabType,
  ProviderEvent,
  providerEvents,
  getServiceTypeInfo,
  getStatusInfo,
  getPaymentInfo,
  calculateStats,
} from '../data/providerEventsData';

const colors = defaultColors;

export function ProviderEventsScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { providerServices } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Filter events by provider's service types
  const serviceFilteredEvents = useMemo(() => {
    if (!providerServices || providerServices.length === 0) {
      return providerEvents;
    }
    // Map service categories to provider service IDs
    const serviceTypeMap: Record<string, string[]> = {
      'booking': ['booking'],
      'technical': ['sound-light', 'technical'],
      'sound-light': ['technical', 'sound-light'],
      'venue': ['venue'],
      'accommodation': ['accommodation'],
      'transport': ['transport'],
      'flight': ['flight'],
      'security': ['security'],
      'catering': ['catering'],
      'generator': ['generator'],
      'beverage': ['beverage'],
      'medical': ['medical'],
      'sanitation': ['sanitation'],
      'media': ['media'],
      'barrier': ['barrier'],
      'tent': ['tent'],
      'ticketing': ['ticketing'],
      'decoration': ['decoration'],
    };

    return providerEvents.filter(event => {
      // Check if event's serviceType matches any of provider's services
      const mappedTypes = serviceTypeMap[event.serviceType] || [event.serviceType];
      return providerServices.some(ps =>
        mappedTypes.includes(ps) || ps === event.serviceType
      );
    });
  }, [providerServices]);

  const filteredEvents = useMemo(() => {
    let filtered = serviceFilteredEvents;

    if (activeTab === 'active') {
      filtered = filtered.filter(e => ['active', 'planned'].includes(e.status));
    } else if (activeTab === 'past') {
      filtered = filtered.filter(e => e.status === 'past');
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.eventTitle.toLowerCase().includes(query) ||
        e.venue.toLowerCase().includes(query) ||
        e.organizerName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeTab, searchQuery, serviceFilteredEvents]);

  const stats = useMemo(() => calculateStats(serviceFilteredEvents), [serviceFilteredEvents]);

  // Generate card title as "Artist/Event Name - City"
  const getCardTitle = (event: ProviderEvent) => {
    // Extract city from location (e.g., "İstanbul, Maçka" -> "İstanbul")
    const city = event.location.split(',')[0].trim();

    // Try to extract artist name if it's a concert (contains "Konseri - " or similar)
    if (event.eventTitle.includes(' - ')) {
      const parts = event.eventTitle.split(' - ');
      // If it's like "Vodafone Park Konseri - Tarkan", use the artist name
      if (parts.length === 2 && !parts[1].includes('20')) {
        return `${parts[1]} - ${city}`;
      }
      // If it's like "Düğün - Zeynep & Emre", use the names
      return `${parts[1]} - ${city}`;
    }

    // For festivals and other events, use a shortened title
    const shortTitle = event.eventTitle.split(' ').slice(0, 2).join(' ');
    return `${shortTitle} - ${city}`;
  };

  const renderEventCard = (event: ProviderEvent) => {
    const statusInfo = getStatusInfo(event.status, colors);
    const paymentInfo = getPaymentInfo(event.paymentStatus, colors);
    const serviceInfo = getServiceTypeInfo(event.serviceType);
    const taskProgress = (event.tasks.completed / event.tasks.total) * 100;

    return (
      <TouchableOpacity
        key={event.id}
        style={[styles.eventCard, {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border
        }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProviderEventDetail', { eventId: event.id })}
      >
        <View style={styles.eventImageContainer}>
          <Image source={{ uri: event.eventImage }} style={styles.eventImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.85)']}
            style={styles.eventImageGradient}
            locations={[0, 0.4, 1]}
          />

          <View style={styles.topLeftInfo}>
            <View style={styles.serviceTypeRow}>
              <LinearGradient
                colors={serviceInfo.gradient}
                style={styles.serviceIconBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={serviceInfo.icon as any} size={12} color="white" />
              </LinearGradient>
              <Text style={styles.serviceLabelText}>{event.serviceLabel}</Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={11} color="rgba(255,255,255,0.9)" />
              <Text style={styles.locationText}>{event.location}</Text>
            </View>
          </View>

          <View style={styles.topRightInfo}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '30' }]}>
              <Ionicons name={statusInfo.icon} size={11} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
            {event.daysUntil > 0 && (
              <View style={styles.daysUntilBadge}>
                <Ionicons name="time" size={11} color={colors.brand[400]} />
                <Text style={[styles.daysUntilText, { color: colors.brand[400] }]}>{event.daysUntil} gün</Text>
              </View>
            )}
          </View>

          <View style={styles.eventImageContent}>
            <Text style={styles.eventImageTitle} numberOfLines={1}>{getCardTitle(event)}</Text>
            <Text style={styles.eventVenueText}>{event.venue}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.organizerInfo}>
              <Image source={{ uri: event.organizerImage }} style={styles.organizerImage} />
              <View>
                <Text style={[styles.organizerName, { color: colors.text }]}>{event.organizerName}</Text>
                <View style={styles.eventDateRow}>
                  <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                  <Text style={[styles.eventDateText, { color: colors.textMuted }]}>{event.eventDate}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.paymentStatusBadge, { backgroundColor: `${paymentInfo.color}15` }]}>
              <Text style={[styles.paymentStatusText, { color: paymentInfo.color }]}>
                {paymentInfo.label}
              </Text>
            </View>
          </View>

          <View style={styles.earningsRow}>
            <View style={styles.earningItem}>
              <Text style={[styles.earningLabel, { color: colors.textMuted }]}>Kazanç</Text>
              <Text style={[styles.earningValue, { color: colors.text }]}>₺{event.earnings.toLocaleString('tr-TR')}</Text>
            </View>
            <View style={styles.earningDivider} />
            <View style={styles.earningItem}>
              <Text style={[styles.earningLabel, { color: colors.textMuted }]}>Ödenen</Text>
              <Text style={[styles.earningValue, { color: colors.success }]}>
                ₺{event.paidAmount.toLocaleString('tr-TR')}
              </Text>
            </View>
            <View style={styles.earningDivider} />
            <View style={styles.earningItem}>
              <Text style={[styles.earningLabel, { color: colors.textMuted }]}>Kalan</Text>
              <Text style={[styles.earningValue, { color: colors.warning }]}>
                ₺{(event.earnings - event.paidAmount).toLocaleString('tr-TR')}
              </Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.textMuted }]}>Görev İlerlemesi</Text>
              <Text style={[styles.progressPercent, { color: colors.brand[400] }]}>{Math.round(taskProgress)}%</Text>
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
                <Ionicons name="checkbox-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.progressText, { color: colors.textMuted }]}>
                  {event.tasks.completed}/{event.tasks.total} tamamlandı
                </Text>
              </View>
              <View style={styles.teamInfo}>
                <Ionicons name="people-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.teamText, { color: colors.textMuted }]}>{event.teamSize} kişi</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>İşlerim</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {stats.activeCount} aktif iş
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.calendarButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}
          onPress={() => navigation.navigate('CalendarView')}
        >
          <Ionicons name="calendar" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.earningsSummary, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
        <View style={styles.summaryRow}>
          <View style={styles.earningsMain}>
            <Text style={[styles.earningsMainValue, { color: colors.text }]}>₺{stats.totalEarnings.toLocaleString('tr-TR')}</Text>
            <Text style={[styles.earningsMainLabel, { color: colors.textMuted }]}>toplam kazanç</Text>
          </View>
          <View style={styles.earningsDetails}>
            <View style={styles.earningsDetailItem}>
              <View style={[styles.earningsIndicator, { backgroundColor: colors.success }]} />
              <Text style={[styles.earningsDetailValue, { color: colors.text }]}>₺{(stats.paidEarnings / 1000).toFixed(0)}K</Text>
              <Text style={[styles.earningsDetailLabel, { color: colors.textMuted }]}>ödendi</Text>
            </View>
            <View style={styles.earningsDetailItem}>
              <View style={[styles.earningsIndicator, { backgroundColor: colors.warning }]} />
              <Text style={[styles.earningsDetailValue, { color: colors.text }]}>₺{(stats.pendingEarnings / 1000).toFixed(0)}K</Text>
              <Text style={[styles.earningsDetailLabel, { color: colors.textMuted }]}>bekliyor</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="İş ara..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.tabContainer, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
        {[
          { key: 'active', label: 'Aktif', count: stats.activeCount },
          { key: 'past', label: 'Geçmiş', count: stats.pastCount },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? colors.brand[400] : colors.textMuted }]}>
              {tab.label} ({tab.count})
            </Text>
            {activeTab === tab.key && <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />}
          </TouchableOpacity>
        ))}
      </View>

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
            <Ionicons name="briefcase-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>İş Bulunamadı</Text>
            <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
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
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  calendarButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  earningsSummary: { paddingHorizontal: 20, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  earningsMain: { flex: 1 },
  earningsMainValue: { fontSize: 22, fontWeight: '700' },
  earningsMainLabel: { fontSize: 11, marginTop: 2 },
  earningsDetails: { flexDirection: 'row', gap: 16 },
  earningsDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  earningsIndicator: { width: 6, height: 6, borderRadius: 3 },
  earningsDetailValue: { fontSize: 13, fontWeight: '600' },
  earningsDetailLabel: { fontSize: 11 },
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', gap: 10 },
  searchInput: { flex: 1, fontSize: 15 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, borderBottomWidth: 1, gap: 8 },
  tab: { paddingVertical: 12, paddingHorizontal: 12, position: 'relative' },
  tabText: { fontSize: 14, fontWeight: '500' },
  tabIndicator: { position: 'absolute', bottom: -1, left: 12, right: 12, height: 2, borderRadius: 1 },
  tabBadgeActive: { backgroundColor: 'rgba(147, 51, 234, 0.3)' },
  tabBadgeText: { fontSize: 10, fontWeight: '600' },
  eventsList: { flex: 1 },
  eventsListContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  eventCard: { backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.04)', overflow: 'hidden' },
  eventImageContainer: { height: 130, position: 'relative' },
  eventImage: { width: '100%', height: '100%' },
  eventImageGradient: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  topLeftInfo: { position: 'absolute', top: 10, left: 10, gap: 6 },
  serviceTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  serviceIconBadge: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  serviceLabelText: { fontSize: 13, fontWeight: '700', color: 'white', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 2 },
  locationText: { fontSize: 11, fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)' },
  topRightInfo: { position: 'absolute', top: 10, right: 10, alignItems: 'flex-end', gap: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  statusText: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  daysUntilBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  daysUntilText: { fontSize: 10, fontWeight: '600' },
  eventImageContent: { position: 'absolute', bottom: 10, left: 12, right: 12 },
  eventImageTitle: { fontSize: 16, fontWeight: '700', color: 'white' },
  eventVenueText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', marginTop: 3 },
  cardContent: { padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  organizerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  organizerImage: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  organizerName: { fontSize: 13, fontWeight: '600' },
  eventDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  eventDateText: { fontSize: 11 },
  paymentStatusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  paymentStatusText: { fontSize: 10, fontWeight: '600' },
  earningsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 12, padding: 12, marginBottom: 12 },
  earningItem: { flex: 1, alignItems: 'center' },
  earningLabel: { fontSize: 9, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.3 },
  earningValue: { fontSize: 13, fontWeight: '700' },
  earningDivider: { width: 1, height: 30, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  progressSection: { marginBottom: 4 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 11 },
  progressPercent: { fontSize: 12, fontWeight: '600' },
  progressBar: { height: 5, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  progressText: { fontSize: 10 },
  teamInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  teamText: { fontSize: 10 },
  arrowContainer: { position: 'absolute', right: 14, top: 145 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 14, textAlign: 'center' },
});
