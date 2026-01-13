import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface SearchBarProps {
  placeholder?: string;
  onPress: () => void;
}

export function SearchBar({ placeholder = 'Ara...', onPress }: SearchBarProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.glass,
          borderColor: colors.glassBorder,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name="search" size={18} color={colors.textMuted} style={styles.icon} />
      <Text style={[styles.placeholder, { color: colors.textMuted }]}>{placeholder}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  icon: {
    marginLeft: 2,
  },
  placeholder: {
    fontSize: 15,
    flex: 1,
  },
});
