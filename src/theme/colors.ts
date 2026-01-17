// Brand Colors - Deep Purple Palette (shared between themes)
export const brandColors = {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#4b30b8',
  500: '#4027a0',
  600: '#351e88',
  700: '#2a1570',
  800: '#1f0c58',
  900: '#140340',
};

// Category Colors (shared)
export const categoryColors = {
  booking: { from: '#4b30b8', to: '#7c6cd9' },
  technical: { from: '#059669', to: '#34d399' },
  accommodation: { from: '#db2777', to: '#f472b6' },
  venue: { from: '#2563eb', to: '#60a5fa' },
  flight: { from: '#475569', to: '#94a3b8' },
  transport: { from: '#dc2626', to: '#f87171' },
  operation: { from: '#d97706', to: '#fbbf24' },
};

// Semantic Colors (shared)
export const semanticColors = {
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',
};

// Zinc Scale
export const zincScale = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b',
};

// Shadow definitions
export const shadows = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ============================================
// DARK THEME (Current Default)
// ============================================
export const darkTheme = {
  // Brand
  brand: brandColors,

  // Legacy
  primary: '#4b30b8',
  primaryDark: '#351e88',
  secondary: '#f97316',
  secondaryDark: '#ea580c',

  // Category
  category: categoryColors,

  // Semantic
  ...semanticColors,

  // Surface - Dark
  background: '#09090b',
  backgroundSecondary: '#0f0f12',
  surface: '#18181b',
  surfaceAlt: '#1f1f23',
  surfaceElevated: '#27272a',
  surfaceHover: '#3f3f46',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.04)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',

  // Glass/Glassmorphism effects - Dark
  glass: 'rgba(255, 255, 255, 0.03)',
  glassHover: 'rgba(255, 255, 255, 0.05)',
  glassStrong: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.06)',
  glassBorderStrong: 'rgba(255, 255, 255, 0.12)',

  // Text - Dark Theme
  text: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  textInverse: '#18181b',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',

  // Card backgrounds
  cardBackground: 'rgba(255, 255, 255, 0.02)',
  cardBackgroundHover: 'rgba(255, 255, 255, 0.04)',
  cardBackgroundSolid: '#18181b',
  cardBackgroundActive: 'rgba(75, 48, 184, 0.05)',

  // Input
  inputBackground: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  inputFocusBorder: 'rgba(75, 48, 184, 0.5)',

  // Tab bar
  tabBar: '#09090b',
  tabBarBorder: 'rgba(255, 255, 255, 0.08)',
  tabActive: brandColors[400],
  tabInactive: zincScale[600],

  // Status bar
  statusBarStyle: 'light' as 'light' | 'dark',

  // Zinc scale
  zinc: zincScale,

  // Shadows - No shadows in dark mode
  shadow: {
    none: {},
    sm: {},
    md: {},
    lg: {},
    xl: {},
  },

  // Common
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// ============================================
// LIGHT THEME (Professional Light Mode)
// ============================================
export const lightTheme = {
  // Brand - Darker for better contrast on light backgrounds
  brand: {
    ...brandColors,
    400: '#4b30b8',
    500: '#4027a0',
    600: '#351e88',
    700: '#2a1570',
  },

  // Legacy - Improved contrast
  primary: '#4b30b8',
  primaryDark: '#351e88',
  secondary: '#c2410c',
  secondaryDark: '#9a3412',

  // Category
  category: categoryColors,

  // Semantic - Same but with light backgrounds
  ...semanticColors,

  // Surface - Light
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  surface: '#f4f4f5',
  surfaceAlt: '#f0f0f2',
  surfaceElevated: '#ffffff',
  surfaceHover: '#e4e4e7',
  border: 'rgba(0, 0, 0, 0.08)',
  borderLight: 'rgba(0, 0, 0, 0.05)',
  borderStrong: 'rgba(0, 0, 0, 0.15)',

  // Glass/Glassmorphism effects - Light (black opacity visible on white)
  glass: 'rgba(0, 0, 0, 0.02)',
  glassHover: 'rgba(0, 0, 0, 0.04)',
  glassStrong: 'rgba(0, 0, 0, 0.06)',
  glassBorder: 'rgba(0, 0, 0, 0.08)',
  glassBorderStrong: 'rgba(0, 0, 0, 0.12)',

  // Text - Light Theme
  text: '#18181b',
  textSecondary: '#52525b',
  textMuted: '#71717a',
  textInverse: '#fafafa',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Card backgrounds - Subtle gray tint for visibility
  cardBackground: '#fafafa',
  cardBackgroundHover: '#f4f4f5',
  cardBackgroundSolid: '#ffffff',
  cardBackgroundActive: 'rgba(75, 48, 184, 0.08)',

  // Input
  inputBackground: '#f4f4f5',
  inputBorder: 'rgba(0, 0, 0, 0.12)',
  inputFocusBorder: 'rgba(75, 48, 184, 0.5)',

  // Tab bar
  tabBar: '#ffffff',
  tabBarBorder: 'rgba(0, 0, 0, 0.08)',
  tabActive: '#4b30b8',
  tabInactive: zincScale[400],

  // Status bar
  statusBarStyle: 'dark' as 'light' | 'dark',

  // Zinc scale - SAME as dark theme (components use isDark to choose)
  zinc: zincScale,

  // Shadows - Active in light mode
  shadow: shadows,

  // Common
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// Theme type
export type ThemeColors = typeof darkTheme;
export type ThemeType = 'dark' | 'light';

// Default export (dark theme for backward compatibility)
export const colors = darkTheme;

// Gradients (shared between themes)
export const gradients = {
  primary: ['#4b30b8', '#5c3fca', '#7c6cd9'] as const,
  primaryLight: ['#7c6cd9', '#5c3fca', '#4b30b8'] as const,
  booking: ['#4b30b8', '#7c6cd9'] as const,
  technical: ['#059669', '#34d399'] as const,
  accommodation: ['#db2777', '#f472b6'] as const,
  venue: ['#2563eb', '#60a5fa'] as const,
  flight: ['#475569', '#94a3b8'] as const,
  transport: ['#dc2626', '#f87171'] as const,
  operation: ['#d97706', '#fbbf24'] as const,
};

export const categoryGradients = {
  wedding: ['#ec4899', '#f472b6'] as const,
  corporate: ['#3b82f6', '#60a5fa'] as const,
  concert: ['#4b30b8', '#7c6cd9'] as const,
  party: ['#f59e0b', '#fbbf24'] as const,
  festival: ['#10b981', '#34d399'] as const,
};

// Legacy export for backward compatibility
export const lightShadows = shadows;

// Helper to get theme colors
export const getTheme = (theme: ThemeType): ThemeColors => {
  return theme === 'light' ? lightTheme : darkTheme;
};
