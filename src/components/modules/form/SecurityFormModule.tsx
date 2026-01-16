/**
 * SecurityFormModule - Güvenlik Form Modülü
 *
 * Güvenlik personeli ve gereksinimleri için form.
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { TeamModuleData, ModuleConfig } from '../../../types/modules';

interface SecurityFormData {
  totalPersonnel?: number;
  shiftCount?: number;
  armedRequired?: boolean;
  uniformRequired?: boolean;
  securityType?: string;
  equipmentNeeds?: string[];
  notes?: string;
}

interface SecurityFormModuleProps {
  data?: Partial<SecurityFormData>;
  config: ModuleConfig;
  onDataChange?: (data: Partial<SecurityFormData>) => void;
  errors?: Record<string, string>;
}

const SECURITY_TYPES = [
  { id: 'event', label: 'Etkinlik Güvenliği', icon: 'musical-notes' },
  { id: 'vip', label: 'VIP Koruma', icon: 'star' },
  { id: 'crowd', label: 'Kalabalık Yönetimi', icon: 'people' },
  { id: 'entrance', label: 'Giriş Kontrolü', icon: 'enter' },
];

const SHIFT_OPTIONS = [
  { value: 1, label: 'Tek Vardiya' },
  { value: 2, label: '2 Vardiya' },
  { value: 3, label: '3 Vardiya' },
];

const EQUIPMENT_OPTIONS = [
  { id: 'radio', label: 'Telsiz' },
  { id: 'metal_detector', label: 'Metal Dedektör' },
  { id: 'xray', label: 'X-Ray Cihazı' },
  { id: 'barrier', label: 'Bariyer' },
  { id: 'camera', label: 'Mobil Kamera' },
];

export const SecurityFormModule: React.FC<SecurityFormModuleProps> = ({
  data = {},
  config,
  onDataChange,
  errors = {},
}) => {
  const { colors, isDark } = useTheme();

  const handleChange = (field: keyof SecurityFormData, value: any) => {
    onDataChange?.({ ...data, [field]: value });
  };

  const toggleEquipment = (equipmentId: string) => {
    const current = data.equipmentNeeds || [];
    if (current.includes(equipmentId)) {
      handleChange('equipmentNeeds', current.filter(e => e !== equipmentId));
    } else {
      handleChange('equipmentNeeds', [...current, equipmentId]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Security Type */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="shield-checkmark" size={16} color="#6366F1" />
          <Text style={[styles.label, { color: colors.text }]}>Güvenlik Türü</Text>
        </View>
        <View style={styles.typeGrid}>
          {SECURITY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  borderColor: data.securityType === type.id ? colors.primary : isDark ? '#3F3F46' : '#E2E8F0',
                  borderWidth: data.securityType === type.id ? 2 : 1,
                },
              ]}
              onPress={() => handleChange('securityType', type.id)}
            >
              <Ionicons
                name={type.icon as any}
                size={22}
                color={data.securityType === type.id ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeName,
                  { color: data.securityType === type.id ? colors.primary : colors.text },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Personnel Count */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="people" size={16} color="#3B82F6" />
          <Text style={[styles.label, { color: colors.text }]}>Güvenlik Personeli Sayısı</Text>
          <Text style={styles.required}>*</Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#27272A' : '#F8FAFC',
              color: colors.text,
              borderColor: errors.totalPersonnel ? '#EF4444' : isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
          value={data.totalPersonnel ? String(data.totalPersonnel) : ''}
          onChangeText={(text) => handleChange('totalPersonnel', Number(text) || 0)}
          placeholder="Toplam personel sayısı"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
        {errors.totalPersonnel && <Text style={styles.errorText}>{errors.totalPersonnel}</Text>}
      </View>

      {/* Shift Count */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="time" size={16} color="#10B981" />
          <Text style={[styles.label, { color: colors.text }]}>Vardiya Sayısı</Text>
        </View>
        <View style={styles.shiftRow}>
          {SHIFT_OPTIONS.map((shift) => (
            <TouchableOpacity
              key={shift.value}
              style={[
                styles.shiftChip,
                {
                  backgroundColor: data.shiftCount === shift.value
                    ? colors.primary
                    : isDark ? '#27272A' : '#F1F5F9',
                },
              ]}
              onPress={() => handleChange('shiftCount', shift.value)}
            >
              <Text
                style={[
                  styles.shiftText,
                  { color: data.shiftCount === shift.value ? '#FFFFFF' : colors.text },
                ]}
              >
                {shift.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Armed Security Toggle */}
      <TouchableOpacity
        style={[
          styles.toggleRow,
          { backgroundColor: isDark ? '#27272A' : '#F8FAFC' },
        ]}
        onPress={() => handleChange('armedRequired', !data.armedRequired)}
      >
        <View style={styles.toggleInfo}>
          <Ionicons name="shield" size={22} color="#EF4444" />
          <View>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Silahlı Güvenlik</Text>
            <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
              Silahlı güvenlik personeli gerekli
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.toggleSwitch,
            {
              backgroundColor: data.armedRequired ? '#EF4444' : isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              { transform: [{ translateX: data.armedRequired ? 20 : 0 }] },
            ]}
          />
        </View>
      </TouchableOpacity>

      {/* Uniform Toggle */}
      <TouchableOpacity
        style={[
          styles.toggleRow,
          { backgroundColor: isDark ? '#27272A' : '#F8FAFC' },
        ]}
        onPress={() => handleChange('uniformRequired', !data.uniformRequired)}
      >
        <View style={styles.toggleInfo}>
          <Ionicons name="shirt" size={22} color="#8B5CF6" />
          <View>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Üniforma</Text>
            <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
              Özel üniforma/kıyafet gerekli
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.toggleSwitch,
            {
              backgroundColor: data.uniformRequired ? '#8B5CF6' : isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              { transform: [{ translateX: data.uniformRequired ? 20 : 0 }] },
            ]}
          />
        </View>
      </TouchableOpacity>

      {/* Equipment Needs */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="construct" size={16} color="#F59E0B" />
          <Text style={[styles.label, { color: colors.text }]}>Ekipman İhtiyacı</Text>
        </View>
        <View style={styles.equipmentGrid}>
          {EQUIPMENT_OPTIONS.map((equip) => {
            const isSelected = data.equipmentNeeds?.includes(equip.id);
            return (
              <TouchableOpacity
                key={equip.id}
                style={[
                  styles.equipmentChip,
                  {
                    backgroundColor: isSelected
                      ? '#F59E0B'
                      : isDark ? '#27272A' : '#F1F5F9',
                  },
                ]}
                onPress={() => toggleEquipment(equip.id)}
              >
                <Ionicons
                  name={isSelected ? 'checkmark' : 'add'}
                  size={14}
                  color={isSelected ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    styles.equipmentText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {equip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Notlar</Text>
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
          value={data.notes || ''}
          onChangeText={(text) => handleChange('notes', text)}
          placeholder="Güvenlik gereksinimleri hakkında ek bilgiler..."
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
  required: {
    color: '#EF4444',
    fontSize: 14,
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
  shiftRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shiftChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  shiftText: {
    fontSize: 13,
    fontWeight: '600',
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
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  equipmentText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default SecurityFormModule;
