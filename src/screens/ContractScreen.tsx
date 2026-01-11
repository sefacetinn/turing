import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Contract status types
type ContractStatus = 'draft' | 'pending_organizer' | 'pending_provider' | 'signed' | 'completed' | 'cancelled';

interface ContractParams {
  contractId?: string;
  offerId?: string;
}

// Contract templates based on service category
const getContractTemplate = (category: string) => {
  const templates: Record<string, { title: string; sections: { title: string; content: string }[] }> = {
    technical: {
      title: 'TEKNİK HİZMET SÖZLEŞMESİ',
      sections: [
        {
          title: '1. TARAFLAR',
          content: `Bu sözleşme, bir tarafta {{organizerName}} (bundan sonra "Organizatör" olarak anılacaktır) ile diğer tarafta {{providerName}} (bundan sonra "Hizmet Sağlayıcı" olarak anılacaktır) arasında aşağıdaki şartlar dahilinde akdedilmiştir.`,
        },
        {
          title: '2. SÖZLEŞMENİN KONUSU',
          content: `Bu sözleşmenin konusu, {{eventName}} etkinliği için Hizmet Sağlayıcı tarafından sunulacak {{serviceName}} hizmetinin şartlarını, kapsamını ve bedelini düzenlemektir.`,
        },
        {
          title: '3. HİZMET KAPSAMI',
          content: `Hizmet Sağlayıcı, aşağıda belirtilen teknik hizmetleri sağlamakla yükümlüdür:\n\n• Profesyonel ekipman kurulumu ve operasyonu\n• Etkinlik süresince teknik destek\n• Gerekli personel temini\n• Ekipman güvenliği ve bakımı\n• Acil durum müdahalesi`,
        },
        {
          title: '4. ETKİNLİK BİLGİLERİ',
          content: `Etkinlik Adı: {{eventName}}\nEtkinlik Tarihi: {{eventDate}}\nEtkinlik Yeri: {{eventLocation}}\nKurulum Başlangıcı: Etkinlikten {{setupTime}} önce\nSöküm Bitiş: Etkinlik bitiminden {{teardownTime}} sonra`,
        },
        {
          title: '5. ÖDEME ŞARTLARI',
          content: `Toplam Hizmet Bedeli: {{totalAmount}}\n\nÖdeme Planı:\n• %30 Peşinat: Sözleşme imzalandıktan sonra 3 iş günü içinde\n• %70 Bakiye: Etkinlik tamamlandıktan sonra 7 iş günü içinde\n\nÖdeme Yöntemi: Banka havalesi/EFT`,
        },
        {
          title: '6. İPTAL ŞARTLARI',
          content: `• Etkinlikten 30 gün önce iptal: Peşinat iade edilmez\n• Etkinlikten 15 gün önce iptal: Toplam bedelin %50'si tahsil edilir\n• Etkinlikten 7 gün önce iptal: Toplam bedelin %75'i tahsil edilir\n• Etkinlikten 3 gün önce veya sonrası: Tam bedel tahsil edilir`,
        },
        {
          title: '7. MÜCBİR SEBEPLER',
          content: `Doğal afetler, salgın hastalıklar, savaş, terör, grev veya hükümet kararları gibi tarafların kontrolü dışındaki mücbir sebep hallerinde, etkilenen taraf diğer tarafa derhal bilgi vermek kaydıyla yükümlülüklerinden kurtulur.`,
        },
        {
          title: '8. GİZLİLİK',
          content: `Taraflar, bu sözleşme kapsamında edindikleri tüm ticari ve teknik bilgileri gizli tutacak ve üçüncü şahıslarla paylaşmayacaktır.`,
        },
        {
          title: '9. UYUŞMAZLIK ÇÖZÜMÜ',
          content: `Bu sözleşmeden doğabilecek uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.`,
        },
      ],
    },
    booking: {
      title: 'SANATÇI/PERFORMANS SÖZLEŞMESİ',
      sections: [
        {
          title: '1. TARAFLAR',
          content: `Bu sözleşme, bir tarafta {{organizerName}} (bundan sonra "Organizatör" olarak anılacaktır) ile diğer tarafta {{providerName}} (bundan sonra "Ajans/Sanatçı" olarak anılacaktır) arasında aşağıdaki şartlar dahilinde akdedilmiştir.`,
        },
        {
          title: '2. SÖZLEŞMENİN KONUSU',
          content: `Bu sözleşmenin konusu, {{eventName}} etkinliği için {{serviceName}} performansının şartlarını, kapsamını ve bedelini düzenlemektir.`,
        },
        {
          title: '3. PERFORMANS DETAYLARI',
          content: `Performans Süresi: {{performanceDuration}}\nSahne Süresi: Minimum 60 dakika\nSound Check: Etkinlikten en az 3 saat önce\nBackstage Gereksinimleri: Özel soyunma odası, catering`,
        },
        {
          title: '4. TEKNİK RIDER',
          content: `Ajans/Sanatçı, etkinlikten en az 15 gün önce teknik rider'ı Organizatör'e iletecektir. Organizatör, teknik rider'da belirtilen tüm gereksinimleri karşılamakla yükümlüdür.`,
        },
        {
          title: '5. ETKİNLİK BİLGİLERİ',
          content: `Etkinlik Adı: {{eventName}}\nEtkinlik Tarihi: {{eventDate}}\nEtkinlik Yeri: {{eventLocation}}\nSahne Zamanı: {{stageTime}}\nTahmini Katılımcı: {{expectedAttendance}}`,
        },
        {
          title: '6. ÖDEME ŞARTLARI',
          content: `Toplam Performans Bedeli: {{totalAmount}}\n\nÖdeme Planı:\n• %50 Peşinat: Sözleşme imzalandıktan sonra 5 iş günü içinde\n• %50 Bakiye: Performans öncesi (sound check sonrası)\n\nKonaklama ve Ulaşım: Organizatör tarafından karşılanacaktır.`,
        },
        {
          title: '7. İPTAL VE ERTELENİME',
          content: `• Organizatör iptali (30+ gün): Peşinat iade edilmez\n• Organizatör iptali (30 gün içi): Tam bedel ödenir\n• Sanatçı iptali: Alternatif tarih sunulur veya peşinat iade edilir\n• Mücbir sebep: Yeni tarih belirlenir veya tam iade yapılır`,
        },
        {
          title: '8. GÖRÜNTÜ VE SES KAYDI',
          content: `Performansın görüntü ve ses kaydı için Ajans/Sanatçı'nın yazılı onayı gereklidir. Ticari kullanım için ayrı bir anlaşma yapılması zorunludur.`,
        },
        {
          title: '9. UYUŞMAZLIK ÇÖZÜMÜ',
          content: `Bu sözleşmeden doğabilecek uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.`,
        },
      ],
    },
    venue: {
      title: 'DEKORASYON/MEKAN HİZMET SÖZLEŞMESİ',
      sections: [
        {
          title: '1. TARAFLAR',
          content: `Bu sözleşme, bir tarafta {{organizerName}} (bundan sonra "Organizatör" olarak anılacaktır) ile diğer tarafta {{providerName}} (bundan sonra "Hizmet Sağlayıcı" olarak anılacaktır) arasında aşağıdaki şartlar dahilinde akdedilmiştir.`,
        },
        {
          title: '2. SÖZLEŞMENİN KONUSU',
          content: `Bu sözleşmenin konusu, {{eventName}} etkinliği için {{serviceName}} hizmetinin şartlarını, kapsamını ve bedelini düzenlemektir.`,
        },
        {
          title: '3. HİZMET KAPSAMI',
          content: `Hizmet Sağlayıcı aşağıdaki hizmetleri sunacaktır:\n\n• Konsept tasarım ve planlama\n• Malzeme temini ve kurulum\n• Çiçek düzenleme ve bitki dekorasyonu\n• Aydınlatma dekorasyonu\n• Masa ve sandalye düzeni\n• Etkinlik sonrası söküm ve temizlik`,
        },
        {
          title: '4. ETKİNLİK BİLGİLERİ',
          content: `Etkinlik Adı: {{eventName}}\nEtkinlik Tarihi: {{eventDate}}\nEtkinlik Yeri: {{eventLocation}}\nKurulum: {{setupTime}}\nKatılımcı Sayısı: {{guestCount}}`,
        },
        {
          title: '5. TASARIM ONAYI',
          content: `Hizmet Sağlayıcı, etkinlikten en az 15 gün önce detaylı tasarım sunumu yapacaktır. Organizatör, 3 iş günü içinde onay veya revizyon talebinde bulunacaktır. 2 revizyona kadar ücretsizdir.`,
        },
        {
          title: '6. ÖDEME ŞARTLARI',
          content: `Toplam Hizmet Bedeli: {{totalAmount}}\n\nÖdeme Planı:\n• %40 Peşinat: Sözleşme imzalandıktan sonra 3 iş günü içinde\n• %40 Malzeme: Malzeme siparişi öncesi\n• %20 Bakiye: Etkinlik sonrası`,
        },
        {
          title: '7. İPTAL ŞARTLARI',
          content: `• 30+ gün önce iptal: Yalnızca peşinat\n• 15-30 gün önce: %50 ödeme\n• 15 gün içinde: %75 ödeme\n• 7 gün içinde: Tam ödeme`,
        },
        {
          title: '8. GARANTİ',
          content: `Hizmet Sağlayıcı, tüm dekorasyon malzemelerinin etkinlik süresince sorunsuz kalacağını garanti eder. Herhangi bir hasar veya eksiklik durumunda anında müdahale edilecektir.`,
        },
        {
          title: '9. UYUŞMAZLIK ÇÖZÜMÜ',
          content: `Bu sözleşmeden doğabilecek uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.`,
        },
      ],
    },
    transport: {
      title: 'ULAŞIM/TRANSFER HİZMET SÖZLEŞMESİ',
      sections: [
        {
          title: '1. TARAFLAR',
          content: `Bu sözleşme, bir tarafta {{organizerName}} (bundan sonra "Organizatör" olarak anılacaktır) ile diğer tarafta {{providerName}} (bundan sonra "Hizmet Sağlayıcı" olarak anılacaktır) arasında aşağıdaki şartlar dahilinde akdedilmiştir.`,
        },
        {
          title: '2. SÖZLEŞMENİN KONUSU',
          content: `Bu sözleşmenin konusu, {{eventName}} etkinliği için {{serviceName}} hizmetinin şartlarını, kapsamını ve bedelini düzenlemektir.`,
        },
        {
          title: '3. HİZMET KAPSAMI',
          content: `Hizmet Sağlayıcı aşağıdaki hizmetleri sunacaktır:\n\n• VIP araç tahsisi\n• Profesyonel şoför hizmeti\n• Havalimanı/otel transferleri\n• Etkinlik süresince araç bekleme\n• 7/24 iletişim desteği`,
        },
        {
          title: '4. ARAÇ BİLGİLERİ',
          content: `Araç Tipi: {{vehicleType}}\nAraç Sayısı: {{vehicleCount}}\nKapasite: {{vehicleCapacity}}\nÖzel Donanım: {{specialFeatures}}`,
        },
        {
          title: '5. TRANSFER DETAYLARI',
          content: `Etkinlik: {{eventName}}\nTarih: {{eventDate}}\nAlış Noktası: {{pickupLocation}}\nBırakış Noktası: {{dropoffLocation}}\nTransfer Sayısı: {{transferCount}}`,
        },
        {
          title: '6. ÖDEME ŞARTLARI',
          content: `Toplam Hizmet Bedeli: {{totalAmount}}\n\nÖdeme: Hizmet tamamlandıktan sonra 3 iş günü içinde\n\nEkstra Ücretler:\n• Bekleme (ilk 30 dk ücretsiz): 500 TL/saat\n• Ekstra km: 25 TL/km`,
        },
        {
          title: '7. İPTAL ŞARTLARI',
          content: `• 48 saat önce iptal: Ücretsiz\n• 24-48 saat önce: %25 ücret\n• 24 saat içinde: %50 ücret\n• No-show: Tam ücret`,
        },
        {
          title: '8. SORUMLULUK',
          content: `Hizmet Sağlayıcı, tüm araçların sigortalı olduğunu ve şoförlerin gerekli belgelere sahip olduğunu taahhüt eder. Kaza veya arıza durumunda alternatif araç temin edilecektir.`,
        },
        {
          title: '9. UYUŞMAZLIK ÇÖZÜMÜ',
          content: `Bu sözleşmeden doğabilecek uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.`,
        },
      ],
    },
  };

  return templates[category] || templates.technical;
};

// Mock contract data
const mockContract = {
  id: 'c1',
  offerId: 'o4',
  status: 'pending_provider' as ContractStatus,
  category: 'transport',
  createdAt: '2024-01-15',
  updatedAt: '2024-01-16',

  // Event details
  eventName: 'Kurumsal Gala',
  eventDate: '22 Ağustos 2024',
  eventLocation: 'Four Seasons Hotel, İstanbul',

  // Parties
  organizer: {
    name: 'XYZ Holding A.Ş.',
    representative: 'Ahmet Yılmaz',
    title: 'Etkinlik Direktörü',
    email: 'ahmet.yilmaz@xyzholding.com',
    phone: '+90 532 123 4567',
    address: 'Maslak, İstanbul',
    taxId: '1234567890',
  },
  provider: {
    name: 'Elite VIP Transfer',
    representative: 'Mehmet Demir',
    title: 'Genel Müdür',
    email: 'info@elitetransfer.com',
    phone: '+90 533 987 6543',
    address: 'Şişli, İstanbul',
    taxId: '0987654321',
  },

  // Service details
  serviceName: 'VIP Transfer Hizmeti',
  serviceDescription: 'VIP misafirler için lüks araç transferi',

  // Financial
  amount: 12500,
  currency: 'TRY',
  paymentTerms: 'Hizmet sonrası 3 iş günü içinde',

  // Signatures
  organizerSignature: {
    signed: true,
    signedAt: '2024-01-16 14:30',
    signatureData: 'base64_signature_data_here',
  },
  providerSignature: {
    signed: false,
    signedAt: null as string | null,
    signatureData: null as string | null,
  },
};

export function ContractScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params || {}) as ContractParams;

  const [contract, setContract] = useState(mockContract);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signaturePoints, setSignaturePoints] = useState<{ x: number; y: number }[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const contractTemplate = getContractTemplate(contract.category);

  // Replace template placeholders with actual data
  const fillTemplate = (content: string) => {
    return content
      .replace(/\{\{organizerName\}\}/g, contract.organizer.name)
      .replace(/\{\{providerName\}\}/g, contract.provider.name)
      .replace(/\{\{eventName\}\}/g, contract.eventName)
      .replace(/\{\{eventDate\}\}/g, contract.eventDate)
      .replace(/\{\{eventLocation\}\}/g, contract.eventLocation)
      .replace(/\{\{serviceName\}\}/g, contract.serviceName)
      .replace(/\{\{totalAmount\}\}/g, `₺${contract.amount.toLocaleString('tr-TR')}`)
      .replace(/\{\{setupTime\}\}/g, '24 saat')
      .replace(/\{\{teardownTime\}\}/g, '12 saat');
  };

  const getStatusInfo = () => {
    switch (contract.status) {
      case 'draft':
        return { label: 'Taslak', color: colors.zinc[500], icon: 'document-outline' as const };
      case 'pending_organizer':
        return { label: 'Organizatör İmzası Bekleniyor', color: colors.warning, icon: 'hourglass-outline' as const };
      case 'pending_provider':
        return { label: 'Sağlayıcı İmzası Bekleniyor', color: colors.warning, icon: 'hourglass-outline' as const };
      case 'signed':
        return { label: 'İmzalandı', color: colors.success, icon: 'checkmark-circle' as const };
      case 'completed':
        return { label: 'Tamamlandı', color: colors.success, icon: 'checkmark-done-circle' as const };
      case 'cancelled':
        return { label: 'İptal Edildi', color: colors.error, icon: 'close-circle' as const };
      default:
        return { label: 'Bilinmiyor', color: colors.zinc[500], icon: 'help-circle' as const };
    }
  };

  const handleSign = useCallback(() => {
    setShowSignatureModal(true);
  }, []);

  const handleSignatureComplete = useCallback(() => {
    // In a real app, this would save the signature
    setContract(prev => ({
      ...prev,
      status: 'signed' as ContractStatus,
      providerSignature: {
        signed: true,
        signedAt: new Date().toISOString(),
        signatureData: 'signature_data',
      },
    }));
    setShowSignatureModal(false);
    Alert.alert(
      'Sözleşme İmzalandı',
      'Sözleşmeniz başarıyla imzalandı. Her iki taraf da imzaladığında sözleşme aktif hale gelecektir.',
      [{ text: 'Tamam' }]
    );
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    setIsDownloading(true);
    // Simulate PDF generation
    setTimeout(() => {
      setIsDownloading(false);
      Alert.alert(
        'PDF İndirildi',
        'Sözleşme PDF olarak indirildi ve Dosyalar uygulamasına kaydedildi.',
        [{ text: 'Tamam' }]
      );
    }, 2000);
  }, []);

  const handleShare = useCallback(() => {
    Alert.alert('Paylaş', 'Sözleşme paylaşım seçenekleri', [
      { text: 'E-posta ile Gönder', onPress: () => {} },
      { text: 'WhatsApp', onPress: () => {} },
      { text: 'İptal', style: 'cancel' },
    ]);
  }, []);

  const statusInfo = getStatusInfo();
  const canSign = contract.status === 'pending_provider' && !contract.providerSignature.signed;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleSection}>
          <Text style={styles.headerTitle}>Sözleşme</Text>
          <Text style={styles.headerSubtitle}>#{contract.id.toUpperCase()}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={colors.zinc[400]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleDownloadPDF}
            disabled={isDownloading}
          >
            <Ionicons
              name={isDownloading ? 'hourglass-outline' : 'download-outline'}
              size={20}
              color={colors.zinc[400]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: `${statusInfo.color}15` }]}>
        <Ionicons name={statusInfo.icon} size={18} color={statusInfo.color} />
        <Text style={[styles.statusBannerText, { color: statusInfo.color }]}>
          {statusInfo.label}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Contract Header */}
        <View style={styles.contractHeader}>
          <LinearGradient
            colors={['rgba(147, 51, 234, 0.1)', 'rgba(99, 102, 241, 0.05)']}
            style={styles.contractHeaderGradient}
          >
            <Ionicons name="document-text" size={32} color={colors.brand[400]} />
            <Text style={styles.contractTitle}>{contractTemplate.title}</Text>
            <Text style={styles.contractNumber}>Sözleşme No: {contract.id.toUpperCase()}</Text>
            <Text style={styles.contractDate}>Düzenlenme Tarihi: {contract.createdAt}</Text>
          </LinearGradient>
        </View>

        {/* Parties Section */}
        <View style={styles.partiesSection}>
          <View style={styles.partyCard}>
            <View style={styles.partyHeader}>
              <View style={[styles.partyIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="business" size={18} color={colors.info} />
              </View>
              <Text style={styles.partyLabel}>ORGANİZATÖR</Text>
            </View>
            <Text style={styles.partyName}>{contract.organizer.name}</Text>
            <Text style={styles.partyRep}>{contract.organizer.representative} - {contract.organizer.title}</Text>
            <View style={styles.partyContact}>
              <View style={styles.partyContactItem}>
                <Ionicons name="mail-outline" size={12} color={colors.zinc[500]} />
                <Text style={styles.partyContactText}>{contract.organizer.email}</Text>
              </View>
              <View style={styles.partyContactItem}>
                <Ionicons name="call-outline" size={12} color={colors.zinc[500]} />
                <Text style={styles.partyContactText}>{contract.organizer.phone}</Text>
              </View>
            </View>
            {contract.organizerSignature.signed && (
              <View style={styles.signatureStatus}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.signatureStatusText}>İmzalandı - {contract.organizerSignature.signedAt}</Text>
              </View>
            )}
          </View>

          <View style={styles.partyDivider}>
            <View style={styles.partyDividerLine} />
            <Ionicons name="swap-horizontal" size={20} color={colors.zinc[600]} />
            <View style={styles.partyDividerLine} />
          </View>

          <View style={styles.partyCard}>
            <View style={styles.partyHeader}>
              <View style={[styles.partyIcon, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <Ionicons name="briefcase" size={18} color={colors.brand[400]} />
              </View>
              <Text style={styles.partyLabel}>HİZMET SAĞLAYICI</Text>
            </View>
            <Text style={styles.partyName}>{contract.provider.name}</Text>
            <Text style={styles.partyRep}>{contract.provider.representative} - {contract.provider.title}</Text>
            <View style={styles.partyContact}>
              <View style={styles.partyContactItem}>
                <Ionicons name="mail-outline" size={12} color={colors.zinc[500]} />
                <Text style={styles.partyContactText}>{contract.provider.email}</Text>
              </View>
              <View style={styles.partyContactItem}>
                <Ionicons name="call-outline" size={12} color={colors.zinc[500]} />
                <Text style={styles.partyContactText}>{contract.provider.phone}</Text>
              </View>
            </View>
            {contract.providerSignature.signed ? (
              <View style={styles.signatureStatus}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.signatureStatusText}>İmzalandı - {contract.providerSignature.signedAt}</Text>
              </View>
            ) : (
              <View style={[styles.signatureStatus, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="time-outline" size={14} color={colors.warning} />
                <Text style={[styles.signatureStatusText, { color: colors.warning }]}>İmza Bekleniyor</Text>
              </View>
            )}
          </View>
        </View>

        {/* Service Summary */}
        <View style={styles.serviceSummary}>
          <View style={styles.serviceSummaryHeader}>
            <Ionicons name="receipt-outline" size={18} color={colors.brand[400]} />
            <Text style={styles.serviceSummaryTitle}>Hizmet Özeti</Text>
          </View>
          <View style={styles.serviceSummaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Etkinlik</Text>
              <Text style={styles.summaryValue}>{contract.eventName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tarih</Text>
              <Text style={styles.summaryValue}>{contract.eventDate}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Konum</Text>
              <Text style={styles.summaryValue}>{contract.eventLocation}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Hizmet</Text>
              <Text style={styles.summaryValue}>{contract.serviceName}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowTotal]}>
              <Text style={styles.summaryLabelTotal}>Toplam Tutar</Text>
              <Text style={styles.summaryValueTotal}>₺{contract.amount.toLocaleString('tr-TR')}</Text>
            </View>
          </View>
        </View>

        {/* Contract Sections */}
        <View style={styles.contractSections}>
          <Text style={styles.sectionsTitle}>Sözleşme Maddeleri</Text>
          {contractTemplate.sections.map((section, index) => (
            <View key={index} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionContent}>{fillTemplate(section.content)}</Text>
            </View>
          ))}
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureSectionTitle}>İmza Bölümü</Text>

          <View style={styles.signatureBoxes}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureBoxLabel}>Organizatör İmzası</Text>
              <View style={[
                styles.signatureArea,
                contract.organizerSignature.signed && styles.signatureAreaSigned
              ]}>
                {contract.organizerSignature.signed ? (
                  <>
                    <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                    <Text style={styles.signedText}>İmzalandı</Text>
                    <Text style={styles.signedDate}>{contract.organizerSignature.signedAt}</Text>
                  </>
                ) : (
                  <Text style={styles.pendingSignature}>İmza Bekleniyor</Text>
                )}
              </View>
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureBoxLabel}>Hizmet Sağlayıcı İmzası</Text>
              <View style={[
                styles.signatureArea,
                contract.providerSignature.signed && styles.signatureAreaSigned
              ]}>
                {contract.providerSignature.signed ? (
                  <>
                    <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                    <Text style={styles.signedText}>İmzalandı</Text>
                    <Text style={styles.signedDate}>{contract.providerSignature.signedAt}</Text>
                  </>
                ) : canSign ? (
                  <TouchableOpacity style={styles.signButton} onPress={handleSign}>
                    <Ionicons name="finger-print" size={24} color={colors.brand[400]} />
                    <Text style={styles.signButtonText}>İmzala</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.pendingSignature}>İmza Bekleniyor</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Button */}
      {canSign && (
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.signContractButton} onPress={handleSign}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.signContractGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="finger-print" size={22} color="white" />
              <Text style={styles.signContractText}>Sözleşmeyi İmzala</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Signature Modal */}
      <Modal
        visible={showSignatureModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSignatureModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.signatureModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mobil İmza</Text>
              <TouchableOpacity onPress={() => setShowSignatureModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Sözleşmeyi onaylamak için aşağıdaki alana imzanızı atın
            </Text>

            {/* Signature Pad */}
            <View style={styles.signaturePad}>
              <View style={styles.signaturePadInner}>
                <Text style={styles.signaturePadPlaceholder}>İmzanızı buraya atın</Text>
              </View>
              <TouchableOpacity
                style={styles.clearSignatureButton}
                onPress={() => setSignaturePoints([])}
              >
                <Ionicons name="trash-outline" size={18} color={colors.zinc[400]} />
                <Text style={styles.clearSignatureText}>Temizle</Text>
              </TouchableOpacity>
            </View>

            {/* Agreement Text */}
            <View style={styles.agreementSection}>
              <Ionicons name="shield-checkmark" size={20} color={colors.success} />
              <Text style={styles.agreementText}>
                İmzalayarak, yukarıdaki sözleşme şartlarını okuduğumu, anladığımı ve kabul ettiğimi onaylıyorum.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowSignatureModal(false)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleSignatureComplete}
              >
                <LinearGradient
                  colors={gradients.primary}
                  style={styles.modalConfirmGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark" size={20} color="white" />
                  <Text style={styles.modalConfirmText}>Onayla ve İmzala</Text>
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
  headerTitleSection: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.zinc[500],
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
  },
  statusBannerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contractHeader: {
    margin: 16,
  },
  contractHeaderGradient: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  contractTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  contractNumber: {
    fontSize: 12,
    color: colors.zinc[400],
    marginTop: 8,
  },
  contractDate: {
    fontSize: 11,
    color: colors.zinc[500],
    marginTop: 4,
  },
  partiesSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  partyCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  partyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  partyIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.zinc[500],
    letterSpacing: 0.5,
  },
  partyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  partyRep: {
    fontSize: 12,
    color: colors.zinc[400],
    marginBottom: 10,
  },
  partyContact: {
    gap: 6,
  },
  partyContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partyContactText: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  signatureStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
  },
  signatureStatusText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '500',
  },
  partyDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  partyDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 16,
  },
  serviceSummary: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
  },
  serviceSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  serviceSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  serviceSummaryContent: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  summaryRowTotal: {
    borderBottomWidth: 0,
    paddingTop: 12,
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.zinc[500],
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  summaryLabelTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
  },
  contractSections: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sectionCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand[400],
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 12,
    color: colors.zinc[400],
    lineHeight: 20,
  },
  signatureSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  signatureSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  signatureBoxes: {
    flexDirection: 'row',
    gap: 12,
  },
  signatureBox: {
    flex: 1,
  },
  signatureBoxLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.zinc[500],
    marginBottom: 8,
    textAlign: 'center',
  },
  signatureArea: {
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureAreaSigned: {
    borderStyle: 'solid',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  signedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
    marginTop: 6,
  },
  signedDate: {
    fontSize: 10,
    color: colors.zinc[500],
    marginTop: 2,
  },
  pendingSignature: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  signButton: {
    alignItems: 'center',
    gap: 6,
  },
  signButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand[400],
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  signContractButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  signContractGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  signContractText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  signatureModal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.zinc[500],
    marginBottom: 20,
  },
  signaturePad: {
    marginBottom: 20,
  },
  signaturePadInner: {
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(147, 51, 234, 0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signaturePadPlaceholder: {
    fontSize: 14,
    color: colors.zinc[600],
  },
  clearSignatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  clearSignatureText: {
    fontSize: 12,
    color: colors.zinc[400],
  },
  agreementSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
    marginBottom: 20,
  },
  agreementText: {
    flex: 1,
    fontSize: 12,
    color: colors.zinc[400],
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.zinc[400],
  },
  modalConfirmButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalConfirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
});
