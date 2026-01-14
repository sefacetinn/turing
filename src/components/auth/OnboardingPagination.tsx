import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

interface OnboardingPaginationProps {
  count: number;
  activeIndex: number;
}

export function OnboardingPagination({ count, activeIndex }: OnboardingPaginationProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <PaginationDot key={index} isActive={index === activeIndex} />
      ))}
    </View>
  );
}

interface PaginationDotProps {
  isActive: boolean;
}

function PaginationDot({ isActive }: PaginationDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(isActive ? 24 : 8, { damping: 15, stiffness: 200 }),
      opacity: withSpring(isActive ? 1 : 0.5, { damping: 15, stiffness: 200 }),
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
});
