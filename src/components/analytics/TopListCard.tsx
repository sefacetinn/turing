import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OptimizedImage } from '../OptimizedImage';
import { useTheme } from '../../theme/ThemeContext';
import { TopClientData, TopProviderData, formatCompactCurrency } from '../../data/analyticsData';

interface TopListCardProps {
  title: string;
  data: (TopClientData | TopProviderData)[];
  type: 'client' | 'provider';
  onSeeAll?: () => void;
  onItemPress?: (item: TopClientData | TopProviderData) => void;
}

export function TopListCard({ title, data, type, onSeeAll, onItemPress }: TopListCardProps) {
  const { colors, isDark } = useTheme();

  const accentColor = colors.brand[400];

  const isProvider = (item: TopClientData | TopProviderData): item is TopProviderData => {
    return 'category' in item;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={[styles.seeAll, { color: accentColor }]}>Tümü</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.card,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
            ]}
            onPress={() => onItemPress?.(item)}
            activeOpacity={0.7}
          >
            <OptimizedImage
              source={item.logo || 'https://via.placeholder.com/48'}
              style={styles.logo}
            />
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            {isProvider(item) && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={[styles.rating, { color: colors.textSecondary }]}>
                  {item.rating.toFixed(1)}
                </Text>
              </View>
            )}
            <Text style={[styles.revenue, { color: accentColor }]}>
              {formatCompactCurrency(type === 'client' ? (item as TopClientData).totalRevenue : (item as TopProviderData).totalSpent)}
            </Text>
            <Text style={[styles.jobs, { color: colors.textMuted }]}>
              {item.jobCount} {type === 'provider' ? 'etkinlik' : 'iş'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    width: 120,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 10,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  rating: {
    fontSize: 11,
    fontWeight: '500',
  },
  revenue: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  jobs: {
    fontSize: 11,
  },
});
