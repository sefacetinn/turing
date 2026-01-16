/**
 * ParticipantFormModule - Katılımcı Form Modülü
 *
 * Katılımcı sayısı, yaş sınırı ve VIP alanı bilgileri için form.
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { ParticipantModuleData, ModuleConfig } from '../../../types/modules';

interface ParticipantFormModuleProps {
  data?: Partial<ParticipantModuleData>;
  config: ModuleConfig;
  onDataChange?: (data: Partial<ParticipantModuleData>) => void;
  errors?: Record<string, string>;
}

const AGE_LIMITS = [
  { id: 'all', label: 'Her Yaş' },
  { id: '7+', label: '7+' },
  { id: '12+', label: '12+' },
  { id: '16+', label: '16+' },
  { id: '18+', label: '18+' },
  { id: '21+', label: '21+' },
];

const PARTICIPANT_TYPES = [
  { id: 'general', label: 'Genel Katılımcı', icon: 'people' },
  { id: 'corporate', label: 'Kurumsal', icon: 'business' },
  { id: 'private', label: 'Özel Davet', icon: 'ribbon' },
  { id: 'students', label: 'Öğrenci', icon: 'school' },
];

export const ParticipantFormModule: React.FC<ParticipantFormModuleProps> = ({
  data = {},
  config,
  onDataChange,
  errors = {},
}) => {
  const { colors, isDark } = useTheme();

  const handleChange = (field: keyof ParticipantModuleData, value: any) => {
    onDataChange?.({ ...data, [field]: value });
  };

  return (
    <View style={styles.container}>
      {/* Expected Count */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="people" size={16} color="#3B82F6" />
          <Text style={[styles.label, { color: colors.text }]}>Beklenen Katılımcı Sayısı</Text>
          <Text style={styles.required}>*</Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#27272A' : '#F8FAFC',
              color: colors.text,
              borderColor: errors.expectedCount ? '#EF4444' : isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
          value={data.expectedCount ? String(data.expectedCount) : ''}
          onChangeText={(text) => handleChange('expectedCount', Number(text) || 0)}
          placeholder="Tahmini kişi sayısı"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
        {errors.expectedCount && <Text style={styles.errorText}>{errors.expectedCount}</Text>}
      </View>

      {/* Min/Max Range */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="analytics-outline" size={16} color="#6366F1" />
          <Text style={[styles.label, { color: colors.text }]}>Katılımcı Aralığı</Text>
          <Text style={[styles.optional, { color: colors.textSecondary }]}>(Opsiyonel)</Text>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Minimum</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  color: colors.text,
                  borderColor: isDark ? '#3F3F46' : '#E2E8F0',
                },
              ]}
              value={data.minCount ? String(data.minCount) : ''}
              onChangeText={(text) => handleChange('minCount', Number(text) || 0)}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.rangeDivider}>
            <Ionicons name="remove" size={20} color={colors.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Maksimum</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  color: colors.text,
                  borderColor: isDark ? '#3F3F46' : '#E2E8F0',
                },
              ]}
              value={data.maxCount ? String(data.maxCount) : ''}
              onChangeText={(text) => handleChange('maxCount', Number(text) || 0)}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Participant Type */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="person-outline" size={16} color="#8B5CF6" />
          <Text style={[styles.label, { color: colors.text }]}>Katılımcı Türü</Text>
        </View>
        <View style={styles.typeGrid}>
          {PARTICIPANT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  borderColor: data.participantType === type.id ? colors.primary : isDark ? '#3F3F46' : '#E2E8F0',
                  borderWidth: data.participantType === type.id ? 2 : 1,
                },
              ]}
              onPress={() => handleChange('participantType', type.id)}
            >
              <Ionicons
                name={type.icon as any}
                size={20}
                color={data.participantType === type.id ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeName,
                  { color: data.participantType === type.id ? colors.primary : colors.text },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Age Limit */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="alert-circle-outline" size={16} color="#F59E0B" />
          <Text style={[styles.label, { color: colors.text }]}>Yaş Sınırı</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipsRow}>
            {AGE_LIMITS.map((age) => (
              <TouchableOpacity
                key={age.id}
                style={[
                  styles.ageChip,
                  {
                    backgroundColor: data.ageLimit === age.id
                      ? '#F59E0B'
                      : isDark ? '#27272A' : '#F1F5F9',
                  },
                ]}
                onPress={() => handleChange('ageLimit', age.id)}
              >
                <Text
                  style={[
                    styles.ageText,
                    { color: data.ageLimit === age.id ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {age.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* VIP Area Toggle */}
      <TouchableOpacity
        style={[
          styles.toggleRow,
          { backgroundColor: isDark ? '#27272A' : '#F8FAFC' },
        ]}
        onPress={() => handleChange('hasVipArea', !data.hasVipArea)}
      >
        <View style={styles.toggleInfo}>
          <Ionicons name="star" size={22} color="#8B5CF6" />
          <View>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>VIP Alan</Text>
            <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
              Etkinlikte VIP/özel alan var mı?
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.toggleSwitch,
            {
              backgroundColor: data.hasVipArea ? '#8B5CF6' : isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              { transform: [{ translateX: data.hasVipArea ? 20 : 0 }] },
            ]}
          />
        </View>
      </TouchableOpacity>

      {/* VIP Capacity */}
      {data.hasVipArea && (
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="star-outline" size={16} color="#8B5CF6" />
            <Text style={[styles.label, { color: colors.text }]}>VIP Kapasite</Text>
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
            value={data.vipCapacity ? String(data.vipCapacity) : ''}
            onChangeText={(text) => handleChange('vipCapacity', Number(text) || 0)}
            placeholder="VIP alan kişi kapasitesi"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>
      )}

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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  rangeDivider: {
    paddingBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeCard: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  typeName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ageChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ageText: {
    fontSize: 14,
    fontWeight: '600',
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

export default ParticipantFormModule;
