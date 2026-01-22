import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { gradients } from '../../theme/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type IconName = keyof typeof Ionicons.glyphMap;

export interface ButtonProps {
  children?: React.ReactNode;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  fullWidth?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  children,
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  onPress,
  style,
  textStyle,
  hapticFeedback = true,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    if (disabled || loading) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onPress?.();
  };

  // Get size styles
  const getSizeStyles = (): {
    container: ViewStyle;
    text: TextStyle;
    iconSize: number;
  } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
          text: { fontSize: 13 },
          iconSize: 16,
        };
      case 'lg':
        return {
          container: { paddingVertical: 18, paddingHorizontal: 28, borderRadius: 16 },
          text: { fontSize: 17 },
          iconSize: 22,
        };
      case 'md':
      default:
        return {
          container: { paddingVertical: 14, paddingHorizontal: 22, borderRadius: 14 },
          text: { fontSize: 15 },
          iconSize: 18,
        };
    }
  };

  // Get variant styles
  const getVariantStyles = (): {
    container: ViewStyle;
    text: TextStyle;
    iconColor: string;
    useGradient: boolean;
    gradientColors: readonly [string, string, ...string[]];
  } => {
    const isDisabled = disabled || loading;

    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled
              ? colors.zinc[700]
              : isDark
              ? colors.zinc[800]
              : colors.zinc[200],
          },
          text: {
            color: isDisabled ? colors.textMuted : colors.text,
          },
          iconColor: isDisabled ? colors.textMuted : colors.text,
          useGradient: false,
          gradientColors: ['transparent', 'transparent'],
        };

      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: isDisabled
              ? colors.border
              : isDark
              ? colors.brand[400]
              : colors.brand[500],
          },
          text: {
            color: isDisabled
              ? colors.textMuted
              : isDark
              ? colors.brand[400]
              : colors.brand[500],
          },
          iconColor: isDisabled
            ? colors.textMuted
            : isDark
            ? colors.brand[400]
            : colors.brand[500],
          useGradient: false,
          gradientColors: ['transparent', 'transparent'],
        };

      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: isDisabled
              ? colors.textMuted
              : isDark
              ? colors.brand[400]
              : colors.brand[500],
          },
          iconColor: isDisabled
            ? colors.textMuted
            : isDark
            ? colors.brand[400]
            : colors.brand[500],
          useGradient: false,
          gradientColors: ['transparent', 'transparent'],
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
          text: {
            color: isDisabled ? colors.textMuted : colors.error,
          },
          iconColor: isDisabled ? colors.textMuted : colors.error,
          useGradient: false,
          gradientColors: ['transparent', 'transparent'],
        };

      case 'primary':
      default:
        return {
          container: {
            opacity: isDisabled ? 0.6 : 1,
          },
          text: {
            color: 'white',
          },
          iconColor: 'white',
          useGradient: !isDisabled,
          gradientColors: isDisabled ? ['#6b7280', '#4b5563'] : gradients.primary,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const content = (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.iconColor}
          style={styles.loader}
        />
      ) : (
        <>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={sizeStyles.iconSize}
              color={variantStyles.iconColor}
              style={styles.leftIcon}
            />
          )}
          {(label || children) && (
            <Text
              style={[
                styles.text,
                sizeStyles.text,
                variantStyles.text,
                textStyle,
              ]}
            >
              {label || children}
            </Text>
          )}
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={sizeStyles.iconSize}
              color={variantStyles.iconColor}
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </View>
  );

  const containerStyle = [
    styles.container,
    sizeStyles.container,
    variantStyles.container,
    fullWidth && styles.fullWidth,
    style,
  ];

  if (variantStyles.useGradient) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading }}
      >
        <LinearGradient
          colors={variantStyles.gradientColors}
          style={containerStyle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={containerStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  loader: {
    marginVertical: 2,
  },
});

export default Button;
