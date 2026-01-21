import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { app } from './config';

// Initialize Functions
const functions = getFunctions(app, 'europe-west1');

// Connect to emulator in development
if (__DEV__) {
  // Uncomment to use local emulator
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}

// Types
interface VerificationResponse {
  success: boolean;
  message: string;
}

// ==================== EMAIL VERIFICATION ====================

/**
 * Send email verification code
 * @param email - The email address to send the code to
 */
export async function sendEmailVerificationCode(email: string): Promise<VerificationResponse> {
  try {
    const sendEmailVerification = httpsCallable<{ email: string }, VerificationResponse>(
      functions,
      'sendEmailVerification'
    );

    const result = await sendEmailVerification({ email });
    return result.data;
  } catch (error: any) {
    console.warn('Email verification error:', error);

    // Handle Firebase Functions errors
    if (error.code === 'functions/invalid-argument') {
      throw new Error(error.message || 'Geçersiz email adresi.');
    }
    if (error.code === 'functions/resource-exhausted') {
      throw new Error(error.message || 'Çok fazla istek. Lütfen bekleyin.');
    }
    if (error.code === 'functions/internal') {
      throw new Error(error.message || 'Email gönderilemedi. Lütfen tekrar deneyin.');
    }

    throw new Error('Email doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.');
  }
}

/**
 * Verify email code
 * @param email - The email address
 * @param code - The 6-digit verification code
 */
export async function verifyEmailCode(email: string, code: string): Promise<VerificationResponse> {
  try {
    const verifyEmail = httpsCallable<{ email: string; code: string }, VerificationResponse>(
      functions,
      'verifyEmailCode'
    );

    const result = await verifyEmail({ email, code });
    return result.data;
  } catch (error: any) {
    console.warn('Email code verification error:', error);

    if (error.code === 'functions/invalid-argument') {
      throw new Error(error.message || 'Doğrulama kodu hatalı.');
    }

    throw new Error('Doğrulama yapılamadı. Lütfen tekrar deneyin.');
  }
}

// ==================== SMS VERIFICATION ====================

/**
 * Send SMS verification code
 * @param phone - The phone number in format +905XXXXXXXXX
 */
export async function sendSmsVerificationCode(phone: string): Promise<VerificationResponse> {
  try {
    const sendSmsVerification = httpsCallable<{ phone: string }, VerificationResponse>(
      functions,
      'sendSmsVerification'
    );

    // Ensure phone is in correct format
    const formattedPhone = formatPhoneNumber(phone);

    const result = await sendSmsVerification({ phone: formattedPhone });
    return result.data;
  } catch (error: any) {
    console.warn('SMS verification error:', error);

    if (error.code === 'functions/invalid-argument') {
      throw new Error(error.message || 'Geçersiz telefon numarası.');
    }
    if (error.code === 'functions/resource-exhausted') {
      throw new Error(error.message || 'Çok fazla istek. Lütfen bekleyin.');
    }
    if (error.code === 'functions/internal') {
      throw new Error(error.message || 'SMS gönderilemedi. Lütfen tekrar deneyin.');
    }

    throw new Error('SMS doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.');
  }
}

/**
 * Verify SMS code
 * @param phone - The phone number
 * @param code - The 6-digit verification code
 */
export async function verifySmsCode(phone: string, code: string): Promise<VerificationResponse> {
  try {
    const verifySms = httpsCallable<{ phone: string; code: string }, VerificationResponse>(
      functions,
      'verifySmsCode'
    );

    const formattedPhone = formatPhoneNumber(phone);

    const result = await verifySms({ phone: formattedPhone, code });
    return result.data;
  } catch (error: any) {
    console.warn('SMS code verification error:', error);

    if (error.code === 'functions/invalid-argument') {
      throw new Error(error.message || 'Doğrulama kodu hatalı.');
    }

    throw new Error('Doğrulama yapılamadı. Lütfen tekrar deneyin.');
  }
}

// ==================== HELPERS ====================

/**
 * Format phone number to E.164 format (+905XXXXXXXXX)
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If starts with 0, replace with +90
  if (cleaned.startsWith('0')) {
    cleaned = '+90' + cleaned.substring(1);
  }

  // If doesn't start with +, add +90
  if (!cleaned.startsWith('+')) {
    cleaned = '+90' + cleaned;
  }

  // If starts with 90 without +, add +
  if (cleaned.startsWith('90') && !cleaned.startsWith('+90')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  return /^\+90[0-9]{10}$/.test(formatted);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
