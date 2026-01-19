import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { CategoryData, formatCompactCurrency } from '../../data/analyticsData';

interface CategoryBreakdownProps {
  data: CategoryData[];
  title?: string;
}

export function CategoryBreakdown({ data, title }: CategoryBreakdownProps) {
  const { colors, isDark } = useTheme();
  const animatedWidths = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Reset animations when data changes
    animatedWidths.forEach((anim) => anim.setValue(0));

    const animations = animatedWidths.map((anim, index) =>
      Animated.timing(anim, {
        toValue: data[index].percentage,
        duration: 600,
        delay: index * 80,
        useNativeDriver: false,
      })
    );

    Animated.parallel(animations).start();
  }, [data]);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}

      {/* Stacked bar */}
      <View style={styles.stackedBar}>
        {data.map((item, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              {
                width: `${item.percentage}%`,
                backgroundColor: item.color,
                borderTopLeftRadius: index === 0 ? 6 : 0,
                borderBottomLeftRadius: index === 0 ? 6 : 0,
                borderTopRightRadius: index === data.length - 1 ? 6 : 0,
                borderBottomRightRadius: index === data.length - 1 ? 6 : 0,
              },
            ]}
          />
        ))}
      </View>

      {/* Category list */}
      <View style={styles.list}>
        {data.map((item, index) => (
          <View
            key={index}
            style={[
              styles.row,
              index !== data.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon as any} size={14} color={item.color} />
              </View>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            </View>
            <View style={styles.rowRight}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: item.color,
                      width: animatedWidths[index].interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </Animated.View>
              <View style={styles.values}>
                <Text style={[styles.amount, { color: colors.text }]}>
                  {formatCompactCurrency(item.amount)}
                </Text>
                <Text style={[styles.percentage, { color: colors.textMuted }]}>
                  {item.percentage}%
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={[styles.total, { borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}>
        <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Toplam</Text>
        <Text style={[styles.totalValue, { color: colors.text }]}>{formatCompactCurrency(total)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  stackedBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  segment: {
    height: '100%',
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'flex-end',
  },
  progressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  values: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  amount: {
    fontSize: 13,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 10,
    marginTop: 1,
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
