import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { getRolesForOrganizationType, getRoleById } from '../config/roles';
import { useAuth } from './AuthContext';
import type {
  RBACContextValue,
  TeamMember,
  Organization,
  Role,
  PermissionResource,
  PermissionAction,
  Invitation,
} from '../types/rbac';

const RBACContext = createContext<RBACContextValue | null>(null);

interface RBACProviderProps {
  children: React.ReactNode;
  isProvider: boolean;
}

export function RBACProvider({ children, isProvider }: RBACProviderProps) {
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);

  // Get available roles for the organization type
  const orgType = isProvider ? 'provider' : 'organizer';
  const roles = getRolesForOrganizationType(orgType);
  const ownerRole = roles.find(r => r.id.includes('owner') || r.id.includes('admin')) || roles[0];

  // Create organization and user from Firebase auth data
  useEffect(() => {
    setIsLoading(true);

    if (user && userProfile) {
      // Create current user as team member with owner role
      const teamMember: TeamMember = {
        id: user.uid,
        odilerId: user.uid,
        email: user.email || '',
        name: userProfile.displayName || user.email?.split('@')[0] || 'Kullanıcı',
        avatar: userProfile.photoURL || undefined,
        phone: userProfile.phoneNumber || '',
        role: ownerRole,
        status: 'active',
        invitedBy: 'self',
        invitedAt: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };

      // Create organization from user profile
      const organization: Organization = {
        id: `org_${user.uid}`,
        name: userProfile.companyName || 'Şirketim',
        type: orgType,
        category: isProvider ? 'technical' : undefined,
        logo: userProfile.photoURL || '',
        ownerId: user.uid,
        members: [teamMember],
        pendingInvitations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCurrentUser(teamMember);
      setCurrentOrganization(organization);
    } else {
      // Not logged in - set empty state
      setCurrentUser(null);
      setCurrentOrganization(null);
    }

    setIsLoading(false);
  }, [user, userProfile, isProvider, ownerRole]);

  // Get available roles based on organization type
  const availableRoles = useMemo(() => {
    if (!currentOrganization) return [];
    return getRolesForOrganizationType(
      currentOrganization.type,
      currentOrganization.category
    );
  }, [currentOrganization]);

  // Check if current user has a specific permission
  const hasPermission = useCallback(
    (resource: PermissionResource, action: PermissionAction): boolean => {
      if (!currentUser?.role?.permissions) return false;

      const resourcePermission = currentUser.role.permissions.find(
        (p) => p.resource === resource
      );

      if (!resourcePermission) return false;
      return resourcePermission.actions.includes(action);
    },
    [currentUser]
  );

  // Quick permission checks
  const canManageTeam = useCallback(() => {
    return hasPermission('team', 'create');
  }, [hasPermission]);

  const canManageFinance = useCallback(() => {
    return hasPermission('payments', 'approve');
  }, [hasPermission]);

  const canManageEvents = useCallback(() => {
    return hasPermission('events', 'create');
  }, [hasPermission]);

  const canApproveOffers = useCallback(() => {
    return hasPermission('offers', 'approve');
  }, [hasPermission]);

  // Invite a new member
  const inviteMember = useCallback(
    async (email: string, roleId: string, name?: string, message?: string) => {
      if (!currentOrganization || !currentUser) return;

      const role = getRoleById(roleId);
      if (!role) throw new Error('Geçersiz rol');

      const newInvitation: Invitation = {
        id: `inv_${Date.now()}`,
        email,
        name,
        role,
        invitedBy: currentUser.id,
        inviterName: currentUser.name,
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        token: Math.random().toString(36).substring(2, 15),
        message,
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCurrentOrganization((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          pendingInvitations: [...prev.pendingInvitations, newInvitation],
        };
      });
    },
    [currentOrganization, currentUser]
  );

  // Update member's role
  const updateMemberRole = useCallback(
    async (memberId: string, roleId: string) => {
      if (!currentOrganization) return;

      const role = getRoleById(roleId);
      if (!role) throw new Error('Geçersiz rol');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCurrentOrganization((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.map((member) =>
            member.id === memberId ? { ...member, role } : member
          ),
        };
      });

      // Update current user if they changed their own role
      if (currentUser?.id === memberId) {
        setCurrentUser((prev) => (prev ? { ...prev, role } : prev));
      }
    },
    [currentOrganization, currentUser]
  );

  // Remove a member
  const removeMember = useCallback(
    async (memberId: string) => {
      if (!currentOrganization) return;

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCurrentOrganization((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.filter((member) => member.id !== memberId),
        };
      });
    },
    [currentOrganization]
  );

  // Cancel an invitation
  const cancelInvitation = useCallback(
    async (invitationId: string) => {
      if (!currentOrganization) return;

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCurrentOrganization((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          pendingInvitations: prev.pendingInvitations.filter(
            (inv) => inv.id !== invitationId
          ),
        };
      });
    },
    [currentOrganization]
  );

  // Resend an invitation
  const resendInvitation = useCallback(
    async (invitationId: string) => {
      if (!currentOrganization) return;

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCurrentOrganization((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          pendingInvitations: prev.pendingInvitations.map((inv) =>
            inv.id === invitationId
              ? {
                  ...inv,
                  invitedAt: new Date().toISOString(),
                  expiresAt: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                  ).toISOString(),
                }
              : inv
          ),
        };
      });
    },
    [currentOrganization]
  );

  // Refresh organization data
  const refreshOrganization = useCallback(async () => {
    setIsLoading(true);
    // TODO: Fetch from Firebase Firestore
    await new Promise((resolve) => setTimeout(resolve, 300));
    // For now, just refresh based on current state
    // In production, this would fetch from Firestore
    setIsLoading(false);
  }, []);

  const contextValue: RBACContextValue = {
    currentUser,
    currentOrganization,
    isLoading,
    hasPermission,
    canManageTeam,
    canManageFinance,
    canManageEvents,
    canApproveOffers,
    inviteMember,
    updateMemberRole,
    removeMember,
    cancelInvitation,
    resendInvitation,
    availableRoles,
    refreshOrganization,
  };

  return (
    <RBACContext.Provider value={contextValue}>{children}</RBACContext.Provider>
  );
}

export function useRBAC(): RBACContextValue {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within a RBACProvider');
  }
  return context;
}

export default RBACContext;
