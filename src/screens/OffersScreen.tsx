import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import {
  OfferHeader,
  OfferTabs,
  OrganizerOfferCard,
  ProviderOfferCard,
  EmptyOfferState,
} from '../components/offers';
import {
  OfferTabType,
  OrganizerOffer,
  ProviderOffer,
  organizerOffers,
  providerOffers,
} from '../data/offersData';

interface OffersScreenProps {
  isProviderMode: boolean;
}

export function OffersScreen({ isProviderMode }: OffersScreenProps) {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<OfferTabType>('active');
  const [refreshing, setRefreshing] = useState(false);

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

  // Filtered offers by tab
  const filteredOffers = useMemo(() => {
    const offers = isProviderMode ? providerOffers : organizerOffers;
    if (activeTab === 'active') {
      return offers.filter(o => o.status === 'pending' || o.status === 'counter_offered');
    }
    return offers.filter(o => o.status === activeTab);
  }, [isProviderMode, activeTab]);

  // Action handlers
  const handleAccept = (offerId: string) => {
    Alert.alert('Teklifi Kabul Et', 'Bu teklifi kabul etmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Kabul Et',
        onPress: () => {
          navigation.navigate('Contract', { offerId });
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <OfferHeader
        isProviderMode={isProviderMode}
        activeCount={stats.active}
        showFilter={!isProviderMode}
        onFilterPress={handleFilterPress}
      />

      <OfferTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stats={stats}
      />

      <ScrollView
        style={styles.offersList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.offersListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[400]}
            colors={[colors.brand[400]]}
          />
        }
      >
        {filteredOffers.length > 0 ? (
          filteredOffers.map(renderOfferCard)
        ) : (
          <EmptyOfferState />
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offersList: {
    flex: 1,
  },
  offersListContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  bottomSpacer: {
    height: 100,
  },
});
