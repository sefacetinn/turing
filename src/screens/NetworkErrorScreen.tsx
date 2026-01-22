import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { gradients } from '../theme/colors';
import { useNetworkStatus } from '../hooks';

interface NetworkErrorScreenProps {
  onRetry?: () => Promise<void> | void;
  onViewCached?: () => void;
  showCachedDataOption?: boolean;
  title?: string;
  message?: string;
}

export function NetworkErrorScreen({
  onRetry,
  onViewCached,
  showCachedDataOption = false,
  title,
  message,
}: NetworkErrorScreenProps) {
  const { colors, isDark } = useTheme();
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const isOnline = isConnected === true && isInternetReachable === true;
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (isRetrying) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRetrying(true);

    try {
      await onRetry?.();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleViewCached = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewCached?.();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] },
          ]}
        >
          <Ionicons
            name={isOnline ? 'cloud-offline' : 'wifi'}
            size={64}
            color={colors.warning}
          />
          {!isOnline && (
            <View style={[styles.offlineBadge, { backgroundColor: colors.error }]}>
              <Ionicons name="close" size={12} color="white" />
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          {title || (isOnline ? 'Baglanti Hatasi' : 'Internet Baglantisi Yok')}
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {message ||
            (isOnline
              ? 'Sunucuya baglanirken bir sorun olustu. Lutfen tekrar deneyin.'
              : 'Lutfen internet baglantinizi kontrol edin ve tekrar deneyin.')}
        </Text>

        {/* Connection Status */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? colors.success : colors.error },
                ]}
              />
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                {isOnline ? 'Cihaz cevrimici' : 'Cihaz cevrimdisi'}
              </Text>
            </View>
            <Ionicons
              name={isOnline ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={isOnline ? colors.success : colors.error}
            />
          </View>
        </View>

        {/* Tips */}
        {!isOnline && (
          <View
            style={[
              styles.tipsBox,
              {
                backgroundColor: isDark
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'rgba(59, 130, 246, 0.08)',
              },
            ]}
          >
            <Ionicons name="bulb" size={20} color={colors.info} />
            <View style={styles.tipsContent}>
              <Text style={[styles.tipsTitle, { color: colors.text }]}>
                Sorun giderme ipuclari:
              </Text>
              <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                {'\u2022'} Wi-Fi veya mobil veri baglantinizi kontrol edin
              </Text>
              <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                {'\u2022'} Ucak modunun kapali oldugunu dogrulayin
              </Text>
              <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                {'\u2022'} Router'inizi yeniden baslatmayi deneyin
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {/* Retry Button */}
        <TouchableOpacity
          onPress={handleRetry}
          activeOpacity={0.8}
          disabled={isRetrying}
        >
          <LinearGradient
            colors={isRetrying ? ['#6b7280', '#4b5563'] : gradients.primary}
            style={[styles.retryButton, isRetrying && { opacity: 0.7 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isRetrying ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* View Cached Data Button */}
        {showCachedDataOption && onViewCached && (
          <TouchableOpacity
            style={[
              styles.cachedButton,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={handleViewCached}
            activeOpacity={0.7}
          >
            <Ionicons name="folder-open" size={20} color={colors.textSecondary} />
            <Text style={[styles.cachedButtonText, { color: colors.textSecondary }]}>
              Kayitli Verileri Goster
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  offlineBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statusCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  tipsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cachedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  cachedButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default NetworkErrorScreen;
