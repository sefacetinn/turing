import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getAdminRoleById, checkAdminPermission, systemAdminRoles } from '../config/adminRoles';
import {
  getDocuments,
  Collections,
} from '../services/firebase';
import type {
  AdminContextValue,
  AdminUser,
  AdminRole,
  AdminPermissionResource,
  AdminPermissionAction,
  AdminDashboardStats,
  AuditAction,
  AuditLog,
} from '../types/admin';

// Extended UserProfile type to include admin fields
// In production, these would come from Firestore user document
interface ExtendedUserProfile {
  isAdmin?: boolean;
  adminRoleId?: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  companyName?: string;
  location?: string;
  createdAt?: string;
}

const AdminContext = createContext<AdminContextValue | null>(null);

interface AdminProviderProps {
  children: React.ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);

  // Fetch real dashboard stats from Firebase
  const fetchDashboardStats = useCallback(async () => {
    try {
      // Fetch users
      const users = await getDocuments<any>(Collections.USERS, []);
      const totalUsers = users.length;
      const activeUsers = users.filter((u: any) => !u.isSuspended).length;
      const pendingVerifications = users.filter((u: any) => !u.isVerified && !u.verificationRejected).length;
      const suspendedUsers = users.filter((u: any) => u.isSuspended).length;

      // Calculate new users
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const newUsersToday = users.filter((u: any) => {
        const createdAt = u.createdAt?.toDate?.() || new Date(u.createdAt);
        return createdAt >= todayStart;
      }).length;

      const newUsersThisWeek = users.filter((u: any) => {
        const createdAt = u.createdAt?.toDate?.() || new Date(u.createdAt);
        return createdAt >= weekAgo;
      }).length;

      // Fetch events
      const events = await getDocuments<any>(Collections.EVENTS, []);
      const totalEvents = events.length;
      const activeEvents = events.filter((e: any) =>
        e.status === 'confirmed' || e.status === 'planning'
      ).length;
      const pendingApproval = events.filter((e: any) =>
        e.approvalStatus === 'pending' || (!e.approvalStatus && !e.isApproved && !e.isRejected)
      ).length;
      const flaggedEvents = events.filter((e: any) => e.isFlagged).length;

      // Calculate revenue from events (sum of budgets for approved events)
      const approvedEvents = events.filter((e: any) =>
        e.approvalStatus === 'approved' || e.isApproved
      );
      const totalRevenue = approvedEvents.reduce((sum: number, e: any) => sum + (e.budget || 0), 0);

      // Calculate monthly revenue (this month's approved events)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyEvents = approvedEvents.filter((e: any) => {
        const eventDate = e.date ? new Date(e.date) : (e.createdAt?.toDate?.() || new Date(e.createdAt));
        return eventDate >= monthStart;
      });
      const monthlyRevenue = monthlyEvents.reduce((sum: number, e: any) => sum + (e.budget || 0), 0);

      // For payouts and tickets, we'll use placeholder values since we don't have those collections yet
      // In a real app, you'd fetch from payouts and support_tickets collections
      const pendingPayouts = 0;
      const pendingPayoutAmount = 0;
      const openTickets = 0;
      const resolvedToday = 0;

      setDashboardStats({
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        activeUsers,
        pendingVerifications,
        suspendedUsers,
        totalEvents,
        activeEvents,
        pendingApproval,
        flaggedEvents,
        totalRevenue,
        monthlyRevenue,
        pendingPayouts,
        pendingPayoutAmount,
        openTickets,
        resolvedToday,
      });
    } catch (error) {
      // Firebase permission error - show demo data for testing
      console.log('Using demo data for admin dashboard (Firebase permission required for real data)');
      setDashboardStats({
        totalUsers: 0,
        newUsersToday: 0,
        newUsersThisWeek: 0,
        activeUsers: 0,
        pendingVerifications: 0,
        suspendedUsers: 0,
        totalEvents: 0,
        activeEvents: 0,
        pendingApproval: 0,
        flaggedEvents: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayouts: 0,
        pendingPayoutAmount: 0,
        openTickets: 0,
        resolvedToday: 0,
      });
    }
  }, []);

  // Initialize admin user from auth context
  useEffect(() => {
    setIsLoading(true);

    if (user && userProfile) {
      // Cast to extended type to access admin-specific fields
      // In production, these would be actual fields in Firestore
      const extendedProfile = userProfile as unknown as ExtendedUserProfile;

      // Check if user is admin (in production, this would come from Firestore)
      // For now, we'll allow access to admin panel for testing
      const isAdmin = extendedProfile.isAdmin || true; // Allow admin access for testing
      const adminRoleId = extendedProfile.adminRoleId || 'super_admin';

      if (isAdmin) {
        const role = getAdminRoleById(adminRoleId) || systemAdminRoles.find(r => r.id === 'super_admin');

        // Map role type - 'dual' in firebase UserProfile maps to 'both' in AdminUser
        const userRole = userProfile.role === 'dual' ? 'both' : userProfile.role;

        const adminUser: AdminUser = {
          id: user.uid,
          name: userProfile.displayName || user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          phone: userProfile.phone || userProfile.phoneNumber || undefined,
          avatar: userProfile.photoURL || undefined,
          role: userRole || 'organizer',
          company: userProfile.companyName,
          location: userProfile.city,
          status: 'active',
          verificationStatus: 'verified',
          verified: true,
          isAdmin: true,
          adminRoleId: adminRoleId,
          adminRole: role || undefined,
          memberSince: userProfile.createdAt instanceof Date ? userProfile.createdAt.toISOString() : new Date().toISOString(),
          createdAt: userProfile.createdAt instanceof Date ? userProfile.createdAt.toISOString() : new Date().toISOString(),
        };

        setCurrentAdmin(adminUser);
        setAdminRole(role || null);

        // Fetch real dashboard stats
        fetchDashboardStats();
      } else {
        setCurrentAdmin(null);
        setAdminRole(null);
        setDashboardStats(null);
      }
    } else {
      // No user logged in - still allow admin panel access for testing
      // Create a temporary admin user for testing
      const tempRole = systemAdminRoles.find(r => r.id === 'super_admin');

      const tempAdminUser: AdminUser = {
        id: 'temp_admin',
        name: 'Admin',
        email: 'admin@test.com',
        role: 'organizer',
        status: 'active',
        verificationStatus: 'verified',
        verified: true,
        isAdmin: true,
        adminRoleId: 'super_admin',
        adminRole: tempRole || undefined,
        memberSince: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      setCurrentAdmin(tempAdminUser);
      setAdminRole(tempRole || null);

      // Fetch real dashboard stats
      fetchDashboardStats();
    }

    setIsLoading(false);
  }, [user, userProfile, fetchDashboardStats]);

  // Check if admin has a specific permission
  const hasAdminPermission = useCallback(
    (resource: AdminPermissionResource, action: AdminPermissionAction): boolean => {
      return checkAdminPermission(adminRole, resource, action);
    },
    [adminRole]
  );

  // Quick permission checks
  const canManageUsers = useCallback(() => {
    return hasAdminPermission('users', 'edit') || hasAdminPermission('users', 'approve');
  }, [hasAdminPermission]);

  const canModerateEvents = useCallback(() => {
    return hasAdminPermission('events', 'approve') || hasAdminPermission('events', 'edit');
  }, [hasAdminPermission]);

  const canManageFinance = useCallback(() => {
    return hasAdminPermission('finance', 'approve') || hasAdminPermission('finance', 'edit');
  }, [hasAdminPermission]);

  const canManageRoles = useCallback(() => {
    return hasAdminPermission('roles', 'edit') || hasAdminPermission('roles', 'create');
  }, [hasAdminPermission]);

  const canViewReports = useCallback(() => {
    return hasAdminPermission('reports', 'view');
  }, [hasAdminPermission]);

  const canViewAuditLogs = useCallback(() => {
    return hasAdminPermission('audit_logs', 'view');
  }, [hasAdminPermission]);

  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchDashboardStats();
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchDashboardStats]);

  // Log admin action for audit trail
  const logAction = useCallback(
    async (
      action: AuditAction,
      targetType: 'user' | 'event' | 'payout' | 'role' | 'settings',
      targetId: string,
      details?: {
        previousValue?: Record<string, unknown>;
        newValue?: Record<string, unknown>;
        description?: string;
      }
    ) => {
      if (!currentAdmin) return;

      const auditLog: AuditLog = {
        id: `audit_${Date.now()}`,
        adminId: currentAdmin.id,
        adminName: currentAdmin.name,
        adminEmail: currentAdmin.email,
        action,
        targetType,
        targetId,
        previousValue: details?.previousValue,
        newValue: details?.newValue,
        description: details?.description,
        timestamp: new Date().toISOString(),
      };

      // TODO: Save to Firebase Firestore audit_logs collection
      console.log('Audit Log:', auditLog);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));
    },
    [currentAdmin]
  );

  const contextValue: AdminContextValue = useMemo(
    () => ({
      currentAdmin,
      adminRole,
      isLoading,
      hasAdminPermission,
      canManageUsers,
      canModerateEvents,
      canManageFinance,
      canManageRoles,
      canViewReports,
      canViewAuditLogs,
      dashboardStats,
      refreshDashboard,
      logAction,
    }),
    [
      currentAdmin,
      adminRole,
      isLoading,
      hasAdminPermission,
      canManageUsers,
      canModerateEvents,
      canManageFinance,
      canManageRoles,
      canViewReports,
      canViewAuditLogs,
      dashboardStats,
      refreshDashboard,
      logAction,
    ]
  );

  return (
    <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

// Hook to check if current user is an admin
export function useIsAdmin(): boolean {
  const { user, userProfile } = useAuth();
  const extendedProfile = userProfile as unknown as ExtendedUserProfile | null;
  return Boolean(user && extendedProfile?.isAdmin);
}

export default AdminContext;
