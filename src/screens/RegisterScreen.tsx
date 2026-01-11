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
import { colors, gradients } from '../theme/colors';

interface RegisterScreenProps {
  onRegister: (asProvider: boolean) => void;
  onNavigateToLogin: () => void;
}

export function RegisterScreen({ onRegister, onNavigateToLogin }: RegisterScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedMode, setSelectedMode] = useState<'organizer' | 'provider'>('organizer');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      // Show error
      return;
    }
    onRegister(selectedMode === 'provider');
  };

  return (
    <SafeAreaView style={styles.container}>
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
              <View style={styles.logoGlow} />
              <LinearGradient
                colors={['#9333ea', '#7c3aed', '#6366f1']}
                style={styles.logoBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="musical-notes" size={32} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.brandName}>Hesap Oluştur</Text>
            <Text style={styles.brandTagline}>Turing'e hoş geldiniz</Text>
          </View>

          {/* Glass Card */}
          <View style={styles.card}>
            {/* Mode Selection Tabs */}
            <View style={styles.tabSelector}>
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
                    <Ionicons name="people-outline" size={18} color={colors.zinc[400]} />
                    <Text style={styles.tabText}>Organizatör</Text>
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
                    <Ionicons name="musical-notes-outline" size={18} color={colors.zinc[400]} />
                    <Text style={styles.tabText}>Sağlayıcı</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ad Soyad</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color={colors.zinc[500]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Adınız Soyadınız"
                  placeholderTextColor={colors.zinc[600]}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-posta</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={18} color={colors.zinc[500]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ornek@email.com"
                  placeholderTextColor={colors.zinc[600]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Telefon</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={18} color={colors.zinc[500]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="0555 123 4567"
                  placeholderTextColor={colors.zinc[600]}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Şifre</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.zinc[500]} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 48 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="En az 8 karakter"
                  placeholderTextColor={colors.zinc[600]}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.zinc[500]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Şifre Tekrar</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.zinc[500]} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 48 }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Şifrenizi tekrar girin"
                  placeholderTextColor={colors.zinc[600]}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.zinc[500]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
              <Text style={styles.termsText}>
                <Text style={styles.termsLink}>Kullanım Şartları</Text> ve{' '}
                <Text style={styles.termsLink}>Gizlilik Politikası</Text>'nı kabul ediyorum
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
              <LinearGradient
                colors={gradients.primary}
                style={styles.submitButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.submitText}>Kayıt Ol</Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={20} color={colors.text} />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={20} color={colors.text} />
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Toggle Login/Register */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>Zaten hesabınız var mı?</Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.toggleLink}>Giriş Yap</Text>
            </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  logoGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 30,
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
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
    marginBottom: 16,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.zinc[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.brand[500],
    borderColor: colors.brand[500],
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.zinc[500],
    lineHeight: 20,
  },
  termsLink: {
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
});
