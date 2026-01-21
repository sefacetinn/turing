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
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { getCategoryGradient, OfferHistoryItem } from '../data/offersData';
import { useApp } from '../../App';
import { OfferTimeline } from '../components/offers/OfferTimeline';
import { OptimizedImage } from '../components/OptimizedImage';
import { useOffer, useEvent, respondToOfferRequest, sendCounterOffer, acceptOffer, rejectOffer } from '../hooks';
import { useAuth } from '../context/AuthContext';

interface OfferData {
  id: string;
  counterpartyId: string;
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
  eventTime?: string;
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
  const { offerId } = (route.params as { offerId: string }) || { offerId: '' };
  const { user } = useAuth();

  // Fetch offer from Firebase
  const { offer: firebaseOffer, loading: isLoading } = useOffer(offerId);

  // Fetch event details for venue information
  const { event: eventData } = useEvent(firebaseOffer?.eventId);

  // Convert Firebase offer to local format
  const offer: OfferData | null = React.useMemo(() => {
    if (!firebaseOffer) return null;

    // Determine if current user is provider or organizer for this offer
    const isUserProvider = user?.uid === firebaseOffer.providerId;

    return {
      id: firebaseOffer.id,
      // Show the other party's info
      counterpartyId: isUserProvider ? firebaseOffer.organizerId : firebaseOffer.providerId,
      counterpartyName: isUserProvider
        ? (firebaseOffer.organizerName || 'Organizatör')
        : (firebaseOffer.providerName || 'Tedarikçi'),
      counterpartyImage: isUserProvider
        ? (firebaseOffer.organizerImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100')
        : (firebaseOffer.providerImage || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200'),
      counterpartyRating: 4.5,
      counterpartyReviewCount: 0,
      counterpartyVerified: true,
      counterpartyCompletedJobs: 0,
      counterpartyResponseTime: '24 saat içinde',
      counterpartyPhone: isUserProvider
        ? (firebaseOffer.organizerPhone || '')
        : (firebaseOffer.providerPhone || ''),
      counterpartyType: isUserProvider ? 'organizer' : 'provider',
      service: firebaseOffer.artistName || firebaseOffer.serviceCategory || 'Hizmet',
      category: firebaseOffer.serviceCategory || 'booking',
      eventTitle: firebaseOffer.eventTitle || 'Etkinlik',
      eventId: firebaseOffer.eventId,
      eventDate: firebaseOffer.eventDate || '',
      eventTime: firebaseOffer.eventTime || '',
      eventVenue: firebaseOffer.eventCity || '',
      amount: firebaseOffer.amount || (firebaseOffer.requestedBudget ? parseInt(firebaseOffer.requestedBudget) : 0),
      originalAmount: firebaseOffer.amount || (firebaseOffer.requestedBudget ? parseInt(firebaseOffer.requestedBudget) : 0),
      requestedBudget: firebaseOffer.requestedBudget ? parseInt(firebaseOffer.requestedBudget) : 0,
      discount: 0,
      status: firebaseOffer.status,
      notes: firebaseOffer.notes || firebaseOffer.message || '',
      message: firebaseOffer.message || '',
      validUntil: firebaseOffer.validUntil ? firebaseOffer.validUntil.toLocaleDateString('tr-TR') : '',
      deliveryTime: '',
      createdAt: firebaseOffer.createdAt ? firebaseOffer.createdAt.toLocaleDateString('tr-TR') : '',
    };
  }, [firebaseOffer, user]);

  // Build offer history from Firebase data
  const offerHistory: OfferHistoryItem[] = React.useMemo(() => {
    if (!firebaseOffer) return [];

    const history: OfferHistoryItem[] = [];

    // 1. Initial request from organizer (always first)
    if (firebaseOffer.createdAt) {
      history.push({
        id: 'request',
        type: 'submitted',
        by: 'organizer',
        date: firebaseOffer.createdAt.toLocaleDateString('tr-TR'),
        message: firebaseOffer.notes,
        amount: firebaseOffer.requestedBudget ? parseInt(firebaseOffer.requestedBudget) : undefined,
      });
    }

    // 2. Use offerHistory array if available (new format)
    if (firebaseOffer.offerHistory && firebaseOffer.offerHistory.length > 0) {
      firebaseOffer.offerHistory.forEach((item: any, index: number) => {
        history.push({
          id: `history-${index}`,
          type: item.type === 'quote' ? 'submitted' : item.type,
          by: item.by,
          date: item.timestamp?.toLocaleDateString?.('tr-TR') || '',
          amount: item.amount,
          message: item.message,
        });
      });
    } else {
      // Fallback: reconstruct from individual fields (old format)
      // 2. Provider responds with quote
      if (firebaseOffer.status !== 'pending' && firebaseOffer.amount) {
        history.push({
          id: 'quote',
          type: 'submitted',
          by: 'provider',
          date: '',
          amount: firebaseOffer.amount,
          message: firebaseOffer.message,
        });
      }

      // 3. Counter offer (if exists) - only the last one
      if (firebaseOffer.counterAmount) {
        history.push({
          id: 'counter',
          type: 'counter',
          by: firebaseOffer.counterBy || 'organizer',
          date: firebaseOffer.counterAt?.toLocaleDateString('tr-TR') || '',
          amount: firebaseOffer.counterAmount,
          message: firebaseOffer.counterMessage,
        });
      }
    }

    // 4. Final status (accepted/rejected)
    if (firebaseOffer.status === 'accepted') {
      history.push({
        id: 'accepted',
        type: 'accepted',
        by: firebaseOffer.acceptedBy || 'organizer',
        date: firebaseOffer.acceptedAt?.toLocaleDateString('tr-TR') || firebaseOffer.updatedAt?.toLocaleDateString('tr-TR') || '',
        amount: firebaseOffer.finalAmount || firebaseOffer.counterAmount || firebaseOffer.amount,
      });
    } else if (firebaseOffer.status === 'rejected') {
      history.push({
        id: 'rejected',
        type: 'rejected',
        by: firebaseOffer.rejectedBy || 'organizer',
        date: firebaseOffer.rejectedAt?.toLocaleDateString('tr-TR') || firebaseOffer.updatedAt?.toLocaleDateString('tr-TR') || '',
        message: firebaseOffer.rejectionReason,
      });
    }

    return history;
  }, [firebaseOffer]);

  const [showNegotiate, setShowNegotiate] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [scopeExpanded, setScopeExpanded] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [providerExpanded, setProviderExpanded] = useState(false);
  const [artistExpanded, setArtistExpanded] = useState(false);
  const [venueExpanded, setVenueExpanded] = useState(false);
  const [eventExpanded, setEventExpanded] = useState(false);
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [counterOfferNote, setCounterOfferNote] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteNote, setQuoteNote] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState<string | null>(null);
  const [customRejectionReason, setCustomRejectionReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Rejection reason options
  const rejectionReasons = [
    { id: 'budget', label: 'Bütçe uygun değil', description: 'Talep edilen fiyat bütçemizi aşıyor' },
    { id: 'date', label: 'Tarih uygun değil', description: 'Belirtilen tarih için müsait değiliz' },
    { id: 'service', label: 'Hizmet kapsamı uygun değil', description: 'İstenen hizmetler sunduğumuz kapsam dışında' },
    { id: 'other', label: 'Diğer', description: 'Özel bir neden belirtin' },
  ];

  // Check if current user is the provider for this offer
  const isUserProvider = user?.uid === firebaseOffer?.providerId;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleAcceptOffer = () => {
    if (!offer || !offerId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Determine the display amount (counter offer amount or original amount)
    const displayAmount = firebaseOffer?.counterAmount || offer.amount;

    Alert.alert(
      'Teklifi Kabul Et',
      `${offer.counterpartyName} firmasinin ₺${displayAmount.toLocaleString('tr-TR')} tutarindaki teklifini kabul etmek istediginize emin misiniz?`,
      [
        { text: 'Iptal', style: 'cancel' },
        {
          text: 'Kabul Et',
          onPress: async () => {
            try {
              const acceptedBy = isUserProvider ? 'provider' : 'organizer';
              await acceptOffer(offerId, acceptedBy);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Teklif Kabul Edildi', 'Sozlesme olusturuldu.');
            } catch (error: any) {
              console.warn('Error accepting offer:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Hata', error.message || 'Teklif kabul edilirken bir hata olustu.');
            }
          }
        },
      ]
    );
  };

  const handleRejectOffer = () => {
    if (!offer || !offerId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Show rejection reason modal instead of direct alert
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!offer || !offerId) return;
    if (!selectedRejectionReason) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Lütfen bir red nedeni seçin');
      return;
    }
    if (selectedRejectionReason === 'other' && !customRejectionReason.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Lütfen red nedeninizi yazın');
      return;
    }

    try {
      const reason = selectedRejectionReason === 'other'
        ? customRejectionReason
        : rejectionReasons.find(r => r.id === selectedRejectionReason)?.label || '';

      const rejectedBy = isUserProvider ? 'provider' : 'organizer';
      await rejectOffer(offerId, rejectedBy, reason);
      setShowRejectModal(false);
      setSelectedRejectionReason(null);
      setCustomRejectionReason('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Teklif Reddedildi', 'Teklif başarıyla reddedildi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.warn('Error rejecting offer:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', error.message || 'Teklif reddedilirken bir hata olustu.');
    }
  };

  const handleSendCounterOffer = async () => {
    if (!offer || !offerId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const amount = selectedQuickAmount || parseInt(counterOfferAmount.replace(/\./g, ''));
    if (!amount || amount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Lutfen gecerli bir tutar girin');
      return;
    }
    try {
      const counterBy = isUserProvider ? 'provider' : 'organizer';
      await sendCounterOffer(offerId, amount, counterBy, counterOfferNote || undefined);
      setShowNegotiate(false);
      setCounterOfferAmount('');
      setCounterOfferNote('');
      setSelectedQuickAmount(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Karşı Teklif Gönderildi',
        `₺${amount.toLocaleString('tr-TR')} tutarındaki teklifiniz iletildi.`,
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.warn('Error sending counter offer:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Karsi teklif gonderilirken bir hata olustu.');
    }
  };

  const handleCall = () => {
    if (!offer) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!offer.counterpartyPhone) {
      Alert.alert('Telefon Numarası Yok', 'Bu kullanıcının telefon numarası kayıtlı değil.');
      return;
    }
    Linking.openURL(`tel:${offer.counterpartyPhone}`);
  };
  const handleChat = () => {
    if (!offer || !firebaseOffer) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate with correct participant info based on who the user is
    const otherUserId = isUserProvider ? firebaseOffer.organizerId : firebaseOffer.providerId;
    const otherUserName = isUserProvider ? (firebaseOffer.organizerName || 'Organizatör') : (firebaseOffer.providerName || 'Tedarikçi');
    const otherUserImage = isUserProvider ? firebaseOffer.organizerImage : firebaseOffer.providerImage;
    navigation.navigate('Chat', {
      providerId: otherUserId,
      providerName: otherUserName,
      providerImage: otherUserImage,
    });
  };
  const handleShare = async () => {
    if (!offer) return;
    try {
      await Share.share({ message: `${offer.counterpartyName} - ${offer.service}\n₺${offer.amount.toLocaleString('tr-TR')}` });
    } catch {}
  };

  // Provider actions
  const handleSendQuote = async () => {
    if (!offer || !offerId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const amount = parseInt(quoteAmount.replace(/\./g, ''));
    if (!amount || amount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Lutfen gecerli bir tutar girin');
      return;
    }
    try {
      // Check if this is the first quote (status is 'pending') or a counter offer
      const isFirstQuote = firebaseOffer?.status === 'pending';

      if (isFirstQuote) {
        // Provider's first response to organizer's request
        await respondToOfferRequest(offerId, amount, quoteNote || undefined);
      } else {
        // This is a counter offer in an ongoing negotiation
        await sendCounterOffer(offerId, amount, 'provider', quoteNote || undefined);
      }

      setShowQuoteModal(false);
      setQuoteAmount('');
      setQuoteNote('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Teklif Gonderildi', `₺${amount.toLocaleString('tr-TR')} tutarindaki teklifiniz organizatore iletildi.`);
    } catch (error) {
      console.warn('Error sending quote:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Teklif gonderilirken bir hata olustu.');
    }
  };

  const handleProviderReject = () => {
    if (!offer || !offerId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Show rejection reason modal - same modal, different flow
    setShowRejectModal(true);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bg: string; icon: string }> = {
      pending: { label: 'Teklif Bekleniyor', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', icon: 'time-outline' },
      quoted: { label: 'Teklif Geldi', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', icon: 'document-text-outline' },
      accepted: { label: 'Kabul Edildi', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', icon: 'checkmark-circle-outline' },
      rejected: { label: 'Reddedildi', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', icon: 'close-circle-outline' },
      counter_offered: { label: 'Pazarlik', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', icon: 'swap-horizontal-outline' },
    };
    return configs[status] || configs.pending;
  };

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#09090B' : '#F8FAFC' }]}>
        <View style={[styles.header, { paddingTop: insets.top, backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Teklif Detayi</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted }}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  // Empty state - no offer found
  if (!offer) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#09090B' : '#F8FAFC' }]}>
        <View style={[styles.header, { paddingTop: insets.top, backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Teklif Detayi</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>Teklif Bulunamadı</Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 8, textAlign: 'center' }}>Bu teklif silinmiş veya mevcut olmayabilir.</Text>
          <TouchableOpacity
            style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.brand[500], borderRadius: 12 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusConfig = getStatusConfig(offer.status);
  const quickAmounts = [
    { label: '%5', value: Math.round(offer.amount * 0.95) },
    { label: '%10', value: Math.round(offer.amount * 0.90) },
    { label: '%15', value: Math.round(offer.amount * 0.85) },
  ];

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
        {/* Status Header */}
        <View style={[styles.statusHeader, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <View style={[styles.heroStatusBadge, { backgroundColor: statusConfig.bg }]}>
            <View style={[styles.heroStatusDot, { backgroundColor: statusConfig.color }]} />
            <Text style={[styles.heroStatusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
          {offer.validUntil && (
            <Text style={[styles.heroValidText, { color: colors.textMuted }]}>{offer.validUntil}'e kadar</Text>
          )}
        </View>

        {/* Combined Info Section */}
        <View style={styles.infoSection}>
          {/* 1. Event Row - Expandable */}
          <TouchableOpacity
            style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}
            onPress={() => setEventExpanded(!eventExpanded)}
            activeOpacity={0.7}
          >
            <View style={[styles.infoCardContent, { minHeight: 82, padding: 18 }]}>
              <View style={[styles.infoIconBox, { width: 52, height: 52, borderRadius: 14, backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)' }]}>
                <Ionicons name="calendar" size={22} color="#6366F1" />
              </View>
              <View style={styles.infoCardDetails}>
                <Text style={[styles.infoName, { color: colors.text, fontSize: 16, fontWeight: '700' }]} numberOfLines={1}>{offer.eventTitle}</Text>
                <View style={[styles.infoMetaRow, { marginTop: 5 }]}>
                  <Ionicons name="calendar-outline" size={13} color="#6366F1" />
                  <Text style={[styles.infoMetaText, { color: '#6366F1', fontSize: 13, fontWeight: '600' }]}>{offer.eventDate || 'Tarih Belirtilmedi'}</Text>
                </View>
                {offer.eventDate && (
                  <View style={[styles.infoMetaRow, { marginTop: 3 }]}>
                    <Ionicons name="today-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.infoMetaText, { color: colors.textSecondary }]}>
                      {(() => {
                        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                        const parts = offer.eventDate.split(/[\/\.\-]/);
                        if (parts.length >= 3) {
                          const day = parseInt(parts[0], 10);
                          const month = parseInt(parts[1], 10) - 1;
                          const year = parseInt(parts[2], 10);
                          const date = new Date(year, month, day);
                          return days[date.getDay()];
                        }
                        return '';
                      })()}
                    </Text>
                  </View>
                )}
              </View>
              <Ionicons name={eventExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
            </View>

            {/* Expanded Content */}
            {eventExpanded && (
              <View style={[styles.scopeExpandedContent, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                {/* Event Description */}
                {eventData?.description && (
                  <Text style={[styles.providerBio, { color: colors.textSecondary }]}>
                    {eventData.description}
                  </Text>
                )}

                {/* Event Stats Row 1 */}
                <View style={styles.providerStats}>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="time-outline" size={16} color="#6366F1" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]}>{eventData?.startTime || offer.eventTime || '--:--'}</Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Saat</Text>
                  </View>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="people-outline" size={16} color="#EC4899" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]}>{eventData?.guestCount || eventData?.venueCapacity || '-'}</Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Konuk</Text>
                  </View>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="pricetag-outline" size={16} color="#10B981" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]}>{eventData?.category || offer.category || '-'}</Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Kategori</Text>
                  </View>
                </View>

                {/* Event Stats Row 2 */}
                <View style={[styles.providerStats, { marginTop: 8 }]}>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="musical-notes-outline" size={16} color="#F59E0B" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]} numberOfLines={1}>
                      {eventData?.eventType === 'festival' ? 'Festival' :
                       eventData?.eventType === 'concert' ? 'Konser' :
                       eventData?.eventType === 'corporate' ? 'Kurumsal' :
                       eventData?.eventType === 'private' ? 'Özel' :
                       eventData?.eventType || 'Etkinlik'}
                    </Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Tür</Text>
                  </View>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]}>
                      {eventData?.ageLimit ? `${eventData.ageLimit}+` :
                       eventData?.isAllAges ? 'Tüm Yaşlar' : '-'}
                    </Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Yaş Sınırı</Text>
                  </View>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="grid-outline" size={16} color="#0EA5E9" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]} numberOfLines={1}>
                      {eventData?.seatingArrangement === 'seated' ? 'Oturmalı' :
                       eventData?.seatingArrangement === 'standing' ? 'Ayakta' :
                       eventData?.seatingArrangement === 'mixed' ? 'Karma' :
                       eventData?.seatingArrangement || '-'}
                    </Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Düzen</Text>
                  </View>
                </View>

                {/* View Event Button */}
                <TouchableOpacity
                  style={[styles.providerActionBtn, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)', marginTop: 8 }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate(isProviderMode ? 'ProviderEventDetail' : 'OrganizerEventDetail', { eventId: offer.eventId });
                  }}
                >
                  <Ionicons name="eye" size={16} color="#6366F1" />
                  <Text style={[styles.providerActionText, { color: '#6366F1' }]}>Etkinlik Detaylarını Görüntüle</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>

          {/* 2. Artist Row - Expandable */}
          {firebaseOffer?.artistId && firebaseOffer?.artistName && (
            <TouchableOpacity
              style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginTop: 8 }]}
              onPress={() => setArtistExpanded(!artistExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.infoCardContent}>
                <View style={[styles.infoIconBox, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.06)' }]}>
                  <Ionicons name="musical-notes" size={18} color="#8B5CF6" />
                </View>
                <View style={styles.infoCardDetails}>
                  <Text style={[styles.infoName, { color: colors.text }]} numberOfLines={1}>{firebaseOffer.artistName}</Text>
                  <View style={styles.infoMetaRow}>
                    <Ionicons name="mic-outline" size={11} color={colors.textSecondary} />
                    <Text style={[styles.infoMetaText, { color: colors.textSecondary }]}>Sanatçı</Text>
                  </View>
                </View>
                <Ionicons name={artistExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
              </View>

              {/* Expanded Content */}
              {artistExpanded && (
                <View style={[styles.scopeExpandedContent, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                  {/* Artist Bio */}
                  <Text style={[styles.providerBio, { color: colors.textSecondary }]}>
                    {firebaseOffer?.artistBio || `${firebaseOffer.artistName}, Türkiye'nin önde gelen sanatçılarından biridir.`}
                  </Text>

                  {/* Artist Stats */}
                  <View style={styles.providerStats}>
                    <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                      <Ionicons name="disc-outline" size={16} color="#8B5CF6" />
                      <Text style={[styles.providerStatValue, { color: colors.text }]}>{firebaseOffer?.artistAlbumCount || '10+'}</Text>
                      <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Albüm</Text>
                    </View>
                    <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                      <Ionicons name="people-outline" size={16} color="#EC4899" />
                      <Text style={[styles.providerStatValue, { color: colors.text }]}>{firebaseOffer?.artistFollowers || '500K+'}</Text>
                      <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Takipçi</Text>
                    </View>
                    <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                      <Ionicons name="calendar-outline" size={16} color="#10B981" />
                      <Text style={[styles.providerStatValue, { color: colors.text }]}>{firebaseOffer?.artistConcertCount || '100+'}</Text>
                      <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Konser</Text>
                    </View>
                  </View>

                  {/* Genre Tags */}
                  {firebaseOffer?.artistGenres && (
                    <View style={styles.artistGenres}>
                      {(firebaseOffer.artistGenres as string[]).slice(0, 3).map((genre: string, index: number) => (
                        <View key={index} style={[styles.artistGenreTag, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]}>
                          <Text style={styles.artistGenreText}>{genre}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* View Profile Button */}
                  <TouchableOpacity
                    style={[styles.providerActionBtn, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)', marginTop: 8 }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      navigation.navigate('ArtistProfile', { artistId: firebaseOffer.artistId });
                    }}
                  >
                    <Ionicons name="person" size={16} color="#8B5CF6" />
                    <Text style={[styles.providerActionText, { color: '#8B5CF6' }]}>Sanatçı Profilini Görüntüle</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* 4. Venue Row - Expandable */}
          {eventData?.venue && (
            <TouchableOpacity
              style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginTop: 8 }]}
              onPress={() => setVenueExpanded(!venueExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.infoCardContent}>
                <View style={[styles.infoIconBox, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.06)' }]}>
                  <Ionicons name="location" size={18} color="#EC4899" />
                </View>
                <View style={styles.infoCardDetails}>
                  <Text style={[styles.infoName, { color: colors.text }]} numberOfLines={1}>{eventData.venue}</Text>
                  <View style={styles.infoMetaRow}>
                    <Ionicons name="navigate-outline" size={11} color={colors.textSecondary} />
                    <Text style={[styles.infoMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
                      {eventData.district ? eventData.district + ', ' : ''}{eventData.city}
                    </Text>
                  </View>
                </View>
                <Ionicons name={venueExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
              </View>

              {/* Expanded Content */}
              {venueExpanded && (
                <View style={[styles.scopeExpandedContent, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                  {/* Address */}
                  {eventData.venueAddress && (
                    <View style={styles.venueInfoRow}>
                      <Ionicons name="map-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.venueInfoText, { color: colors.textSecondary }]}>{eventData.venueAddress}</Text>
                    </View>
                  )}

                  {/* Venue Stats */}
                  <View style={styles.providerStats}>
                    {eventData.venueCapacity && (
                      <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                        <Ionicons name="people-outline" size={16} color="#EC4899" />
                        <Text style={[styles.providerStatValue, { color: colors.text }]}>{eventData.venueCapacity}</Text>
                        <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Kapasite</Text>
                      </View>
                    )}
                    <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                      <Ionicons name={eventData.indoorOutdoor === 'outdoor' ? 'sunny-outline' : 'home-outline'} size={16} color="#6366F1" />
                      <Text style={[styles.providerStatValue, { color: colors.text }]}>
                        {eventData.indoorOutdoor === 'outdoor' ? 'Açık' : eventData.indoorOutdoor === 'indoor' ? 'Kapalı' : 'Karma'}
                      </Text>
                      <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Alan</Text>
                    </View>
                    {eventData.seatingType && (
                      <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                        <Ionicons name={eventData.seatingType === 'standing' ? 'walk-outline' : 'grid-outline'} size={16} color="#10B981" />
                        <Text style={[styles.providerStatValue, { color: colors.text }]}>
                          {eventData.seatingType === 'standing' ? 'Ayakta' : eventData.seatingType === 'seated' ? 'Oturmalı' : 'Karma'}
                        </Text>
                        <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Düzen</Text>
                      </View>
                    )}
                  </View>

                  {/* Actions */}
                  <View style={styles.providerActions}>
                    <TouchableOpacity
                      style={[styles.providerActionBtn, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.08)' }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        const address = eventData.venueAddress || `${eventData.venue}, ${eventData.city}`;
                        Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
                      }}
                    >
                      <Ionicons name="navigate" size={16} color="#EC4899" />
                      <Text style={[styles.providerActionText, { color: '#EC4899' }]}>Yol Tarifi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.providerActionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', flex: 1 }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('VenueDetail', {
                          venueName: eventData.venue,
                          venueAddress: eventData.venueAddress || '',
                          venueCity: eventData.city || '',
                          venueDistrict: eventData.district || '',
                          venueCapacity: eventData.venueCapacity || '',
                          venueImage: eventData.venueImage || '',
                          indoorOutdoor: eventData.indoorOutdoor || '',
                          seatingType: eventData.seatingType || '',
                        });
                      }}
                    >
                      <Ionicons name="business" size={16} color={colors.text} />
                      <Text style={[styles.providerActionText, { color: colors.text }]}>Mekan Detayları</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* 5. Provider Row - Expandable */}
          <TouchableOpacity
            style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginTop: 8 }]}
            onPress={() => setProviderExpanded(!providerExpanded)}
            activeOpacity={0.7}
          >
            <View style={[styles.infoCardContent, { minHeight: 82, padding: 18 }]}>
              <OptimizedImage source={offer.counterpartyImage} style={[styles.infoAvatar, { width: 52, height: 52, borderRadius: 26 }]} />
              <View style={styles.infoCardDetails}>
                <View style={styles.infoNameRow}>
                  <Text style={[styles.infoName, { color: colors.text, fontSize: 16, fontWeight: '700' }]} numberOfLines={1}>{offer.counterpartyName}</Text>
                  {offer.counterpartyVerified && (
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: 4 }} />
                  )}
                </View>
                <View style={[styles.infoMetaRow, { marginTop: 5 }]}>
                  <Ionicons name="star" size={13} color="#FBBF24" />
                  <Text style={[styles.infoMetaText, { color: '#FBBF24', fontSize: 13, fontWeight: '600' }]}>
                    {offer.counterpartyRating} · {offer.counterpartyCompletedJobs} iş tamamlandı
                  </Text>
                </View>
                <View style={[styles.infoMetaRow, { marginTop: 3 }]}>
                  <Ionicons name="briefcase-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.infoMetaText, { color: colors.textSecondary }]}>
                    {offer.category || 'Hizmet Sağlayıcı'}
                  </Text>
                </View>
              </View>
              <Ionicons name={providerExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
            </View>

            {/* Expanded Content */}
            {providerExpanded && (
              <View style={[styles.scopeExpandedContent, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                {/* Provider Bio */}
                <Text style={[styles.providerBio, { color: colors.textSecondary }]}>
                  {firebaseOffer?.providerBio || `${offer.counterpartyName}, etkinlik sektöründe profesyonel hizmet veren deneyimli bir firmadır.`}
                </Text>

                {/* Quick Stats */}
                <View style={styles.providerStats}>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="briefcase-outline" size={16} color="#6366F1" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]}>{offer.counterpartyCompletedJobs || 0}</Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Tamamlanan</Text>
                  </View>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="star-outline" size={16} color="#FBBF24" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]}>{offer.counterpartyRating || '0.0'}</Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Puan</Text>
                  </View>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="time-outline" size={16} color="#10B981" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]}>{firebaseOffer?.responseTime || '< 1 saat'}</Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Yanıt</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.providerActions}>
                  <TouchableOpacity
                    style={[styles.providerActionBtn, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }]}
                    onPress={(e) => { e.stopPropagation(); handleCall(); }}
                  >
                    <Ionicons name="call" size={16} color="#10B981" />
                    <Text style={[styles.providerActionText, { color: '#10B981' }]}>Ara</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.providerActionBtn, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.08)' }]}
                    onPress={(e) => { e.stopPropagation(); handleChat(); }}
                  >
                    <Ionicons name="chatbubble" size={16} color="#6366F1" />
                    <Text style={[styles.providerActionText, { color: '#6366F1' }]}>Mesaj</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.providerActionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', flex: 1 }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      if (offer.counterpartyType === 'provider') {
                        navigation.navigate('BookingProviderProfile', { providerId: offer.counterpartyId });
                      } else {
                        navigation.navigate('OrganizerProfile', { organizerId: offer.counterpartyId });
                      }
                    }}
                  >
                    <Ionicons name="person" size={16} color={colors.text} />
                    <Text style={[styles.providerActionText, { color: colors.text }]}>Profili Görüntüle</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Notes - Expandable */}
        {offer.notes && (
          <TouchableOpacity
            style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginHorizontal: 16, marginBottom: 16 }]}
            onPress={() => setNotesExpanded(!notesExpanded)}
            activeOpacity={0.7}
          >
            <View style={styles.infoCardContent}>
              <View style={[styles.infoIconBox, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.06)' }]}>
                <Ionicons name="document-text" size={18} color="#EC4899" />
              </View>
              <View style={styles.infoCardDetails}>
                <Text style={[styles.infoName, { color: colors.text }]}>Talep Notu</Text>
                <View style={styles.infoMetaRow}>
                  <Text style={[styles.infoMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {offer.notes.length > 30 ? offer.notes.substring(0, 30) + '...' : offer.notes}
                  </Text>
                </View>
              </View>
              <Ionicons name={notesExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
            </View>

            {/* Expanded Content */}
            {notesExpanded && (
              <View style={[styles.scopeExpandedContent, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                <Text style={[styles.notesText, { color: colors.text }]}>{offer.notes}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Scope Card - Expandable */}
        {(firebaseOffer?.inclusions?.length || firebaseOffer?.exclusions?.length) && (
          <TouchableOpacity
            style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginHorizontal: 16, marginBottom: 16 }]}
            onPress={() => setScopeExpanded(!scopeExpanded)}
            activeOpacity={0.7}
          >
            <View style={styles.infoCardContent}>
              <View style={[styles.infoIconBox, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.06)' }]}>
                <Ionicons name="list" size={18} color="#F59E0B" />
              </View>
              <View style={styles.infoCardDetails}>
                <Text style={[styles.infoName, { color: colors.text }]}>Teklif Kapsamı</Text>
                <View style={styles.infoMetaRow}>
                  {(firebaseOffer?.inclusions?.length ?? 0) > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Ionicons name="checkmark-circle" size={11} color="#10B981" />
                      <Text style={[styles.infoMetaText, { color: '#10B981' }]}>{firebaseOffer?.inclusions?.length ?? 0} dahil</Text>
                    </View>
                  )}
                  {(firebaseOffer?.inclusions?.length ?? 0) > 0 && (firebaseOffer?.exclusions?.length ?? 0) > 0 && (
                    <Text style={[styles.infoMetaDot, { color: colors.textMuted }]}>·</Text>
                  )}
                  {(firebaseOffer?.exclusions?.length ?? 0) > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Ionicons name="close-circle" size={11} color="#EF4444" />
                      <Text style={[styles.infoMetaText, { color: '#EF4444' }]}>{firebaseOffer?.exclusions?.length ?? 0} hariç</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name={scopeExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
            </View>

            {/* Expanded Content */}
            {scopeExpanded && (
              <View style={[styles.scopeExpandedContent, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                <View style={styles.scopeGrid}>
                  {/* Inclusions Column */}
                  {firebaseOffer?.inclusions && firebaseOffer.inclusions.length > 0 && (
                    <View style={[styles.scopeColumn, { borderRightWidth: firebaseOffer?.exclusions?.length ? 1 : 0, borderRightColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                      <View style={styles.scopeHeader}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={[styles.scopeHeaderText, { color: '#10B981' }]}>Dahil</Text>
                      </View>
                      {firebaseOffer.inclusions.map((item: string, index: number) => (
                        <Text key={index} style={[styles.scopeItem, { color: colors.text }]}>{item}</Text>
                      ))}
                    </View>
                  )}

                  {/* Exclusions Column */}
                  {firebaseOffer?.exclusions && firebaseOffer.exclusions.length > 0 && (
                    <View style={styles.scopeColumn}>
                      <View style={styles.scopeHeader}>
                        <Ionicons name="close-circle" size={14} color="#EF4444" />
                        <Text style={[styles.scopeHeaderText, { color: '#EF4444' }]}>Hariç</Text>
                      </View>
                      {firebaseOffer.exclusions.map((item: string, index: number) => (
                        <Text key={index} style={[styles.scopeItem, { color: colors.textSecondary }]}>{item}</Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Counter Offer Section */}
        {firebaseOffer?.counterAmount && (
          <View style={[styles.card, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderLeftWidth: 3, borderLeftColor: colors.brand[400] }]}>
            <View style={styles.counterOfferHeader}>
              <View style={[styles.counterOfferIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)' }]}>
                <Ionicons name="swap-horizontal" size={18} color={colors.brand[400]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 2 }]}>
                  {firebaseOffer.counterBy === 'organizer' ? 'Organizatör Karşı Teklifi' : 'Sağlayıcı Karşı Teklifi'}
                </Text>
                {firebaseOffer.counterAt && (
                  <Text style={[styles.counterOfferDate, { color: colors.textMuted }]}>
                    {firebaseOffer.counterAt.toLocaleDateString('tr-TR')}
                  </Text>
                )}
              </View>
            </View>
            <View style={[styles.counterOfferAmount, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)' }]}>
              <Text style={[styles.counterOfferAmountLabel, { color: colors.textMuted }]}>Yeni Teklif Tutarı</Text>
              <Text style={[styles.counterOfferAmountValue, { color: colors.brand[400] }]}>
                ₺{firebaseOffer.counterAmount.toLocaleString('tr-TR')}
              </Text>
            </View>
            {firebaseOffer.counterMessage && (
              <View style={styles.counterOfferMessage}>
                <Text style={[styles.notesText, { color: colors.text }]}>"{firebaseOffer.counterMessage}"</Text>
              </View>
            )}
          </View>
        )}

        {/* Offer Timeline / History - Expandable */}
        {offerHistory.length > 0 && (
          <TouchableOpacity
            style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginHorizontal: 16, marginBottom: 16 }]}
            onPress={() => setTimelineExpanded(!timelineExpanded)}
            activeOpacity={0.7}
          >
            <View style={styles.infoCardContent}>
              <View style={[styles.infoIconBox, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)' }]}>
                <Ionicons name="time" size={18} color="#6366F1" />
              </View>
              <View style={styles.infoCardDetails}>
                <Text style={[styles.infoName, { color: colors.text }]}>Teklif Süreci</Text>
                <View style={styles.infoMetaRow}>
                  <Text style={[styles.infoMetaText, { color: colors.textSecondary }]}>{offerHistory.length} işlem</Text>
                </View>
              </View>
              <Ionicons name={timelineExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
            </View>

            {/* Expanded Content */}
            {timelineExpanded && (
              <View style={[styles.scopeExpandedContent, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                <OfferTimeline history={offerHistory} currentUserRole={isUserProvider ? 'provider' : 'organizer'} />
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Amount Card - Only show if amount exists */}
        {offer.amount > 0 && (
          <View style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginHorizontal: 16, marginBottom: 16 }]}>
            <View style={styles.infoCardContent}>
              <View style={[styles.infoIconBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)' }]}>
                <Ionicons name="cash" size={18} color="#10B981" />
              </View>
              <View style={styles.infoCardDetails}>
                <Text style={[styles.infoName, { color: colors.text }]}>₺{offer.amount.toLocaleString('tr-TR')}</Text>
                <View style={styles.infoMetaRow}>
                  <Text style={[styles.infoMetaText, { color: colors.textSecondary }]}>Teklif Tutarı</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Contract Link (if accepted) */}
        {offer.status === 'accepted' && (
          <TouchableOpacity
            style={[styles.contractCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }]}
            onPress={() => navigation.navigate('Contract', {
              offerId: offer.id,
              eventId: firebaseOffer?.eventId,
              eventTitle: firebaseOffer?.eventTitle,
              eventDate: firebaseOffer?.eventDate,
              artistName: firebaseOffer?.artistName,
              organizerName: firebaseOffer?.organizerName,
              amount: firebaseOffer?.finalAmount || firebaseOffer?.amount,
            })}
          >
            <View style={styles.contractIcon}>
              <Ionicons name="document-text-outline" size={24} color="#10B981" />
            </View>
            <View style={styles.contractInfo}>
              <Text style={[styles.contractTitle, { color: colors.text }]}>Sozlesme</Text>
              <Text style={[styles.contractStatus, { color: firebaseOffer?.contractSigned ? '#10B981' : '#F59E0B' }]}>
                {firebaseOffer?.contractSigned ? 'Imzalandi - Sozlesmeyi Gor' : 'Imza bekliyor'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#10B981" />
          </TouchableOpacity>
        )}

        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Bottom Actions - Organizer (when provider sent a quote) */}
      {!isUserProvider && offer.status === 'quoted' && (
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

      {/* Bottom Actions - Organizer (waiting for provider quote) */}
      {!isUserProvider && offer.status === 'pending' && (
        <View style={[styles.bottomBar, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', paddingBottom: Math.max(insets.bottom, 34) + 70, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]} onPress={handleChat}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Mesaj Gonder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: '#EF4444', flex: 0.8 }]} onPress={handleRejectOffer}>
            <Ionicons name="close-outline" size={18} color="#EF4444" />
            <Text style={[styles.secondaryBtnText, { color: '#EF4444' }]}>Iptal Et</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Actions - Provider (incoming request, needs to send quote) */}
      {isUserProvider && offer.status === 'pending' && (
        <View style={[styles.bottomBar, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', paddingBottom: Math.max(insets.bottom, 34) + 70, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
          <TouchableOpacity style={styles.rejectBtn} onPress={handleProviderReject}>
            <Ionicons name="close" size={22} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]} onPress={handleChat}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Mesaj</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={() => setShowQuoteModal(true)}>
            <Text style={styles.acceptBtnText}>Teklif Ver</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Actions - Provider (quote sent, waiting for organizer) */}
      {isUserProvider && offer.status === 'quoted' && (
        <View style={[styles.bottomBar, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', paddingBottom: Math.max(insets.bottom, 34) + 70, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0', flex: 1 }]} onPress={handleChat}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Mesaj Gonder</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Actions - Counter offer state */}
      {offer.status === 'counter_offered' && (
        <View style={[styles.bottomBar, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', paddingBottom: Math.max(insets.bottom, 34) + 70, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
          <TouchableOpacity style={styles.rejectBtn} onPress={isUserProvider ? handleProviderReject : handleRejectOffer}>
            <Ionicons name="close" size={22} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]} onPress={handleChat}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Mesaj</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={isUserProvider ? () => setShowQuoteModal(true) : handleAcceptOffer}>
            <Text style={styles.acceptBtnText}>{isUserProvider ? 'Yeni Teklif' : 'Kabul Et'}</Text>
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
          {firebaseOffer?.contractSigned ? (
            // Sözleşme imzalandı - Etkinliği Görüntüle
            <TouchableOpacity style={styles.primaryBtn} onPress={() => {
              // Navigate based on user role
              if (isUserProvider) {
                navigation.navigate('ProviderEventDetail', { eventId: firebaseOffer?.eventId });
              } else {
                navigation.navigate('OrganizerEventDetail', { eventId: firebaseOffer?.eventId });
              }
            }}>
              <Text style={styles.primaryBtnText}>Etkinligi Goruntule</Text>
            </TouchableOpacity>
          ) : (
            // Sözleşme henüz imzalanmadı - Sözleşmeyi Gör
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Contract', {
                offerId: offer.id,
                eventId: firebaseOffer?.eventId,
                eventTitle: firebaseOffer?.eventTitle,
                eventDate: firebaseOffer?.eventDate,
                artistName: firebaseOffer?.artistName,
                organizerName: firebaseOffer?.organizerName,
                amount: firebaseOffer?.finalAmount || firebaseOffer?.amount,
              })}>
              <Text style={styles.primaryBtnText}>Sozlesmeyi Gor</Text>
            </TouchableOpacity>
          )}
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

      {/* Provider Quote Modal */}
      <Modal visible={showQuoteModal} animationType="slide" transparent onRequestClose={() => setShowQuoteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={styles.modalHandle}>
              <View style={[styles.modalHandleBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#E2E8F0' }]} />
            </View>

            <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Teklif Ver</Text>
              <TouchableOpacity onPress={() => setShowQuoteModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={[styles.currentOffer, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)' }]}>
                <Text style={[styles.currentOfferLabel, { color: colors.textSecondary }]}>Etkinlik</Text>
                <Text style={[styles.currentOfferValue, { color: '#6366F1', fontSize: 18 }]}>{offer?.eventTitle}</Text>
                <Text style={[styles.currentOfferLabel, { color: colors.textSecondary, marginTop: 8 }]}>Hizmet</Text>
                <Text style={[styles.currentOfferValue, { color: colors.text, fontSize: 16 }]}>{offer?.service}</Text>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Teklif Tutari</Text>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                <Text style={[styles.inputPrefix, { color: colors.text }]}>₺</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Tutar girin"
                  placeholderTextColor={colors.textSecondary}
                  value={quoteAmount}
                  onChangeText={(t) => setQuoteAmount(formatCurrency(t))}
                  keyboardType="number-pad"
                />
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 20 }]}>Mesaj (Opsiyonel)</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0', color: colors.text }]}
                placeholder="Teklifiniz hakkinda bilgi ekleyin..."
                placeholderTextColor={colors.textSecondary}
                value={quoteNote}
                onChangeText={setQuoteNote}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
              <TouchableOpacity style={[styles.modalCancelBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]} onPress={() => setShowQuoteModal(false)}>
                <Text style={[styles.modalCancelText, { color: colors.text }]}>Iptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSendQuote}>
                <Text style={styles.modalSubmitText}>Teklif Gonder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal visible={showRejectModal} animationType="slide" transparent onRequestClose={() => setShowRejectModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={styles.modalHandle}>
              <View style={[styles.modalHandleBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#E2E8F0' }]} />
            </View>

            <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Red Nedeni</Text>
              <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.rejectModalDesc, { color: colors.textSecondary }]}>
                Lutfen teklifi neden reddettiginizi belirtin. Bu bilgi karsi tarafa iletilecektir.
              </Text>

              <View style={styles.rejectionOptions}>
                {rejectionReasons.map((reason) => (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.rejectionOption,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                        borderColor: selectedRejectionReason === reason.id ? '#EF4444' : (isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'),
                        borderWidth: selectedRejectionReason === reason.id ? 2 : 1,
                      }
                    ]}
                    onPress={() => setSelectedRejectionReason(reason.id)}
                  >
                    <View style={styles.rejectionOptionContent}>
                      <View style={[
                        styles.rejectionRadio,
                        {
                          borderColor: selectedRejectionReason === reason.id ? '#EF4444' : colors.textMuted,
                          backgroundColor: selectedRejectionReason === reason.id ? '#EF4444' : 'transparent',
                        }
                      ]}>
                        {selectedRejectionReason === reason.id && (
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.rejectionOptionLabel, { color: colors.text }]}>{reason.label}</Text>
                        <Text style={[styles.rejectionOptionDesc, { color: colors.textMuted }]}>{reason.description}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedRejectionReason === 'other' && (
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Red Nedeniniz</Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0', color: colors.text }]}
                    placeholder="Nedeninizi yazin..."
                    placeholderTextColor={colors.textSecondary}
                    value={customRejectionReason}
                    onChangeText={setCustomRejectionReason}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
              <TouchableOpacity style={[styles.modalCancelBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]} onPress={() => { setShowRejectModal(false); setSelectedRejectionReason(null); setCustomRejectionReason(''); }}>
                <Text style={[styles.modalCancelText, { color: colors.text }]}>Iptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSubmitBtn, { backgroundColor: '#EF4444' }]} onPress={handleConfirmReject}>
                <Text style={styles.modalSubmitText}>Reddet</Text>
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

  // Status Header
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  heroStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  heroStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroValidText: {
    fontSize: 11,
  },

  // Info Section (Combined Cards)
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  infoCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 72,
  },
  infoAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  infoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardDetails: {
    flex: 1,
    marginLeft: 12,
  },
  infoNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoName: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  infoMetaText: {
    fontSize: 12,
  },
  infoMetaDot: {
    fontSize: 12,
    marginHorizontal: 2,
  },
  infoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  infoActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Provider Expanded
  providerBio: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  providerStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  providerStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  providerStatValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  providerStatLabel: {
    fontSize: 10,
  },
  providerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  providerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  providerActionText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Artist Genres
  artistGenres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  artistGenreTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  artistGenreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Venue Info
  venueInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  venueInfoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },

  // Cards
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  cardTitle: { fontSize: 13, fontWeight: '600', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.6 },

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

  // Scope (Inclusions/Exclusions)
  scopeExpandedContent: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  scopeGrid: {
    flexDirection: 'row',
  },
  scopeColumn: {
    flex: 1,
    paddingRight: 12,
  },
  scopeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  scopeHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  scopeItem: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },

  // Counter Offer Section
  counterOfferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  counterOfferIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  counterOfferDate: {
    fontSize: 12,
  },
  counterOfferAmount: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  counterOfferAmountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  counterOfferAmountValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  counterOfferMessage: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },

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

  // Rejection Modal Styles
  rejectModalDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  rejectionOptions: {
    gap: 12,
  },
  rejectionOption: {
    padding: 16,
    borderRadius: 12,
  },
  rejectionOptionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rejectionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  rejectionOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  rejectionOptionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default OfferDetailScreen;
