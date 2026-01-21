// Admin Rol Konfigürasyonları

import type { AdminRole, AdminPermission, AdminRoleType } from '../types/admin';

// ============================================
// SİSTEM ROLLERİ
// ============================================

// Super Admin - Tam yetki
export const superAdminRole: AdminRole = {
  id: 'super_admin',
  name: 'Super Admin',
  type: 'super_admin',
  description: 'Tüm modüllere tam erişim yetkisine sahip ana yönetici.',
  isSystem: true,
  permissions: [
    { resource: 'users', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
    { resource: 'events', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
    { resource: 'finance', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
    { resource: 'reports', actions: ['view', 'create', 'export'] },
    { resource: 'roles', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'settings', actions: ['view', 'edit'] },
    { resource: 'audit_logs', actions: ['view', 'export'] },
  ],
};

// Moderator - Kullanıcı ve etkinlik moderasyonu
export const moderatorRole: AdminRole = {
  id: 'moderator',
  name: 'Moderatör',
  type: 'moderator',
  description: 'Kullanıcı ve etkinlik moderasyonu yapabilir. Finansal işlemleri sadece görüntüleyebilir.',
  isSystem: true,
  permissions: [
    { resource: 'users', actions: ['view', 'edit', 'approve'] },
    { resource: 'events', actions: ['view', 'edit', 'delete', 'approve'] },
    { resource: 'finance', actions: ['view'] },
    { resource: 'reports', actions: ['view'] },
    { resource: 'roles', actions: ['view'] },
    { resource: 'settings', actions: ['view'] },
    { resource: 'audit_logs', actions: ['view'] },
  ],
};

// Finance Admin - Finansal işlemler
export const financeAdminRole: AdminRole = {
  id: 'finance_admin',
  name: 'Finans Yöneticisi',
  type: 'finance',
  description: 'Finansal işlemleri tam yetkiyle yönetir. Diğer modülleri sadece görüntüleyebilir.',
  isSystem: true,
  permissions: [
    { resource: 'users', actions: ['view'] },
    { resource: 'events', actions: ['view'] },
    { resource: 'finance', actions: ['view', 'create', 'edit', 'approve', 'export'] },
    { resource: 'reports', actions: ['view', 'export'] },
    { resource: 'roles', actions: ['view'] },
    { resource: 'settings', actions: ['view'] },
    { resource: 'audit_logs', actions: ['view'] },
  ],
};

// Support - Sadece görüntüleme
export const supportRole: AdminRole = {
  id: 'support',
  name: 'Destek',
  type: 'support',
  description: 'Tüm modülleri sadece görüntüleyebilir. Herhangi bir değişiklik yapamaz.',
  isSystem: true,
  permissions: [
    { resource: 'users', actions: ['view'] },
    { resource: 'events', actions: ['view'] },
    { resource: 'finance', actions: ['view'] },
    { resource: 'reports', actions: ['view'] },
    { resource: 'roles', actions: ['view'] },
    { resource: 'settings', actions: ['view'] },
    { resource: 'audit_logs', actions: ['view'] },
  ],
};

// ============================================
// TÜM ROLLER
// ============================================

export const systemAdminRoles: AdminRole[] = [
  superAdminRole,
  moderatorRole,
  financeAdminRole,
  supportRole,
];

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

/**
 * Admin rolünü ID'ye göre bul
 */
export function getAdminRoleById(roleId: string, customRoles: AdminRole[] = []): AdminRole | undefined {
  const allRoles = [...systemAdminRoles, ...customRoles];
  return allRoles.find(role => role.id === roleId);
}

/**
 * Admin rol tipine göre rolleri getir
 */
export function getAdminRolesByType(type: AdminRoleType, customRoles: AdminRole[] = []): AdminRole[] {
  const allRoles = [...systemAdminRoles, ...customRoles];
  return allRoles.filter(role => role.type === type);
}

/**
 * Belirli bir kaynağa erişimi olan rolleri getir
 */
export function getRolesWithResourceAccess(
  resource: string,
  action: string,
  customRoles: AdminRole[] = []
): AdminRole[] {
  const allRoles = [...systemAdminRoles, ...customRoles];
  return allRoles.filter(role =>
    role.permissions.some(
      p => p.resource === resource && p.actions.includes(action as AdminPermission['actions'][number])
    )
  );
}

/**
 * Yetki kontrolü
 */
export function checkAdminPermission(
  role: AdminRole | null,
  resource: string,
  action: string
): boolean {
  if (!role) return false;

  const permission = role.permissions.find(p => p.resource === resource);
  if (!permission) return false;

  return permission.actions.includes(action as AdminPermission['actions'][number]);
}

/**
 * Rol karşılaştırma (yetkiler açısından)
 */
export function isRoleMorePowerful(roleA: AdminRole, roleB: AdminRole): boolean {
  const roleOrder: AdminRoleType[] = ['super_admin', 'moderator', 'finance', 'support', 'custom'];
  return roleOrder.indexOf(roleA.type) < roleOrder.indexOf(roleB.type);
}

/**
 * Varsayılan admin rolü
 */
export function getDefaultAdminRole(): AdminRole {
  return supportRole;
}

// ============================================
// ROL RENK VE İKON AYARLARI
// ============================================

export const adminRoleColors: Record<AdminRoleType, { bg: string; text: string }> = {
  super_admin: { bg: '#dc2626', text: '#ffffff' }, // Kırmızı
  moderator: { bg: '#8b5cf6', text: '#ffffff' },   // Mor
  finance: { bg: '#10b981', text: '#ffffff' },     // Yeşil
  support: { bg: '#6b7280', text: '#ffffff' },     // Gri
  custom: { bg: '#3b82f6', text: '#ffffff' },      // Mavi
};

export const adminRoleIcons: Record<AdminRoleType, string> = {
  super_admin: 'shield-checkmark',
  moderator: 'eye',
  finance: 'wallet',
  support: 'headset',
  custom: 'person-circle',
};

// ============================================
// YETKİ ETİKETLERİ
// ============================================

export const adminResourceLabels: Record<string, string> = {
  users: 'Kullanıcılar',
  events: 'Etkinlikler',
  finance: 'Finans',
  reports: 'Raporlar',
  roles: 'Roller',
  settings: 'Ayarlar',
  audit_logs: 'Denetim Kayıtları',
};

export const adminActionLabels: Record<string, string> = {
  view: 'Görüntüle',
  create: 'Oluştur',
  edit: 'Düzenle',
  delete: 'Sil',
  approve: 'Onayla',
  export: 'Dışa Aktar',
};

/**
 * Yetki özeti oluştur (UI için)
 */
export function getAdminPermissionSummaries(role: AdminRole): Array<{
  label: string;
  icon: string;
  resource: string;
  hasFullAccess: boolean;
  hasViewAccess: boolean;
  actions: string[];
}> {
  const summaries = role.permissions.map(permission => {
    const hasFullAccess = permission.actions.length >= 4;
    const hasViewAccess = permission.actions.includes('view');

    return {
      label: adminResourceLabels[permission.resource] || permission.resource,
      icon: getResourceIcon(permission.resource),
      resource: permission.resource,
      hasFullAccess,
      hasViewAccess,
      actions: permission.actions,
    };
  });

  return summaries;
}

/**
 * Kaynak ikonu getir
 */
function getResourceIcon(resource: string): string {
  const icons: Record<string, string> = {
    users: 'people',
    events: 'calendar',
    finance: 'wallet',
    reports: 'bar-chart',
    roles: 'key',
    settings: 'settings',
    audit_logs: 'list',
  };
  return icons[resource] || 'ellipse';
}
