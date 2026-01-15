import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { OfferTabType } from '../../data/offersData';

interface OfferTabsProps {
  activeTab: OfferTabType;
  onTabChange: (tab: OfferTabType) => void;
  stats: {
    active: number;
    accepted: number;
    rejected: number;
    drafts?: number;
  };
  showDrafts?: boolean;
}

export function OfferTabs({ activeTab, onTabChange, stats, showDrafts = false }: OfferTabsProps) {
  const { colors, isDark } = useTheme();

  const baseTabs: { key: OfferTabType; label: string; colorKey: 'brand' | 'success' | 'error' | 'warning' }[] = [
    { key: 'active', label: 'Aktif', colorKey: 'brand' },
    { key: 'accepted', label: 'Onaylanan', colorKey: 'success' },
    { key: 'rejected', label: 'Reddedilen', colorKey: 'error' },
  ];

  const tabs = showDrafts && stats.drafts !== undefined
    ? [...baseTabs, { key: 'drafts' as OfferTabType, label: 'Taslaklar', colorKey: 'warning' as const }]
    : baseTabs;

  const getTabColor = (colorKey: string, isActive: boolean) => {
    if (!isActive) return colors.textMuted;
    switch (colorKey) {
      case 'brand': return colors.brand[400];
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      default: return colors.textMuted;
    }
  };

  const getTabCount = (key: OfferTabType) => {
    if (key === 'drafts') return stats.drafts || 0;
    return stats[key as keyof typeof stats] as number;
  };

  return (
    <View style={[styles.tabContainer, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          const tabColor = getTabColor(tab.colorKey, isActive);

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => onTabChange(tab.key)}
            >
              <Text style={[styles.tabText, { color: tabColor }]}>
                {tab.label} ({getTabCount(tab.key)})
              </Text>
              {isActive && <View style={[styles.tabIndicator, { backgroundColor: tabColor }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  tabContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 1,
  },
});
