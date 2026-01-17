import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Linking,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import * as Haptics from 'expo-haptics';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Category {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  iconColor: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  date: string;
  lastUpdate: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'support';
  time: string;
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  articles: { title: string; duration: string }[];
}

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  category: string;
  views: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

export function HelpSupportScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modals
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showTicketListModal, setShowTicketListModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showVideosModal, setShowVideosModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<string>('all');

  // Ticket form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', text: 'Merhaba! Size nasıl yardımcı olabilirim?', sender: 'support', time: '14:30' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<FlatList>(null);

  // Animation refs
  const faqAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Sample tickets
  const [tickets] = useState<SupportTicket[]>([
    { id: 't1', subject: 'Ödeme sorunu', status: 'resolved', date: '12 Ocak 2026', lastUpdate: '13 Ocak 2026' },
    { id: 't2', subject: 'Teklif görünmüyor', status: 'in_progress', date: '14 Ocak 2026', lastUpdate: '15 Ocak 2026' },
  ]);

  const categories: Category[] = [
    { id: 'getting_started', title: 'Başlangıç', icon: 'rocket', color: 'rgba(139, 92, 246, 0.15)', iconColor: '#8B5CF6' },
    { id: 'account', title: 'Hesap', icon: 'person', color: 'rgba(59, 130, 246, 0.15)', iconColor: '#3B82F6' },
    { id: 'payments', title: 'Ödemeler', icon: 'card', color: 'rgba(16, 185, 129, 0.15)', iconColor: '#10B981' },
    { id: 'events', title: 'Etkinlikler', icon: 'calendar', color: 'rgba(245, 158, 11, 0.15)', iconColor: '#F59E0B' },
    { id: 'offers', title: 'Teklifler', icon: 'pricetags', color: 'rgba(236, 72, 153, 0.15)', iconColor: '#EC4899' },
    { id: 'technical', title: 'Teknik', icon: 'settings', color: 'rgba(99, 102, 241, 0.15)', iconColor: '#6366F1' },
  ];

  // Guide data
  const guides: GuideItem[] = [
    {
      id: 'getting_started',
      title: 'Başlangıç Rehberi',
      description: 'Turing\'e ilk adımlarınız',
      icon: 'rocket',
      color: '#8B5CF6',
      articles: [
        { title: 'Hesap oluşturma ve profil ayarları', duration: '3 dk' },
        { title: 'Ana ekran ve navigasyon', duration: '2 dk' },
        { title: 'Mod değiştirme (Organizatör/Sağlayıcı)', duration: '2 dk' },
        { title: 'Bildirim tercihlerinizi ayarlama', duration: '2 dk' },
      ],
    },
    {
      id: 'organizer',
      title: 'Organizatör Rehberi',
      description: 'Etkinlik oluşturma ve yönetimi',
      icon: 'calendar',
      color: '#F59E0B',
      articles: [
        { title: 'İlk etkinliğinizi oluşturma', duration: '5 dk' },
        { title: 'Hizmet sağlayıcı bulma ve teklif alma', duration: '4 dk' },
        { title: 'Teklifleri karşılaştırma ve seçim', duration: '3 dk' },
        { title: 'Ödeme ve sözleşme süreci', duration: '4 dk' },
        { title: 'Etkinlik günü yönetimi', duration: '3 dk' },
      ],
    },
    {
      id: 'provider',
      title: 'Hizmet Sağlayıcı Rehberi',
      description: 'Teklif verme ve operasyonlar',
      icon: 'briefcase',
      color: '#10B981',
      articles: [
        { title: 'Sağlayıcı profilinizi optimize etme', duration: '4 dk' },
        { title: 'Gelen taleplere teklif verme', duration: '3 dk' },
        { title: 'Pazarlık ve karşı teklif stratejileri', duration: '4 dk' },
        { title: 'Operasyon ve check-in süreci', duration: '3 dk' },
        { title: 'Değerlendirme ve itibar yönetimi', duration: '3 dk' },
      ],
    },
    {
      id: 'payments',
      title: 'Ödeme Rehberi',
      description: 'Finansal işlemler ve faturalama',
      icon: 'card',
      color: '#3B82F6',
      articles: [
        { title: 'Ödeme yöntemleri ekleme', duration: '2 dk' },
        { title: 'Güvenli ödeme süreci', duration: '3 dk' },
        { title: 'Fatura ve makbuz indirme', duration: '2 dk' },
        { title: 'İade talepleri ve süreçleri', duration: '3 dk' },
      ],
    },
    {
      id: 'advanced',
      title: 'İleri Düzey Özellikler',
      description: 'Profesyonel ipuçları',
      icon: 'diamond',
      color: '#EC4899',
      articles: [
        { title: 'Sanatçı kadrosu yönetimi', duration: '4 dk' },
        { title: 'Ekip üyeleri ve yetkilendirme', duration: '3 dk' },
        { title: 'Raporlama ve analitik', duration: '4 dk' },
        { title: 'API entegrasyonları', duration: '5 dk' },
      ],
    },
  ];

  // Video data
  const videoCategories = [
    { id: 'all', title: 'Tümü' },
    { id: 'beginner', title: 'Başlangıç' },
    { id: 'organizer', title: 'Organizatör' },
    { id: 'provider', title: 'Sağlayıcı' },
    { id: 'advanced', title: 'İleri Düzey' },
  ];

  const videos: VideoItem[] = [
    { id: 'v1', title: 'Turing\'e Hoş Geldiniz', duration: '2:45', thumbnail: '🎬', category: 'beginner', views: '12.5K' },
    { id: 'v2', title: 'Hesap Oluşturma ve Profil Ayarları', duration: '4:30', thumbnail: '👤', category: 'beginner', views: '8.2K' },
    { id: 'v3', title: 'İlk Etkinliğinizi Oluşturun', duration: '6:15', thumbnail: '📅', category: 'organizer', views: '15.3K' },
    { id: 'v4', title: 'Teklif Alma ve Değerlendirme', duration: '5:45', thumbnail: '📋', category: 'organizer', views: '9.8K' },
    { id: 'v5', title: 'Hizmet Sağlayıcı Olarak Başlangıç', duration: '5:00', thumbnail: '💼', category: 'provider', views: '7.1K' },
    { id: 'v6', title: 'Etkili Teklif Yazma Teknikleri', duration: '7:30', thumbnail: '✍️', category: 'provider', views: '11.2K' },
    { id: 'v7', title: 'Pazarlık Stratejileri', duration: '6:00', thumbnail: '🤝', category: 'provider', views: '6.5K' },
    { id: 'v8', title: 'Ödeme Süreçleri ve Güvenlik', duration: '4:15', thumbnail: '💳', category: 'beginner', views: '5.8K' },
    { id: 'v9', title: 'Ekip Yönetimi ve Yetkilendirme', duration: '5:30', thumbnail: '👥', category: 'advanced', views: '4.2K' },
    { id: 'v10', title: 'Raporlama ve Analitik Araçları', duration: '8:00', thumbnail: '📊', category: 'advanced', views: '3.9K' },
    { id: 'v11', title: 'Sanatçı Kadrosu Yönetimi', duration: '6:45', thumbnail: '🎤', category: 'advanced', views: '5.1K' },
    { id: 'v12', title: 'Mobil Uygulama İpuçları', duration: '3:30', thumbnail: '📱', category: 'beginner', views: '10.4K' },
  ];

  // Blog data
  const blogPosts: BlogPost[] = [
    {
      id: 'b1',
      title: '2026 Etkinlik Trendleri: Neler Değişiyor?',
      excerpt: 'Bu yıl öne çıkan etkinlik formatları ve organizatörlerin dikkat etmesi gereken yenilikler.',
      category: 'Trendler',
      date: '14 Ocak 2026',
      readTime: '5 dk',
      image: '🎯',
      featured: true,
    },
    {
      id: 'b2',
      title: 'Başarılı Bir Kurumsal Etkinlik İçin 10 İpucu',
      excerpt: 'Profesyonel etkinliklerinizi bir üst seviyeye taşıyacak pratik öneriler.',
      category: 'İpuçları',
      date: '12 Ocak 2026',
      readTime: '7 dk',
      image: '💡',
    },
    {
      id: 'b3',
      title: 'Hizmet Sağlayıcılar İçin Fiyatlandırma Rehberi',
      excerpt: 'Rekabetçi ve karlı fiyatlandırma stratejileri oluşturmanın yolları.',
      category: 'Rehber',
      date: '10 Ocak 2026',
      readTime: '6 dk',
      image: '💰',
    },
    {
      id: 'b4',
      title: 'Yeni Özellik: Anlık Teklif Bildirimleri',
      excerpt: 'Artık gelen teklifleri anında öğrenin ve hızlıca yanıt verin.',
      category: 'Platform',
      date: '8 Ocak 2026',
      readTime: '3 dk',
      image: '🔔',
    },
    {
      id: 'b5',
      title: 'Müşteri Başarı Hikayesi: Festival Organizasyonu',
      excerpt: 'Nasıl 50.000 kişilik bir festivali Turing ile organize ettiler?',
      category: 'Başarı',
      date: '5 Ocak 2026',
      readTime: '8 dk',
      image: '🏆',
    },
    {
      id: 'b6',
      title: 'Sanatçı Yönetimi: En İyi Uygulamalar',
      excerpt: 'Booking ajansları için sanatçı portföyü yönetim teknikleri.',
      category: 'Rehber',
      date: '3 Ocak 2026',
      readTime: '6 dk',
      image: '🎭',
    },
  ];

  const faqs: FAQItem[] = [
    // Başlangıç
    {
      id: '1',
      question: 'Nasıl hesap oluşturabilirim?',
      answer: 'Uygulamayı indirdikten sonra "Kayıt Ol" butonuna tıklayın. E-posta adresinizi girin, şifre oluşturun ve telefon numaranızı doğrulayın. Ardından profil bilgilerinizi tamamlayarak hizmeti kullanmaya başlayabilirsiniz.',
      category: 'getting_started',
    },
    {
      id: '2',
      question: 'Sağlayıcı modu nedir?',
      answer: 'Sağlayıcı modu, hizmet sunmak isteyen kullanıcılar içindir. Profil sayfasından modu değiştirerek, gelen teklif taleplerine yanıt verebilir ve etkinliklerde yer alabilirsiniz. Her iki modu da kullanabilirsiniz.',
      category: 'getting_started',
    },
    {
      id: '3',
      question: 'Uygulama ücretsiz mi?',
      answer: 'Evet, uygulamayı indirmek ve kullanmak tamamen ücretsizdir. Sadece gerçekleşen işlemlerden hizmet bedeli alınmaktadır.',
      category: 'getting_started',
    },
    // Hesap
    {
      id: '4',
      question: 'İletişim bilgilerimi nasıl değiştiririm?',
      answer: 'Profil sayfasından "Kişisel Bilgiler" seçeneğine tıklayarak e-posta, telefon ve diğer bilgilerinizi güncelleyebilirsiniz. Değişiklikler anında kaydedilir.',
      category: 'account',
    },
    {
      id: '5',
      question: 'Şifremi unuttum, ne yapmalıyım?',
      answer: 'Giriş ekranında "Şifremi Unuttum" bağlantısına tıklayın. Kayıtlı e-posta adresinize şifre sıfırlama bağlantısı gönderilecektir.',
      category: 'account',
    },
    {
      id: '6',
      question: 'Hesabımı nasıl silebilirim?',
      answer: 'Profil > Güvenlik > Hesabı Sil yolunu izleyin. Hesap silme işlemi geri alınamaz ve tüm verileriniz kalıcı olarak silinir.',
      category: 'account',
    },
    // Ödemeler
    {
      id: '7',
      question: 'Ödeme nasıl yapılır?',
      answer: 'Teklifi onayladıktan sonra, güvenli ödeme sayfasına yönlendirilirsiniz. Kredi kartı, banka kartı veya havale/EFT ile ödeme yapabilirsiniz. Tüm ödemeler SSL ile korunmaktadır.',
      category: 'payments',
    },
    {
      id: '8',
      question: 'İade politikası nedir?',
      answer: 'İade talepleri, hizmet sağlayıcının iptal politikasına göre değerlendirilir. Etkinlikten 7 gün öncesine kadar yapılan iptallerde genellikle tam iade yapılır. Detaylar için her teklifin koşullarını inceleyin.',
      category: 'payments',
    },
    {
      id: '9',
      question: 'Fatura nasıl alırım?',
      answer: 'Ödeme tamamlandıktan sonra fatura otomatik olarak e-posta adresinize gönderilir. Ayrıca "Ödemelerim" bölümünden tüm faturalarınıza ulaşabilirsiniz.',
      category: 'payments',
    },
    // Etkinlikler
    {
      id: '10',
      question: 'Etkinliğimi iptal edebilir miyim?',
      answer: 'Evet, etkinliğinizi "Etkinliklerim" sayfasından iptal edebilirsiniz. İptal koşulları, hizmet sağlayıcının politikasına göre değişebilir. Etkinlik tarihine yakın iptallerde kesinti uygulanabilir.',
      category: 'events',
    },
    {
      id: '11',
      question: 'Etkinlik tarihini değiştirebilir miyim?',
      answer: 'Hizmet sağlayıcının onayı ile tarih değişikliği yapılabilir. Etkinlik detay sayfasından "Tarih Değiştir" talebinde bulunun. Sağlayıcı uygunluğuna göre onaylanır.',
      category: 'events',
    },
    // Teklifler
    {
      id: '12',
      question: 'Nasıl teklif alabilirim?',
      answer: 'Bir etkinlik oluşturun, ihtiyacınız olan hizmet kategorisini seçin ve "Teklif Al" butonuna tıklayın. İlgili hizmet sağlayıcılar size teklif gönderecektir. Genellikle 24 saat içinde teklifler gelmeye başlar.',
      category: 'offers',
    },
    {
      id: '13',
      question: 'Teklif nasıl karşılaştırılır?',
      answer: 'Gelen teklifleri fiyat, sağlayıcı puanı, yorumlar ve dahil olan hizmetler açısından karşılaştırabilirsiniz. Her teklifin detay sayfasında tüm bilgiler yer almaktadır.',
      category: 'offers',
    },
    {
      id: '14',
      question: 'Pazarlık yapabilir miyim?',
      answer: 'Evet! Her teklif için "Karşı Teklif" gönderebilirsiniz. Sağlayıcı teklifinizi kabul edebilir, reddedebilir veya yeni bir teklif sunabilir.',
      category: 'offers',
    },
    // Teknik
    {
      id: '15',
      question: 'Bildirimler gelmiyor, ne yapmalıyım?',
      answer: 'Önce telefon ayarlarından uygulama bildirimlerinin açık olduğunu kontrol edin. Ardından uygulama içi Bildirim Ayarları\'ndan push bildirimlerinin aktif olduğundan emin olun.',
      category: 'technical',
    },
    {
      id: '16',
      question: 'Uygulama çok yavaş çalışıyor',
      answer: 'Uygulamayı kapatıp yeniden açmayı deneyin. Sorun devam ederse, uygulama önbelleğini temizleyin veya uygulamayı güncelleyin. İnternet bağlantınızı da kontrol edin.',
      category: 'technical',
    },
  ];

  // Initialize animations for FAQs
  useEffect(() => {
    faqs.forEach(faq => {
      if (!faqAnimations[faq.id]) {
        faqAnimations[faq.id] = new Animated.Value(0);
      }
    });
  }, []);

  // Animate FAQ expansion
  const toggleFAQ = (id: string) => {
    Haptics.selectionAsync();
    const isExpanding = expandedFAQ !== id;

    if (expandedFAQ && faqAnimations[expandedFAQ]) {
      Animated.timing(faqAnimations[expandedFAQ], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    if (isExpanding && faqAnimations[id]) {
      setExpandedFAQ(id);
      Animated.timing(faqAnimations[id], {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      setExpandedFAQ(null);
    }
  };

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContact = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (type) {
      case 'email':
        Linking.openURL('mailto:destek@turing.app');
        break;
      case 'phone':
        Linking.openURL('tel:+902121234567');
        break;
      case 'whatsapp':
        Linking.openURL('https://wa.me/902121234567');
        break;
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    Haptics.selectionAsync();
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleSubmitTicket = () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Talep Oluşturuldu',
      'Destek talebiniz başarıyla oluşturuldu. En kısa sürede size dönüş yapacağız.',
      [{ text: 'Tamam', onPress: () => {
        setShowTicketModal(false);
        setTicketSubject('');
        setTicketCategory('');
        setTicketDescription('');
      }}]
    );
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'user',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');

    // Simulate support response
    setTimeout(() => {
      const responses = [
        'Anlıyorum, bu konuda size yardımcı olabilirim.',
        'Talebinizi inceliyorum, lütfen bekleyin.',
        'Bu sorunu çözmek için birkaç bilgiye ihtiyacım var.',
        'Teşekkürler, hemen kontrol ediyorum.',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const supportMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'support',
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, supportMessage]);
    }, 1500);
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return '#F59E0B';
      case 'in_progress': return '#3B82F6';
      case 'resolved': return '#10B981';
      default: return colors.textMuted;
    }
  };

  const getStatusLabel = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'Açık';
      case 'in_progress': return 'İşlemde';
      case 'resolved': return 'Çözüldü';
      default: return status;
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Yardım & Destek</Text>
        <TouchableOpacity onPress={() => setShowTicketListModal(true)} style={styles.historyButton}>
          <Ionicons name="document-text-outline" size={22} color={colors.brand[400]} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchSection}>
          <View style={[styles.searchContainer, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.inputBorder
          }]}>
            <Ionicons name="search" size={20} color={colors.zinc[500]} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Nasıl yardımcı olabiliriz?"
              placeholderTextColor={colors.zinc[500]}
            />
            {(searchQuery || selectedCategory) && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color={colors.zinc[500]} />
              </TouchableOpacity>
            )}
          </View>
          {selectedCategory && (
            <View style={styles.filterTag}>
              <Text style={[styles.filterTagText, { color: colors.brand[400] }]}>
                {categories.find(c => c.id === selectedCategory)?.title}
              </Text>
              <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                <Ionicons name="close" size={16} color={colors.brand[400]} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Hızlı İletişim</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact('email')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.contactIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="mail" size={22} color="white" />
              </LinearGradient>
              <Text style={[styles.contactLabel, { color: colors.text }]}>E-posta</Text>
              <Text style={[styles.contactSub, { color: colors.textMuted }]}>destek@turing.app</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact('phone')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#059669', '#34d399']}
                style={styles.contactIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="call" size={22} color="white" />
              </LinearGradient>
              <Text style={[styles.contactLabel, { color: colors.text }]}>Telefon</Text>
              <Text style={[styles.contactSub, { color: colors.textMuted }]}>0212 123 45 67</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact('whatsapp')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#25d366', '#128c7e']}
                style={styles.contactIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="logo-whatsapp" size={22} color="white" />
              </LinearGradient>
              <Text style={[styles.contactLabel, { color: colors.text }]}>WhatsApp</Text>
              <Text style={[styles.contactSub, { color: colors.textMuted }]}>Hızlı mesaj</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Kategoriler</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                      borderColor: isSelected ? category.iconColor : (isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border),
                      borderWidth: isSelected ? 2 : 1,
                      ...(isDark ? {} : helpers.getShadow('sm'))
                    }
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon} size={22} color={category.iconColor} />
                  </View>
                  <Text style={[styles.categoryTitle, { color: colors.text }]}>{category.title}</Text>
                  {isSelected && (
                    <View style={[styles.categoryCheck, { backgroundColor: category.iconColor }]}>
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted, marginBottom: 0 }]}>Sık Sorulan Sorular</Text>
            <Text style={[styles.faqCount, { color: colors.textMuted }]}>{filteredFAQs.length} soru</Text>
          </View>

          {filteredFAQs.length === 0 ? (
            <View style={[styles.emptyState, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
            }]}>
              <Ionicons name="search-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Sonuç bulunamadı</Text>
              <TouchableOpacity onPress={clearSearch}>
                <Text style={[styles.emptyStateClear, { color: colors.brand[400] }]}>Filtreleri temizle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.faqContainer, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
              ...(isDark ? {} : helpers.getShadow('sm'))
            }]}>
              {filteredFAQs.map((faq, index) => {
                const isExpanded = expandedFAQ === faq.id;
                const category = categories.find(c => c.id === faq.category);

                return (
                  <View key={faq.id}>
                    <TouchableOpacity
                      style={styles.faqItem}
                      onPress={() => toggleFAQ(faq.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.faqLeft}>
                        <View style={[styles.faqCategoryDot, { backgroundColor: category?.iconColor || colors.brand[400] }]} />
                        <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                      </View>
                      <Animated.View style={{
                        transform: [{
                          rotate: faqAnimations[faq.id]?.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '180deg'],
                          }) || '0deg'
                        }]
                      }}>
                        <Ionicons name="chevron-down" size={20} color={colors.zinc[500]} />
                      </Animated.View>
                    </TouchableOpacity>
                    {isExpanded && (
                      <Animated.View style={[styles.faqAnswer, {
                        opacity: faqAnimations[faq.id] || 1,
                      }]}>
                        <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>{faq.answer}</Text>
                        <View style={styles.faqActions}>
                          <TouchableOpacity style={styles.faqHelpful}>
                            <Ionicons name="thumbs-up-outline" size={14} color={colors.textMuted} />
                            <Text style={[styles.faqHelpfulText, { color: colors.textMuted }]}>Faydalı</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.faqHelpful}>
                            <Ionicons name="thumbs-down-outline" size={14} color={colors.textMuted} />
                            <Text style={[styles.faqHelpfulText, { color: colors.textMuted }]}>Değil</Text>
                          </TouchableOpacity>
                        </View>
                      </Animated.View>
                    )}
                    {index < filteredFAQs.length - 1 && (
                      <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Live Chat */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.liveChatCard, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
              ...(isDark ? {} : helpers.getShadow('sm'))
            }]}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowChatModal(true);
            }}
          >
            <View style={styles.liveChatContent}>
              <View style={[styles.liveChatIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)' }]}>
                <Ionicons name="chatbubble-ellipses" size={20} color={colors.brand[400]} />
              </View>
              <View style={styles.liveChatInfo}>
                <View style={styles.liveChatTitleRow}>
                  <Text style={[styles.liveChatTitle, { color: colors.text }]}>Canlı Destek</Text>
                  <View style={styles.onlineBadge}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>Çevrimiçi</Text>
                  </View>
                </View>
                <Text style={[styles.liveChatDescription, { color: colors.textMuted }]}>
                  Ortalama yanıt süresi: ~2 dk
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Create Ticket */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.createTicketCard, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
              ...(isDark ? {} : helpers.getShadow('sm'))
            }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowTicketModal(true);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.ticketIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="create-outline" size={24} color="#F59E0B" />
            </View>
            <View style={styles.ticketInfo}>
              <Text style={[styles.ticketTitle, { color: colors.text }]}>Destek Talebi Oluştur</Text>
              <Text style={[styles.ticketDesc, { color: colors.textMuted }]}>Sorununuzu detaylı anlatın</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.zinc[500]} />
          </TouchableOpacity>
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Kaynaklar</Text>

          {/* Main Resources Card */}
          <View style={[styles.resourcesCard, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
            ...(isDark ? {} : helpers.getShadow('sm'))
          }]}>
            <TouchableOpacity
              style={[styles.resourceRow, { borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowGuideModal(true);
              }}
            >
              <View style={styles.resourceLeft}>
                <View style={[styles.resourceIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Ionicons name="book-outline" size={18} color="#6366F1" />
                </View>
                <View style={styles.resourceTextContainer}>
                  <Text style={[styles.resourceText, { color: colors.text }]}>Kullanım Kılavuzu</Text>
                  <Text style={[styles.resourceSub, { color: colors.textMuted }]}>5 rehber · 21 makale</Text>
                </View>
              </View>
              <View style={[styles.resourceBadge, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <Text style={[styles.resourceBadgeText, { color: '#6366F1' }]}>Yeni</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.zinc[600]} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />

            <TouchableOpacity
              style={styles.resourceRow}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowVideosModal(true);
              }}
            >
              <View style={styles.resourceLeft}>
                <View style={[styles.resourceIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Ionicons name="play-circle-outline" size={18} color="#EF4444" />
                </View>
                <View style={styles.resourceTextContainer}>
                  <Text style={[styles.resourceText, { color: colors.text }]}>Video Eğitimler</Text>
                  <Text style={[styles.resourceSub, { color: colors.textMuted }]}>{videos.length} video · 1 saat+</Text>
                </View>
              </View>
              <View style={[styles.resourceBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Ionicons name="play" size={10} color="#EF4444" />
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.zinc[600]} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />

            <TouchableOpacity
              style={[styles.resourceRow, { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }]}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowBlogModal(true);
              }}
            >
              <View style={styles.resourceLeft}>
                <View style={[styles.resourceIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="newspaper-outline" size={18} color="#10B981" />
                </View>
                <View style={styles.resourceTextContainer}>
                  <Text style={[styles.resourceText, { color: colors.text }]}>Blog Yazıları</Text>
                  <Text style={[styles.resourceSub, { color: colors.textMuted }]}>{blogPosts.length} yazı · İpuçları ve haberler</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.zinc[600]} />
            </TouchableOpacity>
          </View>

          {/* Quick Links */}
          <View style={styles.quickLinksRow}>
            <TouchableOpacity
              style={[styles.quickLinkCard, {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
              }]}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL('https://turing.app/api-docs');
              }}
            >
              <View style={[styles.quickLinkIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Ionicons name="code-slash" size={18} color="#F59E0B" />
              </View>
              <Text style={[styles.quickLinkText, { color: colors.text }]}>API Docs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickLinkCard, {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
              }]}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL('https://turing.app/community');
              }}
            >
              <View style={[styles.quickLinkIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Ionicons name="people" size={18} color="#8B5CF6" />
              </View>
              <Text style={[styles.quickLinkText, { color: colors.text }]}>Topluluk</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickLinkCard, {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
              }]}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL('https://turing.app/webinars');
              }}
            >
              <View style={[styles.quickLinkIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                <Ionicons name="videocam" size={18} color="#EC4899" />
              </View>
              <Text style={[styles.quickLinkText, { color: colors.text }]}>Webinarlar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Ticket Creation Modal */}
      <Modal visible={showTicketModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Destek Talebi</Text>
              <TouchableOpacity onPress={() => setShowTicketModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Konu</Text>
              <TextInput
                style={[styles.modalInput, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                  color: colors.text,
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5',
                }]}
                value={ticketSubject}
                onChangeText={setTicketSubject}
                placeholder="Sorununuzu kısaca özetleyin"
                placeholderTextColor={colors.zinc[500]}
              />

              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Kategori</Text>
              <View style={styles.categorySelect}>
                {categories.slice(0, 4).map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: ticketCategory === cat.id ? cat.iconColor : (isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5'),
                        borderColor: ticketCategory === cat.id ? cat.iconColor : 'transparent',
                      }
                    ]}
                    onPress={() => setTicketCategory(cat.id)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      { color: ticketCategory === cat.id ? 'white' : colors.text }
                    ]}>
                      {cat.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Açıklama</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                  color: colors.text,
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5',
                }]}
                value={ticketDescription}
                onChangeText={setTicketDescription}
                placeholder="Sorununuzu detaylı şekilde anlatın..."
                placeholderTextColor={colors.zinc[500]}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitTicket}>
              <LinearGradient
                colors={['#4B30B8', '#6366F1']}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="send" size={18} color="white" />
                <Text style={styles.submitButtonText}>Gönder</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Live Chat Modal */}
      <Modal visible={showChatModal} animationType="slide">
        <SafeAreaView style={[styles.chatModalContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
          >
            {/* Header */}
            <LinearGradient
              colors={gradients.primary}
              style={styles.chatHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.chatHeaderLeft}>
                <View style={styles.chatAvatar}>
                  <Ionicons name="person" size={20} color="white" />
                </View>
                <View>
                  <Text style={styles.chatHeaderTitle}>Destek Ekibi</Text>
                  <View style={styles.chatOnlineStatus}>
                    <View style={styles.chatOnlineDot} />
                    <Text style={styles.chatOnlineText}>Çevrimiçi</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowChatModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Messages */}
            <FlatList
              ref={chatScrollRef}
              data={chatMessages}
              keyExtractor={(item) => item.id}
              style={styles.chatMessages}
              contentContainerStyle={[styles.chatMessagesContent, { flexGrow: 1, justifyContent: 'flex-end' }]}
              onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <View style={[
                  styles.chatBubble,
                  item.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleSupport,
                  { backgroundColor: item.sender === 'user' ? colors.brand[500] : (isDark ? 'rgba(255,255,255,0.1)' : '#F5F5F5') }
                ]}>
                  <Text style={[
                    styles.chatBubbleText,
                    { color: item.sender === 'user' ? 'white' : colors.text }
                  ]}>
                    {item.text}
                  </Text>
                  <Text style={[
                    styles.chatBubbleTime,
                    { color: item.sender === 'user' ? 'rgba(255,255,255,0.7)' : colors.textMuted }
                  ]}>
                    {item.time}
                  </Text>
                </View>
              )}
            />

            {/* Input */}
            <View style={[styles.chatInputContainer, {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5',
            }]}>
              <TextInput
                style={[styles.chatInput, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F5F5F5',
                  color: colors.text,
                }]}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Mesajınızı yazın..."
                placeholderTextColor={colors.zinc[500]}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.chatSendButton, { opacity: chatInput.trim() ? 1 : 0.5 }]}
                onPress={handleSendMessage}
                disabled={!chatInput.trim()}
              >
                <LinearGradient
                  colors={['#4B30B8', '#6366F1']}
                  style={styles.chatSendButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="send" size={18} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Ticket List Modal */}
      <Modal visible={showTicketListModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Destek Taleplerim</Text>
              <TouchableOpacity onPress={() => setShowTicketListModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {tickets.length === 0 ? (
                <View style={styles.emptyTickets}>
                  <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyTicketsText, { color: colors.textMuted }]}>
                    Henüz destek talebiniz yok
                  </Text>
                </View>
              ) : (
                tickets.map((ticket) => (
                  <TouchableOpacity
                    key={ticket.id}
                    style={[styles.ticketItem, {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5',
                    }]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.ticketItemHeader}>
                      <Text style={[styles.ticketItemSubject, { color: colors.text }]}>{ticket.subject}</Text>
                      <View style={[styles.ticketStatusBadge, { backgroundColor: `${getStatusColor(ticket.status)}20` }]}>
                        <View style={[styles.ticketStatusDot, { backgroundColor: getStatusColor(ticket.status) }]} />
                        <Text style={[styles.ticketStatusText, { color: getStatusColor(ticket.status) }]}>
                          {getStatusLabel(ticket.status)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.ticketItemMeta}>
                      <Text style={[styles.ticketItemDate, { color: colors.textMuted }]}>
                        Oluşturulma: {ticket.date}
                      </Text>
                      <Text style={[styles.ticketItemDate, { color: colors.textMuted }]}>
                        Son güncelleme: {ticket.lastUpdate}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.newTicketButton}
              onPress={() => {
                setShowTicketListModal(false);
                setTimeout(() => setShowTicketModal(true), 300);
              }}
            >
              <LinearGradient
                colors={['#4B30B8', '#6366F1']}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.submitButtonText}>Yeni Talep Oluştur</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Guide Modal */}
      <Modal visible={showGuideModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', maxHeight: '95%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedGuide ? selectedGuide.title : 'Kullanım Kılavuzu'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (selectedGuide) {
                    setSelectedGuide(null);
                  } else {
                    setShowGuideModal(false);
                  }
                }}
              >
                <Ionicons name={selectedGuide ? 'arrow-back' : 'close'} size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedGuide ? (
                // Guide Detail View
                <View>
                  <View style={[styles.guideDetailHeader, { backgroundColor: `${selectedGuide.color}15` }]}>
                    <View style={[styles.guideDetailIcon, { backgroundColor: selectedGuide.color }]}>
                      <Ionicons name={selectedGuide.icon} size={28} color="white" />
                    </View>
                    <View style={styles.guideDetailInfo}>
                      <Text style={[styles.guideDetailTitle, { color: colors.text }]}>{selectedGuide.title}</Text>
                      <Text style={[styles.guideDetailDesc, { color: colors.textSecondary }]}>{selectedGuide.description}</Text>
                      <View style={styles.guideDetailMeta}>
                        <Ionicons name="document-text" size={14} color={colors.textMuted} />
                        <Text style={[styles.guideDetailMetaText, { color: colors.textMuted }]}>
                          {selectedGuide.articles.length} makale
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.guideArticlesList}>
                    {selectedGuide.articles.map((article, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.guideArticleItem, {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
                          borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E5E5E5',
                        }]}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.guideArticleNumber, { backgroundColor: `${selectedGuide.color}20` }]}>
                          <Text style={[styles.guideArticleNumberText, { color: selectedGuide.color }]}>{index + 1}</Text>
                        </View>
                        <View style={styles.guideArticleContent}>
                          <Text style={[styles.guideArticleTitle, { color: colors.text }]}>{article.title}</Text>
                          <View style={styles.guideArticleMeta}>
                            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                            <Text style={[styles.guideArticleTime, { color: colors.textMuted }]}>{article.duration} okuma</Text>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                // Guide List View
                <View>
                  <View style={styles.guideIntro}>
                    <Text style={[styles.guideIntroText, { color: colors.textSecondary }]}>
                      Turing platformunu en verimli şekilde kullanmak için hazırladığımız rehberlere göz atın.
                    </Text>
                  </View>

                  {guides.map((guide) => (
                    <TouchableOpacity
                      key={guide.id}
                      style={[styles.guideCard, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
                        borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E5E5E5',
                      }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedGuide(guide);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.guideCardIcon, { backgroundColor: `${guide.color}15` }]}>
                        <Ionicons name={guide.icon} size={24} color={guide.color} />
                      </View>
                      <View style={styles.guideCardContent}>
                        <Text style={[styles.guideCardTitle, { color: colors.text }]}>{guide.title}</Text>
                        <Text style={[styles.guideCardDesc, { color: colors.textMuted }]}>{guide.description}</Text>
                        <View style={styles.guideCardMeta}>
                          <View style={[styles.guideCardBadge, { backgroundColor: `${guide.color}15` }]}>
                            <Text style={[styles.guideCardBadgeText, { color: guide.color }]}>
                              {guide.articles.length} makale
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Videos Modal */}
      <Modal visible={showVideosModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', maxHeight: '95%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Video Eğitimler</Text>
              <TouchableOpacity onPress={() => setShowVideosModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Video Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videoCategoriesScroll}>
              <View style={styles.videoCategoriesRow}>
                {videoCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.videoCategoryChip,
                      {
                        backgroundColor: selectedVideoCategory === cat.id
                          ? colors.brand[500]
                          : (isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5'),
                      }
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedVideoCategory(cat.id);
                    }}
                  >
                    <Text style={[
                      styles.videoCategoryText,
                      { color: selectedVideoCategory === cat.id ? 'white' : colors.text }
                    ]}>
                      {cat.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Video Stats */}
              <View style={styles.videoStats}>
                <View style={[styles.videoStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB' }]}>
                  <Text style={[styles.videoStatNumber, { color: colors.brand[500] }]}>{videos.length}</Text>
                  <Text style={[styles.videoStatLabel, { color: colors.textMuted }]}>Video</Text>
                </View>
                <View style={[styles.videoStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB' }]}>
                  <Text style={[styles.videoStatNumber, { color: '#10B981' }]}>1:05+</Text>
                  <Text style={[styles.videoStatLabel, { color: colors.textMuted }]}>Saat</Text>
                </View>
                <View style={[styles.videoStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB' }]}>
                  <Text style={[styles.videoStatNumber, { color: '#F59E0B' }]}>95K+</Text>
                  <Text style={[styles.videoStatLabel, { color: colors.textMuted }]}>İzlenme</Text>
                </View>
              </View>

              {/* Video List */}
              <View style={styles.videoList}>
                {videos
                  .filter((v) => selectedVideoCategory === 'all' || v.category === selectedVideoCategory)
                  .map((video) => (
                    <TouchableOpacity
                      key={video.id}
                      style={[styles.videoCard, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E5E5E5',
                      }]}
                      activeOpacity={0.7}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Alert.alert('Video', `"${video.title}" videosu oynatılacak`);
                      }}
                    >
                      <View style={[styles.videoThumbnail, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
                        <Text style={styles.videoThumbnailEmoji}>{video.thumbnail}</Text>
                        <View style={styles.videoDurationBadge}>
                          <Text style={styles.videoDurationText}>{video.duration}</Text>
                        </View>
                        <View style={styles.videoPlayIcon}>
                          <Ionicons name="play" size={20} color="white" />
                        </View>
                      </View>
                      <View style={styles.videoInfo}>
                        <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>{video.title}</Text>
                        <View style={styles.videoMeta}>
                          <View style={styles.videoMetaItem}>
                            <Ionicons name="eye-outline" size={12} color={colors.textMuted} />
                            <Text style={[styles.videoMetaText, { color: colors.textMuted }]}>{video.views}</Text>
                          </View>
                          <View style={[styles.videoCategoryBadge, { backgroundColor: 'rgba(75, 48, 184, 0.1)' }]}>
                            <Text style={[styles.videoCategoryBadgeText, { color: colors.brand[500] }]}>
                              {videoCategories.find((c) => c.id === video.category)?.title}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Blog Modal */}
      <Modal visible={showBlogModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', maxHeight: '95%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Blog Yazıları</Text>
              <TouchableOpacity onPress={() => setShowBlogModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Featured Post */}
              {blogPosts.filter((p) => p.featured).map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={[styles.blogFeaturedCard, {
                    backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.05)',
                    borderColor: isDark ? 'rgba(75, 48, 184, 0.3)' : 'rgba(75, 48, 184, 0.15)',
                  }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert('Blog', `"${post.title}" yazısı açılacak`);
                  }}
                >
                  <View style={styles.blogFeaturedBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={[styles.blogFeaturedBadgeText, { color: '#F59E0B' }]}>Öne Çıkan</Text>
                  </View>
                  <View style={styles.blogFeaturedContent}>
                    <Text style={styles.blogFeaturedEmoji}>{post.image}</Text>
                    <View style={styles.blogFeaturedTexts}>
                      <Text style={[styles.blogFeaturedTitle, { color: colors.text }]}>{post.title}</Text>
                      <Text style={[styles.blogFeaturedExcerpt, { color: colors.textSecondary }]} numberOfLines={2}>
                        {post.excerpt}
                      </Text>
                      <View style={styles.blogFeaturedMeta}>
                        <Text style={[styles.blogFeaturedDate, { color: colors.textMuted }]}>{post.date}</Text>
                        <View style={styles.blogFeaturedDot} />
                        <Text style={[styles.blogFeaturedRead, { color: colors.brand[400] }]}>{post.readTime} okuma</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Blog Categories */}
              <View style={styles.blogCategoriesContainer}>
                <Text style={[styles.blogSectionTitle, { color: colors.textMuted }]}>KATEGORİLER</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.blogCategoriesRow}>
                    {['Tümü', 'İpuçları', 'Rehber', 'Platform', 'Trendler', 'Başarı'].map((cat, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.blogCategoryChip, {
                          backgroundColor: idx === 0 ? colors.brand[500] : (isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5'),
                        }]}
                      >
                        <Text style={[styles.blogCategoryText, { color: idx === 0 ? 'white' : colors.text }]}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Blog Posts List */}
              <View style={styles.blogPostsList}>
                {blogPosts.filter((p) => !p.featured).map((post) => (
                  <TouchableOpacity
                    key={post.id}
                    style={[styles.blogPostCard, {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E5E5E5',
                    }]}
                    activeOpacity={0.7}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Blog', `"${post.title}" yazısı açılacak`);
                    }}
                  >
                    <View style={[styles.blogPostImage, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
                      <Text style={styles.blogPostEmoji}>{post.image}</Text>
                    </View>
                    <View style={styles.blogPostContent}>
                      <View style={[styles.blogPostCategoryBadge, { backgroundColor: 'rgba(75, 48, 184, 0.1)' }]}>
                        <Text style={[styles.blogPostCategoryText, { color: colors.brand[500] }]}>{post.category}</Text>
                      </View>
                      <Text style={[styles.blogPostTitle, { color: colors.text }]} numberOfLines={2}>{post.title}</Text>
                      <View style={styles.blogPostMeta}>
                        <Text style={[styles.blogPostDate, { color: colors.textMuted }]}>{post.date}</Text>
                        <View style={styles.blogPostDot} />
                        <Text style={[styles.blogPostRead, { color: colors.textMuted }]}>{post.readTime}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Load More */}
              <TouchableOpacity style={[styles.blogLoadMore, { borderColor: colors.brand[500] }]}>
                <Text style={[styles.blogLoadMoreText, { color: colors.brand[500] }]}>Daha Fazla Göster</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  historyButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(75, 48, 184, 0.1)',
    gap: 6,
  },
  filterTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  faqCount: {
    fontSize: 12,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  contactSub: {
    fontSize: 10,
    marginTop: 2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '31%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  faqCategoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingLeft: 36,
  },
  faqAnswerText: {
    fontSize: 13,
    lineHeight: 20,
  },
  faqActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  faqHelpful: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  faqHelpfulText: {
    fontSize: 12,
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptyStateClear: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  liveChatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  liveChatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  liveChatIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveChatInfo: {
    flex: 1,
  },
  liveChatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveChatTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  liveChatDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#22c55e',
  },
  createTicketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  ticketIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketInfo: {
    flex: 1,
    marginLeft: 14,
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  ticketDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  resourcesCard: {
    borderRadius: 16,
    borderWidth: 1,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  resourceLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resourceSub: {
    fontSize: 11,
    marginTop: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 120,
  },
  categorySelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  submitButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Chat modal styles
  chatModalContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  chatOnlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chatOnlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  chatOnlineText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: 16,
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  chatBubbleSupport: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  chatBubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatBubbleTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  chatSendButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  chatSendButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Ticket list styles
  emptyTickets: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTicketsText: {
    fontSize: 14,
    marginTop: 12,
  },
  ticketItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  ticketItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketItemSubject: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  ticketStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  ticketStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ticketStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ticketItemMeta: {
    marginTop: 10,
    gap: 2,
  },
  ticketItemDate: {
    fontSize: 12,
  },
  newTicketButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  // Resource section styles
  resourceTextContainer: {
    flex: 1,
  },
  resourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  resourceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  quickLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  quickLinkCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLinkText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Guide Modal Styles
  guideIntro: {
    marginBottom: 20,
  },
  guideIntroText: {
    fontSize: 14,
    lineHeight: 20,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  guideCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideCardContent: {
    flex: 1,
    marginLeft: 14,
  },
  guideCardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  guideCardDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  guideCardMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  guideCardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  guideCardBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  guideDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  guideDetailIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideDetailInfo: {
    flex: 1,
    marginLeft: 16,
  },
  guideDetailTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  guideDetailDesc: {
    fontSize: 13,
    marginTop: 4,
  },
  guideDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  guideDetailMetaText: {
    fontSize: 12,
  },
  guideArticlesList: {
    gap: 10,
  },
  guideArticleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  guideArticleNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideArticleNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  guideArticleContent: {
    flex: 1,
    marginLeft: 12,
  },
  guideArticleTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  guideArticleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  guideArticleTime: {
    fontSize: 11,
  },
  // Video Modal Styles
  videoCategoriesScroll: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  videoCategoriesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  videoCategoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  videoCategoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  videoStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  videoStatItem: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  videoStatNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  videoStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  videoList: {
    gap: 12,
  },
  videoCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: 120,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  videoThumbnailEmoji: {
    fontSize: 32,
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDurationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  videoPlayIcon: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(75, 48, 184, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  videoMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoMetaText: {
    fontSize: 11,
  },
  videoCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  videoCategoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Blog Modal Styles
  blogFeaturedCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  blogFeaturedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  blogFeaturedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  blogFeaturedContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  blogFeaturedEmoji: {
    fontSize: 40,
  },
  blogFeaturedTexts: {
    flex: 1,
  },
  blogFeaturedTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  blogFeaturedExcerpt: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  blogFeaturedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  blogFeaturedDate: {
    fontSize: 11,
  },
  blogFeaturedDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9CA3AF',
  },
  blogFeaturedRead: {
    fontSize: 11,
    fontWeight: '500',
  },
  blogCategoriesContainer: {
    marginBottom: 20,
  },
  blogSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  blogCategoriesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  blogCategoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  blogCategoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  blogPostsList: {
    gap: 12,
  },
  blogPostCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  blogPostImage: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blogPostEmoji: {
    fontSize: 32,
  },
  blogPostContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  blogPostCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  blogPostCategoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  blogPostTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  blogPostMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  blogPostDate: {
    fontSize: 11,
  },
  blogPostDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9CA3AF',
  },
  blogPostRead: {
    fontSize: 11,
  },
  blogLoadMore: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 16,
    marginBottom: 20,
  },
  blogLoadMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
