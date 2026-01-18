import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
  viewAllText?: string;
}

export const SectionHeader = memo(function SectionHeader({ title, onViewAll, viewAllText = 'Tümü' }: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {onViewAll && (
        <TouchableOpacity style={styles.link} onPress={onViewAll}>
          <Text style={[styles.linkText, { color: colors.brand[400] }]}>{viewAllText}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.brand[400]} />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
