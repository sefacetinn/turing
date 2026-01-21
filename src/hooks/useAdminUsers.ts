import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  getDocuments,
  updateDocument,
  deleteDocument,
  Collections,
  where,
  orderBy,
} from '../services/firebase';
import type {
  AdminUser,
  UserFilters,
  UserAccountStatus,
  VerificationStatus,
} from '../types/admin';

export interface UseAdminUsersResult {
  // Data
  users: AdminUser[];
  filteredUsers: AdminUser[];
  selectedUser: AdminUser | null;

  // Filters
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
  resetFilters: () => void;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isProcessing: boolean;

  // Actions
  refresh: () => Promise<void>;
  selectUser: (userId: string | null) => void;
  suspendUser: (userId: string, reason: string) => Promise<void>;
  unsuspendUser: (userId: string) => Promise<void>;
  verifyUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string, reason: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, isAdmin: boolean, adminRoleId?: string) => Promise<void>;

  // Stats
  stats: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    organizers: number;
    providers: number;
  };
}

const defaultFilters: UserFilters = {
  search: '',
  role: 'all',
  status: 'all',
  verificationStatus: 'all',
  category: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

// Map Firebase user data to AdminUser type
function mapFirebaseUserToAdminUser(firebaseUser: any): AdminUser {
  const role = firebaseUser.role === 'dual' ? 'both' : (firebaseUser.role || 'organizer');

  // Determine status based on flags
  let status: UserAccountStatus = 'active';
  if (firebaseUser.isSuspended) {
    status = 'suspended';
  } else if (!firebaseUser.isVerified) {
    status = 'pending';
  }

  // Determine verification status
  let verificationStatus: VerificationStatus = 'pending';
  if (firebaseUser.isVerified) {
    verificationStatus = 'verified';
  } else if (firebaseUser.verificationRejected) {
    verificationStatus = 'rejected';
  }

  return {
    id: firebaseUser.id,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kullanıcı',
    email: firebaseUser.email || '',
    phone: firebaseUser.phone || firebaseUser.phoneNumber,
    avatar: firebaseUser.photoURL,
    role: role,
    company: firebaseUser.companyName,
    location: firebaseUser.city,
    status,
    verificationStatus,
    verified: firebaseUser.isVerified || false,
    isAdmin: firebaseUser.isAdmin || false,
    adminRoleId: firebaseUser.adminRoleId,
    isSuspended: firebaseUser.isSuspended || false,
    suspendedAt: firebaseUser.suspendedAt,
    suspendReason: firebaseUser.suspendReason,
    providerCategory: firebaseUser.providerCategory,
    providerSubCategory: firebaseUser.providerSubCategory,
    stats: {
      totalEvents: firebaseUser.totalEvents || 0,
      totalOffers: firebaseUser.totalOffers || 0,
      totalRevenue: firebaseUser.totalRevenue || 0,
      rating: firebaseUser.rating || 0,
      completedJobs: firebaseUser.completedJobs || 0,
    },
    memberSince: firebaseUser.createdAt?.toDate?.()?.toISOString() || firebaseUser.createdAt || new Date().toISOString(),
    lastActiveAt: firebaseUser.lastActiveAt?.toDate?.()?.toISOString() || firebaseUser.lastActiveAt,
    createdAt: firebaseUser.createdAt?.toDate?.()?.toISOString() || firebaseUser.createdAt || new Date().toISOString(),
  };
}

export function useAdminUsers(): UseAdminUsersResult {
  const { logAction } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [filters, setFilters] = useState<UserFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch users from Firebase
  const fetchUsers = useCallback(async () => {
    try {
      const firebaseUsers = await getDocuments<any>(Collections.USERS, [
        orderBy('createdAt', 'desc'),
      ]);

      const mappedUsers = firebaseUsers.map(mapFirebaseUserToAdminUser);
      setUsers(mappedUsers);
    } catch (error) {
      // Firebase permission error - show empty list
      console.log('Unable to fetch users (Firebase permission required)');
      setUsers([]);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    fetchUsers().finally(() => setIsLoading(false));
  }, [fetchUsers]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.company?.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (filters.role && filters.role !== 'all') {
      result = result.filter((user) => user.role === filters.role);
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      result = result.filter((user) => user.status === filters.status);
    }

    // Verification status filter
    if (filters.verificationStatus && filters.verificationStatus !== 'all') {
      result = result.filter((user) => user.verificationStatus === filters.verificationStatus);
    }

    // Category filter (for providers)
    if (filters.category && filters.category !== 'all') {
      result = result.filter((user) => user.providerCategory === filters.category);
    }

    // Admin filter
    if (filters.isAdmin !== undefined) {
      result = result.filter((user) => user.isAdmin === filters.isAdmin);
    }

    // Sort
    if (filters.sortBy) {
      result.sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';

        switch (filters.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'lastActiveAt':
            aValue = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
            bValue = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
            break;
          case 'revenue':
            aValue = a.stats?.totalRevenue || 0;
            bValue = b.stats?.totalRevenue || 0;
            break;
        }

        if (typeof aValue === 'string') {
          return filters.sortOrder === 'asc'
            ? aValue.localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue);
        }

        return filters.sortOrder === 'asc' ? aValue - (bValue as number) : (bValue as number) - aValue;
      });
    }

    return result;
  }, [users, filters]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    pending: users.filter((u) => u.verificationStatus === 'pending').length,
    suspended: users.filter((u) => u.status === 'suspended').length,
    organizers: users.filter((u) => u.role === 'organizer').length,
    providers: users.filter((u) => u.role === 'provider').length,
  }), [users]);

  // Actions
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchUsers();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchUsers]);

  const selectUser = useCallback((userId: string | null) => {
    if (userId === null) {
      setSelectedUser(null);
    } else {
      const user = users.find((u) => u.id === userId) || null;
      setSelectedUser(user);
    }
  }, [users]);

  const suspendUser = useCallback(async (userId: string, reason: string) => {
    setIsProcessing(true);
    try {
      // Update in Firebase
      await updateDocument(Collections.USERS, userId, {
        isSuspended: true,
        suspendedAt: new Date().toISOString(),
        suspendReason: reason,
      });

      const user = users.find((u) => u.id === userId);
      if (user) {
        await logAction('user.suspend', 'user', userId, {
          previousValue: { status: user.status },
          newValue: { status: 'suspended', suspendReason: reason },
          description: `${user.name} askıya alındı: ${reason}`,
        });
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                status: 'suspended' as UserAccountStatus,
                isSuspended: true,
                suspendedAt: new Date().toISOString(),
                suspendReason: reason,
              }
            : user
        )
      );
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [users, logAction]);

  const unsuspendUser = useCallback(async (userId: string) => {
    setIsProcessing(true);
    try {
      // Update in Firebase
      await updateDocument(Collections.USERS, userId, {
        isSuspended: false,
        suspendedAt: null,
        suspendReason: null,
      });

      const user = users.find((u) => u.id === userId);
      if (user) {
        await logAction('user.unsuspend', 'user', userId, {
          previousValue: { status: 'suspended' },
          newValue: { status: 'active' },
          description: `${user.name} askıdan çıkarıldı`,
        });
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                status: 'active' as UserAccountStatus,
                isSuspended: false,
                suspendedAt: undefined,
                suspendReason: undefined,
              }
            : user
        )
      );
    } catch (error) {
      console.error('Error unsuspending user:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [users, logAction]);

  const verifyUser = useCallback(async (userId: string) => {
    setIsProcessing(true);
    try {
      // Update in Firebase
      await updateDocument(Collections.USERS, userId, {
        isVerified: true,
        verifiedAt: new Date().toISOString(),
        verificationRejected: false,
      });

      const user = users.find((u) => u.id === userId);
      if (user) {
        await logAction('user.verify', 'user', userId, {
          previousValue: { verificationStatus: user.verificationStatus },
          newValue: { verificationStatus: 'verified' },
          description: `${user.name} doğrulandı`,
        });
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                verificationStatus: 'verified' as VerificationStatus,
                verified: true,
                status: user.status === 'pending' ? ('active' as UserAccountStatus) : user.status,
              }
            : user
        )
      );
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [users, logAction]);

  const rejectUser = useCallback(async (userId: string, reason: string) => {
    setIsProcessing(true);
    try {
      // Update in Firebase
      await updateDocument(Collections.USERS, userId, {
        isVerified: false,
        verificationRejected: true,
        verificationRejectedAt: new Date().toISOString(),
        verificationRejectionReason: reason,
      });

      const user = users.find((u) => u.id === userId);
      if (user) {
        await logAction('user.reject', 'user', userId, {
          previousValue: { verificationStatus: user.verificationStatus },
          newValue: { verificationStatus: 'rejected' },
          description: `${user.name} reddedildi: ${reason}`,
        });
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                verificationStatus: 'rejected' as VerificationStatus,
                verified: false,
              }
            : user
        )
      );
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [users, logAction]);

  const deleteUser = useCallback(async (userId: string) => {
    setIsProcessing(true);
    try {
      // Delete from Firebase
      await deleteDocument(Collections.USERS, userId);

      const user = users.find((u) => u.id === userId);
      if (user) {
        await logAction('user.delete', 'user', userId, {
          description: `${user.name} silindi`,
        });
      }

      // Update local state
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [users, selectedUser, logAction]);

  const updateUserRole = useCallback(async (userId: string, isAdmin: boolean, adminRoleId?: string) => {
    setIsProcessing(true);
    try {
      // Update in Firebase
      await updateDocument(Collections.USERS, userId, {
        isAdmin,
        adminRoleId: adminRoleId || null,
      });

      const user = users.find((u) => u.id === userId);
      if (user) {
        await logAction('user.role_change', 'user', userId, {
          previousValue: { isAdmin: user.isAdmin, adminRoleId: user.adminRoleId },
          newValue: { isAdmin, adminRoleId },
          description: `${user.name} rol değişikliği`,
        });
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                isAdmin,
                adminRoleId,
              }
            : user
        )
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [users, logAction]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    users,
    filteredUsers,
    selectedUser,
    filters,
    setFilters,
    resetFilters,
    isLoading,
    isRefreshing,
    isProcessing,
    refresh,
    selectUser,
    suspendUser,
    unsuspendUser,
    verifyUser,
    rejectUser,
    deleteUser,
    updateUserRole,
    stats,
  };
}

export default useAdminUsers;
