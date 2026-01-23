import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { UserRole } from '../../types/auth';
import { AuthNavigationProp, RootStackParamList } from '../../types/navigation';

interface RegistrationSuccessScreenProps {
  onLogin: (asProvider: boolean) => void;
}

export function RegistrationSuccessScreen({ onLogin }: RegistrationSuccessScreenProps) {
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'RegistrationSuccess'>>();
  const { role } = route.params || { role: 'organizer' };
  const { colors, isDark } = useTheme();

  // Use React Native's built-in Animated instead of Reanimated
  const [scaleAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate icon scale
    Animated.sequence([
      Animated.delay(200),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate content opacity
    Animated.sequence([
      Animated.delay(400),
      Animated.spring(opacityAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isProvider = role === 'provider';

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (isProvider) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'AccountPending' }],
      });
    } else {
      // User is already logged in via Firebase after registration
      // Call onLogin to update app state and show MainTabs
      onLogin(false);
    }
  };

  return (
    <LinearGradient
      colors={isProvider ? ['#059669', '#10b981', '#34d399'] : ['#4b30b8', '#8b5cf6', '#a78bfa']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Success Icon */}
          <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={isProvider ? 'briefcase' : 'checkmark'}
                size={64}
                color={isProvider ? '#059669' : '#4b30b8'}
              />
            </View>
          </Animated.View>

          {/* Text Content */}
          <Animated.View style={[styles.textContent, { opacity: opacityAnim }]}>
            <Text style={styles.title}>
              {isProvider ? 'Başvurunuz Alındı!' : 'Kayıt Tamamlandı!'}
            </Text>
            <Text style={styles.description}>
              {isProvider
                ? 'Hesabınız admin onayından geçtikten sonra aktif hale gelecektir. Bu süreç genellikle 1-2 iş günü içinde tamamlanır.'
                : 'Hesabınız başarıyla oluşturuldu. Artık turing platformunu kullanmaya başlayabilirsiniz.'}
            </Text>

            {isProvider && (
              <View style={styles.infoBox}>
                <Ionicons name="time" size={24} color="white" />
                <Text style={styles.infoText}>
                  Onay süreciniz hakkında email ile bilgilendirileceksiniz.
                </Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Continue Button */}
        <Animated.View style={[styles.buttonContainer, { opacity: opacityAnim }]}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <Text style={[styles.continueButtonText, { color: isProvider ? '#059669' : '#4b30b8' }]}>
              {isProvider ? 'Tamam' : 'Giriş Yap'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={isProvider ? '#059669' : '#4b30b8'}
            />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrapper: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  textContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
