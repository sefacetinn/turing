import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

// Default colors for static styles
const colors = defaultColors;

const { width } = Dimensions.get('window');

interface Artist {
  id: string;
  name: string;
  genre: string;
  image: string;
  priceRange: string;
  rating: number;
  description: string;
}

interface ProviderDetail {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  image: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  location: string;
  verified: boolean;
  priceRange: string;
  description: string;
  aboutLong: string;
  completedEvents: number;
  responseTime: string;
  yearsExperience: number;
  teamSize: string;
  phone: string;
  email: string;
  website: string;
  specialties: string[];
  services: string[];
  portfolio: string[];
  highlights: { icon: string; label: string; value: string }[];
  artists?: Artist[];
  reviews: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    date: string;
    text: string;
    eventType: string;
  }[];
}

// Detailed providers data
const providersDetail: Record<string, ProviderDetail> = {
  'b1': {
    id: 'b1',
    name: 'Atlantis Yapım',
    category: 'booking',
    subcategory: 'Sanatçı Yönetimi & Booking',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    rating: 4.9,
    reviewCount: 342,
    location: 'İstanbul, Türkiye',
    verified: true,
    priceRange: '₺50K - ₺500K',
    description: 'Türkiye\'nin önde gelen sanatçı yönetim ve booking ajansı',
    aboutLong: 'Atlantis Yapım, 2002 yılından bu yana Türkiye\'nin en prestijli sanatçı yönetim ve booking ajanslarından biridir. Rock, pop ve alternatif müzik alanında birçok ödüllü sanatçıyı temsil etmekteyiz. Konser, festival ve kurumsal etkinlikler için profesyonel booking hizmeti sunuyoruz.',
    completedEvents: 850,
    responseTime: '1 saat',
    yearsExperience: 22,
    teamSize: '15+ Sanatçı',
    phone: '+905321234567',
    email: 'booking@atlantisyapim.com',
    website: 'www.atlantisyapim.com',
    specialties: ['Rock', 'Pop', 'Alternatif', 'Festival', 'Kurumsal'],
    services: ['Sanatçı Booking', 'Konser Organizasyonu', 'Festival Koordinasyonu', 'Kurumsal Etkinlik', 'Özel Gece'],
    portfolio: [
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    ],
    highlights: [
      { icon: 'people', label: 'Sanatçı', value: '15+ Sanatçı' },
      { icon: 'calendar', label: 'Etkinlik', value: '850+ Etkinlik' },
      { icon: 'trophy', label: 'Deneyim', value: '22 Yıl' },
    ],
    artists: [
      { id: 'a1', name: 'Athena', genre: 'Ska / Rock', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', priceRange: '₺150K - ₺300K', rating: 4.9, description: 'Türkiye\'nin efsane ska-rock grubu' },
      { id: 'a2', name: 'Melike Şahin', genre: 'Alternatif Pop', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', priceRange: '₺80K - ₺180K', rating: 4.8, description: 'Alternatif pop müziğin yükselen yıldızı' },
      { id: 'a3', name: 'Pinhani', genre: 'Pop Rock', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400', priceRange: '₺100K - ₺220K', rating: 4.7, description: 'Türkçe pop rock\'un sevilen ismi' },
      { id: 'a4', name: 'Yüzyüzeyken Konuşuruz', genre: 'İndie Pop', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', priceRange: '₺120K - ₺250K', rating: 4.8, description: 'Yeni nesil indie müziğin temsilcisi' },
      { id: 'a5', name: 'Can Bonomo', genre: 'Pop', image: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=400', priceRange: '₺90K - ₺200K', rating: 4.6, description: 'Eurovision temsilcisi pop sanatçısı' },
    ],
    reviews: [
      { id: 'r1', name: 'Festival Org. A.Ş.', avatar: 'FO', rating: 5, date: '2 hafta önce', text: 'Athena ile festivalde çalıştık. Atlantis Yapım\'ın profesyonelliği ve hızlı dönüşleri harikaydı.', eventType: 'Festival' },
      { id: 'r2', name: 'Kurumsal Events', avatar: 'KE', rating: 5, date: '1 ay önce', text: 'Melike Şahin\'i kurumsal etkinliğimizde ağırladık. Her şey mükemmel koordine edildi.', eventType: 'Kurumsal' },
    ],
  },
  'b2': {
    id: 'b2',
    name: 'Poll Production',
    category: 'booking',
    subcategory: 'Sanatçı Yönetimi & Booking',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    rating: 4.8,
    reviewCount: 287,
    location: 'İstanbul, Türkiye',
    verified: true,
    priceRange: '₺100K - ₺1M',
    description: 'Uluslararası sanatçı booking ve prodüksiyon',
    aboutLong: 'Poll Production, Türkiye\'nin en büyük sanatçı yönetim şirketlerinden biridir. 1996 yılından bu yana pop müziğinin en büyük isimlerini temsil etmekte ve uluslararası standartlarda prodüksiyon hizmetleri sunmaktadır.',
    completedEvents: 1200,
    responseTime: '2 saat',
    yearsExperience: 28,
    teamSize: '20+ Sanatçı',
    phone: '+905321234568',
    email: 'booking@pollproduction.com',
    website: 'www.pollproduction.com',
    specialties: ['Pop', 'Türk Pop', 'Gala', 'Kurumsal', 'Düğün'],
    services: ['Sanatçı Booking', 'Konser Prodüksiyon', 'TV Programları', 'Reklam Projeleri', 'Marka İşbirlikleri'],
    portfolio: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400',
    ],
    highlights: [
      { icon: 'star', label: 'A-List', value: 'Türkiye\'nin #1' },
      { icon: 'globe', label: 'Global', value: 'Uluslararası' },
      { icon: 'trophy', label: 'Ödül', value: '50+ Ödül' },
    ],
    artists: [
      { id: 'a1', name: 'Tarkan', genre: 'Pop', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', priceRange: '₺500K - ₺1M', rating: 5.0, description: 'Megastar - Türk pop müziğinin dünya çapında tanınan yüzü' },
      { id: 'a2', name: 'Sıla', genre: 'Pop / R&B', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', priceRange: '₺300K - ₺600K', rating: 4.9, description: 'Güçlü vokali ile pop müziğin divası' },
      { id: 'a3', name: 'Murat Boz', genre: 'Pop', image: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=400', priceRange: '₺250K - ₺500K', rating: 4.8, description: 'Pop müziğin enerjik yıldızı' },
      { id: 'a4', name: 'Hadise', genre: 'Pop / Dance', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', priceRange: '₺350K - ₺700K', rating: 4.9, description: 'Eurovision ikincisi, dans pop kraliçesi' },
    ],
    reviews: [
      { id: 'r1', name: 'Grand Events', avatar: 'GE', rating: 5, date: '1 hafta önce', text: 'Tarkan konseri için Poll Production ile çalıştık. Kusursuz bir organizasyon oldu.', eventType: 'Konser' },
      { id: 'r2', name: 'Luxury Weddings', avatar: 'LW', rating: 5, date: '3 hafta önce', text: 'Sıla\'yı düğünümüzde ağırladık. Profesyonel ekip, harika performans.', eventType: 'Düğün' },
    ],
  },
  'b3': {
    id: 'b3',
    name: 'BKM Organizasyon',
    category: 'booking',
    subcategory: 'Komedi & Stand-up Booking',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400',
    coverImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800',
    rating: 4.9,
    reviewCount: 456,
    location: 'İstanbul, Türkiye',
    verified: true,
    priceRange: '₺80K - ₺800K',
    description: 'Türkiye\'nin lider komedi ve stand-up booking ajansı',
    aboutLong: 'BKM (Beşiktaş Kültür Merkezi), 1989 yılından bu yana Türk komedi ve tiyatro sahnesinin en önemli yapım şirketidir. Cem Yılmaz, Ata Demirer gibi efsanevi isimleri bünyesinde barındıran BKM, stand-up, tiyatro ve sinema prodüksiyonlarında öncü konumdadır.',
    completedEvents: 2500,
    responseTime: '3 saat',
    yearsExperience: 35,
    teamSize: '30+ Sanatçı',
    phone: '+905321234569',
    email: 'booking@bkm.com.tr',
    website: 'www.bkmkitap.com',
    specialties: ['Stand-up', 'Komedi', 'Tiyatro', 'Sinema', 'Kurumsal'],
    services: ['Stand-up Show Booking', 'Tiyatro Prodüksiyon', 'Kurumsal Eğlence', 'Özel Gösterimler', 'Festival Koordinasyonu'],
    portfolio: [
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400',
      'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400',
    ],
    highlights: [
      { icon: 'happy', label: 'Komedi', value: '#1 Türkiye' },
      { icon: 'film', label: 'Sinema', value: '30+ Film' },
      { icon: 'people', label: 'Seyirci', value: '10M+' },
    ],
    artists: [
      { id: 'a1', name: 'Cem Yılmaz', genre: 'Stand-up', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400', priceRange: '₺400K - ₺800K', rating: 5.0, description: 'Türkiye\'nin en başarılı komedyeni' },
      { id: 'a2', name: 'Ata Demirer', genre: 'Komedi', image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400', priceRange: '₺200K - ₺450K', rating: 4.9, description: 'Sevilen komedyen ve oyuncu' },
      { id: 'a3', name: 'Yılmaz Erdoğan', genre: 'Tiyatro / Sinema', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', priceRange: '₺300K - ₺600K', rating: 4.9, description: 'Usta oyuncu, yönetmen ve senarist' },
      { id: 'a4', name: 'Demet Akbağ', genre: 'Komedi', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', priceRange: '₺150K - ₺350K', rating: 4.8, description: 'Türk komedisinin vazgeçilmez ismi' },
    ],
    reviews: [
      { id: 'r1', name: 'Corporate Fun', avatar: 'CF', rating: 5, date: '5 gün önce', text: 'Cem Yılmaz show\'u kurumsal etkinliğimizin yıldızı oldu. BKM ekibi çok profesyonel.', eventType: 'Kurumsal' },
    ],
  },
  'b4': {
    id: 'b4',
    name: 'Pozitif Live',
    category: 'booking',
    subcategory: 'Rock & Alternatif Booking',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400',
    coverImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    rating: 4.7,
    reviewCount: 198,
    location: 'İstanbul, Türkiye',
    verified: true,
    priceRange: '₺60K - ₺400K',
    description: 'Alternatif ve indie müzik odaklı booking ajansı',
    aboutLong: 'Pozitif Live, 2006 yılından bu yana Türkiye\'nin alternatif müzik sahnesinin nabzını tutuyor. Rock, indie ve alternatif müzik alanında öncü sanatçıları temsil eden ajansımız, festival ve konser organizasyonlarında uzmanlaşmıştır.',
    completedEvents: 620,
    responseTime: '1 saat',
    yearsExperience: 18,
    teamSize: '12+ Sanatçı',
    phone: '+905321234570',
    email: 'info@pozitiflive.com',
    website: 'www.pozitiflive.com',
    specialties: ['Rock', 'Alternatif', 'Indie', 'Festival', 'Club'],
    services: ['Band Booking', 'Festival Koordinasyonu', 'Turne Yönetimi', 'Konser Prodüksiyon', 'Club Night'],
    portfolio: [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    ],
    highlights: [
      { icon: 'musical-notes', label: 'Genre', value: 'Rock & Indie' },
      { icon: 'flame', label: 'Festival', value: '50+ Festival' },
      { icon: 'heart', label: 'Hayran', value: 'Kült Takipçi' },
    ],
    artists: [
      { id: 'a1', name: 'Duman', genre: 'Rock', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', priceRange: '₺200K - ₺400K', rating: 4.9, description: 'Türk rock müziğinin efsanesi' },
      { id: 'a2', name: 'Model', genre: 'Rock', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400', priceRange: '₺120K - ₺250K', rating: 4.7, description: 'Alternatif rock\'un güçlü sesi' },
      { id: 'a3', name: 'Manga', genre: 'Alternative Rock', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400', priceRange: '₺150K - ₺300K', rating: 4.8, description: 'Eurovision ikincisi, alternative rock grubu' },
      { id: 'a4', name: 'maNga', genre: 'Nu Metal', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', priceRange: '₺100K - ₺220K', rating: 4.6, description: 'Türkiye\'nin nu metal öncüsü' },
    ],
    reviews: [
      { id: 'r1', name: 'Rock Fest TR', avatar: 'RF', rating: 5, date: '1 hafta önce', text: 'Duman\'ı festivalimize Pozitif Live ile aldık. Her şey sorunsuz ilerledi.', eventType: 'Festival' },
    ],
  },
  'b5': {
    id: 'b5',
    name: 'DMC Turkey',
    category: 'booking',
    subcategory: 'DJ & Elektronik Müzik',
    image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400',
    coverImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
    rating: 4.8,
    reviewCount: 167,
    location: 'İstanbul, Türkiye',
    verified: true,
    priceRange: '₺30K - ₺300K',
    description: 'Uluslararası DJ ve elektronik müzik booking',
    aboutLong: 'DMC Turkey, elektronik müzik ve DJ booking alanında Türkiye\'nin lider ajansıdır. Yerli ve yabancı DJ\'leri temsil eden ajansımız, club night\'lardan festivallere kadar geniş bir yelpazede hizmet vermektedir.',
    completedEvents: 480,
    responseTime: '30 dk',
    yearsExperience: 15,
    teamSize: '25+ DJ',
    phone: '+905321234571',
    email: 'booking@dmcturkey.com',
    website: 'www.dmcturkey.com',
    specialties: ['EDM', 'House', 'Techno', 'Club', 'Festival'],
    services: ['DJ Booking', 'Club Night', 'Festival Set', 'Private Party', 'Corporate Event'],
    portfolio: [
      'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400',
      'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400',
    ],
    highlights: [
      { icon: 'disc', label: 'DJ', value: '25+ DJ' },
      { icon: 'musical-note', label: 'Genre', value: 'EDM / House' },
      { icon: 'globe', label: 'Network', value: 'Global' },
    ],
    artists: [
      { id: 'a1', name: 'DJ Burak Yeter', genre: 'EDM', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400', priceRange: '₺80K - ₺200K', rating: 4.8, description: 'Tuesday hit\'i ile dünya çapında tanınan DJ' },
      { id: 'a2', name: 'Mahmut Orhan', genre: 'Deep House', image: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400', priceRange: '₺60K - ₺150K', rating: 4.7, description: 'Deep house\'un Türk temsilcisi' },
      { id: 'a3', name: 'Ilkay Sencan', genre: 'House', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400', priceRange: '₺50K - ₺120K', rating: 4.6, description: 'Viral hit\'lerin prodüktörü' },
    ],
    reviews: [
      { id: 'r1', name: 'Club Istanbul', avatar: 'CI', rating: 5, date: '3 gün önce', text: 'DJ Burak Yeter performansı muhteşemdi. DMC Turkey ile çalışmak çok kolay.', eventType: 'Club' },
    ],
  },
  't1': {
    id: 't1',
    name: 'Pro Sound Istanbul',
    category: 'technical',
    subcategory: 'Ses Sistemleri',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
    rating: 4.9,
    reviewCount: 128,
    location: 'İstanbul, Türkiye',
    verified: true,
    priceRange: '₺50K - ₺150K',
    description: 'Profesyonel ses sistemleri ve akustik çözümler',
    aboutLong: 'Pro Sound Istanbul, 2006 yılından bu yana Türkiye\'nin önde gelen ses sistemi sağlayıcısıdır. D&B Audiotechnik, L-Acoustics ve JBL gibi dünya markalarının yetkili distribütörü olarak, konser, festival ve kurumsal etkinlikler için en kaliteli ses sistemlerini sunmaktayız.',
    completedEvents: 450,
    responseTime: '1 saat',
    yearsExperience: 18,
    teamSize: '12 kişilik teknik ekip',
    phone: '+905331234567',
    email: 'info@prosound.com.tr',
    website: 'www.prosound.com.tr',
    specialties: ['Line Array', 'Festival', 'Kurumsal', 'Arena', 'Açık Hava'],
    services: ['Ses Sistemi Kiralama', 'Teknik Kurulum', 'FOH/Monitor Mühendisliği', 'Akustik Danışmanlık', 'Backline'],
    portfolio: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
      'https://images.unsplash.com/photo-1504501650895-2441b7915699?w=400',
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
    ],
    highlights: [
      { icon: 'hardware-chip', label: 'Ekipman', value: 'D&B / L-Acoustics' },
      { icon: 'volume-high', label: 'Kapasite', value: '100K+ Kişi' },
      { icon: 'ribbon', label: 'Sertifika', value: 'ISO 9001' },
    ],
    reviews: [
      { id: 'r1', name: 'Event Masters', avatar: 'EM', rating: 5, date: '2 hafta önce', text: 'Çok profesyonel bir ekip. Etkinliğimiz için mükemmel bir ses sistemi kurdular. Kesinlikle tavsiye ederim.', eventType: 'Konser' },
      { id: 'r2', name: 'Festival Co.', avatar: 'FC', rating: 5, date: '1 ay önce', text: 'Büyük festivalde sorunsuz bir ses deneyimi sundular. Teknik destek harikaydı.', eventType: 'Festival' },
    ],
  },
  'tr1': {
    id: 'tr1',
    name: 'Elite VIP Transfer',
    category: 'transport',
    subcategory: 'VIP Ulaşım',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
    coverImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    rating: 4.8,
    reviewCount: 89,
    location: 'İstanbul, Türkiye',
    verified: true,
    priceRange: '₺5K - ₺25K',
    description: 'Premium VIP transfer ve lüks araç filosu',
    aboutLong: 'Elite VIP Transfer, 2012 yılından bu yana İstanbul\'un önde gelen VIP transfer hizmeti sağlayıcısıdır. Mercedes-Maybach, BMW 7 Series ve Mercedes V-Class araçlardan oluşan prestijli filomuzla, etkinlikleriniz için kusursuz bir ulaşım deneyimi sunuyoruz.',
    completedEvents: 890,
    responseTime: '30 dk',
    yearsExperience: 12,
    teamSize: '20 araçlık filo + 25 şoför',
    phone: '+905341234567',
    email: 'rezervasyon@elitevip.com.tr',
    website: 'www.elitevip.com.tr',
    specialties: ['VIP', 'Havalimanı', 'Kurumsal', 'Düğün', 'Protokol'],
    services: ['VIP Transfer', 'Havalimanı Karşılama', 'Şehir İçi Transfer', 'Şehirlerarası Transfer', 'Protokol Hizmeti'],
    portfolio: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400',
    ],
    highlights: [
      { icon: 'car-sport', label: 'Filo', value: '20+ Lüks Araç' },
      { icon: 'time', label: '7/24', value: 'Hizmet' },
      { icon: 'shield-checkmark', label: 'Sigorta', value: 'Tam Kapsamlı' },
    ],
    reviews: [
      { id: 'r1', name: 'Konser Org.', avatar: 'KO', rating: 5, date: '1 hafta önce', text: 'Sanatçı transferleri için mükemmel hizmet. Şoförler son derece profesyonel.', eventType: 'Konser' },
    ],
  },
  'v1': {
    id: 'v1',
    name: 'KüçükÇiftlik Park',
    category: 'venue',
    subcategory: 'Açık Hava Mekanı',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
    coverImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    rating: 4.9,
    reviewCount: 312,
    location: 'İstanbul, Maçka',
    verified: true,
    priceRange: '₺100K - ₺300K',
    description: 'İstanbul\'un ikonik açık hava konser mekanı',
    aboutLong: 'KüçükÇiftlik Park, İstanbul\'un kalbinde yer alan ve 15.000 kişi kapasiteli açık hava etkinlik mekanıdır. Eşsiz atmosferi ve merkezi konumuyla yerli ve yabancı sanatçıların vazgeçilmez tercihi olmuştur.',
    completedEvents: 180,
    responseTime: '3 saat',
    yearsExperience: 20,
    teamSize: '15.000 kişi kapasite',
    phone: '+905351234567',
    email: 'etkinlik@kucukciftlik.com',
    website: 'www.kucukciftlikpark.com',
    specialties: ['Konser', 'Festival', 'Açık Hava', 'Kurumsal', 'Lansman'],
    services: ['Mekan Kiralama', 'Teknik Altyapı', 'Backstage', 'Catering Alanı', 'VIP Bölüm'],
    portfolio: [
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400',
    ],
    highlights: [
      { icon: 'people', label: 'Kapasite', value: '15.000 Kişi' },
      { icon: 'location', label: 'Konum', value: 'Şehir Merkezi' },
      { icon: 'star', label: 'Puan', value: '4.9/5' },
    ],
    reviews: [
      { id: 'r1', name: 'Major Events', avatar: 'ME', rating: 5, date: '3 gün önce', text: 'Harika bir mekan, teknik altyapı çok iyi. Her etkinlik için tercih ediyoruz.', eventType: 'Festival' },
    ],
  },
};

// Fallback for other provider IDs
const getProviderDetail = (id: string): ProviderDetail => {
  if (providersDetail[id]) {
    return providersDetail[id];
  }
  // Return first provider as fallback
  return providersDetail['t1'];
};

export function ProviderDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { providerId } = (route.params as { providerId: string }) || { providerId: 't1' };
  const { colors, isDark, helpers } = useTheme();

  const provider = getProviderDetail(providerId);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleCall = () => {
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

  const handleMessage = () => {
    navigation.navigate('Chat', {
      providerId: provider.id,
      providerName: provider.name,
      providerImage: provider.image,
    });
  };

  const handleRequestOffer = () => {
    navigation.navigate('CategoryRequest', {
      category: provider.category,
      provider: {
        id: provider.id,
        name: provider.name,
        rating: provider.rating,
        image: provider.image,
      }
    });
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${provider.email}`);
  };

  const handleWebsite = () => {
    Linking.openURL(`https://${provider.website}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header - Floating */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)']}
            style={styles.headerButtonBg}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)']}
              style={styles.headerButtonBg}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? colors.error : 'white'}
              />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)']}
              style={styles.headerButtonBg}
            >
              <Ionicons name="share-outline" size={22} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: provider.coverImage }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)', colors.background]}
            style={styles.heroGradient}
          />
          {/* Provider Badge on Hero */}
          <View style={styles.heroBadge}>
            <Image source={{ uri: provider.image }} style={[styles.heroAvatar, { borderColor: colors.background }]} />
            {provider.verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.brand[500], borderColor: colors.background }]}>
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
            )}
          </View>
        </View>

        {/* Provider Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
          </View>
          <Text style={[styles.subcategory, { color: colors.textMuted }]}>{provider.subcategory}</Text>

          <View style={styles.quickInfo}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={[styles.ratingValue, { color: colors.text }]}>{provider.rating}</Text>
              <Text style={[styles.ratingCount, { color: colors.textSecondary }]}>({provider.reviewCount} değerlendirme)</Text>
            </View>
            <View style={styles.locationBadge}>
              <Ionicons name="location" size={14} color={colors.textMuted} />
              <Text style={[styles.locationText, { color: colors.textMuted }]}>{provider.location}</Text>
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.priceContainer}>
            <LinearGradient
              colors={['rgba(147, 51, 234, 0.15)', 'rgba(147, 51, 234, 0.05)']}
              style={styles.priceGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="pricetag" size={18} color={colors.brand[400]} />
              <Text style={[styles.priceText, { color: colors.text }]}>{provider.priceRange}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar" size={20} color={colors.brand[400]} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{provider.completedEvents}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Etkinlik</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time" size={20} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.success }]}>{provider.responseTime}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Yanıt Süresi</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-up" size={20} color={colors.brand[400]} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{provider.yearsExperience} Yıl</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Deneyim</Text>
          </View>
        </View>

        {/* Highlights */}
        <View style={styles.highlightsSection}>
          {provider.highlights.map((highlight, index) => (
            <View key={index} style={[styles.highlightItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
              <LinearGradient
                colors={['rgba(147, 51, 234, 0.2)', 'rgba(147, 51, 234, 0.05)']}
                style={styles.highlightIconBg}
              >
                <Ionicons name={highlight.icon as any} size={18} color={colors.brand[400]} />
              </LinearGradient>
              <View style={styles.highlightText}>
                <Text style={[styles.highlightValue, { color: colors.text }]}>{highlight.value}</Text>
                <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>{highlight.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hakkında</Text>
          <Text style={[styles.aboutText, { color: colors.textMuted }]}>{provider.aboutLong}</Text>
        </View>

        {/* Specialties */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Uzmanlık Alanları</Text>
          <View style={styles.tagsContainer}>
            {provider.specialties.map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={[styles.specialtyText, { color: colors.brand[400] }]}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hizmetler</Text>
          <View style={styles.servicesGrid}>
            {provider.services.map((service, index) => (
              <View key={index} style={[styles.serviceItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={[styles.serviceText, { color: colors.text }]}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Artists - Only for booking agencies */}
        {provider.artists && provider.artists.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Sanatçı Kadrosu</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.brand[400] }]}>Tümünü Gör ({provider.artists.length})</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.artistsGrid}>
              {provider.artists.map((artist) => (
                <TouchableOpacity key={artist.id} style={[styles.artistCard, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
                  <Image source={{ uri: artist.image }} style={styles.artistImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.artistGradient}
                  />
                  <View style={styles.artistInfo}>
                    <Text style={styles.artistName}>{artist.name}</Text>
                    <Text style={styles.artistGenre}>{artist.genre}</Text>
                    <View style={styles.artistMeta}>
                      <View style={styles.artistRating}>
                        <Ionicons name="star" size={10} color="#fbbf24" />
                        <Text style={styles.artistRatingText}>{artist.rating}</Text>
                      </View>
                      <Text style={[styles.artistPrice, { color: colors.brand[300] }]}>{artist.priceRange}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Portfolio */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Portfolyo</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: colors.brand[400] }]}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioScroll}>
            {provider.portfolio.map((image, index) => (
              <TouchableOpacity key={index} style={styles.portfolioItem}>
                <Image source={{ uri: image }} style={styles.portfolioImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İletişim</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity style={[styles.contactItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }, ...(isDark ? [] : [helpers.getShadow('sm')])]} onPress={handleCall}>
              <View style={[styles.contactIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="call" size={18} color={colors.success} />
              </View>
              <View style={styles.contactText}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Telefon</Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>{provider.phone}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }, ...(isDark ? [] : [helpers.getShadow('sm')])]} onPress={handleEmail}>
              <View style={[styles.contactIconBg, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <Ionicons name="mail" size={18} color={colors.brand[400]} />
              </View>
              <View style={styles.contactText}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>E-posta</Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>{provider.email}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }, ...(isDark ? [] : [helpers.getShadow('sm')])]} onPress={handleWebsite}>
              <View style={[styles.contactIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="globe" size={18} color="#3b82f6" />
              </View>
              <View style={styles.contactText}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Website</Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>{provider.website}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Değerlendirmeler</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: colors.brand[400] }]}>Tümü ({provider.reviewCount})</Text>
            </TouchableOpacity>
          </View>

          {provider.reviews.map((review) => (
            <View key={review.id} style={[styles.reviewCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }, ...(isDark ? [] : [helpers.getShadow('sm')])]}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={[styles.reviewAvatarText, { color: colors.brand[400] }]}>{review.avatar}</Text>
                </View>
                <View style={styles.reviewInfo}>
                  <Text style={[styles.reviewerName, { color: colors.text }]}>{review.name}</Text>
                  <View style={styles.reviewMeta}>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? 'star' : 'star-outline'}
                          size={12}
                          color="#fbbf24"
                        />
                      ))}
                    </View>
                    <View style={styles.eventTypeBadge}>
                      <Text style={[styles.eventTypeText, { color: colors.brand[400] }]}>{review.eventType}</Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>{review.date}</Text>
              </View>
              <Text style={[styles.reviewText, { color: colors.textMuted }]}>{review.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.98)' : colors.cardBackground, borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('lg')])]}>
        <View style={styles.bottomLeft}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]} onPress={handleMessage}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.brand[400]} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }, ...(isDark ? [] : [helpers.getShadow('sm')])]} onPress={handleCall}>
            <Ionicons name="call-outline" size={22} color={colors.success} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.requestBtn} onPress={handleRequestOffer}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.requestBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.requestBtnText}>Teklif İste</Text>
            <Ionicons name="paper-plane" size={18} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerButton: {
    marginRight: 8,
  },
  headerButtonBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  heroContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  heroBadge: {
    position: 'absolute',
    bottom: -40,
    left: 20,
  },
  heroAvatar: {
    width: 90,
    height: 90,
    borderRadius: 24,
    borderWidth: 4,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  providerName: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subcategory: {
    fontSize: 15,
    marginTop: 4,
  },
  quickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 13,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
  },
  priceContainer: {
    marginTop: 16,
  },
  priceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  priceText: {
    fontSize: 17,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  highlightsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 10,
  },
  highlightItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
  },
  highlightIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: {
    flex: 1,
  },
  highlightValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  highlightLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  specialtyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  servicesGrid: {
    gap: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
  },
  serviceText: {
    fontSize: 14,
  },
  artistsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  artistCard: {
    width: (width - 52) / 2,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  artistImage: {
    width: '100%',
    height: '100%',
  },
  artistGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  artistInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  artistName: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  artistGenre: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  artistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  artistRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  artistRatingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fbbf24',
  },
  artistPrice: {
    fontSize: 10,
    fontWeight: '600',
  },
  portfolioScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  portfolioItem: {
    marginRight: 12,
  },
  portfolioImage: {
    width: 160,
    height: 120,
    borderRadius: 14,
  },
  contactGrid: {
    gap: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
  },
  contactIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  reviewCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 6,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 11,
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 21,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    backgroundColor: 'rgba(9, 9, 11, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  bottomLeft: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  requestBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  requestBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
