import React, { useState, useRef, useCallback, useMemo } from 'react';
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
  Dimensions,
  Share,
  Platform,
  RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { OptimizedImage } from '../components/OptimizedImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useOffer, useEvent, respondToOfferRequest, sendCounterOffer, acceptOffer, rejectOffer } from '../hooks';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { useAuth } from '../context/AuthContext';
import { OfferTimeline } from '../components/offers/OfferTimeline';
import type { OfferHistoryItem } from '../data/offersData';
import { ageLimitOptions, seatingTypeOptions, indoorOutdoorOptions } from '../data/createEventData';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Helper to get label from option arrays
const getOptionLabel = (options: { id: string; label: string }[], id: string | undefined): string | null => {
  if (!id) return null;
  return options.find(o => o.id === id)?.label || null;
};

// Build offer history from Firebase data
const buildOfferHistory = (firebaseOffer: any): OfferHistoryItem[] => {
  if (!firebaseOffer) return [];

  const history: OfferHistoryItem[] = [];

  // 1. Initial request from organizer (always first)
  if (firebaseOffer.createdAt) {
    history.push({
      id: 'request',
      type: 'submitted',
      by: 'organizer',
      date: firebaseOffer.createdAt.toLocaleDateString?.('tr-TR') || '',
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
        date: firebaseOffer.counterAt?.toLocaleDateString?.('tr-TR') || '',
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
      date: firebaseOffer.acceptedAt?.toLocaleDateString?.('tr-TR') || firebaseOffer.updatedAt?.toLocaleDateString?.('tr-TR') || '',
      amount: firebaseOffer.finalAmount || firebaseOffer.counterAmount || firebaseOffer.amount,
    });
  } else if (firebaseOffer.status === 'rejected') {
    history.push({
      id: 'rejected',
      type: 'rejected',
      by: firebaseOffer.rejectedBy || 'organizer',
      date: firebaseOffer.rejectedAt?.toLocaleDateString?.('tr-TR') || firebaseOffer.updatedAt?.toLocaleDateString?.('tr-TR') || '',
      message: firebaseOffer.rejectionReason,
    });
  }

  return history;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VenueHall {
  id: string;
  name: string;
  capacity: number;
  seatingType: 'standing' | 'seated' | 'mixed';
  stageWidth?: number; // meters
  stageDepth?: number; // meters
  stageHeight?: number; // meters
  isMainHall?: boolean;
}

interface VenueBackstage {
  hasBackstage: boolean;
  roomCount?: number;
  hasMirror?: boolean;
  hasShower?: boolean;
  hasPrivateToilet?: boolean;
  cateringAvailable?: boolean;
  notes?: string;
}

interface VenueInfo {
  id: string;
  name: string;
  address: string;
  city: string;
  district?: string;
  capacity: number;
  indoorOutdoor: 'indoor' | 'outdoor' | 'mixed';
  venueType: 'concert_hall' | 'arena' | 'stadium' | 'hotel_ballroom' | 'open_air' | 'club' | 'theater' | 'other';
  seatingType?: 'standing' | 'seated' | 'mixed';

  // Halls (for multi-hall venues)
  halls?: VenueHall[];
  selectedHallId?: string;

  // Stage info (for single stage venues)
  stageWidth?: number;
  stageDepth?: number;
  stageHeight?: number;

  // Backstage
  backstage?: VenueBackstage;

  // Technical
  hasSoundSystem?: boolean;
  hasLightingSystem?: boolean;
  hasParkingArea?: boolean;
  parkingCapacity?: number;

  // Images
  images?: string[];

  // Contact
  contactName?: string;
  contactPhone?: string;

  // Rating
  rating?: number;
  reviewCount?: number;
}

interface EventDetails {
  ageLimit: string;
  participantType: string;
  concertTime: string;
  eventDuration: string;
  images: string[];
  socialMedia: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

export function ProviderRequestDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  const { offerId } = (route.params as { offerId: string } | undefined) || { offerId: '' };

  // Fetch offer from Firebase
  const { offer: firebaseOffer, loading: isLoading } = useOffer(offerId);

  // Fetch event details for venue information
  const { event: eventData } = useEvent(firebaseOffer?.eventId);

  // Convert Firebase offer to local format
  const offer = useMemo(() => {
    if (!firebaseOffer) return null;

    return {
      id: firebaseOffer.id,
      eventId: firebaseOffer.eventId,
      eventTitle: firebaseOffer.eventTitle || 'Etkinlik',
      eventDate: firebaseOffer.eventDate || '',
      location: firebaseOffer.eventCity || '',
      serviceCategory: firebaseOffer.serviceCategory || 'booking',
      artistId: firebaseOffer.artistId,
      artistName: firebaseOffer.artistName || '',
      artistImage: firebaseOffer.artistImage,
      role: firebaseOffer.artistName || firebaseOffer.serviceCategory || 'Hizmet',
      status: firebaseOffer.status,
      amount: firebaseOffer.amount || 0,
      organizer: {
        id: firebaseOffer.organizerId,
        name: firebaseOffer.organizerName || 'Organizatör',
        image: firebaseOffer.organizerImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        rating: 4.5,
        reviewCount: 0,
        phone: firebaseOffer.organizerPhone || '',
      },
      notes: firebaseOffer.notes || firebaseOffer.message || '',
      counterOffer: firebaseOffer.counterAmount ? {
        amount: firebaseOffer.counterAmount,
        message: firebaseOffer.counterMessage,
        by: firebaseOffer.counterBy,
        at: firebaseOffer.counterAt,
      } : null,
      rejectionReason: firebaseOffer.responseMessage,
      rejectedAt: firebaseOffer.status === 'rejected' ? firebaseOffer.updatedAt?.toLocaleDateString('tr-TR') : undefined,
      history: buildOfferHistory(firebaseOffer),
      createdAt: firebaseOffer.createdAt,
      validUntil: firebaseOffer.validUntil,
      eventVenue: firebaseOffer.formData?.venue || '',
      eventDistrict: firebaseOffer.formData?.district || '',
      eventGuestCount: firebaseOffer.formData?.guestCount || '',
      eventAgeLimit: firebaseOffer.formData?.ageLimit || '',
      eventSeatingType: firebaseOffer.formData?.seatingType || '',
      eventIndoorOutdoor: firebaseOffer.formData?.indoorOutdoor || '',
      eventTime: firebaseOffer.formData?.time || '',
      formData: firebaseOffer.formData,
      requestedBudget: firebaseOffer.requestedBudget || '',
      finalAmount: firebaseOffer.finalAmount,
      acceptedBy: firebaseOffer.acceptedBy,
      acceptedAt: firebaseOffer.acceptedAt,
      contractId: firebaseOffer.contractId,
      contractSigned: firebaseOffer.contractSigned || false,
      contractSignedByOrganizer: firebaseOffer.contractSignedByOrganizer || false,
      contractSignedByProvider: firebaseOffer.contractSignedByProvider || false,
    };
  }, [firebaseOffer]);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [realOrganizerImage, setRealOrganizerImage] = useState<string | null>(null);

  // Expandable card states
  const [eventExpanded, setEventExpanded] = useState(false);
  const [artistExpanded, setArtistExpanded] = useState(false);
  const [venueExpanded, setVenueExpanded] = useState(false);
  const [organizerExpanded, setOrganizerExpanded] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // Fetch organizer's real profile image from Firestore
  React.useEffect(() => {
    const fetchOrganizerImage = async () => {
      if (!firebaseOffer?.organizerId) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseOffer.organizerId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const profileImage = userData.photoURL || userData.userPhotoURL || userData.profileImage || userData.image;
          if (profileImage) {
            setRealOrganizerImage(profileImage);
          }
        }
      } catch (error) {
        console.warn('Error fetching organizer profile:', error);
      }
    };

    fetchOrganizerImage();
  }, [firebaseOffer?.organizerId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Included/Excluded items for offer
  const [includedItems, setIncludedItems] = useState([
    { id: 'live', label: 'Canlı Performans', enabled: true },
    { id: 'soundcheck', label: 'Ses Kontrolü (Sound Check)', enabled: true },
    { id: 'rider', label: 'Rider Gereksinimlerine Uyum', enabled: true },
    { id: 'meetgreet', label: 'Meet & Greet', enabled: false },
  ]);

  const [excludedItems, setExcludedItems] = useState([
    { id: 'transport', label: 'Ulaşım', enabled: true },
    { id: 'accommodation', label: 'Konaklama', enabled: true },
    { id: 'technical_rider', label: 'Teknik Rider', enabled: true },
    { id: 'taxes', label: 'Vergiler', enabled: true },
    { id: 'backstage', label: 'Kulis Riderı', enabled: true },
    { id: 'pyro', label: 'Pyro/Özel Efektler', enabled: false },
  ]);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectReason, setSelectedRejectReason] = useState<string | null>(null);
  const [customRejectReason, setCustomRejectReason] = useState('');

  const rejectionReasons = [
    { id: 'calendar', label: 'Takvim uyuşmazlığı' },
    { id: 'budget', label: 'Bütçe yetersiz' },
    { id: 'concept', label: 'Etkinlik konseptine uygun değil' },
    { id: 'other_offer', label: 'Başka bir teklif kabul edildi' },
    { id: 'technical', label: 'Teknik gereksinimler karşılanamıyor' },
    { id: 'other', label: 'Diğer' },
  ];

  const toggleIncludedItem = (id: string) => {
    setIncludedItems(prev => prev.map(item =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const toggleExcludedItem = (id: string) => {
    setExcludedItems(prev => prev.map(item =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  // Early return for loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#09090B' : '#F8FAFC' }]}>
        <View style={[styles.header, {
          paddingTop: insets.top,
          backgroundColor: isDark ? '#18181B' : '#FFFFFF',
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'
        }]}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Talep Detayı</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  // Early return for null offer
  if (!offer) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#09090B' : '#F8FAFC' }]}>
        <View style={[styles.header, {
          paddingTop: insets.top,
          backgroundColor: isDark ? '#18181B' : '#FFFFFF',
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'
        }]}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Talep Detayı</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 12 }}>Teklif Bulunamadı</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>Bu teklif artık mevcut değil veya silinmiş olabilir.</Text>
          <TouchableOpacity
            style={{ marginTop: 20, backgroundColor: colors.brand?.[500] || '#8B5CF6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Known venue database for realistic data
  const knownVenues: Record<string, Partial<VenueInfo>> = {
    'Congresium': {
      address: 'Söğütözü Caddesi No: 2',
      venueType: 'arena',
      capacity: 3000,
      stageWidth: 18,
      stageDepth: 12,
      stageHeight: 8,
      hasSoundSystem: true,
      hasLightingSystem: true,
      hasParkingArea: true,
      parkingCapacity: 500,
      backstage: {
        hasBackstage: true,
        roomCount: 4,
        hasMirror: true,
        hasShower: true,
        hasPrivateToilet: true,
        cateringAvailable: true,
      },
      images: [
        'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
      ],
      rating: 4.6,
      reviewCount: 128,
    },
    'Volkswagen Arena': {
      address: 'Huzur Mahallesi, Maslak Ayazağa Cd. No:4',
      venueType: 'arena',
      capacity: 5000,
      stageWidth: 24,
      stageDepth: 16,
      stageHeight: 12,
      hasSoundSystem: true,
      hasLightingSystem: true,
      hasParkingArea: true,
      parkingCapacity: 1200,
      backstage: {
        hasBackstage: true,
        roomCount: 8,
        hasMirror: true,
        hasShower: true,
        hasPrivateToilet: true,
        cateringAvailable: true,
      },
      images: [
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
      ],
      rating: 4.8,
      reviewCount: 342,
    },
    'Zorlu PSM': {
      address: 'Levazım Mahallesi, Koru Sokağı No:2',
      venueType: 'concert_hall',
      capacity: 2200,
      stageWidth: 20,
      stageDepth: 14,
      stageHeight: 10,
      hasSoundSystem: true,
      hasLightingSystem: true,
      hasParkingArea: true,
      parkingCapacity: 800,
      backstage: {
        hasBackstage: true,
        roomCount: 6,
        hasMirror: true,
        hasShower: true,
        hasPrivateToilet: true,
        cateringAvailable: true,
      },
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      ],
      rating: 4.9,
      reviewCount: 567,
    },
  };

  // Get known venue data if available
  const venueName = eventData?.venue || offer.eventVenue;
  const knownVenueData = venueName ? knownVenues[venueName] : undefined;

  // Venue info from event data merged with known venue data
  const venueInfo: VenueInfo | null = (!venueName && !eventData?.city && !offer.location) ? null : {
    id: offer.eventId || '',
    name: venueName || '',
    address: eventData?.venueAddress || knownVenueData?.address || offer.formData?.venueAddress || '',
    city: eventData?.city || offer.location || '',
    district: eventData?.district || offer.eventDistrict || '',
    capacity: eventData?.venueCapacity ? parseInt(eventData.venueCapacity) : (offer.eventGuestCount ? parseInt(offer.eventGuestCount) : (knownVenueData?.capacity || 0)),
    indoorOutdoor: (eventData?.indoorOutdoor as 'indoor' | 'outdoor' | 'mixed') || (offer.eventIndoorOutdoor as 'indoor' | 'outdoor' | 'mixed') || 'indoor',
    venueType: knownVenueData?.venueType || 'other' as const,
    seatingType: (eventData?.seatingType as 'standing' | 'seated' | 'mixed') || (offer.eventSeatingType as 'standing' | 'seated' | 'mixed') || undefined,
    stageWidth: knownVenueData?.stageWidth,
    stageDepth: knownVenueData?.stageDepth,
    stageHeight: knownVenueData?.stageHeight,
    hasSoundSystem: knownVenueData?.hasSoundSystem,
    hasLightingSystem: knownVenueData?.hasLightingSystem,
    hasParkingArea: knownVenueData?.hasParkingArea,
    parkingCapacity: knownVenueData?.parkingCapacity,
    backstage: knownVenueData?.backstage,
    images: knownVenueData?.images,
    rating: knownVenueData?.rating,
    reviewCount: knownVenueData?.reviewCount,
  };

  // Event details from offer
  const eventDetails: EventDetails = {
    ageLimit: offer.eventAgeLimit ? getOptionLabel(ageLimitOptions, offer.eventAgeLimit) || offer.eventAgeLimit : '',
    participantType: '',
    concertTime: offer.eventTime || '',
    eventDuration: offer.formData?.duration || '',
    images: [],
    socialMedia: {},
  };

  // Budget from organizer's request
  const organizerBudget: number | null = offer.requestedBudget
    ? parseInt(offer.requestedBudget.replace(/\D/g, ''), 10) || null
    : null;

  // Final accepted amount (when offer is accepted)
  const finalAcceptedAmount: number | null = offer.finalAmount || null;

  // Provider's current offer amount
  const providerOfferAmount: number | null = offer.amount || null;

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bg: string; icon: string }> = {
      pending: { label: 'Teklif Bekleniyor', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', icon: 'time-outline' },
      counter_offered: { label: 'Pazarlık Süreci', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', icon: 'swap-horizontal-outline' },
      accepted: { label: 'Kabul Edildi', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', icon: 'checkmark-circle-outline' },
      rejected: { label: 'Reddedildi', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', icon: 'close-circle-outline' },
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(offer.status);

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('tel:+905329876543');
  };

  const handleChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Chat', {
      providerId: offer.organizer.id,
      providerName: offer.organizer.name,
      providerImage: realOrganizerImage || offer.organizer.image,
    });
  };

  const handleSocialMedia = (type: string) => {
    const urls: Record<string, string> = {
      instagram: 'https://instagram.com/zeytinlirock',
      twitter: 'https://twitter.com/zeytinlifest',
      website: 'https://zeytinlirock.com',
    };
    if (urls[type]) {
      Linking.openURL(urls[type]);
    }
  };

  const handleSubmitOffer = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const amount = parseInt(offerAmount.replace(/\./g, ''));
    if (!amount || amount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Lütfen geçerli bir tutar girin');
      return;
    }

    try {
      // Check if this is the first quote (status is 'pending') or a counter offer
      const isFirstQuote = firebaseOffer?.status === 'pending';

      // Extract enabled inclusions and exclusions
      const inclusions = includedItems.filter(item => item.enabled).map(item => item.label);
      const exclusions = excludedItems.filter(item => item.enabled).map(item => item.label);

      if (isFirstQuote) {
        // Provider's first response to organizer's request
        await respondToOfferRequest(offerId, amount, offerNote || undefined, 7, inclusions, exclusions);
      } else {
        // This is a counter offer in an ongoing negotiation
        await sendCounterOffer(offerId, amount, 'provider', offerNote || undefined);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowOfferModal(false);
      setOfferAmount('');
      setOfferNote('');
      Alert.alert(
        'Teklif Gönderildi',
        `₺${amount.toLocaleString('tr-TR')} tutarındaki teklifiniz organizatöre iletildi.`,
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.warn('Error submitting offer:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Teklif gönderilirken bir hata oluştu.');
    }
  };

  const handleAcceptCounterOffer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (offer.counterOffer) {
      Alert.alert(
        'Karşı Teklifi Kabul Et',
        `₺${offer.counterOffer.amount.toLocaleString('tr-TR')} tutarındaki teklifi kabul etmek istiyor musunuz?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Kabul Et',
            onPress: () => {
              Alert.alert('Başarılı', 'Teklif kabul edildi. Sözleşme oluşturulacak.');
              navigation.goBack();
            }
          },
        ]
      );
    }
  };

  // Accept organizer's initial budget directly
  const handleAcceptOrganizerBudget = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (organizerBudget) {
      Alert.alert(
        'Bütçeyi Kabul Et',
        `Organizatörün ₺${organizerBudget.toLocaleString('tr-TR')} bütçe teklifini kabul etmek istiyor musunuz?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Kabul Et',
            onPress: async () => {
              try {
                // Accept the offer with the organizer's budget
                await acceptOffer(offer.id, 'provider');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Başarılı', 'Teklif kabul edildi. Sözleşme oluşturulacak.');
                navigation.goBack();
              } catch (error) {
                console.warn('Error accepting offer:', error);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Hata', 'Teklif kabul edilirken bir hata oluştu.');
              }
            }
          },
        ]
      );
    }
  };

  const handleRejectOffer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedRejectReason(null);
    setCustomRejectReason('');
    setShowRejectModal(true);
  };

  const confirmRejectOffer = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!selectedRejectReason) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Uyarı', 'Lütfen bir red nedeni seçin.');
      return;
    }
    if (selectedRejectReason === 'other' && !customRejectReason.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Uyarı', 'Lütfen red nedeninizi yazın.');
      return;
    }

    const reason = selectedRejectReason === 'other'
      ? customRejectReason.trim()
      : rejectionReasons.find(r => r.id === selectedRejectReason)?.label || '';

    setShowRejectModal(false);

    try {
      await rejectOffer(offer.id, 'provider', reason);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Reddedildi', `Talep reddedildi.\nNeden: ${reason}`);
      navigation.goBack();
    } catch (error) {
      console.warn('Error rejecting offer:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Teklif reddedilirken bir hata oluştu.');
    }
  };

  const getSeatingTypeLabel = (type: string | undefined) => {
    if (!type) return 'Belirtilmedi';
    const labels: Record<string, string> = {
      standing: 'Ayakta',
      seated: 'Oturmalı',
      mixed: 'Karma (Oturmalı + Ayakta)',
    };
    return labels[type] || type;
  };

  const getIndoorOutdoorLabel = (type: string) => {
    const labels: Record<string, string> = {
      indoor: 'Kapalı Alan',
      outdoor: 'Açık Alan',
      mixed: 'Karma',
    };
    return labels[type] || type;
  };

  const getVenueTypeLabel = (type: string | undefined) => {
    if (!type) return 'Belirtilmedi';
    const labels: Record<string, string> = {
      concert_hall: 'Konser Salonu',
      arena: 'Arena',
      stadium: 'Stadyum',
      hotel_ballroom: 'Otel Balo Salonu',
      open_air: 'Açık Hava',
      club: 'Kulüp / Gece Kulübü',
      theater: 'Tiyatro',
      other: 'Diğer',
    };
    return labels[type] || type;
  };

  // Generate PDF - Professional single-page design
  const generatePDF = async () => {
    setIsGeneratingPDF(true);

    const currentDate = new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const docNumber = `TKL-${new Date().getFullYear()}-${offer.id.slice(-4).toUpperCase()}`;

    // Get active included/excluded items
    const activeIncluded = includedItems.filter(i => i.enabled).map(i => i.label);
    const activeExcluded = excludedItems.filter(i => i.enabled).map(i => i.label);

    // Get latest offer amount from history
    const latestOffer = offer.history?.slice().reverse().find(h => h.amount);
    const offerAmount = latestOffer?.amount || offer.amount;

    // Build timeline HTML
    const timelineHTML = offer.history?.map((item, idx) => {
      const isLast = idx === (offer.history?.length || 0) - 1;
      const typeLabels: Record<string, string> = {
        'submitted': 'Teklif Gönderildi',
        'viewed': 'Görüntülendi',
        'counter': 'Karşı Teklif',
        'accepted': 'Kabul Edildi',
        'rejected': 'Reddedildi',
      };
      const typeColors: Record<string, string> = {
        'submitted': '#6366F1',
        'viewed': '#8B5CF6',
        'counter': '#F59E0B',
        'accepted': '#10B981',
        'rejected': '#EF4444',
      };
      return `
        <div class="timeline-item">
          <div class="timeline-dot" style="background: ${typeColors[item.type] || '#6B7280'}"></div>
          ${!isLast ? '<div class="timeline-line"></div>' : ''}
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-actor">${item.by === 'provider' ? 'Siz' : 'Organizatör'}</span>
              <span class="timeline-date">${item.date}</span>
            </div>
            <div class="timeline-action">${typeLabels[item.type] || item.type}</div>
            ${item.amount ? `<div class="timeline-amount">₺${item.amount.toLocaleString('tr-TR')}</div>` : ''}
          </div>
        </div>
      `;
    }).join('') || '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: A4; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1a1a2e;
            line-height: 1.35;
            background: #fff;
            width: 210mm;
            height: 297mm;
            padding: 0;
            position: relative;
          }

          /* === TOP ACCENT BAR === */
          .accent-bar {
            height: 6px;
            background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%);
          }

          /* === MAIN CONTAINER === */
          .container {
            padding: 20px 28px 16px;
            height: calc(297mm - 6px);
            display: flex;
            flex-direction: column;
          }

          /* === HEADER === */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .brand-logo {
            width: 42px;
            height: 42px;
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 800;
            font-size: 20px;
            letter-spacing: -1px;
          }
          .brand-info h1 {
            font-size: 20px;
            font-weight: 700;
            color: #1a1a2e;
            letter-spacing: -0.5px;
          }
          .brand-tagline {
            font-size: 9px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 500;
          }
          .doc-info {
            text-align: right;
          }
          .doc-type {
            font-size: 8px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 2px;
          }
          .doc-number {
            font-size: 12px;
            font-weight: 700;
            color: #4F46E5;
            font-family: 'SF Mono', 'Consolas', monospace;
            margin-bottom: 4px;
          }
          .doc-date {
            font-size: 10px;
            color: #64748b;
          }

          /* === EVENT HERO === */
          .hero {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 60%, #9333EA 100%);
            border-radius: 14px;
            padding: 18px 22px;
            color: white;
            margin-bottom: 14px;
            position: relative;
            overflow: hidden;
          }
          .hero::before {
            content: '';
            position: absolute;
            top: -60%;
            right: -15%;
            width: 180px;
            height: 180px;
            background: rgba(255,255,255,0.08);
            border-radius: 50%;
          }
          .hero::after {
            content: '';
            position: absolute;
            bottom: -40%;
            left: 10%;
            width: 120px;
            height: 120px;
            background: rgba(255,255,255,0.05);
            border-radius: 50%;
          }
          .hero-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .hero-artist {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-bottom: 2px;
          }
          .hero-event {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 12px;
          }
          .hero-details {
            display: flex;
            gap: 24px;
            font-size: 11px;
            font-weight: 500;
          }
          .hero-detail {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .hero-icon {
            width: 18px;
            height: 18px;
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
          }

          /* === STATUS BADGE === */
          .status-container {
            position: absolute;
            top: 16px;
            right: 20px;
          }
          .status {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-pending { background: rgba(251,191,36,0.2); color: #F59E0B; }
          .status-accepted { background: rgba(16,185,129,0.2); color: #10B981; }
          .status-counter_offered { background: rgba(59,130,246,0.2); color: #3B82F6; }
          .status-rejected { background: rgba(239,68,68,0.2); color: #EF4444; }

          /* === MAIN CONTENT GRID === */
          .main-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
          }

          /* === CARDS === */
          .card {
            background: #f8fafc;
            border-radius: 10px;
            padding: 12px 14px;
            border: 1px solid #e2e8f0;
          }
          .card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
          }
          .card-icon {
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
          }
          .card-title {
            font-size: 9px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          /* Organizer Card */
          .org-row {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .org-avatar {
            width: 38px;
            height: 38px;
            border-radius: 8px;
            background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: #4F46E5;
            font-size: 14px;
          }
          .org-name {
            font-size: 13px;
            font-weight: 600;
            color: #1e293b;
          }
          .org-meta {
            font-size: 10px;
            color: #64748b;
            margin-top: 1px;
          }
          .org-meta .star { color: #FBBF24; }

          /* Venue Card */
          .venue-name {
            font-size: 13px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 2px;
          }
          .venue-address {
            font-size: 10px;
            color: #64748b;
            margin-bottom: 10px;
          }
          .venue-specs {
            display: flex;
            gap: 6px;
          }
          .venue-spec {
            flex: 1;
            background: white;
            border-radius: 6px;
            padding: 6px 4px;
            text-align: center;
            border: 1px solid #e2e8f0;
          }
          .venue-spec-value {
            font-size: 12px;
            font-weight: 700;
            color: #4F46E5;
          }
          .venue-spec-label {
            font-size: 8px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          /* === PRICE SECTION === */
          .price-section {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border: 2px solid #a7f3d0;
            border-radius: 12px;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          .price-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .price-icon {
            width: 40px;
            height: 40px;
            background: #10B981;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            font-weight: 700;
          }
          .price-label {
            font-size: 10px;
            color: #047857;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
          }
          .price-amount {
            font-size: 28px;
            font-weight: 800;
            color: #047857;
            letter-spacing: -1px;
          }
          .price-status {
            padding: 6px 14px;
            background: white;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
            color: #047857;
            border: 1px solid #a7f3d0;
          }

          /* === DETAILS ROW === */
          .details-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-bottom: 12px;
          }
          .detail-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 8px;
            text-align: center;
          }
          .detail-value {
            font-size: 14px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 2px;
          }
          .detail-label {
            font-size: 8px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          /* === INCLUDED/EXCLUDED === */
          .scope-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 12px;
          }
          .scope-card {
            padding: 10px 12px;
            border-radius: 8px;
          }
          .scope-included {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
          }
          .scope-excluded {
            background: #fef2f2;
            border: 1px solid #fecaca;
          }
          .scope-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .scope-included .scope-title { color: #16a34a; }
          .scope-excluded .scope-title { color: #dc2626; }
          .scope-list {
            font-size: 10px;
            color: #374151;
            line-height: 1.6;
          }
          .scope-item {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .scope-included .scope-item::before {
            content: '✓';
            color: #16a34a;
            font-weight: 700;
            font-size: 9px;
          }
          .scope-excluded .scope-item::before {
            content: '✗';
            color: #dc2626;
            font-weight: 700;
            font-size: 9px;
          }

          /* === TIMELINE === */
          .timeline-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 12px;
            margin-bottom: 12px;
          }
          .timeline-title {
            font-size: 9px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          .timeline {
            display: flex;
            flex-direction: column;
            gap: 0;
          }
          .timeline-item {
            display: flex;
            gap: 10px;
            position: relative;
            padding-bottom: 8px;
          }
          .timeline-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .timeline-line {
            position: absolute;
            left: 4px;
            top: 14px;
            bottom: 0;
            width: 2px;
            background: #e2e8f0;
          }
          .timeline-content {
            flex: 1;
          }
          .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1px;
          }
          .timeline-actor {
            font-size: 9px;
            color: #64748b;
            font-weight: 500;
          }
          .timeline-date {
            font-size: 9px;
            color: #94a3b8;
          }
          .timeline-action {
            font-size: 11px;
            font-weight: 600;
            color: #1e293b;
          }
          .timeline-amount {
            font-size: 12px;
            font-weight: 700;
            color: #4F46E5;
          }

          /* === FOOTER === */
          .footer {
            margin-top: auto;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .footer-left {
            font-size: 8px;
            color: #94a3b8;
            line-height: 1.5;
          }
          .footer-legal {
            font-weight: 500;
            color: #64748b;
            margin-bottom: 2px;
          }
          .footer-right {
            text-align: right;
          }
          .footer-brand {
            font-size: 11px;
            font-weight: 700;
            color: #4F46E5;
            letter-spacing: -0.3px;
          }
          .footer-url {
            font-size: 9px;
            color: #64748b;
          }
          .footer-qr {
            width: 50px;
            height: 50px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 7px;
            color: #94a3b8;
            text-align: center;
            margin-top: 6px;
          }
        </style>
      </head>
      <body>
        <div class="accent-bar"></div>
        <div class="container">

          <!-- Header -->
          <div class="header">
            <div class="brand">
              <div class="brand-logo">T</div>
              <div class="brand-info">
                <h1>Turing</h1>
                <div class="brand-tagline">Etkinlik Yönetim Platformu</div>
              </div>
            </div>
            <div class="doc-info">
              <div class="doc-type">Teklif Belgesi</div>
              <div class="doc-number">${docNumber}</div>
              <div class="doc-date">${currentDate}</div>
            </div>
          </div>

          <!-- Event Hero -->
          <div class="hero">
            <div class="status-container">
              <span class="status status-${offer.status}">${statusConfig.label}</span>
            </div>
            <div class="hero-badge">🎵 Sanatçı Performansı</div>
            <div class="hero-artist">${offer.serviceCategory === 'booking' && offer.artistName ? offer.artistName : offer.role.split(' - ')[0]}</div>
            <div class="hero-event">${offer.eventTitle}</div>
            <div class="hero-details">
              <div class="hero-detail">
                <div class="hero-icon">📅</div>
                <span>${offer.eventDate}</span>
              </div>
              <div class="hero-detail">
                <div class="hero-icon">📍</div>
                <span>${offer.location}</span>
              </div>
              <div class="hero-detail">
                <div class="hero-icon">⏰</div>
                <span>${eventDetails.concertTime} başlangıç</span>
              </div>
            </div>
          </div>

          <!-- Price Section -->
          <div class="price-section">
            <div class="price-left">
              <div class="price-icon">₺</div>
              <div>
                <div class="price-label">Teklif Tutarı</div>
                <div class="price-amount">₺${offerAmount.toLocaleString('tr-TR')}</div>
              </div>
            </div>
            <div class="price-status">${offer.status === 'accepted' ? '✓ Onaylandı' : offer.status === 'counter_offered' ? '↔ Pazarlık' : 'Değerlendirmede'}</div>
          </div>

          <!-- Main Grid: Organizer & Venue -->
          <div class="main-grid">
            <div class="card">
              <div class="card-header">
                <div class="card-icon">👤</div>
                <div class="card-title">Organizatör</div>
              </div>
              <div class="org-row">
                <div class="org-avatar">${offer.organizer.name.charAt(0)}</div>
                <div>
                  <div class="org-name">${offer.organizer.name}</div>
                  <div class="org-meta"><span class="star">★</span> 4.7 · 45 değerlendirme</div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div class="card-icon">🏛</div>
                <div class="card-title">Mekan</div>
              </div>
              <div class="venue-name">${venueInfo?.name || 'Belirtilmedi'}</div>
              <div class="venue-address">${venueInfo?.district || ''}, ${venueInfo?.city || ''}</div>
              <div class="venue-specs">
                <div class="venue-spec">
                  <div class="venue-spec-value">${venueInfo?.capacity?.toLocaleString('tr-TR') || '-'}</div>
                  <div class="venue-spec-label">Kapasite</div>
                </div>
                <div class="venue-spec">
                  <div class="venue-spec-value">${venueInfo ? getIndoorOutdoorLabel(venueInfo.indoorOutdoor) : '-'}</div>
                  <div class="venue-spec-label">Tip</div>
                </div>
                <div class="venue-spec">
                  <div class="venue-spec-value">${venueInfo?.backstage?.hasBackstage ? 'Var' : 'Yok'}</div>
                  <div class="venue-spec-label">Kulis</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Details -->
          <div class="details-row">
            <div class="detail-box">
              <div class="detail-value">${eventDetails.concertTime}</div>
              <div class="detail-label">Sahne Saati</div>
            </div>
            <div class="detail-box">
              <div class="detail-value">${eventDetails.eventDuration}</div>
              <div class="detail-label">Süre</div>
            </div>
            <div class="detail-box">
              <div class="detail-value">${eventDetails.ageLimit}</div>
              <div class="detail-label">Yaş Sınırı</div>
            </div>
            <div class="detail-box">
              <div class="detail-value">${eventDetails.participantType}</div>
              <div class="detail-label">Katılım</div>
            </div>
          </div>

          <!-- Scope: Included/Excluded -->
          <div class="scope-grid">
            <div class="scope-card scope-included">
              <div class="scope-title">✓ Dahil Olanlar</div>
              <div class="scope-list">
                ${activeIncluded.map(item => `<div class="scope-item">${item}</div>`).join('')}
              </div>
            </div>
            <div class="scope-card scope-excluded">
              <div class="scope-title">✗ Dahil Olmayanlar</div>
              <div class="scope-list">
                ${activeExcluded.map(item => `<div class="scope-item">${item}</div>`).join('')}
              </div>
            </div>
          </div>

          <!-- Timeline -->
          ${offer.history && offer.history.length > 0 ? `
          <div class="timeline-section">
            <div class="timeline-title">Teklif Geçmişi</div>
            <div class="timeline">
              ${timelineHTML}
            </div>
          </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            <div class="footer-left">
              <div class="footer-legal">Bu belge bilgilendirme amaçlıdır.</div>
              Belge No: ${docNumber}<br/>
              Oluşturulma: ${currentDate}
            </div>
            <div class="footer-right">
              <div class="footer-brand">Turing</div>
              <div class="footer-url">www.turingapp.com</div>
              <div class="footer-qr">QR<br/>Doğrulama</div>
            </div>
          </div>

        </div>
      </body>
      </html>
    `;

    try {
      // Generate PDF from HTML
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Teklif_${offer.id}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        // Fallback to native share if sharing not available
        await Share.share({
          url: uri,
          title: `Teklif_${offer.id}`,
        });
      }
    } catch (error) {
      console.warn('PDF generation error:', error);
      Alert.alert('Hata', 'PDF oluşturulurken bir hata oluştu.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      technical: 'Teknik Ekipman',
      booking: 'Sanatçı',
      catering: 'Catering',
      security: 'Güvenlik',
      transport: 'Transfer',
      decoration: 'Dekorasyon',
      media: 'Fotoğraf/Video',
    };
    return names[category] || category;
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#09090B' : '#F8FAFC' }]}>
      {/* Header */}
      <View style={[styles.header, {
        paddingTop: insets.top,
        backgroundColor: isDark ? '#18181B' : '#FFFFFF',
        borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'
      }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Talep Detayı</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={generatePDF} disabled={isGeneratingPDF}>
          <Ionicons name="share-outline" size={22} color={isGeneratingPDF ? colors.textSecondary : '#6366F1'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
            colors={[colors.brand[500]]}
          />
        }
      >
        {/* Status Banner */}
        <View style={[styles.statusBannerCompact, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon as any} size={16} color={statusConfig.color} />
          <Text style={[styles.statusTextCompact, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>

        {/* Rejection Reason Box */}
        {offer.status === 'rejected' && offer.rejectionReason && (
          <View style={[styles.rejectionReasonBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.06)' }]}>
            <View style={styles.rejectionReasonHeader}>
              <Ionicons name="information-circle" size={18} color="#EF4444" />
              <Text style={styles.rejectionReasonTitle}>Red Nedeni</Text>
            </View>
            <Text style={[styles.rejectionReasonText, { color: colors.text }]}>{offer.rejectionReason}</Text>
            {offer.rejectedAt && (
              <Text style={[styles.rejectionReasonDate, { color: colors.textMuted }]}>{offer.rejectedAt}</Text>
            )}
          </View>
        )}

        {/* Info Cards Section */}
        <View style={styles.infoSection}>
          {/* 1. Event Card - Expandable */}
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
                  <Ionicons name="calendar-outline" size={12} color="#6366F1" />
                  <Text style={[styles.infoMetaText, { color: '#6366F1', fontWeight: '600' }]}>{offer.eventDate || 'Tarih Belirtilmedi'}</Text>
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
                {/* Event Stats Row 1 */}
                <View style={styles.providerStats}>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="time-outline" size={16} color="#6366F1" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]}>{offer.eventTime || eventData?.startTime || '--:--'}</Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Saat</Text>
                  </View>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="people-outline" size={16} color="#EC4899" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]}>{offer.eventGuestCount || eventData?.guestCount || '-'}</Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Konuk</Text>
                  </View>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="location-outline" size={16} color="#EF4444" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]} numberOfLines={1}>{offer.location || '-'}</Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Şehir</Text>
                  </View>
                </View>

                {/* Event Stats Row 2 */}
                <View style={[styles.providerStats, { marginTop: 8 }]}>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="musical-notes-outline" size={16} color="#F59E0B" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]} numberOfLines={1}>
                      {getCategoryName(offer.serviceCategory)}
                    </Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Kategori</Text>
                  </View>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]}>
                      {getOptionLabel(ageLimitOptions, offer.eventAgeLimit) || 'Tüm Yaşlar'}
                    </Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Yaş Sınırı</Text>
                  </View>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="grid-outline" size={16} color="#0EA5E9" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]} numberOfLines={1}>
                      {getOptionLabel(seatingTypeOptions, offer.eventSeatingType) || '-'}
                    </Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Düzen</Text>
                  </View>
                </View>

                {/* View Event Button */}
                <TouchableOpacity
                  style={[styles.providerActionBtn, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)', marginTop: 14 }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('ProviderEventDetail', { eventId: offer.eventId });
                  }}
                >
                  <Ionicons name="eye" size={16} color="#6366F1" />
                  <Text style={[styles.providerActionText, { color: '#6366F1' }]}>Etkinlik Detaylarını Görüntüle</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>

          {/* 2. Artist Card - Expandable (only for booking) */}
          {offer.serviceCategory === 'booking' && offer.artistName && (
            <TouchableOpacity
              style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginTop: 8 }]}
              onPress={() => setArtistExpanded(!artistExpanded)}
              activeOpacity={0.7}
            >
              <View style={[styles.infoCardContent, { minHeight: 82, padding: 18 }]}>
                <View style={[styles.infoIconBox, { width: 52, height: 52, borderRadius: 14, backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.06)' }]}>
                  {offer.artistImage ? (
                    <OptimizedImage source={offer.artistImage} style={{ width: 52, height: 52, borderRadius: 14 }} />
                  ) : (
                    <Ionicons name="musical-notes" size={22} color="#8B5CF6" />
                  )}
                </View>
                <View style={styles.infoCardDetails}>
                  <Text style={[styles.infoName, { color: colors.text, fontSize: 16, fontWeight: '700' }]} numberOfLines={1}>{offer.artistName}</Text>
                  <View style={[styles.infoMetaRow, { marginTop: 5 }]}>
                    <Ionicons name="mic-outline" size={12} color="#8B5CF6" />
                    <Text style={[styles.infoMetaText, { color: '#8B5CF6', fontWeight: '600' }]}>Sanatçı</Text>
                  </View>
                  <View style={[styles.infoMetaRow, { marginTop: 3 }]}>
                    <Ionicons name="musical-note-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.infoMetaText, { color: colors.textSecondary }]}>Canlı Performans</Text>
                  </View>
                </View>
                <Ionicons name={artistExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </View>

              {/* Expanded Content */}
              {artistExpanded && (
                <View style={[styles.scopeExpandedContent, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                  {/* Artist Stats */}
                  <View style={styles.providerStats}>
                    <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                      <Ionicons name="disc-outline" size={16} color="#8B5CF6" />
                      <Text style={[styles.providerStatValue, { color: colors.text }]}>10+</Text>
                      <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Albüm</Text>
                    </View>
                    <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                      <Ionicons name="people-outline" size={16} color="#EC4899" />
                      <Text style={[styles.providerStatValue, { color: colors.text }]}>500K+</Text>
                      <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Takipçi</Text>
                    </View>
                    <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                      <Ionicons name="calendar-outline" size={16} color="#10B981" />
                      <Text style={[styles.providerStatValue, { color: colors.text }]}>100+</Text>
                      <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Konser</Text>
                    </View>
                  </View>

                  {/* View Profile Button */}
                  <TouchableOpacity
                    style={[styles.providerActionBtn, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)', marginTop: 14 }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      navigation.navigate('ArtistProfile', { artistId: offer.artistId });
                    }}
                  >
                    <Ionicons name="person" size={16} color="#8B5CF6" />
                    <Text style={[styles.providerActionText, { color: '#8B5CF6' }]}>Sanatçı Profilini Görüntüle</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* 3. Venue Card - Expandable */}
          {venueInfo && (
            <TouchableOpacity
              style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginTop: 8 }]}
              onPress={() => setVenueExpanded(!venueExpanded)}
              activeOpacity={0.7}
            >
              <View style={[styles.infoCardContent, { minHeight: 82, padding: 18 }]}>
                <View style={[styles.infoIconBox, { width: 52, height: 52, borderRadius: 14, backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)' }]}>
                  {venueInfo.images?.[0] ? (
                    <OptimizedImage source={venueInfo.images[0]} style={{ width: 52, height: 52, borderRadius: 14 }} />
                  ) : (
                    <Ionicons name="location" size={22} color="#10B981" />
                  )}
                </View>
                <View style={styles.infoCardDetails}>
                  <Text style={[styles.infoName, { color: colors.text, fontSize: 16, fontWeight: '700' }]} numberOfLines={1}>{venueInfo.name}</Text>
                  <View style={[styles.infoMetaRow, { marginTop: 5 }]}>
                    <Ionicons name="location-outline" size={12} color="#10B981" />
                    <Text style={[styles.infoMetaText, { color: '#10B981', fontWeight: '600' }]}>{venueInfo.district}, {venueInfo.city}</Text>
                  </View>
                  <View style={[styles.infoMetaRow, { marginTop: 3 }]}>
                    <Ionicons name="people-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.infoMetaText, { color: colors.textSecondary }]}>{venueInfo.capacity?.toLocaleString('tr-TR')} kişilik kapasite</Text>
                  </View>
                </View>
                <Ionicons name={venueExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </View>

              {/* Expanded Content */}
              {venueExpanded && (
                <View style={[styles.scopeExpandedContent, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                  {/* Venue Stats */}
                  <View style={styles.providerStats}>
                    <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                      <Ionicons name={venueInfo.indoorOutdoor === 'outdoor' ? 'sunny-outline' : 'home-outline'} size={16} color="#10B981" />
                      <Text style={[styles.providerStatValue, { color: colors.text }]}>{getIndoorOutdoorLabel(venueInfo.indoorOutdoor)}</Text>
                      <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Tip</Text>
                    </View>
                    {venueInfo.rating && (
                      <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                        <Ionicons name="star" size={16} color="#FBBF24" />
                        <Text style={[styles.providerStatValue, { color: colors.text }]}>{venueInfo.rating}</Text>
                        <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Puan</Text>
                      </View>
                    )}
                    {venueInfo.backstage?.hasBackstage && (
                      <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        <Text style={[styles.providerStatValue, { color: colors.text }]}>Var</Text>
                        <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Kulis</Text>
                      </View>
                    )}
                  </View>

                  {/* View Venue Button */}
                  <TouchableOpacity
                    style={[styles.providerActionBtn, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)', marginTop: 14 }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      navigation.navigate('VenueDetail', {
                        venueName: venueInfo.name,
                        venueAddress: venueInfo.address || '',
                        venueCity: venueInfo.city || '',
                        venueDistrict: venueInfo.district || '',
                        venueCapacity: venueInfo.capacity ? String(venueInfo.capacity) : '',
                        venueImage: venueInfo.images?.[0] || '',
                        indoorOutdoor: venueInfo.indoorOutdoor || '',
                        seatingType: venueInfo.seatingType || '',
                      });
                    }}
                  >
                    <Ionicons name="eye" size={16} color="#10B981" />
                    <Text style={[styles.providerActionText, { color: '#10B981' }]}>Mekan Detaylarını Görüntüle</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* 4. Organizer Card - Expandable */}
          <TouchableOpacity
            style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginTop: 8 }]}
            onPress={() => setOrganizerExpanded(!organizerExpanded)}
            activeOpacity={0.7}
          >
            <View style={[styles.infoCardContent, { minHeight: 82, padding: 18 }]}>
              <View style={[styles.infoIconBox, { width: 52, height: 52, borderRadius: 14, backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)' }]}>
                <Ionicons name="person" size={22} color="#6366F1" />
              </View>
              <View style={styles.infoCardDetails}>
                <Text style={[styles.infoName, { color: colors.text, fontSize: 16, fontWeight: '700' }]} numberOfLines={1}>{offer.organizer.name}</Text>
                <View style={[styles.infoMetaRow, { marginTop: 5 }]}>
                  <Ionicons name="star" size={12} color="#FBBF24" />
                  <Text style={[styles.infoMetaText, { color: '#FBBF24', fontWeight: '600' }]}>4.7 · 45 etkinlik düzenlendi</Text>
                </View>
                <View style={[styles.infoMetaRow, { marginTop: 3 }]}>
                  <Ionicons name="briefcase-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.infoMetaText, { color: colors.textSecondary }]}>Organizatör</Text>
                </View>
              </View>
              <Ionicons name={organizerExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
            </View>

            {/* Expanded Content */}
            {organizerExpanded && (
              <View style={[styles.scopeExpandedContent, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                {/* Organizer Stats */}
                <View style={styles.providerStats}>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="calendar-outline" size={16} color="#6366F1" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]}>45</Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Etkinlik</Text>
                  </View>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="star" size={16} color="#FBBF24" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]}>4.7</Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Puan</Text>
                  </View>
                  <View style={[styles.providerStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={[styles.providerStatValue, { color: colors.text }]}>%98</Text>
                    <Text style={[styles.providerStatLabel, { color: colors.textSecondary }]}>Onay</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={[styles.providerActions, { marginTop: 14 }]}>
                  <TouchableOpacity
                    style={[styles.providerActionBtn, { flex: 1, backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}
                    onPress={(e) => { e.stopPropagation(); handleCall(); }}
                  >
                    <Ionicons name="call" size={16} color="#10B981" />
                    <Text style={[styles.providerActionText, { color: '#10B981' }]}>Ara</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.providerActionBtn, { flex: 1, backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)' }]}
                    onPress={(e) => { e.stopPropagation(); handleChat(); }}
                  >
                    <Ionicons name="chatbubble" size={16} color="#6366F1" />
                    <Text style={[styles.providerActionText, { color: '#6366F1' }]}>Mesaj</Text>
                  </TouchableOpacity>
                </View>

                {/* View Profile Button */}
                <TouchableOpacity
                  style={[styles.providerActionBtn, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)', marginTop: 8 }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('ProviderDetail', { providerId: offer.organizer.id || 'ORG001', providerName: offer.organizer.name });
                  }}
                >
                  <Ionicons name="person" size={16} color="#6366F1" />
                  <Text style={[styles.providerActionText, { color: '#6366F1' }]}>Profili Görüntüle</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>

          {/* 5. Timeline Card - Expandable */}
          {offer.history && offer.history.length > 0 && (
            <TouchableOpacity
              style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginTop: 8 }]}
              onPress={() => setTimelineExpanded(!timelineExpanded)}
              activeOpacity={0.7}
            >
              <View style={[styles.infoCardContent, { minHeight: 72, padding: 16 }]}>
                <View style={[styles.infoIconBox, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.06)' }]}>
                  <Ionicons name="git-branch" size={18} color="#F97316" />
                </View>
                <View style={styles.infoCardDetails}>
                  <Text style={[styles.infoName, { color: colors.text }]}>Teklif Süreci</Text>
                  <View style={styles.infoMetaRow}>
                    <Ionicons name="swap-horizontal-outline" size={11} color={colors.textSecondary} />
                    <Text style={[styles.infoMetaText, { color: colors.textSecondary }]}>{offer.history.length} adım</Text>
                  </View>
                </View>
                <Ionicons name={timelineExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
              </View>

              {/* Expanded Content */}
              {timelineExpanded && (
                <View style={[styles.scopeExpandedContent, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                  <OfferTimeline history={offer.history} currentUserRole="provider" />
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* 6. Notes Card - Expandable */}
          {offer.notes && (
            <TouchableOpacity
              style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginTop: 8 }]}
              onPress={() => setNotesExpanded(!notesExpanded)}
              activeOpacity={0.7}
            >
              <View style={[styles.infoCardContent, { minHeight: 72, padding: 16 }]}>
                <View style={[styles.infoIconBox, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.06)' }]}>
                  <Ionicons name="document-text" size={18} color="#EC4899" />
                </View>
                <View style={styles.infoCardDetails}>
                  <Text style={[styles.infoName, { color: colors.text }]}>Talep Notu</Text>
                  <View style={styles.infoMetaRow}>
                    <Ionicons name="chatbox-outline" size={11} color={colors.textSecondary} />
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
                  <Text style={[styles.providerBio, { color: colors.text }]}>{offer.notes}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* 7. Event Details Card - Expandable */}
          <TouchableOpacity
            style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginTop: 8 }]}
            onPress={() => setDetailsExpanded(!detailsExpanded)}
            activeOpacity={0.7}
          >
            <View style={[styles.infoCardContent, { minHeight: 72, padding: 16 }]}>
              <View style={[styles.infoIconBox, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)' }]}>
                <Ionicons name="list" size={18} color="#6366F1" />
              </View>
              <View style={styles.infoCardDetails}>
                <Text style={[styles.infoName, { color: colors.text }]}>Etkinlik Detayları</Text>
                <View style={styles.infoMetaRow}>
                  <Ionicons name="information-circle-outline" size={11} color={colors.textSecondary} />
                  <Text style={[styles.infoMetaText, { color: colors.textSecondary }]}>Organizatör tarafından girilen bilgiler</Text>
                </View>
              </View>
              <Ionicons name={detailsExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
            </View>

            {/* Expanded Content */}
            {detailsExpanded && (
              <View style={[styles.scopeExpandedContent, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                {/* Detail Items */}
                <View style={styles.detailsList}>
                  {offer.eventTime && (
                    <View style={[styles.detailRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                      <View style={styles.detailRowLeft}>
                        <Ionicons name="time-outline" size={16} color="#6366F1" />
                        <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>Etkinlik Saati</Text>
                      </View>
                      <Text style={[styles.detailRowValue, { color: colors.text }]}>{offer.eventTime}</Text>
                    </View>
                  )}

                  {offer.formData?.duration && (
                    <View style={[styles.detailRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                      <View style={styles.detailRowLeft}>
                        <Ionicons name="hourglass-outline" size={16} color="#8B5CF6" />
                        <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>Performans Süresi</Text>
                      </View>
                      <Text style={[styles.detailRowValue, { color: colors.text }]}>{offer.formData.duration}</Text>
                    </View>
                  )}

                  {offer.eventGuestCount && (
                    <View style={[styles.detailRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                      <View style={styles.detailRowLeft}>
                        <Ionicons name="people-outline" size={16} color="#EC4899" />
                        <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>Tahmini Katılımcı</Text>
                      </View>
                      <Text style={[styles.detailRowValue, { color: colors.text }]}>{offer.eventGuestCount} kişi</Text>
                    </View>
                  )}

                  {offer.eventAgeLimit && (
                    <View style={[styles.detailRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                      <View style={styles.detailRowLeft}>
                        <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                        <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>Yaş Sınırı</Text>
                      </View>
                      <Text style={[styles.detailRowValue, { color: colors.text }]}>{getOptionLabel(ageLimitOptions, offer.eventAgeLimit) || offer.eventAgeLimit}</Text>
                    </View>
                  )}

                  {offer.eventSeatingType && (
                    <View style={[styles.detailRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                      <View style={styles.detailRowLeft}>
                        <Ionicons name="grid-outline" size={16} color="#0EA5E9" />
                        <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>Oturma Düzeni</Text>
                      </View>
                      <Text style={[styles.detailRowValue, { color: colors.text }]}>{getOptionLabel(seatingTypeOptions, offer.eventSeatingType) || offer.eventSeatingType}</Text>
                    </View>
                  )}

                  {offer.eventIndoorOutdoor && (
                    <View style={[styles.detailRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                      <View style={styles.detailRowLeft}>
                        <Ionicons name={offer.eventIndoorOutdoor === 'outdoor' ? 'sunny-outline' : 'home-outline'} size={16} color="#10B981" />
                        <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>Mekan Tipi</Text>
                      </View>
                      <Text style={[styles.detailRowValue, { color: colors.text }]}>{getOptionLabel(indoorOutdoorOptions, offer.eventIndoorOutdoor) || offer.eventIndoorOutdoor}</Text>
                    </View>
                  )}

                  {offer.formData?.soundSystem && (
                    <View style={[styles.detailRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                      <View style={styles.detailRowLeft}>
                        <Ionicons name="volume-high-outline" size={16} color="#F59E0B" />
                        <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>Ses Sistemi</Text>
                      </View>
                      <Text style={[styles.detailRowValue, { color: colors.text }]}>{offer.formData.soundSystem === 'provided' ? 'Sağlanacak' : 'Sanatçı Getirecek'}</Text>
                    </View>
                  )}

                  {offer.formData?.lighting && (
                    <View style={[styles.detailRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                      <View style={styles.detailRowLeft}>
                        <Ionicons name="flashlight-outline" size={16} color="#FBBF24" />
                        <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>Işık Sistemi</Text>
                      </View>
                      <Text style={[styles.detailRowValue, { color: colors.text }]}>{offer.formData.lighting === 'provided' ? 'Sağlanacak' : 'Sanatçı Getirecek'}</Text>
                    </View>
                  )}

                  {offer.formData?.backstage !== undefined && (
                    <View style={[styles.detailRow, { borderBottomColor: 'transparent' }]}>
                      <View style={styles.detailRowLeft}>
                        <Ionicons name="enter-outline" size={16} color="#6366F1" />
                        <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>Kulis</Text>
                      </View>
                      <Text style={[styles.detailRowValue, { color: colors.text }]}>{offer.formData.backstage ? 'Mevcut' : 'Yok'}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* 8. Current Offer Amount Card */}
          <View style={[styles.infoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginTop: 8 }]}>
            <View style={[styles.infoCardContent, { minHeight: 72, padding: 16 }]}>
              <View style={[styles.infoIconBox, {
                backgroundColor: offer.status === 'accepted'
                  ? (isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)')
                  : offer.counterOffer
                    ? (isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.06)')
                    : (isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)')
              }]}>
                <Ionicons
                  name={offer.status === 'accepted' ? 'checkmark-circle' : offer.counterOffer ? 'swap-horizontal' : 'cash'}
                  size={18}
                  color={offer.status === 'accepted' ? '#10B981' : offer.counterOffer ? '#F59E0B' : '#6366F1'}
                />
              </View>
              <View style={styles.infoCardDetails}>
                <Text style={[styles.infoName, { color: colors.text }]}>
                  {offer.status === 'accepted' ? 'Onaylanan Tutar' : offer.counterOffer ? 'Karşı Teklif' : providerOfferAmount ? 'Güncel Teklif' : 'Talep Edilen Bütçe'}
                </Text>
                <View style={styles.infoMetaRow}>
                  <Text style={[styles.infoMetaText, {
                    color: offer.status === 'accepted' ? '#10B981' : offer.counterOffer ? '#F59E0B' : providerOfferAmount ? '#10B981' : '#6366F1',
                    fontSize: 18,
                    fontWeight: '700'
                  }]}>
                    {offer.status === 'accepted' && finalAcceptedAmount
                      ? `₺${finalAcceptedAmount.toLocaleString('tr-TR')}`
                      : offer.counterOffer
                        ? `₺${offer.counterOffer.amount.toLocaleString('tr-TR')}`
                        : providerOfferAmount
                          ? `₺${providerOfferAmount.toLocaleString('tr-TR')}`
                          : organizerBudget
                            ? `₺${organizerBudget.toLocaleString('tr-TR')}`
                            : 'Belirtilmedi'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Event Images - Gallery Thumbnails */}
        {eventDetails.images.length > 0 && (
          <View style={[styles.card, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ETKİNLİK GÖRSELLERİ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
              {eventDetails.images.map((img, index) => (
                <OptimizedImage
                  key={index}
                  source={img}
                  style={styles.galleryThumbnail}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Share Button */}
        <TouchableOpacity
          style={[styles.pdfButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}
          onPress={generatePDF}
          disabled={isGeneratingPDF}
        >
          <Ionicons name="share-social-outline" size={20} color="#6366F1" />
          <Text style={[styles.pdfButtonText, { color: '#6366F1' }]}>
            {isGeneratingPDF ? 'Hazırlanıyor...' : 'Teklif Detaylarını Paylaş'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, {
        backgroundColor: isDark ? '#18181B' : '#FFFFFF',
        paddingBottom: Math.max(insets.bottom, 34) + 60,
        borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'
      }]}>
        {offer.status === 'counter_offered' && offer.counterOffer ? (
          <>
            <TouchableOpacity style={styles.rejectBtn} onPress={handleRejectOffer}>
              <Ionicons name="close" size={22} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.counterBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}
              onPress={() => setShowOfferModal(true)}
            >
              <Ionicons name="swap-horizontal" size={18} color={colors.text} />
              <Text style={[styles.counterBtnText, { color: colors.text }]}>Yeni Teklif</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={handleAcceptCounterOffer}>
              <Text style={styles.acceptBtnText}>Kabul Et</Text>
            </TouchableOpacity>
          </>
        ) : offer.status === 'accepted' && offer.contractSigned ? (
          // Sözleşme imzalandı - Etkinliği Görüntüle
          <TouchableOpacity
            style={styles.operationsBtn}
            onPress={() => navigation.navigate('ProviderEventDetail', {
              eventId: offer.eventId,
            })}
          >
            <Ionicons name="calendar-outline" size={20} color="white" />
            <Text style={styles.operationsBtnText}>Etkinliği Görüntüle</Text>
          </TouchableOpacity>
        ) : offer.status === 'accepted' ? (
          // Teklif kabul edildi ama sözleşme henüz imzalanmadı
          <TouchableOpacity
            style={styles.contractBtn}
            onPress={() => navigation.navigate('Contract', {
              offerId: offer.id,
              eventId: offer.eventId,
              eventTitle: offer.eventTitle,
              eventDate: offer.eventDate,
              artistName: offer.artistName,
              organizerName: offer.organizer.name,
              amount: offer.finalAmount || offer.amount,
            })}
          >
            <Ionicons name="document-text-outline" size={20} color="white" />
            <Text style={styles.contractBtnText}>Sözleşmeyi Görüntüle</Text>
          </TouchableOpacity>
        ) : offer.status === 'rejected' ? (
          <View style={styles.rejectedBottomInfo}>
            <Ionicons name="close-circle" size={20} color="#EF4444" />
            <Text style={styles.rejectedBottomText}>Bu talep reddedildi</Text>
          </View>
        ) : organizerBudget ? (
          // Organizatör bütçe göndermiş - Kabul Et ve Karşı Teklif butonları
          <>
            <TouchableOpacity style={styles.rejectBtn} onPress={handleRejectOffer}>
              <Ionicons name="close" size={22} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.counterOfferBtn} onPress={() => setShowOfferModal(true)}>
              <Ionicons name="swap-horizontal" size={18} color="#6366F1" />
              <Text style={styles.counterOfferBtnText}>Karşı Teklif</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={handleAcceptOrganizerBudget}>
              <Text style={styles.acceptBtnText}>Kabul Et</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Bütçe yok - sadece Teklif Ver butonu
          <>
            <TouchableOpacity style={styles.rejectBtn} onPress={handleRejectOffer}>
              <Ionicons name="close" size={22} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitOfferBtn} onPress={() => setShowOfferModal(true)}>
              <Text style={styles.submitOfferBtnText}>Teklif Ver</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Offer Modal */}
      <Modal visible={showOfferModal} animationType="slide" transparent onRequestClose={() => setShowOfferModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={styles.modalHandle}>
              <View style={[styles.modalHandleBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#E2E8F0' }]} />
            </View>

            <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Teklif Ver</Text>
              <TouchableOpacity onPress={() => setShowOfferModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Current Offer Reference - Show latest state */}
              {offer.counterOffer ? (
                <View style={[styles.budgetRef, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }]}>
                  <Text style={[styles.budgetRefLabel, { color: '#F59E0B' }]}>
                    {offer.counterOffer.by === 'organizer' ? 'Organizatör Karşı Teklifi' : 'Sizin Son Teklifiniz'}
                  </Text>
                  <Text style={[styles.budgetRefValue, { color: '#F59E0B' }]}>
                    ₺{offer.counterOffer.amount.toLocaleString('tr-TR')}
                  </Text>
                </View>
              ) : providerOfferAmount ? (
                <View style={[styles.budgetRef, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)' }]}>
                  <Text style={[styles.budgetRefLabel, { color: '#10B981' }]}>Sizin Mevcut Teklifiniz</Text>
                  <Text style={[styles.budgetRefValue, { color: '#10B981' }]}>
                    ₺{providerOfferAmount.toLocaleString('tr-TR')}
                  </Text>
                </View>
              ) : organizerBudget ? (
                <View style={[styles.budgetRef, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)' }]}>
                  <Text style={[styles.budgetRefLabel, { color: '#6366F1' }]}>Organizatör Bütçe Teklifi</Text>
                  <Text style={[styles.budgetRefValue, { color: '#6366F1' }]}>
                    ₺{organizerBudget.toLocaleString('tr-TR')}
                  </Text>
                </View>
              ) : (
                <View style={[styles.budgetRef, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
                  <Text style={[styles.budgetRefLabel, { color: colors.textSecondary }]}>Referans Bütçe</Text>
                  <Text style={[styles.budgetRefValue, { color: colors.textSecondary }]}>Bütçe İletilmedi</Text>
                </View>
              )}

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Teklif Tutarı</Text>
              <View style={[styles.inputContainer, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'
              }]}>
                <Text style={[styles.inputPrefix, { color: colors.text }]}>₺</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  value={offerAmount}
                  onChangeText={(t) => setOfferAmount(formatCurrency(t))}
                  keyboardType="number-pad"
                />
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 20 }]}>Açıklama (Opsiyonel)</Text>
              <TextInput
                style={[styles.textArea, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                  color: colors.text
                }]}
                placeholder="Teklifiniz hakkında detay ekleyin..."
                placeholderTextColor={colors.textSecondary}
                value={offerNote}
                onChangeText={setOfferNote}
                multiline
                numberOfLines={3}
              />

              {/* What's Included for Booking */}
              <View style={[styles.includedBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.06)' : 'rgba(16, 185, 129, 0.04)' }]}>
                <Text style={[styles.includedTitle, { color: '#10B981' }]}>Dahil Olanlar</Text>
                <View style={styles.includedList}>
                  {includedItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.includedItem}
                      onPress={() => toggleIncludedItem(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={item.enabled ? 'checkmark-circle' : 'ellipse-outline'}
                        size={18}
                        color={item.enabled ? '#10B981' : colors.textMuted}
                      />
                      <Text style={[styles.includedText, { color: item.enabled ? colors.text : colors.textMuted }]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* What's NOT Included */}
              <View style={[styles.excludedBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.06)' : 'rgba(239, 68, 68, 0.04)' }]}>
                <Text style={[styles.excludedTitle, { color: '#EF4444' }]}>Dahil Olmayanlar</Text>
                <View style={styles.excludedList}>
                  {excludedItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.excludedItem}
                      onPress={() => toggleExcludedItem(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={item.enabled ? 'close-circle' : 'ellipse-outline'}
                        size={18}
                        color={item.enabled ? '#EF4444' : colors.textMuted}
                      />
                      <Text style={[styles.excludedText, { color: item.enabled ? colors.text : colors.textMuted }]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}
                onPress={() => setShowOfferModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSubmitOffer}>
                <Text style={styles.modalSubmitText}>Teklifi Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal visible={showRejectModal} animationType="slide" transparent onRequestClose={() => setShowRejectModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.rejectModalContent, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={styles.modalHandle}>
              <View style={[styles.modalHandleBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#E2E8F0' }]} />
            </View>

            <Text style={[styles.rejectModalTitle, { color: colors.text }]}>Talebi Reddet</Text>
            <Text style={[styles.rejectModalSubtitle, { color: colors.textSecondary }]}>
              Lütfen red nedeninizi seçin
            </Text>

            {/* Rejection Reasons List */}
            <View style={styles.rejectReasonsList}>
              {rejectionReasons.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.rejectReasonItem,
                    {
                      backgroundColor: selectedRejectReason === reason.id
                        ? (isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)')
                        : (isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC'),
                      borderColor: selectedRejectReason === reason.id ? '#EF4444' : (isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'),
                    }
                  ]}
                  onPress={() => setSelectedRejectReason(reason.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.rejectReasonRadio,
                    {
                      borderColor: selectedRejectReason === reason.id ? '#EF4444' : (isDark ? 'rgba(255,255,255,0.3)' : '#CBD5E1'),
                      backgroundColor: selectedRejectReason === reason.id ? '#EF4444' : 'transparent',
                    }
                  ]}>
                    {selectedRejectReason === reason.id && (
                      <View style={styles.rejectReasonRadioInner} />
                    )}
                  </View>
                  <Text style={[
                    styles.rejectReasonLabel,
                    {
                      color: selectedRejectReason === reason.id ? '#EF4444' : colors.text,
                      fontWeight: selectedRejectReason === reason.id ? '600' : '400',
                    }
                  ]}>
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Reason Input - Only shows when "Diğer" is selected */}
            {selectedRejectReason === 'other' && (
              <View style={styles.customReasonContainer}>
                <TextInput
                  style={[
                    styles.customReasonInput,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                      color: colors.text,
                    }
                  ]}
                  placeholder="Red nedeninizi yazın..."
                  placeholderTextColor={colors.textMuted}
                  value={customRejectReason}
                  onChangeText={setCustomRejectReason}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.rejectModalActions}>
              <TouchableOpacity
                style={[styles.rejectModalCancelBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}
                onPress={() => setShowRejectModal(false)}
              >
                <Text style={[styles.rejectModalCancelText, { color: colors.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.rejectModalConfirmBtn,
                  { opacity: selectedRejectReason ? 1 : 0.5 }
                ]}
                onPress={confirmRejectOffer}
                disabled={!selectedRejectReason}
              >
                <Text style={styles.rejectModalConfirmText}>Reddet</Text>
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

  // Hero Header Card
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroArtist: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroEvent: {
    fontSize: 14,
    marginBottom: 12,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroMetaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  heroMetaDivider: {
    width: 1,
    height: 14,
    marginHorizontal: 12,
  },
  categoryBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
  },
  socialInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  socialIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },

  // Status Banner - Compact
  statusBannerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  statusTextCompact: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Rejection Reason Box
  rejectionReasonBox: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  rejectionReasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  rejectionReasonTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  rejectionReasonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  rejectionReasonDate: {
    fontSize: 11,
    marginTop: 8,
  },

  // Info Section with Expandable Cards
  infoSection: {
    paddingHorizontal: 16,
    marginTop: 12,
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
    fontSize: 15,
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
  scopeExpandedContent: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
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
  detailsList: {
    gap: 0,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailRowLabel: {
    fontSize: 13,
  },
  detailRowValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Status Banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  statusText: { fontSize: 14, fontWeight: '600' },

  // Images Section
  imagesSection: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventImage: {
    width: SCREEN_WIDTH - 32,
    height: 200,
    borderRadius: 16,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Gallery Thumbnails
  galleryScroll: {
    marginHorizontal: -4,
  },
  galleryThumbnail: {
    width: 100,
    height: 70,
    borderRadius: 8,
    marginHorizontal: 4,
  },

  // Cards
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // Event Info
  eventHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: { fontSize: 11, fontWeight: '600', color: '#6366F1' },

  // Event Title - Small/Secondary
  eventTitleSmall: { fontSize: 13, marginBottom: 2 },

  // Artist Name - Clean but prominent
  artistNameClean: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  // Event Meta - Clean layout
  eventMetaClean: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  metaItemClean: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaTextBold: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Social Links - Simple
  socialLinksSimple: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  socialBtnSimple: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Legacy styles (kept for compatibility)
  eventTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  roleText: { fontSize: 14, marginBottom: 12 },
  eventMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13 },
  socialLinks: { flexDirection: 'row', gap: 10 },
  socialBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Organizer - Compact
  organizerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerImageSmall: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  organizerInfoCompact: {
    flex: 1,
    marginLeft: 10,
  },
  organizerLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  organizerNameCompact: {
    fontSize: 14,
    fontWeight: '600',
  },
  organizerRatingCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  ratingTextCompact: { fontSize: 12, fontWeight: '600' },
  reviewCountCompact: { fontSize: 11 },
  organizerActionsCompact: {
    flexDirection: 'row',
    gap: 8,
  },
  organizerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevronIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  actionBtnSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Organizer - Legacy
  organizerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  organizerImage: { width: 48, height: 48, borderRadius: 12 },
  organizerInfo: { flex: 1, marginLeft: 12 },
  organizerName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  organizerRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '600' },
  reviewCount: { fontSize: 13 },
  organizerActions: { flexDirection: 'row', gap: 10 },
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

  // Venue Summary Card
  venueSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  venueDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  venueDetailBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  venueSummaryContent: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  venueThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  venueSummaryInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  venueName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  venueLocation: { fontSize: 12, marginBottom: 4 },
  venueRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  venueRatingText: { fontSize: 12, fontWeight: '600' },
  venueReviewCount: { fontSize: 11 },
  venueQuickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  venueQuickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  venueQuickText: { fontSize: 12, fontWeight: '500' },

  // Venue Modal
  venueModalContent: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  venueModalHeader: {
    paddingBottom: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  venueModalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  venueModalTitle: { fontSize: 18, fontWeight: '700' },
  venueModalClose: { padding: 4 },
  venueModalBody: { flex: 1, paddingHorizontal: 16 },
  venueImagesSection: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  venueModalImage: {
    width: SCREEN_WIDTH - 32,
    height: 180,
    borderRadius: 16,
  },
  venueModalCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  venueModalName: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  venueModalAddressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 8,
  },
  venueModalAddress: { fontSize: 13, flex: 1 },
  venueModalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  venueModalRatingText: { fontSize: 14, fontWeight: '600' },
  venueModalReviewCount: { fontSize: 12 },
  venueMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  venueMapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  venueModalSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  venueStatsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  venueStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 6,
  },
  venueStatValue: { fontSize: 15, fontWeight: '700' },
  venueStatLabel: { fontSize: 11 },

  // Halls
  hallItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1.5,
  },
  hallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hallName: { fontSize: 14, fontWeight: '600' },
  selectedBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectedBadgeText: { fontSize: 10, fontWeight: '600', color: '#FFFFFF' },
  hallDetails: {},
  hallDetail: { fontSize: 12 },

  // Stage Dimensions
  stageDimensions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDimItem: { flex: 1, alignItems: 'center' },
  stageDimValue: { fontSize: 22, fontWeight: '700' },
  stageDimLabel: { fontSize: 11, marginTop: 2 },
  stageDimDivider: { width: 1, height: 40, marginHorizontal: 16 },

  // Backstage
  backstageInfo: {},
  backstageRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 8,
  },
  backstageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backstageText: { fontSize: 13 },
  backstageNotes: { fontSize: 12, fontStyle: 'italic', marginTop: 4 },

  // Facilities
  facilitiesGrid: { gap: 8 },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
  },
  facilityText: { fontSize: 13 },

  // Contact
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactInfo: {},
  contactName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  contactPhone: { fontSize: 13 },
  contactCallBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Legacy Venue styles (kept for compatibility)
  venueAddress: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  venueAddressText: { fontSize: 13 },
  venueSpecs: { flexDirection: 'row', gap: 8 },
  venueSpecItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 10 },
  venueSpecValue: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  venueSpecLabel: { fontSize: 11 },

  // Details Grid
  detailsGrid: { gap: 0 },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 14, fontWeight: '500' },

  // Budget
  budgetBox: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
  },
  budgetLabel: { fontSize: 12, marginBottom: 4 },
  budgetAmount: { fontSize: 28, fontWeight: '700' },
  budgetNote: { fontSize: 13, fontStyle: 'italic', marginTop: 8 },
  budgetNotProvided: {
    gap: 8,
  },
  budgetNotProvidedText: { fontSize: 16, fontWeight: '600' },
  budgetNotProvidedSubtext: { fontSize: 13 },
  finalAmountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timelineContainer: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineDetail: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Counter Offer Box
  counterOfferBox: {
    padding: 16,
    borderRadius: 12,
  },
  counterOfferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  counterOfferTitle: { fontSize: 14, fontWeight: '600' },
  counterOfferAmount: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  counterOfferMessage: { fontSize: 13, fontStyle: 'italic' },

  // PDF Button
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
  },
  pdfButtonText: { fontSize: 14, fontWeight: '600' },

  // Bottom Bar
  bottomBar: {
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
  counterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  counterBtnText: { fontSize: 14, fontWeight: '600' },
  counterOfferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 0.6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  counterOfferBtnText: { color: '#6366F1', fontSize: 14, fontWeight: '600' },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  submitOfferBtn: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitOfferBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  operationsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
  },
  operationsBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  contractBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
  },
  contractBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },

  // Rejected Bottom Info
  rejectedBottomInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
  },
  rejectedBottomText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },

  // Rejection Modal
  rejectModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  rejectModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  rejectModalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  rejectReasonsList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  rejectReasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 12,
  },
  rejectReasonRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectReasonRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  rejectReasonLabel: {
    fontSize: 15,
    flex: 1,
  },
  customReasonContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  customReasonInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 80,
  },
  rejectModalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  rejectModalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  rejectModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  rejectModalConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  rejectModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
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
  budgetRef: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  budgetRefLabel: { fontSize: 12, marginBottom: 4 },
  budgetRefValue: { fontSize: 18, fontWeight: '700' },
  inputLabel: { fontSize: 13, fontWeight: '500', marginBottom: 10 },
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
  includedBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  includedTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  includedList: { gap: 10 },
  includedItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  includedText: { fontSize: 13, flex: 1 },
  excludedBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  excludedTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  excludedList: { gap: 10 },
  excludedItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  excludedText: { fontSize: 13, flex: 1 },
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

export default ProviderRequestDetailScreen;
