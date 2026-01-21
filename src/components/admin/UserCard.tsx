import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { UserStatusBadge } from './UserStatusBadge';
import { VerificationBadge } from './VerificationBadge';
import type { AdminUser } from '../../types/admin';

interface UserCardProps {
  user: AdminUser;
  onPress?: () => void;
  showChevron?: boolean;
}

// Category labels
const categoryLabels: Record<string, string> = {
  booking: 'Booking',
  technical: 'Teknik',
  accommodation: 'Konaklama',
  venue: 'Mekan',
  transport: 'Ulaşım',
  operation: 'Operasyon',
};

export function UserCard({ user, onPress, showChevron = true }: UserCardProps) {
  const { colors, isDark } = useTheme();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get role label
  const getRoleLabel = () => {
    switch (user.role) {
      case 'organizer':
        return 'Organizatör';
      case 'provider':
        return user.providerCategory
          ? categoryLabels[user.providerCategory] || 'Provider'
          : 'Provider';
      case 'both':
        return 'Organizatör & Provider';
      default:
        return user.role;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Avatar */}
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
            <Ionicons name="shield-checkmark" size={10} color="#fff" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {user.name}
          </Text>
          <View style={styles.badges}>
            <UserStatusBadge status={user.status} size="small" />
          </View>
        </View>

        <Text style={[styles.email, { color: colors.textSecondary }]} numberOfLines={1}>
          {user.email}
        </Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons
              name={user.role === 'organizer' ? 'calendar-outline' : 'briefcase-outline'}
              size={12}
              color={colors.textMuted}
            />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {getRoleLabel()}
            </Text>
          </View>

          {user.company && (
            <View style={styles.metaItem}>
              <Ionicons name="business-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>
                {user.company}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <VerificationBadge status={user.verificationStatus} size="small" />
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {formatDate(user.memberSince)}
          </Text>
        </View>
      </View>

      {/* Chevron */}
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  adminBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  email: {
    fontSize: 13,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 11,
  },
});

export default UserCard;
