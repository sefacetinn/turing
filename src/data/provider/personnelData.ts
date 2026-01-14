// Security Personnel Data for Security Providers

export type PersonnelRole = 'security_guard' | 'bodyguard' | 'supervisor' | 'k9_handler' | 'vip_protection' | 'crowd_control';
export type PersonnelStatus = 'active' | 'on_duty' | 'off_duty' | 'on_leave' | 'terminated';
export type ShiftStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface SecurityPersonnel {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  role: PersonnelRole;
  status: PersonnelStatus;
  phone: string;
  email: string;
  dateOfBirth: string;
  hireDate: string;
  rating: number;
  completedShifts: number;

  // Qualifications
  qualifications: {
    armedLicense: boolean;
    armedLicenseExpiry?: string;
    securityCertificate: boolean;
    certificateExpiry?: string;
    firstAid: boolean;
    firstAidExpiry?: string;
    k9Certified: boolean;
    vipProtection: boolean;
    crowdManagement: boolean;
  };

  // Documents
  documents: {
    type: string;
    name: string;
    expiryDate?: string;
    status: 'valid' | 'expiring_soon' | 'expired';
  }[];

  // Physical info (relevant for security)
  physicalInfo: {
    height: number; // cm
    weight: number; // kg
    bloodType: string;
  };

  // Emergency contact
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };

  // Availability
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };

  // Notes
  notes?: string;
}

export interface Shift {
  id: string;
  eventId: string;
  eventName: string;
  venue: string;
  city: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  personnelRequired: number;
  personnelAssigned: ShiftAssignment[];
  briefing?: string;
  specialInstructions?: string;
  hourlyRate: number;
}

export interface ShiftAssignment {
  personnelId: string;
  personnelName: string;
  role: PersonnelRole;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'assigned' | 'checked_in' | 'checked_out' | 'no_show';
}

export interface IncidentReport {
  id: string;
  shiftId: string;
  eventName: string;
  reportedBy: string;
  reportedAt: string;
  incidentTime: string;
  type: 'minor' | 'major' | 'critical';
  category: 'theft' | 'assault' | 'unauthorized_access' | 'medical' | 'property_damage' | 'crowd_control' | 'other';
  description: string;
  actionTaken: string;
  witnesses?: string[];
  attachments?: string[];
  status: 'open' | 'investigating' | 'resolved' | 'closed';
}

// Role display names
export const roleDisplayNames: Record<PersonnelRole, string> = {
  security_guard: 'Güvenlik Görevlisi',
  bodyguard: 'Koruma',
  supervisor: 'Süpervizör',
  k9_handler: 'K9 Görevlisi',
  vip_protection: 'VIP Koruma',
  crowd_control: 'Kalabalık Yönetimi',
};

// Mock Personnel Data
export const mockPersonnel: SecurityPersonnel[] = [
  {
    id: 'per1',
    firstName: 'Mehmet',
    lastName: 'Kaya',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    role: 'supervisor',
    status: 'active',
    phone: '+90 532 111 2233',
    email: 'mehmet.kaya@security.com',
    dateOfBirth: '1985-03-15',
    hireDate: '2018-06-01',
    rating: 4.9,
    completedShifts: 342,
    qualifications: {
      armedLicense: true,
      armedLicenseExpiry: '2025-06-15',
      securityCertificate: true,
      certificateExpiry: '2025-12-01',
      firstAid: true,
      firstAidExpiry: '2024-08-20',
      k9Certified: false,
      vipProtection: true,
      crowdManagement: true,
    },
    documents: [
      { type: 'Silahlı Güvenlik Belgesi', name: 'silahli_belge.pdf', expiryDate: '2025-06-15', status: 'valid' },
      { type: 'Özel Güvenlik Kimliği', name: 'guvenlik_kimlik.pdf', expiryDate: '2025-12-01', status: 'valid' },
      { type: 'İlk Yardım Sertifikası', name: 'ilkyardim.pdf', expiryDate: '2024-08-20', status: 'expiring_soon' },
    ],
    physicalInfo: {
      height: 185,
      weight: 92,
      bloodType: 'A+',
    },
    emergencyContact: {
      name: 'Ayşe Kaya',
      phone: '+90 532 999 8877',
      relationship: 'Eş',
    },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
    },
    notes: 'Deneyimli süpervizör, büyük etkinliklerde koordinasyon yapabilir.',
  },
  {
    id: 'per2',
    firstName: 'Ali',
    lastName: 'Demir',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    role: 'security_guard',
    status: 'active',
    phone: '+90 533 222 3344',
    email: 'ali.demir@security.com',
    dateOfBirth: '1992-07-22',
    hireDate: '2020-03-15',
    rating: 4.7,
    completedShifts: 156,
    qualifications: {
      armedLicense: false,
      securityCertificate: true,
      certificateExpiry: '2025-08-15',
      firstAid: true,
      firstAidExpiry: '2025-03-10',
      k9Certified: false,
      vipProtection: false,
      crowdManagement: true,
    },
    documents: [
      { type: 'Özel Güvenlik Kimliği', name: 'guvenlik_kimlik.pdf', expiryDate: '2025-08-15', status: 'valid' },
      { type: 'İlk Yardım Sertifikası', name: 'ilkyardim.pdf', expiryDate: '2025-03-10', status: 'valid' },
    ],
    physicalInfo: {
      height: 178,
      weight: 82,
      bloodType: 'O+',
    },
    emergencyContact: {
      name: 'Fatma Demir',
      phone: '+90 533 888 7766',
      relationship: 'Anne',
    },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: false,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
  },
  {
    id: 'per3',
    firstName: 'Hasan',
    lastName: 'Yıldırım',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    role: 'vip_protection',
    status: 'on_duty',
    phone: '+90 534 333 4455',
    email: 'hasan.yildirim@security.com',
    dateOfBirth: '1988-11-08',
    hireDate: '2017-01-20',
    rating: 5.0,
    completedShifts: 428,
    qualifications: {
      armedLicense: true,
      armedLicenseExpiry: '2025-09-20',
      securityCertificate: true,
      certificateExpiry: '2025-11-30',
      firstAid: true,
      firstAidExpiry: '2025-05-15',
      k9Certified: false,
      vipProtection: true,
      crowdManagement: true,
    },
    documents: [
      { type: 'Silahlı Güvenlik Belgesi', name: 'silahli_belge.pdf', expiryDate: '2025-09-20', status: 'valid' },
      { type: 'Özel Güvenlik Kimliği', name: 'guvenlik_kimlik.pdf', expiryDate: '2025-11-30', status: 'valid' },
      { type: 'VIP Koruma Sertifikası', name: 'vip_koruma.pdf', status: 'valid' },
    ],
    physicalInfo: {
      height: 190,
      weight: 95,
      bloodType: 'B+',
    },
    emergencyContact: {
      name: 'Zeynep Yıldırım',
      phone: '+90 534 777 6655',
      relationship: 'Eş',
    },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
    notes: 'VIP koruma uzmanı, ünlü isimlerin etkinliklerinde tercih edilir.',
  },
  {
    id: 'per4',
    firstName: 'Emre',
    lastName: 'Çelik',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    role: 'k9_handler',
    status: 'active',
    phone: '+90 535 444 5566',
    email: 'emre.celik@security.com',
    dateOfBirth: '1990-04-12',
    hireDate: '2019-08-10',
    rating: 4.8,
    completedShifts: 203,
    qualifications: {
      armedLicense: false,
      securityCertificate: true,
      certificateExpiry: '2025-07-20',
      firstAid: true,
      firstAidExpiry: '2024-12-15',
      k9Certified: true,
      vipProtection: false,
      crowdManagement: false,
    },
    documents: [
      { type: 'Özel Güvenlik Kimliği', name: 'guvenlik_kimlik.pdf', expiryDate: '2025-07-20', status: 'valid' },
      { type: 'K9 Eğitim Sertifikası', name: 'k9_sertifika.pdf', status: 'valid' },
      { type: 'İlk Yardım Sertifikası', name: 'ilkyardim.pdf', expiryDate: '2024-12-15', status: 'expiring_soon' },
    ],
    physicalInfo: {
      height: 175,
      weight: 78,
      bloodType: 'AB+',
    },
    emergencyContact: {
      name: 'Murat Çelik',
      phone: '+90 535 666 5544',
      relationship: 'Kardeş',
    },
    availability: {
      monday: true,
      tuesday: false,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
    },
    notes: 'K9 birim sorumlusu, "Rex" isimli köpekle çalışır.',
  },
  {
    id: 'per5',
    firstName: 'Burak',
    lastName: 'Aksoy',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
    role: 'crowd_control',
    status: 'off_duty',
    phone: '+90 536 555 6677',
    email: 'burak.aksoy@security.com',
    dateOfBirth: '1994-09-25',
    hireDate: '2021-05-01',
    rating: 4.5,
    completedShifts: 98,
    qualifications: {
      armedLicense: false,
      securityCertificate: true,
      certificateExpiry: '2025-05-01',
      firstAid: true,
      firstAidExpiry: '2025-02-28',
      k9Certified: false,
      vipProtection: false,
      crowdManagement: true,
    },
    documents: [
      { type: 'Özel Güvenlik Kimliği', name: 'guvenlik_kimlik.pdf', expiryDate: '2025-05-01', status: 'valid' },
      { type: 'Kalabalık Yönetimi Sertifikası', name: 'crowd_management.pdf', status: 'valid' },
    ],
    physicalInfo: {
      height: 182,
      weight: 88,
      bloodType: 'O-',
    },
    emergencyContact: {
      name: 'Selma Aksoy',
      phone: '+90 536 444 3322',
      relationship: 'Anne',
    },
    availability: {
      monday: false,
      tuesday: true,
      wednesday: true,
      thursday: false,
      friday: true,
      saturday: true,
      sunday: true,
    },
  },
  {
    id: 'per6',
    firstName: 'Serkan',
    lastName: 'Öztürk',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    role: 'bodyguard',
    status: 'active',
    phone: '+90 537 666 7788',
    email: 'serkan.ozturk@security.com',
    dateOfBirth: '1986-02-18',
    hireDate: '2016-11-15',
    rating: 4.9,
    completedShifts: 512,
    qualifications: {
      armedLicense: true,
      armedLicenseExpiry: '2025-11-15',
      securityCertificate: true,
      certificateExpiry: '2026-01-20',
      firstAid: true,
      firstAidExpiry: '2025-07-10',
      k9Certified: false,
      vipProtection: true,
      crowdManagement: true,
    },
    documents: [
      { type: 'Silahlı Güvenlik Belgesi', name: 'silahli_belge.pdf', expiryDate: '2025-11-15', status: 'valid' },
      { type: 'Özel Güvenlik Kimliği', name: 'guvenlik_kimlik.pdf', expiryDate: '2026-01-20', status: 'valid' },
      { type: 'Yakın Koruma Eğitimi', name: 'yakin_koruma.pdf', status: 'valid' },
    ],
    physicalInfo: {
      height: 188,
      weight: 98,
      bloodType: 'A-',
    },
    emergencyContact: {
      name: 'Deniz Öztürk',
      phone: '+90 537 333 2211',
      relationship: 'Eş',
    },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    notes: 'Eski özel harekat polisi, yakın koruma uzmanı.',
  },
];

// Mock Shifts
export const mockShifts: Shift[] = [
  {
    id: 'shift1',
    eventId: 'evt1',
    eventName: 'Yaz Festivali 2024',
    venue: 'Life Park',
    city: 'İstanbul',
    date: '2024-07-15',
    startTime: '18:00',
    endTime: '02:00',
    status: 'scheduled',
    personnelRequired: 8,
    personnelAssigned: [
      { personnelId: 'per1', personnelName: 'Mehmet Kaya', role: 'supervisor', status: 'assigned' },
      { personnelId: 'per2', personnelName: 'Ali Demir', role: 'security_guard', status: 'assigned' },
      { personnelId: 'per5', personnelName: 'Burak Aksoy', role: 'crowd_control', status: 'assigned' },
    ],
    briefing: 'Festival alanı güvenliği. VIP bölgesi dikkat edilmeli.',
    specialInstructions: 'Alkol kontrolü yapılacak, 18 yaş altı içeri alınmayacak.',
    hourlyRate: 150,
  },
  {
    id: 'shift2',
    eventId: 'evt2',
    eventName: 'Kurumsal Gala Gecesi',
    venue: 'Four Seasons Hotel',
    city: 'İstanbul',
    date: '2024-07-20',
    startTime: '19:00',
    endTime: '00:00',
    status: 'scheduled',
    personnelRequired: 4,
    personnelAssigned: [
      { personnelId: 'per3', personnelName: 'Hasan Yıldırım', role: 'vip_protection', status: 'assigned' },
      { personnelId: 'per6', personnelName: 'Serkan Öztürk', role: 'bodyguard', status: 'assigned' },
    ],
    briefing: 'Üst düzey VIP konuklar olacak. Protokol güvenliği.',
    hourlyRate: 200,
  },
  {
    id: 'shift3',
    eventId: 'evt3',
    eventName: 'Konser - Duman',
    venue: 'Volkswagen Arena',
    city: 'İstanbul',
    date: '2024-06-28',
    startTime: '20:00',
    endTime: '01:00',
    status: 'completed',
    personnelRequired: 12,
    personnelAssigned: [
      { personnelId: 'per1', personnelName: 'Mehmet Kaya', role: 'supervisor', checkInTime: '19:30', checkOutTime: '01:15', status: 'checked_out' },
      { personnelId: 'per2', personnelName: 'Ali Demir', role: 'security_guard', checkInTime: '19:45', checkOutTime: '01:10', status: 'checked_out' },
      { personnelId: 'per4', personnelName: 'Emre Çelik', role: 'k9_handler', checkInTime: '19:00', checkOutTime: '01:20', status: 'checked_out' },
      { personnelId: 'per5', personnelName: 'Burak Aksoy', role: 'crowd_control', checkInTime: '19:30', checkOutTime: '01:05', status: 'checked_out' },
    ],
    briefing: '15.000 kişilik konser. Giriş kontrolü kritik.',
    specialInstructions: 'K9 ekibi giriş taraması yapacak.',
    hourlyRate: 175,
  },
];

// Mock Incident Reports
export const mockIncidentReports: IncidentReport[] = [
  {
    id: 'inc1',
    shiftId: 'shift3',
    eventName: 'Konser - Duman',
    reportedBy: 'Mehmet Kaya',
    reportedAt: '2024-06-28T23:45:00',
    incidentTime: '2024-06-28T23:30:00',
    type: 'minor',
    category: 'unauthorized_access',
    description: 'Sahne arkası bölgesine izinsiz giriş denemesi tespit edildi.',
    actionTaken: 'Şahıs alandan uzaklaştırıldı, uyarıldı.',
    status: 'closed',
  },
  {
    id: 'inc2',
    shiftId: 'shift3',
    eventName: 'Konser - Duman',
    reportedBy: 'Burak Aksoy',
    reportedAt: '2024-06-29T00:15:00',
    incidentTime: '2024-06-29T00:00:00',
    type: 'minor',
    category: 'crowd_control',
    description: 'Konser sonrası çıkışta yoğunluk nedeniyle kısa süreli itişme yaşandı.',
    actionTaken: 'Kalabalık yönlendirildi, alternatif çıkışlar açıldı.',
    witnesses: ['Ali Demir'],
    status: 'closed',
  },
];

// Helper functions
export function getPersonnelById(id: string): SecurityPersonnel | undefined {
  return mockPersonnel.find(p => p.id === id);
}

export function getPersonnelByRole(role: PersonnelRole): SecurityPersonnel[] {
  return mockPersonnel.filter(p => p.role === role);
}

export function getActivePersonnel(): SecurityPersonnel[] {
  return mockPersonnel.filter(p => p.status === 'active' || p.status === 'on_duty');
}

export function getAvailablePersonnelForDay(day: keyof SecurityPersonnel['availability']): SecurityPersonnel[] {
  return mockPersonnel.filter(p =>
    (p.status === 'active' || p.status === 'off_duty') &&
    p.availability[day]
  );
}

export function getShiftsByStatus(status: ShiftStatus): Shift[] {
  return mockShifts.filter(s => s.status === status);
}

export function getUpcomingShifts(): Shift[] {
  return mockShifts.filter(s => s.status === 'scheduled');
}

export function getPersonnelDocumentsExpiringSoon(): { personnel: SecurityPersonnel; document: SecurityPersonnel['documents'][0] }[] {
  const result: { personnel: SecurityPersonnel; document: SecurityPersonnel['documents'][0] }[] = [];

  mockPersonnel.forEach(personnel => {
    personnel.documents.forEach(doc => {
      if (doc.status === 'expiring_soon' || doc.status === 'expired') {
        result.push({ personnel, document: doc });
      }
    });
  });

  return result;
}

export function getIncidentReportsByShift(shiftId: string): IncidentReport[] {
  return mockIncidentReports.filter(r => r.shiftId === shiftId);
}

// Stats
export function getPersonnelStats() {
  const totalPersonnel = mockPersonnel.length;
  const activePersonnel = mockPersonnel.filter(p => p.status === 'active').length;
  const onDuty = mockPersonnel.filter(p => p.status === 'on_duty').length;
  const armedPersonnel = mockPersonnel.filter(p => p.qualifications.armedLicense).length;
  const upcomingShifts = mockShifts.filter(s => s.status === 'scheduled').length;
  const completedShifts = mockShifts.filter(s => s.status === 'completed').length;
  const expiringDocuments = getPersonnelDocumentsExpiringSoon().length;

  const roleDistribution: Record<PersonnelRole, number> = {
    security_guard: 0,
    bodyguard: 0,
    supervisor: 0,
    k9_handler: 0,
    vip_protection: 0,
    crowd_control: 0,
  };

  mockPersonnel.forEach(p => {
    roleDistribution[p.role]++;
  });

  return {
    totalPersonnel,
    activePersonnel,
    onDuty,
    armedPersonnel,
    upcomingShifts,
    completedShifts,
    expiringDocuments,
    roleDistribution,
    totalIncidents: mockIncidentReports.length,
  };
}
