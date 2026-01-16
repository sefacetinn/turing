/**
 * ModuleRenderer - Dinamik Modül Renderer
 *
 * Hizmet konfigürasyonuna göre modülleri dinamik olarak render eder.
 * Modül sıralaması, görünürlüğü ve role göre filtreleme yapar.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ModuleDefinition, ModuleConfig, ModuleDataMap, DisplayModuleType } from '../../types/modules';
import { SystemRole } from '../../types/serviceDefinition';
import { useTheme } from '../../theme/ThemeContext';
import { ModuleWrapper } from './ModuleWrapper';

// Display Modules
import { VenueModule } from './display/VenueModule';
import { DateTimeModule } from './display/DateTimeModule';
import { BudgetModule } from './display/BudgetModule';
import { ParticipantModule } from './display/ParticipantModule';
import { ContactModule } from './display/ContactModule';
import { TeamModule } from './display/TeamModule';
import { EquipmentModule } from './display/EquipmentModule';
import { MediaModule } from './display/MediaModule';
import { DocumentModule } from './display/DocumentModule';
import { TimelineModule } from './display/TimelineModule';
import { ChecklistModule } from './display/ChecklistModule';
import { LogisticsModule } from './display/LogisticsModule';
import { MenuModule } from './display/MenuModule';
import { VehicleModule } from './display/VehicleModule';
import { MedicalModule } from './display/MedicalModule';
import { TicketingModule } from './display/TicketingModule';
import { RatingModule } from './display/RatingModule';

// ============================================
// TİPLER
// ============================================

type RenderMode = 'view' | 'edit' | 'form';

interface ModuleRendererProps {
  modules: Array<{ definition: ModuleDefinition; config: ModuleConfig }>;
  data: Partial<ModuleDataMap>;
  mode?: RenderMode;
  role?: SystemRole;
  onDataChange?: (moduleId: string, data: any) => void;
}

// ============================================
// MODÜL COMPONENT MAP
// ============================================

const MODULE_COMPONENTS: Record<DisplayModuleType, React.ComponentType<any>> = {
  venue: VenueModule,
  datetime: DateTimeModule,
  budget: BudgetModule,
  participant: ParticipantModule,
  media: MediaModule,
  document: DocumentModule,
  team: TeamModule,
  equipment: EquipmentModule,
  logistics: LogisticsModule,
  contact: ContactModule,
  timeline: TimelineModule,
  checklist: ChecklistModule,
  rating: RatingModule,
  menu: MenuModule,
  vehicle: VehicleModule,
  medical: MedicalModule,
  ticketing: TicketingModule,
};

// ============================================
// COMPONENT
// ============================================

export const ModuleRenderer: React.FC<ModuleRendererProps> = ({
  modules,
  data,
  mode = 'view',
  role = 'organizer',
  onDataChange,
}) => {
  const { colors, isDark } = useTheme();

  // Filter and sort modules
  const visibleModules = useMemo(() => {
    return modules
      .filter(({ config }) => {
        if (!config.enabled) return false;

        // Check visibility based on role
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
      })
      .sort((a, b) => a.config.order - b.config.order);
  }, [modules, role]);

  // Render individual module
  const renderModule = (
    definition: ModuleDefinition,
    config: ModuleConfig
  ): React.ReactNode => {
    const moduleId = definition.id as DisplayModuleType;
    const ModuleComponent = MODULE_COMPONENTS[moduleId];

    if (!ModuleComponent) {
      // Fallback for unknown modules
      return (
        <View style={[styles.unknownModule, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
          <Text style={[styles.unknownText, { color: colors.textSecondary }]}>
            Modül bulunamadı: {moduleId}
          </Text>
        </View>
      );
    }

    const moduleData = data[moduleId as keyof ModuleDataMap];

    // Skip rendering if no data and not required
    if (!moduleData && !config.required) {
      return null;
    }

    return (
      <ModuleWrapper
        key={definition.id}
        definition={definition}
        config={config}
      >
        <ModuleComponent
          data={moduleData}
          config={config}
          mode={mode}
          onDataChange={
            onDataChange
              ? (newData: any) => onDataChange(definition.id, newData)
              : undefined
          }
        />
      </ModuleWrapper>
    );
  };

  // If no modules to render
  if (visibleModules.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {visibleModules.map(({ definition, config }) => renderModule(definition, config))}
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  unknownModule: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  unknownText: {
    fontSize: 12,
  },
});

export default ModuleRenderer;
