import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export function EmptyOfferState() {
  const { colors } = useTheme();

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyStateIcon, { backgroundColor: colors.glass }]}>
        <Ionicons name="pricetags-outline" size={48} color={colors.textMuted} />
      </View>
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Teklif Bulunamadı</Text>
      <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
        Bu kategoride henüz teklif yok.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
