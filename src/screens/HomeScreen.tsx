import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';

// Local artists data
const artists = [
  { id: '1', name: 'Mabel Matiz', genre: 'Alternatif Pop', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', rating: 4.9 },
  { id: '2', name: 'DJ Burak Yeter', genre: 'EDM / House', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400', rating: 4.8 },
  { id: '3', name: 'Sezen Aksu', genre: 'Pop / Türk Sanat', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', rating: 5.0 },
  { id: '4', name: 'Duman', genre: 'Rock', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400', rating: 4.9 },
];

interface HomeScreenProps {
  isProviderMode: boolean;
}

const categories = [
  { id: 'booking', name: 'Booking', description: 'Sanatçı & DJ', icon: 'musical-notes', gradient: gradients.booking, popular: true },
  { id: 'technical', name: 'Teknik', description: 'Ses & Işık & Sahne', icon: 'volume-high', gradient: gradients.technical, popular: true },
  { id: 'venue', name: 'Mekan', description: 'Etkinlik Alanları', icon: 'business', gradient: gradients.venue, popular: false },
  { id: 'accommodation', name: 'Konaklama', description: 'Otel & Konut', icon: 'bed', gradient: gradients.accommodation, popular: false },
  { id: 'transport', name: 'Ulaşım', description: 'VIP Transfer', icon: 'car', gradient: gradients.transport, popular: false },
  { id: 'flight', name: 'Uçak', description: 'Uçuş Hizmetleri', icon: 'airplane', gradient: gradients.flight, popular: false },
];

const recentProviders = [
  { id: '1', name: 'Pro Sound Istanbul', category: 'Teknik', rating: 4.9, reviews: 128, location: 'İstanbul', verified: true, image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200&h=200&fit=crop' },
  { id: '2', name: 'Elite Transfer', category: 'Ulaşım', rating: 4.8, reviews: 89, location: 'İstanbul', verified: true, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=200&fit=crop' },
  { id: '3', name: 'Grand Hotel', category: 'Konaklama', rating: 4.7, reviews: 256, location: 'Ankara', verified: false, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop' },
];

export function HomeScreen({ isProviderMode }: HomeScreenProps) {
  if (isProviderMode) {
    return <ProviderHomeContent />;
  }
  return <OrganizerHomeContent />;
}

function OrganizerHomeContent() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Profile */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.profileSection} activeOpacity={0.8}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' }}
              style={styles.profileAvatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Ahmet Yılmaz</Text>
              <View style={styles.profileBadge}>
                <View style={styles.profileBadgeDot} />
                <Text style={styles.profileBadgeText}>Organizatör</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.zinc[400]} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={18} color={colors.zinc[500]} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Sanatçı, mekan veya hizmet ara...</Text>
        </TouchableOpacity>

        {/* Feature Card */}
        <TouchableOpacity
          style={styles.featureCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CreateEvent')}
        >
          <LinearGradient
            colors={['rgba(147, 51, 234, 0.1)', 'rgba(99, 102, 241, 0.1)']}
            style={styles.featureCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.featureCardContent}>
              <View style={styles.featureCardLeft}>
                <View style={styles.featureCardBadge}>
                  <Ionicons name="sparkles" size={12} color={colors.brand[400]} />
                  <Text style={styles.featureCardBadgeText}>Hızlı Başla</Text>
                </View>
                <Text style={styles.featureCardTitle}>Etkinlik Oluştur</Text>
                <Text style={styles.featureCardSubtitle}>Tüm hizmetleri tek yerden yönet</Text>
              </View>
              <LinearGradient
                colors={gradients.primary}
                style={styles.featureCardIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="add" size={24} color="white" />
              </LinearGradient>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hizmetler</Text>
          <TouchableOpacity style={styles.sectionLink}>
            <Text style={styles.sectionLinkText}>Tümü</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.brand[400]} />
          </TouchableOpacity>
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ServiceProviders', { category: category.id })}
            >
              <LinearGradient
                colors={category.gradient}
                style={styles.categoryCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {category.popular && (
                  <View style={styles.categoryPopular}>
                    <Ionicons name="trending-up" size={12} color="rgba(255,255,255,0.7)" />
                  </View>
                )}
                <View style={styles.categoryIconBox}>
                  <Ionicons name={category.icon as any} size={20} color="white" />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Operation Category */}
        <TouchableOpacity
          style={styles.operationCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('OperationSubcategories')}
        >
          <LinearGradient
            colors={gradients.operation}
            style={styles.operationCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.operationIconBox}>
              <Ionicons name="settings" size={24} color="white" />
            </View>
            <View style={styles.operationContent}>
              <Text style={styles.operationTitle}>Operasyon</Text>
              <Text style={styles.operationSubtitle}>Güvenlik, Catering, Jeneratör ve 9 hizmet daha</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Providers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Son Görüntülenenler</Text>
          <TouchableOpacity style={styles.sectionLink}>
            <Text style={styles.sectionLinkText}>Tümü</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.brand[400]} />
          </TouchableOpacity>
        </View>

        <View style={styles.providersList}>
          {recentProviders.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ProviderDetail', { providerId: provider.id })}
            >
              <View style={styles.providerImageContainer}>
                <Image source={{ uri: provider.image }} style={styles.providerImage} />
                {provider.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark" size={10} color="white" />
                  </View>
                )}
              </View>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <View style={styles.providerMeta}>
                  <Text style={styles.providerCategory}>{provider.category}</Text>
                  <Text style={styles.providerDot}>•</Text>
                  <Ionicons name="location" size={10} color={colors.zinc[500]} />
                  <Text style={styles.providerLocation}>{provider.location}</Text>
                </View>
              </View>
              <View style={styles.providerRating}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Text style={styles.ratingText}>{provider.rating}</Text>
                </View>
                <Text style={styles.reviewCount}>{provider.reviews} yorum</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Artists */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popüler Sanatçılar</Text>
          <TouchableOpacity style={styles.sectionLink} onPress={() => navigation.navigate('Search')}>
            <Text style={styles.sectionLinkText}>Tümü</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.brand[400]} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.artistsScroll}>
          {(artists || []).slice(0, 4).map((artist) => (
            <TouchableOpacity
              key={artist.id}
              style={styles.artistCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ArtistDetail', { artistId: artist.id })}
            >
              <Image source={{ uri: artist.image }} style={styles.artistImage} />
              <View style={styles.artistInfo}>
                <Text style={styles.artistName} numberOfLines={1}>{artist.name}</Text>
                <Text style={styles.artistGenre} numberOfLines={1}>{artist.genre}</Text>
                <View style={styles.artistRating}>
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Text style={styles.artistRatingText}>{artist.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>270+</Text>
            <Text style={styles.statLabel}>Sanatçı</Text>
          </View>
          <View style={[styles.statItem, styles.statItemBorder]}>
            <Text style={styles.statNumber}>150+</Text>
            <Text style={styles.statLabel}>Mekan</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Sağlayıcı</Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProviderHomeContent() {
  const navigation = useNavigation<any>();

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  // EventPro 360 - Full-service provider stats
  const providerStats = {
    monthlyEarnings: 1285000,
    pendingPayments: 485000,
    completedJobs: 156,
    upcomingJobs: 8,
    pendingOffers: 23,
    rating: 4.9,
    responseRate: 98,
    reviewCount: 312,
    profileViews: 1847,
    conversionRate: 34,
  };

  // Upcoming jobs for EventPro 360
  const upcomingJobs = [
    {
      id: '1',
      title: 'Zeytinli Rock Festivali 2025',
      date: '18-20 Temmuz',
      location: 'Edremit, Balıkesir',
      role: 'Ana Sahne Ses',
      earnings: 245000,
      daysUntil: 8,
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    },
    {
      id: '2',
      title: 'MegaFon Arena - Tarkan',
      date: '25 Temmuz',
      location: 'İstanbul',
      role: 'Etkinlik Güvenliği',
      earnings: 185000,
      daysUntil: 15,
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
    },
    {
      id: '3',
      title: 'Koç Holding Yıllık Toplantısı',
      date: '5 Ağustos',
      location: 'İstanbul',
      role: 'Premium Catering',
      earnings: 320000,
      daysUntil: 25,
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
    },
  ];

  // Recent requests for full-service provider
  const recentRequests = [
    {
      id: '1',
      title: 'Istanbul Fashion Week After Party',
      category: 'Komple Organizasyon',
      organizer: 'Fashion Week TR',
      organizerImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
      location: 'İstanbul',
      date: '15-22 Eylül 2025',
      budget: '450.000 - 600.000 ₺',
      isNew: true,
      isHot: true,
      timeAgo: '1 saat önce',
      matchScore: 95,
    },
    {
      id: '2',
      title: 'Formula 1 VIP Hospitality',
      category: 'Catering & Konaklama',
      organizer: 'Intercity',
      organizerImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
      location: 'İstanbul Park',
      date: '28 Eylül 2025',
      budget: '280.000 - 350.000 ₺',
      isNew: true,
      isHot: false,
      timeAgo: '3 saat önce',
      matchScore: 88,
    },
    {
      id: '3',
      title: 'Büyük Ankara Festivali',
      category: 'Teknik & Güvenlik',
      organizer: 'Ankara BB',
      organizerImage: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=100',
      location: 'Ankara',
      date: '29-30 Ekim 2025',
      budget: '520.000 - 680.000 ₺',
      isNew: false,
      isHot: false,
      timeAgo: '1 gün önce',
      matchScore: 82,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Header */}
        <View style={providerStyles.headerContainer}>
          <View style={providerStyles.headerTop}>
            <View style={providerStyles.greetingSection}>
              <Text style={providerStyles.greetingText}>{getGreeting()}</Text>
              <Text style={providerStyles.companyName}>EventPro 360</Text>
            </View>
            <View style={providerStyles.headerActions}>
              <TouchableOpacity
                style={providerStyles.headerIconButton}
                onPress={() => navigation.navigate('MessagesTab')}
              >
                <Ionicons name="chatbubble-outline" size={20} color={colors.zinc[400]} />
                <View style={providerStyles.headerBadge}>
                  <Text style={providerStyles.headerBadgeText}>5</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={providerStyles.headerIconButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={20} color={colors.zinc[400]} />
                <View style={providerStyles.headerBadge}>
                  <Text style={providerStyles.headerBadgeText}>12</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Status Bar */}
          <View style={providerStyles.statusBar}>
            <View style={providerStyles.statusItem}>
              <View style={[providerStyles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={providerStyles.statusText}>Çevrimiçi</Text>
            </View>
            <View style={providerStyles.statusDivider} />
            <View style={providerStyles.statusItem}>
              <Ionicons name="eye-outline" size={14} color={colors.zinc[500]} />
              <Text style={providerStyles.statusText}>{providerStats.profileViews} görüntülenme</Text>
            </View>
            <View style={providerStyles.statusDivider} />
            <View style={providerStyles.statusItem}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={providerStyles.statusText}>{providerStats.rating} ({providerStats.reviewCount})</Text>
            </View>
          </View>
        </View>

        {/* Modern Earnings Card with Glassmorphism */}
        <View style={providerStyles.earningsSection}>
          <LinearGradient
            colors={['rgba(147, 51, 234, 0.15)', 'rgba(99, 102, 241, 0.1)']}
            style={providerStyles.earningsBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={providerStyles.earningsHeader}>
              <View style={providerStyles.earningsMainInfo}>
                <View style={providerStyles.earningsLabelRow}>
                  <Ionicons name="wallet-outline" size={16} color={colors.brand[400]} />
                  <Text style={providerStyles.earningsLabel}>Bu Ay Kazanç</Text>
                </View>
                <Text style={providerStyles.earningsValue}>₺{providerStats.monthlyEarnings.toLocaleString('tr-TR')}</Text>
                <View style={providerStyles.earningsChange}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
                    style={providerStyles.earningsChangeBadge}
                  >
                    <Ionicons name="trending-up" size={12} color={colors.success} />
                    <Text style={providerStyles.earningsChangeText}>+24% geçen aya göre</Text>
                  </LinearGradient>
                </View>
              </View>
              <TouchableOpacity
                style={providerStyles.earningsDetailButton}
                onPress={() => navigation.navigate('ProfileTab', { screen: 'ProfileMain' })}
              >
                <Ionicons name="arrow-forward" size={20} color={colors.brand[400]} />
              </TouchableOpacity>
            </View>

            <View style={providerStyles.earningsStatsRow}>
              <View style={providerStyles.earningsStatItem}>
                <View style={[providerStyles.earningsStatIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="time-outline" size={16} color={colors.warning} />
                </View>
                <View>
                  <Text style={providerStyles.earningsStatValue}>₺{(providerStats.pendingPayments / 1000).toFixed(0)}K</Text>
                  <Text style={providerStyles.earningsStatLabel}>Bekleyen</Text>
                </View>
              </View>
              <View style={providerStyles.earningsStatDivider} />
              <View style={providerStyles.earningsStatItem}>
                <View style={[providerStyles.earningsStatIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                </View>
                <View>
                  <Text style={providerStyles.earningsStatValue}>{providerStats.completedJobs}</Text>
                  <Text style={providerStyles.earningsStatLabel}>Tamamlanan</Text>
                </View>
              </View>
              <View style={providerStyles.earningsStatDivider} />
              <View style={providerStyles.earningsStatItem}>
                <View style={[providerStyles.earningsStatIcon, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                  <Ionicons name="pulse-outline" size={16} color={colors.brand[400]} />
                </View>
                <View>
                  <Text style={providerStyles.earningsStatValue}>%{providerStats.conversionRate}</Text>
                  <Text style={providerStyles.earningsStatLabel}>Dönüşüm</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Action Stats Cards */}
        <View style={providerStyles.actionStatsRow}>
          <TouchableOpacity
            style={providerStyles.actionStatCard}
            onPress={() => navigation.navigate('OffersTab')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']}
              style={providerStyles.actionStatGradient}
            >
              <View style={providerStyles.actionStatBadge}>
                <Text style={providerStyles.actionStatBadgeText}>{providerStats.pendingOffers}</Text>
              </View>
              <Ionicons name="flash" size={24} color="#ef4444" />
              <Text style={providerStyles.actionStatLabel}>Yeni Teklif</Text>
              <Text style={providerStyles.actionStatHint}>Bekliyor</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={providerStyles.actionStatCard}
            onPress={() => navigation.navigate('EventsTab')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']}
              style={providerStyles.actionStatGradient}
            >
              <View style={[providerStyles.actionStatBadge, { backgroundColor: colors.success }]}>
                <Text style={providerStyles.actionStatBadgeText}>{providerStats.upcomingJobs}</Text>
              </View>
              <Ionicons name="calendar" size={24} color={colors.success} />
              <Text style={providerStyles.actionStatLabel}>Yaklaşan İş</Text>
              <Text style={providerStyles.actionStatHint}>Bu ay</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={providerStyles.actionStatCard}
            onPress={() => navigation.navigate('ProfileTab')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)']}
              style={providerStyles.actionStatGradient}
            >
              <Ionicons name="star" size={24} color={colors.warning} />
              <Text style={providerStyles.actionStatValue}>{providerStats.rating}</Text>
              <Text style={providerStyles.actionStatLabel}>Puan</Text>
              <Text style={providerStyles.actionStatHint}>{providerStats.reviewCount} yorum</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions - Redesigned */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        </View>

        <View style={providerStyles.quickActionsGrid}>
          <TouchableOpacity
            style={providerStyles.quickActionItem}
            onPress={() => navigation.navigate('OffersTab')}
          >
            <LinearGradient
              colors={gradients.primary}
              style={providerStyles.quickActionIconBox}
            >
              <Ionicons name="send" size={20} color="white" />
            </LinearGradient>
            <Text style={providerStyles.quickActionLabel}>Teklif Gönder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={providerStyles.quickActionItem}
            onPress={() => navigation.navigate('EventsTab', { screen: 'CalendarView' })}
          >
            <View style={[providerStyles.quickActionIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.info} />
            </View>
            <Text style={providerStyles.quickActionLabel}>Müsaitlik</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={providerStyles.quickActionItem}
            onPress={() => navigation.navigate('ProfileTab', { screen: 'ProviderServices' })}
          >
            <View style={[providerStyles.quickActionIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="images-outline" size={20} color={colors.warning} />
            </View>
            <Text style={providerStyles.quickActionLabel}>Portföy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={providerStyles.quickActionItem}
            onPress={() => navigation.navigate('ProfileTab', { screen: 'ProfileMain' })}
          >
            <View style={[providerStyles.quickActionIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="bar-chart-outline" size={20} color={colors.success} />
            </View>
            <Text style={providerStyles.quickActionLabel}>Raporlar</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Jobs - Enhanced Design */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Yaklaşan İşler</Text>
          <TouchableOpacity
            style={styles.sectionLink}
            onPress={() => navigation.navigate('EventsTab')}
          >
            <Text style={styles.sectionLinkText}>Tümü</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.brand[400]} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={providerStyles.jobsScrollContent}
        >
          {upcomingJobs.map((job, index) => (
            <TouchableOpacity
              key={job.id}
              style={[
                providerStyles.jobCard,
                index === 0 && providerStyles.jobCardFirst
              ]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('EventsTab', {
                screen: 'ProviderEventDetail',
                params: { eventId: job.id }
              })}
            >
              <Image source={{ uri: job.image }} style={providerStyles.jobImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={providerStyles.jobGradient}
              />

              {/* Countdown Badge */}
              <View style={[
                providerStyles.jobCountdown,
                job.daysUntil <= 7 && providerStyles.jobCountdownUrgent
              ]}>
                {job.daysUntil <= 7 && (
                  <Ionicons name="alert-circle" size={12} color={job.daysUntil <= 3 ? '#ef4444' : colors.warning} />
                )}
                <Text style={[
                  providerStyles.jobCountdownText,
                  job.daysUntil <= 3 && { color: '#ef4444' },
                  job.daysUntil <= 7 && job.daysUntil > 3 && { color: colors.warning }
                ]}>
                  {job.daysUntil} gün
                </Text>
              </View>

              {/* Status Badge */}
              <View style={[
                providerStyles.jobStatusBadge,
                job.status === 'confirmed' ? providerStyles.jobStatusConfirmed : providerStyles.jobStatusPending
              ]}>
                <Text style={providerStyles.jobStatusText}>
                  {job.status === 'confirmed' ? 'Onaylı' : 'Beklemede'}
                </Text>
              </View>

              <View style={providerStyles.jobContent}>
                <View style={providerStyles.jobRoleBadge}>
                  <Text style={providerStyles.jobRoleText}>{job.role}</Text>
                </View>
                <Text style={providerStyles.jobTitle} numberOfLines={2}>{job.title}</Text>
                <View style={providerStyles.jobMetaRow}>
                  <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={providerStyles.jobMetaText}>{job.location}</Text>
                </View>
                <View style={providerStyles.jobMetaRow}>
                  <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={providerStyles.jobMetaText}>{job.date}</Text>
                </View>
                <View style={providerStyles.jobEarningsRow}>
                  <Text style={providerStyles.jobEarningsValue}>₺{job.earnings.toLocaleString('tr-TR')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* New Requests - Enhanced Design */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Yeni Talepler</Text>
          <TouchableOpacity
            style={styles.sectionLink}
            onPress={() => navigation.navigate('OffersTab')}
          >
            <Text style={styles.sectionLinkText}>Tümü ({recentRequests.length})</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.brand[400]} />
          </TouchableOpacity>
        </View>

        <View style={providerStyles.requestsContainer}>
          {recentRequests.map((request, index) => (
            <TouchableOpacity
              key={request.id}
              style={[
                providerStyles.requestCard,
                request.isHot && providerStyles.requestCardHot
              ]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('OffersTab', {
                screen: 'OfferDetail',
                params: { offerId: request.id }
              })}
            >
              {/* Request Header */}
              <View style={providerStyles.requestHeader}>
                <View style={providerStyles.requestBadges}>
                  {request.isNew && (
                    <View style={providerStyles.requestNewBadge}>
                      <Text style={providerStyles.requestNewBadgeText}>YENİ</Text>
                    </View>
                  )}
                  {request.isHot && (
                    <View style={providerStyles.requestHotBadge}>
                      <Ionicons name="flame" size={10} color="#ef4444" />
                      <Text style={providerStyles.requestHotBadgeText}>SICAK</Text>
                    </View>
                  )}
                </View>
                <View style={providerStyles.requestMatchBadge}>
                  <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                  <Text style={providerStyles.requestMatchText}>%{request.matchScore} Uyum</Text>
                </View>
              </View>

              {/* Request Content */}
              <Text style={providerStyles.requestTitle}>{request.title}</Text>
              <Text style={providerStyles.requestCategory}>{request.category}</Text>

              {/* Organizer Info */}
              <View style={providerStyles.requestOrganizerRow}>
                <Image source={{ uri: request.organizerImage }} style={providerStyles.requestOrganizerImage} />
                <Text style={providerStyles.requestOrganizerName}>{request.organizer}</Text>
                <Text style={providerStyles.requestTime}>{request.timeAgo}</Text>
              </View>

              {/* Request Details */}
              <View style={providerStyles.requestDetailsRow}>
                <View style={providerStyles.requestDetailChip}>
                  <Ionicons name="location-outline" size={12} color={colors.zinc[400]} />
                  <Text style={providerStyles.requestDetailChipText}>{request.location}</Text>
                </View>
                <View style={providerStyles.requestDetailChip}>
                  <Ionicons name="calendar-outline" size={12} color={colors.zinc[400]} />
                  <Text style={providerStyles.requestDetailChipText}>{request.date}</Text>
                </View>
              </View>

              {/* Budget & Action */}
              <View style={providerStyles.requestFooter}>
                <View style={providerStyles.requestBudgetSection}>
                  <Text style={providerStyles.requestBudgetLabel}>Bütçe</Text>
                  <Text style={providerStyles.requestBudgetValue}>{request.budget}</Text>
                </View>
                <TouchableOpacity style={providerStyles.requestActionButton}>
                  <Text style={providerStyles.requestActionButtonText}>Teklif Ver</Text>
                  <Ionicons name="arrow-forward" size={14} color="white" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Performance Overview - Circular Design */}
        <View style={providerStyles.performanceSection}>
          <View style={providerStyles.performanceSectionHeader}>
            <View style={providerStyles.performanceTitleRow}>
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.1)']}
                style={providerStyles.performanceIconBox}
              >
                <Ionicons name="trophy" size={18} color={colors.warning} />
              </LinearGradient>
              <Text style={providerStyles.performanceSectionTitle}>Performans Özeti</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="information-circle-outline" size={20} color={colors.zinc[500]} />
            </TouchableOpacity>
          </View>

          <View style={providerStyles.performanceCirclesRow}>
            <View style={providerStyles.performanceCircleItem}>
              <View style={providerStyles.performanceCircle}>
                <View style={[providerStyles.performanceCircleProgress, { borderColor: colors.success }]}>
                  <Text style={providerStyles.performanceCircleValue}>98%</Text>
                </View>
              </View>
              <Text style={providerStyles.performanceCircleLabel}>Yanıt Oranı</Text>
            </View>

            <View style={providerStyles.performanceCircleItem}>
              <View style={providerStyles.performanceCircle}>
                <View style={[providerStyles.performanceCircleProgress, { borderColor: colors.brand[500] }]}>
                  <Text style={providerStyles.performanceCircleValue}>96%</Text>
                </View>
              </View>
              <Text style={providerStyles.performanceCircleLabel}>Tamamlama</Text>
            </View>

            <View style={providerStyles.performanceCircleItem}>
              <View style={providerStyles.performanceCircle}>
                <View style={[providerStyles.performanceCircleProgress, { borderColor: colors.warning }]}>
                  <Text style={providerStyles.performanceCircleValue}>99%</Text>
                </View>
              </View>
              <Text style={providerStyles.performanceCircleLabel}>Memnuniyet</Text>
            </View>
          </View>

          <View style={providerStyles.performanceHint}>
            <Ionicons name="sparkles" size={14} color={colors.brand[400]} />
            <Text style={providerStyles.performanceHintText}>Harika gidiyorsunuz! Üst düzey sağlayıcı statüsündesiniz.</Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Provider-specific styles
const providerStyles = StyleSheet.create({
  // Header
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingSection: {
    gap: 2,
  },
  greetingText: {
    fontSize: 14,
    color: colors.zinc[500],
  },
  companyName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: colors.zinc[400],
  },
  statusDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 12,
  },

  // Earnings Section
  earningsSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  earningsBackground: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  earningsMainInfo: {
    gap: 4,
  },
  earningsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  earningsLabel: {
    fontSize: 12,
    color: colors.zinc[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  earningsValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  earningsChange: {
    marginTop: 8,
  },
  earningsChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  earningsChangeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.success,
  },
  earningsDetailButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  earningsStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  earningsStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsStatValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  earningsStatLabel: {
    fontSize: 10,
    color: colors.zinc[500],
    marginTop: 1,
  },
  earningsStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },

  // Action Stats
  actionStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 8,
  },
  actionStatCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionStatGradient: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    position: 'relative',
  },
  actionStatBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionStatBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  actionStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  actionStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  actionStatHint: {
    fontSize: 10,
    color: colors.zinc[500],
    marginTop: 2,
  },

  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  quickActionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.zinc[400],
    textAlign: 'center',
  },

  // Jobs Section
  jobsScrollContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  jobCard: {
    width: 200,
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  jobCardFirst: {
    width: 220,
  },
  jobImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  jobGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  jobCountdown: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  jobCountdownUrgent: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  jobCountdownText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brand[400],
  },
  jobStatusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  jobStatusConfirmed: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  jobStatusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
  },
  jobStatusText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jobContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  jobRoleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    borderRadius: 6,
    marginBottom: 8,
  },
  jobRoleText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  jobMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  jobMetaText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  jobEarningsRow: {
    marginTop: 8,
  },
  jobEarningsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },

  // Requests Section
  requestsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  requestCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  requestCardHot: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  requestNewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderRadius: 6,
  },
  requestNewBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.brand[400],
    letterSpacing: 0.5,
  },
  requestHotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 6,
  },
  requestHotBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ef4444',
    letterSpacing: 0.5,
  },
  requestMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestMatchText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.success,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  requestCategory: {
    fontSize: 12,
    color: colors.zinc[500],
    marginBottom: 12,
  },
  requestOrganizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestOrganizerImage: {
    width: 24,
    height: 24,
    borderRadius: 8,
    marginRight: 8,
  },
  requestOrganizerName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: colors.zinc[400],
  },
  requestTime: {
    fontSize: 11,
    color: colors.zinc[600],
  },
  requestDetailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  requestDetailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
  },
  requestDetailChipText: {
    fontSize: 11,
    color: colors.zinc[400],
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  requestBudgetSection: {
    gap: 2,
  },
  requestBudgetLabel: {
    fontSize: 10,
    color: colors.zinc[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requestBudgetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  requestActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.brand[500],
    borderRadius: 10,
  },
  requestActionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },

  // Performance Section
  performanceSection: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  performanceSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  performanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  performanceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  performanceCirclesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  performanceCircleItem: {
    alignItems: 'center',
    gap: 10,
  },
  performanceCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceCircleProgress: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceCircleValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  performanceCircleLabel: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  performanceHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    borderRadius: 12,
  },
  performanceHintText: {
    flex: 1,
    fontSize: 12,
    color: colors.brand[300],
  },
});

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
    paddingBottom: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  profileInfo: {
    gap: 2,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  profileBadgeText: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  featureCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  featureCardGradient: {
    padding: 20,
  },
  featureCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureCardLeft: {
    flex: 1,
  },
  featureCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  featureCardBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.brand[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  featureCardSubtitle: {
    fontSize: 12,
    color: colors.zinc[400],
    marginTop: 2,
  },
  featureCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.brand[400],
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryCard: {
    width: '31%',
    aspectRatio: 0.9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryCardGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  categoryPopular: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  categoryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 2,
  },
  operationCard: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  operationCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  operationIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  operationContent: {
    flex: 1,
    marginLeft: 16,
  },
  operationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  operationSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  providersList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  providerImageContainer: {
    position: 'relative',
  },
  providerImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  providerCategory: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.brand[400],
  },
  providerDot: {
    fontSize: 10,
    color: colors.zinc[700],
  },
  providerLocation: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  providerRating: {
    alignItems: 'flex-end',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  reviewCount: {
    fontSize: 9,
    color: colors.zinc[500],
    marginTop: 2,
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.zinc[800],
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: colors.zinc[500],
    marginTop: 2,
  },
  // Provider specific styles
  providerStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 8,
  },
  providerStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  providerStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  providerStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  providerStatLabel: {
    fontSize: 10,
    color: colors.zinc[500],
    marginTop: 2,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionItem: {
    width: '47%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  requestsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  requestCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 6,
  },
  requestBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fbbf24',
    letterSpacing: 0.5,
  },
  requestTime: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  requestTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  requestSubtitle: {
    fontSize: 12,
    color: colors.zinc[400],
    marginTop: 2,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  requestLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestLocationText: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  requestDate: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.brand[400],
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: colors.zinc[600],
  },
  artistsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  artistCard: {
    width: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  artistImage: {
    width: '100%',
    height: 140,
  },
  artistInfo: {
    padding: 12,
  },
  artistName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  artistGenre: {
    fontSize: 11,
    color: colors.zinc[500],
    marginTop: 2,
  },
  artistRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  artistRatingText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  // Enhanced Provider Styles
  earningsCard: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  earningsCardGradient: {
    padding: 20,
  },
  earningsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  earningsCardLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  earningsCardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  earningsCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  earningsCardBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  earningsCardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 16,
  },
  earningsCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningsCardStat: {
    alignItems: 'center',
  },
  earningsCardStatLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  earningsCardStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  quickActionsScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  quickActionCard: {
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    width: 90,
  },
  quickActionCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionCardText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.zinc[400],
    textAlign: 'center',
  },
  upcomingJobsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  upcomingJobCard: {
    width: 180,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  upcomingJobImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  upcomingJobGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  upcomingJobDaysBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  upcomingJobDaysText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.brand[400],
  },
  upcomingJobContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  upcomingJobRole: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.brand[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  upcomingJobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  upcomingJobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  upcomingJobMetaText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  upcomingJobEarnings: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
    marginTop: 6,
  },
  requestDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 12,
  },
  requestDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  requestDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestDetailText: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  requestDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  requestDateText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.brand[400],
  },
  requestBudget: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
  },
  performanceCard: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  performanceStats: {
    gap: 12,
  },
  performanceStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  performanceStatBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  performanceStatFill: {
    height: '100%',
    borderRadius: 3,
  },
  performanceStatLabel: {
    fontSize: 11,
    color: colors.zinc[500],
    width: 80,
  },
  performanceStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    width: 35,
    textAlign: 'right',
  },
});
