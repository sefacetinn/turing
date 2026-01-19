import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { PeriodType } from '../../data/analyticsData';

interface PeriodSelectorProps {
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

const periods: { id: PeriodType; label: string }[] = [
  { id: 'monthly', label: 'Aylık' },
  { id: 'quarterly', label: 'Çeyreklik' },
  { id: 'yearly', label: 'Yıllık' },
];

export function PeriodSelector({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) {
  const { colors, isDark } = useTheme();

  const accentColor = colors.brand[400];
  const accentBg = isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.08)';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]}>
      {periods.map((period) => {
        const isSelected = selectedPeriod === period.id;
        return (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.button,
              isSelected && { backgroundColor: accentBg },
            ]}
            onPress={() => onPeriodChange(period.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.buttonText,
                { color: isSelected ? accentColor : colors.textSecondary },
                isSelected && styles.buttonTextSelected,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonTextSelected: {
    fontWeight: '600',
  },
});
