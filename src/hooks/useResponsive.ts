import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import {
  BREAKPOINTS,
  Breakpoint,
  getCurrentBreakpoint,
  isTablet,
  isSmallDevice,
  scale,
  verticalScale,
  moderateScale,
  fontSize,
  spacing,
  responsive,
  getContainerPadding,
  getGridColumns,
  getDeviceInfo,
} from '../utils/responsive';

interface UseResponsiveReturn {
  // Current values
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isTablet: boolean;
  isSmallDevice: boolean;

  // Scaling functions
  scale: (size: number) => number;
  verticalScale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  fontSize: (size: number) => number;
  spacing: (size: number) => number;

  // Responsive helpers
  responsive: <T>(values: Partial<Record<Breakpoint, T>> & { base: T }) => T;
  isBreakpoint: (breakpoint: Breakpoint) => boolean;

  // Layout helpers
  containerPadding: number;
  gridColumns: number;
}

/**
 * Hook for responsive design utilities
 * Automatically updates when screen dimensions change
 */
export function useResponsive(): UseResponsiveReturn {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const breakpoint = useMemo(() => getCurrentBreakpoint(), [dimensions.width]);

  const isBreakpointFn = useCallback(
    (bp: Breakpoint) => dimensions.width >= BREAKPOINTS[bp],
    [dimensions.width]
  );

  return {
    // Current values
    width: dimensions.width,
    height: dimensions.height,
    breakpoint,
    isTablet: isTablet(),
    isSmallDevice: isSmallDevice(),

    // Scaling functions
    scale,
    verticalScale,
    moderateScale,
    fontSize,
    spacing,

    // Responsive helpers
    responsive,
    isBreakpoint: isBreakpointFn,

    // Layout helpers
    containerPadding: getContainerPadding(),
    gridColumns: getGridColumns(),
  };
}

/**
 * Hook for device size detection only
 * Lighter weight than useResponsive
 */
export function useDeviceSize() {
  const [size, setSize] = useState<'small' | 'medium' | 'large' | 'tablet'>(() => {
    const info = getDeviceInfo();
    if (info.isTablet) return 'tablet';
    if (info.isSmall) return 'small';
    if (info.width >= BREAKPOINTS.lg) return 'large';
    return 'medium';
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      if (window.width >= BREAKPOINTS.xl) {
        setSize('tablet');
      } else if (window.width < BREAKPOINTS.md) {
        setSize('small');
      } else if (window.width >= BREAKPOINTS.lg) {
        setSize('large');
      } else {
        setSize('medium');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return size;
}

/**
 * Hook for getting responsive values based on current breakpoint
 */
export function useBreakpointValue<T>(
  values: Partial<Record<Breakpoint, T>> & { base: T }
): T {
  const { responsive: responsiveFn } = useResponsive();
  return responsiveFn(values);
}

/**
 * Hook for orientation detection
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    const { width, height } = Dimensions.get('window');
    return height > width ? 'portrait' : 'landscape';
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(window.height > window.width ? 'portrait' : 'landscape');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return orientation;
}

export default useResponsive;
