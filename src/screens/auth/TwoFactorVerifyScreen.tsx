import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/ThemeContext';
import { gradients } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import {
  verifySetupCode,
  completeTwoFactorSetup,
  verifyTwoFactorCode,
} from '../../services/twoFactor';
import { useToast } from '../../components/Toast';

interface TwoFactorVerifyScreenProps {
  navigation: any;
  route: {
    params?: {
      mode?: 'setup' | 'login';
      secret?: string;
      backupCodes?: string[];
      onSuccess?: () => void;
    };
  };
}

const CODE_LENGTH = 6;

export function TwoFactorVerifyScreen({ navigation, route }: TwoFactorVerifyScreenProps) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();

  const mode = route.params?.mode || 'setup';

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBackupOption, setShowBackupOption] = useState(false);
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-focus input
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-submit when code is complete
    if (code.length === CODE_LENGTH && !isLoading) {
      handleVerify();
    }
  }, [code]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH && !isUsingBackupCode) {
      setError('Lutfen 6 haneli kodu girin');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    setError(null);

    try {
      let isValid = false;

      if (mode === 'setup') {
        // Verify setup code
        isValid = await verifySetupCode(code);

        if (isValid && user?.uid) {
          // Complete 2FA setup
          const setupComplete = await completeTwoFactorSetup(user.uid);
          if (!setupComplete) {
            throw new Error('Setup completion failed');
          }
        }
      } else {
        // Verify login code
        if (!user?.uid) {
          throw new Error('User not found');
        }

        const result = await verifyTwoFactorCode(user.uid, code);
        isValid = result.success;

        if (result.isBackupCode) {
          showToast({
            type: 'info',
            message: 'Yedek kod kullanildi. Kodlarinizi yenilemenizi oneririz.',
          });
        }
      }

      if (isValid) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (mode === 'setup') {
          // Navigate to success screen
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'TwoFactorSuccess',
              },
            ],
          });
        } else {
          // Call success callback for login
          route.params?.onSuccess?.();
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        triggerShake();
        setError(
          isUsingBackupCode
            ? 'Gecersiz yedek kod. Lutfen tekrar deneyin.'
            : 'Gecersiz kod. Lutfen tekrar deneyin.'
        );
        setCode('');
      }
    } catch (err) {
      console.error('[2FA Verify] Error:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Bir hata olustu. Lutfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    // Only allow numbers
    const numericOnly = text.replace(/[^0-9]/g, '');
    if (numericOnly.length <= CODE_LENGTH) {
      setCode(numericOnly);
      setError(null);
    }
  };

  const handleBackupCodeChange = (text: string) => {
    // Allow alphanumeric and dashes for backup codes
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setCode(cleaned);
    setError(null);
  };

  const toggleBackupCodeMode = () => {
    setIsUsingBackupCode(!isUsingBackupCode);
    setCode('');
    setError(null);
    inputRef.current?.focus();
  };

  const renderCodeInput = () => {
    const codeArray = code.split('');

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
        style={styles.codeInputContainer}
      >
        <Animated.View
          style={[
            styles.codeBoxes,
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          {Array.from({ length: CODE_LENGTH }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.codeBox,
                {
                  backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
                  borderColor:
                    index === code.length
                      ? colors.brand[500]
                      : error
                      ? colors.error
                      : colors.border,
                  borderWidth: index === code.length ? 2 : 1,
                },
              ]}
            >
              <Text style={[styles.codeDigit, { color: colors.text }]}>
                {codeArray[index] || ''}
              </Text>
            </View>
          ))}
        </Animated.View>

        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
        />
      </TouchableOpacity>
    );
  };

  const renderBackupCodeInput = () => (
    <View style={styles.backupInputContainer}>
      <TextInput
        ref={inputRef}
        style={[
          styles.backupInput,
          {
            backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
            borderColor: error ? colors.error : colors.border,
            color: colors.text,
          },
        ]}
        value={code}
        onChangeText={handleBackupCodeChange}
        placeholder="XXXX-XXXX"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="characters"
        autoCorrect={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.cardBackground }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {mode === 'setup' ? 'Kodu Dogrulayin' : '2FA Dogrulama'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] },
          ]}
        >
          <Ionicons
            name={isUsingBackupCode ? 'key' : 'keypad'}
            size={48}
            color={colors.brand[500]}
          />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {isUsingBackupCode ? 'Yedek Kodu Girin' : 'Dogrulama Kodunu Girin'}
        </Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {isUsingBackupCode
            ? 'Yedek kodlarinizdan birini girin.'
            : mode === 'setup'
            ? 'Dogrulama uygulamanizda gorunen 6 haneli kodu girin.'
            : 'Dogrulama uygulamanizdan 6 haneli kodu girin.'}
        </Text>

        {/* Code Input */}
        {isUsingBackupCode ? renderBackupCodeInput() : renderCodeInput()}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        {/* Backup Code Toggle */}
        {mode === 'login' && (
          <TouchableOpacity
            onPress={toggleBackupCodeMode}
            style={styles.backupToggle}
          >
            <Ionicons
              name={isUsingBackupCode ? 'keypad-outline' : 'key-outline'}
              size={18}
              color={colors.brand[500]}
            />
            <Text style={[styles.backupToggleText, { color: colors.brand[500] }]}>
              {isUsingBackupCode ? 'Dogrulama kodunu kullan' : 'Yedek kodunu kullan'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          onPress={handleVerify}
          disabled={
            isLoading ||
            (!isUsingBackupCode && code.length !== CODE_LENGTH) ||
            (isUsingBackupCode && code.length < 8)
          }
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              (!isUsingBackupCode && code.length === CODE_LENGTH) ||
              (isUsingBackupCode && code.length >= 8)
                ? gradients.primary
                : [colors.zinc[400], colors.zinc[500]]
            }
            style={styles.verifyButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.verifyButtonText}>Dogrula</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {mode === 'setup' && (
          <Text style={[styles.helpText, { color: colors.textMuted }]}>
            Kod gormuyor musunuz? Dogrulama uygulamanizi acin ve Turing hesabini
            secin.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  codeInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  codeBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeDigit: {
    fontSize: 24,
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  backupInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  backupInput: {
    width: '70%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  errorText: {
    fontSize: 13,
  },
  backupToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backupToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomActions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default TwoFactorVerifyScreen;
