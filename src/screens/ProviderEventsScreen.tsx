import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { ScrollHeader, LargeTitle } from '../components/navigation';
import { OptimizedImage } from '../components/OptimizedImage';
import { EmptyState } from '../components/EmptyState';
import { SkeletonEventList, SkeletonStats } from '../components/Skeleton';
import { gradients, darkTheme as defaultColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../../App';
import { useAuth } from '../context/AuthContext';
import { useProviderJobs } from '../hooks';
import {
  TabType,
  ProviderEvent,
  getServiceTypeInfo,
  getStatusInfo,
  getPaymentInfo,
  calculateStats,
} from '../data/providerEventsData';
import { scrollToTopEmitter } from '../utils/scrollToTop';

const colors = defaultColors;

export function ProviderEventsScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { providerServices } = useApp();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  // Auth & Data hooks
  const { user } = useAuth();
  const { jobs: realJobs, loading: jobsLoading } = useProviderJobs(user?.uid);

  // Check if user has real data
  const hasRealData = user && realJobs.length > 0;
  const isLoading = jobsLoading;

  // Animated scroll
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Subscribe to scroll-to-top events
  useEffect(() => {
    const unsubscribe = scrollToTopEmitter.subscribe((tabName) => {
      if (tabName === 'EventsTab') {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsubscribe;
  }, []);

  // Animated style for calendar button (shrink on scroll)
  const calendarAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, 60, 120],
      [1, 0.85, 0.75],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
    };
  });

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    // Since useProviderJobs uses onSnapshot, data updates automatically
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  // Format money for display (compact)
  const formatMoney = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1).replace('.0', '')}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString('tr-TR');
  };

  // Convert Firebase jobs to ProviderEvent format
  const convertedRealJobs: ProviderEvent[] = useMemo(() => {
    if (!realJobs.length) return [];
    const now = new Date();
    return realJobs.map(job => {
      // Use contract amount (from accepted offer) if available, otherwise fall back to event budget
      const earnings = job.contractAmount ?? job.budget ?? 0;
      return {
        id: job.id,
        eventTitle: job.title,
        eventDate: job.date,
        eventTime: job.time || '20:00',
        eventImage: job.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
        venue: job.venue,
        location: `${job.city}${job.district ? `, ${job.district}` : ''}`,
        organizerName: job.organizerName || 'Organizatör',
        organizerImage: job.organizerImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        status: job.status === 'completed' ? 'past' : job.status === 'confirmed' ? 'active' : 'planned',
        serviceType: 'technical' as const,
        serviceLabel: 'Hizmet',
        earnings: earnings,
        paidAmount: 0,
        paymentStatus: 'unpaid' as const,
        daysUntil: Math.max(0, Math.ceil((new Date(job.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
        tasks: { total: 5, completed: 2 },
        teamSize: 3,
      };
    });
  }, [realJobs]);

  // Use real jobs if available, empty for new users
  const baseEvents = useMemo(() => {
    return hasRealData ? convertedRealJobs : [];
  }, [hasRealData, convertedRealJobs]);

  // All events - data comes from Firebase, no filtering needed
  const serviceFilteredEvents = useMemo(() => {
    return baseEvents;
  }, [baseEvents]);

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

  // Generate card title - show main event name and city
  const getCardTitle = (event: ProviderEvent) => {
    const city = event.location.split(',')[0].trim();

    // For booking events, show artist name prominently
    if (event.serviceType === 'booking') {
      // Extract artist name from serviceLabel (e.g., "Tarkan - Headliner" -> "Tarkan")
      const artistName = event.serviceLabel.split(' - ')[0].trim();
      return `${artistName} - ${city}`;
    }

    // For other events, use a clean short title
    // Remove year if present and use first meaningful part
    let title = event.eventTitle
      .replace(/\s*20\d{2}\s*/g, '') // Remove year
      .replace(/\s*-\s*$/, ''); // Remove trailing dash

    // If title is too long, shorten it
    if (title.length > 25) {
      title = title.split(' ').slice(0, 3).join(' ');
    }

    return `${title} - ${city}`;
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
        onPress={() => {
          console.log('[ProviderEventsScreen] Navigating to event with ID:', event.id);
          navigation.navigate('ProviderEventDetail', { eventId: event.id });
        }}
      >
        <View style={styles.eventImageContainer}>
          <OptimizedImage source={event.eventImage} style={styles.eventImage} />
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
              <Text style={styles.serviceLabelText} numberOfLines={1}>
                {event.serviceLabel.includes(' - ') ? event.serviceLabel.split(' - ')[0].trim() : event.serviceLabel}
              </Text>
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
              <OptimizedImage source={event.organizerImage} style={styles.organizerImage} />
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
              <Text style={[styles.earningLabel, { color: colors.textMuted }]}>Bekleyen</Text>
              <Text style={[styles.earningValue, { color: colors.brand[400] }]}>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Scroll Header */}
      <ScrollHeader
        title="İşlerim"
        scrollY={scrollY}
        threshold={60}
        showBackButton={true}
        rightAction={
          <Animated.View style={calendarAnimatedStyle}>
            <TouchableOpacity
              style={[styles.calendarButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}
              onPress={() => navigation.navigate('CalendarView')}
            >
              <Ionicons name="calendar" size={20} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>
        }
      />

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.eventsList}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.eventsListContent,
          { paddingTop: insets.top + 44 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[400]}
            colors={[colors.brand[400]]}
            progressViewOffset={insets.top + 44}
          />
        }
      >
        {/* Large Title */}
        <LargeTitle
          title="İşlerim"
          subtitle={`${stats.activeCount} aktif iş`}
        />

        {/* Earnings Summary - Minimal */}
        <View style={[styles.earningsSummary, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
          <View style={styles.earningsCompactRow}>
            <Text style={[styles.earningsCompactLabel, { color: colors.textMuted }]}>Kazanç</Text>
            <Text style={[styles.earningsCompactValue, { color: colors.text }]}>₺{formatMoney(stats.totalEarnings)}</Text>
            <View style={styles.earningsCompactDot} />
            <Text style={[styles.earningsCompactSmall, { color: colors.success }]}>₺{formatMoney(stats.paidEarnings)}</Text>
            <Text style={[styles.earningsCompactMuted, { color: colors.textMuted }]}>alındı</Text>
            <View style={styles.earningsCompactDot} />
            <Text style={[styles.earningsCompactSmall, { color: colors.warning }]}>₺{formatMoney(stats.pendingEarnings)}</Text>
            <Text style={[styles.earningsCompactMuted, { color: colors.textMuted }]}>bekliyor</Text>
          </View>
        </View>

        {/* Search Bar */}
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

        {/* Tabs */}
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

        {/* Events List */}
        <View style={styles.eventsListInner}>
          {isLoading ? (
            <SkeletonEventList count={3} />
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map(event => renderEventCard(event))
          ) : (
            <EmptyState
              icon="briefcase-outline"
              title="İş Bulunamadı"
              message={searchQuery
                ? 'Arama kriterlerinize uygun iş yok.'
                : 'Bu kategoride henüz iş yok.'}
            />
          )}
        </View>
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  calendarButton: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  earningsSummary: { marginHorizontal: 20, marginBottom: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  earningsCompactRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  earningsCompactLabel: { fontSize: 12, fontWeight: '500' },
  earningsCompactValue: { fontSize: 15, fontWeight: '700' },
  earningsCompactSmall: { fontSize: 13, fontWeight: '600' },
  earningsCompactMuted: { fontSize: 11 },
  earningsCompactDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(128,128,128,0.4)' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', gap: 10 },
  searchInput: { flex: 1, fontSize: 15 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, borderBottomWidth: 1, gap: 8 },
  tab: { paddingVertical: 12, paddingHorizontal: 12, position: 'relative' },
  tabText: { fontSize: 14, fontWeight: '500' },
  tabIndicator: { position: 'absolute', bottom: -1, left: 12, right: 12, height: 2, borderRadius: 1 },
  tabBadgeActive: { backgroundColor: 'rgba(75, 48, 184, 0.3)' },
  tabBadgeText: { fontSize: 10, fontWeight: '600' },
  eventsList: { flex: 1 },
  eventsListContent: { paddingBottom: 100 },
  eventsListInner: { paddingHorizontal: 20, gap: 12 },
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
});
