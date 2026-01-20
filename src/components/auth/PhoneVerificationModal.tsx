import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { app } from '../../services/firebase/config';
import {
  sendPhoneVerificationCode,
  verifyPhoneCode,
  formatPhoneNumber,
} from '../../services/firebase';
import { VerificationCodeInput } from './VerificationCodeInput';

interface PhoneVerificationModalProps {
  visible: boolean;
  phone: string;
  onVerified: () => void;
  onClose: () => void;
}

export function PhoneVerificationModal({
  visible,
  phone,
  onVerified,
  onClose,
}: PhoneVerificationModalProps) {
  const { colors, isDark } = useTheme();
  const recaptchaVerifier = useRef<any>(null);

  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    setLoading(true);
    setError('');

    try {
      await sendPhoneVerificationCode(phone, recaptchaVerifier.current);
      setStep('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Doğrulama kodu 6 haneli olmalı');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyPhoneCode(code, 'link'); // Link to current user
      onVerified();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCode('');
    setError('');
    await handleSendCode();
  };

  const handleClose = () => {
    setStep('send');
    setCode('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* reCAPTCHA Modal */}
          <FirebaseRecaptchaVerifierModal
            ref={recaptchaVerifier}
            firebaseConfig={app.options}
            attemptInvisibleVerification
          />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              Telefon Doğrulama
            </Text>
            <View style={styles.closeButton} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {step === 'send' ? (
              <>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] },
                  ]}
                >
                  <Ionicons name="phone-portrait" size={48} color={colors.success} />
                </View>

                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {formatPhoneNumber(phone)} numarasına doğrulama kodu göndereceğiz.
                </Text>

                {error ? (
                  <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.success }]}
                  onPress={handleSendCode}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="send" size={20} color="white" />
                      <Text style={styles.buttonText}>Kod Gönder</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] },
                  ]}
                >
                  <Ionicons name="chatbubble" size={48} color={colors.brand[500]} />
                </View>

                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {formatPhoneNumber(phone)} numarasına gönderilen 6 haneli kodu girin.
                </Text>

                <VerificationCodeInput value={code} onChange={setCode} />

                {error ? (
                  <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.brand[500] }]}
                  onPress={handleVerifyCode}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="white" />
                      <Text style={styles.buttonText}>Doğrula</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResend}
                  disabled={loading}
                >
                  <Text style={[styles.resendText, { color: colors.brand[500] }]}>
                    Kodu tekrar gönder
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  resendButton: {
    marginTop: 20,
    padding: 12,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
