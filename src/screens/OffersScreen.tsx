import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';

interface OffersScreenProps {
  isProviderMode: boolean;
}

type TabType = 'pending' | 'accepted' | 'rejected' | 'all';

// Organizer offers (received from providers)
const organizerOffers = [
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
    status: 'pending',
    date: '2 saat önce',
    deliveryTime: '3 gün',
    message: 'Festival için komple ses sistemi kurulumu teklifi.',
  },
  {
    id: 'o2',
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
    status: 'accepted',
    date: '1 gün önce',
    deliveryTime: '1 gün',
    message: 'VIP misafirler için lüks araç transferi.',
  },
  {
    id: 'o3',
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
    status: 'rejected',
    date: '3 gün önce',
    deliveryTime: '2 gün',
    message: 'Düğün dekorasyonu ve çiçek düzenlemeleri.',
  },
  {
    id: 'o4',
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
    status: 'pending',
    date: '5 saat önce',
    deliveryTime: '3 gün',
    message: 'Profesyonel sahne aydınlatma sistemi.',
  },
];

// Provider offers (sent to organizers)
const providerOffers = [
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
    status: 'pending',
    date: '2 saat önce',
    eventDate: '15-17 Temmuz 2024',
    location: 'İstanbul, Kadıköy',
  },
  {
    id: 'po2',
    eventTitle: 'Kurumsal Gala Gecesi',
    organizer: {
      name: 'XYZ Holding',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    },
    serviceCategory: 'technical',
    role: 'Işık & Ses Operatörü',
    amount: 55000,
    status: 'accepted',
    date: '1 gün önce',
    eventDate: '22 Ağustos 2024',
    location: 'Ankara',
  },
  {
    id: 'po3',
    eventTitle: 'Düğün - Ayşe & Mehmet',
    organizer: {
      name: 'Ayşe Yılmaz',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    },
    serviceCategory: 'booking',
    role: 'DJ Set',
    amount: 25000,
    status: 'accepted',
    date: '2 gün önce',
    eventDate: '1 Eylül 2024',
    location: 'İstanbul, Beşiktaş',
  },
  {
    id: 'po4',
    eventTitle: 'Tech Conference 2024',
    organizer: {
      name: 'TechTR',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
    },
    serviceCategory: 'technical',
    role: 'Sahne Kurulum',
    amount: 45000,
    status: 'rejected',
    date: '5 gün önce',
    eventDate: '10-11 Ekim 2024',
    location: 'İstanbul',
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
  const [activeTab, setActiveTab] = useState<TabType>('pending');
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
      case 'rejected': return colors.error;
      default: return colors.zinc[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Kabul Edildi';
      case 'pending': return 'Beklemede';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'accepted': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const offers = isProviderMode ? providerOffers : organizerOffers;
    return {
      pending: offers.filter(o => o.status === 'pending').length,
      accepted: offers.filter(o => o.status === 'accepted').length,
      rejected: offers.filter(o => o.status === 'rejected').length,
      total: offers.length,
    };
  }, [isProviderMode]);

  // Filtered offers
  const filteredOffers = useMemo(() => {
    const offers = isProviderMode ? providerOffers : organizerOffers;
    if (activeTab === 'all') return offers;
    return offers.filter(o => o.status === activeTab);
  }, [isProviderMode, activeTab]);

  const renderOrganizerOfferCard = (offer: typeof organizerOffers[0]) => {
    const statusColor = getStatusColor(offer.status);

    return (
      <TouchableOpacity
        key={offer.id}
        style={styles.offerCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
      >
        {/* Category Indicator */}
        <LinearGradient
          colors={getCategoryGradient(offer.serviceCategory)}
          style={styles.categoryIndicator}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.providerInfo}>
              <View style={styles.providerImageContainer}>
                <Image source={{ uri: offer.provider.image }} style={styles.providerImage} />
                {offer.provider.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark" size={8} color="white" />
                  </View>
                )}
              </View>
              <View>
                <Text style={styles.providerName}>{offer.provider.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={11} color="#fbbf24" />
                  <Text style={styles.ratingText}>{offer.provider.rating}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <Ionicons name={getStatusIcon(offer.status)} size={11} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusText(offer.status)}
              </Text>
            </View>
          </View>

          {/* Service Info */}
          <Text style={styles.serviceName}>{offer.serviceName}</Text>
          <Text style={styles.eventTitle}>{offer.eventTitle}</Text>

          {/* Message */}
          <Text style={styles.offerMessage} numberOfLines={2}>{offer.message}</Text>

          {/* Price Row */}
          <View style={styles.priceRow}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Teklif</Text>
              <Text style={styles.priceValue}>₺{offer.amount.toLocaleString('tr-TR')}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Bütçe</Text>
              <Text style={styles.budgetValue}>₺{offer.originalBudget.toLocaleString('tr-TR')}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Fark</Text>
              <Text style={[styles.differenceValue, { color: offer.amount <= offer.originalBudget ? colors.success : colors.error }]}>
                {offer.amount <= offer.originalBudget ? '-' : '+'}₺{Math.abs(offer.originalBudget - offer.amount).toLocaleString('tr-TR')}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.dateInfo}>
              <Ionicons name="time-outline" size={12} color={colors.zinc[500]} />
              <Text style={styles.dateText}>{offer.date}</Text>
            </View>
            {offer.status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.rejectButton}>
                  <Ionicons name="close" size={16} color={colors.error} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton}>
                  <LinearGradient
                    colors={gradients.primary}
                    style={styles.acceptButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="checkmark" size={16} color="white" />
                    <Text style={styles.acceptButtonText}>Kabul Et</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProviderOfferCard = (offer: typeof providerOffers[0]) => {
    const statusColor = getStatusColor(offer.status);

    return (
      <TouchableOpacity
        key={offer.id}
        style={styles.offerCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
      >
        {/* Category Indicator */}
        <LinearGradient
          colors={getCategoryGradient(offer.serviceCategory)}
          style={styles.categoryIndicator}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.providerInfo}>
              <Image source={{ uri: offer.organizer.image }} style={styles.organizerImage} />
              <View>
                <Text style={styles.organizerLabel}>Organizatör</Text>
                <Text style={styles.organizerName}>{offer.organizer.name}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <Ionicons name={getStatusIcon(offer.status)} size={11} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusText(offer.status)}
              </Text>
            </View>
          </View>

          {/* Event & Role Info */}
          <Text style={styles.eventTitleProvider}>{offer.eventTitle}</Text>
          <View style={styles.roleContainer}>
            <LinearGradient
              colors={getCategoryGradient(offer.serviceCategory)}
              style={styles.roleBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.roleBadgeText}>{offer.role}</Text>
            </LinearGradient>
          </View>

          {/* Event Meta */}
          <View style={styles.eventMeta}>
            <View style={styles.eventMetaItem}>
              <Ionicons name="calendar-outline" size={12} color={colors.zinc[500]} />
              <Text style={styles.eventMetaText}>{offer.eventDate}</Text>
            </View>
            <View style={styles.eventMetaItem}>
              <Ionicons name="location-outline" size={12} color={colors.zinc[500]} />
              <Text style={styles.eventMetaText}>{offer.location}</Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Teklif Tutarı</Text>
            <Text style={styles.amountValue}>₺{offer.amount.toLocaleString('tr-TR')}</Text>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.dateInfo}>
              <Ionicons name="time-outline" size={12} color={colors.zinc[500]} />
              <Text style={styles.dateText}>{offer.date}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.zinc[500]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {isProviderMode ? 'Gönderilen Teklifler' : 'Gelen Teklifler'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {stats.pending} bekleyen teklif
          </Text>
        </View>
        {!isProviderMode && (
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={18} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="time" size={18} color={colors.warning} />
          </View>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Bekleyen</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          </View>
          <Text style={[styles.statNumber, { color: colors.success }]}>{stats.accepted}</Text>
          <Text style={styles.statLabel}>Kabul</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
            <Ionicons name="close-circle" size={18} color={colors.error} />
          </View>
          <Text style={[styles.statNumber, { color: colors.error }]}>{stats.rejected}</Text>
          <Text style={styles.statLabel}>Red</Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Ionicons
            name={activeTab === 'pending' ? 'time' : 'time-outline'}
            size={14}
            color={activeTab === 'pending' ? colors.brand[400] : colors.zinc[500]}
          />
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Bekleyen
          </Text>
          <View style={[styles.tabBadge, activeTab === 'pending' && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, activeTab === 'pending' && styles.tabBadgeTextActive]}>
              {stats.pending}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accepted' && styles.tabActive]}
          onPress={() => setActiveTab('accepted')}
        >
          <Ionicons
            name={activeTab === 'accepted' ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={14}
            color={activeTab === 'accepted' ? colors.brand[400] : colors.zinc[500]}
          />
          <Text style={[styles.tabText, activeTab === 'accepted' && styles.tabTextActive]}>
            Kabul Edilen
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rejected' && styles.tabActive]}
          onPress={() => setActiveTab('rejected')}
        >
          <Ionicons
            name={activeTab === 'rejected' ? 'close-circle' : 'close-circle-outline'}
            size={14}
            color={activeTab === 'rejected' ? colors.brand[400] : colors.zinc[500]}
          />
          <Text style={[styles.tabText, activeTab === 'rejected' && styles.tabTextActive]}>
            Reddedilen
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Ionicons
            name={activeTab === 'all' ? 'list' : 'list-outline'}
            size={14}
            color={activeTab === 'all' ? colors.brand[400] : colors.zinc[500]}
          />
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Tümü
          </Text>
          <View style={[styles.tabBadge, activeTab === 'all' && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, activeTab === 'all' && styles.tabBadgeTextActive]}>
              {stats.total}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

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
            <View style={styles.emptyStateIcon}>
              <Ionicons name="pricetags-outline" size={48} color={colors.zinc[600]} />
            </View>
            <Text style={styles.emptyStateTitle}>Teklif Bulunamadı</Text>
            <Text style={styles.emptyStateText}>
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.warning,
  },
  statLabel: {
    fontSize: 10,
    color: colors.zinc[500],
    marginTop: 2,
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 6,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 6,
    gap: 4,
  },
  tabActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.zinc[400],
  },
  tabTextActive: {
    color: colors.brand[400],
  },
  tabBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.zinc[400],
  },
  tabBadgeTextActive: {
    color: colors.brand[300],
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
