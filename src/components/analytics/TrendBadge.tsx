import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface TrendBadgeProps {
  value: number;
  size?: 'small' | 'medium';
}

export function TrendBadge({ value, size = 'medium' }: TrendBadgeProps) {
  const { colors } = useTheme();

  const isPositive = value >= 0;
  const trendColor = isPositive ? colors.success : colors.error;
  const bgColor = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
  const iconName = isPositive ? 'trending-up' : 'trending-down';

  const isSmall = size === 'small';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }, isSmall && styles.containerSmall]}>
      <Ionicons name={iconName} size={isSmall ? 12 : 14} color={trendColor} />
      <Text style={[styles.text, { color: trendColor }, isSmall && styles.textSmall]}>
        {isPositive ? '+' : ''}{value}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  containerSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 11,
  },
});
