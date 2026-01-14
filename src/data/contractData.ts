// Types
export type ContractStatus = 'draft' | 'pending_organizer' | 'pending_provider' | 'signed' | 'completed' | 'cancelled';

export interface ContractParams {
  contractId?: string;
  offerId?: string;
}

export interface ContractParty {
  name: string;
  representative: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
}

export interface ContractSignature {
  signed: boolean;
  signedAt: string | null;
  signatureData: string | null;
}

export interface Contract {
  id: string;
  offerId: string;
  status: ContractStatus;
  category: string;
  createdAt: string;
  updatedAt: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  organizer: ContractParty;
  provider: ContractParty;
  serviceName: string;
  serviceDescription: string;
  amount: number;
  currency: string;
  paymentTerms: string;
  organizerSignature: ContractSignature;
  providerSignature: ContractSignature;
}

export interface ContractTemplate {
  title: string;
  sections: { title: string; content: string }[];
}

// Contract templates based on service category
export const getContractTemplate = (category: string): ContractTemplate => {
  const templates: Record<string, ContractTemplate> = {
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
export const mockContract: Contract = {
  id: 'c1',
  offerId: 'o4',
  status: 'pending_provider',
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
    signedAt: null,
    signatureData: null,
  },
};

// Fill template placeholders with actual data
export const fillTemplate = (content: string, contract: Contract) => {
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

// Get status info
export const getContractStatusInfo = (status: ContractStatus, colors: any) => {
  switch (status) {
    case 'draft':
      return { label: 'Taslak', color: colors.textMuted, icon: 'document-outline' as const };
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
      return { label: 'Bilinmiyor', color: colors.textMuted, icon: 'help-circle' as const };
  }
};
