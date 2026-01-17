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
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import * as Haptics from 'expo-haptics';

interface TermsSection {
  id: string;
  title: string;
  content: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const termsContent: TermsSection[] = [
  {
    id: 'service',
    title: 'Hizmet Koşulları',
    icon: 'shield-checkmark',
    content: `Turing uygulamasını kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Bu platform, etkinlik organizatörleri ile hizmet sağlayıcılarını bir araya getiren bir pazaryeri hizmeti sunmaktadır.

Kullanıcılar, platformu yasal amaçlar doğrultusunda kullanmayı, diğer kullanıcıların haklarını ihlal etmemeyi ve platformun güvenliğini tehlikeye atacak eylemlerden kaçınmayı kabul ederler.

Platform, kullanıcıların yasadışı faaliyetlerde bulunmasını kesinlikle yasaklamaktadır.`,
  },
  {
    id: 'account',
    title: 'Hesap ve Güvenlik',
    icon: 'lock-closed',
    content: `Hesap oluştururken doğru ve güncel bilgiler vermeniz gerekmektedir. Hesabınızın güvenliğinden siz sorumlusunuz ve şifrenizi başkalarıyla paylaşmamalısınız.

Şüphe verici herhangi bir yetkisiz erişim durumunda derhal bizi bilgilendirmeniz gerekmektedir.

İki faktörlü kimlik doğrulamayı aktif tutmanız önerilir. Platform, güvenlik ihlallerinde hesabınızı geçici olarak askıya alma hakkını saklı tutar.`,
  },
  {
    id: 'provider',
    title: 'Hizmet Sağlayıcı Yükümlülükleri',
    icon: 'briefcase',
    content: `Hizmet sağlayıcıları, sundukları hizmetlerin kalitesinden ve zamanında tesliminden sorumludur. Yanıltıcı bilgi veya gerçek dışı tanıtım yapmak yasaktır.

Hizmet sağlayıcıları, tüm yasal gereklilikleri yerine getirmekle yükümlüdür.

• Lisans ve izin belgelerinin güncel tutulması
• Vergi yükümlülüklerinin yerine getirilmesi
• Sigorta gerekliliklerinin karşılanması
• Profesyonel davranış standartlarına uyum`,
  },
  {
    id: 'organizer',
    title: 'Organizatör Yükümlülükleri',
    icon: 'calendar',
    content: `Etkinlik organizatörleri, etkinlik bilgilerinin doğruluğundan sorumludur. Ödemelerin zamanında yapılması ve anlaşılan şartlara uyulması beklenmektedir.

Organizatörler:
• Etkinlik detaylarını doğru ve eksiksiz girmelidir
• Hizmet sağlayıcılarla yapılan anlaşmalara uymalıdır
• İptal durumunda ilgili politikalara uymalıdır
• Platform kurallarına riayet etmelidir`,
  },
  {
    id: 'payment',
    title: 'Ödeme ve Ücretler',
    icon: 'card',
    content: `Platform üzerinden yapılan işlemlerden hizmet bedeli alınabilir. Ödeme koşulları ve iade politikaları ayrı bir dokümanda detaylandırılmıştır.

• Tüm fiyatlar aksi belirtilmedikçe KDV hariç olarak gösterilmektedir
• Platform komisyonu işlem bazında hesaplanır
• Ödemeler güvenli ödeme altyapısı üzerinden gerçekleştirilir
• İade talepleri 14 gün içinde değerlendirilir`,
  },
  {
    id: 'ip',
    title: 'Fikri Mülkiyet',
    icon: 'document',
    content: `Turing uygulamasının tüm içerik ve tasarımları, fikri mülkiyet yasaları kapsamında korunmaktadır. İzinsiz kullanım yasaktır.

Kullanıcılar, platforma yükledikleri içeriklerin haklarına sahip olduklarını beyan ve taahhüt ederler. Platform, telif hakkı ihlali bildirimlerini ciddiye alır ve gerekli aksiyonları alır.`,
  },
  {
    id: 'liability',
    title: 'Sorumluluk Sınırlaması',
    icon: 'alert-circle',
    content: `Platform, kullanıcılar arası anlaşmazlıklardan doğrudan sorumlu değildir. Arabuluculuk hizmeti sunulabilir ancak nihai sorumluluk taraflara aittir.

Platform şu durumlarda sorumluluk kabul etmez:
• Hizmet sağlayıcı ve organizatör arasındaki anlaşmazlıklar
• Teknik aksaklıklar nedeniyle oluşan gecikmeler
• Üçüncü taraf hizmetlerinden kaynaklanan sorunlar
• Mücbir sebep halleri`,
  },
  {
    id: 'changes',
    title: 'Değişiklikler',
    icon: 'create',
    content: `Bu kullanım koşulları önceden haber verilmeksizin değiştirilebilir. Önemli değişiklikler kullanıcılara bildirilecektir.

Değişiklik sonrası platformu kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir. Önemli değişiklikler için 30 gün önceden bildirim yapılır.`,
  },
  {
    id: 'termination',
    title: 'Hesap Sonlandırma',
    icon: 'close-circle',
    content: `Kullanıcılar hesaplarını istedikleri zaman kapatabilir. Platform, koşulları ihlal eden hesapları askıya alma veya sonlandırma hakkını saklı tutar.

Hesap kapatıldığında:
• Aktif işlemler tamamlanır veya iptal edilir
• Kişisel veriler yasal süreçler dahilinde silinir
• Ödenmemiş tutarlar tahsil edilir
• Geri bildirim ve değerlendirmeler anonim olarak saklanır`,
  },
  {
    id: 'dispute',
    title: 'Uyuşmazlık Çözümü',
    icon: 'scale',
    content: `Bu koşullardan doğan uyuşmazlıklar öncelikle dostane yollarla çözülmeye çalışılır. Çözüm bulunamadığı takdirde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.

Arabuluculuk süreci:
• Şikayet bildirimi yapılır
• Platform 5 iş günü içinde değerlendirir
• Taraflar bilgilendirilir
• Arabuluculuk önerilir
• Anlaşma sağlanamazsa yasal süreç başlar`,
  },
];

export function TermsScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['service']);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress] = useState(new Animated.Value(0));
  const sectionPositions = useRef<Record<string, number>>({});

  const filteredSections = termsContent.filter(
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
    setExpandedSections(termsContent.map((s) => s.id));
  };

  const collapseAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSections([]);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: 'Turing Kullanım Koşulları: https://turing.app/terms',
        title: 'Kullanım Koşulları',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kullanım Koşulları</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: colors.brand[500], width: progressWidth },
          ]}
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
            placeholder="Koşullarda ara..."
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
              backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.05)',
              borderColor: isDark ? 'rgba(75, 48, 184, 0.2)' : 'rgba(75, 48, 184, 0.15)',
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.brand[500] }]}>
            <Ionicons name="document-text" size={24} color="white" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Kullanım Koşulları</Text>
            <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
              Versiyon 2.1 • Son güncelleme: 15 Ocak 2026
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] }]}
            onPress={expandAll}
          >
            <Ionicons name="expand" size={16} color={colors.brand[400]} />
            <Text style={[styles.actionText, { color: colors.text }]}>Tümünü Aç</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] }]}
            onPress={collapseAll}
          >
            <Ionicons name="contract" size={16} color={colors.brand[400]} />
            <Text style={[styles.actionText, { color: colors.text }]}>Tümünü Kapat</Text>
          </TouchableOpacity>
        </View>

        {/* Table of Contents */}
        <View
          style={[
            styles.tocCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.tocTitle, { color: colors.textSecondary }]}>İÇİNDEKİLER</Text>
          <View style={styles.tocList}>
            {termsContent.map((section, index) => (
              <TouchableOpacity
                key={section.id}
                style={styles.tocItem}
                onPress={() => scrollToSection(section.id)}
              >
                <Text style={[styles.tocNumber, { color: colors.brand[400] }]}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Text
                  style={[
                    styles.tocText,
                    { color: colors.text },
                    expandedSections.includes(section.id) && { color: colors.brand[500] },
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
              style={[
                styles.section,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
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
                      {
                        backgroundColor: isDark
                          ? 'rgba(75, 48, 184, 0.2)'
                          : 'rgba(75, 48, 184, 0.1)',
                      },
                    ]}
                  >
                    <Ionicons name={section.icon} size={18} color={colors.brand[400]} />
                  </View>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={[styles.sectionNumber, { color: colors.textMuted }]}>
                      Madde {index + 1}
                    </Text>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      {section.title}
                    </Text>
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

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View
            style={[
              styles.footerCard,
              {
                backgroundColor: isDark ? colors.zinc[800] : colors.zinc[50],
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="mail-outline" size={20} color={colors.brand[400]} />
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Bu koşullarla ilgili sorularınız için{' '}
              <Text style={{ color: colors.brand[400], fontWeight: '600' }}>
                destek@turing.app
              </Text>{' '}
              adresine e-posta gönderebilirsiniz.
            </Text>
          </View>

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
          style={[styles.scrollTopButton, { backgroundColor: colors.brand[500] }]}
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
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    marginTop: 8,
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
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
