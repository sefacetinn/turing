import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import type { Payout, PayoutStatus } from '../../types/admin';

interface PayoutItemProps {
  payout: Payout;
  onPress?: () => void;
  onProcess?: () => void;
  onComplete?: () => void;
  isLast?: boolean;
}

const statusConfig: Record<PayoutStatus, { label: string; icon: string; bg: string; text: string }> = {
  pending: { label: 'Bekliyor', icon: 'time', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
  processing: { label: 'İşleniyor', icon: 'sync', bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
  completed: { label: 'Tamamlandı', icon: 'checkmark-circle', bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
  failed: { label: 'Başarısız', icon: 'alert-circle', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
  cancelled: { label: 'İptal', icon: 'close-circle', bg: 'rgba(107, 114, 128, 0.15)', text: '#6b7280' },
};

export function PayoutItem({ payout, onPress, onProcess, onComplete, isLast = false }: PayoutItemProps) {
  const { colors, isDark } = useTheme();
  const config = statusConfig[payout.status] || statusConfig.pending;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Provider Avatar */}
      <View style={styles.avatarContainer}>
        {payout.providerImage ? (
          <Image source={{ uri: payout.providerImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.brand[400] }]}>
            <Text style={styles.avatarText}>
              {payout.providerName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.providerName, { color: colors.text }]} numberOfLines={1}>
            {payout.providerName}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon as any} size={12} color={config.text} />
            <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
          </View>
        </View>

        <Text style={[styles.events, { color: colors.textMuted }]} numberOfLines={1}>
          {payout.eventNames.join(', ')}
        </Text>

        <View style={styles.amounts}>
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Tutar</Text>
            <Text style={[styles.amountValue, { color: colors.text }]}>
              {formatCurrency(payout.amount)}
            </Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Komisyon</Text>
            <Text style={[styles.amountValue, { color: '#ef4444' }]}>
              -{formatCurrency(payout.commissionAmount)}
            </Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Net</Text>
            <Text style={[styles.amountValue, styles.netAmount]}>
              {formatCurrency(payout.netAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            Talep: {formatDate(payout.requestedAt)}
          </Text>

          {/* Quick Actions */}
          {payout.status === 'pending' && onProcess && (
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}
              onPress={onProcess}
            >
              <Text style={[styles.quickActionText, { color: '#3b82f6' }]}>İşleme Al</Text>
            </TouchableOpacity>
          )}

          {payout.status === 'processing' && onComplete && (
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}
              onPress={onComplete}
            >
              <Text style={[styles.quickActionText, { color: '#10b981' }]}>Tamamla</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Failure Reason */}
        {payout.status === 'failed' && payout.failureReason && (
          <View style={[styles.failureReason, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Ionicons name="warning" size={12} color="#ef4444" />
            <Text style={styles.failureText}>{payout.failureReason}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 14,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  events: {
    fontSize: 12,
    marginBottom: 8,
  },
  amounts: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  netAmount: {
    color: '#10b981',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 11,
  },
  quickAction: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  failureReason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  failureText: {
    flex: 1,
    fontSize: 11,
    color: '#ef4444',
  },
});

export default PayoutItem;
