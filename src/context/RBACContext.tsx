import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { getRolesForOrganizationType, getRoleById } from '../config/roles';
import { useAuth } from './AuthContext';
import {
  useUserCompanies,
  useCompany,
  useCompanyMembership,
  useCompanyTeam,
} from '../hooks/useCompany';
import {
  createInvitation,
  updateMemberRole as updateMemberRoleService,
  removeMemberFromCompany,
  cancelInvitation as cancelInvitationService,
  resendInvitation as resendInvitationService,
  migrateUserToCompany,
} from '../services/firebase/companyService';
import { DEFAULT_COMPANY_ROLES, getCompanyRoleById } from '../types/company';
import type {
  RBACContextValue,
  TeamMember,
  Organization,
  Role,
  PermissionResource,
  PermissionAction,
  Invitation,
  MemberStatus,
  InvitationStatus,
} from '../types/rbac';

const RBACContext = createContext<RBACContextValue | null>(null);

interface RBACProviderProps {
  children: React.ReactNode;
  isProvider: boolean;
}

// Map company role to RBAC role format
function mapCompanyRoleToRBACRole(companyRoleId: string, companyRoleName: string, orgType: 'organizer' | 'provider'): Role {
  // Get RBAC roles for this organization type
  const rbacRoles = getRolesForOrganizationType(orgType);

  // Try to find matching RBAC role by ID or name
  let rbacRole = rbacRoles.find(r =>
    r.id.includes(companyRoleId) ||
    r.name.toLowerCase() === companyRoleName.toLowerCase()
  );

  if (!rbacRole) {
    // Map common company roles to RBAC roles
    const roleMapping: Record<string, string> = {
      'owner': orgType === 'provider' ? 'provider-owner' : 'organizer-owner',
      'manager': orgType === 'provider' ? 'provider-admin' : 'organizer-admin',
      'team_member': orgType === 'provider' ? 'provider-technician' : 'organizer-coordinator',
      'accountant': orgType === 'provider' ? 'provider-accountant' : 'organizer-coordinator',
    };

    const mappedRoleId = roleMapping[companyRoleId];
    if (mappedRoleId) {
      rbacRole = getRoleById(mappedRoleId);
    }
  }

  // Fallback to first available role
  return rbacRole || rbacRoles[0];
}

export function RBACProvider({ children, isProvider }: RBACProviderProps) {
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [needsMigration, setNeedsMigration] = useState(false);

  // Get available roles for the organization type
  const orgType = isProvider ? 'provider' : 'organizer';
  const roles = getRolesForOrganizationType(orgType);
  const ownerRole = roles.find(r => r.id.includes('owner') || r.id.includes('admin')) || roles[0];

  // Company hooks
  const { companies, primaryCompany, loading: companiesLoading } = useUserCompanies(user?.uid);
  const { company: companyWithMembers, loading: companyLoading, refresh: refreshCompany } = useCompany(primaryCompany?.id);
  const { member: currentMember, permissions: companyPermissions, loading: memberLoading } = useCompanyMembership(primaryCompany?.id, user?.uid);
  const { members, pendingInvitations, inviteMember: inviteMemberToCompany, updateRole, removeMember: removeMemberFromTeam, cancelInvitation: cancelInv, resendInvitation: resendInv, refresh: refreshTeam } = useCompanyTeam(primaryCompany?.id);

  // Check if user needs migration (has no company)
  useEffect(() => {
    if (!companiesLoading && user && companies.length === 0 && userProfile) {
      setNeedsMigration(true);
    } else {
      setNeedsMigration(false);
    }
  }, [companiesLoading, user, companies, userProfile]);

  // Auto-migrate user if needed
  useEffect(() => {
    const migrate = async () => {
      if (needsMigration && user?.uid) {
        try {
          await migrateUserToCompany(user.uid);
          // Refresh will happen automatically through company hooks
        } catch (error) {
          console.warn('Error migrating user to company:', error);
        }
      }
    };

    migrate();
  }, [needsMigration, user?.uid]);

  // Create organization and user from Firebase data
  useEffect(() => {
    const loading = companiesLoading || companyLoading || memberLoading;
    setIsLoading(loading);

    if (loading) return;

    if (user && userProfile && companyWithMembers) {
      // Map company members to TeamMember format
      const teamMembers: TeamMember[] = companyWithMembers.members.map(member => {
        const rbacRole = mapCompanyRoleToRBACRole(member.roleId, member.roleName, orgType);
        return {
          id: member.id,
          odilerId: member.userId, // Use userId as odilerId
          email: member.userEmail || '',
          name: member.userName || 'Kullanıcı',
          avatar: member.userImage || undefined,
          phone: member.userPhone || '',
          role: rbacRole,
          status: member.status as MemberStatus,
          invitedBy: member.invitedBy,
          invitedAt: member.invitedAt instanceof Date ? member.invitedAt.toISOString() : String(member.invitedAt),
          joinedAt: member.joinedAt ? (member.joinedAt instanceof Date ? member.joinedAt.toISOString() : String(member.joinedAt)) : undefined,
          lastActiveAt: new Date().toISOString(),
        };
      });

      // Map pending invitations
      // Map company invitation status to RBAC invitation status
      const mapInvitationStatus = (status: string): InvitationStatus => {
        if (status === 'rejected') return 'cancelled';
        if (status === 'pending' || status === 'accepted' || status === 'expired' || status === 'cancelled') {
          return status as InvitationStatus;
        }
        return 'pending';
      };

      const invitations: Invitation[] = companyWithMembers.pendingInvitations.map(inv => {
        const rbacRole = mapCompanyRoleToRBACRole(inv.roleId, inv.roleName, orgType);
        return {
          id: inv.id,
          email: inv.email || '',
          name: undefined,
          role: rbacRole,
          invitedBy: inv.invitedBy,
          inviterName: inv.inviterName,
          invitedAt: inv.createdAt instanceof Date ? inv.createdAt.toISOString() : String(inv.createdAt),
          expiresAt: inv.expiresAt instanceof Date ? inv.expiresAt.toISOString() : String(inv.expiresAt),
          status: mapInvitationStatus(inv.status),
          token: inv.token,
          message: inv.message,
        };
      });

      // Create organization object
      const organization: Organization = {
        id: companyWithMembers.id,
        name: companyWithMembers.name,
        type: companyWithMembers.type === 'provider' ? 'provider' : 'organizer',
        category: companyWithMembers.serviceCategories?.[0] as any,
        logo: companyWithMembers.logo || '',
        ownerId: companyWithMembers.ownerId,
        members: teamMembers,
        pendingInvitations: invitations,
        createdAt: companyWithMembers.createdAt instanceof Date ? companyWithMembers.createdAt.toISOString() : String(companyWithMembers.createdAt),
        updatedAt: companyWithMembers.updatedAt instanceof Date ? companyWithMembers.updatedAt.toISOString() : String(companyWithMembers.updatedAt),
      };

      // Find current user in team members
      const currentTeamMember = teamMembers.find(m => m.odilerId === user.uid);

      if (currentTeamMember) {
        setCurrentUser(currentTeamMember);
      } else {
        // Fallback: create from user profile
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
        setCurrentUser(teamMember);
      }

      setCurrentOrganization(organization);
    } else if (user && userProfile && !companyWithMembers) {
      // User has no company yet - create temporary organization from profile
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

      const organization: Organization = {
        id: `temp_org_${user.uid}`,
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
  }, [user, userProfile, companyWithMembers, companiesLoading, companyLoading, memberLoading, isProvider, ownerRole, orgType]);

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

  // Invite a new member (Firebase)
  const inviteMember = useCallback(
    async (email: string, roleId: string, name?: string, message?: string) => {
      if (!primaryCompany || !currentUser || !user) return;

      // Map RBAC role ID to company role ID
      const companyRoleId = roleId.includes('owner') ? 'owner' :
        roleId.includes('admin') ? 'manager' :
        roleId.includes('accountant') ? 'accountant' : 'team_member';

      try {
        await inviteMemberToCompany(
          { email, roleId: companyRoleId, message },
          user.uid,
          currentUser.name
        );
        await refreshTeam();
      } catch (error) {
        console.error('Error inviting member:', error);
        throw error;
      }
    },
    [primaryCompany, currentUser, user, inviteMemberToCompany, refreshTeam]
  );

  // Update member's role (Firebase)
  const updateMemberRole = useCallback(
    async (memberId: string, roleId: string) => {
      if (!currentOrganization) return;

      // Map RBAC role ID to company role ID
      const companyRoleId = roleId.includes('owner') ? 'owner' :
        roleId.includes('admin') ? 'manager' :
        roleId.includes('accountant') ? 'accountant' : 'team_member';

      try {
        await updateRole(memberId, companyRoleId);
        await refreshTeam();
      } catch (error) {
        console.error('Error updating role:', error);
        throw error;
      }
    },
    [currentOrganization, updateRole, refreshTeam]
  );

  // Remove a member (Firebase)
  const removeMember = useCallback(
    async (memberId: string) => {
      if (!currentOrganization || !primaryCompany) return;

      // Find the member to get their userId
      const member = companyWithMembers?.members.find(m => m.id === memberId);
      if (!member) return;

      try {
        await removeMemberFromTeam(memberId, member.userId);
        await refreshTeam();
      } catch (error) {
        console.error('Error removing member:', error);
        throw error;
      }
    },
    [currentOrganization, primaryCompany, companyWithMembers, removeMemberFromTeam, refreshTeam]
  );

  // Cancel an invitation (Firebase)
  const cancelInvitation = useCallback(
    async (invitationId: string) => {
      if (!currentOrganization) return;

      try {
        await cancelInv(invitationId);
        await refreshTeam();
      } catch (error) {
        console.error('Error cancelling invitation:', error);
        throw error;
      }
    },
    [currentOrganization, cancelInv, refreshTeam]
  );

  // Resend an invitation (Firebase)
  const resendInvitation = useCallback(
    async (invitationId: string) => {
      if (!currentOrganization) return;

      try {
        await resendInv(invitationId);
        await refreshTeam();
      } catch (error) {
        console.error('Error resending invitation:', error);
        throw error;
      }
    },
    [currentOrganization, resendInv, refreshTeam]
  );

  // Refresh organization data (Firebase)
  const refreshOrganization = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshCompany();
      await refreshTeam();
    } catch (error) {
      console.error('Error refreshing organization:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshCompany, refreshTeam]);

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
