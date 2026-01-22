import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
} from 'react-native-reanimated';

import { useTheme } from '../../theme/ThemeContext';
import { gradients } from '../../theme/colors';

interface TwoFactorSuccessScreenProps {
  navigation: any;
}

export function TwoFactorSuccessScreen({ navigation }: TwoFactorSuccessScreenProps) {
  const { colors, isDark } = useTheme();

  const scale = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animate icon
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });

    // Animate checkmark
    checkScale.value = withDelay(
      300,
      withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 })
      )
    );

    // Animate content
    contentOpacity.value = withDelay(500, withSpring(1));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: (1 - contentOpacity.value) * 20 }],
  }));

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate back to settings or main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View style={iconStyle}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)' },
            ]}
          >
            <Animated.View style={checkStyle}>
              <Ionicons name="shield-checkmark" size={72} color={colors.success} />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View style={[styles.textContent, contentStyle]}>
          <Text style={[styles.title, { color: colors.text }]}>
            2FA Aktif Edildi!
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Iki faktorlu dogrulama basariyla etkinlestirildi. Artik hesabiniz cok
            daha guvenli.
          </Text>

          {/* Info Box */}
          <View
            style={[
              styles.infoBox,
              { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] },
            ]}
          >
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Her giris icin dogrulama kodu gerekli
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                10 adet yedek kod olusturuldu
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Guvenlik ayarlarindan yonetilebilir
              </Text>
            </View>
          </View>

          {/* Reminder */}
          <View
            style={[
              styles.reminderBox,
              {
                backgroundColor: isDark
                  ? 'rgba(251, 191, 36, 0.1)'
                  : 'rgba(251, 191, 36, 0.08)',
              },
            ]}
          >
            <Ionicons name="information-circle" size={20} color={colors.warning} />
            <Text style={[styles.reminderText, { color: colors.textSecondary }]}>
              Yedek kodlarinizi guvenli bir yerde sakladiginizdan emin olun.
              Telefonunuza erisilemeyen durumlarda bu kodlara ihtiyaciniz olacak.
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Actions */}
      <Animated.View style={[styles.bottomActions, contentStyle]}>
        <TouchableOpacity onPress={handleDone} activeOpacity={0.8}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.doneButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.doneButtonText}>Tamam</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.settingsButton,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
          onPress={() => navigation.navigate('SecuritySettings')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.settingsButtonText, { color: colors.textSecondary }]}>
            Guvenlik Ayarlari
          </Text>
        </TouchableOpacity>
      </Animated.View>
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
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  textContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  infoBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  reminderBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    width: '100%',
  },
  reminderText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomActions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  settingsButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default TwoFactorSuccessScreen;
