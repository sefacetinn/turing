import { useState, useCallback, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { systemAdminRoles, getAdminRoleById } from '../config/adminRoles';
import type {
  AdminRole,
  AdminPermission,
  AdminRoleType,
} from '../types/admin';

export interface UseAdminRolesResult {
  // Data
  roles: AdminRole[];
  systemRoles: AdminRole[];
  customRoles: AdminRole[];
  selectedRole: AdminRole | null;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isProcessing: boolean;

  // Actions
  refresh: () => Promise<void>;
  selectRole: (roleId: string | null) => void;
  createRole: (role: Omit<AdminRole, 'id' | 'isSystem' | 'createdAt' | 'updatedAt'>) => Promise<AdminRole>;
  updateRole: (roleId: string, updates: Partial<AdminRole>) => Promise<void>;
  deleteRole: (roleId: string) => Promise<void>;
  duplicateRole: (roleId: string, newName: string) => Promise<AdminRole>;

  // Helpers
  getRoleById: (roleId: string) => AdminRole | undefined;
  getRolesByType: (type: AdminRoleType) => AdminRole[];
  canDeleteRole: (roleId: string) => boolean;
}

export function useAdminRoles(): UseAdminRolesResult {
  const { logAction } = useAdmin();
  const [customRoles, setCustomRoles] = useState<AdminRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Combine system and custom roles
  const roles = useMemo(() => [...systemAdminRoles, ...customRoles], [customRoles]);

  // Actions
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // TODO: Fetch custom roles from Firebase in production
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const selectRole = useCallback((roleId: string | null) => {
    if (roleId === null) {
      setSelectedRole(null);
    } else {
      const role = roles.find((r) => r.id === roleId) || null;
      setSelectedRole(role);
    }
  }, [roles]);

  const createRole = useCallback(async (
    roleData: Omit<AdminRole, 'id' | 'isSystem' | 'createdAt' | 'updatedAt'>
  ): Promise<AdminRole> => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newRole: AdminRole = {
        ...roleData,
        id: `custom_${Date.now()}`,
        isSystem: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await logAction('role.create', 'role', newRole.id, {
        newValue: { name: newRole.name, type: newRole.type },
        description: `${newRole.name} rolü oluşturuldu`,
      });

      setCustomRoles((prev) => [...prev, newRole]);
      return newRole;
    } finally {
      setIsProcessing(false);
    }
  }, [logAction]);

  const updateRole = useCallback(async (roleId: string, updates: Partial<AdminRole>) => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const existingRole = roles.find((r) => r.id === roleId);
      if (!existingRole) {
        throw new Error('Rol bulunamadı');
      }

      if (existingRole.isSystem) {
        throw new Error('Sistem rolleri düzenlenemez');
      }

      await logAction('role.update', 'role', roleId, {
        previousValue: { name: existingRole.name, permissions: existingRole.permissions },
        newValue: updates,
        description: `${existingRole.name} rolü güncellendi`,
      });

      setCustomRoles((prev) =>
        prev.map((role) =>
          role.id === roleId
            ? { ...role, ...updates, updatedAt: new Date().toISOString() }
            : role
        )
      );

      if (selectedRole?.id === roleId) {
        setSelectedRole((prev) => prev ? { ...prev, ...updates } : prev);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [roles, selectedRole, logAction]);

  const deleteRole = useCallback(async (roleId: string) => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const existingRole = roles.find((r) => r.id === roleId);
      if (!existingRole) {
        throw new Error('Rol bulunamadı');
      }

      if (existingRole.isSystem) {
        throw new Error('Sistem rolleri silinemez');
      }

      await logAction('role.delete', 'role', roleId, {
        description: `${existingRole.name} rolü silindi`,
      });

      setCustomRoles((prev) => prev.filter((role) => role.id !== roleId));

      if (selectedRole?.id === roleId) {
        setSelectedRole(null);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [roles, selectedRole, logAction]);

  const duplicateRole = useCallback(async (roleId: string, newName: string): Promise<AdminRole> => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const sourceRole = roles.find((r) => r.id === roleId);
      if (!sourceRole) {
        throw new Error('Kaynak rol bulunamadı');
      }

      const newRole: AdminRole = {
        ...sourceRole,
        id: `custom_${Date.now()}`,
        name: newName,
        type: 'custom',
        isSystem: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await logAction('role.create', 'role', newRole.id, {
        newValue: { name: newRole.name, sourceRole: sourceRole.name },
        description: `${newRole.name} rolü ${sourceRole.name} rolünden kopyalandı`,
      });

      setCustomRoles((prev) => [...prev, newRole]);
      return newRole;
    } finally {
      setIsProcessing(false);
    }
  }, [roles, logAction]);

  // Helpers
  const getRoleById = useCallback((roleId: string): AdminRole | undefined => {
    return roles.find((r) => r.id === roleId);
  }, [roles]);

  const getRolesByType = useCallback((type: AdminRoleType): AdminRole[] => {
    return roles.filter((r) => r.type === type);
  }, [roles]);

  const canDeleteRole = useCallback((roleId: string): boolean => {
    const role = roles.find((r) => r.id === roleId);
    return role ? !role.isSystem : false;
  }, [roles]);

  return {
    roles,
    systemRoles: systemAdminRoles,
    customRoles,
    selectedRole,
    isLoading,
    isRefreshing,
    isProcessing,
    refresh,
    selectRole,
    createRole,
    updateRole,
    deleteRole,
    duplicateRole,
    getRoleById,
    getRolesByType,
    canDeleteRole,
  };
}

export default useAdminRoles;
