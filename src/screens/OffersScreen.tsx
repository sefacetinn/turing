import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, RefreshControl, Alert, TouchableOpacity, Text, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
  getTabForStatus,
} from '../data/offersData';
import { groupOffersByService, calculateOfferScores } from '../utils/offerUtils';
import { defaultComparisonCriteria, type GroupedOffers } from '../types/comparison';
import type { OffersStackNavigationProp } from '../types';
import { useApp } from '../../App';
import { useAuth } from '../context/AuthContext';
import { useOffers, sendCounterOffer, type FirestoreOffer } from '../hooks';

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

  // Counter offer modal state
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [counterOfferNote, setCounterOfferNote] = useState('');
  const [isSubmittingCounter, setIsSubmittingCounter] = useState(false);

  // Auth & Data hooks
  const { user } = useAuth();
  const userRole = isProviderMode ? 'provider' : 'organizer';
  const { offers: realOffers, loading: offersLoading, refetch: refetchOffers } = useOffers(user?.uid, userRole);

  // Refetch offers when screen gains focus (e.g., returning from detail screen)
  useFocusEffect(
    useCallback(() => {
      // Small delay to ensure Firebase has processed any updates
      const timer = setTimeout(() => {
        if (refetchOffers) {
          console.log('[OffersScreen] Screen focused, refreshing offers...');
          refetchOffers();
        }
      }, 300);
      return () => clearTimeout(timer);
    }, [refetchOffers])
  );

  // Check if user has real data
  const hasRealData = user && realOffers.length > 0;
  const isNewUser = user && !offersLoading && realOffers.length === 0;

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Convert Firebase offers to local format (matching ProviderOffer/OrganizerOffer interfaces)
  const convertedRealOffers = useMemo(() => {
    if (!realOffers.length) return [];
    return realOffers.map(o => {
      // Build location string from event data
      const locationParts = [
        o.formData?.venue,
        o.formData?.district,
        o.eventCity
      ].filter(Boolean);
      const locationStr = locationParts.length > 0 ? locationParts.join(', ') : '';

      // Determine display names - prefer company name if available
      const organizerDisplayName = o.organizerCompanyName || o.organizerName || 'Organizatör';
      const organizerDisplayImage = o.organizerCompanyLogo || o.organizerImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100';
      const providerDisplayName = o.providerCompanyName || o.providerName || 'Tedarikçi';
      const providerDisplayImage = o.providerCompanyLogo || o.providerImage || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200';

      return {
      id: o.id,
      eventId: o.eventId,
      eventTitle: o.eventTitle,
      eventDate: o.eventDate || '',
      eventTime: o.eventTime || o.formData?.time || '',
      eventCity: o.eventCity || o.formData?.city || '',
      eventDistrict: o.formData?.district || (o as any).eventDistrict || '',
      eventVenue: o.formData?.venue || (o as any).eventVenue || '',
      // Event details from formData
      eventGuestCount: o.formData?.guestCount || '',
      eventVenueCapacity: o.formData?.venueCapacity || '',
      eventIndoorOutdoor: o.formData?.indoorOutdoor || '',
      eventSeatingType: o.formData?.seatingType || '',
      eventAgeLimit: o.formData?.ageLimit || '',
      location: locationStr, // For ProviderOfferCard
      // Nested organizer object (expected by ProviderOfferCard)
      organizer: {
        id: o.organizerUserId || o.organizerId,
        name: organizerDisplayName,
        image: organizerDisplayImage,
        company: o.organizerCompanyName || '',
        // Additional company info for detailed view
        companyId: o.organizerCompanyId,
        userName: o.organizerUserName,
        userRole: o.organizerUserRole,
      },
      // Nested provider object (expected by OrganizerOfferCard)
      provider: {
        id: o.providerUserId || o.providerId,
        name: providerDisplayName,
        image: providerDisplayImage,
        rating: 4.5,
        reviewCount: 0,
        completedJobs: 0,
        verified: true,
        // Additional company info for detailed view
        companyId: o.providerCompanyId,
        companyName: o.providerCompanyName,
        userName: o.providerUserName,
        userRole: o.providerUserRole,
      },
      // Artist info
      artistId: o.artistId,
      artistName: o.artistName,
      artistImage: o.artistImage,
      // Service info
      service: o.serviceCategory,
      serviceName: o.serviceCategory,
      serviceCategory: o.serviceCategory,
      // Pricing - use amount if set, otherwise fall back to requestedBudget
      amount: o.amount || (o.requestedBudget ? parseInt(o.requestedBudget) : 0),
      price: o.amount || (o.requestedBudget ? parseInt(o.requestedBudget) : 0),
      originalBudget: o.requestedBudget ? parseInt(o.requestedBudget) : (o.amount || 0),
      requestedBudget: o.requestedBudget,
      // Counter offer data from Firebase
      counterOffer: o.counterAmount ? {
        amount: o.counterAmount,
        message: o.counterMessage,
        by: o.counterBy,
        date: o.counterAt ? o.counterAt.toLocaleDateString('tr-TR') : '',
      } : undefined,
      // Status and type
      status: o.status,
      requestType: o.requestType,
      message: o.message || '',
      notes: o.notes,
      // Form data
      formData: o.formData,
      serviceDates: o.serviceDates,
      // Timestamps
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      validUntil: o.validUntil,
      // UI helpers
      rating: 4.5,
      responseTime: '24 saat içinde',
    };
    });
  }, [realOffers]);

  // Use real offers for logged-in users, empty for new users
  const baseOrganizerOffers = useMemo(() => {
    if (hasRealData) return convertedRealOffers;
    return []; // Empty for new users
  }, [hasRealData, convertedRealOffers]);

  const baseProviderOffers = useMemo(() => {
    if (hasRealData) return convertedRealOffers;
    return []; // Empty for new users
  }, [hasRealData, convertedRealOffers]);

  // Provider should see ALL incoming offers (no service category filter)
  // They can decide which requests to respond to
  const filteredProviderOffers = useMemo(() => {
    if (!isProviderMode) return [];
    return baseProviderOffers;
  }, [isProviderMode, baseProviderOffers]);

  // Stats calculation - State machine'e göre tutarlı filtreleme
  // Aktif: pending + quoted + counter_offered (işlem bekleyen)
  // Onaylanan: SADECE accepted (karşılıklı onaylanmış)
  // Reddedilen: rejected + expired + cancelled
  const stats = useMemo(() => {
    const offers = isProviderMode ? filteredProviderOffers : baseOrganizerOffers;
    return {
      // Aktif = beklemede, teklif verilmiş veya pazarlık sürecinde
      active: offers.filter((o: any) =>
        o.status === 'pending' || o.status === 'quoted' || o.status === 'counter_offered'
      ).length,
      // Onaylanan = SADECE karşılıklı kabul edilmiş
      accepted: offers.filter((o: any) => o.status === 'accepted').length,
      // Reddedilen = reddedilmiş, süresi dolmuş veya iptal edilmiş
      rejected: offers.filter((o: any) =>
        o.status === 'rejected' ||
        o.status === 'expired' ||
        o.status === 'cancelled'
      ).length,
      drafts: 0, // No draft requests in clean state
      total: offers.length,
    };
  }, [isProviderMode, filteredProviderOffers, baseOrganizerOffers, isNewUser]);

  // Filtered offers by tab (for individual view)
  // State machine'e göre tutarlı filtreleme
  const filteredOffers = useMemo(() => {
    const offers = isProviderMode ? filteredProviderOffers : baseOrganizerOffers;

    let result;
    switch (activeTab) {
      case 'active':
        // Aktif sekmesi: pending, quoted ve counter_offered durumları
        result = offers.filter(o =>
          o.status === 'pending' || o.status === 'quoted' || o.status === 'counter_offered'
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
  }, [isProviderMode, activeTab, filteredProviderOffers, baseOrganizerOffers, filterService, filterPriceRange, sortBy]);

  // Grouped offers for comparison view - will be implemented when backend supports
  const groupedOffers = useMemo((): GroupedOffers[] => {
    // TODO: Implement real grouped offers when backend supports quote requests
    return [];
  }, []);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedOfferId(offerId);
    setCounterOfferAmount('');
    setCounterOfferNote('');
    setShowCounterOfferModal(true);
  };

  const handleSubmitCounterOffer = async () => {
    if (!selectedOfferId) return;

    const amount = parseInt(counterOfferAmount.replace(/\./g, ''));
    if (!amount || amount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Lütfen geçerli bir tutar girin');
      return;
    }

    setIsSubmittingCounter(true);
    try {
      const counterBy = isProviderMode ? 'provider' : 'organizer';
      await sendCounterOffer(selectedOfferId, amount, counterBy, counterOfferNote || undefined);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowCounterOfferModal(false);
      setSelectedOfferId(null);
      setCounterOfferAmount('');
      setCounterOfferNote('');
      Alert.alert('Başarılı', `₺${amount.toLocaleString('tr-TR')} tutarındaki karşı teklifiniz gönderildi.`);
    } catch (error: any) {
      console.warn('Error sending counter offer:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', error.message || 'Karşı teklif gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmittingCounter(false);
    }
  };

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
    // TODO: Implement draft loading from Firebase when drafts are supported
    Alert.alert('Bilgi', 'Taslak özelliği yakında aktif olacak.');
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

  const renderOfferCard = (offer: OrganizerOffer | ProviderOffer | any) => {
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

        <View style={(showGroupedView && groupedOffers.length > 0) ? styles.offersListContentGrouped : styles.offersListContentInner}>
          {showDraftsView ? (
            // Drafts view - TODO: will be populated from Firebase when drafts are supported
            <EmptyOfferState />
          ) : (showGroupedView && groupedOffers.length > 0) ? (
            // Grouped view with MultiOfferCards (only when we have grouped offers)
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
            // Individual view with regular cards (also fallback when no grouped offers)
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

      {/* Counter Offer Modal */}
      <Modal
        visible={showCounterOfferModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCounterOfferModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.counterModalContent, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={styles.modalHandle}>
              <View style={[styles.modalHandleBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#E2E8F0' }]} />
            </View>

            <View style={[styles.counterModalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
              <Text style={[styles.counterModalTitle, { color: colors.text }]}>Karşı Teklif</Text>
              <TouchableOpacity onPress={() => setShowCounterOfferModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.counterModalBody}>
              <Text style={[styles.counterInputLabel, { color: colors.textSecondary }]}>Teklif Tutarı</Text>
              <View style={[styles.counterInputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                <Text style={[styles.counterInputPrefix, { color: colors.text }]}>₺</Text>
                <TextInput
                  style={[styles.counterInput, { color: colors.text }]}
                  placeholder="Tutar girin"
                  placeholderTextColor={colors.textSecondary}
                  value={counterOfferAmount}
                  onChangeText={(t) => setCounterOfferAmount(formatCurrency(t))}
                  keyboardType="number-pad"
                />
              </View>

              <Text style={[styles.counterInputLabel, { color: colors.textSecondary, marginTop: 20 }]}>Mesaj (Opsiyonel)</Text>
              <TextInput
                style={[styles.counterTextArea, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0', color: colors.text }]}
                placeholder="Teklifiniz hakkında açıklama ekleyin..."
                placeholderTextColor={colors.textSecondary}
                value={counterOfferNote}
                onChangeText={setCounterOfferNote}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={[styles.counterModalFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[styles.counterCancelBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}
                onPress={() => setShowCounterOfferModal(false)}
              >
                <Text style={[styles.counterCancelText, { color: colors.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.counterSubmitBtn, { opacity: isSubmittingCounter ? 0.6 : 1 }]}
                onPress={handleSubmitCounterOffer}
                disabled={isSubmittingCounter}
              >
                <Text style={styles.counterSubmitText}>
                  {isSubmittingCounter ? 'Gönderiliyor...' : 'Gönder'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  // Counter Offer Modal Styles
  modalHandle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  counterModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  counterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  counterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  counterModalBody: {
    padding: 20,
  },
  counterInputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
  },
  counterInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  counterInputPrefix: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  counterInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
  counterTextArea: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  counterModalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
  },
  counterCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  counterCancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  counterSubmitBtn: {
    flex: 1.5,
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  counterSubmitText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
