import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import type { AdminPermission, AdminPermissionAction, AdminPermissionResource } from '../../types/admin';

interface PermissionMatrixProps {
  permissions: AdminPermission[];
  onToggle?: (resource: AdminPermissionResource, action: AdminPermissionAction) => void;
  readOnly?: boolean;
}

const RESOURCES: { key: AdminPermissionResource; label: string; icon: string }[] = [
  { key: 'users', label: 'Kullanıcılar', icon: 'people' },
  { key: 'events', label: 'Etkinlikler', icon: 'calendar' },
  { key: 'finance', label: 'Finans', icon: 'wallet' },
  { key: 'reports', label: 'Raporlar', icon: 'document-text' },
  { key: 'roles', label: 'Roller', icon: 'shield' },
  { key: 'settings', label: 'Ayarlar', icon: 'settings' },
];

const ACTIONS: { key: AdminPermissionAction; label: string; icon: string }[] = [
  { key: 'view', label: 'Görüntüle', icon: 'eye-outline' },
  { key: 'create', label: 'Oluştur', icon: 'add-outline' },
  { key: 'edit', label: 'Düzenle', icon: 'pencil-outline' },
  { key: 'delete', label: 'Sil', icon: 'trash-outline' },
  { key: 'approve', label: 'Onayla', icon: 'checkmark-outline' },
  { key: 'export', label: 'Dışa Aktar', icon: 'download-outline' },
];

export function PermissionMatrix({ permissions, onToggle, readOnly = false }: PermissionMatrixProps) {
  const { colors, isDark } = useTheme();

  const hasPermission = (resource: AdminPermissionResource, action: AdminPermissionAction): boolean => {
    const resourcePerm = permissions.find(p => p.resource === resource);
    return resourcePerm?.actions.includes(action) || false;
  };

  const handleToggle = (resource: AdminPermissionResource, action: AdminPermissionAction) => {
    if (!readOnly && onToggle) {
      onToggle(resource, action);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={[styles.resourceCell, styles.headerCell]}>
              <Text style={[styles.headerText, { color: colors.textMuted }]}>Kaynak</Text>
            </View>
            {ACTIONS.map((action) => (
              <View
                key={action.key}
                style={[
                  styles.actionCell,
                  styles.headerCell,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.background },
                ]}
              >
                <Ionicons name={action.icon as any} size={16} color={colors.textMuted} />
                <Text style={[styles.actionLabel, { color: colors.textMuted }]}>
                  {action.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Resource Rows */}
          {RESOURCES.map((resource, index) => (
            <View
              key={resource.key}
              style={[
                styles.row,
                index % 2 === 0 && {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                },
              ]}
            >
              <View style={styles.resourceCell}>
                <Ionicons name={resource.icon as any} size={18} color={colors.textSecondary} />
                <Text style={[styles.resourceLabel, { color: colors.text }]}>
                  {resource.label}
                </Text>
              </View>
              {ACTIONS.map((action) => {
                const isEnabled = hasPermission(resource.key, action.key);
                return (
                  <TouchableOpacity
                    key={action.key}
                    style={styles.actionCell}
                    onPress={() => handleToggle(resource.key, action.key)}
                    disabled={readOnly}
                    activeOpacity={readOnly ? 1 : 0.7}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: isEnabled
                            ? colors.brand[500]
                            : isDark
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.06)',
                          borderColor: isEnabled
                            ? colors.brand[500]
                            : isDark
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(0,0,0,0.1)',
                        },
                      ]}
                    >
                      {isEnabled && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={[styles.legend, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.brand[500] }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>İzin verildi</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
            ]}
          />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>İzin yok</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
  },
  headerCell: {
    paddingVertical: 12,
  },
  resourceCell: {
    width: 130,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionCell: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionLabel: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  resourceLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
  },
});

export default PermissionMatrix;
