import React, { memo, useEffect } from 'react';
import { ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  SlideInDown,
  SlideInUp,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  ZoomOut,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Re-export entering/exiting animations for convenience
export {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  SlideInDown,
  SlideInUp,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  ZoomOut,
  Layout,
};

// Animated Fade In wrapper
interface AnimatedFadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const AnimatedFadeIn = memo(function AnimatedFadeIn({
  children,
  delay = 0,
  duration = 300,
  style,
}: AnimatedFadeInProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
});

// Animated Slide In wrapper
interface AnimatedSlideInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  distance?: number;
  style?: ViewStyle;
}

export const AnimatedSlideIn = memo(function AnimatedSlideIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 400,
  distance = 30,
  style,
}: AnimatedSlideInProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateValue = interpolate(progress.value, [0, 1], [distance, 0]);
    const opacity = interpolate(progress.value, [0, 1], [0, 1]);

    const transforms: any = { opacity };

    switch (direction) {
      case 'up':
        transforms.transform = [{ translateY: translateValue }];
        break;
      case 'down':
        transforms.transform = [{ translateY: -translateValue }];
        break;
      case 'left':
        transforms.transform = [{ translateX: translateValue }];
        break;
      case 'right':
        transforms.transform = [{ translateX: -translateValue }];
        break;
    }

    return transforms;
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
});

// Animated Scale wrapper
interface AnimatedScaleProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const AnimatedScale = memo(function AnimatedScale({
  children,
  delay = 0,
  duration = 300,
  style,
}: AnimatedScaleProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 100 }));
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
});

// Pressable with scale animation
interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  scaleValue?: number;
  haptic?: boolean;
  style?: ViewStyle;
}

export const AnimatedPressable = memo(function AnimatedPressable({
  children,
  onPress,
  onLongPress,
  disabled = false,
  scaleValue = 0.97,
  haptic = true,
  style,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(scaleValue, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[animatedStyle, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
});

// Animated List Item with stagger
interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  style?: ViewStyle;
}

export const AnimatedListItem = memo(function AnimatedListItem({
  children,
  index,
  style,
}: AnimatedListItemProps) {
  const progress = useSharedValue(0);
  const delay = Math.min(index * 50, 300); // Max 300ms delay

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [20, 0]);
    const opacity = interpolate(progress.value, [0, 1], [0, 1]);

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
});

// Pulse animation for notifications/badges
interface AnimatedPulseProps {
  children: React.ReactNode;
  active?: boolean;
  style?: ViewStyle;
}

export const AnimatedPulse = memo(function AnimatedPulse({
  children,
  active = true,
  style,
}: AnimatedPulseProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
});

// Shake animation for errors
interface AnimatedShakeProps {
  children: React.ReactNode;
  trigger?: boolean;
  style?: ViewStyle;
}

export const AnimatedShake = memo(function AnimatedShake({
  children,
  trigger = false,
  style,
}: AnimatedShakeProps) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      translateX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
});

// Counter animation for numbers
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: ViewStyle;
  textStyle?: any;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter = memo(function AnimatedCounter({
  value,
  duration = 1000,
  style,
  textStyle,
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration });
  }, [value, duration]);

  const animatedTextStyle = useAnimatedStyle(() => {
    return {};
  });

  // Note: For actual number animation, we'd need AnimatedText from reanimated
  // This is a simplified version that just shows the final value
  return (
    <Animated.View style={[style, animatedTextStyle]}>
      <Animated.Text style={textStyle}>
        {prefix}{Math.round(value).toLocaleString('tr-TR')}{suffix}
      </Animated.Text>
    </Animated.View>
  );
});

// Progress bar animation
interface AnimatedProgressBarProps {
  progress: number; // 0-100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: ViewStyle;
}

export const AnimatedProgressBar = memo(function AnimatedProgressBar({
  progress,
  height = 8,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  progressColor = '#8B5CF6',
  style,
}: AnimatedProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <Animated.View style={[{ height, backgroundColor, borderRadius: height / 2, overflow: 'hidden' }, style]}>
      <Animated.View
        style={[
          { height: '100%', backgroundColor: progressColor, borderRadius: height / 2 },
          animatedStyle,
        ]}
      />
    </Animated.View>
  );
});

// Floating action button with animation
interface AnimatedFABProps {
  children: React.ReactNode;
  visible?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const AnimatedFAB = memo(function AnimatedFAB({
  children,
  visible = true,
  onPress,
  style,
}: AnimatedFABProps) {
  const scale = useSharedValue(visible ? 1 : 0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(visible ? 1 : 0, { damping: 12, stiffness: 100 });
    rotate.value = withTiming(visible ? 0 : 45, { duration: 200 });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[animatedStyle, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
});
