import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { VerificationStatus } from '../../types/admin';

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

const statusConfig: Record<VerificationStatus, { label: string; icon: string; bg: string; text: string }> = {
  verified: { label: 'Doğrulanmış', icon: 'checkmark-circle', bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
  pending: { label: 'Beklemede', icon: 'time', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
  rejected: { label: 'Reddedildi', icon: 'close-circle', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
};

export function VerificationBadge({ status, size = 'medium', showLabel = true }: VerificationBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const isSmall = size === 'small';

  if (!showLabel) {
    return (
      <View style={[styles.iconOnly, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon as any} size={isSmall ? 12 : 14} color={config.text} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSmall && styles.badgeSmall,
      ]}
    >
      <Ionicons name={config.icon as any} size={isSmall ? 12 : 14} color={config.text} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
  },
  iconOnly: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
  },
});

export default VerificationBadge;
