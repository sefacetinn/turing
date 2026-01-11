import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradients, darkTheme as defaultColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

// Default colors for static styles (dark theme)
const colors = defaultColors;

interface LoginScreenProps {
  onLogin: (asProvider: boolean) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { colors, isDark, helpers } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedMode, setSelectedMode] = useState<'organizer' | 'provider'>('organizer');

  const handleSubmit = () => {
    onLogin(selectedMode === 'provider');
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
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <View style={[styles.logoGlow, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.3)' : 'rgba(147, 51, 234, 0.2)' }]} />
              <LinearGradient
                colors={['#9333ea', '#7c3aed', '#6366f1']}
                style={styles.logoBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="musical-notes" size={38} color="white" />
              </LinearGradient>
              <View style={styles.sparkle}>
                <Ionicons name="sparkles" size={20} color={colors.brand[400]} />
              </View>
            </View>

            <Text style={[styles.brandName, { color: colors.text }]}>TURING</Text>
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
                borderColor: colors.inputBorder
              }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ornek@email.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Şifre</Text>
              <View style={[styles.inputContainer, {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder
              }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 48, color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
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
            </View>

            {/* Forgot Password */}
            {isLogin && (
              <TouchableOpacity style={styles.forgotButton}>
                <Text style={[styles.forgotText, { color: colors.brand[400] }]}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
              <LinearGradient
                colors={gradients.primary}
                style={styles.submitButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.submitText}>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>veya</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Social Login */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={[styles.socialButton, {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder
              }]}>
                <Ionicons name="logo-google" size={20} color={colors.text} />
                <Text style={[styles.socialText, { color: colors.text }]}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder
              }]}>
                <Ionicons name="logo-apple" size={20} color={colors.text} />
                <Text style={[styles.socialText, { color: colors.text }]}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Toggle Login/Register */}
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleText, { color: colors.textMuted }]}>
              {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={[styles.toggleLink, { color: colors.brand[400] }]}>
                {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
              </Text>
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
    backgroundColor: colors.background,
  },
  backgroundOrb1: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 250,
    height: 200,
    borderRadius: 125,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
  },
  backgroundOrb2: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 200,
    height: 150,
    borderRadius: 100,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
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
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 40,
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 14,
    color: colors.zinc[400],
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
    color: colors.zinc[400],
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.zinc[400],
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
    color: colors.text,
  },
  eyeButton: {
    padding: 14,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
    color: colors.brand[400],
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
    color: colors.zinc[500],
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
    color: colors.text,
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
    color: colors.zinc[500],
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand[400],
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: colors.zinc[600],
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: colors.zinc[500],
    textDecorationLine: 'underline',
  },
});
