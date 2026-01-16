/**
 * ModuleWrapper - Modül Sarmalayıcı Bileşeni
 *
 * Her modül için ortak sarmalayıcı.
 * Başlık, collapse, visibility kontrolü sağlar.
 */

import React, { useState, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { ModuleDefinition, ModuleConfig } from '../../types/modules';
import { ModuleCard } from './shared/ModuleCard';

interface ModuleWrapperProps {
  definition: ModuleDefinition;
  config: ModuleConfig;
  children: ReactNode;
  rightAction?: ReactNode;
}

export const ModuleWrapper: React.FC<ModuleWrapperProps> = ({
  definition,
  config,
  children,
  rightAction,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(config.collapsed);

  // Determine icon color based on module type
  const getIconColor = (): string => {
    const colorMap: Record<string, string> = {
      venue: '#F59E0B',
      datetime: '#6366F1',
      budget: '#10B981',
      participant: '#3B82F6',
      media: '#EC4899',
      document: '#8B5CF6',
      team: '#14B8A6',
      equipment: '#10B981',
      logistics: '#6366F1',
      contact: '#3B82F6',
      timeline: '#F97316',
      checklist: '#10B981',
      rating: '#FBBF24',
      menu: '#F97316',
      vehicle: '#8B5CF6',
      medical: '#EF4444',
      ticketing: '#06B6D4',
    };
    return colorMap[definition.id] || '#6366F1';
  };

  const title = config.customLabel || definition.name;
  const icon = config.customIcon || definition.icon;
  const collapsible = !config.required; // Required modules cannot be collapsed

  return (
    <ModuleCard
      title={title}
      icon={icon}
      iconColor={getIconColor()}
      collapsed={isCollapsed}
      collapsible={collapsible}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      rightAction={rightAction}
      noPadding={config.styles?.noPadding}
      noBorder={config.styles?.noBorder}
      style={config.styles?.backgroundColor ? { backgroundColor: config.styles.backgroundColor } : undefined}
    >
      {children}
    </ModuleCard>
  );
};

export default ModuleWrapper;
