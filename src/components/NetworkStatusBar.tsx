import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

/**
 * NetworkStatusBar - Shows a banner when device is offline
 *
 * Place at the top of your app (after SafeAreaProvider) to show
 * connection status to users.
 */
export function NetworkStatusBar() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const translateY = useRef(new Animated.Value(-100)).current;

  const isOffline = isConnected === false || isInternetReachable === false;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isOffline ? 0 : -100,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [isOffline, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2',
          transform: [{ translateY }],
        },
      ]}
      pointerEvents={isOffline ? 'auto' : 'none'}
    >
      <View style={styles.content}>
        <Ionicons
          name="cloud-offline"
          size={18}
          color={isDark ? '#FECACA' : '#991B1B'}
        />
        <Text
          style={[
            styles.text,
            { color: isDark ? '#FECACA' : '#991B1B' },
          ]}
        >
          Internet baglantisi yok
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9998,
    paddingBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
