import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { OptimizedImage } from '../components/OptimizedImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const colors = defaultColors;

// Local artists data
const artists = [
  { id: '1', name: 'Mabel Matiz', genre: 'Alternatif Pop', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', rating: 4.9, reviews: 234, verified: true, price: '₺150.000 - ₺250.000', bio: 'Türk alternatif pop müziğinin öncü isimlerinden.', followers: '2.4M', events: 156, tags: ['Pop', 'Alternatif', 'Rock'] },
  { id: '2', name: 'DJ Burak Yeter', genre: 'EDM / House', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400', rating: 4.8, reviews: 189, verified: true, price: '₺80.000 - ₺150.000', bio: 'Uluslararası arenada tanınan Türk DJ.', followers: '1.8M', events: 320, tags: ['EDM', 'House', 'Club'] },
  { id: '3', name: 'Sezen Aksu', genre: 'Pop / Türk Sanat', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', rating: 5.0, reviews: 456, verified: true, price: '₺500.000+', bio: 'Türk pop müziğinin mihenk taşı.', followers: '5.2M', events: 890, tags: ['Pop', 'Türk Sanat', 'Legend'] },
  { id: '4', name: 'Duman', genre: 'Rock', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400', rating: 4.9, reviews: 312, verified: true, price: '₺200.000 - ₺350.000', bio: 'Türk rock müziğinin en sevilen gruplarından.', followers: '3.1M', events: 245, tags: ['Rock', 'Alternatif', 'Band'] },
];

const { width } = Dimensions.get('window');
const SCROLL_THRESHOLD = 220;

export function ArtistDetailScreen() {
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const route = useRoute();
  const { artistId } = (route.params as { artistId: string }) || { artistId: '1' };

  const artist = artists.find(a => a.id === artistId) || artists[0];
  const { colors, isDark, helpers } = useTheme();
  const insets = useSafeAreaInsets();
  const [isFavorite, setIsFavorite] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Animated scroll
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated header background style
  const headerBgStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD - 50, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Animated header title style
  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD - 30, SCROLL_THRESHOLD + 20],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD - 30, SCROLL_THRESHOLD + 20],
      [10, 0],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  });

  const reviews = [
    { id: '1', user: 'Event Masters', rating: 5, comment: 'Muhteşem performans, profesyonel ekip!', date: '15 Haziran 2024' },
    { id: '2', user: 'Party Pro', rating: 5, comment: 'Etkinliğimizi unutulmaz kıldı.', date: '2 Mayıs 2024' },
    { id: '3', user: 'Istanbul Events', rating: 4, comment: 'Çok başarılı bir gece oldu.', date: '18 Nisan 2024' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Header Background */}
      <Animated.View style={[styles.animatedHeaderBg, { paddingTop: insets.top }, headerBgStyle]}>
        <BlurView intensity={isDark ? 60 : 80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.7)' : 'rgba(255, 255, 255, 0.8)' }]} />
      </Animated.View>

      {/* Floating Header */}
      <View style={[styles.headerActions, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Animated Title */}
        <Animated.Text
          style={[styles.animatedHeaderTitle, { color: colors.text }, headerTitleStyle]}
          numberOfLines={1}
        >
          {artist.name}
        </Animated.Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsFavorite(!isFavorite);
            }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? colors.error : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
            colors={[colors.brand[500]]}
          />
        }
      >
        {/* Header Image */}
        <View style={styles.headerImage}>
          <OptimizedImage source={artist.image} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', isDark ? 'rgba(9,9,11,0.9)' : 'rgba(255,255,255,0.9)', colors.background]}
            style={styles.imageGradient}
          />
        </View>

        <View style={styles.content}>
        {/* Artist Info */}
        <View style={styles.artistInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.artistName, { color: colors.text }]}>{artist.name}</Text>
            {artist.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.brand[400]} />
              </View>
            )}
          </View>
          <Text style={[styles.artistGenre, { color: colors.textMuted }]}>{artist.genre}</Text>

          {/* Stats Row */}
          <View style={[styles.statsRow, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }]}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={[styles.statValue, { color: colors.text }]}>{artist.rating}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>({artist.reviews})</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border }]} />
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color={colors.zinc[400]} />
              <Text style={[styles.statValue, { color: colors.text }]}>{artist.followers}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>takipçi</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border }]} />
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={16} color={colors.zinc[400]} />
              <Text style={[styles.statValue, { color: colors.text }]}>{artist.events}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>etkinlik</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {(artist.tags || []).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={[styles.tagText, { color: colors.brand[400] }]}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Bio */}
          <Text style={[styles.bioTitle, { color: colors.text }]}>Hakkında</Text>
          <Text style={[styles.bioText, { color: colors.textMuted }]}>{artist.bio}</Text>

          {/* Price */}
          <View style={[styles.priceCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]}>
            <View style={styles.priceLeft}>
              <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Fiyat Aralığı</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>{artist.price}</Text>
            </View>
            <TouchableOpacity style={styles.priceButton}>
              <Text style={[styles.priceButtonText, { color: colors.brand[400] }]}>Teklif İste</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Değerlendirmeler</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProviderReviews', {
                providerId: artist.id,
                providerName: artist.name,
                reviews: reviews.map(r => ({
                  id: r.id,
                  name: r.user,
                  avatar: r.user.substring(0, 2).toUpperCase(),
                  rating: r.rating,
                  date: r.date,
                  text: r.comment,
                  eventType: 'Etkinlik',
                })),
                rating: artist.rating,
                reviewCount: artist.reviews,
              })}
            >
              <Text style={[styles.seeAllText, { color: colors.brand[400] }]}>Tümü ({artist.reviews})</Text>
            </TouchableOpacity>
          </View>

          {reviews.map((review) => (
            <View key={review.id} style={[styles.reviewCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }]}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewUser}>
                  <View style={styles.reviewAvatar}>
                    <Text style={[styles.reviewAvatarText, { color: colors.brand[400] }]}>{review.user[0]}</Text>
                  </View>
                  <View>
                    <Text style={[styles.reviewUserName, { color: colors.text }]}>{review.user}</Text>
                    <Text style={[styles.reviewDate, { color: colors.textMuted }]}>{review.date}</Text>
                  </View>
                </View>
                <View style={styles.reviewRating}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < review.rating ? "star" : "star-outline"}
                      size={14}
                      color="#fbbf24"
                    />
                  ))}
                </View>
              </View>
              <Text style={[styles.reviewComment, { color: colors.textMuted }]}>{review.comment}</Text>
            </View>
          ))}
        </View>

        {/* Similar Artists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Benzer Sanatçılar</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: colors.brand[400] }]}>Tümü</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(artists || []).filter(a => a.id !== artist.id).slice(0, 3).map((similarArtist) => (
              <TouchableOpacity key={similarArtist.id} style={styles.similarCard}>
                <OptimizedImage source={similarArtist.image} style={styles.similarImage} />
                <Text style={[styles.similarName, { color: colors.text }]} numberOfLines={1}>{similarArtist.name}</Text>
                <Text style={[styles.similarGenre, { color: colors.textMuted }]} numberOfLines={1}>{similarArtist.genre}</Text>
                <View style={styles.similarRating}>
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Text style={[styles.similarRatingText, { color: colors.text }]}>{similarArtist.rating}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : colors.surface, borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
        <TouchableOpacity style={[styles.messageButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.cardBackground }]}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.bookButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.bookButtonText}>Rezervasyon Yap</Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedHeaderBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 99,
    overflow: 'hidden',
  },
  animatedHeaderTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  headerImage: {
    height: 320,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  content: {
    marginTop: -60,
  },
  artistInfo: {
    paddingHorizontal: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  verifiedBadge: {},
  artistGenre: {
    fontSize: 15,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  priceLeft: {},
  priceLabel: {
    fontSize: 12,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  priceButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
    borderRadius: 10,
  },
  priceButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 13,
  },
  reviewCard: {
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(75, 48, 184, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 11,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 20,
  },
  similarCard: {
    width: 130,
    marginRight: 12,
  },
  similarImage: {
    width: 130,
    height: 130,
    borderRadius: 14,
    marginBottom: 8,
  },
  similarName: {
    fontSize: 14,
    fontWeight: '500',
  },
  similarGenre: {
    fontSize: 12,
    marginTop: 2,
  },
  similarRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  similarRatingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  messageButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
