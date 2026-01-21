/**
 * Company Hooks
 *
 * React hooks for company management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase/config';
import {
  createCompany,
  getCompanyById,
  getCompanyWithMembers,
  getUserCompanies,
  getUserPrimaryCompany,
  updateCompany,
  deleteCompany,
  setUserPrimaryCompany,
  getCompanyMember,
  getUserRoleInCompany,
  updateMemberRole,
  removeMemberFromCompany,
  createInvitation,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
  resendInvitation,
  getUserPendingInvitations,
  migrateUserToCompany,
  getUserCompanyInfoForDisplay,
} from '../services/firebase/companyService';
import type {
  CompanyDocument,
  CompanyWithMembers,
  CompanyMemberDocument,
  CompanyInvitation,
  CreateCompanyParams,
  UpdateCompanyParams,
  InviteMemberParams,
  CompanyPermission,
} from '../types/company';
import { hasCompanyPermission } from '../types/company';

// Helper to convert Firestore timestamp to Date
const toDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
};

/**
 * Hook to fetch and manage user's companies
 */
export function useUserCompanies(userId: string | undefined) {
  const [companies, setCompanies] = useState<CompanyDocument[]>([]);
  const [primaryCompany, setPrimaryCompany] = useState<CompanyDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch companies
  useEffect(() => {
    if (!userId) {
      setCompanies([]);
      setPrimaryCompany(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listen to user document for companyIds changes
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      async (userDoc) => {
        try {
          const userData = userDoc.data();
          const companyIds = userData?.companyIds || [];
          const primaryCompanyId = userData?.primaryCompanyId;

          if (companyIds.length === 0) {
            setCompanies([]);
            setPrimaryCompany(null);
            setLoading(false);
            return;
          }

          // Fetch all companies
          const companiesData = await getUserCompanies(userId);
          setCompanies(companiesData);

          // Set primary company
          if (primaryCompanyId) {
            const primary = companiesData.find(c => c.id === primaryCompanyId);
            setPrimaryCompany(primary || null);
          } else if (companiesData.length > 0) {
            setPrimaryCompany(companiesData[0]);
          }

          setLoading(false);
          setError(null);
        } catch (err: any) {
          console.warn('Error fetching companies:', err?.message || err);
          setError('Firmalar yüklenirken hata oluştu');
          setLoading(false);
        }
      },
      (err) => {
        console.warn('Error listening to user:', err?.message || err);
        setError('Firmalar yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Create new company
  const create = useCallback(async (
    ownerName: string,
    ownerEmail: string,
    params: CreateCompanyParams
  ) => {
    if (!userId) throw new Error('Kullanıcı girişi gerekli');
    return createCompany(userId, ownerName, ownerEmail, params);
  }, [userId]);

  // Switch primary company
  const switchPrimaryCompany = useCallback(async (companyId: string) => {
    if (!userId) return;
    await setUserPrimaryCompany(userId, companyId);
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setPrimaryCompany(company);
    }
  }, [userId, companies]);

  return {
    companies,
    primaryCompany,
    loading,
    error,
    create,
    switchPrimaryCompany,
  };
}

/**
 * Hook to fetch a single company with members
 */
export function useCompany(companyId: string | undefined) {
  const [company, setCompany] = useState<CompanyWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setCompany(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listen to company document
    const unsubscribe = onSnapshot(
      doc(db, 'companies', companyId),
      async (companyDoc) => {
        try {
          if (!companyDoc.exists()) {
            setCompany(null);
            setLoading(false);
            return;
          }

          // Fetch full company with members
          const companyData = await getCompanyWithMembers(companyId);
          setCompany(companyData);
          setLoading(false);
          setError(null);
        } catch (err: any) {
          console.warn('Error fetching company:', err?.message || err);
          setError('Firma bilgileri yüklenirken hata oluştu');
          setLoading(false);
        }
      },
      (err) => {
        console.warn('Error listening to company:', err?.message || err);
        setError('Firma bilgileri yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId]);

  // Update company
  const update = useCallback(async (params: UpdateCompanyParams) => {
    if (!companyId) throw new Error('Firma ID gerekli');
    await updateCompany(companyId, params);
  }, [companyId]);

  // Delete company
  const remove = useCallback(async () => {
    if (!companyId) throw new Error('Firma ID gerekli');
    await deleteCompany(companyId);
  }, [companyId]);

  // Refresh company data
  const refresh = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const companyData = await getCompanyWithMembers(companyId);
      setCompany(companyData);
      setError(null);
    } catch (err: any) {
      setError('Firma bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return {
    company,
    loading,
    error,
    update,
    remove,
    refresh,
  };
}

/**
 * Hook for user's role and permissions in a company
 */
export function useCompanyMembership(companyId: string | undefined, userId: string | undefined) {
  const [member, setMember] = useState<CompanyMemberDocument | null>(null);
  const [permissions, setPermissions] = useState<CompanyPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId || !userId) {
      setMember(null);
      setPermissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listen to member document
    const q = query(
      collection(db, 'company_members'),
      where('companyId', '==', companyId),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setMember(null);
          setPermissions([]);
          setLoading(false);
          return;
        }

        const memberData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        } as CompanyMemberDocument;

        setMember(memberData);
        setPermissions(memberData.permissions || []);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error listening to membership:', err?.message || err);
        setError('Üyelik bilgileri yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId, userId]);

  // Check permission
  const hasPermission = useCallback((permission: CompanyPermission): boolean => {
    return hasCompanyPermission(permissions, permission);
  }, [permissions]);

  // Quick permission checks
  const canManageTeam = useCallback(() => hasPermission('manage_team'), [hasPermission]);
  const canManageFinance = useCallback(() => hasPermission('manage_finance'), [hasPermission]);
  const canManageEvents = useCallback(() => hasPermission('create_events'), [hasPermission]);
  const canSendOffers = useCallback(() => hasPermission('send_offers'), [hasPermission]);
  const canAcceptOffers = useCallback(() => hasPermission('accept_offers'), [hasPermission]);
  const canSignContracts = useCallback(() => hasPermission('sign_contracts'), [hasPermission]);
  const canInviteMembers = useCallback(() => hasPermission('invite_members'), [hasPermission]);
  const canRemoveMembers = useCallback(() => hasPermission('remove_members'), [hasPermission]);
  const canManageCompany = useCallback(() => hasPermission('manage_company'), [hasPermission]);
  const canDeleteCompany = useCallback(() => hasPermission('delete_company'), [hasPermission]);

  return {
    member,
    permissions,
    loading,
    error,
    hasPermission,
    canManageTeam,
    canManageFinance,
    canManageEvents,
    canSendOffers,
    canAcceptOffers,
    canSignContracts,
    canInviteMembers,
    canRemoveMembers,
    canManageCompany,
    canDeleteCompany,
    isOwner: member?.roleId === 'owner',
    isManager: member?.roleId === 'manager',
    roleName: member?.roleName,
  };
}

/**
 * Hook for company team management
 */
export function useCompanyTeam(companyId: string | undefined) {
  const { company, loading, error, refresh } = useCompany(companyId);

  // Update member role
  const updateRole = useCallback(async (memberId: string, roleId: string) => {
    await updateMemberRole(memberId, roleId);
    await refresh();
  }, [refresh]);

  // Remove member
  const removeMember = useCallback(async (memberId: string, userId: string) => {
    if (!companyId) throw new Error('Firma ID gerekli');
    await removeMemberFromCompany(memberId, companyId, userId);
    await refresh();
  }, [companyId, refresh]);

  // Invite member
  const inviteMember = useCallback(async (
    params: Omit<InviteMemberParams, 'companyId'>,
    inviterId: string,
    inviterName: string
  ) => {
    if (!companyId || !company) throw new Error('Firma bilgisi gerekli');
    return createInvitation(
      { ...params, companyId },
      inviterId,
      inviterName,
      company.name
    );
  }, [companyId, company]);

  // Cancel invitation
  const cancelInv = useCallback(async (invitationId: string) => {
    await cancelInvitation(invitationId);
    await refresh();
  }, [refresh]);

  // Resend invitation
  const resendInv = useCallback(async (invitationId: string) => {
    await resendInvitation(invitationId);
    await refresh();
  }, [refresh]);

  return {
    members: company?.members || [],
    pendingInvitations: company?.pendingInvitations || [],
    loading,
    error,
    updateRole,
    removeMember,
    inviteMember,
    cancelInvitation: cancelInv,
    resendInvitation: resendInv,
    refresh,
  };
}

/**
 * Hook for pending invitations for current user
 */
export function useMyInvitations(email?: string, phone?: string) {
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch invitations
  const fetchInvitations = useCallback(async () => {
    if (!email && !phone) {
      setInvitations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const invs = await getUserPendingInvitations(email, phone);
      setInvitations(invs);
      setError(null);
    } catch (err: any) {
      console.warn('Error fetching invitations:', err?.message || err);
      setError('Davetler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [email, phone]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Accept invitation
  const accept = useCallback(async (invitationId: string, userId: string) => {
    await acceptInvitation(invitationId, userId);
    await fetchInvitations();
  }, [fetchInvitations]);

  // Reject invitation
  const reject = useCallback(async (invitationId: string) => {
    await rejectInvitation(invitationId);
    await fetchInvitations();
  }, [fetchInvitations]);

  return {
    invitations,
    loading,
    error,
    accept,
    reject,
    refresh: fetchInvitations,
  };
}

/**
 * Hook to get user's company info for display in offers/chat
 */
export function useUserCompanyDisplay(userId: string | undefined) {
  const [displayInfo, setDisplayInfo] = useState<{
    companyId?: string;
    companyName?: string;
    companyLogo?: string;
    userName: string;
    userRole?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setDisplayInfo(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    getUserCompanyInfoForDisplay(userId)
      .then((info) => {
        setDisplayInfo(info);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Error fetching user company display:', err);
        setDisplayInfo(null);
        setLoading(false);
      });
  }, [userId]);

  return { displayInfo, loading };
}

/**
 * Hook to migrate user to company structure if needed
 */
export function useCompanyMigration(userId: string | undefined) {
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const migrate = useCallback(async () => {
    if (!userId) return null;

    setMigrating(true);
    try {
      const newCompanyId = await migrateUserToCompany(userId);
      setCompanyId(newCompanyId);
      setMigrated(true);
      setError(null);
      return newCompanyId;
    } catch (err: any) {
      console.warn('Error migrating user:', err?.message || err);
      setError('Firma oluşturulurken hata oluştu');
      return null;
    } finally {
      setMigrating(false);
    }
  }, [userId]);

  return {
    migrate,
    migrating,
    migrated,
    companyId,
    error,
  };
}

// Export all hooks
export default {
  useUserCompanies,
  useCompany,
  useCompanyMembership,
  useCompanyTeam,
  useMyInvitations,
  useUserCompanyDisplay,
  useCompanyMigration,
};
