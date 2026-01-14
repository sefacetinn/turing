import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface RiderStatusBadgeProps {
  type: 'technical' | 'transport' | 'accommodation' | 'backstage';
  isComplete: boolean;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const riderConfig = {
  technical: {
    icon: 'hardware-chip-outline' as const,
    label: 'Teknik',
    color: '#6366F1',
  },
  transport: {
    icon: 'car-outline' as const,
    label: 'Ulaşım',
    color: '#F59E0B',
  },
  accommodation: {
    icon: 'bed-outline' as const,
    label: 'Konaklama',
    color: '#10B981',
  },
  backstage: {
    icon: 'cafe-outline' as const,
    label: 'Backstage',
    color: '#EC4899',
  },
};

export default function RiderStatusBadge({
  type,
  isComplete,
  showLabel = true,
  size = 'medium'
}: RiderStatusBadgeProps) {
  const { colors } = useTheme();
  const config = riderConfig[type];

  const sizeStyles = {
    small: { padding: 4, iconSize: 14, fontSize: 10 },
    medium: { padding: 6, iconSize: 16, fontSize: 12 },
    large: { padding: 8, iconSize: 20, fontSize: 14 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isComplete ? config.color + '20' : colors.border,
          padding: currentSize.padding,
        },
      ]}
    >
      <Ionicons
        name={config.icon}
        size={currentSize.iconSize}
        color={isComplete ? config.color : colors.textSecondary}
      />
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: isComplete ? config.color : colors.textSecondary,
              fontSize: currentSize.fontSize,
            },
          ]}
        >
          {config.label}
        </Text>
      )}
      {isComplete && (
        <Ionicons
          name="checkmark-circle"
          size={currentSize.iconSize - 2}
          color={config.color}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
  },
  label: {
    fontWeight: '500',
  },
});
