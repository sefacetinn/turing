/**
 * Operasyon Bölümleri Veri Yapıları
 *
 * Operasyon merkezi için veri yapıları ve boş başlangıç verileri
 */

import {
  EventOperations,
  OperationSection,
  AccommodationData,
  TransportData,
  PaymentsData,
  TechnicalData,
  CateringData,
  SecurityData,
} from '../types/operationSection';

// ============================================
// BOŞ ETKİNLİK OPERASYONLARI (VARSAYILAN)
// ============================================

/**
 * Boş etkinlik operasyonları - Gerçek veri gelene kadar kullanılır
 */
export const sampleEventOperations: EventOperations = {
  eventId: '',
  eventTitle: '',
  eventDate: '',
  eventVenue: '',

  parties: {
    booking: {
      companyId: '',
      companyName: '',
      companyLogo: '',
    },
    organizer: {
      companyId: '',
      companyName: '',
      companyLogo: '',
    },
  },

  sections: [],

  overallStatus: 'preparation',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================
// EKİP ÜYELERİ (BOŞ)
// ============================================

/**
 * Operasyon ekibi üyeleri - Gerçek veri gelene kadar boş
 */
export const operationTeamMembers = {
  booking: [],
  organizer: [],
};

/**
 * Mevcut kullanıcı - Gerçek auth'dan alınacak
 */
export const currentOperationUser = {
  id: '',
  name: '',
  image: '',
  party: 'organizer' as const,
  role: '',
  roleLabel: '',
  companyId: '',
  companyName: '',
};

// ============================================
// BÖLÜM EKİPLERİ (BOŞ)
// ============================================

interface SectionTeamMember {
  id: string;
  name: string;
  image: string;
  role: string;
  phone: string;
  party: 'booking' | 'organizer' | 'provider';
}

/**
 * Her bölüm için ekip üyeleri - Boş başlangıç
 */
export const sampleSectionTeams: Record<string, SectionTeamMember[]> = {
  payments: [],
  accommodation: [],
  transport: [],
  technical: [],
  catering: [],
  security: [],
};

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

/**
 * Boş bir operasyon bölümü oluşturur
 */
export function createEmptySection(
  type: string,
  eventId: string
): OperationSection {
  return {
    id: `section-${type}`,
    type: type as any,
    eventId,
    provider: null,
    status: 'planning',
    accessRoles: {
      booking: [],
      organizer: [],
      provider: [],
    },
    requirements: [],
    tasks: [],
    notes: [],
    documents: [],
    customData: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Boş bir etkinlik operasyonu yapısı oluşturur
 */
export function createEmptyEventOperations(
  eventId: string,
  eventTitle: string,
  eventDate: string,
  eventVenue: string
): EventOperations {
  return {
    eventId,
    eventTitle,
    eventDate,
    eventVenue,
    parties: {
      booking: {
        companyId: '',
        companyName: '',
        companyLogo: '',
      },
      organizer: {
        companyId: '',
        companyName: '',
        companyLogo: '',
      },
    },
    sections: [],
    overallStatus: 'preparation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
