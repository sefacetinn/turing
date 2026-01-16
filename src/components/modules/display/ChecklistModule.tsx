/**
 * ChecklistModule - Kontrol Listesi Modülü
 *
 * Hazırlık adımları ve kontrol listesi gösterir.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { ChecklistModuleData, ModuleConfig } from '../../../types/modules';

interface ChecklistModuleProps {
  data?: ChecklistModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: ChecklistModuleData) => void;
}

export const ChecklistModule: React.FC<ChecklistModuleProps> = ({ data, config, mode = 'view', onDataChange }) => {
  const { colors, isDark } = useTheme();

  if (!data || !data.items || data.items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Kontrol listesi yok</Text>
      </View>
    );
  }

  const completedCount = data.items.filter(item => item.isCompleted).length;
  const totalCount = data.items.length;
  const progress = data.progress ?? (completedCount / totalCount) * 100;

  const handleToggleItem = (itemId: string) => {
    if (mode !== 'view' && onDataChange) {
      const updatedItems = data.items.map(item =>
        item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
      );
      onDataChange({ ...data, items: updatedItems });
    }
  };

  const getCategoryIcon = (category?: string): string => {
    switch (category) {
      case 'preparation': return 'clipboard';
      case 'technical': return 'construct';
      case 'logistics': return 'car';
      case 'communication': return 'chatbubbles';
      case 'safety': return 'shield-checkmark';
      default: return 'checkbox';
    }
  };

  // Group items by category if available
  const groupedItems = data.items.reduce((acc, item) => {
    const category = item.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof data.items>);

  const hasCategories = Object.keys(groupedItems).length > 1 || !groupedItems.general;

  const renderItem = (item: typeof data.items[0], index: number) => (
    <TouchableOpacity
      key={item.id || index}
      style={[
        styles.checklistItem,
        { backgroundColor: isDark ? '#27272A' : '#F8FAFC' },
        item.isCompleted && styles.completedItem,
      ]}
      onPress={() => item.id && handleToggleItem(item.id)}
      disabled={mode === 'view'}
    >
      <View style={[
        styles.checkbox,
        {
          borderColor: item.isCompleted ? '#10B981' : colors.border,
          backgroundColor: item.isCompleted ? '#10B981' : 'transparent'
        }
      ]}>
        {item.isCompleted && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
      </View>
      <View style={styles.itemContent}>
        <Text
          style={[
            styles.itemText,
            { color: colors.text },
            item.isCompleted && styles.completedItemText
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        {item.completedBy && item.isCompleted && (
          <View style={styles.completedByRow}>
            <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.completedByText, { color: colors.textSecondary }]}>
              {item.completedBy}
            </Text>
            {item.completedAt && (
              <Text style={[styles.completedAtText, { color: colors.textSecondary }]}>
                • {item.completedAt}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>İlerleme</Text>
          <Text style={[styles.progressCount, { color: colors.text }]}>
            {completedCount}/{totalCount}
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: progress === 100 ? '#10B981' : '#3B82F6'
              }
            ]}
          />
        </View>
        {progress === 100 && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={styles.completedText}>Tamamlandı</Text>
          </View>
        )}
      </View>

      {/* Checklist Items */}
      {hasCategories ? (
        Object.entries(groupedItems).map(([category, items]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons
                name={getCategoryIcon(category) as any}
                size={14}
                color={colors.textSecondary}
              />
              <Text style={[styles.categoryTitle, { color: colors.textSecondary }]}>
                {category === 'preparation' ? 'Hazırlık' :
                 category === 'technical' ? 'Teknik' :
                 category === 'logistics' ? 'Lojistik' :
                 category === 'communication' ? 'İletişim' :
                 category === 'safety' ? 'Güvenlik' : 'Genel'}
              </Text>
            </View>
            {items.map((item, index) => renderItem(item, index))}
          </View>
        ))
      ) : (
        <View style={styles.itemsList}>
          {data.items.map((item, index) => renderItem(item, index))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 13 },
  progressCount: { fontSize: 13, fontWeight: '600' },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  completedText: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  categorySection: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  categoryTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  itemsList: {
    gap: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
  },
  completedItem: {
    opacity: 0.7,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  itemContent: { flex: 1 },
  itemText: { fontSize: 14, lineHeight: 20 },
  completedItemText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  completedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  completedByText: { fontSize: 11 },
  completedAtText: { fontSize: 11 },
});

export default ChecklistModule;
