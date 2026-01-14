import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { gradients } from '../../theme/colors';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 80) / 7;

interface CalendarPickerModalProps {
  visible: boolean;
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  onClose: () => void;
  multiSelect?: boolean;
}

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export function CalendarPickerModal({
  visible,
  selectedDates,
  onDatesChange,
  onClose,
  multiSelect = true,
}: CalendarPickerModalProps) {
  const { colors, isDark } = useTheme();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get day of week (0 = Sunday, convert to Monday = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: (number | null)[] = [];

    // Add empty cells for days before the first
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentMonth, currentYear]);

  const formatDateString = (day: number): string => {
    const month = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${currentYear}-${month}-${dayStr}`;
  };

  const isDateSelected = (day: number): boolean => {
    const dateStr = formatDateString(day);
    return selectedDates.includes(dateStr);
  };

  const isPastDate = (day: number): boolean => {
    const date = new Date(currentYear, currentMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  const isToday = (day: number): boolean => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const handleDatePress = (day: number) => {
    if (isPastDate(day)) return;

    const dateStr = formatDateString(day);

    if (multiSelect) {
      if (selectedDates.includes(dateStr)) {
        onDatesChange(selectedDates.filter(d => d !== dateStr));
      } else {
        onDatesChange([...selectedDates, dateStr].sort());
      }
    } else {
      onDatesChange([dateStr]);
    }
  };

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const formatSelectedDates = (): string => {
    if (selectedDates.length === 0) return '';
    if (selectedDates.length === 1) {
      const [year, month, day] = selectedDates[0].split('-');
      return `${parseInt(day)} ${MONTHS[parseInt(month) - 1]} ${year}`;
    }
    // Sort dates and show range or count
    const sorted = [...selectedDates].sort();
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const [, m1, d1] = first.split('-');
    const [, m2, d2] = last.split('-');
    return `${parseInt(d1)} ${MONTHS[parseInt(m1) - 1]} - ${parseInt(d2)} ${MONTHS[parseInt(m2) - 1]} (${selectedDates.length} gün)`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {multiSelect ? 'Tarihleri Seçin' : 'Tarih Seçin'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity
              style={[styles.monthNavBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
              onPress={goToPrevMonth}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity
              style={[styles.monthNavBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
              onPress={goToNextMonth}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Weekday Headers */}
          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map(day => (
              <View key={day} style={styles.weekdayCell}>
                <Text style={[styles.weekdayText, { color: colors.textMuted }]}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const selected = isDateSelected(day);
              const past = isPastDate(day);
              const todayDate = isToday(day);

              return (
                <TouchableOpacity
                  key={day}
                  style={styles.dayCell}
                  onPress={() => handleDatePress(day)}
                  disabled={past}
                >
                  <View style={[
                    styles.dayContent,
                    todayDate && !selected && { borderWidth: 2, borderColor: colors.brand[400] },
                    selected && styles.dayContentSelected,
                    past && styles.dayContentPast,
                  ]}>
                    {selected ? (
                      <LinearGradient
                        colors={gradients.primary}
                        style={styles.selectedGradient}
                      >
                        <Text style={styles.dayTextSelected}>{day}</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={[
                        styles.dayText,
                        { color: past ? colors.textMuted : colors.text },
                        past && styles.dayTextPast,
                      ]}>
                        {day}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Dates Display */}
          {selectedDates.length > 0 && (
            <View style={[styles.selectedInfo, { backgroundColor: isDark ? 'rgba(147,51,234,0.1)' : 'rgba(147,51,234,0.08)' }]}>
              <Ionicons name="calendar" size={18} color={colors.brand[400]} />
              <Text style={[styles.selectedInfoText, { color: colors.text }]}>
                {formatSelectedDates()}
              </Text>
              {multiSelect && selectedDates.length > 0 && (
                <TouchableOpacity onPress={() => onDatesChange([])}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Info Text for Multi-select */}
          {multiSelect && (
            <Text style={[styles.infoText, { color: colors.textMuted }]}>
              Birden fazla gün seçebilirsiniz (festival, çok günlü etkinlikler için)
            </Text>
          )}

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.confirmButton, selectedDates.length === 0 && styles.confirmButtonDisabled]}
            onPress={onClose}
            disabled={selectedDates.length === 0}
          >
            <LinearGradient
              colors={selectedDates.length > 0 ? gradients.primary : (isDark ? ['#3f3f46', '#3f3f46'] : ['#d4d4d8', '#d4d4d8'])}
              style={styles.confirmButtonGradient}
            >
              <Text style={styles.confirmButtonText}>
                {selectedDates.length > 0 ? 'Tamam' : 'Tarih Seçin'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
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
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  monthNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekdaysRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  weekdayCell: {
    width: CELL_SIZE,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayContent: {
    width: CELL_SIZE - 8,
    height: CELL_SIZE - 8,
    borderRadius: (CELL_SIZE - 8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayContentSelected: {
    overflow: 'hidden',
  },
  dayContentPast: {
    opacity: 0.4,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dayTextPast: {
    textDecorationLine: 'line-through',
  },
  dayTextSelected: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  selectedGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (CELL_SIZE - 8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
  },
  selectedInfoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 12,
  },
  confirmButton: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
