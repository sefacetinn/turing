import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { UserStatusBadge } from '../../components/admin/UserStatusBadge';
import { VerificationBadge } from '../../components/admin/VerificationBadge';
import { ActionModal } from '../../components/admin/ActionModal';
import type { AdminStackParamList } from '../../types/admin';

type AdminUserDetailRouteProp = RouteProp<AdminStackParamList, 'AdminUserDetail'>;

export function AdminUserDetailScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<AdminUserDetailRouteProp>();
  const { userId } = route.params;

  const {
    users,
    isProcessing,
    suspendUser,
    unsuspendUser,
    verifyUser,
    rejectUser,
    deleteUser,
    updateUserRole,
  } = useAdminUsers();
  const { canEditUsers, canApproveUsers, canDeleteUsers, isSuperAdmin } = useAdminPermissions();

  const user = useMemo(() => users.find(u => u.id === userId), [users, userId]);

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle actions
  const handleVerify = useCallback(async () => {
    if (!user) return;
    await verifyUser(user.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [user, verifyUser]);

  const handleReject = useCallback(async (reason?: string) => {
    if (!user || !reason) return;
    await rejectUser(user.id, reason);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowRejectModal(false);
  }, [user, rejectUser]);

  const handleSuspend = useCallback(async (reason?: string) => {
    if (!user || !reason) return;
    await suspendUser(user.id, reason);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuspendModal(false);
  }, [user, suspendUser]);

  const handleUnsuspend = useCallback(async () => {
    if (!user) return;
    await unsuspendUser(user.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [user, unsuspendUser]);

  const handleDelete = useCallback(async () => {
    if (!user) return;
    await deleteUser(user.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowDeleteModal(false);
    navigation.goBack();
  }, [user, deleteUser, navigation]);

  const handleToggleAdmin = useCallback(async () => {
    if (!user) return;
    const newIsAdmin = !user.isAdmin;
    await updateUserRole(user.id, newIsAdmin, newIsAdmin ? 'support' : undefined);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [user, updateUserRole]);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Kullanıcı bulunamadı
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBackground },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kullanıcı Detayı</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.brand[400] }]}>
                <Text style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {user.isAdmin && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#fff" />
              </View>
            )}
          </View>

          <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>

          <View style={styles.badges}>
            <UserStatusBadge status={user.status} />
            <VerificationBadge status={user.verificationStatus} />
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Bilgiler</Text>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
            ]}
          >
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Rol</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user.role === 'organizer' ? 'Organizatör' : user.role === 'provider' ? 'Provider' : 'Her İkisi'}
              </Text>
            </View>

            {user.company && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Şirket</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{user.company}</Text>
              </View>
            )}

            {user.location && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Konum</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{user.location}</Text>
              </View>
            )}

            {user.phone && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Telefon</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{user.phone}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Üyelik Tarihi</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatDate(user.memberSince)}
              </Text>
            </View>

            {user.lastActiveAt && (
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Son Aktiflik</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatDate(user.lastActiveAt)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Section */}
        {user.stats && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>İstatistikler</Text>

            <View style={styles.statsGrid}>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
                ]}
              >
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {user.stats.totalEvents}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Etkinlik</Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
                ]}
              >
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {user.stats.totalOffers}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Teklif</Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
                ]}
              >
                <Text style={[styles.statValue, { color: '#10b981' }]}>
                  {formatCurrency(user.stats.totalRevenue)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Gelir</Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
                ]}
              >
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {user.stats.rating.toFixed(1)}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Puan</Text>
              </View>
            </View>
          </View>
        )}

        {/* Suspend Info */}
        {user.isSuspended && (
          <View style={styles.section}>
            <View
              style={[
                styles.warningCard,
                { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
              ]}
            >
              <Ionicons name="warning" size={20} color="#f59e0b" />
              <View style={styles.warningContent}>
                <Text style={[styles.warningTitle, { color: '#f59e0b' }]}>
                  Kullanıcı Askıda
                </Text>
                {user.suspendReason && (
                  <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                    Sebep: {user.suspendReason}
                  </Text>
                )}
                {user.suspendedAt && (
                  <Text style={[styles.warningDate, { color: colors.textMuted }]}>
                    Tarih: {formatDate(user.suspendedAt)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İşlemler</Text>

          <View style={styles.actionsContainer}>
            {/* Verification Actions */}
            {user.verificationStatus === 'pending' && canApproveUsers && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                  onPress={handleVerify}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Doğrula</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                  onPress={() => setShowRejectModal(true)}
                >
                  <Ionicons name="close-circle" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Reddet</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Suspend/Unsuspend */}
            {canEditUsers && (
              <>
                {user.isSuspended ? (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                    onPress={handleUnsuspend}
                  >
                    <Ionicons name="play-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Askıyı Kaldır</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                    onPress={() => setShowSuspendModal(true)}
                  >
                    <Ionicons name="pause-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Askıya Al</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Admin Toggle */}
            {isSuperAdmin && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: user.isAdmin ? '#6b7280' : '#8b5cf6' },
                ]}
                onPress={handleToggleAdmin}
              >
                <Ionicons name="shield" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>
                  {user.isAdmin ? 'Admin Yetkisini Kaldır' : 'Admin Yap'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Delete */}
            {canDeleteUsers && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => setShowDeleteModal(true)}
              >
                <Ionicons name="trash" size={20} color="#ef4444" />
                <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Sil</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      <ActionModal
        visible={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={handleSuspend}
        title="Kullanıcıyı Askıya Al"
        message={`${user.name} adlı kullanıcıyı askıya almak istediğinize emin misiniz?`}
        confirmLabel="Askıya Al"
        icon="pause-circle"
        iconColor="#f59e0b"
        requireReason
        reasonPlaceholder="Askıya alma sebebini yazın..."
        isLoading={isProcessing}
      />

      <ActionModal
        visible={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Doğrulamayı Reddet"
        message={`${user.name} adlı kullanıcının doğrulamasını reddetmek istediğinize emin misiniz?`}
        confirmLabel="Reddet"
        icon="close-circle"
        iconColor="#ef4444"
        requireReason
        reasonPlaceholder="Red sebebini yazın..."
        isDestructive
        isLoading={isProcessing}
      />

      <ActionModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Kullanıcıyı Sil"
        message={`${user.name} adlı kullanıcıyı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  warningCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 13,
    marginTop: 4,
  },
  warningDate: {
    fontSize: 12,
    marginTop: 4,
  },
  actionsContainer: {
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
});

export default AdminUserDetailScreen;
