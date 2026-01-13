import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { OfferTabType } from '../../data/offersData';

interface OfferTabsProps {
  activeTab: OfferTabType;
  onTabChange: (tab: OfferTabType) => void;
  stats: {
    active: number;
    accepted: number;
    rejected: number;
  };
}

export function OfferTabs({ activeTab, onTabChange, stats }: OfferTabsProps) {
  const { colors } = useTheme();

  const tabs: { key: OfferTabType; label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap; colorKey: 'brand' | 'success' | 'error' }[] = [
    { key: 'active', label: 'Aktif', icon: 'flash-outline', iconActive: 'flash', colorKey: 'brand' },
    { key: 'accepted', label: 'Onaylanan', icon: 'checkmark-circle-outline', iconActive: 'checkmark-circle', colorKey: 'success' },
    { key: 'rejected', label: 'Reddedilen', icon: 'close-circle-outline', iconActive: 'close-circle', colorKey: 'error' },
  ];

  const getTabColor = (colorKey: string, isActive: boolean) => {
    if (!isActive) return colors.textMuted;
    switch (colorKey) {
      case 'brand': return colors.brand[400];
      case 'success': return colors.success;
      case 'error': return colors.error;
      default: return colors.textMuted;
    }
  };

  const getTabCount = (key: OfferTabType) => {
    return stats[key];
  };

  const getBadgeStyle = (colorKey: string, isActive: boolean) => {
    if (!isActive) return { backgroundColor: colors.glassStrong };
    switch (colorKey) {
      case 'brand': return styles.tabBadgeActive;
      case 'success': return styles.tabBadgeAccepted;
      case 'error': return styles.tabBadgeRejected;
      default: return { backgroundColor: colors.glassStrong };
    }
  };

  return (
    <View style={styles.tabContainer}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        const tabColor = getTabColor(tab.colorKey, isActive);

        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder
              },
              isActive && { backgroundColor: colors.glassStrong }
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={14}
              color={tabColor}
            />
            <Text style={[styles.tabText, { color: tabColor }]}>
              {tab.label}
            </Text>
            <View style={[
              styles.tabBadge,
              { backgroundColor: colors.glassStrong },
              getBadgeStyle(tab.colorKey, isActive)
            ]}>
              <Text style={[styles.tabBadgeText, { color: tabColor }]}>
                {getTabCount(tab.key)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
  },
  tabBadgeAccepted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  tabBadgeRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
