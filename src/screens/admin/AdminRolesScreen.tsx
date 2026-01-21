import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ScrollHeader, LargeTitle } from '../../components/navigation';
import { useTheme } from '../../theme/ThemeContext';
import { useAdminRoles } from '../../hooks/useAdminRoles';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { PermissionMatrix } from '../../components/admin/PermissionMatrix';
import { ActionModal } from '../../components/admin/ActionModal';
import type { AdminRole, AdminPermissionResource, AdminPermissionAction } from '../../types/admin';

export function AdminRolesScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    roles,
    isRefreshing,
    isProcessing,
    refresh,
    createRole,
    updateRole,
    deleteRole,
    duplicateRole,
  } = useAdminRoles();
  const { canEditRoles, canDeleteRoles, canCreateRoles } = useAdminPermissions();

  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleRolePress = useCallback((role: AdminRole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRole(role);
    setShowEditSheet(true);
  }, []);

  const handleDuplicate = useCallback(async (role: AdminRole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await duplicateRole(role.id, `${role.name} (Kopya)`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [duplicateRole]);

  const handleDelete = useCallback((role: AdminRole) => {
    if (role.isSystem) return;
    setSelectedRole(role);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (selectedRole && !selectedRole.isSystem) {
      await deleteRole(selectedRole.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowDeleteModal(false);
    setSelectedRole(null);
  }, [selectedRole, deleteRole]);

  const handleCreateRole = useCallback(async () => {
    if (newRoleName.trim()) {
      await createRole({
        name: newRoleName.trim(),
        type: 'custom',
        description: 'Özel rol',
        permissions: [],
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewRoleName('');
      setShowCreateModal(false);
    }
  }, [newRoleName, createRole]);

  const handlePermissionToggle = useCallback(
    async (resource: AdminPermissionResource, action: AdminPermissionAction) => {
      if (!selectedRole || selectedRole.isSystem) return;

      const currentPermissions = [...selectedRole.permissions];
      const resourceIndex = currentPermissions.findIndex((p) => p.resource === resource);

      if (resourceIndex >= 0) {
        const actionIndex = currentPermissions[resourceIndex].actions.indexOf(action);
        if (actionIndex >= 0) {
          currentPermissions[resourceIndex].actions.splice(actionIndex, 1);
          if (currentPermissions[resourceIndex].actions.length === 0) {
            currentPermissions.splice(resourceIndex, 1);
          }
        } else {
          currentPermissions[resourceIndex].actions.push(action);
        }
      } else {
        currentPermissions.push({ resource, actions: [action] });
      }

      await updateRole(selectedRole.id, { permissions: currentPermissions });
      setSelectedRole({ ...selectedRole, permissions: currentPermissions });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [selectedRole, updateRole]
  );

  const getRoleIcon = (type: string) => {
    switch (type) {
      case 'super_admin':
        return 'shield-checkmark';
      case 'moderator':
        return 'person-circle';
      case 'finance':
        return 'cash';
      case 'support':
        return 'headset';
      default:
        return 'key';
    }
  };

  const getRoleColor = (type: string) => {
    switch (type) {
      case 'super_admin':
        return '#ef4444';
      case 'moderator':
        return '#8b5cf6';
      case 'finance':
        return '#10b981';
      case 'support':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollHeader
        title="Rol Yönetimi"
        scrollY={scrollY}
        showBackButton
        rightAction={
          canCreateRoles ? (
            <TouchableOpacity
              style={[
                styles.headerAction,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBackground },
              ]}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={22} color={colors.brand[500]} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 44 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.brand[500]}
          />
        }
      >
        <LargeTitle
          title="Rol Yönetimi"
          subtitle={`${roles.length} tanımlı rol`}
          scrollY={scrollY}
        />

        {/* System Roles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sistem Rolleri</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            Bu roller düzenlenemez veya silinemez
          </Text>

          {roles
            .filter((r) => r.isSystem)
            .map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
                ]}
                onPress={() => handleRolePress(role)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.roleIcon, { backgroundColor: `${getRoleColor(role.type)}20` }]}
                >
                  <Ionicons
                    name={getRoleIcon(role.type) as any}
                    size={24}
                    color={getRoleColor(role.type)}
                  />
                </View>

                <View style={styles.roleContent}>
                  <View style={styles.roleHeader}>
                    <Text style={[styles.roleName, { color: colors.text }]}>{role.name}</Text>
                    <View style={[styles.systemBadge, { backgroundColor: `${colors.brand[500]}20` }]}>
                      <Text style={[styles.systemBadgeText, { color: colors.brand[500] }]}>
                        Sistem
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.roleDescription, { color: colors.textMuted }]}>
                    {role.permissions.length} kaynak yetkisi
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
        </View>

        {/* Custom Roles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Özel Roller</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            Kendi rollerinizi oluşturun ve düzenleyin
          </Text>

          {roles
            .filter((r) => !r.isSystem)
            .map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
                ]}
                onPress={() => handleRolePress(role)}
                activeOpacity={0.7}
              >
                <View style={[styles.roleIcon, { backgroundColor: `${getRoleColor(role.type)}20` }]}>
                  <Ionicons
                    name={getRoleIcon(role.type) as any}
                    size={24}
                    color={getRoleColor(role.type)}
                  />
                </View>

                <View style={styles.roleContent}>
                  <Text style={[styles.roleName, { color: colors.text }]}>{role.name}</Text>
                  <Text style={[styles.roleDescription, { color: colors.textMuted }]}>
                    {role.permissions.length} kaynak yetkisi
                  </Text>
                </View>

                <View style={styles.roleActions}>
                  {canEditRoles && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: `${colors.brand[400]}20` }]}
                      onPress={() => handleDuplicate(role)}
                    >
                      <Ionicons name="copy-outline" size={16} color={colors.brand[400]} />
                    </TouchableOpacity>
                  )}
                  {canDeleteRoles && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: 'rgba(239,68,68,0.1)' }]}
                      onPress={() => handleDelete(role)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}

          {roles.filter((r) => !r.isSystem).length === 0 && (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
              ]}
            >
              <Ionicons name="key-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Özel rol yok</Text>
              <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
                Yeni bir özel rol oluşturmak için + butonuna tıklayın
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Edit Sheet / Bottom Sheet simulation */}
      {showEditSheet && selectedRole && (
        <View style={[styles.editSheet, { backgroundColor: colors.background }]}>
          <View style={styles.editSheetHeader}>
            <TouchableOpacity onPress={() => setShowEditSheet(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.editSheetTitle, { color: colors.text }]}>
              {selectedRole.name}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.editSheetContent} showsVerticalScrollIndicator={false}>
            <View style={styles.editSection}>
              <Text style={[styles.editSectionTitle, { color: colors.text }]}>Yetki Matrisi</Text>
              {selectedRole.isSystem && (
                <Text style={[styles.editSectionNote, { color: colors.textMuted }]}>
                  Sistem rolleri salt okunurdur
                </Text>
              )}
            </View>

            <View
              style={[
                styles.matrixContainer,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
              ]}
            >
              <PermissionMatrix
                permissions={selectedRole.permissions}
                onToggle={handlePermissionToggle}
                readOnly={selectedRole.isSystem || !canEditRoles}
              />
            </View>
          </ScrollView>
        </View>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.createModal,
              { backgroundColor: isDark ? colors.cardBackground : '#fff' },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Yeni Rol Oluştur</Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  color: colors.text,
                },
              ]}
              placeholder="Rol adı"
              placeholderTextColor={colors.textMuted}
              value={newRoleName}
              onChangeText={setNewRoleName}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewRoleName('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                  İptal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  { backgroundColor: colors.brand[500] },
                ]}
                onPress={handleCreateRole}
                disabled={!newRoleName.trim()}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Oluştur</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Delete Modal */}
      <ActionModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRole(null);
        }}
        onConfirm={confirmDelete}
        title="Rolü Sil"
        message={`"${selectedRole?.name}" rolünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmLabel="Sil"
        icon="trash"
        iconColor="#ef4444"
        isDestructive
        isLoading={isProcessing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleContent: {
    flex: 1,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleName: {
    fontSize: 15,
    fontWeight: '600',
  },
  roleDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  systemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  systemBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  roleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyMessage: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  editSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  editSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  editSheetTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  editSheetContent: {
    flex: 1,
    padding: 20,
  },
  editSection: {
    marginBottom: 16,
  },
  editSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  editSectionNote: {
    fontSize: 12,
  },
  matrixContainer: {
    borderRadius: 16,
    padding: 12,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  createModal: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  confirmButton: {},
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AdminRolesScreen;
