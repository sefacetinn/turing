import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// User profile type
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'organizer' | 'provider' | 'dual';
  isProvider: boolean;
  isOrganizer: boolean;
  companyName?: string;
  phone?: string;
  providerServices?: string[];
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  isActive: boolean;
}

// Register new user
export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  role: 'organizer' | 'provider',
  additionalData?: {
    companyName?: string;
    phone?: string;
    providerServices?: string[];
  }
): Promise<UserCredential> {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Create user profile in Firestore
    const userProfile: Omit<UserProfile, 'uid'> = {
      email,
      displayName,
      role,
      isProvider: role === 'provider',
      isOrganizer: role === 'organizer',
      companyName: additionalData?.companyName,
      phone: additionalData?.phone,
      providerServices: additionalData?.providerServices || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      isActive: true,
    };

    await setDoc(doc(db, 'users', user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return userCredential;
  } catch (error) {
    throw error;
  }
}

// Sign in user
export async function loginUser(email: string, password: string): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Update last login
    await updateDoc(doc(db, 'users', userCredential.user.uid), {
      lastLoginAt: serverTimestamp(),
    });

    return userCredential;
  } catch (error) {
    throw error;
  }
}

// Sign out user
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}

// Send password reset email
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { uid, ...userDoc.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
}

// Auth state listener
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Error messages in Turkish
export function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda.',
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/operation-not-allowed': 'Bu işlem izin verilmiyor.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalıdır.',
    'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.',
    'auth/user-not-found': 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.',
    'auth/wrong-password': 'Hatalı şifre.',
    'auth/too-many-requests': 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.',
    'auth/network-request-failed': 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
  };

  return errorMessages[errorCode] || 'Bir hata oluştu. Lütfen tekrar deneyin.';
}
