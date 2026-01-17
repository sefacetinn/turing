import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

// Password strength levels
type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong' | 'excellent';

interface StrengthConfig {
  label: string;
  color: string;
  bgColor: string;
  percentage: number;
  icon: keyof typeof Ionicons.glyphMap;
}

const strengthConfigs: Record<StrengthLevel, StrengthConfig> = {
  weak: { label: 'Zayıf', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', percentage: 20, icon: 'alert-circle' },
  fair: { label: 'Orta', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', percentage: 40, icon: 'warning' },
  good: { label: 'İyi', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)', percentage: 60, icon: 'checkmark-circle' },
  strong: { label: 'Güçlü', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)', percentage: 80, icon: 'shield-checkmark' },
  excellent: { label: 'Mükemmel', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)', percentage: 100, icon: 'trophy' },
};

export function ChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecurityTips, setShowSecurityTips] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation refs
  const strengthBarAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const requirements = [
    { id: 'length', label: 'En az 8 karakter', met: newPassword.length >= 8 },
    { id: 'uppercase', label: 'En az 1 büyük harf', met: /[A-Z]/.test(newPassword) },
    { id: 'lowercase', label: 'En az 1 küçük harf', met: /[a-z]/.test(newPassword) },
    { id: 'number', label: 'En az 1 rakam', met: /[0-9]/.test(newPassword) },
    { id: 'special', label: 'En az 1 özel karakter', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
  ];

  const securityTips = [
    { icon: 'bulb-outline', tip: 'Kişisel bilgilerinizi (doğum tarihi, isim) kullanmayın' },
    { icon: 'shuffle-outline', tip: 'Her hesap için farklı şifre kullanın' },
    { icon: 'timer-outline', tip: 'Şifrenizi düzenli aralıklarla değiştirin' },
    { icon: 'key-outline', tip: 'Şifre yöneticisi kullanmayı düşünün' },
    { icon: 'shield-outline', tip: 'İki faktörlü kimlik doğrulamayı etkinleştirin' },
  ];

  // Calculate password strength
  const calculateStrength = (): StrengthLevel => {
    if (!newPassword) return 'weak';

    let score = 0;

    // Length scoring
    if (newPassword.length >= 8) score += 1;
    if (newPassword.length >= 12) score += 1;
    if (newPassword.length >= 16) score += 1;

    // Character variety
    if (/[a-z]/.test(newPassword)) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score += 1;

    // Bonus for mixed characters
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)) {
      score += 1;
    }

    if (score <= 2) return 'weak';
    if (score <= 4) return 'fair';
    if (score <= 5) return 'good';
    if (score <= 7) return 'strong';
    return 'excellent';
  };

  const strength = calculateStrength();
  const strengthConfig = strengthConfigs[strength];
  const allRequirementsMet = requirements.every((req) => req.met);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  // Animate strength bar
  useEffect(() => {
    const targetValue = newPassword.length > 0 ? strengthConfig.percentage : 0;
    Animated.timing(strengthBarAnim, {
      toValue: targetValue,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Haptic feedback on strength change
    if (newPassword.length > 0) {
      if (strength === 'excellent') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (strength === 'weak' && newPassword.length >= 4) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [strength, newPassword]);

  const shakeForm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      shakeForm();
      Alert.alert('Hata', 'Mevcut şifrenizi girin');
      return;
    }
    if (!allRequirementsMet) {
      shakeForm();
      Alert.alert('Hata', 'Yeni şifre tüm gereksinimleri karşılamalıdır');
      return;
    }
    if (!passwordsMatch) {
      shakeForm();
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Success animation
    Animated.timing(successAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Alert.alert(
      'Başarılı',
      'Şifreniz başarıyla değiştirildi',
      [{ text: 'Tamam', onPress: () => navigation.goBack() }]
    );
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ForgotPassword');
  };

  const toggleSecurityTips = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSecurityTips(!showSecurityTips);
  };

  const strengthBarWidth = strengthBarAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Şifre Değiştir</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.iconBox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="key" size={32} color="white" />
            </LinearGradient>
          </View>

          <Text style={[styles.description, { color: colors.textMuted }]}>
            Güvenliğiniz için güçlü bir şifre seçin. Şifreniz en az 8 karakter uzunluğunda olmalı ve farklı karakter türleri içermelidir.
          </Text>

          {/* Security Tips Toggle */}
          <TouchableOpacity
            style={[
              styles.securityTipsToggle,
              {
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.06)',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
              }
            ]}
            onPress={toggleSecurityTips}
            activeOpacity={0.7}
          >
            <View style={styles.securityTipsToggleLeft}>
              <Ionicons name="shield-checkmark" size={18} color="#3B82F6" />
              <Text style={[styles.securityTipsToggleText, { color: colors.text }]}>
                Güvenlik İpuçları
              </Text>
            </View>
            <Ionicons
              name={showSecurityTips ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {/* Security Tips List */}
          {showSecurityTips && (
            <View style={[
              styles.securityTipsList,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E7EB',
              }
            ]}>
              {securityTips.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.securityTipItem,
                    index < securityTips.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F3F4F6',
                    }
                  ]}
                >
                  <View style={[
                    styles.securityTipIcon,
                    { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }
                  ]}>
                    <Ionicons name={item.icon as any} size={14} color="#3B82F6" />
                  </View>
                  <Text style={[styles.securityTipText, { color: colors.textSecondary }]}>
                    {item.tip}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Form */}
          <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Mevcut Şifre</Text>
              <View style={[styles.inputContainer, {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.inputBorder
              }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 48, color: colors.text }]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Mevcut şifrenizi girin"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowCurrentPassword(!showCurrentPassword);
                  }}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotLink}>
                <Text style={[styles.forgotLinkText, { color: colors.brand[400] }]}>
                  Şifremi unuttum
                </Text>
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Yeni Şifre</Text>
              <View style={[styles.inputContainer, {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.inputBorder
              }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 48, color: colors.text }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Yeni şifrenizi girin"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowNewPassword(!showNewPassword);
                  }}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <View style={[
                styles.strengthCard,
                {
                  backgroundColor: isDark ? strengthConfig.bgColor : strengthConfig.bgColor,
                  borderColor: `${strengthConfig.color}30`,
                }
              ]}>
                <View style={styles.strengthHeader}>
                  <View style={styles.strengthLabelRow}>
                    <Ionicons name={strengthConfig.icon} size={16} color={strengthConfig.color} />
                    <Text style={[styles.strengthLabel, { color: strengthConfig.color }]}>
                      {strengthConfig.label}
                    </Text>
                  </View>
                  <Text style={[styles.strengthPercentage, { color: strengthConfig.color }]}>
                    {strengthConfig.percentage}%
                  </Text>
                </View>
                <View style={[
                  styles.strengthBarBackground,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }
                ]}>
                  <Animated.View
                    style={[
                      styles.strengthBarFill,
                      {
                        backgroundColor: strengthConfig.color,
                        width: strengthBarWidth,
                      }
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Password Requirements */}
            <View style={[styles.requirementsCard, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E7EB',
            }]}>
              <Text style={[styles.requirementsTitle, { color: colors.textMuted }]}>Şifre Gereksinimleri</Text>
              {requirements.map((req) => (
                <View key={req.id} style={styles.requirementRow}>
                  <View style={[
                    styles.requirementIcon,
                    {
                      backgroundColor: req.met
                        ? (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)')
                        : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                    }
                  ]}>
                    <Ionicons
                      name={req.met ? 'checkmark' : 'ellipse'}
                      size={req.met ? 14 : 6}
                      color={req.met ? colors.success : colors.textMuted}
                    />
                  </View>
                  <Text style={[
                    styles.requirementText,
                    { color: colors.textMuted },
                    req.met && { color: colors.success, fontWeight: '500' }
                  ]}>
                    {req.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Yeni Şifre (Tekrar)</Text>
              <View style={[
                styles.inputContainer,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.inputBorder
                },
                confirmPassword.length > 0 && (passwordsMatch
                  ? { borderColor: colors.success, borderWidth: 2 }
                  : { borderColor: colors.error, borderWidth: 2 })
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 48, color: colors.text }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Yeni şifrenizi tekrar girin"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowConfirmPassword(!showConfirmPassword);
                  }}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && (
                <View style={styles.matchIndicator}>
                  <Ionicons
                    name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                    size={16}
                    color={passwordsMatch ? colors.success : colors.error}
                  />
                  <Text style={[
                    styles.matchText,
                    { color: passwordsMatch ? colors.success : colors.error }
                  ]}>
                    {passwordsMatch ? 'Şifreler eşleşiyor' : 'Şifreler eşleşmiyor'}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleChangePassword}
            activeOpacity={0.8}
            disabled={!allRequirementsMet || !passwordsMatch || !currentPassword || isSubmitting}
          >
            <LinearGradient
              colors={allRequirementsMet && passwordsMatch && currentPassword && !isSubmitting
                ? gradients.primary
                : ['#374151', '#374151']
              }
              style={styles.submitButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isSubmitting ? (
                <>
                  <View style={styles.loadingDot} />
                  <Text style={styles.submitButtonText}>Değiştiriliyor...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.submitButtonText}>Şifreyi Değiştir</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
    marginBottom: 20,
  },
  securityTipsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  securityTipsToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  securityTipsToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  securityTipsList: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  securityTipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  securityTipIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  eyeButton: {
    padding: 14,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginRight: 4,
    paddingVertical: 4,
  },
  forgotLinkText: {
    fontSize: 13,
    fontWeight: '500',
  },
  strengthCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  strengthLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  strengthLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  strengthPercentage: {
    fontSize: 13,
    fontWeight: '700',
  },
  strengthBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  requirementsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  requirementIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementText: {
    fontSize: 13,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginLeft: 4,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingBottom: 24,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loadingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    borderTopColor: 'transparent',
  },
});
