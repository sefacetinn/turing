import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';

import { useTheme } from '../../theme/ThemeContext';
import { gradients } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import {
  initializeTwoFactorSetup,
  type TwoFactorSetupData,
} from '../../services/twoFactor';

interface TwoFactorSetupScreenProps {
  navigation: any;
}

type SetupStep = 'intro' | 'qrcode' | 'backup' | 'verify';

export function TwoFactorSetupScreen({ navigation }: TwoFactorSetupScreenProps) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<SetupStep>('intro');
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);

  const startSetup = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      const data = await initializeTwoFactorSetup(user.email);
      setSetupData(data);
      setCurrentStep('qrcode');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('[2FA Setup] Error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    if (setupData?.secret) {
      Clipboard.setString(setupData.secret);
      setSecretCopied(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      const codesText = setupData.backupCodes.join('\n');
      Clipboard.setString(codesText);
      setBackupCodesCopied(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => setBackupCodesCopied(false), 2000);
    }
  };

  const shareBackupCodes = async () => {
    if (setupData?.backupCodes) {
      try {
        await Share.share({
          message: `Turing 2FA Yedek Kodlari:\n\n${setupData.backupCodes.join('\n')}\n\nBu kodlari guvenli bir yerde saklayin.`,
          title: 'Turing 2FA Yedek Kodlari',
        });
      } catch (error) {
        console.error('[2FA Setup] Share error:', error);
      }
    }
  };

  const goToVerify = () => {
    setCurrentStep('verify');
    navigation.navigate('TwoFactorVerify', {
      secret: setupData?.secret,
      backupCodes: setupData?.backupCodes,
    });
  };

  const renderIntroStep = () => (
    <View style={styles.stepContent}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] },
        ]}
      >
        <Ionicons name="shield-checkmark" size={64} color={colors.brand[500]} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        Iki Faktorlu Dogrulama
      </Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Hesabinizi daha guvenli hale getirmek icin iki faktorlu dogrulamayi etkinlestirin.
        Her giris yaptiginizda telefonunuzdaki uygulamadan bir kod girmeniz gerekecek.
      </Text>

      <View
        style={[
          styles.infoBox,
          { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] },
        ]}
      >
        <View style={styles.infoItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Yetkisiz erisimlere karsi koruma
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Sifre calinan durumlarda ek guvenlik
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Google Authenticator veya benzeri uygulamalar
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.warningBox,
          {
            backgroundColor: isDark
              ? 'rgba(251, 191, 36, 0.1)'
              : 'rgba(251, 191, 36, 0.08)',
          },
        ]}
      >
        <Ionicons name="warning" size={20} color={colors.warning} />
        <Text style={[styles.warningText, { color: colors.textSecondary }]}>
          Devam etmeden once telefonunuza Google Authenticator, Authy veya benzer bir
          dogrulama uygulamasi yukleyin.
        </Text>
      </View>
    </View>
  );

  const renderQRCodeStep = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        QR Kodunu Tarayin
      </Text>

      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Dogrulama uygulamanizi acin ve asagidaki QR kodunu tarayin.
      </Text>

      <View
        style={[
          styles.qrContainer,
          {
            backgroundColor: 'white',
            borderColor: colors.border,
          },
        ]}
      >
        {setupData?.qrCodeUri && (
          <QRCode
            value={setupData.qrCodeUri}
            size={200}
            backgroundColor="white"
            color="black"
          />
        )}
      </View>

      <Text style={[styles.orText, { color: colors.textMuted }]}>
        veya kodu manuel olarak girin
      </Text>

      <TouchableOpacity
        style={[
          styles.secretBox,
          {
            backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
            borderColor: colors.border,
          },
        ]}
        onPress={copySecret}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.secretText, { color: colors.text }]}
          selectable
          numberOfLines={1}
        >
          {setupData?.secret}
        </Text>
        <Ionicons
          name={secretCopied ? 'checkmark' : 'copy'}
          size={20}
          color={secretCopied ? colors.success : colors.textMuted}
        />
      </TouchableOpacity>

      {secretCopied && (
        <Text style={[styles.copiedText, { color: colors.success }]}>
          Kopyalandi!
        </Text>
      )}
    </View>
  );

  const renderBackupCodesStep = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Yedek Kodlari Kaydedin
      </Text>

      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Bu kodlar, telefonunuza erisilemeyen durumlarda hesabiniza girmek icin kullanilabilir.
        Her kod yalnizca bir kez kullanilabilir.
      </Text>

      <View
        style={[
          styles.backupCodesContainer,
          {
            backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.backupCodesGrid}>
          {setupData?.backupCodes.map((code, index) => (
            <View key={index} style={styles.backupCodeItem}>
              <Text style={[styles.backupCodeIndex, { color: colors.textMuted }]}>
                {index + 1}.
              </Text>
              <Text
                style={[styles.backupCodeText, { color: colors.text }]}
                selectable
              >
                {code}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.backupCodesActions}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={copyBackupCodes}
            activeOpacity={0.7}
          >
            <Ionicons
              name={backupCodesCopied ? 'checkmark' : 'copy'}
              size={18}
              color={backupCodesCopied ? colors.success : colors.textSecondary}
            />
            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
              {backupCodesCopied ? 'Kopyalandi' : 'Kopyala'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={shareBackupCodes}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
              Paylas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.warningBox,
          {
            backgroundColor: isDark
              ? 'rgba(239, 68, 68, 0.1)'
              : 'rgba(239, 68, 68, 0.08)',
          },
        ]}
      >
        <Ionicons name="alert-circle" size={20} color={colors.error} />
        <Text style={[styles.warningText, { color: colors.textSecondary }]}>
          Bu kodlari guvenli bir yerde saklayin. Bu sayfa kapandiktan sonra tekrar
          gosterilmeyecektir.
        </Text>
      </View>
    </View>
  );

  const renderStepIndicator = () => {
    const steps = ['intro', 'qrcode', 'backup', 'verify'];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <View style={styles.stepIndicator}>
        {steps.slice(0, -1).map((step, index) => (
          <React.Fragment key={step}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor:
                    index <= currentIndex ? colors.brand[500] : colors.zinc[300],
                },
              ]}
            >
              {index < currentIndex && (
                <Ionicons name="checkmark" size={12} color="white" />
              )}
            </View>
            {index < steps.length - 2 && (
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor:
                      index < currentIndex ? colors.brand[500] : colors.zinc[300],
                  },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  const handleNext = () => {
    if (currentStep === 'intro') {
      startSetup();
    } else if (currentStep === 'qrcode') {
      setCurrentStep('backup');
    } else if (currentStep === 'backup') {
      goToVerify();
    }
  };

  const handleBack = () => {
    if (currentStep === 'qrcode') {
      setCurrentStep('intro');
    } else if (currentStep === 'backup') {
      setCurrentStep('qrcode');
    } else {
      navigation.goBack();
    }
  };

  const getNextButtonText = () => {
    switch (currentStep) {
      case 'intro':
        return 'Baslat';
      case 'qrcode':
        return 'Devam';
      case 'backup':
        return 'Kodlari Kaydettim';
      default:
        return 'Devam';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: colors.cardBackground }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          2FA Kurulumu
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 'intro' && renderIntroStep()}
        {currentStep === 'qrcode' && renderQRCodeStep()}
        {currentStep === 'backup' && renderBackupCodesStep()}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradients.primary}
            style={styles.nextButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>{getNextButtonText()}</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {currentStep === 'intro' && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.cancelText, { color: colors.textMuted }]}>
              Daha Sonra
            </Text>
          </TouchableOpacity>
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    width: '100%',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  orText: {
    fontSize: 13,
    marginBottom: 12,
  },
  secretBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  secretText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginRight: 12,
  },
  copiedText: {
    fontSize: 13,
    marginTop: 8,
  },
  backupCodesContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  backupCodesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backupCodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  backupCodeIndex: {
    fontSize: 12,
    width: 20,
  },
  backupCodeText: {
    fontSize: 13,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  backupCodesActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottomActions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 8,
  },
});

export default TwoFactorSetupScreen;
