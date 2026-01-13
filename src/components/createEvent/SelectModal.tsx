import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface SelectOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface SelectModalProps {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function SelectModal({ visible, title, options, selectedValue, onSelect, onClose }: SelectModalProps) {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
            {options.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
                  },
                  selectedValue === option.value && {
                    backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.1)',
                    borderColor: colors.brand[400],
                  }
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionItemText,
                      { color: colors.textMuted },
                      selectedValue === option.value && { color: colors.text, fontWeight: '500' }
                    ]}
                  >
                    {option.label}
                  </Text>
                  {option.subtitle && (
                    <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                      {option.subtitle}
                    </Text>
                  )}
                </View>
                {selectedValue === option.value && (
                  <Ionicons name="checkmark" size={20} color={colors.brand[400]} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsList: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionContent: {
    flex: 1,
  },
  optionItemText: {
    fontSize: 15,
  },
  optionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
