import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { useAdminEvents } from '../../hooks/useAdminEvents';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { ActionModal } from '../../components/admin/ActionModal';
import type { AdminStackParamList } from '../../types/admin';

type AdminEventDetailRouteProp = RouteProp<AdminStackParamList, 'AdminEventDetail'>;

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Bekliyor', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
  approved: { label: 'Onaylı', bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
  rejected: { label: 'Reddedildi', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
};

export function AdminEventDetailScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<AdminEventDetailRouteProp>();
  const { eventId } = route.params;

  const {
    events,
    isProcessing,
    approveEvent,
    rejectEvent,
    flagEvent,
    unflagEvent,
    deleteEvent,
  } = useAdminEvents();
  const { canApproveEvents, canDeleteEvents } = useAdminPermissions();

  const event = useMemo(() => events.find(e => e.id === eventId), [events, eventId]);
  const config = event ? statusConfig[event.approvalStatus] || statusConfig.pending : statusConfig.pending;

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
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
  const handleApprove = useCallback(async () => {
    if (!event) return;
    await approveEvent(event.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [event, approveEvent]);

  const handleReject = useCallback(async (reason?: string) => {
    if (!event || !reason) return;
    await rejectEvent(event.id, reason);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowRejectModal(false);
  }, [event, rejectEvent]);

  const handleFlag = useCallback(async (reason?: string) => {
    if (!event || !reason) return;
    await flagEvent(event.id, reason);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowFlagModal(false);
  }, [event, flagEvent]);

  const handleUnflag = useCallback(async () => {
    if (!event) return;
    await unflagEvent(event.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [event, unflagEvent]);

  const handleDelete = useCallback(async () => {
    if (!event) return;
    await deleteEvent(event.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowDeleteModal(false);
    navigation.goBack();
  }, [event, deleteEvent, navigation]);

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Etkinlik bulunamadı
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Etkinlik Detayı</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={styles.titleRow}>
            <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
            {event.isFlagged && (
              <View style={styles.flagIcon}>
                <Ionicons name="flag" size={18} color="#ef4444" />
              </View>
            )}
          </View>

          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
          </View>
        </View>

        {/* Event Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Etkinlik Bilgileri</Text>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
            ]}
          >
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Tarih & Saat</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatDate(event.date)} - {event.time}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={18} color={colors.textMuted} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Mekan</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{event.venue}</Text>
                <Text style={[styles.infoSubtext, { color: colors.textSecondary }]}>
                  {event.district}, {event.city}
                </Text>
              </View>
            </View>

            {event.budget && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="wallet-outline" size={18} color={colors.textMuted} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Bütçe</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {formatCurrency(event.budget)}
                  </Text>
                </View>
              </View>
            )}

            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <View style={styles.infoIcon}>
                <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Oluşturulma</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatDate(event.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Organizer Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Organizatör</Text>

          <TouchableOpacity
            style={[
              styles.organizerCard,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
            ]}
          >
            <View style={[styles.organizerAvatar, { backgroundColor: colors.brand[400] }]}>
              <Text style={styles.organizerInitial}>
                {event.organizerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.organizerInfo}>
              <Text style={[styles.organizerName, { color: colors.text }]}>
                {event.organizerName}
              </Text>
              <Text style={[styles.organizerLink, { color: colors.brand[400] }]}>
                Profili görüntüle
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Flag Info */}
        {event.isFlagged && (
          <View style={styles.section}>
            <View
              style={[
                styles.warningCard,
                { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
              ]}
            >
              <Ionicons name="warning" size={20} color="#ef4444" />
              <View style={styles.warningContent}>
                <Text style={[styles.warningTitle, { color: '#ef4444' }]}>
                  Etkinlik İşaretli
                </Text>
                {event.flagReason && (
                  <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                    Sebep: {event.flagReason}
                  </Text>
                )}
                {event.flaggedAt && (
                  <Text style={[styles.warningDate, { color: colors.textMuted }]}>
                    Tarih: {formatDate(event.flaggedAt)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Rejection Info */}
        {event.approvalStatus === 'rejected' && event.rejectionReason && (
          <View style={styles.section}>
            <View
              style={[
                styles.warningCard,
                { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
              ]}
            >
              <Ionicons name="close-circle" size={20} color="#ef4444" />
              <View style={styles.warningContent}>
                <Text style={[styles.warningTitle, { color: '#ef4444' }]}>
                  Etkinlik Reddedildi
                </Text>
                <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                  Sebep: {event.rejectionReason}
                </Text>
                {event.rejectedAt && (
                  <Text style={[styles.warningDate, { color: colors.textMuted }]}>
                    Tarih: {formatDate(event.rejectedAt)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Approval Info */}
        {event.approvalStatus === 'approved' && event.approvedAt && (
          <View style={styles.section}>
            <View
              style={[
                styles.successCard,
                { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
              ]}
            >
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <View style={styles.warningContent}>
                <Text style={[styles.successTitle, { color: '#10b981' }]}>
                  Etkinlik Onaylandı
                </Text>
                <Text style={[styles.warningDate, { color: colors.textMuted }]}>
                  Tarih: {formatDate(event.approvedAt)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İşlemler</Text>

          <View style={styles.actionsContainer}>
            {/* Pending Actions */}
            {event.approvalStatus === 'pending' && canApproveEvents && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                  onPress={handleApprove}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Onayla</Text>
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

            {/* Flag/Unflag */}
            {canApproveEvents && (
              <>
                {event.isFlagged ? (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                    onPress={handleUnflag}
                  >
                    <Ionicons name="flag-outline" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>İşareti Kaldır</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                    onPress={() => setShowFlagModal(true)}
                  >
                    <Ionicons name="flag" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>İşaretle</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Delete */}
            {canDeleteEvents && (
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
        visible={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Etkinliği Reddet"
        message={`"${event.title}" etkinliğini reddetmek istediğinize emin misiniz?`}
        confirmLabel="Reddet"
        icon="close-circle"
        iconColor="#ef4444"
        requireReason
        reasonPlaceholder="Red sebebini yazın..."
        isDestructive
        isLoading={isProcessing}
      />

      <ActionModal
        visible={showFlagModal}
        onClose={() => setShowFlagModal(false)}
        onConfirm={handleFlag}
        title="Etkinliği İşaretle"
        message={`"${event.title}" etkinliğini moderasyon için işaretlemek istediğinize emin misiniz?`}
        confirmLabel="İşaretle"
        icon="flag"
        iconColor="#f59e0b"
        requireReason
        reasonPlaceholder="İşaretleme sebebini yazın..."
        isLoading={isProcessing}
      />

      <ActionModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Etkinliği Sil"
        message={`"${event.title}" etkinliğini kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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
  eventHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  flagIcon: {
    padding: 2,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
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
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  infoIcon: {
    width: 32,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoSubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  organizerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  organizerInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  organizerLink: {
    fontSize: 13,
    marginTop: 2,
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
  successCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '600',
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

export default AdminEventDetailScreen;
