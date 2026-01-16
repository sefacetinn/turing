/**
 * Varsayılan Hizmet Konfigürasyonları
 *
 * 6 ana kategori ve 13 operasyon alt kategorisi için
 * varsayılan hizmet tanımları.
 */

import { ServiceDefinition, getDefaultPermissions, getDefaultSettings } from '../types/serviceDefinition';

// ============================================
// ANA KATEGORİLER
// ============================================

/**
 * Booking (Sanatçı) Hizmeti
 */
const bookingService: ServiceDefinition = {
  id: 'booking',
  category: 'booking',
  name: 'Sanatçı / Booking',
  shortName: 'Booking',
  description: 'Sanatçı ve performans hizmetleri için teklif ve yönetim',
  icon: 'musical-notes',
  gradient: ['#6366F1', '#8B5CF6'],
  color: '#6366F1',
  isActive: true,
  isVisible: true,
  sortOrder: 1,

  detailModules: [
    { moduleId: 'venue', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'participant', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'timeline', config: { enabled: true, order: 5, required: false, collapsed: true, visibility: 'all', fields: {} } },
    { moduleId: 'document', config: { enabled: true, order: 6, required: false, collapsed: true, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 7, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'media', config: { enabled: true, order: 8, required: false, collapsed: true, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'venue_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'participant_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: true,
    requireDeposit: true,
    depositPercentage: 50,
    requireRider: true,
  },
};

/**
 * Technical (Teknik Ekipman) Hizmeti
 */
const technicalService: ServiceDefinition = {
  id: 'technical',
  category: 'technical',
  name: 'Teknik Ekipman',
  shortName: 'Teknik',
  description: 'Ses, ışık ve sahne ekipmanları için teklif ve yönetim',
  icon: 'hardware-chip',
  gradient: ['#10B981', '#059669'],
  color: '#10B981',
  isActive: true,
  isVisible: true,
  sortOrder: 2,

  detailModules: [
    { moduleId: 'venue', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'equipment', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'team', config: { enabled: true, order: 5, required: false, collapsed: true, visibility: 'all', fields: {} } },
    { moduleId: 'document', config: { enabled: true, order: 6, required: false, collapsed: true, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 7, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'venue_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'equipment_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: true,
    requireDeposit: true,
    depositPercentage: 30,
  },
};

/**
 * Venue (Mekan) Hizmeti
 */
const venueService: ServiceDefinition = {
  id: 'venue',
  category: 'venue',
  name: 'Mekan',
  shortName: 'Mekan',
  description: 'Etkinlik mekanları için kiralama ve yönetim',
  icon: 'business',
  gradient: ['#F59E0B', '#D97706'],
  color: '#F59E0B',
  isActive: true,
  isVisible: true,
  sortOrder: 3,

  detailModules: [
    { moduleId: 'venue', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'participant', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'media', config: { enabled: true, order: 5, required: false, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 6, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'venue_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'participant_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: true,
    requireDeposit: true,
    depositPercentage: 50,
  },
};

/**
 * Accommodation (Konaklama) Hizmeti
 */
const accommodationService: ServiceDefinition = {
  id: 'accommodation',
  category: 'accommodation',
  name: 'Konaklama',
  shortName: 'Konaklama',
  description: 'Otel ve konaklama hizmetleri',
  icon: 'bed',
  gradient: ['#3B82F6', '#2563EB'],
  color: '#3B82F6',
  isActive: true,
  isVisible: true,
  sortOrder: 4,

  detailModules: [
    { moduleId: 'logistics', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'accommodation_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: false,
    requireDeposit: true,
    depositPercentage: 30,
  },
};

/**
 * Transport (Ulaşım) Hizmeti
 */
const transportService: ServiceDefinition = {
  id: 'transport',
  category: 'transport',
  name: 'Ulaşım',
  shortName: 'Transfer',
  description: 'VIP transfer ve ulaşım hizmetleri',
  icon: 'car',
  gradient: ['#8B5CF6', '#7C3AED'],
  color: '#8B5CF6',
  isActive: true,
  isVisible: true,
  sortOrder: 5,

  detailModules: [
    { moduleId: 'logistics', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'vehicle', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 5, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'transport_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: false,
    requireDeposit: false,
  },
};

// ============================================
// OPERASYON ALT KATEGORİLERİ
// ============================================

/**
 * Security (Güvenlik) Hizmeti
 */
const securityService: ServiceDefinition = {
  id: 'security',
  category: 'operation',
  subCategory: 'security',
  name: 'Güvenlik',
  shortName: 'Güvenlik',
  description: 'Etkinlik güvenlik hizmetleri',
  icon: 'shield',
  gradient: ['#EF4444', '#DC2626'],
  color: '#EF4444',
  isActive: true,
  isVisible: true,
  sortOrder: 10,

  detailModules: [
    { moduleId: 'venue', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'team', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'participant', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 5, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'checklist', config: { enabled: true, order: 6, required: false, collapsed: true, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 7, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'security_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'venue_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: true,
    requireInsurance: true,
  },
};

/**
 * Catering Hizmeti
 */
const cateringService: ServiceDefinition = {
  id: 'catering',
  category: 'operation',
  subCategory: 'catering',
  name: 'Catering',
  shortName: 'Catering',
  description: 'Yiyecek ve içecek hizmetleri',
  icon: 'restaurant',
  gradient: ['#F97316', '#EA580C'],
  color: '#F97316',
  isActive: true,
  isVisible: true,
  sortOrder: 11,

  detailModules: [
    { moduleId: 'venue', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'menu', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'participant', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 5, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'team', config: { enabled: true, order: 6, required: false, collapsed: true, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 7, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'catering_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'venue_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: false,
    requireDeposit: true,
    depositPercentage: 30,
  },
};

/**
 * Medical (Medikal) Hizmeti
 */
const medicalService: ServiceDefinition = {
  id: 'medical',
  category: 'operation',
  subCategory: 'medical',
  name: 'Medikal',
  shortName: 'Medikal',
  description: 'Tıbbi hizmetler ve ambulans',
  icon: 'medkit',
  gradient: ['#EC4899', '#DB2777'],
  color: '#EC4899',
  isActive: true,
  isVisible: true,
  sortOrder: 12,

  detailModules: [
    { moduleId: 'datetime', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'team', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'medical', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 5, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'venue_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'participant_form', config: { enabled: true, order: 3, required: false, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: false,
    requireContract: true,
    requireInsurance: true,
  },
};

/**
 * Media (Fotoğraf/Video) Hizmeti
 */
const mediaService: ServiceDefinition = {
  id: 'media_service',
  category: 'operation',
  subCategory: 'media',
  name: 'Fotoğraf / Video',
  shortName: 'Medya',
  description: 'Fotoğraf ve video çekim hizmetleri',
  icon: 'camera',
  gradient: ['#14B8A6', '#0D9488'],
  color: '#14B8A6',
  isActive: true,
  isVisible: true,
  sortOrder: 13,

  detailModules: [
    { moduleId: 'venue', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'team', config: { enabled: true, order: 3, required: false, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 5, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'media_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'venue_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: false,
    requireDeposit: true,
    depositPercentage: 30,
  },
};

/**
 * Decoration (Dekorasyon) Hizmeti
 */
const decorationService: ServiceDefinition = {
  id: 'decoration',
  category: 'operation',
  subCategory: 'decoration',
  name: 'Dekorasyon',
  shortName: 'Dekor',
  description: 'Etkinlik dekorasyon ve tasarım hizmetleri',
  icon: 'flower',
  gradient: ['#A855F7', '#9333EA'],
  color: '#A855F7',
  isActive: true,
  isVisible: true,
  sortOrder: 14,

  detailModules: [
    { moduleId: 'venue', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'media', config: { enabled: true, order: 3, required: false, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'team', config: { enabled: true, order: 5, required: false, collapsed: true, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 6, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'venue_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: false,
    requireDeposit: true,
    depositPercentage: 40,
  },
};

/**
 * Generator (Jeneratör) Hizmeti
 */
const generatorService: ServiceDefinition = {
  id: 'generator',
  category: 'operation',
  subCategory: 'generator',
  name: 'Jeneratör',
  shortName: 'Jeneratör',
  description: 'Güç kaynağı ve jeneratör hizmetleri',
  icon: 'flash',
  gradient: ['#EAB308', '#CA8A04'],
  color: '#EAB308',
  isActive: true,
  isVisible: true,
  sortOrder: 15,

  detailModules: [
    { moduleId: 'venue', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'equipment', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 5, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'venue_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'equipment_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: false,
    requireDeposit: true,
    depositPercentage: 30,
  },
};

/**
 * Ticketing (Biletleme) Hizmeti
 */
const ticketingService: ServiceDefinition = {
  id: 'ticketing',
  category: 'operation',
  subCategory: 'ticketing',
  name: 'Biletleme',
  shortName: 'Bilet',
  description: 'Bilet satış ve giriş yönetimi',
  icon: 'ticket',
  gradient: ['#06B6D4', '#0891B2'],
  color: '#06B6D4',
  isActive: true,
  isVisible: true,
  sortOrder: 16,

  detailModules: [
    { moduleId: 'datetime', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'ticketing', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'venue_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'participant_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: false,
    requireContract: true,
  },
};

/**
 * Flight (Uçuş) Hizmeti
 */
const flightService: ServiceDefinition = {
  id: 'flight',
  category: 'operation',
  subCategory: 'flight',
  name: 'Uçuş',
  shortName: 'Uçuş',
  description: 'Uçak bileti ve havayolu hizmetleri',
  icon: 'airplane',
  gradient: ['#6366F1', '#4F46E5'],
  color: '#6366F1',
  isActive: true,
  isVisible: true,
  sortOrder: 17,

  detailModules: [
    { moduleId: 'logistics', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'transport_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: false,
    requireContract: false,
    requireDeposit: true,
    depositPercentage: 100,
  },
};

/**
 * Beverage (İçecek) Hizmeti
 */
const beverageService: ServiceDefinition = {
  id: 'beverage',
  category: 'operation',
  subCategory: 'beverage',
  name: 'İçecek',
  shortName: 'İçecek',
  description: 'Bar ve içecek servisi hizmetleri',
  icon: 'wine',
  gradient: ['#BE185D', '#9D174D'],
  color: '#BE185D',
  isActive: true,
  isVisible: true,
  sortOrder: 18,

  detailModules: [
    { moduleId: 'venue', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'menu', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'participant', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 5, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 6, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'catering_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'venue_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: false,
    requireDeposit: true,
    depositPercentage: 30,
  },
};

/**
 * Barrier (Bariyer) Hizmeti
 */
const barrierService: ServiceDefinition = {
  id: 'barrier',
  category: 'operation',
  subCategory: 'barrier',
  name: 'Bariyer',
  shortName: 'Bariyer',
  description: 'Bariyer ve güvenlik çiti hizmetleri',
  icon: 'git-network',
  gradient: ['#64748B', '#475569'],
  color: '#64748B',
  isActive: true,
  isVisible: true,
  sortOrder: 19,

  detailModules: [
    { moduleId: 'venue', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'equipment', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 5, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'venue_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'equipment_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: false,
    requireDeposit: false,
  },
};

/**
 * Tent (Çadır) Hizmeti
 */
const tentService: ServiceDefinition = {
  id: 'tent',
  category: 'operation',
  subCategory: 'tent',
  name: 'Çadır',
  shortName: 'Çadır',
  description: 'Çadır ve tente kiralama hizmetleri',
  icon: 'triangle',
  gradient: ['#84CC16', '#65A30D'],
  color: '#84CC16',
  isActive: true,
  isVisible: true,
  sortOrder: 20,

  detailModules: [
    { moduleId: 'venue', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'equipment', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 5, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'venue_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'equipment_form', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: false,
    requireDeposit: true,
    depositPercentage: 30,
  },
};

/**
 * Sanitation (Sanitasyon) Hizmeti
 */
const sanitationService: ServiceDefinition = {
  id: 'sanitation',
  category: 'operation',
  subCategory: 'sanitation',
  name: 'Sanitasyon',
  shortName: 'Temizlik',
  description: 'Temizlik ve sanitasyon hizmetleri',
  icon: 'water',
  gradient: ['#0EA5E9', '#0284C7'],
  color: '#0EA5E9',
  isActive: true,
  isVisible: true,
  sortOrder: 21,

  detailModules: [
    { moduleId: 'venue', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'team', config: { enabled: true, order: 3, required: false, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 5, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'venue_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'participant_form', config: { enabled: true, order: 3, required: false, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: false,
    requireDeposit: false,
  },
};

/**
 * Production (Prodüksiyon) Hizmeti
 */
const productionService: ServiceDefinition = {
  id: 'production',
  category: 'operation',
  subCategory: 'production',
  name: 'Prodüksiyon',
  shortName: 'Prodüksiyon',
  description: 'Etkinlik prodüksiyon ve sahne yönetimi',
  icon: 'videocam',
  gradient: ['#7C3AED', '#6D28D9'],
  color: '#7C3AED',
  isActive: true,
  isVisible: true,
  sortOrder: 22,

  detailModules: [
    { moduleId: 'venue', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'team', config: { enabled: true, order: 3, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'timeline', config: { enabled: true, order: 4, required: false, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget', config: { enabled: true, order: 5, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'document', config: { enabled: true, order: 6, required: false, collapsed: true, visibility: 'all', fields: {} } },
    { moduleId: 'contact', config: { enabled: true, order: 7, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  formModules: [
    { moduleId: 'venue_form', config: { enabled: true, order: 1, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'datetime_form', config: { enabled: true, order: 2, required: true, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'equipment_form', config: { enabled: true, order: 3, required: false, collapsed: false, visibility: 'all', fields: {} } },
    { moduleId: 'budget_form', config: { enabled: true, order: 4, required: true, collapsed: false, visibility: 'all', fields: {} } },
  ],

  permissions: getDefaultPermissions(),
  settings: {
    ...getDefaultSettings(),
    allowCounterOffer: true,
    requireContract: true,
    requireDeposit: true,
    depositPercentage: 40,
  },
};

// ============================================
// EXPORT
// ============================================

/**
 * Tüm varsayılan hizmetler
 */
export const defaultServices: ServiceDefinition[] = [
  // Ana Kategoriler
  bookingService,
  technicalService,
  venueService,
  accommodationService,
  transportService,
  // Operasyon Alt Kategorileri
  securityService,
  cateringService,
  medicalService,
  mediaService,
  decorationService,
  generatorService,
  ticketingService,
  flightService,
  beverageService,
  barrierService,
  tentService,
  sanitationService,
  productionService,
];

/**
 * Ana kategori hizmetleri
 */
export const mainCategoryServices: ServiceDefinition[] = [
  bookingService,
  technicalService,
  venueService,
  accommodationService,
  transportService,
];

/**
 * Operasyon alt kategori hizmetleri
 */
export const operationSubCategoryServices: ServiceDefinition[] = [
  securityService,
  cateringService,
  medicalService,
  mediaService,
  decorationService,
  generatorService,
  ticketingService,
  flightService,
  beverageService,
  barrierService,
  tentService,
  sanitationService,
  productionService,
];
