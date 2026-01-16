/**
 * ModuleCard - Modül Kartı Bileşeni
 *
 * Tüm modüller için ortak kart yapısı.
 */

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';

interface ModuleCardProps {
  children: ReactNode;
  title?: string;
  icon?: string;
  iconColor?: string;
  collapsed?: boolean;
  collapsible?: boolean;
  onToggleCollapse?: () => void;
  rightAction?: ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  noBorder?: boolean;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  children,
  title,
  icon,
  iconColor = '#6366F1',
  collapsed = false,
  collapsible = false,
  onToggleCollapse,
  rightAction,
  style,
  noPadding = false,
  noBorder = false,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#18181B' : '#FFFFFF',
          borderColor: noBorder ? 'transparent' : (isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'),
        },
        noPadding && styles.noPadding,
        style,
      ]}
    >
      {title && (
        <TouchableOpacity
          style={styles.header}
          onPress={collapsible ? onToggleCollapse : undefined}
          disabled={!collapsible}
          activeOpacity={collapsible ? 0.7 : 1}
        >
          <View style={styles.headerLeft}>
            {icon && (
              <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                <Ionicons name={icon as any} size={16} color={iconColor} />
              </View>
            )}
            <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
          </View>
          <View style={styles.headerRight}>
            {rightAction}
            {collapsible && (
              <Ionicons
                name={collapsed ? 'chevron-down' : 'chevron-up'}
                size={18}
                color={colors.textSecondary}
                style={styles.collapseIcon}
              />
            )}
          </View>
        </TouchableOpacity>
      )}

      {!collapsed && (
        <View style={[styles.content, !title && styles.contentNoHeader]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  noPadding: {
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  collapseIcon: {
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentNoHeader: {
    paddingTop: 16,
  },
});

export default ModuleCard;
