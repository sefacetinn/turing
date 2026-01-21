import { useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { AdminPermissionResource, AdminPermissionAction } from '../types/admin';

export interface AdminPermissionsResult {
  // Users
  canViewUsers: boolean;
  canEditUsers: boolean;
  canApproveUsers: boolean;
  canDeleteUsers: boolean;
  canExportUsers: boolean;

  // Events
  canViewEvents: boolean;
  canEditEvents: boolean;
  canApproveEvents: boolean;
  canDeleteEvents: boolean;
  canExportEvents: boolean;

  // Finance
  canViewFinance: boolean;
  canEditFinance: boolean;
  canApproveFinance: boolean;
  canExportFinance: boolean;

  // Reports
  canViewReports: boolean;
  canExportReports: boolean;

  // Roles
  canViewRoles: boolean;
  canCreateRoles: boolean;
  canEditRoles: boolean;
  canDeleteRoles: boolean;

  // Settings
  canViewSettings: boolean;
  canEditSettings: boolean;

  // Audit Logs
  canViewAuditLogs: boolean;
  canExportAuditLogs: boolean;

  // Role info
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  isFinanceAdmin: boolean;
  isSupport: boolean;
  adminRoleName: string;
  adminRoleDescription: string;

  // Generic permission check
  checkAdminPermission: (resource: AdminPermissionResource, action: AdminPermissionAction) => boolean;
}

export function useAdminPermissions(): AdminPermissionsResult {
  const { hasAdminPermission, currentAdmin, adminRole } = useAdmin();

  return useMemo(() => {
    const roleType = adminRole?.type;

    return {
      // Users
      canViewUsers: hasAdminPermission('users', 'view'),
      canEditUsers: hasAdminPermission('users', 'edit'),
      canApproveUsers: hasAdminPermission('users', 'approve'),
      canDeleteUsers: hasAdminPermission('users', 'delete'),
      canExportUsers: hasAdminPermission('users', 'export'),

      // Events
      canViewEvents: hasAdminPermission('events', 'view'),
      canEditEvents: hasAdminPermission('events', 'edit'),
      canApproveEvents: hasAdminPermission('events', 'approve'),
      canDeleteEvents: hasAdminPermission('events', 'delete'),
      canExportEvents: hasAdminPermission('events', 'export'),

      // Finance
      canViewFinance: hasAdminPermission('finance', 'view'),
      canEditFinance: hasAdminPermission('finance', 'edit'),
      canApproveFinance: hasAdminPermission('finance', 'approve'),
      canExportFinance: hasAdminPermission('finance', 'export'),

      // Reports
      canViewReports: hasAdminPermission('reports', 'view'),
      canExportReports: hasAdminPermission('reports', 'export'),

      // Roles
      canViewRoles: hasAdminPermission('roles', 'view'),
      canCreateRoles: hasAdminPermission('roles', 'create'),
      canEditRoles: hasAdminPermission('roles', 'edit'),
      canDeleteRoles: hasAdminPermission('roles', 'delete'),

      // Settings
      canViewSettings: hasAdminPermission('settings', 'view'),
      canEditSettings: hasAdminPermission('settings', 'edit'),

      // Audit Logs
      canViewAuditLogs: hasAdminPermission('audit_logs', 'view'),
      canExportAuditLogs: hasAdminPermission('audit_logs', 'export'),

      // Role info
      isAdmin: Boolean(currentAdmin?.isAdmin),
      isSuperAdmin: roleType === 'super_admin',
      isModerator: roleType === 'moderator',
      isFinanceAdmin: roleType === 'finance',
      isSupport: roleType === 'support',
      adminRoleName: adminRole?.name || '',
      adminRoleDescription: adminRole?.description || '',

      // Generic permission check
      checkAdminPermission: hasAdminPermission,
    };
  }, [hasAdminPermission, currentAdmin, adminRole]);
}

export default useAdminPermissions;
