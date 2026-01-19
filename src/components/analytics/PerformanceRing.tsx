import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface PerformanceRingProps {
  value: number;
  label: string;
  color?: string;
  size?: number;
}

export function PerformanceRing({ value, label, color, size = 70 }: PerformanceRingProps) {
  const { colors, isDark } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  const ringColor = color || colors.brand[400];
  const strokeWidth = 6;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [value]);

  // Background ring color
  const bgRingColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  // Simple percentage-based progress indicator
  const progressAngle = (value / 100) * 360;
  const innerSize = size - strokeWidth * 2;

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        {/* Background ring */}
        <View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: bgRingColor,
            },
          ]}
        />

        {/* Progress indicator - simplified visual representation */}
        <View
          style={[
            styles.progressRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: 'transparent',
              borderTopColor: ringColor,
              borderRightColor: progressAngle > 90 ? ringColor : 'transparent',
              borderBottomColor: progressAngle > 180 ? ringColor : 'transparent',
              borderLeftColor: progressAngle > 270 ? ringColor : 'transparent',
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />

        {/* Inner circle to cover the border */}
        <View
          style={[
            styles.innerCircle,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: isDark ? colors.background : colors.cardBackground,
            },
          ]}
        />

        {/* Value in center */}
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: colors.text }]}>{value}%</Text>
        </View>
      </View>

      <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  progressRing: {
    position: 'absolute',
  },
  innerCircle: {
    position: 'absolute',
  },
  valueContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 70,
  },
});
