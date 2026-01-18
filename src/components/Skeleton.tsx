import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const { isDark } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          opacity,
        },
        style,
      ]}
    />
  );
}

// Skeleton Card - for event/offer cards
export const SkeletonCard = memo(function SkeletonCard({ style }: { style?: ViewStyle }) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
        },
        style,
      ]}
    >
      {/* Image placeholder */}
      <Skeleton width="100%" height={140} borderRadius={12} />

      {/* Content */}
      <View style={styles.cardContent}>
        {/* Title */}
        <Skeleton width="70%" height={18} style={{ marginBottom: 8 }} />

        {/* Subtitle */}
        <Skeleton width="50%" height={14} style={{ marginBottom: 12 }} />

        {/* Details row */}
        <View style={styles.cardRow}>
          <Skeleton width={80} height={12} />
          <Skeleton width={60} height={12} />
        </View>

        {/* Progress bar */}
        <Skeleton width="100%" height={6} borderRadius={3} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
});

// Skeleton List Item - for messages, notifications
export const SkeletonListItem = memo(function SkeletonListItem({ style }: { style?: ViewStyle }) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.listItem,
        {
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
        },
        style,
      ]}
    >
      {/* Avatar */}
      <Skeleton width={48} height={48} borderRadius={24} />

      {/* Content */}
      <View style={styles.listItemContent}>
        <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
        <Skeleton width="80%" height={12} style={{ marginBottom: 4 }} />
        <Skeleton width="40%" height={10} />
      </View>
    </View>
  );
});

// Skeleton Stats Row - for dashboard stats
export const SkeletonStats = memo(function SkeletonStats({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.statsRow}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.statItem}>
          <Skeleton width={40} height={32} style={{ marginBottom: 6 }} />
          <Skeleton width={60} height={12} />
        </View>
      ))}
    </View>
  );
});

// Skeleton Event List - multiple cards
export const SkeletonEventList = memo(function SkeletonEventList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.eventList}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} style={{ marginBottom: 16 }} />
      ))}
    </View>
  );
});

// Skeleton Message List
export const SkeletonMessageList = memo(function SkeletonMessageList({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonListItem key={index} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 14,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  eventList: {
    paddingHorizontal: 20,
  },
});
