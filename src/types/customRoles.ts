/**
 * Özelleştirilebilir Rol Sistemi
 *
 * Firma adminleri kendi rollerini tanımlayabilir ve
 * her role operasyon bölümlerine özel yetkiler atayabilir.
 */

import { OperationSectionType, PermissionLevel } from './operationSection';

// ============================================
// ROL TİPLERİ
// ============================================

/**
 * Varsayılan booking firma rolleri
 */
export type DefaultBookingRole =
  | 'booking_admin'        // Firma sahibi/admin - tüm yetkiler
  | 'artist_manager'       // Sanatçı menajeri
  | 'tour_manager'         // Tur menajeri
  | 'production_manager'   // Prodüksiyon amiri
  | 'booking_accountant'   // Muhasebe
  | 'booking_assistant';   // Asistan

/**
 * Varsayılan organizatör rolleri
 */
export type DefaultOrganizerRole =
  | 'org_admin'            // Organizatör admin
  | 'event_coordinator'    // Etkinlik koordinatörü
  | 'finance_manager'      // Finans yöneticisi
  | 'tech_coordinator'     // Teknik koordinatör
  | 'logistics_manager'    // Lojistik yöneticisi
  | 'org_assistant';       // Asistan

/**
 * Varsayılan provider rolleri
 */
export type DefaultProviderRole =
  | 'provider_admin'       // Provider admin
  | 'field_manager'        // Saha sorumlusu
  | 'staff';               // Personel

// ============================================
// ÖZEL ROL YAPISI
// ============================================

/**
 * Özelleştirilebilir rol
 */
export interface CustomRole {
  id: string;
  companyId: string;
  companyType: 'booking' | 'organizer' | 'provider';

  // Rol bilgileri
  name: string;
  code: string;
  description: string;
  color: string;
  icon: string;

  // Bölüm bazlı yetkiler
  sectionPermissions: {
    [key in OperationSectionType]: PermissionLevel;
  };

  // Genel yetkiler
  permissions: RolePermissions;

  // Durum
  isDefault: boolean;   // Varsayılan rol mü?
  isActive: boolean;    // Aktif mi?
  sortOrder: number;    // Sıralama

  // Meta
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

/**
 * Rol yetkileri
 */
export interface RolePermissions {
  // Provider yönetimi
  canAssignProviders: boolean;
  canRemoveProviders: boolean;

  // Ödeme yönetimi
  canViewPayments: boolean;
  canApprovePayments: boolean;
  canCreateInvoices: boolean;

  // Ekip yönetimi
  canManageTeam: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;

  // Görev yönetimi
  canCreateTasks: boolean;
  canAssignTasks: boolean;
  canApproveTasks: boolean;

  // Döküman yönetimi
  canUploadDocuments: boolean;
  canDeleteDocuments: boolean;

  // Genel
  canViewAllSections: boolean;
  canEditSettings: boolean;
  canExportData: boolean;
}

// ============================================
// VARSAYILAN ROL ŞABLONLARI
// ============================================

/**
 * Varsayılan bölüm yetkileri
 */
const defaultSectionPermissions: Record<OperationSectionType, PermissionLevel> = {
  payments: 'none',
  accommodation: 'none',
  transport: 'none',
  technical: 'none',
  catering: 'none',
  security: 'none',
};

/**
 * Varsayılan booking rolleri şablonları
 */
export const DEFAULT_BOOKING_ROLES: Omit<CustomRole, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>[] = [
  {
    companyType: 'booking',
    name: 'Firma Sahibi / Admin',
    code: 'booking_admin',
    description: 'Tüm operasyonlara tam erişim',
    color: '#4B30B8',
    icon: 'shield-checkmark',
    sectionPermissions: {
      payments: 'full',
      accommodation: 'full',
      transport: 'full',
      technical: 'full',
      catering: 'full',
      security: 'full',
    },
    permissions: {
      canAssignProviders: true,
      canRemoveProviders: true,
      canViewPayments: true,
      canApprovePayments: true,
      canCreateInvoices: true,
      canManageTeam: true,
      canInviteMembers: true,
      canRemoveMembers: true,
      canCreateTasks: true,
      canAssignTasks: true,
      canApproveTasks: true,
      canUploadDocuments: true,
      canDeleteDocuments: true,
      canViewAllSections: true,
      canEditSettings: true,
      canExportData: true,
    },
    isDefault: true,
    isActive: true,
    sortOrder: 1,
  },
  {
    companyType: 'booking',
    name: 'Tur Menajeri',
    code: 'tour_manager',
    description: 'Konaklama, ulaşım ve catering yönetimi',
    color: '#8B5CF6',
    icon: 'airplane',
    sectionPermissions: {
      payments: 'none',
      accommodation: 'full',
      transport: 'full',
      technical: 'view',
      catering: 'full',
      security: 'view',
    },
    permissions: {
      canAssignProviders: true,
      canRemoveProviders: false,
      canViewPayments: false,
      canApprovePayments: false,
      canCreateInvoices: false,
      canManageTeam: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canCreateTasks: true,
      canAssignTasks: true,
      canApproveTasks: true,
      canUploadDocuments: true,
      canDeleteDocuments: false,
      canViewAllSections: false,
      canEditSettings: false,
      canExportData: true,
    },
    isDefault: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    companyType: 'booking',
    name: 'Prodüksiyon Amiri',
    code: 'production_manager',
    description: 'Teknik ve güvenlik operasyonları',
    color: '#3B82F6',
    icon: 'hardware-chip',
    sectionPermissions: {
      payments: 'none',
      accommodation: 'view',
      transport: 'view',
      technical: 'full',
      catering: 'view',
      security: 'full',
    },
    permissions: {
      canAssignProviders: true,
      canRemoveProviders: false,
      canViewPayments: false,
      canApprovePayments: false,
      canCreateInvoices: false,
      canManageTeam: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canCreateTasks: true,
      canAssignTasks: true,
      canApproveTasks: true,
      canUploadDocuments: true,
      canDeleteDocuments: false,
      canViewAllSections: false,
      canEditSettings: false,
      canExportData: true,
    },
    isDefault: true,
    isActive: true,
    sortOrder: 3,
  },
  {
    companyType: 'booking',
    name: 'Sanatçı Menajeri',
    code: 'artist_manager',
    description: 'Genel bakış ve onay yetkisi',
    color: '#EC4899',
    icon: 'person',
    sectionPermissions: {
      payments: 'view',
      accommodation: 'view',
      transport: 'view',
      technical: 'view',
      catering: 'view',
      security: 'view',
    },
    permissions: {
      canAssignProviders: false,
      canRemoveProviders: false,
      canViewPayments: true,
      canApprovePayments: false,
      canCreateInvoices: false,
      canManageTeam: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canCreateTasks: false,
      canAssignTasks: false,
      canApproveTasks: true,
      canUploadDocuments: false,
      canDeleteDocuments: false,
      canViewAllSections: true,
      canEditSettings: false,
      canExportData: false,
    },
    isDefault: true,
    isActive: true,
    sortOrder: 4,
  },
  {
    companyType: 'booking',
    name: 'Muhasebe',
    code: 'booking_accountant',
    description: 'Sadece finansal işlemler',
    color: '#10B981',
    icon: 'calculator',
    sectionPermissions: {
      payments: 'full',
      accommodation: 'none',
      transport: 'none',
      technical: 'none',
      catering: 'none',
      security: 'none',
    },
    permissions: {
      canAssignProviders: false,
      canRemoveProviders: false,
      canViewPayments: true,
      canApprovePayments: true,
      canCreateInvoices: true,
      canManageTeam: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canCreateTasks: false,
      canAssignTasks: false,
      canApproveTasks: false,
      canUploadDocuments: true,
      canDeleteDocuments: false,
      canViewAllSections: false,
      canEditSettings: false,
      canExportData: true,
    },
    isDefault: true,
    isActive: true,
    sortOrder: 5,
  },
];

/**
 * Varsayılan organizatör rolleri şablonları
 */
export const DEFAULT_ORGANIZER_ROLES: Omit<CustomRole, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>[] = [
  {
    companyType: 'organizer',
    name: 'Organizatör Admin',
    code: 'org_admin',
    description: 'Tüm operasyonlara tam erişim',
    color: '#4B30B8',
    icon: 'shield-checkmark',
    sectionPermissions: {
      payments: 'full',
      accommodation: 'full',
      transport: 'full',
      technical: 'full',
      catering: 'full',
      security: 'full',
    },
    permissions: {
      canAssignProviders: true,
      canRemoveProviders: true,
      canViewPayments: true,
      canApprovePayments: true,
      canCreateInvoices: true,
      canManageTeam: true,
      canInviteMembers: true,
      canRemoveMembers: true,
      canCreateTasks: true,
      canAssignTasks: true,
      canApproveTasks: true,
      canUploadDocuments: true,
      canDeleteDocuments: true,
      canViewAllSections: true,
      canEditSettings: true,
      canExportData: true,
    },
    isDefault: true,
    isActive: true,
    sortOrder: 1,
  },
  {
    companyType: 'organizer',
    name: 'Etkinlik Koordinatörü',
    code: 'event_coordinator',
    description: 'Operasyon yönetimi (finans hariç)',
    color: '#8B5CF6',
    icon: 'calendar',
    sectionPermissions: {
      payments: 'view',
      accommodation: 'full',
      transport: 'full',
      technical: 'full',
      catering: 'full',
      security: 'full',
    },
    permissions: {
      canAssignProviders: true,
      canRemoveProviders: false,
      canViewPayments: true,
      canApprovePayments: false,
      canCreateInvoices: false,
      canManageTeam: true,
      canInviteMembers: true,
      canRemoveMembers: false,
      canCreateTasks: true,
      canAssignTasks: true,
      canApproveTasks: true,
      canUploadDocuments: true,
      canDeleteDocuments: true,
      canViewAllSections: true,
      canEditSettings: false,
      canExportData: true,
    },
    isDefault: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    companyType: 'organizer',
    name: 'Finans Yöneticisi',
    code: 'finance_manager',
    description: 'Finansal işlemler ve ödemeler',
    color: '#10B981',
    icon: 'card',
    sectionPermissions: {
      payments: 'full',
      accommodation: 'none',
      transport: 'none',
      technical: 'none',
      catering: 'none',
      security: 'none',
    },
    permissions: {
      canAssignProviders: false,
      canRemoveProviders: false,
      canViewPayments: true,
      canApprovePayments: true,
      canCreateInvoices: true,
      canManageTeam: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canCreateTasks: false,
      canAssignTasks: false,
      canApproveTasks: false,
      canUploadDocuments: true,
      canDeleteDocuments: false,
      canViewAllSections: false,
      canEditSettings: false,
      canExportData: true,
    },
    isDefault: true,
    isActive: true,
    sortOrder: 3,
  },
];

/**
 * Varsayılan provider rolleri şablonları
 */
export const DEFAULT_PROVIDER_ROLES: Omit<CustomRole, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>[] = [
  {
    companyType: 'provider',
    name: 'Provider Admin',
    code: 'provider_admin',
    description: 'Atanan bölüme tam erişim',
    color: '#4B30B8',
    icon: 'shield-checkmark',
    sectionPermissions: {
      ...defaultSectionPermissions,
      // Provider'ın atandığı bölüm dinamik olarak 'full' yapılır
    },
    permissions: {
      canAssignProviders: false,
      canRemoveProviders: false,
      canViewPayments: false,
      canApprovePayments: false,
      canCreateInvoices: false,
      canManageTeam: true,
      canInviteMembers: true,
      canRemoveMembers: true,
      canCreateTasks: true,
      canAssignTasks: true,
      canApproveTasks: true,
      canUploadDocuments: true,
      canDeleteDocuments: true,
      canViewAllSections: false,
      canEditSettings: false,
      canExportData: true,
    },
    isDefault: true,
    isActive: true,
    sortOrder: 1,
  },
  {
    companyType: 'provider',
    name: 'Saha Sorumlusu',
    code: 'field_manager',
    description: 'Görev yönetimi ve durum güncelleme',
    color: '#F59E0B',
    icon: 'person',
    sectionPermissions: {
      ...defaultSectionPermissions,
    },
    permissions: {
      canAssignProviders: false,
      canRemoveProviders: false,
      canViewPayments: false,
      canApprovePayments: false,
      canCreateInvoices: false,
      canManageTeam: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canCreateTasks: true,
      canAssignTasks: true,
      canApproveTasks: false,
      canUploadDocuments: true,
      canDeleteDocuments: false,
      canViewAllSections: false,
      canEditSettings: false,
      canExportData: false,
    },
    isDefault: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    companyType: 'provider',
    name: 'Personel',
    code: 'staff',
    description: 'Sadece görüntüleme',
    color: '#6B7280',
    icon: 'people',
    sectionPermissions: {
      ...defaultSectionPermissions,
    },
    permissions: {
      canAssignProviders: false,
      canRemoveProviders: false,
      canViewPayments: false,
      canApprovePayments: false,
      canCreateInvoices: false,
      canManageTeam: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canCreateTasks: false,
      canAssignTasks: false,
      canApproveTasks: false,
      canUploadDocuments: false,
      canDeleteDocuments: false,
      canViewAllSections: false,
      canEditSettings: false,
      canExportData: false,
    },
    isDefault: true,
    isActive: true,
    sortOrder: 3,
  },
];

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

/**
 * Yetki seviyesinin görüntüleme içerip içermediğini kontrol eder
 */
export const canView = (level: PermissionLevel): boolean => {
  return level !== 'none';
};

/**
 * Yetki seviyesinin düzenleme içerip içermediğini kontrol eder
 */
export const canEdit = (level: PermissionLevel): boolean => {
  return level === 'edit' || level === 'full';
};

/**
 * Yetki seviyesinin tam erişim içerip içermediğini kontrol eder
 */
export const hasFullAccess = (level: PermissionLevel): boolean => {
  return level === 'full';
};

/**
 * Yetki seviyesi etiketini döndürür
 */
export const getPermissionLevelLabel = (level: PermissionLevel): string => {
  const labels: Record<PermissionLevel, string> = {
    none: 'Erişim Yok',
    view: 'Görüntüleme',
    edit: 'Düzenleme',
    full: 'Tam Erişim',
  };
  return labels[level];
};

/**
 * Yetki seviyesi rengini döndürür
 */
export const getPermissionLevelColor = (level: PermissionLevel): string => {
  const colors: Record<PermissionLevel, string> = {
    none: '#6B7280',
    view: '#3B82F6',
    edit: '#F59E0B',
    full: '#10B981',
  };
  return colors[level];
};
