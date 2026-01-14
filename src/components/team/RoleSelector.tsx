import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import type { Role } from '../../types/rbac';

interface RoleSelectorProps {
  roles: Role[];
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
  showDescriptions?: boolean;
}

export function RoleSelector({
  roles,
  selectedRoleId,
  onSelectRole,
  showDescriptions = true,
}: RoleSelectorProps) {
  const { colors, isDark } = useTheme();

  const getRoleIcon = (roleType: string): string => {
    const icons: Record<string, string> = {
      // Organizatör
      account_admin: 'shield-checkmark',
      event_coordinator: 'calendar',
      finance_manager: 'wallet',
      event_specialist: 'construct',
      assistant: 'person',
      // Provider
      owner: 'business',
      artist_manager: 'musical-notes',
      tour_manager: 'airplane',
      production_manager: 'videocam',
      project_manager: 'clipboard',
      technical_director: 'settings',
      field_supervisor: 'hammer',
      venue_manager: 'home',
      sales_rep: 'trending-up',
      operations_manager: 'people',
      receptionist: 'call',
      chef: 'restaurant',
      event_caterer: 'fast-food',
      head_waiter: 'wine',
      fleet_manager: 'car',
      operations_coordinator: 'map',
      driver: 'navigate',
      provider_assistant: 'person',
    };
    return icons[roleType] || 'person';
  };

  return (
    <View style={styles.container}>
      {roles.map((role) => {
        const isSelected = selectedRoleId === role.id;
        return (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              {
                backgroundColor: isSelected
                  ? isDark
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'rgba(99, 102, 241, 0.08)'
                  : isDark
                  ? 'rgba(255,255,255,0.03)'
                  : '#f8f9fa',
                borderColor: isSelected ? '#6366f1' : isDark ? 'transparent' : '#e5e7eb',
              },
            ]}
            onPress={() => onSelectRole(role.id)}
            activeOpacity={0.7}
          >
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radioOuter,
                  {
                    borderColor: isSelected ? '#6366f1' : colors.textMuted,
                  },
                ]}
              >
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </View>

            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isSelected
                    ? 'rgba(99, 102, 241, 0.2)'
                    : isDark
                    ? 'rgba(255,255,255,0.05)'
                    : '#e5e7eb',
                },
              ]}
            >
              <Ionicons
                name={getRoleIcon(role.type) as any}
                size={20}
                color={isSelected ? '#6366f1' : colors.textMuted}
              />
            </View>

            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.roleName,
                  { color: isSelected ? '#6366f1' : colors.text },
                ]}
              >
                {role.name}
              </Text>
              {showDescriptions && (
                <Text style={[styles.roleDescription, { color: colors.textMuted }]}>
                  {role.description}
                </Text>
              )}
            </View>

            {role.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Varsayılan</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  radioContainer: {
    marginRight: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  roleName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  roleDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  defaultBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6366f1',
  },
});

export default RoleSelector;
