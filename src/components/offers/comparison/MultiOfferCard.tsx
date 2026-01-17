import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme/ThemeContext';
import { ProviderOfferTile } from './ProviderOfferTile';
import type { GroupedOffers, EnhancedOffer } from '../../../types/comparison';
import {
  formatPrice,
  formatPriceRange,
  calculateOfferScores,
  getBestInCategories,
  getBadgeText,
} from '../../../utils/offerUtils';
import { defaultComparisonCriteria } from '../../../types/comparison';
import {
  getCategoryGradient,
  getCategoryIcon as getCategoryIconFromHelpers,
} from '../../../utils/categoryHelpers';

interface MultiOfferCardProps {
  groupedOffers: GroupedOffers;
  onOfferPress: (offerId: string) => void;
  onSelectOffer: (offerId: string) => void;
  onCompareAll: () => void;
}

export function MultiOfferCard({
  groupedOffers,
  onOfferPress,
  onSelectOffer,
  onCompareAll,
}: MultiOfferCardProps) {
  const { colors, isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const accentColor = '#4b30b8';
  const categoryGradient = getCategoryGradient(groupedOffers.serviceCategory as string);

  // Calculate scores and find best offers
  const scoredOffers = useMemo(
    () => calculateOfferScores(groupedOffers.offers, defaultComparisonCriteria),
    [groupedOffers.offers]
  );

  const bestInCategory = useMemo(
    () => getBestInCategories(scoredOffers),
    [scoredOffers]
  );

  const recommendedOffer = useMemo(() => {
    return scoredOffers.reduce((best, current) =>
      (current.overallScore || 0) > (best.overallScore || 0) ? current : best
    );
  }, [scoredOffers]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
          borderWidth: isDark ? 0 : 1,
          borderColor: isDark ? 'transparent' : '#e5e7eb',
        },
      ]}
    >
      {/* Category Gradient Bar */}
      <LinearGradient
        colors={categoryGradient}
        style={styles.gradientBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.serviceRow}>
            <Ionicons
              name={getCategoryIconFromHelpers(groupedOffers.serviceCategory as string) as any}
              size={18}
              color={accentColor}
            />
            <Text style={[styles.serviceName, { color: colors.text }]}>
              {groupedOffers.serviceName}
            </Text>
            <View style={[styles.offerCountBadge, { backgroundColor: accentColor }]}>
              <Text style={styles.offerCountText}>{groupedOffers.totalOffers} Teklif</Text>
            </View>
          </View>
          <Text style={[styles.eventTitle, { color: colors.textMuted }]}>
            {groupedOffers.eventTitle}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {/* Summary Row */}
      <View style={[styles.summaryRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Fiyat Aralığı</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatPriceRange(groupedOffers.lowestPrice, groupedOffers.highestPrice)}
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Ort. Puan</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {groupedOffers.avgRating.toFixed(1)}
            </Text>
          </View>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Bütçe</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {groupedOffers.budget}
          </Text>
        </View>
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offersScroll}
          >
            {scoredOffers.map((offer) => (
              <ProviderOfferTile
                key={offer.id}
                offer={offer}
                badge={getBadgeText(offer.id, bestInCategory)}
                isRecommended={offer.id === recommendedOffer.id && !getBadgeText(offer.id, bestInCategory)}
                onPress={() => onOfferPress(offer.id)}
                onSelect={() => onSelectOffer(offer.id)}
              />
            ))}
          </ScrollView>

          {/* Compare All Button */}
          <TouchableOpacity
            style={[styles.compareButton, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }]}
            onPress={onCompareAll}
          >
            <Ionicons name="git-compare-outline" size={16} color={accentColor} />
            <Text style={[styles.compareButtonText, { color: accentColor }]}>
              Hepsini Karşılaştır
            </Text>
            <Ionicons name="chevron-forward" size={16} color={accentColor} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientBar: {
    height: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  headerLeft: {
    flex: 1,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  offerCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  offerCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  eventTitle: {
    fontSize: 13,
    marginLeft: 26,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    alignSelf: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandedContent: {
    paddingBottom: 16,
  },
  offersScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  compareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
