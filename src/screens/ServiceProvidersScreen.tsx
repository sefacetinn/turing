import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';

interface Provider {
  id: string;
  name: string;
  rating: number;
  description: string;
  city: string;
  teamSize: string;
  image: string;
  previouslyWorked: boolean;
}

// Category configurations
const categoryConfig: Record<string, { title: string; gradient: readonly [string, string, ...string[]]; icon: string }> = {
  booking: { title: 'Booking', gradient: ['#9333ea', '#7c3aed'], icon: 'musical-notes' },
  technical: { title: 'Teknik', gradient: ['#059669', '#34d399'], icon: 'volume-high' },
  transport: { title: 'Ulaşım', gradient: ['#dc2626', '#f87171'], icon: 'car' },
  venue: { title: 'Mekan', gradient: ['#2563eb', '#60a5fa'], icon: 'business' },
  accommodation: { title: 'Konaklama', gradient: ['#db2777', '#f472b6'], icon: 'bed' },
  operation: { title: 'Operasyon', gradient: ['#d97706', '#fbbf24'], icon: 'settings' },
  flight: { title: 'Uçak', gradient: ['#475569', '#94a3b8'], icon: 'airplane' },
  // Operation sub-categories (all orange)
  security: { title: 'Güvenlik', gradient: ['#d97706', '#fbbf24'], icon: 'shield' },
  catering: { title: 'Catering', gradient: ['#d97706', '#fbbf24'], icon: 'restaurant' },
  generator: { title: 'Jeneratör', gradient: ['#d97706', '#fbbf24'], icon: 'flash' },
  beverage: { title: 'İçecek', gradient: ['#d97706', '#fbbf24'], icon: 'cafe' },
  medical: { title: 'Medikal', gradient: ['#d97706', '#fbbf24'], icon: 'medkit' },
  sanitation: { title: 'Sanitasyon', gradient: ['#d97706', '#fbbf24'], icon: 'trash' },
  media: { title: 'Medya', gradient: ['#d97706', '#fbbf24'], icon: 'camera' },
  barrier: { title: 'Bariyer', gradient: ['#d97706', '#fbbf24'], icon: 'remove' },
  tent: { title: 'Çadır', gradient: ['#d97706', '#fbbf24'], icon: 'home' },
  ticketing: { title: 'Ticketing', gradient: ['#d97706', '#fbbf24'], icon: 'ticket' },
  decoration: { title: 'Dekorasyon', gradient: ['#d97706', '#fbbf24'], icon: 'color-palette' },
  production: { title: 'Prodüksiyon', gradient: ['#d97706', '#fbbf24'], icon: 'film' },
};

// Mock providers by category
const getProvidersByCategory = (category: string): Provider[] => {
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory === 'booking') {
    return [
      { id: 'b1', name: 'Duman', rating: 4.9, description: 'Rock müzik grubu', city: 'İstanbul', teamSize: '5 kişilik grup', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', previouslyWorked: true },
      { id: 'b2', name: 'Mabel Matiz', rating: 4.8, description: 'Alternatif pop sanatçısı', city: 'İstanbul', teamSize: 'Solo sanatçı', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', previouslyWorked: false },
      { id: 'b3', name: 'DJ Burak Yeter', rating: 4.7, description: 'EDM / House DJ', city: 'Ankara', teamSize: 'Solo DJ', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400', previouslyWorked: true },
      { id: 'b4', name: 'Sezen Aksu', rating: 5.0, description: 'Pop / Türk Sanat müziği', city: 'İstanbul', teamSize: 'Solo sanatçı + orkestra', image: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=400', previouslyWorked: false },
    ];
  }

  if (normalizedCategory === 'technical') {
    return [
      { id: 't1', name: 'Pro Sound Istanbul', rating: 4.9, description: 'Profesyonel ses sistemleri', city: 'İstanbul', teamSize: '12 kişilik ekip', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400', previouslyWorked: true },
      { id: 't2', name: 'LightShow Pro', rating: 4.7, description: 'Sahne ışık sistemleri', city: 'İzmir', teamSize: '8 kişilik ekip', image: 'https://images.unsplash.com/photo-1504501650895-2441b7915699?w=400', previouslyWorked: false },
      { id: 't3', name: 'Stage Tech', rating: 4.6, description: 'Sahne kurulum ve teknik destek', city: 'Ankara', teamSize: '15 kişilik ekip', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400', previouslyWorked: true },
      { id: 't4', name: 'Audio Masters', rating: 4.8, description: 'Stüdyo ve canlı ses mühendisliği', city: 'İstanbul', teamSize: '6 kişilik ekip', image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400', previouslyWorked: false },
    ];
  }

  if (normalizedCategory === 'transport') {
    return [
      { id: 'tr1', name: 'Elite VIP Transfer', rating: 4.8, description: 'Lüks VIP transfer hizmetleri', city: 'İstanbul', teamSize: '20 araçlık filo', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400', previouslyWorked: true },
      { id: 'tr2', name: 'Star Limousine', rating: 4.6, description: 'Limuzin ve özel araç kiralama', city: 'Ankara', teamSize: '15 araçlık filo', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400', previouslyWorked: false },
      { id: 'tr3', name: 'Comfort Fleet', rating: 4.5, description: 'Grup transferleri ve minibüs', city: 'İzmir', teamSize: '30 araçlık filo', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400', previouslyWorked: false },
    ];
  }

  if (normalizedCategory === 'venue') {
    return [
      { id: 'v1', name: 'KüçükÇiftlik Park', rating: 4.9, description: 'Açık hava konser alanı', city: 'İstanbul', teamSize: '15.000 kişi kapasiteli', image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400', previouslyWorked: true },
      { id: 'v2', name: 'Volkswagen Arena', rating: 4.8, description: 'Kapalı konser salonu', city: 'İstanbul', teamSize: '5.000 kişi kapasiteli', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400', previouslyWorked: false },
      { id: 'v3', name: 'Congresium', rating: 4.7, description: 'Kongre ve etkinlik merkezi', city: 'Ankara', teamSize: '3.000 kişi kapasiteli', image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400', previouslyWorked: false },
    ];
  }

  if (normalizedCategory === 'accommodation') {
    return [
      { id: 'a1', name: 'Grand Hyatt', rating: 4.9, description: '5 yıldızlı lüks otel', city: 'İstanbul', teamSize: '400 oda kapasiteli', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', previouslyWorked: true },
      { id: 'a2', name: 'Swissotel', rating: 4.8, description: '5 yıldızlı business otel', city: 'İstanbul', teamSize: '600 oda kapasiteli', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', previouslyWorked: false },
      { id: 'a3', name: 'JW Marriott', rating: 4.7, description: '5 yıldızlı otel', city: 'Ankara', teamSize: '350 oda kapasiteli', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', previouslyWorked: false },
    ];
  }

  if (normalizedCategory === 'flight') {
    return [
      { id: 'f1', name: 'Jet Aviation', rating: 4.9, description: 'Özel jet kiralama', city: 'İstanbul', teamSize: '12 uçaklık filo', image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400', previouslyWorked: false },
      { id: 'f2', name: 'Sky Charter', rating: 4.7, description: 'Charter uçuş hizmetleri', city: 'Ankara', teamSize: '8 uçaklık filo', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400', previouslyWorked: false },
      { id: 'f3', name: 'Heli Turkey', rating: 4.6, description: 'Helikopter kiralama', city: 'İstanbul', teamSize: '6 helikopterlik filo', image: 'https://images.unsplash.com/photo-1534321238895-da3ab632df3e?w=400', previouslyWorked: true },
    ];
  }

  // Default: Operation and sub-categories
  return [
    { id: 'o1', name: 'SecurePro Güvenlik', rating: 4.8, description: 'Profesyonel etkinlik güvenliği', city: 'İstanbul', teamSize: '50 kişilik ekip', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400', previouslyWorked: true },
    { id: 'o2', name: 'Lezzet Catering', rating: 4.7, description: 'Premium yemek ve ikram', city: 'İstanbul', teamSize: '30 kişilik ekip', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400', previouslyWorked: false },
    { id: 'o3', name: 'Power Gen', rating: 4.6, description: 'Jeneratör ve enerji çözümleri', city: 'Ankara', teamSize: '20 jeneratörlük filo', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', previouslyWorked: true },
    { id: 'o4', name: 'Clean Event', rating: 4.5, description: 'Etkinlik temizlik ve sanitasyon', city: 'İzmir', teamSize: '25 kişilik ekip', image: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=400', previouslyWorked: false },
  ];
};

const cities = ['Tümü', 'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa'];

export function ServiceProvidersScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { category } = (route.params as { category: string }) || { category: 'booking' };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Tümü');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);

  const config = categoryConfig[category] || categoryConfig.booking;
  const allProviders = getProvidersByCategory(category);

  const filteredProviders = useMemo(() => {
    return allProviders.filter(provider => {
      const matchesSearch = provider.name.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR')) ||
        provider.description.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR'));
      const matchesCity = selectedCity === 'Tümü' || provider.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [allProviders, searchQuery, selectedCity]);

  const toggleProviderSelection = (providerId: string) => {
    setSelectedProviders(prev =>
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleProviderDetail = (provider: Provider) => {
    navigation.navigate('ProviderDetail', { providerId: provider.id });
  };

  const handleRequestOffer = (provider: Provider) => {
    navigation.navigate('CategoryRequest', {
      category: category,
      provider: {
        id: provider.id,
        name: provider.name,
        rating: provider.rating,
        image: provider.image,
      }
    });
  };

  const handleBulkOfferRequest = () => {
    navigation.navigate('CategoryRequest', {
      category: category,
      bulkProviders: selectedProviders.map(id => {
        const p = allProviders.find((pr: Provider) => pr.id === id);
        return p ? { id: p.id, name: p.name, rating: p.rating, image: p.image } : null;
      }).filter(Boolean)
    });
    setSelectionMode(false);
    setSelectedProviders([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <LinearGradient
            colors={config.gradient}
            style={styles.headerIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={config.icon as any} size={16} color="white" />
          </LinearGradient>
          <Text style={styles.headerTitle}>{config.title}</Text>
        </View>
        <TouchableOpacity
          style={[styles.selectionButton, selectionMode && styles.selectionButtonActive]}
          onPress={() => setSelectionMode(!selectionMode)}
        >
          <Ionicons name={selectionMode ? 'close' : 'checkbox-outline'} size={20} color={selectionMode ? colors.brand[400] : colors.zinc[400]} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color={colors.zinc[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Hizmet sağlayıcı ara..."
            placeholderTextColor={colors.zinc[500]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.zinc[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* City Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cityFilters}
      >
        {cities.map(city => (
          <TouchableOpacity
            key={city}
            style={[styles.cityChip, selectedCity === city && styles.cityChipActive]}
            onPress={() => setSelectedCity(city)}
          >
            <Text style={[styles.cityChipText, selectedCity === city && styles.cityChipTextActive]}>
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={styles.resultsCountText}>
          {filteredProviders.length} sağlayıcı bulundu
        </Text>
        {selectionMode && selectedProviders.length > 0 && (
          <Text style={styles.selectedCountText}>
            {selectedProviders.length} seçildi
          </Text>
        )}
      </View>

      {/* Provider List */}
      <ScrollView style={styles.providerList} showsVerticalScrollIndicator={false}>
        {filteredProviders.map(provider => (
          <TouchableOpacity
            key={provider.id}
            style={[
              styles.providerCard,
              selectionMode && selectedProviders.includes(provider.id) && styles.providerCardSelected
            ]}
            activeOpacity={0.8}
            onPress={() => selectionMode ? toggleProviderSelection(provider.id) : handleProviderDetail(provider)}
          >
            {/* Selection Checkbox */}
            {selectionMode && (
              <View style={styles.checkboxContainer}>
                <View style={[styles.checkbox, selectedProviders.includes(provider.id) && styles.checkboxChecked]}>
                  {selectedProviders.includes(provider.id) && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
              </View>
            )}

            {/* Provider Content */}
            <View style={styles.providerContent}>
              {/* Top: Image + Info */}
              <View style={styles.providerTop}>
                <Image source={{ uri: provider.image }} style={styles.providerImage} />
                <View style={styles.providerInfo}>
                  <View style={styles.providerHeader}>
                    <Text style={styles.providerName} numberOfLines={1}>{provider.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#fbbf24" />
                      <Text style={styles.ratingText}>{provider.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.providerDescription} numberOfLines={2}>
                    {provider.description}
                  </Text>
                  <View style={styles.providerMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="location" size={12} color={colors.zinc[500]} />
                      <Text style={styles.metaText}>{provider.city}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="people" size={12} color={colors.zinc[500]} />
                      <Text style={styles.metaText}>{provider.teamSize}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Bottom: Badges + Actions */}
              <View style={styles.providerBottom}>
                {provider.previouslyWorked && (
                  <View style={styles.workedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={styles.workedBadgeText}>Daha önce çalıştık</Text>
                  </View>
                )}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.offerButton}
                    onPress={() => handleRequestOffer(provider)}
                  >
                    <LinearGradient
                      colors={gradients.primary}
                      style={styles.offerButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.offerButtonText}>Teklif Al</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => handleProviderDetail(provider)}
                  >
                    <Text style={styles.detailButtonText}>Detay</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: selectionMode && selectedProviders.length > 0 ? 100 : 24 }} />
      </ScrollView>

      {/* Bulk Offer Button */}
      {selectionMode && selectedProviders.length > 0 && (
        <View style={styles.bulkOfferContainer}>
          <TouchableOpacity style={styles.bulkOfferButton} onPress={handleBulkOfferRequest}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.bulkOfferGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.bulkOfferText}>
                {selectedProviders.length} Sağlayıcıya Teklif Gönder
              </Text>
              <Ionicons name="paper-plane" size={18} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  selectionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  selectionButtonActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  cityFilters: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
  },
  cityChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 6,
  },
  cityChipActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  cityChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.zinc[500],
  },
  cityChipTextActive: {
    color: colors.brand[400],
    fontWeight: '500',
  },
  resultsCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCountText: {
    fontSize: 13,
    color: colors.zinc[500],
  },
  selectedCountText: {
    fontSize: 13,
    color: colors.brand[400],
    fontWeight: '500',
  },
  providerList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  providerCardSelected: {
    borderColor: colors.brand[400],
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
  },
  checkboxContainer: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.04)',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.zinc[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.brand[500],
    borderColor: colors.brand[500],
  },
  providerContent: {
    flex: 1,
    padding: 14,
  },
  providerTop: {
    flexDirection: 'row',
    gap: 12,
  },
  providerImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  providerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },
  providerDescription: {
    fontSize: 12,
    color: colors.zinc[400],
    marginTop: 4,
    lineHeight: 16,
  },
  providerMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  providerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  workedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  workedBadgeText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  offerButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  offerButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  offerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  detailButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  detailButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.zinc[300],
  },
  bulkOfferContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  bulkOfferButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  bulkOfferGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  bulkOfferText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
