import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';

interface ScrollHeaderProps {
  title: string;
  scrollY: SharedValue<number>;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
  threshold?: number;
  largeTitle?: boolean;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function ScrollHeader({
  title,
  scrollY,
  showBackButton = false,
  rightAction,
  threshold = 50,
  largeTitle = true,
}: ScrollHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();

  const headerHeight = 44;
  const statusBarHeight = insets.top;
  const totalHeight = headerHeight + statusBarHeight;

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Animated styles for header background
  const headerBgStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, threshold],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  // Animated styles for compact title (appears on scroll)
  const compactTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [threshold - 20, threshold + 10],
      [0, 1],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [threshold - 20, threshold + 10],
      [10, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Animated styles for border
  const borderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [threshold, threshold + 20],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <View style={[styles.container, { height: totalHeight, paddingTop: statusBarHeight }]}>
      {/* Blur Background */}
      <AnimatedBlurView
        intensity={isDark ? 50 : 90}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.blurBackground,
          { height: totalHeight },
          headerBgStyle,
        ]}
      />

      {/* Solid Background Fallback */}
      <Animated.View
        style={[
          styles.solidBackground,
          {
            height: totalHeight,
            backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          },
          headerBgStyle,
        ]}
      />

      {/* Border */}
      <Animated.View
        style={[
          styles.border,
          {
            top: totalHeight - 0.5,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          },
          borderStyle,
        ]}
      />

      {/* Header Content */}
      <View style={[styles.content, { height: headerHeight }]}>
        {/* Left Action */}
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center Title */}
        <Animated.View style={[styles.titleContainer, compactTitleStyle]}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </Animated.View>

        {/* Right Action */}
        <View style={styles.rightContainer}>
          {rightAction}
        </View>
      </View>
    </View>
  );
}

// Large title component for the scrollable content
export function LargeTitle({ title, subtitle, scrollY }: { title: string; subtitle?: string; scrollY?: SharedValue<number> }) {
  const { colors } = useTheme();

  return (
    <View style={styles.largeTitleContainer}>
      <Text style={[styles.largeTitle, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  solidBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  border: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  leftContainer: {
    minWidth: 60,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  rightContainer: {
    minWidth: 60,
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  largeTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  largeTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
});
