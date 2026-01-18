import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { OptimizedImage } from '../components/OptimizedImage';
import type { TicketPlatform, TicketCategory } from '../types';

// Default colors for static styles
const colors = defaultColors;

// Mock Platform Data
const mockPlatforms: TicketPlatform[] = [
  { id: '1', name: 'Biletix', ticketsSold: 2100, revenue: 525000, commission: 12, email: 'partner@biletix.com', isActive: true },
  { id: '2', name: 'Mobilet', ticketsSold: 1850, revenue: 462500, commission: 10, email: 'info@mobilet.com', isActive: true },
  { id: '3', name: 'Passo', ticketsSold: 1470, revenue: 367500, commission: 11, email: 'partners@passo.com.tr', isActive: true },
  { id: '4', name: 'Biletinial', ticketsSold: 650, revenue: 162500, commission: 10, email: 'contact@biletinial.com', isActive: true },
  { id: '5', name: 'Bu Bilet', ticketsSold: 720, revenue: 180000, commission: 14, email: 'info@bubilet.com', isActive: false },
  { id: '6', name: 'iticket', ticketsSold: 580, revenue: 145000, commission: 11, email: 'partner@iticket.com.tr', isActive: false },
];

// Mock Ticket Categories
const mockCategories: TicketCategory[] = [
  { id: 'c1', name: 'Erken Rezervasyon', price: 250, capacity: 3000, sold: 3000, remaining: 0 },
  { id: 'c2', name: 'Standart', price: 300, capacity: 8000, sold: 4370, remaining: 3630 },
  { id: 'c3', name: 'VIP', price: 500, capacity: 2000, sold: 1200, remaining: 800 },
  { id: 'c4', name: 'Kapıda Satış', price: 350, capacity: 2000, sold: 800, remaining: 1200 },
];

// Local events data
const events = [
  {
    id: '1',
    title: 'Yaz Festivali 2024',
    description: '3 günlük açık hava müzik festivali',
    date: '15-17 Temmuz 2024',
    time: '16:00',
    location: 'İstanbul',
    district: 'Kadıköy',
    venue: 'KüçükÇiftlik Park',
    status: 'planning',
    progress: 65,
    budget: 2500000,
    spent: 1625000,
    attendees: 15000,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    services: [{ id: 's1', category: 'booking', name: 'Ana Sahne', status: 'confirmed', provider: 'Mabel Matiz', price: 200000 }],
    // Ticketing data
    isTicketed: true,
    ticketCapacity: 15000,
  },
  {
    id: '2',
    title: 'Kurumsal Gala',
    description: 'Yıllık şirket galası',
    date: '22 Ağustos 2024',
    time: '19:00',
    location: 'Ankara',
    district: 'Çankaya',
    venue: 'JW Marriott',
    status: 'confirmed',
    progress: 100,
    budget: 800000,
    spent: 750000,
    attendees: 500,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    services: [],
    isTicketed: false,
    ticketCapacity: 0,
  },
];

const { width } = Dimensions.get('window');

const getCategoryGradient = (category: string): readonly [string, string, ...string[]] => {
  const gradientMap: Record<string, readonly [string, string, ...string[]]> = {
    booking: gradients.booking,
    technical: gradients.technical,
    venue: gradients.venue,
    accommodation: gradients.accommodation,
    transport: gradients.transport,
    flight: gradients.flight,
    operation: gradients.operation,
  };
  return gradientMap[category] || gradients.primary;
};

const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    booking: 'musical-notes',
    technical: 'volume-high',
    venue: 'business',
    accommodation: 'bed',
    transport: 'car',
    flight: 'airplane',
    operation: 'settings',
  };
  return iconMap[category] || 'ellipse';
};

const getStatusInfo = (status: string) => {
  const statusMap: Record<string, { color: string; text: string; bg: string }> = {
    confirmed: { color: colors.success, text: 'Onaylandı', bg: 'rgba(16, 185, 129, 0.15)' },
    pending: { color: colors.warning, text: 'Beklemede', bg: 'rgba(245, 158, 11, 0.15)' },
    offered: { color: colors.info, text: 'Teklif Var', bg: 'rgba(59, 130, 246, 0.15)' },
    planning: { color: colors.brand[400], text: 'Planlama', bg: 'rgba(75, 48, 184, 0.15)' },
    draft: { color: colors.zinc[500], text: 'Taslak', bg: 'rgba(113, 113, 122, 0.15)' },
  };
  return statusMap[status] || statusMap.pending;
};

export function EventDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = (route.params as { eventId: string }) || { eventId: '1' };
  const { colors, isDark, helpers } = useTheme();

  const event = events.find(e => e.id === eventId) || events[0];
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'budget' | 'tickets'>('overview');
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>(mockCategories);
  const [platforms] = useState<TicketPlatform[]>(mockPlatforms);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Ticketing calculations
  const totalTicketsSold = platforms.reduce((sum, p) => sum + p.ticketsSold, 0);
  const totalRevenue = platforms.reduce((sum, p) => sum + p.revenue, 0);
  const avgTicketPrice = totalTicketsSold > 0 ? Math.round(totalRevenue / totalTicketsSold) : 0;
  const occupancyRate = event.ticketCapacity ? (totalTicketsSold / event.ticketCapacity) * 100 : 0;

  // Handle price increase for tickets
  const handlePriceIncrease = (categoryId: string, increase: number) => {
    setTicketCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, newPrice: (cat.newPrice || cat.price) + increase }
        : cat
    ));
  };

  // Reset price changes
  const handleResetPrice = (categoryId: string) => {
    setTicketCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, newPrice: undefined }
        : cat
    ));
  };

  // Send price change notification
  const handleSendPriceChange = () => {
    const changedCategories = ticketCategories.filter(c => c.newPrice);
    if (changedCategories.length === 0) {
      Alert.alert('Uyarı', 'Fiyat değişikliği yapılmadı.');
      return;
    }
    Alert.alert(
      'Fiyat Değişikliği',
      `${changedCategories.length} kategori için fiyat değişikliği tüm platformlara bildirilecek.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Gönder',
          onPress: () => {
            // Apply changes
            setTicketCategories(prev => prev.map(cat => ({
              ...cat,
              price: cat.newPrice || cat.price,
              newPrice: undefined,
            })));
            Alert.alert('Başarılı', 'Fiyat değişikliği platformlara bildirildi.');
          },
        },
      ]
    );
  };

  if (!event) {
    return null;
  }

  const confirmedServices = event.services?.filter(s => s.status === 'confirmed').length || 0;
  const totalServices = event.services?.length || 0;
  const budgetUsedPercent = event.budget ? Math.round((event.spent / event.budget) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Image */}
      <View style={styles.headerImage}>
        <OptimizedImage source={event.image} style={styles.coverImage} priority="high" />
        <LinearGradient
          colors={isDark ? ['transparent', 'rgba(9,9,11,0.8)', colors.background] : ['transparent', 'rgba(255,255,255,0.8)', colors.background]}
          style={styles.imageGradient}
        />
        <SafeAreaView style={styles.headerActions}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
              <Ionicons name="share-outline" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
              <Ionicons name="ellipsis-horizontal" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
            colors={[colors.brand[500]]}
          />
        }
      >
        {/* Event Info */}
        <View style={styles.eventInfo}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusInfo(event.status).bg }]}>
            <Text style={[styles.statusText, { color: getStatusInfo(event.status).color }]}>
              {getStatusInfo(event.status).text}
            </Text>
          </View>
          <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
          <Text style={[styles.eventDescription, { color: colors.textMuted }]}>{event.description}</Text>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.quickInfoText, { color: colors.textMuted }]}>{event.date}</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="time-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.quickInfoText, { color: colors.textMuted }]}>{event.time}</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.quickInfoText, { color: colors.textMuted }]}>{event.venue}, {event.district}</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="people-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.quickInfoText, { color: colors.textMuted }]}>{event.attendees.toLocaleString()} katılımcı</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{event.progress}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>İlerleme</Text>
            <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' }]}>
              <LinearGradient
                colors={gradients.primary}
                style={[styles.progressFill, { width: `${event.progress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{confirmedServices}/{totalServices}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hizmetler</Text>
            <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' }]}>
              <View style={[styles.progressFillGreen, { width: `${(confirmedServices/totalServices)*100}%` }]} />
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{budgetUsedPercent}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bütçe</Text>
            <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' }]}>
              <View style={[styles.progressFillOrange, { width: `${budgetUsedPercent}%` }]} />
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
          {(event.isTicketed ? ['overview', 'services', 'budget', 'tickets'] as const : ['overview', 'services', 'budget'] as const).map((tab) => {
            const tabConfig = {
              overview: { icon: 'information-circle-outline', iconActive: 'information-circle', label: 'Genel' },
              services: { icon: 'grid-outline', iconActive: 'grid', label: 'Hizmetler' },
              budget: { icon: 'wallet-outline', iconActive: 'wallet', label: 'Bütçe' },
              tickets: { icon: 'ticket-outline', iconActive: 'ticket', label: 'Biletler' },
            };
            const config = tabConfig[tab];
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab);
                }}
              >
                <Ionicons
                  name={(activeTab === tab ? config.iconActive : config.icon) as any}
                  size={14}
                  color={activeTab === tab ? colors.brand[400] : colors.textSecondary}
                />
                <Text style={[styles.tabText, { color: activeTab === tab ? colors.brand[400] : colors.textSecondary }]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content */}
        {activeTab === 'services' && (
          <View style={styles.servicesSection}>
            {event.services.map((service, index) => {
              const statusInfo = getStatusInfo(service.status);
              return (
                <TouchableOpacity key={service.id} style={[styles.serviceCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
                  <LinearGradient
                    colors={getCategoryGradient(service.category)}
                    style={styles.serviceIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={getCategoryIcon(service.category) as any} size={18} color="white" />
                  </LinearGradient>
                  <View style={styles.serviceInfo}>
                    <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
                    <Text style={[styles.serviceProvider, { color: colors.textSecondary }]}>
                      {service.provider || 'Tedarikçi bekleniyor'}
                    </Text>
                  </View>
                  <View style={styles.serviceRight}>
                    <Text style={[styles.servicePrice, { color: colors.text }]}>₺{service.price.toLocaleString()}</Text>
                    <View style={[styles.serviceStatus, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.serviceStatusText, { color: statusInfo.color }]}>
                        {statusInfo.text}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={[styles.addServiceButton, { borderColor: isDark ? 'rgba(75, 48, 184, 0.3)' : colors.brand[300] }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
              <Ionicons name="add-circle-outline" size={20} color={colors.brand[400]} />
              <Text style={[styles.addServiceText, { color: colors.brand[400] }]}>Hizmet Ekle</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'overview' && (
          <View style={styles.overviewSection}>
            {/* Timeline */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Zaman Çizelgesi</Text>
            <View style={styles.timeline}>
              {[
                { title: 'Etkinlik Oluşturuldu', date: '1 Haziran 2024', done: true },
                { title: 'Mekan Onaylandı', date: '5 Haziran 2024', done: true },
                { title: 'Sanatçı Sözleşmesi', date: '10 Haziran 2024', done: true },
                { title: 'Teknik Ekip', date: '15 Haziran 2024', done: false },
                { title: 'Final Kontrol', date: '10 Temmuz 2024', done: false },
                { title: 'Etkinlik Günü', date: event.date, done: false },
              ].map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: item.done ? colors.brand[500] : colors.textSecondary }]}>
                    {item.done ? (
                      <Ionicons name="checkmark" size={12} color="white" />
                    ) : (
                      <View style={[styles.timelineDotEmpty, { backgroundColor: colors.textSecondary }]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineTitle, { color: colors.text }, !item.done && { color: colors.textSecondary }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>{item.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'budget' && (
          <View style={styles.budgetSection}>
            <View style={[styles.budgetSummary, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
              <View style={styles.budgetItem}>
                <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>Toplam Bütçe</Text>
                <Text style={[styles.budgetValue, { color: colors.text }]}>₺{event.budget.toLocaleString()}</Text>
              </View>
              <View style={styles.budgetItem}>
                <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>Harcanan</Text>
                <Text style={[styles.budgetValue, { color: colors.warning }]}>
                  ₺{event.spent.toLocaleString()}
                </Text>
              </View>
              <View style={styles.budgetItem}>
                <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>Kalan</Text>
                <Text style={[styles.budgetValue, { color: colors.success }]}>
                  ₺{(event.budget - event.spent).toLocaleString()}
                </Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Harcama Dağılımı</Text>
            {event.services.filter(s => s.status === 'confirmed').map((service) => (
              <View key={service.id} style={[styles.budgetRow, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
                <View style={styles.budgetRowLeft}>
                  <View style={[styles.budgetDot, { backgroundColor: getCategoryGradient(service.category)[0] }]} />
                  <Text style={[styles.budgetRowName, { color: colors.text }]}>{service.name}</Text>
                </View>
                <Text style={[styles.budgetRowValue, { color: colors.text }]}>₺{service.price.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tickets Tab - Bilet Yönetimi */}
        {activeTab === 'tickets' && event.isTicketed && (
          <View style={styles.ticketsSection}>
            {/* İstatistik Kartları */}
            <View style={styles.ticketStatsGrid}>
              {/* Toplam Bilet */}
              <View style={[styles.ticketStatCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
                <View style={[styles.ticketStatIcon, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }]}>
                  <Ionicons name="ticket" size={18} color={colors.brand[400]} />
                </View>
                <Text style={[styles.ticketStatValue, { color: colors.text }]}>{totalTicketsSold.toLocaleString()}</Text>
                <Text style={[styles.ticketStatLabel, { color: colors.textMuted }]}>Satılan Bilet</Text>
              </View>

              {/* Toplam Ciro */}
              <View style={[styles.ticketStatCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
                <View style={[styles.ticketStatIcon, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
                  <Ionicons name="cash" size={18} color={colors.success} />
                </View>
                <Text style={[styles.ticketStatValue, { color: colors.text }]}>₺{(totalRevenue / 1000).toFixed(0)}k</Text>
                <Text style={[styles.ticketStatLabel, { color: colors.textMuted }]}>Toplam Ciro</Text>
              </View>

              {/* Doluluk Oranı */}
              <View style={[styles.ticketStatCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
                <View style={[styles.ticketStatIcon, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }]}>
                  <Ionicons name="trending-up" size={18} color={colors.warning} />
                </View>
                <Text style={[styles.ticketStatValue, { color: colors.text }]}>{occupancyRate.toFixed(1)}%</Text>
                <Text style={[styles.ticketStatLabel, { color: colors.textMuted }]}>Doluluk</Text>
              </View>

              {/* Ortalama Fiyat */}
              <View style={[styles.ticketStatCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
                <View style={[styles.ticketStatIcon, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}>
                  <Ionicons name="analytics" size={18} color={colors.info} />
                </View>
                <Text style={[styles.ticketStatValue, { color: colors.text }]}>₺{avgTicketPrice}</Text>
                <Text style={[styles.ticketStatLabel, { color: colors.textMuted }]}>Ort. Fiyat</Text>
              </View>
            </View>

            {/* Doluluk Barı */}
            <View style={[styles.occupancyCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
              <View style={styles.occupancyHeader}>
                <Text style={[styles.occupancyTitle, { color: colors.text }]}>Doluluk Oranı</Text>
                <Text style={[styles.occupancyPercent, { color: colors.brand[400] }]}>{occupancyRate.toFixed(1)}%</Text>
              </View>
              <View style={[styles.occupancyBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' }]}>
                <LinearGradient
                  colors={gradients.primary}
                  style={[styles.occupancyFill, { width: `${Math.min(occupancyRate, 100)}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <View style={styles.occupancyFooter}>
                <Text style={[styles.occupancyFooterText, { color: colors.textMuted }]}>
                  {totalTicketsSold.toLocaleString()} / {event.ticketCapacity.toLocaleString()} bilet satıldı
                </Text>
                <Text style={[styles.occupancyFooterText, { color: colors.success }]}>
                  {(event.ticketCapacity - totalTicketsSold).toLocaleString()} kalan
                </Text>
              </View>
            </View>

            {/* Platform Performansı */}
            <View style={[styles.platformCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
              <View style={styles.platformHeader}>
                <Ionicons name="bar-chart" size={18} color={colors.brand[400]} />
                <Text style={[styles.platformTitle, { color: colors.text }]}>Platform Performansı</Text>
              </View>
              {platforms.filter(p => p.isActive).map((platform) => (
                <View key={platform.id} style={[styles.platformItem, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
                  <View style={styles.platformInfo}>
                    <View style={[styles.platformLogo, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.surface }]}>
                      <Text style={[styles.platformLogoText, { color: colors.brand[400] }]}>{platform.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.platformDetails}>
                      <Text style={[styles.platformName, { color: colors.text }]}>{platform.name}</Text>
                      <Text style={[styles.platformEmail, { color: colors.textMuted }]}>{platform.email}</Text>
                    </View>
                  </View>
                  <View style={styles.platformStats}>
                    <Text style={[styles.platformSold, { color: colors.text }]}>{platform.ticketsSold} bilet</Text>
                    <Text style={[styles.platformRevenue, { color: colors.success }]}>₺{platform.revenue.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Bilet Kategorileri ve Fiyatlandırma */}
            <View style={[styles.categoriesCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
              <View style={styles.categoriesHeader}>
                <Ionicons name="pricetags" size={18} color={colors.brand[400]} />
                <Text style={[styles.categoriesTitle, { color: colors.text }]}>Bilet Kategorileri</Text>
              </View>
              {ticketCategories.map((category) => (
                <View key={category.id} style={[styles.categoryItem, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                    <View style={styles.categoryPriceRow}>
                      <Text style={[styles.categoryPrice, { color: colors.brand[400] }]}>
                        ₺{category.newPrice || category.price}
                      </Text>
                      {category.newPrice && (
                        <Text style={[styles.categoryOldPrice, { color: colors.textMuted }]}>
                          ₺{category.price}
                        </Text>
                      )}
                      {category.newPrice && (
                        <View style={[styles.priceChangeBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                          <Text style={[styles.priceChangeText, { color: colors.warning }]}>
                            +₺{category.newPrice - category.price}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.categoryStats, { color: colors.textMuted }]}>
                      {category.sold} satıldı • {category.remaining === 0 ? 'Tükendi' : `${category.remaining} kaldı`}
                    </Text>
                  </View>
                  <View style={styles.categoryActions}>
                    {category.newPrice ? (
                      <TouchableOpacity
                        style={[styles.priceResetBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          handleResetPrice(category.id);
                        }}
                      >
                        <Ionicons name="close" size={16} color={colors.error} />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.priceButtons}>
                        <TouchableOpacity
                          style={[styles.priceBtn, { borderColor: colors.brand[400] }]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            handlePriceIncrease(category.id, 25);
                          }}
                        >
                          <Text style={[styles.priceBtnText, { color: colors.brand[400] }]}>+₺25</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.priceBtn, { borderColor: colors.brand[400] }]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            handlePriceIncrease(category.id, 50);
                          }}
                        >
                          <Text style={[styles.priceBtnText, { color: colors.brand[400] }]}>+₺50</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}
              {/* Fiyat Değişikliği Gönder Butonu */}
              {ticketCategories.some(c => c.newPrice) && (
                <TouchableOpacity
                  style={styles.sendPriceChangeBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleSendPriceChange();
                  }}
                >
                  <LinearGradient
                    colors={gradients.primary}
                    style={styles.sendPriceChangeBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="send" size={16} color="white" />
                    <Text style={styles.sendPriceChangeBtnText}>Fiyat Değişikliğini Gönder</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {/* Hızlı İşlemler */}
            <View style={[styles.quickActionsCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
              <Text style={[styles.quickActionsTitle, { color: colors.text }]}>Hızlı İşlemler</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={[styles.quickActionBtn, { borderColor: colors.brand[300] }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Alert.alert('Fiyat Güncelle', 'Yukarıdaki kategorilerden fiyat güncelleyebilirsiniz.');
                  }}
                >
                  <Ionicons name="trending-up" size={22} color={colors.brand[400]} />
                  <Text style={[styles.quickActionText, { color: colors.text }]}>Fiyat Güncelle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickActionBtn, { borderColor: colors.info }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Alert.alert('Ertele', 'Etkinlik erteleme işlemi yapılacak.');
                  }}
                >
                  <Ionicons name="time" size={22} color={colors.info} />
                  <Text style={[styles.quickActionText, { color: colors.text }]}>Ertele</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickActionBtn, { borderColor: colors.error }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Alert.alert('İptal Et', 'Etkinlik iptal edilecek.');
                  }}
                >
                  <Ionicons name="close-circle" size={22} color={colors.error} />
                  <Text style={[styles.quickActionText, { color: colors.text }]}>İptal Et</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickActionBtn, { borderColor: colors.textMuted }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Alert.alert('Mail Gönder', 'Platformlara toplu mail gönderilecek.');
                  }}
                >
                  <Ionicons name="mail" size={22} color={colors.textSecondary} />
                  <Text style={[styles.quickActionText, { color: colors.text }]}>Mail Gönder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : colors.background, borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
        <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.cardBackground, borderColor: isDark ? 'transparent' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
          <Ionicons name="create-outline" size={20} color={colors.text} />
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.primaryButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="paper-plane" size={18} color="white" />
            <Text style={styles.primaryButtonText}>Teklif İste</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerImage: {
    height: 280,
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
    height: 150,
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginTop: -40,
  },
  eventInfo: {
    paddingHorizontal: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  quickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickInfoText: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressFillGreen: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.success,
  },
  progressFillOrange: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.warning,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 4,
  },
  tabActive: {
    backgroundColor: 'rgba(75, 48, 184, 0.2)',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabTextActive: {
  },
  servicesSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 10,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '500',
  },
  serviceProvider: {
    fontSize: 12,
    marginTop: 2,
  },
  serviceRight: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  serviceStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  serviceStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(75, 48, 184, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 14,
    marginTop: 8,
  },
  addServiceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  overviewSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  timelineDotEmpty: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  timelineTitlePending: {
  },
  timelineDate: {
    fontSize: 12,
    marginTop: 2,
  },
  budgetSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  budgetSummary: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  budgetItem: {
    flex: 1,
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  budgetRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  budgetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  budgetRowName: {
    fontSize: 14,
  },
  budgetRowValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomActions: {
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
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1.5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  // =====================
  // Tickets Tab Styles
  // =====================
  ticketsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  ticketStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  ticketStatCard: {
    flex: 1,
    minWidth: '47%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  ticketStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ticketStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  ticketStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  occupancyCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  occupancyTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  occupancyPercent: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  occupancyBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  occupancyFill: {
    height: '100%',
    borderRadius: 4,
  },
  occupancyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  occupancyFooterText: {
    fontSize: 11,
  },
  platformCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  platformTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  platformItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformLogoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  platformDetails: {
    marginLeft: 12,
  },
  platformName: {
    fontSize: 14,
    fontWeight: '500',
  },
  platformEmail: {
    fontSize: 11,
    marginTop: 2,
  },
  platformStats: {
    alignItems: 'flex-end',
  },
  platformSold: {
    fontSize: 13,
    fontWeight: '500',
  },
  platformRevenue: {
    fontSize: 12,
    marginTop: 2,
  },
  categoriesCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  categoriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  categoryPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  categoryPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryOldPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  priceChangeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priceChangeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryStats: {
    fontSize: 11,
  },
  categoryActions: {
    marginLeft: 12,
  },
  priceButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  priceBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  priceBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceResetBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendPriceChangeBtn: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendPriceChangeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  sendPriceChangeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  quickActionsCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionBtn: {
    flex: 1,
    minWidth: '47%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
