import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import {
  RegistrationProgress,
  PhoneInput,
  VerificationCodeInput,
  PasswordStrengthMeter,
} from '../../components/auth';
import { ORGANIZER_STEPS } from '../../constants/onboarding';
import {
  validateEmail,
  validatePhone,
  validateFullName,
  isPasswordValid,
  getValidationError,
  sanitizeEmail,
} from '../../utils/validation';
import { OrganizerRegistrationData } from '../../types/auth';

export function OrganizerRegistrationScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState<Partial<OrganizerRegistrationData>>({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    companyAddress: '',
    password: '',
  });

  // Verification codes
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error when user types
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic info
        const nameError = getValidationError('fullName', formData.fullName || '');
        const emailError = getValidationError('email', formData.email || '');
        const phoneError = getValidationError('phone', formData.phone || '');

        if (nameError) newErrors.fullName = nameError;
        if (emailError) newErrors.email = emailError;
        if (phoneError) newErrors.phone = phoneError;
        break;

      case 1: // Company info (optional)
        // No required fields
        break;

      case 2: // Email verification
        if (emailCode.length !== 6) {
          newErrors.emailCode = 'Doğrulama kodu 6 haneli olmalı';
        }
        break;

      case 3: // Phone verification
        if (phoneCode.length !== 6) {
          newErrors.phoneCode = 'Doğrulama kodu 6 haneli olmalı';
        }
        break;

      case 4: // Password
        if (!isPasswordValid(formData.password || '')) {
          newErrors.password = 'Şifre gereksinimlerini karşılamıyor';
        }
        if (formData.password !== confirmPassword) {
          newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!validateStep(currentStep)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (currentStep < ORGANIZER_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);

      // Simulate sending verification code
      if (currentStep === 1) {
        Alert.alert('Doğrulama Kodu', `${formData.email} adresine kod gönderildi.`);
      } else if (currentStep === 2) {
        Alert.alert('Doğrulama Kodu', `${formData.phone} numarasına SMS gönderildi.`);
      }
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!validateStep(currentStep)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('RegistrationSuccess', { role: 'organizer' });
    }, 1500);
  };

  const handleResendCode = (type: 'email' | 'phone') => {
    Alert.alert(
      'Kod Gönderildi',
      type === 'email'
        ? `${formData.email} adresine yeni kod gönderildi.`
        : `${formData.phone} numarasına yeni SMS gönderildi.`
    );
  };

  const renderStepContent = () => {
    const inputStyle = [
      styles.input,
      {
        backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
        borderColor: isDark ? colors.zinc[700] : colors.zinc[300],
        color: colors.text,
      },
    ];

    switch (currentStep) {
      case 0: // Basic Info
        return (
          <View style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Ad Soyad <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[inputStyle, errors.fullName && { borderColor: colors.error }]}
                value={formData.fullName}
                onChangeText={(text) => updateFormData('fullName', text)}
                placeholder="Örn: Ahmet Yılmaz"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
              {errors.fullName && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.fullName}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Email <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[inputStyle, errors.email && { borderColor: colors.error }]}
                value={formData.email}
                onChangeText={(text) => updateFormData('email', sanitizeEmail(text))}
                placeholder="ornek@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.email}
                </Text>
              )}
            </View>

            <PhoneInput
              value={formData.phone || ''}
              onChange={(phone) => updateFormData('phone', phone)}
              error={errors.phone}
            />
          </View>
        );

      case 1: // Company Info
        return (
          <View style={styles.stepContent}>
            <View style={styles.optionalBadge}>
              <Ionicons name="information-circle" size={16} color={colors.info} />
              <Text style={[styles.optionalText, { color: colors.info }]}>
                Bu adım opsiyoneldir
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Firma Adı</Text>
              <TextInput
                style={inputStyle}
                value={formData.companyName}
                onChangeText={(text) => updateFormData('companyName', text)}
                placeholder="Firma veya organizasyon adı"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Firma Adresi</Text>
              <TextInput
                style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
                value={formData.companyAddress}
                onChangeText={(text) => updateFormData('companyAddress', text)}
                placeholder="Firma adresi"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        );

      case 2: // Email Verification
        return (
          <View style={styles.stepContent}>
            <View style={styles.verificationHeader}>
              <View
                style={[
                  styles.verificationIcon,
                  { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] },
                ]}
              >
                <Ionicons name="mail" size={40} color={colors.brand[500]} />
              </View>
              <Text style={[styles.verificationTitle, { color: colors.text }]}>
                Email Doğrulama
              </Text>
              <Text style={[styles.verificationSubtitle, { color: colors.textSecondary }]}>
                {formData.email} adresine gönderilen 6 haneli kodu girin.
              </Text>
            </View>

            <VerificationCodeInput
              value={emailCode}
              onChange={setEmailCode}
            />

            {errors.emailCode && (
              <Text style={[styles.errorText, { color: colors.error, textAlign: 'center', marginTop: 8 }]}>
                {errors.emailCode}
              </Text>
            )}

            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => handleResendCode('email')}
            >
              <Text style={[styles.resendText, { color: colors.brand[500] }]}>
                Kodu tekrar gönder
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 3: // Phone Verification
        return (
          <View style={styles.stepContent}>
            <View style={styles.verificationHeader}>
              <View
                style={[
                  styles.verificationIcon,
                  { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] },
                ]}
              >
                <Ionicons name="phone-portrait" size={40} color={colors.success} />
              </View>
              <Text style={[styles.verificationTitle, { color: colors.text }]}>
                Telefon Doğrulama
              </Text>
              <Text style={[styles.verificationSubtitle, { color: colors.textSecondary }]}>
                {formData.phone} numarasına gönderilen 6 haneli kodu girin.
              </Text>
            </View>

            <VerificationCodeInput
              value={phoneCode}
              onChange={setPhoneCode}
            />

            {errors.phoneCode && (
              <Text style={[styles.errorText, { color: colors.error, textAlign: 'center', marginTop: 8 }]}>
                {errors.phoneCode}
              </Text>
            )}

            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => handleResendCode('phone')}
            >
              <Text style={[styles.resendText, { color: colors.brand[500] }]}>
                SMS'i tekrar gönder
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 4: // Password Setup
        return (
          <View style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Şifre <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[inputStyle, errors.password && { borderColor: colors.error }]}
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                placeholder="Güçlü bir şifre oluşturun"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
              <PasswordStrengthMeter password={formData.password || ''} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Şifre Tekrar <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[inputStyle, errors.confirmPassword && { borderColor: colors.error }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Şifreyi tekrar girin"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
              {errors.confirmPassword && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.confirmPassword}
                </Text>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Organizatör Kaydı
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress */}
          <View style={styles.progressContainer}>
            <RegistrationProgress
              steps={ORGANIZER_STEPS}
              currentStep={currentStep}
            />
          </View>

          {/* Step Content */}
          {renderStepContent()}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4b30b8', '#a855f7']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextButtonText}>
                {isLoading
                  ? 'Yükleniyor...'
                  : currentStep === ORGANIZER_STEPS.length - 1
                  ? 'Kaydı Tamamla'
                  : 'Devam'}
              </Text>
              {!isLoading && (
                <Ionicons
                  name={currentStep === ORGANIZER_STEPS.length - 1 ? 'checkmark' : 'arrow-forward'}
                  size={20}
                  color="white"
                />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  stepContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  optionalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 10,
  },
  optionalText: {
    fontSize: 13,
    fontWeight: '500',
  },
  verificationHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  verificationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  verificationTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  verificationSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  nextButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
