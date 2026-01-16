/**
 * CateringFormModule - Catering Form Modülü
 *
 * Yemek servisi gereksinimleri için form.
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { MenuModuleData, ModuleConfig } from '../../../types/modules';

interface CateringFormModuleProps {
  data?: Partial<MenuModuleData>;
  config: ModuleConfig;
  onDataChange?: (data: Partial<MenuModuleData>) => void;
  errors?: Record<string, string>;
}

const SERVICE_STYLES = [
  { id: 'buffet', label: 'Açık Büfe', icon: 'restaurant', description: 'Self-servis' },
  { id: 'fine_dining', label: 'Fine Dining', icon: 'disc', description: 'Masaya servis' },
  { id: 'casual', label: 'Casual', icon: 'people', description: 'Rahat ortam' },
  { id: 'cocktail', label: 'Kokteyl', icon: 'wine', description: 'Ayakta servis' },
  { id: 'food_truck', label: 'Food Truck', icon: 'car', description: 'Mobil servis' },
];

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Kahvaltı', icon: 'sunny' },
  { id: 'lunch', label: 'Öğle Yemeği', icon: 'restaurant' },
  { id: 'dinner', label: 'Akşam Yemeği', icon: 'moon' },
  { id: 'snack', label: 'Ara Öğün', icon: 'cafe' },
  { id: 'cocktail', label: 'Kokteyl', icon: 'wine' },
] as const;

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vejetaryen', icon: 'leaf' },
  { id: 'vegan', label: 'Vegan', icon: 'nutrition' },
  { id: 'gluten-free', label: 'Glutensiz', icon: 'alert-circle' },
  { id: 'halal', label: 'Helal', icon: 'checkmark-circle' },
  { id: 'kosher', label: 'Koşer', icon: 'star' },
];

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'cocktail';

export const CateringFormModule: React.FC<CateringFormModuleProps> = ({
  data = {},
  config,
  onDataChange,
  errors = {},
}) => {
  const { colors, isDark } = useTheme();

  const handleChange = (field: keyof MenuModuleData, value: any) => {
    onDataChange?.({ ...data, [field]: value });
  };

  const toggleMealType = (mealId: MealType) => {
    const currentMeals = data.mealTypes || [];

    if (currentMeals.includes(mealId)) {
      handleChange('mealTypes', currentMeals.filter(m => m !== mealId));
    } else {
      handleChange('mealTypes', [...currentMeals, mealId]);
    }
  };

  const toggleDietaryOption = (optionId: string) => {
    const currentOptions = data.dietaryRestrictions || [];
    if (currentOptions.includes(optionId)) {
      handleChange('dietaryRestrictions', currentOptions.filter(o => o !== optionId));
    } else {
      handleChange('dietaryRestrictions', [...currentOptions, optionId]);
    }
  };

  const isMealSelected = (mealId: MealType) => {
    return data.mealTypes?.includes(mealId) || false;
  };

  return (
    <View style={styles.container}>
      {/* Guest Count */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="people" size={16} color="#3B82F6" />
          <Text style={[styles.label, { color: colors.text }]}>Kişi Sayısı</Text>
          <Text style={styles.required}>*</Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#27272A' : '#F8FAFC',
              color: colors.text,
              borderColor: errors.guestCount ? '#EF4444' : isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
          value={data.guestCount ? String(data.guestCount) : ''}
          onChangeText={(text) => handleChange('guestCount', Number(text) || 0)}
          placeholder="Toplam kişi sayısı"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
        {errors.guestCount && <Text style={styles.errorText}>{errors.guestCount}</Text>}
      </View>

      {/* Service Style */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="restaurant-outline" size={16} color="#10B981" />
          <Text style={[styles.label, { color: colors.text }]}>Servis Stili</Text>
        </View>
        <View style={styles.serviceGrid}>
          {SERVICE_STYLES.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.serviceCard,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  borderColor: data.serviceStyle === style.id ? colors.primary : isDark ? '#3F3F46' : '#E2E8F0',
                  borderWidth: data.serviceStyle === style.id ? 2 : 1,
                },
              ]}
              onPress={() => handleChange('serviceStyle', style.id)}
            >
              <Ionicons
                name={style.icon as any}
                size={24}
                color={data.serviceStyle === style.id ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.serviceName,
                  { color: data.serviceStyle === style.id ? colors.primary : colors.text },
                ]}
              >
                {style.label}
              </Text>
              <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>
                {style.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Meal Types */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="time-outline" size={16} color="#6366F1" />
          <Text style={[styles.label, { color: colors.text }]}>Öğün Seçimi</Text>
        </View>
        <View style={styles.mealGrid}>
          {MEAL_TYPES.map((meal) => (
            <TouchableOpacity
              key={meal.id}
              style={[
                styles.mealChip,
                {
                  backgroundColor: isMealSelected(meal.id)
                    ? colors.primary
                    : isDark ? '#27272A' : '#F1F5F9',
                },
              ]}
              onPress={() => toggleMealType(meal.id)}
            >
              <Ionicons
                name={meal.icon as any}
                size={16}
                color={isMealSelected(meal.id) ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.mealText,
                  { color: isMealSelected(meal.id) ? '#FFFFFF' : colors.text },
                ]}
              >
                {meal.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Dietary Options */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="leaf" size={16} color="#F59E0B" />
          <Text style={[styles.label, { color: colors.text }]}>Diyet Seçenekleri</Text>
          <Text style={[styles.optional, { color: colors.textSecondary }]}>(Birden fazla seçilebilir)</Text>
        </View>
        <View style={styles.dietaryGrid}>
          {DIETARY_OPTIONS.map((option) => {
            const isSelected = data.dietaryRestrictions?.includes(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.dietaryChip,
                  {
                    backgroundColor: isSelected ? '#F59E0B' : isDark ? '#27272A' : '#F1F5F9',
                  },
                ]}
                onPress={() => toggleDietaryOption(option.id)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={14}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.dietaryText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
    fontSize: 11,
    marginLeft: 'auto',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
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
    gap: 6,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
  },
  serviceDesc: {
    fontSize: 11,
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  mealText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dietaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  dietaryText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default CateringFormModule;
