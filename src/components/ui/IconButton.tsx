import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';

export type IconButtonVariant = 'default' | 'primary' | 'danger' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconName = keyof typeof Ionicons.glyphMap;

export interface IconButtonProps {
  icon: IconName;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  hapticFeedback?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
}

export function IconButton({
  icon,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  onPress,
  style,
  hapticFeedback = true,
  accessibilityLabel,
  accessibilityHint,
}: IconButtonProps) {
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    if (disabled || loading) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress?.();
  };

  // Get size styles
  const getSizeStyles = (): {
    container: ViewStyle;
    iconSize: number;
  } => {
    switch (size) {
      case 'sm':
        return {
          container: { width: 36, height: 36, borderRadius: 10 },
          iconSize: 18,
        };
      case 'lg':
        return {
          container: { width: 52, height: 52, borderRadius: 16 },
          iconSize: 26,
        };
      case 'md':
      default:
        return {
          container: { width: 44, height: 44, borderRadius: 12 },
          iconSize: 22,
        };
    }
  };

  // Get variant styles
  const getVariantStyles = (): {
    container: ViewStyle;
    iconColor: string;
  } => {
    const isDisabled = disabled || loading;

    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled
              ? colors.zinc[700]
              : colors.brand[500],
          },
          iconColor: isDisabled ? colors.textMuted : 'white',
        };

      case 'danger':
        return {
          container: {
            backgroundColor: isDisabled
              ? colors.zinc[700]
              : isDark
              ? 'rgba(239, 68, 68, 0.15)'
              : 'rgba(239, 68, 68, 0.1)',
          },
          iconColor: isDisabled ? colors.textMuted : colors.error,
        };

      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          iconColor: isDisabled ? colors.textMuted : colors.text,
        };

      case 'default':
      default:
        return {
          container: {
            backgroundColor: isDisabled
              ? colors.zinc[800]
              : isDark
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.04)',
          },
          iconColor: isDisabled ? colors.textMuted : colors.text,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.container,
        sizeStyles.container,
        variantStyles.container,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.iconColor} />
      ) : (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={variantStyles.iconColor}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconButton;
