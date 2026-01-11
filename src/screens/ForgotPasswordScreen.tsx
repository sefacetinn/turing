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

interface ForgotPasswordScreenProps {
  onNavigateBack: () => void;
}

type Step = 'email' | 'code' | 'newPassword' | 'success';

export function ForgotPasswordScreen({ onNavigateBack }: ForgotPasswordScreenProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendCode = () => {
    // API call to send verification code
    setStep('code');
  };

  const handleVerifyCode = () => {
    // API call to verify code
    setStep('newPassword');
  };

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword) {
      return;
    }
    // API call to reset password
    setStep('success');
  };

  const renderEmailStep = () => (
    <>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={gradients.primary}
          style={styles.iconBox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="mail" size={32} color="white" />
        </LinearGradient>
      </View>

      <Text style={styles.title}>Şifremi Unuttum</Text>
      <Text style={styles.subtitle}>
        E-posta adresinizi girin, size şifre sıfırlama kodu gönderelim.
      </Text>

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

      <TouchableOpacity onPress={handleSendCode} activeOpacity={0.8}>
        <LinearGradient
          colors={gradients.primary}
          style={styles.submitButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.submitText}>Kod Gönder</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderCodeStep = () => (
    <>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={gradients.primary}
          style={styles.iconBox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="keypad" size={32} color="white" />
        </LinearGradient>
      </View>

      <Text style={styles.title}>Doğrulama Kodu</Text>
      <Text style={styles.subtitle}>
        <Text style={styles.emailHighlight}>{email}</Text> adresine gönderilen 6 haneli kodu girin.
      </Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <View key={index} style={[styles.codeBox, digit && styles.codeBoxFilled]}>
            <TextInput
              style={styles.codeInput}
              value={digit}
              onChangeText={(text) => {
                const newCode = [...code];
                newCode[index] = text.slice(-1);
                setCode(newCode);
              }}
              keyboardType="number-pad"
              maxLength={1}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.resendRow}>
        <Text style={styles.resendText}>Kod gelmedi mi? </Text>
        <Text style={styles.resendLink}>Tekrar Gönder</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleVerifyCode} activeOpacity={0.8}>
        <LinearGradient
          colors={gradients.primary}
          style={styles.submitButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.submitText}>Doğrula</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderNewPasswordStep = () => (
    <>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={gradients.primary}
          style={styles.iconBox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="lock-closed" size={32} color="white" />
        </LinearGradient>
      </View>

      <Text style={styles.title}>Yeni Şifre</Text>
      <Text style={styles.subtitle}>
        Hesabınız için yeni bir şifre belirleyin.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Yeni Şifre</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.zinc[500]} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { paddingRight: 48 }]}
            value={newPassword}
            onChangeText={setNewPassword}
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

      {/* Password Requirements */}
      <View style={styles.requirements}>
        <View style={styles.requirementRow}>
          <Ionicons
            name={newPassword.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={newPassword.length >= 8 ? colors.success : colors.zinc[600]}
          />
          <Text style={[styles.requirementText, newPassword.length >= 8 && styles.requirementMet]}>
            En az 8 karakter
          </Text>
        </View>
        <View style={styles.requirementRow}>
          <Ionicons
            name={/[A-Z]/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={/[A-Z]/.test(newPassword) ? colors.success : colors.zinc[600]}
          />
          <Text style={[styles.requirementText, /[A-Z]/.test(newPassword) && styles.requirementMet]}>
            En az 1 büyük harf
          </Text>
        </View>
        <View style={styles.requirementRow}>
          <Ionicons
            name={/[0-9]/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={/[0-9]/.test(newPassword) ? colors.success : colors.zinc[600]}
          />
          <Text style={[styles.requirementText, /[0-9]/.test(newPassword) && styles.requirementMet]}>
            En az 1 rakam
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={handleResetPassword} activeOpacity={0.8}>
        <LinearGradient
          colors={gradients.primary}
          style={styles.submitButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.submitText}>Şifreyi Güncelle</Text>
          <Ionicons name="checkmark" size={18} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <View style={styles.iconContainer}>
        <View style={styles.successIconBox}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
        </View>
      </View>

      <Text style={styles.title}>Başarılı!</Text>
      <Text style={styles.subtitle}>
        Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.
      </Text>

      <TouchableOpacity onPress={onNavigateBack} activeOpacity={0.8}>
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
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient Orbs */}
      <View style={styles.backgroundOrb1} />
      <View style={styles.backgroundOrb2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          {step !== 'success' && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={step === 'email' ? onNavigateBack : () => setStep('email')}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}

          {/* Progress Indicator */}
          {step !== 'success' && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressDot, step === 'email' && styles.progressDotActive]} />
              <View style={[styles.progressLine, (step === 'code' || step === 'newPassword') && styles.progressLineActive]} />
              <View style={[styles.progressDot, step === 'code' && styles.progressDotActive]} />
              <View style={[styles.progressLine, step === 'newPassword' && styles.progressLineActive]} />
              <View style={[styles.progressDot, step === 'newPassword' && styles.progressDotActive]} />
            </View>
          )}

          {/* Glass Card */}
          <View style={styles.card}>
            {step === 'email' && renderEmailStep()}
            {step === 'code' && renderCodeStep()}
            {step === 'newPassword' && renderNewPasswordStep()}
            {step === 'success' && renderSuccessStep()}
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.zinc[700],
  },
  progressDotActive: {
    backgroundColor: colors.brand[500],
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.zinc[700],
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: colors.brand[500],
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconBox: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.zinc[400],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  emailHighlight: {
    color: colors.brand[400],
    fontWeight: '500',
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxFilled: {
    borderColor: colors.brand[500],
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
  },
  codeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: colors.zinc[500],
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand[400],
  },
  requirements: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirementText: {
    fontSize: 13,
    color: colors.zinc[600],
  },
  requirementMet: {
    color: colors.success,
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
});
