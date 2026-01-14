import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import * as Haptics from 'expo-haptics';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  lightContent?: boolean;
}

export function ScreenHeader({
  title,
  showBack = true,
  onBack,
  rightAction,
  transparent = false,
  lightContent = false,
}: ScreenHeaderProps) {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();

  const handleBack = async () => {
    // Haptic feedback for back button
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const textColor = lightContent ? '#ffffff' : colors.text;
  const iconColor = lightContent ? '#ffffff' : colors.text;

  return (
    <View
      style={[
        styles.header,
        !transparent && {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
        },
      ]}
    >
      {showBack ? (
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: transparent
                ? 'rgba(0,0,0,0.3)'
                : isDark
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.05)',
            },
          ]}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={iconColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text
        style={[styles.title, { color: textColor }]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {rightAction ? (
        <View style={styles.rightAction}>{rightAction}</View>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

// Compact header for detail screens
interface CompactHeaderProps {
  onBack?: () => void;
  rightActions?: React.ReactNode;
  transparent?: boolean;
}

export function CompactHeader({
  onBack,
  rightActions,
  transparent = true,
}: CompactHeaderProps) {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();

  const handleBack = async () => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.compactHeader}>
      <TouchableOpacity
        style={[
          styles.compactButton,
          {
            backgroundColor: transparent
              ? 'rgba(0,0,0,0.4)'
              : isDark
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.05)',
          },
        ]}
        onPress={handleBack}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={22} color="white" />
      </TouchableOpacity>

      {rightActions && (
        <View style={styles.compactRightActions}>{rightActions}</View>
      )}
    </View>
  );
}

// Icon button for header actions
interface HeaderIconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  transparent?: boolean;
}

export function HeaderIconButton({
  icon,
  onPress,
  color = 'white',
  transparent = true,
}: HeaderIconButtonProps) {
  const { colors, isDark } = useTheme();

  const handlePress = async () => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.iconButton,
        {
          backgroundColor: transparent
            ? 'rgba(0,0,0,0.4)'
            : isDark
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(0,0,0,0.05)',
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name={icon} size={20} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  placeholder: {
    width: 40,
  },
  rightAction: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  compactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
