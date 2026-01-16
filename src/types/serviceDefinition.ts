/**
 * Modüler Hizmet Mimarisi - Hizmet Tanımı Tipleri
 *
 * Bu dosya, hizmet tanımlarının tip tanımlarını içerir.
 * Her hizmet, modüllerden oluşan bir kompozisyondur ve
 * admin tarafından yapılandırılabilir.
 */

import { ServiceCategory, OperationSubCategory } from './index';
import { ModuleInstance, ModuleType, FormModuleType } from './modules';

// ============================================
// ROL VE İZİN TİPLERİ
// ============================================

/**
 * Sistem rolleri
 */
export type SystemRole =
  | 'super_admin'      // Süper admin - tüm yetkiler
  | 'admin'            // Admin - hizmet yönetimi
  | 'organizer'        // Organizatör
  | 'provider'         // Hizmet sağlayıcı
  | 'team_member';     // Ekip üyesi

/**
 * İzin türleri
 */
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve';

/**
 * Hizmet izinleri
 */
export interface ServicePermissions {
  canView: SystemRole[];
  canCreate: SystemRole[];
  canEdit: SystemRole[];
  canDelete: SystemRole[];
  canApprove: SystemRole[];
}

// ============================================
// HİZMET AYARLARI
// ============================================

/**
 * Hizmet ayarları
 */
export interface ServiceSettings {
  // Teklif ayarları
  allowCounterOffer: boolean;       // Karşı teklif izni
  maxCounterOffers?: number;        // Maksimum karşı teklif sayısı
  requireApproval: boolean;         // Onay gerekli mi?
  approvalRoles?: SystemRole[];     // Onay verebilecek roller

  // Süre ayarları
  maxOfferDays: number;             // Teklif geçerlilik süresi (gün)
  autoExpireDays: number;           // Otomatik süre dolumu (gün)
  reminderDays?: number[];          // Hatırlatma günleri [3, 1]

  // Sözleşme ayarları
  requireContract: boolean;         // Sözleşme zorunlu mu?
  contractTemplateId?: string;      // Sözleşme şablonu ID

  // Ödeme ayarları
  requireDeposit: boolean;          // Kapora zorunlu mu?
  depositPercentage?: number;       // Kapora yüzdesi (0-100)
  paymentMethods?: PaymentMethod[]; // İzin verilen ödeme yöntemleri

  // Diğer ayarlar
  allowMultipleOffers?: boolean;    // Birden fazla teklif izni
  requireRider?: boolean;           // Rider zorunlu mu? (booking için)
  requireInsurance?: boolean;       // Sigorta zorunlu mu?
  minLeadTimeDays?: number;         // Minimum hazırlık süresi (gün)
}

/**
 * Ödeme yöntemi
 */
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'crypto';

// ============================================
// HİZMET TANIMI
// ============================================

/**
 * Hizmet tanımı
 * Admin tarafından yapılandırılabilir hizmet şeması
 */
export interface ServiceDefinition {
  // Temel bilgiler
  id: string;
  category: ServiceCategory;
  subCategory?: OperationSubCategory;
  name: string;                           // "Sanatçı / Booking", "Ses Sistemi", vb.
  shortName?: string;                     // Kısa ad
  description: string;
  icon: string;                           // Ionicons icon name
  gradient: [string, string];             // Gradient renkleri
  color?: string;                         // Ana renk

  // Durum
  isActive: boolean;                      // Aktif mi?
  isVisible: boolean;                     // Listede görünür mü?
  sortOrder: number;                      // Sıralama

  // Modül Konfigürasyonları
  detailModules: ModuleInstance[];        // Detay görüntüleme modülleri
  formModules: ModuleInstance[];          // Teklif formu modülleri
  operationModules?: ModuleInstance[];    // Operasyon yönetimi modülleri

  // İzinler ve Ayarlar
  permissions: ServicePermissions;
  settings: ServiceSettings;

  // Meta bilgiler
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

/**
 * Hizmet özeti (liste görünümü için)
 */
export interface ServiceSummary {
  id: string;
  name: string;
  shortName?: string;
  category: ServiceCategory;
  subCategory?: OperationSubCategory;
  icon: string;
  gradient: [string, string];
  isActive: boolean;
  moduleCount: number;
}

// ============================================
// HİZMET GRUBU
// ============================================

/**
 * Hizmet grubu
 * Kategorilere göre gruplandırılmış hizmetler
 */
export interface ServiceGroup {
  category: ServiceCategory;
  categoryName: string;
  categoryIcon: string;
  services: ServiceSummary[];
  subGroups?: ServiceSubGroup[];
}

/**
 * Alt hizmet grubu
 * Operasyon kategorisi için alt kategoriler
 */
export interface ServiceSubGroup {
  subCategory: OperationSubCategory;
  subCategoryName: string;
  subCategoryIcon: string;
  services: ServiceSummary[];
}

// ============================================
// VARSAYILAN HİZMET ŞABLONLARI
// ============================================

/**
 * Varsayılan modül seti tipleri
 */
export type DefaultModuleSet =
  | 'basic'              // Temel: datetime, budget, contact
  | 'standard'           // Standart: + venue, participant
  | 'full'               // Tam: + document, team, timeline
  | 'custom';            // Özel: Admin tarafından seçilen

/**
 * Hizmet şablonu
 * Yeni hizmet oluştururken kullanılabilecek önceden tanımlanmış şablonlar
 */
export interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  subCategory?: OperationSubCategory;
  moduleSet: DefaultModuleSet;
  modules: {
    detail: ModuleType[];
    form: FormModuleType[];
  };
  settings: Partial<ServiceSettings>;
}

// ============================================
// HİZMET DURUMU
// ============================================

/**
 * Hizmet durumu (bir etkinlikteki hizmet için)
 */
export type ServiceStatus =
  | 'draft'              // Taslak
  | 'pending'            // Beklemede
  | 'requesting'         // Teklif isteniyor
  | 'offered'            // Teklif alındı
  | 'negotiating'        // Pazarlık sürecinde
  | 'accepted'           // Kabul edildi
  | 'confirmed'          // Onaylandı
  | 'in_progress'        // Devam ediyor
  | 'completed'          // Tamamlandı
  | 'cancelled';         // İptal edildi

/**
 * Hizmet durumu konfigürasyonu
 */
export interface ServiceStatusConfig {
  status: ServiceStatus;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  allowedTransitions: ServiceStatus[];
}

/**
 * Varsayılan durum konfigürasyonları
 */
export const SERVICE_STATUS_CONFIG: Record<ServiceStatus, ServiceStatusConfig> = {
  draft: {
    status: 'draft',
    label: 'Taslak',
    color: '#64748B',
    bgColor: 'rgba(100, 116, 139, 0.1)',
    icon: 'document-outline',
    allowedTransitions: ['pending', 'cancelled'],
  },
  pending: {
    status: 'pending',
    label: 'Beklemede',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    icon: 'time-outline',
    allowedTransitions: ['requesting', 'cancelled'],
  },
  requesting: {
    status: 'requesting',
    label: 'Teklif İsteniyor',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    icon: 'send-outline',
    allowedTransitions: ['offered', 'cancelled'],
  },
  offered: {
    status: 'offered',
    label: 'Teklif Var',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    icon: 'pricetag-outline',
    allowedTransitions: ['negotiating', 'accepted', 'cancelled'],
  },
  negotiating: {
    status: 'negotiating',
    label: 'Pazarlık',
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.1)',
    icon: 'swap-horizontal-outline',
    allowedTransitions: ['accepted', 'cancelled'],
  },
  accepted: {
    status: 'accepted',
    label: 'Kabul Edildi',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: 'checkmark-circle-outline',
    allowedTransitions: ['confirmed', 'cancelled'],
  },
  confirmed: {
    status: 'confirmed',
    label: 'Onaylandı',
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.1)',
    icon: 'shield-checkmark-outline',
    allowedTransitions: ['in_progress', 'cancelled'],
  },
  in_progress: {
    status: 'in_progress',
    label: 'Devam Ediyor',
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    icon: 'play-circle-outline',
    allowedTransitions: ['completed', 'cancelled'],
  },
  completed: {
    status: 'completed',
    label: 'Tamamlandı',
    color: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    icon: 'checkmark-done-circle-outline',
    allowedTransitions: [],
  },
  cancelled: {
    status: 'cancelled',
    label: 'İptal Edildi',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    icon: 'close-circle-outline',
    allowedTransitions: [],
  },
};

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

/**
 * Hizmet durumu konfigürasyonunu döndürür
 */
export const getServiceStatusConfig = (status: ServiceStatus): ServiceStatusConfig => {
  return SERVICE_STATUS_CONFIG[status];
};

/**
 * Durum geçişinin geçerli olup olmadığını kontrol eder
 */
export const canTransitionTo = (currentStatus: ServiceStatus, newStatus: ServiceStatus): boolean => {
  const config = SERVICE_STATUS_CONFIG[currentStatus];
  return config.allowedTransitions.includes(newStatus);
};

/**
 * Varsayılan hizmet izinlerini döndürür
 */
export const getDefaultPermissions = (): ServicePermissions => ({
  canView: ['super_admin', 'admin', 'organizer', 'provider', 'team_member'],
  canCreate: ['super_admin', 'admin', 'organizer'],
  canEdit: ['super_admin', 'admin', 'organizer', 'provider'],
  canDelete: ['super_admin', 'admin'],
  canApprove: ['super_admin', 'admin', 'organizer'],
});

/**
 * Varsayılan hizmet ayarlarını döndürür
 */
export const getDefaultSettings = (): ServiceSettings => ({
  allowCounterOffer: true,
  maxCounterOffers: 3,
  requireApproval: false,
  maxOfferDays: 7,
  autoExpireDays: 14,
  reminderDays: [3, 1],
  requireContract: false,
  requireDeposit: false,
  depositPercentage: 30,
  paymentMethods: ['bank_transfer', 'credit_card'],
  allowMultipleOffers: true,
  minLeadTimeDays: 3,
});
