import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  onBackPress?: () => void;
}

export function AdminHeader({
  title,
  subtitle,
  showBack = true,
  rightAction,
  onBackPress,
}: AdminHeaderProps) {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        {/* Left - Back Button */}
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity
              style={[
                styles.backButton,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBackground },
              ]}
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center - Title */}
        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right - Action */}
        <View style={styles.right}>
          {rightAction}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
  },
  left: {
    width: 44,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  right: {
    width: 44,
    alignItems: 'flex-end',
  },
});

export default AdminHeader;
