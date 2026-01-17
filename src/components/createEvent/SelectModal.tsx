import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet, TextInput } from 'react-native';
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
  searchable?: boolean;
}

export function SelectModal({ visible, title, options, selectedValue, onSelect, onClose, searchable = true }: SelectModalProps) {
  const { colors, isDark } = useTheme();
  const [searchText, setSearchText] = useState('');

  // Filter options based on search text
  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) return options;
    const searchLower = searchText.toLowerCase().trim();
    return options.filter(option =>
      option.label.toLowerCase().includes(searchLower) ||
      (option.subtitle && option.subtitle.toLowerCase().includes(searchLower))
    );
  }, [options, searchText]);

  // Reset search when modal closes
  const handleClose = useCallback(() => {
    setSearchText('');
    onClose();
  }, [onClose]);

  const handleSelect = useCallback((value: string) => {
    setSearchText('');
    onSelect(value);
    onClose();
  }, [onSelect, onClose]);

  const renderItem = useCallback(({ item }: { item: SelectOption }) => {
    const isSelected = selectedValue === item.value;
    return (
      <TouchableOpacity
        style={[
          styles.optionItem,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
          },
          isSelected && {
            backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)',
            borderColor: colors.brand[400],
          }
        ]}
        onPress={() => handleSelect(item.value)}
      >
        <View style={styles.optionContent}>
          <Text
            style={[
              styles.optionItemText,
              { color: colors.textMuted },
              isSelected && { color: colors.text, fontWeight: '500' }
            ]}
          >
            {item.label}
          </Text>
          {item.subtitle && (
            <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          )}
        </View>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color={colors.brand[400]} />
        )}
      </TouchableOpacity>
    );
  }, [selectedValue, isDark, colors, handleSelect]);

  const keyExtractor = useCallback((item: SelectOption) => item.value, []);

  const showSearch = searchable && options.length > 10;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          {showSearch && (
            <View style={styles.searchContainer}>
              <View style={[styles.searchInputContainer, {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
              }]}>
                <Ionicons name="search" size={18} color={colors.textMuted} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Ara..."
                  placeholderTextColor={colors.textMuted}
                  value={searchText}
                  onChangeText={setSearchText}
                  autoCorrect={false}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchText('')}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Options List with FlatList for better performance */}
          <FlatList
            data={filteredOptions}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            style={styles.optionsList}
            contentContainerStyle={styles.optionsListContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={32} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Sonuç bulunamadı
                </Text>
              </View>
            }
          />
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionsListContent: {
    paddingTop: 4,
    paddingBottom: 20,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});
