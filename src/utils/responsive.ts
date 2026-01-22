import { Dimensions, PixelRatio, Platform, ScaledSize } from 'react-native';

// Base dimensions (design reference)
const BASE_WIDTH = 375; // iPhone 11 Pro width
const BASE_HEIGHT = 812; // iPhone 11 Pro height

// Get current window dimensions
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

// Scale factors
const widthScale = WINDOW_WIDTH / BASE_WIDTH;
const heightScale = WINDOW_HEIGHT / BASE_HEIGHT;

// Breakpoints
export const BREAKPOINTS = {
  xs: 0,     // Extra small phones
  sm: 360,   // Small phones
  md: 390,   // Medium phones (iPhone 12/13/14)
  lg: 428,   // Large phones (iPhone Pro Max)
  xl: 768,   // Tablets
  xxl: 1024, // Large tablets
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Scale a value based on screen width
 * Use for horizontal dimensions (width, padding, margin)
 */
export function scale(size: number): number {
  return Math.round(size * widthScale);
}

/**
 * Scale a value based on screen height
 * Use for vertical dimensions
 */
export function verticalScale(size: number): number {
  return Math.round(size * heightScale);
}

/**
 * Moderate scale - a mix of linear and scaled value
 * Use for font sizes and elements that shouldn't scale too much
 * @param size - The base size
 * @param factor - How much to scale (0 = no scale, 1 = full scale)
 */
export function moderateScale(size: number, factor: number = 0.5): number {
  return Math.round(size + (scale(size) - size) * factor);
}

/**
 * Moderate vertical scale
 */
export function moderateVerticalScale(size: number, factor: number = 0.5): number {
  return Math.round(size + (verticalScale(size) - size) * factor);
}

/**
 * Get font size that scales appropriately
 * Prevents fonts from getting too large on bigger devices
 */
export function fontSize(size: number): number {
  return moderateScale(size, 0.3);
}

/**
 * Get spacing value that scales appropriately
 */
export function spacing(size: number): number {
  return moderateScale(size, 0.5);
}

/**
 * Get current breakpoint
 */
export function getCurrentBreakpoint(): Breakpoint {
  const width = WINDOW_WIDTH;

  if (width >= BREAKPOINTS.xxl) return 'xxl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Check if current screen is at least the given breakpoint
 */
export function isBreakpoint(breakpoint: Breakpoint): boolean {
  return WINDOW_WIDTH >= BREAKPOINTS[breakpoint];
}

/**
 * Check if device is a tablet
 */
export function isTablet(): boolean {
  return WINDOW_WIDTH >= BREAKPOINTS.xl;
}

/**
 * Check if device is a small phone
 */
export function isSmallDevice(): boolean {
  return WINDOW_WIDTH < BREAKPOINTS.md;
}

/**
 * Get responsive value based on breakpoints
 */
export function responsive<T>(values: Partial<Record<Breakpoint, T>> & { base: T }): T {
  const breakpoint = getCurrentBreakpoint();
  const breakpointOrder: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];

  // Find the first defined value for current or smaller breakpoint
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp] as T;
    }
  }

  return values.base;
}

/**
 * Get device dimensions info
 */
export function getDeviceInfo(): {
  width: number;
  height: number;
  isTablet: boolean;
  isSmall: boolean;
  breakpoint: Breakpoint;
  pixelRatio: number;
  fontScale: number;
  platform: typeof Platform.OS;
} {
  return {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    isTablet: isTablet(),
    isSmall: isSmallDevice(),
    breakpoint: getCurrentBreakpoint(),
    pixelRatio: PixelRatio.get(),
    fontScale: PixelRatio.getFontScale(),
    platform: Platform.OS,
  };
}

/**
 * Normalize size for different pixel densities
 */
export function normalize(size: number): number {
  const pixelRatio = PixelRatio.get();

  if (pixelRatio >= 3) {
    return size;
  }

  if (pixelRatio >= 2) {
    return Math.round(size * 0.9);
  }

  return Math.round(size * 0.8);
}

/**
 * Get safe area insets approximation
 * For actual values, use react-native-safe-area-context
 */
export function getApproximateSafeAreaInsets(): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  const hasNotch = WINDOW_HEIGHT >= 812;

  if (Platform.OS === 'ios') {
    return {
      top: hasNotch ? 44 : 20,
      bottom: hasNotch ? 34 : 0,
      left: 0,
      right: 0,
    };
  }

  // Android
  return {
    top: 24,
    bottom: 0,
    left: 0,
    right: 0,
  };
}

/**
 * Calculate container padding based on screen size
 */
export function getContainerPadding(): number {
  return responsive({
    base: 16,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  });
}

/**
 * Calculate number of columns for grid layouts
 */
export function getGridColumns(): number {
  return responsive({
    base: 1,
    sm: 1,
    md: 2,
    lg: 2,
    xl: 3,
    xxl: 4,
  });
}

// Subscribe to dimension changes
type DimensionChangeHandler = (dimensions: ScaledSize) => void;
const dimensionChangeHandlers: DimensionChangeHandler[] = [];

Dimensions.addEventListener('change', ({ window }) => {
  dimensionChangeHandlers.forEach((handler) => handler(window));
});

/**
 * Subscribe to dimension changes
 */
export function onDimensionChange(handler: DimensionChangeHandler): () => void {
  dimensionChangeHandlers.push(handler);
  return () => {
    const index = dimensionChangeHandlers.indexOf(handler);
    if (index > -1) {
      dimensionChangeHandlers.splice(index, 1);
    }
  };
}
