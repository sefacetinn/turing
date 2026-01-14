import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useRBAC } from '../context/RBACContext';
import { usePermissions } from '../hooks/usePermissions';
import { RoleBadge, PermissionList, RoleSelector } from '../components/team';
import { formatDate, getTimeAgo } from '../data/mockTeamData';
import type { ProfileStackNavigationProp, MemberDetailRouteProp } from '../types';

export default function MemberDetailScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProfileStackNavigationProp>();
  const route = useRoute<MemberDetailRouteProp>();
  const { memberId } = route.params;

  const {
    currentOrganization,
    currentUser,
    updateMemberRole,
    removeMember,
    availableRoles,
  } = useRBAC();
  const { canChangeRoles, canRemoveMembers } = usePermissions();

  const [isLoading, setIsLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const member = useMemo(() => {
    return currentOrganization?.members.find((m) => m.id === memberId);
  }, [currentOrganization, memberId]);

  const inviter = useMemo(() => {
    if (!member || !currentOrganization) return null;
    return currentOrganization.members.find((m) => m.id === member.invitedBy);
  }, [member, currentOrganization]);

  const handleRoleChange = useCallback(async () => {
    if (!selectedRoleId || !member || selectedRoleId === member.role.id) {
      setShowRoleModal(false);
      return;
    }

    Alert.alert(
      'Rol Değiştir',
      `${member.name} kullanıcısının rolünü değiştirmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Değiştir',
          onPress: async () => {
            setIsLoading(true);
            setShowRoleModal(false);
            try {
              await updateMemberRole(memberId, selectedRoleId);
              Alert.alert('Başarılı', 'Rol başarıyla değiştirildi.');
            } catch (error) {
              Alert.alert('Hata', 'Rol değiştirilemedi.');
            }
            setIsLoading(false);
          },
        },
      ]
    );
  }, [selectedRoleId, member, memberId, updateMemberRole]);

  const handleRemoveMember = useCallback(() => {
    if (!member) return;

    Alert.alert(
      'Ekipten Çıkar',
      `${member.name} kullanıcısını ekipten çıkarmak istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkar',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await removeMember(memberId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Hata', 'Üye çıkarılamadı.');
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [member, memberId, removeMember, navigation]);

  const openRoleModal = useCallback(() => {
    if (member) {
      setSelectedRoleId(member.role.id);
      setShowRoleModal(true);
    }
  }, [member]);

  if (!member) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundContainer}>
          <Ionicons name="person-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.notFoundText, { color: colors.textMuted }]}>
            Üye bulunamadı
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Üye Detayı
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
              borderColor: isDark ? 'transparent' : '#e5e7eb',
            },
          ]}
        >
          {member.avatar ? (
            <Image source={{ uri: member.avatar }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' },
              ]}
            >
              <Ionicons name="person" size={40} color={colors.textMuted} />
            </View>
          )}
          <Text style={[styles.memberName, { color: colors.text }]}>
            {member.name}
          </Text>
          <Text style={[styles.memberEmail, { color: colors.textMuted }]}>
            {member.email}
          </Text>
          <RoleBadge role={member.role} size="large" />
        </View>

        {/* Member Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Üyelik Bilgileri
          </Text>
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
                borderColor: isDark ? 'transparent' : '#e5e7eb',
              },
            ]}
          >
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Katılım Tarihi
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {member.joinedAt ? formatDate(member.joinedAt) : '-'}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Ionicons name="person-add-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Davet Eden
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {inviter?.name || (member.invitedBy === 'self' ? 'Kendisi' : '-')}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Son Aktif
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {member.lastActiveAt ? getTimeAgo(member.lastActiveAt) : '-'}
              </Text>
            </View>
            {member.phone && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={18} color={colors.textMuted} />
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                    Telefon
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {member.phone}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Role Change */}
        {canChangeRoles && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Rol Değiştir
            </Text>
            <TouchableOpacity
              style={[
                styles.roleChangeButton,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
                  borderColor: isDark ? 'transparent' : '#e5e7eb',
                },
              ]}
              onPress={openRoleModal}
            >
              <RoleBadge role={member.role} size="medium" />
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Permissions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Mevcut Yetkiler
          </Text>
          <PermissionList role={member.role} />
        </View>

        {/* Remove Member */}
        {canRemoveMembers && member.id !== currentUser?.id && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveMember}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ef4444" />
            ) : (
              <>
                <Ionicons name="person-remove-outline" size={20} color="#ef4444" />
                <Text style={styles.removeButtonText}>Ekipten Çıkar</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Role Selection Modal */}
      <Modal
        visible={showRoleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowRoleModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.textMuted }]}>
                Vazgeç
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Rol Seçin
            </Text>
            <TouchableOpacity onPress={handleRoleChange}>
              <Text style={styles.modalDone}>Kaydet</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <RoleSelector
              roles={availableRoles}
              selectedRoleId={selectedRoleId}
              onSelectRole={setSelectedRoleId}
              showDescriptions={true}
            />
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  roleChangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginTop: 8,
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
});
