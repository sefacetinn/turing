import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { getPermissionSummaries } from '../../config/roles';
import type { Role } from '../../types/rbac';

// Permission key type for type safety
export type PermissionKey =
  | 'team_manage'
  | 'events_create'
  | 'offers_approve'
  | 'contracts_approve'
  | 'payments_approve'
  | 'settings_edit';

// Permission state object
export interface PermissionState {
  team_manage: boolean;
  events_create: boolean;
  offers_approve: boolean;
  contracts_approve: boolean;
  payments_approve: boolean;
  settings_edit: boolean;
}

// Get default permissions from a role
export function getDefaultPermissionsFromRole(role: Role): PermissionState {
  return {
    team_manage: role.permissions.find(p => p.resource === 'team')?.actions.includes('create') || false,
    events_create: role.permissions.find(p => p.resource === 'events')?.actions.includes('create') || false,
    offers_approve: role.permissions.find(p => p.resource === 'offers')?.actions.includes('approve') || false,
    contracts_approve: role.permissions.find(p => p.resource === 'contracts')?.actions.includes('approve') || false,
    payments_approve: role.permissions.find(p => p.resource === 'payments')?.actions.includes('approve') || false,
    settings_edit: role.permissions.find(p => p.resource === 'settings')?.actions.includes('edit') || false,
  };
}

// Permission info for display
const permissionInfo: Array<{
  key: PermissionKey;
  label: string;
  icon: string;
  description: string;
}> = [
  { key: 'team_manage', label: 'Ekip Yönetimi', icon: 'people', description: 'Ekip üyelerini ekleyebilir ve yönetebilir' },
  { key: 'events_create', label: 'Etkinlik Oluşturma', icon: 'calendar', description: 'Yeni etkinlikler oluşturabilir' },
  { key: 'offers_approve', label: 'Teklif Onaylama', icon: 'checkmark-circle', description: 'Gelen teklifleri onaylayabilir' },
  { key: 'contracts_approve', label: 'Sözleşme İmzalama', icon: 'document-text', description: 'Sözleşmeleri imzalayabilir' },
  { key: 'payments_approve', label: 'Ödeme Yönetimi', icon: 'wallet', description: 'Ödemeleri yönetebilir ve onaylayabilir' },
  { key: 'settings_edit', label: 'Ayarları Düzenleme', icon: 'settings', description: 'Firma ayarlarını değiştirebilir' },
];

interface PermissionListProps {
  role: Role;
  compact?: boolean;
  editable?: boolean;
  customPermissions?: PermissionState;
  onPermissionToggle?: (key: PermissionKey, value: boolean) => void;
}

export function PermissionList({
  role,
  compact = false,
  editable = false,
  customPermissions,
  onPermissionToggle,
}: PermissionListProps) {
  const { colors, isDark } = useTheme();

  // Use custom permissions if provided, otherwise use role defaults
  const permissions = customPermissions || getDefaultPermissionsFromRole(role);

  const handleToggle = (key: PermissionKey) => {
    if (!editable || !onPermissionToggle) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPermissionToggle(key, !permissions[key]);
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {permissionInfo.map((info) => {
          const hasPermission = permissions[info.key];
          return (
            <View key={info.key} style={styles.compactItem}>
              <Ionicons
                name={(hasPermission ? 'checkmark-circle' : 'close-circle') as any}
                size={16}
                color={hasPermission ? '#10b981' : '#ef4444'}
              />
              <Text
                style={[
                  styles.compactText,
                  { color: hasPermission ? colors.text : colors.textMuted },
                ]}
              >
                {info.label}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {permissionInfo.map((info) => {
        const hasPermission = permissions[info.key];

        return (
          <TouchableOpacity
            key={info.key}
            style={[
              styles.permissionItem,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
                borderColor: isDark ? 'transparent' : '#e5e7eb',
              },
            ]}
            onPress={() => handleToggle(info.key)}
            activeOpacity={editable ? 0.7 : 1}
            disabled={!editable}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: hasPermission
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                },
              ]}
            >
              <Ionicons
                name={info.icon as any}
                size={18}
                color={hasPermission ? '#10b981' : '#ef4444'}
              />
            </View>
            <Text
              style={[
                styles.permissionText,
                { color: hasPermission ? colors.text : colors.textMuted },
              ]}
            >
              {info.label}
            </Text>
            {editable ? (
              // Editable: Show toggle button
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  {
                    backgroundColor: hasPermission
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                  },
                ]}
                onPress={() => handleToggle(info.key)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={hasPermission ? 'checkmark' : 'close'}
                  size={16}
                  color={hasPermission ? '#10b981' : '#ef4444'}
                />
              </TouchableOpacity>
            ) : (
              // Read-only: Show status icon
              <Ionicons
                name={(hasPermission ? 'checkmark-circle' : 'close-circle') as any}
                size={20}
                color={hasPermission ? '#10b981' : '#ef4444'}
              />
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
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContainer: {
    gap: 6,
  },
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactText: {
    fontSize: 13,
  },
});

export default PermissionList;
