import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { CrewAssignment, paymentStatusLabels } from '../../data/provider/artistData';

interface PaymentStatusBadgeProps {
  status: CrewAssignment['paymentStatus'];
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showIcon?: boolean;
}

export default function PaymentStatusBadge({
  status,
  size = 'medium',
  showLabel = true,
  showIcon = false,
}: PaymentStatusBadgeProps) {
  const { colors, isDark } = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'paid':
        return {
          color: '#10B981',
          bgColor: 'rgba(16, 185, 129, 0.15)',
          icon: 'checkmark-circle' as const,
          label: paymentStatusLabels.paid,
        };
      case 'pending':
        return {
          color: '#F59E0B',
          bgColor: 'rgba(245, 158, 11, 0.15)',
          icon: 'time' as const,
          label: paymentStatusLabels.pending,
        };
      case 'overdue':
        return {
          color: '#EF4444',
          bgColor: 'rgba(239, 68, 68, 0.15)',
          icon: 'alert-circle' as const,
          label: paymentStatusLabels.overdue,
        };
      case 'partial':
        return {
          color: '#6366F1',
          bgColor: 'rgba(99, 102, 241, 0.15)',
          icon: 'pie-chart' as const,
          label: paymentStatusLabels.partial,
        };
      default:
        return {
          color: colors.textMuted,
          bgColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          icon: 'help-circle' as const,
          label: 'Bilinmiyor',
        };
    }
  };

  const config = getStatusConfig();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 6,
          paddingVertical: 2,
          fontSize: 10,
          iconSize: 12,
          dotSize: 4,
          gap: 4,
        };
      case 'large':
        return {
          paddingHorizontal: 14,
          paddingVertical: 8,
          fontSize: 14,
          iconSize: 18,
          dotSize: 8,
          gap: 8,
        };
      default: // medium
        return {
          paddingHorizontal: 10,
          paddingVertical: 4,
          fontSize: 12,
          iconSize: 14,
          dotSize: 6,
          gap: 6,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
      ]}
    >
      {showIcon ? (
        <Ionicons name={config.icon} size={sizeStyles.iconSize} color={config.color} />
      ) : (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: config.color,
              width: sizeStyles.dotSize,
              height: sizeStyles.dotSize,
              borderRadius: sizeStyles.dotSize / 2,
            },
          ]}
        />
      )}
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: config.color,
              fontSize: sizeStyles.fontSize,
              marginLeft: sizeStyles.gap,
            },
          ]}
        >
          {config.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
  },
  dot: {},
  label: {
    fontWeight: '600',
  },
});
