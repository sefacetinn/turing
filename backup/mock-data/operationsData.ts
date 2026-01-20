// Event Operations Data - Çok Taraflı Operasyon Yönetimi

// ============================================
// TARAF TİPLERİ (PARTY TYPES)
// ============================================
export type PartyType = 'organizer' | 'provider' | 'artist';

export type OrganizerRole =
  | 'event_owner'           // Etkinlik Sahibi
  | 'production_manager'    // Prodüksiyon Müdürü
  | 'technical_coordinator' // Teknik Koordinatör
  | 'stage_manager'         // Sahne Müdürü
  | 'logistics_coordinator' // Lojistik Koordinatör
  | 'security_chief';       // Güvenlik Şefi

export type ProviderRole =
  | 'account_manager'       // Hesap Yöneticisi
  | 'technical_director'    // Teknik Direktör
  | 'sound_engineer'        // Ses Mühendisi
  | 'lighting_designer'     // Işık Tasarımcısı
  | 'stage_crew_lead'       // Sahne Ekip Lideri
  | 'rigger'                // Rigger
  | 'video_engineer';       // Video Mühendisi

export type ArtistRole =
  | 'artist_manager'        // Sanatçı Menajeri
  | 'tour_manager'          // Tur Müdürü
  | 'artist_tech_director'  // Sanatçı Teknik Direktörü
  | 'foh_engineer'          // FOH Mühendisi
  | 'monitor_engineer'      // Monitör Mühendisi
  | 'backline_tech'         // Backline Teknisyeni
  | 'lighting_director';    // Işık Direktörü

export type OperationRole = OrganizerRole | ProviderRole | ArtistRole;

// ============================================
// EKİP ÜYESİ (TEAM MEMBER)
// ============================================
export interface OperationTeamMember {
  id: string;
  name: string;
  image: string;
  phone: string;
  email: string;
  party: PartyType;
  role: OperationRole;
  roleLabel: string;
  companyName?: string;
  companyLogo?: string;
  assignedBy: 'organizer' | 'provider' | 'artist' | 'system';
  assignedAt: string;
  permissions: OperationPermission[];
  isOnline: boolean;
  lastSeen?: string;
}

// ============================================
// İZİNLER (PERMISSIONS)
// ============================================
export type OperationPermission =
  | 'view_all'              // Tümünü görüntüle
  | 'view_own_tasks'        // Kendi görevlerini görüntüle
  | 'edit_tasks'            // Görevleri düzenle
  | 'assign_tasks'          // Görev ata
  | 'approve_tasks'         // Görevleri onayla
  | 'view_schedule'         // Programı görüntüle
  | 'edit_schedule'         // Programı düzenle
  | 'view_equipment'        // Ekipmanları görüntüle
  | 'manage_equipment'      // Ekipmanları yönet
  | 'view_budget'           // Bütçeyi görüntüle
  | 'manage_budget'         // Bütçeyi yönet
  | 'view_contacts'         // Kişileri görüntüle
  | 'manage_team'           // Ekibi yönet
  | 'send_notifications'    // Bildirim gönder
  | 'approve_changes'       // Değişiklikleri onayla
  | 'view_rider'            // Rider görüntüle
  | 'upload_documents'      // Döküman yükle
  | 'sign_off_tasks';       // Görev onayı ver

// ============================================
// GÖREV DURUMU (TASK STATUS)
// ============================================
export type TaskStatus =
  | 'pending'       // Beklemede
  | 'in_progress'   // Devam ediyor
  | 'waiting_approval' // Onay bekliyor
  | 'completed'     // Tamamlandı
  | 'blocked'       // Engellendi
  | 'cancelled';    // İptal edildi

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

// ============================================
// OPERASYON GÖREVİ (OPERATION TASK)
// ============================================
export interface OperationTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string[];       // Team member IDs
  assignedParty: PartyType;   // Hangi taraf sorumlu
  requiredApprovals: {
    party: PartyType;
    role: OperationRole;
    approved: boolean;
    approvedBy?: string;
    approvedAt?: string;
  }[];
  dependencies: string[];     // Bağlı görev ID'leri
  startTime?: string;
  endTime?: string;
  dueDate: string;
  completedAt?: string;
  completedBy?: string;
  checklist: TaskChecklistItem[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskCategory =
  | 'setup'           // Kurulum
  | 'soundcheck'      // Ses Kontrolü
  | 'lighting'        // Işık
  | 'stage'           // Sahne
  | 'rigging'         // Rigging
  | 'video'           // Video
  | 'backline'        // Backline
  | 'logistics'       // Lojistik
  | 'security'        // Güvenlik
  | 'catering'        // Catering
  | 'communication'   // İletişim
  | 'documentation'   // Dokümantasyon
  | 'teardown';       // Söküm

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document';
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorImage: string;
  authorParty: PartyType;
  text: string;
  createdAt: string;
  mentions: string[];
}

// ============================================
// OPERASYON PROGRAMI (OPERATION SCHEDULE)
// ============================================
export interface ScheduleBlock {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location: string;
  category: TaskCategory;
  responsibleParty: PartyType;
  assignedMembers: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  notes?: string;
  color: string;
}

// ============================================
// EKİPMAN TAKİBİ (EQUIPMENT TRACKING)
// ============================================
export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  providedBy: PartyType;
  providerName: string;
  status: 'pending' | 'delivered' | 'setup' | 'tested' | 'issue';
  location?: string;
  notes?: string;
  riderRequirement: boolean;
  checkedBy?: string;
  checkedAt?: string;
}

// ============================================
// ETKİNLİK OPERASYONU (EVENT OPERATION)
// ============================================
export interface EventOperation {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  status: 'preparation' | 'load_in' | 'setup' | 'soundcheck' | 'show' | 'teardown' | 'completed';

  // Taraflar ve Ekipler
  parties: {
    organizer: {
      companyName: string;
      companyLogo: string;
      teamMembers: OperationTeamMember[];
    };
    provider: {
      companyName: string;
      companyLogo: string;
      serviceType: string;
      teamMembers: OperationTeamMember[];
    };
    artist: {
      artistName: string;
      artistImage: string;
      teamMembers: OperationTeamMember[];
    };
  };

  // Görevler ve Program
  tasks: OperationTask[];
  schedule: ScheduleBlock[];

  // Ekipman Listesi
  equipment: EquipmentItem[];

  // Önemli Bilgiler
  importantNotes: string[];
  emergencyContacts: {
    name: string;
    role: string;
    phone: string;
  }[];

  // Zaman Çizelgesi
  timeline: {
    loadIn: string;
    setupStart: string;
    soundcheckStart: string;
    doorsOpen: string;
    showStart: string;
    showEnd: string;
    teardownStart: string;
    loadOut: string;
  };
}

// ============================================
// ROL BAZLI İZİN HARİTASI
// ============================================
export const rolePermissions: Record<OperationRole, OperationPermission[]> = {
  // Organizatör Rolleri
  event_owner: ['view_all', 'edit_tasks', 'assign_tasks', 'approve_tasks', 'edit_schedule', 'manage_budget', 'manage_team', 'send_notifications', 'approve_changes'],
  production_manager: ['view_all', 'edit_tasks', 'assign_tasks', 'approve_tasks', 'edit_schedule', 'view_budget', 'manage_team', 'send_notifications', 'approve_changes'],
  technical_coordinator: ['view_all', 'edit_tasks', 'assign_tasks', 'view_schedule', 'view_equipment', 'view_contacts', 'send_notifications'],
  stage_manager: ['view_all', 'edit_tasks', 'view_schedule', 'manage_equipment', 'view_contacts', 'sign_off_tasks'],
  logistics_coordinator: ['view_all', 'view_own_tasks', 'edit_tasks', 'view_schedule', 'view_equipment', 'view_contacts'],
  security_chief: ['view_all', 'view_own_tasks', 'edit_tasks', 'view_schedule', 'view_contacts', 'send_notifications'],

  // Provider Rolleri
  account_manager: ['view_all', 'edit_tasks', 'assign_tasks', 'view_schedule', 'view_budget', 'manage_team', 'send_notifications', 'approve_changes'],
  technical_director: ['view_all', 'edit_tasks', 'assign_tasks', 'approve_tasks', 'edit_schedule', 'manage_equipment', 'send_notifications', 'sign_off_tasks'],
  sound_engineer: ['view_own_tasks', 'edit_tasks', 'view_schedule', 'manage_equipment', 'view_rider', 'sign_off_tasks'],
  lighting_designer: ['view_own_tasks', 'edit_tasks', 'view_schedule', 'manage_equipment', 'view_rider', 'sign_off_tasks'],
  stage_crew_lead: ['view_own_tasks', 'edit_tasks', 'view_schedule', 'manage_equipment', 'sign_off_tasks'],
  rigger: ['view_own_tasks', 'view_schedule', 'view_equipment', 'sign_off_tasks'],
  video_engineer: ['view_own_tasks', 'edit_tasks', 'view_schedule', 'manage_equipment', 'view_rider', 'sign_off_tasks'],

  // Artist Rolleri
  artist_manager: ['view_all', 'approve_tasks', 'view_schedule', 'view_contacts', 'send_notifications', 'approve_changes'],
  tour_manager: ['view_all', 'edit_tasks', 'approve_tasks', 'edit_schedule', 'view_contacts', 'send_notifications', 'approve_changes'],
  artist_tech_director: ['view_all', 'edit_tasks', 'approve_tasks', 'view_schedule', 'manage_equipment', 'view_rider', 'sign_off_tasks'],
  foh_engineer: ['view_own_tasks', 'edit_tasks', 'view_schedule', 'manage_equipment', 'view_rider', 'sign_off_tasks'],
  monitor_engineer: ['view_own_tasks', 'edit_tasks', 'view_schedule', 'manage_equipment', 'view_rider', 'sign_off_tasks'],
  backline_tech: ['view_own_tasks', 'view_schedule', 'view_equipment', 'view_rider', 'sign_off_tasks'],
  lighting_director: ['view_own_tasks', 'edit_tasks', 'view_schedule', 'manage_equipment', 'view_rider', 'sign_off_tasks'],
};

// ============================================
// ROL ETİKETLERİ
// ============================================
export const roleLabels: Record<OperationRole, string> = {
  // Organizatör
  event_owner: 'Etkinlik Sahibi',
  production_manager: 'Prodüksiyon Müdürü',
  technical_coordinator: 'Teknik Koordinatör',
  stage_manager: 'Sahne Müdürü',
  logistics_coordinator: 'Lojistik Koordinatör',
  security_chief: 'Güvenlik Şefi',

  // Provider
  account_manager: 'Hesap Yöneticisi',
  technical_director: 'Teknik Direktör',
  sound_engineer: 'Ses Mühendisi',
  lighting_designer: 'Işık Tasarımcısı',
  stage_crew_lead: 'Sahne Ekip Lideri',
  rigger: 'Rigger',
  video_engineer: 'Video Mühendisi',

  // Artist
  artist_manager: 'Sanatçı Menajeri',
  tour_manager: 'Tur Müdürü',
  artist_tech_director: 'Sanatçı Teknik Direktörü',
  foh_engineer: 'FOH Mühendisi',
  monitor_engineer: 'Monitör Mühendisi',
  backline_tech: 'Backline Teknisyeni',
  lighting_director: 'Işık Direktörü',
};

// ============================================
// ÖRNEK ETKİNLİK OPERASYONU - Tarkan Konseri
// ============================================
export const sampleEventOperation: EventOperation = {
  id: 'op1',
  eventId: '2',
  eventTitle: 'Tarkan - İstanbul',
  eventDate: '28 Ağustos 2026',
  eventVenue: 'Vodafone Park, İstanbul',
  status: 'preparation',

  parties: {
    organizer: {
      companyName: 'Pozitif Live',
      companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
      teamMembers: [
        {
          id: 'org1',
          name: 'Ahmet Yılmaz',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          phone: '+90 532 111 2233',
          email: 'ahmet@pozitivlive.com',
          party: 'organizer',
          role: 'event_owner',
          roleLabel: 'Etkinlik Sahibi',
          companyName: 'Pozitif Live',
          assignedBy: 'system',
          assignedAt: '2026-01-15',
          permissions: rolePermissions.event_owner,
          isOnline: true,
        },
        {
          id: 'org2',
          name: 'Zeynep Kaya',
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
          phone: '+90 532 222 3344',
          email: 'zeynep@pozitivlive.com',
          party: 'organizer',
          role: 'production_manager',
          roleLabel: 'Prodüksiyon Müdürü',
          companyName: 'Pozitif Live',
          assignedBy: 'organizer',
          assignedAt: '2026-01-16',
          permissions: rolePermissions.production_manager,
          isOnline: true,
        },
        {
          id: 'org3',
          name: 'Murat Demir',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          phone: '+90 532 333 4455',
          email: 'murat@pozitivlive.com',
          party: 'organizer',
          role: 'technical_coordinator',
          roleLabel: 'Teknik Koordinatör',
          companyName: 'Pozitif Live',
          assignedBy: 'organizer',
          assignedAt: '2026-01-16',
          permissions: rolePermissions.technical_coordinator,
          isOnline: false,
          lastSeen: '2 saat önce',
        },
        {
          id: 'org4',
          name: 'Ayşe Yıldız',
          image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
          phone: '+90 532 444 5566',
          email: 'ayse@pozitivlive.com',
          party: 'organizer',
          role: 'stage_manager',
          roleLabel: 'Sahne Müdürü',
          companyName: 'Pozitif Live',
          assignedBy: 'organizer',
          assignedAt: '2026-01-17',
          permissions: rolePermissions.stage_manager,
          isOnline: true,
        },
      ],
    },
    provider: {
      companyName: 'EventPro 360',
      companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
      serviceType: 'Teknik Prodüksiyon',
      teamMembers: [
        {
          id: 'prov1',
          name: 'Kemal Özkan',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
          phone: '+90 533 111 2233',
          email: 'kemal@eventpro360.com',
          party: 'provider',
          role: 'account_manager',
          roleLabel: 'Hesap Yöneticisi',
          companyName: 'EventPro 360',
          companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
          assignedBy: 'provider',
          assignedAt: '2026-01-18',
          permissions: rolePermissions.account_manager,
          isOnline: true,
        },
        {
          id: 'prov2',
          name: 'Serkan Aydın',
          image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100',
          phone: '+90 533 222 3344',
          email: 'serkan@eventpro360.com',
          party: 'provider',
          role: 'technical_director',
          roleLabel: 'Teknik Direktör',
          companyName: 'EventPro 360',
          companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
          assignedBy: 'provider',
          assignedAt: '2026-01-18',
          permissions: rolePermissions.technical_director,
          isOnline: true,
        },
        {
          id: 'prov3',
          name: 'Burak Şen',
          image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
          phone: '+90 533 333 4455',
          email: 'burak@eventpro360.com',
          party: 'provider',
          role: 'sound_engineer',
          roleLabel: 'Ses Mühendisi',
          companyName: 'EventPro 360',
          companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
          assignedBy: 'provider',
          assignedAt: '2026-01-19',
          permissions: rolePermissions.sound_engineer,
          isOnline: false,
          lastSeen: '30 dk önce',
        },
        {
          id: 'prov4',
          name: 'Deniz Aktaş',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          phone: '+90 533 444 5566',
          email: 'deniz@eventpro360.com',
          party: 'provider',
          role: 'lighting_designer',
          roleLabel: 'Işık Tasarımcısı',
          companyName: 'EventPro 360',
          companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
          assignedBy: 'provider',
          assignedAt: '2026-01-19',
          permissions: rolePermissions.lighting_designer,
          isOnline: true,
        },
        {
          id: 'prov5',
          name: 'Can Yılmaz',
          image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100',
          phone: '+90 533 555 6677',
          email: 'can@eventpro360.com',
          party: 'provider',
          role: 'stage_crew_lead',
          roleLabel: 'Sahne Ekip Lideri',
          companyName: 'EventPro 360',
          companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
          assignedBy: 'provider',
          assignedAt: '2026-01-19',
          permissions: rolePermissions.stage_crew_lead,
          isOnline: true,
        },
      ],
    },
    artist: {
      artistName: 'Tarkan',
      artistImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      teamMembers: [
        {
          id: 'art1',
          name: 'Ozan Çolak',
          image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
          phone: '+90 534 111 2233',
          email: 'ozan@tarkanmgmt.com',
          party: 'artist',
          role: 'artist_manager',
          roleLabel: 'Sanatçı Menajeri',
          companyName: 'Tarkan Management',
          assignedBy: 'artist',
          assignedAt: '2026-01-20',
          permissions: rolePermissions.artist_manager,
          isOnline: true,
        },
        {
          id: 'art2',
          name: 'Cem Karaca',
          image: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=100',
          phone: '+90 534 222 3344',
          email: 'cem@tarkanmgmt.com',
          party: 'artist',
          role: 'tour_manager',
          roleLabel: 'Tur Müdürü',
          companyName: 'Tarkan Management',
          assignedBy: 'artist',
          assignedAt: '2026-01-20',
          permissions: rolePermissions.tour_manager,
          isOnline: true,
        },
        {
          id: 'art3',
          name: 'Tolga Başar',
          image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100',
          phone: '+90 534 333 4455',
          email: 'tolga@tarkanmgmt.com',
          party: 'artist',
          role: 'artist_tech_director',
          roleLabel: 'Sanatçı Teknik Direktörü',
          companyName: 'Tarkan Management',
          assignedBy: 'artist',
          assignedAt: '2026-01-20',
          permissions: rolePermissions.artist_tech_director,
          isOnline: false,
          lastSeen: '1 saat önce',
        },
        {
          id: 'art4',
          name: 'Emre Koç',
          image: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=100',
          phone: '+90 534 444 5566',
          email: 'emre@tarkanmgmt.com',
          party: 'artist',
          role: 'foh_engineer',
          roleLabel: 'FOH Mühendisi',
          companyName: 'Tarkan Management',
          assignedBy: 'artist',
          assignedAt: '2026-01-21',
          permissions: rolePermissions.foh_engineer,
          isOnline: true,
        },
        {
          id: 'art5',
          name: 'Hakan Tunç',
          image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=100',
          phone: '+90 534 555 6677',
          email: 'hakan@tarkanmgmt.com',
          party: 'artist',
          role: 'monitor_engineer',
          roleLabel: 'Monitör Mühendisi',
          companyName: 'Tarkan Management',
          assignedBy: 'artist',
          assignedAt: '2026-01-21',
          permissions: rolePermissions.monitor_engineer,
          isOnline: true,
        },
      ],
    },
  },

  tasks: [
    {
      id: 't1',
      title: 'Ana Sahne Ses Sistemi Kurulumu',
      description: 'L-Acoustics K2 line array sisteminin kurulumu ve kablolama',
      category: 'setup',
      status: 'in_progress',
      priority: 'high',
      assignedTo: ['prov2', 'prov3'],
      assignedParty: 'provider',
      requiredApprovals: [
        { party: 'provider', role: 'technical_director', approved: true, approvedBy: 'prov2', approvedAt: '2026-08-27 09:00' },
        { party: 'artist', role: 'foh_engineer', approved: false },
        { party: 'organizer', role: 'technical_coordinator', approved: false },
      ],
      dependencies: [],
      startTime: '2026-08-27 08:00',
      endTime: '2026-08-27 14:00',
      dueDate: '2026-08-27 14:00',
      checklist: [
        { id: 'c1', text: 'Ana PA flown pozisyona alındı', completed: true, completedBy: 'prov3', completedAt: '2026-08-27 10:30' },
        { id: 'c2', text: 'Sub sistemler yerleştirildi', completed: true, completedBy: 'prov3', completedAt: '2026-08-27 11:00' },
        { id: 'c3', text: 'Kablolama tamamlandı', completed: false },
        { id: 'c4', text: 'Sistem testi yapıldı', completed: false },
        { id: 'c5', text: 'SPL ölçümü yapıldı', completed: false },
      ],
      attachments: [
        { id: 'a1', name: 'Ses_Sistemi_Planı.pdf', type: 'pdf', url: '#', uploadedBy: 'prov2', uploadedAt: '2026-08-25' },
      ],
      comments: [
        {
          id: 'cm1',
          authorId: 'art4',
          authorName: 'Emre Koç',
          authorImage: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=100',
          authorParty: 'artist',
          text: 'Rider\'da belirtilen delay tower konumları için onay alabilir miyiz?',
          createdAt: '2026-08-27 09:30',
          mentions: ['prov2'],
        },
        {
          id: 'cm2',
          authorId: 'prov2',
          authorName: 'Serkan Aydın',
          authorImage: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100',
          authorParty: 'provider',
          text: '@Emre Koç Evet, delay tower\'lar rider\'a uygun şekilde konumlandırıldı.',
          createdAt: '2026-08-27 09:45',
          mentions: ['art4'],
        },
      ],
      createdBy: 'prov2',
      createdAt: '2026-08-25',
      updatedAt: '2026-08-27 11:00',
    },
    {
      id: 't2',
      title: 'Işık Sistemi Kurulumu ve Programlama',
      description: 'Moving head, LED bar ve spot sistemlerinin kurulumu ve show programlama',
      category: 'lighting',
      status: 'pending',
      priority: 'high',
      assignedTo: ['prov4'],
      assignedParty: 'provider',
      requiredApprovals: [
        { party: 'provider', role: 'lighting_designer', approved: false },
        { party: 'artist', role: 'lighting_director', approved: false },
      ],
      dependencies: ['t1'],
      startTime: '2026-08-27 10:00',
      endTime: '2026-08-27 18:00',
      dueDate: '2026-08-27 18:00',
      checklist: [
        { id: 'c1', text: 'Truss sistemi kuruldu', completed: false },
        { id: 'c2', text: 'Moving headler asıldı', completed: false },
        { id: 'c3', text: 'DMX network kuruldu', completed: false },
        { id: 'c4', text: 'Show programlandı', completed: false },
        { id: 'c5', text: 'Sanatçı onayı alındı', completed: false },
      ],
      attachments: [],
      comments: [],
      createdBy: 'prov2',
      createdAt: '2026-08-25',
      updatedAt: '2026-08-25',
    },
    {
      id: 't3',
      title: 'Sanatçı Ses Kontrolü',
      description: 'Tarkan ve band için ses kontrolü - FOH ve monitör ayarları',
      category: 'soundcheck',
      status: 'pending',
      priority: 'critical',
      assignedTo: ['prov3', 'art4', 'art5'],
      assignedParty: 'artist',
      requiredApprovals: [
        { party: 'artist', role: 'foh_engineer', approved: false },
        { party: 'artist', role: 'monitor_engineer', approved: false },
        { party: 'artist', role: 'artist_tech_director', approved: false },
      ],
      dependencies: ['t1', 't2'],
      startTime: '2026-08-28 14:00',
      endTime: '2026-08-28 17:00',
      dueDate: '2026-08-28 17:00',
      checklist: [
        { id: 'c1', text: 'Backline kurulumu tamamlandı', completed: false },
        { id: 'c2', text: 'Monitör mixleri hazır', completed: false },
        { id: 'c3', text: 'FOH mix tamamlandı', completed: false },
        { id: 'c4', text: 'Sanatçı onayı alındı', completed: false },
      ],
      attachments: [],
      comments: [],
      createdBy: 'art3',
      createdAt: '2026-08-25',
      updatedAt: '2026-08-25',
    },
    {
      id: 't4',
      title: 'Güvenlik Briefing\'i',
      description: 'Tüm güvenlik ekibi ile brifing toplantısı',
      category: 'security',
      status: 'pending',
      priority: 'medium',
      assignedTo: ['org4'],
      assignedParty: 'organizer',
      requiredApprovals: [
        { party: 'organizer', role: 'stage_manager', approved: false },
      ],
      dependencies: [],
      startTime: '2026-08-28 12:00',
      endTime: '2026-08-28 13:00',
      dueDate: '2026-08-28 13:00',
      checklist: [
        { id: 'c1', text: 'Acil durum prosedürleri aktarıldı', completed: false },
        { id: 'c2', text: 'Bariyer planı onaylandı', completed: false },
        { id: 'c3', text: 'VIP giriş protokolü belirlendi', completed: false },
      ],
      attachments: [],
      comments: [],
      createdBy: 'org2',
      createdAt: '2026-08-26',
      updatedAt: '2026-08-26',
    },
    {
      id: 't5',
      title: 'LED Ekran Kurulumu ve Test',
      description: 'Ana sahne LED ekran kurulumu ve video content testi',
      category: 'video',
      status: 'pending',
      priority: 'high',
      assignedTo: ['prov2'],
      assignedParty: 'provider',
      requiredApprovals: [
        { party: 'provider', role: 'technical_director', approved: false },
        { party: 'artist', role: 'tour_manager', approved: false },
      ],
      dependencies: [],
      startTime: '2026-08-27 08:00',
      endTime: '2026-08-27 16:00',
      dueDate: '2026-08-27 16:00',
      checklist: [
        { id: 'c1', text: 'LED paneller monte edildi', completed: false },
        { id: 'c2', text: 'Video processor ayarlandı', completed: false },
        { id: 'c3', text: 'Content test edildi', completed: false },
        { id: 'c4', text: 'Yedek sistem kontrol edildi', completed: false },
      ],
      attachments: [],
      comments: [],
      createdBy: 'prov2',
      createdAt: '2026-08-25',
      updatedAt: '2026-08-25',
    },
  ],

  schedule: [
    {
      id: 's1',
      title: 'Load-In Başlangıç',
      description: 'Tüm ekipmanların alana girişi',
      startTime: '2026-08-27 06:00',
      endTime: '2026-08-27 08:00',
      location: 'Vodafone Park - Servis Girişi',
      category: 'logistics',
      responsibleParty: 'provider',
      assignedMembers: ['prov2', 'prov5'],
      status: 'completed',
      color: '#10B981',
    },
    {
      id: 's2',
      title: 'Sahne ve Rigging Kurulumu',
      startTime: '2026-08-27 08:00',
      endTime: '2026-08-27 12:00',
      location: 'Ana Sahne',
      category: 'stage',
      responsibleParty: 'provider',
      assignedMembers: ['prov5'],
      status: 'in_progress',
      color: '#3B82F6',
    },
    {
      id: 's3',
      title: 'Ses Sistemi Kurulumu',
      startTime: '2026-08-27 08:00',
      endTime: '2026-08-27 14:00',
      location: 'Ana Sahne',
      category: 'setup',
      responsibleParty: 'provider',
      assignedMembers: ['prov2', 'prov3'],
      status: 'in_progress',
      color: '#8B5CF6',
    },
    {
      id: 's4',
      title: 'Işık Sistemi Kurulumu',
      startTime: '2026-08-27 10:00',
      endTime: '2026-08-27 18:00',
      location: 'Ana Sahne',
      category: 'lighting',
      responsibleParty: 'provider',
      assignedMembers: ['prov4'],
      status: 'scheduled',
      color: '#F59E0B',
    },
    {
      id: 's5',
      title: 'LED Ekran Kurulumu',
      startTime: '2026-08-27 08:00',
      endTime: '2026-08-27 16:00',
      location: 'Ana Sahne',
      category: 'video',
      responsibleParty: 'provider',
      assignedMembers: ['prov2'],
      status: 'scheduled',
      color: '#EC4899',
    },
    {
      id: 's6',
      title: 'Sistem Testi',
      startTime: '2026-08-27 18:00',
      endTime: '2026-08-27 22:00',
      location: 'Ana Sahne',
      category: 'setup',
      responsibleParty: 'provider',
      assignedMembers: ['prov2', 'prov3', 'prov4'],
      status: 'scheduled',
      color: '#6366F1',
    },
    {
      id: 's7',
      title: 'Güvenlik Briefing',
      startTime: '2026-08-28 12:00',
      endTime: '2026-08-28 13:00',
      location: 'Toplantı Odası',
      category: 'security',
      responsibleParty: 'organizer',
      assignedMembers: ['org4'],
      status: 'scheduled',
      color: '#EF4444',
    },
    {
      id: 's8',
      title: 'Sanatçı Ses Kontrolü',
      startTime: '2026-08-28 14:00',
      endTime: '2026-08-28 17:00',
      location: 'Ana Sahne',
      category: 'soundcheck',
      responsibleParty: 'artist',
      assignedMembers: ['art3', 'art4', 'art5', 'prov3'],
      status: 'scheduled',
      color: '#14B8A6',
    },
    {
      id: 's9',
      title: 'Kapılar Açılıyor',
      startTime: '2026-08-28 18:00',
      endTime: '2026-08-28 18:00',
      location: 'Tüm Girişler',
      category: 'logistics',
      responsibleParty: 'organizer',
      assignedMembers: ['org2', 'org4'],
      status: 'scheduled',
      color: '#10B981',
    },
    {
      id: 's10',
      title: 'Konser Başlangıç',
      startTime: '2026-08-28 20:00',
      endTime: '2026-08-28 23:00',
      location: 'Ana Sahne',
      category: 'setup',
      responsibleParty: 'artist',
      assignedMembers: ['art2', 'art3', 'art4', 'art5'],
      status: 'scheduled',
      color: '#4B30B8',
    },
    {
      id: 's11',
      title: 'Teardown',
      startTime: '2026-08-28 23:30',
      endTime: '2026-08-29 06:00',
      location: 'Ana Sahne',
      category: 'teardown',
      responsibleParty: 'provider',
      assignedMembers: ['prov2', 'prov3', 'prov4', 'prov5'],
      status: 'scheduled',
      color: '#64748B',
    },
  ],

  equipment: [
    { id: 'e1', name: 'L-Acoustics K2 Line Array', category: 'Ses', quantity: 24, providedBy: 'provider', providerName: 'EventPro 360', status: 'delivered', riderRequirement: true },
    { id: 'e2', name: 'L-Acoustics KS28 Subwoofer', category: 'Ses', quantity: 16, providedBy: 'provider', providerName: 'EventPro 360', status: 'delivered', riderRequirement: true },
    { id: 'e3', name: 'DiGiCo SD7 Console', category: 'Ses', quantity: 2, providedBy: 'provider', providerName: 'EventPro 360', status: 'setup', riderRequirement: true },
    { id: 'e4', name: 'Shure Axient Digital Wireless', category: 'Ses', quantity: 12, providedBy: 'artist', providerName: 'Tarkan Management', status: 'pending', riderRequirement: true },
    { id: 'e5', name: 'Clay Paky Sharpy Plus', category: 'Işık', quantity: 48, providedBy: 'provider', providerName: 'EventPro 360', status: 'delivered', riderRequirement: true },
    { id: 'e6', name: 'Robe MegaPointe', category: 'Işık', quantity: 32, providedBy: 'provider', providerName: 'EventPro 360', status: 'delivered', riderRequirement: true },
    { id: 'e7', name: 'grandMA3 Console', category: 'Işık', quantity: 2, providedBy: 'provider', providerName: 'EventPro 360', status: 'setup', riderRequirement: true },
    { id: 'e8', name: 'ROE Visual LED Panel', category: 'Video', quantity: 200, providedBy: 'provider', providerName: 'EventPro 360', status: 'pending', riderRequirement: true },
    { id: 'e9', name: 'Barco E2 Processor', category: 'Video', quantity: 1, providedBy: 'provider', providerName: 'EventPro 360', status: 'pending', riderRequirement: true },
  ],

  importantNotes: [
    'Sanatçı rider\'ında belirtilen tüm teknik gereksinimler karşılanmalıdır.',
    'Ses kontrolü sanatçı teknik direktörü onayı ile tamamlanacaktır.',
    'LED ekran content\'i sanatçı prodüksiyon ekibi tarafından sağlanacaktır.',
    'Acil durum çıkışları her zaman açık tutulmalıdır.',
    'VIP alanı için özel güvenlik protokolü uygulanacaktır.',
  ],

  emergencyContacts: [
    { name: 'Zeynep Kaya', role: 'Prodüksiyon Müdürü', phone: '+90 532 222 3344' },
    { name: 'Serkan Aydın', role: 'Teknik Direktör', phone: '+90 533 222 3344' },
    { name: 'Cem Karaca', role: 'Tur Müdürü', phone: '+90 534 222 3344' },
    { name: 'Vodafone Park Güvenlik', role: 'Mekan Güvenliği', phone: '+90 212 123 4567' },
    { name: '112 Acil', role: 'Acil Yardım', phone: '112' },
  ],

  timeline: {
    loadIn: '2026-08-27 06:00',
    setupStart: '2026-08-27 08:00',
    soundcheckStart: '2026-08-28 14:00',
    doorsOpen: '2026-08-28 18:00',
    showStart: '2026-08-28 20:00',
    showEnd: '2026-08-28 23:00',
    teardownStart: '2026-08-28 23:30',
    loadOut: '2026-08-29 06:00',
  },
};

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================
export function hasPermission(member: OperationTeamMember, permission: OperationPermission): boolean {
  return member.permissions.includes(permission);
}

export function canViewTask(member: OperationTeamMember, task: OperationTask): boolean {
  if (hasPermission(member, 'view_all')) return true;
  if (hasPermission(member, 'view_own_tasks') && task.assignedTo.includes(member.id)) return true;
  return false;
}

export function canEditTask(member: OperationTeamMember, task: OperationTask): boolean {
  if (!canViewTask(member, task)) return false;
  if (hasPermission(member, 'edit_tasks')) return true;
  return false;
}

export function canApproveTask(member: OperationTeamMember, task: OperationTask): boolean {
  if (!hasPermission(member, 'approve_tasks') && !hasPermission(member, 'sign_off_tasks')) return false;
  return task.requiredApprovals.some(
    approval => approval.party === member.party && approval.role === member.role && !approval.approved
  );
}

export function getPartyColor(party: PartyType): string {
  switch (party) {
    case 'organizer': return '#4B30B8';
    case 'provider': return '#3B82F6';
    case 'artist': return '#EC4899';
    default: return '#6B7280';
  }
}

export function getPartyLabel(party: PartyType): string {
  switch (party) {
    case 'organizer': return 'Organizatör';
    case 'provider': return 'Hizmet Sağlayıcı';
    case 'artist': return 'Sanatçı Ekibi';
    default: return party;
  }
}

export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'completed': return '#10B981';
    case 'in_progress': return '#3B82F6';
    case 'waiting_approval': return '#F59E0B';
    case 'pending': return '#6B7280';
    case 'blocked': return '#EF4444';
    case 'cancelled': return '#9CA3AF';
    default: return '#6B7280';
  }
}

export function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'completed': return 'Tamamlandı';
    case 'in_progress': return 'Devam Ediyor';
    case 'waiting_approval': return 'Onay Bekliyor';
    case 'pending': return 'Beklemede';
    case 'blocked': return 'Engellendi';
    case 'cancelled': return 'İptal Edildi';
    default: return status;
  }
}

export function getCategoryLabel(category: TaskCategory): string {
  const labels: Record<TaskCategory, string> = {
    setup: 'Kurulum',
    soundcheck: 'Ses Kontrolü',
    lighting: 'Işık',
    stage: 'Sahne',
    rigging: 'Rigging',
    video: 'Video',
    backline: 'Backline',
    logistics: 'Lojistik',
    security: 'Güvenlik',
    catering: 'Catering',
    communication: 'İletişim',
    documentation: 'Dokümantasyon',
    teardown: 'Söküm',
  };
  return labels[category] || category;
}

export function getCategoryIcon(category: TaskCategory): string {
  const icons: Record<TaskCategory, string> = {
    setup: 'construct',
    soundcheck: 'volume-high',
    lighting: 'flashlight',
    stage: 'apps',
    rigging: 'git-network',
    video: 'videocam',
    backline: 'musical-notes',
    logistics: 'cube',
    security: 'shield-checkmark',
    catering: 'restaurant',
    communication: 'chatbubbles',
    documentation: 'document-text',
    teardown: 'archive',
  };
  return icons[category] || 'ellipse';
}
