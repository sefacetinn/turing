/**
 * DateTimeFormModule - Tarih/Saat Form Modülü
 *
 * Etkinlik tarihi ve saat bilgileri için form alanlarını render eder.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { DateTimeModuleData, ModuleConfig } from '../../../types/modules';

interface DateTimeFormModuleProps {
  data?: Partial<DateTimeModuleData>;
  config: ModuleConfig;
  onDataChange?: (data: Partial<DateTimeModuleData>) => void;
  errors?: Record<string, string>;
}

const DURATION_OPTIONS = [
  { label: '1 Saat', value: '1 saat' },
  { label: '2 Saat', value: '2 saat' },
  { label: '3 Saat', value: '3 saat' },
  { label: '4 Saat', value: '4 saat' },
  { label: '5+ Saat', value: '5+ saat' },
  { label: 'Tam Gün', value: 'tam gün' },
];

export const DateTimeFormModule: React.FC<DateTimeFormModuleProps> = ({
  data = {},
  config,
  onDataChange,
  errors = {},
}) => {
  const { colors, isDark } = useTheme();

  const handleChange = (field: keyof DateTimeModuleData, value: any) => {
    onDataChange?.({ ...data, [field]: value });
  };

  const formatDateForDisplay = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const renderTimeInput = (
    label: string,
    field: keyof DateTimeModuleData,
    icon: string,
    iconColor: string
  ) => {
    const error = errors[field];

    return (
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name={icon as any} size={16} color={iconColor} />
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#27272A' : '#F8FAFC',
              color: colors.text,
              borderColor: error ? '#EF4444' : isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
          value={String(data[field] || '')}
          onChangeText={(text) => handleChange(field, text)}
          placeholder="00:00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numbers-and-punctuation"
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Event Date */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="calendar" size={16} color="#6366F1" />
          <Text style={[styles.label, { color: colors.text }]}>Etkinlik Tarihi</Text>
          <Text style={styles.required}>*</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.dateButton,
            {
              backgroundColor: isDark ? '#27272A' : '#F8FAFC',
              borderColor: errors.eventDate ? '#EF4444' : isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
        >
          <TextInput
            style={[styles.dateInput, { color: colors.text }]}
            value={data.eventDate || ''}
            onChangeText={(text) => handleChange('eventDate', text)}
            placeholder="YYYY-AA-GG"
            placeholderTextColor={colors.textSecondary}
          />
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        {data.eventDate && (
          <Text style={[styles.datePreview, { color: colors.textSecondary }]}>
            {formatDateForDisplay(data.eventDate)}
          </Text>
        )}
        {errors.eventDate && <Text style={styles.errorText}>{errors.eventDate}</Text>}
      </View>

      {/* Event Time */}
      <View style={styles.row}>
        {renderTimeInput('Başlangıç Saati', 'eventTime', 'time', '#10B981')}
      </View>

      {/* Duration Selection */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="hourglass" size={16} color="#F59E0B" />
          <Text style={[styles.label, { color: colors.text }]}>Süre</Text>
        </View>
        <View style={styles.durationGrid}>
          {DURATION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.durationChip,
                {
                  backgroundColor: data.duration === option.value
                    ? colors.primary
                    : isDark ? '#27272A' : '#F1F5F9',
                },
              ]}
              onPress={() => handleChange('duration', option.value)}
            >
              <Text
                style={[
                  styles.durationText,
                  { color: data.duration === option.value ? '#FFFFFF' : colors.text },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Additional Times Section */}
      <View style={styles.sectionHeader}>
        <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ek Saat Bilgileri</Text>
        <Text style={[styles.optional, { color: colors.textSecondary }]}>(Opsiyonel)</Text>
      </View>

      <View style={styles.additionalTimes}>
        {/* Doors Open Time */}
        {renderTimeInput('Kapı Açılış', 'doorsOpenTime', 'enter', '#8B5CF6')}

        {/* Soundcheck Time */}
        {renderTimeInput('Ses Kontrolü', 'soundcheckTime', 'mic', '#EC4899')}

        {/* Load In Time */}
        {renderTimeInput('Yükleme Saati', 'loadInTime', 'cube', '#14B8A6')}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  required: {
    color: '#EF4444',
    fontSize: 14,
  },
  optional: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingRight: 12,
  },
  dateInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
  },
  datePreview: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  additionalTimes: {
    gap: 0,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  toggleHint: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 4,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
});

export default DateTimeFormModule;
