import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Screen dimensions
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Safe area / padding constants
export const TAB_BAR_HEIGHT = 80;
export const HEADER_HEIGHT = 56;
export const BOTTOM_SPACING = 100; // Space for tab bar + extra padding
export const BOTTOM_SHEET_HANDLE_HEIGHT = 24;

// Common spacing values
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius values
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Hit slop for better touch targets
export const HIT_SLOP = {
  small: { top: 8, bottom: 8, left: 8, right: 8 },
  medium: { top: 10, bottom: 10, left: 10, right: 10 },
  large: { top: 15, bottom: 15, left: 15, right: 15 },
};

// Animation durations
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// Platform specific values
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';

// Keyboard behavior
export const KEYBOARD_BEHAVIOR = IS_IOS ? 'padding' : 'height';

// Status bar height estimation (use SafeAreaView for accuracy)
export const STATUS_BAR_HEIGHT = IS_IOS ? 44 : 24;
