import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
  onAuthChange,
  getUserProfile,
  loginUser,
  registerUser,
  logoutUser,
  resetPassword,
  updateUserProfile,
  getAuthErrorMessage,
  UserProfile,
} from '../services/firebase';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isProvider: boolean;
  isOrganizer: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    role: 'organizer' | 'provider',
    additionalData?: {
      companyName?: string;
      phone?: string;
      providerServices?: string[];
    }
  ) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const credential = await loginUser(email, password);
      const profile = await getUserProfile(credential.user.uid);
      setUserProfile(profile);
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      role: 'organizer' | 'provider',
      additionalData?: {
        companyName?: string;
        phone?: string;
        providerServices?: string[];
      }
    ) => {
      try {
        setError(null);
        setIsLoading(true);
        const credential = await registerUser(email, password, displayName, role, additionalData);
        const profile = await getUserProfile(credential.user.uid);
        setUserProfile(profile);
      } catch (err: any) {
        const errorMessage = getAuthErrorMessage(err.code);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      setError(null);
      await logoutUser();
      setUserProfile(null);
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      await resetPassword(email);
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!user) return;

      try {
        setError(null);
        await updateUserProfile(user.uid, data);
        // Refresh profile
        const updatedProfile = await getUserProfile(user.uid);
        setUserProfile(updatedProfile);
      } catch (err: any) {
        setError('Profil güncellenirken bir hata oluştu.');
        throw err;
      }
    },
    [user]
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;

    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    isProvider: userProfile?.isProvider ?? false,
    isOrganizer: userProfile?.isOrganizer ?? false,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile,
    refreshProfile,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
