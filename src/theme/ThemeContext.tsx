import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useColorScheme, ViewStyle } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, ThemeColors, ThemeType, shadows } from './colors';

const THEME_STORAGE_KEY = '@app_theme';

type ShadowSize = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface ThemeHelpers {
  // Get glass effect color (white opacity on dark, black opacity on light)
  getGlass: (opacity: number) => string;
  // Get glass border color
  getGlassBorder: (opacity: number) => string;
  // Get shadow style for current theme
  getShadow: (size: ShadowSize) => ViewStyle;
  // Get card style with appropriate background and shadow
  getCardStyle: (elevated?: boolean) => ViewStyle;
}

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  helpers: ThemeHelpers;
}

// Default helpers (dark theme)
const defaultHelpers: ThemeHelpers = {
  getGlass: (opacity: number) => `rgba(255, 255, 255, ${opacity})`,
  getGlassBorder: (opacity: number) => `rgba(255, 255, 255, ${opacity})`,
  getShadow: () => ({}),
  getCardStyle: () => ({}),
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  colors: darkTheme,
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
  helpers: defaultHelpers,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeState(savedTheme);
        } else {
          // Use system preference if no saved theme
          setThemeState(systemColorScheme === 'light' ? 'light' : 'dark');
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  // Save theme when it changes
  const setTheme = useCallback(async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const colors = theme === 'light' ? lightTheme : darkTheme;
  const isDark = theme === 'dark';

  // Create theme helpers
  const helpers = useMemo<ThemeHelpers>(() => ({
    // Glass effect - white opacity on dark, black opacity on light
    getGlass: (opacity: number) => {
      return isDark
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(0, 0, 0, ${opacity})`;
    },

    // Glass border color
    getGlassBorder: (opacity: number) => {
      return isDark
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(0, 0, 0, ${opacity})`;
    },

    // Get shadow style (active only in light mode)
    getShadow: (size: ShadowSize): ViewStyle => {
      if (isDark || size === 'none') return {};
      return shadows[size] as ViewStyle;
    },

    // Get card style with appropriate background and shadow
    getCardStyle: (elevated = false): ViewStyle => {
      if (isDark) {
        return {
          backgroundColor: colors.cardBackground,
          borderWidth: 1,
          borderColor: colors.border,
        };
      }

      // Light mode - use shadow for depth
      return elevated
        ? {
            backgroundColor: colors.cardBackgroundSolid,
            ...(shadows.md as ViewStyle),
          }
        : {
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.border,
          };
    },
  }), [isDark, colors]);

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme, setTheme, helpers }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
