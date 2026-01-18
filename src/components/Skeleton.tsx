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

// Skeleton Profile Header - for profile screens
export const SkeletonProfile = memo(function SkeletonProfile() {
  const { isDark } = useTheme();

  return (
    <View style={[
      styles.profile,
      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)' }
    ]}>
      <Skeleton width={100} height={100} borderRadius={50} style={{ marginBottom: 16 }} />
      <Skeleton width={150} height={20} style={{ marginBottom: 8 }} />
      <Skeleton width={100} height={14} style={{ marginBottom: 16 }} />
      <View style={styles.profileStats}>
        <View style={styles.profileStatItem}>
          <Skeleton width={40} height={24} style={{ marginBottom: 4 }} />
          <Skeleton width={50} height={12} />
        </View>
        <View style={styles.profileStatItem}>
          <Skeleton width={40} height={24} style={{ marginBottom: 4 }} />
          <Skeleton width={50} height={12} />
        </View>
        <View style={styles.profileStatItem}>
          <Skeleton width={40} height={24} style={{ marginBottom: 4 }} />
          <Skeleton width={50} height={12} />
        </View>
      </View>
    </View>
  );
});

// Skeleton Offer - for offer list items
export const SkeletonOffer = memo(function SkeletonOffer({ style }: { style?: ViewStyle }) {
  const { isDark } = useTheme();

  return (
    <View style={[
      styles.offer,
      {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
      },
      style,
    ]}>
      <View style={styles.offerHeader}>
        <Skeleton width={48} height={48} borderRadius={12} />
        <View style={styles.offerHeaderContent}>
          <Skeleton width={120} height={16} style={{ marginBottom: 6 }} />
          <Skeleton width={80} height={12} />
        </View>
        <Skeleton width={70} height={24} borderRadius={12} />
      </View>
      <View style={styles.offerBody}>
        <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height={14} />
      </View>
      <View style={styles.offerFooter}>
        <Skeleton width={80} height={20} />
        <Skeleton width={100} height={36} borderRadius={8} />
      </View>
    </View>
  );
});

// Skeleton Notification
export const SkeletonNotification = memo(function SkeletonNotification({ style }: { style?: ViewStyle }) {
  const { isDark } = useTheme();

  return (
    <View style={[
      styles.notification,
      { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' },
      style,
    ]}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.notificationContent}>
        <Skeleton width="80%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="60%" height={12} style={{ marginBottom: 6 }} />
        <Skeleton width={50} height={10} />
      </View>
    </View>
  );
});

// Skeleton Event Detail
export const SkeletonEventDetail = memo(function SkeletonEventDetail() {
  const { isDark } = useTheme();

  return (
    <View style={styles.eventDetail}>
      <Skeleton width="100%" height={250} borderRadius={0} />
      <View style={[
        styles.eventDetailContent,
        { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff' }
      ]}>
        <Skeleton width="80%" height={24} style={{ marginBottom: 12 }} />
        <Skeleton width="60%" height={16} style={{ marginBottom: 20 }} />
        <View style={styles.eventDetailRow}>
          <Skeleton width={24} height={24} borderRadius={12} />
          <Skeleton width="70%" height={14} />
        </View>
        <View style={styles.eventDetailRow}>
          <Skeleton width={24} height={24} borderRadius={12} />
          <Skeleton width="50%" height={14} />
        </View>
        <View style={styles.eventDetailRow}>
          <Skeleton width={24} height={24} borderRadius={12} />
          <Skeleton width="60%" height={14} />
        </View>
      </View>
    </View>
  );
});

// Skeleton Offer List
export const SkeletonOfferList = memo(function SkeletonOfferList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.offerList}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonOffer key={index} style={{ marginBottom: 12 }} />
      ))}
    </View>
  );
});

// Skeleton Notification List
export const SkeletonNotificationList = memo(function SkeletonNotificationList({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonNotification key={index} />
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
  profile: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 32,
  },
  profileStatItem: {
    alignItems: 'center',
  },
  offer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerHeaderContent: {
    flex: 1,
    marginLeft: 12,
  },
  offerBody: {
    marginBottom: 12,
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerList: {
    paddingHorizontal: 20,
  },
  notification: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  eventDetail: {
    flex: 1,
  },
  eventDetailContent: {
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
});
