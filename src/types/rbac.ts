// RBAC (Role-Based Access Control) Tip Tanımları

import type { ServiceCategory } from './index';

// İzin aksiyonları
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve';

// İzin kaynakları
export type PermissionResource =
  | 'team'
  | 'events'
  | 'offers'
  | 'contracts'
  | 'payments'
  | 'invoices'
  | 'settings'
  | 'tasks';

// İzin tanımı
export interface Permission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

// Organizatör rol tipleri
export type OrganizerRoleType =
  | 'account_admin'      // Hesap Yöneticisi
  | 'event_coordinator'  // Etkinlik Koordinatörü
  | 'finance_manager'    // Finans Yöneticisi
  | 'event_specialist'   // Etkinlik Uzmanı
  | 'assistant';         // Asistan

// Hizmet sağlayıcı rol tipleri
export type ProviderRoleType =
  // Genel
  | 'owner'              // Firma/Mekan Sahibi
  | 'project_manager'    // Proje Yöneticisi
  | 'provider_assistant' // Asistan
  // Booking
  | 'artist_manager'     // Sanatçı Yöneticisi
  | 'tour_manager'       // Tur Menajeri
  | 'production_manager' // Prodüksiyon Amiri
  // Technical
  | 'technical_director' // Teknik Direktör
  | 'field_supervisor'   // Saha Sorumlusu
  // Venue
  | 'venue_manager'      // Mekan Yöneticisi
  | 'sales_rep'          // Satış Temsilcisi
  | 'operations_manager' // Operasyon Müdürü
  | 'receptionist'       // Resepsiyon
  // Catering
  | 'chef'               // Şef
  | 'event_caterer'      // Etkinlik Koordinatörü (Catering)
  | 'head_waiter'        // Garson Şefi
  // Transport
  | 'fleet_manager'      // Filo Yöneticisi
  | 'operations_coordinator' // Operasyon Sorumlusu
  | 'driver';            // Sürücü

export type RoleType = OrganizerRoleType | ProviderRoleType;

// Rol tanımı
export interface Role {
  id: string;
  type: RoleType;
  name: string;              // Türkçe görünen isim
  description: string;
  permissions: Permission[];
  isDefault?: boolean;       // Yeni üyeler için varsayılan
  category?: ServiceCategory; // Provider rolleri için kategori
}

// Üye durumu
export type MemberStatus = 'active' | 'pending' | 'inactive';

// Ekip üyesi
export interface TeamMember {
  id: string;
  odilerId: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: Role;
  status: MemberStatus;
  invitedBy: string;
  invitedAt: string;
  joinedAt?: string;
  lastActiveAt?: string;
}

// Davet durumu
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

// Davet
export interface Invitation {
  id: string;
  email: string;
  name?: string;
  role: Role;
  invitedBy: string;
  inviterName: string;
  invitedAt: string;
  expiresAt: string;
  status: InvitationStatus;
  token: string;
  message?: string;
}

// Organizasyon tipi
export type OrganizationType = 'organizer' | 'provider';

// Organizasyon (şirket/firma)
export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  category?: ServiceCategory;   // Provider için
  logo?: string;
  ownerId: string;
  members: TeamMember[];
  pendingInvitations: Invitation[];
  createdAt: string;
  updatedAt?: string;
}

// RBAC Context değerleri
export interface RBACContextValue {
  // Mevcut kullanıcı bilgileri
  currentUser: TeamMember | null;
  currentOrganization: Organization | null;
  isLoading: boolean;

  // Yetki kontrolleri
  hasPermission: (resource: PermissionResource, action: PermissionAction) => boolean;
  canManageTeam: () => boolean;
  canManageFinance: () => boolean;
  canManageEvents: () => boolean;
  canApproveOffers: () => boolean;

  // Ekip işlemleri
  inviteMember: (email: string, roleId: string, name?: string, message?: string) => Promise<void>;
  updateMemberRole: (memberId: string, roleId: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  resendInvitation: (invitationId: string) => Promise<void>;

  // Roller
  availableRoles: Role[];

  // Refresh
  refreshOrganization: () => Promise<void>;
}

// Yetki özet bilgisi (UI için)
export interface PermissionSummary {
  label: string;
  icon: string;
  hasPermission: boolean;
}

// Rol grubu (UI için kategorizasyon)
export interface RoleGroup {
  title: string;
  roles: Role[];
}
