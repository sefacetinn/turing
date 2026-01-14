import { useMemo } from 'react';
import { useRBAC } from '../context/RBACContext';
import type { PermissionResource, PermissionAction } from '../types/rbac';

export interface PermissionsResult {
  // Events
  canViewEvents: boolean;
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;

  // Offers
  canViewOffers: boolean;
  canCreateOffers: boolean;
  canEditOffers: boolean;
  canApproveOffers: boolean;

  // Contracts
  canViewContracts: boolean;
  canCreateContracts: boolean;
  canApproveContracts: boolean;

  // Payments
  canViewPayments: boolean;
  canCreatePayments: boolean;
  canApprovePayments: boolean;

  // Team
  canViewTeam: boolean;
  canManageTeam: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canChangeRoles: boolean;

  // Settings
  canViewSettings: boolean;
  canEditSettings: boolean;

  // Tasks
  canViewTasks: boolean;
  canCreateTasks: boolean;
  canEditTasks: boolean;

  // Role info
  isAdmin: boolean;
  isOwner: boolean;
  roleName: string;
  roleDescription: string;

  // Generic permission check
  checkPermission: (resource: PermissionResource, action: PermissionAction) => boolean;
}

export function usePermissions(): PermissionsResult {
  const { hasPermission, currentUser } = useRBAC();

  return useMemo(() => {
    const roleType = currentUser?.role?.type;

    return {
      // Events
      canViewEvents: hasPermission('events', 'view'),
      canCreateEvents: hasPermission('events', 'create'),
      canEditEvents: hasPermission('events', 'edit'),
      canDeleteEvents: hasPermission('events', 'delete'),

      // Offers
      canViewOffers: hasPermission('offers', 'view'),
      canCreateOffers: hasPermission('offers', 'create'),
      canEditOffers: hasPermission('offers', 'edit'),
      canApproveOffers: hasPermission('offers', 'approve'),

      // Contracts
      canViewContracts: hasPermission('contracts', 'view'),
      canCreateContracts: hasPermission('contracts', 'create'),
      canApproveContracts: hasPermission('contracts', 'approve'),

      // Payments
      canViewPayments: hasPermission('payments', 'view'),
      canCreatePayments: hasPermission('payments', 'create'),
      canApprovePayments: hasPermission('payments', 'approve'),

      // Team
      canViewTeam: hasPermission('team', 'view'),
      canManageTeam: hasPermission('team', 'create'),
      canInviteMembers: hasPermission('team', 'create'),
      canRemoveMembers: hasPermission('team', 'delete'),
      canChangeRoles: hasPermission('team', 'edit'),

      // Settings
      canViewSettings: hasPermission('settings', 'view'),
      canEditSettings: hasPermission('settings', 'edit'),

      // Tasks
      canViewTasks: hasPermission('tasks', 'view'),
      canCreateTasks: hasPermission('tasks', 'create'),
      canEditTasks: hasPermission('tasks', 'edit'),

      // Role info
      isAdmin: roleType === 'account_admin',
      isOwner: roleType === 'owner' || roleType === 'account_admin',
      roleName: currentUser?.role?.name || '',
      roleDescription: currentUser?.role?.description || '',

      // Generic permission check
      checkPermission: hasPermission,
    };
  }, [hasPermission, currentUser]);
}

export default usePermissions;
