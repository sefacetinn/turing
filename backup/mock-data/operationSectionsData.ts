/**
 * Operasyon Bölümleri Örnek Veri
 *
 * Duman konseri senaryosu için örnek operasyon verileri
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
// DUMAN KONSERİ - HARBİYE AÇIKHAVA
// ============================================

/**
 * Örnek etkinlik operasyonları
 */
export const sampleEventOperations: EventOperations = {
  eventId: 'event-001',
  eventTitle: 'Harbiye Açıkhava - Duman Konseri',
  eventDate: '2026-08-20',
  eventVenue: 'Harbiye Cemil Topuzlu Açıkhava Tiyatrosu',

  parties: {
    booking: {
      companyId: 'booking-001',
      companyName: 'Duman Management',
      companyLogo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100',
    },
    organizer: {
      companyId: 'org-001',
      companyName: 'Pozitif Live',
      companyLogo: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100',
    },
    artist: {
      artistId: 'artist-001',
      artistName: 'Duman',
      artistImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100',
    },
  },

  sections: [
    // ============================================
    // ÖDEMELER BÖLÜMÜ
    // ============================================
    {
      id: 'section-payments',
      type: 'payments',
      eventId: 'event-001',
      provider: null, // Ödemeler için provider yok
      status: 'in_progress',
      accessRoles: {
        booking: ['booking_admin', 'booking_accountant'],
        organizer: ['org_admin', 'finance_manager'],
        provider: [],
      },
      requirements: [],
      tasks: [
        {
          id: 'task-pay-1',
          title: 'Kapora ödemesi',
          description: 'Etkinlik için %30 kapora ödemesi',
          status: 'completed',
          assignedTo: [{
            id: 'user-fin-1',
            name: 'Zeynep Kaya',
            image: 'https://randomuser.me/api/portraits/women/44.jpg',
            party: 'organizer',
          }],
          dueDate: '2026-07-01',
          priority: 'high',
          requiresApproval: true,
          approvals: [
            { party: 'organizer', role: 'finance_manager', approved: true, approvedBy: 'Zeynep Kaya', approvedAt: '2026-06-28' },
            { party: 'booking', role: 'booking_admin', approved: true, approvedBy: 'Ali Yılmaz', approvedAt: '2026-06-29' },
          ],
          createdAt: '2026-06-15',
          updatedAt: '2026-07-01',
        },
        {
          id: 'task-pay-2',
          title: 'Kalan ödeme',
          description: 'Etkinlik öncesi %70 kalan ödeme',
          status: 'pending',
          assignedTo: [{
            id: 'user-fin-1',
            name: 'Zeynep Kaya',
            image: 'https://randomuser.me/api/portraits/women/44.jpg',
            party: 'organizer',
          }],
          dueDate: '2026-08-15',
          priority: 'high',
          requiresApproval: true,
          approvals: [
            { party: 'organizer', role: 'finance_manager', approved: false },
            { party: 'booking', role: 'booking_admin', approved: false },
          ],
          createdAt: '2026-06-15',
          updatedAt: '2026-06-15',
        },
      ],
      notes: [
        {
          id: 'note-pay-1',
          text: 'Fatura bilgileri güncellenecek, vergi numarası değişmiş.',
          isPinned: true,
          author: {
            id: 'user-fin-1',
            name: 'Zeynep Kaya',
            image: 'https://randomuser.me/api/portraits/women/44.jpg',
            party: 'organizer',
          },
          createdAt: '2026-07-15',
        },
      ],
      documents: [],
      customData: {
        totalAmount: 500000,
        paidAmount: 150000,
        currency: 'TRY',
        payments: [
          { id: 'pay-1', amount: 150000, date: '2026-07-01', status: 'completed', method: 'Banka Transferi', description: 'Kapora' },
        ],
        invoices: [
          { id: 'inv-1', number: 'INV-2026-001', amount: 500000, dueDate: '2026-08-15', status: 'sent' },
        ],
      } as PaymentsData,
      summary: {
        label: '₺500.000',
        value: '1/2 ödendi',
        subLabel: '₺150.000 ödendi',
      },
      createdAt: '2026-06-01',
      updatedAt: '2026-07-15',
    },

    // ============================================
    // KONAKLAMA BÖLÜMÜ
    // ============================================
    {
      id: 'section-accommodation',
      type: 'accommodation',
      eventId: 'event-001',
      provider: {
        id: 'prov-acc-1',
        name: 'Hilton Istanbul Bosphorus',
        logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100',
        contactPerson: 'Mehmet Demir',
        contactPhone: '+90 212 315 6000',
        contactEmail: 'events@hiltonistanbul.com',
      },
      status: 'assigned',
      accessRoles: {
        booking: ['booking_admin', 'tour_manager'],
        organizer: ['org_admin', 'event_coordinator'],
        provider: ['provider_admin', 'field_manager'],
      },
      requirements: [
        {
          id: 'req-acc-1',
          title: 'VIP Suite',
          description: 'Sanatçı için Boğaz manzaralı VIP suite',
          quantity: 1,
          status: 'confirmed',
          priority: 'high',
          addedBy: { id: 'user-tour-1', name: 'Ahmet Yılmaz', party: 'booking' },
          addedAt: '2026-06-15',
          confirmedBy: { id: 'user-hotel-1', name: 'Mehmet Demir', party: 'provider' },
          confirmedAt: '2026-06-20',
        },
        {
          id: 'req-acc-2',
          title: 'Standart Oda',
          description: 'Ekip için standart odalar',
          quantity: 7,
          status: 'confirmed',
          priority: 'medium',
          addedBy: { id: 'user-tour-1', name: 'Ahmet Yılmaz', party: 'booking' },
          addedAt: '2026-06-15',
          confirmedBy: { id: 'user-hotel-1', name: 'Mehmet Demir', party: 'provider' },
          confirmedAt: '2026-06-20',
        },
      ],
      tasks: [
        {
          id: 'task-acc-1',
          title: 'Check-in hazırlığı',
          description: 'Erken check-in için oda hazırlığı',
          status: 'pending',
          assignedTo: [{
            id: 'user-hotel-1',
            name: 'Mehmet Demir',
            image: 'https://randomuser.me/api/portraits/men/32.jpg',
            party: 'provider',
          }],
          dueDate: '2026-08-19',
          dueTime: '12:00',
          priority: 'high',
          requiresApproval: false,
          approvals: [],
          createdAt: '2026-07-01',
          updatedAt: '2026-07-01',
        },
      ],
      notes: [
        {
          id: 'note-acc-1',
          text: 'Kaan Tangöze için ekstra yastık ve hypoallergenic yatak örtüsü gerekli.',
          isPinned: true,
          author: {
            id: 'user-tour-1',
            name: 'Ahmet Yılmaz',
            image: 'https://randomuser.me/api/portraits/men/45.jpg',
            party: 'booking',
          },
          createdAt: '2026-07-10',
        },
      ],
      documents: [],
      customData: {
        hotel: {
          name: 'Hilton Istanbul Bosphorus',
          address: 'Harbiye Mah. Cumhuriyet Cad. İstanbul',
          phone: '+90 212 315 6000',
          checkIn: '2026-08-19 14:00',
          checkOut: '2026-08-21 12:00',
          confirmationNumber: 'HIL-2026-84521',
        },
        rooms: [
          { id: 'room-1', type: 'VIP Suite', quantity: 1, guests: ['Kaan Tangöze'] },
          { id: 'room-2', type: 'Standart Oda', quantity: 3, guests: ['Ari Barokas', 'Batuhan Mutlugil', 'Cengiz Baysal'] },
          { id: 'room-3', type: 'Standart Oda', quantity: 4, guests: ['Ses Mühendisi', 'Işık Operatörü', 'Tur Menajeri', 'Asistan'] },
        ],
      } as AccommodationData,
      summary: {
        label: 'Hilton Bosphorus',
        value: '8 oda',
        subLabel: '19-21 Ağustos',
      },
      createdAt: '2026-06-01',
      updatedAt: '2026-07-10',
    },

    // ============================================
    // ULAŞIM BÖLÜMÜ (Provider Atanmamış)
    // ============================================
    {
      id: 'section-transport',
      type: 'transport',
      eventId: 'event-001',
      provider: null, // Henüz atanmamış
      status: 'planning',
      accessRoles: {
        booking: ['booking_admin', 'tour_manager'],
        organizer: ['org_admin', 'event_coordinator'],
        provider: ['provider_admin', 'field_manager'],
      },
      requirements: [
        {
          id: 'req-trans-1',
          title: 'VIP Araç',
          description: 'Sanatçı için Mercedes V-Class veya benzeri',
          quantity: 2,
          status: 'draft',
          priority: 'high',
          addedBy: { id: 'user-tour-1', name: 'Ahmet Yılmaz', party: 'booking' },
          addedAt: '2026-07-15',
        },
        {
          id: 'req-trans-2',
          title: 'Ekipman Aracı',
          description: 'Backline ve personal items için sprinter',
          quantity: 1,
          status: 'draft',
          priority: 'medium',
          addedBy: { id: 'user-tour-1', name: 'Ahmet Yılmaz', party: 'booking' },
          addedAt: '2026-07-15',
        },
        {
          id: 'req-trans-3',
          title: 'Havalimanı Transferi',
          description: 'İstanbul Havalimanı - Otel transferi',
          quantity: 1,
          status: 'draft',
          priority: 'high',
          addedBy: { id: 'user-tour-1', name: 'Ahmet Yılmaz', party: 'booking' },
          addedAt: '2026-07-15',
        },
      ],
      tasks: [],
      notes: [
        {
          id: 'note-trans-1',
          text: 'Sanatçı araçlarında sigara içilmez olmalı. Şoförler deneyimli ve İstanbul trafiğini bilen kişiler olmalı.',
          isPinned: true,
          author: {
            id: 'user-tour-1',
            name: 'Ahmet Yılmaz',
            image: 'https://randomuser.me/api/portraits/men/45.jpg',
            party: 'booking',
          },
          createdAt: '2026-07-15',
        },
        {
          id: 'note-trans-2',
          text: 'Araçlarda su, meyve suyu ve atıştırmalık bulundurulmalı.',
          isPinned: false,
          author: {
            id: 'user-coord-1',
            name: 'Elif Arslan',
            image: 'https://randomuser.me/api/portraits/women/33.jpg',
            party: 'organizer',
          },
          createdAt: '2026-07-16',
        },
      ],
      documents: [],
      customData: {
        transfers: [],
        flights: [
          {
            id: 'flight-1',
            airline: 'Turkish Airlines',
            flightNumber: 'TK 123',
            departure: { airport: 'Ankara Esenboğa', datetime: '2026-08-19 10:00' },
            arrival: { airport: 'İstanbul Havalimanı', datetime: '2026-08-19 11:15' },
            passengers: ['Kaan Tangöze', 'Ari Barokas', 'Batuhan Mutlugil', 'Cengiz Baysal'],
            pnr: 'ABC123',
          },
        ],
      } as TransportData,
      summary: {
        label: 'Atanmadı',
        value: 'Planlama',
        subLabel: '3 gereksinim',
      },
      createdAt: '2026-06-01',
      updatedAt: '2026-07-16',
    },

    // ============================================
    // TEKNİK BÖLÜMÜ
    // ============================================
    {
      id: 'section-technical',
      type: 'technical',
      eventId: 'event-001',
      provider: {
        id: 'prov-tech-1',
        name: 'EventPro 360',
        logo: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=100',
        contactPerson: 'Can Öztürk',
        contactPhone: '+90 532 123 4567',
        contactEmail: 'can@eventpro360.com',
      },
      status: 'in_progress',
      accessRoles: {
        booking: ['booking_admin', 'production_manager'],
        organizer: ['org_admin', 'event_coordinator', 'tech_coordinator'],
        provider: ['provider_admin', 'field_manager', 'staff'],
      },
      requirements: [
        {
          id: 'req-tech-1',
          title: 'Line Array Ses Sistemi',
          description: 'L-Acoustics K2 veya d&b J-Series',
          quantity: 1,
          unit: 'set',
          status: 'confirmed',
          priority: 'high',
          addedBy: { id: 'user-prod-1', name: 'Murat Kılıç', party: 'booking' },
          addedAt: '2026-06-20',
          confirmedBy: { id: 'user-tech-1', name: 'Can Öztürk', party: 'provider' },
          confirmedAt: '2026-06-25',
        },
        {
          id: 'req-tech-2',
          title: 'Işık Sistemi',
          description: 'Moving head, par can, follow spot',
          quantity: 1,
          unit: 'set',
          status: 'confirmed',
          priority: 'high',
          addedBy: { id: 'user-prod-1', name: 'Murat Kılıç', party: 'booking' },
          addedAt: '2026-06-20',
          confirmedBy: { id: 'user-tech-1', name: 'Can Öztürk', party: 'provider' },
          confirmedAt: '2026-06-25',
        },
      ],
      tasks: [
        {
          id: 'task-tech-1',
          title: 'Sahne kurulumu',
          description: 'Ana sahne ve backline kurulumu',
          status: 'pending',
          assignedTo: [
            { id: 'user-tech-1', name: 'Can Öztürk', image: 'https://randomuser.me/api/portraits/men/52.jpg', party: 'provider' },
            { id: 'user-tech-2', name: 'Emre Demir', image: 'https://randomuser.me/api/portraits/men/41.jpg', party: 'provider' },
          ],
          dueDate: '2026-08-20',
          dueTime: '08:00',
          priority: 'high',
          requiresApproval: true,
          approvals: [
            { party: 'booking', role: 'production_manager', approved: false },
            { party: 'provider', role: 'provider_admin', approved: false },
          ],
          checklist: [
            { id: 'cl-1', text: 'Sahne platformu kurulumu', completed: false },
            { id: 'cl-2', text: 'Truss sistemi montajı', completed: false },
            { id: 'cl-3', text: 'Ses sistemi asma', completed: false },
            { id: 'cl-4', text: 'Işık riggingi', completed: false },
            { id: 'cl-5', text: 'Backline yerleşimi', completed: false },
          ],
          createdAt: '2026-07-01',
          updatedAt: '2026-07-01',
        },
        {
          id: 'task-tech-2',
          title: 'Soundcheck',
          description: 'Ses ve monitor check',
          status: 'pending',
          assignedTo: [
            { id: 'user-tech-1', name: 'Can Öztürk', image: 'https://randomuser.me/api/portraits/men/52.jpg', party: 'provider' },
          ],
          dueDate: '2026-08-20',
          dueTime: '16:00',
          priority: 'high',
          requiresApproval: false,
          approvals: [],
          createdAt: '2026-07-01',
          updatedAt: '2026-07-01',
        },
      ],
      notes: [],
      documents: [],
      customData: {
        equipment: [
          {
            category: 'Ses',
            items: [
              { id: 'eq-1', name: 'L-Acoustics K2 Line Array', quantity: 24, status: 'confirmed' },
              { id: 'eq-2', name: 'L-Acoustics KS28 Sub', quantity: 12, status: 'confirmed' },
              { id: 'eq-3', name: 'Monitor wedge', quantity: 8, status: 'confirmed' },
            ],
          },
          {
            category: 'Işık',
            items: [
              { id: 'eq-4', name: 'Clay Paky Sharpy Plus', quantity: 24, status: 'confirmed' },
              { id: 'eq-5', name: 'Robe BMFL Spot', quantity: 12, status: 'confirmed' },
              { id: 'eq-6', name: 'Follow Spot 2500W', quantity: 2, status: 'confirmed' },
            ],
          },
        ],
        rider: {
          url: 'https://example.com/duman-rider.pdf',
          uploadedAt: '2026-06-15',
          status: 'approved',
        },
      } as TechnicalData,
      summary: {
        label: 'EventPro 360',
        value: '12/15 görev',
        subLabel: 'Devam ediyor',
      },
      createdAt: '2026-06-01',
      updatedAt: '2026-07-20',
    },

    // ============================================
    // CATERING BÖLÜMÜ (Provider Atanmamış)
    // ============================================
    {
      id: 'section-catering',
      type: 'catering',
      eventId: 'event-001',
      provider: null,
      status: 'planning',
      accessRoles: {
        booking: ['booking_admin', 'tour_manager'],
        organizer: ['org_admin', 'event_coordinator'],
        provider: ['provider_admin', 'field_manager'],
      },
      requirements: [
        {
          id: 'req-cat-1',
          title: 'Backstage Catering',
          description: 'Sıcak yemek servisi - 20 kişilik',
          quantity: 20,
          unit: 'kişi',
          status: 'draft',
          priority: 'high',
          addedBy: { id: 'user-tour-1', name: 'Ahmet Yılmaz', party: 'booking' },
          addedAt: '2026-07-20',
        },
        {
          id: 'req-cat-2',
          title: 'Greenroom Setup',
          description: 'Meyve, sandviç, içecekler',
          quantity: 1,
          status: 'draft',
          priority: 'medium',
          addedBy: { id: 'user-tour-1', name: 'Ahmet Yılmaz', party: 'booking' },
          addedAt: '2026-07-20',
        },
      ],
      tasks: [],
      notes: [
        {
          id: 'note-cat-1',
          text: 'Kaan Tangöze vejeteryan yemek tercih ediyor. Batuhan gluten-free.',
          isPinned: true,
          author: {
            id: 'user-tour-1',
            name: 'Ahmet Yılmaz',
            image: 'https://randomuser.me/api/portraits/men/45.jpg',
            party: 'booking',
          },
          createdAt: '2026-07-20',
        },
      ],
      documents: [],
      customData: {
        meals: [],
        beverages: {
          backstageItems: ['Su', 'Kola', 'Fanta', 'Meyve Suyu', 'Enerji İçeceği'],
          greenRoomItems: ['Kahve', 'Çay', 'Bal', 'Limon'],
        },
      } as CateringData,
      summary: {
        label: 'Atanmadı',
        value: 'Planlama',
        subLabel: '2 gereksinim',
      },
      createdAt: '2026-06-01',
      updatedAt: '2026-07-20',
    },

    // ============================================
    // GÜVENLİK BÖLÜMÜ
    // ============================================
    {
      id: 'section-security',
      type: 'security',
      eventId: 'event-001',
      provider: {
        id: 'prov-sec-1',
        name: 'SecurePro Events',
        logo: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=100',
        contactPerson: 'Hakan Aydın',
        contactPhone: '+90 533 987 6543',
        contactEmail: 'hakan@securepro.com.tr',
      },
      status: 'assigned',
      accessRoles: {
        booking: ['booking_admin', 'production_manager'],
        organizer: ['org_admin', 'event_coordinator'],
        provider: ['provider_admin', 'field_manager', 'staff'],
      },
      requirements: [
        {
          id: 'req-sec-1',
          title: 'Sahne Güvenliği',
          description: 'Sahne önü ve yan güvenlik',
          quantity: 8,
          unit: 'kişi',
          status: 'confirmed',
          priority: 'high',
          addedBy: { id: 'user-prod-1', name: 'Murat Kılıç', party: 'booking' },
          addedAt: '2026-07-01',
          confirmedBy: { id: 'user-sec-1', name: 'Hakan Aydın', party: 'provider' },
          confirmedAt: '2026-07-05',
        },
        {
          id: 'req-sec-2',
          title: 'Backstage Güvenlik',
          description: 'Backstage ve artistik alan güvenliği',
          quantity: 4,
          unit: 'kişi',
          status: 'confirmed',
          priority: 'high',
          addedBy: { id: 'user-prod-1', name: 'Murat Kılıç', party: 'booking' },
          addedAt: '2026-07-01',
          confirmedBy: { id: 'user-sec-1', name: 'Hakan Aydın', party: 'provider' },
          confirmedAt: '2026-07-05',
        },
      ],
      tasks: [
        {
          id: 'task-sec-1',
          title: 'Güvenlik brifing',
          description: 'Etkinlik öncesi güvenlik ekibi brifing',
          status: 'pending',
          assignedTo: [{
            id: 'user-sec-1',
            name: 'Hakan Aydın',
            image: 'https://randomuser.me/api/portraits/men/55.jpg',
            party: 'provider',
          }],
          dueDate: '2026-08-20',
          dueTime: '14:00',
          priority: 'high',
          requiresApproval: false,
          approvals: [],
          createdAt: '2026-07-10',
          updatedAt: '2026-07-10',
        },
      ],
      notes: [],
      documents: [],
      customData: {
        personnel: {
          total: 12,
          positions: [
            { role: 'Sahne Önü', count: 8, location: 'Main Stage Front' },
            { role: 'Backstage', count: 4, location: 'Artist Area' },
          ],
        },
        briefingTime: '2026-08-20 14:00',
        accessLevels: [
          { name: 'AAA Pass', color: '#EF4444', areas: ['Stage', 'Backstage', 'Greenroom', 'FOH'] },
          { name: 'Crew', color: '#F59E0B', areas: ['Stage', 'Backstage', 'FOH'] },
          { name: 'Guest', color: '#10B981', areas: ['Backstage Lounge'] },
        ],
        emergencyContacts: [
          { name: 'Hakan Aydın', role: 'Güvenlik Şefi', phone: '+90 533 987 6543' },
          { name: 'Acil Yardım', role: 'Ambulans', phone: '112' },
        ],
      } as SecurityData,
      summary: {
        label: 'SecurePro',
        value: '12 personel',
        subLabel: 'Atandı',
      },
      createdAt: '2026-06-01',
      updatedAt: '2026-07-10',
    },
  ],

  overallStatus: 'preparation',
  createdAt: '2026-06-01',
  updatedAt: '2026-07-20',
};

// ============================================
// EKİP ÜYELERİ
// ============================================

/**
 * Operasyon ekibi üyeleri
 */
export const operationTeamMembers = {
  booking: [
    {
      id: 'user-book-admin',
      name: 'Ali Yılmaz',
      image: 'https://randomuser.me/api/portraits/men/35.jpg',
      role: 'booking_admin',
      roleLabel: 'Firma Sahibi',
      phone: '+90 532 111 2233',
      email: 'ali@dumanmanagement.com',
    },
    {
      id: 'user-tour-1',
      name: 'Ahmet Yılmaz',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      role: 'tour_manager',
      roleLabel: 'Tur Menajeri',
      phone: '+90 532 222 3344',
      email: 'ahmet@dumanmanagement.com',
    },
    {
      id: 'user-prod-1',
      name: 'Murat Kılıç',
      image: 'https://randomuser.me/api/portraits/men/48.jpg',
      role: 'production_manager',
      roleLabel: 'Prodüksiyon Amiri',
      phone: '+90 532 333 4455',
      email: 'murat@dumanmanagement.com',
    },
  ],
  organizer: [
    {
      id: 'user-org-admin',
      name: 'Selin Arslan',
      image: 'https://randomuser.me/api/portraits/women/42.jpg',
      role: 'org_admin',
      roleLabel: 'Organizatör Admin',
      phone: '+90 533 111 2233',
      email: 'selin@pozitiflive.com',
    },
    {
      id: 'user-coord-1',
      name: 'Elif Arslan',
      image: 'https://randomuser.me/api/portraits/women/33.jpg',
      role: 'event_coordinator',
      roleLabel: 'Etkinlik Koordinatörü',
      phone: '+90 533 222 3344',
      email: 'elif@pozitiflive.com',
    },
    {
      id: 'user-fin-1',
      name: 'Zeynep Kaya',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      role: 'finance_manager',
      roleLabel: 'Finans Yöneticisi',
      phone: '+90 533 333 4455',
      email: 'zeynep@pozitiflive.com',
    },
  ],
};

/**
 * Mevcut kullanıcı (simülasyon)
 */
export const currentOperationUser = {
  id: 'user-book-admin',
  name: 'Ali Yılmaz',
  image: 'https://randomuser.me/api/portraits/men/35.jpg',
  party: 'booking' as const,
  role: 'booking_admin',
  roleLabel: 'Firma Sahibi',
  companyId: 'booking-001',
  companyName: 'Duman Management',
};

// ============================================
// BÖLÜM EKİPLERİ
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
 * Her bölüm için ekip üyeleri
 */
export const sampleSectionTeams: Record<string, SectionTeamMember[]> = {
  payments: [
    {
      id: 'user-fin-1',
      name: 'Zeynep Kaya',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      role: 'Finans Yöneticisi',
      phone: '+90 533 333 4455',
      party: 'organizer',
    },
    {
      id: 'user-book-admin',
      name: 'Ali Yılmaz',
      image: 'https://randomuser.me/api/portraits/men/35.jpg',
      role: 'Firma Sahibi',
      phone: '+90 532 111 2233',
      party: 'booking',
    },
  ],
  accommodation: [
    {
      id: 'user-hotel-1',
      name: 'Mehmet Demir',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      role: 'Satış Müdürü',
      phone: '+90 212 315 6000',
      party: 'provider',
    },
    {
      id: 'user-hotel-2',
      name: 'Ayşe Yıldız',
      image: 'https://randomuser.me/api/portraits/women/28.jpg',
      role: 'Rezervasyon Uzmanı',
      phone: '+90 212 315 6001',
      party: 'provider',
    },
    {
      id: 'user-tour-1',
      name: 'Ahmet Yılmaz',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      role: 'Tur Menajeri',
      phone: '+90 532 222 3344',
      party: 'booking',
    },
    {
      id: 'user-coord-1',
      name: 'Elif Arslan',
      image: 'https://randomuser.me/api/portraits/women/33.jpg',
      role: 'Etkinlik Koordinatörü',
      phone: '+90 533 222 3344',
      party: 'organizer',
    },
  ],
  transport: [
    {
      id: 'user-tour-1',
      name: 'Ahmet Yılmaz',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      role: 'Tur Menajeri',
      phone: '+90 532 222 3344',
      party: 'booking',
    },
    {
      id: 'user-coord-1',
      name: 'Elif Arslan',
      image: 'https://randomuser.me/api/portraits/women/33.jpg',
      role: 'Etkinlik Koordinatörü',
      phone: '+90 533 222 3344',
      party: 'organizer',
    },
  ],
  technical: [
    {
      id: 'user-tech-1',
      name: 'Can Öztürk',
      image: 'https://randomuser.me/api/portraits/men/52.jpg',
      role: 'Teknik Direktör',
      phone: '+90 532 123 4567',
      party: 'provider',
    },
    {
      id: 'user-tech-2',
      name: 'Emre Demir',
      image: 'https://randomuser.me/api/portraits/men/41.jpg',
      role: 'Ses Mühendisi',
      phone: '+90 532 234 5678',
      party: 'provider',
    },
    {
      id: 'user-tech-3',
      name: 'Burak Aksoy',
      image: 'https://randomuser.me/api/portraits/men/36.jpg',
      role: 'Işık Operatörü',
      phone: '+90 532 345 6789',
      party: 'provider',
    },
    {
      id: 'user-prod-1',
      name: 'Murat Kılıç',
      image: 'https://randomuser.me/api/portraits/men/48.jpg',
      role: 'Prodüksiyon Amiri',
      phone: '+90 532 333 4455',
      party: 'booking',
    },
    {
      id: 'user-coord-1',
      name: 'Elif Arslan',
      image: 'https://randomuser.me/api/portraits/women/33.jpg',
      role: 'Etkinlik Koordinatörü',
      phone: '+90 533 222 3344',
      party: 'organizer',
    },
  ],
  catering: [
    {
      id: 'user-tour-1',
      name: 'Ahmet Yılmaz',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      role: 'Tur Menajeri',
      phone: '+90 532 222 3344',
      party: 'booking',
    },
    {
      id: 'user-coord-1',
      name: 'Elif Arslan',
      image: 'https://randomuser.me/api/portraits/women/33.jpg',
      role: 'Etkinlik Koordinatörü',
      phone: '+90 533 222 3344',
      party: 'organizer',
    },
  ],
  security: [
    {
      id: 'user-sec-1',
      name: 'Hakan Aydın',
      image: 'https://randomuser.me/api/portraits/men/55.jpg',
      role: 'Güvenlik Şefi',
      phone: '+90 533 987 6543',
      party: 'provider',
    },
    {
      id: 'user-sec-2',
      name: 'Osman Yılmaz',
      image: 'https://randomuser.me/api/portraits/men/58.jpg',
      role: 'Saha Sorumlusu',
      phone: '+90 533 876 5432',
      party: 'provider',
    },
    {
      id: 'user-prod-1',
      name: 'Murat Kılıç',
      image: 'https://randomuser.me/api/portraits/men/48.jpg',
      role: 'Prodüksiyon Amiri',
      phone: '+90 532 333 4455',
      party: 'booking',
    },
    {
      id: 'user-coord-1',
      name: 'Elif Arslan',
      image: 'https://randomuser.me/api/portraits/women/33.jpg',
      role: 'Etkinlik Koordinatörü',
      phone: '+90 533 222 3344',
      party: 'organizer',
    },
  ],
};
