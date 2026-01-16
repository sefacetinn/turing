/**
 * Operasyon Yetkileri Hook
 *
 * Kullanıcının operasyon bölümlerine erişim yetkilerini kontrol eder.
 */

import { useMemo } from 'react';
import {
  OperationSectionType,
  OperationSection,
  PermissionLevel,
  SECTION_META,
} from '../types/operationSection';
import {
  CustomRole,
  DEFAULT_BOOKING_ROLES,
  DEFAULT_ORGANIZER_ROLES,
  DEFAULT_PROVIDER_ROLES,
  canView,
  canEdit,
  hasFullAccess,
} from '../types/customRoles';
import { currentOperationUser } from '../data/operationSectionsData';

// ============================================
// TİPLER
// ============================================

interface OperationUser {
  id: string;
  party: 'booking' | 'organizer' | 'provider';
  role: string;
  companyId: string;
  assignedSectionType?: OperationSectionType; // Provider için atanan bölüm
}

interface PermissionResult {
  canView: boolean;
  canEdit: boolean;
  canApprove: boolean;
  permissionLevel: PermissionLevel;
}

interface SectionAccessInfo {
  type: OperationSectionType;
  name: string;
  icon: string;
  color: string;
  permission: PermissionResult;
  isAccessible: boolean;
}

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

/**
 * Kullanıcının rolüne göre CustomRole nesnesini döndürür
 */
const getUserRole = (user: OperationUser): CustomRole | undefined => {
  let roleTemplates: Omit<CustomRole, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>[];

  switch (user.party) {
    case 'booking':
      roleTemplates = DEFAULT_BOOKING_ROLES;
      break;
    case 'organizer':
      roleTemplates = DEFAULT_ORGANIZER_ROLES;
      break;
    case 'provider':
      roleTemplates = DEFAULT_PROVIDER_ROLES;
      break;
    default:
      return undefined;
  }

  const template = roleTemplates.find(r => r.code === user.role);
  if (!template) return undefined;

  return {
    ...template,
    id: `role-${user.role}`,
    companyId: user.companyId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Provider için atanan bölümün yetkisini ayarlar
 */
const adjustProviderPermissions = (
  role: CustomRole,
  assignedSectionType?: OperationSectionType
): CustomRole => {
  if (role.companyType !== 'provider' || !assignedSectionType) {
    return role;
  }

  // Provider sadece atandığı bölümü görebilir
  const adjustedPermissions = { ...role.sectionPermissions };

  // Tüm bölümleri none yap
  (Object.keys(adjustedPermissions) as OperationSectionType[]).forEach(key => {
    adjustedPermissions[key] = 'none';
  });

  // Atanan bölümü role'e göre ayarla
  if (role.code === 'provider_admin') {
    adjustedPermissions[assignedSectionType] = 'full';
  } else if (role.code === 'field_manager') {
    adjustedPermissions[assignedSectionType] = 'edit';
  } else {
    adjustedPermissions[assignedSectionType] = 'view';
  }

  return {
    ...role,
    sectionPermissions: adjustedPermissions,
  };
};

// ============================================
// ANA HOOK
// ============================================

/**
 * Operasyon yetkilerini kontrol eden hook
 */
export const useOperationPermissions = (user?: OperationUser) => {
  const currentUser = user || {
    id: currentOperationUser.id,
    party: currentOperationUser.party,
    role: currentOperationUser.role,
    companyId: currentOperationUser.companyId,
  };

  // Kullanıcının rol bilgisi
  const userRole = useMemo(() => {
    const role = getUserRole(currentUser);
    if (!role) return undefined;

    // Provider ise atanan bölüm yetkisini ayarla
    if (currentUser.party === 'provider' && currentUser.assignedSectionType) {
      return adjustProviderPermissions(role, currentUser.assignedSectionType);
    }

    return role;
  }, [currentUser]);

  /**
   * Belirli bir bölüm için yetki kontrolü
   */
  const getSectionPermission = useMemo(() => {
    return (sectionType: OperationSectionType): PermissionResult => {
      if (!userRole) {
        return {
          canView: false,
          canEdit: false,
          canApprove: false,
          permissionLevel: 'none',
        };
      }

      const level = userRole.sectionPermissions[sectionType];

      return {
        canView: canView(level),
        canEdit: canEdit(level),
        canApprove: hasFullAccess(level),
        permissionLevel: level,
      };
    };
  }, [userRole]);

  /**
   * Bölümü görüntüleyebilir mi?
   */
  const canViewSection = useMemo(() => {
    return (sectionType: OperationSectionType): boolean => {
      return getSectionPermission(sectionType).canView;
    };
  }, [getSectionPermission]);

  /**
   * Bölümü düzenleyebilir mi?
   */
  const canEditSection = useMemo(() => {
    return (sectionType: OperationSectionType): boolean => {
      return getSectionPermission(sectionType).canEdit;
    };
  }, [getSectionPermission]);

  /**
   * Bölümde onay verebilir mi?
   */
  const canApproveInSection = useMemo(() => {
    return (sectionType: OperationSectionType): boolean => {
      return getSectionPermission(sectionType).canApprove;
    };
  }, [getSectionPermission]);

  /**
   * Kullanıcının erişebildiği tüm bölümleri döndürür
   */
  const getAccessibleSections = useMemo(() => {
    return (): SectionAccessInfo[] => {
      const allSectionTypes: OperationSectionType[] = [
        'payments',
        'accommodation',
        'transport',
        'technical',
        'catering',
        'security',
      ];

      return allSectionTypes.map(type => {
        const meta = SECTION_META[type];
        const permission = getSectionPermission(type);

        return {
          type,
          name: meta.name,
          icon: meta.icon,
          color: meta.color,
          permission,
          isAccessible: permission.canView,
        };
      });
    };
  }, [getSectionPermission]);

  /**
   * Sadece görüntülenebilir bölümleri döndürür
   */
  const getViewableSections = useMemo(() => {
    return (): SectionAccessInfo[] => {
      return getAccessibleSections().filter(s => s.isAccessible);
    };
  }, [getAccessibleSections]);

  /**
   * Belirli bir bölüme provider atayabilir mi?
   */
  const canAssignProvider = useMemo(() => {
    return (sectionType: OperationSectionType): boolean => {
      if (!userRole) return false;
      if (!userRole.permissions.canAssignProviders) return false;

      // Bölüme full erişim gerekli
      return getSectionPermission(sectionType).canApprove;
    };
  }, [userRole, getSectionPermission]);

  /**
   * Görev oluşturabilir mi?
   */
  const canCreateTask = useMemo(() => {
    return (sectionType: OperationSectionType): boolean => {
      if (!userRole) return false;
      if (!userRole.permissions.canCreateTasks) return false;

      return getSectionPermission(sectionType).canEdit;
    };
  }, [userRole, getSectionPermission]);

  /**
   * Görev atayabilir mi?
   */
  const canAssignTask = useMemo(() => {
    return (sectionType: OperationSectionType): boolean => {
      if (!userRole) return false;
      if (!userRole.permissions.canAssignTasks) return false;

      return getSectionPermission(sectionType).canEdit;
    };
  }, [userRole, getSectionPermission]);

  /**
   * Döküman yükleyebilir mi?
   */
  const canUploadDocument = useMemo(() => {
    return (sectionType: OperationSectionType): boolean => {
      if (!userRole) return false;
      if (!userRole.permissions.canUploadDocuments) return false;

      return getSectionPermission(sectionType).canEdit;
    };
  }, [userRole, getSectionPermission]);

  /**
   * Ödeme onaylayabilir mi?
   */
  const canApprovePayment = useMemo(() => {
    return (): boolean => {
      if (!userRole) return false;
      return userRole.permissions.canApprovePayments;
    };
  }, [userRole]);

  /**
   * Ekip yönetebilir mi?
   */
  const canManageTeam = useMemo(() => {
    return (): boolean => {
      if (!userRole) return false;
      return userRole.permissions.canManageTeam;
    };
  }, [userRole]);

  /**
   * Bölüm verilerini export edebilir mi?
   */
  const canExport = useMemo(() => {
    return (): boolean => {
      if (!userRole) return false;
      return userRole.permissions.canExportData;
    };
  }, [userRole]);

  return {
    // Kullanıcı bilgisi
    currentUser,
    userRole,

    // Bölüm yetkileri
    getSectionPermission,
    canViewSection,
    canEditSection,
    canApproveInSection,

    // Bölüm listesi
    getAccessibleSections,
    getViewableSections,

    // Özel yetkiler
    canAssignProvider,
    canCreateTask,
    canAssignTask,
    canUploadDocument,
    canApprovePayment,
    canManageTeam,
    canExport,
  };
};

// ============================================
// YARDIMCI HOOKLAR
// ============================================

/**
 * Belirli bir bölüm için yetki kontrolü hook'u
 */
export const useSectionPermission = (sectionType: OperationSectionType) => {
  const { getSectionPermission, canViewSection, canEditSection, canApproveInSection } =
    useOperationPermissions();

  return {
    permission: getSectionPermission(sectionType),
    canView: canViewSection(sectionType),
    canEdit: canEditSection(sectionType),
    canApprove: canApproveInSection(sectionType),
  };
};

/**
 * Kullanıcının görebileceği bölüm sayısını döndürür
 */
export const useAccessibleSectionCount = () => {
  const { getViewableSections } = useOperationPermissions();
  return getViewableSections().length;
};

export default useOperationPermissions;
