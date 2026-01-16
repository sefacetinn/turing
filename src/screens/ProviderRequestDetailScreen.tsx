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
  Dimensions,
  Share,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { providerOffers } from '../data/offersData';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

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
  const { offerId } = (route.params as { offerId: string }) || { offerId: 'po_book_2' };

  const offer = providerOffers.find(o => o.id === offerId) || providerOffers.find(o => o.serviceCategory === 'booking') || providerOffers[0];

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [venueImageIndex, setVenueImageIndex] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  // Venue info varies based on event
  const getVenueInfo = (): VenueInfo => {
    const venues: Record<string, VenueInfo> = {
      'po_book_1': {
        id: 'v1',
        name: 'Volkswagen Arena',
        address: 'Huzur Mah. Maslak Ayazağa Cad. No:4',
        city: 'İstanbul',
        district: 'Sarıyer',
        capacity: 5000,
        indoorOutdoor: 'indoor',
        venueType: 'arena',
        stageWidth: 18,
        stageDepth: 12,
        stageHeight: 8,
        backstage: {
          hasBackstage: true,
          roomCount: 4,
          hasMirror: true,
          hasShower: true,
          hasPrivateToilet: true,
          cateringAvailable: true,
          notes: 'Ana kulis + 3 sanatçı odası',
        },
        hasSoundSystem: true,
        hasLightingSystem: true,
        hasParkingArea: true,
        parkingCapacity: 500,
        images: [
          'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
          'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
        ],
        contactName: 'Mehmet Yılmaz',
        contactPhone: '+90 212 999 00 00',
        rating: 4.8,
        reviewCount: 127,
      },
      'po_book_2': {
        id: 'v2',
        name: 'The Ritz-Carlton Istanbul',
        address: 'Süzer Plaza, Askerocağı Cad. No:6',
        city: 'İstanbul',
        district: 'Şişli',
        capacity: 800,
        indoorOutdoor: 'indoor',
        venueType: 'hotel_ballroom',
        halls: [
          { id: 'h1', name: 'Grand Ballroom', capacity: 800, seatingType: 'seated', stageWidth: 10, stageDepth: 6, isMainHall: true },
          { id: 'h2', name: 'Salon A', capacity: 200, seatingType: 'seated', stageWidth: 6, stageDepth: 4 },
          { id: 'h3', name: 'Salon B', capacity: 150, seatingType: 'seated', stageWidth: 5, stageDepth: 3 },
        ],
        selectedHallId: 'h1',
        backstage: {
          hasBackstage: true,
          roomCount: 2,
          hasMirror: true,
          hasShower: false,
          hasPrivateToilet: true,
          cateringAvailable: true,
          notes: 'VIP hazırlık odası mevcut',
        },
        hasSoundSystem: true,
        hasLightingSystem: true,
        hasParkingArea: true,
        parkingCapacity: 200,
        images: [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        ],
        contactName: 'Ayşe Kaya',
        contactPhone: '+90 212 334 44 44',
        rating: 4.9,
        reviewCount: 89,
      },
      'po_book_3': {
        id: 'v3',
        name: 'Harbiye Cemil Topuzlu Açıkhava',
        address: 'Taşkışla Cad. Harbiye',
        city: 'İstanbul',
        district: 'Şişli',
        capacity: 4500,
        indoorOutdoor: 'outdoor',
        venueType: 'open_air',
        stageWidth: 20,
        stageDepth: 14,
        stageHeight: 10,
        backstage: {
          hasBackstage: true,
          roomCount: 6,
          hasMirror: true,
          hasShower: true,
          hasPrivateToilet: true,
          cateringAvailable: true,
          notes: 'Tarihi kulis alanı, klimalı odalar',
        },
        hasSoundSystem: true,
        hasLightingSystem: true,
        hasParkingArea: false,
        images: [
          'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
          'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        ],
        contactName: 'CRR Organizasyon',
        contactPhone: '+90 212 231 54 98',
        rating: 4.7,
        reviewCount: 234,
      },
      'default': {
        id: 'v4',
        name: 'Zorlu PSM Ana Salon',
        address: 'Zorlu Center, Levazım Mah.',
        city: 'İstanbul',
        district: 'Beşiktaş',
        capacity: 2200,
        indoorOutdoor: 'indoor',
        venueType: 'concert_hall',
        halls: [
          { id: 'z1', name: 'Ana Salon', capacity: 2200, seatingType: 'seated', stageWidth: 16, stageDepth: 10, stageHeight: 12, isMainHall: true },
          { id: 'z2', name: 'Studio', capacity: 750, seatingType: 'mixed', stageWidth: 12, stageDepth: 8 },
          { id: 'z3', name: 'Drama Sahnesi', capacity: 400, seatingType: 'seated', stageWidth: 10, stageDepth: 8 },
        ],
        selectedHallId: 'z1',
        backstage: {
          hasBackstage: true,
          roomCount: 8,
          hasMirror: true,
          hasShower: true,
          hasPrivateToilet: true,
          cateringAvailable: true,
          notes: 'Profesyonel backstage, özel asansör',
        },
        hasSoundSystem: true,
        hasLightingSystem: true,
        hasParkingArea: true,
        parkingCapacity: 2500,
        images: [
          'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800',
          'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800',
        ],
        contactName: 'Zorlu PSM',
        contactPhone: '+90 850 222 67 68',
        rating: 4.9,
        reviewCount: 312,
      },
    };
    return venues[offer.id] || venues['default'];
  };

  const venueInfo = getVenueInfo();

  // Event details vary based on offer
  const getEventDetails = (): EventDetails => {
    const details: Record<string, EventDetails> = {
      'po_book_1': {
        ageLimit: '+18',
        participantType: 'Genel Katılım',
        concertTime: '21:00',
        eventDuration: '120 dakika',
        images: [
          'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        ],
        socialMedia: {
          instagram: '@volkswagenarena',
          twitter: '@vikiparc',
          website: 'www.volkswagenarena.com.tr',
        },
      },
      'po_book_2': {
        ageLimit: 'Tüm Yaşlar',
        participantType: 'Davetli',
        concertTime: '22:30',
        eventDuration: '90 dakika',
        images: [
          'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800',
          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        ],
        socialMedia: {
          instagram: '@tusiadevents',
          website: 'www.tusiad.org',
        },
      },
      'po_book_3': {
        ageLimit: '+16',
        participantType: 'Biletli',
        concertTime: '21:30',
        eventDuration: '105 dakika',
        images: [
          'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
          'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
          'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
        ],
        socialMedia: {
          instagram: '@harbiyeacik',
          twitter: '@harbiyesahnesi',
          website: 'www.harbiyeacikhava.com',
        },
      },
      'default': {
        ageLimit: '+18',
        participantType: 'Genel Katılım',
        concertTime: '21:00',
        eventDuration: '90 dakika',
        images: [
          'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800',
          'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
          'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800',
        ],
        socialMedia: {
          instagram: '@zorlupsm',
          twitter: '@ZorluPSM',
          website: 'www.zorlupsm.com',
        },
      },
    };
    return details[offer.id] || details['default'];
  };

  const eventDetails = getEventDetails();

  // Budget - can be null if organizer didn't provide
  const organizerBudget: number | null = offer.serviceCategory === 'booking' ? 350000 : null;

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
    Linking.openURL('tel:+905329876543');
  };

  const handleChat = () => {
    navigation.navigate('Chat', {
      chatId: `organizer_${offer.id}`,
      recipientName: offer.organizer.name
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

  const handleSubmitOffer = () => {
    const amount = parseInt(offerAmount.replace(/\./g, ''));
    if (!amount || amount <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir tutar girin');
      return;
    }
    setShowOfferModal(false);
    Alert.alert(
      'Teklif Gönderildi',
      `₺${amount.toLocaleString('tr-TR')} tutarındaki teklifiniz organizatöre iletildi.`,
      [{ text: 'Tamam', onPress: () => navigation.goBack() }]
    );
  };

  const handleAcceptCounterOffer = () => {
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

  const handleRejectOffer = () => {
    Alert.alert(
      'Talebi Reddet',
      'Bu talebi reddetmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Reddet',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Reddedildi', 'Talep reddedildi.');
            navigation.goBack();
          }
        },
      ]
    );
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

  // Generate PDF - Professional single-page design
  const generatePDF = async () => {
    setIsGeneratingPDF(true);

    const currentDate = new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: A4; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
            color: #1F2937;
            line-height: 1.4;
            background: #fff;
            width: 210mm;
            min-height: 297mm;
            padding: 24px 28px;
          }

          /* Header */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 16px;
            border-bottom: 3px solid #6366F1;
            margin-bottom: 20px;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .brand-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
          }
          .brand-text h1 {
            font-size: 22px;
            font-weight: 700;
            color: #1F2937;
            letter-spacing: -0.5px;
          }
          .brand-text p {
            font-size: 10px;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .doc-meta {
            text-align: right;
          }
          .doc-number {
            font-size: 11px;
            color: #9CA3AF;
            margin-bottom: 2px;
          }
          .doc-id {
            font-size: 13px;
            font-weight: 600;
            color: #374151;
            font-family: 'SF Mono', monospace;
          }
          .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 6px;
          }
          .status-pending { background: #FEF3C7; color: #B45309; }
          .status-accepted { background: #D1FAE5; color: #047857; }
          .status-counter_offered { background: #DBEAFE; color: #1D4ED8; }

          /* Hero Section */
          .hero {
            background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
            border-radius: 12px;
            padding: 20px 24px;
            color: white;
            margin-bottom: 18px;
            position: relative;
            overflow: hidden;
          }
          .hero::after {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 200px;
            height: 200px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
          }
          .hero-category {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            opacity: 0.85;
            margin-bottom: 6px;
          }
          .hero-title {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 4px;
            letter-spacing: -0.3px;
          }
          .hero-subtitle {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 14px;
          }
          .hero-meta {
            display: flex;
            gap: 20px;
            font-size: 12px;
          }
          .hero-meta span {
            display: flex;
            align-items: center;
            gap: 5px;
          }

          /* Two Column Layout */
          .content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }

          /* Cards */
          .card {
            background: #F9FAFB;
            border-radius: 10px;
            padding: 14px 16px;
            border: 1px solid #E5E7EB;
          }
          .card-title {
            font-size: 9px;
            font-weight: 700;
            color: #6366F1;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .card-title::before {
            content: '';
            width: 3px;
            height: 12px;
            background: #6366F1;
            border-radius: 2px;
          }

          /* Organizer */
          .org-content {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .org-avatar {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: #6366F1;
            font-size: 16px;
          }
          .org-name {
            font-size: 14px;
            font-weight: 600;
            color: #1F2937;
            margin-bottom: 2px;
          }
          .org-rating {
            font-size: 11px;
            color: #6B7280;
          }
          .org-rating span { color: #F59E0B; }

          /* Venue */
          .venue-name {
            font-size: 14px;
            font-weight: 600;
            color: #1F2937;
            margin-bottom: 3px;
          }
          .venue-address {
            font-size: 11px;
            color: #6B7280;
            margin-bottom: 12px;
          }
          .venue-specs {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          .spec-item {
            text-align: center;
            padding: 8px 4px;
            background: white;
            border-radius: 6px;
          }
          .spec-value {
            font-size: 13px;
            font-weight: 700;
            color: #6366F1;
          }
          .spec-label {
            font-size: 9px;
            color: #9CA3AF;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          /* Details Grid */
          .details-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }
          .detail-item {
            background: #F9FAFB;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            border: 1px solid #E5E7EB;
          }
          .detail-value {
            font-size: 16px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 2px;
          }
          .detail-label {
            font-size: 9px;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          /* Budget Section */
          .budget {
            background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 2px solid #A7F3D0;
            margin-top: 16px;
          }
          .budget-label {
            font-size: 10px;
            color: #047857;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 6px;
          }
          .budget-amount {
            font-size: 32px;
            font-weight: 800;
            color: #047857;
            letter-spacing: -1px;
          }
          .budget-not-set {
            background: #F3F4F6;
            border: 2px dashed #D1D5DB;
          }
          .budget-not-set .budget-label,
          .budget-not-set .budget-amount {
            color: #6B7280;
          }
          .budget-not-set .budget-amount {
            font-size: 18px;
            font-weight: 600;
          }

          /* Footer */
          .footer {
            margin-top: 20px;
            padding-top: 14px;
            border-top: 1px solid #E5E7EB;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer-left {
            font-size: 9px;
            color: #9CA3AF;
          }
          .footer-right {
            font-size: 9px;
            color: #9CA3AF;
            text-align: right;
          }
          .footer-brand {
            font-weight: 600;
            color: #6B7280;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div class="brand">
            <div class="brand-icon">T</div>
            <div class="brand-text">
              <h1>Turing</h1>
              <p>Etkinlik Yönetim Platformu</p>
            </div>
          </div>
          <div class="doc-meta">
            <div class="doc-number">TALEP NO</div>
            <div class="doc-id">${offer.id.toUpperCase()}</div>
            <div class="status status-${offer.status}">${statusConfig.label}</div>
          </div>
        </div>

        <!-- Hero -->
        <div class="hero">
          <div class="hero-category">🎵 Sanatçı Performansı</div>
          <div class="hero-title">${offer.eventTitle}</div>
          <div class="hero-subtitle">${offer.role}</div>
          <div class="hero-meta">
            <span>📅 ${offer.eventDate}</span>
            <span>📍 ${offer.location}</span>
          </div>
        </div>

        <!-- Two Columns: Organizer & Venue -->
        <div class="content">
          <div class="card">
            <div class="card-title">Organizatör</div>
            <div class="org-content">
              <div class="org-avatar">${offer.organizer.name.charAt(0)}</div>
              <div>
                <div class="org-name">${offer.organizer.name}</div>
                <div class="org-rating"><span>★</span> 4.7 · 45 değerlendirme</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">Mekan</div>
            <div class="venue-name">${venueInfo.name}</div>
            <div class="venue-address">${venueInfo.address}, ${venueInfo.city}</div>
            <div class="venue-specs">
              <div class="spec-item">
                <div class="spec-value">${venueInfo.capacity.toLocaleString('tr-TR')}</div>
                <div class="spec-label">Kapasite</div>
              </div>
              <div class="spec-item">
                <div class="spec-value">${getSeatingTypeLabel(venueInfo.seatingType)}</div>
                <div class="spec-label">Düzen</div>
              </div>
              <div class="spec-item">
                <div class="spec-value">${getIndoorOutdoorLabel(venueInfo.indoorOutdoor)}</div>
                <div class="spec-label">Tip</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Details -->
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-value">${eventDetails.concertTime}</div>
            <div class="detail-label">Sahne Saati</div>
          </div>
          <div class="detail-item">
            <div class="detail-value">${eventDetails.eventDuration}</div>
            <div class="detail-label">Süre</div>
          </div>
          <div class="detail-item">
            <div class="detail-value">${eventDetails.ageLimit}</div>
            <div class="detail-label">Yaş Sınırı</div>
          </div>
          <div class="detail-item">
            <div class="detail-value">${eventDetails.participantType}</div>
            <div class="detail-label">Katılımcı</div>
          </div>
        </div>

        <!-- Budget -->
        <div class="budget ${!organizerBudget ? 'budget-not-set' : ''}">
          <div class="budget-label">${organizerBudget ? 'Organizatör Bütçe Teklifi' : 'Bütçe Bilgisi'}</div>
          <div class="budget-amount">${organizerBudget ? '₺' + organizerBudget.toLocaleString('tr-TR') : 'Bütçe İletilmedi'}</div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-left">
            Bu belge ${currentDate} tarihinde oluşturulmuştur.<br/>
            Belge referans numarası ile doğrulanabilir.
          </div>
          <div class="footer-right">
            <span class="footer-brand">Turing</span><br/>
            www.turing.app
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
      console.error('PDF generation error:', error);
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
      >
        {/* Hero Header Card */}
        <View style={[styles.heroCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <View style={styles.heroTop}>
            <View style={[styles.categoryBadgeSmall, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)' }]}>
              <Ionicons name="musical-notes" size={12} color="#6366F1" />
              <Text style={styles.categoryTextSmall}>{getCategoryName(offer.serviceCategory)}</Text>
            </View>
            {/* Social Media - Inline */}
            {(eventDetails.socialMedia.instagram || eventDetails.socialMedia.twitter || eventDetails.socialMedia.website) && (
              <View style={styles.socialInline}>
                {eventDetails.socialMedia.instagram && (
                  <TouchableOpacity onPress={() => handleSocialMedia('instagram')} style={styles.socialIconSmall}>
                    <Ionicons name="logo-instagram" size={16} color="#E1306C" />
                  </TouchableOpacity>
                )}
                {eventDetails.socialMedia.twitter && (
                  <TouchableOpacity onPress={() => handleSocialMedia('twitter')} style={styles.socialIconSmall}>
                    <Ionicons name="logo-twitter" size={16} color="#1DA1F2" />
                  </TouchableOpacity>
                )}
                {eventDetails.socialMedia.website && (
                  <TouchableOpacity onPress={() => handleSocialMedia('website')} style={styles.socialIconSmall}>
                    <Ionicons name="globe-outline" size={16} color="#6366F1" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <Text style={[styles.heroArtist, { color: colors.text }]}>
            {offer.serviceCategory === 'booking' && offer.artistName ? offer.artistName : offer.role}
          </Text>
          <Text style={[styles.heroEvent, { color: colors.textSecondary }]}>{offer.eventTitle}</Text>

          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Ionicons name="calendar" size={14} color="#6366F1" />
              <Text style={[styles.heroMetaText, { color: colors.text }]}>{offer.eventDate}</Text>
            </View>
            <View style={[styles.heroMetaDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#E2E8F0' }]} />
            <View style={styles.heroMetaItem}>
              <Ionicons name="location" size={14} color="#EF4444" />
              <Text style={[styles.heroMetaText, { color: colors.text }]}>{offer.location}</Text>
            </View>
          </View>
        </View>

        {/* Status Banner */}
        <View style={[styles.statusBannerCompact, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon as any} size={16} color={statusConfig.color} />
          <Text style={[styles.statusTextCompact, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>

        {/* Organizer Card - Compact & Clickable */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('OrganizerProfile', { organizerId: offer.organizer.id || 'ORG001' })}
        >
          <View style={styles.organizerCompact}>
            <Image source={{ uri: offer.organizer.image }} style={styles.organizerImageSmall} />
            <View style={styles.organizerInfoCompact}>
              <Text style={[styles.organizerLabel, { color: colors.textSecondary }]}>ORGANİZATÖR</Text>
              <Text style={[styles.organizerNameCompact, { color: colors.text }]}>{offer.organizer.name}</Text>
              <View style={styles.organizerRatingCompact}>
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text style={[styles.ratingTextCompact, { color: colors.text }]}>4.7</Text>
                <Text style={[styles.reviewCountCompact, { color: colors.textSecondary }]}>(45)</Text>
              </View>
            </View>
            <View style={styles.organizerActionsRow}>
              <TouchableOpacity style={[styles.actionBtnSmall, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]} onPress={(e) => { e.stopPropagation(); handleCall(); }}>
                <Ionicons name="call" size={16} color="#10B981" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtnSmall, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)' }]} onPress={(e) => { e.stopPropagation(); handleChat(); }}>
                <Ionicons name="chatbubble" size={16} color="#6366F1" />
              </TouchableOpacity>
              <View style={[styles.chevronIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Venue Summary Card - Tappable */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}
          onPress={() => setShowVenueModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.venueSummaryHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginBottom: 0 }]}>MEKAN</Text>
            <View style={styles.venueDetailBtn}>
              <Text style={styles.venueDetailBtnText}>Detaylar</Text>
              <Ionicons name="chevron-forward" size={14} color="#6366F1" />
            </View>
          </View>

          <View style={styles.venueSummaryContent}>
            {venueInfo.images && venueInfo.images[0] && (
              <Image source={{ uri: venueInfo.images[0] }} style={styles.venueThumbnail} />
            )}
            <View style={styles.venueSummaryInfo}>
              <Text style={[styles.venueName, { color: colors.text }]}>{venueInfo.name}</Text>
              <Text style={[styles.venueLocation, { color: colors.textSecondary }]}>
                {venueInfo.district}, {venueInfo.city}
              </Text>
              {venueInfo.rating && (
                <View style={styles.venueRating}>
                  <Ionicons name="star" size={12} color="#FBBF24" />
                  <Text style={[styles.venueRatingText, { color: colors.text }]}>{venueInfo.rating}</Text>
                  <Text style={[styles.venueReviewCount, { color: colors.textSecondary }]}>
                    ({venueInfo.reviewCount})
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.venueQuickInfo}>
            <View style={styles.venueQuickItem}>
              <Ionicons name="people-outline" size={14} color="#6366F1" />
              <Text style={[styles.venueQuickText, { color: colors.text }]}>{venueInfo.capacity.toLocaleString('tr-TR')}</Text>
            </View>
            <View style={styles.venueQuickItem}>
              <Ionicons name={venueInfo.indoorOutdoor === 'outdoor' ? 'sunny-outline' : 'home-outline'} size={14} color="#10B981" />
              <Text style={[styles.venueQuickText, { color: colors.text }]}>{getIndoorOutdoorLabel(venueInfo.indoorOutdoor)}</Text>
            </View>
            {venueInfo.backstage?.hasBackstage && (
              <View style={styles.venueQuickItem}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={[styles.venueQuickText, { color: colors.text }]}>Kulis</Text>
              </View>
            )}
            {venueInfo.halls && venueInfo.halls.length > 1 && (
              <View style={styles.venueQuickItem}>
                <Ionicons name="grid-outline" size={14} color="#F59E0B" />
                <Text style={[styles.venueQuickText, { color: colors.text }]}>{venueInfo.halls.length} Salon</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Performance Details Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PERFORMANS DETAYLARI</Text>

          <View style={styles.detailsGrid}>
            <View style={[styles.detailItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
              <View style={styles.detailLeft}>
                <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)' }]}>
                  <Ionicons name="time-outline" size={16} color="#6366F1" />
                </View>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Konser Saati</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>{eventDetails.concertTime}</Text>
            </View>

            <View style={[styles.detailItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
              <View style={styles.detailLeft}>
                <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)' }]}>
                  <Ionicons name="hourglass-outline" size={16} color="#6366F1" />
                </View>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Performans Süresi</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>{eventDetails.eventDuration}</Text>
            </View>

            <View style={[styles.detailItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
              <View style={styles.detailLeft}>
                <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)' }]}>
                  <Ionicons name="alert-circle-outline" size={16} color="#6366F1" />
                </View>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Yaş Sınırı</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>{eventDetails.ageLimit}</Text>
            </View>

            <View style={[styles.detailItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderBottomWidth: 0 }]}>
              <View style={styles.detailLeft}>
                <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)' }]}>
                  <Ionicons name="people-outline" size={16} color="#6366F1" />
                </View>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Katılımcı Türü</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>{eventDetails.participantType}</Text>
            </View>
          </View>
        </View>

        {/* Budget Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>BÜTÇE TEKLİFİ</Text>

          {organizerBudget ? (
            <View style={[styles.budgetBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)' }]}>
              <Text style={[styles.budgetLabel, { color: '#10B981' }]}>Organizatör Bütçe Teklifi</Text>
              <Text style={[styles.budgetAmount, { color: '#10B981' }]}>
                ₺{organizerBudget.toLocaleString('tr-TR')}
              </Text>
            </View>
          ) : (
            <View style={[styles.budgetBox, styles.budgetNotProvided, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
              <Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
              <Text style={[styles.budgetNotProvidedText, { color: colors.textSecondary }]}>
                Bütçe İletilmedi
              </Text>
              <Text style={[styles.budgetNotProvidedSubtext, { color: colors.textSecondary }]}>
                Organizatör bütçe bilgisi paylaşmadı
              </Text>
            </View>
          )}
        </View>

        {/* Counter Offer Box (if exists) */}
        {offer.counterOffer && (
          <View style={[styles.card, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>KARŞI TEKLİF</Text>
            <View style={[styles.counterOfferBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.06)' }]}>
              <View style={styles.counterOfferHeader}>
                <Ionicons name="swap-horizontal" size={18} color="#3B82F6" />
                <Text style={[styles.counterOfferTitle, { color: '#3B82F6' }]}>Organizatörden Karşı Teklif</Text>
              </View>
              <Text style={[styles.counterOfferAmount, { color: colors.text }]}>
                ₺{offer.counterOffer.amount.toLocaleString('tr-TR')}
              </Text>
              {offer.counterOffer.message && (
                <Text style={[styles.counterOfferMessage, { color: colors.textSecondary }]}>
                  "{offer.counterOffer.message}"
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Event Images - Gallery Thumbnails */}
        {eventDetails.images.length > 0 && (
          <View style={[styles.card, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ETKİNLİK GÖRSELLERİ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
              {eventDetails.images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.galleryThumbnail}
                  resizeMode="cover"
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
        ) : offer.status === 'accepted' ? (
          <TouchableOpacity
            style={styles.operationsBtn}
            onPress={() => navigation.navigate('ProviderEventDetail', {
              eventId: offer.eventId,
            })}
          >
            <Ionicons name="calendar-outline" size={20} color="white" />
            <Text style={styles.operationsBtnText}>Etkinliği Görüntüle</Text>
          </TouchableOpacity>
        ) : (
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
              {/* Budget Reference */}
              {organizerBudget ? (
                <View style={[styles.budgetRef, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)' }]}>
                  <Text style={[styles.budgetRefLabel, { color: '#10B981' }]}>Organizatör Bütçe Teklifi</Text>
                  <Text style={[styles.budgetRefValue, { color: '#10B981' }]}>
                    ₺{organizerBudget.toLocaleString('tr-TR')}
                  </Text>
                </View>
              ) : (
                <View style={[styles.budgetRef, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
                  <Text style={[styles.budgetRefLabel, { color: colors.textSecondary }]}>Organizatör Bütçe Teklifi</Text>
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

      {/* Venue Detail Modal */}
      <Modal visible={showVenueModal} animationType="slide" transparent onRequestClose={() => setShowVenueModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.venueModalContent, { backgroundColor: isDark ? '#09090B' : '#F8FAFC' }]}>
            {/* Modal Header */}
            <View style={[styles.venueModalHeader, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
              <View style={styles.modalHandle}>
                <View style={[styles.modalHandleBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#E2E8F0' }]} />
              </View>
              <View style={styles.venueModalHeaderRow}>
                <Text style={[styles.venueModalTitle, { color: colors.text }]}>Mekan Detayları</Text>
                <TouchableOpacity onPress={() => setShowVenueModal(false)} style={styles.venueModalClose}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.venueModalBody} showsVerticalScrollIndicator={false}>
              {/* Venue Images */}
              {venueInfo.images && venueInfo.images.length > 0 && (
                <View style={styles.venueImagesSection}>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={(e) => {
                      const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
                      setVenueImageIndex(index);
                    }}
                    scrollEventThrottle={16}
                  >
                    {venueInfo.images.map((img, index) => (
                      <Image key={index} source={{ uri: img }} style={styles.venueModalImage} resizeMode="cover" />
                    ))}
                  </ScrollView>
                  {venueInfo.images.length > 1 && (
                    <View style={styles.imageIndicators}>
                      {venueInfo.images.map((_, index) => (
                        <View
                          key={index}
                          style={[styles.imageIndicator, { backgroundColor: index === venueImageIndex ? '#6366F1' : 'rgba(255,255,255,0.5)' }]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Venue Name & Address */}
              <View style={[styles.venueModalCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
                <Text style={[styles.venueModalName, { color: colors.text }]}>{venueInfo.name}</Text>
                <View style={styles.venueModalAddressRow}>
                  <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.venueModalAddress, { color: colors.textSecondary }]}>
                    {venueInfo.address}, {venueInfo.district}, {venueInfo.city}
                  </Text>
                </View>
                {venueInfo.rating && (
                  <View style={styles.venueModalRating}>
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <Text style={[styles.venueModalRatingText, { color: colors.text }]}>{venueInfo.rating}</Text>
                    <Text style={[styles.venueModalReviewCount, { color: colors.textSecondary }]}>
                      ({venueInfo.reviewCount} değerlendirme)
                    </Text>
                  </View>
                )}
              </View>

              {/* Quick Stats */}
              <View style={[styles.venueModalCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
                <Text style={[styles.venueModalSectionTitle, { color: colors.textSecondary }]}>GENEL BİLGİLER</Text>
                <View style={styles.venueStatsGrid}>
                  <View style={[styles.venueStatItem, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)' }]}>
                    <Ionicons name="people" size={20} color="#6366F1" />
                    <Text style={[styles.venueStatValue, { color: colors.text }]}>{venueInfo.capacity.toLocaleString('tr-TR')}</Text>
                    <Text style={[styles.venueStatLabel, { color: colors.textSecondary }]}>Kapasite</Text>
                  </View>
                  <View style={[styles.venueStatItem, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)' }]}>
                    <Ionicons name={venueInfo.indoorOutdoor === 'outdoor' ? 'sunny' : 'home'} size={20} color="#10B981" />
                    <Text style={[styles.venueStatValue, { color: colors.text }]}>{getIndoorOutdoorLabel(venueInfo.indoorOutdoor)}</Text>
                    <Text style={[styles.venueStatLabel, { color: colors.textSecondary }]}>Alan Tipi</Text>
                  </View>
                </View>
              </View>

              {/* Multi-Hall Section */}
              {venueInfo.halls && venueInfo.halls.length > 1 && (
                <View style={[styles.venueModalCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
                  <Text style={[styles.venueModalSectionTitle, { color: colors.textSecondary }]}>SALONLAR ({venueInfo.halls.length})</Text>
                  {venueInfo.halls.map((hall) => (
                    <View
                      key={hall.id}
                      style={[
                        styles.hallItem,
                        {
                          backgroundColor: hall.id === venueInfo.selectedHallId
                            ? (isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)')
                            : (isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC'),
                          borderColor: hall.id === venueInfo.selectedHallId ? '#6366F1' : 'transparent'
                        }
                      ]}
                    >
                      <View style={styles.hallHeader}>
                        <Text style={[styles.hallName, { color: colors.text }]}>{hall.name}</Text>
                        {hall.id === venueInfo.selectedHallId && (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedBadgeText}>Seçili</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.hallDetails}>
                        <Text style={[styles.hallDetail, { color: colors.textSecondary }]}>
                          {hall.capacity} kişi • {hall.stageWidth}x{hall.stageDepth}m sahne
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Stage Dimensions */}
              {(venueInfo.stageWidth || (venueInfo.halls && venueInfo.selectedHallId)) && (
                <View style={[styles.venueModalCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
                  <Text style={[styles.venueModalSectionTitle, { color: colors.textSecondary }]}>SAHNE ÖLÇÜLERİ</Text>
                  <View style={styles.stageDimensions}>
                    <View style={styles.stageDimItem}>
                      <Text style={[styles.stageDimValue, { color: '#6366F1' }]}>
                        {venueInfo.stageWidth || venueInfo.halls?.find(h => h.id === venueInfo.selectedHallId)?.stageWidth || '-'}m
                      </Text>
                      <Text style={[styles.stageDimLabel, { color: colors.textSecondary }]}>Genişlik</Text>
                    </View>
                    <View style={[styles.stageDimDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]} />
                    <View style={styles.stageDimItem}>
                      <Text style={[styles.stageDimValue, { color: '#6366F1' }]}>
                        {venueInfo.stageDepth || venueInfo.halls?.find(h => h.id === venueInfo.selectedHallId)?.stageDepth || '-'}m
                      </Text>
                      <Text style={[styles.stageDimLabel, { color: colors.textSecondary }]}>Derinlik</Text>
                    </View>
                    {(venueInfo.stageHeight || venueInfo.halls?.find(h => h.id === venueInfo.selectedHallId)?.stageHeight) && (
                      <>
                        <View style={[styles.stageDimDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]} />
                        <View style={styles.stageDimItem}>
                          <Text style={[styles.stageDimValue, { color: '#6366F1' }]}>
                            {venueInfo.stageHeight || venueInfo.halls?.find(h => h.id === venueInfo.selectedHallId)?.stageHeight}m
                          </Text>
                          <Text style={[styles.stageDimLabel, { color: colors.textSecondary }]}>Yükseklik</Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              )}

              {/* Backstage Info */}
              {venueInfo.backstage?.hasBackstage && (
                <View style={[styles.venueModalCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
                  <Text style={[styles.venueModalSectionTitle, { color: colors.textSecondary }]}>KULİS</Text>
                  <View style={styles.backstageInfo}>
                    <View style={styles.backstageRow}>
                      <View style={styles.backstageItem}>
                        <Ionicons name={venueInfo.backstage.roomCount ? 'checkmark-circle' : 'close-circle'} size={18} color={venueInfo.backstage.roomCount ? '#10B981' : '#EF4444'} />
                        <Text style={[styles.backstageText, { color: colors.text }]}>{venueInfo.backstage.roomCount || 0} Oda</Text>
                      </View>
                      <View style={styles.backstageItem}>
                        <Ionicons name={venueInfo.backstage.hasShower ? 'checkmark-circle' : 'close-circle'} size={18} color={venueInfo.backstage.hasShower ? '#10B981' : '#EF4444'} />
                        <Text style={[styles.backstageText, { color: colors.text }]}>Duş</Text>
                      </View>
                      <View style={styles.backstageItem}>
                        <Ionicons name={venueInfo.backstage.hasPrivateToilet ? 'checkmark-circle' : 'close-circle'} size={18} color={venueInfo.backstage.hasPrivateToilet ? '#10B981' : '#EF4444'} />
                        <Text style={[styles.backstageText, { color: colors.text }]}>WC</Text>
                      </View>
                    </View>
                    {venueInfo.backstage.notes && (
                      <Text style={[styles.backstageNotes, { color: colors.textSecondary }]}>
                        {venueInfo.backstage.notes}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Technical & Parking */}
              <View style={[styles.venueModalCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
                <Text style={[styles.venueModalSectionTitle, { color: colors.textSecondary }]}>TESİSLER</Text>
                <View style={styles.facilitiesGrid}>
                  <View style={[styles.facilityItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name={venueInfo.hasSoundSystem ? 'checkmark-circle' : 'close-circle'} size={20} color={venueInfo.hasSoundSystem ? '#10B981' : '#9CA3AF'} />
                    <Text style={[styles.facilityText, { color: venueInfo.hasSoundSystem ? colors.text : colors.textSecondary }]}>Ses Sistemi</Text>
                  </View>
                  <View style={[styles.facilityItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name={venueInfo.hasLightingSystem ? 'checkmark-circle' : 'close-circle'} size={20} color={venueInfo.hasLightingSystem ? '#10B981' : '#9CA3AF'} />
                    <Text style={[styles.facilityText, { color: venueInfo.hasLightingSystem ? colors.text : colors.textSecondary }]}>Işık Sistemi</Text>
                  </View>
                  <View style={[styles.facilityItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Ionicons name={venueInfo.hasParkingArea ? 'checkmark-circle' : 'close-circle'} size={20} color={venueInfo.hasParkingArea ? '#10B981' : '#9CA3AF'} />
                    <Text style={[styles.facilityText, { color: venueInfo.hasParkingArea ? colors.text : colors.textSecondary }]}>
                      Otopark {venueInfo.parkingCapacity ? `(${venueInfo.parkingCapacity})` : ''}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Contact */}
              {venueInfo.contactName && (
                <View style={[styles.venueModalCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
                  <Text style={[styles.venueModalSectionTitle, { color: colors.textSecondary }]}>MEKAN İLETİŞİM</Text>
                  <View style={styles.contactRow}>
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactName, { color: colors.text }]}>{venueInfo.contactName}</Text>
                      <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>{venueInfo.contactPhone}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.contactCallBtn}
                      onPress={() => venueInfo.contactPhone && Linking.openURL(`tel:${venueInfo.contactPhone}`)}
                    >
                      <Ionicons name="call" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
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
  budgetNotProvided: {
    gap: 8,
  },
  budgetNotProvidedText: { fontSize: 16, fontWeight: '600' },
  budgetNotProvidedSubtext: { fontSize: 13 },

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
