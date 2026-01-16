/**
 * Operasyon Bölümü Tipleri
 *
 * Rol tabanlı operasyon yönetim sistemi için tip tanımlamaları.
 * Her bölüm farklı roller tarafından görüntülenebilir ve yönetilebilir.
 */

// ============================================
// BÖLÜM TİPLERİ
// ============================================

/**
 * Operasyon bölümü tipleri
 */
export type OperationSectionType =
  | 'payments'      // Ödemeler
  | 'accommodation' // Konaklama
  | 'transport'     // Ulaşım
  | 'technical'     // Teknik
  | 'catering'      // Catering
  | 'security';     // Güvenlik

/**
 * Bölüm durumu
 */
export type SectionStatus = 'planning' | 'assigned' | 'in_progress' | 'completed';

/**
 * Yetki seviyesi
 */
export type PermissionLevel = 'none' | 'view' | 'edit' | 'full';

/**
 * Taraf tipi
 */
export type PartyType = 'booking' | 'organizer' | 'provider';

// ============================================
// BÖLÜM YAPILANDIRMASI
// ============================================

/**
 * Bölüm meta bilgileri
 */
export interface SectionMeta {
  type: OperationSectionType;
  name: string;
  icon: string;
  color: string;
  gradient: [string, string];
  description: string;
}

/**
 * Varsayılan bölüm meta bilgileri
 */
export const SECTION_META: Record<OperationSectionType, SectionMeta> = {
  payments: {
    type: 'payments',
    name: 'Ödemeler',
    icon: 'wallet-outline',
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
    description: 'Finansal işlemler, fatura ve ödeme takibi',
  },
  accommodation: {
    type: 'accommodation',
    name: 'Konaklama',
    icon: 'bed-outline',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
    description: 'Otel rezervasyonları ve oda planlaması',
  },
  transport: {
    type: 'transport',
    name: 'Ulaşım',
    icon: 'car-outline',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
    description: 'Transfer, araç ve uçuş planlaması',
  },
  technical: {
    type: 'technical',
    name: 'Teknik',
    icon: 'hardware-chip-outline',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB'],
    description: 'Ses, ışık, sahne ve backline',
  },
  catering: {
    type: 'catering',
    name: 'Catering',
    icon: 'restaurant-outline',
    color: '#EC4899',
    gradient: ['#EC4899', '#DB2777'],
    description: 'Yemek, içecek ve backstage servisi',
  },
  security: {
    type: 'security',
    name: 'Güvenlik',
    icon: 'shield-checkmark-outline',
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
    description: 'Güvenlik planı ve personel koordinasyonu',
  },
};

// ============================================
// ANA VERİ YAPILARI
// ============================================

/**
 * Provider bilgisi
 */
export interface SectionProvider {
  id: string;
  name: string;
  logo: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
}

/**
 * Operasyon bölümü
 */
export interface OperationSection {
  id: string;
  type: OperationSectionType;
  eventId: string;

  // Provider bilgisi (null = atanmamış)
  provider: SectionProvider | null;

  // Durum
  status: SectionStatus;

  // Erişim yetkisi olan roller
  accessRoles: {
    booking: string[];    // ['booking_admin', 'tour_manager']
    organizer: string[];  // ['org_admin', 'event_coordinator']
    provider: string[];   // ['provider_admin', 'field_manager']
  };

  // İçerik
  requirements: SectionRequirement[];
  tasks: SectionTask[];
  notes: SectionNote[];
  documents: SectionDocument[];

  // Bölüme özel veriler
  customData?: Record<string, any>;

  // Özet bilgiler (UI için)
  summary?: {
    label: string;
    value: string;
    subLabel?: string;
  };

  // Meta
  createdAt: string;
  updatedAt: string;
}

// ============================================
// İÇERİK YAPILARI
// ============================================

/**
 * Gereksinim
 */
export interface SectionRequirement {
  id: string;
  title: string;
  description: string;
  quantity?: number;
  unit?: string;
  status: 'draft' | 'confirmed' | 'fulfilled';
  priority: 'low' | 'medium' | 'high';
  addedBy: {
    id: string;
    name: string;
    party: PartyType;
  };
  addedAt: string;
  confirmedBy?: {
    id: string;
    name: string;
    party: PartyType;
  };
  confirmedAt?: string;
}

/**
 * Görev
 */
export interface SectionTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: {
    id: string;
    name: string;
    image: string;
    party: PartyType;
  }[];
  dueDate?: string;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;

  // Onay gereksinimleri
  requiresApproval: boolean;
  approvals: {
    party: PartyType;
    role: string;
    approved: boolean;
    approvedBy?: string;
    approvedAt?: string;
  }[];

  // Checklist
  checklist?: {
    id: string;
    text: string;
    completed: boolean;
  }[];

  // Yorumlar
  comments?: {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    authorImage: string;
    authorParty: PartyType;
    createdAt: string;
  }[];

  createdAt: string;
  updatedAt: string;
}

/**
 * Not
 */
export interface SectionNote {
  id: string;
  text: string;
  isPinned: boolean;
  author: {
    id: string;
    name: string;
    image: string;
    party: PartyType;
  };
  createdAt: string;
  updatedAt?: string;
  mentions?: string[]; // user IDs
}

/**
 * Döküman
 */
export interface SectionDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'spreadsheet' | 'document' | 'other';
  url: string;
  size: number;
  uploadedBy: {
    id: string;
    name: string;
    party: PartyType;
  };
  uploadedAt: string;
  category?: string;
}

// ============================================
// BÖLÜME ÖZEL VERİLER
// ============================================

/**
 * Konaklama bölümü özel verileri
 */
export interface AccommodationData {
  hotel?: {
    name: string;
    address: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    confirmationNumber?: string;
  };
  rooms: {
    id: string;
    type: string;
    quantity: number;
    guests: string[];
    notes?: string;
  }[];
}

/**
 * Ulaşım bölümü özel verileri
 */
export interface TransportData {
  transfers: {
    id: string;
    type: 'airport' | 'venue' | 'hotel' | 'other';
    from: string;
    to: string;
    datetime: string;
    vehicle: string;
    passengers: string[];
    driverName?: string;
    driverPhone?: string;
  }[];
  flights?: {
    id: string;
    airline: string;
    flightNumber: string;
    departure: {
      airport: string;
      datetime: string;
    };
    arrival: {
      airport: string;
      datetime: string;
    };
    passengers: string[];
    pnr?: string;
  }[];
}

/**
 * Ödemeler bölümü özel verileri
 */
export interface PaymentsData {
  totalAmount: number;
  paidAmount: number;
  currency: string;
  payments: {
    id: string;
    amount: number;
    date: string;
    status: 'pending' | 'completed' | 'failed';
    method: string;
    description?: string;
    invoiceId?: string;
  }[];
  invoices: {
    id: string;
    number: string;
    amount: number;
    dueDate: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    pdfUrl?: string;
  }[];
}

/**
 * Teknik bölümü özel verileri
 */
export interface TechnicalData {
  equipment: {
    category: string;
    items: {
      id: string;
      name: string;
      quantity: number;
      status: 'requested' | 'confirmed' | 'delivered' | 'setup';
    }[];
  }[];
  rider?: {
    url: string;
    uploadedAt: string;
    status: 'pending' | 'approved' | 'revision_needed';
  };
  stageplan?: {
    url: string;
    uploadedAt: string;
  };
}

/**
 * Catering bölümü özel verileri
 */
export interface CateringData {
  meals: {
    id: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'backstage';
    datetime: string;
    location: string;
    headcount: number;
    menu?: string[];
    dietaryNotes?: string;
  }[];
  beverages?: {
    backstageItems: string[];
    greenRoomItems: string[];
  };
}

/**
 * Güvenlik bölümü özel verileri
 */
export interface SecurityData {
  personnel: {
    total: number;
    positions: {
      role: string;
      count: number;
      location?: string;
    }[];
  };
  briefingTime?: string;
  accessLevels?: {
    name: string;
    color: string;
    areas: string[];
  }[];
  emergencyContacts?: {
    name: string;
    role: string;
    phone: string;
  }[];
}

// ============================================
// ETKİNLİK OPERASYONU
// ============================================

/**
 * Etkinlik operasyonu (tüm bölümleri içerir)
 */
export interface EventOperations {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;

  // Taraflar
  parties: {
    booking: {
      companyId: string;
      companyName: string;
      companyLogo: string;
    };
    organizer: {
      companyId: string;
      companyName: string;
      companyLogo: string;
    };
    artist?: {
      artistId: string;
      artistName: string;
      artistImage: string;
    };
  };

  // Bölümler
  sections: OperationSection[];

  // Genel durum
  overallStatus: 'preparation' | 'ready' | 'in_progress' | 'completed';

  // Meta
  createdAt: string;
  updatedAt: string;
}

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

/**
 * Bölüm meta bilgisini döndürür
 */
export const getSectionMeta = (type: OperationSectionType): SectionMeta => {
  return SECTION_META[type];
};

/**
 * Bölüm durumu etiketini döndürür
 */
export const getSectionStatusLabel = (status: SectionStatus): string => {
  const labels: Record<SectionStatus, string> = {
    planning: 'Planlama',
    assigned: 'Atandı',
    in_progress: 'Devam Ediyor',
    completed: 'Tamamlandı',
  };
  return labels[status];
};

/**
 * Bölüm durumu rengini döndürür
 */
export const getSectionStatusColor = (status: SectionStatus): string => {
  const colors: Record<SectionStatus, string> = {
    planning: '#F59E0B',
    assigned: '#3B82F6',
    in_progress: '#8B5CF6',
    completed: '#10B981',
  };
  return colors[status];
};
