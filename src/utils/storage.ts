import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, AuthUser } from '../types/auth';

// Check if user has completed onboarding
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED);
    return value === 'true';
  } catch {
    return false;
  }
};

// Mark onboarding as completed
export const setOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, 'true');
  } catch (error) {
    console.error('Failed to save onboarding status:', error);
  }
};

// Get remembered email
export const getRememberedEmail = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL);
  } catch {
    return null;
  }
};

// Save email for remember me
export const saveRememberedEmail = async (email: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, email);
  } catch (error) {
    console.error('Failed to save remembered email:', error);
  }
};

// Clear remembered email
export const clearRememberedEmail = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_EMAIL);
  } catch (error) {
    console.error('Failed to clear remembered email:', error);
  }
};

// Save auth token
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Failed to save auth token:', error);
  }
};

// Get auth token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch {
    return null;
  }
};

// Clear auth token
export const clearAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Failed to clear auth token:', error);
  }
};

// Save user data
export const saveUserData = async (user: AuthUser): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
};

// Get user data
export const getUserData = async (): Promise<AuthUser | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Clear user data
export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Failed to clear user data:', error);
  }
};

// Clear all auth data (logout)
export const clearAllAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
};
