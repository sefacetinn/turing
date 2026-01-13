import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface SwitchRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function SwitchRow({ icon, label, value, onValueChange }: SwitchRowProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
      }
    ]}>
      <View style={styles.info}>
        <Ionicons name={icon} size={20} color={colors.textMuted} />
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: isDark ? colors.zinc[700] : colors.zinc[300], true: colors.brand[500] }}
        thumbColor="white"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
  },
});
