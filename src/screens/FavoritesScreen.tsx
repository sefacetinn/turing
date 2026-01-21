import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { OptimizedImage } from '../components/OptimizedImage';
import { useAuth } from '../context/AuthContext';
import { useFavorites, toggleFavorite } from '../hooks';

const colors = defaultColors;

type TabType = 'artists' | 'providers';

export function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('artists');
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fetch favorites from Firebase
  const { favorites, loading: favoritesLoading } = useFavorites(user?.uid);

  // Filter favorites by type
  const favoriteArtists = useMemo(() =>
    favorites.filter(f => f.type === 'artist'),
    [favorites]
  );

  const favoriteProviders = useMemo(() =>
    favorites.filter(f => f.type === 'provider'),
    [favorites]
  );

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    // useFavorites uses onSnapshot so data updates automatically
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  // Handle removing a favorite
  const handleRemoveFavorite = async (type: 'artist' | 'provider', itemId: string, itemName: string, itemImage?: string) => {
    if (!user) return;

    setRemovingId(itemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await toggleFavorite(user.uid, type, itemId, itemName, itemImage);
    } catch (error) {
      console.warn('Error removing favorite:', error);
      Alert.alert('Hata', 'Favori kaldırılırken bir hata oluştu');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Geri"
          accessibilityHint="Önceki ekrana dön"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} accessibilityRole="header">Favorilerim</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer} accessibilityRole="tablist">
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
            },
            activeTab === 'artists' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('artists')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'artists' }}
          accessibilityLabel={`Sanatçılar, ${favoriteArtists.length} favori`}
        >
          <Ionicons
            name={activeTab === 'artists' ? 'musical-notes' : 'musical-notes-outline'}
            size={14}
            color={activeTab === 'artists' ? colors.brand[400] : colors.textMuted}
          />
          <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === 'artists' && { color: colors.brand[400] }]}>
            Sanatçılar ({favoriteArtists.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
            },
            activeTab === 'providers' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('providers')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'providers' }}
          accessibilityLabel={`Sağlayıcılar, ${favoriteProviders.length} favori`}
        >
          <Ionicons
            name={activeTab === 'providers' ? 'briefcase' : 'briefcase-outline'}
            size={14}
            color={activeTab === 'providers' ? colors.brand[400] : colors.textMuted}
          />
          <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === 'providers' && { color: colors.brand[400] }]}>
            Sağlayıcılar ({favoriteProviders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {favoritesLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.brand[400]} />
          <Text style={{ color: colors.textMuted, marginTop: 12 }}>Favoriler yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand[400]}
            />
          }
        >
          {activeTab === 'artists' ? (
            <View style={styles.artistsGrid}>
              {favoriteArtists.map((artist) => (
                <TouchableOpacity
                  key={artist.id}
                  style={[
                    styles.artistCard,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
                      ...(isDark ? {} : helpers.getShadow('sm')),
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('ArtistDetail', { artistId: artist.itemId })}
                >
                  <View style={styles.artistImageContainer}>
                    <OptimizedImage
                      source={artist.itemImage || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'}
                      style={styles.artistImage}
                    />
                    <TouchableOpacity
                      style={[styles.favoriteButton, removingId === artist.itemId && { opacity: 0.5 }]}
                      onPress={() => handleRemoveFavorite('artist', artist.itemId, artist.itemName, artist.itemImage)}
                      disabled={removingId === artist.itemId}
                    >
                      {removingId === artist.itemId ? (
                        <ActivityIndicator size="small" color={colors.error} />
                      ) : (
                        <Ionicons name="heart" size={18} color={colors.error} />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.artistInfo}>
                    <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>{artist.itemName}</Text>
                    <Text style={[styles.artistGenre, { color: colors.textMuted }]} numberOfLines={1}>Sanatçı</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.providersList}>
              {favoriteProviders.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={[
                    styles.providerCard,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
                      ...(isDark ? {} : helpers.getShadow('sm')),
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('BookingProviderProfile', { providerId: provider.itemId })}
                >
                  <View style={styles.providerImageContainer}>
                    <OptimizedImage
                      source={provider.itemImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400'}
                      style={styles.providerImage}
                    />
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={[styles.providerName, { color: colors.text }]}>{provider.itemName}</Text>
                    <View style={styles.providerMeta}>
                      <Text style={[styles.providerCategory, { color: colors.brand[400] }]}>Hizmet Sağlayıcı</Text>
                    </View>
                  </View>
                  <View style={styles.providerRight}>
                    <TouchableOpacity
                      style={[styles.heartButton, removingId === provider.itemId && { opacity: 0.5 }]}
                      onPress={() => handleRemoveFavorite('provider', provider.itemId, provider.itemName, provider.itemImage)}
                      disabled={removingId === provider.itemId}
                    >
                      {removingId === provider.itemId ? (
                        <ActivityIndicator size="small" color={colors.error} />
                      ) : (
                        <Ionicons name="heart" size={18} color={colors.error} />
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Empty State */}
          {((activeTab === 'artists' && favoriteArtists.length === 0) ||
            (activeTab === 'providers' && favoriteProviders.length === 0)) && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }]}>
                <Ionicons name="heart-outline" size={48} color={colors.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Henüz favori yok</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Beğendiğiniz {activeTab === 'artists' ? 'sanatçıları' : 'sağlayıcıları'} favorilerinize ekleyin
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.getParent()?.navigate('HomeTab')}
              >
                <LinearGradient
                  colors={gradients.primary}
                  style={styles.exploreButtonGradient}
                >
                  <Text style={styles.exploreButtonText}>Keşfet</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabActive: {
    backgroundColor: 'rgba(75, 48, 184, 0.1)',
    borderColor: 'rgba(75, 48, 184, 0.3)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabTextActive: {
    // color now applied dynamically
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  artistsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 8,
  },
  artistCard: {
    width: '47.5%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  artistImageContainer: {
    position: 'relative',
  },
  artistImage: {
    width: '100%',
    height: 140,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistInfo: {
    padding: 12,
  },
  artistName: {
    fontSize: 14,
    fontWeight: '600',
  },
  artistGenre: {
    fontSize: 11,
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
  },
  providersList: {
    gap: 10,
    paddingTop: 8,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  providerImageContainer: {
    position: 'relative',
  },
  providerImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  providerCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  providerDot: {
    fontSize: 10,
  },
  providerLocation: {
    fontSize: 11,
  },
  providerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  heartButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  exploreButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  exploreButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  exploreButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
