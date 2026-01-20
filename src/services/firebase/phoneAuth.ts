import {
  PhoneAuthProvider,
  signInWithCredential,
  linkWithCredential,
  ConfirmationResult,
  PhoneAuthCredential,
} from 'firebase/auth';
import { auth } from './config';

// Store verification ID for later use
let verificationId: string | null = null;
let confirmationResult: ConfirmationResult | null = null;
// Store credential for registration flow (validate without signing in)
let storedPhoneCredential: PhoneAuthCredential | null = null;

/**
 * Format phone number to E.164 format (+905XXXXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '+90' + cleaned.substring(1);
  }

  if (!cleaned.startsWith('+')) {
    cleaned = '+90' + cleaned;
  }

  if (cleaned.startsWith('90') && !cleaned.startsWith('+90')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}

/**
 * Send phone verification code using Firebase Phone Auth
 * @param phone - Phone number in any format
 * @param recaptchaVerifier - The reCAPTCHA verifier from FirebaseRecaptchaVerifierModal
 */
export async function sendPhoneVerificationCode(
  phone: string,
  recaptchaVerifier: any
): Promise<{ success: boolean; message: string }> {
  try {
    const formattedPhone = formatPhoneNumber(phone);

    const phoneProvider = new PhoneAuthProvider(auth);
    verificationId = await phoneProvider.verifyPhoneNumber(
      formattedPhone,
      recaptchaVerifier
    );

    return {
      success: true,
      message: 'Doğrulama kodu telefonunuza gönderildi.',
    };
  } catch (error: any) {
    console.error('Phone verification error:', error);

    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Geçersiz telefon numarası.');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Çok fazla istek. Lütfen daha sonra tekrar deneyin.');
    }
    if (error.code === 'auth/quota-exceeded') {
      throw new Error('SMS kotası aşıldı. Lütfen daha sonra tekrar deneyin.');
    }

    throw new Error('SMS gönderilemedi. Lütfen tekrar deneyin.');
  }
}

/**
 * Verify phone code
 * @param code - The 6-digit verification code
 * @param mode - 'signIn' to sign in, 'link' to link to current user, 'validateOnly' to just validate (for registration)
 */
export async function verifyPhoneCode(
  code: string,
  mode: 'signIn' | 'link' | 'validateOnly' = 'signIn'
): Promise<{ success: boolean; message: string }> {
  try {
    if (!verificationId) {
      throw new Error('Önce doğrulama kodu göndermeniz gerekiyor.');
    }

    const credential = PhoneAuthProvider.credential(verificationId, code);

    if (mode === 'link' && auth.currentUser) {
      // Link phone number to existing user
      await linkWithCredential(auth.currentUser, credential);
      verificationId = null;
      storedPhoneCredential = null;
    } else if (mode === 'validateOnly') {
      // Just store the credential for later use (during registration)
      // Don't sign in yet - the credential will be used after user account is created
      storedPhoneCredential = credential;
      verificationId = null;
    } else {
      // Sign in with phone (creates new user if doesn't exist)
      await signInWithCredential(auth, credential);
      verificationId = null;
      storedPhoneCredential = null;
    }

    return {
      success: true,
      message: 'Telefon numarası doğrulandı!',
    };
  } catch (error: any) {
    console.error('Phone code verification error:', error);

    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Doğrulama kodu hatalı.');
    }
    if (error.code === 'auth/code-expired') {
      throw new Error('Doğrulama kodunun süresi dolmuş. Lütfen yeni kod isteyin.');
    }
    if (error.code === 'auth/credential-already-in-use') {
      throw new Error('Bu telefon numarası başka bir hesaba bağlı.');
    }

    throw new Error('Doğrulama yapılamadı. Lütfen tekrar deneyin.');
  }
}

/**
 * Link stored phone credential to current user (call after registration)
 */
export async function linkStoredPhoneCredential(): Promise<{ success: boolean; message: string }> {
  try {
    if (!storedPhoneCredential) {
      // No stored credential, phone was already linked or not verified
      return { success: true, message: 'Telefon zaten bağlı.' };
    }

    if (!auth.currentUser) {
      throw new Error('Kullanıcı oturumu bulunamadı.');
    }

    await linkWithCredential(auth.currentUser, storedPhoneCredential);
    storedPhoneCredential = null;

    return {
      success: true,
      message: 'Telefon numarası hesaba bağlandı!',
    };
  } catch (error: any) {
    console.error('Link phone credential error:', error);

    if (error.code === 'auth/credential-already-in-use') {
      throw new Error('Bu telefon numarası başka bir hesaba bağlı.');
    }
    if (error.code === 'auth/provider-already-linked') {
      // Phone already linked, that's fine
      storedPhoneCredential = null;
      return { success: true, message: 'Telefon zaten bağlı.' };
    }

    throw new Error('Telefon bağlanamadı. Lütfen tekrar deneyin.');
  }
}

/**
 * Get stored phone credential (for checking if phone was verified)
 */
export function hasStoredPhoneCredential(): boolean {
  return storedPhoneCredential !== null;
}

/**
 * Check if verification is in progress
 */
export function isVerificationInProgress(): boolean {
  return verificationId !== null;
}

/**
 * Clear verification state
 */
export function clearVerificationState(): void {
  verificationId = null;
  confirmationResult = null;
  storedPhoneCredential = null;
}
