import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface StatItem {
  label: string;
  value: string;
}

interface StatsCardProps {
  stats: StatItem[];
}

export function StatsCard({ stats }: StatsCardProps) {
  const { colors, isDark, helpers } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          ...(isDark ? {} : helpers.getShadow('sm')),
        },
      ]}
    >
      {stats.map((stat, index) => (
        <View
          key={stat.label}
          style={[
            styles.item,
            index !== 0 && index !== stats.length && styles.itemBorder,
            index !== 0 && index !== stats.length && { borderColor: colors.border },
          ]}
        >
          <Text style={[styles.value, { color: colors.text }]}>{stat.value}</Text>
          <Text style={[styles.label, { color: colors.textMuted }]}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  itemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
  },
});
