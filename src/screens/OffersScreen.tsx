import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { gradients, darkTheme as defaultColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

// Default colors for static styles (dark theme)
const colors = defaultColors;

// Status types: pending (initial), counter_offered (negotiating), accepted, rejected
type OfferStatus = 'pending' | 'counter_offered' | 'accepted' | 'rejected';
type OfferTabType = 'active' | 'accepted' | 'rejected';

interface CounterOffer {
  amount: number;
  by: 'organizer' | 'provider';
  date: string;
  message?: string;
}

interface OffersScreenProps {
  isProviderMode: boolean;
}

// Organizer offers (received from providers)
const organizerOffers = [
  // Senaryo 1: İlk teklif - Organizatör cevap bekliyor
  {
    id: 'o1',
    eventTitle: 'Yaz Festivali 2024',
    serviceCategory: 'technical',
    serviceName: 'Ses Sistemi',
    provider: {
      name: 'Pro Sound Istanbul',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
      rating: 4.9,
      verified: true,
    },
    amount: 85000,
    originalBudget: 100000,
    status: 'pending' as OfferStatus,
    date: '2 saat önce',
    deliveryTime: '3 gün',
    message: 'Festival için komple ses sistemi kurulumu teklifi.',
    counterOffer: null as CounterOffer | null,
  },
  // Senaryo 2: Organizatör karşı teklif yaptı - Sağlayıcı cevap bekliyor
  {
    id: 'o2',
    eventTitle: 'Tech Conference 2024',
    serviceCategory: 'technical',
    serviceName: 'Sahne Kurulum',
    provider: {
      name: 'Stage Masters',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200',
      rating: 4.8,
      verified: true,
    },
    amount: 75000,
    originalBudget: 60000,
    status: 'counter_offered' as OfferStatus,
    date: '1 gün önce',
    deliveryTime: '2 gün',
    message: 'Profesyonel sahne kurulumu ve teknik ekipman.',
    counterOffer: {
      amount: 65000,
      by: 'organizer',
      date: '5 saat önce',
      message: 'Bütçemiz 60.000 TL. 65.000 TL kabul edebiliriz.',
    } as CounterOffer,
  },
  // Senaryo 3: Sağlayıcı karşı teklif yaptı - Organizatör cevap vermeli
  {
    id: 'o3',
    eventTitle: 'Düğün - Zeynep & Can',
    serviceCategory: 'venue',
    serviceName: 'Çiçek Dekorasyon',
    provider: {
      name: 'Flora Design',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200',
      rating: 4.7,
      verified: true,
    },
    amount: 35000,
    originalBudget: 30000,
    status: 'counter_offered' as OfferStatus,
    date: '6 saat önce',
    deliveryTime: '3 gün',
    message: 'Premium çiçek düzenlemeleri ve mekan dekorasyonu.',
    counterOffer: {
      amount: 32000,
      by: 'provider',
      date: '2 saat önce',
      message: '32.000 TL\'ye indirim yapabiliriz. Son teklifimiz.',
    } as CounterOffer,
  },
  // Senaryo 4: Kabul edilmiş teklif
  {
    id: 'o4',
    eventTitle: 'Kurumsal Gala',
    serviceCategory: 'transport',
    serviceName: 'VIP Transfer',
    provider: {
      name: 'Elite Transfer',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200',
      rating: 4.8,
      verified: true,
    },
    amount: 12500,
    originalBudget: 15000,
    status: 'accepted' as OfferStatus,
    date: '1 gün önce',
    deliveryTime: '1 gün',
    message: 'VIP misafirler için lüks araç transferi.',
    counterOffer: null as CounterOffer | null,
  },
  // Senaryo 5: Karşı teklifle kabul edilmiş
  {
    id: 'o5',
    eventTitle: 'Yaz Festivali 2024',
    serviceCategory: 'technical',
    serviceName: 'Işık Sistemi',
    provider: {
      name: 'LightShow Pro',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200',
      rating: 4.6,
      verified: true,
    },
    amount: 65000,
    originalBudget: 70000,
    status: 'accepted' as OfferStatus,
    date: '2 gün önce',
    deliveryTime: '3 gün',
    message: 'Profesyonel sahne aydınlatma sistemi.',
    counterOffer: {
      amount: 62000,
      by: 'organizer',
      date: '2 gün önce',
      message: 'Kabul edilen karşı teklif.',
    } as CounterOffer,
  },
  // Senaryo 6: Reddedilmiş teklif
  {
    id: 'o6',
    eventTitle: 'Düğün - Ayşe & Mehmet',
    serviceCategory: 'venue',
    serviceName: 'Dekorasyon',
    provider: {
      name: 'Dream Decor',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200',
      rating: 4.7,
      verified: false,
    },
    amount: 28000,
    originalBudget: 25000,
    status: 'rejected' as OfferStatus,
    date: '3 gün önce',
    deliveryTime: '2 gün',
    message: 'Düğün dekorasyonu ve çiçek düzenlemeleri.',
    counterOffer: null as CounterOffer | null,
  },
  // Senaryo 7: Karşı teklif reddedilmiş
  {
    id: 'o7',
    eventTitle: 'Konser - Rock Night',
    serviceCategory: 'technical',
    serviceName: 'Ses & Işık',
    provider: {
      name: 'Mega Sound',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
      rating: 4.5,
      verified: true,
    },
    amount: 120000,
    originalBudget: 80000,
    status: 'rejected' as OfferStatus,
    date: '4 gün önce',
    deliveryTime: '5 gün',
    message: 'Full konser ses ve ışık sistemi.',
    counterOffer: {
      amount: 90000,
      by: 'organizer',
      date: '4 gün önce',
      message: 'Karşı teklif reddedildi.',
    } as CounterOffer,
  },
];

// Provider offers (sent to organizers)
const providerOffers = [
  // Senaryo 1: İlk teklif - Organizatör cevap bekliyor
  {
    id: 'po1',
    eventTitle: 'Yaz Festivali 2024',
    organizer: {
      name: 'Event Masters',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    },
    serviceCategory: 'technical',
    role: 'Ses Sistemi Sağlayıcı',
    amount: 85000,
    status: 'pending' as OfferStatus,
    date: '2 saat önce',
    eventDate: '15-17 Temmuz 2024',
    location: 'İstanbul, Kadıköy',
    counterOffer: null as CounterOffer | null,
  },
  // Senaryo 2: Organizatör karşı teklif yaptı - Sağlayıcı cevap vermeli
  {
    id: 'po2',
    eventTitle: 'Kurumsal Lansman',
    organizer: {
      name: 'ABC Teknoloji',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    },
    serviceCategory: 'technical',
    role: 'Işık Sistemi',
    amount: 45000,
    status: 'counter_offered' as OfferStatus,
    date: '1 gün önce',
    eventDate: '20 Ağustos 2024',
    location: 'İstanbul, Maslak',
    counterOffer: {
      amount: 38000,
      by: 'organizer',
      date: '6 saat önce',
      message: 'Bütçemiz sınırlı, 38.000 TL önerebiliriz.',
    } as CounterOffer,
  },
  // Senaryo 3: Sağlayıcı karşı teklif yaptı - Organizatör cevap bekliyor
  {
    id: 'po3',
    eventTitle: 'Düğün - Selin & Burak',
    organizer: {
      name: 'Selin Demir',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    },
    serviceCategory: 'booking',
    role: 'DJ Set',
    amount: 25000,
    status: 'counter_offered' as OfferStatus,
    date: '8 saat önce',
    eventDate: '15 Eylül 2024',
    location: 'İstanbul, Beşiktaş',
    counterOffer: {
      amount: 22000,
      by: 'provider',
      date: '3 saat önce',
      message: '22.000 TL\'ye yapabilirim, ekipman dahil.',
    } as CounterOffer,
  },
  // Senaryo 4: Kabul edilmiş teklif
  {
    id: 'po4',
    eventTitle: 'Kurumsal Gala Gecesi',
    organizer: {
      name: 'XYZ Holding',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    },
    serviceCategory: 'technical',
    role: 'Işık & Ses Operatörü',
    amount: 55000,
    status: 'accepted' as OfferStatus,
    date: '1 gün önce',
    eventDate: '22 Ağustos 2024',
    location: 'Ankara',
    counterOffer: null as CounterOffer | null,
  },
  // Senaryo 5: Karşı teklifle kabul edilmiş
  {
    id: 'po5',
    eventTitle: 'Düğün - Ayşe & Mehmet',
    organizer: {
      name: 'Ayşe Yılmaz',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    },
    serviceCategory: 'booking',
    role: 'Canlı Müzik',
    amount: 35000,
    status: 'accepted' as OfferStatus,
    date: '2 gün önce',
    eventDate: '1 Eylül 2024',
    location: 'İstanbul, Beşiktaş',
    counterOffer: {
      amount: 32000,
      by: 'organizer',
      date: '2 gün önce',
      message: 'Anlaştık!',
    } as CounterOffer,
  },
  // Senaryo 6: Reddedilmiş teklif
  {
    id: 'po6',
    eventTitle: 'Tech Conference 2024',
    organizer: {
      name: 'TechTR',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
    },
    serviceCategory: 'technical',
    role: 'Sahne Kurulum',
    amount: 45000,
    status: 'rejected' as OfferStatus,
    date: '5 gün önce',
    eventDate: '10-11 Ekim 2024',
    location: 'İstanbul',
    counterOffer: null as CounterOffer | null,
  },
  // Senaryo 7: Karşı teklif reddedilmiş
  {
    id: 'po7',
    eventTitle: 'Festival Anatolia',
    organizer: {
      name: 'Festival Org.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    },
    serviceCategory: 'technical',
    role: 'LED Ekran',
    amount: 80000,
    status: 'rejected' as OfferStatus,
    date: '4 gün önce',
    eventDate: '25-27 Ağustos 2024',
    location: 'Antalya',
    counterOffer: {
      amount: 70000,
      by: 'provider',
      date: '4 gün önce',
      message: 'Karşı teklif kabul edilmedi.',
    } as CounterOffer,
  },
];

// Get category gradient
const getCategoryGradient = (category: string): readonly [string, string, ...string[]] => {
  const categoryColors: Record<string, readonly [string, string]> = {
    booking: gradients.booking,
    technical: gradients.technical,
    venue: gradients.venue,
    accommodation: gradients.accommodation,
    transport: gradients.transport,
    flight: gradients.flight,
    operation: gradients.operation,
  };
  return categoryColors[category] || gradients.primary;
};

export function OffersScreen({ isProviderMode }: OffersScreenProps) {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();
  const [activeTab, setActiveTab] = useState<OfferTabType>('active');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return colors.success;
      case 'pending': return colors.warning;
      case 'counter_offered': return colors.brand[400];
      case 'rejected': return colors.error;
      default: return colors.textMuted;
    }
  };

  const getStatusText = (status: string, counterOffer: CounterOffer | null, isProvider: boolean) => {
    switch (status) {
      case 'accepted': return 'Kabul Edildi';
      case 'pending': return 'Beklemede';
      case 'counter_offered':
        if (counterOffer) {
          // Karşı teklif yapan taraf bekliyor
          if ((isProvider && counterOffer.by === 'provider') || (!isProvider && counterOffer.by === 'organizer')) {
            return 'Cevap Bekleniyor';
          }
          return 'Karşı Teklif Geldi';
        }
        return 'Pazarlık';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'accepted': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'counter_offered': return 'swap-horizontal';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  // Check if user needs to respond (action required)
  const needsResponse = (offer: typeof organizerOffers[0] | typeof providerOffers[0]) => {
    if (offer.status === 'pending') {
      // Initial offer - organizer needs to respond
      return !isProviderMode;
    }
    if (offer.status === 'counter_offered' && offer.counterOffer) {
      // Counter offer - the other party needs to respond
      if (isProviderMode) {
        return offer.counterOffer.by === 'organizer';
      } else {
        return offer.counterOffer.by === 'provider';
      }
    }
    return false;
  };

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
          // Navigate to Contract screen with offer details
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

  const renderOrganizerOfferCard = (offer: typeof organizerOffers[0]) => {
    const statusColor = getStatusColor(offer.status);
    const showActions = needsResponse(offer);
    const currentAmount = offer.counterOffer ? offer.counterOffer.amount : offer.amount;
    const isUrgent = showActions && offer.status === 'pending';
    const hasCounterFromProvider = offer.counterOffer?.by === 'provider';
    const budgetDiff = currentAmount - offer.originalBudget;
    const isUnderBudget = budgetDiff <= 0;

    return (
      <TouchableOpacity
        key={offer.id}
        style={[
          organizerCardStyles.card,
          showActions && organizerCardStyles.cardHighlight,
          isUrgent && organizerCardStyles.cardNew
        ]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
      >
        {/* Top Gradient Bar */}
        <LinearGradient
          colors={getCategoryGradient(offer.serviceCategory)}
          style={organizerCardStyles.topBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />

        {/* New Offer Banner */}
        {isUrgent && (
          <View style={organizerCardStyles.newBanner}>
            <View style={organizerCardStyles.newBannerDot} />
            <Text style={organizerCardStyles.newBannerText}>Yeni Teklif Geldi</Text>
          </View>
        )}

        {/* Counter Offer Response Banner */}
        {hasCounterFromProvider && showActions && (
          <View style={organizerCardStyles.counterBanner}>
            <Ionicons name="swap-horizontal" size={14} color={colors.brand[400]} />
            <Text style={organizerCardStyles.counterBannerText}>Karşı Teklif Yanıtı</Text>
          </View>
        )}

        {/* Provider Header */}
        <View style={organizerCardStyles.header}>
          <View style={organizerCardStyles.providerSection}>
            <View style={organizerCardStyles.providerImageWrapper}>
              <Image source={{ uri: offer.provider.image }} style={organizerCardStyles.providerImage} />
              {offer.provider.verified && (
                <View style={organizerCardStyles.verifiedBadge}>
                  <Ionicons name="checkmark" size={10} color="white" />
                </View>
              )}
            </View>
            <View style={organizerCardStyles.providerInfo}>
              <Text style={organizerCardStyles.providerName}>{offer.provider.name}</Text>
              <View style={organizerCardStyles.providerMeta}>
                <View style={organizerCardStyles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Text style={organizerCardStyles.ratingText}>{offer.provider.rating}</Text>
                </View>
                {offer.provider.verified && (
                  <View style={organizerCardStyles.verifiedText}>
                    <Ionicons name="shield-checkmark" size={12} color={colors.success} />
                    <Text style={organizerCardStyles.verifiedLabel}>Onaylı</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={[
            organizerCardStyles.statusBadge,
            { backgroundColor: `${statusColor}15`, borderColor: `${statusColor}30` }
          ]}>
            <Ionicons name={getStatusIcon(offer.status)} size={12} color={statusColor} />
            <Text style={[organizerCardStyles.statusText, { color: statusColor }]}>
              {getStatusText(offer.status, offer.counterOffer, false)}
            </Text>
          </View>
        </View>

        {/* Service & Event Info */}
        <View style={organizerCardStyles.serviceSection}>
          <View style={organizerCardStyles.serviceBadge}>
            <LinearGradient
              colors={getCategoryGradient(offer.serviceCategory)}
              style={organizerCardStyles.serviceBadgeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name={
                  offer.serviceCategory === 'technical' ? 'hardware-chip' :
                  offer.serviceCategory === 'venue' ? 'flower' :
                  offer.serviceCategory === 'transport' ? 'car' : 'briefcase'
                }
                size={12}
                color="white"
              />
              <Text style={organizerCardStyles.serviceBadgeText}>{offer.serviceName}</Text>
            </LinearGradient>
          </View>
          <Text style={organizerCardStyles.eventTitle}>{offer.eventTitle}</Text>
        </View>

        {/* Offer Message */}
        <View style={organizerCardStyles.messageSection}>
          <Ionicons name="chatbubble-outline" size={14} color={colors.zinc[500]} />
          <Text style={organizerCardStyles.messageText} numberOfLines={2}>{offer.message}</Text>
        </View>

        {/* Counter Offer Section */}
        {offer.counterOffer && (
          <View style={[
            organizerCardStyles.counterOfferSection,
            offer.counterOffer.by === 'provider' && organizerCardStyles.counterOfferFromProvider
          ]}>
            <View style={organizerCardStyles.counterOfferHeader}>
              <View style={[
                organizerCardStyles.counterOfferIcon,
                { backgroundColor: offer.counterOffer.by === 'provider' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(147, 51, 234, 0.15)' }
              ]}>
                <Ionicons
                  name={offer.counterOffer.by === 'provider' ? 'arrow-down' : 'arrow-up'}
                  size={14}
                  color={offer.counterOffer.by === 'provider' ? colors.warning : colors.brand[400]}
                />
              </View>
              <View style={organizerCardStyles.counterOfferTitleRow}>
                <Text style={[
                  organizerCardStyles.counterOfferTitle,
                  { color: offer.counterOffer.by === 'provider' ? colors.warning : colors.brand[400] }
                ]}>
                  {offer.counterOffer.by === 'organizer' ? 'Gönderdiğiniz Teklif' : 'Sağlayıcı Karşı Teklifi'}
                </Text>
                <Text style={organizerCardStyles.counterOfferTime}>{offer.counterOffer.date}</Text>
              </View>
            </View>
            <View style={organizerCardStyles.counterOfferBody}>
              <Text style={organizerCardStyles.counterOfferAmount}>
                ₺{offer.counterOffer.amount.toLocaleString('tr-TR')}
              </Text>
              {offer.counterOffer.message && (
                <Text style={organizerCardStyles.counterOfferMessage} numberOfLines={2}>
                  "{offer.counterOffer.message}"
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Price Comparison Section */}
        <View style={organizerCardStyles.priceSection}>
          <View style={organizerCardStyles.priceRow}>
            <View style={organizerCardStyles.priceItem}>
              <Text style={organizerCardStyles.priceLabel}>
                {offer.counterOffer ? 'İlk Teklif' : 'Teklif Tutarı'}
              </Text>
              <Text style={[
                organizerCardStyles.priceValue,
                offer.counterOffer && organizerCardStyles.priceValueOld
              ]}>
                ₺{offer.amount.toLocaleString('tr-TR')}
              </Text>
            </View>
            <View style={organizerCardStyles.priceDivider} />
            <View style={organizerCardStyles.priceItem}>
              <Text style={organizerCardStyles.priceLabel}>Bütçeniz</Text>
              <Text style={organizerCardStyles.budgetValue}>
                ₺{offer.originalBudget.toLocaleString('tr-TR')}
              </Text>
            </View>
            <View style={organizerCardStyles.priceDivider} />
            <View style={organizerCardStyles.priceItem}>
              <Text style={organizerCardStyles.priceLabel}>Fark</Text>
              <View style={[
                organizerCardStyles.diffBadge,
                { backgroundColor: isUnderBudget ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
              ]}>
                <Ionicons
                  name={isUnderBudget ? 'trending-down' : 'trending-up'}
                  size={12}
                  color={isUnderBudget ? colors.success : colors.error}
                />
                <Text style={[
                  organizerCardStyles.diffValue,
                  { color: isUnderBudget ? colors.success : colors.error }
                ]}>
                  ₺{Math.abs(budgetDiff).toLocaleString('tr-TR')}
                </Text>
              </View>
            </View>
          </View>

          {/* Budget Status Indicator */}
          <View style={[
            organizerCardStyles.budgetStatus,
            { backgroundColor: isUnderBudget ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)' }
          ]}>
            <Ionicons
              name={isUnderBudget ? 'checkmark-circle' : 'alert-circle'}
              size={14}
              color={isUnderBudget ? colors.success : colors.warning}
            />
            <Text style={[
              organizerCardStyles.budgetStatusText,
              { color: isUnderBudget ? colors.success : colors.warning }
            ]}>
              {isUnderBudget ? 'Bütçe dahilinde' : 'Bütçeyi aşıyor'}
            </Text>
          </View>
        </View>

        {/* Delivery Time */}
        <View style={organizerCardStyles.deliverySection}>
          <Ionicons name="time-outline" size={14} color={colors.zinc[500]} />
          <Text style={organizerCardStyles.deliveryText}>Teslim: {offer.deliveryTime}</Text>
        </View>

        {/* Footer */}
        <View style={organizerCardStyles.footer}>
          <View style={organizerCardStyles.footerLeft}>
            <Ionicons name="calendar-outline" size={14} color={colors.zinc[500]} />
            <Text style={organizerCardStyles.footerTime}>{offer.date}</Text>
          </View>

          {/* Action Buttons */}
          {showActions && (
            <View style={organizerCardStyles.actionButtonsRow}>
              <TouchableOpacity
                style={organizerCardStyles.actionBtnReject}
                onPress={() => handleReject(offer.id)}
              >
                <Ionicons name="close" size={18} color={colors.error} />
              </TouchableOpacity>
              <TouchableOpacity
                style={organizerCardStyles.actionBtnCounter}
                onPress={() => handleCounterOffer(offer.id)}
              >
                <Ionicons name="swap-horizontal" size={16} color={colors.brand[400]} />
                <Text style={organizerCardStyles.actionBtnCounterText}>Pazarlık</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={organizerCardStyles.actionBtnAccept}
                onPress={() => handleAccept(offer.id)}
              >
                <LinearGradient
                  colors={gradients.primary}
                  style={organizerCardStyles.actionBtnAcceptGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark" size={16} color="white" />
                  <Text style={organizerCardStyles.actionBtnAcceptText}>Kabul Et</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Waiting indicator */}
          {offer.status === 'counter_offered' && offer.counterOffer?.by === 'organizer' && (
            <View style={organizerCardStyles.waitingStatus}>
              <View style={organizerCardStyles.waitingDot} />
              <Text style={organizerCardStyles.waitingText}>Sağlayıcı inceliyor</Text>
            </View>
          )}

          {/* Completed Status */}
          {(offer.status === 'accepted' || offer.status === 'rejected') && (
            <View style={organizerCardStyles.completedArrow}>
              <Text style={organizerCardStyles.completedText}>Detaylar</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.zinc[500]} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderProviderOfferCard = (offer: typeof providerOffers[0]) => {
    const statusColor = getStatusColor(offer.status);
    const showActions = needsResponse(offer);
    const currentAmount = offer.counterOffer ? offer.counterOffer.amount : offer.amount;
    const isUrgent = showActions && offer.counterOffer?.by === 'organizer';

    return (
      <TouchableOpacity
        key={offer.id}
        style={[
          providerCardStyles.card,
          showActions && providerCardStyles.cardHighlight,
          isUrgent && providerCardStyles.cardUrgent
        ]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
      >
        {/* Top Gradient Bar */}
        <LinearGradient
          colors={getCategoryGradient(offer.serviceCategory)}
          style={providerCardStyles.topBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />

        {/* Urgent Banner */}
        {isUrgent && (
          <View style={providerCardStyles.urgentBanner}>
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text style={providerCardStyles.urgentBannerText}>Yanıt Bekliyor</Text>
          </View>
        )}

        {/* Card Header */}
        <View style={providerCardStyles.header}>
          <View style={providerCardStyles.headerLeft}>
            <View style={providerCardStyles.organizerSection}>
              <Image source={{ uri: offer.organizer.image }} style={providerCardStyles.organizerImage} />
              <View style={providerCardStyles.organizerInfo}>
                <Text style={providerCardStyles.organizerLabel}>Organizatör</Text>
                <Text style={providerCardStyles.organizerName}>{offer.organizer.name}</Text>
              </View>
            </View>
          </View>
          <View style={[
            providerCardStyles.statusBadge,
            { backgroundColor: `${statusColor}15`, borderColor: `${statusColor}30` }
          ]}>
            <Ionicons name={getStatusIcon(offer.status)} size={12} color={statusColor} />
            <Text style={[providerCardStyles.statusText, { color: statusColor }]}>
              {getStatusText(offer.status, offer.counterOffer, true)}
            </Text>
          </View>
        </View>

        {/* Event Title */}
        <Text style={providerCardStyles.eventTitle}>{offer.eventTitle}</Text>

        {/* Role Badge */}
        <View style={providerCardStyles.roleBadgeContainer}>
          <LinearGradient
            colors={getCategoryGradient(offer.serviceCategory)}
            style={providerCardStyles.roleBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons
              name={offer.serviceCategory === 'technical' ? 'hardware-chip' : offer.serviceCategory === 'booking' ? 'musical-notes' : 'briefcase'}
              size={12}
              color="white"
            />
            <Text style={providerCardStyles.roleBadgeText}>{offer.role}</Text>
          </LinearGradient>
        </View>

        {/* Event Details Row */}
        <View style={providerCardStyles.eventDetailsRow}>
          <View style={providerCardStyles.eventDetailItem}>
            <View style={providerCardStyles.eventDetailIcon}>
              <Ionicons name="calendar" size={14} color={colors.brand[400]} />
            </View>
            <View>
              <Text style={providerCardStyles.eventDetailLabel}>Tarih</Text>
              <Text style={providerCardStyles.eventDetailValue}>{offer.eventDate}</Text>
            </View>
          </View>
          <View style={providerCardStyles.eventDetailDivider} />
          <View style={providerCardStyles.eventDetailItem}>
            <View style={providerCardStyles.eventDetailIcon}>
              <Ionicons name="location" size={14} color={colors.brand[400]} />
            </View>
            <View>
              <Text style={providerCardStyles.eventDetailLabel}>Konum</Text>
              <Text style={providerCardStyles.eventDetailValue}>{offer.location}</Text>
            </View>
          </View>
        </View>

        {/* Counter Offer Section */}
        {offer.counterOffer && (
          <View style={[
            providerCardStyles.counterOfferSection,
            offer.counterOffer.by === 'organizer' && providerCardStyles.counterOfferIncoming
          ]}>
            <View style={providerCardStyles.counterOfferHeader}>
              <View style={providerCardStyles.counterOfferIconBox}>
                <Ionicons
                  name={offer.counterOffer.by === 'organizer' ? 'arrow-down' : 'arrow-up'}
                  size={14}
                  color={offer.counterOffer.by === 'organizer' ? colors.warning : colors.brand[400]}
                />
              </View>
              <View style={providerCardStyles.counterOfferTitleSection}>
                <Text style={providerCardStyles.counterOfferTitle}>
                  {offer.counterOffer.by === 'provider' ? 'Gönderilen Karşı Teklif' : 'Gelen Karşı Teklif'}
                </Text>
                <Text style={providerCardStyles.counterOfferTime}>{offer.counterOffer.date}</Text>
              </View>
            </View>
            <View style={providerCardStyles.counterOfferAmountRow}>
              <Text style={providerCardStyles.counterOfferAmount}>
                ₺{offer.counterOffer.amount.toLocaleString('tr-TR')}
              </Text>
              {offer.counterOffer.amount !== offer.amount && (
                <View style={[
                  providerCardStyles.counterOfferDiff,
                  { backgroundColor: offer.counterOffer.amount < offer.amount ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }
                ]}>
                  <Text style={[
                    providerCardStyles.counterOfferDiffText,
                    { color: offer.counterOffer.amount < offer.amount ? colors.error : colors.success }
                  ]}>
                    {offer.counterOffer.amount < offer.amount ? '-' : '+'}
                    ₺{Math.abs(offer.counterOffer.amount - offer.amount).toLocaleString('tr-TR')}
                  </Text>
                </View>
              )}
            </View>
            {offer.counterOffer.message && (
              <Text style={providerCardStyles.counterOfferMessage} numberOfLines={2}>
                "{offer.counterOffer.message}"
              </Text>
            )}
          </View>
        )}

        {/* Amount Section */}
        <View style={providerCardStyles.amountSection}>
          <View style={providerCardStyles.amountLeft}>
            <Text style={providerCardStyles.amountLabel}>
              {offer.counterOffer ? 'İlk Teklifiniz' : 'Teklif Tutarınız'}
            </Text>
            <Text style={[
              providerCardStyles.amountValue,
              offer.counterOffer && providerCardStyles.amountValueOld
            ]}>
              ₺{offer.amount.toLocaleString('tr-TR')}
            </Text>
          </View>
          {!offer.counterOffer && (
            <View style={providerCardStyles.amountRight}>
              <View style={providerCardStyles.amountSuccessIcon}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              </View>
              <Text style={providerCardStyles.amountHint}>Aktif Teklif</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={providerCardStyles.footer}>
          <View style={providerCardStyles.footerLeft}>
            <Ionicons name="time-outline" size={14} color={colors.zinc[500]} />
            <Text style={providerCardStyles.footerTime}>{offer.date}</Text>
          </View>

          {/* Action Buttons */}
          {showActions && (
            <View style={providerCardStyles.actionButtonsRow}>
              <TouchableOpacity
                style={providerCardStyles.actionBtnReject}
                onPress={() => handleReject(offer.id)}
              >
                <Ionicons name="close" size={18} color={colors.error} />
              </TouchableOpacity>
              <TouchableOpacity
                style={providerCardStyles.actionBtnCounter}
                onPress={() => handleCounterOffer(offer.id)}
              >
                <Ionicons name="swap-horizontal" size={16} color={colors.brand[400]} />
                <Text style={providerCardStyles.actionBtnCounterText}>Pazarlık</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={providerCardStyles.actionBtnAccept}
                onPress={() => handleAccept(offer.id)}
              >
                <LinearGradient
                  colors={gradients.primary}
                  style={providerCardStyles.actionBtnAcceptGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark" size={16} color="white" />
                  <Text style={providerCardStyles.actionBtnAcceptText}>Kabul</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Waiting Status */}
          {offer.status === 'pending' && (
            <View style={providerCardStyles.waitingStatus}>
              <View style={providerCardStyles.waitingDot} />
              <Text style={providerCardStyles.waitingText}>Organizatör inceliyor</Text>
            </View>
          )}
          {offer.status === 'counter_offered' && offer.counterOffer?.by === 'provider' && (
            <View style={providerCardStyles.waitingStatus}>
              <View style={providerCardStyles.waitingDot} />
              <Text style={providerCardStyles.waitingText}>Yanıt bekleniyor</Text>
            </View>
          )}

          {/* Completed Status Arrow */}
          {(offer.status === 'accepted' || offer.status === 'rejected') && (
            <View style={providerCardStyles.completedArrow}>
              <Text style={providerCardStyles.completedText}>Detaylar</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.zinc[500]} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isProviderMode ? 'Gönderilen Teklifler' : 'Gelen Teklifler'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {stats.active} aktif teklif
          </Text>
        </View>
        {!isProviderMode && (
          <TouchableOpacity style={[styles.filterButton, {
            backgroundColor: colors.glass,
            borderColor: colors.glassBorder
          }]}>
            <Ionicons name="filter" size={18} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, {
            backgroundColor: colors.glass,
            borderColor: colors.glassBorder
          }, activeTab === 'active' && { backgroundColor: colors.glassStrong }]}
          onPress={() => setActiveTab('active')}
        >
          <Ionicons
            name={activeTab === 'active' ? 'flash' : 'flash-outline'}
            size={14}
            color={activeTab === 'active' ? colors.brand[400] : colors.textMuted}
          />
          <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === 'active' && { color: colors.brand[400] }]}>
            Aktif
          </Text>
          <View style={[styles.tabBadge, { backgroundColor: colors.glassStrong }, activeTab === 'active' && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, { color: colors.textMuted }, activeTab === 'active' && { color: colors.brand[400] }]}>
              {stats.active}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, {
            backgroundColor: colors.glass,
            borderColor: colors.glassBorder
          }, activeTab === 'accepted' && { backgroundColor: colors.glassStrong }]}
          onPress={() => setActiveTab('accepted')}
        >
          <Ionicons
            name={activeTab === 'accepted' ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={14}
            color={activeTab === 'accepted' ? colors.success : colors.textMuted}
          />
          <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === 'accepted' && { color: colors.success }]}>
            Onaylanan
          </Text>
          <View style={[styles.tabBadge, { backgroundColor: colors.glassStrong }, activeTab === 'accepted' && styles.tabBadgeAccepted]}>
            <Text style={[styles.tabBadgeText, { color: colors.textMuted }, activeTab === 'accepted' && { color: colors.success }]}>
              {stats.accepted}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, {
            backgroundColor: colors.glass,
            borderColor: colors.glassBorder
          }, activeTab === 'rejected' && { backgroundColor: colors.glassStrong }]}
          onPress={() => setActiveTab('rejected')}
        >
          <Ionicons
            name={activeTab === 'rejected' ? 'close-circle' : 'close-circle-outline'}
            size={14}
            color={activeTab === 'rejected' ? colors.error : colors.textMuted}
          />
          <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === 'rejected' && { color: colors.error }]}>
            Reddedilen
          </Text>
          <View style={[styles.tabBadge, { backgroundColor: colors.glassStrong }, activeTab === 'rejected' && styles.tabBadgeRejected]}>
            <Text style={[styles.tabBadgeText, { color: colors.textMuted }, activeTab === 'rejected' && { color: colors.error }]}>
              {stats.rejected}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Offers List */}
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
          filteredOffers.map(offer =>
            isProviderMode
              ? renderProviderOfferCard(offer as typeof providerOffers[0])
              : renderOrganizerOfferCard(offer as typeof organizerOffers[0])
          )
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyStateIcon, { backgroundColor: colors.glass }]}>
              <Ionicons name="pricetags-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Teklif Bulunamadı</Text>
            <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
              Bu kategoride henüz teklif yok.
            </Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.zinc[500],
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.zinc[400],
  },
  tabTextActive: {
    color: colors.brand[400],
  },
  tabTextAccepted: {
    color: colors.success,
  },
  tabTextRejected: {
    color: colors.error,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
  },
  tabBadgeAccepted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  tabBadgeRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.zinc[400],
  },
  tabBadgeTextActive: {
    color: colors.brand[400],
  },
  tabBadgeTextAccepted: {
    color: colors.success,
  },
  tabBadgeTextRejected: {
    color: colors.error,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  offersList: {
    flex: 1,
  },
  offersListContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  offerCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
  },
  offerCardHighlight: {
    borderColor: 'rgba(147, 51, 234, 0.3)',
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
  },
  categoryIndicator: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  providerImageContainer: {
    position: 'relative',
  },
  providerImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  providerName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.zinc[400],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  eventTitle: {
    fontSize: 12,
    color: colors.zinc[500],
    marginTop: 2,
    marginBottom: 8,
  },
  offerMessage: {
    fontSize: 12,
    color: colors.zinc[400],
    lineHeight: 18,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 9,
    color: colors.zinc[500],
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  priceValueStrike: {
    textDecorationLine: 'line-through',
    color: colors.zinc[500],
    fontSize: 11,
  },
  budgetValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.zinc[400],
  },
  differenceValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  acceptButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  // Provider specific styles
  organizerImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  organizerLabel: {
    fontSize: 10,
    color: colors.zinc[500],
  },
  organizerName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  eventTitleProvider: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  roleContainer: {
    marginBottom: 10,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
  },
  amountValueStrike: {
    textDecorationLine: 'line-through',
    color: colors.zinc[500],
    fontSize: 14,
  },
  currentAmountBox: {
    alignItems: 'flex-end',
  },
  currentAmountLabel: {
    fontSize: 10,
    color: colors.zinc[500],
  },
  currentAmountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand[400],
  },
  // Counter offer styles
  counterOfferBox: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  counterOfferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  counterOfferTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brand[400],
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  counterOfferAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  counterOfferMessage: {
    fontSize: 12,
    color: colors.zinc[400],
    lineHeight: 16,
    marginBottom: 4,
  },
  counterOfferDate: {
    fontSize: 10,
    color: colors.zinc[500],
  },
  // Waiting badge
  waitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  waitingText: {
    fontSize: 10,
    color: colors.zinc[400],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.zinc[500],
    textAlign: 'center',
  },
});

// Provider Card Styles - Enhanced Design
const providerCardStyles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
    marginBottom: 2,
  },
  cardHighlight: {
    borderColor: 'rgba(147, 51, 234, 0.3)',
    backgroundColor: 'rgba(147, 51, 234, 0.03)',
  },
  cardUrgent: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
  },
  topBar: {
    height: 4,
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.15)',
  },
  urgentBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ef4444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  organizerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  organizerImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  organizerInfo: {
    gap: 2,
  },
  organizerLabel: {
    fontSize: 10,
    color: colors.zinc[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  organizerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  roleBadgeContainer: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  eventDetailsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    marginBottom: 14,
  },
  eventDetailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  eventDetailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDetailLabel: {
    fontSize: 10,
    color: colors.zinc[500],
  },
  eventDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  eventDetailDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  counterOfferSection: {
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.15)',
    marginBottom: 14,
  },
  counterOfferIncoming: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  counterOfferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  counterOfferIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterOfferTitleSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterOfferTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brand[400],
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  counterOfferTime: {
    fontSize: 10,
    color: colors.zinc[500],
  },
  counterOfferAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  counterOfferAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  counterOfferDiff: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  counterOfferDiffText: {
    fontSize: 11,
    fontWeight: '600',
  },
  counterOfferMessage: {
    fontSize: 12,
    color: colors.zinc[400],
    fontStyle: 'italic',
    lineHeight: 18,
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
    marginBottom: 14,
  },
  amountLeft: {
    gap: 2,
  },
  amountLabel: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.success,
  },
  amountValueOld: {
    fontSize: 16,
    color: colors.zinc[500],
    textDecorationLine: 'line-through',
  },
  amountRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amountSuccessIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountHint: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerTime: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnReject: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  actionBtnCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  actionBtnCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand[400],
  },
  actionBtnAccept: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionBtnAcceptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionBtnAcceptText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  waitingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
  },
  waitingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  waitingText: {
    fontSize: 11,
    color: colors.zinc[400],
  },
  completedArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    color: colors.zinc[500],
  },
});

// Organizer Card Styles - Enhanced Design
const organizerCardStyles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
    marginBottom: 2,
  },
  cardHighlight: {
    borderColor: 'rgba(147, 51, 234, 0.3)',
    backgroundColor: 'rgba(147, 51, 234, 0.03)',
  },
  cardNew: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
  },
  topBar: {
    height: 4,
  },
  newBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.15)',
  },
  newBannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  newBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  counterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(147, 51, 234, 0.15)',
  },
  counterBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brand[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  providerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  providerImageWrapper: {
    position: 'relative',
  },
  providerImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  providerInfo: {
    flex: 1,
    gap: 4,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },
  verifiedText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.success,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  serviceSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  serviceBadge: {
    marginBottom: 8,
  },
  serviceBadgeGradient: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  serviceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  eventTitle: {
    fontSize: 13,
    color: colors.zinc[400],
  },
  messageSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    marginBottom: 14,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    color: colors.zinc[400],
    lineHeight: 18,
  },
  counterOfferSection: {
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.15)',
    marginBottom: 14,
  },
  counterOfferFromProvider: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  counterOfferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  counterOfferIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterOfferTitleRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterOfferTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  counterOfferTime: {
    fontSize: 10,
    color: colors.zinc[500],
  },
  counterOfferBody: {
    gap: 6,
  },
  counterOfferAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  counterOfferMessage: {
    fontSize: 12,
    color: colors.zinc[400],
    fontStyle: 'italic',
    lineHeight: 18,
  },
  priceSection: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: 9,
    color: colors.zinc[500],
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  priceValueOld: {
    fontSize: 12,
    color: colors.zinc[500],
    textDecorationLine: 'line-through',
  },
  budgetValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.zinc[400],
  },
  priceDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  diffValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  budgetStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  budgetStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  deliverySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  deliveryText: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerTime: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnReject: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  actionBtnCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  actionBtnCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand[400],
  },
  actionBtnAccept: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionBtnAcceptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionBtnAcceptText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  waitingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
  },
  waitingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  waitingText: {
    fontSize: 11,
    color: colors.zinc[400],
  },
  completedArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    color: colors.zinc[500],
  },
});
