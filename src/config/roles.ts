// Rol Konfigürasyonları

import type { Role, Permission, ServiceCategory } from '../types';

// Organizatör Rolleri
export const organizerRoles: Role[] = [
  {
    id: 'org_admin',
    type: 'account_admin',
    name: 'Hesap Yöneticisi',
    description: 'Tüm yetkilere sahip ana yönetici. Ekip üyelerini yönetebilir, tüm işlemleri gerçekleştirebilir.',
    permissions: [
      { resource: 'team', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'events', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'offers', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
      { resource: 'contracts', actions: ['view', 'create', 'edit', 'approve'] },
      { resource: 'payments', actions: ['view', 'create', 'approve'] },
      { resource: 'invoices', actions: ['view'] },
      { resource: 'settings', actions: ['view', 'edit'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit', 'delete'] },
    ],
  },
  {
    id: 'org_coordinator',
    type: 'event_coordinator',
    name: 'Etkinlik Koordinatörü',
    description: 'Etkinlik oluşturma, teklif değerlendirme ve sözleşme imzalama yetkisine sahip.',
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view', 'create', 'edit'] },
      { resource: 'offers', actions: ['view', 'create', 'edit', 'approve'] },
      { resource: 'contracts', actions: ['view', 'create', 'approve'] },
      { resource: 'payments', actions: ['view'] },
      { resource: 'invoices', actions: ['view'] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit'] },
    ],
  },
  {
    id: 'org_finance',
    type: 'finance_manager',
    name: 'Finans Yöneticisi',
    description: 'Bütçe, ödeme ve fatura işlemlerini yönetir.',
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: ['view', 'create', 'approve'] },
      { resource: 'invoices', actions: ['view', 'create'] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view'] },
    ],
  },
  {
    id: 'org_specialist',
    type: 'event_specialist',
    name: 'Etkinlik Uzmanı',
    description: 'Saha operasyonlarını yönetir, etkinlikleri düzenleyebilir.',
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view', 'edit'] },
      { resource: 'offers', actions: ['view'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: [] },
      { resource: 'invoices', actions: [] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit'] },
    ],
  },
  {
    id: 'org_assistant',
    type: 'assistant',
    name: 'Asistan',
    description: 'Sadece görüntüleme yetkisine sahip. Hiçbir değişiklik yapamaz.',
    isDefault: true,
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: [] },
      { resource: 'invoices', actions: [] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view'] },
    ],
  },
];

// Booking/Sanatçı Yönetimi Rolleri
export const bookingProviderRoles: Role[] = [
  {
    id: 'booking_artist_manager',
    type: 'artist_manager',
    name: 'Sanatçı Yöneticisi',
    description: 'Sanatçının ana temsilcisi. Sözleşme ve fiyatlandırma yetkisine sahip.',
    category: 'booking',
    permissions: [
      { resource: 'team', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view', 'create', 'edit', 'approve'] },
      { resource: 'contracts', actions: ['view', 'create', 'approve'] },
      { resource: 'payments', actions: ['view', 'create'] },
      { resource: 'invoices', actions: ['view', 'create'] },
      { resource: 'settings', actions: ['view', 'edit'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit', 'delete'] },
    ],
  },
  {
    id: 'booking_tour_manager',
    type: 'tour_manager',
    name: 'Tur Menajeri',
    description: 'Turne planlaması ve lojistik koordinasyonundan sorumlu.',
    category: 'booking',
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view', 'create', 'edit'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: ['view'] },
      { resource: 'invoices', actions: ['view'] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit'] },
    ],
  },
  {
    id: 'booking_production',
    type: 'production_manager',
    name: 'Prodüksiyon Amiri',
    description: 'Sahne gereksinimleri ve teknik rider yönetimi.',
    category: 'booking',
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: [] },
      { resource: 'invoices', actions: [] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit'] },
    ],
  },
  {
    id: 'booking_assistant',
    type: 'provider_assistant',
    name: 'Asistan',
    description: 'Takvim ve iletişim desteği sağlar.',
    category: 'booking',
    isDefault: true,
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: [] },
      { resource: 'invoices', actions: [] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view'] },
    ],
  },
];

// Teknik Hizmet Rolleri (Ses/Işık/Sahne)
export const technicalProviderRoles: Role[] = [
  {
    id: 'tech_owner',
    type: 'owner',
    name: 'Firma Sahibi',
    description: 'Tam yetki. Fiyatlandırma ve ekip yönetimi.',
    category: 'technical',
    permissions: [
      { resource: 'team', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view', 'create', 'edit', 'approve'] },
      { resource: 'contracts', actions: ['view', 'create', 'approve'] },
      { resource: 'payments', actions: ['view', 'create'] },
      { resource: 'invoices', actions: ['view', 'create'] },
      { resource: 'settings', actions: ['view', 'edit'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit', 'delete'] },
    ],
  },
  {
    id: 'tech_project_manager',
    type: 'project_manager',
    name: 'Proje Yöneticisi',
    description: 'Etkinlik bazlı koordinasyon ve teklif hazırlama.',
    category: 'technical',
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view', 'create', 'edit'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: ['view'] },
      { resource: 'invoices', actions: ['view'] },
      { resource: 'settings', actions: ['view', 'edit'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit'] },
    ],
  },
  {
    id: 'tech_director',
    type: 'technical_director',
    name: 'Teknik Direktör',
    description: 'Ekipman seçimi ve teknik planlama.',
    category: 'technical',
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: [] },
      { resource: 'invoices', actions: [] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit'] },
    ],
  },
  {
    id: 'tech_field',
    type: 'field_supervisor',
    name: 'Saha Sorumlusu',
    description: 'Kurulum ve operasyon yönetimi.',
    category: 'technical',
    isDefault: true,
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: [] },
      { resource: 'invoices', actions: [] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view', 'edit'] },
    ],
  },
];

// Mekan Hizmet Rolleri
export const venueProviderRoles: Role[] = [
  {
    id: 'venue_manager',
    type: 'venue_manager',
    name: 'Mekan Yöneticisi',
    description: 'Tam yetki. Rezervasyon onayı ve fiyatlandırma.',
    category: 'venue',
    permissions: [
      { resource: 'team', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view', 'create', 'edit', 'approve'] },
      { resource: 'contracts', actions: ['view', 'create', 'approve'] },
      { resource: 'payments', actions: ['view', 'create'] },
      { resource: 'invoices', actions: ['view', 'create'] },
      { resource: 'settings', actions: ['view', 'edit'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit', 'delete'] },
    ],
  },
  {
    id: 'venue_sales',
    type: 'sales_rep',
    name: 'Satış Temsilcisi',
    description: 'Teklif hazırlama ve müşteri ilişkileri.',
    category: 'venue',
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view', 'create', 'edit'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: ['view'] },
      { resource: 'invoices', actions: ['view'] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view', 'create'] },
    ],
  },
  {
    id: 'venue_operations',
    type: 'operations_manager',
    name: 'Operasyon Müdürü',
    description: 'Lojistik ve personel koordinasyonu.',
    category: 'venue',
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: [] },
      { resource: 'invoices', actions: [] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit'] },
    ],
  },
  {
    id: 'venue_reception',
    type: 'receptionist',
    name: 'Resepsiyon',
    description: 'Rezervasyon görüntüleme.',
    category: 'venue',
    isDefault: true,
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: [] },
      { resource: 'invoices', actions: [] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view'] },
    ],
  },
];

// Catering Hizmet Rolleri
export const cateringProviderRoles: Role[] = [
  {
    id: 'catering_owner',
    type: 'owner',
    name: 'İşletme Sahibi',
    description: 'Tam yetki. Fiyatlandırma ve ekip yönetimi.',
    category: 'catering',
    permissions: [
      { resource: 'team', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view', 'create', 'edit', 'approve'] },
      { resource: 'contracts', actions: ['view', 'create', 'approve'] },
      { resource: 'payments', actions: ['view', 'create'] },
      { resource: 'invoices', actions: ['view', 'create'] },
      { resource: 'settings', actions: ['view', 'edit'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit', 'delete'] },
    ],
  },
  {
    id: 'catering_chef',
    type: 'chef',
    name: 'Şef',
    description: 'Menü planlama ve mutfak operasyonu.',
    category: 'catering',
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view', 'edit'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: [] },
      { resource: 'invoices', actions: [] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit'] },
    ],
  },
  {
    id: 'catering_coordinator',
    type: 'event_caterer',
    name: 'Etkinlik Koordinatörü',
    description: 'Servis planlaması ve müşteri iletişimi.',
    category: 'catering',
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view', 'create'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: ['view'] },
      { resource: 'invoices', actions: ['view'] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit'] },
    ],
  },
  {
    id: 'catering_waiter',
    type: 'head_waiter',
    name: 'Garson Şefi',
    description: 'Servis ekibi yönetimi.',
    category: 'catering',
    isDefault: true,
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: [] },
      { resource: 'invoices', actions: [] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view', 'edit'] },
    ],
  },
];

// Transport/Lojistik Rolleri
export const transportProviderRoles: Role[] = [
  {
    id: 'transport_fleet',
    type: 'fleet_manager',
    name: 'Filo Yöneticisi',
    description: 'Tam yetki. Araç tahsisi ve fiyatlandırma.',
    category: 'transport',
    permissions: [
      { resource: 'team', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view', 'create', 'edit', 'approve'] },
      { resource: 'contracts', actions: ['view', 'create', 'approve'] },
      { resource: 'payments', actions: ['view', 'create'] },
      { resource: 'invoices', actions: ['view', 'create'] },
      { resource: 'settings', actions: ['view', 'edit'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit', 'delete'] },
    ],
  },
  {
    id: 'transport_operations',
    type: 'operations_coordinator',
    name: 'Operasyon Sorumlusu',
    description: 'Rota planlama ve sürücü koordinasyonu.',
    category: 'transport',
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view', 'create', 'edit'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: ['view'] },
      { resource: 'invoices', actions: ['view'] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit'] },
    ],
  },
  {
    id: 'transport_driver',
    type: 'driver',
    name: 'Sürücü',
    description: 'Görev görüntüleme ve güncelleme.',
    category: 'transport',
    isDefault: true,
    permissions: [
      { resource: 'team', actions: ['view'] },
      { resource: 'events', actions: ['view'] },
      { resource: 'offers', actions: ['view'] },
      { resource: 'contracts', actions: ['view'] },
      { resource: 'payments', actions: [] },
      { resource: 'invoices', actions: [] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'tasks', actions: ['view', 'edit'] },
    ],
  },
];

// Tüm provider rolleri kategoriye göre
export const providerRolesByCategory: Record<string, Role[]> = {
  booking: bookingProviderRoles,
  technical: technicalProviderRoles,
  venue: venueProviderRoles,
  catering: cateringProviderRoles,
  transport: transportProviderRoles,
  // Diğer kategoriler için technical rolleri kullanılabilir
  accommodation: venueProviderRoles,
  security: technicalProviderRoles,
  operation: technicalProviderRoles,
  flight: transportProviderRoles,
};

// Tüm roller
export const allRoles: Role[] = [
  ...organizerRoles,
  ...bookingProviderRoles,
  ...technicalProviderRoles,
  ...venueProviderRoles,
  ...cateringProviderRoles,
  ...transportProviderRoles,
];

// Role ID'ye göre rol bul
export function getRoleById(roleId: string): Role | undefined {
  return allRoles.find(role => role.id === roleId);
}

// Organizasyon tipine göre rolleri getir
export function getRolesForOrganizationType(
  type: 'organizer' | 'provider',
  category?: string
): Role[] {
  if (type === 'organizer') {
    return organizerRoles;
  }

  if (category && providerRolesByCategory[category]) {
    return providerRolesByCategory[category];
  }

  return technicalProviderRoles; // Varsayılan
}

// Varsayılan rolü getir
export function getDefaultRole(
  type: 'organizer' | 'provider',
  category?: string
): Role {
  const roles = getRolesForOrganizationType(type, category);
  return roles.find(role => role.isDefault) || roles[roles.length - 1];
}

// Yetki özeti oluştur (UI için)
export function getPermissionSummaries(role: Role): Array<{
  label: string;
  icon: string;
  hasPermission: boolean;
}> {
  const summaries = [
    {
      label: 'Ekip Yönetimi',
      icon: 'people',
      hasPermission: role.permissions.find(p => p.resource === 'team')?.actions.includes('create') || false,
    },
    {
      label: 'Etkinlik Oluşturma',
      icon: 'calendar',
      hasPermission: role.permissions.find(p => p.resource === 'events')?.actions.includes('create') || false,
    },
    {
      label: 'Teklif Onaylama',
      icon: 'checkmark-circle',
      hasPermission: role.permissions.find(p => p.resource === 'offers')?.actions.includes('approve') || false,
    },
    {
      label: 'Sözleşme İmzalama',
      icon: 'document-text',
      hasPermission: role.permissions.find(p => p.resource === 'contracts')?.actions.includes('approve') || false,
    },
    {
      label: 'Ödeme Yönetimi',
      icon: 'wallet',
      hasPermission: role.permissions.find(p => p.resource === 'payments')?.actions.includes('approve') || false,
    },
    {
      label: 'Ayarları Düzenleme',
      icon: 'settings',
      hasPermission: role.permissions.find(p => p.resource === 'settings')?.actions.includes('edit') || false,
    },
  ];

  return summaries;
}
