/**
 * Varsayılan Modül Tanımları
 *
 * Sistemdeki tüm modüllerin varsayılan tanımları.
 * Her modül, görüntüleme veya form kategorisinde olabilir.
 */

import { ModuleDefinition, FieldConfig } from '../types/modules';

// ============================================
// DISPLAY MODÜL TANIMLARI
// ============================================

/**
 * Mekan Modülü
 */
const venueModule: ModuleDefinition = {
  id: 'venue',
  name: 'Mekan',
  description: 'Mekan bilgileri, salon, sahne ölçüleri ve kulis detayları',
  icon: 'business-outline',
  category: 'display',
  component: 'VenueModule',
  defaultConfig: {
    enabled: true,
    order: 1,
    required: true,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'name', type: 'text', label: 'Mekan Adı', enabled: true, required: true, order: 1 },
    { id: 'address', type: 'text', label: 'Adres', enabled: true, required: true, order: 2 },
    { id: 'city', type: 'text', label: 'Şehir', enabled: true, required: true, order: 3 },
    { id: 'capacity', type: 'number', label: 'Kapasite', enabled: true, required: true, order: 4 },
    { id: 'indoorOutdoor', type: 'select', label: 'Tip', enabled: true, required: true, order: 5, options: [
      { value: 'indoor', label: 'Kapalı Alan' },
      { value: 'outdoor', label: 'Açık Alan' },
      { value: 'mixed', label: 'Karma' },
    ]},
    { id: 'stageWidth', type: 'number', label: 'Sahne Genişliği (m)', enabled: true, required: false, order: 6 },
    { id: 'stageDepth', type: 'number', label: 'Sahne Derinliği (m)', enabled: true, required: false, order: 7 },
    { id: 'backstage', type: 'custom', label: 'Kulis Bilgileri', enabled: true, required: false, order: 8 },
  ],
  requiredFields: ['name', 'address', 'city', 'capacity'],
  optionalFields: ['stageWidth', 'stageDepth', 'backstage', 'halls', 'images'],
};

/**
 * Tarih/Saat Modülü
 */
const datetimeModule: ModuleDefinition = {
  id: 'datetime',
  name: 'Tarih / Saat',
  description: 'Etkinlik tarihi, saati ve süresi',
  icon: 'calendar-outline',
  category: 'display',
  component: 'DateTimeModule',
  defaultConfig: {
    enabled: true,
    order: 2,
    required: true,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'eventDate', type: 'date', label: 'Etkinlik Tarihi', enabled: true, required: true, order: 1 },
    { id: 'eventTime', type: 'time', label: 'Başlangıç Saati', enabled: true, required: false, order: 2 },
    { id: 'duration', type: 'text', label: 'Süre', enabled: true, required: false, order: 3 },
    { id: 'soundcheckTime', type: 'time', label: 'Ses Kontrolü', enabled: true, required: false, order: 4 },
    { id: 'loadInTime', type: 'time', label: 'Yükleme Saati', enabled: true, required: false, order: 5 },
    { id: 'doorsOpenTime', type: 'time', label: 'Kapı Açılış', enabled: true, required: false, order: 6 },
  ],
  requiredFields: ['eventDate'],
  optionalFields: ['eventTime', 'duration', 'soundcheckTime', 'loadInTime', 'doorsOpenTime'],
};

/**
 * Bütçe Modülü
 */
const budgetModule: ModuleDefinition = {
  id: 'budget',
  name: 'Bütçe',
  description: 'Organizatör bütçesi ve teklif tutarı',
  icon: 'cash-outline',
  category: 'display',
  component: 'BudgetModule',
  defaultConfig: {
    enabled: true,
    order: 3,
    required: true,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'organizerBudget', type: 'currency', label: 'Organizatör Bütçesi', enabled: true, required: false, order: 1, prefix: '₺' },
    { id: 'budgetMin', type: 'currency', label: 'Minimum Bütçe', enabled: true, required: false, order: 2, prefix: '₺' },
    { id: 'budgetMax', type: 'currency', label: 'Maksimum Bütçe', enabled: true, required: false, order: 3, prefix: '₺' },
    { id: 'isNegotiable', type: 'switch', label: 'Pazarlık Yapılabilir', enabled: true, required: false, order: 4 },
  ],
  requiredFields: [],
  optionalFields: ['organizerBudget', 'budgetMin', 'budgetMax', 'isNegotiable'],
};

/**
 * Katılımcı Modülü
 */
const participantModule: ModuleDefinition = {
  id: 'participant',
  name: 'Katılımcı',
  description: 'Kapasite, yaş sınırı ve katılımcı türü',
  icon: 'people-outline',
  category: 'display',
  component: 'ParticipantModule',
  defaultConfig: {
    enabled: true,
    order: 4,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'expectedCount', type: 'number', label: 'Beklenen Katılımcı', enabled: true, required: false, order: 1 },
    { id: 'ageLimit', type: 'text', label: 'Yaş Sınırı', enabled: true, required: false, order: 2 },
    { id: 'participantType', type: 'text', label: 'Katılımcı Türü', enabled: true, required: false, order: 3 },
    { id: 'hasVipArea', type: 'switch', label: 'VIP Alan', enabled: true, required: false, order: 4 },
    { id: 'vipCapacity', type: 'number', label: 'VIP Kapasitesi', enabled: true, required: false, order: 5 },
  ],
  requiredFields: [],
  optionalFields: ['expectedCount', 'ageLimit', 'participantType', 'hasVipArea', 'vipCapacity'],
};

/**
 * Medya Modülü
 */
const mediaModule: ModuleDefinition = {
  id: 'media',
  name: 'Medya',
  description: 'Etkinlik görselleri ve videolar',
  icon: 'images-outline',
  category: 'display',
  component: 'MediaModule',
  defaultConfig: {
    enabled: true,
    order: 5,
    required: false,
    collapsed: true,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'images', type: 'image', label: 'Görseller', enabled: true, required: false, order: 1 },
    { id: 'videos', type: 'file', label: 'Videolar', enabled: true, required: false, order: 2 },
    { id: 'posterImage', type: 'image', label: 'Poster', enabled: true, required: false, order: 3 },
  ],
  requiredFields: [],
  optionalFields: ['images', 'videos', 'posterImage'],
};

/**
 * Döküman Modülü
 */
const documentModule: ModuleDefinition = {
  id: 'document',
  name: 'Dökümanlar',
  description: 'Sözleşme, rider ve teknik spesifikasyonlar',
  icon: 'document-text-outline',
  category: 'display',
  component: 'DocumentModule',
  defaultConfig: {
    enabled: true,
    order: 6,
    required: false,
    collapsed: true,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'documents', type: 'file', label: 'Dökümanlar', enabled: true, required: false, order: 1 },
  ],
  requiredFields: [],
  optionalFields: ['documents'],
};

/**
 * Ekip Modülü
 */
const teamModule: ModuleDefinition = {
  id: 'team',
  name: 'Ekip',
  description: 'Personel listesi ve roller',
  icon: 'people-circle-outline',
  category: 'display',
  component: 'TeamModule',
  defaultConfig: {
    enabled: true,
    order: 7,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'members', type: 'custom', label: 'Ekip Üyeleri', enabled: true, required: false, order: 1 },
    { id: 'totalCount', type: 'number', label: 'Toplam Kişi', enabled: true, required: false, order: 2 },
  ],
  requiredFields: [],
  optionalFields: ['members', 'totalCount'],
};

/**
 * Ekipman Modülü
 */
const equipmentModule: ModuleDefinition = {
  id: 'equipment',
  name: 'Ekipman',
  description: 'Ekipman listesi ve teknik gereksinimler',
  icon: 'hardware-chip-outline',
  category: 'display',
  component: 'EquipmentModule',
  defaultConfig: {
    enabled: true,
    order: 8,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'items', type: 'custom', label: 'Ekipman Listesi', enabled: true, required: false, order: 1 },
    { id: 'powerRequirement', type: 'text', label: 'Güç İhtiyacı', enabled: true, required: false, order: 2 },
    { id: 'setupTime', type: 'text', label: 'Kurulum Süresi', enabled: true, required: false, order: 3 },
  ],
  requiredFields: [],
  optionalFields: ['items', 'powerRequirement', 'setupTime'],
};

/**
 * Lojistik Modülü
 */
const logisticsModule: ModuleDefinition = {
  id: 'logistics',
  name: 'Lojistik',
  description: 'Ulaşım, konaklama ve transfer bilgileri',
  icon: 'airplane-outline',
  category: 'display',
  component: 'LogisticsModule',
  defaultConfig: {
    enabled: true,
    order: 9,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'departureCity', type: 'text', label: 'Kalkış Şehri', enabled: true, required: false, order: 1 },
    { id: 'arrivalCity', type: 'text', label: 'Varış Şehri', enabled: true, required: false, order: 2 },
    { id: 'departureTime', type: 'datetime', label: 'Kalkış Zamanı', enabled: true, required: false, order: 3 },
    { id: 'passengerCount', type: 'number', label: 'Yolcu Sayısı', enabled: true, required: false, order: 4 },
    { id: 'returnTrip', type: 'switch', label: 'Dönüş Var', enabled: true, required: false, order: 5 },
  ],
  requiredFields: [],
  optionalFields: ['departureCity', 'arrivalCity', 'departureTime', 'passengerCount', 'returnTrip'],
};

/**
 * İletişim Modülü
 */
const contactModule: ModuleDefinition = {
  id: 'contact',
  name: 'İletişim',
  description: 'İletişim kişisi, telefon ve sosyal medya',
  icon: 'call-outline',
  category: 'display',
  component: 'ContactModule',
  defaultConfig: {
    enabled: true,
    order: 10,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'primaryContact', type: 'custom', label: 'Birincil İletişim', enabled: true, required: false, order: 1 },
    { id: 'secondaryContact', type: 'custom', label: 'İkincil İletişim', enabled: true, required: false, order: 2 },
    { id: 'socialMedia', type: 'custom', label: 'Sosyal Medya', enabled: true, required: false, order: 3 },
  ],
  requiredFields: [],
  optionalFields: ['primaryContact', 'secondaryContact', 'socialMedia'],
};

/**
 * Zaman Çizelgesi Modülü
 */
const timelineModule: ModuleDefinition = {
  id: 'timeline',
  name: 'Zaman Çizelgesi',
  description: 'Etkinlik programı ve aşamalar',
  icon: 'git-branch-outline',
  category: 'display',
  component: 'TimelineModule',
  defaultConfig: {
    enabled: true,
    order: 11,
    required: false,
    collapsed: true,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'items', type: 'custom', label: 'Program', enabled: true, required: false, order: 1 },
  ],
  requiredFields: [],
  optionalFields: ['items'],
};

/**
 * Kontrol Listesi Modülü
 */
const checklistModule: ModuleDefinition = {
  id: 'checklist',
  name: 'Kontrol Listesi',
  description: 'Hazırlık adımları ve kontrol noktaları',
  icon: 'checkbox-outline',
  category: 'display',
  component: 'ChecklistModule',
  defaultConfig: {
    enabled: true,
    order: 12,
    required: false,
    collapsed: true,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'items', type: 'custom', label: 'Kontrol Listesi', enabled: true, required: false, order: 1 },
    { id: 'progress', type: 'number', label: 'İlerleme (%)', enabled: true, required: false, order: 2 },
  ],
  requiredFields: [],
  optionalFields: ['items', 'progress'],
};

/**
 * Değerlendirme Modülü
 */
const ratingModule: ModuleDefinition = {
  id: 'rating',
  name: 'Değerlendirme',
  description: 'Puanlama ve yorumlar',
  icon: 'star-outline',
  category: 'display',
  component: 'RatingModule',
  defaultConfig: {
    enabled: true,
    order: 13,
    required: false,
    collapsed: true,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'overallRating', type: 'rating', label: 'Genel Puan', enabled: true, required: false, order: 1 },
    { id: 'reviewCount', type: 'number', label: 'Yorum Sayısı', enabled: true, required: false, order: 2 },
    { id: 'reviews', type: 'custom', label: 'Yorumlar', enabled: true, required: false, order: 3 },
  ],
  requiredFields: [],
  optionalFields: ['overallRating', 'reviewCount', 'reviews'],
};

/**
 * Menü Modülü
 */
const menuModule: ModuleDefinition = {
  id: 'menu',
  name: 'Menü',
  description: 'Yemek seçenekleri ve diyet bilgileri',
  icon: 'restaurant-outline',
  category: 'display',
  component: 'MenuModule',
  defaultConfig: {
    enabled: true,
    order: 14,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'mealTypes', type: 'multiselect', label: 'Öğün Türleri', enabled: true, required: false, order: 1 },
    { id: 'serviceStyle', type: 'select', label: 'Servis Stili', enabled: true, required: false, order: 2 },
    { id: 'guestCount', type: 'number', label: 'Kişi Sayısı', enabled: true, required: false, order: 3 },
    { id: 'dietaryRestrictions', type: 'multiselect', label: 'Diyet Kısıtlamaları', enabled: true, required: false, order: 4 },
  ],
  requiredFields: [],
  optionalFields: ['mealTypes', 'serviceStyle', 'guestCount', 'dietaryRestrictions'],
};

/**
 * Araç Modülü
 */
const vehicleModule: ModuleDefinition = {
  id: 'vehicle',
  name: 'Araç',
  description: 'Araç bilgileri ve kapasite',
  icon: 'car-outline',
  category: 'display',
  component: 'VehicleModule',
  defaultConfig: {
    enabled: true,
    order: 15,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'vehicleType', type: 'select', label: 'Araç Türü', enabled: true, required: false, order: 1 },
    { id: 'vehicleCount', type: 'number', label: 'Araç Sayısı', enabled: true, required: false, order: 2 },
    { id: 'passengerCapacity', type: 'number', label: 'Yolcu Kapasitesi', enabled: true, required: false, order: 3 },
    { id: 'amenities', type: 'multiselect', label: 'Özellikler', enabled: true, required: false, order: 4 },
  ],
  requiredFields: [],
  optionalFields: ['vehicleType', 'vehicleCount', 'passengerCapacity', 'amenities'],
};

/**
 * Medikal Modülü
 */
const medicalModule: ModuleDefinition = {
  id: 'medical',
  name: 'Medikal',
  description: 'Tıbbi hizmetler ve ambulans',
  icon: 'medkit-outline',
  category: 'display',
  component: 'MedicalModule',
  defaultConfig: {
    enabled: true,
    order: 16,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'serviceTypes', type: 'multiselect', label: 'Hizmet Türleri', enabled: true, required: false, order: 1 },
    { id: 'personnelCount', type: 'number', label: 'Personel Sayısı', enabled: true, required: false, order: 2 },
    { id: 'ambulanceCount', type: 'number', label: 'Ambulans Sayısı', enabled: true, required: false, order: 3 },
  ],
  requiredFields: [],
  optionalFields: ['serviceTypes', 'personnelCount', 'ambulanceCount'],
};

/**
 * Biletleme Modülü
 */
const ticketingModule: ModuleDefinition = {
  id: 'ticketing',
  name: 'Biletleme',
  description: 'Bilet satış ve kapasite bilgileri',
  icon: 'ticket-outline',
  category: 'display',
  component: 'TicketingModule',
  defaultConfig: {
    enabled: true,
    order: 17,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'totalCapacity', type: 'number', label: 'Toplam Kapasite', enabled: true, required: false, order: 1 },
    { id: 'ticketTypes', type: 'custom', label: 'Bilet Türleri', enabled: true, required: false, order: 2 },
    { id: 'soldCount', type: 'number', label: 'Satılan', enabled: true, required: false, order: 3 },
    { id: 'availableCount', type: 'number', label: 'Kalan', enabled: true, required: false, order: 4 },
  ],
  requiredFields: [],
  optionalFields: ['totalCapacity', 'ticketTypes', 'soldCount', 'availableCount'],
};

// ============================================
// FORM MODÜL TANIMLARI
// ============================================

/**
 * Mekan Form Modülü
 */
const venueFormModule: ModuleDefinition = {
  id: 'venue_form',
  name: 'Mekan Bilgileri',
  description: 'Mekan türü, kapasite ve özellikler',
  icon: 'business-outline',
  category: 'form',
  component: 'VenueFormModule',
  defaultConfig: {
    enabled: true,
    order: 1,
    required: true,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'venueType', type: 'chips', label: 'Mekan Türü', enabled: true, required: true, order: 1, options: [
      { value: 'concert_hall', label: 'Konser Salonu' },
      { value: 'arena', label: 'Arena' },
      { value: 'stadium', label: 'Stadyum' },
      { value: 'hotel_ballroom', label: 'Otel Balo Salonu' },
      { value: 'open_air', label: 'Açık Hava' },
      { value: 'club', label: 'Kulüp' },
      { value: 'theater', label: 'Tiyatro' },
    ]},
    { id: 'indoorOutdoor', type: 'chips', label: 'Alan Tipi', enabled: true, required: true, order: 2, options: [
      { value: 'indoor', label: 'Kapalı' },
      { value: 'outdoor', label: 'Açık' },
      { value: 'mixed', label: 'Karma' },
    ]},
    { id: 'capacity', type: 'number', label: 'Kapasite', enabled: true, required: true, order: 3 },
    { id: 'seatingType', type: 'chips', label: 'Oturma Düzeni', enabled: true, required: false, order: 4, options: [
      { value: 'standing', label: 'Ayakta' },
      { value: 'seated', label: 'Oturma' },
      { value: 'mixed', label: 'Karma' },
    ]},
  ],
  requiredFields: ['venueType', 'indoorOutdoor', 'capacity'],
  optionalFields: ['seatingType'],
};

/**
 * Tarih/Saat Form Modülü
 */
const datetimeFormModule: ModuleDefinition = {
  id: 'datetime_form',
  name: 'Tarih ve Saat',
  description: 'Etkinlik tarihi, saati ve süresi',
  icon: 'calendar-outline',
  category: 'form',
  component: 'DateTimeFormModule',
  defaultConfig: {
    enabled: true,
    order: 2,
    required: true,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'eventDate', type: 'date', label: 'Etkinlik Tarihi', enabled: true, required: true, order: 1 },
    { id: 'eventTime', type: 'time', label: 'Başlangıç Saati', enabled: true, required: false, order: 2 },
    { id: 'duration', type: 'select', label: 'Süre', enabled: true, required: false, order: 3, options: [
      { value: '30min', label: '30 Dakika' },
      { value: '1h', label: '1 Saat' },
      { value: '1.5h', label: '1.5 Saat' },
      { value: '2h', label: '2 Saat' },
      { value: '3h', label: '3 Saat' },
      { value: '4h+', label: '4+ Saat' },
    ]},
  ],
  requiredFields: ['eventDate'],
  optionalFields: ['eventTime', 'duration'],
};

/**
 * Bütçe Form Modülü
 */
const budgetFormModule: ModuleDefinition = {
  id: 'budget_form',
  name: 'Bütçe',
  description: 'Bütçe aralığı ve ödeme tercihleri',
  icon: 'cash-outline',
  category: 'form',
  component: 'BudgetFormModule',
  defaultConfig: {
    enabled: true,
    order: 3,
    required: true,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'budgetMin', type: 'currency', label: 'Minimum Bütçe', enabled: true, required: false, order: 1, prefix: '₺' },
    { id: 'budgetMax', type: 'currency', label: 'Maksimum Bütçe', enabled: true, required: false, order: 2, prefix: '₺' },
    { id: 'isNegotiable', type: 'switch', label: 'Pazarlık Yapılabilir', enabled: true, required: false, order: 3 },
  ],
  requiredFields: [],
  optionalFields: ['budgetMin', 'budgetMax', 'isNegotiable'],
};

/**
 * Katılımcı Form Modülü
 */
const participantFormModule: ModuleDefinition = {
  id: 'participant_form',
  name: 'Katılımcı Bilgileri',
  description: 'Kişi sayısı, yaş sınırı ve VIP alan',
  icon: 'people-outline',
  category: 'form',
  component: 'ParticipantFormModule',
  defaultConfig: {
    enabled: true,
    order: 4,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'expectedCount', type: 'number', label: 'Beklenen Katılımcı', enabled: true, required: false, order: 1 },
    { id: 'ageLimit', type: 'chips', label: 'Yaş Sınırı', enabled: true, required: false, order: 2, options: [
      { value: 'all', label: 'Tüm Yaşlar' },
      { value: '7+', label: '7+' },
      { value: '13+', label: '13+' },
      { value: '18+', label: '18+' },
      { value: '21+', label: '21+' },
    ]},
    { id: 'hasVipArea', type: 'switch', label: 'VIP Alan', enabled: true, required: false, order: 3 },
  ],
  requiredFields: [],
  optionalFields: ['expectedCount', 'ageLimit', 'hasVipArea'],
};

/**
 * Ekipman Form Modülü
 */
const equipmentFormModule: ModuleDefinition = {
  id: 'equipment_form',
  name: 'Ekipman Gereksinimleri',
  description: 'Ses, ışık ve sahne ekipmanları',
  icon: 'hardware-chip-outline',
  category: 'form',
  component: 'EquipmentFormModule',
  defaultConfig: {
    enabled: true,
    order: 5,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'soundRequirements', type: 'chips', label: 'Ses Sistemi', enabled: true, required: false, order: 1, options: [
      { value: 'line_array', label: 'Line Array' },
      { value: 'subwoofer', label: 'Subwoofer' },
      { value: 'monitor', label: 'Monitör' },
      { value: 'mixer', label: 'Mikser' },
      { value: 'wireless_mic', label: 'Kablosuz Mikrofon' },
    ]},
    { id: 'lightingRequirements', type: 'chips', label: 'Işık Sistemi', enabled: true, required: false, order: 2, options: [
      { value: 'moving_head', label: 'Moving Head' },
      { value: 'led_bar', label: 'LED Bar' },
      { value: 'laser', label: 'Lazer' },
      { value: 'strobe', label: 'Strobe' },
      { value: 'fog_machine', label: 'Sis Makinesi' },
    ]},
    { id: 'powerRequirement', type: 'select', label: 'Güç İhtiyacı', enabled: true, required: false, order: 3, options: [
      { value: '32A', label: '32A' },
      { value: '63A', label: '63A' },
      { value: '125A', label: '125A' },
      { value: '250A', label: '250A' },
    ]},
  ],
  requiredFields: [],
  optionalFields: ['soundRequirements', 'lightingRequirements', 'powerRequirement'],
};

/**
 * Catering Form Modülü
 */
const cateringFormModule: ModuleDefinition = {
  id: 'catering_form',
  name: 'Catering',
  description: 'Öğün türü, diyet ve servis stili',
  icon: 'restaurant-outline',
  category: 'form',
  component: 'CateringFormModule',
  defaultConfig: {
    enabled: true,
    order: 6,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'mealTypes', type: 'chips', label: 'Öğün Türü', enabled: true, required: true, order: 1, options: [
      { value: 'breakfast', label: 'Kahvaltı' },
      { value: 'lunch', label: 'Öğle Yemeği' },
      { value: 'dinner', label: 'Akşam Yemeği' },
      { value: 'snack', label: 'Atıştırmalık' },
      { value: 'cocktail', label: 'Kokteyl' },
    ]},
    { id: 'serviceStyle', type: 'chips', label: 'Servis Stili', enabled: true, required: false, order: 2, options: [
      { value: 'fine_dining', label: 'Fine Dining' },
      { value: 'buffet', label: 'Büfe' },
      { value: 'casual', label: 'Casual' },
      { value: 'food_truck', label: 'Food Truck' },
    ]},
    { id: 'guestCount', type: 'number', label: 'Kişi Sayısı', enabled: true, required: true, order: 3 },
    { id: 'dietaryRestrictions', type: 'chips', label: 'Diyet Kısıtlamaları', enabled: true, required: false, order: 4, options: [
      { value: 'vegetarian', label: 'Vejetaryen' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'gluten_free', label: 'Glutensiz' },
      { value: 'halal', label: 'Helal' },
      { value: 'kosher', label: 'Koşer' },
    ]},
  ],
  requiredFields: ['mealTypes', 'guestCount'],
  optionalFields: ['serviceStyle', 'dietaryRestrictions'],
};

/**
 * Güvenlik Form Modülü
 */
const securityFormModule: ModuleDefinition = {
  id: 'security_form',
  name: 'Güvenlik',
  description: 'Güvenlik personeli ve vardiya bilgileri',
  icon: 'shield-outline',
  category: 'form',
  component: 'SecurityFormModule',
  defaultConfig: {
    enabled: true,
    order: 7,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'guardCount', type: 'number', label: 'Güvenlik Sayısı', enabled: true, required: true, order: 1 },
    { id: 'shiftHours', type: 'select', label: 'Vardiya Süresi', enabled: true, required: true, order: 2, options: [
      { value: '4h', label: '4 Saat' },
      { value: '8h', label: '8 Saat' },
      { value: '12h', label: '12 Saat' },
    ]},
    { id: 'securityAreas', type: 'chips', label: 'Güvenlik Alanları', enabled: true, required: false, order: 3, options: [
      { value: 'entrance', label: 'Giriş' },
      { value: 'stage', label: 'Sahne' },
      { value: 'vip', label: 'VIP' },
      { value: 'backstage', label: 'Backstage' },
      { value: 'parking', label: 'Otopark' },
    ]},
    { id: 'armedSecurity', type: 'switch', label: 'Silahlı Güvenlik', enabled: true, required: false, order: 4 },
  ],
  requiredFields: ['guardCount', 'shiftHours'],
  optionalFields: ['securityAreas', 'armedSecurity'],
};

/**
 * Transfer Form Modülü
 */
const transportFormModule: ModuleDefinition = {
  id: 'transport_form',
  name: 'Transfer',
  description: 'Araç türü, güzergah ve yolcu bilgileri',
  icon: 'car-outline',
  category: 'form',
  component: 'TransportFormModule',
  defaultConfig: {
    enabled: true,
    order: 8,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'vehicleType', type: 'chips', label: 'Araç Türü', enabled: true, required: true, order: 1, options: [
      { value: 'sedan', label: 'Sedan' },
      { value: 'suv', label: 'SUV' },
      { value: 'van', label: 'Van' },
      { value: 'minibus', label: 'Minibüs' },
      { value: 'bus', label: 'Otobüs' },
      { value: 'limousine', label: 'Limuzin' },
    ]},
    { id: 'passengerCount', type: 'number', label: 'Yolcu Sayısı', enabled: true, required: true, order: 2 },
    { id: 'departureCity', type: 'text', label: 'Kalkış', enabled: true, required: true, order: 3 },
    { id: 'arrivalCity', type: 'text', label: 'Varış', enabled: true, required: true, order: 4 },
    { id: 'returnTrip', type: 'switch', label: 'Dönüş Dahil', enabled: true, required: false, order: 5 },
    { id: 'luggageCount', type: 'number', label: 'Bagaj Sayısı', enabled: true, required: false, order: 6 },
  ],
  requiredFields: ['vehicleType', 'passengerCount', 'departureCity', 'arrivalCity'],
  optionalFields: ['returnTrip', 'luggageCount'],
};

/**
 * Konaklama Form Modülü
 */
const accommodationFormModule: ModuleDefinition = {
  id: 'accommodation_form',
  name: 'Konaklama',
  description: 'Oda türü, yıldız ve kahvaltı seçenekleri',
  icon: 'bed-outline',
  category: 'form',
  component: 'AccommodationFormModule',
  defaultConfig: {
    enabled: true,
    order: 9,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'roomType', type: 'chips', label: 'Oda Türü', enabled: true, required: true, order: 1, options: [
      { value: 'single', label: 'Tek Kişilik' },
      { value: 'double', label: 'Çift Kişilik' },
      { value: 'suite', label: 'Suit' },
      { value: 'presidential', label: 'Başkanlık Suiti' },
    ]},
    { id: 'roomCount', type: 'number', label: 'Oda Sayısı', enabled: true, required: true, order: 2 },
    { id: 'starRating', type: 'chips', label: 'Otel Yıldızı', enabled: true, required: false, order: 3, options: [
      { value: '3', label: '3 Yıldız' },
      { value: '4', label: '4 Yıldız' },
      { value: '5', label: '5 Yıldız' },
    ]},
    { id: 'includeBreakfast', type: 'switch', label: 'Kahvaltı Dahil', enabled: true, required: false, order: 4 },
    { id: 'checkInDate', type: 'date', label: 'Giriş Tarihi', enabled: true, required: true, order: 5 },
    { id: 'checkOutDate', type: 'date', label: 'Çıkış Tarihi', enabled: true, required: true, order: 6 },
  ],
  requiredFields: ['roomType', 'roomCount', 'checkInDate', 'checkOutDate'],
  optionalFields: ['starRating', 'includeBreakfast'],
};

/**
 * Medya Form Modülü
 */
const mediaFormModule: ModuleDefinition = {
  id: 'media_form',
  name: 'Fotoğraf / Video',
  description: 'Hizmet türü, süre ve teslimat formatı',
  icon: 'camera-outline',
  category: 'form',
  component: 'MediaFormModule',
  defaultConfig: {
    enabled: true,
    order: 10,
    required: false,
    collapsed: false,
    visibility: 'all',
    fields: {},
  },
  fields: [
    { id: 'serviceTypes', type: 'chips', label: 'Hizmet Türü', enabled: true, required: true, order: 1, options: [
      { value: 'photography', label: 'Fotoğraf' },
      { value: 'video', label: 'Video' },
      { value: 'drone', label: 'Drone' },
      { value: 'live_stream', label: 'Canlı Yayın' },
    ]},
    { id: 'duration', type: 'select', label: 'Çekim Süresi', enabled: true, required: true, order: 2, options: [
      { value: '2h', label: '2 Saat' },
      { value: '4h', label: '4 Saat' },
      { value: '8h', label: '8 Saat' },
      { value: 'full_day', label: 'Tam Gün' },
    ]},
    { id: 'deliveryFormat', type: 'chips', label: 'Teslimat Formatı', enabled: true, required: false, order: 3, options: [
      { value: 'digital', label: 'Dijital' },
      { value: 'print', label: 'Baskı' },
      { value: 'album', label: 'Albüm' },
      { value: 'usb', label: 'USB' },
    ]},
    { id: 'editingIncluded', type: 'switch', label: 'Düzenleme Dahil', enabled: true, required: false, order: 4 },
  ],
  requiredFields: ['serviceTypes', 'duration'],
  optionalFields: ['deliveryFormat', 'editingIncluded'],
};

// ============================================
// EXPORT
// ============================================

/**
 * Tüm varsayılan modüller
 */
export const defaultModules: ModuleDefinition[] = [
  // Display Modules
  venueModule,
  datetimeModule,
  budgetModule,
  participantModule,
  mediaModule,
  documentModule,
  teamModule,
  equipmentModule,
  logisticsModule,
  contactModule,
  timelineModule,
  checklistModule,
  ratingModule,
  menuModule,
  vehicleModule,
  medicalModule,
  ticketingModule,
  // Form Modules
  venueFormModule,
  datetimeFormModule,
  budgetFormModule,
  participantFormModule,
  equipmentFormModule,
  cateringFormModule,
  securityFormModule,
  transportFormModule,
  accommodationFormModule,
  mediaFormModule,
];

/**
 * Display modülleri
 */
export const displayModules: ModuleDefinition[] = defaultModules.filter(m => m.category === 'display');

/**
 * Form modülleri
 */
export const formModules: ModuleDefinition[] = defaultModules.filter(m => m.category === 'form');
