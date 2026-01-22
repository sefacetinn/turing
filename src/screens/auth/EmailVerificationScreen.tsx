import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { gradients } from '../../theme/colors';
import {
  isRateLimited,
  recordFailedAttempt,
  formatRemainingTime,
  RATE_LIMIT_ACTIONS,
} from '../../utils/rateLimiter';
import { sendEmailVerification, reload } from 'firebase/auth';
import { auth } from '../../services/firebase/config';

interface EmailVerificationScreenProps {
  email: string;
  onVerified: () => void;
  onLogout: () => void;
}

// Rate limit config for email verification resend
const EMAIL_RESEND_RATE_LIMIT = {
  maxAttempts: 3,
  lockoutDuration: 5 * 60 * 1000, // 5 minutes
  windowDuration: 5 * 60 * 1000,  // 5 minutes
};

export function EmailVerificationScreen({
  email,
  onVerified,
  onLogout,
}: EmailVerificationScreenProps) {
  const { colors, isDark } = useTheme();
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockRemainingTime, setLockRemainingTime] = useState(0);

  // Check rate limit on mount
  useEffect(() => {
    checkRateLimit();
  }, []);

  // Cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1000) return 0;
          return prev - 1000;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  // Lock timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isLocked && lockRemainingTime > 0) {
      interval = setInterval(() => {
        setLockRemainingTime((prev) => {
          const newTime = prev - 1000;
          if (newTime <= 0) {
            setIsLocked(false);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLocked, lockRemainingTime]);

  const checkRateLimit = async () => {
    const result = await isRateLimited(
      RATE_LIMIT_ACTIONS.EMAIL_VERIFICATION,
      EMAIL_RESEND_RATE_LIMIT
    );
    if (result.limited) {
      setIsLocked(true);
      setLockRemainingTime(result.remainingTime);
    }
  };

  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0 || isLocked) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Check rate limit
    const rateLimitResult = await isRateLimited(
      RATE_LIMIT_ACTIONS.EMAIL_VERIFICATION,
      EMAIL_RESEND_RATE_LIMIT
    );

    if (rateLimitResult.limited) {
      setIsLocked(true);
      setLockRemainingTime(rateLimitResult.remainingTime);
      Alert.alert(
        'Cok Fazla Istek',
        `Lutfen ${formatRemainingTime(rateLimitResult.remainingTime)} sonra tekrar deneyin.`
      );
      return;
    }

    setIsResending(true);

    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);

        // Record attempt
        const result = await recordFailedAttempt(
          RATE_LIMIT_ACTIONS.EMAIL_VERIFICATION,
          EMAIL_RESEND_RATE_LIMIT
        );

        if (result.locked) {
          setIsLocked(true);
          setLockRemainingTime(result.lockoutEndsAt ? result.lockoutEndsAt - Date.now() : 0);
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Email Gonderildi',
          'Dogrulama emaili tekrar gonderildi. Lutfen gelen kutunuzu kontrol edin.'
        );

        // Set 60 second cooldown for UI feedback
        setResendCooldown(60000);
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Email gonderilemedi. Lutfen daha sonra tekrar deneyin.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (isChecking) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsChecking(true);

    try {
      const user = auth.currentUser;
      if (user) {
        await reload(user);

        if (user.emailVerified) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onVerified();
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert(
            'Dogrulanmadi',
            'Email adresiniz henuz dogrulanmamis. Lutfen gelen kutunuzu kontrol edin ve dogrulama linkine tiklayin.'
          );
        }
      }
    } catch (error) {
      Alert.alert('Hata', 'Dogrulama durumu kontrol edilemedi.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Cikis Yap',
      'Hesabinizdan cikis yapmak istediginize emin misiniz?',
      [
        { text: 'Iptal', style: 'cancel' },
        { text: 'Cikis Yap', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const getResendButtonText = () => {
    if (isResending) return 'Gonderiliyor...';
    if (isLocked) return `Kilitli (${formatRemainingTime(lockRemainingTime)})`;
    if (resendCooldown > 0) return `Tekrar Gonder (${Math.ceil(resendCooldown / 1000)}s)`;
    return 'Email Tekrar Gonder';
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
          <Ionicons name="mail-unread" size={64} color={colors.brand[500]} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          Email Adresinizi Dogrulayin
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          <Text style={[styles.emailHighlight, { color: colors.brand[400] }]}>{email}</Text>
          {' '}adresine bir dogrulama emaili gonderdik. Lutfen gelen kutunuzu kontrol edin ve
          dogrulama linkine tiklayin.
        </Text>

        {/* Steps Card */}
        <View
          style={[
            styles.stepsCard,
            {
              backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: colors.brand[500] }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              Email gelen kutunuzu acin
            </Text>
          </View>

          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: colors.brand[500] }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              "Turing - Email Dogrulama" baslıklı emaili bulun
            </Text>
          </View>

          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: colors.brand[500] }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              "Email Adresimi Dogrula" butonuna tiklayin
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.08)' },
          ]}
        >
          <Ionicons name="information-circle" size={20} color={colors.warning} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Email gelmedi mi? Spam/Junk klasorunu de kontrol edin.
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {/* Check Verification Button */}
        <TouchableOpacity onPress={handleCheckVerification} activeOpacity={0.8} disabled={isChecking}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.checkButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isChecking ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.checkButtonText}>Dogrulama Durumunu Kontrol Et</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Resend Button */}
        <TouchableOpacity
          style={[
            styles.resendButton,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              opacity: isResending || resendCooldown > 0 || isLocked ? 0.6 : 1,
            },
          ]}
          onPress={handleResendEmail}
          disabled={isResending || resendCooldown > 0 || isLocked}
          activeOpacity={0.7}
        >
          {isResending ? (
            <ActivityIndicator color={colors.brand[500]} size="small" />
          ) : (
            <Ionicons
              name={isLocked ? 'lock-closed' : 'mail'}
              size={20}
              color={colors.brand[500]}
            />
          )}
          <Text style={[styles.resendButtonText, { color: colors.brand[500] }]}>
            {getResendButtonText()}
          </Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)' },
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutButtonText, { color: colors.error }]}>
            Cikis Yap
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 8,
  },
  emailHighlight: {
    fontWeight: '600',
  },
  stepsCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
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
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  checkButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  resendButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
