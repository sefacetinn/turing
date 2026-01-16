/**
 * EquipmentFormModule - Ekipman Form Modülü
 *
 * Teknik ekipman seçimi ve gereksinimleri için form.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { EquipmentModuleData, ModuleConfig } from '../../../types/modules';

interface EquipmentFormModuleProps {
  data?: Partial<EquipmentModuleData>;
  config: ModuleConfig;
  onDataChange?: (data: Partial<EquipmentModuleData>) => void;
  errors?: Record<string, string>;
}

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  notes?: string;
}

const EQUIPMENT_CATEGORIES = [
  { id: 'ses', label: 'Ses Sistemi', icon: 'volume-high', color: '#10B981' },
  { id: 'isik', label: 'Işık Sistemi', icon: 'flashlight', color: '#F59E0B' },
  { id: 'sahne', label: 'Sahne', icon: 'layers', color: '#6366F1' },
  { id: 'goruntu', label: 'Görüntü', icon: 'tv', color: '#EC4899' },
  { id: 'guc', label: 'Güç/Jeneratör', icon: 'flash', color: '#EF4444' },
];

const PRESET_EQUIPMENT: Record<string, { name: string; icon: string }[]> = {
  ses: [
    { name: 'Line Array Hoparlör', icon: 'volume-high' },
    { name: 'Subwoofer', icon: 'volume-low' },
    { name: 'Monitör Hoparlör', icon: 'headset' },
    { name: 'Mikser', icon: 'options' },
    { name: 'Mikrofon Seti', icon: 'mic' },
    { name: 'DI Box', icon: 'cube' },
  ],
  isik: [
    { name: 'Moving Head', icon: 'flashlight' },
    { name: 'LED Par', icon: 'sunny' },
    { name: 'Strobe', icon: 'flash' },
    { name: 'Followspot', icon: 'flashlight-outline' },
    { name: 'LED Screen', icon: 'desktop' },
    { name: 'Truss Sistemi', icon: 'grid' },
  ],
  sahne: [
    { name: 'Sahne Platformu', icon: 'layers' },
    { name: 'Backdrop', icon: 'image' },
    { name: 'Bariyerler', icon: 'remove' },
    { name: 'Merdiven/Rampa', icon: 'trending-up' },
  ],
  goruntu: [
    { name: 'LED Ekran', icon: 'desktop' },
    { name: 'Projektör', icon: 'videocam' },
    { name: 'Kamera', icon: 'camera' },
    { name: 'Switcher', icon: 'git-branch' },
  ],
  guc: [
    { name: 'Jeneratör 50 kVA', icon: 'flash' },
    { name: 'Jeneratör 100 kVA', icon: 'flash' },
    { name: 'Jeneratör 150+ kVA', icon: 'flash' },
    { name: 'PDU/Güç Dağıtım', icon: 'git-network' },
  ],
};

export const EquipmentFormModule: React.FC<EquipmentFormModuleProps> = ({
  data = {},
  config,
  onDataChange,
  errors = {},
}) => {
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customItem, setCustomItem] = useState({ name: '', quantity: 1 });

  const items = data.items || [];

  const handleChange = (field: keyof EquipmentModuleData, value: any) => {
    onDataChange?.({ ...data, [field]: value });
  };

  const addEquipment = (name: string, category: string) => {
    const newItem: EquipmentItem = {
      id: `eq_${Date.now()}`,
      name,
      category,
      quantity: 1,
    };
    handleChange('items', [...items, newItem]);
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    handleChange('items', updated);
  };

  const removeEquipment = (id: string) => {
    handleChange('items', items.filter(item => item.id !== id));
  };


  const getCategoryColor = (category: string): string => {
    return EQUIPMENT_CATEGORIES.find(c => c.id === category)?.color || '#64748B';
  };

  return (
    <View style={styles.container}>
      {/* Category Selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Ekipman Kategorisi Seçin</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesRow}>
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: selectedCategory === cat.id ? cat.color : isDark ? '#27272A' : '#F8FAFC',
                    borderColor: selectedCategory === cat.id ? cat.color : isDark ? '#3F3F46' : '#E2E8F0',
                  },
                ]}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={20}
                  color={selectedCategory === cat.id ? '#FFFFFF' : cat.color}
                />
                <Text
                  style={[
                    styles.categoryName,
                    { color: selectedCategory === cat.id ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Preset Equipment for Selected Category */}
      {selectedCategory && (
        <View style={styles.presetsSection}>
          <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
            Hızlı Ekle - {EQUIPMENT_CATEGORIES.find(c => c.id === selectedCategory)?.label}
          </Text>
          <View style={styles.presetsGrid}>
            {PRESET_EQUIPMENT[selectedCategory]?.map((preset, index) => {
              const isAdded = items.some(item => item.name === preset.name);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: isAdded
                        ? getCategoryColor(selectedCategory)
                        : isDark ? '#27272A' : '#F1F5F9',
                    },
                  ]}
                  onPress={() => {
                    if (!isAdded) {
                      addEquipment(preset.name, selectedCategory);
                    }
                  }}
                  disabled={isAdded}
                >
                  <Ionicons
                    name={isAdded ? 'checkmark' : 'add'}
                    size={14}
                    color={isAdded ? '#FFFFFF' : colors.text}
                  />
                  <Text
                    style={[
                      styles.presetText,
                      { color: isAdded ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {preset.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Selected Equipment List */}
      {items.length > 0 && (
        <View style={styles.selectedSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.label, { color: colors.text }]}>Seçilen Ekipmanlar</Text>
            <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.countText}>{items.length}</Text>
            </View>
          </View>
          {items.map((item) => (
            <View
              key={item.id}
              style={[styles.equipmentCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}
            >
              <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(item.category) }]} />
              <View style={styles.equipmentInfo}>
                <Text style={[styles.equipmentName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
                  {EQUIPMENT_CATEGORIES.find(c => c.id === item.category)?.label || item.category}
                </Text>
              </View>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}
                  onPress={() => updateQuantity(item.id, -1)}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}
                  onPress={() => updateQuantity(item.id, 1)}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeEquipment(item.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add Custom Equipment Button */}
      <TouchableOpacity
        style={[styles.addCustomBtn, { backgroundColor: isDark ? '#27272A' : '#F1F5F9' }]}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        <Text style={[styles.addCustomText, { color: colors.primary }]}>Özel Ekipman Ekle</Text>
      </TouchableOpacity>

      {/* Power Requirement */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="flash" size={16} color="#EF4444" />
          <Text style={[styles.label, { color: colors.text }]}>Toplam Güç İhtiyacı</Text>
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
          value={data.powerRequirement || ''}
          onChangeText={(text) => handleChange('powerRequirement', text)}
          placeholder="örn: 50 kVA"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Add Custom Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Özel Ekipman Ekle</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                    color: colors.text,
                    borderColor: isDark ? '#3F3F46' : '#E2E8F0',
                  },
                ]}
                value={customItem.name}
                onChangeText={(text) => setCustomItem({ ...customItem, name: text })}
                placeholder="Ekipman adı"
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity
                style={[styles.modalAddBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  if (customItem.name.trim()) {
                    addEquipment(customItem.name.trim(), selectedCategory || 'other');
                    setCustomItem({ name: '', quantity: 1 });
                    setShowAddModal(false);
                  }
                }}
              >
                <Text style={styles.modalAddText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 13,
    marginBottom: 10,
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
  categoriesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    minWidth: 90,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
  },
  presetsSection: {
    marginBottom: 16,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  equipmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryText: {
    fontSize: 11,
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    padding: 4,
  },
  addCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  addCustomText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    gap: 16,
    paddingBottom: 20,
  },
  modalAddBtn: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalAddText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default EquipmentFormModule;
