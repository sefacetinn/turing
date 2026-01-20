import React, { useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../theme/ThemeContext';
import { scrollToTopEmitter } from '../../utils/scrollToTop';
import { MainTabParamList } from '../../types/navigation';

type TabBarProps = BottomTabBarProps;

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  HomeTab: { active: 'compass', inactive: 'compass-outline' },
  EventsTab: { active: 'calendar', inactive: 'calendar-outline' },
  OffersTab: { active: 'pricetags', inactive: 'pricetags-outline' },
  MessagesTab: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  ProfileTab: { active: 'person-circle', inactive: 'person-circle-outline' },
};

// TODO: Get badge counts from Firebase/context
const TAB_BADGES: Record<string, number> = {
  // Empty - no mock badges
};

interface TabRoute {
  key: string;
  name: keyof MainTabParamList;
  params?: object;
}

interface TabItemProps {
  route: TabRoute;
  index: number;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
}

function TabItem({ route, index, isFocused, onPress, onLongPress, label }: TabItemProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const accentColor = colors.brand[400];
  const badge = TAB_BADGES[route.name];

  useEffect(() => {
    if (isFocused) {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      translateY.value = withSpring(-2, { damping: 15, stiffness: 200 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
    }
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const iconName = isFocused
    ? TAB_ICONS[route.name]?.active
    : TAB_ICONS[route.name]?.inactive;

  const accessibilityLabel = badge && badge > 0
    ? `${label}, ${badge} yeni bildirim`
    : label;

  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={`${label} sekmesine git`}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.tabItemContent, animatedStyle]}>
        <View style={[
          styles.iconContainer,
          isFocused && { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }
        ]}>
          <Ionicons
            name={iconName as any}
            size={22}
            color={isFocused ? accentColor : colors.textMuted}
          />
          {badge && badge > 0 && (
            <View style={[styles.badge, { backgroundColor: accentColor }]}>
              <Animated.Text style={styles.badgeText}>{badge}</Animated.Text>
            </View>
          )}
        </View>
        <Animated.Text
          style={[
            styles.label,
            {
              color: isFocused ? accentColor : colors.textMuted,
              fontWeight: isFocused ? '600' : '500',
            },
          ]}
        >
          {label}
        </Animated.Text>
        {isFocused && (
          <View style={[styles.indicator, { backgroundColor: accentColor }]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const bottomPadding = Math.max(insets.bottom, 8);

  // Track last tap time for each tab to detect double-tap
  const lastTapTime = useRef<Record<string, number>>({});
  const DOUBLE_TAP_DELAY = 300; // ms

  return (
    <View style={styles.container}>
      <BlurView
        intensity={isDark ? 40 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        <View style={[
          styles.tabBar,
          {
            backgroundColor: isDark ? 'rgba(24, 24, 27, 0.85)' : 'rgba(255, 255, 255, 0.9)',
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            paddingBottom: bottomPadding,
          }
        ]}>
          {state.routes.map((route, index: number) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? options.title ?? route.name;
            const isFocused = state.index === index;

            const onPress = () => {
              const now = Date.now();
              const lastTap = lastTapTime.current[route.name] || 0;

              // Check for double-tap on already focused tab
              if (isFocused && now - lastTap < DOUBLE_TAP_DELAY) {
                // Double-tap detected - emit scroll to top event
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                scrollToTopEmitter.emit(route.name);
                lastTapTime.current[route.name] = 0; // Reset to prevent triple-tap
                return;
              }

              lastTapTime.current[route.name] = now;

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            const displayLabel = typeof label === 'string' ? label.replace('Tab', '') : route.name.replace('Tab', '');

            return (
              <TabItem
                key={route.key}
                route={route as TabRoute}
                index={index}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                label={displayLabel}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
});
