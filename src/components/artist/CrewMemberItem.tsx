import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { CrewMember, crewRoleLabels } from '../../data/provider/artistData';

interface CrewMemberItemProps {
  member: CrewMember;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export default function CrewMemberItem({
  member,
  onPress,
  onEdit,
  onDelete,
  compact = false,
}: CrewMemberItemProps) {
  const { colors } = useTheme();

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

  const roleLabel = crewRoleLabels[member.role] || member.role;

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {member.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.compactInfo}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {member.name}
          </Text>
          <Text style={[styles.role, { color: colors.textSecondary }]}>
            {roleLabel}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity
        style={styles.mainContent}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {member.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>
            {member.name}
          </Text>
          <Text style={[styles.role, { color: colors.textSecondary }]}>
            {roleLabel}
          </Text>
          {member.notes && (
            <Text
              style={[styles.notes, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {member.notes}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        {member.phone && (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.background }]}
            onPress={handleCall}
          >
            <Ionicons name="call-outline" size={18} color="#10B981" />
          </TouchableOpacity>
        )}
        {member.email && (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.background }]}
            onPress={handleEmail}
          >
            <Ionicons name="mail-outline" size={18} color="#6366F1" />
          </TouchableOpacity>
        )}
        {onEdit && (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.background }]}
            onPress={onEdit}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.background }]}
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
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
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 140,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  info: {
    flex: 1,
  },
  compactInfo: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  role: {
    fontSize: 13,
  },
  notes: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
