import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface SelectionChipsProps {
  options: string[];
  selected: string | string[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
}

export function SelectionChips({ options, selected, onSelect, multiSelect = false }: SelectionChipsProps) {
  const { colors, isDark } = useTheme();

  const isSelected = (option: string) => {
    if (multiSelect && Array.isArray(selected)) {
      return selected.includes(option);
    }
    return selected === option;
  };

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.chip,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
            },
            isSelected(option) && {
              backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.12)',
              borderColor: colors.brand[500],
            }
          ]}
          onPress={() => onSelect(option)}
        >
          <Text style={[
            styles.chipText,
            { color: colors.textMuted },
            isSelected(option) && { color: colors.brand[400], fontWeight: '500' }
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
});
