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
  photoURL?: string; // Company logo
  userPhotoURL?: string; // User's personal photo
  role: 'organizer' | 'provider' | 'dual';
  isProvider: boolean;
  isOrganizer: boolean;
  companyName?: string;
  companyDescription?: string; // Şirket açıklaması
  companyPhone?: string; // Şirket telefonu
  phone?: string;
  phoneNumber?: string; // Kişisel telefon
  bio?: string; // Kişisel biyografi
  city?: string;
  website?: string;
  providerServices?: string[];
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  isActive: boolean;
  // Company profile fields
  foundedYear?: string;
  employeeCount?: string;
  coverImage?: string;
  address?: string;
  serviceCategories?: string[];
  serviceRegions?: string[];
  socialMedia?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  workingHours?: {
    day: string;
    enabled: boolean;
    start: string;
    end: string;
  }[];
  // User preference for which mode to start in (for dual role users)
  preferredMode?: 'organizer' | 'provider';
  // Company membership fields (new)
  companyIds?: string[];             // Kullanıcının üye olduğu firmalar
  primaryCompanyId?: string;         // Aktif firma
  // Portfolio images for providers
  portfolioImages?: string[];
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
      isVerified: true, // Auto-approve for now (TODO: implement admin approval flow)
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

    // Update last login and auto-verify (TODO: remove auto-verify when admin approval is implemented)
    await updateDoc(doc(db, 'users', userCredential.user.uid), {
      lastLoginAt: serverTimestamp(),
      isVerified: true, // Auto-approve existing users on login
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
    'auth/invalid-credential': 'Geçersiz kimlik bilgisi. E-posta veya şifrenizi kontrol edin.',
    'auth/too-many-requests': 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.',
    'auth/network-request-failed': 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
    'auth/popup-closed-by-user': 'Giriş penceresi kapatıldı.',
    'auth/cancelled-popup-request': 'İşlem iptal edildi.',
    'auth/account-exists-with-different-credential': 'Bu e-posta farklı bir giriş yöntemiyle kayıtlı.',
    'auth/requires-recent-login': 'Bu işlem için yeniden giriş yapmanız gerekiyor.',
    'auth/invalid-verification-code': 'Doğrulama kodu hatalı.',
    'auth/code-expired': 'Doğrulama kodunun süresi dolmuş.',
    'auth/credential-already-in-use': 'Bu kimlik bilgisi başka bir hesaba bağlı.',
    'auth/invalid-phone-number': 'Geçersiz telefon numarası.',
    'auth/quota-exceeded': 'SMS kotası aşıldı. Lütfen daha sonra tekrar deneyin.',
  };

  return errorMessages[errorCode] || 'Bir hata oluştu. Lütfen tekrar deneyin.';
}
