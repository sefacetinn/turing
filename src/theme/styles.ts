/**
 * Common Styles Helper
 * Reusable style functions for consistent UI across the app
 */

import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ThemeColors } from './colors';

type ThemeHelpers = {
  getShadow: (size: 'sm' | 'md' | 'lg' | 'xl') => ViewStyle;
};

/**
 * Card style helper - returns consistent card styling
 */
export const getCardStyle = (
  isDark: boolean,
  colors: ThemeColors,
  helpers: ThemeHelpers,
  options?: { elevated?: boolean; active?: boolean }
): ViewStyle => {
  const baseStyle: ViewStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
  };

  if (options?.active) {
    baseStyle.backgroundColor = isDark
      ? 'rgba(75, 48, 184, 0.08)'
      : 'rgba(75, 48, 184, 0.06)';
    baseStyle.borderColor = colors.brand[400];
  }

  if (!isDark && options?.elevated) {
    return { ...baseStyle, ...helpers.getShadow('sm') };
  }

  return baseStyle;
};

/**
 * Glass effect style helper
 */
export const getGlassStyle = (
  isDark: boolean,
  colors: ThemeColors,
  options?: { strong?: boolean }
): ViewStyle => ({
  backgroundColor: options?.strong
    ? (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)')
    : (isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'),
  borderWidth: 1,
  borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)',
  borderRadius: 12,
});

/**
 * Input style helper
 */
export const getInputStyle = (
  isDark: boolean,
  colors: ThemeColors
): ViewStyle => ({
  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 14,
});

/**
 * Badge style helper
 */
export const getBadgeStyle = (
  type: 'success' | 'warning' | 'error' | 'info' | 'brand',
  isDark: boolean,
  colors: ThemeColors
): ViewStyle => {
  const badgeColors = {
    success: { bg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)', border: colors.success },
    warning: { bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)', border: colors.warning },
    error: { bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)', border: colors.error },
    info: { bg: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)', border: colors.info },
    brand: { bg: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)', border: colors.brand[400] },
  };

  return {
    backgroundColor: badgeColors[type].bg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  };
};

/**
 * Section header style
 */
export const getSectionHeaderStyle = (colors: ThemeColors): TextStyle => ({
  fontSize: 18,
  fontWeight: '700',
  color: colors.text,
  marginBottom: 16,
});

/**
 * Divider style
 */
export const getDividerStyle = (isDark: boolean, colors: ThemeColors): ViewStyle => ({
  height: 1,
  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
  marginVertical: 16,
});

/**
 * Button style helper
 */
export const getButtonStyle = (
  variant: 'primary' | 'secondary' | 'outline' | 'ghost',
  isDark: boolean,
  colors: ThemeColors,
  disabled?: boolean
): ViewStyle => {
  const baseStyle: ViewStyle = {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (disabled) {
    return { ...baseStyle, opacity: 0.5 };
  }

  switch (variant) {
    case 'primary':
      return { ...baseStyle, backgroundColor: colors.brand[500] };
    case 'secondary':
      return { ...baseStyle, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' };
    case 'outline':
      return { ...baseStyle, borderWidth: 1, borderColor: colors.brand[400], backgroundColor: 'transparent' };
    case 'ghost':
      return { ...baseStyle, backgroundColor: 'transparent' };
    default:
      return baseStyle;
  }
};

/**
 * Modal overlay style
 */
export const getModalOverlayStyle = (): ViewStyle => ({
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  justifyContent: 'flex-end',
});

/**
 * Modal content style
 */
export const getModalContentStyle = (colors: ThemeColors): ViewStyle => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingTop: 20,
  paddingBottom: 40,
  maxHeight: '70%',
});

/**
 * Common StyleSheet for frequently used patterns
 */
export const commonStyles = StyleSheet.create({
  // Flex containers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },

  // Spacing
  gap4: { gap: 4 },
  gap8: { gap: 8 },
  gap12: { gap: 12 },
  gap16: { gap: 16 },
  gap20: { gap: 20 },
  gap24: { gap: 24 },

  // Padding
  p12: { padding: 12 },
  p16: { padding: 16 },
  p20: { padding: 20 },
  px16: { paddingHorizontal: 16 },
  px20: { paddingHorizontal: 20 },
  py12: { paddingVertical: 12 },
  py16: { paddingVertical: 16 },

  // Margin
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  mt20: { marginTop: 20 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mb20: { marginBottom: 20 },

  // Border radius
  rounded8: { borderRadius: 8 },
  rounded12: { borderRadius: 12 },
  rounded16: { borderRadius: 16 },
  roundedFull: { borderRadius: 9999 },

  // Absolute positioning
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Header common style
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
});

/**
 * Create screen-specific styles with theme support
 */
export const createThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  styleFactory: (isDark: boolean, colors: ThemeColors, helpers: ThemeHelpers) => T
) => styleFactory;
