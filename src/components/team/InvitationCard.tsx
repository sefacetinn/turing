import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { RoleBadge } from './RoleBadge';
import { getTimeAgo } from '../../data/mockTeamData';
import type { Invitation } from '../../types/rbac';

interface InvitationCardProps {
  invitation: Invitation;
  onCancel?: () => void;
  onResend?: () => void;
}

export function InvitationCard({ invitation, onCancel, onResend }: InvitationCardProps) {
  const { colors, isDark } = useTheme();

  const isExpiringSoon = () => {
    const expiresAt = new Date(invitation.expiresAt);
    const now = new Date();
    const diffDays = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  };

  const getExpiryText = () => {
    const expiresAt = new Date(invitation.expiresAt);
    const now = new Date();
    const diffDays = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Süresi doldu';
    if (diffDays === 1) return '1 gün kaldı';
    return `${diffDays} gün kaldı`;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
          borderColor: isDark ? 'transparent' : '#e5e7eb',
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)' },
          ]}
        >
          <Ionicons name="mail-outline" size={20} color="#6366f1" />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.email, { color: colors.text }]} numberOfLines={1}>
          {invitation.email}
        </Text>
        {invitation.name && (
          <Text style={[styles.name, { color: colors.textMuted }]} numberOfLines={1}>
            {invitation.name}
          </Text>
        )}

        <View style={styles.infoRow}>
          <RoleBadge role={invitation.role} size="small" />
          <View style={styles.dateInfo}>
            <Text style={[styles.dateText, { color: colors.textMuted }]}>
              Davet: {getTimeAgo(invitation.invitedAt)}
            </Text>
            <Text
              style={[
                styles.expiryText,
                { color: isExpiringSoon() ? '#f59e0b' : colors.textMuted },
              ]}
            >
              {getExpiryText()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {onResend && (
          <TouchableOpacity
            style={[styles.actionButton, styles.resendButton]}
            onPress={onResend}
          >
            <Ionicons name="refresh-outline" size={18} color="#6366f1" />
          </TouchableOpacity>
        )}
        {onCancel && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={onCancel}
          >
            <Ionicons name="close-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  email: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInfo: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 10,
  },
  expiryText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  cancelButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
});

export default InvitationCard;
