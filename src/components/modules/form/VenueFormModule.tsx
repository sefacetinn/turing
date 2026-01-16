/**
 * VenueFormModule - Mekan Form Modülü
 *
 * Mekan bilgileri için form alanlarını render eder.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { VenueModuleData, ModuleConfig } from '../../../types/modules';

interface VenueFormModuleProps {
  data?: Partial<VenueModuleData>;
  config: ModuleConfig;
  onDataChange?: (data: Partial<VenueModuleData>) => void;
  errors?: Record<string, string>;
}

const VENUE_TYPES = [
  { id: 'indoor', label: 'Kapalı Alan', icon: 'business' },
  { id: 'outdoor', label: 'Açık Alan', icon: 'sunny' },
  { id: 'mixed', label: 'Karma', icon: 'partly-sunny' },
];

const SEATING_TYPES = [
  { id: 'standing', label: 'Ayakta' },
  { id: 'seated', label: 'Oturmalı' },
  { id: 'mixed', label: 'Karma' },
  { id: 'theater', label: 'Tiyatro' },
  { id: 'banquet', label: 'Ziyafet' },
];

export const VenueFormModule: React.FC<VenueFormModuleProps> = ({
  data = {},
  config,
  onDataChange,
  errors = {},
}) => {
  const { colors, isDark } = useTheme();

  const handleChange = (field: keyof VenueModuleData, value: any) => {
    onDataChange?.({ ...data, [field]: value });
  };

  const renderInput = (
    label: string,
    field: keyof VenueModuleData,
    placeholder: string,
    options?: { multiline?: boolean; keyboardType?: 'default' | 'numeric'; required?: boolean }
  ) => {
    const error = errors[field];
    const isRequired = options?.required || config.fields?.[field]?.required;

    return (
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          {isRequired && <Text style={styles.required}>*</Text>}
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#27272A' : '#F8FAFC',
              color: colors.text,
              borderColor: error ? '#EF4444' : isDark ? '#3F3F46' : '#E2E8F0',
            },
            options?.multiline && styles.multilineInput,
          ]}
          value={String(data[field] || '')}
          onChangeText={(text) => handleChange(field, options?.keyboardType === 'numeric' ? Number(text) || 0 : text)}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline={options?.multiline}
          keyboardType={options?.keyboardType}
        />
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Venue Name */}
      {renderInput('Mekan Adı', 'name', 'Mekan adını girin', { required: true })}

      {/* Venue Type Selection */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.text }]}>Mekan Türü</Text>
          <Text style={styles.required}>*</Text>
        </View>
        <View style={styles.typeGrid}>
          {VENUE_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  borderColor: data.indoorOutdoor === type.id ? colors.primary : isDark ? '#3F3F46' : '#E2E8F0',
                  borderWidth: data.indoorOutdoor === type.id ? 2 : 1,
                },
              ]}
              onPress={() => handleChange('indoorOutdoor', type.id)}
            >
              <Ionicons
                name={type.icon as any}
                size={24}
                color={data.indoorOutdoor === type.id ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeName,
                  { color: data.indoorOutdoor === type.id ? colors.primary : colors.text },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Address */}
      {renderInput('Adres', 'address', 'Mekan adresini girin', { multiline: true, required: true })}

      {/* City & District Row */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>Şehir</Text>
            <Text style={styles.required}>*</Text>
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
            value={data.city || ''}
            onChangeText={(text) => handleChange('city', text)}
            placeholder="Şehir"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.text }]}>İlçe</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                color: colors.text,
                borderColor: isDark ? '#3F3F46' : '#E2E8F0',
              },
            ]}
            value={data.district || ''}
            onChangeText={(text) => handleChange('district', text)}
            placeholder="İlçe"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      {/* Capacity */}
      {renderInput('Kapasite', 'capacity', 'Kişi sayısı', { keyboardType: 'numeric', required: true })}

      {/* Seating Type */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Oturma Düzeni</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipsRow}>
            {SEATING_TYPES.map((seat) => (
              <TouchableOpacity
                key={seat.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: data.seatingType === seat.id
                      ? colors.primary
                      : isDark ? '#27272A' : '#F1F5F9',
                  },
                ]}
                onPress={() => handleChange('seatingType', seat.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: data.seatingType === seat.id ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {seat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Stage Dimensions */}
      <View style={styles.sectionHeader}>
        <Ionicons name="resize-outline" size={18} color={colors.textSecondary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sahne Ölçüleri</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.text }]}>Genişlik (m)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                color: colors.text,
                borderColor: isDark ? '#3F3F46' : '#E2E8F0',
              },
            ]}
            value={data.stageWidth ? String(data.stageWidth) : ''}
            onChangeText={(text) => handleChange('stageWidth', Number(text) || 0)}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.text }]}>Derinlik (m)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                color: colors.text,
                borderColor: isDark ? '#3F3F46' : '#E2E8F0',
              },
            ]}
            value={data.stageDepth ? String(data.stageDepth) : ''}
            onChangeText={(text) => handleChange('stageDepth', Number(text) || 0)}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.text }]}>Yükseklik (m)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                color: colors.text,
                borderColor: isDark ? '#3F3F46' : '#E2E8F0',
              },
            ]}
            value={data.stageHeight ? String(data.stageHeight) : ''}
            onChangeText={(text) => handleChange('stageHeight', Number(text) || 0)}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Backstage Toggle */}
      <TouchableOpacity
        style={[
          styles.toggleRow,
          { backgroundColor: isDark ? '#27272A' : '#F8FAFC' },
        ]}
        onPress={() => handleChange('backstage', { ...data.backstage, available: !data.backstage?.hasBackstage })}
      >
        <View style={styles.toggleInfo}>
          <Ionicons name="person-circle-outline" size={22} color={colors.textSecondary} />
          <Text style={[styles.toggleLabel, { color: colors.text }]}>Kulis Mevcut</Text>
        </View>
        <View
          style={[
            styles.toggleSwitch,
            {
              backgroundColor: data.backstage?.hasBackstage ? '#10B981' : isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              { transform: [{ translateX: data.backstage?.hasBackstage ? 20 : 0 }] },
            ]}
          />
        </View>
      </TouchableOpacity>
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
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  required: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 4,
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
    gap: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  typeCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  typeName: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
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
    gap: 10,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
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

export default VenueFormModule;
