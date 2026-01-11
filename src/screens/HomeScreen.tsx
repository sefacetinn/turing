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
            <TouchableOpacity key={category.id} style={styles.categoryCard} activeOpacity={0.8}>
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
        <TouchableOpacity style={styles.operationCard} activeOpacity={0.8}>
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

        {/* Stats Overview */}
        <View style={styles.providerStatsRow}>
          <View style={styles.providerStatCard}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.providerStatIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="document-text" size={20} color="white" />
            </LinearGradient>
            <Text style={styles.providerStatNumber}>12</Text>
            <Text style={styles.providerStatLabel}>Bekleyen Teklif</Text>
          </View>
          <View style={styles.providerStatCard}>
            <View style={[styles.providerStatIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
            <Text style={styles.providerStatNumber}>8</Text>
            <Text style={styles.providerStatLabel}>Aktif İş</Text>
          </View>
          <View style={styles.providerStatCard}>
            <View style={[styles.providerStatIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Ionicons name="star" size={20} color={colors.warning} />
            </View>
            <Text style={styles.providerStatNumber}>4.9</Text>
            <Text style={styles.providerStatLabel}>Puan</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        </View>

        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
              <Ionicons name="add-circle" size={24} color={colors.brand[400]} />
            </View>
            <Text style={styles.quickActionText}>Teklif Gönder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="calendar" size={24} color={colors.info} />
            </View>
            <Text style={styles.quickActionText}>Takvim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="wallet" size={24} color={colors.success} />
            </View>
            <Text style={styles.quickActionText}>Kazançlar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="analytics" size={24} color={colors.warning} />
            </View>
            <Text style={styles.quickActionText}>İstatistikler</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Requests */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Son Talepler</Text>
          <TouchableOpacity style={styles.sectionLink}>
            <Text style={styles.sectionLinkText}>Tümü</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.brand[400]} />
          </TouchableOpacity>
        </View>

        <View style={styles.requestsList}>
          {[1, 2, 3].map((item) => (
            <TouchableOpacity key={item} style={styles.requestCard} activeOpacity={0.8}>
              <View style={styles.requestHeader}>
                <View style={styles.requestBadge}>
                  <Text style={styles.requestBadgeText}>YENİ</Text>
                </View>
                <Text style={styles.requestTime}>2 saat önce</Text>
              </View>
              <Text style={styles.requestTitle}>Yaz Festivali 2024</Text>
              <Text style={styles.requestSubtitle}>Teknik Ekipman Talebi</Text>
              <View style={styles.requestFooter}>
                <View style={styles.requestLocation}>
                  <Ionicons name="location" size={12} color={colors.zinc[500]} />
                  <Text style={styles.requestLocationText}>İstanbul, Kadıköy</Text>
                </View>
                <Text style={styles.requestDate}>15 Temmuz 2024</Text>
              </View>
            </TouchableOpacity>
          ))}
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
});
