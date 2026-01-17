import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import type { Role } from '../../types/rbac';

interface RoleBadgeProps {
  role: Role;
  size?: 'small' | 'medium' | 'large';
}

const roleColors: Record<string, { bg: string; text: string }> = {
  // Organizatör rolleri
  account_admin: { bg: '#4b30b8', text: '#ffffff' },
  event_coordinator: { bg: '#8b5cf6', text: '#ffffff' },
  finance_manager: { bg: '#10b981', text: '#ffffff' },
  event_specialist: { bg: '#f59e0b', text: '#ffffff' },
  assistant: { bg: '#6b7280', text: '#ffffff' },
  // Provider rolleri
  owner: { bg: '#4b30b8', text: '#ffffff' },
  artist_manager: { bg: '#ec4899', text: '#ffffff' },
  tour_manager: { bg: '#8b5cf6', text: '#ffffff' },
  production_manager: { bg: '#f59e0b', text: '#ffffff' },
  project_manager: { bg: '#3b82f6', text: '#ffffff' },
  technical_director: { bg: '#14b8a6', text: '#ffffff' },
  field_supervisor: { bg: '#f97316', text: '#ffffff' },
  venue_manager: { bg: '#4b30b8', text: '#ffffff' },
  sales_rep: { bg: '#3b82f6', text: '#ffffff' },
  operations_manager: { bg: '#f59e0b', text: '#ffffff' },
  receptionist: { bg: '#6b7280', text: '#ffffff' },
  chef: { bg: '#ef4444', text: '#ffffff' },
  event_caterer: { bg: '#f97316', text: '#ffffff' },
  head_waiter: { bg: '#6b7280', text: '#ffffff' },
  fleet_manager: { bg: '#4b30b8', text: '#ffffff' },
  operations_coordinator: { bg: '#3b82f6', text: '#ffffff' },
  driver: { bg: '#6b7280', text: '#ffffff' },
  provider_assistant: { bg: '#6b7280', text: '#ffffff' },
};

export function RoleBadge({ role, size = 'medium' }: RoleBadgeProps) {
  const { colors, isDark } = useTheme();
  const colorScheme = roleColors[role.type] || { bg: '#6b7280', text: '#ffffff' };

  const sizeStyles = {
    small: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
    medium: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 11 },
    large: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 13 },
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? `${colorScheme.bg}30` : `${colorScheme.bg}20`,
          borderColor: colorScheme.bg,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: isDark ? colorScheme.bg : colorScheme.bg,
            fontSize: sizeStyles[size].fontSize,
          },
        ]}
      >
        {role.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});

export default RoleBadge;
