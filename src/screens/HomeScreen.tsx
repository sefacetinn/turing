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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Hoş geldin</Text>
            <Text style={styles.headerTitle}>Merhaba! 👋</Text>
          </View>
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

  // Mock provider stats
  const providerStats = {
    monthlyEarnings: 185000,
    pendingPayments: 42500,
    completedJobs: 24,
    upcomingJobs: 4,
    pendingOffers: 12,
    rating: 4.9,
    responseRate: 95,
  };

  // Mock upcoming jobs
  const upcomingJobs = [
    {
      id: '1',
      title: 'Yaz Festivali 2024',
      date: '15-17 Temmuz',
      location: 'İstanbul, Kadıköy',
      role: 'Ses Sistemi',
      earnings: 85000,
      daysUntil: 15,
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    },
    {
      id: '2',
      title: 'Düğün - Ayşe & Mehmet',
      date: '1 Eylül',
      location: 'İstanbul, Beşiktaş',
      role: 'DJ Set',
      earnings: 25000,
      daysUntil: 55,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    },
  ];

  // Mock recent requests
  const recentRequests = [
    {
      id: '1',
      title: 'Kurumsal Gala Gecesi',
      category: 'Işık & Ses Sistemi',
      organizer: 'XYZ Holding',
      location: 'Ankara',
      date: '22 Ağustos 2024',
      budget: '50.000 - 70.000 ₺',
      isNew: true,
      timeAgo: '2 saat önce',
    },
    {
      id: '2',
      title: 'Tech Conference 2024',
      category: 'Sahne Kurulum',
      organizer: 'TechTR',
      location: 'İstanbul',
      date: '10-11 Ekim 2024',
      budget: '40.000 - 60.000 ₺',
      isNew: true,
      timeAgo: '5 saat önce',
    },
    {
      id: '3',
      title: 'Yılbaşı Partisi',
      category: 'DJ Set',
      organizer: 'Acme Events',
      location: 'İzmir',
      date: '31 Aralık 2024',
      budget: '15.000 - 25.000 ₺',
      isNew: false,
      timeAgo: '1 gün önce',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Sağlayıcı Paneli</Text>
            <Text style={styles.headerTitle}>Hoş geldin! 🎵</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.zinc[400]} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>5</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.earningsCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.earningsCardHeader}>
              <View>
                <Text style={styles.earningsCardLabel}>Bu Ay Kazanç</Text>
                <Text style={styles.earningsCardValue}>₺{providerStats.monthlyEarnings.toLocaleString('tr-TR')}</Text>
              </View>
              <View style={styles.earningsCardBadge}>
                <Ionicons name="trending-up" size={14} color={colors.success} />
                <Text style={styles.earningsCardBadgeText}>+18%</Text>
              </View>
            </View>
            <View style={styles.earningsCardDivider} />
            <View style={styles.earningsCardFooter}>
              <View style={styles.earningsCardStat}>
                <Text style={styles.earningsCardStatLabel}>Bekleyen Ödeme</Text>
                <Text style={styles.earningsCardStatValue}>₺{providerStats.pendingPayments.toLocaleString('tr-TR')}</Text>
              </View>
              <View style={styles.earningsCardStat}>
                <Text style={styles.earningsCardStatLabel}>Tamamlanan İş</Text>
                <Text style={styles.earningsCardStatValue}>{providerStats.completedJobs}</Text>
              </View>
              <View style={styles.earningsCardStat}>
                <Text style={styles.earningsCardStatLabel}>Yanıt Oranı</Text>
                <Text style={styles.earningsCardStatValue}>{providerStats.responseRate}%</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Overview */}
        <View style={styles.providerStatsRow}>
          <TouchableOpacity style={styles.providerStatCard}>
            <LinearGradient
              colors={['rgba(147, 51, 234, 0.2)', 'rgba(147, 51, 234, 0.1)']}
              style={styles.providerStatIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="document-text" size={20} color={colors.brand[400]} />
            </LinearGradient>
            <Text style={styles.providerStatNumber}>{providerStats.pendingOffers}</Text>
            <Text style={styles.providerStatLabel}>Yeni Teklif</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.providerStatCard}>
            <View style={[styles.providerStatIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
            <Text style={styles.providerStatNumber}>{providerStats.upcomingJobs}</Text>
            <Text style={styles.providerStatLabel}>Yaklaşan İş</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.providerStatCard}>
            <View style={[styles.providerStatIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="star" size={20} color={colors.warning} />
            </View>
            <Text style={styles.providerStatNumber}>{providerStats.rating}</Text>
            <Text style={styles.providerStatLabel}>Puan</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsScroll}
        >
          <TouchableOpacity style={styles.quickActionCard}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.quickActionCardIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add-circle" size={22} color="white" />
            </LinearGradient>
            <Text style={styles.quickActionCardText}>Teklif Gönder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionCardIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="calendar" size={22} color={colors.info} />
            </View>
            <Text style={styles.quickActionCardText}>Müsaitlik</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionCardIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="wallet" size={22} color={colors.success} />
            </View>
            <Text style={styles.quickActionCardText}>Kazançlar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionCardIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="briefcase" size={22} color={colors.warning} />
            </View>
            <Text style={styles.quickActionCardText}>Portföy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionCardIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="analytics" size={22} color={colors.error} />
            </View>
            <Text style={styles.quickActionCardText}>Raporlar</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Upcoming Jobs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Yaklaşan İşler</Text>
          <TouchableOpacity style={styles.sectionLink}>
            <Text style={styles.sectionLinkText}>Tümü</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.brand[400]} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.upcomingJobsScroll}
        >
          {upcomingJobs.map((job) => (
            <TouchableOpacity key={job.id} style={styles.upcomingJobCard} activeOpacity={0.8}>
              <Image source={{ uri: job.image }} style={styles.upcomingJobImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.upcomingJobGradient}
              />
              <View style={styles.upcomingJobDaysBadge}>
                <Ionicons name="time" size={10} color={colors.brand[400]} />
                <Text style={styles.upcomingJobDaysText}>{job.daysUntil} gün</Text>
              </View>
              <View style={styles.upcomingJobContent}>
                <Text style={styles.upcomingJobRole}>{job.role}</Text>
                <Text style={styles.upcomingJobTitle} numberOfLines={1}>{job.title}</Text>
                <View style={styles.upcomingJobMeta}>
                  <Ionicons name="calendar-outline" size={11} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.upcomingJobMetaText}>{job.date}</Text>
                </View>
                <Text style={styles.upcomingJobEarnings}>₺{job.earnings.toLocaleString('tr-TR')}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Requests */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Yeni Talepler</Text>
          <TouchableOpacity style={styles.sectionLink}>
            <Text style={styles.sectionLinkText}>Tümü</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.brand[400]} />
          </TouchableOpacity>
        </View>

        <View style={styles.requestsList}>
          {recentRequests.map((request) => (
            <TouchableOpacity key={request.id} style={styles.requestCard} activeOpacity={0.8}>
              <View style={styles.requestHeader}>
                {request.isNew && (
                  <View style={styles.requestBadge}>
                    <Text style={styles.requestBadgeText}>YENİ</Text>
                  </View>
                )}
                <Text style={styles.requestTime}>{request.timeAgo}</Text>
              </View>
              <Text style={styles.requestTitle}>{request.title}</Text>
              <Text style={styles.requestSubtitle}>{request.category}</Text>
              <View style={styles.requestDivider} />
              <View style={styles.requestDetails}>
                <View style={styles.requestDetailItem}>
                  <Ionicons name="person-outline" size={12} color={colors.zinc[500]} />
                  <Text style={styles.requestDetailText}>{request.organizer}</Text>
                </View>
                <View style={styles.requestDetailItem}>
                  <Ionicons name="location-outline" size={12} color={colors.zinc[500]} />
                  <Text style={styles.requestDetailText}>{request.location}</Text>
                </View>
              </View>
              <View style={styles.requestFooter}>
                <View style={styles.requestDateBadge}>
                  <Ionicons name="calendar" size={12} color={colors.brand[400]} />
                  <Text style={styles.requestDateText}>{request.date}</Text>
                </View>
                <Text style={styles.requestBudget}>{request.budget}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Performance Card */}
        <View style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <Ionicons name="trophy" size={20} color={colors.warning} />
            <Text style={styles.performanceTitle}>Performans Özeti</Text>
          </View>
          <View style={styles.performanceStats}>
            <View style={styles.performanceStatItem}>
              <View style={styles.performanceStatBar}>
                <View style={[styles.performanceStatFill, { width: '95%', backgroundColor: colors.success }]} />
              </View>
              <Text style={styles.performanceStatLabel}>Yanıt Oranı</Text>
              <Text style={styles.performanceStatValue}>95%</Text>
            </View>
            <View style={styles.performanceStatItem}>
              <View style={styles.performanceStatBar}>
                <View style={[styles.performanceStatFill, { width: '88%', backgroundColor: colors.brand[500] }]} />
              </View>
              <Text style={styles.performanceStatLabel}>Tamamlama</Text>
              <Text style={styles.performanceStatValue}>88%</Text>
            </View>
            <View style={styles.performanceStatItem}>
              <View style={styles.performanceStatBar}>
                <View style={[styles.performanceStatFill, { width: '98%', backgroundColor: colors.warning }]} />
              </View>
              <Text style={styles.performanceStatLabel}>Memnuniyet</Text>
              <Text style={styles.performanceStatValue}>98%</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
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
    paddingBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.zinc[500],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
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
