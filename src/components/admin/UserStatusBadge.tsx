import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { UserAccountStatus } from '../../types/admin';

interface UserStatusBadgeProps {
  status: UserAccountStatus;
  size?: 'small' | 'medium';
}

const statusConfig: Record<UserAccountStatus, { label: string; bg: string; text: string }> = {
  active: { label: 'Aktif', bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
  suspended: { label: 'Askıda', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
  banned: { label: 'Yasaklı', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
  pending: { label: 'Beklemede', bg: 'rgba(99, 102, 241, 0.15)', text: '#6366f1' },
};

export function UserStatusBadge({ status, size = 'medium' }: UserStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSmall && styles.badgeSmall,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.text },
          isSmall && styles.textSmall,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
  },
});

export default UserStatusBadge;
