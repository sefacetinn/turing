import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { gradients, darkTheme as defaultColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

// Default colors for static styles (dark theme)
const colors = defaultColors;

type TabType = 'active' | 'past';

// Service types matching the system
type ServiceCategory =
  | 'booking'
  | 'technical'
  | 'venue'
  | 'accommodation'
  | 'transport'
  | 'flight'
  | 'security'
  | 'catering'
  | 'generator'
  | 'beverage'
  | 'medical'
  | 'sanitation'
  | 'media'
  | 'barrier'
  | 'tent'
  | 'ticketing'
  | 'decoration';

interface ProviderEvent {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  location: string;
  organizerName: string;
  organizerImage: string;
  eventImage: string;
  serviceType: ServiceCategory;
  serviceLabel: string;
  status: 'planned' | 'active' | 'past';
  earnings: number;
  paidAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  daysUntil: number;
  teamSize: number;
  tasks: { total: number; completed: number };
}

// Mock provider events data - EventPro 360 (Full-Service Provider)
const providerEvents: ProviderEvent[] = [
  // TEKNİK - Ses Sistemi
  {
    id: 'pe1',
    eventTitle: 'Zeytinli Rock Festivali 2025',
    eventDate: '18-20 Temmuz 2025',
    eventTime: '14:00 - 04:00',
    venue: 'Zeytinli Açık Hava',
    location: 'Balıkesir, Edremit',
    organizerName: 'Pozitif Live',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    eventImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    serviceType: 'technical',
    serviceLabel: 'Ses Sistemi',
    status: 'active',
    earnings: 245000,
    paidAmount: 122500,
    paymentStatus: 'partial',
    daysUntil: 8,
    teamSize: 12,
    tasks: { total: 18, completed: 14 },
  },
  // GÜVENLİK
  {
    id: 'pe2',
    eventTitle: 'MegaFon Arena Konseri - Tarkan',
    eventDate: '25 Temmuz 2025',
    eventTime: '20:00 - 00:00',
    venue: 'Volkswagen Arena',
    location: 'İstanbul, Maslak',
    organizerName: 'BKM Organizasyon',
    organizerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    eventImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    serviceType: 'security',
    serviceLabel: 'Etkinlik Güvenliği',
    status: 'active',
    earnings: 185000,
    paidAmount: 185000,
    paymentStatus: 'paid',
    daysUntil: 15,
    teamSize: 45,
    tasks: { total: 12, completed: 10 },
  },
  // CATERING
  {
    id: 'pe3',
    eventTitle: 'Koç Holding Yıllık Toplantısı',
    eventDate: '5 Ağustos 2025',
    eventTime: '09:00 - 18:00',
    venue: 'Raffles Istanbul',
    location: 'İstanbul, Zorlu Center',
    organizerName: 'Koç Holding A.Ş.',
    organizerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    eventImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    serviceType: 'catering',
    serviceLabel: 'Premium Catering',
    status: 'planned',
    earnings: 320000,
    paidAmount: 160000,
    paymentStatus: 'partial',
    daysUntil: 25,
    teamSize: 28,
    tasks: { total: 15, completed: 8 },
  },
  // ULAŞIM - VIP Transfer
  {
    id: 'pe4',
    eventTitle: 'F1 Turkish Grand Prix VIP',
    eventDate: '14-16 Ağustos 2025',
    eventTime: '08:00 - 22:00',
    venue: 'Intercity Istanbul Park',
    location: 'İstanbul, Tuzla',
    organizerName: 'Intercity',
    organizerImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
    eventImage: 'https://images.unsplash.com/photo-1504817343863-5092a923803e?w=800',
    serviceType: 'transport',
    serviceLabel: 'VIP Transfer',
    status: 'planned',
    earnings: 175000,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    daysUntil: 35,
    teamSize: 18,
    tasks: { total: 10, completed: 3 },
  },
  // TEKNİK - Işık Sistemi
  {
    id: 'pe5',
    eventTitle: 'Mercedes-Benz Fashion Week',
    eventDate: '10-14 Eylül 2025',
    eventTime: '10:00 - 23:00',
    venue: 'Zorlu PSM',
    location: 'İstanbul, Beşiktaş',
    organizerName: 'IMG Turkey',
    organizerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    eventImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    serviceType: 'technical',
    serviceLabel: 'Işık Tasarımı',
    status: 'planned',
    earnings: 285000,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    daysUntil: 62,
    teamSize: 15,
    tasks: { total: 20, completed: 5 },
  },
  // DEKORASYON
  {
    id: 'pe6',
    eventTitle: 'Düğün - Elif & Kerem',
    eventDate: '21 Eylül 2025',
    eventTime: '18:00 - 03:00',
    venue: 'Esma Sultan Yalısı',
    location: 'İstanbul, Ortaköy',
    organizerName: 'Elif Demir',
    organizerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    eventImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    serviceType: 'decoration',
    serviceLabel: 'Dekorasyon & Çiçek',
    status: 'planned',
    earnings: 215000,
    paidAmount: 107500,
    paymentStatus: 'partial',
    daysUntil: 72,
    teamSize: 14,
    tasks: { total: 16, completed: 4 },
  },
  // JENERATÖR
  {
    id: 'pe7',
    eventTitle: 'Cappadox Festival 2025',
    eventDate: '5-8 Haziran 2025',
    eventTime: '00:00 - 23:59',
    venue: 'Kapadokya Açık Hava',
    location: 'Nevşehir, Ürgüp',
    organizerName: 'Pozitif Live',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    eventImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    serviceType: 'generator',
    serviceLabel: 'Jeneratör & Enerji',
    status: 'past',
    earnings: 95000,
    paidAmount: 95000,
    paymentStatus: 'paid',
    daysUntil: 0,
    teamSize: 8,
    tasks: { total: 10, completed: 10 },
  },
  // MEDYA & PRODÜKSIYON
  {
    id: 'pe8',
    eventTitle: 'TRT World Forum 2025',
    eventDate: '1-2 Haziran 2025',
    eventTime: '09:00 - 20:00',
    venue: 'Haliç Kongre Merkezi',
    location: 'İstanbul, Beyoğlu',
    organizerName: 'TRT',
    organizerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    eventImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
    serviceType: 'media',
    serviceLabel: 'Canlı Yayın & Prodüksiyon',
    status: 'past',
    earnings: 380000,
    paidAmount: 380000,
    paymentStatus: 'paid',
    daysUntil: 0,
    teamSize: 35,
    tasks: { total: 25, completed: 25 },
  },
  // KONAKLAMA
  {
    id: 'pe9',
    eventTitle: 'Antalya Film Festivali',
    eventDate: '5-12 Ekim 2025',
    eventTime: 'Tüm Gün',
    venue: 'Regnum Carya',
    location: 'Antalya, Belek',
    organizerName: 'Kültür Bakanlığı',
    organizerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    eventImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    serviceType: 'accommodation',
    serviceLabel: 'VIP Konaklama',
    status: 'planned',
    earnings: 420000,
    paidAmount: 210000,
    paymentStatus: 'partial',
    daysUntil: 95,
    teamSize: 5,
    tasks: { total: 12, completed: 3 },
  },
  // BARİYER & SAHNE BARİYERİ
  {
    id: 'pe10',
    eventTitle: 'Harbiye Açıkhava - Sıla',
    eventDate: '28 Ağustos 2025',
    eventTime: '21:00 - 00:00',
    venue: 'Harbiye Cemil Topuzlu',
    location: 'İstanbul, Şişli',
    organizerName: 'Pasion Türk',
    organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    eventImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    serviceType: 'barrier',
    serviceLabel: 'Sahne Bariyeri',
    status: 'planned',
    earnings: 45000,
    paidAmount: 45000,
    paymentStatus: 'paid',
    daysUntil: 48,
    teamSize: 6,
    tasks: { total: 8, completed: 8 },
  },
  // MEDİKAL
  {
    id: 'pe11',
    eventTitle: 'İstanbul Maratonu 2025',
    eventDate: '2 Kasım 2025',
    eventTime: '06:00 - 14:00',
    venue: '15 Temmuz Şehitler Köprüsü',
    location: 'İstanbul',
    organizerName: 'Spor İstanbul',
    organizerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    eventImage: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800',
    serviceType: 'medical',
    serviceLabel: 'Sağlık Ekibi',
    status: 'planned',
    earnings: 125000,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    daysUntil: 112,
    teamSize: 40,
    tasks: { total: 15, completed: 2 },
  },
  // BOOKING - DJ
  {
    id: 'pe12',
    eventTitle: 'Suma Beach Opening Party',
    eventDate: '15 Mayıs 2025',
    eventTime: '16:00 - 04:00',
    venue: 'Suma Beach',
    location: 'İstanbul, Kilyos',
    organizerName: 'Suma Beach',
    organizerImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
    eventImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
    serviceType: 'booking',
    serviceLabel: 'DJ Performance',
    status: 'past',
    earnings: 75000,
    paidAmount: 75000,
    paymentStatus: 'paid',
    daysUntil: 0,
    teamSize: 2,
    tasks: { total: 6, completed: 6 },
  },
];

// Get service type info (gradient and icon)
const getServiceTypeInfo = (serviceType: ServiceCategory) => {
  const serviceMap: Record<ServiceCategory, { gradient: readonly [string, string]; icon: string }> = {
    booking: { gradient: gradients.booking, icon: 'musical-notes' },
    technical: { gradient: gradients.technical, icon: 'volume-high' },
    venue: { gradient: gradients.venue, icon: 'business' },
    accommodation: { gradient: gradients.accommodation, icon: 'bed' },
    transport: { gradient: gradients.transport, icon: 'car' },
    flight: { gradient: gradients.flight, icon: 'airplane' },
    security: { gradient: ['#ef4444', '#dc2626'] as const, icon: 'shield' },
    catering: { gradient: ['#f97316', '#ea580c'] as const, icon: 'restaurant' },
    generator: { gradient: ['#eab308', '#ca8a04'] as const, icon: 'flash' },
    beverage: { gradient: ['#84cc16', '#65a30d'] as const, icon: 'cafe' },
    medical: { gradient: ['#ef4444', '#b91c1c'] as const, icon: 'medkit' },
    sanitation: { gradient: ['#6b7280', '#4b5563'] as const, icon: 'trash' },
    media: { gradient: ['#8b5cf6', '#7c3aed'] as const, icon: 'camera' },
    barrier: { gradient: ['#64748b', '#475569'] as const, icon: 'remove' },
    tent: { gradient: ['#14b8a6', '#0d9488'] as const, icon: 'home' },
    ticketing: { gradient: ['#f43f5e', '#e11d48'] as const, icon: 'ticket' },
    decoration: { gradient: ['#ec4899', '#db2777'] as const, icon: 'color-palette' },
  };
  return serviceMap[serviceType] || { gradient: gradients.primary, icon: 'help-circle' };
};

// Get status info
const getStatusInfo = (status: string, themeColors: typeof colors) => {
  switch (status) {
    case 'planned':
      return { label: 'Planlandı', color: themeColors.warning, icon: 'calendar' as const };
    case 'active':
      return { label: 'Aktif', color: themeColors.success, icon: 'play-circle' as const };
    case 'past':
      return { label: 'Geçmiş', color: themeColors.textMuted, icon: 'checkmark-circle' as const };
    default:
      return { label: status, color: themeColors.textMuted, icon: 'help-circle' as const };
  }
};

// Get payment status info
const getPaymentInfo = (status: string, themeColors: typeof colors) => {
  switch (status) {
    case 'paid':
      return { label: 'Ödendi', color: themeColors.success };
    case 'partial':
      return { label: 'Kısmi Ödeme', color: themeColors.warning };
    case 'unpaid':
      return { label: 'Ödenmedi', color: themeColors.textMuted };
    default:
      return { label: status, color: themeColors.textMuted };
  }
};

export function ProviderEventsScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = providerEvents;

    // Tab filter
    if (activeTab === 'active') {
      filtered = filtered.filter(e => ['active', 'planned'].includes(e.status));
    } else if (activeTab === 'past') {
      filtered = filtered.filter(e => e.status === 'past');
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.eventTitle.toLowerCase().includes(query) ||
        e.venue.toLowerCase().includes(query) ||
        e.organizerName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeTab, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const totalEarnings = providerEvents.reduce((sum, e) => sum + e.earnings, 0);
    const paidEarnings = providerEvents.reduce((sum, e) => sum + e.paidAmount, 0);
    const pendingEarnings = totalEarnings - paidEarnings;
    const activeCount = providerEvents.filter(e => ['active', 'planned'].includes(e.status)).length;
    const pastCount = providerEvents.filter(e => e.status === 'past').length;
    return {
      totalEarnings,
      paidEarnings,
      pendingEarnings,
      activeCount,
      pastCount,
      totalEvents: providerEvents.length,
    };
  }, []);

  const renderEventCard = (event: ProviderEvent) => {
    const statusInfo = getStatusInfo(event.status, colors);
    const paymentInfo = getPaymentInfo(event.paymentStatus, colors);
    const serviceInfo = getServiceTypeInfo(event.serviceType);
    const taskProgress = (event.tasks.completed / event.tasks.total) * 100;

    return (
      <TouchableOpacity
        key={event.id}
        style={[styles.eventCard, {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border
        }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProviderEventDetail', { eventId: event.id })}
      >
        {/* Event Image Header */}
        <View style={styles.eventImageContainer}>
          <Image source={{ uri: event.eventImage }} style={styles.eventImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.85)']}
            style={styles.eventImageGradient}
            locations={[0, 0.4, 1]}
          />

          {/* Top Left Info - Service Type, Label, Location */}
          <View style={styles.topLeftInfo}>
            <View style={styles.serviceTypeRow}>
              <LinearGradient
                colors={serviceInfo.gradient}
                style={styles.serviceIconBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={serviceInfo.icon as any} size={12} color="white" />
              </LinearGradient>
              <Text style={styles.serviceLabelText}>{event.serviceLabel}</Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={11} color="rgba(255,255,255,0.9)" />
              <Text style={styles.locationText}>{event.location}</Text>
            </View>
          </View>

          {/* Top Right Info - Status & Days */}
          <View style={styles.topRightInfo}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '30' }]}>
              <Ionicons name={statusInfo.icon} size={11} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
            {event.daysUntil > 0 && (
              <View style={styles.daysUntilBadge}>
                <Ionicons name="time" size={11} color={colors.brand[400]} />
                <Text style={[styles.daysUntilText, { color: colors.brand[400] }]}>{event.daysUntil} gün</Text>
              </View>
            )}
          </View>

          {/* Event Title on Image */}
          <View style={styles.eventImageContent}>
            <Text style={styles.eventImageTitle} numberOfLines={1}>{event.eventTitle}</Text>
            <Text style={styles.eventVenueText}>{event.venue}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          {/* Organizer Info */}
          <View style={styles.cardHeader}>
            <View style={styles.organizerInfo}>
              <Image source={{ uri: event.organizerImage }} style={styles.organizerImage} />
              <View>
                <Text style={[styles.organizerName, { color: colors.text }]}>{event.organizerName}</Text>
                <View style={styles.eventDateRow}>
                  <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                  <Text style={[styles.eventDateText, { color: colors.textMuted }]}>{event.eventDate}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.paymentStatusBadge, { backgroundColor: `${paymentInfo.color}15` }]}>
              <Text style={[styles.paymentStatusText, { color: paymentInfo.color }]}>
                {paymentInfo.label}
              </Text>
            </View>
          </View>

          {/* Earnings Row */}
          <View style={styles.earningsRow}>
            <View style={styles.earningItem}>
              <Text style={[styles.earningLabel, { color: colors.textMuted }]}>Kazanç</Text>
              <Text style={[styles.earningValue, { color: colors.text }]}>₺{event.earnings.toLocaleString('tr-TR')}</Text>
            </View>
            <View style={styles.earningDivider} />
            <View style={styles.earningItem}>
              <Text style={[styles.earningLabel, { color: colors.textMuted }]}>Ödenen</Text>
              <Text style={[styles.earningValue, { color: colors.success }]}>
                ₺{event.paidAmount.toLocaleString('tr-TR')}
              </Text>
            </View>
            <View style={styles.earningDivider} />
            <View style={styles.earningItem}>
              <Text style={[styles.earningLabel, { color: colors.textMuted }]}>Kalan</Text>
              <Text style={[styles.earningValue, { color: colors.warning }]}>
                ₺{(event.earnings - event.paidAmount).toLocaleString('tr-TR')}
              </Text>
            </View>
          </View>

          {/* Progress Row */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.textMuted }]}>Görev İlerlemesi</Text>
              <Text style={[styles.progressPercent, { color: colors.brand[400] }]}>{Math.round(taskProgress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={gradients.primary}
                style={[styles.progressFill, { width: `${taskProgress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <View style={styles.progressFooter}>
              <View style={styles.progressInfo}>
                <Ionicons name="checkbox-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.progressText, { color: colors.textMuted }]}>
                  {event.tasks.completed}/{event.tasks.total} tamamlandı
                </Text>
              </View>
              <View style={styles.teamInfo}>
                <Ionicons name="people-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.teamText, { color: colors.textMuted }]}>{event.teamSize} kişi</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>İşlerim</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {stats.activeCount} aktif iş
          </Text>
        </View>
        <TouchableOpacity style={[styles.calendarButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
          <Ionicons name="calendar" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Earnings Summary - Minimal */}
      <View style={[styles.earningsSummary, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
        <View style={styles.summaryRow}>
          <View style={styles.earningsMain}>
            <Text style={[styles.earningsMainValue, { color: colors.text }]}>₺{stats.totalEarnings.toLocaleString('tr-TR')}</Text>
            <Text style={[styles.earningsMainLabel, { color: colors.textMuted }]}>toplam kazanç</Text>
          </View>
          <View style={styles.earningsDetails}>
            <View style={styles.earningsDetailItem}>
              <View style={[styles.earningsIndicator, { backgroundColor: colors.success }]} />
              <Text style={[styles.earningsDetailValue, { color: colors.text }]}>₺{(stats.paidEarnings / 1000).toFixed(0)}K</Text>
              <Text style={[styles.earningsDetailLabel, { color: colors.textMuted }]}>ödendi</Text>
            </View>
            <View style={styles.earningsDetailItem}>
              <View style={[styles.earningsIndicator, { backgroundColor: colors.warning }]} />
              <Text style={[styles.earningsDetailValue, { color: colors.text }]}>₺{(stats.pendingEarnings / 1000).toFixed(0)}K</Text>
              <Text style={[styles.earningsDetailLabel, { color: colors.textMuted }]}>bekliyor</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="İş ara..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Ionicons
            name={activeTab === 'active' ? 'play-circle' : 'play-circle-outline'}
            size={14}
            color={activeTab === 'active' ? colors.brand[400] : colors.textMuted}
          />
          <Text style={[styles.tabText, { color: activeTab === 'active' ? colors.brand[400] : colors.textMuted }]}>
            Aktif
          </Text>
          <View style={[styles.tabBadge, activeTab === 'active' && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, { color: activeTab === 'active' ? colors.brand[300] : colors.textMuted }]}>
              {stats.activeCount}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Ionicons
            name={activeTab === 'past' ? 'time' : 'time-outline'}
            size={14}
            color={activeTab === 'past' ? colors.brand[400] : colors.textMuted}
          />
          <Text style={[styles.tabText, { color: activeTab === 'past' ? colors.brand[400] : colors.textMuted }]}>
            Geçmiş
          </Text>
          <View style={[styles.tabBadge, activeTab === 'past' && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, { color: activeTab === 'past' ? colors.brand[300] : colors.textMuted }]}>
              {stats.pastCount}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <ScrollView
        style={styles.eventsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[400]}
            colors={[colors.brand[400]]}
          />
        }
      >
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => renderEventCard(event))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>İş Bulunamadı</Text>
            <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
              {searchQuery
                ? 'Arama kriterlerinize uygun iş yok.'
                : 'Bu kategoride henüz iş yok.'}
            </Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  earningsSummary: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earningsMain: {
    flex: 1,
  },
  earningsMainValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  earningsMainLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  earningsDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  earningsDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  earningsIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  earningsDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  earningsDetailLabel: {
    fontSize: 11,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {},
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabBadgeTextActive: {},
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
  },
  eventImageContainer: {
    height: 130,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImageGradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  topLeftInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    gap: 6,
  },
  serviceTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 2,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  topRightInfo: {
    position: 'absolute',
    top: 10,
    right: 10,
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  daysUntilBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  daysUntilText: {
    fontSize: 10,
    fontWeight: '600',
  },
  eventImageContent: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
  },
  eventImageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  eventVenueText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 3,
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  organizerImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  organizerName: {
    fontSize: 13,
    fontWeight: '600',
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  eventDateText: {
    fontSize: 11,
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  earningItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningLabel: {
    fontSize: 9,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  earningValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  earningDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressSection: {
    marginBottom: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontSize: 10,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamText: {
    fontSize: 10,
  },
  arrowContainer: {
    position: 'absolute',
    right: 14,
    top: 145,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
