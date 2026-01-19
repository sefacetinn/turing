import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  Platform,
  Keyboard,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const modalHeightAnim = useRef(new Animated.Value(SCREEN_HEIGHT * 0.8)).current;
  const searchInputRef = useRef<TextInput>(null);

  // Handle keyboard events
  useEffect(() => {
    if (!visible) return;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      const kbHeight = event.endCoordinates.height;
      setKeyboardHeight(kbHeight);

      // Animate modal to make room for keyboard
      Animated.timing(modalHeightAnim, {
        toValue: SCREEN_HEIGHT - kbHeight - 50, // Leave some space at top
        duration: event.duration || 250,
        useNativeDriver: false,
      }).start();
    });

    const hideSubscription = Keyboard.addListener(hideEvent, (event) => {
      setKeyboardHeight(0);

      Animated.timing(modalHeightAnim, {
        toValue: SCREEN_HEIGHT * 0.8,
        duration: event.duration || 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [visible, modalHeightAnim]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!visible) {
      setSearchText('');
      setKeyboardHeight(0);
      modalHeightAnim.setValue(SCREEN_HEIGHT * 0.8);
    }
  }, [visible, modalHeightAnim]);

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
    Keyboard.dismiss();
    setSearchText('');
    onClose();
  }, [onClose]);

  const handleSelect = useCallback((value: string) => {
    Keyboard.dismiss();
    setSearchText('');
    onSelect(value);
    onClose();
  }, [onSelect, onClose]);

  const handleOverlayPress = useCallback(() => {
    Keyboard.dismiss();
    handleClose();
  }, [handleClose]);

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
        activeOpacity={0.7}
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
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.background,
                  maxHeight: modalHeightAnim,
                }
              ]}
            >
              {/* Drag Handle */}
              <View style={styles.dragHandleContainer}>
                <View style={[styles.dragHandle, { backgroundColor: colors.textMuted }]} />
              </View>

              {/* Header */}
              <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
                <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
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
                      ref={searchInputRef}
                      style={[styles.searchInput, { color: colors.text }]}
                      placeholder="Ara..."
                      placeholderTextColor={colors.textMuted}
                      value={searchText}
                      onChangeText={setSearchText}
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="search"
                      blurOnSubmit={false}
                    />
                    {searchText.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchText('')}>
                        <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Options List */}
              <FlatList
                data={filteredOptions}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                style={styles.optionsList}
                contentContainerStyle={[
                  styles.optionsListContent,
                  { paddingBottom: Math.max(20, keyboardHeight > 0 ? 20 : 40) }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={32} color={colors.textMuted} />
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                      Sonuç bulunamadı
                    </Text>
                  </View>
                }
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
    overflow: 'hidden',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
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
    paddingTop: 8,
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
