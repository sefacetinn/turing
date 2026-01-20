import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { OptimizedImage } from '../components/OptimizedImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { gradients } from '../theme/colors';
import { useBookingProvider, useProviderArtists, useFavorites, toggleFavorite, FirestoreArtist } from '../hooks';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

type RouteParams = {
  BookingProviderProfile: { providerId: string };
};

export function BookingProviderProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'BookingProviderProfile'>>();
  const { colors, isDark } = useTheme();
  const { providerId } = route.params;
  const { user } = useAuth();

  // Fetch provider and their artists from Firebase
  const { provider, loading: providerLoading } = useBookingProvider(providerId);
  const { artists, loading: artistsLoading } = useProviderArtists(providerId);
  const { isFavorite } = useFavorites(user?.uid);

  const [refreshing, setRefreshing] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const isProviderFavorite = provider ? isFavorite('provider', provider.id) : false;

  const handleToggleFavorite = async () => {
    if (!user || !provider) return;
    setFavoriteLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await toggleFavorite(
        user.uid,
        'provider',
        provider.id,
        provider.companyName || provider.displayName,
        provider.photoURL
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
    setFavoriteLoading(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (providerLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={colors.brand[400]} />
          <Text style={[styles.errorText, { color: colors.textMuted, marginTop: 16 }]}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!provider) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="business-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorText, { color: colors.text }]}>Firma bulunamadı</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.errorLink, { color: colors.brand[400] }]}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleArtistPress = (artist: FirestoreArtist) => {
    navigation.navigate('ArtistProfile', { artistId: artist.id });
  };

  const handleContactProvider = () => {
    navigation.navigate('Chat', {
      providerId: provider.id,
      providerName: provider.companyName || provider.displayName,
      providerImage: provider.photoURL,
    });
  };

  const handleRequestQuoteForArtist = (artist: FirestoreArtist) => {
    navigation.navigate('CategoryRequest', {
      category: 'booking',
      provider: {
        id: provider.id,
        name: provider.companyName || provider.displayName,
        artistId: artist.id,
        artistName: artist.stageName || artist.name,
        image: artist.image,
      },
    });
  };

  const getAvailabilityInfo = (availability: string) => {
    switch (availability) {
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
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.08)' }]}>
          <LinearGradient
            colors={['transparent', isDark ? 'rgba(9, 9, 11, 0.9)' : 'rgba(255, 255, 255, 0.9)']}
            style={styles.headerGradient}
          />

          {/* Back Button */}
          <SafeAreaView style={styles.headerOverlay} edges={['top']}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? 'white' : colors.text} />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.headerActionButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}
                onPress={handleToggleFavorite}
                disabled={favoriteLoading}
              >
                <Ionicons
                  name={isProviderFavorite ? "heart" : "heart-outline"}
                  size={22}
                  color={isProviderFavorite ? '#ef4444' : (isDark ? 'white' : colors.text)}
                />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.headerActionButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}>
                <Ionicons name="share-outline" size={22} color={isDark ? 'white' : colors.text} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Company Info */}
          <View style={styles.companyInfo}>
            <View style={[styles.companyLogo, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)' }]}>
              {provider.photoURL ? (
                <OptimizedImage source={provider.photoURL} style={styles.companyLogoImage} />
              ) : (
                <Ionicons name="business" size={40} color={colors.brand[400]} />
              )}
            </View>
            <Text style={[styles.companyName, { color: colors.text }]}>
              {provider.companyName || provider.displayName}
            </Text>
            {provider.city && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.locationText, { color: colors.textMuted }]}>{provider.city}</Text>
              </View>
            )}
            <View style={styles.badgeRow}>
              {provider.isVerified && (
                <View style={[styles.verifiedBadge, { backgroundColor: '#10B98120' }]}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={[styles.badgeText, { color: '#10B981' }]}>Onaylı</Text>
                </View>
              )}
              <View style={[styles.ratingBadge, { backgroundColor: '#fbbf2420' }]}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={[styles.badgeText, { color: '#fbbf24' }]}>
                  {(provider.rating || 0).toFixed(1)} ({provider.reviewCount || 0})
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{artists.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sanatçı</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{provider.completedJobs || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Tamamlanan İş</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{(provider.rating || 0).toFixed(1)}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Puan</Text>
            </View>
          </View>

          {/* Bio */}
          {provider.bio && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Hakkında</Text>
              <View style={[styles.bioCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                <Text style={[styles.bioText, { color: colors.textSecondary }]}>{provider.bio}</Text>
              </View>
            </>
          )}

          {/* Artist Roster */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Sanatçı Kadrosu ({artists.length})
          </Text>

          {artistsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.brand[400]} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Sanatçılar yükleniyor...</Text>
            </View>
          ) : artists.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
              <Ionicons name="musical-notes-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Henüz sanatçı eklenmemiş</Text>
            </View>
          ) : (
            <View style={styles.artistsList}>
              {artists.map((artist) => {
                const availability = getAvailabilityInfo(artist.availability);
                return (
                  <TouchableOpacity
                    key={artist.id}
                    style={[styles.artistCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}
                    onPress={() => handleArtistPress(artist)}
                    activeOpacity={0.7}
                  >
                    <OptimizedImage
                      source={artist.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'}
                      style={styles.artistImage}
                    />
                    <View style={styles.artistInfo}>
                      <View style={styles.artistHeader}>
                        <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>
                          {artist.stageName || artist.name}
                        </Text>
                        <View style={[styles.availabilityBadge, { backgroundColor: `${availability.color}20` }]}>
                          <View style={[styles.availabilityDot, { backgroundColor: availability.color }]} />
                          <Text style={[styles.availabilityText, { color: availability.color }]}>
                            {availability.label}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.artistGenre, { color: colors.textMuted }]} numberOfLines={1}>
                        {(artist.genre || []).join(' • ')}
                      </Text>
                      <View style={styles.artistMeta}>
                        <View style={styles.ratingSmall}>
                          <Ionicons name="star" size={12} color="#fbbf24" />
                          <Text style={styles.ratingSmallText}>{artist.rating.toFixed(1)}</Text>
                        </View>
                        <Text style={[styles.artistPrice, { color: colors.brand[400] }]}>
                          {artist.priceRange || 'Fiyat bilgisi yok'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.requestArtistButton}
                      onPress={() => handleRequestQuoteForArtist(artist)}
                    >
                      <LinearGradient
                        colors={gradients.primary}
                        style={styles.requestArtistGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Ionicons name="paper-plane" size={16} color="white" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Spacer for bottom button */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
        <TouchableOpacity
          style={[styles.contactButton, { borderColor: colors.brand[400] }]}
          onPress={handleContactProvider}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.brand[400]} />
          <Text style={[styles.contactButtonText, { color: colors.brand[400] }]}>İletişim</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => {}}
        >
          <View style={[styles.callButtonInner, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
            <Ionicons name="call" size={20} color="#10B981" />
          </View>
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
  header: {
    paddingBottom: 24,
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  headerOverlay: {
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
  companyInfo: {
    alignItems: 'center',
    paddingTop: 16,
  },
  companyLogo: {
    width: 100,
    height: 100,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  companyLogoImage: {
    width: '100%',
    height: '100%',
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  statsRow: {
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
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  artistsList: {
    gap: 12,
  },
  artistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  artistImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  artistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  artistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  artistName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  artistGenre: {
    fontSize: 13,
    marginTop: 4,
  },
  artistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingSmallText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },
  artistPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestArtistButton: {
    marginLeft: 8,
  },
  requestArtistGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  callButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  callButtonInner: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
});
