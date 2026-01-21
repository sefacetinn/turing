import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Share,
  RefreshControl,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { OptimizedImage } from '../components/OptimizedImage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VenueParams {
  venueName: string;
  venueAddress?: string;
  venueCity: string;
  venueDistrict?: string;
  venueCapacity?: string;
  venueImage?: string;
  indoorOutdoor?: string;
  seatingType?: string;
}

export function VenueDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const params = route.params as VenueParams;
  const {
    venueName,
    venueAddress,
    venueCity,
    venueDistrict,
    venueCapacity,
    venueImage,
    indoorOutdoor,
    seatingType,
  } = params || {};

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `${venueName} - ${venueDistrict ? venueDistrict + ', ' : ''}${venueCity}`,
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  const handleDirections = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const address = venueAddress || `${venueName}, ${venueCity}`;
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Placeholder - would need actual venue phone
    Linking.openURL('tel:+905001234567');
  };

  const getIndoorOutdoorLabel = (type?: string) => {
    if (!type) return null;
    const labels: Record<string, string> = {
      indoor: 'Kapalı Alan',
      outdoor: 'Açık Alan',
      mixed: 'Karma',
    };
    return labels[type] || type;
  };

  const getSeatingTypeLabel = (type?: string) => {
    if (!type) return null;
    const labels: Record<string, string> = {
      standing: 'Ayakta',
      seated: 'Oturmalı',
      mixed: 'Karma',
    };
    return labels[type] || type;
  };

  // Placeholder venue images
  const venueImages = venueImage
    ? [venueImage]
    : [
        'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
      ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#09090B' : '#F8FAFC' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mekan Detayı</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand?.[500] || '#6366F1'}
          />
        }
      >
        {/* Hero Image */}
        <View style={styles.heroSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentImageIndex(index);
            }}
          >
            {venueImages.map((img, index) => (
              <OptimizedImage
                key={index}
                source={img}
                style={styles.heroImage}
              />
            ))}
          </ScrollView>
          {venueImages.length > 1 && (
            <View style={styles.imagePagination}>
              {venueImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    { backgroundColor: index === currentImageIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }
                  ]}
                />
              ))}
            </View>
          )}
          {/* Gradient overlay */}
          <View style={styles.heroGradient} />
        </View>

        {/* Venue Info Card */}
        <View style={[styles.venueInfoCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginTop: -40 }]}>
          <View style={styles.venueInfoHeader}>
            <View style={[styles.venueIconBadge, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.1)' }]}>
              <Ionicons name="location" size={24} color="#EC4899" />
            </View>
            <View style={styles.venueInfoText}>
              <Text style={[styles.venueName, { color: colors.text }]}>{venueName}</Text>
              <Text style={[styles.venueLocation, { color: colors.textSecondary }]}>
                {venueDistrict ? `${venueDistrict}, ` : ''}{venueCity}
              </Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={[styles.quickStats, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
            {venueCapacity && (
              <View style={styles.quickStatItem}>
                <View style={[styles.quickStatIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)' }]}>
                  <Ionicons name="people" size={18} color="#6366F1" />
                </View>
                <Text style={[styles.quickStatValue, { color: colors.text }]}>{venueCapacity}</Text>
                <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Kapasite</Text>
              </View>
            )}
            {indoorOutdoor && (
              <View style={styles.quickStatItem}>
                <View style={[styles.quickStatIcon, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)' }]}>
                  <Ionicons name={indoorOutdoor === 'outdoor' ? 'sunny' : 'home'} size={18} color="#10B981" />
                </View>
                <Text style={[styles.quickStatValue, { color: colors.text }]}>{getIndoorOutdoorLabel(indoorOutdoor)}</Text>
                <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Alan Tipi</Text>
              </View>
            )}
            {seatingType && (
              <View style={styles.quickStatItem}>
                <View style={[styles.quickStatIcon, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.06)' }]}>
                  <Ionicons name={seatingType === 'standing' ? 'walk' : 'grid'} size={18} color="#F59E0B" />
                </View>
                <Text style={[styles.quickStatValue, { color: colors.text }]}>{getSeatingTypeLabel(seatingType)}</Text>
                <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Düzen</Text>
              </View>
            )}
          </View>
        </View>

        {/* Address Section */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ADRES</Text>
          <View style={styles.addressContent}>
            <View style={[styles.addressIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)' }]}>
              <Ionicons name="navigate" size={20} color="#6366F1" />
            </View>
            <View style={styles.addressText}>
              <Text style={[styles.addressMain, { color: colors.text }]}>
                {venueAddress || venueName}
              </Text>
              <Text style={[styles.addressSub, { color: colors.textSecondary }]}>
                {venueDistrict ? `${venueDistrict}, ` : ''}{venueCity}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.directionsBtn, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.08)' }]}
            onPress={handleDirections}
          >
            <Ionicons name="navigate" size={18} color="#EC4899" />
            <Text style={styles.directionsBtnText}>Yol Tarifi Al</Text>
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ÖZELLİKLER</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)' }]}>
                <Ionicons name="musical-notes" size={20} color="#10B981" />
              </View>
              <Text style={[styles.featureLabel, { color: colors.text }]}>Ses Sistemi</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)' }]}>
                <Ionicons name="flashlight" size={20} color="#6366F1" />
              </View>
              <Text style={[styles.featureLabel, { color: colors.text }]}>Işık Sistemi</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.06)' }]}>
                <Ionicons name="car" size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.featureLabel, { color: colors.text }]}>Otopark</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.06)' }]}>
                <Ionicons name="cafe" size={20} color="#EC4899" />
              </View>
              <Text style={[styles.featureLabel, { color: colors.text }]}>Backstage</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.06)' }]}>
                <Ionicons name="wifi" size={20} color="#3B82F6" />
              </View>
              <Text style={[styles.featureLabel, { color: colors.text }]}>WiFi</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.06)' }]}>
                <Ionicons name="accessibility" size={20} color="#8B5CF6" />
              </View>
              <Text style={[styles.featureLabel, { color: colors.text }]}>Engelli Erişimi</Text>
            </View>
          </View>
        </View>

        {/* Map Preview */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>KONUM</Text>
          <TouchableOpacity
            style={[styles.mapPreview, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}
            onPress={handleDirections}
            activeOpacity={0.8}
          >
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={48} color={isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1'} />
              <Text style={[styles.mapPlaceholderText, { color: colors.textSecondary }]}>
                Haritada görmek için dokunun
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', paddingBottom: Math.max(insets.bottom, 20), borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
        <TouchableOpacity
          style={[styles.bottomActionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}
          onPress={handleCall}
        >
          <Ionicons name="call" size={20} color="#10B981" />
          <Text style={[styles.bottomActionText, { color: colors.text }]}>Ara</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomPrimaryBtn, { backgroundColor: '#EC4899' }]}
          onPress={handleDirections}
        >
          <Ionicons name="navigate" size={20} color="#FFFFFF" />
          <Text style={styles.bottomPrimaryText}>Yol Tarifi Al</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },

  content: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 250,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
  },
  imagePagination: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Venue Info Card
  venueInfoCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    zIndex: 1,
  },
  venueInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueInfoText: {
    flex: 1,
    marginLeft: 14,
  },
  venueName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  venueLocation: {
    fontSize: 14,
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 11,
  },

  // Section Card
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 16,
  },

  // Address
  addressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    flex: 1,
    marginLeft: 12,
  },
  addressMain: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  addressSub: {
    fontSize: 13,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  directionsBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EC4899',
  },

  // Features
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Map Preview
  mapPreview: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: 13,
    marginTop: 8,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  bottomActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  bottomActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  bottomPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  bottomPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
