import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  Linking,
  Share,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { events as mockEvents, getOfferByServiceId } from '../data/mockData';
import { ReviseEventModal } from '../components/ReviseEventModal';
import { CancelEventModal } from '../components/CancelEventModal';
import {
  Service,
  TimelineItem,
  getCategoryInfo,
  mockTimeline,
  getTimelineTypeIcon,
  getTimelineTypeColor,
  getServiceStatusInfo,
} from '../data/organizerEventData';
import type { TicketPlatform, TicketCategory } from '../types';
import { PosterGenerator } from '../components/poster';
import { RatingModal } from '../components/rating';

// Expense Types
interface Expense {
  id: string;
  title: string;
  category: 'booking' | 'technical' | 'operation' | 'marketing' | 'venue' | 'other';
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'cancelled';
  notes?: string;
  provider?: string;
}

// Mock Expenses Data
const mockExpenses: Expense[] = [
  { id: 'e1', title: 'Ana Sahne Sanatçısı', category: 'booking', amount: 200000, date: '10 Ocak 2026', status: 'paid', provider: 'Mabel Matiz' },
  { id: 'e2', title: 'DJ Set', category: 'booking', amount: 50000, date: '12 Ocak 2026', status: 'pending', provider: 'DJ Mahmut' },
  { id: 'e3', title: 'Ses Sistemi Kiralama', category: 'technical', amount: 85000, date: '8 Ocak 2026', status: 'paid', provider: 'ProSound' },
  { id: 'e4', title: 'Işık Sistemi', category: 'technical', amount: 45000, date: '8 Ocak 2026', status: 'paid', provider: 'LightTech' },
  { id: 'e5', title: 'Sahne Kurulumu', category: 'operation', amount: 35000, date: '14 Ocak 2026', status: 'pending', provider: 'Stage Masters' },
  { id: 'e6', title: 'Güvenlik Hizmeti', category: 'operation', amount: 28000, date: '15 Ocak 2026', status: 'pending', provider: 'SecureEvent' },
  { id: 'e7', title: 'Sosyal Medya Reklamı', category: 'marketing', amount: 15000, date: '5 Ocak 2026', status: 'paid' },
  { id: 'e8', title: 'Mekan Kiralama', category: 'venue', amount: 120000, date: '1 Ocak 2026', status: 'paid', provider: 'KüsümPark' },
];

// Mock Platform Data for Ticketing
const mockPlatforms: TicketPlatform[] = [
  { id: '1', name: 'Biletix', ticketsSold: 2100, revenue: 525000, commission: 12, email: 'partner@biletix.com', isActive: true },
  { id: '2', name: 'Mobilet', ticketsSold: 1850, revenue: 462500, commission: 10, email: 'info@mobilet.com', isActive: true },
  { id: '3', name: 'Passo', ticketsSold: 1470, revenue: 367500, commission: 11, email: 'partners@passo.com.tr', isActive: true },
  { id: '4', name: 'Biletinial', ticketsSold: 650, revenue: 162500, commission: 10, email: 'contact@biletinial.com', isActive: true },
];

// Mock Ticket Categories with check-in data
const mockTicketCategories: (TicketCategory & { checkedIn: number })[] = [
  { id: 'c1', name: 'Erken Rezervasyon', price: 250, capacity: 3000, sold: 3000, remaining: 0, checkedIn: 2850 },
  { id: 'c2', name: 'Standart', price: 300, capacity: 8000, sold: 4370, remaining: 3630, checkedIn: 3200 },
  { id: 'c3', name: 'VIP', price: 500, capacity: 2000, sold: 1200, remaining: 800, checkedIn: 980 },
  { id: 'c4', name: 'Kapıda Satış', price: 350, capacity: 2000, sold: 500, remaining: 1500, checkedIn: 420 },
];

// Expense Category Info
const getExpenseCategoryInfo = (category: Expense['category']) => {
  const categories = {
    booking: { name: 'Booking', icon: 'musical-notes', color: '#8b5cf6', gradient: ['#8b5cf6', '#a78bfa'] as [string, string] },
    technical: { name: 'Teknik', icon: 'hardware-chip', color: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'] as [string, string] },
    operation: { name: 'Operasyon', icon: 'construct', color: '#f59e0b', gradient: ['#f59e0b', '#fbbf24'] as [string, string] },
    marketing: { name: 'Pazarlama', icon: 'megaphone', color: '#ec4899', gradient: ['#ec4899', '#f472b6'] as [string, string] },
    venue: { name: 'Mekan', icon: 'location', color: '#10b981', gradient: ['#10b981', '#34d399'] as [string, string] },
    other: { name: 'Diğer', icon: 'ellipsis-horizontal', color: '#6b7280', gradient: ['#6b7280', '#9ca3af'] as [string, string] },
  };
  return categories[category];
};

const colors = defaultColors;
const { width } = Dimensions.get('window');

export function OrganizerEventDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { eventId } = route.params || { eventId: '1' };
  const { colors, isDark, helpers } = useTheme();
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 80; // Approximate tab bar height

  const [activeSection, setActiveSection] = useState<'services' | 'timeline' | 'budget' | 'tickets' | 'poster'>('services');
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [ticketCategories, setTicketCategories] = useState<(TicketCategory & { checkedIn: number })[]>(mockTicketCategories);
  const [platforms, setPlatforms] = useState<TicketPlatform[]>(mockPlatforms);

  // Ticket Sales State
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [ticketSalesStatus, setTicketSalesStatus] = useState<'not_started' | 'pending' | 'active'>('not_started');
  const [salesNote, setSalesNote] = useState('');

  // Budget/Expense state
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', category: 'other' as Expense['category'], notes: '', provider: '' });
  const [expenseFilter, setExpenseFilter] = useState<'all' | 'paid' | 'pending'>('all');

  // Rating Modal State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{
    id: string;
    name: string;
    image: string;
    type: 'provider' | 'organizer';
    serviceCategory?: string;
  } | null>(null);

  // Get event data first
  const event = useMemo(() => mockEvents.find(e => e.id === eventId), [eventId]);

  // Check if event has ticketing enabled (mock - always true for demo)
  const isTicketed = true;
  const ticketCapacity = event?.attendees || 15000;

  // Ticketing calculations
  const totalTicketsSold = platforms.reduce((sum, p) => sum + p.ticketsSold, 0);
  const totalRevenue = platforms.reduce((sum, p) => sum + p.revenue, 0);
  const avgTicketPrice = totalTicketsSold > 0 ? Math.round(totalRevenue / totalTicketsSold) : 0;
  const occupancyRate = ticketCapacity ? (totalTicketsSold / ticketCapacity) * 100 : 0;

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

  // Hooks must be called before any early returns
  const servicesByCategory = useMemo(() => {
    if (!event) return {};
    const grouped: Record<string, Service[]> = {};
    event.services.forEach((service: Service) => {
      if (!grouped[service.category]) grouped[service.category] = [];
      grouped[service.category].push(service);
    });
    return grouped;
  }, [event?.services]);

  const stats = useMemo(() => {
    if (!event) return { confirmed: 0, pending: 0, offered: 0, total: 0 };
    const confirmed = event.services.filter((s: Service) => s.status === 'confirmed').length;
    const pending = event.services.filter((s: Service) => s.status === 'pending').length;
    const offered = event.services.filter((s: Service) => s.status === 'offered').length;
    return { confirmed, pending, offered, total: event.services.length };
  }, [event?.services]);

  // Budget calculations
  const budgetStats = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const paidExpenses = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
    const budget = event?.budget || 0;
    const remaining = budget - totalExpenses;
    const usagePercent = budget > 0 ? (totalExpenses / budget) * 100 : 0;

    // Category breakdown
    const byCategory = expenses.reduce((acc, e) => {
      if (!acc[e.category]) acc[e.category] = 0;
      acc[e.category] += e.amount;
      return acc;
    }, {} as Record<string, number>);

    return { totalExpenses, paidExpenses, pendingExpenses, remaining, usagePercent, byCategory };
  }, [expenses, event?.budget]);

  // Ticket check-in calculations
  const checkInStats = useMemo(() => {
    const totalSold = ticketCategories.reduce((sum, c) => sum + c.sold, 0);
    const totalCheckedIn = ticketCategories.reduce((sum, c) => sum + c.checkedIn, 0);
    const checkInRate = totalSold > 0 ? (totalCheckedIn / totalSold) * 100 : 0;
    const notEntered = totalSold - totalCheckedIn;
    return { totalSold, totalCheckedIn, checkInRate, notEntered };
  }, [ticketCategories]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    if (expenseFilter === 'all') return expenses;
    return expenses.filter(e => e.status === expenseFilter);
  }, [expenses, expenseFilter]);

  if (!event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Etkinlik bulunamadı</Text>
      </SafeAreaView>
    );
  }

  // Handle call
  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Bilgi', 'Telefon numarası bulunamadı');
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${event.title}\n📅 ${event.date}\n📍 ${event.venue}, ${event.district}\n\nTuring ile organize edildi.`,
        title: event.title,
      });
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu');
    }
  };

  // Handle menu
  const handleMenu = () => {
    Alert.alert(
      'Etkinlik Seçenekleri',
      'Ne yapmak istiyorsunuz?',
      [
        { text: 'PDF Rapor İndir', onPress: () => Alert.alert('İndiriliyor', 'Etkinlik raporu PDF olarak hazırlanıyor...') },
        { text: 'E-posta ile Gönder', onPress: () => Linking.openURL(`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(`Etkinlik Detayları:\n\n${event.title}\nTarih: ${event.date}\nMekan: ${event.venue}\nBütçe: ₺${event.budget.toLocaleString('tr-TR')}`)}`) },
        { text: 'Etkinliği Klonla', onPress: () => Alert.alert('Klonlandı', 'Etkinlik taslak olarak kopyalandı. Etkinliklerim sayfasından düzenleyebilirsiniz.') },
        { text: 'Tedarikçilere Bildirim', onPress: () => Alert.alert('Bildirim', 'Tüm tedarikçilere bildirim gönderildi.') },
        { text: 'İptal', style: 'cancel' },
      ]
    );
  };

  // Expense handlers
  const handleAddExpense = () => {
    if (!expenseForm.title || !expenseForm.amount) {
      Alert.alert('Hata', 'Lütfen gider adı ve tutarı girin');
      return;
    }
    const newExpense: Expense = {
      id: `e${Date.now()}`,
      title: expenseForm.title,
      amount: parseInt(expenseForm.amount.replace(/\./g, '')),
      category: expenseForm.category,
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: 'pending',
      notes: expenseForm.notes,
      provider: expenseForm.provider,
    };
    setExpenses([newExpense, ...expenses]);
    setExpenseForm({ title: '', amount: '', category: 'other', notes: '', provider: '' });
    setShowAddExpenseModal(false);
    Alert.alert('Başarılı', 'Gider eklendi');
  };

  const handleEditExpense = () => {
    if (!editingExpense || !expenseForm.title || !expenseForm.amount) return;
    setExpenses(expenses.map(e => e.id === editingExpense.id ? {
      ...e,
      title: expenseForm.title,
      amount: parseInt(expenseForm.amount.replace(/\./g, '')),
      category: expenseForm.category,
      notes: expenseForm.notes,
      provider: expenseForm.provider,
    } : e));
    setEditingExpense(null);
    setExpenseForm({ title: '', amount: '', category: 'other', notes: '', provider: '' });
    setShowAddExpenseModal(false);
    Alert.alert('Başarılı', 'Gider güncellendi');
  };

  const handleDeleteExpense = (id: string) => {
    Alert.alert('Gideri Sil', 'Bu gideri silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => {
        setExpenses(expenses.filter(e => e.id !== id));
        Alert.alert('Silindi', 'Gider silindi');
      }},
    ]);
  };

  const handleToggleExpenseStatus = (id: string) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, status: e.status === 'paid' ? 'pending' : 'paid' } : e));
  };

  const openEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      notes: expense.notes || '',
      provider: expense.provider || '',
    });
    setShowAddExpenseModal(true);
  };

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Ticket check-in handler
  const handleScanTicket = () => {
    Alert.alert('Bilet Tara', 'QR kod tarayıcı açılıyor...', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Simüle Et', onPress: () => {
        // Simulate a check-in
        setTicketCategories(prev => prev.map((cat, idx) => idx === 1 ? { ...cat, checkedIn: cat.checkedIn + 1 } : cat));
        Alert.alert('✅ Giriş Onaylandı', 'Bilet: STD-4371\nKategori: Standart\nSaat: ' + new Date().toLocaleTimeString('tr-TR'));
      }},
    ]);
  };

  // Toggle platform selection
  const togglePlatformSelection = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  // Generate email content for ticket sales
  const generateSalesEmailContent = () => {
    const ticketInfo = ticketCategories.map(cat =>
      `• ${cat.name}: ₺${cat.price} (${cat.capacity} adet)`
    ).join('\n');

    const emailBody = `
Sayın Yetkili,

${event?.title || 'Etkinlik'} için bilet satış talebimizi iletmek istiyoruz.

ETKİNLİK BİLGİLERİ
━━━━━━━━━━━━━━━━━━━━
Etkinlik Adı: ${event?.title}
Tarih: ${event?.date}
Saat: ${event?.time || '20:00'}
Mekan: ${event?.venue}, ${event?.district}
Tahmini Katılımcı: ${event?.attendees?.toLocaleString() || '15.000'} kişi

BİLET KATEGORİLERİ
━━━━━━━━━━━━━━━━━━━━
${ticketInfo}

${salesNote ? `EK NOTLAR\n━━━━━━━━━━━━━━━━━━━━\n${salesNote}\n` : ''}
Satış başlangıç tarihi ve komisyon oranları hakkında görüşmek üzere sizinle iletişime geçmek istiyoruz.

Saygılarımızla,
Turing Organizatör

---
Bu talep Turing Etkinlik Yönetim Sistemi üzerinden gönderilmiştir.
    `.trim();

    return emailBody;
  };

  // Send sales request to selected platforms
  const handleSendSalesRequest = () => {
    if (selectedPlatforms.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir platform seçin');
      return;
    }

    const selectedPlatformData = platforms.filter(p => selectedPlatforms.includes(p.id));
    const emails = selectedPlatformData.map(p => p.email).join(',');
    const subject = encodeURIComponent(`Bilet Satış Talebi: ${event?.title}`);
    const body = encodeURIComponent(generateSalesEmailContent());

    // Open mail client
    Linking.openURL(`mailto:${emails}?subject=${subject}&body=${body}`);

    // Update status
    setTicketSalesStatus('pending');
    setPlatforms(prev => prev.map(p =>
      selectedPlatforms.includes(p.id) ? { ...p, isActive: true } : p
    ));
    setShowSalesModal(false);
    setSelectedPlatforms([]);
    setSalesNote('');

    Alert.alert(
      'Talep Gönderildi',
      `${selectedPlatformData.length} platforma bilet satış talebi gönderildi. Yanıtları bekleyiniz.`
    );
  };

  // Activate ticket sales (after platform confirmation)
  const handleActivateSales = () => {
    Alert.alert(
      'Satışı Aktifleştir',
      'Seçili platformlarda bilet satışını aktifleştirmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Aktifleştir', onPress: () => {
          setTicketSalesStatus('active');
          Alert.alert('Başarılı', 'Bilet satışı aktifleştirildi!');
        }},
      ]
    );
  };

  const handleReviewProvider = (service: Service) => {
    if (service.provider && service.providerId) {
      setRatingTarget({
        id: service.providerId,
        name: service.provider,
        image: service.providerImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400',
        type: 'provider',
        serviceCategory: service.category,
      });
      setShowRatingModal(true);
    }
  };

  const handleServicePress = (service: Service) => {
    if (service.status === 'confirmed' && service.providerId) {
      navigation.navigate('ProviderDetail', { providerId: service.providerId });
    } else if (service.status === 'offered') {
      const offer = getOfferByServiceId(service.id);
      if (offer) {
        navigation.navigate('OfferDetail', { offerId: offer.id });
      } else {
        navigation.navigate('OffersTab');
      }
    } else if (service.status === 'pending') {
      navigation.navigate('ServiceProviders', { category: service.category });
    }
  };

  const renderServiceCard = (service: Service) => {
    const statusInfo = getServiceStatusInfo(service.status, colors);
    const categoryInfo = getCategoryInfo(service.category);

    return (
      <View
        key={service.id}
        style={[
          styles.serviceCard,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
          },
          isDark ? {} : helpers.getShadow('sm'),
        ]}
      >
        <TouchableOpacity
          style={styles.serviceHeader}
          activeOpacity={0.7}
          onPress={() => handleServicePress(service)}
        >
          <LinearGradient
            colors={categoryInfo.gradient}
            style={styles.serviceCategoryIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={categoryInfo.icon} size={14} color="white" />
          </LinearGradient>
          <View style={styles.serviceInfo}>
            <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
            <Text style={[styles.serviceCategory, { color: colors.textMuted }]}>{categoryInfo.name}</Text>
          </View>
          <View style={[styles.serviceStatusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} />
            <Text style={[styles.serviceStatusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.serviceDetails}>
          <View style={styles.serviceDetailItem}>
            <Text style={[styles.serviceDetailLabel, { color: colors.textMuted }]}>Tedarikçi</Text>
            <Text style={[styles.serviceDetailValue, { color: colors.text }]}>{service.provider || 'Atanmadı'}</Text>
          </View>
          <View style={styles.serviceDetailItem}>
            <Text style={[styles.serviceDetailLabel, { color: colors.textMuted }]}>Tutar</Text>
            <Text style={[styles.serviceDetailValue, { color: colors.text }]}>₺{service.price.toLocaleString('tr-TR')}</Text>
          </View>
        </View>

        {service.status === 'pending' && (
          <TouchableOpacity
            style={styles.serviceActionButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ServiceProviders', { category: service.category })}
          >
            <LinearGradient colors={gradients.primary} style={styles.serviceActionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="search" size={14} color="white" />
              <Text style={styles.serviceActionText}>Tedarikçi Bul</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {service.status === 'offered' && (
          <TouchableOpacity
            style={styles.serviceActionButton}
            activeOpacity={0.8}
            onPress={() => {
              const offer = getOfferByServiceId(service.id);
              if (offer) {
                navigation.navigate('OfferDetail', { offerId: offer.id });
              } else {
                navigation.navigate('OffersTab');
              }
            }}
          >
            <LinearGradient colors={gradients.primary} style={styles.serviceActionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="document-text" size={14} color="white" />
              <Text style={styles.serviceActionText}>Teklifi Gör</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {service.status === 'confirmed' && service.provider && (
          <View style={styles.confirmedServiceActions}>
            <TouchableOpacity
              style={[styles.confirmedActionBtn, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}
              activeOpacity={0.7}
              onPress={() => handleCall(service.providerPhone)}
            >
              <Ionicons name="call" size={14} color={colors.success} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmedActionBtn, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.1)' }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Chat', { chatId: `provider_${service.id}`, recipientName: service.provider })}
            >
              <Ionicons name="chatbubble" size={14} color={colors.brand[400]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmedActionBtn, { flex: 1, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Contract', { contractId: service.id })}
            >
              <Ionicons name="document-text" size={14} color={colors.info} />
              <Text style={[styles.confirmedActionText, { color: colors.info }]}>Sozlesme</Text>
            </TouchableOpacity>
            {event?.status === 'completed' && (
              <TouchableOpacity
                style={[styles.confirmedActionBtn, { flex: 1, backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }]}
                activeOpacity={0.7}
                onPress={() => handleReviewProvider(service)}
              >
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={[styles.confirmedActionText, { color: '#F59E0B' }]}>Degerlendir</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderTimelineItem = (item: TimelineItem, index: number, isLast: boolean) => {
    const typeColor = getTimelineTypeColor(item.type, colors);
    return (
      <View key={item.id} style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          <View style={[styles.timelineIcon, { backgroundColor: item.completed ? typeColor : isDark ? colors.zinc[700] : colors.zinc[300] }]}>
            <Ionicons name={getTimelineTypeIcon(item.type)} size={12} color="white" />
          </View>
          {!isLast && <View style={[styles.timelineLine, { backgroundColor: item.completed ? typeColor : isDark ? colors.zinc[700] : colors.zinc[300] }]} />}
        </View>
        <View style={styles.timelineContent}>
          <Text style={[styles.timelineDate, { color: colors.textMuted }]}>{item.date}</Text>
          <Text style={[styles.timelineTitle, { color: item.completed ? colors.text : colors.textSecondary }]}>{item.title}</Text>
          <Text style={[styles.timelineDescription, { color: colors.textMuted }]}>{item.description}</Text>
        </View>
        {item.completed && <Ionicons name="checkmark-circle" size={18} color={colors.success} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.headerImage}>
          <Image source={{ uri: event.image }} style={styles.eventImage} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.imageGradient} />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleShare}><Ionicons name="share-outline" size={20} color="white" /></TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleMenu}><Ionicons name="ellipsis-horizontal" size={20} color="white" /></TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusBadgeText, { color: colors.success }]}>
                {event.status === 'confirmed' ? 'Onaylandı' : event.status === 'planning' ? 'Planlama' : 'Taslak'}
              </Text>
            </View>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.eventMeta}>
              <View style={styles.eventMetaItem}><Ionicons name="calendar" size={14} color="white" /><Text style={styles.eventMetaText}>{event.date}</Text></View>
              <View style={styles.eventMetaItem}><Ionicons name="location" size={14} color="white" /><Text style={styles.eventMetaText}>{event.venue}, {event.district}</Text></View>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={[styles.progressSection, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Genel İlerleme</Text>
            <Text style={[styles.progressPercent, { color: colors.brand[400] }]}>{event.progress}%</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border }]}>
            <LinearGradient colors={gradients.primary} style={[styles.progressFill, { width: `${event.progress}%` }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressStatItem}><View style={[styles.progressStatDot, { backgroundColor: colors.success }]} /><Text style={[styles.progressStatText, { color: colors.textMuted }]}>{stats.confirmed} Onaylı</Text></View>
            <View style={styles.progressStatItem}><View style={[styles.progressStatDot, { backgroundColor: colors.warning }]} /><Text style={[styles.progressStatText, { color: colors.textMuted }]}>{stats.pending} Bekliyor</Text></View>
            <View style={styles.progressStatItem}><View style={[styles.progressStatDot, { backgroundColor: colors.info }]} /><Text style={[styles.progressStatText, { color: colors.textMuted }]}>{stats.offered} Teklif</Text></View>
          </View>
        </View>

        {/* Quick Info Cards */}
        <View style={[styles.quickInfoContainer, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
          {[
            { icon: 'people', color: colors.brand[400], value: event.attendees.toLocaleString('tr-TR'), label: 'Katılımcı' },
            { icon: 'wallet', color: colors.success, value: `₺${(event.budget / 1000).toFixed(0)}K`, label: 'Bütçe' },
            { icon: 'time', color: colors.warning, value: event.time.split(' - ')[0], label: 'Başlangıç' },
          ].map((item, idx) => (
            <View key={idx} style={[styles.quickInfoCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }, isDark ? {} : helpers.getShadow('sm')]}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
              <Text style={[styles.quickInfoValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[styles.quickInfoLabel, { color: colors.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Section Tabs - Minimal Design */}
        <View style={[styles.sectionTabsContainer, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectionTabsContent}
          >
            {(isTicketed ? ['services', 'timeline', 'budget', 'tickets', 'poster'] as const : ['services', 'timeline', 'budget', 'poster'] as const).map(section => {
              const labels: Record<string, string> = { services: 'Hizmetler', timeline: 'Zaman Çizelgesi', budget: 'Bütçe', tickets: 'Biletler', poster: 'Afiş' };
              const isActive = activeSection === section;
              return (
                <TouchableOpacity
                  key={section}
                  style={styles.sectionTab}
                  onPress={() => setActiveSection(section)}
                >
                  <Text style={[styles.sectionTabText, { color: isActive ? colors.brand[400] : colors.textMuted }]}>{labels[section]}</Text>
                  {isActive && <View style={[styles.sectionTabIndicator, { backgroundColor: colors.brand[400] }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Services Section */}
        {activeSection === 'services' && (
          <View style={styles.servicesSection}>
            {Object.entries(servicesByCategory).map(([category, services]) => (
              <View key={category} style={styles.serviceCategoryGroup}>
                <View style={styles.serviceCategoryHeader}>
                  <Text style={[styles.serviceCategoryTitle, { color: colors.text }]}>{getCategoryInfo(category).name}</Text>
                  <Text style={[styles.serviceCategoryCount, { color: colors.textMuted }]}>{services.length} hizmet</Text>
                </View>
                {services.map(service => renderServiceCard(service))}
              </View>
            ))}
            <TouchableOpacity style={styles.addServiceButton} onPress={() => Alert.alert('Hizmet Ekle', 'Hangi kategoriden hizmet eklemek istiyorsunuz?', [{ text: 'Booking', onPress: () => navigation.navigate('ServiceProviders', { category: 'booking' }) }, { text: 'Teknik', onPress: () => navigation.navigate('ServiceProviders', { category: 'technical' }) }, { text: 'Operasyon', onPress: () => navigation.navigate('ServiceProviders', { category: 'operation' }) }, { text: 'İptal', style: 'cancel' }])}>
              <Ionicons name="add" size={20} color={colors.brand[400]} />
              <Text style={[styles.addServiceText, { color: colors.brand[400] }]}>Hizmet Ekle</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Timeline Section */}
        {activeSection === 'timeline' && (
          <View style={styles.timelineSection}>
            {mockTimeline.map((item, index) => renderTimelineItem(item, index, index === mockTimeline.length - 1))}
          </View>
        )}

        {/* Budget Section - Redesigned */}
        {activeSection === 'budget' && (
          <View style={styles.budgetSection}>
            {/* Budget Overview Cards */}
            <View style={styles.budgetCardsRow}>
              <View style={[styles.budgetCard, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.08)', borderColor: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.15)' }]}>
                <Ionicons name="wallet" size={20} color={colors.brand[400]} />
                <Text style={[styles.budgetCardValue, { color: colors.text }]}>₺{event.budget.toLocaleString('tr-TR')}</Text>
                <Text style={[styles.budgetCardLabel, { color: colors.textMuted }]}>Toplam Bütçe</Text>
              </View>
              <View style={[styles.budgetCard, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)', borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)' }]}>
                <Ionicons name="trending-down" size={20} color={colors.warning} />
                <Text style={[styles.budgetCardValue, { color: colors.text }]}>₺{budgetStats.totalExpenses.toLocaleString('tr-TR')}</Text>
                <Text style={[styles.budgetCardLabel, { color: colors.textMuted }]}>Toplam Gider</Text>
              </View>
            </View>
            <View style={styles.budgetCardsRow}>
              <View style={[styles.budgetCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)', borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.budgetCardValue, { color: colors.text }]}>₺{budgetStats.paidExpenses.toLocaleString('tr-TR')}</Text>
                <Text style={[styles.budgetCardLabel, { color: colors.textMuted }]}>Ödenen</Text>
              </View>
              <View style={[styles.budgetCard, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)', borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="time" size={20} color={colors.error} />
                <Text style={[styles.budgetCardValue, { color: colors.text }]}>₺{budgetStats.pendingExpenses.toLocaleString('tr-TR')}</Text>
                <Text style={[styles.budgetCardLabel, { color: colors.textMuted }]}>Bekleyen</Text>
              </View>
            </View>

            {/* Budget Usage Bar */}
            <View style={[styles.budgetUsageCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
              <View style={styles.budgetUsageHeader}>
                <Text style={[styles.budgetUsageTitle, { color: colors.text }]}>Bütçe Kullanımı</Text>
                <Text style={[styles.budgetUsagePercent, { color: budgetStats.usagePercent > 90 ? colors.error : budgetStats.usagePercent > 70 ? colors.warning : colors.success }]}>{budgetStats.usagePercent.toFixed(1)}%</Text>
              </View>
              <View style={[styles.budgetUsageBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border }]}>
                <LinearGradient
                  colors={budgetStats.usagePercent > 90 ? ['#ef4444', '#f87171'] : budgetStats.usagePercent > 70 ? ['#f59e0b', '#fbbf24'] : gradients.primary}
                  style={[styles.budgetUsageFill, { width: `${Math.min(budgetStats.usagePercent, 100)}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <View style={styles.budgetUsageFooter}>
                <Text style={[styles.budgetUsageRemaining, { color: budgetStats.remaining >= 0 ? colors.success : colors.error }]}>
                  {budgetStats.remaining >= 0 ? `₺${budgetStats.remaining.toLocaleString('tr-TR')} kalan` : `₺${Math.abs(budgetStats.remaining).toLocaleString('tr-TR')} aşım`}
                </Text>
              </View>
            </View>

            {/* Category Breakdown */}
            <View style={[styles.categoryBreakdownCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
              <Text style={[styles.categoryBreakdownTitle, { color: colors.text }]}>Kategori Dağılımı</Text>
              {Object.entries(budgetStats.byCategory).map(([category, amount]) => {
                const catInfo = getExpenseCategoryInfo(category as Expense['category']);
                const percent = event.budget > 0 ? (amount / event.budget) * 100 : 0;
                return (
                  <View key={category} style={styles.categoryBreakdownItem}>
                    <View style={styles.categoryBreakdownLeft}>
                      <View style={[styles.categoryBreakdownIcon, { backgroundColor: catInfo.color + '20' }]}>
                        <Ionicons name={catInfo.icon as any} size={14} color={catInfo.color} />
                      </View>
                      <Text style={[styles.categoryBreakdownName, { color: colors.text }]}>{catInfo.name}</Text>
                    </View>
                    <View style={styles.categoryBreakdownRight}>
                      <Text style={[styles.categoryBreakdownAmount, { color: colors.text }]}>₺{amount.toLocaleString('tr-TR')}</Text>
                      <Text style={[styles.categoryBreakdownPercent, { color: colors.textMuted }]}>{percent.toFixed(1)}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Expense Filter */}
            <View style={styles.expenseFilterRow}>
              <Text style={[styles.expenseListTitle, { color: colors.text }]}>Giderler</Text>
              <View style={styles.expenseFilterButtons}>
                {(['all', 'paid', 'pending'] as const).map(filter => (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.expenseFilterBtn, expenseFilter === filter && { backgroundColor: colors.brand[400] + '20' }]}
                    onPress={() => setExpenseFilter(filter)}
                  >
                    <Text style={[styles.expenseFilterText, { color: expenseFilter === filter ? colors.brand[400] : colors.textMuted }]}>
                      {filter === 'all' ? 'Tümü' : filter === 'paid' ? 'Ödenen' : 'Bekleyen'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Expense List */}
            {filteredExpenses.map(expense => {
              const catInfo = getExpenseCategoryInfo(expense.category);
              return (
                <View key={expense.id} style={[styles.expenseItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
                  <TouchableOpacity style={styles.expenseStatusBtn} onPress={() => handleToggleExpenseStatus(expense.id)}>
                    <Ionicons
                      name={expense.status === 'paid' ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={expense.status === 'paid' ? colors.success : colors.textMuted}
                    />
                  </TouchableOpacity>
                  <View style={styles.expenseInfo}>
                    <View style={styles.expenseHeader}>
                      <Text style={[styles.expenseTitle, { color: colors.text }]}>{expense.title}</Text>
                      <View style={[styles.expenseCategoryBadge, { backgroundColor: catInfo.color + '20' }]}>
                        <Ionicons name={catInfo.icon as any} size={10} color={catInfo.color} />
                        <Text style={[styles.expenseCategoryText, { color: catInfo.color }]}>{catInfo.name}</Text>
                      </View>
                    </View>
                    {expense.provider && <Text style={[styles.expenseProvider, { color: colors.textMuted }]}>{expense.provider}</Text>}
                    <View style={styles.expenseFooter}>
                      <Text style={[styles.expenseDate, { color: colors.textMuted }]}>{expense.date}</Text>
                      <Text style={[styles.expenseAmount, { color: expense.status === 'paid' ? colors.success : colors.warning }]}>₺{expense.amount.toLocaleString('tr-TR')}</Text>
                    </View>
                  </View>
                  <View style={styles.expenseActions}>
                    <TouchableOpacity style={styles.expenseActionBtn} onPress={() => openEditExpense(expense)}>
                      <Ionicons name="create-outline" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.expenseActionBtn} onPress={() => handleDeleteExpense(expense.id)}>
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Add Expense Button */}
            <TouchableOpacity
              style={[styles.addExpenseButton, { borderColor: colors.brand[400] }]}
              onPress={() => { setEditingExpense(null); setExpenseForm({ title: '', amount: '', category: 'other', notes: '', provider: '' }); setShowAddExpenseModal(true); }}
            >
              <Ionicons name="add" size={20} color={colors.brand[400]} />
              <Text style={[styles.addExpenseText, { color: colors.brand[400] }]}>Yeni Gider Ekle</Text>
            </TouchableOpacity>

            {/* Export Button */}
            <TouchableOpacity style={styles.exportButton} onPress={() => Alert.alert('Rapor İndiriliyor', 'Bütçe raporu PDF olarak hazırlanıyor...')}>
              <Ionicons name="download-outline" size={18} color={colors.brand[400]} />
              <Text style={[styles.exportButtonText, { color: colors.brand[400] }]}>Bütçe Raporu İndir (PDF)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tickets Section - Bilet Satışı & Kontrol */}
        {activeSection === 'tickets' && isTicketed && (
          <View style={styles.ticketsSection}>
            {/* Ticket Sales Status Card */}
            <View style={[styles.salesStatusCard, {
              backgroundColor: ticketSalesStatus === 'active'
                ? (isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)')
                : ticketSalesStatus === 'pending'
                ? (isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)')
                : (isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.08)'),
              borderColor: ticketSalesStatus === 'active'
                ? (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)')
                : ticketSalesStatus === 'pending'
                ? (isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)')
                : (isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.15)')
            }]}>
              <View style={styles.salesStatusHeader}>
                <View style={styles.salesStatusLeft}>
                  <View style={[styles.salesStatusIcon, {
                    backgroundColor: ticketSalesStatus === 'active' ? colors.success : ticketSalesStatus === 'pending' ? colors.warning : colors.brand[400]
                  }]}>
                    <Ionicons
                      name={ticketSalesStatus === 'active' ? 'checkmark-circle' : ticketSalesStatus === 'pending' ? 'time' : 'storefront'}
                      size={20}
                      color="white"
                    />
                  </View>
                  <View>
                    <Text style={[styles.salesStatusTitle, { color: colors.text }]}>Bilet Satışı</Text>
                    <Text style={[styles.salesStatusSubtitle, {
                      color: ticketSalesStatus === 'active' ? colors.success : ticketSalesStatus === 'pending' ? colors.warning : colors.textMuted
                    }]}>
                      {ticketSalesStatus === 'active' ? 'Satışta' : ticketSalesStatus === 'pending' ? 'Onay Bekleniyor' : 'Satışa Açılmadı'}
                    </Text>
                  </View>
                </View>
                {ticketSalesStatus === 'not_started' && (
                  <TouchableOpacity style={styles.openSalesBtn} onPress={() => setShowSalesModal(true)}>
                    <LinearGradient colors={gradients.primary} style={styles.openSalesBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <Ionicons name="rocket" size={16} color="white" />
                      <Text style={styles.openSalesBtnText}>Satışa Aç</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                {ticketSalesStatus === 'pending' && (
                  <TouchableOpacity style={[styles.activateSalesBtn, { backgroundColor: colors.success }]} onPress={handleActivateSales}>
                    <Ionicons name="checkmark" size={18} color="white" />
                    <Text style={styles.activateSalesBtnText}>Onayla</Text>
                  </TouchableOpacity>
                )}
                {ticketSalesStatus === 'active' && (
                  <View style={[styles.salesActiveBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    <Text style={[styles.salesActiveBadgeText, { color: colors.success }]}>Aktif</Text>
                  </View>
                )}
              </View>
              {ticketSalesStatus !== 'not_started' && (
                <View style={styles.salesPlatformsList}>
                  <Text style={[styles.salesPlatformsLabel, { color: colors.textMuted }]}>Platformlar:</Text>
                  <View style={styles.salesPlatformsBadges}>
                    {platforms.filter(p => p.isActive).map(p => (
                      <View key={p.id} style={[styles.salesPlatformBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                        <Text style={[styles.salesPlatformBadgeText, { color: colors.text }]}>{p.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Check-in Hero Card - Only show when sales are active */}
            {ticketSalesStatus === 'active' && (
              <View style={[styles.checkInHeroCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }]}>
                <View style={styles.checkInHeroContent}>
                  <View style={styles.checkInHeroLeft}>
                    <Text style={[styles.checkInHeroLabel, { color: colors.success }]}>Giriş Yapan</Text>
                    <Text style={[styles.checkInHeroValue, { color: colors.text }]}>{checkInStats.totalCheckedIn.toLocaleString()}</Text>
                    <Text style={[styles.checkInHeroSub, { color: colors.textMuted }]}>/ {checkInStats.totalSold.toLocaleString()} satılan</Text>
                  </View>
                  <View style={styles.checkInHeroRight}>
                    <View style={[styles.checkInRateCircle, { borderColor: colors.success }]}>
                      <Text style={[styles.checkInRateValue, { color: colors.success }]}>{checkInStats.checkInRate.toFixed(0)}%</Text>
                      <Text style={[styles.checkInRateLabel, { color: colors.textMuted }]}>Giriş</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.scanTicketBtn} onPress={handleScanTicket}>
                  <LinearGradient colors={['#10b981', '#34d399']} style={styles.scanTicketBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Ionicons name="qr-code" size={20} color="white" />
                    <Text style={styles.scanTicketBtnText}>Bilet Tara</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Stats Grid */}
            <View style={styles.ticketStatsGrid}>
              <View style={[styles.ticketStatCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
                <View style={[styles.ticketStatIcon, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.1)' }]}>
                  <Ionicons name="ticket" size={18} color={colors.brand[400]} />
                </View>
                <Text style={[styles.ticketStatValue, { color: colors.text }]}>{totalTicketsSold.toLocaleString()}</Text>
                <Text style={[styles.ticketStatLabel, { color: colors.textMuted }]}>Satılan</Text>
              </View>
              <View style={[styles.ticketStatCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
                <View style={[styles.ticketStatIcon, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
                  <Ionicons name="cash" size={18} color={colors.success} />
                </View>
                <Text style={[styles.ticketStatValue, { color: colors.text }]}>₺{(totalRevenue / 1000).toFixed(0)}k</Text>
                <Text style={[styles.ticketStatLabel, { color: colors.textMuted }]}>Ciro</Text>
              </View>
              <View style={[styles.ticketStatCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
                <View style={[styles.ticketStatIcon, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }]}>
                  <Ionicons name="people" size={18} color={colors.warning} />
                </View>
                <Text style={[styles.ticketStatValue, { color: colors.text }]}>{checkInStats.notEntered.toLocaleString()}</Text>
                <Text style={[styles.ticketStatLabel, { color: colors.textMuted }]}>Gelmedi</Text>
              </View>
              <View style={[styles.ticketStatCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
                <View style={[styles.ticketStatIcon, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}>
                  <Ionicons name="analytics" size={18} color={colors.info} />
                </View>
                <Text style={[styles.ticketStatValue, { color: colors.text }]}>₺{avgTicketPrice}</Text>
                <Text style={[styles.ticketStatLabel, { color: colors.textMuted }]}>Ort. Fiyat</Text>
              </View>
            </View>

            {/* Ticket Categories with Check-in */}
            <View style={[styles.ticketCategoriesCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
              <View style={styles.ticketCategoriesHeader}>
                <Ionicons name="pricetags" size={16} color={colors.brand[400]} />
                <Text style={[styles.ticketCategoriesTitle, { color: colors.text }]}>Bilet Kategorileri</Text>
              </View>
              {ticketCategories.map((category, index) => {
                const checkInPercent = category.sold > 0 ? (category.checkedIn / category.sold) * 100 : 0;
                return (
                  <View key={category.id} style={[styles.ticketCategoryItem, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }, index === ticketCategories.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={styles.ticketCategoryMain}>
                      <View style={styles.ticketCategoryInfo}>
                        <Text style={[styles.ticketCategoryName, { color: colors.text }]}>{category.name}</Text>
                        <Text style={[styles.ticketCategoryPrice, { color: colors.brand[400] }]}>₺{category.price}</Text>
                      </View>
                      <View style={styles.ticketCategoryStats}>
                        <View style={styles.ticketCategoryStat}>
                          <Ionicons name="ticket-outline" size={14} color={colors.textMuted} />
                          <Text style={[styles.ticketCategoryStatText, { color: colors.text }]}>{category.sold}</Text>
                          <Text style={[styles.ticketCategoryStatLabel, { color: colors.textMuted }]}>satış</Text>
                        </View>
                        <View style={styles.ticketCategoryStat}>
                          <Ionicons name="enter-outline" size={14} color={colors.success} />
                          <Text style={[styles.ticketCategoryStatText, { color: colors.success }]}>{category.checkedIn}</Text>
                          <Text style={[styles.ticketCategoryStatLabel, { color: colors.textMuted }]}>giriş</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.ticketCategoryBarContainer}>
                      <View style={[styles.ticketCategoryBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border }]}>
                        <View style={[styles.ticketCategoryBarFill, { width: `${checkInPercent}%`, backgroundColor: colors.success }]} />
                      </View>
                      <Text style={[styles.ticketCategoryBarPercent, { color: colors.textMuted }]}>{checkInPercent.toFixed(0)}% giriş</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Platform Performance */}
            <View style={[styles.platformCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
              <View style={styles.platformHeader}>
                <Ionicons name="bar-chart" size={16} color={colors.brand[400]} />
                <Text style={[styles.platformTitle, { color: colors.text }]}>Platform Satışları</Text>
              </View>
              {platforms.map((platform, index) => (
                <View key={platform.id} style={[styles.platformItem, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }, index === platforms.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.platformInfo}>
                    <View style={[styles.platformLogo, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.1)' }]}>
                      <Text style={[styles.platformLogoText, { color: colors.brand[400] }]}>{platform.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.platformDetails}>
                      <Text style={[styles.platformName, { color: colors.text }]}>{platform.name}</Text>
                      <Text style={[styles.platformEmail, { color: colors.textMuted }]}>%{platform.commission} komisyon</Text>
                    </View>
                  </View>
                  <View style={styles.platformStats}>
                    <Text style={[styles.platformSold, { color: colors.text }]}>{platform.ticketsSold.toLocaleString()}</Text>
                    <Text style={[styles.platformRevenue, { color: colors.success }]}>₺{(platform.revenue / 1000).toFixed(0)}k</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Price Management */}
            <View style={[styles.priceManagementCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
              <View style={styles.priceManagementHeader}>
                <Ionicons name="pricetag" size={16} color={colors.warning} />
                <Text style={[styles.priceManagementTitle, { color: colors.text }]}>Fiyat Yönetimi</Text>
              </View>
              {ticketCategories.filter(c => c.remaining > 0).map((category, index) => (
                <View key={category.id} style={[styles.priceManagementItem, index < ticketCategories.filter(c => c.remaining > 0).length - 1 && { marginBottom: 12 }]}>
                  <View style={styles.priceManagementInfo}>
                    <Text style={[styles.priceManagementName, { color: colors.text }]}>{category.name}</Text>
                    <Text style={[styles.priceManagementCurrent, { color: colors.brand[400] }]}>₺{category.newPrice || category.price}</Text>
                  </View>
                  <View style={styles.priceManagementActions}>
                    {category.newPrice ? (
                      <TouchableOpacity style={[styles.priceResetBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]} onPress={() => handleResetPrice(category.id)}>
                        <Ionicons name="close" size={16} color={colors.error} />
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity style={[styles.priceAdjustBtn, { borderColor: colors.brand[400] }]} onPress={() => handlePriceIncrease(category.id, 25)}>
                          <Text style={[styles.priceAdjustText, { color: colors.brand[400] }]}>+₺25</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.priceAdjustBtn, { borderColor: colors.brand[400] }]} onPress={() => handlePriceIncrease(category.id, 50)}>
                          <Text style={[styles.priceAdjustText, { color: colors.brand[400] }]}>+₺50</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}
              {ticketCategories.some(c => c.newPrice) && (
                <TouchableOpacity style={styles.sendPriceChangeBtn} onPress={handleSendPriceChange}>
                  <LinearGradient colors={gradients.primary} style={styles.sendPriceChangeBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Ionicons name="send" size={16} color="white" />
                    <Text style={styles.sendPriceChangeBtnText}>Fiyat Değişikliğini Bildir</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.ticketQuickActions}>
              <TouchableOpacity style={[styles.ticketQuickActionBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]} onPress={() => Alert.alert('Rapor', 'Bilet satış raporu hazırlanıyor...')}>
                <Ionicons name="document-text-outline" size={20} color={colors.brand[400]} />
                <Text style={[styles.ticketQuickActionText, { color: colors.text }]}>Satış Raporu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ticketQuickActionBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]} onPress={() => Alert.alert('Giriş Listesi', 'Check-in listesi indiriliyor...')}>
                <Ionicons name="list-outline" size={20} color={colors.success} />
                <Text style={[styles.ticketQuickActionText, { color: colors.text }]}>Giriş Listesi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ticketQuickActionBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]} onPress={() => Linking.openURL('mailto:biletix@example.com,mobilet@example.com?subject=Etkinlik%20Bildirimi')}>
                <Ionicons name="mail-outline" size={20} color={colors.info} />
                <Text style={[styles.ticketQuickActionText, { color: colors.text }]}>Platformlara Mail</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Poster Section - AI Poster Generator */}
        {activeSection === 'poster' && (
          <View style={styles.posterSection}>
            <PosterGenerator
              eventTitle={event.title}
              eventDate={event.date}
              eventVenue={event.venue}
              eventLocation={event.location}
              eventImage={event.image}
              artistNames={event.services?.filter((s: any) => s.category === 'booking').map((s: any) => s.provider) || []}
            />
          </View>
        )}

        {/* Action Buttons - Only in Services Tab */}
        {activeSection === 'services' && (
          <>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.actionButtonSecondary, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }, isDark ? {} : helpers.getShadow('sm')]} onPress={() => setShowReviseModal(true)}>
                <Ionicons name="create-outline" size={18} color={colors.text} />
                <Text style={[styles.actionButtonSecondaryText, { color: colors.text }]}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButtonSecondary, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }, isDark ? {} : helpers.getShadow('sm')]} onPress={() => setShowCancelModal(true)}>
                <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                <Text style={[styles.actionButtonSecondaryText, { color: colors.error }]}>İptal Et</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Actions - In Scroll */}
            <View style={[styles.bottomActionsInScroll, { paddingBottom: insets.bottom + TAB_BAR_HEIGHT }]}>
              <TouchableOpacity style={[styles.messageButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }, isDark ? {} : helpers.getShadow('sm')]} onPress={() => navigation.navigate('MessagesTab')}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.brand[400]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={() => Alert.alert('Etkinliği Yayınla', 'Etkinliğinizi yayınlamak istediğinize emin misiniz?', [{ text: 'İptal', style: 'cancel' }, { text: 'Yayınla', onPress: () => Alert.alert('Başarılı', 'Etkinliğiniz yayınlandı!') }])}>
                <LinearGradient colors={gradients.primary} style={styles.primaryButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="rocket" size={18} color="white" />
                  <Text style={styles.primaryButtonText}>Etkinliği Yayınla</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Bottom Spacing for other tabs */}
        {activeSection !== 'services' && (
          <View style={{ height: insets.bottom + TAB_BAR_HEIGHT + 20 }} />
        )}
      </ScrollView>

      <ReviseEventModal visible={showReviseModal} onClose={() => setShowReviseModal(false)} onSubmit={() => { Alert.alert('Başarılı', 'Değişiklik talebi gönderildi.'); setShowReviseModal(false); }} eventTitle={event.title} />
      <CancelEventModal visible={showCancelModal} onClose={() => setShowCancelModal(false)} onConfirm={() => { Alert.alert('Etkinlik İptal Edildi', 'Tedarikçilere bildirim gönderildi.'); setShowCancelModal(false); navigation.goBack(); }} eventTitle={event.title} eventDate={event.date} totalSpent={event.spent} confirmedProviders={stats.confirmed} />

      {/* Add/Edit Expense Modal */}
      <Modal visible={showAddExpenseModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.expenseModalContent, { backgroundColor: colors.background }]}>
            <View style={styles.expenseModalHeader}>
              <Text style={[styles.expenseModalTitle, { color: colors.text }]}>{editingExpense ? 'Gideri Düzenle' : 'Yeni Gider Ekle'}</Text>
              <TouchableOpacity onPress={() => { setShowAddExpenseModal(false); setEditingExpense(null); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.expenseModalBody} showsVerticalScrollIndicator={false}>
              <Text style={[styles.expenseInputLabel, { color: colors.textMuted }]}>Gider Adı *</Text>
              <TextInput
                style={[styles.expenseInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border, color: colors.text }]}
                placeholder="Örn: Ses Sistemi Kiralama"
                placeholderTextColor={colors.textMuted}
                value={expenseForm.title}
                onChangeText={text => setExpenseForm({ ...expenseForm, title: text })}
              />

              <Text style={[styles.expenseInputLabel, { color: colors.textMuted }]}>Tutar (₺) *</Text>
              <TextInput
                style={[styles.expenseInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border, color: colors.text }]}
                placeholder="Örn: 50.000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={expenseForm.amount}
                onChangeText={text => setExpenseForm({ ...expenseForm, amount: formatCurrency(text) })}
              />

              <Text style={[styles.expenseInputLabel, { color: colors.textMuted }]}>Kategori</Text>
              <View style={styles.expenseCategoryPicker}>
                {(['booking', 'technical', 'operation', 'marketing', 'venue', 'other'] as const).map(cat => {
                  const catInfo = getExpenseCategoryInfo(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.expenseCategoryOption, expenseForm.category === cat && { backgroundColor: catInfo.color + '20', borderColor: catInfo.color }]}
                      onPress={() => setExpenseForm({ ...expenseForm, category: cat })}
                    >
                      <Ionicons name={catInfo.icon as any} size={16} color={expenseForm.category === cat ? catInfo.color : colors.textMuted} />
                      <Text style={[styles.expenseCategoryOptionText, { color: expenseForm.category === cat ? catInfo.color : colors.textMuted }]}>{catInfo.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.expenseInputLabel, { color: colors.textMuted }]}>Tedarikçi / Firma</Text>
              <TextInput
                style={[styles.expenseInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border, color: colors.text }]}
                placeholder="Örn: ProSound"
                placeholderTextColor={colors.textMuted}
                value={expenseForm.provider}
                onChangeText={text => setExpenseForm({ ...expenseForm, provider: text })}
              />

              <Text style={[styles.expenseInputLabel, { color: colors.textMuted }]}>Notlar</Text>
              <TextInput
                style={[styles.expenseInput, styles.expenseTextArea, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border, color: colors.text }]}
                placeholder="Ek notlar..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={expenseForm.notes}
                onChangeText={text => setExpenseForm({ ...expenseForm, notes: text })}
              />
            </ScrollView>

            <View style={styles.expenseModalFooter}>
              <TouchableOpacity style={[styles.expenseModalCancelBtn, { borderColor: colors.border }]} onPress={() => { setShowAddExpenseModal(false); setEditingExpense(null); }}>
                <Text style={[styles.expenseModalCancelText, { color: colors.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.expenseModalSaveBtn} onPress={editingExpense ? handleEditExpense : handleAddExpense}>
                <LinearGradient colors={gradients.primary} style={styles.expenseModalSaveBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.expenseModalSaveText}>{editingExpense ? 'Güncelle' : 'Ekle'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ticket Sales Modal */}
      <Modal visible={showSalesModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.salesModalContent, { backgroundColor: colors.background }]}>
            <View style={styles.salesModalHeader}>
              <Text style={[styles.salesModalTitle, { color: colors.text }]}>Bilet Satışa Aç</Text>
              <TouchableOpacity onPress={() => { setShowSalesModal(false); setSelectedPlatforms([]); setSalesNote(''); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.salesModalBody} showsVerticalScrollIndicator={false}>
              {/* Event Summary */}
              <View style={[styles.salesEventSummary, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.08)', borderColor: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.15)' }]}>
                <Text style={[styles.salesEventTitle, { color: colors.text }]}>{event?.title}</Text>
                <View style={styles.salesEventMeta}>
                  <View style={styles.salesEventMetaItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.salesEventMetaText, { color: colors.textMuted }]}>{event?.date}</Text>
                  </View>
                  <View style={styles.salesEventMetaItem}>
                    <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.salesEventMetaText, { color: colors.textMuted }]}>{event?.venue}</Text>
                  </View>
                </View>
              </View>

              {/* Ticket Categories Preview */}
              <Text style={[styles.salesSectionTitle, { color: colors.text }]}>Bilet Kategorileri</Text>
              <View style={[styles.salesTicketPreview, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]}>
                {ticketCategories.map((cat, idx) => (
                  <View key={cat.id} style={[styles.salesTicketItem, idx < ticketCategories.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]}>
                    <Text style={[styles.salesTicketName, { color: colors.text }]}>{cat.name}</Text>
                    <View style={styles.salesTicketRight}>
                      <Text style={[styles.salesTicketPrice, { color: colors.brand[400] }]}>₺{cat.price}</Text>
                      <Text style={[styles.salesTicketCapacity, { color: colors.textMuted }]}>{cat.capacity} adet</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Platform Selection */}
              <Text style={[styles.salesSectionTitle, { color: colors.text }]}>Platform Seçimi</Text>
              <Text style={[styles.salesSectionSubtitle, { color: colors.textMuted }]}>Biletlerin satışa açılacağı platformları seçin</Text>
              <View style={styles.salesPlatformOptions}>
                {platforms.map(platform => (
                  <TouchableOpacity
                    key={platform.id}
                    style={[
                      styles.salesPlatformOption,
                      {
                        backgroundColor: selectedPlatforms.includes(platform.id)
                          ? (isDark ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.1)')
                          : (isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground),
                        borderColor: selectedPlatforms.includes(platform.id)
                          ? colors.brand[400]
                          : (isDark ? 'rgba(255,255,255,0.04)' : colors.border),
                      }
                    ]}
                    onPress={() => togglePlatformSelection(platform.id)}
                  >
                    <View style={[styles.salesPlatformCheckbox, { borderColor: selectedPlatforms.includes(platform.id) ? colors.brand[400] : colors.textMuted }]}>
                      {selectedPlatforms.includes(platform.id) && (
                        <Ionicons name="checkmark" size={14} color={colors.brand[400]} />
                      )}
                    </View>
                    <View style={styles.salesPlatformInfo}>
                      <View style={[styles.salesPlatformLogo, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.1)' }]}>
                        <Text style={[styles.salesPlatformLogoText, { color: colors.brand[400] }]}>{platform.name.charAt(0)}</Text>
                      </View>
                      <View>
                        <Text style={[styles.salesPlatformName, { color: colors.text }]}>{platform.name}</Text>
                        <Text style={[styles.salesPlatformCommission, { color: colors.textMuted }]}>%{platform.commission} komisyon</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Additional Notes */}
              <Text style={[styles.salesSectionTitle, { color: colors.text }]}>Ek Notlar</Text>
              <TextInput
                style={[styles.salesNoteInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border, color: colors.text }]}
                placeholder="Platformlara iletmek istediğiniz ek bilgiler..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={salesNote}
                onChangeText={setSalesNote}
              />

              {/* Email Preview */}
              {selectedPlatforms.length > 0 && (
                <>
                  <Text style={[styles.salesSectionTitle, { color: colors.text }]}>Mail Önizleme</Text>
                  <View style={[styles.salesEmailPreview, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]}>
                    <View style={styles.salesEmailHeader}>
                      <Text style={[styles.salesEmailLabel, { color: colors.textMuted }]}>Alıcılar:</Text>
                      <Text style={[styles.salesEmailValue, { color: colors.text }]}>
                        {platforms.filter(p => selectedPlatforms.includes(p.id)).map(p => p.email).join(', ')}
                      </Text>
                    </View>
                    <View style={styles.salesEmailHeader}>
                      <Text style={[styles.salesEmailLabel, { color: colors.textMuted }]}>Konu:</Text>
                      <Text style={[styles.salesEmailValue, { color: colors.text }]}>Bilet Satış Talebi: {event?.title}</Text>
                    </View>
                    <View style={[styles.salesEmailBody, { borderTopColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]}>
                      <Text style={[styles.salesEmailBodyText, { color: colors.textSecondary }]} numberOfLines={8}>
                        {generateSalesEmailContent()}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.salesModalFooter}>
              <TouchableOpacity style={[styles.salesModalCancelBtn, { borderColor: colors.border }]} onPress={() => { setShowSalesModal(false); setSelectedPlatforms([]); setSalesNote(''); }}>
                <Text style={[styles.salesModalCancelText, { color: colors.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.salesModalSendBtn, { opacity: selectedPlatforms.length === 0 ? 0.5 : 1 }]}
                onPress={handleSendSalesRequest}
                disabled={selectedPlatforms.length === 0}
              >
                <LinearGradient colors={gradients.primary} style={styles.salesModalSendBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="send" size={18} color="white" />
                  <Text style={styles.salesModalSendText}>Talep Gönder</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      {ratingTarget && event && (
        <RatingModal
          visible={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setRatingTarget(null);
          }}
          target={ratingTarget}
          event={{
            id: event.id,
            title: event.title,
            date: event.date,
            serviceCategory: ratingTarget.serviceCategory,
          }}
          reviewerType="organizer"
          onSubmit={(review) => {
            console.log('Review submitted:', review);
            setShowRatingModal(false);
            setRatingTarget(null);
            Alert.alert('Basarili', 'Degerlendirmeniz gonderildi!');
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorText: { textAlign: 'center', marginTop: 100 },
  headerImage: { height: 280, position: 'relative' },
  eventImage: { width: '100%', height: '100%' },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 200 },
  backButton: { position: 'absolute', top: 12, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 0, 0, 0.4)', alignItems: 'center', justifyContent: 'center' },
  headerActions: { position: 'absolute', top: 12, right: 16, flexDirection: 'row', gap: 8 },
  headerActionButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 0, 0, 0.4)', alignItems: 'center', justifyContent: 'center' },
  headerContent: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 6, marginBottom: 10 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  eventTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  eventMeta: { flexDirection: 'row', gap: 16 },
  eventMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventMetaText: { fontSize: 13, color: 'rgba(255, 255, 255, 0.8)' },
  progressSection: { padding: 20, borderBottomWidth: 1 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressTitle: { fontSize: 16, fontWeight: '600' },
  progressPercent: { fontSize: 18, fontWeight: '700' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressStats: { flexDirection: 'row', gap: 20 },
  progressStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressStatDot: { width: 8, height: 8, borderRadius: 4 },
  progressStatText: { fontSize: 12 },
  quickInfoContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 12, borderBottomWidth: 1 },
  quickInfoCard: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  quickInfoValue: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  quickInfoLabel: { fontSize: 11, marginTop: 2 },
  sectionTabsContainer: { marginBottom: 16, borderBottomWidth: 1 },
  sectionTabsContent: { flexDirection: 'row', paddingHorizontal: 20, gap: 8 },
  sectionTab: { paddingVertical: 12, paddingHorizontal: 12, position: 'relative' },
  sectionTabText: { fontSize: 14, fontWeight: '500' },
  sectionTabIndicator: { position: 'absolute', bottom: -1, left: 12, right: 12, height: 2, borderRadius: 1 },
  servicesSection: { padding: 20 },
  serviceCategoryGroup: { marginBottom: 20 },
  serviceCategoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  serviceCategoryTitle: { fontSize: 15, fontWeight: '600' },
  serviceCategoryCount: { fontSize: 12 },
  serviceCard: { borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1 },
  serviceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  serviceCategoryIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 14, fontWeight: '600' },
  serviceCategory: { fontSize: 11, marginTop: 1 },
  serviceStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  serviceStatusText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  serviceDetails: { flexDirection: 'row', gap: 20 },
  serviceDetailItem: {},
  serviceDetailLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 },
  serviceDetailValue: { fontSize: 13, fontWeight: '500' },
  serviceActionButton: { marginTop: 12, borderRadius: 10, overflow: 'hidden' },
  serviceActionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 6 },
  serviceActionText: { fontSize: 13, fontWeight: '600', color: 'white' },
  confirmedServiceActions: { flexDirection: 'row', marginTop: 12, gap: 8 },
  confirmedActionBtn: { width: 40, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  confirmedActionText: { fontSize: 12, fontWeight: '600' },
  addServiceButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(147, 51, 234, 0.3)', borderStyle: 'dashed', gap: 8 },
  addServiceText: { fontSize: 14, fontWeight: '500' },
  timelineSection: { padding: 20 },
  timelineItem: { flexDirection: 'row', marginBottom: 0 },
  timelineLeft: { alignItems: 'center', marginRight: 16 },
  timelineIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 2, flex: 1, marginTop: 4 },
  timelineContent: { flex: 1, paddingBottom: 24 },
  timelineDate: { fontSize: 11, marginBottom: 4 },
  timelineTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  timelineDescription: { fontSize: 12 },
  budgetSection: { padding: 20 },
  budgetSummary: { flexDirection: 'row', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1 },
  budgetSummaryItem: { flex: 1, alignItems: 'center' },
  budgetSummaryLabel: { fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
  budgetSummaryValue: { fontSize: 15, fontWeight: '700' },
  budgetDivider: { width: 1 },
  budgetCategoryTitle: { fontSize: 15, fontWeight: '600', marginBottom: 16 },
  budgetCategoryItem: { marginBottom: 16 },
  budgetCategoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  budgetCategoryInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  budgetCategoryIcon: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  budgetCategoryName: { fontSize: 13, fontWeight: '500' },
  budgetCategoryAmount: { fontSize: 13, fontWeight: '600' },
  budgetCategoryBar: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  budgetCategoryFill: { height: '100%', borderRadius: 3 },
  budgetCategoryPercent: { fontSize: 11, textAlign: 'right' },
  exportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, backgroundColor: 'rgba(147, 51, 234, 0.1)', gap: 8, marginTop: 8 },
  exportButtonText: { fontSize: 14, fontWeight: '500' },
  actionButtons: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  actionButtonSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 8 },
  actionButtonSecondaryText: { fontSize: 14, fontWeight: '500' },
  bottomActionsInScroll: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  messageButton: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  primaryButton: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  primaryButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, gap: 8 },
  primaryButtonText: { fontSize: 15, fontWeight: '600', color: 'white' },
  // Tickets Section Styles
  ticketsSection: { padding: 20 },
  posterSection: { padding: 20 },
  ticketStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  ticketStatCard: { flex: 1, minWidth: '47%', padding: 12, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  ticketStatIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  ticketStatValue: { fontSize: 18, fontWeight: 'bold' },
  ticketStatLabel: { fontSize: 10, marginTop: 2 },
  occupancyCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  occupancyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  occupancyTitle: { fontSize: 13, fontWeight: '600' },
  occupancyPercent: { fontSize: 18, fontWeight: 'bold' },
  occupancyBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  occupancyFill: { height: '100%', borderRadius: 3 },
  occupancyFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  occupancyFooterText: { fontSize: 10 },
  platformCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  platformHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  platformTitle: { fontSize: 13, fontWeight: '600' },
  platformItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  platformInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  platformLogo: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  platformLogoText: { fontSize: 14, fontWeight: 'bold' },
  platformDetails: { marginLeft: 10 },
  platformName: { fontSize: 13, fontWeight: '500' },
  platformEmail: { fontSize: 10, marginTop: 1 },
  platformStats: { alignItems: 'flex-end' },
  platformSold: { fontSize: 13, fontWeight: '600' },
  platformRevenue: { fontSize: 11, marginTop: 1 },
  categoriesCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  categoriesHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  categoriesTitle: { fontSize: 13, fontWeight: '600' },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  categoryPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  categoryPrice: { fontSize: 18, fontWeight: 'bold' },
  categoryOldPrice: { fontSize: 12, textDecorationLine: 'line-through' },
  priceChangeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  priceChangeText: { fontSize: 10, fontWeight: '600' },
  categoryStats: { fontSize: 10 },
  categoryActions: { marginLeft: 10 },
  priceButtons: { flexDirection: 'row', gap: 4 },
  priceBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  priceBtnText: { fontSize: 11, fontWeight: '600' },
  priceResetBtn: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  sendPriceChangeBtn: { marginTop: 12, borderRadius: 10, overflow: 'hidden' },
  sendPriceChangeBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  sendPriceChangeBtnText: { fontSize: 13, fontWeight: '600', color: 'white' },
  quickActionsCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  quickActionsTitle: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickActionBtn: { flex: 1, minWidth: '47%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 2 },
  quickActionText: { fontSize: 11, fontWeight: '500' },

  // New Budget Section Styles
  budgetCardsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  budgetCard: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  budgetCardValue: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  budgetCardLabel: { fontSize: 11, marginTop: 2 },
  budgetUsageCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  budgetUsageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  budgetUsageTitle: { fontSize: 14, fontWeight: '600' },
  budgetUsagePercent: { fontSize: 20, fontWeight: '700' },
  budgetUsageBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  budgetUsageFill: { height: '100%', borderRadius: 4 },
  budgetUsageFooter: { marginTop: 8, alignItems: 'flex-end' },
  budgetUsageRemaining: { fontSize: 13, fontWeight: '600' },
  categoryBreakdownCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  categoryBreakdownTitle: { fontSize: 14, fontWeight: '600', marginBottom: 14 },
  categoryBreakdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  categoryBreakdownLeft: { flexDirection: 'row', alignItems: 'center' },
  categoryBreakdownIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  categoryBreakdownName: { fontSize: 13, fontWeight: '500' },
  categoryBreakdownRight: { alignItems: 'flex-end' },
  categoryBreakdownAmount: { fontSize: 14, fontWeight: '600' },
  categoryBreakdownPercent: { fontSize: 11, marginTop: 2 },
  expenseFilterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  expenseListTitle: { fontSize: 14, fontWeight: '600' },
  expenseFilterButtons: { flexDirection: 'row', gap: 6 },
  expenseFilterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  expenseFilterText: { fontSize: 12, fontWeight: '500' },
  expenseItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  expenseStatusBtn: { marginRight: 10 },
  expenseInfo: { flex: 1 },
  expenseHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  expenseTitle: { fontSize: 14, fontWeight: '600' },
  expenseCategoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  expenseCategoryText: { fontSize: 10, fontWeight: '500' },
  expenseProvider: { fontSize: 12, marginBottom: 4 },
  expenseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expenseDate: { fontSize: 11 },
  expenseAmount: { fontSize: 14, fontWeight: '700' },
  expenseActions: { flexDirection: 'column', gap: 6 },
  expenseActionBtn: { padding: 6 },
  addExpenseButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', gap: 8, marginTop: 8, marginBottom: 16 },
  addExpenseText: { fontSize: 14, fontWeight: '500' },

  // Expense Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' },
  expenseModalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  expenseModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  expenseModalTitle: { fontSize: 18, fontWeight: '600' },
  expenseModalBody: { padding: 20 },
  expenseInputLabel: { fontSize: 12, fontWeight: '500', marginBottom: 6, marginTop: 12 },
  expenseInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  expenseTextArea: { height: 80, textAlignVertical: 'top' },
  expenseCategoryPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  expenseCategoryOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  expenseCategoryOptionText: { fontSize: 12, fontWeight: '500' },
  expenseModalFooter: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
  expenseModalCancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  expenseModalCancelText: { fontSize: 15, fontWeight: '500' },
  expenseModalSaveBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  expenseModalSaveBtnGradient: { padding: 14, alignItems: 'center' },
  expenseModalSaveText: { fontSize: 15, fontWeight: '600', color: 'white' },

  // New Ticket Section Styles
  checkInHeroCard: { padding: 16, borderRadius: 16, marginBottom: 16 },
  checkInHeroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  checkInHeroLeft: {},
  checkInHeroLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  checkInHeroValue: { fontSize: 32, fontWeight: '700' },
  checkInHeroSub: { fontSize: 14 },
  checkInHeroRight: {},
  checkInRateCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  checkInRateValue: { fontSize: 18, fontWeight: '700' },
  checkInRateLabel: { fontSize: 10 },
  scanTicketBtn: { borderRadius: 12, overflow: 'hidden' },
  scanTicketBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  scanTicketBtnText: { fontSize: 15, fontWeight: '600', color: 'white' },
  ticketCategoriesCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  ticketCategoriesHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  ticketCategoriesTitle: { fontSize: 13, fontWeight: '600' },
  ticketCategoryItem: { paddingVertical: 12, borderBottomWidth: 1 },
  ticketCategoryMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketCategoryInfo: {},
  ticketCategoryName: { fontSize: 14, fontWeight: '500' },
  ticketCategoryPrice: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  ticketCategoryStats: { flexDirection: 'row', gap: 16 },
  ticketCategoryStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ticketCategoryStatText: { fontSize: 14, fontWeight: '600' },
  ticketCategoryStatLabel: { fontSize: 11 },
  ticketCategoryBarContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ticketCategoryBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  ticketCategoryBarFill: { height: '100%', borderRadius: 3 },
  ticketCategoryBarPercent: { fontSize: 11, width: 60, textAlign: 'right' },
  priceManagementCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  priceManagementHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  priceManagementTitle: { fontSize: 13, fontWeight: '600' },
  priceManagementItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceManagementInfo: {},
  priceManagementName: { fontSize: 13, fontWeight: '500' },
  priceManagementCurrent: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  priceManagementActions: { flexDirection: 'row', gap: 6 },
  priceAdjustBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  priceAdjustText: { fontSize: 12, fontWeight: '600' },
  ticketQuickActions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  ticketQuickActionBtn: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 6 },
  ticketQuickActionText: { fontSize: 11, fontWeight: '500' },

  // Sales Status Card Styles
  salesStatusCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  salesStatusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  salesStatusLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  salesStatusIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  salesStatusTitle: { fontSize: 15, fontWeight: '600' },
  salesStatusSubtitle: { fontSize: 12, marginTop: 2 },
  openSalesBtn: { borderRadius: 10, overflow: 'hidden' },
  openSalesBtnGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 6 },
  openSalesBtnText: { fontSize: 13, fontWeight: '600', color: 'white' },
  activateSalesBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, gap: 6 },
  activateSalesBtnText: { fontSize: 13, fontWeight: '600', color: 'white' },
  salesActiveBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  salesActiveBadgeText: { fontSize: 12, fontWeight: '600' },
  salesPlatformsList: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  salesPlatformsLabel: { fontSize: 12, marginRight: 8 },
  salesPlatformsBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  salesPlatformBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  salesPlatformBadgeText: { fontSize: 11, fontWeight: '500' },

  // Sales Modal Styles
  salesModalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '95%' },
  salesModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  salesModalTitle: { fontSize: 18, fontWeight: '600' },
  salesModalBody: { padding: 20 },
  salesEventSummary: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
  salesEventTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  salesEventMeta: { flexDirection: 'row', gap: 16 },
  salesEventMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  salesEventMetaText: { fontSize: 12 },
  salesSectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  salesSectionSubtitle: { fontSize: 12, marginBottom: 12, marginTop: -4 },
  salesTicketPreview: { borderRadius: 14, borderWidth: 1, padding: 12 },
  salesTicketItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  salesTicketName: { fontSize: 14, fontWeight: '500' },
  salesTicketRight: { alignItems: 'flex-end' },
  salesTicketPrice: { fontSize: 15, fontWeight: '700' },
  salesTicketCapacity: { fontSize: 11, marginTop: 2 },
  salesPlatformOptions: { gap: 10 },
  salesPlatformOption: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1.5 },
  salesPlatformCheckbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  salesPlatformInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  salesPlatformLogo: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  salesPlatformLogoText: { fontSize: 18, fontWeight: 'bold' },
  salesPlatformName: { fontSize: 14, fontWeight: '600' },
  salesPlatformCommission: { fontSize: 11, marginTop: 2 },
  salesNoteInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 14, height: 90, textAlignVertical: 'top' },
  salesEmailPreview: { borderRadius: 14, borderWidth: 1, padding: 14, marginTop: 4 },
  salesEmailHeader: { flexDirection: 'row', marginBottom: 8 },
  salesEmailLabel: { fontSize: 12, width: 60 },
  salesEmailValue: { fontSize: 12, flex: 1 },
  salesEmailBody: { borderTopWidth: 1, paddingTop: 12, marginTop: 4 },
  salesEmailBodyText: { fontSize: 12, lineHeight: 18 },
  salesModalFooter: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
  salesModalCancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  salesModalCancelText: { fontSize: 15, fontWeight: '500' },
  salesModalSendBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  salesModalSendBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, gap: 8 },
  salesModalSendText: { fontSize: 15, fontWeight: '600', color: 'white' },
});
