import React, { memo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type LoadingSize = 'small' | 'medium' | 'large';

interface LoadingIndicatorProps {
  message?: string;
  fullScreen?: boolean;
  size?: LoadingSize;
}

export const LoadingIndicator = memo(function LoadingIndicator({
  message,
  fullScreen = false,
  size = 'large',
}: LoadingIndicatorProps) {
  const { colors, isDark } = useTheme();

  const indicatorSize = size === 'small' ? 'small' : 'large';

  if (fullScreen) {
    return (
      <View
        style={[styles.fullScreenContainer, { backgroundColor: colors.background }]}
        accessibilityRole="none"
        accessibilityLabel={message || 'Yükleniyor'}
        accessibilityState={{ busy: true }}
      >
        <View style={[
          styles.loadingBox,
          { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)' }
        ]}>
          <ActivityIndicator size={indicatorSize} color={colors.brand[500]} />
          {message && (
            <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, size === 'small' && styles.containerSmall]}
      accessibilityRole="none"
      accessibilityLabel={message || 'Yükleniyor'}
      accessibilityState={{ busy: true }}
    >
      <ActivityIndicator size={indicatorSize} color={colors.brand[500]} />
      {message && (
        <Text style={[
          styles.message,
          size === 'small' && styles.messageSmall,
          { color: colors.textMuted }
        ]}>
          {message}
        </Text>
      )}
    </View>
  );
});

// Loading Overlay - modal overlay for blocking interactions
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay = memo(function LoadingOverlay({
  visible,
  message = 'Lütfen bekleyin...',
}: LoadingOverlayProps) {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlayContainer}>
        <View style={[
          styles.overlayBox,
          { backgroundColor: isDark ? colors.cardBackground : '#ffffff' }
        ]}>
          <ActivityIndicator size="large" color={colors.brand[500]} />
          <Text style={[styles.overlayMessage, { color: colors.text }]}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
});

// Inline Loading - for buttons or small areas
interface InlineLoadingProps {
  color?: string;
}

export const InlineLoading = memo(function InlineLoading({ color }: InlineLoadingProps) {
  const { colors } = useTheme();

  return (
    <ActivityIndicator
      size="small"
      color={color || colors.brand[500]}
      accessibilityLabel="Yükleniyor"
    />
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  containerSmall: {
    paddingVertical: 20,
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
  },
  message: {
    fontSize: 14,
    marginTop: 12,
  },
  messageSmall: {
    fontSize: 12,
    marginTop: 8,
  },
  overlayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayBox: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  overlayMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
});
