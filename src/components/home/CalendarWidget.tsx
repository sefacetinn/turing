import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import {
  CalendarEvent,
  getNextDays,
  isDateInRange,
  isSameDay,
  DAY_NAMES_SHORT,
} from '../../utils/calendarUtils';

interface CalendarWidgetProps {
  events: CalendarEvent[];
  onPress: () => void;
}

export function CalendarWidget({ events, onPress }: CalendarWidgetProps) {
  const { colors, isDark, helpers } = useTheme();

  // Get next 7 days
  const nextDays = useMemo(() => getNextDays(7), []);

  // Check if a day has events
  const hasEventsOnDay = (date: Date): boolean => {
    return events.some(event => isDateInRange(date, event.date, event.endDate));
  };

  // Get events count for next 7 days
  const upcomingEventsCount = useMemo(() => {
    const uniqueEvents = new Set<string>();
    nextDays.forEach(day => {
      events.forEach(event => {
        if (isDateInRange(day, event.date, event.endDate)) {
          uniqueEvents.add(event.id);
        }
      });
    });
    return uniqueEvents.size;
  }, [events, nextDays]);

  const today = new Date();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
        },
        !isDark && helpers.getShadow('sm'),
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar" size={20} color={colors.brand[400]} />
          <Text style={[styles.title, { color: colors.text }]}>Takvim</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {upcomingEventsCount > 0 ? `${upcomingEventsCount} etkinlik` : 'Bu hafta'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </View>

      {/* Days Grid */}
      <View style={styles.daysContainer}>
        {nextDays.map((day, index) => {
          const isToday = isSameDay(day, today);
          const hasEvents = hasEventsOnDay(day);
          const dayIndex = (day.getDay() + 6) % 7; // Monday = 0

          return (
            <View key={index} style={styles.dayItem}>
              <Text
                style={[
                  styles.dayName,
                  { color: isToday ? colors.brand[400] : colors.textMuted },
                ]}
              >
                {DAY_NAMES_SHORT[dayIndex]}
              </Text>
              <View
                style={[
                  styles.dayNumber,
                  isToday && { backgroundColor: colors.brand[400] },
                ]}
              >
                <Text
                  style={[
                    styles.dayNumberText,
                    { color: isToday ? 'white' : colors.text },
                  ]}
                >
                  {day.getDate()}
                </Text>
              </View>
              {hasEvents && (
                <View
                  style={[
                    styles.eventDot,
                    { backgroundColor: isToday ? colors.brand[300] : colors.brand[400] },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* Upcoming Events Preview */}
      {upcomingEventsCount > 0 && (
        <View style={[styles.previewContainer, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
          <Text style={[styles.previewText, { color: colors.textSecondary }]}>
            {`${upcomingEventsCount} etkinlik yaklasiyor`}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    flex: 1,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
  previewContainer: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  previewText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
