import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { getPermissionSummaries } from '../../config/roles';
import type { Role } from '../../types/rbac';

interface PermissionListProps {
  role: Role;
  compact?: boolean;
}

export function PermissionList({ role, compact = false }: PermissionListProps) {
  const { colors, isDark } = useTheme();
  const summaries = getPermissionSummaries(role);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {summaries.map((summary, index) => (
          <View key={index} style={styles.compactItem}>
            <Ionicons
              name={(summary.hasPermission ? 'checkmark-circle' : 'close-circle') as any}
              size={16}
              color={summary.hasPermission ? '#10b981' : '#ef4444'}
            />
            <Text
              style={[
                styles.compactText,
                { color: summary.hasPermission ? colors.text : colors.textMuted },
              ]}
            >
              {summary.label}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {summaries.map((summary, index) => (
        <View
          key={index}
          style={[
            styles.permissionItem,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
              borderColor: isDark ? 'transparent' : '#e5e7eb',
            },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: summary.hasPermission
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
              },
            ]}
          >
            <Ionicons
              name={summary.icon as any}
              size={18}
              color={summary.hasPermission ? '#10b981' : '#ef4444'}
            />
          </View>
          <Text
            style={[
              styles.permissionText,
              { color: summary.hasPermission ? colors.text : colors.textMuted },
            ]}
          >
            {summary.label}
          </Text>
          <Ionicons
            name={(summary.hasPermission ? 'checkmark-circle' : 'close-circle') as any}
            size={20}
            color={summary.hasPermission ? '#10b981' : '#ef4444'}
          />
        </View>
      ))}
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
