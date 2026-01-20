/**
 * Provider Atama Modal
 *
 * Operasyon bölümlerine provider atamak için kullanılan modal
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { SectionProvider, OperationSectionType, SECTION_META } from '../../types/operationSection';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// TODO: Fetch providers from Firebase
// Empty array for production - will be populated from Firebase
const MOCK_PROVIDERS: SectionProvider[] = [];

interface ProviderAssignmentModalProps {
  visible: boolean;
  sectionType: OperationSectionType;
  currentProvider?: SectionProvider | null;
  onAssign: (provider: SectionProvider) => void;
  onClose: () => void;
}

export function ProviderAssignmentModal({
  visible,
  sectionType,
  currentProvider,
  onAssign,
  onClose,
}: ProviderAssignmentModalProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<SectionProvider | null>(
    currentProvider || null
  );

  const sectionMeta = SECTION_META[sectionType];

  // Filter providers based on search
  const filteredProviders = useMemo(() => {
    if (!searchText.trim()) return MOCK_PROVIDERS;
    const search = searchText.toLowerCase();
    return MOCK_PROVIDERS.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.contactPerson.toLowerCase().includes(search)
    );
  }, [searchText]);

  const handleSelect = useCallback((provider: SectionProvider) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedProvider(provider);
  }, []);

  const handleAssign = useCallback(() => {
    if (selectedProvider) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onAssign(selectedProvider);
      onClose();
    }
  }, [selectedProvider, onAssign, onClose]);

  const handleClose = useCallback(() => {
    setSearchText('');
    setSelectedProvider(currentProvider || null);
    onClose();
  }, [currentProvider, onClose]);

  const renderProvider = useCallback(
    ({ item }: { item: SectionProvider }) => {
      const isSelected = selectedProvider?.id === item.id;
      return (
        <TouchableOpacity
          style={[
            styles.providerItem,
            {
              backgroundColor: isDark ? colors.zinc[800] : colors.zinc[50],
              borderColor: isSelected ? colors.primary : isDark ? colors.zinc[700] : colors.zinc[200],
              borderWidth: isSelected ? 2 : 1,
            },
          ]}
          onPress={() => handleSelect(item)}
          activeOpacity={0.7}
        >
          <Image source={{ uri: item.logo }} style={styles.providerLogo} />
          <View style={styles.providerInfo}>
            <Text style={[styles.providerName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.providerContact, { color: colors.textSecondary }]}>
              {item.contactPerson}
            </Text>
            <Text style={[styles.providerPhone, { color: colors.textMuted }]}>
              {item.contactPhone}
            </Text>
          </View>
          {isSelected && (
            <View style={[styles.checkIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [selectedProvider, colors, isDark, handleSelect]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? colors.zinc[900] : '#fff',
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Ionicons
                name={sectionMeta?.icon as any || 'cube'}
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.title, { color: colors.text }]}>
                {sectionMeta?.name || 'Bölüm'} - Provider Ata
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Search */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
                borderColor: isDark ? colors.zinc[700] : colors.zinc[300],
              },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Provider ara..."
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Provider List */}
          <FlatList
            data={filteredProviders}
            renderItem={renderProvider}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Provider bulunamadı
                </Text>
              </View>
            }
          />

          {/* Assign Button */}
          <TouchableOpacity
            style={[
              styles.assignButton,
              {
                backgroundColor: selectedProvider ? colors.primary : colors.zinc[400],
              },
            ]}
            onPress={handleAssign}
            disabled={!selectedProvider}
            activeOpacity={0.8}
          >
            <Text style={styles.assignButtonText}>
              {selectedProvider ? `${selectedProvider.name} Ata` : 'Provider Seçin'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  providerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  providerLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  providerContact: {
    fontSize: 14,
    marginTop: 2,
  },
  providerPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  assignButton: {
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
