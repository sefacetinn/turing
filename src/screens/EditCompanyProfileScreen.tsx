import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeContext';
import { OptimizedImage } from '../components/OptimizedImage';
import { useApp } from '../../App';

// Service category type
interface ServiceCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
}

// Social media type
interface SocialMedia {
  platform: string;
  icon: keyof typeof Ionicons.glyphMap;
  url: string;
  placeholder: string;
}

// Working hours type
interface WorkingHours {
  day: string;
  dayShort: string;
  enabled: boolean;
  start: string;
  end: string;
}

export function EditCompanyProfileScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { isProviderMode } = useApp();

  // Provider company data
  const providerCompanyData = {
    name: 'EventPro 360',
    logo: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    description: 'Türkiye\'nin lider etkinlik hizmetleri şirketi. Ses, ışık, sahne ve teknik prodüksiyon alanında 15 yıllık deneyim. 500\'den fazla başarılı etkinlik.',
    founded: '2009',
    employees: '45',
    phone: '+90 212 555 0123',
    email: 'info@eventpro360.com',
    website: 'www.eventpro360.com',
    address: 'Levent, Büyükdere Cad. No:185, İstanbul',
  };

  // Organizer company data
  const organizerCompanyData = {
    name: 'Stellar Events',
    logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    cover: 'https://images.unsplash.com/photo-1540575467063-178a50e2fd87?w=800',
    description: 'Kurumsal etkinlikler, festivaller ve özel organizasyonlar konusunda uzman ekip. 10 yılı aşkın sektör deneyimi ile unutulmaz etkinlikler yaratıyoruz.',
    founded: '2014',
    employees: '28',
    phone: '+90 216 444 5678',
    email: 'info@stellarevents.com',
    website: 'www.stellarevents.com',
    address: 'Kadıköy, Bağdat Cad. No:220, İstanbul',
  };

  const companyData = isProviderMode ? providerCompanyData : organizerCompanyData;

  // Company Info State
  const [companyName, setCompanyName] = useState(companyData.name);
  const [companyLogo, setCompanyLogo] = useState(companyData.logo);
  const [coverImage, setCoverImage] = useState(companyData.cover);
  const [description, setDescription] = useState(companyData.description);
  const [foundedYear, setFoundedYear] = useState(companyData.founded);
  const [employeeCount, setEmployeeCount] = useState(companyData.employees);

  // Contact Info State
  const [phone, setPhone] = useState(companyData.phone);
  const [email, setEmail] = useState(companyData.email);
  const [website, setWebsite] = useState(companyData.website);
  const [address, setAddress] = useState(companyData.address);

  // Service Categories State - Different for Provider vs Organizer
  const providerCategories: ServiceCategory[] = [
    { id: 'technical', name: 'Ses & Işık', icon: 'volume-high', enabled: true },
    { id: 'booking', name: 'Sanatçı Booking', icon: 'musical-notes', enabled: true },
    { id: 'security', name: 'Güvenlik', icon: 'shield-checkmark', enabled: true },
    { id: 'catering', name: 'Catering', icon: 'restaurant', enabled: true },
    { id: 'transport', name: 'Ulaşım', icon: 'car', enabled: false },
    { id: 'accommodation', name: 'Konaklama', icon: 'bed', enabled: false },
    { id: 'decoration', name: 'Dekorasyon', icon: 'color-palette', enabled: false },
    { id: 'media', name: 'Medya & Prodüksiyon', icon: 'videocam', enabled: false },
  ];

  const organizerCategories: ServiceCategory[] = [
    { id: 'corporate', name: 'Kurumsal Etkinlik', icon: 'briefcase', enabled: true },
    { id: 'festival', name: 'Festival', icon: 'musical-notes', enabled: true },
    { id: 'concert', name: 'Konser', icon: 'mic', enabled: true },
    { id: 'conference', name: 'Konferans', icon: 'people', enabled: true },
    { id: 'wedding', name: 'Düğün', icon: 'heart', enabled: false },
    { id: 'launch', name: 'Lansman', icon: 'rocket', enabled: true },
    { id: 'gala', name: 'Gala Gecesi', icon: 'wine', enabled: false },
    { id: 'sports', name: 'Spor Etkinliği', icon: 'football', enabled: false },
  ];

  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    isProviderMode ? providerCategories : organizerCategories
  );

  // Social Media State
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([
    { platform: 'Instagram', icon: 'logo-instagram', url: '@eventpro360', placeholder: '@kullaniciadi' },
    { platform: 'LinkedIn', icon: 'logo-linkedin', url: 'eventpro360', placeholder: 'sirket-adi' },
    { platform: 'Twitter', icon: 'logo-twitter', url: '@eventpro360', placeholder: '@kullaniciadi' },
    { platform: 'YouTube', icon: 'logo-youtube', url: '', placeholder: 'kanal-adi' },
  ]);

  // Working Hours State
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([
    { day: 'Pazartesi', dayShort: 'Pzt', enabled: true, start: '09:00', end: '18:00' },
    { day: 'Salı', dayShort: 'Sal', enabled: true, start: '09:00', end: '18:00' },
    { day: 'Çarşamba', dayShort: 'Çar', enabled: true, start: '09:00', end: '18:00' },
    { day: 'Perşembe', dayShort: 'Per', enabled: true, start: '09:00', end: '18:00' },
    { day: 'Cuma', dayShort: 'Cum', enabled: true, start: '09:00', end: '18:00' },
    { day: 'Cumartesi', dayShort: 'Cmt', enabled: true, start: '10:00', end: '16:00' },
    { day: 'Pazar', dayShort: 'Paz', enabled: false, start: '10:00', end: '16:00' },
  ]);

  // Service Regions State
  const [serviceRegions, setServiceRegions] = useState([
    { id: '1', name: 'İstanbul', enabled: true },
    { id: '2', name: 'Ankara', enabled: true },
    { id: '3', name: 'İzmir', enabled: true },
    { id: '4', name: 'Antalya', enabled: true },
    { id: '5', name: 'Bursa', enabled: false },
    { id: '6', name: 'Türkiye Geneli', enabled: true },
  ]);

  // Portfolio Images
  const [portfolioImages, setPortfolioImages] = useState([
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
  ]);

  // Certificates
  const [certificates, setCertificates] = useState([
    { id: '1', name: 'ISO 9001:2015', issuer: 'TSE', year: '2023' },
    { id: '2', name: 'İş Güvenliği Sertifikası', issuer: 'ÇSGB', year: '2024' },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  // Pick Logo Image
  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCompanyLogo(result.assets[0].uri);
    }
  };

  // Pick Cover Image
  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  // Add Portfolio Image
  const addPortfolioImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPortfolioImages([...portfolioImages, result.assets[0].uri]);
    }
  };

  // Remove Portfolio Image
  const removePortfolioImage = (index: number) => {
    Alert.alert(
      'Görseli Sil',
      'Bu görseli portfolyodan kaldırmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            const newImages = [...portfolioImages];
            newImages.splice(index, 1);
            setPortfolioImages(newImages);
          },
        },
      ]
    );
  };

  // Toggle Service Category
  const toggleServiceCategory = (id: string) => {
    setServiceCategories(prev =>
      prev.map(cat => cat.id === id ? { ...cat, enabled: !cat.enabled } : cat)
    );
  };

  // Toggle Service Region
  const toggleServiceRegion = (id: string) => {
    setServiceRegions(prev =>
      prev.map(reg => reg.id === id ? { ...reg, enabled: !reg.enabled } : reg)
    );
  };

  // Toggle Working Day
  const toggleWorkingDay = (index: number) => {
    setWorkingHours(prev =>
      prev.map((day, i) => i === index ? { ...day, enabled: !day.enabled } : day)
    );
  };

  // Update Social Media
  const updateSocialMedia = (index: number, url: string) => {
    setSocialMedia(prev =>
      prev.map((sm, i) => i === index ? { ...sm, url } : sm)
    );
  };

  // Save Profile
  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert(
        'Kaydedildi',
        'Şirket profiliniz başarıyla güncellendi.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };

  // Section Header Component
  const SectionHeader = ({ title, icon }: { title: string; icon: keyof typeof Ionicons.glyphMap }) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color={colors.brand?.[400] || '#8B5CF6'} />
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );

  const brandColor = colors.brand?.[500] || '#8B5CF6';
  const brandColor400 = colors.brand?.[400] || '#A78BFA';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <SafeAreaView edges={['top']}>
        <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Şirket Profili</Text>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: brandColor }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Cover Image */}
          <TouchableOpacity style={styles.coverImageContainer} onPress={pickCoverImage}>
            <OptimizedImage source={coverImage} style={styles.coverImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.coverGradient}
            />
            <View style={styles.coverEditBadge}>
              <Ionicons name="camera" size={16} color="white" />
              <Text style={styles.coverEditText}>Kapak Değiştir</Text>
            </View>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoSection}>
            <TouchableOpacity style={styles.logoContainer} onPress={pickLogo}>
              <OptimizedImage source={companyLogo} style={styles.logo} />
              <View style={[styles.logoEditBadge, { backgroundColor: brandColor }]}>
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Company Info Section */}
          <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
            <SectionHeader title="Şirket Bilgileri" icon="business" />

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Şirket Adı</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Şirket adını girin"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Şirketinizi tanıtın..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: colors.textMuted }]}>{description.length}/500</Text>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Kuruluş Yılı</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}
                  value={foundedYear}
                  onChangeText={setFoundedYear}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Çalışan Sayısı</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}
                  value={employeeCount}
                  onChangeText={setEmployeeCount}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Service Categories Section */}
          <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
            <SectionHeader
              title={isProviderMode ? "Hizmet Kategorileri" : "Etkinlik Türleri"}
              icon="grid"
            />
            <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>
              {isProviderMode ? "Sunduğunuz hizmetleri seçin" : "Düzenlediğiniz etkinlik türlerini seçin"}
            </Text>

            <View style={styles.categoriesGrid}>
              {serviceCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: category.enabled
                        ? (isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)')
                        : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                      borderColor: category.enabled
                        ? brandColor400
                        : (isDark ? 'rgba(255,255,255,0.08)' : colors.border),
                    },
                  ]}
                  onPress={() => toggleServiceCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon}
                    size={18}
                    color={category.enabled ? brandColor400 : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: category.enabled ? colors.text : colors.textMuted },
                    ]}
                  >
                    {category.name}
                  </Text>
                  {category.enabled && (
                    <Ionicons name="checkmark-circle" size={16} color={brandColor400} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Info Section */}
          <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
            <SectionHeader title="İletişim Bilgileri" icon="call" />

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Telefon</Text>
              <View style={[styles.inputWithIcon, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <Ionicons name="call-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputIconText, { color: colors.text }]}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>E-posta</Text>
              <View style={[styles.inputWithIcon, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputIconText, { color: colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Web Sitesi</Text>
              <View style={[styles.inputWithIcon, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <Ionicons name="globe-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputIconText, { color: colors.text }]}
                  value={website}
                  onChangeText={setWebsite}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Adres</Text>
              <View style={[styles.inputWithIcon, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <Ionicons name="location-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputIconText, { color: colors.text }]}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>
          </View>

          {/* Social Media Section */}
          <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
            <SectionHeader title="Sosyal Medya" icon="share-social" />

            {socialMedia.map((sm, index) => (
              <View key={sm.platform} style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{sm.platform}</Text>
                <View style={[styles.inputWithIcon, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                  <Ionicons name={sm.icon} size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputIconText, { color: colors.text }]}
                    value={sm.url}
                    onChangeText={(text) => updateSocialMedia(index, text)}
                    placeholder={sm.placeholder}
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Working Hours Section */}
          <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
            <SectionHeader title="Çalışma Saatleri" icon="time" />

            {workingHours.map((day, index) => (
              <View key={day.day} style={styles.workingHourRow}>
                <View style={styles.workingDayInfo}>
                  <Switch
                    value={day.enabled}
                    onValueChange={() => toggleWorkingDay(index)}
                    trackColor={{ false: isDark ? '#333' : '#ddd', true: brandColor400 }}
                    thumbColor="white"
                  />
                  <Text style={[styles.workingDayText, { color: day.enabled ? colors.text : colors.textMuted }]}>
                    {day.day}
                  </Text>
                </View>
                {day.enabled && (
                  <View style={styles.workingTimeInputs}>
                    <TextInput
                      style={[styles.timeInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}
                      value={day.start}
                      placeholder="09:00"
                      placeholderTextColor={colors.textMuted}
                    />
                    <Text style={[styles.timeSeparator, { color: colors.textMuted }]}>-</Text>
                    <TextInput
                      style={[styles.timeInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}
                      value={day.end}
                      placeholder="18:00"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                )}
                {!day.enabled && (
                  <Text style={[styles.closedText, { color: colors.textMuted }]}>Kapalı</Text>
                )}
              </View>
            ))}
          </View>

          {/* Service Regions Section */}
          <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
            <SectionHeader title="Hizmet Bölgeleri" icon="map" />
            <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>
              Hizmet verdiğiniz şehirleri seçin
            </Text>

            <View style={styles.regionsGrid}>
              {serviceRegions.map((region) => (
                <TouchableOpacity
                  key={region.id}
                  style={[
                    styles.regionChip,
                    {
                      backgroundColor: region.enabled
                        ? (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)')
                        : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                      borderColor: region.enabled
                        ? '#10B981'
                        : (isDark ? 'rgba(255,255,255,0.08)' : colors.border),
                    },
                  ]}
                  onPress={() => toggleServiceRegion(region.id)}
                >
                  <Text
                    style={[
                      styles.regionChipText,
                      { color: region.enabled ? colors.text : colors.textMuted },
                    ]}
                  >
                    {region.name}
                  </Text>
                  {region.enabled && (
                    <Ionicons name="checkmark" size={14} color="#10B981" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Portfolio Section */}
          <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
            <SectionHeader title="Portfolyo" icon="images" />
            <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>
              Çalışmalarınızdan örnekler ekleyin
            </Text>

            <View style={styles.portfolioGrid}>
              {portfolioImages.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.portfolioImageContainer}
                  onLongPress={() => removePortfolioImage(index)}
                >
                  <OptimizedImage source={image} style={styles.portfolioImage} />
                  <TouchableOpacity
                    style={styles.portfolioRemoveBtn}
                    onPress={() => removePortfolioImage(index)}
                  >
                    <Ionicons name="close" size={14} color="white" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.addPortfolioBtn, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : colors.border }]}
                onPress={addPortfolioImage}
              >
                <Ionicons name="add" size={28} color={colors.textMuted} />
                <Text style={[styles.addPortfolioText, { color: colors.textMuted }]}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Certificates Section */}
          <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
            <SectionHeader title="Sertifikalar & Belgeler" icon="ribbon" />

            {certificates.map((cert) => (
              <View
                key={cert.id}
                style={[styles.certificateItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}
              >
                <View style={[styles.certificateIcon, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)' }]}>
                  <Ionicons name="ribbon" size={18} color="#FBBF24" />
                </View>
                <View style={styles.certificateInfo}>
                  <Text style={[styles.certificateName, { color: colors.text }]}>{cert.name}</Text>
                  <Text style={[styles.certificateIssuer, { color: colors.textMuted }]}>
                    {cert.issuer} • {cert.year}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.addCertificateBtn, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : colors.border }]}
            >
              <Ionicons name="add-circle-outline" size={20} color={brandColor400} />
              <Text style={[styles.addCertificateText, { color: brandColor400 }]}>Sertifika Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Spacer */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 40,
  },
  coverImageContainer: {
    height: 160,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  coverEditBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  coverEditText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 20,
  },
  logoContainer: {
    position: 'relative',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: 'white',
  },
  logoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 13,
    marginBottom: 12,
    marginTop: -8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputIconText: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  regionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  regionChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  workingHourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  workingDayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workingDayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  workingTimeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    width: 65,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 14,
  },
  closedText: {
    fontSize: 13,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  portfolioImageContainer: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  portfolioRemoveBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPortfolioBtn: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPortfolioText: {
    fontSize: 12,
    marginTop: 4,
  },
  certificateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  certificateIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certificateInfo: {
    flex: 1,
  },
  certificateName: {
    fontSize: 14,
    fontWeight: '500',
  },
  certificateIssuer: {
    fontSize: 12,
    marginTop: 2,
  },
  addCertificateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 12,
    gap: 8,
  },
  addCertificateText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
