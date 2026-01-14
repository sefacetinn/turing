import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { RoleBadge } from './RoleBadge';
import { getTimeAgo } from '../../data/mockTeamData';
import type { TeamMember } from '../../types/rbac';

interface TeamMemberCardProps {
  member: TeamMember;
  isCurrentUser?: boolean;
  onPress?: () => void;
  showChevron?: boolean;
}

export function TeamMemberCard({
  member,
  isCurrentUser = false,
  onPress,
  showChevron = true,
}: TeamMemberCardProps) {
  const { colors, isDark } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'inactive':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'pending':
        return 'Bekliyor';
      case 'inactive':
        return 'Pasif';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
          borderColor: isDark ? 'transparent' : '#e5e7eb',
        },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.avatarContainer}>
        {member.avatar ? (
          <Image source={{ uri: member.avatar }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' },
            ]}
          >
            <Ionicons name="person" size={24} color={colors.textMuted} />
          </View>
        )}
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(member.status) },
          ]}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {member.name}
          </Text>
          {isCurrentUser && (
            <View style={[styles.youBadge, { backgroundColor: '#6366f1' }]}>
              <Text style={styles.youBadgeText}>Sen</Text>
            </View>
          )}
        </View>

        <Text style={[styles.email, { color: colors.textMuted }]} numberOfLines={1}>
          {member.email}
        </Text>

        <View style={styles.bottomRow}>
          <RoleBadge role={member.role} size="small" />
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: getStatusColor(member.status) }]}>
              {getStatusText(member.status)}
            </Text>
            {member.lastActiveAt && (
              <Text style={[styles.lastActive, { color: colors.textMuted }]}>
                {getTimeAgo(member.lastActiveAt)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {showChevron && onPress && !isCurrentUser && (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      )}
    </TouchableOpacity>
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
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  email: {
    fontSize: 13,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  lastActive: {
    fontSize: 11,
  },
});

export default TeamMemberCard;
