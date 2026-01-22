import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS as AUTH_STORAGE_KEYS } from '../types/auth';

// Secure storage keys
export const SECURE_KEYS = {
  AUTH_TOKEN: 'turing_auth_token',
  REFRESH_TOKEN: 'turing_refresh_token',
  BIOMETRIC_CREDENTIALS: 'turing_biometric_creds',
  USER_SESSION: 'turing_user_session',
  ENCRYPTION_KEY: 'turing_encryption_key',
} as const;

// Options for SecureStore
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/**
 * Check if SecureStore is available on this device
 */
export async function isSecureStoreAvailable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Save a value securely
 */
export async function saveSecure(key: string, value: string): Promise<boolean> {
  try {
    const isAvailable = await isSecureStoreAvailable();
    if (isAvailable) {
      await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
      return true;
    } else {
      // Fallback to AsyncStorage with a warning prefix
      console.warn('[SecureStorage] SecureStore not available, using AsyncStorage fallback');
      await AsyncStorage.setItem(`__FALLBACK_${key}`, value);
      return true;
    }
  } catch (error) {
    console.error('[SecureStorage] Error saving value:', error);
    return false;
  }
}

/**
 * Get a value from secure storage
 */
export async function getSecure(key: string): Promise<string | null> {
  try {
    const isAvailable = await isSecureStoreAvailable();
    if (isAvailable) {
      return await SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);
    } else {
      // Fallback to AsyncStorage
      return await AsyncStorage.getItem(`__FALLBACK_${key}`);
    }
  } catch (error) {
    console.error('[SecureStorage] Error getting value:', error);
    return null;
  }
}

/**
 * Delete a value from secure storage
 */
export async function deleteSecure(key: string): Promise<boolean> {
  try {
    const isAvailable = await isSecureStoreAvailable();
    if (isAvailable) {
      await SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS);
    } else {
      await AsyncStorage.removeItem(`__FALLBACK_${key}`);
    }
    return true;
  } catch (error) {
    console.error('[SecureStorage] Error deleting value:', error);
    return false;
  }
}

// Auth Token Management

/**
 * Save auth token securely
 */
export async function saveAuthTokenSecure(token: string): Promise<boolean> {
  return saveSecure(SECURE_KEYS.AUTH_TOKEN, token);
}

/**
 * Get auth token from secure storage
 */
export async function getAuthTokenSecure(): Promise<string | null> {
  return getSecure(SECURE_KEYS.AUTH_TOKEN);
}

/**
 * Clear auth token from secure storage
 */
export async function clearAuthTokenSecure(): Promise<boolean> {
  return deleteSecure(SECURE_KEYS.AUTH_TOKEN);
}

// Refresh Token Management

/**
 * Save refresh token securely
 */
export async function saveRefreshTokenSecure(token: string): Promise<boolean> {
  return saveSecure(SECURE_KEYS.REFRESH_TOKEN, token);
}

/**
 * Get refresh token from secure storage
 */
export async function getRefreshTokenSecure(): Promise<string | null> {
  return getSecure(SECURE_KEYS.REFRESH_TOKEN);
}

/**
 * Clear refresh token from secure storage
 */
export async function clearRefreshTokenSecure(): Promise<boolean> {
  return deleteSecure(SECURE_KEYS.REFRESH_TOKEN);
}

// Biometric Credentials Management

export interface BiometricCredentials {
  email: string;
  passwordHash: string; // Hashed password for security
  enabledAt: number;
}

/**
 * Save biometric credentials securely
 */
export async function saveBiometricCredentials(
  credentials: BiometricCredentials
): Promise<boolean> {
  return saveSecure(
    SECURE_KEYS.BIOMETRIC_CREDENTIALS,
    JSON.stringify(credentials)
  );
}

/**
 * Get biometric credentials from secure storage
 */
export async function getBiometricCredentials(): Promise<BiometricCredentials | null> {
  try {
    const value = await getSecure(SECURE_KEYS.BIOMETRIC_CREDENTIALS);
    if (value) {
      return JSON.parse(value) as BiometricCredentials;
    }
    return null;
  } catch (error) {
    console.error('[SecureStorage] Error parsing biometric credentials:', error);
    return null;
  }
}

/**
 * Clear biometric credentials from secure storage
 */
export async function clearBiometricCredentials(): Promise<boolean> {
  return deleteSecure(SECURE_KEYS.BIOMETRIC_CREDENTIALS);
}

// Session Management

export interface UserSession {
  userId: string;
  email: string;
  expiresAt: number;
  createdAt: number;
  lastActivityAt: number;
}

/**
 * Save user session securely
 */
export async function saveUserSession(session: UserSession): Promise<boolean> {
  return saveSecure(SECURE_KEYS.USER_SESSION, JSON.stringify(session));
}

/**
 * Get user session from secure storage
 */
export async function getUserSession(): Promise<UserSession | null> {
  try {
    const value = await getSecure(SECURE_KEYS.USER_SESSION);
    if (value) {
      return JSON.parse(value) as UserSession;
    }
    return null;
  } catch (error) {
    console.error('[SecureStorage] Error parsing user session:', error);
    return null;
  }
}

/**
 * Clear user session from secure storage
 */
export async function clearUserSession(): Promise<boolean> {
  return deleteSecure(SECURE_KEYS.USER_SESSION);
}

/**
 * Check if session is expired
 */
export async function isSessionExpired(): Promise<boolean> {
  const session = await getUserSession();
  if (!session) return true;
  return Date.now() > session.expiresAt;
}

/**
 * Update session last activity timestamp
 */
export async function updateSessionActivity(): Promise<boolean> {
  const session = await getUserSession();
  if (!session) return false;

  return saveUserSession({
    ...session,
    lastActivityAt: Date.now(),
  });
}

// Clear All Secure Data

/**
 * Clear all secure storage data (use on logout)
 */
export async function clearAllSecureData(): Promise<boolean> {
  try {
    await Promise.all([
      deleteSecure(SECURE_KEYS.AUTH_TOKEN),
      deleteSecure(SECURE_KEYS.REFRESH_TOKEN),
      deleteSecure(SECURE_KEYS.USER_SESSION),
      // Don't clear biometric credentials on regular logout
      // Only clear on explicit disable or account deletion
    ]);
    return true;
  } catch (error) {
    console.error('[SecureStorage] Error clearing all secure data:', error);
    return false;
  }
}

/**
 * Clear absolutely everything including biometric data
 */
export async function clearAllSecureDataIncludingBiometric(): Promise<boolean> {
  try {
    await Promise.all([
      deleteSecure(SECURE_KEYS.AUTH_TOKEN),
      deleteSecure(SECURE_KEYS.REFRESH_TOKEN),
      deleteSecure(SECURE_KEYS.USER_SESSION),
      deleteSecure(SECURE_KEYS.BIOMETRIC_CREDENTIALS),
      deleteSecure(SECURE_KEYS.ENCRYPTION_KEY),
    ]);
    return true;
  } catch (error) {
    console.error('[SecureStorage] Error clearing all secure data:', error);
    return false;
  }
}

// Migration Utility

/**
 * Migrate auth token from AsyncStorage to SecureStore
 * Call this once during app startup
 */
export async function migrateAuthTokenToSecureStorage(): Promise<void> {
  try {
    // Check if we have a token in AsyncStorage
    const existingToken = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN);

    if (existingToken) {
      // Save to SecureStore
      const saved = await saveAuthTokenSecure(existingToken);

      if (saved) {
        // Remove from AsyncStorage after successful migration
        await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_TOKEN);
        console.log('[SecureStorage] Successfully migrated auth token to secure storage');
      }
    }
  } catch (error) {
    console.error('[SecureStorage] Error during migration:', error);
  }
}
