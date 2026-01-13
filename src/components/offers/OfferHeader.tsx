import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface OfferHeaderProps {
  isProviderMode: boolean;
  activeCount: number;
  showFilter?: boolean;
  onFilterPress?: () => void;
}

export function OfferHeader({ isProviderMode, activeCount, showFilter = true, onFilterPress }: OfferHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isProviderMode ? 'Gönderilen Teklifler' : 'Gelen Teklifler'}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          {activeCount} aktif teklif
        </Text>
      </View>
      {showFilter && !isProviderMode && (
        <TouchableOpacity
          style={[styles.filterButton, {
            backgroundColor: colors.glass,
            borderColor: colors.glassBorder
          }]}
          onPress={onFilterPress}
        >
          <Ionicons name="filter" size={18} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
