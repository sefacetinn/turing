/**
 * AccommodationFormModule - Konaklama Form Modülü
 *
 * Konaklama gereksinimleri için form.
 * LogisticsModuleData kullanarak konaklama bilgilerini toplar.
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { LogisticsModuleData, ModuleConfig } from '../../../types/modules';

interface AccommodationFormModuleProps {
  data?: Partial<LogisticsModuleData>;
  config: ModuleConfig;
  onDataChange?: (data: Partial<LogisticsModuleData>) => void;
  errors?: Record<string, string>;
}

export const AccommodationFormModule: React.FC<AccommodationFormModuleProps> = ({
  data = {},
  config,
  onDataChange,
  errors = {},
}) => {
  const { colors, isDark } = useTheme();

  const handleChange = (field: keyof LogisticsModuleData, value: any) => {
    onDataChange?.({ ...data, [field]: value });
  };

  return (
    <View style={styles.container}>
      {/* Location */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="location" size={16} color="#8B5CF6" />
          <Text style={[styles.label, { color: colors.text }]}>Konaklama Şehri</Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#27272A' : '#F8FAFC',
              color: colors.text,
              borderColor: errors.arrivalCity ? '#EF4444' : isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
          value={data.arrivalCity || ''}
          onChangeText={(text) => handleChange('arrivalCity', text)}
          placeholder="Konaklama yapılacak şehir"
          placeholderTextColor={colors.textSecondary}
        />
        {errors.arrivalCity && (
          <Text style={styles.errorText}>{errors.arrivalCity}</Text>
        )}
      </View>

      {/* Address */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="business" size={16} color="#3B82F6" />
          <Text style={[styles.label, { color: colors.text }]}>Konaklama Adresi</Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#27272A' : '#F8FAFC',
              color: colors.text,
              borderColor: isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
          value={data.arrivalAddress || ''}
          onChangeText={(text) => handleChange('arrivalAddress', text)}
          placeholder="Otel/konaklama adresi (opsiyonel)"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Check-in/Check-out Times */}
      <View style={styles.inputGroup}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={18} color={colors.textSecondary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tarihler</Text>
        </View>
        <View style={styles.datesRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Giriş</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  color: colors.text,
                  borderColor: isDark ? '#3F3F46' : '#E2E8F0',
                },
              ]}
              value={data.arrivalTime || ''}
              onChangeText={(text) => handleChange('arrivalTime', text)}
              placeholder="YYYY-AA-GG"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Çıkış</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  color: colors.text,
                  borderColor: isDark ? '#3F3F46' : '#E2E8F0',
                },
              ]}
              value={data.returnTime || ''}
              onChangeText={(text) => handleChange('returnTime', text)}
              placeholder="YYYY-AA-GG"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>
      </View>

      {/* Guest Count */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="people" size={16} color="#10B981" />
          <Text style={[styles.label, { color: colors.text }]}>Kişi Sayısı</Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#27272A' : '#F8FAFC',
              color: colors.text,
              borderColor: isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
          value={data.passengerCount ? String(data.passengerCount) : ''}
          onChangeText={(text) => handleChange('passengerCount', Number(text) || 0)}
          placeholder="Konaklanacak kişi sayısı"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      {/* Return Trip Toggle (for multi-day) */}
      <TouchableOpacity
        style={[
          styles.toggleRow,
          { backgroundColor: isDark ? '#27272A' : '#F8FAFC' },
        ]}
        onPress={() => handleChange('returnTrip', !data.returnTrip)}
      >
        <View style={styles.toggleInfo}>
          <Ionicons name="swap-horizontal" size={22} color="#6366F1" />
          <View>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Çoklu Gün</Text>
            <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
              Birden fazla gece konaklama
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.toggleSwitch,
            {
              backgroundColor: data.returnTrip ? '#6366F1' : isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              { transform: [{ translateX: data.returnTrip ? 20 : 0 }] },
            ]}
          />
        </View>
      </TouchableOpacity>

      {/* Special Requests */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="document-text" size={16} color="#F59E0B" />
          <Text style={[styles.label, { color: colors.text }]}>Özel İstekler</Text>
        </View>
        <TextInput
          style={[
            styles.input,
            styles.multilineInput,
            {
              backgroundColor: isDark ? '#27272A' : '#F8FAFC',
              color: colors.text,
              borderColor: isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
          value={data.specialRequests || ''}
          onChangeText={(text) => handleChange('specialRequests', text)}
          placeholder="Oda tipi, yıldız tercihi, kahvaltı, konum tercihi vb."
          placeholderTextColor={colors.textSecondary}
          multiline
        />
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
  subLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12,
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});

export default AccommodationFormModule;
