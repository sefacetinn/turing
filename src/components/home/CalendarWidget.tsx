import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import {
  CalendarEvent,
  getNextDays,
  isSameDay,
  getCategoryColor,
  DAY_NAMES_SHORT,
} from '../../utils/calendarUtils';

interface CalendarWidgetProps {
  events: CalendarEvent[];
  onPress: () => void;
}

export function CalendarWidget({ events, onPress }: CalendarWidgetProps) {
  const { colors, isDark, helpers } = useTheme();

  const today = new Date();
  const next7Days = useMemo(() => getNextDays(7, today), []);

  // Belirli bir gun icin etkinlik sayisi
  const getEventCountForDate = (date: Date): number => {
    return events.filter((event) => {
      if (event.endDate) {
        const dateTime = date.getTime();
        const startTime = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate()).getTime();
        const endTime = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate()).getTime();
        return dateTime >= startTime && dateTime <= endTime;
      }
      return isSameDay(event.date, date);
    }).length;
  };

  // Bu haftaki toplam etkinlik sayisi
  const totalEventsThisWeek = useMemo(() => {
    return next7Days.reduce((sum, day) => sum + getEventCountForDate(day), 0);
  }, [events, next7Days]);

  // Gun ismini al (Pzt, Sal, vb.)
  const getDayName = (date: Date): string => {
    const dayIndex = date.getDay();
    // Sunday (0) -> index 6 (Paz), Monday (1) -> index 0 (Pzt)
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    return DAY_NAMES_SHORT[adjustedIndex];
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.cardBackground,
          borderColor: colors.border,
          ...(isDark ? {} : helpers.getShadow('sm')),
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <Ionicons name="calendar" size={16} color="#3b82f6" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Takvim</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Bu Hafta ({totalEventsThisWeek} etkinlik)
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      </View>

      {/* Days Row */}
      <View style={styles.daysRow}>
        {next7Days.map((day, index) => {
          const eventCount = getEventCountForDate(day);
          const isToday = isSameDay(day, today);

          return (
            <View key={index} style={styles.dayItem}>
              <Text
                style={[
                  styles.dayName,
                  { color: colors.textMuted },
                  isToday && { color: colors.brand[400] },
                ]}
              >
                {getDayName(day)}
              </Text>
              <View
                style={[
                  styles.dayNumber,
                  isToday && { backgroundColor: colors.brand[600] },
                ]}
              >
                <Text
                  style={[
                    styles.dayNumberText,
                    { color: colors.text },
                    isToday && { color: colors.white },
                  ]}
                >
                  {day.getDate()}
                </Text>
              </View>
              {eventCount > 0 && (
                <View style={styles.eventDots}>
                  {eventCount === 1 && (
                    <View style={[styles.eventDot, { backgroundColor: colors.brand[500] }]} />
                  )}
                  {eventCount === 2 && (
                    <>
                      <View style={[styles.eventDot, { backgroundColor: colors.brand[500] }]} />
                      <View style={[styles.eventDot, { backgroundColor: '#059669' }]} />
                    </>
                  )}
                  {eventCount >= 3 && (
                    <>
                      <View style={[styles.eventDot, { backgroundColor: colors.brand[500] }]} />
                      <View style={[styles.eventDot, { backgroundColor: '#059669' }]} />
                      <View style={[styles.eventDot, { backgroundColor: '#d97706' }]} />
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtitle: {
    fontSize: 12,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '500',
  },
  dayNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: '600',
  },
  eventDots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
