// Admin Panel Tip Tanımları

import type { ServiceCategory, OperationSubCategory } from './index';

// ============================================
// ADMIN ROL TİPLERİ
// ============================================

// Admin rol tipleri
export type AdminRoleType = 'super_admin' | 'moderator' | 'finance' | 'support' | 'custom';

// Admin yetki kaynakları
export type AdminPermissionResource =
  | 'users'
  | 'events'
  | 'finance'
  | 'reports'
  | 'roles'
  | 'settings'
  | 'audit_logs';

// Admin yetki aksiyonları
export type AdminPermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';

// Admin yetki tanımı
export interface AdminPermission {
  resource: AdminPermissionResource;
  actions: AdminPermissionAction[];
}

// Admin rol tanımı
export interface AdminRole {
  id: string;
  name: string;
  type: AdminRoleType;
  description: string;
  permissions: AdminPermission[];
  isSystem: boolean; // Sistem tarafından oluşturulan roller silinemez
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// KULLANICI YÖNETİMİ TİPLERİ
// ============================================

// Kullanıcı doğrulama durumu
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// Kullanıcı hesap durumu
export type UserAccountStatus = 'active' | 'suspended' | 'banned' | 'pending';

// Admin panel kullanıcı görünümü
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'organizer' | 'provider' | 'both';
  company?: string;
  location?: string;

  // Durum bilgileri
  status: UserAccountStatus;
  verificationStatus: VerificationStatus;
  verified: boolean;

  // Provider bilgileri
  providerCategory?: ServiceCategory;
  providerSubCategory?: OperationSubCategory;

  // Admin bilgileri
  isAdmin?: boolean;
  adminRoleId?: string;
  adminRole?: AdminRole;

  // Askıya alma bilgileri
  isSuspended?: boolean;
  suspendedAt?: string;
  suspendedBy?: string;
  suspendReason?: string;

  // İstatistikler
  stats?: {
    totalEvents: number;
    totalOffers: number;
    totalRevenue: number;
    rating: number;
    completedJobs: number;
  };

  // Meta
  memberSince: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// ETKİNLİK MODERASYONU TİPLERİ
// ============================================

// Etkinlik onay durumu
export type EventApprovalStatus = 'pending' | 'approved' | 'rejected';

// Moderasyon önceliği
export type ModerationPriority = 'low' | 'medium' | 'high' | 'urgent';

// Admin panel etkinlik görünümü
export interface AdminEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  city: string;
  district: string;
  venue: string;
  status: 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled';
  budget?: number;

  // Organizatör bilgileri
  organizerId: string;
  organizerName: string;
  organizerImage?: string;

  // Moderasyon bilgileri
  approvalStatus: EventApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  // İşaretleme
  isFlagged: boolean;
  flaggedAt?: string;
  flaggedBy?: string;
  flagReason?: string;

  // Meta
  createdAt: string;
  updatedAt?: string;
}

// Moderasyon kuyruğu öğesi
export interface ModerationQueueItem {
  id: string;
  type: 'event' | 'user';
  targetId: string;
  targetName: string;
  targetImage?: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  priority: ModerationPriority;
  reportedBy?: string;
  reportedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  resolution?: string;
}

// ============================================
// FİNANSAL TİPLER
// ============================================

// Ödeme durumu
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Ödeme talebi
export interface Payout {
  id: string;
  providerId: string;
  providerName: string;
  providerImage?: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  eventIds: string[];
  eventNames: string[];
  commissionAmount: number;
  commissionRate: number;
  netAmount: number;

  // Banka bilgileri
  bankName?: string;
  iban?: string;

  // İşlem bilgileri
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;

  // Meta
  createdAt: string;
  updatedAt?: string;
}

// Finansal özet
export interface FinancialSummary {
  totalRevenue: number;
  totalCommission: number;
  totalPayouts: number;
  pendingPayouts: number;
  pendingPayoutCount: number;
  monthlyRevenue: number;
  monthlyGrowth: number;
}

// Gelir kategorisi dağılımı
export interface RevenueCategoryBreakdown {
  category: ServiceCategory | OperationSubCategory;
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

// Aylık gelir verisi
export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  commission: number;
  payouts: number;
}

// ============================================
// AUDIT LOG TİPLERİ
// ============================================

// Audit log aksiyonları
export type AuditAction =
  | 'user.create'
  | 'user.update'
  | 'user.suspend'
  | 'user.unsuspend'
  | 'user.ban'
  | 'user.verify'
  | 'user.reject'
  | 'user.delete'
  | 'user.role_change'
  | 'event.approve'
  | 'event.reject'
  | 'event.flag'
  | 'event.unflag'
  | 'event.delete'
  | 'payout.process'
  | 'payout.complete'
  | 'payout.fail'
  | 'payout.cancel'
  | 'role.create'
  | 'role.update'
  | 'role.delete'
  | 'settings.update';

// Audit log kaydı
export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: AuditAction;
  targetType: 'user' | 'event' | 'payout' | 'role' | 'settings';
  targetId: string;
  targetName?: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// ============================================
// DASHBOARD TİPLERİ
// ============================================

// KPI kartı verisi
export interface AdminKPI {
  id: string;
  label: string;
  value: number | string;
  change?: number; // Yüzdelik değişim
  changeLabel?: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

// Dashboard istatistikleri
export interface AdminDashboardStats {
  // Kullanıcı istatistikleri
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  activeUsers: number;
  pendingVerifications: number;
  suspendedUsers: number;

  // Etkinlik istatistikleri
  totalEvents: number;
  activeEvents: number;
  pendingApproval: number;
  flaggedEvents: number;

  // Finansal istatistikler
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayouts: number;
  pendingPayoutAmount: number;

  // Destek istatistikleri
  openTickets: number;
  resolvedToday: number;
}

// Hızlı işlem
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  screen: string;
  params?: Record<string, unknown>;
  badge?: number;
}

// Son aktivite
export interface RecentActivity {
  id: string;
  type: 'user' | 'event' | 'payout' | 'moderation';
  action: string;
  description: string;
  targetId: string;
  targetName: string;
  targetImage?: string;
  timestamp: string;
  adminName?: string;
}

// ============================================
// FİLTRE VE ARAMA TİPLERİ
// ============================================

// Kullanıcı filtreleri
export interface UserFilters {
  search?: string;
  role?: 'organizer' | 'provider' | 'both' | 'all';
  status?: UserAccountStatus | 'all';
  verificationStatus?: VerificationStatus | 'all';
  category?: ServiceCategory | 'all';
  isAdmin?: boolean;
  sortBy?: 'name' | 'createdAt' | 'lastActiveAt' | 'revenue';
  sortOrder?: 'asc' | 'desc';
}

// Etkinlik filtreleri
export interface EventFilters {
  search?: string;
  status?: 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled' | 'all';
  approvalStatus?: EventApprovalStatus | 'all';
  isFlagged?: boolean;
  dateRange?: { start: string; end: string };
  sortBy?: 'date' | 'createdAt' | 'budget';
  sortOrder?: 'asc' | 'desc';
}

// Ödeme filtreleri
export interface PayoutFilters {
  search?: string;
  status?: PayoutStatus | 'all';
  dateRange?: { start: string; end: string };
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'amount' | 'requestedAt' | 'completedAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// CONTEXT TİPLERİ
// ============================================

// Admin Context değerleri
export interface AdminContextValue {
  // Mevcut admin bilgileri
  currentAdmin: AdminUser | null;
  adminRole: AdminRole | null;
  isLoading: boolean;

  // Yetki kontrolleri
  hasAdminPermission: (resource: AdminPermissionResource, action: AdminPermissionAction) => boolean;
  canManageUsers: () => boolean;
  canModerateEvents: () => boolean;
  canManageFinance: () => boolean;
  canManageRoles: () => boolean;
  canViewReports: () => boolean;
  canViewAuditLogs: () => boolean;

  // Dashboard
  dashboardStats: AdminDashboardStats | null;
  refreshDashboard: () => Promise<void>;

  // Audit logging
  logAction: (
    action: AuditAction,
    targetType: 'user' | 'event' | 'payout' | 'role' | 'settings',
    targetId: string,
    details?: { previousValue?: Record<string, unknown>; newValue?: Record<string, unknown>; description?: string }
  ) => Promise<void>;
}

// ============================================
// NAVIGATION TİPLERİ
// ============================================

// Admin Stack Param List
export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminUserDetail: { userId: string };
  AdminEvents: undefined;
  AdminEventDetail: { eventId: string };
  AdminFinance: undefined;
  AdminReports: undefined;
  AdminRoles: undefined;
  AdminRoleDetail: { roleId: string };
  AdminSettings: undefined;
  AdminAuditLogs: undefined;
};

// ============================================
// EXPORT TİPLERİ
// ============================================

// Rapor export formatı
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

// Export seçenekleri
export interface ExportOptions {
  format: ExportFormat;
  dateRange?: { start: string; end: string };
  includeFields?: string[];
  filters?: UserFilters | EventFilters | PayoutFilters;
}
