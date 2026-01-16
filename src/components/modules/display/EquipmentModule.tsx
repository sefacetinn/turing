/**
 * EquipmentModule - Ekipman Modülü
 *
 * Teknik ekipman listesi ve gereksinimlerini gösterir.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { EquipmentModuleData, EquipmentItemData, ModuleConfig } from '../../../types/modules';

interface EquipmentModuleProps {
  data?: EquipmentModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: EquipmentModuleData) => void;
}

export const EquipmentModule: React.FC<EquipmentModuleProps> = ({ data, config }) => {
  const { colors, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  if (!data || !data.items || data.items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Ekipman bilgisi yok</Text>
      </View>
    );
  }

  const getCategoryColor = (category?: EquipmentItemData['category']): string => {
    switch (category) {
      case 'sound': return '#10B981';
      case 'lighting': return '#F59E0B';
      case 'stage': return '#6366F1';
      case 'video': return '#EC4899';
      case 'power': return '#EF4444';
      default: return '#8B5CF6';
    }
  };

  const getCategoryIcon = (category?: EquipmentItemData['category']): string => {
    switch (category) {
      case 'sound': return 'volume-high';
      case 'lighting': return 'flashlight';
      case 'stage': return 'layers';
      case 'video': return 'tv';
      case 'power': return 'flash';
      default: return 'construct';
    }
  };

  const getCategoryLabel = (category?: EquipmentItemData['category']): string => {
    switch (category) {
      case 'sound': return 'Ses';
      case 'lighting': return 'Işık';
      case 'stage': return 'Sahne';
      case 'video': return 'Görüntü';
      case 'power': return 'Güç';
      default: return 'Diğer';
    }
  };

  const totalItems = data.items.length;
  const displayItems = data.items.slice(0, 4);

  return (
    <>
      <View style={styles.container}>
        {/* Summary Badge */}
        <View style={[styles.summaryBadge, { backgroundColor: isDark ? '#27272A' : '#F0FDF4' }]}>
          <Ionicons name="construct" size={14} color="#10B981" />
          <Text style={[styles.summaryText, { color: '#10B981' }]}>
            {totalItems} Ekipman
          </Text>
          {data.powerRequirement && (
            <View style={styles.powerBadge}>
              <Ionicons name="flash" size={12} color="#F59E0B" />
              <Text style={styles.powerText}>{data.powerRequirement}</Text>
            </View>
          )}
        </View>

        {/* Setup/Teardown Times */}
        {(data.setupTime || data.teardownTime) && (
          <View style={styles.timesRow}>
            {data.setupTime && (
              <View style={[styles.timeChip, { backgroundColor: isDark ? '#27272A' : '#F1F5F9' }]}>
                <Ionicons name="arrow-down-circle-outline" size={14} color="#3B82F6" />
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Kurulum:</Text>
                <Text style={[styles.timeValue, { color: colors.text }]}>{data.setupTime}</Text>
              </View>
            )}
            {data.teardownTime && (
              <View style={[styles.timeChip, { backgroundColor: isDark ? '#27272A' : '#F1F5F9' }]}>
                <Ionicons name="arrow-up-circle-outline" size={14} color="#8B5CF6" />
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Söküm:</Text>
                <Text style={[styles.timeValue, { color: colors.text }]}>{data.teardownTime}</Text>
              </View>
            )}
          </View>
        )}

        {/* Equipment List */}
        <View style={styles.equipmentList}>
          {displayItems.map((item, index) => (
            <View
              key={item.id || index}
              style={[styles.equipmentCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}
            >
              <View style={[styles.categoryIcon, { backgroundColor: `${getCategoryColor(item.category)}20` }]}>
                <Ionicons name={getCategoryIcon(item.category) as any} size={16} color={getCategoryColor(item.category)} />
              </View>
              <View style={styles.equipmentInfo}>
                <Text style={[styles.equipmentName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.brand && (
                  <Text style={[styles.equipmentBrand, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.brand} {item.model && `• ${item.model}`}
                  </Text>
                )}
              </View>
              <View style={[styles.quantityBadge, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}>
                <Text style={[styles.quantityText, { color: colors.text }]}>x{item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Show More */}
        {totalItems > 4 && (
          <TouchableOpacity
            style={[styles.showMoreBtn, { backgroundColor: isDark ? '#27272A' : '#F1F5F9' }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles.showMoreText, { color: colors.primary }]}>
              Tüm Ekipmanları Gör (+{totalItems - 4})
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Full Equipment Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Tüm Ekipmanlar</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {data.items.map((item, index) => (
              <View
                key={item.id || index}
                style={[styles.modalEquipmentCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${getCategoryColor(item.category)}20` }]}>
                  <Ionicons name={getCategoryIcon(item.category) as any} size={18} color={getCategoryColor(item.category)} />
                </View>
                <View style={styles.modalEquipmentInfo}>
                  <View style={styles.equipmentHeader}>
                    <Text style={[styles.equipmentName, { color: colors.text }]}>{item.name}</Text>
                    <View style={[styles.categoryTag, { backgroundColor: `${getCategoryColor(item.category)}20` }]}>
                      <Text style={[styles.categoryTagText, { color: getCategoryColor(item.category) }]}>
                        {getCategoryLabel(item.category)}
                      </Text>
                    </View>
                  </View>
                  {item.brand && (
                    <Text style={[styles.equipmentBrand, { color: colors.textSecondary }]}>
                      {item.brand} {item.model && `• ${item.model}`}
                    </Text>
                  )}
                  {item.notes && (
                    <Text style={[styles.equipmentNotes, { color: colors.textSecondary }]}>{item.notes}</Text>
                  )}
                </View>
                <View style={styles.modalQuantitySection}>
                  <Text style={[styles.modalQuantity, { color: colors.text }]}>x{item.quantity}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryText: { fontSize: 12, fontWeight: '600' },
  powerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.1)',
  },
  powerText: { fontSize: 11, color: '#F59E0B', fontWeight: '600' },
  timesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeLabel: { fontSize: 11 },
  timeValue: { fontSize: 11, fontWeight: '600' },
  equipmentList: { gap: 8 },
  equipmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipmentInfo: { flex: 1 },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  equipmentName: { fontSize: 14, fontWeight: '600' },
  equipmentBrand: { fontSize: 12, marginTop: 2 },
  equipmentNotes: { fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  categoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: { fontSize: 10, fontWeight: '600' },
  quantityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quantityText: { fontSize: 13, fontWeight: '600' },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    gap: 4,
  },
  showMoreText: { fontSize: 13, fontWeight: '600' },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalContent: { flex: 1, padding: 16 },
  modalEquipmentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  modalEquipmentInfo: { flex: 1 },
  modalQuantitySection: { alignItems: 'flex-end' },
  modalQuantity: { fontSize: 16, fontWeight: '700' },
});

export default EquipmentModule;
