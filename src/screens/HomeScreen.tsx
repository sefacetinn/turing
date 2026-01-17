import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Image, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { gradients } from '../theme/colors';
import { useApp } from '../../App';
import { scrollToTopEmitter } from '../utils/scrollToTop';
import {
  HomeHeader,
  SearchBar,
  SectionHeader,
  CategoryCard,
  ProviderCard,
  ArtistCard,
} from '../components/home';
import { transformProviderEvents, CalendarEvent, isSameDay } from '../utils/calendarUtils';

// Bu hafta kac etkinlik var
function getEventsThisWeek(events: CalendarEvent[]): number {
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  return events.filter((event) => {
    const eventDate = event.date;
    return eventDate >= today && eventDate <= weekEnd;
  }).length;
}
import {
  artists,
  categories,
  recentProviders,
  organizerUser,
  providerStats,
  upcomingJobs,
  recentRequests,
  organizerDashboard,
  organizerQuickActions,
} from '../data/homeData';
import { events as organizerEvents } from '../data/mockData';
import { providerEvents } from '../data/providerEventsData';
import { operationSubcategories } from '../data/createEventData';
import type { HomeStackNavigationProp } from '../types';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  isProviderMode: boolean;
}

export function HomeScreen({ isProviderMode }: HomeScreenProps) {
  if (isProviderMode) {
    return <ProviderHomeContent />;
  }
  return <OrganizerHomeContent />;
}

// ============================================
// Organizer Home Content - Clean & Minimal Design
// ============================================
function OrganizerHomeContent() {
  const navigation = useNavigation<HomeStackNavigationProp>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [showOperationModal, setShowOperationModal] = useState(false);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

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
      if (tabName === 'HomeTab') {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsubscribe;
  }, []);

  // Animated style for avatar (hide on scroll)
  const avatarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 40, 80],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [0, 40, 80],
      [1, 0.8, 0.5],
      Extrapolation.CLAMP
    );
    const width = interpolate(
      scrollY.value,
      [0, 40, 80],
      [32, 20, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
      width,
      marginLeft: interpolate(scrollY.value, [0, 80], [8, 0], Extrapolation.CLAMP),
    };
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const dashboard = organizerDashboard;

  // Unified accent color - Brand purple
  const accentColor = colors.brand[400];
  const accentBg = isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.08)';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollHeader
        title={organizerUser.name}
        scrollY={scrollY}
        rightAction={
          <View style={styles.headerRightCompact}>
            <TouchableOpacity
              style={[styles.headerIconCompact, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBackground }]}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
              <View style={[styles.notificationDot, { backgroundColor: accentColor }]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerIconCompact, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBackground }]}
              onPress={() => navigation.navigate('CalendarView' as any)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        }
      />
      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 44 }}
      >
        <LargeTitle
          title={organizerUser.name}
          subtitle={getGreeting()}
          scrollY={scrollY}
        />

        {/* Create Event Card */}
        <TouchableOpacity
          style={[styles.createEventCard, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.12)' : 'rgba(75, 48, 184, 0.08)' }]}
          onPress={() => navigation.navigate('CreateEvent')}
          activeOpacity={0.7}
        >
          <View style={[styles.createEventIcon, { backgroundColor: accentColor }]}>
            <Ionicons name="add" size={24} color="white" />
          </View>
          <View style={styles.createEventContent}>
            <Text style={[styles.createEventTitle, { color: colors.text }]}>Yeni Etkinlik Oluştur</Text>
            <Text style={[styles.createEventSubtitle, { color: colors.textMuted }]}>Sanatçı, mekan ve hizmet seçin</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Next Event Card - Minimal */}
        {dashboard.nextEvent && (
          <TouchableOpacity
            style={[styles.nextEventCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('OrganizerEventDetail' as any, { eventId: dashboard.nextEvent.id })}
          >
            <Image source={{ uri: dashboard.nextEvent.image }} style={styles.nextEventImage} />
            <View style={styles.nextEventContent}>
              <View style={styles.nextEventTop}>
                <View style={[styles.countdownBadge, { backgroundColor: accentBg }]}>
                  <Text style={[styles.countdownText, { color: accentColor }]}>{dashboard.nextEvent.daysUntil} gün</Text>
                </View>
              </View>
              <Text style={[styles.nextEventTitle, { color: colors.text }]} numberOfLines={1}>{dashboard.nextEvent.title}</Text>
              <Text style={[styles.nextEventMeta, { color: colors.textMuted }]}>
                {dashboard.nextEvent.date} • {dashboard.nextEvent.venue}
              </Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                  <View style={[styles.progressFill, { width: `${dashboard.nextEvent.progress}%`, backgroundColor: accentColor }]} />
                </View>
                <Text style={[styles.progressText, { color: colors.textMuted }]}>{dashboard.nextEvent.progress}%</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Pending Actions - Simple List */}
        {dashboard.pendingActions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Bekleyen İşlemler</Text>
            <View style={[styles.listCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
              {dashboard.pendingActions.slice(0, 3).map((action, index) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.listItem,
                    index !== Math.min(dashboard.pendingActions.length, 3) - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border },
                  ]}
                  onPress={() => {
                    if (action.type === 'offer' && action.offerId) {
                      navigation.navigate('OfferDetail' as any, { offerId: action.offerId });
                    } else if (action.type === 'service') {
                      navigation.navigate('ServiceProviders' as any, { category: action.serviceCategory || 'technical' });
                    }
                  }}
                >
                  <View style={[styles.listIconBg, { backgroundColor: accentBg }]}>
                    <Ionicons name={action.type === 'offer' ? 'document-text-outline' : 'construct-outline'} size={16} color={accentColor} />
                  </View>
                  <View style={styles.listContent}>
                    <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>{action.title}</Text>
                    <Text style={[styles.listSubtitle, { color: colors.textMuted }]}>{action.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Active Events - Horizontal Scroll */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Etkinliklerim</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EventsTab' as any)}>
              <Text style={[styles.seeAllText, { color: accentColor }]}>Tümü</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventsScroll}>
            {dashboard.activeEventsList.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[styles.eventCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}
                onPress={() => navigation.navigate('OrganizerEventDetail' as any, { eventId: event.id })}
              >
                <Image source={{ uri: event.image }} style={styles.eventCardImage} />
                <View style={styles.eventCardBody}>
                  <Text style={[styles.eventCardTitle, { color: colors.text }]} numberOfLines={1}>{event.title}</Text>
                  <Text style={[styles.eventCardDate, { color: colors.textMuted }]}>{event.date}</Text>
                  <View style={styles.eventCardFooter}>
                    <View style={[styles.miniProgressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                      <View style={[styles.miniProgressFill, { width: `${event.progress}%`, backgroundColor: accentColor }]} />
                    </View>
                    <Text style={[styles.miniProgressText, { color: colors.textMuted }]}>{event.progress}%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.addEventCard, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]}
              onPress={() => navigation.navigate('CreateEvent')}
            >
              <Ionicons name="add" size={24} color={accentColor} />
              <Text style={[styles.addEventText, { color: colors.textMuted }]}>Yeni</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Services - Simple Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hizmetler</Text>
          <View style={styles.servicesGrid}>
            {categories.slice(0, 6).map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.serviceItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}
                onPress={() => {
                  if (category.id === 'operation') {
                    setShowOperationModal(true);
                  } else {
                    navigation.navigate('ServiceProviders', { category: category.id as any });
                  }
                }}
              >
                <View style={[styles.serviceIcon, { backgroundColor: accentBg }]}>
                  <Ionicons name={category.icon as any} size={20} color={accentColor} />
                </View>
                <Text style={[styles.serviceName, { color: colors.text }]}>{category.name}</Text>
                {category.id === 'operation' && (
                  <View style={[styles.subcategoryBadge, { backgroundColor: accentBg }]}>
                    <Text style={[styles.subcategoryBadgeText, { color: accentColor }]}>13</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Aktiviteler</Text>
          <View style={[styles.listCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
            {dashboard.recentActivity.slice(0, 3).map((activity, index) => (
              <View
                key={activity.id}
                style={[
                  styles.activityRow,
                  index !== Math.min(dashboard.recentActivity.length, 3) - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border },
                ]}
              >
                <View style={[styles.activityDot, { backgroundColor: accentColor }]} />
                <View style={styles.activityContent}>
                  <Text style={[styles.activityText, { color: colors.text }]}>{activity.message}</Text>
                  <Text style={[styles.activityTime, { color: colors.textMuted }]}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Popular Artists - Simple */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popüler Sanatçılar</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search', { initialFilter: 'artists' })}>
              <Text style={[styles.seeAllText, { color: accentColor }]}>Tümü</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.artistsScroll}>
            {artists.slice(0, 4).map((artist) => (
              <TouchableOpacity
                key={artist.id}
                style={styles.artistItem}
                onPress={() => navigation.navigate('ArtistDetail', { artistId: artist.id })}
              >
                <Image source={{ uri: artist.image }} style={styles.artistImage} />
                <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>{artist.name}</Text>
                <Text style={[styles.artistGenre, { color: colors.textMuted }]} numberOfLines={1}>{artist.genre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Operation Subcategory Modal */}
      <Modal
        visible={showOperationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOperationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Operasyon Hizmetleri</Text>
              <TouchableOpacity onPress={() => setShowOperationModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                Bir alt kategori seçin
              </Text>
              <View style={styles.subcategoryGrid}>
                {operationSubcategories.map((sub) => (
                  <TouchableOpacity
                    key={sub.id}
                    style={[styles.subcategoryItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}
                    onPress={() => {
                      setShowOperationModal(false);
                      navigation.navigate('ServiceProviders', { category: sub.id as any });
                    }}
                  >
                    <LinearGradient
                      colors={gradients.operation}
                      style={styles.subcategoryIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={sub.icon as any} size={20} color="white" />
                    </LinearGradient>
                    <Text style={[styles.subcategoryName, { color: colors.text }]}>{sub.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================
// Provider Home Content
// ============================================
function ProviderHomeContent() {
  const navigation = useNavigation<HomeStackNavigationProp>();
  const { colors, isDark, helpers } = useTheme();
  const insets = useSafeAreaInsets();
  const { providerServices } = useApp();
  const scrollViewRef = useRef<Animated.ScrollView>(null);

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
      if (tabName === 'HomeTab') {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsubscribe;
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  // Service type mapping for filtering
  const serviceTypeMap: Record<string, string[]> = {
    'booking': ['booking'],
    'technical': ['sound-light', 'technical'],
    'sound-light': ['technical', 'sound-light'],
    'transport': ['transport'],
    'accommodation': ['accommodation'],
    'security': ['security'],
    'catering': ['catering'],
    'venue': ['venue'],
    'operation': ['operation', 'security', 'catering'],
  };

  // Filter upcoming jobs based on provider services
  const filteredUpcomingJobs = useMemo(() => {
    if (!providerServices || providerServices.length === 0) {
      return upcomingJobs;
    }
    return upcomingJobs.filter((job: any) => {
      if (!job.serviceType) return true;
      const mappedTypes = serviceTypeMap[job.serviceType] || [job.serviceType];
      return providerServices.some(ps =>
        mappedTypes.includes(ps) || ps === job.serviceType
      );
    });
  }, [providerServices]);

  // Filter recent requests based on provider services
  const filteredRecentRequests = useMemo(() => {
    if (!providerServices || providerServices.length === 0) {
      return recentRequests;
    }
    return recentRequests.filter((request: any) => {
      if (!request.serviceType) return true;
      const mappedTypes = serviceTypeMap[request.serviceType] || [request.serviceType];
      return providerServices.some(ps =>
        mappedTypes.includes(ps) || ps === request.serviceType
      );
    });
  }, [providerServices]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollHeader
        title="EventPro 360"
        scrollY={scrollY}
        rightAction={
          <View style={styles.headerRightCompact}>
            <TouchableOpacity
              style={[styles.headerIconCompact, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBackground }]}
              onPress={() => navigation.navigate('MessagesTab' as any)}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
              <View style={[styles.notificationDot, { backgroundColor: colors.brand[400] }]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerIconCompact, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBackground }]}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
              <View style={[styles.notificationDot, { backgroundColor: colors.brand[400] }]} />
            </TouchableOpacity>
          </View>
        }
      />
      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 44 }}
      >
        <LargeTitle
          title="EventPro 360"
          subtitle={getGreeting()}
          scrollY={scrollY}
        />

        {/* Status Bar */}
        <ProviderStatusBar
          profileViews={providerStats.profileViews}
          rating={providerStats.rating}
          reviewCount={providerStats.reviewCount}
        />

        {/* Earnings Card */}
        <EarningsCard
          monthlyEarnings={providerStats.monthlyEarnings}
          pendingPayments={providerStats.pendingPayments}
          completedJobs={providerStats.completedJobs}
          onPress={() => navigation.navigate('ProviderFinance' as any)}
        />

        {/* Quick Stats - 3 kolonlu: Yaklaşan İş, Teklif, Takvim */}
        <QuickStatsRow
          upcomingJobs={providerStats.upcomingJobs}
          pendingOffers={providerStats.pendingOffers}
          eventsThisWeek={getEventsThisWeek(transformProviderEvents(providerEvents))}
          onOffersPress={() => navigation.navigate('OffersTab' as any)}
          onJobsPress={() => navigation.navigate('EventsTab' as any)}
          onCalendarPress={() => navigation.navigate('CalendarView' as any)}
        />

        <SectionHeader title="Yaklaşan İşler" onViewAll={() => navigation.navigate('EventsTab' as any)} />

        {filteredUpcomingJobs.slice(0, 3).map((job) => (
          <UpcomingJobCard
            key={job.id}
            {...job}
            onPress={() => navigation.navigate('ProviderEventDetail' as any, { eventId: job.id })}
          />
        ))}

        <SectionHeader title="Yeni Talepler" onViewAll={() => navigation.navigate('OffersTab' as any)} />

        {filteredRecentRequests.slice(0, 3).map((request) => (
          <RequestCard
            key={request.id}
            {...request}
            onPress={() => navigation.navigate('OfferDetail' as any, { offerId: request.id })}
          />
        ))}

        {/* Performance Card */}
        <PerformanceCard responseRate={providerStats.responseRate} />

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

// ============================================
// Shared Components
// ============================================

function OperationCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.operationCard} activeOpacity={0.8} onPress={onPress}>
      <LinearGradient
        colors={gradients.operation}
        style={styles.operationGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.operationIconBox}>
          <Ionicons name="settings" size={24} color="white" />
        </View>
        <View style={styles.operationContent}>
          <Text style={styles.operationTitle}>Operasyon</Text>
          <Text style={styles.operationSubtitle}>Güvenlik, Catering, Jeneratör ve 9 hizmet daha</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ============================================
// Provider-specific Components
// ============================================

interface ProviderHeaderProps {
  greeting: string;
  companyName: string;
  messageCount: number;
  notificationCount: number;
  onMessagesPress: () => void;
  onNotificationsPress: () => void;
}

function ProviderHeader({
  greeting,
  companyName,
  messageCount,
  notificationCount,
  onMessagesPress,
  onNotificationsPress,
}: ProviderHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.providerHeader}>
      <View style={styles.providerHeaderTop}>
        <View>
          <Text style={[styles.greetingText, { color: colors.textMuted }]}>{greeting}</Text>
          <Text style={[styles.companyName, { color: colors.text }]}>{companyName}</Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton icon="chatbubble-outline" count={messageCount} onPress={onMessagesPress} />
          <IconButton icon="notifications-outline" count={notificationCount} onPress={onNotificationsPress} />
        </View>
      </View>
    </View>
  );
}

function IconButton({ icon, count, onPress }: { icon: string; count: number; onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.iconButton, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={20} color={colors.textMuted} />
      {count > 0 && (
        <View style={[styles.iconBadge, { borderColor: colors.background }]}>
          <Text style={styles.iconBadgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function ProviderStatusBar({
  profileViews,
  rating,
  reviewCount,
}: {
  profileViews: number;
  rating: number;
  reviewCount: number;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.statusBar, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
      <View style={styles.statusItem}>
        <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>Çevrimiçi</Text>
      </View>
      <View style={[styles.statusDivider, { backgroundColor: colors.border }]} />
      <View style={styles.statusItem}>
        <Ionicons name="eye-outline" size={14} color={colors.textMuted} />
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>{profileViews} görüntülenme</Text>
      </View>
      <View style={[styles.statusDivider, { backgroundColor: colors.border }]} />
      <View style={styles.statusItem}>
        <Ionicons name="star" size={14} color="#fbbf24" />
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
          {rating} ({reviewCount})
        </Text>
      </View>
    </View>
  );
}

function EarningsCard({
  monthlyEarnings,
  pendingPayments,
  completedJobs,
  onPress,
}: {
  monthlyEarnings: number;
  pendingPayments: number;
  completedJobs: number;
  onPress?: () => void;
}) {
  const { colors, isDark, helpers } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.earningsSection,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground,
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
        },
        !isDark && helpers.getShadow('sm'),
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.earningsHeader}>
        <View style={styles.earningsHeaderLeft}>
          <View style={[styles.earningsIconBox, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]}>
            <Ionicons name="wallet-outline" size={18} color={colors.brand[400]} />
          </View>
          <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>Bu Ay Kazanç</Text>
        </View>
        {onPress && (
          <TouchableOpacity style={styles.earningsDetailLink} onPress={onPress}>
            <Text style={[styles.earningsDetailLinkText, { color: colors.brand[400] }]}>Detay</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.brand[400]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Amount */}
      <View style={styles.earningsAmountRow}>
        <Text style={[styles.earningsAmount, { color: colors.text }]}>
          ₺{monthlyEarnings.toLocaleString('tr-TR')}
        </Text>
        <View style={[styles.earningsGrowth, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
          <Ionicons name="trending-up" size={12} color="#10B981" />
          <Text style={styles.earningsGrowthText}>+23%</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={[styles.earningsStats, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
        <View style={styles.earningsStatItem}>
          <Text style={[styles.earningsStatValue, { color: colors.text }]}>
            ₺{pendingPayments.toLocaleString('tr-TR')}
          </Text>
          <Text style={[styles.earningsStatLabel, { color: colors.textMuted }]}>Bekleyen Ödeme</Text>
        </View>
        <View style={[styles.earningsStatDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]} />
        <View style={styles.earningsStatItem}>
          <Text style={[styles.earningsStatValue, { color: colors.text }]}>{completedJobs}</Text>
          <Text style={[styles.earningsStatLabel, { color: colors.textMuted }]}>Tamamlanan İş</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function QuickStatsRow({
  upcomingJobs,
  pendingOffers,
  eventsThisWeek,
  onOffersPress,
  onJobsPress,
  onCalendarPress,
}: {
  upcomingJobs: number;
  pendingOffers: number;
  eventsThisWeek: number;
  onOffersPress: () => void;
  onJobsPress: () => void;
  onCalendarPress: () => void;
}) {
  const { colors, isDark, helpers } = useTheme();

  return (
    <View style={styles.quickStatsRow}>
      <TouchableOpacity
        style={[
          styles.quickStatCardTriple,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            ...(isDark ? {} : helpers.getShadow('sm')),
          },
        ]}
        onPress={onJobsPress}
      >
        <View style={[styles.quickStatIconSmall, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}>
          <Ionicons name="briefcase" size={16} color={colors.info} />
        </View>
        <Text style={[styles.quickStatValueSmall, { color: colors.text }]}>{upcomingJobs}</Text>
        <Text style={[styles.quickStatLabelSmall, { color: colors.textMuted }]}>Yaklaşan</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.quickStatCardTriple,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            ...(isDark ? {} : helpers.getShadow('sm')),
          },
        ]}
        onPress={onOffersPress}
      >
        <View style={[styles.quickStatIconSmall, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }]}>
          <Ionicons name="pricetag" size={16} color={colors.warning} />
        </View>
        <Text style={[styles.quickStatValueSmall, { color: colors.text }]}>{pendingOffers}</Text>
        <Text style={[styles.quickStatLabelSmall, { color: colors.textMuted }]}>Teklif</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.quickStatCardTriple,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            ...(isDark ? {} : helpers.getShadow('sm')),
          },
        ]}
        onPress={onCalendarPress}
      >
        <View style={[styles.quickStatIconSmall, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }]}>
          <Ionicons name="calendar" size={16} color={colors.brand[400]} />
        </View>
        <Text style={[styles.quickStatValueSmall, { color: colors.text }]}>{eventsThisWeek}</Text>
        <Text style={[styles.quickStatLabelSmall, { color: colors.textMuted }]}>Bu Hafta</Text>
      </TouchableOpacity>
    </View>
  );
}

function UpcomingJobCard({
  title,
  date,
  location,
  role,
  earnings,
  daysUntil,
  status,
  image,
  onPress,
}: {
  title: string;
  date: string;
  location: string;
  role: string;
  earnings: number;
  daysUntil: number;
  status: string;
  image: string;
  onPress: () => void;
}) {
  const { colors, isDark, helpers } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.jobCard,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          ...(isDark ? {} : helpers.getShadow('sm')),
        },
      ]}
      onPress={onPress}
    >
      <Image source={{ uri: image }} style={styles.jobImage} />
      <View style={styles.jobContent}>
        <View style={styles.jobHeader}>
          <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          <View
            style={[
              styles.daysUntilBadge,
              { backgroundColor: daysUntil <= 7 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)' },
            ]}
          >
            <Text style={[styles.daysUntilText, { color: daysUntil <= 7 ? colors.error : colors.info }]}>
              {daysUntil} gün
            </Text>
          </View>
        </View>
        <Text style={[styles.jobDate, { color: colors.textMuted }]}>
          {date} • {location}
        </Text>
        <View style={styles.jobFooter}>
          <View style={[styles.roleBadge, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.08)' }]}>
            <Text style={[styles.roleText, { color: colors.brand[400] }]}>{role}</Text>
          </View>
          <Text style={[styles.earningsText, { color: colors.success }]}>₺{earnings.toLocaleString('tr-TR')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RequestCard({
  title,
  category,
  organizer,
  organizerImage,
  location,
  date,
  budget,
  isNew,
  isHot,
  timeAgo,
  matchScore,
  onPress,
}: {
  title: string;
  category: string;
  organizer: string;
  organizerImage: string;
  location: string;
  date: string;
  budget: string;
  isNew: boolean;
  isHot: boolean;
  timeAgo: string;
  matchScore: number;
  onPress: () => void;
}) {
  const { colors, isDark, helpers } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.requestCard,
        {
          backgroundColor: colors.cardBackground,
          borderColor: isHot ? 'rgba(239, 68, 68, 0.3)' : colors.border,
          ...(isDark ? {} : helpers.getShadow('sm')),
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestBadges}>
          {isNew && (
            <View style={[styles.newBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={[styles.newBadgeText, { color: colors.success }]}>Yeni</Text>
            </View>
          )}
          {isHot && (
            <View style={[styles.hotBadge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="flame" size={12} color={colors.error} />
              <Text style={[styles.hotBadgeText, { color: colors.error }]}>Acil</Text>
            </View>
          )}
        </View>
        <Text style={[styles.timeAgo, { color: colors.textMuted }]}>{timeAgo}</Text>
      </View>

      <Text style={[styles.requestTitle, { color: colors.text }]}>{title}</Text>

      <View style={styles.requestMeta}>
        <Image source={{ uri: organizerImage }} style={styles.organizerImage} />
        <Text style={[styles.organizerName, { color: colors.textSecondary }]}>{organizer}</Text>
        <Text style={[styles.requestDot, { color: colors.textMuted }]}>•</Text>
        <Ionicons name="location" size={12} color={colors.textMuted} />
        <Text style={[styles.requestLocation, { color: colors.textMuted }]}>{location}</Text>
      </View>

      <View style={styles.requestFooter}>
        <View style={[styles.categoryBadge, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.08)' }]}>
          <Text style={[styles.categoryText, { color: colors.brand[400] }]}>{category}</Text>
        </View>
        <Text style={[styles.budgetText, { color: colors.text }]}>{budget}</Text>
      </View>

      <View style={[styles.matchRow, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]}>
        <View style={styles.matchInfo}>
          <Text style={[styles.matchLabel, { color: colors.textMuted }]}>Eşleşme Skoru</Text>
          <View style={[styles.matchBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
            <View style={[styles.matchProgress, { width: `${matchScore}%`, backgroundColor: colors.brand[400] }]} />
          </View>
        </View>
        <Text style={[styles.matchScore, { color: colors.brand[400] }]}>{matchScore}%</Text>
      </View>
    </TouchableOpacity>
  );
}

function PerformanceCard({ responseRate }: { responseRate: number }) {
  const { colors, isDark, helpers } = useTheme();

  return (
    <View
      style={[
        styles.performanceCard,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          ...(isDark ? {} : helpers.getShadow('sm')),
        },
      ]}
    >
      <View style={styles.performanceHeader}>
        <Ionicons name="analytics-outline" size={20} color={colors.brand[400]} />
        <Text style={[styles.performanceTitle, { color: colors.text }]}>Performans</Text>
      </View>

      <View style={styles.performanceCircles}>
        <PerformanceCircle value={responseRate} label="Yanıt Oranı" color={colors.success} />
        <PerformanceCircle value={96} label="Tamamlama" color={colors.brand[500]} />
        <PerformanceCircle value={99} label="Memnuniyet" color={colors.warning} />
      </View>

      <View style={[styles.performanceHint, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.08)' : 'rgba(75, 48, 184, 0.06)' }]}>
        <Ionicons name="sparkles" size={14} color={colors.brand[400]} />
        <Text style={[styles.performanceHintText, { color: colors.brand[400] }]}>
          Harika gidiyorsunuz! Üst düzey sağlayıcı statüsündesiniz.
        </Text>
      </View>
    </View>
  );
}

function PerformanceCircle({ value, label, color }: { value: number; label: string; color: string }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.circleItem}>
      <View style={[styles.circle, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)' }]}>
        <View
          style={[
            styles.circleProgress,
            {
              borderColor: color,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            },
          ]}
        >
          <Text style={[styles.circleValue, { color: colors.text }]}>{value}%</Text>
        </View>
      </View>
      <Text style={[styles.circleLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header - Clean
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLeft: {},
  greeting: {
    fontSize: 13,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  // Compact Header for ScrollHeader
  headerRightCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  // Create Event Card
  createEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    gap: 14,
  },
  createEventIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createEventContent: {
    flex: 1,
  },
  createEventTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  createEventSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // Next Event Card - Minimal
  nextEventCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  nextEventImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  nextEventContent: {
    flex: 1,
    justifyContent: 'center',
  },
  nextEventTop: {
    marginBottom: 4,
  },
  countdownBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '600',
  },
  nextEventTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  nextEventMeta: {
    fontSize: 12,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // List Card
  listCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  listIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  listSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // Events Scroll
  eventsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  eventCard: {
    width: 150,
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventCardImage: {
    width: '100%',
    height: 90,
  },
  eventCardBody: {
    padding: 10,
  },
  eventCardTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  eventCardDate: {
    fontSize: 11,
    marginTop: 2,
  },
  eventCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  miniProgressBar: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  miniProgressText: {
    fontSize: 10,
  },
  addEventCard: {
    width: 80,
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addEventText: {
    fontSize: 11,
  },

  // Services Grid
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  serviceItem: {
    width: (width - 60) / 3,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
  },
  activityTime: {
    fontSize: 11,
    marginTop: 2,
  },

  // Artists
  artistsScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  artistItem: {
    alignItems: 'center',
    width: 80,
  },
  artistImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  artistName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  artistGenre: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },

  // Kept for compatibility
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },

  // Operation Card
  operationCard: {
    marginHorizontal: 20,
    marginTop: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  operationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  operationIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  operationContent: {
    flex: 1,
  },
  operationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  operationSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },

  // Subcategory Badge
  subcategoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subcategoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Operation Subcategory Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
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
  modalScroll: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  subcategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subcategoryItem: {
    width: (width - 64) / 3,
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  subcategoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  subcategoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Provider Header
  providerHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  providerHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingText: {
    fontSize: 14,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  iconBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },

  // Status Bar
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
  statusDivider: {
    width: 1,
    height: 14,
    marginHorizontal: 12,
  },

  // Earnings Card
  earningsSection: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  earningsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  earningsIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  earningsDetailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  earningsDetailLinkText: {
    fontSize: 13,
    fontWeight: '500',
  },
  earningsAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  earningsAmount: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  earningsGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  earningsGrowthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  earningsStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  earningsStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningsStatValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  earningsStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  earningsStatDivider: {
    width: 1,
    height: 32,
  },

  // Quick Stats
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
  },
  quickStatCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  quickStatLabel: {
    fontSize: 12,
  },
  // Triple column layout
  quickStatCardTriple: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  quickStatIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatValueSmall: {
    fontSize: 20,
    fontWeight: '700',
  },
  quickStatLabelSmall: {
    fontSize: 10,
    textAlign: 'center',
  },

  // Job Card
  jobCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  jobImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  jobContent: {
    flex: 1,
    justifyContent: 'center',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  daysUntilBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  daysUntilText: {
    fontSize: 11,
    fontWeight: '600',
  },
  jobDate: {
    fontSize: 12,
    marginTop: 4,
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '500',
  },
  earningsText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Request Card
  requestCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  requestBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  hotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hotBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 11,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  organizerImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  organizerName: {
    fontSize: 12,
  },
  requestDot: {
    fontSize: 10,
  },
  requestLocation: {
    fontSize: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  matchInfo: {
    flex: 1,
    marginRight: 12,
  },
  matchLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  matchBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  matchProgress: {
    height: '100%',
    borderRadius: 3,
  },
  matchScore: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Performance Card
  performanceCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  performanceCircles: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  circleItem: {
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 6,
  },
  circleProgress: {
    flex: 1,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  circleLabel: {
    fontSize: 11,
  },
  performanceHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  performanceHintText: {
    fontSize: 12,
    flex: 1,
  },
});
