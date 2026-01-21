/**
 * Company and Company Member Types
 *
 * Firma tabanlı hesap yapısı için tip tanımları
 */

import { Timestamp } from 'firebase/firestore';

// Company Types
export type CompanyType = 'organizer' | 'provider' | 'dual';

// Company Member Status
export type CompanyMemberStatus = 'active' | 'pending' | 'inactive';

// Company Member Role Names
export type CompanyMemberRoleName = 'Sahip' | 'Yönetici' | 'Ekip Üyesi' | 'Muhasebeci';

// Permission Types
export type CompanyPermission =
  | 'view_offers'
  | 'send_offers'
  | 'accept_offers'
  | 'reject_offers'
  | 'view_events'
  | 'create_events'
  | 'edit_events'
  | 'delete_events'
  | 'view_team'
  | 'manage_team'
  | 'invite_members'
  | 'remove_members'
  | 'view_finance'
  | 'manage_finance'
  | 'view_messages'
  | 'send_messages'
  | 'view_contracts'
  | 'sign_contracts'
  | 'view_analytics'
  | 'manage_company'
  | 'delete_company';

/**
 * Company Document Interface
 * Firestore'da companies koleksiyonunda saklanır
 */
export interface CompanyDocument {
  id: string;
  name: string;                    // Firma adı
  logo?: string;                   // Firma logosu URL
  type: CompanyType;

  // İletişim bilgileri
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;

  // Provider için
  serviceCategories?: string[];    // ['booking', 'technical', 'catering']
  serviceRegions?: string[];       // ['Istanbul', 'Ankara', 'Izmir']

  // Detaylar
  foundedYear?: string;
  employeeCount?: string;
  bio?: string;
  coverImage?: string;

  // Sosyal medya
  socialMedia?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };

  // Çalışma saatleri
  workingHours?: {
    day: string;
    enabled: boolean;
    start: string;
    end: string;
  }[];

  // İstatistikler (cache)
  stats?: {
    totalEvents?: number;
    completedEvents?: number;
    totalOffers?: number;
    acceptedOffers?: number;
    rating?: number;
    reviewCount?: number;
  };

  // Meta
  ownerId: string;                 // Firma sahibinin userId'si
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  isVerified: boolean;
  isActive: boolean;
}

/**
 * Company Member Document Interface
 * Firestore'da company_members koleksiyonunda saklanır
 */
export interface CompanyMemberDocument {
  id: string;
  companyId: string;
  userId: string;

  // Rol bilgileri
  roleId: string;
  roleName: CompanyMemberRoleName;
  permissions: CompanyPermission[];

  // Durum
  status: CompanyMemberStatus;

  // Davet bilgileri
  invitedBy: string;               // Davet eden userId
  invitedAt: Timestamp | Date;
  joinedAt?: Timestamp | Date;

  // Meta
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

/**
 * Company Role Definition
 * Rollerin varsayılan yetkileri
 */
export interface CompanyRoleDefinition {
  id: string;
  name: CompanyMemberRoleName;
  description: string;
  permissions: CompanyPermission[];
  isDefault?: boolean;
  canBeDeleted?: boolean;
}

/**
 * Default Company Roles
 */
export const DEFAULT_COMPANY_ROLES: CompanyRoleDefinition[] = [
  {
    id: 'owner',
    name: 'Sahip',
    description: 'Tüm yetkiler, firma silme, üye çıkarma',
    permissions: [
      'view_offers', 'send_offers', 'accept_offers', 'reject_offers',
      'view_events', 'create_events', 'edit_events', 'delete_events',
      'view_team', 'manage_team', 'invite_members', 'remove_members',
      'view_finance', 'manage_finance',
      'view_messages', 'send_messages',
      'view_contracts', 'sign_contracts',
      'view_analytics',
      'manage_company', 'delete_company',
    ],
    isDefault: true,
    canBeDeleted: false,
  },
  {
    id: 'manager',
    name: 'Yönetici',
    description: 'Teklif gönderme/kabul, etkinlik yönetimi, üye davet',
    permissions: [
      'view_offers', 'send_offers', 'accept_offers', 'reject_offers',
      'view_events', 'create_events', 'edit_events',
      'view_team', 'invite_members',
      'view_finance',
      'view_messages', 'send_messages',
      'view_contracts', 'sign_contracts',
      'view_analytics',
    ],
    canBeDeleted: false,
  },
  {
    id: 'team_member',
    name: 'Ekip Üyesi',
    description: 'Teklif görüntüleme, chat, görev tamamlama',
    permissions: [
      'view_offers',
      'view_events',
      'view_team',
      'view_messages', 'send_messages',
      'view_contracts',
    ],
    canBeDeleted: false,
  },
  {
    id: 'accountant',
    name: 'Muhasebeci',
    description: 'Finansal raporlar, ödemeler',
    permissions: [
      'view_offers',
      'view_events',
      'view_finance', 'manage_finance',
      'view_contracts',
      'view_analytics',
    ],
    canBeDeleted: false,
  },
];

/**
 * Company Invitation Interface
 * Bekleyen davetler için
 */
export interface CompanyInvitation {
  id: string;
  companyId: string;
  companyName: string;
  email: string;
  phone?: string;
  roleId: string;
  roleName: CompanyMemberRoleName;
  invitedBy: string;
  inviterName: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  token: string;
  createdAt: Timestamp | Date;
  expiresAt: Timestamp | Date;
}

/**
 * User Profile Extension
 * Mevcut UserProfile'a eklenecek alanlar
 */
export interface UserCompanyExtension {
  companyIds?: string[];           // Kullanıcının üye olduğu firmalar
  primaryCompanyId?: string;       // Aktif firma
}

/**
 * Offer Company Fields
 * FirestoreOffer'a eklenecek firma alanları
 */
export interface OfferCompanyFields {
  // Organizatör firma bilgileri
  organizerCompanyId?: string;
  organizerCompanyName?: string;
  organizerCompanyLogo?: string;
  organizerUserId: string;
  organizerUserName: string;
  organizerUserRole?: string;

  // Provider firma bilgileri
  providerCompanyId?: string;
  providerCompanyName?: string;
  providerCompanyLogo?: string;
  providerUserId: string;
  providerUserName: string;
  providerUserRole?: string;
}

/**
 * Conversation Company Fields
 * FirestoreConversation'a eklenecek firma alanları
 */
export interface ConversationCompanyFields {
  participantCompanyIds?: Record<string, string>;   // userId -> companyId
  participantCompanyNames?: Record<string, string>; // userId -> companyName
  participantCompanyLogos?: Record<string, string>; // userId -> companyLogo
  participantRoles?: Record<string, string>;        // userId -> role
}

/**
 * Company with Members (populated)
 * Üyeleri ile birlikte firma bilgisi
 */
export interface CompanyWithMembers extends CompanyDocument {
  members: CompanyMemberWithUser[];
  pendingInvitations: CompanyInvitation[];
}

/**
 * Company Member with User info
 */
export interface CompanyMemberWithUser extends CompanyMemberDocument {
  userName: string;
  userEmail: string;
  userImage?: string;
  userPhone?: string;
}

/**
 * Create Company Params
 */
export interface CreateCompanyParams {
  name: string;
  type: CompanyType;
  logo?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  serviceCategories?: string[];
  serviceRegions?: string[];
  foundedYear?: string;
  employeeCount?: string;
  bio?: string;
}

/**
 * Update Company Params
 */
export interface UpdateCompanyParams extends Partial<CreateCompanyParams> {
  socialMedia?: CompanyDocument['socialMedia'];
  workingHours?: CompanyDocument['workingHours'];
  coverImage?: string;
}

/**
 * Invite Member Params
 */
export interface InviteMemberParams {
  companyId: string;
  email?: string;
  phone?: string;
  roleId: string;
  message?: string;
}

/**
 * Helper Functions
 */

// Rol ID'sine göre rol tanımını getir
export function getCompanyRoleById(roleId: string): CompanyRoleDefinition | undefined {
  return DEFAULT_COMPANY_ROLES.find(r => r.id === roleId);
}

// Rol adına göre rol tanımını getir
export function getCompanyRoleByName(roleName: CompanyMemberRoleName): CompanyRoleDefinition | undefined {
  return DEFAULT_COMPANY_ROLES.find(r => r.name === roleName);
}

// Kullanıcının belirli bir yetkisi var mı kontrol et
export function hasCompanyPermission(
  permissions: CompanyPermission[],
  permission: CompanyPermission
): boolean {
  return permissions.includes(permission);
}

// Kullanıcının birden fazla yetkisi var mı kontrol et (hepsi gerekli)
export function hasAllCompanyPermissions(
  permissions: CompanyPermission[],
  requiredPermissions: CompanyPermission[]
): boolean {
  return requiredPermissions.every(p => permissions.includes(p));
}

// Kullanıcının birden fazla yetkisinden en az biri var mı kontrol et
export function hasAnyCompanyPermission(
  permissions: CompanyPermission[],
  requiredPermissions: CompanyPermission[]
): boolean {
  return requiredPermissions.some(p => permissions.includes(p));
}

/**
 * Display name helper for chat/offers
 * Format: "Firma Adı - Kişi Adı (Rol)" veya sadece "Kişi Adı"
 */
export function getDisplayName(
  companyName?: string,
  userName?: string,
  userRole?: string
): string {
  if (!companyName) {
    return userName || 'Bilinmeyen';
  }

  let displayName = `${companyName} - ${userName || 'Kullanıcı'}`;

  if (userRole) {
    displayName += ` (${userRole})`;
  }

  return displayName;
}
