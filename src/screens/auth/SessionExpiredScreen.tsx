import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { gradients } from '../../theme/colors';

interface SessionExpiredScreenProps {
  onReLogin: () => void;
  onContinueAsGuest?: () => void;
  reason?: 'expired' | 'invalid' | 'revoked';
}

export function SessionExpiredScreen({
  onReLogin,
  onContinueAsGuest,
  reason = 'expired',
}: SessionExpiredScreenProps) {
  const { colors, isDark } = useTheme();

  const getContent = () => {
    switch (reason) {
      case 'invalid':
        return {
          icon: 'alert-circle',
          iconColor: colors.error,
          title: 'Oturum Gecersiz',
          description:
            'Oturumunuz gecersiz hale geldi. Guvenliginiz icin lutfen tekrar giris yapin.',
        };
      case 'revoked':
        return {
          icon: 'shield-checkmark',
          iconColor: colors.warning,
          title: 'Oturum Sonlandirildi',
          description:
            'Oturumunuz guvenlik nedeniyle sonlandirildi. Bu farkli bir cihazdan giris yapilmis olmasi sebebiyle olabilir.',
        };
      case 'expired':
      default:
        return {
          icon: 'time',
          iconColor: colors.warning,
          title: 'Oturum Suresi Doldu',
          description:
            'Uzun suredir islem yapilmadigi icin oturumunuz sona erdi. Devam etmek icin tekrar giris yapin.',
        };
    }
  };

  const content = getContent();

  const handleReLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReLogin();
  };

  const handleContinueAsGuest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onContinueAsGuest?.();
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
          <Ionicons name={content.icon as any} size={64} color={content.iconColor} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{content.title}</Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {content.description}
        </Text>

        {/* Security Info */}
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
          <Ionicons name="shield-checkmark" size={20} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Hesabiniz guvendedir. Bu, guvenlik onlemi olarak otomatik cikis yapilmasinin
            bir sonucudur.
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {/* Re-Login Button */}
        <TouchableOpacity onPress={handleReLogin} activeOpacity={0.8}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.reLoginButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="log-in" size={20} color="white" />
            <Text style={styles.reLoginButtonText}>Tekrar Giris Yap</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Continue as Guest Button (optional) */}
        {onContinueAsGuest && (
          <TouchableOpacity
            style={[
              styles.guestButton,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={handleContinueAsGuest}
            activeOpacity={0.7}
          >
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.guestButtonText, { color: colors.textSecondary }]}>
              Misafir Olarak Devam Et
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
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  reLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  reLoginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  guestButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
