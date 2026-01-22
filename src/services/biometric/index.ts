import * as LocalAuthentication from 'expo-local-authentication';
import { Platform, Alert } from 'react-native';
import {
  saveBiometricCredentials,
  getBiometricCredentials,
  clearBiometricCredentials,
  BiometricCredentials,
} from '../../utils/secureStorage';
import { addBreadcrumb, captureException } from '../sentry';

// Biometric authentication types
export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  errorCode?: string;
}

export interface BiometricStatus {
  isAvailable: boolean;
  isEnrolled: boolean;
  biometricTypes: BiometricType[];
  securityLevel: LocalAuthentication.SecurityLevel;
}

/**
 * Check if biometric authentication is available on the device
 */
export async function checkBiometricAvailability(): Promise<BiometricStatus> {
  try {
    const isAvailable = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

    const biometricTypes: BiometricType[] = supportedTypes.map((type) => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'facial';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'iris';
        default:
          return 'none';
      }
    });

    return {
      isAvailable,
      isEnrolled,
      biometricTypes: biometricTypes.filter((t) => t !== 'none'),
      securityLevel,
    };
  } catch (error) {
    captureException(error, { context: 'checkBiometricAvailability' });
    return {
      isAvailable: false,
      isEnrolled: false,
      biometricTypes: [],
      securityLevel: LocalAuthentication.SecurityLevel.NONE,
    };
  }
}

/**
 * Get user-friendly name for biometric type
 */
export function getBiometricTypeName(types: BiometricType[]): string {
  if (types.includes('facial')) {
    return Platform.OS === 'ios' ? 'Face ID' : 'Yuz Tanima';
  }
  if (types.includes('fingerprint')) {
    return Platform.OS === 'ios' ? 'Touch ID' : 'Parmak Izi';
  }
  if (types.includes('iris')) {
    return 'Iris Taramasi';
  }
  return 'Biyometrik';
}

/**
 * Authenticate user with biometrics
 */
export async function authenticateWithBiometrics(
  options?: {
    promptMessage?: string;
    fallbackLabel?: string;
    cancelLabel?: string;
    disableDeviceFallback?: boolean;
  }
): Promise<BiometricAuthResult> {
  const {
    promptMessage = 'Kimliginizi dogrulayin',
    fallbackLabel = 'Sifre kullan',
    cancelLabel = 'Iptal',
    disableDeviceFallback = false,
  } = options || {};

  try {
    const status = await checkBiometricAvailability();

    if (!status.isAvailable) {
      return {
        success: false,
        error: 'Cihazinizda biyometrik kimlik dogrulama desteklenmiyor.',
        errorCode: 'NOT_AVAILABLE',
      };
    }

    if (!status.isEnrolled) {
      return {
        success: false,
        error: 'Biyometrik kimlik dogrulama ayarlanmamis. Lutfen cihaz ayarlarindan yapilandirin.',
        errorCode: 'NOT_ENROLLED',
      };
    }

    addBreadcrumb({
      category: 'biometric',
      message: 'Starting biometric authentication',
      level: 'info',
      data: { biometricTypes: status.biometricTypes },
    });

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: disableDeviceFallback ? '' : fallbackLabel,
      cancelLabel,
      disableDeviceFallback,
    });

    if (result.success) {
      addBreadcrumb({
        category: 'biometric',
        message: 'Biometric authentication successful',
        level: 'info',
      });
      return { success: true };
    }

    // Handle specific error cases
    let errorMessage = 'Biyometrik dogrulama basarisiz.';
    let errorCode = 'AUTHENTICATION_FAILED';

    if (result.error === 'user_cancel') {
      errorMessage = 'Dogrulama iptal edildi.';
      errorCode = 'USER_CANCEL';
    } else if (result.error === 'system_cancel') {
      errorMessage = 'Dogrulama sistem tarafindan iptal edildi.';
      errorCode = 'SYSTEM_CANCEL';
    } else if (result.error === 'lockout') {
      errorMessage = 'Cok fazla basarisiz deneme. Lutfen daha sonra tekrar deneyin.';
      errorCode = 'LOCKOUT';
    } else if ((result.error as string) === 'lockout_permanent') {
      errorMessage = 'Biyometrik dogrulama kilitlendi. Lutfen cihaz sifrenizle kilidi acin.';
      errorCode = 'LOCKOUT_PERMANENT';
    } else if (result.error === 'not_enrolled') {
      errorMessage = 'Biyometrik kimlik dogrulama ayarlanmamis.';
      errorCode = 'NOT_ENROLLED';
    }

    return {
      success: false,
      error: errorMessage,
      errorCode,
    };
  } catch (error: any) {
    captureException(error, { context: 'authenticateWithBiometrics' });
    return {
      success: false,
      error: 'Biyometrik dogrulama sirasinda bir hata olustu.',
      errorCode: 'UNKNOWN_ERROR',
    };
  }
}

/**
 * Enable biometric login for a user
 */
export async function enableBiometricLogin(
  email: string,
  passwordHash: string
): Promise<boolean> {
  try {
    const status = await checkBiometricAvailability();

    if (!status.isAvailable || !status.isEnrolled) {
      Alert.alert(
        'Biyometrik Desteklenmiyor',
        'Cihazinizda biyometrik kimlik dogrulama mevcut degil veya ayarlanmamis.'
      );
      return false;
    }

    // Authenticate first
    const authResult = await authenticateWithBiometrics({
      promptMessage: 'Biyometrik girisi etkinlestirmek icin kimliginizi dogrulayin',
    });

    if (!authResult.success) {
      if (authResult.errorCode !== 'USER_CANCEL') {
        Alert.alert('Dogrulama Basarisiz', authResult.error);
      }
      return false;
    }

    // Save credentials
    const credentials: BiometricCredentials = {
      email,
      passwordHash,
      enabledAt: Date.now(),
    };

    const saved = await saveBiometricCredentials(credentials);

    if (saved) {
      addBreadcrumb({
        category: 'biometric',
        message: 'Biometric login enabled',
        level: 'info',
        data: { email },
      });
      return true;
    }

    return false;
  } catch (error) {
    captureException(error, { context: 'enableBiometricLogin' });
    return false;
  }
}

/**
 * Disable biometric login
 */
export async function disableBiometricLogin(): Promise<boolean> {
  try {
    const result = await clearBiometricCredentials();

    if (result) {
      addBreadcrumb({
        category: 'biometric',
        message: 'Biometric login disabled',
        level: 'info',
      });
    }

    return result;
  } catch (error) {
    captureException(error, { context: 'disableBiometricLogin' });
    return false;
  }
}

/**
 * Check if biometric login is enabled for the user
 */
export async function isBiometricLoginEnabled(): Promise<boolean> {
  try {
    const credentials = await getBiometricCredentials();
    return credentials !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Get saved biometric credentials after authentication
 */
export async function getBiometricLoginCredentials(): Promise<BiometricCredentials | null> {
  try {
    // Check if enabled
    const credentials = await getBiometricCredentials();
    if (!credentials) {
      return null;
    }

    // Authenticate
    const authResult = await authenticateWithBiometrics({
      promptMessage: 'Giris yapmak icin kimliginizi dogrulayin',
    });

    if (!authResult.success) {
      return null;
    }

    return credentials;
  } catch (error) {
    captureException(error, { context: 'getBiometricLoginCredentials' });
    return null;
  }
}

// Export LocalAuthentication for advanced usage
export { LocalAuthentication };
