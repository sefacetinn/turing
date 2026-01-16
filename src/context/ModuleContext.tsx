/**
 * Modül Context
 *
 * Modüler sistemin global state yönetimi.
 * Tüm modül ve hizmet konfigürasyonlarına erişim sağlar.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ServiceCategory, OperationSubCategory } from '../types';
import { ModuleType, ModuleDefinition, ModuleConfig, ModuleInstance } from '../types/modules';
import { ServiceDefinition, SystemRole } from '../types/serviceDefinition';
import { ModuleRegistry } from '../config/moduleRegistry';

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  CUSTOM_SERVICES: '@module_custom_services',
  SERVICE_OVERRIDES: '@module_service_overrides',
  MODULE_OVERRIDES: '@module_module_overrides',
};

// ============================================
// CONTEXT TİPLERİ
// ============================================

interface ModuleContextValue {
  // State
  isInitialized: boolean;
  isLoading: boolean;

  // Modül İşlemleri
  getModule: (id: ModuleType) => ModuleDefinition | undefined;
  getAllModules: () => ModuleDefinition[];
  getDisplayModules: () => ModuleDefinition[];
  getFormModules: () => ModuleDefinition[];

  // Hizmet İşlemleri
  getService: (id: string) => ServiceDefinition | undefined;
  getServiceByCategory: (category: ServiceCategory, subCategory?: OperationSubCategory) => ServiceDefinition | undefined;
  getAllServices: () => ServiceDefinition[];
  getActiveServices: () => ServiceDefinition[];
  getServicesByCategory: (category: ServiceCategory) => ServiceDefinition[];

  // Hizmet Modülleri
  getServiceDetailModules: (serviceId: string, role?: SystemRole) => Array<{ definition: ModuleDefinition; config: ModuleConfig }>;
  getServiceFormModules: (serviceId: string, role?: SystemRole) => Array<{ definition: ModuleDefinition; config: ModuleConfig }>;

  // Admin İşlemleri
  updateServiceModules: (serviceId: string, moduleType: 'detail' | 'form', modules: ModuleInstance[]) => Promise<void>;
  toggleServiceStatus: (serviceId: string, isActive: boolean) => Promise<void>;
  createCustomService: (service: ServiceDefinition) => Promise<void>;
  deleteCustomService: (serviceId: string) => Promise<void>;

  // Yenileme
  refresh: () => Promise<void>;
}

// ============================================
// DEFAULT VALUES
// ============================================

const defaultContextValue: ModuleContextValue = {
  isInitialized: false,
  isLoading: true,

  getModule: () => undefined,
  getAllModules: () => [],
  getDisplayModules: () => [],
  getFormModules: () => [],

  getService: () => undefined,
  getServiceByCategory: () => undefined,
  getAllServices: () => [],
  getActiveServices: () => [],
  getServicesByCategory: () => [],

  getServiceDetailModules: () => [],
  getServiceFormModules: () => [],

  updateServiceModules: async () => {},
  toggleServiceStatus: async () => {},
  createCustomService: async () => {},
  deleteCustomService: async () => {},

  refresh: async () => {},
};

// ============================================
// CONTEXT
// ============================================

const ModuleContext = createContext<ModuleContextValue>(defaultContextValue);

// ============================================
// PROVIDER
// ============================================

interface ModuleProviderProps {
  children: ReactNode;
}

export const ModuleProvider: React.FC<ModuleProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customServices, setCustomServices] = useState<ServiceDefinition[]>([]);
  const [serviceOverrides, setServiceOverrides] = useState<Record<string, Partial<ServiceDefinition>>>({});

  // ============================================
  // INITIALIZATION
  // ============================================

  const loadStoredData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load custom services
      const storedCustomServices = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_SERVICES);
      if (storedCustomServices) {
        setCustomServices(JSON.parse(storedCustomServices));
      }

      // Load service overrides
      const storedOverrides = await AsyncStorage.getItem(STORAGE_KEYS.SERVICE_OVERRIDES);
      if (storedOverrides) {
        setServiceOverrides(JSON.parse(storedOverrides));
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading module data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredData();
  }, [loadStoredData]);

  // ============================================
  // MODÜL İŞLEMLERİ
  // ============================================

  const getModule = useCallback((id: ModuleType): ModuleDefinition | undefined => {
    return ModuleRegistry.getModule(id);
  }, []);

  const getAllModules = useCallback((): ModuleDefinition[] => {
    return ModuleRegistry.getAllModules();
  }, []);

  const getDisplayModules = useCallback((): ModuleDefinition[] => {
    return ModuleRegistry.getModulesByCategory('display');
  }, []);

  const getFormModules = useCallback((): ModuleDefinition[] => {
    return ModuleRegistry.getModulesByCategory('form');
  }, []);

  // ============================================
  // HİZMET İŞLEMLERİ
  // ============================================

  const getService = useCallback((id: string): ServiceDefinition | undefined => {
    // Check custom services first
    const customService = customServices.find(s => s.id === id);
    if (customService) {
      const override = serviceOverrides[id];
      return override ? { ...customService, ...override } : customService;
    }

    // Then check registry
    const registryService = ModuleRegistry.getService(id);
    if (registryService) {
      const override = serviceOverrides[id];
      return override ? { ...registryService, ...override } : registryService;
    }

    return undefined;
  }, [customServices, serviceOverrides]);

  const getServiceByCategory = useCallback((
    category: ServiceCategory,
    subCategory?: OperationSubCategory
  ): ServiceDefinition | undefined => {
    const allServices = [...ModuleRegistry.getAllServices(), ...customServices];

    if (subCategory) {
      return allServices.find(s => s.category === category && s.subCategory === subCategory);
    }

    return allServices.find(s => s.category === category && !s.subCategory);
  }, [customServices]);

  const getAllServices = useCallback((): ServiceDefinition[] => {
    const registryServices = ModuleRegistry.getAllServices();
    const allServices = [...registryServices, ...customServices];

    // Apply overrides
    return allServices.map(service => {
      const override = serviceOverrides[service.id];
      return override ? { ...service, ...override } : service;
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [customServices, serviceOverrides]);

  const getActiveServices = useCallback((): ServiceDefinition[] => {
    return getAllServices().filter(s => s.isActive && s.isVisible);
  }, [getAllServices]);

  const getServicesByCategory = useCallback((category: ServiceCategory): ServiceDefinition[] => {
    return getAllServices().filter(s => s.category === category);
  }, [getAllServices]);

  // ============================================
  // HİZMET MODÜL İŞLEMLERİ
  // ============================================

  const getServiceDetailModules = useCallback((
    serviceId: string,
    role: SystemRole = 'organizer'
  ): Array<{ definition: ModuleDefinition; config: ModuleConfig }> => {
    const modules = ModuleRegistry.getServiceModuleConfigs(serviceId, 'detail');
    return ModuleRegistry.filterVisibleModules(modules, role);
  }, []);

  const getServiceFormModules = useCallback((
    serviceId: string,
    role: SystemRole = 'organizer'
  ): Array<{ definition: ModuleDefinition; config: ModuleConfig }> => {
    const modules = ModuleRegistry.getServiceModuleConfigs(serviceId, 'form');
    return ModuleRegistry.filterVisibleModules(modules, role);
  }, []);

  // ============================================
  // ADMIN İŞLEMLERİ
  // ============================================

  const updateServiceModules = useCallback(async (
    serviceId: string,
    moduleType: 'detail' | 'form',
    modules: ModuleInstance[]
  ): Promise<void> => {
    try {
      ModuleRegistry.updateServiceModules(serviceId, moduleType, modules);

      // Save override
      const updates: Partial<ServiceDefinition> = {};
      if (moduleType === 'detail') {
        updates.detailModules = modules;
      } else {
        updates.formModules = modules;
      }

      const newOverrides = {
        ...serviceOverrides,
        [serviceId]: {
          ...serviceOverrides[serviceId],
          ...updates,
        },
      };

      setServiceOverrides(newOverrides);
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_OVERRIDES, JSON.stringify(newOverrides));
    } catch (error) {
      console.error('Error updating service modules:', error);
      throw error;
    }
  }, [serviceOverrides]);

  const toggleServiceStatus = useCallback(async (
    serviceId: string,
    isActive: boolean
  ): Promise<void> => {
    try {
      ModuleRegistry.toggleServiceStatus(serviceId, isActive);

      const newOverrides = {
        ...serviceOverrides,
        [serviceId]: {
          ...serviceOverrides[serviceId],
          isActive,
        },
      };

      setServiceOverrides(newOverrides);
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_OVERRIDES, JSON.stringify(newOverrides));
    } catch (error) {
      console.error('Error toggling service status:', error);
      throw error;
    }
  }, [serviceOverrides]);

  const createCustomService = useCallback(async (
    service: ServiceDefinition
  ): Promise<void> => {
    try {
      const newCustomServices = [...customServices, service];
      setCustomServices(newCustomServices);
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_SERVICES, JSON.stringify(newCustomServices));

      // Also register in the registry
      ModuleRegistry.registerService(service);
    } catch (error) {
      console.error('Error creating custom service:', error);
      throw error;
    }
  }, [customServices]);

  const deleteCustomService = useCallback(async (
    serviceId: string
  ): Promise<void> => {
    try {
      const newCustomServices = customServices.filter(s => s.id !== serviceId);
      setCustomServices(newCustomServices);
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_SERVICES, JSON.stringify(newCustomServices));

      // Remove from registry
      ModuleRegistry.deleteService(serviceId);

      // Remove overrides
      const newOverrides = { ...serviceOverrides };
      delete newOverrides[serviceId];
      setServiceOverrides(newOverrides);
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_OVERRIDES, JSON.stringify(newOverrides));
    } catch (error) {
      console.error('Error deleting custom service:', error);
      throw error;
    }
  }, [customServices, serviceOverrides]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadStoredData();
  }, [loadStoredData]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const contextValue: ModuleContextValue = {
    isInitialized,
    isLoading,

    getModule,
    getAllModules,
    getDisplayModules,
    getFormModules,

    getService,
    getServiceByCategory,
    getAllServices,
    getActiveServices,
    getServicesByCategory,

    getServiceDetailModules,
    getServiceFormModules,

    updateServiceModules,
    toggleServiceStatus,
    createCustomService,
    deleteCustomService,

    refresh,
  };

  return (
    <ModuleContext.Provider value={contextValue}>
      {children}
    </ModuleContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

export const useModuleContext = (): ModuleContextValue => {
  const context = useContext(ModuleContext);

  if (!context) {
    throw new Error('useModuleContext must be used within a ModuleProvider');
  }

  return context;
};

export default ModuleContext;
