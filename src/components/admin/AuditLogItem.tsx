import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import type { AuditLog } from '../../types/admin';

interface AuditLogItemProps {
  log: AuditLog;
  isLast?: boolean;
}

// Map audit actions to icons and colors
const actionConfig: Record<string, { icon: string; color: string; label: string }> = {
  'user.create': { icon: 'person-add', color: '#10b981', label: 'Kullanıcı Oluşturuldu' },
  'user.update': { icon: 'person', color: '#3b82f6', label: 'Kullanıcı Güncellendi' },
  'user.suspend': { icon: 'pause-circle', color: '#f59e0b', label: 'Kullanıcı Askıya Alındı' },
  'user.unsuspend': { icon: 'play-circle', color: '#10b981', label: 'Askı Kaldırıldı' },
  'user.ban': { icon: 'ban', color: '#ef4444', label: 'Kullanıcı Yasaklandı' },
  'user.verify': { icon: 'checkmark-circle', color: '#10b981', label: 'Kullanıcı Doğrulandı' },
  'user.reject': { icon: 'close-circle', color: '#ef4444', label: 'Doğrulama Reddedildi' },
  'user.delete': { icon: 'trash', color: '#ef4444', label: 'Kullanıcı Silindi' },
  'user.role_change': { icon: 'key', color: '#8b5cf6', label: 'Rol Değiştirildi' },
  'event.approve': { icon: 'checkmark-circle', color: '#10b981', label: 'Etkinlik Onaylandı' },
  'event.reject': { icon: 'close-circle', color: '#ef4444', label: 'Etkinlik Reddedildi' },
  'event.flag': { icon: 'flag', color: '#f59e0b', label: 'Etkinlik İşaretlendi' },
  'event.unflag': { icon: 'flag-outline', color: '#10b981', label: 'İşaret Kaldırıldı' },
  'event.delete': { icon: 'trash', color: '#ef4444', label: 'Etkinlik Silindi' },
  'payout.process': { icon: 'time', color: '#3b82f6', label: 'Ödeme İşleniyor' },
  'payout.complete': { icon: 'checkmark-circle', color: '#10b981', label: 'Ödeme Tamamlandı' },
  'payout.fail': { icon: 'alert-circle', color: '#ef4444', label: 'Ödeme Başarısız' },
  'payout.cancel': { icon: 'close-circle', color: '#f59e0b', label: 'Ödeme İptal Edildi' },
  'role.create': { icon: 'add-circle', color: '#10b981', label: 'Rol Oluşturuldu' },
  'role.update': { icon: 'create', color: '#3b82f6', label: 'Rol Güncellendi' },
  'role.delete': { icon: 'trash', color: '#ef4444', label: 'Rol Silindi' },
  'settings.update': { icon: 'settings', color: '#6366f1', label: 'Ayarlar Güncellendi' },
};

export function AuditLogItem({ log, isLast = false }: AuditLogItemProps) {
  const { colors, isDark } = useTheme();

  const config = actionConfig[log.action] || {
    icon: 'ellipse',
    color: colors.textMuted,
    label: log.action,
  };

  // Format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Bugün ${time}`;
    if (isYesterday) return `Dün ${time}`;
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View
      style={[
        styles.container,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
        <Ionicons name={config.icon as any} size={18} color={config.color} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.action, { color: colors.text }]}>{config.label}</Text>

        {log.targetName && (
          <Text style={[styles.target, { color: colors.textSecondary }]}>
            {log.targetName}
          </Text>
        )}

        {log.description && (
          <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
            {log.description}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={[styles.admin, { color: colors.textMuted }]}>
            {log.adminName}
          </Text>
          <Text style={[styles.separator, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatDate(log.timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
  },
  target: {
    fontSize: 13,
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  admin: {
    fontSize: 11,
    fontWeight: '500',
  },
  separator: {
    fontSize: 11,
  },
  time: {
    fontSize: 11,
  },
});

export default AuditLogItem;
