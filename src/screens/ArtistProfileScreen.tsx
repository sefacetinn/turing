import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { OptimizedImage } from '../components/OptimizedImage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { gradients } from '../theme/colors';
import { useArtist, useFavorites, toggleFavorite } from '../hooks';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 60;

type RouteParams = {
  ArtistProfile: { artistId: string };
};

export function ArtistProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'ArtistProfile'>>();
  const { colors, isDark } = useTheme();
  const { artistId } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Fetch artist from Firebase
  const { artist, loading: artistLoading } = useArtist(artistId);
  const { isFavorite } = useFavorites(user?.uid);

  const [refreshing, setRefreshing] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const isArtistFavorite = artist ? isFavorite('artist', artist.id) : false;

  const handleToggleFavorite = async () => {
    if (!user || !artist) return;
    setFavoriteLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await toggleFavorite(
        user.uid,
        'artist',
        artist.id,
        artist.stageName || artist.name,
        artist.image
      );
    } catch (error) {
      console.warn('Error toggling favorite:', error);
    }
    setFavoriteLoading(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (artistLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={colors.brand[400]} />
          <Text style={[styles.errorText, { color: colors.textMuted, marginTop: 16 }]}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!artist) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorText, { color: colors.text }]}>Sanatçı bulunamadı</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.errorLink, { color: colors.brand[400] }]}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleRequestQuote = () => {
    navigation.navigate('CategoryRequest', {
      category: 'booking',
      provider: {
        id: artist.ownerId,
        name: artist.stageName || artist.name,
        artistId: artist.id,
        artistName: artist.stageName || artist.name,
      },
    });
  };

  const handleContactAgency = () => {
    navigation.navigate('Chat', {
      providerId: artist.ownerId,
      providerName: artist.stageName || artist.name,
      providerImage: artist.image,
    });
  };

  const openSocialMedia = (platform: string, handle?: string) => {
    if (!handle) return;
    let url = '';
    switch (platform) {
      case 'instagram':
        url = `https://instagram.com/${handle.replace('@', '')}`;
        break;
      case 'spotify':
        url = `https://open.spotify.com/artist/${handle}`;
        break;
      case 'youtube':
        url = `https://youtube.com/@${handle}`;
        break;
    }
    if (url) Linking.openURL(url);
  };

  const getAvailabilityInfo = () => {
    switch (artist.availability) {
      case 'available':
        return { label: 'Müsait', color: '#10B981' };
      case 'limited':
        return { label: 'Sınırlı', color: '#f59e0b' };
      case 'busy':
        return { label: 'Meşgul', color: '#ef4444' };
      default:
        return { label: 'Bilinmiyor', color: colors.textMuted };
    }
  };

  const availabilityInfo = getAvailabilityInfo();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
            colors={[colors.brand[500]]}
          />
        }
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <OptimizedImage
            source={artist.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'}
            style={styles.coverImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.coverGradient}
          />

          {/* Back Button */}
          <SafeAreaView style={styles.headerOverlay} edges={['top']}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.headerActionButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
                onPress={handleToggleFavorite}
                disabled={favoriteLoading}
              >
                <Ionicons
                  name={isArtistFavorite ? "heart" : "heart-outline"}
                  size={22}
                  color={isArtistFavorite ? '#ef4444' : 'white'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.headerActionButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                <Ionicons name="share-outline" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Profile Info on Cover */}
          <View style={styles.profileOverlay}>
            <OptimizedImage
              source={artist.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.artistName}>{artist.stageName || artist.name}</Text>
              <Text style={styles.artistGenre}>{(artist.genre || []).join(' • ')}</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={styles.ratingText}>{artist.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({artist.reviewCount} değerlendirme)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Price Range */}
          <View style={[styles.priceCard, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.08)' }]}>
            <View style={styles.priceInfo}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Fiyat Aralığı</Text>
              <Text style={[styles.priceValue, { color: colors.brand[400] }]}>
                {artist.priceRange || 'Fiyat bilgisi yok'}
              </Text>
            </View>
            <View style={[styles.availabilityBadge, { backgroundColor: `${availabilityInfo.color}20` }]}>
              <View style={[styles.availabilityDot, { backgroundColor: availabilityInfo.color }]} />
              <Text style={[styles.availabilityText, { color: availabilityInfo.color }]}>
                {availabilityInfo.label}
              </Text>
            </View>
          </View>

          {/* Stats Grid */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İstatistikler</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#fbbf2420' }]}>
                <Ionicons name="star" size={20} color="#fbbf24" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{artist.rating.toFixed(1)}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Puan</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#8b5cf620' }]}>
                <Ionicons name="chatbubbles" size={20} color="#8b5cf6" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{artist.reviewCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Değerlendirme</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="mic" size={20} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{artist.totalShows}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Toplam Gösteri</Text>
            </View>
          </View>

          {/* Bio */}
          {artist.bio && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Hakkında</Text>
              <View style={[styles.bioCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                <Text style={[styles.bioText, { color: colors.textSecondary }]}>{artist.bio}</Text>
              </View>
            </>
          )}

          {/* Social Media */}
          {(artist.socialMedia?.instagram || artist.socialMedia?.spotify || artist.socialMedia?.youtube) && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Sosyal Medya</Text>
              <View style={styles.socialGrid}>
                {artist.socialMedia?.instagram && (
                  <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: '#E4405F20' }]}
                    onPress={() => openSocialMedia('instagram', artist.socialMedia?.instagram)}
                  >
                    <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                    <Text style={[styles.socialText, { color: '#E4405F' }]}>Instagram</Text>
                  </TouchableOpacity>
                )}
                {artist.socialMedia?.spotify && (
                  <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: '#1DB95420' }]}
                    onPress={() => openSocialMedia('spotify', artist.socialMedia?.spotify)}
                  >
                    <Ionicons name="musical-notes" size={24} color="#1DB954" />
                    <Text style={[styles.socialText, { color: '#1DB954' }]}>Spotify</Text>
                  </TouchableOpacity>
                )}
                {artist.socialMedia?.youtube && (
                  <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: '#FF000020' }]}
                    onPress={() => openSocialMedia('youtube', artist.socialMedia?.youtube)}
                  >
                    <Ionicons name="logo-youtube" size={24} color="#FF0000" />
                    <Text style={[styles.socialText, { color: '#FF0000' }]}>YouTube</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Spacer for bottom button */}
          <View style={{ height: insets.bottom + TAB_BAR_HEIGHT + 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border, paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 16 }]}>
        <TouchableOpacity
          style={[styles.contactButton, { borderColor: colors.brand[400] }]}
          onPress={handleContactAgency}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.brand[400]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.requestButton} onPress={handleRequestQuote}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.requestButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.requestButtonText}>Teklif İste</Text>
            <Ionicons name="paper-plane" size={18} color="white" />
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorLink: {
    fontSize: 16,
    fontWeight: '500',
  },
  coverContainer: {
    height: 300,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  artistGenre: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  reviewCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  content: {
    padding: 20,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  priceInfo: {},
  priceLabel: {
    fontSize: 13,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  bioCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  contactButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  requestButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
