/**
 * DetailRow - Detay Satırı Bileşeni
 *
 * Modüllerde bilgi gösterimi için ortak satır yapısı.
 */

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';

interface DetailRowProps {
  icon?: string;
  iconColor?: string;
  label: string;
  value: string | number | ReactNode;
  sublabel?: string;
  style?: ViewStyle;
  compact?: boolean;
  borderBottom?: boolean;
}

export const DetailRow: React.FC<DetailRowProps> = ({
  icon,
  iconColor = '#6366F1',
  label,
  value,
  sublabel,
  style,
  compact = false,
  borderBottom = true,
}) => {
  const { colors, isDark } = useTheme();

  const renderValue = () => {
    if (typeof value === 'string' || typeof value === 'number') {
      return (
        <Text style={[styles.value, { color: colors.text }]} numberOfLines={2}>
          {value}
        </Text>
      );
    }
    return value;
  };

  return (
    <View
      style={[
        styles.row,
        compact && styles.rowCompact,
        borderBottom && {
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
        },
        style,
      ]}
    >
      <View style={styles.left}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons name={icon as any} size={16} color={iconColor} />
          </View>
        )}
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
          {sublabel && (
            <Text style={[styles.sublabel, { color: colors.textSecondary }]}>{sublabel}</Text>
          )}
        </View>
      </View>
      <View style={styles.right}>{renderValue()}</View>
    </View>
  );
};

interface DetailGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  style?: ViewStyle;
}

export const DetailGrid: React.FC<DetailGridProps> = ({
  children,
  columns = 2,
  style,
}) => {
  return (
    <View style={[styles.grid, { flexWrap: 'wrap' }, style]}>
      {React.Children.map(children, (child, index) => (
        <View style={{ width: `${100 / columns}%`, paddingRight: index % columns !== columns - 1 ? 8 : 0 }}>
          {child}
        </View>
      ))}
    </View>
  );
};

interface DetailStatProps {
  icon?: string;
  iconColor?: string;
  label: string;
  value: string | number;
  unit?: string;
  style?: ViewStyle;
}

export const DetailStat: React.FC<DetailStatProps> = ({
  icon,
  iconColor = '#6366F1',
  label,
  value,
  unit,
  style,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.stat, style]}>
      {icon && (
        <View style={[styles.statIcon, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon as any} size={14} color={iconColor} />
        </View>
      )}
      <Text style={[styles.statValue, { color: colors.text }]}>
        {value}
        {unit && <Text style={styles.statUnit}> {unit}</Text>}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowCompact: {
    paddingVertical: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
    maxWidth: '50%',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
  },
  sublabel: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row',
    marginTop: 4,
  },
  stat: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.7,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default DetailRow;
