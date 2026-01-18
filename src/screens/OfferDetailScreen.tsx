import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Linking,
  Share,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { offers } from '../data/mockData';
import { enhancedOffers, providerOffers, organizerOffers, getCategoryGradient, OfferHistoryItem } from '../data/offersData';
import { useApp } from '../../App';
import { OfferTimeline } from '../components/offers/OfferTimeline';
import { OptimizedImage } from '../components/OptimizedImage';

interface OfferData {
  id: string;
  counterpartyName: string;
  counterpartyImage: string;
  counterpartyRating: number;
  counterpartyReviewCount: number;
  counterpartyVerified: boolean;
  counterpartyCompletedJobs: number;
  counterpartyResponseTime: string;
  counterpartyPhone: string;
  counterpartyType: 'provider' | 'organizer';
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
  createdAt: string;
}

export function OfferDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const { isProviderMode } = useApp();
  const insets = useSafeAreaInsets();
  const { offerId } = (route.params as { offerId: string }) || { offerId: 'o1' };

  // Find offer based on mode
  const providerModeOffer = providerOffers.find(o => o.id === offerId);
  const organizerOffer = organizerOffers.find(o => o.id === offerId);
  const enhancedOffer = enhancedOffers.find(o => o.id === offerId);
  const legacyOffer = offers.find(o => o.id === offerId);

  const buildOfferData = (): OfferData => {
    if (isProviderMode && providerModeOffer) {
      return {
        id: providerModeOffer.id,
        counterpartyName: providerModeOffer.organizer.name,
        counterpartyImage: providerModeOffer.organizer.image,
        counterpartyRating: 4.7,
        counterpartyReviewCount: 45,
        counterpartyVerified: true,
        counterpartyCompletedJobs: 120,
        counterpartyResponseTime: '3 saat',
        counterpartyPhone: '+90 532 987 6543',
        counterpartyType: 'organizer',
        service: providerModeOffer.role,
        category: providerModeOffer.serviceCategory,
        eventTitle: providerModeOffer.eventTitle,
        eventId: providerModeOffer.eventId,
        eventDate: providerModeOffer.eventDate,
        eventVenue: providerModeOffer.location,
        amount: providerModeOffer.amount,
        originalAmount: providerModeOffer.amount,
        discount: 0,
        status: providerModeOffer.status,
        notes: providerModeOffer.counterOffer?.message || '',
        validUntil: '7 gün',
        deliveryTime: '3 gün',
        createdAt: providerModeOffer.date,
      };
    }

    if (!isProviderMode && organizerOffer) {
      return {
        id: organizerOffer.id,
        counterpartyName: organizerOffer.provider.name,
        counterpartyImage: organizerOffer.provider.image,
        counterpartyRating: organizerOffer.provider.rating || 4.8,
        counterpartyReviewCount: 127,
        counterpartyVerified: organizerOffer.provider.verified,
        counterpartyCompletedJobs: 200,
        counterpartyResponseTime: '2 saat',
        counterpartyPhone: '+90 532 123 4567',
        counterpartyType: 'provider',
        service: organizerOffer.serviceName,
        category: organizerOffer.serviceCategory,
        eventTitle: organizerOffer.eventTitle,
        eventId: 'e1',
        eventDate: '15 Temmuz 2026',
        eventVenue: 'Zorlu PSM, Istanbul',
        amount: organizerOffer.amount,
        originalAmount: organizerOffer.originalBudget,
        discount: organizerOffer.originalBudget > organizerOffer.amount
          ? Math.round((1 - organizerOffer.amount / organizerOffer.originalBudget) * 100)
          : 0,
        status: organizerOffer.status,
        notes: organizerOffer.message || '',
        validUntil: '7 gün',
        deliveryTime: organizerOffer.deliveryTime || '3 gün',
        createdAt: organizerOffer.date || '10 Ocak 2026',
      };
    }

    if (enhancedOffer) {
      return {
        id: enhancedOffer.id,
        counterpartyName: enhancedOffer.provider.name,
        counterpartyImage: enhancedOffer.provider.image,
        counterpartyRating: enhancedOffer.provider.rating || 4.8,
        counterpartyReviewCount: enhancedOffer.provider.reviewCount || 127,
        counterpartyVerified: enhancedOffer.provider.verified,
        counterpartyCompletedJobs: enhancedOffer.provider.completedJobs || 200,
        counterpartyResponseTime: enhancedOffer.provider.responseTime || '2 saat',
        counterpartyPhone: '+90 532 123 4567',
        counterpartyType: 'provider',
        service: enhancedOffer.serviceName,
        category: enhancedOffer.category,
        eventTitle: enhancedOffer.eventTitle,
        eventId: enhancedOffer.eventId || 'e1',
        eventDate: '15 Temmuz 2026',
        eventVenue: 'Zorlu PSM, Istanbul',
        amount: enhancedOffer.amount,
        originalAmount: enhancedOffer.originalBudget,
        discount: enhancedOffer.discountPercent || 0,
        status: enhancedOffer.status,
        notes: enhancedOffer.message,
        validUntil: '7 gün',
        deliveryTime: enhancedOffer.deliveryTime || '3 gün',
        createdAt: '10 Ocak 2026',
      };
    }

    const fallback = legacyOffer || offers[0];
    return {
      id: fallback.id,
      counterpartyName: fallback.providerName,
      counterpartyImage: fallback.providerImage,
      counterpartyRating: 4.8,
      counterpartyReviewCount: 127,
      counterpartyVerified: true,
      counterpartyCompletedJobs: 200,
      counterpartyResponseTime: '2 saat',
      counterpartyPhone: '+90 532 123 4567',
      counterpartyType: 'provider',
      service: fallback.service,
      category: fallback.category,
      eventTitle: fallback.eventTitle,
      eventId: fallback.eventId || 'e1',
      eventDate: '15 Temmuz 2026',
      eventVenue: 'Zorlu PSM, Istanbul',
      amount: fallback.amount,
      originalAmount: fallback.originalAmount || fallback.amount,
      discount: fallback.discount || 0,
      status: fallback.status,
      notes: fallback.notes || '',
      validUntil: fallback.validUntil || '7 gün',
      deliveryTime: '3 gün',
      createdAt: fallback.createdAt || '10 Ocak 2026',
    };
  };

  const [offer, setOffer] = useState<OfferData>(buildOfferData);
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [counterOfferNote, setCounterOfferNote] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleAcceptOffer = () => {
    Alert.alert(
      'Teklifi Kabul Et',
      `${offer.counterpartyName} firmasinin ₺${offer.amount.toLocaleString('tr-TR')} tutarindaki teklifini kabul etmek istediginize emin misiniz?`,
      [
        { text: 'Iptal', style: 'cancel' },
        {
          text: 'Kabul Et',
          onPress: () => {
            setOffer({ ...offer, status: 'accepted' });
            Alert.alert('Teklif Kabul Edildi', 'Sozlesme olusturuldu.');
          }
        },
      ]
    );
  };

  const handleRejectOffer = () => {
    Alert.alert(
      'Teklifi Reddet',
      'Bu teklifi reddetmek istediginize emin misiniz?',
      [
        { text: 'Iptal', style: 'cancel' },
        {
          text: 'Reddet',
          style: 'destructive',
          onPress: () => {
            setOffer({ ...offer, status: 'rejected' });
            navigation.goBack();
          }
        },
      ]
    );
  };

  const handleSendCounterOffer = () => {
    const amount = selectedQuickAmount || parseInt(counterOfferAmount.replace(/\./g, ''));
    if (!amount || amount <= 0) {
      Alert.alert('Hata', 'Lutfen gecerli bir tutar girin');
      return;
    }
    setShowNegotiate(false);
    setOffer({ ...offer, status: 'counter_offered' as any });
    Alert.alert('Karsi Teklif Gonderildi', `₺${amount.toLocaleString('tr-TR')} tutarindaki teklifiniz iletildi.`);
  };

  const handleCall = () => Linking.openURL(`tel:${offer.counterpartyPhone}`);
  const handleChat = () => navigation.navigate('Chat', { chatId: `provider_${offer.id}`, recipientName: offer.counterpartyName });
  const handleShare = async () => {
    try {
      await Share.share({ message: `${offer.counterpartyName} - ${offer.service}\n₺${offer.amount.toLocaleString('tr-TR')}` });
    } catch {}
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bg: string; icon: string }> = {
      pending: { label: 'Beklemede', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', icon: 'time-outline' },
      accepted: { label: 'Kabul Edildi', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', icon: 'checkmark-circle-outline' },
      rejected: { label: 'Reddedildi', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', icon: 'close-circle-outline' },
      counter_offered: { label: 'Pazarlik', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', icon: 'swap-horizontal-outline' },
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(offer.status);
  const quickAmounts = [
    { label: '%5', value: Math.round(offer.amount * 0.95) },
    { label: '%10', value: Math.round(offer.amount * 0.90) },
    { label: '%15', value: Math.round(offer.amount * 0.85) },
  ];

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#09090B' : '#F8FAFC' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Teklif Detayi</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
            colors={[colors.brand[500]]}
          />
        }
      >
        {/* Status & Amount Card */}
        <View style={[styles.amountCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <View style={styles.amountHeader}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>
            <View style={styles.validBadge}>
              <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.validText, { color: colors.textSecondary }]}>{offer.validUntil} gecerli</Text>
            </View>
          </View>

          <View style={styles.serviceRow}>
            <View style={[styles.serviceIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)' }]}>
              <Ionicons
                name={offer.category === 'technical' ? 'hardware-chip-outline' : offer.category === 'booking' ? 'musical-notes-outline' : 'cube-outline'}
                size={20}
                color="#6366F1"
              />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={[styles.serviceName, { color: colors.text }]}>{offer.service}</Text>
              <Text style={[styles.eventName, { color: colors.textSecondary }]}>{offer.eventTitle}</Text>
            </View>
          </View>

          <View style={styles.amountSection}>
            <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Teklif Tutari</Text>
            <View style={styles.amountRow}>
              {offer.discount > 0 && (
                <Text style={[styles.originalAmount, { color: colors.textSecondary }]}>
                  ₺{offer.originalAmount.toLocaleString('tr-TR')}
                </Text>
              )}
              <Text style={[styles.amount, { color: colors.text }]}>₺{offer.amount.toLocaleString('tr-TR')}</Text>
              {offer.discount > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>%{offer.discount}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Provider Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {offer.counterpartyType === 'organizer' ? 'Organizator' : 'Hizmet Saglayici'}
          </Text>

          <TouchableOpacity
            style={styles.providerRow}
            onPress={() => !isProviderMode && navigation.navigate('ProviderDetail', { providerId: offer.id })}
            activeOpacity={0.7}
          >
            <OptimizedImage source={offer.counterpartyImage} style={styles.providerImage} />
            <View style={styles.providerInfo}>
              <View style={styles.providerNameRow}>
                <Text style={[styles.providerName, { color: colors.text }]}>{offer.counterpartyName}</Text>
                {offer.counterpartyVerified && (
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                )}
              </View>
              <View style={styles.providerRating}>
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text style={[styles.ratingText, { color: colors.text }]}>{offer.counterpartyRating}</Text>
                <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>({offer.counterpartyReviewCount})</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.providerStats, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{offer.counterpartyCompletedJobs}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Is</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{offer.counterpartyResponseTime}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Yanit</Text>
            </View>
          </View>

          <View style={styles.providerActions}>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnCall]} onPress={handleCall}>
              <Ionicons name="call-outline" size={18} color="#10B981" />
              <Text style={[styles.actionBtnText, { color: '#10B981' }]}>Ara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnChat]} onPress={handleChat}>
              <Ionicons name="chatbubble-outline" size={18} color="#6366F1" />
              <Text style={[styles.actionBtnText, { color: '#6366F1' }]}>Mesaj</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Event Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Etkinlik</Text>
          <TouchableOpacity
            style={styles.eventRow}
            onPress={() => navigation.navigate(isProviderMode ? 'ProviderEventDetail' : 'OrganizerEventDetail', { eventId: offer.eventId })}
            activeOpacity={0.7}
          >
            <View style={[styles.eventIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)' }]}>
              <Ionicons name="calendar-outline" size={20} color="#6366F1" />
            </View>
            <View style={styles.eventInfo}>
              <Text style={[styles.eventTitle, { color: colors.text }]}>{offer.eventTitle}</Text>
              <View style={styles.eventMeta}>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.eventMetaText, { color: colors.textSecondary }]}>{offer.eventDate}</Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.eventMetaText, { color: colors.textSecondary }]}>{offer.eventVenue}</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Details Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Detaylar</Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Hizmet Bedeli</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>₺{offer.originalAmount.toLocaleString('tr-TR')}</Text>
          </View>

          {offer.discount > 0 && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: '#10B981' }]}>Indirim</Text>
              <Text style={[styles.detailValue, { color: '#10B981' }]}>-₺{(offer.originalAmount - offer.amount).toLocaleString('tr-TR')}</Text>
            </View>
          )}

          <View style={[styles.totalRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Toplam</Text>
            <Text style={[styles.totalValue, { color: '#6366F1' }]}>₺{offer.amount.toLocaleString('tr-TR')}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>Teslimat: {offer.deliveryTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{offer.createdAt}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {offer.notes && (
          <View style={[styles.card, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Not</Text>
            <Text style={[styles.notesText, { color: colors.text }]}>{offer.notes}</Text>
          </View>
        )}

        {/* Offer Timeline / History */}
        {isProviderMode && providerModeOffer?.history && providerModeOffer.history.length > 0 && (
          <View style={[styles.card, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Teklif Gecmisi</Text>
            <OfferTimeline history={providerModeOffer.history} />
          </View>
        )}

        {/* Contract Link (if accepted) */}
        {offer.status === 'accepted' && (
          <TouchableOpacity
            style={[styles.contractCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }]}
            onPress={() => navigation.navigate('Contract', { contractId: offer.id })}
          >
            <View style={styles.contractIcon}>
              <Ionicons name="document-text-outline" size={24} color="#10B981" />
            </View>
            <View style={styles.contractInfo}>
              <Text style={[styles.contractTitle, { color: colors.text }]}>Sozlesme</Text>
              <Text style={[styles.contractStatus, { color: '#10B981' }]}>Imza bekliyor</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#10B981" />
          </TouchableOpacity>
        )}

        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Bottom Actions */}
      {!isProviderMode && offer.status !== 'accepted' && offer.status !== 'rejected' && (
        <View style={[styles.bottomBar, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', paddingBottom: Math.max(insets.bottom, 34) + 70, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
          <TouchableOpacity style={styles.rejectBtn} onPress={handleRejectOffer}>
            <Ionicons name="close" size={22} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.negotiateBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]} onPress={() => setShowNegotiate(true)}>
            <Ionicons name="swap-horizontal" size={18} color={colors.text} />
            <Text style={[styles.negotiateBtnText, { color: colors.text }]}>Pazarlik</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={handleAcceptOffer}>
            <Text style={styles.acceptBtnText}>Kabul Et</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Accepted State Actions */}
      {offer.status === 'accepted' && (
        <View style={[styles.bottomBar, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', paddingBottom: Math.max(insets.bottom, 34) + 70, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]} onPress={handleChat}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Mesaj</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Contract', { contractId: offer.id })}>
            <Text style={styles.primaryBtnText}>Sozlesmeyi Gor</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Counter Offer Modal */}
      <Modal visible={showNegotiate} animationType="slide" transparent onRequestClose={() => setShowNegotiate(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={styles.modalHandle}>
              <View style={[styles.modalHandleBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#E2E8F0' }]} />
            </View>

            <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Karsi Teklif</Text>
              <TouchableOpacity onPress={() => setShowNegotiate(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={[styles.currentOffer, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)' }]}>
                <Text style={[styles.currentOfferLabel, { color: colors.textSecondary }]}>Mevcut Teklif</Text>
                <Text style={[styles.currentOfferValue, { color: '#6366F1' }]}>₺{offer.amount.toLocaleString('tr-TR')}</Text>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Hizli Secim</Text>
              <View style={styles.quickOptions}>
                {quickAmounts.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.quickOption,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: selectedQuickAmount === item.value ? '#6366F1' : (isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0') }
                    ]}
                    onPress={() => { setSelectedQuickAmount(item.value); setCounterOfferAmount(''); }}
                  >
                    <Text style={[styles.quickOptionLabel, { color: colors.textSecondary }]}>{item.label} dusuk</Text>
                    <Text style={[styles.quickOptionValue, { color: selectedQuickAmount === item.value ? '#6366F1' : colors.text }]}>₺{item.value.toLocaleString('tr-TR')}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 20 }]}>Ozel Tutar</Text>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                <Text style={[styles.inputPrefix, { color: colors.text }]}>₺</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  value={counterOfferAmount}
                  onChangeText={(t) => { setCounterOfferAmount(formatCurrency(t)); setSelectedQuickAmount(null); }}
                  keyboardType="number-pad"
                />
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 20 }]}>Not (Opsiyonel)</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0', color: colors.text }]}
                placeholder="Aciklama ekleyin..."
                placeholderTextColor={colors.textSecondary}
                value={counterOfferNote}
                onChangeText={setCounterOfferNote}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
              <TouchableOpacity style={[styles.modalCancelBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]} onPress={() => setShowNegotiate(false)}>
                <Text style={[styles.modalCancelText, { color: colors.text }]}>Iptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSendCounterOffer}>
                <Text style={styles.modalSubmitText}>Gonder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600' },

  content: { flex: 1 },

  // Amount Card
  amountCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { fontSize: 13, fontWeight: '600' },
  validBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  validText: { fontSize: 12 },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: { flex: 1, marginLeft: 12 },
  serviceName: { fontSize: 17, fontWeight: '600', marginBottom: 2 },
  eventName: { fontSize: 13 },
  amountSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  amountLabel: { fontSize: 12, marginBottom: 6 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  originalAmount: { fontSize: 16, textDecorationLine: 'line-through' },
  amount: { fontSize: 32, fontWeight: '700' },
  discountBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: { color: 'white', fontSize: 12, fontWeight: '600' },

  // Cards
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  cardTitle: { fontSize: 13, fontWeight: '600', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.6 },

  // Provider
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerImage: { width: 48, height: 48, borderRadius: 12 },
  providerInfo: { flex: 1, marginLeft: 12 },
  providerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  providerName: { fontSize: 16, fontWeight: '600' },
  providerRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '600' },
  reviewCount: { fontSize: 13 },
  providerStats: {
    flexDirection: 'row',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 30 },
  providerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionBtnCall: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  actionBtnChat: { backgroundColor: 'rgba(99, 102, 241, 0.1)' },
  actionBtnText: { fontSize: 14, fontWeight: '600' },

  // Event
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: { flex: 1, marginLeft: 12 },
  eventTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  eventMeta: { gap: 4 },
  eventMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventMetaText: { fontSize: 13 },

  // Details
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: '500' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: '700' },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12 },

  // Notes
  notesText: { fontSize: 14, lineHeight: 22 },

  // Contract
  contractCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  contractIcon: { marginRight: 12 },
  contractInfo: { flex: 1 },
  contractTitle: { fontSize: 15, fontWeight: '600' },
  contractStatus: { fontSize: 13, marginTop: 2 },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  rejectBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  negotiateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  negotiateBtnText: { fontSize: 14, fontWeight: '600' },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600' },
  primaryBtn: {
    flex: 1.5,
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: 'white', fontSize: 15, fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  modalHandle: { alignItems: 'center', paddingTop: 12, paddingBottom: 8 },
  modalHandleBar: { width: 40, height: 4, borderRadius: 2 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalBody: { padding: 20 },
  currentOffer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  currentOfferLabel: { fontSize: 12, marginBottom: 4 },
  currentOfferValue: { fontSize: 28, fontWeight: '700' },
  inputLabel: { fontSize: 13, fontWeight: '500', marginBottom: 10 },
  quickOptions: { flexDirection: 'row', gap: 10 },
  quickOption: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  quickOptionLabel: { fontSize: 11, marginBottom: 4 },
  quickOptionValue: { fontSize: 13, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputPrefix: { fontSize: 20, fontWeight: '600', marginRight: 8 },
  input: { flex: 1, fontSize: 20, fontWeight: '600' },
  textArea: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600' },
  modalSubmitBtn: {
    flex: 1.5,
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSubmitText: { color: 'white', fontSize: 15, fontWeight: '600' },
});

export default OfferDetailScreen;
