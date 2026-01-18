import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { darkTheme as defaultColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { providerEvents } from '../data/providerEventsData';
import { events as organizerEvents } from '../data/mockData';
import {
  CalendarEvent,
  transformProviderEvents,
  transformOrganizerEvents,
  getDaysInMonth,
  getWeekDays,
  isSameDay,
  isDateInRange,
  getCategoryColor,
  MONTH_NAMES,
  DAY_NAMES_SHORT,
} from '../utils/calendarUtils';

const colors = defaultColors;

const { width } = Dimensions.get('window');
const DAY_WIDTH = (width - 40 - 6 * 4) / 7; // 7 days with gaps

type ViewMode = 'month' | 'week';

interface CalendarViewScreenProps {
  isProviderMode?: boolean;
}

export function CalendarViewScreen({ isProviderMode = false }: CalendarViewScreenProps) {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Bugun secili
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const today = new Date();

  // Mode-aware veri secimi
  const calendarEvents = useMemo(() => {
    if (isProviderMode) {
      return transformProviderEvents(providerEvents);
    }
    return transformOrganizerEvents(organizerEvents);
  }, [isProviderMode]);

  // Calculate displayed days
  const displayedDays = useMemo(() => {
    if (viewMode === 'month') {
      return getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    } else {
      return getWeekDays(currentDate);
    }
  }, [currentDate, viewMode]);

  // Get events for a specific date (multi-day event destegi)
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    let filtered = calendarEvents.filter(event => isDateInRange(date, event.date, event.endDate));
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    return filtered;
  };

  // Navigate months/weeks
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Get events for selected date
  const selectedDateEvents = getEventsForDate(selectedDate);

  // Toggle category filter
  const toggleCategoryFilter = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  // Status helpers
  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      active: 'Aktif',
      planned: 'Planlanan',
      past: 'Tamamlandi',
      confirmed: 'Onayli',
      planning: 'Planlama',
      draft: 'Taslak',
      completed: 'Bitti',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
      case 'confirmed':
        return '#10B981';
      case 'planned':
      case 'planning':
        return '#4b30b8';
      case 'past':
      case 'completed':
        return '#3b82f6';
      case 'draft':
        return '#71717a';
      default:
        return '#71717a';
    }
  };

  const getStatusBgColor = (status: string): string => {
    switch (status) {
      case 'active':
      case 'confirmed':
        return 'rgba(16, 185, 129, 0.15)';
      case 'planned':
      case 'planning':
        return 'rgba(75, 48, 184, 0.15)';
      case 'past':
      case 'completed':
        return 'rgba(59, 130, 246, 0.15)';
      case 'draft':
        return 'rgba(113, 113, 122, 0.15)';
      default:
        return 'rgba(113, 113, 122, 0.15)';
    }
  };

  const renderDayCell = (date: Date, index: number) => {
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    const isToday = isSameDay(date, today);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const events = getEventsForDate(date);
    const hasEvents = events.length > 0;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          viewMode === 'week' && styles.dayCellWeek,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setSelectedDate(date);
        }}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.dayContent,
            isSelected && { backgroundColor: colors.brand[600] },
            isToday && !isSelected && { borderWidth: 1, borderColor: colors.brand[400] },
          ]}
        >
          <Text
            style={[
              styles.dayText,
              { color: colors.text },
              !isCurrentMonth && { color: colors.textSecondary },
              isSelected && { color: colors.white, fontWeight: '600' },
              isToday && !isSelected && { color: colors.brand[400] },
            ]}
          >
            {date.getDate()}
          </Text>

          {/* Event indicators */}
          {hasEvents && (
            <View style={styles.eventIndicators}>
              {events.slice(0, 3).map((event, i) => (
                <View
                  key={i}
                  style={[
                    styles.eventDot,
                    { backgroundColor: getCategoryColor(event.category) },
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Takvim</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={[styles.todayButtonText, { color: colors.brand[400] }]}>Bugün</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <View style={[styles.viewModeToggle, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground }]}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'month' && styles.viewModeButtonActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setViewMode('month');
            }}
          >
            <Text style={[styles.viewModeText, { color: viewMode === 'month' ? colors.white : colors.textMuted }]}>
              Ay
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'week' && styles.viewModeButtonActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setViewMode('week');
            }}
          >
            <Text style={[styles.viewModeText, { color: viewMode === 'week' ? colors.white : colors.textMuted }]}>
              Hafta
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Month/Week Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={[styles.navButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground }]} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigatePrevious();
        }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.monthYearText, { color: colors.text }]}>
          {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity style={[styles.navButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground }]} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigateNext();
        }}>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Day Names Header */}
      <View style={styles.dayNamesContainer}>
        {DAY_NAMES_SHORT.map((name, index) => (
          <View key={index} style={styles.dayNameCell}>
            <Text style={[
              styles.dayNameText,
              { color: colors.textMuted },
              (index === 5 || index === 6) && { color: colors.textSecondary }
            ]}>
              {name}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={[styles.calendarGrid, viewMode === 'week' && styles.calendarGridWeek]}>
        {displayedDays.map((date, index) => renderDayCell(date, index))}
      </View>

      {/* Selected Date Events */}
      <View style={styles.eventsSection}>
        <View style={styles.eventsSectionHeader}>
          <Text style={[styles.eventsSectionTitle, { color: colors.text }]}>
            {selectedDate
              ? `${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`
              : 'Tarih Seçin'}
          </Text>
          <Text style={[styles.eventsSectionCount, { color: colors.textMuted }]}>
            {selectedDateEvents.length} etkinlik
          </Text>
        </View>

        <ScrollView
          style={styles.eventsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand[500]}
              colors={[colors.brand[500]]}
            />
          }
        >
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventItem,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                    ...(isDark ? {} : helpers.getShadow('sm')),
                  },
                ]}
                onPress={() => navigation.navigate(
                  isProviderMode ? 'ProviderEventDetail' : 'OrganizerEventDetail',
                  { eventId: event.id }
                )}
              >
                <View
                  style={[
                    styles.eventCategoryLine,
                    { backgroundColor: getCategoryColor(event.category) },
                  ]}
                />
                <View style={styles.eventItemContent}>
                  <View style={styles.eventItemHeader}>
                    <Text style={[styles.eventItemTime, { color: colors.brand[400] }]}>{event.time}</Text>
                    <View style={[
                      styles.eventStatusBadge,
                      { backgroundColor: getStatusBgColor(event.status) }
                    ]}>
                      <Text style={[
                        styles.eventStatusText,
                        { color: getStatusColor(event.status) }
                      ]}>
                        {getStatusLabel(event.status)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.eventItemTitle, { color: colors.text }]}>{event.title}</Text>
                  <View style={styles.eventItemMeta}>
                    <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                    <Text style={[styles.eventItemVenue, { color: colors.textMuted }]}>{event.venue}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noEvents}>
              <Ionicons name="calendar-outline" size={32} color={colors.textSecondary} />
              <Text style={[styles.noEventsText, { color: colors.textMuted }]}>
                Bu tarihte etkinlik yok
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Legend - Tiklanabilir filtreler */}
      <View style={[styles.legend, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
        <TouchableOpacity
          style={[styles.legendItem, selectedCategory === 'booking' && styles.legendItemActive]}
          onPress={() => toggleCategoryFilter('booking')}
        >
          <View style={[styles.legendDot, { backgroundColor: '#4b30b8' }]} />
          <Text style={[styles.legendText, { color: selectedCategory === 'booking' ? colors.text : colors.textMuted }]}>Booking</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.legendItem, selectedCategory === 'technical' && styles.legendItemActive]}
          onPress={() => toggleCategoryFilter('technical')}
        >
          <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
          <Text style={[styles.legendText, { color: selectedCategory === 'technical' ? colors.text : colors.textMuted }]}>Teknik</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.legendItem, selectedCategory === 'security' && styles.legendItemActive]}
          onPress={() => toggleCategoryFilter('security')}
        >
          <View style={[styles.legendDot, { backgroundColor: '#7c3aed' }]} />
          <Text style={[styles.legendText, { color: selectedCategory === 'security' ? colors.text : colors.textMuted }]}>Guvenlik</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.legendItem, selectedCategory === 'catering' && styles.legendItemActive]}
          onPress={() => toggleCategoryFilter('catering')}
        >
          <View style={[styles.legendDot, { backgroundColor: '#d97706' }]} />
          <Text style={[styles.legendText, { color: selectedCategory === 'catering' ? colors.text : colors.textMuted }]}>Catering</Text>
        </TouchableOpacity>
        {selectedCategory && (
          <TouchableOpacity
            style={styles.clearFilter}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
    borderRadius: 8,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  viewModeContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  viewModeButtonActive: {
    backgroundColor: colors.brand[600],
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewModeTextActive: {},
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
  },
  dayNamesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dayNameWeekend: {},
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 4,
  },
  calendarGridWeek: {
    marginBottom: 16,
  },
  dayCell: {
    width: DAY_WIDTH,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellWeek: {
    aspectRatio: 0.8,
  },
  dayContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  dayContentSelected: {
    backgroundColor: colors.brand[600],
  },
  dayContentToday: {
    borderWidth: 1,
    borderColor: colors.brand[400],
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dayTextOtherMonth: {},
  dayTextSelected: {
    fontWeight: '600',
  },
  dayTextToday: {},
  eventIndicators: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  eventsSection: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventsSectionCount: {
    fontSize: 13,
  },
  eventsList: {
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  eventCategoryLine: {
    width: 4,
    alignSelf: 'stretch',
  },
  eventItemContent: {
    flex: 1,
    padding: 12,
  },
  eventItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  eventItemTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  eventItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventItemVenue: {
    fontSize: 11,
  },
  noEvents: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 14,
    marginTop: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  legendItemActive: {
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
  },
  clearFilter: {
    marginLeft: 4,
  },
});
