import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
  Share,
  Alert,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import * as Haptics from 'expo-haptics';

interface PrivacySection {
  id: string;
  title: string;
  content: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const privacyContent: PrivacySection[] = [
  {
    id: 'collected',
    title: 'Toplanan Veriler',
    icon: 'folder-open',
    content: `Turing uygulaması aşağıdaki verileri toplar:

• Kimlik Bilgileri: Ad, soyad, e-posta adresi, telefon numarası
• Profil Bilgileri: Profil fotoğrafı, iş tanımı, hizmet alanları
• Konum Verileri: Etkinlik konumları ve hizmet bölgeleri
• Kullanım Verileri: Uygulama içerisindeki etkileşimleriniz
• Cihaz Bilgileri: Cihaz türü, işletim sistemi, benzersiz tanımlayıcılar
• Ödeme Bilgileri: Kart bilgileri (güvenli ödeme sağlayıcısında şifrelenir)`,
  },
  {
    id: 'usage',
    title: 'Verilerin Kullanımı',
    icon: 'analytics',
    content: `Topladığımız veriler aşağıdaki amaçlarla kullanılır:

• Hizmetlerimizi sunmak ve iyileştirmek
• Kullanıcı deneyimini kişiselleştirmek
• Güvenlik ve dolandırıcılık önleme
• Yasal yükümlülükleri yerine getirmek
• İstatistiksel analizler yapmak
• Müşteri desteği sağlamak
• Pazarlama iletişimi (izniniz dahilinde)`,
  },
  {
    id: 'sharing',
    title: 'Veri Paylaşımı',
    icon: 'share-social',
    content: `Verileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:

• Hizmet sağlayıcılarınız veya organizatörleriniz ile (işlem gereği)
• Ödeme işlemcileri (güvenli ödeme için)
• Yasal zorunluluklar
• Sizin açık izniniz ile
• Anonim ve toplu istatistikler

Verileriniz hiçbir koşulda satılmaz veya reklam amaçlı pazarlanmaz.`,
  },
  {
    id: 'security',
    title: 'Veri Güvenliği',
    icon: 'shield-checkmark',
    content: `Verilerinizin güvenliğini sağlamak için:

• 256-bit SSL/TLS şifreleme kullanıyoruz
• Düzenli güvenlik denetimleri ve penetrasyon testleri yapıyoruz
• Rol tabanlı erişim kontrolü uyguluyoruz
• Verileri ISO 27001 sertifikalı veri merkezlerinde saklıyoruz
• İki faktörlü kimlik doğrulama sunuyoruz
• Oturum güvenliği ve şüpheli aktivite izleme yapıyoruz`,
  },
  {
    id: 'cookies',
    title: 'Çerezler ve İzleme',
    icon: 'information-circle',
    content: `Uygulama ve web sitemizde çerezler ve benzer izleme teknolojileri kullanılmaktadır:

Zorunlu Çerezler:
• Oturum yönetimi
• Güvenlik

Tercih Çerezleri:
• Dil ve tema tercihleri
• Kişiselleştirme

Analitik Çerezler:
• Kullanım istatistikleri
• Performans izleme

Çerez tercihlerinizi uygulama ayarlarından yönetebilirsiniz.`,
  },
  {
    id: 'rights',
    title: 'Kullanıcı Hakları (KVKK)',
    icon: 'checkmark-circle',
    content: `6698 sayılı KVKK kapsamında aşağıdaki haklara sahipsiniz:

• Verilerinizin işlenip işlenmediğini öğrenme
• Verilerinize erişim talep etme
• Verilerin düzeltilmesini isteme
• Verilerin silinmesini talep etme (unutulma hakkı)
• Veri işlemeye itiraz etme
• Veri taşınabilirliği
• Otomatik kararlarla ilgili itiraz

Bu haklarınızı kullanmak için uygulama içi form veya veri@turing.app adresini kullanabilirsiniz.`,
  },
  {
    id: 'retention',
    title: 'Veri Saklama',
    icon: 'time',
    content: `Verileriniz aşağıdaki sürelerde saklanır:

• Hesap bilgileri: Hesap aktif olduğu sürece
• İşlem kayıtları: 10 yıl (yasal zorunluluk)
• İletişim kayıtları: 3 yıl
• Analitik veriler: 2 yıl (anonimleştirilmiş)
• Çerez verileri: Maksimum 1 yıl

Hesabınızı sildiğinizde:
• Kişisel verileriniz 30 gün içinde silinir
• Yasal zorunluluklar kapsamındaki veriler saklama süresince korunur
• Anonim veriler istatistiksel amaçlarla tutulmaya devam eder`,
  },
  {
    id: 'international',
    title: 'Uluslararası Veri Aktarımı',
    icon: 'globe',
    content: `Verileriniz yurt dışına aktarılabilir:

• Bulut altyapı hizmetleri (AWS, Google Cloud)
• Ödeme işlemcileri
• Analitik hizmetleri

Tüm uluslararası aktarımlar:
• Standart sözleşme maddeleri ile korunur
• GDPR ve KVKK uyumludur
• Yeterli koruma seviyesi sağlayan ülkelere yapılır`,
  },
  {
    id: 'changes',
    title: 'Politika Değişiklikleri',
    icon: 'create',
    content: `Bu gizlilik politikası güncellenebilir:

• Önemli değişiklikler size e-posta ile bildirilecektir
• Değişiklikler uygulama içerisinde duyurulacaktır
• Yeni politika yayınlandığında yürürlüğe girer
• Eski sürümlere erişim sağlanır

Değişiklik sonrası platformu kullanmaya devam etmeniz, güncel politikayı kabul ettiğiniz anlamına gelir.`,
  },
];

export function PrivacyPolicyScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['collected']);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress] = useState(new Animated.Value(0));
  const sectionPositions = useRef<Record<string, number>>({});

  const filteredSections = privacyContent.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSection = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const scrollToSection = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const position = sectionPositions.current[id];
    if (position !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: position - 100, animated: true });
      if (!expandedSections.includes(id)) {
        setExpandedSections((prev) => [...prev, id]);
      }
    }
  };

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const progress = contentOffset.y / (contentSize.height - layoutMeasurement.height);
      scrollProgress.setValue(Math.min(Math.max(progress, 0), 1));
      setShowScrollTop(contentOffset.y > 300);
    },
    [scrollProgress]
  );

  const scrollToTop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const expandAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSections(privacyContent.map((s) => s.id));
  };

  const collapseAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSections([]);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: 'Turing Gizlilik Politikası: https://turing.app/privacy',
        title: 'Gizlilik Politikası',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleDataRequest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Veri Talebi',
      'Ne tür bir talep göndermek istiyorsunuz?',
      [
        {
          text: 'Verilerimi İndir',
          onPress: () => {
            Alert.alert('Talep Alındı', 'Verileriniz 48 saat içinde e-posta adresinize gönderilecektir.');
          },
        },
        {
          text: 'Verilerimi Sil',
          onPress: () => {
            Alert.alert(
              'Emin misiniz?',
              'Tüm verileriniz 30 gün içinde kalıcı olarak silinecektir.',
              [
                { text: 'İptal', style: 'cancel' },
                {
                  text: 'Devam Et',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Talep Alındı', 'Silme talebiniz işleme alındı.');
                  },
                },
              ]
            );
          },
          style: 'destructive',
        },
        { text: 'İptal', style: 'cancel' },
      ]
    );
  };

  const handleContactDPO = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('mailto:veri@turing.app?subject=Gizlilik%20Talebi');
  };

  const progressWidth = scrollProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Gizlilik Politikası</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[styles.progressFill, { backgroundColor: colors.success, width: progressWidth }]}
        />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Politikada ara..."
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

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
      >
        {/* Info Card */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.success }]}>
            <Ionicons name="shield-checkmark" size={24} color="white" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Gizlilik Politikası</Text>
            <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
              Versiyon 3.0 • Son güncelleme: 10 Ocak 2026
            </Text>
          </View>
        </View>

        {/* Compliance Badges */}
        <View style={styles.badgesContainer}>
          <View style={[styles.badge, { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] }]}>
            <Ionicons name="shield" size={16} color={colors.success} />
            <Text style={[styles.badgeText, { color: colors.text }]}>KVKK Uyumlu</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] }]}>
            <Ionicons name="lock-closed" size={16} color={colors.info} />
            <Text style={[styles.badgeText, { color: colors.text }]}>GDPR Uyumlu</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] }]}>
            <Ionicons name="checkmark-done" size={16} color={colors.brand[400]} />
            <Text style={[styles.badgeText, { color: colors.text }]}>ISO 27001</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View
          style={[styles.summaryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
        >
          <View style={styles.summaryHeader}>
            <Ionicons name="bulb" size={20} color={colors.warning} />
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Özet</Text>
          </View>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            Turing, kullanıcı gizliliğine önem verir. Verilerinizi yalnızca hizmet sunumu için toplar,
            güvenli bir şekilde saklar ve izniniz olmadan üçüncü taraflarla paylaşmaz.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] }]}
            onPress={expandAll}
          >
            <Ionicons name="expand" size={16} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.text }]}>Tümünü Aç</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] }]}
            onPress={collapseAll}
          >
            <Ionicons name="contract" size={16} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.text }]}>Tümünü Kapat</Text>
          </TouchableOpacity>
        </View>

        {/* Table of Contents */}
        <View style={[styles.tocCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.tocTitle, { color: colors.textSecondary }]}>İÇİNDEKİLER</Text>
          <View style={styles.tocList}>
            {privacyContent.map((section, index) => (
              <TouchableOpacity
                key={section.id}
                style={styles.tocItem}
                onPress={() => scrollToSection(section.id)}
              >
                <Text style={[styles.tocNumber, { color: colors.success }]}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Text
                  style={[
                    styles.tocText,
                    { color: colors.text },
                    expandedSections.includes(section.id) && { color: colors.success },
                  ]}
                  numberOfLines={1}
                >
                  {section.title}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sections */}
        {filteredSections.map((section, index) => {
          const isExpanded = expandedSections.includes(section.id);

          return (
            <View
              key={section.id}
              style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onLayout={(event) => {
                sectionPositions.current[section.id] = event.nativeEvent.layout.y;
              }}
            >
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(section.id)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionHeaderLeft}>
                  <View
                    style={[
                      styles.sectionIcon,
                      { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)' },
                    ]}
                  >
                    <Ionicons name={section.icon} size={18} color={colors.success} />
                  </View>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={[styles.sectionNumber, { color: colors.textMuted }]}>Madde {index + 1}</Text>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                  </View>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={[styles.sectionBody, { borderTopColor: colors.borderLight }]}>
                  <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
                    {section.content}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {/* No Results */}
        {filteredSections.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
              "{searchQuery}" için sonuç bulunamadı
            </Text>
          </View>
        )}

        {/* Data Request Card */}
        <View
          style={[
            styles.dataRequestCard,
            {
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
            },
          ]}
        >
          <View style={styles.dataRequestHeader}>
            <Ionicons name="document-text" size={24} color={colors.info} />
            <View style={styles.dataRequestTexts}>
              <Text style={[styles.dataRequestTitle, { color: colors.text }]}>Veri Talebi</Text>
              <Text style={[styles.dataRequestSubtitle, { color: colors.textSecondary }]}>
                KVKK kapsamında haklarınızı kullanın
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.dataRequestButton, { backgroundColor: colors.info }]}
            onPress={handleDataRequest}
          >
            <Text style={styles.dataRequestButtonText}>Talep Oluştur</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.footerCard, { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[50], borderColor: colors.border }]}
            onPress={handleContactDPO}
          >
            <Ionicons name="mail-outline" size={20} color={colors.success} />
            <View style={styles.footerCardTexts}>
              <Text style={[styles.footerCardTitle, { color: colors.text }]}>Veri Koruma Sorumlusu</Text>
              <Text style={[styles.footerCardEmail, { color: colors.success }]}>veri@turing.app</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.footerMeta}>
            <Text style={[styles.footerMetaText, { color: colors.textMuted }]}>
              Turing Technologies A.Ş. • 2026
            </Text>
            <Text style={[styles.footerMetaText, { color: colors.textMuted }]}>
              Tüm hakları saklıdır.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <TouchableOpacity
          style={[styles.scrollTopButton, { backgroundColor: colors.success }]}
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={20} color="white" />
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 3,
  },
  progressFill: {
    height: '100%',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  infoSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 21,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tocCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  tocTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  tocList: {
    gap: 2,
  },
  tocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  tocNumber: {
    fontSize: 12,
    fontWeight: '600',
    width: 24,
  },
  tocText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionNumber: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionBody: {
    padding: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  noResultsText: {
    fontSize: 15,
  },
  dataRequestCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 20,
  },
  dataRequestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  dataRequestTexts: {
    flex: 1,
  },
  dataRequestTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  dataRequestSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  dataRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  dataRequestButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  footerCardTexts: {
    flex: 1,
  },
  footerCardTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerCardEmail: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  footerMeta: {
    alignItems: 'center',
    paddingTop: 16,
    gap: 4,
  },
  footerMetaText: {
    fontSize: 12,
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
