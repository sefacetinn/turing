// User Roles
export type UserRole = 'organizer' | 'provider';

// Account Status
export type AccountStatus = 'pending' | 'approved' | 'rejected';

// Uploaded Document
export interface UploadedDocument {
  uri: string;
  name: string;
  type: 'pdf' | 'image';
  size: number;
}

// Organizer Registration Data
export interface OrganizerRegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  companyName?: string;
  companyAddress?: string;
}

// Provider Registration Data
export interface ProviderRegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  companyName: string;
  taxId: string;
  companyAddress: string;
  taxCertificate: UploadedDocument | null;
  signatureCircular: UploadedDocument | null;
  iban?: string;
  primaryCategory: string;
  subCategories?: string[];
  city: string;
  district: string;
  fullAddress: string;
}

// Registration Step
export interface RegistrationStep {
  id: string;
  title: string;
  description: string;
}

// Onboarding Slide
export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: [string, string];
}

// Verification State
export interface VerificationState {
  code: string;
  isVerified: boolean;
  isLoading: boolean;
  error: string | null;
  resendCountdown: number;
}

// Auth State
export interface AuthState {
  isLoggedIn: boolean;
  hasOnboarded: boolean;
  user: AuthUser | null;
  isLoading: boolean;
}

// Auth User
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  avatar?: string;
  companyName?: string;
}

// Login Credentials
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Password Requirements
export interface PasswordRequirement {
  id: string;
  label: string;
  regex: RegExp;
  met: boolean;
}

// Storage Keys
export const STORAGE_KEYS = {
  HAS_ONBOARDED: '@turing_has_onboarded',
  REMEMBER_EMAIL: '@turing_remember_email',
  AUTH_TOKEN: '@turing_auth_token',
  USER_DATA: '@turing_user_data',
} as const;
