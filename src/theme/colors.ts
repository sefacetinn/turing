// Brand Colors - Premium Purple Palette (shared between themes)
export const brandColors = {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',
  600: '#9333ea',
  700: '#7c3aed',
  800: '#6b21a8',
  900: '#581c87',
};

// Category Colors (shared)
export const categoryColors = {
  booking: { from: '#9333EA', to: '#6366f1' },
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

// ============================================
// DARK THEME (Current Default)
// ============================================
export const darkTheme = {
  // Brand
  brand: brandColors,

  // Legacy
  primary: '#9333ea',
  primaryDark: '#7c3aed',
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
  surfaceElevated: '#27272a',
  surfaceHover: '#3f3f46',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.04)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',

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
  cardBackgroundActive: 'rgba(147, 51, 234, 0.05)',

  // Input
  inputBackground: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  inputFocusBorder: 'rgba(147, 51, 234, 0.5)',

  // Tab bar
  tabBar: '#09090b',
  tabBarBorder: 'rgba(255, 255, 255, 0.08)',
  tabActive: brandColors[400],
  tabInactive: zincScale[600],

  // Status bar
  statusBarStyle: 'light' as 'light' | 'dark',

  // Zinc scale
  zinc: zincScale,

  // Common
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// ============================================
// LIGHT THEME (Professional Light Mode)
// ============================================
export const lightTheme = {
  // Brand - Slightly darker for better contrast on light
  brand: {
    ...brandColors,
    400: '#a855f7', // Slightly more saturated
    500: '#9333ea',
    600: '#7c3aed',
  },

  // Legacy
  primary: '#7c3aed',
  primaryDark: '#6d28d9',
  secondary: '#ea580c',
  secondaryDark: '#c2410c',

  // Category
  category: categoryColors,

  // Semantic - Same but with light backgrounds
  ...semanticColors,

  // Surface - Light
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  surface: '#f4f4f5',
  surfaceElevated: '#ffffff',
  surfaceHover: '#e4e4e7',
  border: 'rgba(0, 0, 0, 0.08)',
  borderLight: 'rgba(0, 0, 0, 0.04)',
  borderStrong: 'rgba(0, 0, 0, 0.12)',

  // Text - Light Theme
  text: '#18181b',
  textSecondary: '#52525b',
  textMuted: '#71717a',
  textInverse: '#fafafa',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Card backgrounds
  cardBackground: '#ffffff',
  cardBackgroundHover: '#f4f4f5',
  cardBackgroundActive: 'rgba(147, 51, 234, 0.05)',

  // Input
  inputBackground: '#f4f4f5',
  inputBorder: 'rgba(0, 0, 0, 0.1)',
  inputFocusBorder: 'rgba(124, 58, 237, 0.5)',

  // Tab bar
  tabBar: '#ffffff',
  tabBarBorder: 'rgba(0, 0, 0, 0.08)',
  tabActive: brandColors[600],
  tabInactive: zincScale[400],

  // Status bar
  statusBarStyle: 'dark' as 'light' | 'dark',

  // Zinc scale (inverted perception)
  zinc: {
    50: zincScale[950],
    100: zincScale[900],
    200: zincScale[800],
    300: zincScale[700],
    400: zincScale[600],
    500: zincScale[500],
    600: zincScale[400],
    700: zincScale[300],
    800: zincScale[200],
    900: zincScale[100],
    950: zincScale[50],
  },

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
  primary: ['#9333ea', '#7c3aed', '#6366f1'] as const,
  primaryLight: ['#a855f7', '#9333ea', '#7c3aed'] as const,
  booking: ['#9333EA', '#6366f1'] as const,
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
  concert: ['#9333ea', '#c084fc'] as const,
  party: ['#f59e0b', '#fbbf24'] as const,
  festival: ['#10b981', '#34d399'] as const,
};

// Shadow styles for light theme
export const lightShadows = {
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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

// Helper to get theme colors
export const getTheme = (theme: ThemeType): ThemeColors => {
  return theme === 'light' ? lightTheme : darkTheme;
};
