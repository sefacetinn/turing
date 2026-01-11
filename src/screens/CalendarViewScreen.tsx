import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';

const { width } = Dimensions.get('window');
const DAY_WIDTH = (width - 40 - 6 * 4) / 7; // 7 days with gaps

type ViewMode = 'month' | 'week';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  category: string;
  status: string;
  venue: string;
}

interface CalendarViewScreenProps {
  isProviderMode?: boolean;
}

// Helper functions
const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Add days from previous month to start on Monday
  const startDay = firstDay.getDay() || 7; // Convert Sunday (0) to 7
  for (let i = startDay - 1; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length; // 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

const getWeekDays = (date: Date): Date[] => {
  const days: Date[] = [];
  const day = date.getDay() || 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - day + 1);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }

  return days;
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
};

// Mock events for calendar
const mockCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Yaz Festivali 2024',
    date: new Date(2024, 6, 15),
    time: '16:00',
    category: 'booking',
    status: 'confirmed',
    venue: 'KüsümPark',
  },
  {
    id: '2',
    title: 'Kurumsal Gala',
    date: new Date(2024, 7, 22),
    time: '19:00',
    category: 'venue',
    status: 'planning',
    venue: 'JW Marriott',
  },
  {
    id: '3',
    title: 'Düğün Organizasyonu',
    date: new Date(2024, 8, 1),
    time: '18:00',
    category: 'booking',
    status: 'draft',
    venue: 'Çırağan Palace',
  },
  {
    id: '4',
    title: 'Tech Conference',
    date: new Date(2024, 9, 10),
    time: '09:00',
    category: 'technical',
    status: 'planning',
    venue: 'Haliç Kongre',
  },
];

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = {
    booking: '#9333ea',
    technical: '#059669',
    venue: '#2563eb',
    accommodation: '#db2777',
    transport: '#dc2626',
    flight: '#475569',
    operation: '#d97706',
  };
  return categoryColors[category] || '#9333ea';
};

export function CalendarViewScreen({ isProviderMode = false }: CalendarViewScreenProps) {
  const navigation = useNavigation<any>();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();

  // Calculate displayed days
  const displayedDays = useMemo(() => {
    if (viewMode === 'month') {
      return getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    } else {
      return getWeekDays(currentDate);
    }
  }, [currentDate, viewMode]);

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return mockCalendarEvents.filter(event => isSameDay(event.date, date));
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
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

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
        onPress={() => setSelectedDate(date)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.dayContent,
            isSelected && styles.dayContentSelected,
            isToday && !isSelected && styles.dayContentToday,
          ]}
        >
          <Text
            style={[
              styles.dayText,
              !isCurrentMonth && styles.dayTextOtherMonth,
              isSelected && styles.dayTextSelected,
              isToday && !isSelected && styles.dayTextToday,
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Takvim</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Bugün</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'month' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('month')}
          >
            <Text style={[styles.viewModeText, viewMode === 'month' && styles.viewModeTextActive]}>
              Ay
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'week' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.viewModeText, viewMode === 'week' && styles.viewModeTextActive]}>
              Hafta
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Month/Week Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navButton} onPress={navigatePrevious}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.monthYearText}>
          {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity style={styles.navButton} onPress={navigateNext}>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Day Names Header */}
      <View style={styles.dayNamesContainer}>
        {DAY_NAMES.map((name, index) => (
          <View key={index} style={styles.dayNameCell}>
            <Text style={[
              styles.dayNameText,
              (index === 5 || index === 6) && styles.dayNameWeekend
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
          <Text style={styles.eventsSectionTitle}>
            {selectedDate
              ? `${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`
              : 'Tarih Seçin'}
          </Text>
          <Text style={styles.eventsSectionCount}>
            {selectedDateEvents.length} etkinlik
          </Text>
        </View>

        <ScrollView
          style={styles.eventsList}
          showsVerticalScrollIndicator={false}
        >
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventItem}
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
                    <Text style={styles.eventItemTime}>{event.time}</Text>
                    <View style={[
                      styles.eventStatusBadge,
                      { backgroundColor: event.status === 'confirmed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(147, 51, 234, 0.15)' }
                    ]}>
                      <Text style={[
                        styles.eventStatusText,
                        { color: event.status === 'confirmed' ? colors.success : colors.brand[400] }
                      ]}>
                        {event.status === 'confirmed' ? 'Onaylı' : event.status === 'planning' ? 'Planlama' : 'Taslak'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.eventItemTitle}>{event.title}</Text>
                  <View style={styles.eventItemMeta}>
                    <Ionicons name="location-outline" size={12} color={colors.zinc[500]} />
                    <Text style={styles.eventItemVenue}>{event.venue}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.zinc[500]} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noEvents}>
              <Ionicons name="calendar-outline" size={32} color={colors.zinc[600]} />
              <Text style={styles.noEventsText}>
                {selectedDate ? 'Bu tarihte etkinlik yok' : 'Bir tarih seçin'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#9333ea' }]} />
          <Text style={styles.legendText}>Booking</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
          <Text style={styles.legendText}>Teknik</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} />
          <Text style={styles.legendText}>Mekan</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#d97706' }]} />
          <Text style={styles.legendText}>Operasyon</Text>
        </View>
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
    color: colors.text,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderRadius: 8,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand[400],
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
    color: colors.zinc[400],
  },
  viewModeTextActive: {
    color: colors.white,
  },
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
    color: colors.text,
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
    color: colors.zinc[500],
  },
  dayNameWeekend: {
    color: colors.zinc[600],
  },
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
    color: colors.text,
  },
  dayTextOtherMonth: {
    color: colors.zinc[700],
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  dayTextToday: {
    color: colors.brand[400],
  },
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
    color: colors.text,
  },
  eventsSectionCount: {
    fontSize: 13,
    color: colors.zinc[500],
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
    color: colors.brand[400],
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
    color: colors.text,
    marginBottom: 4,
  },
  eventItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventItemVenue: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  noEvents: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 14,
    color: colors.zinc[500],
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
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: colors.zinc[500],
  },
});
