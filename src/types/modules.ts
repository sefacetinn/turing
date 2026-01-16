/**
 * Modüler Hizmet Mimarisi - Modül Tip Tanımları
 *
 * Bu dosya, modüler sistemin temel tip tanımlarını içerir.
 * Her modül, hizmet detay ekranlarında veya teklif formlarında
 * kullanılabilecek bağımsız bir UI bileşenidir.
 */

// ============================================
// MODÜL TİPLERİ
// ============================================

/**
 * Görüntüleme modül tipleri
 * Detay ekranlarında kullanılan modüller
 */
export type DisplayModuleType =
  | 'venue'        // Mekan bilgileri, salon, sahne ölçüleri, kulis
  | 'datetime'     // Etkinlik tarihi, saati, süresi
  | 'budget'       // Organizatör bütçesi, teklif tutarı
  | 'participant'  // Kapasite, yaş sınırı, katılımcı türü
  | 'media'        // Etkinlik görselleri, videolar
  | 'document'     // Sözleşme, rider, teknik spec
  | 'team'         // Personel listesi, roller
  | 'equipment'    // Ekipman listesi, teknik gereksinimler
  | 'logistics'    // Ulaşım, konaklama, transfer
  | 'contact'      // İletişim kişisi, telefon, sosyal medya
  | 'timeline'     // Program, aşamalar
  | 'checklist'    // Hazırlık adımları
  | 'rating'       // Puanlama, yorumlar
  | 'menu'         // Yemek seçenekleri, diyet
  | 'vehicle'      // Araç bilgileri, kapasite
  | 'medical'      // Tıbbi hizmetler, ambulans
  | 'ticketing';   // Bilet satış, kapasite

/**
 * Form modül tipleri
 * Teklif oluşturma formlarında kullanılan modüller
 */
export type FormModuleType =
  | 'venue_form'         // Mekan türü, kapasite, açık/kapalı, oturma düzeni
  | 'datetime_form'      // Tarih seçici, saat, süre
  | 'budget_form'        // Bütçe aralığı, para birimi
  | 'participant_form'   // Kişi sayısı, yaş sınırı, VIP alanı
  | 'equipment_form'     // Ekipman listesi (çoklu seçim), güç ihtiyacı
  | 'catering_form'      // Öğün türü, diyet, servis stili
  | 'security_form'      // Güvenlik sayısı, vardiya, silahlı
  | 'transport_form'     // Araç türü, kalkış/varış, bagaj
  | 'accommodation_form' // Oda türü, yıldız, kahvaltı
  | 'media_form';        // Hizmet türü (foto/video), süre, teslimat

/**
 * Tüm modül tipleri
 */
export type ModuleType = DisplayModuleType | FormModuleType;

/**
 * Modül kategorisi
 */
export type ModuleCategory = 'display' | 'form';

// ============================================
// ALAN KONFİGÜRASYONU
// ============================================

/**
 * Doğrulama kuralı tipleri
 */
export type ValidationType = 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'phone' | 'custom';

/**
 * Doğrulama kuralı
 */
export interface ValidationRule {
  type: ValidationType;
  value?: string | number | RegExp;
  message: string;
  customValidator?: (value: any) => boolean;
}

/**
 * Alan tipi
 */
export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'chips'        // Çoklu seçim chip'leri
  | 'switch'       // Toggle switch
  | 'date'
  | 'time'
  | 'datetime'
  | 'daterange'
  | 'slider'
  | 'currency'
  | 'file'
  | 'image'
  | 'rating'
  | 'location'
  | 'custom';

/**
 * Seçenek
 */
export interface FieldOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  description?: string;
}

/**
 * Alan konfigürasyonu
 */
export interface FieldConfig {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  enabled: boolean;
  required: boolean;
  order: number;
  validation?: ValidationRule[];
  options?: FieldOption[];      // select, multiselect, chips için
  min?: number;                 // number, slider için
  max?: number;                 // number, slider için
  step?: number;                // number, slider için
  prefix?: string;              // currency için (₺, $, vb.)
  suffix?: string;
  rows?: number;                // textarea için
  accept?: string[];            // file, image için (mime types)
  maxSize?: number;             // file, image için (bytes)
  dependsOn?: FieldDependency;  // Koşullu görünürlük
}

/**
 * Alan bağımlılığı (koşullu görünürlük)
 */
export interface FieldDependency {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  value?: any;
}

// ============================================
// MODÜL KONFİGÜRASYONU
// ============================================

/**
 * Görünürlük türleri
 */
export type ModuleVisibility = 'all' | 'provider' | 'organizer' | 'admin';

/**
 * Modül konfigürasyonu
 */
export interface ModuleConfig {
  enabled: boolean;
  order: number;
  required: boolean;
  collapsed: boolean;            // Varsayılan olarak kapalı mı?
  customLabel?: string;          // Özel başlık
  customIcon?: string;           // Özel ikon
  visibility: ModuleVisibility;
  fields: Record<string, Partial<FieldConfig>>;  // Alan özelleştirmeleri
  styles?: ModuleStyles;         // Stil özelleştirmeleri
}

/**
 * Modül stilleri
 */
export interface ModuleStyles {
  backgroundColor?: string;
  borderColor?: string;
  headerColor?: string;
  compact?: boolean;
  noBorder?: boolean;
  noPadding?: boolean;
}

// ============================================
// MODÜL TANIMI
// ============================================

/**
 * Modül tanımı
 * Her modülün temel özellikleri ve varsayılan konfigürasyonu
 */
export interface ModuleDefinition {
  id: ModuleType;
  name: string;                    // Türkçe ad
  description: string;             // Açıklama
  icon: string;                    // Ionicons icon name
  category: ModuleCategory;
  component: string;               // Component adı (dinamik import için)
  defaultConfig: ModuleConfig;
  fields: FieldConfig[];           // Modüldeki alanlar
  requiredFields: string[];        // Zorunlu alan ID'leri
  optionalFields: string[];        // Opsiyonel alan ID'leri
}

/**
 * Modül instance'ı
 * Bir hizmette kullanılan modül ve konfigürasyonu
 */
export interface ModuleInstance {
  moduleId: ModuleType;
  config: Partial<ModuleConfig>;
}

// ============================================
// MODÜL VERİLERİ
// ============================================

/**
 * Mekan modülü verileri
 */
export interface VenueModuleData {
  id?: string;
  name: string;
  address: string;
  city: string;
  district?: string;
  capacity: number;
  indoorOutdoor: 'indoor' | 'outdoor' | 'mixed';
  venueType: 'concert_hall' | 'arena' | 'stadium' | 'hotel_ballroom' | 'open_air' | 'club' | 'theater' | 'other';
  seatingType?: 'standing' | 'seated' | 'mixed';
  halls?: VenueHallData[];
  selectedHallId?: string;
  stageWidth?: number;
  stageDepth?: number;
  stageHeight?: number;
  backstage?: VenueBackstageData;
  hasSoundSystem?: boolean;
  hasLightingSystem?: boolean;
  hasParkingArea?: boolean;
  parkingCapacity?: number;
  images?: string[];
  contactName?: string;
  contactPhone?: string;
  rating?: number;
  reviewCount?: number;
}

export interface VenueHallData {
  id: string;
  name: string;
  capacity: number;
  seatingType: 'standing' | 'seated' | 'mixed';
  stageWidth?: number;
  stageDepth?: number;
  stageHeight?: number;
  isMainHall?: boolean;
}

export interface VenueBackstageData {
  hasBackstage: boolean;
  roomCount?: number;
  hasMirror?: boolean;
  hasShower?: boolean;
  hasPrivateToilet?: boolean;
  cateringAvailable?: boolean;
  notes?: string;
}

/**
 * Tarih/Saat modülü verileri
 */
export interface DateTimeModuleData {
  eventDate: string;           // ISO date string
  eventTime?: string;          // HH:mm
  endTime?: string;
  duration?: string;           // "2 saat", "90 dakika" vb.
  soundcheckTime?: string;
  loadInTime?: string;
  doorsOpenTime?: string;
}

/**
 * Bütçe modülü verileri
 */
export interface BudgetModuleData {
  organizerBudget?: number;
  budgetMin?: number;
  budgetMax?: number;
  currency: string;            // "TRY", "USD", "EUR"
  isNegotiable?: boolean;
  paymentTerms?: string;
  depositRequired?: boolean;
  depositPercentage?: number;
}

/**
 * Katılımcı modülü verileri
 */
export interface ParticipantModuleData {
  expectedCount?: number;
  minCount?: number;
  maxCount?: number;
  ageLimit?: string;           // "+18", "Tüm yaşlar", vb.
  participantType?: string;    // "Genel", "VIP", "Davetli"
  hasVipArea?: boolean;
  vipCapacity?: number;
}

/**
 * Medya modülü verileri
 */
export interface MediaModuleData {
  images?: string[];
  videos?: string[];
  posterImage?: string;
  thumbnailImage?: string;
}

/**
 * Döküman modülü verileri
 */
export interface DocumentModuleData {
  documents: DocumentItem[];
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'contract' | 'rider' | 'stage_plan' | 'contact_list' | 'equipment_list' | 'invoice' | 'other';
  fileType: 'pdf' | 'image' | 'excel' | 'word' | 'other';
  uri: string;
  size?: number;
  uploadedBy?: string;
  uploadedAt?: string;
}

/**
 * Ekip modülü verileri
 */
export interface TeamModuleData {
  members: TeamMemberData[];
  totalCount?: number;
}

export interface TeamMemberData {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  image?: string;
  isLead?: boolean;
}

/**
 * Ekipman modülü verileri
 */
export interface EquipmentModuleData {
  items: EquipmentItemData[];
  powerRequirement?: string;   // "32A", "63A", "125A"
  setupTime?: string;
  teardownTime?: string;
}

export interface EquipmentItemData {
  id: string;
  name: string;
  category: 'sound' | 'lighting' | 'video' | 'stage' | 'power' | 'other';
  quantity: number;
  brand?: string;
  model?: string;
  notes?: string;
}

/**
 * Lojistik modülü verileri
 */
export interface LogisticsModuleData {
  departureCity?: string;
  departureAddress?: string;
  arrivalCity?: string;
  arrivalAddress?: string;
  departureTime?: string;
  arrivalTime?: string;
  returnTrip?: boolean;
  returnTime?: string;
  passengerCount?: number;
  luggageCount?: number;
  specialRequests?: string;
}

/**
 * İletişim modülü verileri
 */
export interface ContactModuleData {
  primaryContact: {
    name: string;
    role?: string;
    phone: string;
    email?: string;
  };
  secondaryContact?: {
    name: string;
    role?: string;
    phone: string;
    email?: string;
  };
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  };
}

/**
 * Zaman çizelgesi modülü verileri
 */
export interface TimelineModuleData {
  items: TimelineItemData[];
}

export interface TimelineItemData {
  id: string;
  time: string;
  title: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  assignee?: string;
}

/**
 * Kontrol listesi modülü verileri
 */
export interface ChecklistModuleData {
  items: ChecklistItemData[];
  progress?: number;           // 0-100
}

export interface ChecklistItemData {
  id: string;
  title: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  category?: string;
}

/**
 * Değerlendirme modülü verileri
 */
export interface RatingModuleData {
  overallRating?: number;
  reviewCount?: number;
  reviews?: ReviewData[];
}

export interface ReviewData {
  id: string;
  rating: number;
  comment?: string;
  reviewerName: string;
  reviewerImage?: string;
  createdAt: string;
}

/**
 * Menü modülü verileri
 */
export interface MenuModuleData {
  mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack' | 'cocktail')[];
  serviceStyle?: 'fine_dining' | 'buffet' | 'casual' | 'food_truck' | 'cocktail';
  guestCount?: number;
  dietaryRestrictions?: string[];
  menuItems?: MenuItemData[];
}

export interface MenuItemData {
  id: string;
  name: string;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage' | 'other';
  description?: string;
  dietaryTags?: string[];
}

/**
 * Araç modülü verileri
 */
export interface VehicleModuleData {
  vehicleType: 'sedan' | 'suv' | 'van' | 'minibus' | 'bus' | 'limousine' | 'other';
  vehicleCount: number;
  passengerCapacity: number;
  brand?: string;
  model?: string;
  licensePlate?: string;
  driverInfo?: {
    name: string;
    phone: string;
  };
  amenities?: string[];       // "WiFi", "Klima", "Su", vb.
}

/**
 * Medikal modülü verileri
 */
export interface MedicalModuleData {
  serviceTypes: ('first_aid' | 'ambulance' | 'doctor' | 'nurse' | 'paramedic')[];
  personnelCount?: number;
  ambulanceCount?: number;
  equipmentList?: string[];
  stationLocations?: string[];
}

/**
 * Biletleme modülü verileri
 */
export interface TicketingModuleData {
  totalCapacity: number;
  ticketTypes: TicketTypeData[];
  soldCount?: number;
  availableCount?: number;
  salesStartDate?: string;
  salesEndDate?: string;
}

export interface TicketTypeData {
  id: string;
  name: string;
  price: number;
  quantity: number;
  soldCount?: number;
  description?: string;
}

/**
 * Tüm modül verileri union tipi
 */
export type ModuleData =
  | VenueModuleData
  | DateTimeModuleData
  | BudgetModuleData
  | ParticipantModuleData
  | MediaModuleData
  | DocumentModuleData
  | TeamModuleData
  | EquipmentModuleData
  | LogisticsModuleData
  | ContactModuleData
  | TimelineModuleData
  | ChecklistModuleData
  | RatingModuleData
  | MenuModuleData
  | VehicleModuleData
  | MedicalModuleData
  | TicketingModuleData;

/**
 * Modül verilerinin haritası
 */
export type ModuleDataMap = {
  venue: VenueModuleData;
  datetime: DateTimeModuleData;
  budget: BudgetModuleData;
  participant: ParticipantModuleData;
  media: MediaModuleData;
  document: DocumentModuleData;
  team: TeamModuleData;
  equipment: EquipmentModuleData;
  logistics: LogisticsModuleData;
  contact: ContactModuleData;
  timeline: TimelineModuleData;
  checklist: ChecklistModuleData;
  rating: RatingModuleData;
  menu: MenuModuleData;
  vehicle: VehicleModuleData;
  medical: MedicalModuleData;
  ticketing: TicketingModuleData;
};
