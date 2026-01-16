/**
 * MediaFormModule - Medya Form Modülü
 *
 * Fotoğraf/video hizmetleri için form.
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { MediaModuleData, ModuleConfig } from '../../../types/modules';

interface MediaFormData {
  serviceTypes?: string[];
  duration?: string;
  deliveryFormat?: string;
  deliveryTime?: string;
  editingIncluded?: boolean;
  droneRequired?: boolean;
  liveStreamRequired?: boolean;
  photographerCount?: number;
  videographerCount?: number;
  notes?: string;
}

interface MediaFormModuleProps {
  data?: Partial<MediaFormData>;
  config: ModuleConfig;
  onDataChange?: (data: Partial<MediaFormData>) => void;
  errors?: Record<string, string>;
}

const SERVICE_TYPES = [
  { id: 'photo', label: 'Fotoğraf', icon: 'camera' },
  { id: 'video', label: 'Video', icon: 'videocam' },
  { id: 'drone', label: 'Drone', icon: 'airplane' },
  { id: 'live', label: 'Canlı Yayın', icon: 'radio' },
];

const DURATION_OPTIONS = [
  { id: '2h', label: '2 Saat' },
  { id: '4h', label: '4 Saat' },
  { id: '8h', label: '8 Saat' },
  { id: 'full', label: 'Tam Gün' },
];

const DELIVERY_FORMATS = [
  { id: 'digital', label: 'Dijital (Online)' },
  { id: 'usb', label: 'USB/Hard Disk' },
  { id: 'both', label: 'Her İkisi' },
];

const DELIVERY_TIMES = [
  { id: '3days', label: '3 Gün' },
  { id: '1week', label: '1 Hafta' },
  { id: '2weeks', label: '2 Hafta' },
  { id: '1month', label: '1 Ay' },
];

export const MediaFormModule: React.FC<MediaFormModuleProps> = ({
  data = {},
  config,
  onDataChange,
  errors = {},
}) => {
  const { colors, isDark } = useTheme();

  const handleChange = (field: keyof MediaFormData, value: any) => {
    onDataChange?.({ ...data, [field]: value });
  };

  const toggleServiceType = (typeId: string) => {
    const current = data.serviceTypes || [];
    if (current.includes(typeId)) {
      handleChange('serviceTypes', current.filter(t => t !== typeId));
    } else {
      handleChange('serviceTypes', [...current, typeId]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Service Types */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="camera" size={16} color="#EC4899" />
          <Text style={[styles.label, { color: colors.text }]}>Hizmet Türü</Text>
          <Text style={styles.required}>*</Text>
        </View>
        <View style={styles.serviceGrid}>
          {SERVICE_TYPES.map((type) => {
            const isSelected = data.serviceTypes?.includes(type.id);
            return (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.serviceCard,
                  {
                    backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                    borderColor: isSelected ? '#EC4899' : isDark ? '#3F3F46' : '#E2E8F0',
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => toggleServiceType(type.id)}
              >
                <View style={[styles.checkbox, { borderColor: isSelected ? '#EC4899' : colors.border }]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color="#EC4899" />}
                </View>
                <Ionicons
                  name={type.icon as any}
                  size={22}
                  color={isSelected ? '#EC4899' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.serviceName,
                    { color: isSelected ? '#EC4899' : colors.text },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Personnel Count */}
      {data.serviceTypes?.includes('photo') && (
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="person" size={16} color="#3B82F6" />
            <Text style={[styles.label, { color: colors.text }]}>Fotoğrafçı Sayısı</Text>
          </View>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={[styles.counterBtn, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}
              onPress={() => handleChange('photographerCount', Math.max(1, (data.photographerCount || 1) - 1))}
            >
              <Ionicons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.counterValue, { color: colors.text }]}>
              {data.photographerCount || 1}
            </Text>
            <TouchableOpacity
              style={[styles.counterBtn, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}
              onPress={() => handleChange('photographerCount', (data.photographerCount || 1) + 1)}
            >
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {data.serviceTypes?.includes('video') && (
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="person" size={16} color="#6366F1" />
            <Text style={[styles.label, { color: colors.text }]}>Kameraman Sayısı</Text>
          </View>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={[styles.counterBtn, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}
              onPress={() => handleChange('videographerCount', Math.max(1, (data.videographerCount || 1) - 1))}
            >
              <Ionicons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.counterValue, { color: colors.text }]}>
              {data.videographerCount || 1}
            </Text>
            <TouchableOpacity
              style={[styles.counterBtn, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}
              onPress={() => handleChange('videographerCount', (data.videographerCount || 1) + 1)}
            >
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Duration */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="time" size={16} color="#10B981" />
          <Text style={[styles.label, { color: colors.text }]}>Çekim Süresi</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.optionsRow}>
            {DURATION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: data.duration === option.id
                      ? colors.primary
                      : isDark ? '#27272A' : '#F1F5F9',
                  },
                ]}
                onPress={() => handleChange('duration', option.id)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: data.duration === option.id ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Editing Toggle */}
      <TouchableOpacity
        style={[
          styles.toggleRow,
          { backgroundColor: isDark ? '#27272A' : '#F8FAFC' },
        ]}
        onPress={() => handleChange('editingIncluded', !data.editingIncluded)}
      >
        <View style={styles.toggleInfo}>
          <Ionicons name="color-wand" size={22} color="#8B5CF6" />
          <View>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Kurgu/Edit Dahil</Text>
            <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
              Post-prodüksiyon işlemleri
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.toggleSwitch,
            {
              backgroundColor: data.editingIncluded ? '#8B5CF6' : isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              { transform: [{ translateX: data.editingIncluded ? 20 : 0 }] },
            ]}
          />
        </View>
      </TouchableOpacity>

      {/* Delivery Format */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="folder" size={16} color="#F59E0B" />
          <Text style={[styles.label, { color: colors.text }]}>Teslimat Formatı</Text>
        </View>
        <View style={styles.formatGrid}>
          {DELIVERY_FORMATS.map((format) => (
            <TouchableOpacity
              key={format.id}
              style={[
                styles.formatCard,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  borderColor: data.deliveryFormat === format.id ? '#F59E0B' : isDark ? '#3F3F46' : '#E2E8F0',
                  borderWidth: data.deliveryFormat === format.id ? 2 : 1,
                },
              ]}
              onPress={() => handleChange('deliveryFormat', format.id)}
            >
              <Text
                style={[
                  styles.formatName,
                  { color: data.deliveryFormat === format.id ? '#F59E0B' : colors.text },
                ]}
              >
                {format.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Delivery Time */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="calendar" size={16} color="#EF4444" />
          <Text style={[styles.label, { color: colors.text }]}>Teslimat Süresi</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.optionsRow}>
            {DELIVERY_TIMES.map((time) => (
              <TouchableOpacity
                key={time.id}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: data.deliveryTime === time.id
                      ? '#EF4444'
                      : isDark ? '#27272A' : '#F1F5F9',
                  },
                ]}
                onPress={() => handleChange('deliveryTime', time.id)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: data.deliveryTime === time.id ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {time.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Notes */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Özel İstekler</Text>
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
          placeholder="Stil tercihleri, özel çekimler, konsept vb."
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
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceCard: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 24,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  optionText: {
    fontSize: 13,
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
  formatGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  formatCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  formatName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default MediaFormModule;
