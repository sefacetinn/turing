import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { getCategoryGradient, enhancedOffers, getQuoteRequestById } from '../data/offersData';
import {
  calculateOfferScores,
  getBestInCategories,
  formatPrice,
  sortOffers,
} from '../utils/offerUtils';
import { defaultComparisonCriteria } from '../types/comparison';
import type { EnhancedOffer, OfferSortOption } from '../types/comparison';
import type { CompareOffersRouteProp, OffersStackNavigationProp } from '../types';

export function CompareOffersScreen() {
  const navigation = useNavigation<OffersStackNavigationProp>();
  const route = useRoute<CompareOffersRouteProp>();
  const { colors, isDark } = useTheme();

  const { quoteRequestId } = route.params;
  const [sortBy, setSortBy] = useState<OfferSortOption>('score');
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  const accentColor = colors.brand[400];

  // Get quote request and offers
  const quoteRequest = useMemo(
    () => getQuoteRequestById(quoteRequestId),
    [quoteRequestId]
  );

  const offers = useMemo(() => {
    const filtered = enhancedOffers.filter(
      (o) => o.quoteRequestId === quoteRequestId
    );
    const scored = calculateOfferScores(filtered, defaultComparisonCriteria);
    return sortOffers(scored, sortBy);
  }, [quoteRequestId, sortBy]);

  const bestInCategory = useMemo(() => getBestInCategories(offers), [offers]);

  const recommendedOffer = useMemo(() => {
    return offers.reduce((best, current) =>
      (current.overallScore || 0) > (best.overallScore || 0) ? current : best
    );
  }, [offers]);

  const categoryGradient = getCategoryGradient(quoteRequest?.category as string || 'technical');

  const sortOptions: { key: OfferSortOption; label: string; icon: string }[] = [
    { key: 'score', label: 'Önerilen', icon: 'sparkles' },
    { key: 'price', label: 'Fiyat', icon: 'cash-outline' },
    { key: 'rating', label: 'Puan', icon: 'star' },
    { key: 'delivery', label: 'Teslim', icon: 'time-outline' },
  ];

  const handleSelectOffer = (offerId: string) => {
    setSelectedOfferId(offerId);
  };

  const handleOfferDetail = (offerId: string) => {
    navigation.navigate('OfferDetail', { offerId });
  };

  const handleAcceptSelected = () => {
    if (!selectedOfferId) return;

    const selectedOffer = offers.find((o) => o.id === selectedOfferId);
    if (!selectedOffer) return;

    Alert.alert(
      'Teklifi Kabul Et',
      `${selectedOffer.provider.name} firmasının ${formatPrice(selectedOffer.amount)} teklifini kabul etmek istediğinize emin misiniz?\n\nDiğer ${offers.length - 1} teklif otomatik olarak reddedilecek.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kabul Et',
          onPress: () => {
            navigation.navigate('Contract', { contractId: selectedOfferId });
          },
        },
      ]
    );
  };

  const isBest = (offerId: string, category: 'price' | 'rating' | 'delivery' | 'reviews') => {
    return bestInCategory[category] === offerId;
  };

  const getCriteriaValue = (offer: EnhancedOffer, criterionId: string): string | boolean => {
    switch (criterionId) {
      case 'price':
        return formatPrice(offer.amount);
      case 'rating':
        return offer.provider.rating.toFixed(1);
      case 'reviews':
        return offer.provider.reviewCount.toString();
      case 'verified':
        return offer.provider.verified;
      case 'delivery':
        return offer.deliveryTime;
      case 'experience':
        return `${offer.provider.completedJobs} iş`;
      default:
        return '-';
    }
  };

  if (!quoteRequest) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Teklif talebi bulunamadı</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Teklifleri Karşılaştır</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Service Info */}
      <View style={[styles.serviceInfo, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa', borderWidth: isDark ? 0 : 1, borderColor: isDark ? 'transparent' : '#e5e7eb' }]}>
        <LinearGradient
          colors={categoryGradient}
          style={styles.categoryBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <View style={styles.serviceContent}>
          <Text style={[styles.serviceName, { color: colors.text }]}>{quoteRequest.serviceName}</Text>
          <Text style={[styles.eventTitle, { color: colors.textMuted }]}>{quoteRequest.eventTitle}</Text>
          <Text style={[styles.budget, { color: colors.textSecondary }]}>Bütçe: {quoteRequest.budget}</Text>
        </View>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortButton,
                sortBy === option.key && { backgroundColor: accentColor },
              ]}
              onPress={() => setSortBy(option.key)}
            >
              <Ionicons
                name={option.icon as any}
                size={14}
                color={sortBy === option.key ? 'white' : colors.textMuted}
              />
              <Text
                style={[
                  styles.sortButtonText,
                  { color: sortBy === option.key ? 'white' : colors.textMuted },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Comparison Table */}
      <ScrollView style={styles.tableContainer} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Provider Headers */}
            <View style={styles.headerRow}>
              <View style={[styles.criteriaCell, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8f9fa' }]}>
                <Text style={[styles.criteriaLabel, { color: colors.textMuted }]}>Kriter</Text>
              </View>
              {offers.map((offer) => (
                <View
                  key={offer.id}
                  style={[
                    styles.providerCell,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8f9fa',
                      borderColor: selectedOfferId === offer.id ? accentColor : 'transparent',
                      borderWidth: selectedOfferId === offer.id ? 2 : 0,
                    },
                  ]}
                >
                  {offer.id === recommendedOffer.id && (
                    <View style={[styles.recommendedBadge, { backgroundColor: '#10b981' }]}>
                      <Ionicons name="sparkles" size={10} color="white" />
                      <Text style={styles.recommendedText}>Önerilen</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => handleOfferDetail(offer.id)}>
                    <Image source={{ uri: offer.provider.image }} style={styles.providerImage} />
                    {offer.provider.verified && (
                      <View style={[styles.verifiedIcon, { backgroundColor: colors.background }]}>
                        <Ionicons name="checkmark-circle" size={14} color={accentColor} />
                      </View>
                    )}
                  </TouchableOpacity>
                  <Text style={[styles.providerName, { color: colors.text }]} numberOfLines={1}>
                    {offer.provider.name}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.selectRadio,
                      {
                        borderColor: selectedOfferId === offer.id ? accentColor : colors.textMuted,
                        backgroundColor: selectedOfferId === offer.id ? accentColor : 'transparent',
                      },
                    ]}
                    onPress={() => handleSelectOffer(offer.id)}
                  >
                    {selectedOfferId === offer.id && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Criteria Rows */}
            {defaultComparisonCriteria.map((criterion) => (
              <View key={criterion.id} style={styles.dataRow}>
                <View style={[styles.criteriaCell, { backgroundColor: isDark ? 'rgba(255,255,255,0.01)' : 'white' }]}>
                  <Ionicons name={criterion.icon as any} size={14} color={colors.textMuted} />
                  <Text style={[styles.criteriaText, { color: colors.textSecondary }]}>{criterion.label}</Text>
                </View>
                {offers.map((offer) => {
                  const value = getCriteriaValue(offer, criterion.id);
                  const isBestValue = criterion.id !== 'verified' && isBest(
                    offer.id,
                    criterion.id as 'price' | 'rating' | 'delivery' | 'reviews'
                  );

                  return (
                    <View
                      key={offer.id}
                      style={[
                        styles.valueCell,
                        {
                          backgroundColor: isBestValue
                            ? isDark
                              ? 'rgba(75, 48, 184, 0.15)'
                              : 'rgba(75, 48, 184, 0.08)'
                            : isDark
                              ? 'rgba(255,255,255,0.01)'
                              : 'white',
                        },
                      ]}
                    >
                      {criterion.type === 'boolean' ? (
                        <Ionicons
                          name={value ? 'checkmark-circle' : 'close-circle'}
                          size={18}
                          color={value ? '#10b981' : colors.textMuted}
                        />
                      ) : (
                        <Text
                          style={[
                            styles.valueText,
                            { color: isBestValue ? accentColor : colors.text },
                            isBestValue && styles.valueBest,
                          ]}
                        >
                          {value as string}
                        </Text>
                      )}
                      {isBestValue && (
                        <Ionicons name="star" size={10} color={accentColor} style={styles.bestIcon} />
                      )}
                    </View>
                  );
                })}
              </View>
            ))}

            {/* Overall Score Row */}
            <View style={[styles.dataRow, styles.scoreRow]}>
              <View style={[styles.criteriaCell, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f0f0' }]}>
                <Ionicons name="trophy" size={14} color={accentColor} />
                <Text style={[styles.criteriaText, { color: colors.text, fontWeight: '600' }]}>Toplam Skor</Text>
              </View>
              {offers.map((offer) => (
                <View
                  key={offer.id}
                  style={[
                    styles.valueCell,
                    styles.scoreCell,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f0f0' },
                  ]}
                >
                  <Text style={[styles.scoreValue, { color: accentColor }]}>
                    {offer.overallScore || 0}
                  </Text>
                  <Text style={[styles.scoreMax, { color: colors.textMuted }]}>/100</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Spacer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Accept Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.acceptButton,
            { backgroundColor: selectedOfferId ? accentColor : colors.textMuted },
          ]}
          onPress={handleAcceptSelected}
          disabled={!selectedOfferId}
        >
          <Text style={styles.acceptButtonText}>
            {selectedOfferId ? 'Seçili Teklifi Kabul Et' : 'Bir Teklif Seçin'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  serviceInfo: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  categoryBar: {
    height: 4,
  },
  serviceContent: {
    padding: 14,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  budget: {
    fontSize: 12,
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tableContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
  },
  dataRow: {
    flexDirection: 'row',
  },
  scoreRow: {
    marginTop: 8,
  },
  criteriaCell: {
    width: 100,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
  },
  criteriaLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  criteriaText: {
    fontSize: 12,
  },
  providerCell: {
    width: 120,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recommendedText: {
    fontSize: 9,
    fontWeight: '600',
    color: 'white',
  },
  providerImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginTop: 16,
    marginBottom: 8,
  },
  verifiedIcon: {
    position: 'absolute',
    top: 52,
    right: 32,
    borderRadius: 10,
  },
  providerName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  valueCell: {
    width: 120,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  valueText: {
    fontSize: 13,
  },
  valueBest: {
    fontWeight: '600',
  },
  bestIcon: {
    marginLeft: 2,
  },
  scoreCell: {
    borderRadius: 8,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
  },
  acceptButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
