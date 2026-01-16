/**
 * MenuModule - Menü Modülü
 *
 * Catering menü ve yemek seçeneklerini gösterir.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { MenuModuleData, MenuItemData, ModuleConfig } from '../../../types/modules';

interface MenuModuleProps {
  data?: MenuModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: MenuModuleData) => void;
}

export const MenuModule: React.FC<MenuModuleProps> = ({ data, config }) => {
  const { colors, isDark } = useTheme();

  if (!data || !data.mealTypes || data.mealTypes.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Menü bilgisi yok</Text>
      </View>
    );
  }

  const getMealIcon = (mealType: string): string => {
    switch (mealType) {
      case 'breakfast': return 'cafe';
      case 'lunch': return 'restaurant';
      case 'dinner': return 'moon';
      case 'snack': return 'fast-food';
      case 'cocktail': return 'wine';
      default: return 'restaurant';
    }
  };

  const getMealColor = (mealType: string): string => {
    switch (mealType) {
      case 'breakfast': return '#F59E0B';
      case 'lunch': return '#10B981';
      case 'dinner': return '#6366F1';
      case 'snack': return '#EC4899';
      case 'cocktail': return '#8B5CF6';
      default: return '#3B82F6';
    }
  };

  const getMealLabel = (mealType: string): string => {
    switch (mealType) {
      case 'breakfast': return 'Kahvaltı';
      case 'lunch': return 'Öğle Yemeği';
      case 'dinner': return 'Akşam Yemeği';
      case 'snack': return 'Ara Öğün';
      case 'cocktail': return 'Kokteyl';
      default: return mealType;
    }
  };

  const getServiceStyleLabel = (style?: string): string => {
    switch (style) {
      case 'fine_dining': return 'Fine Dining';
      case 'buffet': return 'Açık Büfe';
      case 'casual': return 'Casual';
      case 'food_truck': return 'Food Truck';
      case 'cocktail': return 'Kokteyl Servis';
      default: return style || '';
    }
  };

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'appetizer': return 'Başlangıç';
      case 'main': return 'Ana Yemek';
      case 'dessert': return 'Tatlı';
      case 'beverage': return 'İçecek';
      default: return 'Diğer';
    }
  };

  // Group menu items by category
  const groupedItems = data.menuItems?.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItemData[]>);

  return (
    <View style={styles.container}>
      {/* Meal Types */}
      <View style={styles.mealTypesRow}>
        {data.mealTypes.map((mealType, index) => (
          <View
            key={index}
            style={[styles.mealChip, { backgroundColor: `${getMealColor(mealType)}15` }]}
          >
            <Ionicons name={getMealIcon(mealType) as any} size={14} color={getMealColor(mealType)} />
            <Text style={[styles.mealChipText, { color: getMealColor(mealType) }]}>
              {getMealLabel(mealType)}
            </Text>
          </View>
        ))}
      </View>

      {/* Service Style & Guest Count */}
      <View style={[styles.infoRow, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
        {data.serviceStyle && (
          <View style={styles.infoItem}>
            <Ionicons name="restaurant-outline" size={16} color="#6366F1" />
            <View>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Servis Stili</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {getServiceStyleLabel(data.serviceStyle)}
              </Text>
            </View>
          </View>
        )}
        {data.guestCount && (
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={16} color="#10B981" />
            <View>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Kişi Sayısı</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {data.guestCount} Kişi
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Dietary Restrictions */}
      {data.dietaryRestrictions && data.dietaryRestrictions.length > 0 && (
        <View style={[styles.section, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning-outline" size={16} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Diyet Kısıtlamaları</Text>
          </View>
          <View style={styles.restrictionsRow}>
            {data.dietaryRestrictions.map((restriction, index) => (
              <View key={index} style={[styles.restrictionChip, { backgroundColor: isDark ? '#3F3F46' : '#FEF3C7' }]}>
                <Text style={[styles.restrictionText, { color: '#B45309' }]}>{restriction}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Menu Items */}
      {groupedItems && Object.keys(groupedItems).length > 0 && (
        <View style={styles.menuSection}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>Menü</Text>
          {Object.entries(groupedItems).map(([category, items]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={[styles.categoryTitle, { color: colors.textSecondary }]}>
                {getCategoryLabel(category)}
              </Text>
              {items.map((item, index) => (
                <View
                  key={item.id || index}
                  style={[styles.menuItem, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}
                >
                  <View style={styles.menuItemInfo}>
                    <Text style={[styles.menuItemName, { color: colors.text }]}>{item.name}</Text>
                    {item.description && (
                      <Text style={[styles.menuItemDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                    {item.dietaryTags && item.dietaryTags.length > 0 && (
                      <View style={styles.dietaryTags}>
                        {item.dietaryTags.map((tag, tagIndex) => (
                          <View key={tagIndex} style={styles.dietaryTag}>
                            <Text style={styles.dietaryTagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  mealTypesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mealChipText: { fontSize: 12, fontWeight: '600' },
  infoRow: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: { fontSize: 11 },
  infoValue: { fontSize: 13, fontWeight: '600' },
  section: {
    padding: 12,
    borderRadius: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '600' },
  restrictionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  restrictionChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  restrictionText: { fontSize: 12, fontWeight: '500' },
  menuSection: { marginTop: 4 },
  menuTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  categorySection: { marginBottom: 12 },
  categoryTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  menuItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  menuItemInfo: {},
  menuItemName: { fontSize: 14, fontWeight: '600' },
  menuItemDesc: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  dietaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  dietaryTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dietaryTagText: { fontSize: 10, color: '#10B981', fontWeight: '600' },
});

export default MenuModule;
