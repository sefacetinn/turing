import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  TextInput,
  Linking,
  Share,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { ServiceRequirementsDisplay } from '../components';
import { offers, getQuoteRequestForOffer } from '../data/mockData';
import { enhancedOffers, getQuoteRequestById, getCategoryGradient } from '../data/offersData';
import { CategoryRequirements } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Complete offer data interface for this screen
interface OfferData {
  id: string;
  providerName: string;
  providerImage: string;
  providerRating: number;
  providerReviewCount: number;
  providerVerified: boolean;
  providerCompletedJobs: number;
  providerResponseTime: string;
  providerPhone: string;
  service: string;
  category: string;
  eventTitle: string;
  eventId: string;
  eventDate: string;
  eventVenue: string;
  amount: number;
  originalAmount: number;
  discount: number;
  status: string;
  notes: string;
  validUntil: string;
  deliveryTime: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  createdAt: string;
}

export function OfferDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { colors, isDark, helpers } = useTheme();
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 80;
  const { offerId } = (route.params as { offerId: string }) || { offerId: 'o1' };
  const scrollY = useRef(new Animated.Value(0)).current;

  // Try to find offer in both old and enhanced offers
  const legacyOffer = offers.find(o => o.id === offerId);
  const enhancedOffer = enhancedOffers.find(o => o.id === offerId);

  // Helper to build complete offer data
  const buildOfferData = (): OfferData => {
    if (legacyOffer) {
      return {
        id: legacyOffer.id,
        providerName: legacyOffer.providerName,
        providerImage: legacyOffer.providerImage,
        providerRating: 4.8,
        providerReviewCount: 127,
        providerVerified: true,
        providerCompletedJobs: 200,
        providerResponseTime: '2 saat',
        providerPhone: '+90 532 123 4567',
        service: legacyOffer.service,
        category: legacyOffer.category,
        eventTitle: legacyOffer.eventTitle,
        eventId: legacyOffer.eventId || 'e1',
        eventDate: '15 Temmuz 2026',
        eventVenue: 'Zorlu PSM, İstanbul',
        amount: legacyOffer.amount,
        originalAmount: legacyOffer.originalAmount || legacyOffer.amount,
        discount: legacyOffer.discount || 0,
        status: legacyOffer.status,
        notes: legacyOffer.notes || '',
        validUntil: legacyOffer.validUntil || '7 gün',
        deliveryTime: '3 gün',
        items: legacyOffer.items || [],
        createdAt: legacyOffer.createdAt || '10 Ocak 2026',
      };
    }

    if (enhancedOffer) {
      return {
        id: enhancedOffer.id,
        providerName: enhancedOffer.provider.name,
        providerImage: enhancedOffer.provider.image,
        providerRating: enhancedOffer.provider.rating || 4.8,
        providerReviewCount: enhancedOffer.provider.reviewCount || 127,
        providerVerified: enhancedOffer.provider.verified,
        providerCompletedJobs: enhancedOffer.provider.completedJobs || 200,
        providerResponseTime: enhancedOffer.provider.responseTime || '2 saat',
        providerPhone: '+90 532 123 4567',
        service: enhancedOffer.serviceName,
        category: enhancedOffer.category,
        eventTitle: enhancedOffer.eventTitle,
        eventId: enhancedOffer.eventId || 'e1',
        eventDate: '15 Temmuz 2026',
        eventVenue: 'Zorlu PSM, İstanbul',
        amount: enhancedOffer.amount,
        originalAmount: enhancedOffer.originalBudget,
        discount: enhancedOffer.discountPercent || 0,
        status: enhancedOffer.status,
        notes: enhancedOffer.message,
        validUntil: '7 gün',
        deliveryTime: enhancedOffer.deliveryTime || '3 gün',
        items: [],
        createdAt: '10 Ocak 2026',
      };
    }

    // Fallback
    const fallbackOffer = offers[0];
    return {
      id: fallbackOffer.id,
      providerName: fallbackOffer.providerName,
      providerImage: fallbackOffer.providerImage,
      providerRating: 4.8,
      providerReviewCount: 127,
      providerVerified: true,
      providerCompletedJobs: 200,
      providerResponseTime: '2 saat',
      providerPhone: '+90 532 123 4567',
      service: fallbackOffer.service,
      category: fallbackOffer.category,
      eventTitle: fallbackOffer.eventTitle,
      eventId: fallbackOffer.eventId || 'e1',
      eventDate: '15 Temmuz 2026',
      eventVenue: 'Zorlu PSM, İstanbul',
      amount: fallbackOffer.amount,
      originalAmount: fallbackOffer.originalAmount || fallbackOffer.amount,
      discount: fallbackOffer.discount || 0,
      status: fallbackOffer.status,
      notes: fallbackOffer.notes || '',
      validUntil: fallbackOffer.validUntil || '7 gün',
      deliveryTime: '3 gün',
      items: fallbackOffer.items || [],
      createdAt: fallbackOffer.createdAt || '10 Ocak 2026',
    };
  };

  const [offer, setOffer] = useState<OfferData>(buildOfferData);
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [counterOfferNote, setCounterOfferNote] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);

  // Get the quote request with requirements for this offer
  const legacyQuoteRequest = getQuoteRequestForOffer(offerId);
  const enhancedQuoteRequest = enhancedOffer ? getQuoteRequestById(enhancedOffer.quoteRequestId) : null;
  const quoteRequest = legacyQuoteRequest || (enhancedQuoteRequest ? {
    ...enhancedQuoteRequest,
    requirements: {},
  } : null);

  // Negotiation history mock data
  const negotiationHistory = [
    { id: 1, type: 'initial', by: 'provider', amount: offer.amount * 1.1, date: '8 Ocak 2026', message: 'İlk teklif gönderildi' },
    { id: 2, type: 'counter', by: 'organizer', amount: offer.amount * 0.95, date: '9 Ocak 2026', message: 'Bütçemiz biraz daha düşük' },
    { id: 3, type: 'final', by: 'provider', amount: offer.amount, date: '10 Ocak 2026', message: 'Son teklifimiz' },
  ];

  const handleAcceptOffer = () => {
    Alert.alert(
      'Teklifi Kabul Et',
      `${offer.providerName} firmasının ₺${offer.amount.toLocaleString('tr-TR')} tutarındaki teklifini kabul etmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kabul Et',
          onPress: () => {
            setOffer({ ...offer, status: 'accepted' });
            Alert.alert(
              '✅ Teklif Kabul Edildi',
              'Sözleşme oluşturuldu ve sağlayıcıya bildirim gönderildi.',
              [
                { text: 'Sonra', style: 'cancel' },
                { text: 'Sözleşmeye Git', onPress: () => navigation.navigate('Contract', { contractId: offer.id }) }
              ]
            );
          }
        },
      ]
    );
  };

  const handleRejectOffer = () => {
    Alert.alert(
      'Teklifi Reddet',
      'Bu teklifi reddetmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Reddet',
          style: 'destructive',
          onPress: () => {
            setOffer({ ...offer, status: 'rejected' });
            Alert.alert(
              'Teklif Reddedildi',
              'Sağlayıcıya bildirim gönderildi.',
              [{ text: 'Tamam', onPress: () => navigation.goBack() }]
            );
          }
        },
      ]
    );
  };

  const handleSendCounterOffer = () => {
    const amount = selectedQuickAmount || parseInt(counterOfferAmount.replace(/\./g, ''));
    if (!amount || amount <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir tutar girin');
      return;
    }

    setShowNegotiate(false);
    setOffer({ ...offer, status: 'counter_offered' as any });
    Alert.alert(
      '📤 Karşı Teklif Gönderildi',
      `₺${amount.toLocaleString('tr-TR')} tutarındaki karşı teklifiniz sağlayıcıya iletildi. Yanıt bekleyiniz.`,
      [{ text: 'Tamam' }]
    );
    setCounterOfferAmount('');
    setCounterOfferNote('');
    setSelectedQuickAmount(null);
  };

  const handleNavigateToChat = () => {
    navigation.navigate('Chat', {
      chatId: `provider_${offer.id}`,
      recipientName: offer.providerName
    });
  };

  const handleNavigateToEvent = () => {
    navigation.navigate('OrganizerEventDetail', { eventId: offer.eventId || 'e1' });
  };

  const handleNavigateToProvider = () => {
    navigation.navigate('ProviderDetail', { providerId: offer.id });
  };

  const handleCall = () => {
    Linking.openURL(`tel:${offer.providerPhone || '+905321234567'}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${offer.providerName} - ${offer.service}\n💰 ₺${offer.amount.toLocaleString('tr-TR')}\n📅 ${offer.eventTitle}\n\nTuring üzerinden teklif`,
        title: `Teklif: ${offer.service}`,
      });
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu');
    }
    setShowMenu(false);
  };

  const handleReport = () => {
    Alert.alert('Teklifi Bildir', 'Bu teklifi neden bildirmek istiyorsunuz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Uygunsuz İçerik', onPress: () => Alert.alert('Bildirildi', 'İncelemeye alındı. Teşekkürler.') },
      { text: 'Spam', onPress: () => Alert.alert('Bildirildi', 'İncelemeye alındı. Teşekkürler.') },
    ]);
    setShowMenu(false);
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; bg: string; icon: string; gradient: readonly [string, string] }> = {
      pending: { color: colors.warning, text: 'Beklemede', bg: 'rgba(245, 158, 11, 0.15)', icon: 'time', gradient: ['#f59e0b', '#fbbf24'] },
      accepted: { color: colors.success, text: 'Kabul Edildi', bg: 'rgba(16, 185, 129, 0.15)', icon: 'checkmark-circle', gradient: ['#10b981', '#34d399'] },
      rejected: { color: colors.error, text: 'Reddedildi', bg: 'rgba(239, 68, 68, 0.15)', icon: 'close-circle', gradient: ['#ef4444', '#f87171'] },
      counter_offered: { color: colors.info, text: 'Pazarlık Devam Ediyor', bg: 'rgba(59, 130, 246, 0.15)', icon: 'swap-horizontal', gradient: ['#3b82f6', '#60a5fa'] },
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusInfo = getStatusInfo(offer.status);
  const categoryGradient = getCategoryGradient(offer.category || 'technical');

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Quick amount suggestions
  const quickAmounts = [
    { label: '%5 düşük', value: Math.round(offer.amount * 0.95) },
    { label: '%10 düşük', value: Math.round(offer.amount * 0.90) },
    { label: '%15 düşük', value: Math.round(offer.amount * 0.85) },
  ];

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity, backgroundColor: colors.background, borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.animatedHeaderContent}>
            <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.animatedHeaderTitle}>
              <Text style={[styles.animatedHeaderText, { color: colors.text }]} numberOfLines={1}>{offer.service}</Text>
              <Text style={[styles.animatedHeaderSubtext, { color: colors.textMuted }]}>₺{offer.amount.toLocaleString('tr-TR')}</Text>
            </View>
            <TouchableOpacity style={styles.headerMenuBtn} onPress={() => setShowMenu(true)}>
              <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Header */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={categoryGradient as [string, string]}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <SafeAreaView edges={['top']}>
              <View style={styles.heroHeader}>
                <TouchableOpacity style={styles.heroBackButton} onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.heroActions}>
                  <TouchableOpacity style={styles.heroActionButton} onPress={handleShare}>
                    <Ionicons name="share-outline" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.heroActionButton} onPress={() => setShowMenu(true)}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>

            <View style={styles.heroContent}>
              {/* Status & Category Row */}
              <View style={styles.heroTopRow}>
                <View style={[styles.heroStatusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Ionicons name={statusInfo.icon as any} size={14} color="white" />
                  <Text style={styles.heroStatusText}>{statusInfo.text}</Text>
                </View>
                {offer.discount > 0 && (
                  <View style={styles.heroDiscountBadge}>
                    <Ionicons name="pricetag" size={12} color="white" />
                    <Text style={styles.heroDiscountText}>%{offer.discount} İndirim</Text>
                  </View>
                )}
              </View>

              {/* Service Info */}
              <View style={styles.heroServiceInfo}>
                <View style={styles.heroCategoryIcon}>
                  <Ionicons
                    name={offer.category === 'technical' ? 'hardware-chip' :
                          offer.category === 'booking' ? 'musical-notes' :
                          offer.category === 'catering' ? 'restaurant' : 'cube'}
                    size={24}
                    color="white"
                  />
                </View>
                <View style={styles.heroServiceText}>
                  <Text style={styles.heroTitle}>{offer.service}</Text>
                  <Text style={styles.heroSubtitle}>{offer.eventTitle}</Text>
                </View>
              </View>

              {/* Price Display */}
              <View style={styles.heroPriceContainer}>
                <View style={styles.heroPriceRow}>
                  <View>
                    <Text style={styles.heroPriceLabel}>Teklif Tutarı</Text>
                    <View style={styles.heroPriceValues}>
                      {offer.discount > 0 && (
                        <Text style={styles.heroOriginalPrice}>₺{offer.originalAmount?.toLocaleString('tr-TR')}</Text>
                      )}
                      <Text style={styles.heroPrice}>₺{offer.amount.toLocaleString('tr-TR')}</Text>
                    </View>
                  </View>
                  <View style={styles.heroValidityBadge}>
                    <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.heroValidUntil}>{offer.validUntil} geçerli</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Provider Card - Overlapping */}
          <View style={styles.providerCardWrapper}>
            <View
              style={[styles.providerCard, {
                backgroundColor: isDark ? 'rgba(30, 30, 35, 0.98)' : 'white',
                shadowColor: isDark ? '#000' : '#000',
              }]}
            >
              <TouchableOpacity
                style={styles.providerMainInfo}
                onPress={handleNavigateToProvider}
                activeOpacity={0.7}
              >
                <Image source={{ uri: offer.providerImage }} style={styles.providerImage} />
                <View style={styles.providerDetails}>
                  <View style={styles.providerNameRow}>
                    <Text style={[styles.providerName, { color: colors.text }]}>{offer.providerName}</Text>
                    {offer.providerVerified && (
                      <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                        <Ionicons name="shield-checkmark" size={14} color={colors.success} />
                        <Text style={[styles.verifiedText, { color: colors.success }]}>Doğrulanmış</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.providerRatingRow}>
                    <Ionicons name="star" size={16} color="#fbbf24" />
                    <Text style={[styles.providerRating, { color: colors.text }]}>{offer.providerRating}</Text>
                    <Text style={[styles.providerReviewCount, { color: colors.textMuted }]}>({offer.providerReviewCount} değerlendirme)</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <View style={[styles.providerStatsRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                <View style={styles.providerStatBox}>
                  <Ionicons name="briefcase-outline" size={18} color={colors.brand[400]} />
                  <Text style={[styles.providerStatValue, { color: colors.text }]}>{offer.providerCompletedJobs}</Text>
                  <Text style={[styles.providerStatLabel, { color: colors.textMuted }]}>Tamamlanan İş</Text>
                </View>
                <View style={[styles.providerStatDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />
                <View style={styles.providerStatBox}>
                  <Ionicons name="flash-outline" size={18} color={colors.warning} />
                  <Text style={[styles.providerStatValue, { color: colors.text }]}>{offer.providerResponseTime}</Text>
                  <Text style={[styles.providerStatLabel, { color: colors.textMuted }]}>Yanıt Süresi</Text>
                </View>
              </View>

              <View style={styles.providerActionsRow}>
                <TouchableOpacity
                  style={[styles.providerActionBtn, {
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                    borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.2)'
                  }]}
                  onPress={handleCall}
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={18} color={colors.success} />
                  <Text style={[styles.providerActionText, { color: colors.success }]}>Ara</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.providerActionBtn, {
                    backgroundColor: isDark ? 'rgba(147, 51, 234, 0.12)' : 'rgba(147, 51, 234, 0.08)',
                    borderColor: isDark ? 'rgba(147, 51, 234, 0.25)' : 'rgba(147, 51, 234, 0.2)'
                  }]}
                  onPress={handleNavigateToChat}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble" size={18} color={colors.brand[400]} />
                  <Text style={[styles.providerActionText, { color: colors.brand[400] }]}>Mesaj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.providerActionBtn, styles.providerProfileBtn, {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'
                  }]}
                  onPress={handleNavigateToProvider}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person" size={18} color={colors.text} />
                  <Text style={[styles.providerActionText, { color: colors.text }]}>Profil</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Event Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Etkinlik</Text>
          <TouchableOpacity
            style={[styles.eventCard, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border
            }]}
            onPress={handleNavigateToEvent}
            activeOpacity={0.8}
          >
            <View style={[styles.eventIconContainer, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.1)' }]}>
              <Ionicons name="calendar" size={22} color={colors.brand[400]} />
            </View>
            <View style={styles.eventInfo}>
              <Text style={[styles.eventTitle, { color: colors.text }]}>{offer.eventTitle}</Text>
              <View style={styles.eventDetails}>
                <View style={styles.eventDetailItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.eventDetailText, { color: colors.textMuted }]}>{offer.eventDate}</Text>
                </View>
                <View style={styles.eventDetailItem}>
                  <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.eventDetailText, { color: colors.textMuted }]}>{offer.eventVenue}</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Teklif Detayları</Text>
          <View style={[styles.priceBreakdown, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border
          }]}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Hizmet Bedeli</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>₺{(offer.originalAmount || offer.amount).toLocaleString('tr-TR')}</Text>
            </View>
            {offer.discount > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.success }]}>İndirim (%{offer.discount})</Text>
                <Text style={[styles.priceValue, { color: colors.success }]}>-₺{((offer.originalAmount || offer.amount) - offer.amount).toLocaleString('tr-TR')}</Text>
              </View>
            )}
            <View style={[styles.priceDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]} />
            <View style={styles.priceRow}>
              <Text style={[styles.priceTotalLabel, { color: colors.text }]}>Toplam</Text>
              <Text style={[styles.priceTotalValue, { color: colors.brand[500] }]}>₺{offer.amount.toLocaleString('tr-TR')}</Text>
            </View>
            <View style={styles.priceMetaRow}>
              <View style={styles.priceMetaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.priceMetaText, { color: colors.textMuted }]}>Teslimat: {offer.deliveryTime}</Text>
              </View>
              <View style={styles.priceMetaItem}>
                <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.priceMetaText, { color: colors.textMuted }]}>{offer.createdAt}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Provider Notes */}
        {offer.notes && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sağlayıcı Notu</Text>
            <View style={[styles.notesCard, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border
            }]}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} style={styles.notesIcon} />
              <Text style={[styles.notesText, { color: colors.text }]}>{offer.notes}</Text>
            </View>
          </View>
        )}

        {/* Negotiation Timeline */}
        {offer.status === 'counter_offered' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pazarlık Geçmişi</Text>
            <View style={[styles.timelineCard, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border
            }]}>
              {negotiationHistory.map((item, index) => (
                <View key={item.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      { backgroundColor: item.type === 'final' ? colors.success : item.by === 'provider' ? colors.brand[500] : colors.warning }
                    ]} />
                    {index < negotiationHistory.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <Text style={[styles.timelineBy, { color: colors.text }]}>
                        {item.by === 'provider' ? offer.providerName : 'Siz'}
                      </Text>
                      <Text style={[styles.timelineDate, { color: colors.textMuted }]}>{item.date}</Text>
                    </View>
                    <Text style={[styles.timelineAmount, { color: colors.brand[500] }]}>₺{item.amount.toLocaleString('tr-TR')}</Text>
                    <Text style={[styles.timelineMessage, { color: colors.textMuted }]}>{item.message}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Market Comparison */}
        {offer.status === 'pending' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Piyasa Karşılaştırması</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CompareOffers', { quoteRequestId: offer.id })}>
                <Text style={[styles.sectionLink, { color: colors.brand[400] }]}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.comparisonCard, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border
            }]}>
              <View style={styles.comparisonStats}>
                <View style={styles.comparisonStatItem}>
                  <View style={[styles.comparisonStatIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Ionicons name="trending-down" size={18} color={colors.success} />
                  </View>
                  <Text style={[styles.comparisonStatValue, { color: colors.success }]}>%5</Text>
                  <Text style={[styles.comparisonStatLabel, { color: colors.textMuted }]}>Piyasa altı</Text>
                </View>
                <View style={[styles.comparisonDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]} />
                <View style={styles.comparisonStatItem}>
                  <View style={[styles.comparisonStatIcon, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                    <Ionicons name="documents" size={18} color={colors.brand[400]} />
                  </View>
                  <Text style={[styles.comparisonStatValue, { color: colors.text }]}>3</Text>
                  <Text style={[styles.comparisonStatLabel, { color: colors.textMuted }]}>Toplam teklif</Text>
                </View>
                <View style={[styles.comparisonDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]} />
                <View style={styles.comparisonStatItem}>
                  <View style={[styles.comparisonStatIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Ionicons name="trophy" size={18} color={colors.warning} />
                  </View>
                  <Text style={[styles.comparisonStatValue, { color: colors.warning }]}>1.</Text>
                  <Text style={[styles.comparisonStatLabel, { color: colors.textMuted }]}>Sıralama</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Contract Section (for accepted offers) */}
        {offer.status === 'accepted' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sözleşme</Text>
            <TouchableOpacity
              style={[styles.contractCard, {
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)',
                borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'
              }]}
              onPress={() => navigation.navigate('Contract', { contractId: offer.id })}
            >
              <View style={[styles.contractIcon, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="document-text" size={24} color={colors.success} />
              </View>
              <View style={styles.contractInfo}>
                <Text style={[styles.contractTitle, { color: colors.text }]}>Hizmet Sözleşmesi</Text>
                <Text style={[styles.contractStatus, { color: colors.success }]}>İmza bekliyor</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.success} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 200 }} />
      </Animated.ScrollView>

      {/* Bottom Actions */}
      {offer.status === 'pending' && (
        <View style={[styles.bottomActions, {
          backgroundColor: isDark ? 'rgba(9, 9, 11, 0.98)' : colors.background,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
          paddingBottom: insets.bottom + TAB_BAR_HEIGHT
        }]}>
          <TouchableOpacity
            style={[styles.rejectButton, {
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
            }]}
            onPress={handleRejectOffer}
          >
            <Ionicons name="close" size={22} color={colors.error} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.negotiateButton, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.surface,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : colors.border
            }]}
            onPress={() => setShowNegotiate(true)}
          >
            <Ionicons name="swap-horizontal" size={20} color={colors.text} />
            <Text style={[styles.negotiateButtonText, { color: colors.text }]}>Pazarlık</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptOffer}>
            <LinearGradient
              colors={['#10b981', '#34d399']}
              style={styles.acceptButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="checkmark" size={22} color="white" />
              <Text style={styles.acceptButtonText}>Kabul Et</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Accepted Actions */}
      {offer.status === 'accepted' && (
        <View style={[styles.bottomActions, {
          backgroundColor: isDark ? 'rgba(9, 9, 11, 0.98)' : colors.background,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
          paddingBottom: insets.bottom + TAB_BAR_HEIGHT
        }]}>
          <TouchableOpacity
            style={[styles.secondaryButton, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.surface,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : colors.border
            }]}
            onPress={handleNavigateToChat}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Mesaj</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Contract', { contractId: offer.id })}>
            <LinearGradient
              colors={['#10b981', '#34d399']}
              style={styles.primaryButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="document-text" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Sözleşmeyi Görüntüle</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Rejected Actions */}
      {offer.status === 'rejected' && (
        <View style={[styles.bottomActions, {
          backgroundColor: isDark ? 'rgba(9, 9, 11, 0.98)' : colors.background,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
          paddingBottom: insets.bottom + TAB_BAR_HEIGHT
        }]}>
          <TouchableOpacity style={styles.fullWidthButton} onPress={() => navigation.goBack()}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.fullWidthButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
              <Text style={styles.fullWidthButtonText}>Tekliflere Dön</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Counter Offer Modal */}
      <Modal
        visible={showNegotiate}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNegotiate(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {/* Modal Handle */}
            <View style={styles.modalHandle}>
              <View style={[styles.modalHandleBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : colors.border }]} />
            </View>

            <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Karşı Teklif Gönder</Text>
              <TouchableOpacity onPress={() => setShowNegotiate(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Current Price */}
              <View style={[styles.currentPriceCard, {
                backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.06)',
                borderColor: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.15)'
              }]}>
                <Text style={[styles.currentPriceLabel, { color: colors.textMuted }]}>Mevcut Teklif</Text>
                <Text style={[styles.currentPriceValue, { color: colors.brand[500] }]}>₺{offer.amount.toLocaleString('tr-TR')}</Text>
              </View>

              {/* Quick Amount Buttons */}
              <Text style={[styles.modalLabel, { color: colors.textMuted }]}>Hızlı Seçim</Text>
              <View style={styles.quickAmountContainer}>
                {quickAmounts.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.quickAmountButton,
                      {
                        backgroundColor: selectedQuickAmount === item.value
                          ? (isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.1)')
                          : (isDark ? 'rgba(255,255,255,0.05)' : colors.surface),
                        borderColor: selectedQuickAmount === item.value
                          ? colors.brand[500]
                          : (isDark ? 'rgba(255,255,255,0.1)' : colors.border)
                      }
                    ]}
                    onPress={() => {
                      setSelectedQuickAmount(item.value);
                      setCounterOfferAmount('');
                    }}
                  >
                    <Text style={[styles.quickAmountLabel, { color: colors.textMuted }]}>{item.label}</Text>
                    <Text style={[styles.quickAmountValue, { color: selectedQuickAmount === item.value ? colors.brand[500] : colors.text }]}>
                      ₺{item.value.toLocaleString('tr-TR')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Amount */}
              <Text style={[styles.modalLabel, { color: colors.textMuted, marginTop: 20 }]}>Veya Özel Tutar Girin</Text>
              <View style={[styles.modalInputContainer, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surface,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border
              }]}>
                <Text style={[styles.modalCurrency, { color: colors.text }]}>₺</Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  value={counterOfferAmount}
                  onChangeText={(text) => {
                    setCounterOfferAmount(formatCurrency(text));
                    setSelectedQuickAmount(null);
                  }}
                  keyboardType="number-pad"
                />
              </View>

              {/* Note */}
              <Text style={[styles.modalLabel, { color: colors.textMuted, marginTop: 20 }]}>Not (Opsiyonel)</Text>
              <TextInput
                style={[styles.modalTextArea, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surface,
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
                  color: colors.text
                }]}
                placeholder="Pazarlık nedeninizi açıklayın..."
                placeholderTextColor={colors.textMuted}
                value={counterOfferNote}
                onChangeText={setCounterOfferNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={[styles.modalActions, { borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}>
              <TouchableOpacity
                style={[styles.modalCancelButton, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.surface
                }]}
                onPress={() => setShowNegotiate(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitButton} onPress={handleSendCounterOffer}>
                <LinearGradient
                  colors={gradients.primary}
                  style={styles.modalSubmitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="send" size={18} color="white" />
                  <Text style={styles.modalSubmitText}>Gönder</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        animationType="fade"
        transparent
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContent, {
            backgroundColor: colors.background,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border
          }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Paylaş</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]} />
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              setShowMenu(false);
              navigation.navigate('CompareOffers', { quoteRequestId: offer.id });
            }}>
              <Ionicons name="git-compare-outline" size={22} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Teklifleri Karşılaştır</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]} />
            <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
              <Ionicons name="flag-outline" size={22} color={colors.error} />
              <Text style={[styles.menuItemText, { color: colors.error }]}>Bildir</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Animated Header
  animatedHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: 1 },
  animatedHeaderContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8 },
  headerBackBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerMenuBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  animatedHeaderTitle: { flex: 1, alignItems: 'center' },
  animatedHeaderText: { fontSize: 16, fontWeight: '600' },
  animatedHeaderSubtext: { fontSize: 12, marginTop: 2 },

  // Hero
  heroContainer: { marginBottom: 16 },
  heroGradient: { paddingBottom: 80, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  heroBackButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroActions: { flexDirection: 'row', gap: 8 },
  heroActionButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroContent: { paddingHorizontal: 24, paddingTop: 20 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  heroStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  heroStatusText: { color: 'white', fontSize: 13, fontWeight: '600' },
  heroDiscountBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.35)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  heroDiscountText: { color: 'white', fontSize: 12, fontWeight: '600' },
  heroServiceInfo: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  heroCategoryIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  heroServiceText: { flex: 1 },
  heroTitle: { color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  heroPriceContainer: { marginTop: 4 },
  heroPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroPriceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 },
  heroPriceValues: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  heroOriginalPrice: { color: 'rgba(255,255,255,0.5)', fontSize: 16, textDecorationLine: 'line-through' },
  heroPrice: { color: 'white', fontSize: 32, fontWeight: '700' },
  heroValidityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  heroValidUntil: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '500' },

  // Sections
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '600', marginBottom: 12 },
  sectionLink: { fontSize: 14, fontWeight: '500' },

  // Provider Card
  providerCardWrapper: { marginTop: -50, paddingHorizontal: 20, marginBottom: 8 },
  providerCard: { borderRadius: 20, padding: 18, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
  providerMainInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 0 },
  providerImage: { width: 60, height: 60, borderRadius: 16 },
  providerDetails: { flex: 1, marginLeft: 14 },
  providerNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  providerName: { fontSize: 18, fontWeight: '700' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  verifiedText: { fontSize: 11, fontWeight: '600' },
  providerRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  providerRating: { fontSize: 15, fontWeight: '700', marginLeft: 2 },
  providerReviewCount: { fontSize: 13 },
  providerStatsRow: { flexDirection: 'row', paddingTop: 16, marginBottom: 16, borderTopWidth: 1 },
  providerStatBox: { flex: 1, alignItems: 'center', gap: 4 },
  providerStatValue: { fontSize: 16, fontWeight: '700' },
  providerStatLabel: { fontSize: 11 },
  providerStatDivider: { width: 1, height: 40 },
  providerActionsRow: { flexDirection: 'row', gap: 10 },
  providerActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  providerActionText: { fontSize: 13, fontWeight: '600' },
  providerProfileBtn: { flex: 1 },

  // Event Card
  eventCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  eventIconContainer: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  eventInfo: { flex: 1, marginLeft: 14 },
  eventTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  eventDetails: { gap: 4 },
  eventDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventDetailText: { fontSize: 13 },

  // Price Breakdown
  priceBreakdown: { padding: 20, borderRadius: 16, borderWidth: 1 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 14, fontWeight: '500' },
  priceDivider: { height: 1, marginVertical: 12 },
  priceTotalLabel: { fontSize: 16, fontWeight: '600' },
  priceTotalValue: { fontSize: 20, fontWeight: '700' },
  priceMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  priceMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priceMetaText: { fontSize: 12 },

  // Notes
  notesCard: { padding: 16, borderRadius: 16, borderWidth: 1, flexDirection: 'row' },
  notesIcon: { marginRight: 12, marginTop: 2 },
  notesText: { flex: 1, fontSize: 14, lineHeight: 22 },

  // Timeline
  timelineCard: { padding: 20, borderRadius: 16, borderWidth: 1 },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timelineLeft: { alignItems: 'center', marginRight: 14 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineLine: { width: 2, flex: 1, marginTop: 6 },
  timelineContent: { flex: 1, paddingBottom: 8 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  timelineBy: { fontSize: 14, fontWeight: '600' },
  timelineDate: { fontSize: 12 },
  timelineAmount: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  timelineMessage: { fontSize: 13 },

  // Comparison
  comparisonCard: { padding: 20, borderRadius: 16, borderWidth: 1 },
  comparisonStats: { flexDirection: 'row', alignItems: 'center' },
  comparisonStatItem: { flex: 1, alignItems: 'center' },
  comparisonStatIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  comparisonStatValue: { fontSize: 20, fontWeight: '700' },
  comparisonStatLabel: { fontSize: 12, marginTop: 2 },
  comparisonDivider: { width: 1, height: 50 },

  // Contract
  contractCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, borderWidth: 1 },
  contractIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  contractInfo: { flex: 1 },
  contractTitle: { fontSize: 16, fontWeight: '600' },
  contractStatus: { fontSize: 13, marginTop: 4 },

  // Bottom Actions
  bottomActions: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, borderTopWidth: 1, gap: 12 },
  rejectButton: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  negotiateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20, borderRadius: 16, borderWidth: 1 },
  negotiateButtonText: { fontSize: 14, fontWeight: '600' },
  acceptButton: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  acceptButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  acceptButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
  secondaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16, borderWidth: 1 },
  secondaryButtonText: { fontSize: 15, fontWeight: '600' },
  primaryButton: { flex: 1.5, borderRadius: 16, overflow: 'hidden' },
  primaryButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  primaryButtonText: { fontSize: 15, fontWeight: '600', color: 'white' },
  fullWidthButton: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  fullWidthButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  fullWidthButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '85%' },
  modalHandle: { alignItems: 'center', paddingTop: 12, paddingBottom: 8 },
  modalHandleBar: { width: 40, height: 4, borderRadius: 2 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalCloseBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  modalBody: { padding: 20 },
  currentPriceCard: { padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginBottom: 24 },
  currentPriceLabel: { fontSize: 13, marginBottom: 4 },
  currentPriceValue: { fontSize: 32, fontWeight: '700' },
  modalLabel: { fontSize: 14, fontWeight: '500', marginBottom: 10 },
  quickAmountContainer: { flexDirection: 'row', gap: 10 },
  quickAmountButton: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1.5, alignItems: 'center' },
  quickAmountLabel: { fontSize: 11, marginBottom: 4 },
  quickAmountValue: { fontSize: 14, fontWeight: '600' },
  modalInputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16, borderRadius: 14, borderWidth: 1 },
  modalCurrency: { fontSize: 22, fontWeight: '700', marginRight: 10 },
  modalInput: { flex: 1, fontSize: 22, fontWeight: '600' },
  modalTextArea: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, fontSize: 14, minHeight: 90 },
  modalActions: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, gap: 12, borderTopWidth: 1 },
  modalCancelButton: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '600' },
  modalSubmitButton: { flex: 1.5, borderRadius: 14, overflow: 'hidden' },
  modalSubmitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  modalSubmitText: { fontSize: 15, fontWeight: '600', color: 'white' },

  // Menu
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 100, paddingRight: 20 },
  menuContent: { width: 220, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 16 },
  menuItemText: { fontSize: 15, fontWeight: '500' },
  menuDivider: { height: 1, marginHorizontal: 18 },
});
