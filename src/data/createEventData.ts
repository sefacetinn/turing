import { categoryGradients } from '../theme/colors';
import { cityDistricts, cities as allCities, getDistricts } from '../utils/cityData';

// Types
export type Step = 'type' | 'details' | 'services' | 'budget' | 'review';
export type DropdownType = 'date' | 'time' | 'city' | 'district' | 'venue' | 'newVenueCity' | 'newVenueDistrict' | null;

export interface Venue {
  id: string;
  name: string;
  capacity: string;
  address?: string;
  venueType?: string;
  features?: string[];
}

export interface EventType {
  id: string;
  name: string;
  icon: string;
  gradient: readonly [string, string];
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
  hasSubcategories?: boolean;
}

export interface OperationSubcategory {
  id: string;
  name: string;
  icon: string;
}

export interface BudgetRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export interface EventData {
  type: string;
  name: string;
  image: string | null;
  selectedDates: string[]; // Array of date strings in 'YYYY-MM-DD' format
  day: string;
  month: string;
  year: string;
  time: string;
  city: string;
  district: string;
  venue: string;
  venueCapacity: string;
  guestCount: string;
  description: string;
  services: string[];
  operationSubServices: string[];
  budget: string;
  customBudget: string;
  // New event detail fields
  ageLimit: string; // 'all_ages', '18+', '21+'
  seatingType: string; // 'standing', 'seated', 'mixed'
  indoorOutdoor: string; // 'indoor', 'outdoor', 'mixed'
}

export interface NewVenueData {
  name: string;
  city: string;
  district: string;
  address: string; // Detailed address (street, number etc.)
  capacity: string;
  venueType: 'indoor' | 'outdoor' | 'hybrid' | '';
  hasBackstage: boolean;
  hasParking: boolean;
  hasSoundSystem: boolean;
  hasStage: boolean;
  hasAirConditioning: boolean;
  hasDisabledAccess: boolean;
}

export interface StepConfig {
  key: Step;
  label: string;
  icon: string;
}

// Location Data
export const locationData: Record<string, {
  districts: string[];
  venues: Record<string, Venue[]>;
}> = {
  'İstanbul': {
    districts: ['Kadıköy', 'Beşiktaş', 'Şişli', 'Beyoğlu', 'Üsküdar', 'Bakırköy', 'Sarıyer', 'Maltepe'],
    venues: {
      'Kadıköy': [
        { id: 'v1', name: 'KüçükÇiftlik Park', capacity: '15.000' },
        { id: 'v2', name: 'Caddebostan Kültür Merkezi', capacity: '1.200' },
        { id: 'v3', name: 'Kadıköy Haldun Taner Sahnesi', capacity: '400' },
      ],
      'Beşiktaş': [
        { id: 'v4', name: 'Vodafone Park', capacity: '42.000' },
        { id: 'v5', name: 'Zorlu PSM', capacity: '2.500' },
        { id: 'v6', name: 'BJK Akatlar Kültür Merkezi', capacity: '800' },
      ],
      'Şişli': [
        { id: 'v7', name: 'Volkswagen Arena', capacity: '5.000' },
        { id: 'v8', name: 'Harbiye Açıkhava', capacity: '4.500' },
        { id: 'v9', name: 'Lütfi Kırdar Kongre Merkezi', capacity: '3.000' },
      ],
      'Beyoğlu': [
        { id: 'v10', name: 'Salon IKSV', capacity: '800' },
        { id: 'v11', name: 'Babylon Bomonti', capacity: '1.500' },
        { id: 'v12', name: 'Garajistanbul', capacity: '400' },
      ],
      'Üsküdar': [
        { id: 'v13', name: 'Bağlarbaşı Kongre Merkezi', capacity: '2.000' },
      ],
      'Bakırköy': [
        { id: 'v14', name: 'Bakırköy Belediye Nikah Salonu', capacity: '500' },
      ],
      'Sarıyer': [
        { id: 'v15', name: 'Sarıyer Açıkhava Tiyatrosu', capacity: '1.000' },
      ],
      'Maltepe': [
        { id: 'v16', name: 'Maltepe Sahil Etkinlik Alanı', capacity: '50.000' },
      ],
    },
  },
  'Ankara': {
    districts: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Etimesgut'],
    venues: {
      'Çankaya': [
        { id: 'v17', name: 'Congresium', capacity: '3.000' },
        { id: 'v18', name: 'CSO Ada Ankara', capacity: '2.000' },
        { id: 'v19', name: 'IF Performance Hall', capacity: '1.200' },
      ],
      'Keçiören': [
        { id: 'v20', name: 'Keçiören Belediyesi Etkinlik Alanı', capacity: '5.000' },
      ],
      'Yenimahalle': [
        { id: 'v21', name: 'Ankara Arena', capacity: '10.000' },
      ],
      'Etimesgut': [
        { id: 'v22', name: 'Etimesgut Belediyesi Kültür Merkezi', capacity: '800' },
      ],
    },
  },
  'İzmir': {
    districts: ['Konak', 'Karşıyaka', 'Bornova', 'Alsancak'],
    venues: {
      'Konak': [
        { id: 'v23', name: 'İzmir Fuar Alanı', capacity: '20.000' },
        { id: 'v24', name: 'Ahmed Adnan Saygun Sanat Merkezi', capacity: '1.500' },
      ],
      'Karşıyaka': [
        { id: 'v25', name: 'Karşıyaka Arena', capacity: '8.000' },
      ],
      'Bornova': [
        { id: 'v26', name: 'Bornova Açıkhava Tiyatrosu', capacity: '2.500' },
      ],
      'Alsancak': [
        { id: 'v27', name: 'Alsancak Stadyumu', capacity: '15.000' },
      ],
    },
  },
  'Antalya': {
    districts: ['Muratpaşa', 'Konyaaltı', 'Lara', 'Belek'],
    venues: {
      'Muratpaşa': [
        { id: 'v28', name: 'Antalya Expo Center', capacity: '10.000' },
      ],
      'Konyaaltı': [
        { id: 'v29', name: 'Konyaaltı Açıkhava', capacity: '5.000' },
      ],
      'Lara': [
        { id: 'v30', name: 'Titanic Convention Center', capacity: '3.000' },
      ],
      'Belek': [
        { id: 'v31', name: 'Regnum Carya Convention Center', capacity: '4.000' },
        { id: 'v32', name: 'Calista Luxury Resort Event Hall', capacity: '2.000' },
      ],
    },
  },
};

// Use all 81 Turkish cities from cityData
export const cities = allCities;

// Date options
export const months = [
  { value: '01', label: 'Ocak' },
  { value: '02', label: 'Şubat' },
  { value: '03', label: 'Mart' },
  { value: '04', label: 'Nisan' },
  { value: '05', label: 'Mayıs' },
  { value: '06', label: 'Haziran' },
  { value: '07', label: 'Temmuz' },
  { value: '08', label: 'Ağustos' },
  { value: '09', label: 'Eylül' },
  { value: '10', label: 'Ekim' },
  { value: '11', label: 'Kasım' },
  { value: '12', label: 'Aralık' },
];

export const generateDays = () => {
  return Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1),
  }));
};

export const generateYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 3 }, (_, i) => ({
    value: String(currentYear + i),
    label: String(currentYear + i),
  }));
};

export const timeOptions = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

export const eventTypes: EventType[] = [
  { id: 'concert', name: 'Konser', icon: 'musical-notes', gradient: categoryGradients.concert },
  { id: 'festival', name: 'Festival', icon: 'people', gradient: categoryGradients.festival },
  { id: 'corporate', name: 'Kurumsal', icon: 'business', gradient: categoryGradients.corporate },
  { id: 'municipality', name: 'Belediye', icon: 'flag', gradient: ['#0891b2', '#06b6d4'] as const },
  { id: 'private', name: 'Private', icon: 'wine', gradient: categoryGradients.party },
  { id: 'other', name: 'Diğer', icon: 'ellipsis-horizontal', gradient: ['#6b7280', '#4b5563'] as const },
];

export const serviceCategories: ServiceCategory[] = [
  { id: 'artist', name: 'Sanatçı', icon: 'person', selected: false },
  { id: 'sound-light', name: 'Ses-Işık', icon: 'volume-high', selected: false },
  { id: 'transport', name: 'Ulaşım', icon: 'car', selected: false },
  { id: 'accommodation', name: 'Konaklama', icon: 'bed', selected: false },
  { id: 'venue', name: 'Mekan', icon: 'location', selected: false },
  { id: 'operation', name: 'Operasyon', icon: 'settings', selected: false, hasSubcategories: true },
];

export const operationSubcategories: OperationSubcategory[] = [
  { id: 'security', name: 'Güvenlik', icon: 'shield-checkmark' },
  { id: 'catering', name: 'Catering', icon: 'restaurant' },
  { id: 'generator', name: 'Jeneratör', icon: 'flash' },
  { id: 'beverage', name: 'İçecek Hizmetleri', icon: 'cafe' },
  { id: 'medical', name: 'Medikal', icon: 'medkit' },
  { id: 'sanitation', name: 'Sanitasyon', icon: 'trash' },
  { id: 'media', name: 'Medya', icon: 'camera' },
  { id: 'barrier', name: 'Bariyer', icon: 'remove-circle' },
  { id: 'tent', name: 'Çadır', icon: 'home' },
  { id: 'ticketing', name: 'Ticketing', icon: 'ticket' },
  { id: 'decoration', name: 'Dekorasyon', icon: 'color-palette' },
  { id: 'production', name: 'Prodüksiyon', icon: 'film' },
  { id: 'flight', name: 'Uçak Hizmetleri', icon: 'airplane' },
];

export const budgetRanges: BudgetRange[] = [
  { id: 'b1', label: '₺10.000 - ₺25.000', min: 10000, max: 25000 },
  { id: 'b2', label: '₺25.000 - ₺50.000', min: 25000, max: 50000 },
  { id: 'b3', label: '₺50.000 - ₺100.000', min: 50000, max: 100000 },
  { id: 'b4', label: '₺100.000 - ₺250.000', min: 100000, max: 250000 },
  { id: 'b5', label: '₺250.000+', min: 250000, max: 1000000 },
];

export const steps: StepConfig[] = [
  { key: 'type', label: 'Tür', icon: 'layers' },
  { key: 'details', label: 'Detaylar', icon: 'document-text' },
  { key: 'services', label: 'Hizmetler', icon: 'briefcase' },
  { key: 'budget', label: 'Bütçe', icon: 'wallet' },
  { key: 'review', label: 'Özet', icon: 'checkmark-circle' },
];

// Helper functions
export const getFormattedDate = (day: string, month: string, year: string): string => {
  if (day && month && year) {
    const monthLabel = months.find(m => m.value === month)?.label;
    return `${day} ${monthLabel} ${year}`;
  }
  return '';
};

export const getFormattedLocation = (city: string, district: string, venue: string): string => {
  const parts = [venue, district, city].filter(Boolean);
  return parts.join(', ');
};

export const getAvailableDistricts = (city: string): string[] => {
  if (!city) return [];
  // First check if we have predefined districts with venues
  if (locationData[city]?.districts) {
    return locationData[city].districts;
  }
  // Otherwise use all districts from cityData
  return getDistricts(city);
};

export const getAvailableVenues = (city: string, district: string, customVenues: Venue[]): Venue[] => {
  if (!city || !district) return [];
  const predefinedVenues = locationData[city]?.venues?.[district] || [];
  const districtCustomVenues = customVenues.filter(v => v.id.startsWith(`${city}-${district}`));
  return [...predefinedVenues, ...districtCustomVenues];
};

export const initialEventData: EventData = {
  type: '',
  name: '',
  image: null,
  selectedDates: [],
  day: '',
  month: '',
  year: '',
  time: '',
  city: '',
  district: '',
  venue: '',
  venueCapacity: '',
  guestCount: '',
  description: '',
  services: [],
  operationSubServices: [],
  budget: '',
  customBudget: '',
  // New event detail fields
  ageLimit: '',
  seatingType: '',
  indoorOutdoor: '',
};

// Age limit options
export const ageLimitOptions = [
  { id: 'all_ages', label: 'Tum Yaslar', icon: 'people-outline' },
  { id: '18+', label: '18+', icon: 'shield-outline' },
  { id: '21+', label: '21+', icon: 'shield-checkmark-outline' },
];

// Seating type options
export const seatingTypeOptions = [
  { id: 'standing', label: 'Ayakta', icon: 'walk-outline' },
  { id: 'seated', label: 'Oturmali', icon: 'accessibility-outline' },
  { id: 'mixed', label: 'Karma', icon: 'apps-outline' },
];

// Indoor/outdoor options
export const indoorOutdoorOptions = [
  { id: 'indoor', label: 'Kapali Alan', icon: 'business-outline' },
  { id: 'outdoor', label: 'Acik Alan', icon: 'sunny-outline' },
  { id: 'mixed', label: 'Hibrit', icon: 'partly-sunny-outline' },
];

export const initialNewVenueData: NewVenueData = {
  name: '',
  city: '',
  district: '',
  address: '',
  capacity: '',
  venueType: '',
  hasBackstage: false,
  hasParking: false,
  hasSoundSystem: false,
  hasStage: false,
  hasAirConditioning: false,
  hasDisabledAccess: false,
};
