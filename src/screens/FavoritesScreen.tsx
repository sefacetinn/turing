import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';

// Mock favorites data
const favoriteArtists = [
  { id: '1', name: 'Mabel Matiz', genre: 'Alternatif Pop', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', rating: 4.9 },
  { id: '2', name: 'Duman', genre: 'Rock', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400', rating: 4.9 },
];

const favoriteProviders = [
  { id: '1', name: 'Pro Sound Istanbul', category: 'Teknik', rating: 4.9, reviews: 128, location: 'İstanbul', verified: true, image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200&h=200&fit=crop' },
  { id: '2', name: 'Elite Transfer', category: 'Ulaşım', rating: 4.8, reviews: 89, location: 'İstanbul', verified: true, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=200&fit=crop' },
  { id: '3', name: 'LightShow Pro', category: 'Teknik', rating: 4.7, reviews: 156, location: 'İstanbul', verified: true, image: 'https://images.unsplash.com/photo-1504501650895-2441b7915699?w=400' },
];

type TabType = 'artists' | 'providers';

export function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabType>('artists');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorilerim</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'artists' && styles.tabActive]}
          onPress={() => setActiveTab('artists')}
        >
          <Ionicons
            name={activeTab === 'artists' ? 'musical-notes' : 'musical-notes-outline'}
            size={14}
            color={activeTab === 'artists' ? colors.brand[400] : colors.zinc[500]}
          />
          <Text style={[styles.tabText, activeTab === 'artists' && styles.tabTextActive]}>
            Sanatçılar ({favoriteArtists.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'providers' && styles.tabActive]}
          onPress={() => setActiveTab('providers')}
        >
          <Ionicons
            name={activeTab === 'providers' ? 'briefcase' : 'briefcase-outline'}
            size={14}
            color={activeTab === 'providers' ? colors.brand[400] : colors.zinc[500]}
          />
          <Text style={[styles.tabText, activeTab === 'providers' && styles.tabTextActive]}>
            Sağlayıcılar ({favoriteProviders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'artists' ? (
          <View style={styles.artistsGrid}>
            {favoriteArtists.map((artist) => (
              <TouchableOpacity
                key={artist.id}
                style={styles.artistCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ArtistDetail', { artistId: artist.id })}
              >
                <View style={styles.artistImageContainer}>
                  <Image source={{ uri: artist.image }} style={styles.artistImage} />
                  <TouchableOpacity style={styles.favoriteButton}>
                    <Ionicons name="heart" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
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
          </View>
        ) : (
          <View style={styles.providersList}>
            {favoriteProviders.map((provider) => (
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
                <View style={styles.providerRight}>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#fbbf24" />
                    <Text style={styles.ratingText}>{provider.rating}</Text>
                  </View>
                  <TouchableOpacity style={styles.heartButton}>
                    <Ionicons name="heart" size={18} color={colors.error} />
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
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={48} color={colors.zinc[600]} />
            </View>
            <Text style={styles.emptyTitle}>Henüz favori yok</Text>
            <Text style={styles.emptyText}>
              Beğendiğiniz sanatçı ve sağlayıcıları favorilerinize ekleyin
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('HomeTab')}
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

        <View style={{ height: 32 }} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
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
    color: colors.text,
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
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  tabActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.zinc[500],
  },
  tabTextActive: {
    color: colors.brand[400],
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
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
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
  providersList: {
    gap: 10,
    paddingTop: 8,
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
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
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
    color: colors.text,
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
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.zinc[500],
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
