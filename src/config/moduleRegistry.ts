/**
 * Modül Registry Sistemi
 *
 * Tüm modüllerin ve hizmetlerin merkezi kayıt sistemi.
 * Admin bu sistem üzerinden modül ve hizmet yönetimi yapabilir.
 */

import { ServiceCategory, OperationSubCategory } from '../types';
import {
  ModuleType,
  ModuleDefinition,
  ModuleConfig,
  ModuleInstance,
} from '../types/modules';
import {
  ServiceDefinition,
  ServiceSummary,
  ServiceGroup,
  SystemRole,
} from '../types/serviceDefinition';
import { defaultModules } from './defaultModules';
import { defaultServices } from './defaultServices';

// ============================================
// MODÜL REGISTRY
// ============================================

class ModuleRegistryClass {
  private modules: Map<ModuleType, ModuleDefinition> = new Map();
  private services: Map<string, ServiceDefinition> = new Map();
  private initialized: boolean = false;

  /**
   * Registry'yi başlat
   */
  initialize(): void {
    if (this.initialized) return;

    // Varsayılan modülleri kaydet
    defaultModules.forEach(module => {
      this.modules.set(module.id, module);
    });

    // Varsayılan hizmetleri kaydet
    defaultServices.forEach(service => {
      this.services.set(service.id, service);
    });

    this.initialized = true;
  }

  // ============================================
  // MODÜL İŞLEMLERİ
  // ============================================

  /**
   * Modül tanımını getir
   */
  getModule(id: ModuleType): ModuleDefinition | undefined {
    this.ensureInitialized();
    return this.modules.get(id);
  }

  /**
   * Tüm modülleri getir
   */
  getAllModules(): ModuleDefinition[] {
    this.ensureInitialized();
    return Array.from(this.modules.values());
  }

  /**
   * Kategoriye göre modülleri getir
   */
  getModulesByCategory(category: 'display' | 'form'): ModuleDefinition[] {
    this.ensureInitialized();
    return Array.from(this.modules.values()).filter(m => m.category === category);
  }

  /**
   * Yeni modül kaydet
   */
  registerModule(module: ModuleDefinition): void {
    this.ensureInitialized();
    this.modules.set(module.id, module);
  }

  /**
   * Modül güncelle
   */
  updateModule(id: ModuleType, updates: Partial<ModuleDefinition>): void {
    this.ensureInitialized();
    const existing = this.modules.get(id);
    if (existing) {
      this.modules.set(id, { ...existing, ...updates });
    }
  }

  // ============================================
  // HİZMET İŞLEMLERİ
  // ============================================

  /**
   * Hizmet tanımını getir
   */
  getService(id: string): ServiceDefinition | undefined {
    this.ensureInitialized();
    return this.services.get(id);
  }

  /**
   * Tüm hizmetleri getir
   */
  getAllServices(): ServiceDefinition[] {
    this.ensureInitialized();
    return Array.from(this.services.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Aktif hizmetleri getir
   */
  getActiveServices(): ServiceDefinition[] {
    return this.getAllServices().filter(s => s.isActive && s.isVisible);
  }

  /**
   * Kategoriye göre hizmetleri getir
   */
  getServicesByCategory(category: ServiceCategory): ServiceDefinition[] {
    this.ensureInitialized();
    return Array.from(this.services.values())
      .filter(s => s.category === category)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Alt kategoriye göre hizmetleri getir
   */
  getServicesBySubCategory(subCategory: OperationSubCategory): ServiceDefinition[] {
    this.ensureInitialized();
    return Array.from(this.services.values())
      .filter(s => s.subCategory === subCategory)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Hizmet özetlerini getir
   */
  getServiceSummaries(): ServiceSummary[] {
    return this.getActiveServices().map(s => ({
      id: s.id,
      name: s.name,
      shortName: s.shortName,
      category: s.category,
      subCategory: s.subCategory,
      icon: s.icon,
      gradient: s.gradient,
      isActive: s.isActive,
      moduleCount: s.detailModules.length + s.formModules.length,
    }));
  }

  /**
   * Gruplandırılmış hizmetleri getir
   */
  getGroupedServices(): ServiceGroup[] {
    const services = this.getActiveServices();
    const categoryMap = new Map<ServiceCategory, ServiceDefinition[]>();

    services.forEach(service => {
      const list = categoryMap.get(service.category) || [];
      list.push(service);
      categoryMap.set(service.category, list);
    });

    const groups: ServiceGroup[] = [];

    categoryMap.forEach((categoryServices, category) => {
      const group: ServiceGroup = {
        category,
        categoryName: this.getCategoryName(category),
        categoryIcon: this.getCategoryIcon(category),
        services: categoryServices.map(s => ({
          id: s.id,
          name: s.name,
          shortName: s.shortName,
          category: s.category,
          subCategory: s.subCategory,
          icon: s.icon,
          gradient: s.gradient,
          isActive: s.isActive,
          moduleCount: s.detailModules.length + s.formModules.length,
        })),
      };
      groups.push(group);
    });

    return groups;
  }

  /**
   * Yeni hizmet kaydet
   */
  registerService(service: ServiceDefinition): void {
    this.ensureInitialized();
    this.services.set(service.id, {
      ...service,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Hizmet güncelle
   */
  updateService(id: string, updates: Partial<ServiceDefinition>): void {
    this.ensureInitialized();
    const existing = this.services.get(id);
    if (existing) {
      this.services.set(id, {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Hizmet modüllerini güncelle
   */
  updateServiceModules(
    serviceId: string,
    moduleType: 'detail' | 'form' | 'operation',
    modules: ModuleInstance[]
  ): void {
    this.ensureInitialized();
    const service = this.services.get(serviceId);
    if (service) {
      const updates: Partial<ServiceDefinition> = {};

      switch (moduleType) {
        case 'detail':
          updates.detailModules = modules;
          break;
        case 'form':
          updates.formModules = modules;
          break;
        case 'operation':
          updates.operationModules = modules;
          break;
      }

      this.updateService(serviceId, updates);
    }
  }

  /**
   * Hizmet durumunu değiştir
   */
  toggleServiceStatus(serviceId: string, isActive: boolean): void {
    this.updateService(serviceId, { isActive });
  }

  /**
   * Hizmet görünürlüğünü değiştir
   */
  toggleServiceVisibility(serviceId: string, isVisible: boolean): void {
    this.updateService(serviceId, { isVisible });
  }

  /**
   * Hizmet sil
   */
  deleteService(serviceId: string): void {
    this.ensureInitialized();
    this.services.delete(serviceId);
  }

  // ============================================
  // MODÜL INSTANCE YARDIMCILARI
  // ============================================

  /**
   * Modül instance'ı için tam konfigürasyon oluştur
   */
  getModuleInstanceConfig(instance: ModuleInstance): ModuleConfig | undefined {
    const moduleDefinition = this.getModule(instance.moduleId);
    if (!moduleDefinition) return undefined;

    return {
      ...moduleDefinition.defaultConfig,
      ...instance.config,
    };
  }

  /**
   * Hizmet için tüm modül konfigürasyonlarını getir
   */
  getServiceModuleConfigs(
    serviceId: string,
    moduleType: 'detail' | 'form' | 'operation'
  ): Array<{ definition: ModuleDefinition; config: ModuleConfig }> {
    const service = this.getService(serviceId);
    if (!service) return [];

    let modules: ModuleInstance[];
    switch (moduleType) {
      case 'detail':
        modules = service.detailModules;
        break;
      case 'form':
        modules = service.formModules;
        break;
      case 'operation':
        modules = service.operationModules || [];
        break;
    }

    return modules
      .map(instance => {
        const definition = this.getModule(instance.moduleId);
        if (!definition) return null;

        const config = this.getModuleInstanceConfig(instance);
        if (!config) return null;

        return { definition, config };
      })
      .filter((item): item is { definition: ModuleDefinition; config: ModuleConfig } =>
        item !== null
      )
      .filter(item => item.config.enabled)
      .sort((a, b) => a.config.order - b.config.order);
  }

  /**
   * Rol için görünür modülleri filtrele
   */
  filterVisibleModules(
    modules: Array<{ definition: ModuleDefinition; config: ModuleConfig }>,
    role: SystemRole
  ): Array<{ definition: ModuleDefinition; config: ModuleConfig }> {
    return modules.filter(({ config }) => {
      if (config.visibility === 'all') return true;
      if (config.visibility === 'admin' && (role === 'super_admin' || role === 'admin')) return true;
      if (config.visibility === 'provider' && role === 'provider') return true;
      if (config.visibility === 'organizer' && role === 'organizer') return true;
      return false;
    });
  }

  // ============================================
  // YARDIMCI METODLAR
  // ============================================

  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initialize();
    }
  }

  private getCategoryName(category: ServiceCategory): string {
    const names: Record<ServiceCategory, string> = {
      booking: 'Sanatçı / Booking',
      technical: 'Teknik Ekipman',
      venue: 'Mekan',
      accommodation: 'Konaklama',
      transport: 'Ulaşım',
      operation: 'Operasyon',
    };
    return names[category] || category;
  }

  private getCategoryIcon(category: ServiceCategory): string {
    const icons: Record<ServiceCategory, string> = {
      booking: 'musical-notes',
      technical: 'hardware-chip',
      venue: 'business',
      accommodation: 'bed',
      transport: 'car',
      operation: 'construct',
    };
    return icons[category] || 'help-circle';
  }

  /**
   * Registry'yi sıfırla (test için)
   */
  reset(): void {
    this.modules.clear();
    this.services.clear();
    this.initialized = false;
  }
}

// Singleton instance
export const ModuleRegistry = new ModuleRegistryClass();

// Auto-initialize
ModuleRegistry.initialize();

// ============================================
// EXPORT HELPERS
// ============================================

/**
 * Modül tanımını getir
 */
export const getModuleDefinition = (id: ModuleType): ModuleDefinition | undefined => {
  return ModuleRegistry.getModule(id);
};

/**
 * Hizmet tanımını getir
 */
export const getServiceDefinition = (id: string): ServiceDefinition | undefined => {
  return ModuleRegistry.getService(id);
};

/**
 * Aktif hizmetleri getir
 */
export const getActiveServices = (): ServiceDefinition[] => {
  return ModuleRegistry.getActiveServices();
};

/**
 * Kategoriye göre hizmetleri getir
 */
export const getServicesByCategory = (category: ServiceCategory): ServiceDefinition[] => {
  return ModuleRegistry.getServicesByCategory(category);
};
