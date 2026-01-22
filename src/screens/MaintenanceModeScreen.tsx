import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface MaintenanceModeScreenProps {
  title?: string;
  message?: string;
  estimatedEndTime?: Date | string;
  onCheckStatus?: () => Promise<boolean>;
  showSocialLinks?: boolean;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export function MaintenanceModeScreen({
  title = 'Bakim Calismasi',
  message = 'Uygulamayi sizin icin daha iyi hale getirmek icin calısıyoruz. Kisa sure icerisinde tekrar aktif olacagiz.',
  estimatedEndTime,
  onCheckStatus,
  showSocialLinks = true,
  socialLinks = {
    twitter: 'https://twitter.com/turingapp',
    instagram: 'https://instagram.com/turingapp',
    website: 'https://turing.app',
  },
}: MaintenanceModeScreenProps) {
  const { colors, isDark } = useTheme();
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);

  // Calculate countdown
  useEffect(() => {
    if (!estimatedEndTime) return;

    const endDate = typeof estimatedEndTime === 'string'
      ? new Date(estimatedEndTime)
      : estimatedEndTime;

    const updateCountdown = () => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setCountdown(`~${hours} saat ${minutes} dakika`);
      } else {
        setCountdown(`~${minutes} dakika`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [estimatedEndTime]);

  const handleCheckStatus = async () => {
    if (isChecking || !onCheckStatus) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsChecking(true);

    try {
      const isAvailable = await onCheckStatus();
      if (!isAvailable) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleOpenLink = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Illustration */}
        <View
          style={[
            styles.illustrationContainer,
            { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] },
          ]}
        >
          <Ionicons name="construct" size={64} color={colors.brand[500]} />
          <View style={[styles.gearIcon, { left: 20, top: 20 }]}>
            <Ionicons name="settings" size={24} color={colors.brand[400]} />
          </View>
          <View style={[styles.gearIcon, { right: 20, bottom: 20 }]}>
            <Ionicons name="cog" size={28} color={colors.brand[400]} />
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

        {/* Message */}
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>

        {/* Estimated Time */}
        {countdown && (
          <View
            style={[
              styles.timeCard,
              {
                backgroundColor: isDark
                  ? 'rgba(124, 58, 237, 0.1)'
                  : 'rgba(124, 58, 237, 0.08)',
              },
            ]}
          >
            <Ionicons name="time" size={20} color={colors.brand[500]} />
            <View style={styles.timeContent}>
              <Text style={[styles.timeLabel, { color: colors.textMuted }]}>
                Tahmini kalan sure
              </Text>
              <Text style={[styles.timeValue, { color: colors.brand[500] }]}>
                {countdown}
              </Text>
            </View>
          </View>
        )}

        {/* Info Box */}
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: isDark
                ? 'rgba(59, 130, 246, 0.1)'
                : 'rgba(59, 130, 246, 0.08)',
            },
          ]}
        >
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Verileriniz guvendedir. Bakim bittikten sonra kaldıgınız yerden devam edebilirsiniz.
          </Text>
        </View>

        {/* Social Links */}
        {showSocialLinks && (
          <View style={styles.socialContainer}>
            <Text style={[styles.socialTitle, { color: colors.textMuted }]}>
              Guncellemeler icin bizi takip edin
            </Text>
            <View style={styles.socialRow}>
              {socialLinks.twitter && (
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: colors.cardBackground }]}
                  onPress={() => handleOpenLink(socialLinks.twitter!)}
                >
                  <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                </TouchableOpacity>
              )}
              {socialLinks.instagram && (
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: colors.cardBackground }]}
                  onPress={() => handleOpenLink(socialLinks.instagram!)}
                >
                  <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                </TouchableOpacity>
              )}
              {socialLinks.website && (
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: colors.cardBackground }]}
                  onPress={() => handleOpenLink(socialLinks.website!)}
                >
                  <Ionicons name="globe" size={24} color={colors.brand[500]} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Actions */}
      {onCheckStatus && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.checkButton,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={handleCheckStatus}
            disabled={isChecking}
            activeOpacity={0.7}
          >
            {isChecking ? (
              <ActivityIndicator color={colors.brand[500]} size="small" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color={colors.brand[500]} />
                <Text style={[styles.checkButtonText, { color: colors.brand[500] }]}>
                  Durumu Kontrol Et
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  illustrationContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  gearIcon: {
    position: 'absolute',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  timeContent: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  socialContainer: {
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  checkButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default MaintenanceModeScreen;
