/**
 * Merkezi Kategori Yardımcı Fonksiyonları
 *
 * Bu dosya tüm hizmet kategorileri için tutarlı etiket, ikon ve renk bilgilerini sağlar.
 * Teklif kartları, form ekranları ve diğer UI bileşenleri bu dosyayı kullanmalıdır.
 */

import { gradients } from '../theme/colors';
import type { ServiceCategory, OperationSubCategory } from '../types';

// Tüm kategoriler için yapılandırma
export interface CategoryInfo {
  id: string;
  label: string;           // Türkçe etiket
  shortLabel: string;      // Kısa etiket (badge için)
  icon: string;            // Ionicons ikon adı
  gradient: readonly [string, string, ...string[]];
  isSubCategory: boolean;  // Alt kategori mi?
  parentCategory?: string; // Eğer alt kategori ise üst kategorisi
}

// Ana Hizmet Kategorileri (6 adet)
export const mainCategories: Record<ServiceCategory, CategoryInfo> = {
  booking: {
    id: 'booking',
    label: 'Sanatçı / Booking',
    shortLabel: 'Booking',
    icon: 'musical-notes',
    gradient: gradients.booking,
    isSubCategory: false,
  },
  technical: {
    id: 'technical',
    label: 'Teknik Ekipman',
    shortLabel: 'Teknik',
    icon: 'volume-high',
    gradient: gradients.technical,
    isSubCategory: false,
  },
  venue: {
    id: 'venue',
    label: 'Mekan',
    shortLabel: 'Mekan',
    icon: 'business',
    gradient: gradients.venue,
    isSubCategory: false,
  },
  accommodation: {
    id: 'accommodation',
    label: 'Konaklama',
    shortLabel: 'Konaklama',
    icon: 'bed',
    gradient: gradients.accommodation,
    isSubCategory: false,
  },
  transport: {
    id: 'transport',
    label: 'Ulaşım',
    shortLabel: 'Ulaşım',
    icon: 'car',
    gradient: gradients.transport,
    isSubCategory: false,
  },
  operation: {
    id: 'operation',
    label: 'Operasyon',
    shortLabel: 'Operasyon',
    icon: 'construct',
    gradient: gradients.operation,
    isSubCategory: false,
  },
};

// Alt Hizmet Kategorileri (Operation altında)
export const subCategories: Record<OperationSubCategory, CategoryInfo> = {
  security: {
    id: 'security',
    label: 'Güvenlik',
    shortLabel: 'Güvenlik',
    icon: 'shield-checkmark',
    gradient: gradients.operation,
    isSubCategory: true,
    parentCategory: 'operation',
  },
  catering: {
    id: 'catering',
    label: 'Catering',
    shortLabel: 'Catering',
    icon: 'restaurant',
    gradient: gradients.operation,
    isSubCategory: true,
    parentCategory: 'operation',
  },
  flight: {
    id: 'flight',
    label: 'Uçuş',
    shortLabel: 'Uçuş',
    icon: 'airplane',
    gradient: gradients.operation,
    isSubCategory: true,
    parentCategory: 'operation',
  },
  generator: {
    id: 'generator',
    label: 'Jeneratör',
    shortLabel: 'Jeneratör',
    icon: 'flash',
    gradient: gradients.operation,
    isSubCategory: true,
    parentCategory: 'operation',
  },
  beverage: {
    id: 'beverage',
    label: 'İçecek Hizmetleri',
    shortLabel: 'İçecek',
    icon: 'cafe',
    gradient: gradients.operation,
    isSubCategory: true,
    parentCategory: 'operation',
  },
  medical: {
    id: 'medical',
    label: 'Medikal Hizmet',
    shortLabel: 'Medikal',
    icon: 'medkit',
    gradient: gradients.operation,
    isSubCategory: true,
    parentCategory: 'operation',
  },
  sanitation: {
    id: 'sanitation',
    label: 'Sanitasyon',
    shortLabel: 'Sanitasyon',
    icon: 'water',
    gradient: gradients.operation,
    isSubCategory: true,
    parentCategory: 'operation',
  },
  media: {
    id: 'media',
    label: 'Medya Hizmetleri',
    shortLabel: 'Medya',
    icon: 'camera',
    gradient: gradients.operation,
    isSubCategory: true,
    parentCategory: 'operation',
  },
  barrier: {
    id: 'barrier',
    label: 'Bariyer',
    shortLabel: 'Bariyer',
    icon: 'remove-circle',
    gradient: gradients.operation,
    isSubCategory: true,
    parentCategory: 'operation',
  },
  tent: {
    id: 'tent',
    label: 'Çadır / Tente',
    shortLabel: 'Çadır',
    icon: 'home',
    gradient: gradients.operation,
    isSubCategory: true,
    parentCategory: 'operation',
  },
  ticketing: {
    id: 'ticketing',
    label: 'Biletleme',
    shortLabel: 'Biletleme',
    icon: 'ticket',
    gradient: gradients.operation,
    isSubCategory: true,
    parentCategory: 'operation',
  },
  decoration: {
    id: 'decoration',
    label: 'Dekorasyon',
    shortLabel: 'Dekorasyon',
    icon: 'color-palette',
    gradient: gradients.operation,
    isSubCategory: true,
    parentCategory: 'operation',
  },
  production: {
    id: 'production',
    label: 'Prodüksiyon',
    shortLabel: 'Prodüksiyon',
    icon: 'film',
    gradient: gradients.operation,
    isSubCategory: true,
    parentCategory: 'operation',
  },
};

// Tüm kategorileri birleştir
export const allCategories: Record<string, CategoryInfo> = {
  ...mainCategories,
  ...subCategories,
};

/**
 * Kategori ID'sine göre kategori bilgisini döndürür
 * @param categoryId - Kategori ID'si (booking, technical, security, vb.)
 * @returns CategoryInfo veya varsayılan değer
 */
export const getCategoryInfo = (categoryId: string): CategoryInfo => {
  // Önce tüm kategorilerde ara
  if (allCategories[categoryId]) {
    return allCategories[categoryId];
  }

  // Bulunamazsa varsayılan döndür
  return {
    id: categoryId,
    label: categoryId,
    shortLabel: categoryId,
    icon: 'briefcase',
    gradient: gradients.primary,
    isSubCategory: false,
  };
};

/**
 * Kategori için Türkçe etiket döndürür
 */
export const getCategoryLabel = (categoryId: string): string => {
  return getCategoryInfo(categoryId).label;
};

/**
 * Kategori için kısa etiket döndürür (badge için)
 */
export const getCategoryShortLabel = (categoryId: string): string => {
  return getCategoryInfo(categoryId).shortLabel;
};

/**
 * Kategori için ikon adı döndürür
 */
export const getCategoryIcon = (categoryId: string): string => {
  return getCategoryInfo(categoryId).icon;
};

/**
 * Kategori için gradient döndürür
 */
export const getCategoryGradient = (categoryId: string): readonly [string, string, ...string[]] => {
  return getCategoryInfo(categoryId).gradient;
};

/**
 * Teklif kartı için kategori badge metni oluşturur
 * Eğer etkinlik başlığında sanatçı adı varsa, "Kategori - Sanatçı" formatında döndürür
 */
export const getCategoryBadgeText = (categoryId: string, eventTitle?: string): string => {
  const info = getCategoryInfo(categoryId);

  // Etkinlik başlığından sanatçı adı çıkarmayı dene
  if (eventTitle && eventTitle.includes(' - ')) {
    const parts = eventTitle.split(' - ');
    const lastPart = parts[parts.length - 1].trim();

    // Sanatçı adı gibi görünüyorsa (sayı ile başlamıyorsa)
    if (lastPart && !/^\d/.test(lastPart)) {
      return `${info.shortLabel} - ${lastPart}`;
    }
  }

  return info.shortLabel;
};

/**
 * Kategori alt kategori mi kontrol eder
 */
export const isSubCategory = (categoryId: string): boolean => {
  return getCategoryInfo(categoryId).isSubCategory;
};

/**
 * Alt kategorinin üst kategorisini döndürür
 */
export const getParentCategory = (categoryId: string): string | undefined => {
  return getCategoryInfo(categoryId).parentCategory;
};

/**
 * Ana kategorileri liste olarak döndürür
 */
export const getMainCategoriesList = (): CategoryInfo[] => {
  return Object.values(mainCategories);
};

/**
 * Alt kategorileri liste olarak döndürür
 */
export const getSubCategoriesList = (): CategoryInfo[] => {
  return Object.values(subCategories);
};

/**
 * Tüm kategorileri liste olarak döndürür
 */
export const getAllCategoriesList = (): CategoryInfo[] => {
  return Object.values(allCategories);
};
