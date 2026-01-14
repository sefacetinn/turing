import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { getProviderDetail } from '../data/providerDetailData';

const { width } = Dimensions.get('window');

export function ProviderDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { providerId } = (route.params as { providerId: string }) || { providerId: 't1' };
  const { colors, isDark, helpers } = useTheme();

  const provider = getProviderDetail(providerId);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCall = () => {
    Alert.alert(
      'Ara',
      `${provider.name} ile iletişime geçmek istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Ara',
          onPress: () => Linking.openURL(`tel:${provider.phone}`),
        },
      ]
    );
  };

  const handleMessage = () => {
    navigation.navigate('Chat', {
      providerId: provider.id,
      providerName: provider.name,
      providerImage: provider.image,
    });
  };

  const handleRequestOffer = () => {
    navigation.navigate('CategoryRequest', {
      category: provider.category,
      provider: {
        id: provider.id,
        name: provider.name,
        rating: provider.rating,
        image: provider.image,
      }
    });
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${provider.email}`);
  };

  const handleWebsite = () => {
    Linking.openURL(`https://${provider.website}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header - Floating */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)']}
            style={styles.headerButtonBg}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)']}
              style={styles.headerButtonBg}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? colors.error : 'white'}
              />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)']}
              style={styles.headerButtonBg}
            >
              <Ionicons name="share-outline" size={22} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: provider.coverImage }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)', colors.background]}
            style={styles.heroGradient}
          />
          {/* Provider Badge on Hero */}
          <View style={styles.heroBadge}>
            <Image source={{ uri: provider.image }} style={[styles.heroAvatar, { borderColor: colors.background }]} />
            {provider.verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.brand[500], borderColor: colors.background }]}>
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
            )}
          </View>
        </View>

        {/* Provider Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
          </View>
          <Text style={[styles.subcategory, { color: colors.textMuted }]}>{provider.subcategory}</Text>

          <View style={styles.quickInfo}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={[styles.ratingValue, { color: colors.text }]}>{provider.rating}</Text>
              <Text style={[styles.ratingCount, { color: colors.textSecondary }]}>({provider.reviewCount} değerlendirme)</Text>
            </View>
            <View style={styles.locationBadge}>
              <Ionicons name="location" size={14} color={colors.textMuted} />
              <Text style={[styles.locationText, { color: colors.textMuted }]}>{provider.location}</Text>
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.priceContainer}>
            <LinearGradient
              colors={['rgba(147, 51, 234, 0.15)', 'rgba(147, 51, 234, 0.05)']}
              style={styles.priceGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="pricetag" size={18} color={colors.brand[400]} />
              <Text style={[styles.priceText, { color: colors.text }]}>{provider.priceRange}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar" size={20} color={colors.brand[400]} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{provider.completedEvents}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Etkinlik</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time" size={20} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.success }]}>{provider.responseTime}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Yanıt Süresi</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-up" size={20} color={colors.brand[400]} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{provider.yearsExperience} Yıl</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Deneyim</Text>
          </View>
        </View>

        {/* Highlights */}
        <View style={styles.highlightsSection}>
          {provider.highlights.map((highlight, index) => (
            <View key={index} style={[styles.highlightItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
              <LinearGradient
                colors={['rgba(147, 51, 234, 0.2)', 'rgba(147, 51, 234, 0.05)']}
                style={styles.highlightIconBg}
              >
                <Ionicons name={highlight.icon as any} size={18} color={colors.brand[400]} />
              </LinearGradient>
              <View style={styles.highlightText}>
                <Text style={[styles.highlightValue, { color: colors.text }]}>{highlight.value}</Text>
                <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>{highlight.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hakkında</Text>
          <Text style={[styles.aboutText, { color: colors.textMuted }]}>{provider.aboutLong}</Text>
        </View>

        {/* Specialties */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Uzmanlık Alanları</Text>
          <View style={styles.tagsContainer}>
            {provider.specialties.map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={[styles.specialtyText, { color: colors.brand[400] }]}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hizmetler</Text>
          <View style={styles.servicesGrid}>
            {provider.services.map((service, index) => (
              <View key={index} style={[styles.serviceItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={[styles.serviceText, { color: colors.text }]}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Artists - Only for booking agencies */}
        {provider.artists && provider.artists.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Sanatçı Kadrosu</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.brand[400] }]}>Tümünü Gör ({provider.artists.length})</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.artistsGrid}>
              {provider.artists.map((artist) => (
                <TouchableOpacity key={artist.id} style={[styles.artistCard, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
                  <Image source={{ uri: artist.image }} style={styles.artistImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.artistGradient}
                  />
                  <View style={styles.artistInfo}>
                    <Text style={styles.artistName}>{artist.name}</Text>
                    <Text style={styles.artistGenre}>{artist.genre}</Text>
                    <View style={styles.artistMeta}>
                      <View style={styles.artistRating}>
                        <Ionicons name="star" size={10} color="#fbbf24" />
                        <Text style={styles.artistRatingText}>{artist.rating}</Text>
                      </View>
                      <Text style={[styles.artistPrice, { color: colors.brand[300] }]}>{artist.priceRange}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Portfolio */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Portfolyo</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: colors.brand[400] }]}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioScroll}>
            {provider.portfolio.map((image, index) => (
              <TouchableOpacity key={index} style={styles.portfolioItem}>
                <Image source={{ uri: image }} style={styles.portfolioImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İletişim</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity style={[styles.contactItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }, ...(isDark ? [] : [helpers.getShadow('sm')])]} onPress={handleCall}>
              <View style={[styles.contactIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="call" size={18} color={colors.success} />
              </View>
              <View style={styles.contactText}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Telefon</Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>{provider.phone}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }, ...(isDark ? [] : [helpers.getShadow('sm')])]} onPress={handleEmail}>
              <View style={[styles.contactIconBg, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <Ionicons name="mail" size={18} color={colors.brand[400]} />
              </View>
              <View style={styles.contactText}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>E-posta</Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>{provider.email}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }, ...(isDark ? [] : [helpers.getShadow('sm')])]} onPress={handleWebsite}>
              <View style={[styles.contactIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="globe" size={18} color="#3b82f6" />
              </View>
              <View style={styles.contactText}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Website</Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>{provider.website}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Değerlendirmeler</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: colors.brand[400] }]}>Tümü ({provider.reviewCount})</Text>
            </TouchableOpacity>
          </View>

          {provider.reviews.map((review) => (
            <View key={review.id} style={[styles.reviewCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={[styles.reviewAvatarText, { color: colors.brand[400] }]}>{review.avatar}</Text>
                </View>
                <View style={styles.reviewInfo}>
                  <Text style={[styles.reviewerName, { color: colors.text }]}>{review.name}</Text>
                  <View style={styles.reviewMeta}>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? 'star' : 'star-outline'}
                          size={12}
                          color="#fbbf24"
                        />
                      ))}
                    </View>
                    <View style={styles.eventTypeBadge}>
                      <Text style={[styles.eventTypeText, { color: colors.brand[400] }]}>{review.eventType}</Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>{review.date}</Text>
              </View>
              <Text style={[styles.reviewText, { color: colors.textMuted }]}>{review.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.98)' : colors.cardBackground, borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('lg')])]}>
        <View style={styles.bottomLeft}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]} onPress={handleMessage}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.brand[400]} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]} onPress={handleCall}>
            <Ionicons name="call-outline" size={22} color={colors.success} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.requestBtn} onPress={handleRequestOffer}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.requestBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.requestBtnText}>Teklif İste</Text>
            <Ionicons name="paper-plane" size={18} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerButton: {
    marginRight: 8,
  },
  headerButtonBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  heroContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  heroBadge: {
    position: 'absolute',
    bottom: -40,
    left: 20,
  },
  heroAvatar: {
    width: 90,
    height: 90,
    borderRadius: 24,
    borderWidth: 4,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  providerName: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subcategory: {
    fontSize: 15,
    marginTop: 4,
  },
  quickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 13,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
  },
  priceContainer: {
    marginTop: 16,
  },
  priceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  priceText: {
    fontSize: 17,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  highlightsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 10,
  },
  highlightItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
  },
  highlightIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: {
    flex: 1,
  },
  highlightValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  highlightLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  specialtyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  servicesGrid: {
    gap: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
  },
  serviceText: {
    fontSize: 14,
  },
  artistsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  artistCard: {
    width: (width - 52) / 2,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  artistImage: {
    width: '100%',
    height: '100%',
  },
  artistGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  artistInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  artistName: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  artistGenre: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  artistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  artistRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  artistRatingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fbbf24',
  },
  artistPrice: {
    fontSize: 10,
    fontWeight: '600',
  },
  portfolioScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  portfolioItem: {
    marginRight: 12,
  },
  portfolioImage: {
    width: 160,
    height: 120,
    borderRadius: 14,
  },
  contactGrid: {
    gap: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
  },
  contactIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  reviewCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 6,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 11,
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 21,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    backgroundColor: 'rgba(9, 9, 11, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  bottomLeft: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  requestBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  requestBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
