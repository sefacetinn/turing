import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import {
  getRememberedEmail,
  saveRememberedEmail,
  clearRememberedEmail,
} from '../utils/storage';
import { validateEmail, sanitizeEmail } from '../utils/validation';
import { validateCredentials, TestAccount, testAccounts } from '../data/testAccounts';
import { loginUser, getAuthErrorMessage, getUserProfile } from '../services/firebase';

interface LoginScreenProps {
  onLogin: (asProvider: boolean, account?: TestAccount) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'organizer' | 'provider'>('organizer');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Load remembered email on mount
  useEffect(() => {
    loadRememberedEmail();
  }, []);

  const loadRememberedEmail = async () => {
    const savedEmail = await getRememberedEmail();
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  };

  const handleSubmit = async () => {
    // Haptic feedback on button press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Validate
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email gerekli';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Geçerli bir email girin';
    }

    if (!password.trim()) {
      newErrors.password = 'Şifre gerekli';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // First try demo accounts (for quick testing)
    const demoAccount = validateCredentials(email, password);

    if (demoAccount) {
      // Check if account type matches selected mode
      if ((selectedMode === 'provider' && demoAccount.role !== 'provider') ||
          (selectedMode === 'organizer' && demoAccount.role !== 'organizer')) {
        Alert.alert(
          'Hatalı Mod Seçimi',
          `Bu hesap ${demoAccount.role === 'provider' ? 'sağlayıcı' : 'organizatör'} hesabıdır. Lütfen doğru modu seçin.`,
          [{ text: 'Tamam' }]
        );
        return;
      }

      // Handle remember me
      if (rememberMe) {
        await saveRememberedEmail(email);
      } else {
        await clearRememberedEmail();
      }

      // Haptic feedback for successful login
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onLogin(selectedMode === 'provider', demoAccount);
      return;
    }

    // Try Firebase login for real registered users
    try {
      const userCredential = await loginUser(email, password);
      const profile = await getUserProfile(userCredential.user.uid);

      if (!profile) {
        Alert.alert('Hata', 'Kullanıcı profili bulunamadı.');
        return;
      }

      // Check if account type matches selected mode
      if ((selectedMode === 'provider' && !profile.isProvider) ||
          (selectedMode === 'organizer' && !profile.isOrganizer)) {
        Alert.alert(
          'Hatalı Mod Seçimi',
          `Bu hesap ${profile.isProvider ? 'sağlayıcı' : 'organizatör'} hesabıdır. Lütfen doğru modu seçin.`,
          [{ text: 'Tamam' }]
        );
        return;
      }

      // Handle remember me
      if (rememberMe) {
        await saveRememberedEmail(email);
      } else {
        await clearRememberedEmail();
      }

      // Haptic feedback for successful login
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Firebase login successful - App.tsx onAuthChange will handle the rest
      // Just call onLogin to update local state
      onLogin(selectedMode === 'provider');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorCode = error.code || '';
      Alert.alert(
        'Giriş Başarısız',
        getAuthErrorMessage(errorCode) + '\n\nDemo hesapları:\n• demo@organizer.com\n• demo@booking.com\n\nŞifre: demo123',
        [{ text: 'Tamam' }]
      );
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('RoleSelection');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Gradient Orbs */}
      <View style={styles.backgroundOrb1} />
      <View style={styles.backgroundOrb2} />
      <View style={styles.backgroundOrb3} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <View style={[styles.logoGlow, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.3)' : 'rgba(75, 48, 184, 0.2)' }]} />
              <Image
                source={require('../../assets/turing-icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <Text style={[styles.brandName, { color: colors.text }]}>turing</Text>
            <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>Etkinlik & Müzik Sektörü Platformu</Text>
          </View>

          {/* Glass Card */}
          <View style={[styles.card, {
            backgroundColor: colors.glass,
            borderColor: colors.glassBorder,
            ...(isDark ? {} : helpers.getShadow('lg'))
          }]}>
            {/* Mode Selection Tabs */}
            <View style={[styles.tabSelector, {
              backgroundColor: colors.glass,
              borderColor: colors.glassBorder
            }]}>
              <TouchableOpacity
                onPress={() => setSelectedMode('organizer')}
                style={[
                  styles.tabItem,
                  selectedMode === 'organizer' && styles.tabItemActive,
                ]}
              >
                {selectedMode === 'organizer' ? (
                  <LinearGradient
                    colors={gradients.primary}
                    style={styles.tabItemGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="people" size={18} color="white" />
                    <Text style={styles.tabTextActive}>Organizatör</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.tabItemInner}>
                    <Ionicons name="people-outline" size={18} color={colors.textMuted} />
                    <Text style={[styles.tabText, { color: colors.textMuted }]}>Organizatör</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedMode('provider')}
                style={[
                  styles.tabItem,
                  selectedMode === 'provider' && styles.tabItemActive,
                ]}
              >
                {selectedMode === 'provider' ? (
                  <LinearGradient
                    colors={gradients.primary}
                    style={styles.tabItemGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="musical-notes" size={18} color="white" />
                    <Text style={styles.tabTextActive}>Sağlayıcı</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.tabItemInner}>
                    <Ionicons name="musical-notes-outline" size={18} color={colors.textMuted} />
                    <Text style={[styles.tabText, { color: colors.textMuted }]}>Sağlayıcı</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>E-posta</Text>
              <View style={[styles.inputContainer, {
                backgroundColor: colors.inputBackground,
                borderColor: errors.email ? colors.error : colors.inputBorder
              }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(sanitizeEmail(text));
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="ornek@email.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Şifre</Text>
              <View style={[styles.inputContainer, {
                backgroundColor: colors.inputBackground,
                borderColor: errors.password ? colors.error : colors.inputBorder
              }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 48, color: colors.text }]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>
              )}
            </View>

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: rememberMe
                        ? colors.brand[500]
                        : isDark
                        ? colors.zinc[700]
                        : colors.zinc[200],
                      borderColor: rememberMe
                        ? colors.brand[500]
                        : isDark
                        ? colors.zinc[600]
                        : colors.zinc[300],
                    },
                  ]}
                >
                  {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <Text style={[styles.rememberMeText, { color: colors.textSecondary }]}>
                  Beni Hatırla
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={[styles.forgotText, { color: colors.brand[400] }]}>
                  Şifremi Unuttum
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
              <LinearGradient
                colors={gradients.primary}
                style={styles.submitButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.submitText}>Giriş Yap</Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>veya</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Demo Login Button */}
            <TouchableOpacity
              style={[styles.demoButton, {
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
              }]}
              onPress={() => {
                if (selectedMode === 'organizer') {
                  // Direct login for organizer
                  const orgAccount = testAccounts.find(a => a.type === 'organizer');
                  if (orgAccount) onLogin(false, orgAccount);
                } else {
                  // Show provider options
                  Alert.alert(
                    'Demo Hesap Seçin',
                    'Hangi sağlayıcı hesabıyla giriş yapmak istiyorsunuz?',
                    [
                      {
                        text: 'Booking (Sanatçı)',
                        onPress: () => {
                          const acc = testAccounts.find(a => a.type === 'booking');
                          if (acc) onLogin(true, acc);
                        },
                      },
                      {
                        text: 'Teknik (Ses-Işık)',
                        onPress: () => {
                          const acc = testAccounts.find(a => a.type === 'technical');
                          if (acc) onLogin(true, acc);
                        },
                      },
                      {
                        text: 'Catering',
                        onPress: () => {
                          const acc = testAccounts.find(a => a.type === 'catering');
                          if (acc) onLogin(true, acc);
                        },
                      },
                      {
                        text: 'Ulaşım',
                        onPress: () => {
                          const acc = testAccounts.find(a => a.type === 'transport');
                          if (acc) onLogin(true, acc);
                        },
                      },
                      {
                        text: 'Güvenlik',
                        onPress: () => {
                          const acc = testAccounts.find(a => a.type === 'security');
                          if (acc) onLogin(true, acc);
                        },
                      },
                      { text: 'İptal', style: 'cancel' },
                    ]
                  );
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="flash" size={18} color="#10b981" />
              <Text style={styles.demoButtonText}>Demo Giriş</Text>
            </TouchableOpacity>

            {/* Social Login */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={[styles.socialButton, {
                  backgroundColor: colors.glass,
                  borderColor: colors.glassBorder
                }]}
                onPress={() => Alert.alert('Google ile Giris', 'Google ile giris yaklnda aktif olacak.')}
              >
                <Ionicons name="logo-google" size={20} color={colors.text} />
                <Text style={[styles.socialText, { color: colors.text }]}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.socialButton, {
                  backgroundColor: colors.glass,
                  borderColor: colors.glassBorder
                }]}
                onPress={() => Alert.alert('Apple ile Giris', 'Apple ile giris yaklnda aktif olacak.')}
              >
                <Ionicons name="logo-apple" size={20} color={colors.text} />
                <Text style={[styles.socialText, { color: colors.text }]}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Link */}
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleText, { color: colors.textMuted }]}>
              Hesabınız yok mu?
            </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={[styles.toggleLink, { color: colors.brand[400] }]}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              Devam ederek{' '}
              <Text style={[styles.footerLink, { color: colors.textSecondary }]}>Kullanım Şartları</Text>
              {' '}ve{' '}
              <Text style={[styles.footerLink, { color: colors.textSecondary }]}>Gizlilik Politikası</Text>
              'nı kabul etmiş olursunuz.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundOrb1: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 250,
    height: 200,
    borderRadius: 125,
    backgroundColor: 'rgba(75, 48, 184, 0.2)',
  },
  backgroundOrb2: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 200,
    height: 150,
    borderRadius: 100,
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
  },
  backgroundOrb3: {
    position: 'absolute',
    top: '40%',
    right: -80,
    width: 160,
    height: 120,
    borderRadius: 80,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  logoGlow: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: 50,
    backgroundColor: 'rgba(75, 48, 184, 0.3)',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tabItem: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabItemActive: {},
  tabItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  tabItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  eyeButton: {
    padding: 14,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberMeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontSize: 12,
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  socialText: {
    fontSize: 14,
    fontWeight: '500',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  toggleText: {
    fontSize: 14,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    textDecorationLine: 'underline',
  },
});
