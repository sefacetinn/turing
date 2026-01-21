import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import type { AdminEvent } from '../../types/admin';

interface EventModerationCardProps {
  event: AdminEvent;
  onPress?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onFlag?: () => void;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Bekliyor', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
  approved: { label: 'Onaylı', bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
  rejected: { label: 'Reddedildi', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
};

export function EventModerationCard({
  event,
  onPress,
  onApprove,
  onReject,
  onFlag,
}: EventModerationCardProps) {
  const { colors, isDark } = useTheme();
  const config = statusConfig[event.approvalStatus] || statusConfig.pending;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
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

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
        event.isFlagged && styles.flaggedBorder,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {event.title}
          </Text>
          {event.isFlagged && (
            <View style={styles.flagIcon}>
              <Ionicons name="flag" size={14} color="#ef4444" />
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
        </View>
      </View>

      {/* Event Info */}
      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {formatDate(event.date)} - {event.time}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={1}>
            {event.venue}, {event.city}
          </Text>
        </View>
        {event.budget && (
          <View style={styles.infoRow}>
            <Ionicons name="wallet-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Bütçe: {formatCurrency(event.budget)}
            </Text>
          </View>
        )}
      </View>

      {/* Organizer */}
      <View style={styles.organizer}>
        <View style={[styles.organizerAvatar, { backgroundColor: colors.brand[400] }]}>
          <Text style={styles.organizerInitial}>
            {event.organizerName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.organizerName, { color: colors.textMuted }]}>
          {event.organizerName}
        </Text>
      </View>

      {/* Flag Reason */}
      {event.isFlagged && event.flagReason && (
        <View style={[styles.flagReason, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
          <Ionicons name="warning" size={14} color="#ef4444" />
          <Text style={styles.flagReasonText}>{event.flagReason}</Text>
        </View>
      )}

      {/* Actions */}
      {event.approvalStatus === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={onApprove}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Onayla</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={onReject}
          >
            <Ionicons name="close" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Reddet</Text>
          </TouchableOpacity>

          {!event.isFlagged && (
            <TouchableOpacity
              style={[styles.actionButton, styles.flagButton]}
              onPress={onFlag}
            >
              <Ionicons name="flag" size={16} color="#f59e0b" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  flaggedBorder: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  flagIcon: {
    padding: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  info: {
    gap: 6,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
  organizer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  organizerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerInitial: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  organizerName: {
    fontSize: 12,
  },
  flagReason: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  flagReasonText: {
    flex: 1,
    fontSize: 12,
    color: '#ef4444',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  flagButton: {
    flex: 0,
    width: 44,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default EventModerationCard;
