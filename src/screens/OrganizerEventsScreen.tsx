import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { gradients, darkTheme as defaultColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { events as mockEvents, artists } from '../data/mockData';

// Default colors for static styles (dark theme)
const colors = defaultColors;

const { width } = Dimensions.get('window');

type TabType = 'active' | 'past' | 'all';

interface Service {
  id: string;
  category: string;
  name: string;
  status: string;
  provider: string | null;
  price: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  district: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  image: string;
  attendees: number;
  services: Service[];
}

// Get category color
const getCategoryColor = (category: string): readonly [string, string, ...string[]] => {
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
      return { label: 'Onaylandı', color: colors.success, bgColor: 'rgba(16, 185, 129, 0.15)' };
    case 'planning':
      return { label: 'Planlama', color: colors.brand[400], bgColor: 'rgba(147, 51, 234, 0.15)' };
    case 'draft':
      return { label: 'Taslak', color: colors.zinc[400], bgColor: 'rgba(161, 161, 170, 0.15)' };
    case 'completed':
      return { label: 'Tamamlandı', color: colors.info, bgColor: 'rgba(59, 130, 246, 0.15)' };
    case 'cancelled':
      return { label: 'İptal', color: colors.error, bgColor: 'rgba(239, 68, 68, 0.15)' };
    default:
      return { label: status, color: colors.zinc[500], bgColor: 'rgba(113, 113, 122, 0.15)' };
  }
};

// Get artists for event from booking services
const getEventArtists = (services: Service[]) => {
  const bookingServices = services.filter(s => s.category === 'booking' && s.provider);
  return bookingServices.slice(0, 3).map(s => {
    const artist = artists.find(a => a.name === s.provider);
    return {
      name: s.provider,
      image: artist?.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
    };
  });
};

// Get unique categories from services
const getServiceCategories = (services: Service[]) => {
  const categories = [...new Set(services.map(s => s.category))];
  return categories.slice(0, 5);
};

export function OrganizerEventsScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
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
    let filtered = mockEvents as Event[];

    // Tab filter
    if (activeTab === 'active') {
      filtered = filtered.filter(e => ['planning', 'confirmed'].includes(e.status));
    } else if (activeTab === 'past') {
      filtered = filtered.filter(e => ['completed', 'cancelled'].includes(e.status));
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query) ||
        e.venue.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeTab, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const allEvents = mockEvents as Event[];
    const activeEvents = allEvents.filter(e => ['planning', 'confirmed'].includes(e.status));
    const pastEvents = allEvents.filter(e => ['completed', 'cancelled'].includes(e.status));
    const totalBudget = allEvents.reduce((sum, e) => sum + e.budget, 0);
    const totalSpent = allEvents.reduce((sum, e) => sum + e.spent, 0);
    return {
      total: allEvents.length,
      active: activeEvents.length,
      past: pastEvents.length,
      totalBudget,
      totalSpent,
    };
  }, []);

  // Generate card title as "Artist Name - City"
  const getCardTitle = (event: Event, eventArtists: { name: string | null; image: string }[]) => {
    const artistName = eventArtists[0]?.name;
    const city = event.location;
    if (artistName) {
      return `${artistName} - ${city}`;
    }
    // Fallback for events without artists (corporate, private etc.)
    return `${event.title.split(' ')[0]} - ${city}`;
  };

  const renderEventCard = (event: Event) => {
    const statusInfo = getStatusInfo(event.status);
    const eventArtists = getEventArtists(event.services);
    const serviceCategories = getServiceCategories(event.services);
    const confirmedServices = event.services.filter(s => s.status === 'confirmed').length;
    const totalServices = event.services.length;
    const cardTitle = getCardTitle(event, eventArtists);

    return (
      <TouchableOpacity
        key={event.id}
        style={[styles.eventCard, {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border
        }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('OrganizerEventDetail', { eventId: event.id })}
      >
        {/* Event Image */}
        <View style={styles.eventImageContainer}>
          <Image source={{ uri: event.image }} style={styles.eventImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.eventImageGradient}
          />

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>

          {/* Date Badge */}
          <View style={styles.dateBadge}>
            <Ionicons name="calendar" size={12} color={colors.white} />
            <Text style={styles.dateBadgeText}>{event.date}</Text>
          </View>

          {/* Artist Avatars */}
          {eventArtists.length > 0 && (
            <View style={styles.artistAvatars}>
              {eventArtists.map((artist, index) => (
                <View
                  key={index}
                  style={[
                    styles.artistAvatar,
                    { marginLeft: index > 0 ? -10 : 0, zIndex: 3 - index },
                  ]}
                >
                  <Image source={{ uri: artist.image }} style={styles.artistAvatarImage} />
                </View>
              ))}
              {eventArtists.length > 0 && (
                <Text style={styles.artistCount}>
                  {eventArtists.length === 1 ? eventArtists[0].name : `+${eventArtists.length} Sanatçı`}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Event Content */}
        <View style={styles.eventContent}>
          <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>{cardTitle}</Text>

          <View style={styles.eventMeta}>
            <View style={styles.eventMetaItem}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.eventMetaText, { color: colors.textMuted }]}>{event.venue}, {event.district}</Text>
            </View>
            <View style={styles.eventMetaItem}>
              <Ionicons name="people-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.eventMetaText, { color: colors.textMuted }]}>{event.attendees.toLocaleString('tr-TR')} kişi</Text>
            </View>
          </View>

          {/* Service Tags */}
          {serviceCategories.length > 0 && (
            <View style={styles.serviceTags}>
              {serviceCategories.map((category, index) => (
                <LinearGradient
                  key={index}
                  colors={getCategoryColor(category)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.serviceTag}
                >
                  <Text style={styles.serviceTagText}>
                    {category === 'booking' ? 'Booking' :
                     category === 'technical' ? 'Teknik' :
                     category === 'venue' ? 'Mekan' :
                     category === 'accommodation' ? 'Konaklama' :
                     category === 'transport' ? 'Ulaşım' :
                     category === 'operation' ? 'Operasyon' : category}
                  </Text>
                </LinearGradient>
              ))}
            </View>
          )}

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressLabel, { color: colors.textMuted }]}>Hizmet İlerlemesi</Text>
                <Text style={[styles.progressValue, { color: colors.textMuted }]}>
                  {confirmedServices}/{totalServices} onaylı
                </Text>
              </View>
              <Text style={styles.progressPercent}>{event.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={gradients.primary}
                style={[styles.progressFill, { width: `${event.progress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          {/* Budget */}
          <View style={styles.budgetRow}>
            <View style={styles.budgetItem}>
              <Text style={[styles.budgetLabel, { color: colors.textMuted }]}>Bütçe</Text>
              <Text style={[styles.budgetValue, { color: colors.text }]}>₺{event.budget.toLocaleString('tr-TR')}</Text>
            </View>
            <View style={styles.budgetDivider} />
            <View style={styles.budgetItem}>
              <Text style={[styles.budgetLabel, { color: colors.textMuted }]}>Harcanan</Text>
              <Text style={[styles.budgetValue, { color: colors.warning }]}>
                ₺{event.spent.toLocaleString('tr-TR')}
              </Text>
            </View>
            <View style={styles.budgetDivider} />
            <View style={styles.budgetItem}>
              <Text style={[styles.budgetLabel, { color: colors.textMuted }]}>Kalan</Text>
              <Text style={[styles.budgetValue, { color: colors.success }]}>
                ₺{(event.budget - event.spent).toLocaleString('tr-TR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Etkinliklerim</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {stats.active} aktif etkinlik
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Ionicons
              name={showCalendar ? 'list' : 'calendar'}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateEvent')}
          >
            <LinearGradient
              colors={gradients.primary}
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchBar,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
          }
        ]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Etkinlik ara..."
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
          {[
            { key: 'active', label: 'Aktif', count: stats.active },
            { key: 'past', label: 'Geçmiş', count: stats.past },
            { key: 'all', label: 'Tümü', count: stats.total },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab.key ? colors.brand[400] : colors.textMuted }]}>
                {tab.label}
                {tab.count !== undefined && ` (${tab.count})`}
              </Text>
              {activeTab === tab.key && <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Events List or Calendar View */}
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
        {showCalendar ? (
          /* Calendar View */
          <View style={styles.calendarView}>
            {/* Calendar Header */}
            <View style={[styles.calendarHeader, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
              <Text style={[styles.calendarMonth, { color: colors.text }]}>Ocak 2024</Text>
              <View style={styles.calendarNav}>
                <TouchableOpacity style={[styles.calendarNavButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
                  <Ionicons name="chevron-back" size={18} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.calendarNavButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
                  <Ionicons name="chevron-forward" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Calendar Grid */}
            <View style={[styles.calendarGrid, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
              {/* Week Days */}
              <View style={styles.weekDays}>
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, i) => (
                  <Text key={i} style={[styles.weekDay, { color: colors.textMuted }]}>{day}</Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {Array.from({ length: 35 }, (_, i) => {
                  const dayNum = i - 1; // Offset for month start
                  const isCurrentMonth = dayNum >= 0 && dayNum < 31;
                  const day = isCurrentMonth ? dayNum + 1 : '';
                  const hasEvent = [15, 17, 20, 25, 28].includes(dayNum + 1);
                  const isToday = dayNum + 1 === 14;

                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.dayCell,
                        isToday && { backgroundColor: colors.brand[500], borderRadius: 12 },
                      ]}
                    >
                      <Text style={[
                        styles.dayText,
                        { color: isCurrentMonth ? (isToday ? 'white' : colors.text) : colors.textMuted },
                      ]}>
                        {day}
                      </Text>
                      {hasEvent && isCurrentMonth && (
                        <View style={[styles.eventDot, { backgroundColor: isToday ? 'white' : colors.brand[400] }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Events for Selected Date */}
            <Text style={[styles.calendarEventsTitle, { color: colors.text }]}>Bu Ayki Etkinlikler</Text>
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => {
                const calEventArtists = getEventArtists(event.services);
                const calCardTitle = getCardTitle(event, calEventArtists);
                return (
                  <TouchableOpacity
                    key={event.id}
                    style={[styles.calendarEventItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}
                    onPress={() => navigation.navigate('OrganizerEventDetail', { eventId: event.id })}
                  >
                    <View style={[styles.calendarEventDate, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                      <Text style={[styles.calendarEventDay, { color: colors.brand[400] }]}>{event.date.split(' ')[0]}</Text>
                      <Text style={[styles.calendarEventMonth, { color: colors.brand[400] }]}>{event.date.split(' ')[1]?.substring(0, 3)}</Text>
                    </View>
                    <View style={styles.calendarEventInfo}>
                      <Text style={[styles.calendarEventTitle, { color: colors.text }]} numberOfLines={1}>{calCardTitle}</Text>
                      <View style={styles.calendarEventMeta}>
                        <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                        <Text style={[styles.calendarEventLocation, { color: colors.textMuted }]}>{event.venue}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Bu ay etkinlik yok</Text>
              </View>
            )}
          </View>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map(event => renderEventCard(event))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Etkinlik Bulunamadı</Text>
            <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
              {searchQuery
                ? 'Arama kriterlerinize uygun etkinlik yok.'
                : 'Henüz etkinlik oluşturmadınız.'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('CreateEvent')}
              >
                <LinearGradient
                  colors={gradients.primary}
                  style={styles.emptyStateButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="add" size={18} color="white" />
                  <Text style={styles.emptyStateButtonText}>Etkinlik Oluştur</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
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
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  tabContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  tabContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 1,
  },
  // Removed old tab styles - now using underline indicator
  tabBadgeActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  tabBadgeTextActive: {
    color: colors.brand[300],
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
  },
  eventImageContainer: {
    height: 140,
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
    height: 80,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  dateBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  dateBadgeText: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.white,
  },
  artistAvatars: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.background,
    overflow: 'hidden',
  },
  artistAvatarImage: {
    width: '100%',
    height: '100%',
  },
  artistCount: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  eventMetaText: {
    fontSize: 12,
  },
  serviceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  serviceTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  serviceTagText: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand[400],
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
  },
  budgetItem: {
    flex: 1,
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  budgetValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  budgetDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: 156,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyStateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  // Calendar View Styles
  calendarView: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: '600',
  },
  calendarNav: {
    flexDirection: 'row',
    gap: 8,
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarGrid: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
  calendarEventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  calendarEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  calendarEventDate: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarEventDay: {
    fontSize: 18,
    fontWeight: '700',
  },
  calendarEventMonth: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  calendarEventInfo: {
    flex: 1,
    marginLeft: 12,
  },
  calendarEventTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  calendarEventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calendarEventLocation: {
    fontSize: 12,
  },
});
