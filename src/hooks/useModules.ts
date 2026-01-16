/**
 * Modül Hook'ları
 *
 * Modüler sistem için kolay erişim hook'ları.
 */

import { useMemo, useCallback } from 'react';
import { ServiceCategory, OperationSubCategory } from '../types';
import { ModuleType, ModuleDefinition, ModuleConfig, ModuleDataMap } from '../types/modules';
import { ServiceDefinition, SystemRole } from '../types/serviceDefinition';
import { useModuleContext } from '../context/ModuleContext';

// ============================================
// useModules - Ana Hook
// ============================================

/**
 * Modül sistemine erişim için ana hook
 */
export const useModules = () => {
  const context = useModuleContext();
  return context;
};

// ============================================
// useServiceConfig - Hizmet Konfigürasyonu
// ============================================

interface UseServiceConfigOptions {
  role?: SystemRole;
}

interface UseServiceConfigReturn {
  service: ServiceDefinition | undefined;
  detailModules: Array<{ definition: ModuleDefinition; config: ModuleConfig }>;
  formModules: Array<{ definition: ModuleDefinition; config: ModuleConfig }>;
  isLoading: boolean;
}

/**
 * Belirli bir hizmetin konfigürasyonunu getir
 */
export const useServiceConfig = (
  serviceId: string,
  options: UseServiceConfigOptions = {}
): UseServiceConfigReturn => {
  const { role = 'organizer' } = options;
  const { getService, getServiceDetailModules, getServiceFormModules, isLoading } = useModuleContext();

  const service = useMemo(() => getService(serviceId), [getService, serviceId]);

  const detailModules = useMemo(
    () => getServiceDetailModules(serviceId, role),
    [getServiceDetailModules, serviceId, role]
  );

  const formModules = useMemo(
    () => getServiceFormModules(serviceId, role),
    [getServiceFormModules, serviceId, role]
  );

  return {
    service,
    detailModules,
    formModules,
    isLoading,
  };
};

// ============================================
// useServiceByCategory - Kategoriye Göre Hizmet
// ============================================

/**
 * Kategoriye göre hizmet konfigürasyonu getir
 */
export const useServiceByCategory = (
  category: ServiceCategory,
  subCategory?: OperationSubCategory,
  options: UseServiceConfigOptions = {}
): UseServiceConfigReturn => {
  const { role = 'organizer' } = options;
  const { getServiceByCategory, getServiceDetailModules, getServiceFormModules, isLoading } = useModuleContext();

  const service = useMemo(
    () => getServiceByCategory(category, subCategory),
    [getServiceByCategory, category, subCategory]
  );

  const detailModules = useMemo(
    () => service ? getServiceDetailModules(service.id, role) : [],
    [getServiceDetailModules, service, role]
  );

  const formModules = useMemo(
    () => service ? getServiceFormModules(service.id, role) : [],
    [getServiceFormModules, service, role]
  );

  return {
    service,
    detailModules,
    formModules,
    isLoading,
  };
};

// ============================================
// useModuleData - Modül Verisi Yönetimi
// ============================================

interface UseModuleDataReturn<T> {
  data: T | undefined;
  setData: (data: T) => void;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  reset: () => void;
}

/**
 * Modül verisi yönetimi için hook
 * @param moduleId - Modül ID
 * @param initialData - Başlangıç verisi
 */
export const useModuleData = <K extends keyof ModuleDataMap>(
  moduleId: K,
  initialData?: Partial<ModuleDataMap[K]>
): UseModuleDataReturn<ModuleDataMap[K]> => {
  const [data, setDataState] = useState<ModuleDataMap[K] | undefined>(
    initialData as ModuleDataMap[K] | undefined
  );

  const setData = useCallback((newData: ModuleDataMap[K]) => {
    setDataState(newData);
  }, []);

  const updateField = useCallback(<F extends keyof ModuleDataMap[K]>(
    field: F,
    value: ModuleDataMap[K][F]
  ) => {
    setDataState(prev => prev ? { ...prev, [field]: value } : undefined);
  }, []);

  const reset = useCallback(() => {
    setDataState(initialData as ModuleDataMap[K] | undefined);
  }, [initialData]);

  return {
    data,
    setData,
    updateField,
    reset,
  };
};

// Import useState for useModuleData
import { useState } from 'react';

// ============================================
// useModuleVisibility - Modül Görünürlüğü
// ============================================

interface UseModuleVisibilityReturn {
  isVisible: (moduleId: ModuleType, config: ModuleConfig) => boolean;
  canEdit: (moduleId: ModuleType, config: ModuleConfig) => boolean;
}

/**
 * Modül görünürlük kontrolü için hook
 */
export const useModuleVisibility = (role: SystemRole): UseModuleVisibilityReturn => {
  const isVisible = useCallback((moduleId: ModuleType, config: ModuleConfig): boolean => {
    if (!config.enabled) return false;

    switch (config.visibility) {
      case 'all':
        return true;
      case 'admin':
        return role === 'super_admin' || role === 'admin';
      case 'provider':
        return role === 'provider' || role === 'super_admin' || role === 'admin';
      case 'organizer':
        return role === 'organizer' || role === 'super_admin' || role === 'admin';
      default:
        return true;
    }
  }, [role]);

  const canEdit = useCallback((moduleId: ModuleType, config: ModuleConfig): boolean => {
    if (!isVisible(moduleId, config)) return false;

    // Only admins and owners can edit
    return role === 'super_admin' || role === 'admin' || role === 'provider' || role === 'organizer';
  }, [isVisible, role]);

  return {
    isVisible,
    canEdit,
  };
};

// ============================================
// useActiveServices - Aktif Hizmetler
// ============================================

interface UseActiveServicesReturn {
  services: ServiceDefinition[];
  mainCategories: ServiceDefinition[];
  operationSubCategories: ServiceDefinition[];
  getByCategory: (category: ServiceCategory) => ServiceDefinition[];
  isLoading: boolean;
}

/**
 * Aktif hizmetleri getir
 */
export const useActiveServices = (): UseActiveServicesReturn => {
  const { getActiveServices, getServicesByCategory, isLoading } = useModuleContext();

  const services = useMemo(() => getActiveServices(), [getActiveServices]);

  const mainCategories = useMemo(
    () => services.filter(s => !s.subCategory),
    [services]
  );

  const operationSubCategories = useMemo(
    () => services.filter(s => s.category === 'operation' && s.subCategory),
    [services]
  );

  const getByCategory = useCallback(
    (category: ServiceCategory) => getServicesByCategory(category),
    [getServicesByCategory]
  );

  return {
    services,
    mainCategories,
    operationSubCategories,
    getByCategory,
    isLoading,
  };
};

// ============================================
// useModuleDefinition - Modül Tanımı
// ============================================

/**
 * Modül tanımını getir
 */
export const useModuleDefinition = (moduleId: ModuleType): ModuleDefinition | undefined => {
  const { getModule } = useModuleContext();
  return useMemo(() => getModule(moduleId), [getModule, moduleId]);
};

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

/**
 * Modül verisini formatla
 */
export const formatModuleData = <K extends keyof ModuleDataMap>(
  moduleId: K,
  data: Partial<ModuleDataMap[K]>
): ModuleDataMap[K] => {
  // Default values based on module type
  const defaults: Partial<Record<keyof ModuleDataMap, any>> = {
    venue: { name: '', address: '', city: '', capacity: 0, indoorOutdoor: 'indoor' },
    datetime: { eventDate: new Date().toISOString() },
    budget: { currency: 'TRY' },
    participant: {},
    media: { images: [], videos: [] },
    document: { documents: [] },
    team: { members: [] },
    equipment: { items: [] },
    logistics: {},
    contact: { primaryContact: { name: '', phone: '' } },
    timeline: { items: [] },
    checklist: { items: [], progress: 0 },
    rating: {},
    menu: { mealTypes: [] },
    vehicle: { vehicleType: 'sedan', vehicleCount: 1, passengerCapacity: 4 },
    medical: { serviceTypes: [] },
    ticketing: { totalCapacity: 0, ticketTypes: [] },
  };

  return { ...defaults[moduleId], ...data } as ModuleDataMap[K];
};

/**
 * Modül verisi doğrulama
 */
export const validateModuleData = <K extends keyof ModuleDataMap>(
  moduleId: K,
  data: ModuleDataMap[K],
  requiredFields: string[]
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  requiredFields.forEach(field => {
    const value = (data as any)[field];
    if (value === undefined || value === null || value === '') {
      errors[field] = 'Bu alan zorunludur';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default useModules;
