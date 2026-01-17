import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { months, generateDays, generateYears } from '../../data/createEventData';

interface DatePickerModalProps {
  visible: boolean;
  day: string;
  month: string;
  year: string;
  onDayChange: (day: string) => void;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  onClose: () => void;
}

export function DatePickerModal({
  visible,
  day,
  month,
  year,
  onDayChange,
  onMonthChange,
  onYearChange,
  onClose,
}: DatePickerModalProps) {
  const { colors, isDark } = useTheme();
  const days = generateDays();
  const years = generateYears();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Tarih Seçin</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.datePickerRow}>
            <View style={styles.datePickerColumn}>
              <Text style={[styles.datePickerLabel, { color: colors.textSecondary }]}>Gün</Text>
              <ScrollView
                style={[styles.datePickerScroll, {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
                }]}
                showsVerticalScrollIndicator={false}
              >
                {days.map(d => (
                  <TouchableOpacity
                    key={d.value}
                    style={[
                      styles.datePickerItem,
                      day === d.value && {
                        backgroundColor: isDark ? 'rgba(75, 48, 184, 0.2)' : 'rgba(75, 48, 184, 0.15)'
                      }
                    ]}
                    onPress={() => onDayChange(d.value)}
                  >
                    <Text
                      style={[
                        styles.datePickerItemText,
                        { color: colors.textMuted },
                        day === d.value && { color: colors.brand[400], fontWeight: '600' }
                      ]}
                    >
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.datePickerColumn}>
              <Text style={[styles.datePickerLabel, { color: colors.textSecondary }]}>Ay</Text>
              <ScrollView
                style={[styles.datePickerScroll, {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
                }]}
                showsVerticalScrollIndicator={false}
              >
                {months.map(m => (
                  <TouchableOpacity
                    key={m.value}
                    style={[
                      styles.datePickerItem,
                      month === m.value && {
                        backgroundColor: isDark ? 'rgba(75, 48, 184, 0.2)' : 'rgba(75, 48, 184, 0.15)'
                      }
                    ]}
                    onPress={() => onMonthChange(m.value)}
                  >
                    <Text
                      style={[
                        styles.datePickerItemText,
                        { color: colors.textMuted },
                        month === m.value && { color: colors.brand[400], fontWeight: '600' }
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.datePickerColumn}>
              <Text style={[styles.datePickerLabel, { color: colors.textSecondary }]}>Yıl</Text>
              <ScrollView
                style={[styles.datePickerScroll, {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
                }]}
                showsVerticalScrollIndicator={false}
              >
                {years.map(y => (
                  <TouchableOpacity
                    key={y.value}
                    style={[
                      styles.datePickerItem,
                      year === y.value && {
                        backgroundColor: isDark ? 'rgba(75, 48, 184, 0.2)' : 'rgba(75, 48, 184, 0.15)'
                      }
                    ]}
                    onPress={() => onYearChange(y.value)}
                  >
                    <Text
                      style={[
                        styles.datePickerItemText,
                        { color: colors.textMuted },
                        year === y.value && { color: colors.brand[400], fontWeight: '600' }
                      ]}
                    >
                      {y.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <TouchableOpacity
            style={styles.modalConfirmButton}
            onPress={onClose}
          >
            <Text style={styles.modalConfirmButtonText}>Tamam</Text>
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
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  datePickerRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  datePickerColumn: {
    flex: 1,
  },
  datePickerLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  datePickerScroll: {
    height: 200,
    borderRadius: 12,
    paddingVertical: 4,
  },
  datePickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    marginVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerItemText: {
    fontSize: 15,
  },
  modalConfirmButton: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: '#4b30b8',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
