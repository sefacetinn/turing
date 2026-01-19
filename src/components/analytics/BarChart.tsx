import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { MonthlyData, formatCompactCurrency, analyticsColors } from '../../data/analyticsData';

interface BarChartProps {
  data: MonthlyData[];
  showExpenses?: boolean;
  title?: string;
}

export function BarChart({ data, showExpenses = false, title }: BarChartProps) {
  const { colors, isDark } = useTheme();
  const animatedValues = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Reset animations when data changes
    animatedValues.forEach((anim) => anim.setValue(0));

    const animations = animatedValues.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: false,
      })
    );

    Animated.parallel(animations).start();
  }, [data]);

  const maxValue = Math.max(
    ...data.map((item) => (showExpenses ? Math.max(item.income, item.expenses) : item.income))
  );

  const accentColor = colors.brand[400];
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}

      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const incomeHeight = (item.income / maxValue) * 100;
          const expenseHeight = showExpenses ? (item.expenses / maxValue) * 100 : 0;

          return (
            <View key={index} style={styles.barGroup}>
              <View style={styles.barsWrapper}>
                {showExpenses && (
                  <Animated.View
                    style={[
                      styles.bar,
                      styles.expenseBar,
                      {
                        height: animatedValues[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${expenseHeight}%`],
                        }),
                        backgroundColor: analyticsColors.expense,
                      },
                    ]}
                  />
                )}
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      height: animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', `${incomeHeight}%`],
                      }),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[accentColor, isDark ? 'rgba(75, 48, 184, 0.5)' : 'rgba(75, 48, 184, 0.3)']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                </Animated.View>
              </View>
              <Text style={[styles.barLabel, { color: colors.textMuted }]}>
                {item.month.slice(0, 3)}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>
            Gelir: {formatCompactCurrency(totalIncome)}
          </Text>
        </View>
        {showExpenses && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: analyticsColors.expense }]} />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>
              Gider: {formatCompactCurrency(totalExpenses)}
            </Text>
          </View>
        )}
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
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 8,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  barsWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    width: '100%',
  },
  bar: {
    flex: 1,
    maxWidth: 20,
    borderRadius: 4,
    minHeight: 4,
    overflow: 'hidden',
  },
  expenseBar: {
    opacity: 0.8,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },
});
