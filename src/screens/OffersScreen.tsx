import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, RefreshControl, Alert, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { ScrollHeader, LargeTitle } from '../components/navigation';
import { useTheme } from '../theme/ThemeContext';
import {
  OfferTabs,
  OrganizerOfferCard,
  ProviderOfferCard,
  EmptyOfferState,
  MultiOfferCard,
} from '../components/offers';
import {
  OfferTabType,
  OrganizerOffer,
  ProviderOffer,
  organizerOffers,
  providerOffers,
  enhancedOffers,
  quoteRequests,
} from '../data/offersData';
import { groupOffersByService, calculateOfferScores } from '../utils/offerUtils';
import { defaultComparisonCriteria } from '../types/comparison';
import type { OffersStackNavigationProp } from '../types';

interface OffersScreenProps {
  isProviderMode: boolean;
}

type ViewMode = 'grouped' | 'individual';

export function OffersScreen({ isProviderMode }: OffersScreenProps) {
  const navigation = useNavigation<OffersStackNavigationProp>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<OfferTabType>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');

  const scrollY = useSharedValue(0);
  const accentColor = '#6366f1';

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const offers = isProviderMode ? providerOffers : organizerOffers;
    return {
      active: offers.filter(o => o.status === 'pending' || o.status === 'counter_offered').length,
      accepted: offers.filter(o => o.status === 'accepted').length,
      rejected: offers.filter(o => o.status === 'rejected').length,
      total: offers.length,
    };
  }, [isProviderMode]);

  // Filtered offers by tab (for individual view)
  const filteredOffers = useMemo(() => {
    const offers = isProviderMode ? providerOffers : organizerOffers;
    if (activeTab === 'active') {
      return offers.filter(o => o.status === 'pending' || o.status === 'counter_offered');
    }
    return offers.filter(o => o.status === activeTab);
  }, [isProviderMode, activeTab]);

  // Grouped offers for comparison view
  const groupedOffers = useMemo(() => {
    if (isProviderMode || viewMode !== 'grouped' || activeTab !== 'active') {
      return [];
    }

    // Calculate scores
    const scoredOffers = calculateOfferScores(enhancedOffers, defaultComparisonCriteria);

    // Group by service/quote request
    return groupOffersByService(
      scoredOffers,
      quoteRequests.map(qr => ({
        id: qr.id,
        serviceId: qr.serviceId,
        serviceName: qr.serviceName,
        budget: qr.budget,
        budgetMin: qr.budgetMin,
        budgetMax: qr.budgetMax,
        deadline: qr.deadline,
        type: qr.type,
      }))
    );
  }, [isProviderMode, viewMode, activeTab]);

  // Action handlers
  const handleAccept = (offerId: string) => {
    Alert.alert('Teklifi Kabul Et', 'Bu teklifi kabul etmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Kabul Et',
        onPress: () => {
          navigation.navigate('Contract', { contractId: offerId });
        }
      },
    ]);
  };

  const handleReject = (offerId: string) => {
    Alert.alert('Teklifi Reddet', 'Bu teklifi reddetmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Reddet', style: 'destructive', onPress: () => console.log('Rejected:', offerId) },
    ]);
  };

  const handleCounterOffer = (offerId: string) => {
    Alert.alert('Karşı Teklif', 'Karşı teklif ekranı açılacak', [
      { text: 'Tamam', onPress: () => console.log('Counter offer:', offerId) },
    ]);
  };

  const handleOfferPress = (offerId: string) => {
    navigation.navigate('OfferDetail', { offerId });
  };

  const handleSelectOffer = (offerId: string) => {
    Alert.alert(
      'Teklifi Seç',
      'Bu teklifi seçmek istediğinize emin misiniz? Diğer teklifler otomatik olarak reddedilecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Seç ve Kabul Et',
          onPress: () => {
            navigation.navigate('Contract', { contractId: offerId });
          },
        },
      ]
    );
  };

  const handleCompareAll = (quoteRequestId: string) => {
    navigation.navigate('CompareOffers', { quoteRequestId });
  };

  const handleFilterPress = () => {
    // Filter functionality
    console.log('Filter pressed');
  };

  const renderOfferCard = (offer: OrganizerOffer | ProviderOffer) => {
    if (isProviderMode) {
      return (
        <ProviderOfferCard
          key={offer.id}
          offer={offer as ProviderOffer}
          onPress={() => handleOfferPress(offer.id)}
          onAccept={() => handleAccept(offer.id)}
          onReject={() => handleReject(offer.id)}
          onCounterOffer={() => handleCounterOffer(offer.id)}
        />
      );
    }
    return (
      <OrganizerOfferCard
        key={offer.id}
        offer={offer as OrganizerOffer}
        onPress={() => handleOfferPress(offer.id)}
        onAccept={() => handleAccept(offer.id)}
        onReject={() => handleReject(offer.id)}
        onCounterOffer={() => handleCounterOffer(offer.id)}
      />
    );
  };

  // Show grouped view for organizer in active tab
  const showGroupedView = !isProviderMode && viewMode === 'grouped' && activeTab === 'active';

  const headerTitle = isProviderMode ? 'Gönderilen Teklifler' : 'Tekliflerim';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Scroll Header */}
      <ScrollHeader
        title={headerTitle}
        scrollY={scrollY}
        threshold={60}
        rightAction={
          !isProviderMode && (
            <TouchableOpacity onPress={handleFilterPress} style={styles.headerButton}>
              <Ionicons name="options-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          )
        }
      />

      <Animated.ScrollView
        style={styles.offersList}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.offersListContent,
          { paddingTop: insets.top + 44 },
          showGroupedView && styles.offersListContentGrouped,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={accentColor}
            colors={[accentColor]}
            progressViewOffset={insets.top + 44}
          />
        }
      >
        {/* Large Title */}
        <LargeTitle
          title={headerTitle}
          subtitle={`${stats.active} aktif teklif`}
        />

        {/* View Mode Toggle (only for organizer) */}
        {!isProviderMode && activeTab === 'active' && (
          <View style={styles.viewModeContainer}>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'grouped' && { backgroundColor: accentColor },
              ]}
              onPress={() => setViewMode('grouped')}
            >
              <Ionicons
                name="layers-outline"
                size={16}
                color={viewMode === 'grouped' ? 'white' : colors.textMuted}
              />
              <Text
                style={[
                  styles.viewModeText,
                  { color: viewMode === 'grouped' ? 'white' : colors.textMuted },
                ]}
              >
                Gruplu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'individual' && { backgroundColor: accentColor },
              ]}
              onPress={() => setViewMode('individual')}
            >
              <Ionicons
                name="list-outline"
                size={16}
                color={viewMode === 'individual' ? 'white' : colors.textMuted}
              />
              <Text
                style={[
                  styles.viewModeText,
                  { color: viewMode === 'individual' ? 'white' : colors.textMuted },
                ]}
              >
                Tekil
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <OfferTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          stats={stats}
        />

        <View style={showGroupedView ? styles.offersListContentGrouped : styles.offersListContentInner}>
          {showGroupedView ? (
            // Grouped view with MultiOfferCards
            groupedOffers.length > 0 ? (
              groupedOffers.map((group) => (
                <MultiOfferCard
                  key={group.quoteRequestId}
                  groupedOffers={group}
                  onOfferPress={handleOfferPress}
                  onSelectOffer={handleSelectOffer}
                  onCompareAll={() => handleCompareAll(group.quoteRequestId)}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <EmptyOfferState />
              </View>
            )
          ) : (
            // Individual view with regular cards
            filteredOffers.length > 0 ? (
              filteredOffers.map(renderOfferCard)
            ) : (
              <EmptyOfferState />
            )
          )}
        </View>
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  viewModeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  offersList: {
    flex: 1,
  },
  offersListContent: {
    paddingBottom: 20,
  },
  offersListContentInner: {
    paddingHorizontal: 20,
    gap: 12,
  },
  offersListContentGrouped: {
    paddingHorizontal: 0,
    gap: 0,
  },
  emptyContainer: {
    paddingHorizontal: 20,
  },
  bottomSpacer: {
    height: 120,
  },
});
