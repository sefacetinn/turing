import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import {
  CrewMember,
  crewRoleLabels,
  roleCategoryLabels,
  roleCategoryIcons,
  feeTypeLabels,
  crewMemberStatusLabels,
  formatCurrency,
} from '../../data/provider/artistData';

interface TeamMemberCardProps {
  member: CrewMember;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showFee?: boolean;
  showStatus?: boolean;
  showCategory?: boolean;
  compact?: boolean;
}

export default function TeamMemberCard({
  member,
  onPress,
  onEdit,
  onDelete,
  showFee = true,
  showStatus = true,
  showCategory = false,
  compact = false,
}: TeamMemberCardProps) {
  const { colors, isDark } = useTheme();

  const handleCall = () => {
    if (member.phone) {
      Linking.openURL(`tel:${member.phone}`);
    }
  };

  const handleEmail = () => {
    if (member.email) {
      Linking.openURL(`mailto:${member.email}`);
    }
  };

  const getStatusColor = () => {
    switch (member.status) {
      case 'active':
        return '#10B981';
      case 'inactive':
        return '#6B7280';
      case 'on_leave':
        return '#F59E0B';
      default:
        return colors.textMuted;
    }
  };

  const getCategoryColor = () => {
    switch (member.roleCategory) {
      case 'musician':
        return '#8B5CF6';
      case 'technical':
        return '#3B82F6';
      case 'management':
        return '#10B981';
      case 'other':
        return '#F59E0B';
      default:
        return colors.textMuted;
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: colors.brand[400] + '20' }]}>
          <Text style={[styles.avatarText, { color: colors.brand[400] }]}>
            {member.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.compactInfo}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {member.name}
          </Text>
          <Text style={[styles.role, { color: colors.textMuted }]}>
            {crewRoleLabels[member.role]}
          </Text>
        </View>
        {showStatus && (
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
      onLongPress={onDelete}
      activeOpacity={0.7}
    >
      <View style={styles.mainContent}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: colors.brand[400] + '20' }]}>
          <Text style={[styles.avatarText, { color: colors.brand[400] }]}>
            {member.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]}>{member.name}</Text>
            {showStatus && (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {crewMemberStatusLabels[member.status]}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.roleRow}>
            {showCategory && (
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() + '15' }]}>
                <Ionicons
                  name={roleCategoryIcons[member.roleCategory] as any}
                  size={12}
                  color={getCategoryColor()}
                />
                <Text style={[styles.categoryText, { color: getCategoryColor() }]}>
                  {roleCategoryLabels[member.roleCategory]}
                </Text>
              </View>
            )}
            <Text style={[styles.role, { color: colors.textMuted }]}>
              {crewRoleLabels[member.role]}
            </Text>
          </View>

          {member.notes && (
            <Text style={[styles.notes, { color: colors.textSecondary }]} numberOfLines={1}>
              {member.notes}
            </Text>
          )}

          {/* Contact Info */}
          <View style={styles.contactRow}>
            {member.phone && (
              <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                <Ionicons name="call-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.contactText, { color: colors.textMuted }]} numberOfLines={1}>
                  {member.phone}
                </Text>
              </TouchableOpacity>
            )}
            {member.email && (
              <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.contactText, { color: colors.textMuted }]} numberOfLines={1}>
                  {member.email}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Fee & Actions */}
      <View style={styles.rightSection}>
        {showFee && (
          <View style={styles.feeContainer}>
            <Text style={[styles.fee, { color: colors.success }]}>
              {formatCurrency(member.defaultFee)}
            </Text>
            <Text style={[styles.feeType, { color: colors.textMuted }]}>
              {feeTypeLabels[member.feeType]}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {member.phone && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10B981' + '15' }]}
              onPress={handleCall}
            >
              <Ionicons name="call-outline" size={16} color="#10B981" />
            </TouchableOpacity>
          )}
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.brand[400] + '15' }]}
              onPress={onEdit}
            >
              <Ionicons name="create-outline" size={16} color={colors.brand[400]} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#EF4444' + '15' }]}
              onPress={onDelete}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 150,
  },
  mainContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  compactInfo: {
    flex: 1,
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  role: {
    fontSize: 13,
  },
  notes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 12,
    maxWidth: 120,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  feeContainer: {
    alignItems: 'flex-start',
  },
  fee: {
    fontSize: 16,
    fontWeight: '700',
  },
  feeType: {
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
