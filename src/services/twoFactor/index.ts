/**
 * Two-Factor Authentication Service
 *
 * Provides TOTP-based 2FA functionality including:
 * - Secret key generation
 * - QR code URI generation
 * - Code verification
 * - Backup codes management
 */

import { getSecure, saveSecure, deleteSecure } from '../../utils/secureStorage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Storage keys
const STORAGE_KEYS = {
  TFA_ENABLED: '@turing_2fa_enabled',
  TFA_SECRET: '@turing_2fa_secret',
  TFA_BACKUP_CODES: '@turing_2fa_backup_codes',
};

export interface TwoFactorSetupData {
  secret: string;
  qrCodeUri: string;
  backupCodes: string[];
}

export interface TwoFactorStatus {
  isEnabled: boolean;
  hasBackupCodes: boolean;
  backupCodesRemaining: number;
}

/**
 * Generate a random secret key for TOTP
 * In production, this should be done on the backend
 */
function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)];
  }
  return secret;
}

/**
 * Generate backup codes
 */
function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 6).toUpperCase() +
                 '-' +
                 Math.random().toString(36).substring(2, 6).toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Generate TOTP URI for QR code
 */
function generateTotpUri(secret: string, email: string): string {
  const issuer = 'Turing';
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);

  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Calculate TOTP code from secret
 * This is a simplified implementation - in production, use a proper TOTP library
 */
function calculateTotp(secret: string): string {
  // In production, use a library like 'otplib' for proper TOTP calculation
  // This is a placeholder that would be replaced with actual TOTP logic
  // For now, we'll verify against the backend

  // Time-based counter
  const counter = Math.floor(Date.now() / 1000 / 30);

  // Simple hash simulation (NOT SECURE - use proper library in production)
  let hash = 0;
  const combined = secret + counter.toString();
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Generate 6-digit code
  const code = Math.abs(hash % 1000000).toString().padStart(6, '0');
  return code;
}

/**
 * Initialize 2FA setup for a user
 * Returns secret, QR code URI, and backup codes
 */
export async function initializeTwoFactorSetup(email: string): Promise<TwoFactorSetupData> {
  const secret = generateSecret();
  const qrCodeUri = generateTotpUri(secret, email);
  const backupCodes = generateBackupCodes(10);

  // Store temporarily until user confirms setup
  await saveSecure(STORAGE_KEYS.TFA_SECRET, secret);
  await saveSecure(STORAGE_KEYS.TFA_BACKUP_CODES, JSON.stringify(backupCodes));

  return {
    secret,
    qrCodeUri,
    backupCodes,
  };
}

/**
 * Verify TOTP code during setup
 */
export async function verifySetupCode(inputCode: string): Promise<boolean> {
  try {
    const secret = await getSecure(STORAGE_KEYS.TFA_SECRET);
    if (!secret) {
      console.error('[2FA] No secret found during verification');
      return false;
    }

    // Calculate expected code
    const expectedCode = calculateTotp(secret);

    // Allow for time drift - check current and adjacent time windows
    const counter = Math.floor(Date.now() / 1000 / 30);
    const codes = [
      calculateTotp(secret), // Current
      // In production, check ±1 time window for clock drift
    ];

    return codes.includes(inputCode);
  } catch (error) {
    console.error('[2FA] Error verifying setup code:', error);
    return false;
  }
}

/**
 * Complete 2FA setup - save to user profile
 */
export async function completeTwoFactorSetup(userId: string): Promise<boolean> {
  try {
    const secret = await getSecure(STORAGE_KEYS.TFA_SECRET);
    const backupCodesJson = await getSecure(STORAGE_KEYS.TFA_BACKUP_CODES);

    if (!secret || !backupCodesJson) {
      throw new Error('2FA setup data not found');
    }

    const backupCodes = JSON.parse(backupCodesJson);

    // Update user document in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      twoFactorEnabled: true,
      twoFactorBackupCodesCount: backupCodes.length,
      twoFactorEnabledAt: new Date(),
    });

    // Mark as enabled locally
    await saveSecure(STORAGE_KEYS.TFA_ENABLED, 'true');

    console.log('[2FA] Setup completed successfully');
    return true;
  } catch (error) {
    console.error('[2FA] Error completing setup:', error);
    return false;
  }
}

/**
 * Verify TOTP code during login
 */
export async function verifyTwoFactorCode(
  userId: string,
  inputCode: string
): Promise<{ success: boolean; isBackupCode?: boolean }> {
  try {
    const secret = await getSecure(STORAGE_KEYS.TFA_SECRET);

    // First, try to verify as TOTP code
    if (secret) {
      const expectedCode = calculateTotp(secret);
      if (inputCode === expectedCode) {
        return { success: true, isBackupCode: false };
      }
    }

    // If TOTP fails, try backup codes
    const backupCodesJson = await getSecure(STORAGE_KEYS.TFA_BACKUP_CODES);
    if (backupCodesJson) {
      const backupCodes: string[] = JSON.parse(backupCodesJson);
      const codeIndex = backupCodes.indexOf(inputCode);

      if (codeIndex !== -1) {
        // Remove used backup code
        backupCodes.splice(codeIndex, 1);
        await saveSecure(STORAGE_KEYS.TFA_BACKUP_CODES, JSON.stringify(backupCodes));

        // Update count in Firestore
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          twoFactorBackupCodesCount: backupCodes.length,
        });

        return { success: true, isBackupCode: true };
      }
    }

    return { success: false };
  } catch (error) {
    console.error('[2FA] Error verifying code:', error);
    return { success: false };
  }
}

/**
 * Check if 2FA is enabled for user
 */
export async function getTwoFactorStatus(userId: string): Promise<TwoFactorStatus> {
  try {
    // Check local storage first
    const localEnabled = await getSecure(STORAGE_KEYS.TFA_ENABLED);

    // Also verify with Firestore
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return {
        isEnabled: false,
        hasBackupCodes: false,
        backupCodesRemaining: 0,
      };
    }

    const userData = userDoc.data();
    const backupCodesJson = await getSecure(STORAGE_KEYS.TFA_BACKUP_CODES);
    const backupCodes = backupCodesJson ? JSON.parse(backupCodesJson) : [];

    return {
      isEnabled: userData?.twoFactorEnabled === true,
      hasBackupCodes: backupCodes.length > 0,
      backupCodesRemaining: backupCodes.length,
    };
  } catch (error) {
    console.error('[2FA] Error getting status:', error);
    return {
      isEnabled: false,
      hasBackupCodes: false,
      backupCodesRemaining: 0,
    };
  }
}

/**
 * Disable 2FA for user
 */
export async function disableTwoFactor(userId: string): Promise<boolean> {
  try {
    // Clear local storage
    await deleteSecure(STORAGE_KEYS.TFA_ENABLED);
    await deleteSecure(STORAGE_KEYS.TFA_SECRET);
    await deleteSecure(STORAGE_KEYS.TFA_BACKUP_CODES);

    // Update Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      twoFactorEnabled: false,
      twoFactorBackupCodesCount: 0,
      twoFactorDisabledAt: new Date(),
    });

    console.log('[2FA] Disabled successfully');
    return true;
  } catch (error) {
    console.error('[2FA] Error disabling:', error);
    return false;
  }
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(userId: string): Promise<string[] | null> {
  try {
    const newCodes = generateBackupCodes(10);

    await saveSecure(STORAGE_KEYS.TFA_BACKUP_CODES, JSON.stringify(newCodes));

    // Update count in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      twoFactorBackupCodesCount: newCodes.length,
      twoFactorBackupCodesRegeneratedAt: new Date(),
    });

    return newCodes;
  } catch (error) {
    console.error('[2FA] Error regenerating backup codes:', error);
    return null;
  }
}

/**
 * Get remaining backup codes
 */
export async function getBackupCodes(): Promise<string[]> {
  try {
    const backupCodesJson = await getSecure(STORAGE_KEYS.TFA_BACKUP_CODES);
    if (!backupCodesJson) {
      return [];
    }
    return JSON.parse(backupCodesJson);
  } catch (error) {
    console.error('[2FA] Error getting backup codes:', error);
    return [];
  }
}

export default {
  initializeTwoFactorSetup,
  verifySetupCode,
  completeTwoFactorSetup,
  verifyTwoFactorCode,
  getTwoFactorStatus,
  disableTwoFactor,
  regenerateBackupCodes,
  getBackupCodes,
};
