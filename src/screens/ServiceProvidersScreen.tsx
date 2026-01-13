import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const colors = defaultColors;

interface Filters {
  city: string | null;
  minRating: number | null;
  budgetRange: string | null;
}

const cities = ['İstanbul', 'Ankara', 'İzmir'];
const ratingOptions = [4.5, 4.0, 3.5];
const budgetRanges = [
  { id: 'low', label: '₺0 - ₺50.000', min: 0, max: 50000 },
  { id: 'mid', label: '₺50.000 - ₺150.000', min: 50000, max: 150000 },
  { id: 'high', label: '₺150.000+', min: 150000, max: Infinity },
];

interface Provider {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  description: string;
  city: string;
  teamSize: string;
  image: string;
  previouslyWorked: boolean;
  phone: string;
  verified: boolean;
  yearsExperience: number;
  completedEvents: number;
  priceRange: string;
  responseTime: string;
  specialties: string[];
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
      { id: 'b1', name: 'Atlantis Yapım', rating: 4.9, reviewCount: 342, description: 'Türkiye\'nin önde gelen sanatçı yönetim ve booking ajansı. Athena, Melike Şahin, Pinhani gibi sanatçıların temsilcisi.', city: 'İstanbul', teamSize: '15+ Sanatçı', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', previouslyWorked: true, phone: '+905321234567', verified: true, yearsExperience: 22, completedEvents: 850, priceRange: '₺50K - ₺500K', responseTime: '1 saat', specialties: ['Rock', 'Pop', 'Alternatif', 'Festival'] },
      { id: 'b2', name: 'Poll Production', rating: 4.8, reviewCount: 287, description: 'Uluslararası sanatçı booking ve prodüksiyon. Tarkan, Sıla, Murat Boz temsilcisi.', city: 'İstanbul', teamSize: '20+ Sanatçı', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', previouslyWorked: true, phone: '+905321234568', verified: true, yearsExperience: 28, completedEvents: 1200, priceRange: '₺100K - ₺1M', responseTime: '2 saat', specialties: ['Pop', 'Türk Pop', 'Gala', 'Kurumsal'] },
      { id: 'b3', name: 'BKM Organizasyon', rating: 4.9, reviewCount: 456, description: 'Komedi ve stand-up booking. Cem Yılmaz, Ata Demirer, Yılmaz Erdoğan prodüksiyonları.', city: 'İstanbul', teamSize: '30+ Sanatçı', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400', previouslyWorked: false, phone: '+905321234569', verified: true, yearsExperience: 35, completedEvents: 2500, priceRange: '₺80K - ₺800K', responseTime: '3 saat', specialties: ['Stand-up', 'Komedi', 'Tiyatro', 'Sinema'] },
      { id: 'b4', name: 'Pozitif Live', rating: 4.7, reviewCount: 198, description: 'Alternatif ve indie müzik odaklı booking ajansı. Duman, Model, Manga temsilcisi.', city: 'İstanbul', teamSize: '12+ Sanatçı', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400', previouslyWorked: false, phone: '+905321234570', verified: true, yearsExperience: 18, completedEvents: 620, priceRange: '₺60K - ₺400K', responseTime: '1 saat', specialties: ['Rock', 'Alternatif', 'Indie', 'Festival'] },
      { id: 'b5', name: 'DMC Turkey', rating: 4.8, reviewCount: 167, description: 'Uluslararası DJ ve elektronik müzik booking. DJ\'ler ve prodüktörler için Türkiye temsilcisi.', city: 'İstanbul', teamSize: '25+ DJ', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400', previouslyWorked: true, phone: '+905321234571', verified: true, yearsExperience: 15, completedEvents: 480, priceRange: '₺30K - ₺300K', responseTime: '30 dk', specialties: ['EDM', 'House', 'Techno', 'Club'] },
      { id: 'b6', name: 'Türk Sanat Müziği Ajansı', rating: 4.6, reviewCount: 134, description: 'Geleneksel Türk müziği ve sanat müziği sanatçıları. Muazzez Ersoy, Ferdi Tayfur temsilcisi.', city: 'Ankara', teamSize: '18+ Sanatçı', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400', previouslyWorked: false, phone: '+905321234572', verified: true, yearsExperience: 32, completedEvents: 920, priceRange: '₺40K - ₺250K', responseTime: '2 saat', specialties: ['TSM', 'Arabesk', 'Nostalji', 'Gala'] },
    ];
  }

  if (normalizedCategory === 'technical') {
    return [
      { id: 't1', name: 'Pro Sound Istanbul', rating: 4.9, reviewCount: 128, description: 'Türkiye\'nin lider ses sistemi sağlayıcısı. Line array ve festival sistemleri.', city: 'İstanbul', teamSize: '12 kişilik ekip', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400', previouslyWorked: true, phone: '+905331234567', verified: true, yearsExperience: 18, completedEvents: 450, priceRange: '₺50K - ₺150K', responseTime: '1 saat', specialties: ['Line Array', 'Festival', 'Kurumsal'] },
      { id: 't2', name: 'LightShow Pro', rating: 4.7, reviewCount: 98, description: 'Yaratıcı sahne aydınlatması ve görsel efektler.', city: 'İzmir', teamSize: '8 kişilik ekip', image: 'https://images.unsplash.com/photo-1504501650895-2441b7915699?w=400', previouslyWorked: false, phone: '+905331234568', verified: true, yearsExperience: 10, completedEvents: 280, priceRange: '₺30K - ₺100K', responseTime: '2 saat', specialties: ['LED', 'Lazer', 'Moving Head'] },
      { id: 't3', name: 'Stage Tech', rating: 4.6, reviewCount: 156, description: 'Komple sahne kurulum ve teknik prodüksiyon.', city: 'Ankara', teamSize: '15 kişilik ekip', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400', previouslyWorked: true, phone: '+905331234569', verified: true, yearsExperience: 14, completedEvents: 380, priceRange: '₺40K - ₺120K', responseTime: '1 saat', specialties: ['Sahne', 'Rigging', 'Backline'] },
      { id: 't4', name: 'Audio Masters', rating: 4.8, reviewCount: 87, description: 'Stüdyo kalitesinde canlı ses mühendisliği.', city: 'İstanbul', teamSize: '6 kişilik ekip', image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400', previouslyWorked: false, phone: '+905331234570', verified: true, yearsExperience: 12, completedEvents: 320, priceRange: '₺25K - ₺80K', responseTime: '45 dk', specialties: ['FOH', 'Monitor', 'Broadcast'] },
    ];
  }

  if (normalizedCategory === 'transport') {
    return [
      { id: 'tr1', name: 'Elite VIP Transfer', rating: 4.8, reviewCount: 89, description: 'Premium VIP transfer ve lüks araç filosu.', city: 'İstanbul', teamSize: '20 araçlık filo', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400', previouslyWorked: true, phone: '+905341234567', verified: true, yearsExperience: 12, completedEvents: 890, priceRange: '₺5K - ₺25K', responseTime: '30 dk', specialties: ['VIP', 'Havalimanı', 'Kurumsal'] },
      { id: 'tr2', name: 'Star Limousine', rating: 4.6, reviewCount: 67, description: 'Özel limuzin ve protokol araçları.', city: 'Ankara', teamSize: '15 araçlık filo', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400', previouslyWorked: false, phone: '+905341234568', verified: true, yearsExperience: 8, completedEvents: 450, priceRange: '₺3K - ₺15K', responseTime: '1 saat', specialties: ['Limuzin', 'Düğün', 'Protokol'] },
      { id: 'tr3', name: 'Comfort Fleet', rating: 4.5, reviewCount: 112, description: 'Grup transferleri ve şehirlerarası ulaşım.', city: 'İzmir', teamSize: '30 araçlık filo', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400', previouslyWorked: false, phone: '+905341234569', verified: true, yearsExperience: 15, completedEvents: 680, priceRange: '₺2K - ₺10K', responseTime: '45 dk', specialties: ['Grup', 'Tur', 'Festival'] },
    ];
  }

  if (normalizedCategory === 'venue') {
    return [
      { id: 'v1', name: 'KüçükÇiftlik Park', rating: 4.9, reviewCount: 312, description: 'İstanbul\'un ikonik açık hava konser mekanı.', city: 'İstanbul', teamSize: '15.000 kapasite', image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400', previouslyWorked: true, phone: '+905351234567', verified: true, yearsExperience: 20, completedEvents: 180, priceRange: '₺100K - ₺300K', responseTime: '3 saat', specialties: ['Konser', 'Festival', 'Açık Hava'] },
      { id: 'v2', name: 'Volkswagen Arena', rating: 4.8, reviewCount: 245, description: 'Modern kapalı arena ve kongre merkezi.', city: 'İstanbul', teamSize: '5.000 kapasite', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400', previouslyWorked: false, phone: '+905351234568', verified: true, yearsExperience: 10, completedEvents: 420, priceRange: '₺80K - ₺250K', responseTime: '2 saat', specialties: ['Arena', 'Kongre', 'Kapalı'] },
      { id: 'v3', name: 'Congresium', rating: 4.7, reviewCount: 178, description: 'Ankara\'nın en büyük kongre ve etkinlik merkezi.', city: 'Ankara', teamSize: '3.000 kapasite', image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400', previouslyWorked: false, phone: '+905351234569', verified: true, yearsExperience: 15, completedEvents: 350, priceRange: '₺60K - ₺180K', responseTime: '2 saat', specialties: ['Kongre', 'Kurumsal', 'Fuar'] },
    ];
  }

  if (normalizedCategory === 'accommodation') {
    return [
      { id: 'a1', name: 'Grand Hyatt', rating: 4.9, reviewCount: 420, description: 'Ultra lüks konaklama ve MICE hizmetleri.', city: 'İstanbul', teamSize: '400 oda', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', previouslyWorked: true, phone: '+905361234567', verified: true, yearsExperience: 25, completedEvents: 560, priceRange: '₺2K - ₺10K/gece', responseTime: '1 saat', specialties: ['MICE', 'Gala', 'VIP'] },
      { id: 'a2', name: 'Swissotel', rating: 4.8, reviewCount: 380, description: 'Business ve etkinlik odaklı 5 yıldızlı otel.', city: 'İstanbul', teamSize: '600 oda', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', previouslyWorked: false, phone: '+905361234568', verified: true, yearsExperience: 20, completedEvents: 480, priceRange: '₺1.5K - ₺8K/gece', responseTime: '1 saat', specialties: ['Business', 'Toplantı', 'Balo'] },
      { id: 'a3', name: 'JW Marriott', rating: 4.7, reviewCount: 290, description: 'Lüks konaklama ve kurumsal etkinlik çözümleri.', city: 'Ankara', teamSize: '350 oda', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', previouslyWorked: false, phone: '+905361234569', verified: true, yearsExperience: 12, completedEvents: 320, priceRange: '₺1.5K - ₺6K/gece', responseTime: '2 saat', specialties: ['Kurumsal', 'Düğün', 'Kokteyl'] },
    ];
  }

  if (normalizedCategory === 'flight') {
    return [
      { id: 'f1', name: 'Jet Aviation', rating: 4.9, reviewCount: 56, description: 'VIP jet kiralama ve özel uçuş hizmetleri.', city: 'İstanbul', teamSize: '12 uçak', image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400', previouslyWorked: false, phone: '+905371234567', verified: true, yearsExperience: 18, completedEvents: 890, priceRange: '₺50K - ₺200K', responseTime: '1 saat', specialties: ['Jet', 'VIP', 'Uluslararası'] },
      { id: 'f2', name: 'Sky Charter', rating: 4.7, reviewCount: 34, description: 'Charter uçuş ve grup seyahatleri.', city: 'Ankara', teamSize: '8 uçak', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400', previouslyWorked: false, phone: '+905371234568', verified: true, yearsExperience: 10, completedEvents: 450, priceRange: '₺30K - ₺120K', responseTime: '2 saat', specialties: ['Charter', 'Grup', 'Yurtiçi'] },
      { id: 'f3', name: 'Heli Turkey', rating: 4.6, reviewCount: 28, description: 'Helikopter kiralama ve hava taksi.', city: 'İstanbul', teamSize: '6 helikopter', image: 'https://images.unsplash.com/photo-1534321238895-da3ab632df3e?w=400', previouslyWorked: true, phone: '+905371234569', verified: true, yearsExperience: 8, completedEvents: 320, priceRange: '₺15K - ₺60K', responseTime: '30 dk', specialties: ['Helikopter', 'Transfer', 'Çekim'] },
    ];
  }

  // Default: Operation and sub-categories
  return [
    { id: 'o1', name: 'SecurePro Güvenlik', rating: 4.8, reviewCount: 156, description: 'Profesyonel etkinlik güvenliği ve kalabalık yönetimi.', city: 'İstanbul', teamSize: '50 kişilik ekip', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400', previouslyWorked: true, phone: '+905381234567', verified: true, yearsExperience: 15, completedEvents: 380, priceRange: '₺20K - ₺80K', responseTime: '2 saat', specialties: ['Güvenlik', 'VIP Koruma', 'Kalabalık'] },
    { id: 'o2', name: 'Lezzet Catering', rating: 4.7, reviewCount: 203, description: 'Premium catering ve gastronomi deneyimleri.', city: 'İstanbul', teamSize: '30 kişilik ekip', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400', previouslyWorked: false, phone: '+905381234568', verified: true, yearsExperience: 12, completedEvents: 520, priceRange: '₺30K - ₺150K', responseTime: '1 saat', specialties: ['Catering', 'Fine Dining', 'Kokteyl'] },
    { id: 'o3', name: 'Power Gen', rating: 4.6, reviewCount: 89, description: 'Mobil enerji çözümleri ve jeneratör hizmetleri.', city: 'Ankara', teamSize: '20 jeneratör', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', previouslyWorked: true, phone: '+905381234569', verified: true, yearsExperience: 18, completedEvents: 450, priceRange: '₺10K - ₺50K', responseTime: '1 saat', specialties: ['Jeneratör', 'Enerji', 'Açık Hava'] },
    { id: 'o4', name: 'Clean Event', rating: 4.5, reviewCount: 67, description: 'Etkinlik temizlik ve çevre düzenleme hizmetleri.', city: 'İzmir', teamSize: '25 kişilik ekip', image: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=400', previouslyWorked: false, phone: '+905381234570', verified: true, yearsExperience: 8, completedEvents: 280, priceRange: '₺8K - ₺35K', responseTime: '2 saat', specialties: ['Temizlik', 'Atık', 'Sanitasyon'] },
  ];
};

type FilterTab = 'all' | 'worked';

export function ServiceProvidersScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { colors, isDark, helpers } = useTheme();
  const { category } = (route.params as { category: string }) || { category: 'booking' };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    city: null,
    minRating: null,
    budgetRange: null,
  });

  const config = categoryConfig[category] || categoryConfig.booking;
  const allProviders = getProvidersByCategory(category);

  const activeFilterCount = [filters.city, filters.minRating, filters.budgetRange].filter(Boolean).length;

  const filteredProviders = useMemo(() => {
    let filtered = allProviders;

    // Tab filter
    if (activeTab === 'worked') {
      filtered = filtered.filter(p => p.previouslyWorked);
    }

    // City filter
    if (filters.city) {
      filtered = filtered.filter(p => p.city === filters.city);
    }

    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter(p => p.rating >= filters.minRating!);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(provider => {
        const matchesSearch = provider.name.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR')) ||
          provider.description.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR'));
        return matchesSearch;
      });
    }

    return filtered;
  }, [allProviders, searchQuery, activeTab, filters]);

  const workedCount = allProviders.filter(p => p.previouslyWorked).length;

  const clearFilters = () => {
    setFilters({ city: null, minRating: null, budgetRange: null });
  };

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

  const handleCall = (provider: Provider) => {
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

  const handleMessage = (provider: Provider) => {
    navigation.navigate('Chat', {
      providerId: provider.id,
      providerName: provider.name,
      providerImage: provider.image,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>{config.title}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground },
              activeFilterCount > 0 && styles.filterButtonActive,
              ...(isDark ? [] : [helpers.getShadow('sm')])
            ]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options-outline" size={18} color={activeFilterCount > 0 ? colors.brand[400] : colors.zinc[400]} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.selectionButton,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground },
              selectionMode && styles.selectionButtonActive,
              ...(isDark ? [] : [helpers.getShadow('sm')])
            ]}
            onPress={() => setSelectionMode(!selectionMode)}
          >
            <Ionicons name={selectionMode ? 'close' : 'checkbox-outline'} size={20} color={selectionMode ? colors.brand[400] : colors.zinc[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchInputContainer,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
          },
          ...(isDark ? [] : [helpers.getShadow('sm')])
        ]}>
          <Ionicons name="search" size={18} color={colors.zinc[500]} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
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

      {/* Minimal Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground },
            activeTab === 'all' && styles.tabButtonActive,
            ...(isDark ? [] : [helpers.getShadow('sm')])
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabButtonText, { color: activeTab === 'all' ? colors.brand[400] : colors.textMuted }]}>
            Tümü
          </Text>
        </TouchableOpacity>
        {workedCount > 0 && (
          <TouchableOpacity
            style={[
              styles.tabButton,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground },
              activeTab === 'worked' && styles.tabButtonActive,
              ...(isDark ? [] : [helpers.getShadow('sm')])
            ]}
            onPress={() => setActiveTab('worked')}
          >
            <Ionicons
              name="checkmark-circle"
              size={12}
              color={activeTab === 'worked' ? colors.success : colors.zinc[500]}
            />
            <Text style={[styles.tabButtonText, { color: activeTab === 'worked' ? colors.success : colors.textMuted }]}>
              Çalıştıklarım
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={[styles.resultsCountText, { color: colors.textMuted }]}>
          {filteredProviders.length} sağlayıcı bulundu
        </Text>
        {selectionMode && selectedProviders.length > 0 && (
          <Text style={[styles.selectedCountText, { color: colors.brand[400] }]}>
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
                <View style={[styles.checkbox, { borderColor: colors.textSecondary }, selectedProviders.includes(provider.id) && styles.checkboxChecked]}>
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
                <View style={styles.imageContainer}>
                  <Image source={{ uri: provider.image }} style={styles.providerImage} />
                  {provider.verified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark" size={10} color="white" />
                    </View>
                  )}
                </View>
                <View style={styles.providerInfo}>
                  <View style={styles.providerHeader}>
                    <View style={styles.nameContainer}>
                      <Text style={[styles.providerName, { color: colors.text }]} numberOfLines={1}>{provider.name}</Text>
                    </View>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#fbbf24" />
                      <Text style={styles.ratingText}>{provider.rating}</Text>
                      <Text style={[styles.reviewCountText, { color: colors.textMuted }]}>({provider.reviewCount})</Text>
                    </View>
                  </View>
                  <Text style={[styles.providerDescription, { color: colors.textMuted }]} numberOfLines={2}>
                    {provider.description}
                  </Text>
                  <View style={styles.providerMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="location" size={12} color={colors.zinc[500]} />
                      <Text style={[styles.metaText, { color: colors.textMuted }]}>{provider.city}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time" size={12} color={colors.success} />
                      <Text style={[styles.metaText, { color: colors.success }]}>{provider.responseTime}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Specialties Tags */}
              <View style={styles.specialtiesRow}>
                {provider.specialties.slice(0, 3).map((specialty, index) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={[styles.specialtyText, { color: colors.brand[400] }]}>{specialty}</Text>
                  </View>
                ))}
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{provider.yearsExperience} yıl</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Deneyim</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{provider.completedEvents}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Etkinlik</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text, fontSize: 11 }]}>{provider.priceRange}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Fiyat</Text>
                </View>
              </View>

              {/* Bottom: Actions + Badge */}
              <View style={styles.providerBottom}>
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
                    style={styles.iconButton}
                    onPress={() => handleCall(provider)}
                  >
                    <Ionicons name="call" size={16} color={colors.success} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleMessage(provider)}
                  >
                    <Ionicons name="chatbubble" size={16} color={colors.brand[400]} />
                  </TouchableOpacity>
                </View>
                {provider.previouslyWorked && (
                  <View style={styles.workedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={[styles.workedBadgeText, { color: colors.success }]}>Daha önce çalıştık</Text>
                  </View>
                )}
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

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filtreler</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={colors.zinc[400]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* City Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.textMuted }]}>Şehir</Text>
                <View style={styles.filterOptions}>
                  {cities.map(city => (
                    <TouchableOpacity
                      key={city}
                      style={[styles.filterChip, filters.city === city && styles.filterChipActive]}
                      onPress={() => setFilters(f => ({ ...f, city: f.city === city ? null : city }))}
                    >
                      <Text style={[styles.filterChipText, { color: filters.city === city ? colors.brand[400] : colors.textMuted }]}>
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Rating Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.textMuted }]}>Minimum Puan</Text>
                <View style={styles.filterOptions}>
                  {ratingOptions.map(rating => (
                    <TouchableOpacity
                      key={rating}
                      style={[styles.filterChip, filters.minRating === rating && styles.filterChipActive]}
                      onPress={() => setFilters(f => ({ ...f, minRating: f.minRating === rating ? null : rating }))}
                    >
                      <Ionicons name="star" size={12} color={filters.minRating === rating ? colors.brand[400] : '#fbbf24'} />
                      <Text style={[styles.filterChipText, { color: filters.minRating === rating ? colors.brand[400] : colors.textMuted }]}>
                        {rating}+
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Budget Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.textMuted }]}>Bütçe Aralığı</Text>
                <View style={styles.filterOptions}>
                  {budgetRanges.map(range => (
                    <TouchableOpacity
                      key={range.id}
                      style={[styles.filterChip, filters.budgetRange === range.id && styles.filterChipActive]}
                      onPress={() => setFilters(f => ({ ...f, budgetRange: f.budgetRange === range.id ? null : range.id }))}
                    >
                      <Text style={[styles.filterChipText, { color: filters.budgetRange === range.id ? colors.brand[400] : colors.textMuted }]}>
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={[styles.clearButtonText, { color: colors.textMuted }]}>Temizle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={() => setShowFilters(false)}>
                <LinearGradient
                  colors={gradients.primary}
                  style={styles.applyButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.applyButtonText}>Uygula</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: 'white',
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
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
  },
  tabButtonText: {
    fontSize: 12,
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
  },
  selectedCountText: {
    fontSize: 13,
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
  imageContainer: {
    position: 'relative',
  },
  providerImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  reviewCountText: {
    fontSize: 10,
    marginLeft: 2,
  },
  providerDescription: {
    fontSize: 12,
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
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  specialtyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 6,
  },
  specialtyText: {
    fontSize: 10,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 9,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderColor: colors.brand[400],
  },
  filterChipText: {
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
