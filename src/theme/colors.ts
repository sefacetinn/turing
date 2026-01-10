export const colors = {
  // Brand Colors - Premium Purple Palette
  brand: {
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
  },

  // Legacy
  primary: '#9333ea',
  primaryDark: '#7c3aed',
  secondary: '#f97316',
  secondaryDark: '#ea580c',

  // Category Colors
  category: {
    booking: { from: '#9333EA', to: '#6366f1' },
    technical: { from: '#059669', to: '#34d399' },
    accommodation: { from: '#db2777', to: '#f472b6' },
    venue: { from: '#2563eb', to: '#60a5fa' },
    flight: { from: '#475569', to: '#94a3b8' },
    transport: { from: '#dc2626', to: '#f87171' },
    operation: { from: '#d97706', to: '#fbbf24' },
  },

  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Surface
  background: '#09090b',
  surface: '#18181b',
  surfaceElevated: '#27272a',
  border: 'rgba(255, 255, 255, 0.08)',

  // Text
  text: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',

  // Zinc scale
  zinc: {
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
  },

  // Transparent
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export const gradients = {
  primary: ['#9333ea', '#7c3aed', '#6366f1'] as const,
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
