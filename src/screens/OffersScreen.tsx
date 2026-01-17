import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, RefreshControl, Alert, TouchableOpacity, Text, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { ScrollHeader, LargeTitle } from '../components/navigation';
import { useTheme } from '../theme/ThemeContext';
import { scrollToTopEmitter } from '../utils/scrollToTop';
import {
  OfferTabs,
  OrganizerOfferCard,
  ProviderOfferCard,
  EmptyOfferState,
  MultiOfferCard,
  DraftCard,
} from '../components/offers';
import {
  OfferTabType,
  OfferStatus,
  OrganizerOffer,
  ProviderOffer,
  DraftRequest,
  organizerOffers,
  providerOffers,
  enhancedOffers,
  quoteRequests,
  draftRequests,
  getTabForStatus,
} from '../data/offersData';
import { groupOffersByService, calculateOfferScores } from '../utils/offerUtils';
import { defaultComparisonCriteria } from '../types/comparison';
import type { OffersStackNavigationProp } from '../types';
import { useApp } from '../../App';

interface OffersScreenProps {
  isProviderMode: boolean;
}

type ViewMode = 'grouped' | 'individual';

export function OffersScreen({ isProviderMode }: OffersScreenProps) {
  const navigation = useNavigation<OffersStackNavigationProp>();
  const { colors, isDark } = useTheme();
  const { providerServices = [] } = useApp();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<OfferTabType>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterService, setFilterService] = useState<string | null>(null);
  const [filterPriceRange, setFilterPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'rating'>('date');
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  const scrollY = useSharedValue(0);
  const accentColor = colors.brand[400];

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Subscribe to scroll-to-top events
  useEffect(() => {
    const unsubscribe = scrollToTopEmitter.subscribe((tabName) => {
      if (tabName === 'OffersTab') {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsubscribe;
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Filter provider offers by service category
  const filteredProviderOffers = useMemo(() => {
    if (!isProviderMode) return [];
    // If provider has specific services, filter by those
    if (providerServices.length > 0) {
      return providerOffers.filter(o => providerServices.includes(o.serviceCategory));
    }
    // Fallback to all offers if no services defined
    return providerOffers;
  }, [isProviderMode, providerServices]);

  // Stats calculation - State machine'e göre tutarlı filtreleme
  // Aktif: pending + counter_offered
  // Onaylanan: SADECE accepted (karşılıklı onaylanmış)
  // Reddedilen: rejected + expired + cancelled
  const stats = useMemo(() => {
    const offers = isProviderMode ? filteredProviderOffers : organizerOffers;
    return {
      // Aktif = beklemede veya pazarlık sürecinde
      active: offers.filter(o =>
        o.status === 'pending' || o.status === 'counter_offered'
      ).length,
      // Onaylanan = SADECE karşılıklı kabul edilmiş
      accepted: offers.filter(o => o.status === 'accepted').length,
      // Reddedilen = reddedilmiş, süresi dolmuş veya iptal edilmiş
      rejected: offers.filter(o =>
        o.status === 'rejected' ||
        o.status === 'expired' ||
        o.status === 'cancelled'
      ).length,
      drafts: isProviderMode ? 0 : draftRequests.length,
      total: offers.length,
    };
  }, [isProviderMode, filteredProviderOffers]);

  // Filtered offers by tab (for individual view)
  // State machine'e göre tutarlı filtreleme
  const filteredOffers = useMemo(() => {
    const offers = isProviderMode ? filteredProviderOffers : organizerOffers;

    let result;
    switch (activeTab) {
      case 'active':
        // Aktif sekmesi: pending ve counter_offered durumları
        result = offers.filter(o =>
          o.status === 'pending' || o.status === 'counter_offered'
        );
        break;
      case 'accepted':
        // Onaylanan sekmesi: SADECE accepted durumu
        // DİKKAT: counter_offered durumu ASLA burada gösterilmez!
        result = offers.filter(o => o.status === 'accepted');
        break;
      case 'rejected':
        // Reddedilen sekmesi: rejected, expired, cancelled durumları
        result = offers.filter(o =>
          o.status === 'rejected' ||
          o.status === 'expired' ||
          o.status === 'cancelled'
        );
        break;
      default:
        result = offers;
    }

    // Apply service filter
    if (filterService) {
      result = result.filter(o => (o as any).service === filterService || (o as any).serviceName === filterService);
    }

    // Apply price range filter
    if (filterPriceRange !== 'all') {
      result = result.filter(o => {
        const amount = (o as any).amount || (o as any).price || 0;
        if (filterPriceRange === 'low') return amount < 50000;
        if (filterPriceRange === 'medium') return amount >= 50000 && amount < 150000;
        if (filterPriceRange === 'high') return amount >= 150000;
        return true;
      });
    }

    // Apply sorting
    if (sortBy === 'price') {
      result = [...result].sort((a, b) => ((a as any).amount || 0) - ((b as any).amount || 0));
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => ((b as any).rating || 0) - ((a as any).rating || 0));
    }
    // Default is by date (already sorted)

    return result;
  }, [isProviderMode, activeTab, filteredProviderOffers, filterService, filterPriceRange, sortBy]);

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
      { text: 'Reddet', style: 'destructive', onPress: () => {
        Alert.alert('Basarili', 'Teklif reddedildi.');
      }},
    ]);
  };

  const handleCounterOffer = (offerId: string) => {
    Alert.alert('Karsi Teklif', 'Bu ozellik yakinda aktif olacak.', [
      { text: 'Tamam' },
    ]);
  };

  const handleOfferPress = (offerId: string) => {
    // Provider mode: go to request detail screen to see requirements and submit offer
    // Organizer mode: go to offer detail to see received offers
    if (isProviderMode) {
      navigation.navigate('ProviderRequestDetail', { offerId });
    } else {
      navigation.navigate('OfferDetail', { offerId });
    }
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
    setShowFilterModal(true);
  };

  const resetFilters = () => {
    setFilterService(null);
    setFilterPriceRange('all');
    setSortBy('date');
  };

  const hasActiveFilters = filterService !== null || filterPriceRange !== 'all' || sortBy !== 'date';

  const handleContinueDraft = (draftId: string) => {
    const draft = draftRequests.find(d => d.id === draftId);
    if (draft) {
      (navigation as any).navigate('CategoryRequest', {
        category: draft.category,
        eventId: draft.eventId,
        draftId: draft.id,
      });
    }
  };

  const handleDeleteDraft = (draftId: string) => {
    Alert.alert(
      'Taslağı Sil',
      'Bu taslağı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Başarılı', 'Taslak silindi.');
          },
        },
      ]
    );
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

  // Show drafts view
  const showDraftsView = !isProviderMode && activeTab === 'drafts';

  const headerTitle = isProviderMode ? 'Teklifler' : 'Tekliflerim';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Scroll Header */}
      <ScrollHeader
        title={headerTitle}
        scrollY={scrollY}
        threshold={60}
        showBackButton={true}
        rightAction={
          !isProviderMode && (
            <TouchableOpacity onPress={handleFilterPress} style={styles.headerButton}>
              <Ionicons name="options-outline" size={22} color={hasActiveFilters ? accentColor : colors.text} />
              {hasActiveFilters && <View style={[styles.filterBadge, { backgroundColor: accentColor }]} />}
            </TouchableOpacity>
          )
        }
      />

      <Animated.ScrollView
        ref={scrollViewRef}
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
          showDrafts={!isProviderMode}
        />

        <View style={showGroupedView ? styles.offersListContentGrouped : styles.offersListContentInner}>
          {showDraftsView ? (
            // Drafts view
            draftRequests.length > 0 ? (
              draftRequests.map((draft) => (
                <DraftCard
                  key={draft.id}
                  draft={draft}
                  onContinue={() => handleContinueDraft(draft.id)}
                  onDelete={() => handleDeleteDraft(draft.id)}
                />
              ))
            ) : (
              <EmptyOfferState />
            )
          ) : showGroupedView ? (
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

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filtrele ve Sırala</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Sort By */}
              <Text style={[styles.filterLabel, { color: colors.text }]}>Sıralama</Text>
              <View style={styles.filterOptions}>
                {[
                  { key: 'date', label: 'Tarih' },
                  { key: 'price', label: 'Fiyat' },
                  { key: 'rating', label: 'Puan' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterOption,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
                      sortBy === option.key && { backgroundColor: 'rgba(75, 48, 184, 0.15)', borderColor: accentColor },
                    ]}
                    onPress={() => setSortBy(option.key as any)}
                  >
                    <Text style={[styles.filterOptionText, { color: sortBy === option.key ? accentColor : colors.textMuted }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price Range */}
              <Text style={[styles.filterLabel, { color: colors.text, marginTop: 20 }]}>Fiyat Aralığı</Text>
              <View style={styles.filterOptions}>
                {[
                  { key: 'all', label: 'Tümü' },
                  { key: 'low', label: '< ₺50K' },
                  { key: 'medium', label: '₺50K - ₺150K' },
                  { key: 'high', label: '> ₺150K' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterOption,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
                      filterPriceRange === option.key && { backgroundColor: 'rgba(75, 48, 184, 0.15)', borderColor: accentColor },
                    ]}
                    onPress={() => setFilterPriceRange(option.key as any)}
                  >
                    <Text style={[styles.filterOptionText, { color: filterPriceRange === option.key ? accentColor : colors.textMuted }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.modalFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
              <TouchableOpacity
                style={[styles.resetButton, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]}
                onPress={resetFilters}
              >
                <Text style={[styles.resetButtonText, { color: colors.textMuted }]}>Sıfırla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: accentColor }]}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 100,
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
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
