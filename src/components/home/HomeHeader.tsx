import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface HomeHeaderProps {
  userName: string;
  userRole: string;
  userImage: string;
  notificationCount?: number;
  onNotificationPress: () => void;
  onProfilePress?: () => void;
}

export function HomeHeader({
  userName,
  userRole,
  userImage,
  notificationCount = 0,
  onNotificationPress,
  onProfilePress,
}: HomeHeaderProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.profileSection} activeOpacity={0.8} onPress={onProfilePress}>
        <Image
          source={{ uri: userImage }}
          style={[
            styles.avatar,
            { borderColor: isDark ? 'rgba(147, 51, 234, 0.3)' : 'rgba(147, 51, 234, 0.4)' },
          ]}
        />
        <View style={styles.profileInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
          <View style={styles.roleBadge}>
            <View style={[styles.roleDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.roleText, { color: colors.textMuted }]}>{userRole}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.notificationButton,
          {
            backgroundColor: colors.glass,
            borderColor: colors.glassBorder,
          },
        ]}
        onPress={onNotificationPress}
      >
        <Ionicons name="notifications-outline" size={20} color={colors.textMuted} />
        {notificationCount > 0 && (
          <View style={[styles.badge, { borderColor: colors.background }]}>
            <Text style={styles.badgeText}>{notificationCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
  },
  profileInfo: {
    gap: 2,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  roleText: {
    fontSize: 13,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
});
