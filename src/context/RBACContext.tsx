import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { getRolesForOrganizationType, getRoleById } from '../config/roles';
import {
  getMockOrganization,
  getMockCurrentUser,
} from '../data/mockTeamData';
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
  const [isLoading, setIsLoading] = useState(true);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);

  // Load organization and user data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const org = getMockOrganization(isProvider);
      const user = getMockCurrentUser(isProvider);
      setCurrentOrganization(org);
      setCurrentUser(user);
      setIsLoading(false);
    }, 300);
  }, [isProvider]);

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    const org = getMockOrganization(isProvider);
    setCurrentOrganization(org);
    setIsLoading(false);
  }, [isProvider]);

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
