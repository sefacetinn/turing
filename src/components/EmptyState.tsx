import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

// Preset configurations for common empty states
export const EMPTY_STATE_PRESETS = {
  noEvents: {
    icon: 'calendar-outline' as const,
    title: 'Henüz etkinlik yok',
    message: 'Oluşturduğunuz etkinlikler burada görünecek',
  },
  noOffers: {
    icon: 'pricetags-outline' as const,
    title: 'Henüz teklif yok',
    message: 'Aldığınız teklifler burada görünecek',
  },
  noMessages: {
    icon: 'chatbubbles-outline' as const,
    title: 'Henüz mesaj yok',
    message: 'Mesajlarınız burada görünecek',
  },
  noNotifications: {
    icon: 'notifications-outline' as const,
    title: 'Bildirim yok',
    message: 'Yeni bildirimleriniz burada görünecek',
  },
  noFavorites: {
    icon: 'heart-outline' as const,
    title: 'Henüz favori yok',
    message: 'Beğendiğiniz sanatçı ve sağlayıcıları favorilerinize ekleyin',
  },
  noResults: {
    icon: 'search-outline' as const,
    title: 'Sonuç bulunamadı',
    message: 'Arama kriterlerinize uygun sonuç bulunamadı',
  },
  noReviews: {
    icon: 'star-outline' as const,
    title: 'Henüz değerlendirme yok',
    message: 'Değerlendirmeler burada görünecek',
  },
  networkError: {
    icon: 'cloud-offline-outline' as const,
    title: 'Bağlantı hatası',
    message: 'İnternet bağlantınızı kontrol edip tekrar deneyin',
  },
  welcomeOrganizer: {
    icon: 'sparkles-outline' as const,
    title: 'Hoş geldiniz!',
    message: 'İlk etkinliğinizi oluşturarak başlayın. Sanatçılar, mekanlar ve hizmet sağlayıcılarla kolayca çalışın.',
  },
  welcomeProvider: {
    icon: 'briefcase-outline' as const,
    title: 'Hoş geldiniz!',
    message: 'Profilinizi tamamlayın ve organizatörlerden iş teklifleri almaya başlayın.',
  },
  noJobs: {
    icon: 'briefcase-outline' as const,
    title: 'Henüz iş yok',
    message: 'Kabul ettiğiniz işler burada görünecek. Tekliflerinizi kontrol edin!',
  },
  noProviders: {
    icon: 'people-outline' as const,
    title: 'Sağlayıcı bulunamadı',
    message: 'Bu kategoride henüz sağlayıcı bulunmuyor.',
  },
};

export type EmptyStatePreset = keyof typeof EMPTY_STATE_PRESETS;

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  preset?: EmptyStatePreset;
}

export const EmptyState = memo(function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
  preset,
}: EmptyStateProps) {
  const { colors, isDark } = useTheme();

  // Use preset values if provided, with prop overrides
  const presetConfig = preset ? EMPTY_STATE_PRESETS[preset] : null;
  const finalIcon = icon || presetConfig?.icon || 'help-circle-outline';
  const finalTitle = title || presetConfig?.title || '';
  const finalMessage = message || presetConfig?.message || '';

  return (
    <View
      style={[styles.container, compact && styles.containerCompact]}
      accessibilityRole="none"
      accessibilityLabel={`${finalTitle}. ${finalMessage}`}
    >
      <View style={[
        styles.iconContainer,
        compact && styles.iconContainerCompact,
        { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)' }
      ]}>
        <Ionicons name={finalIcon} size={compact ? 32 : 48} color={colors.textMuted} />
      </View>
      <Text style={[styles.title, compact && styles.titleCompact, { color: colors.text }]}>
        {finalTitle}
      </Text>
      <Text style={[styles.message, compact && styles.messageCompact, { color: colors.textMuted }]}>
        {finalMessage}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <LinearGradient
            colors={gradients.primary}
            style={[styles.actionButtonGradient, compact && styles.actionButtonGradientCompact]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  containerCompact: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconContainerCompact: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  messageCompact: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  actionButtonGradientCompact: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
