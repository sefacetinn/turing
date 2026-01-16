/**
 * TransportFormModule - Ulaşım Form Modülü
 *
 * Transfer ve ulaşım gereksinimleri için form.
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { LogisticsModuleData, ModuleConfig } from '../../../types/modules';

interface TransportFormModuleProps {
  data?: Partial<LogisticsModuleData>;
  config: ModuleConfig;
  onDataChange?: (data: Partial<LogisticsModuleData>) => void;
  errors?: Record<string, string>;
}

export const TransportFormModule: React.FC<TransportFormModuleProps> = ({
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
      {/* Route Section */}
      <View style={styles.routeSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="navigate" size={18} color={colors.textSecondary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Güzergah</Text>
        </View>

        {/* Departure */}
        <View style={styles.locationBox}>
          <View style={styles.locationIcon}>
            <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
          </View>
          <View style={styles.locationInputs}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  color: colors.text,
                  borderColor: errors.departureCity ? '#EF4444' : isDark ? '#3F3F46' : '#E2E8F0',
                },
              ]}
              value={data.departureCity || ''}
              onChangeText={(text) => handleChange('departureCity', text)}
              placeholder="Kalkış Şehri"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[
                styles.input,
                styles.smallInput,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  color: colors.text,
                  borderColor: isDark ? '#3F3F46' : '#E2E8F0',
                },
              ]}
              value={data.departureAddress || ''}
              onChangeText={(text) => handleChange('departureAddress', text)}
              placeholder="Kalkış Adresi (opsiyonel)"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[
                styles.input,
                styles.smallInput,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  color: colors.text,
                  borderColor: isDark ? '#3F3F46' : '#E2E8F0',
                },
              ]}
              value={data.departureTime || ''}
              onChangeText={(text) => handleChange('departureTime', text)}
              placeholder="Kalkış Tarihi/Saati"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Connection Line */}
        <View style={styles.connectionLine} />

        {/* Arrival */}
        <View style={styles.locationBox}>
          <View style={styles.locationIcon}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          </View>
          <View style={styles.locationInputs}>
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
              placeholder="Varış Şehri"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[
                styles.input,
                styles.smallInput,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  color: colors.text,
                  borderColor: isDark ? '#3F3F46' : '#E2E8F0',
                },
              ]}
              value={data.arrivalAddress || ''}
              onChangeText={(text) => handleChange('arrivalAddress', text)}
              placeholder="Varış Adresi (opsiyonel)"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[
                styles.input,
                styles.smallInput,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  color: colors.text,
                  borderColor: isDark ? '#3F3F46' : '#E2E8F0',
                },
              ]}
              value={data.arrivalTime || ''}
              onChangeText={(text) => handleChange('arrivalTime', text)}
              placeholder="Varış Tarihi/Saati"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>
      </View>

      {/* Passenger Count */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="people" size={16} color="#6366F1" />
          <Text style={[styles.label, { color: colors.text }]}>Yolcu Sayısı</Text>
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
          placeholder="Toplam yolcu sayısı"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      {/* Return Trip Toggle */}
      <TouchableOpacity
        style={[
          styles.toggleRow,
          { backgroundColor: isDark ? '#27272A' : '#F8FAFC' },
        ]}
        onPress={() => handleChange('returnTrip', !data.returnTrip)}
      >
        <View style={styles.toggleInfo}>
          <Ionicons name="swap-horizontal" size={22} color="#10B981" />
          <View>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Gidiş-Dönüş</Text>
            <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
              Dönüş yolculuğu da dahil
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.toggleSwitch,
            {
              backgroundColor: data.returnTrip ? '#10B981' : isDark ? '#3F3F46' : '#E2E8F0',
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

      {/* Return Time */}
      {data.returnTrip && (
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="time" size={16} color="#8B5CF6" />
            <Text style={[styles.label, { color: colors.text }]}>Dönüş Zamanı</Text>
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
            value={data.returnTime || ''}
            onChangeText={(text) => handleChange('returnTime', text)}
            placeholder="Dönüş tarihi/saati"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      )}

      {/* Luggage */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="briefcase" size={16} color="#8B5CF6" />
          <Text style={[styles.label, { color: colors.text }]}>Bagaj Sayısı</Text>
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
          value={data.luggageCount ? String(data.luggageCount) : ''}
          onChangeText={(text) => handleChange('luggageCount', Number(text) || 0)}
          placeholder="Bagaj sayısı"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

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
          placeholder="Ulaşım hakkında ek bilgiler, araç tercihi vb."
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
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  smallInput: {
    marginTop: 8,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  routeSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationBox: {
    flexDirection: 'row',
    gap: 12,
  },
  locationIcon: {
    paddingTop: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  locationInputs: {
    flex: 1,
  },
  connectionLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginLeft: 5,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
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

export default TransportFormModule;
