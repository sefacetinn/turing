import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import type { AdminKPI } from '../../types/admin';

interface AdminKPICardProps {
  kpi: AdminKPI;
}

export function AdminKPICard({ kpi }: AdminKPICardProps) {
  const { colors, isDark } = useTheme();

  const getTrendIcon = () => {
    if (!kpi.trend) return null;
    switch (kpi.trend) {
      case 'up':
        return { icon: 'trending-up', color: '#10b981' };
      case 'down':
        return { icon: 'trending-down', color: '#ef4444' };
      default:
        return { icon: 'remove', color: colors.textMuted };
    }
  };

  const trend = getTrendIcon();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${kpi.color}20` }]}>
          <Ionicons name={kpi.icon as any} size={18} color={kpi.color} />
        </View>
        {kpi.change !== undefined && trend && (
          <View style={styles.trendContainer}>
            <Ionicons name={trend.icon as any} size={14} color={trend.color} />
            <Text style={[styles.changeText, { color: trend.color }]}>
              {kpi.change > 0 ? '+' : ''}{kpi.change}%
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.value, { color: colors.text }]}>
        {kpi.value}
      </Text>

      <Text style={[styles.label, { color: colors.textMuted }]}>
        {kpi.label}
      </Text>

      {kpi.changeLabel && (
        <Text style={[styles.changeLabel, { color: colors.textMuted }]}>
          {kpi.changeLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  changeLabel: {
    fontSize: 11,
    marginTop: 4,
  },
});

export default AdminKPICard;
