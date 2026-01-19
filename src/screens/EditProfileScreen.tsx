import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../../App';
import * as Haptics from 'expo-haptics';

interface SocialAccount {
  id: string;
  platform: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  connected: boolean;
  username?: string;
}

export function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { isProviderMode, canSwitchMode } = useApp();

  // Profile state
  const [name, setName] = useState('Sefa Çetin');
  const [email, setEmail] = useState('sefa@example.com');
  const [phone, setPhone] = useState('+90 555 123 4567');
  const [bio, setBio] = useState('Etkinlik organizatörü ve müzik tutkunu.');
  const [company, setCompany] = useState('Turing Events');
  const [location, setLocation] = useState('İstanbul, Türkiye');
  const [website, setWebsite] = useState('www.turing.app');

  // Verification status
  const [emailVerified] = useState(true);
  const [phoneVerified] = useState(true);
  const [identityVerified] = useState(false);

  // Preferences
  const [publicProfile, setPublicProfile] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  // Social accounts
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { id: '1', platform: 'Instagram', icon: 'logo-instagram', color: '#E4405F', connected: true, username: '@sefacetin' },
    { id: '2', platform: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2', connected: false },
    { id: '3', platform: 'LinkedIn', icon: 'logo-linkedin', color: '#0A66C2', connected: true, username: 'sefacetin' },
  ]);

  // Calculate profile completion
  const profileCompletion = useMemo(() => {
    let score = 0;
    if (name) score += 15;
    if (email) score += 15;
    if (phone) score += 10;
    if (bio) score += 15;
    if (company) score += 10;
    if (location) score += 10;
    if (emailVerified) score += 10;
    if (phoneVerified) score += 10;
    if (socialAccounts.some(s => s.connected)) score += 5;
    return Math.min(score, 100);
  }, [name, email, phone, bio, company, location, emailVerified, phoneVerified, socialAccounts]);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Başarılı',
      'Profil bilgileriniz güncellendi.',
      [{ text: 'Tamam', onPress: () => navigation.goBack() }]
    );
  };

  const handleChangePhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Fotoğraf Değiştir',
      'Profil fotoğrafınızı nasıl değiştirmek istersiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kamera', onPress: () => {} },
        { text: 'Galeri', onPress: () => {} },
      ]
    );
  };

  const handleSocialConnect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSocialAccounts(prev =>
      prev.map(acc =>
        acc.id === id
          ? { ...acc, connected: !acc.connected, username: acc.connected ? undefined : '@username' }
          : acc
      )
    );
  };

  const handleVerifyIdentity = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Kimlik Doğrulama', 'Kimlik doğrulama sayfasına yönlendirileceksiniz.');
  };

  const getCompletionColor = () => {
    if (profileCompletion >= 80) return '#10B981';
    if (profileCompletion >= 50) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profili Düzenle</Text>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.brand[500] }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Profile Photo & Completion */}
        <View style={styles.heroSection}>
          <TouchableOpacity style={styles.photoContainer} onPress={handleChangePhoto} activeOpacity={0.8}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' }}
              style={styles.profilePhoto}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.photoOverlay}
            >
              <Ionicons name="camera" size={20} color="white" />
            </LinearGradient>

            {/* Completion ring */}
            <View style={[styles.completionRing, { borderColor: getCompletionColor() }]}>
              <Text style={[styles.completionText, { color: getCompletionColor() }]}>{profileCompletion}%</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.heroName, { color: colors.text }]}>{name || 'İsim ekleyin'}</Text>
          <Text style={[styles.heroEmail, { color: colors.textMuted }]}>{email}</Text>

          {/* Verification badges */}
          <View style={styles.verificationBadges}>
            {emailVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="mail" size={12} color="#10B981" />
                <Text style={[styles.verifiedText, { color: '#10B981' }]}>E-posta</Text>
              </View>
            )}
            {phoneVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="call" size={12} color="#10B981" />
                <Text style={[styles.verifiedText, { color: '#10B981' }]}>Telefon</Text>
              </View>
            )}
            {identityVerified ? (
              <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                <Text style={[styles.verifiedText, { color: '#10B981' }]}>Kimlik</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.verifiedBadge, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}
                onPress={handleVerifyIdentity}
              >
                <Ionicons name="shield-outline" size={12} color="#F59E0B" />
                <Text style={[styles.verifiedText, { color: '#F59E0B' }]}>Doğrula</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Temel Bilgiler</Text>

          <View style={[styles.inputCard, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border,
          }]}>
            <View style={styles.inputRow}>
              <View style={[styles.inputIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                <Ionicons name="person" size={16} color={colors.textMuted} />
              </View>
              <View style={styles.inputContent}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Ad Soyad</Text>
                <TextInput
                  style={[styles.inputValue, { color: colors.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Adınız"
                  placeholderTextColor={colors.zinc[500]}
                />
              </View>
            </View>

            <View style={[styles.inputDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]} />

            <View style={styles.inputRow}>
              <View style={[styles.inputIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                <Ionicons name="mail" size={16} color={colors.textMuted} />
              </View>
              <View style={styles.inputContent}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>E-posta</Text>
                <TextInput
                  style={[styles.inputValue, { color: colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="E-posta"
                  placeholderTextColor={colors.zinc[500]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {emailVerified && <Ionicons name="checkmark-circle" size={18} color="#10B981" />}
            </View>

            <View style={[styles.inputDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]} />

            <View style={styles.inputRow}>
              <View style={[styles.inputIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                <Ionicons name="call" size={16} color={colors.textMuted} />
              </View>
              <View style={styles.inputContent}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Telefon</Text>
                <TextInput
                  style={[styles.inputValue, { color: colors.text }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Telefon"
                  placeholderTextColor={colors.zinc[500]}
                  keyboardType="phone-pad"
                />
              </View>
              {phoneVerified && <Ionicons name="checkmark-circle" size={18} color="#10B981" />}
            </View>

            <View style={[styles.inputDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]} />

            <View style={styles.inputRow}>
              <View style={[styles.inputIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                <Ionicons name="location" size={16} color={colors.textMuted} />
              </View>
              <View style={styles.inputContent}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Konum</Text>
                <TextInput
                  style={[styles.inputValue, { color: colors.text }]}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Şehir"
                  placeholderTextColor={colors.zinc[500]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Hakkında</Text>

          <View style={[styles.textAreaCard, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border,
          }]}>
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Kendiniz hakkında..."
              placeholderTextColor={colors.zinc[500]}
              multiline
              maxLength={200}
            />
            <Text style={[styles.charCount, { color: colors.textMuted }]}>{bio.length}/200</Text>
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Firma Bilgileri</Text>

          <View style={[styles.inputCard, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border,
          }]}>
            <View style={styles.inputRow}>
              <View style={[styles.inputIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                <Ionicons name="business" size={16} color={colors.textMuted} />
              </View>
              <View style={styles.inputContent}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Şirket Adı</Text>
                <TextInput
                  style={[styles.inputValue, { color: colors.text }]}
                  value={company}
                  onChangeText={setCompany}
                  placeholder="Şirket"
                  placeholderTextColor={colors.zinc[500]}
                />
              </View>
            </View>

            <View style={[styles.inputDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]} />

            <View style={styles.inputRow}>
              <View style={[styles.inputIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                <Ionicons name="globe" size={16} color={colors.textMuted} />
              </View>
              <View style={styles.inputContent}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Web Sitesi</Text>
                <TextInput
                  style={[styles.inputValue, { color: colors.text }]}
                  value={website}
                  onChangeText={setWebsite}
                  placeholder="www.example.com"
                  placeholderTextColor={colors.zinc[500]}
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Social Accounts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Bağlı Hesaplar</Text>

          <View style={[styles.socialCard, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border,
          }]}>
            {socialAccounts.map((account, index) => (
              <View key={account.id}>
                <TouchableOpacity
                  style={styles.socialRow}
                  onPress={() => handleSocialConnect(account.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.socialIcon, { backgroundColor: `${account.color}15` }]}>
                    <Ionicons name={account.icon} size={18} color={account.color} />
                  </View>
                  <View style={styles.socialContent}>
                    <Text style={[styles.socialPlatform, { color: colors.text }]}>{account.platform}</Text>
                    {account.connected && account.username && (
                      <Text style={[styles.socialUsername, { color: colors.textMuted }]}>{account.username}</Text>
                    )}
                  </View>
                  {account.connected ? (
                    <View style={[styles.connectedBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                      <Ionicons name="checkmark" size={14} color="#10B981" />
                    </View>
                  ) : (
                    <Text style={[styles.connectText, { color: colors.brand[400] }]}>Bağla</Text>
                  )}
                </TouchableOpacity>
                {index < socialAccounts.length - 1 && (
                  <View style={[styles.inputDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Gizlilik</Text>

          <View style={[styles.privacyCard, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border,
          }]}>
            <View style={styles.privacyRow}>
              <View style={styles.privacyLeft}>
                <Text style={[styles.privacyTitle, { color: colors.text }]}>Herkese Açık Profil</Text>
                <Text style={[styles.privacyDesc, { color: colors.textMuted }]}>Profiliniz arama sonuçlarında görünsün</Text>
              </View>
              <Switch
                value={publicProfile}
                onValueChange={(v) => {
                  Haptics.selectionAsync();
                  setPublicProfile(v);
                }}
                trackColor={{ false: isDark ? '#333' : '#E5E5E5', true: colors.brand[400] }}
                thumbColor="white"
              />
            </View>

            <View style={[styles.inputDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]} />

            <View style={styles.privacyRow}>
              <View style={styles.privacyLeft}>
                <Text style={[styles.privacyTitle, { color: colors.text }]}>E-postayı Göster</Text>
                <Text style={[styles.privacyDesc, { color: colors.textMuted }]}>Profilinde e-posta görünsün</Text>
              </View>
              <Switch
                value={showEmail}
                onValueChange={(v) => {
                  Haptics.selectionAsync();
                  setShowEmail(v);
                }}
                trackColor={{ false: isDark ? '#333' : '#E5E5E5', true: colors.brand[400] }}
                thumbColor="white"
              />
            </View>

            <View style={[styles.inputDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]} />

            <View style={styles.privacyRow}>
              <View style={styles.privacyLeft}>
                <Text style={[styles.privacyTitle, { color: colors.text }]}>Telefonu Göster</Text>
                <Text style={[styles.privacyDesc, { color: colors.textMuted }]}>Profilinde telefon görünsün</Text>
              </View>
              <Switch
                value={showPhone}
                onValueChange={(v) => {
                  Haptics.selectionAsync();
                  setShowPhone(v);
                }}
                trackColor={{ false: isDark ? '#333' : '#E5E5E5', true: colors.brand[400] }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Mode Request */}
        {!canSwitchMode && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.modeCard, {
                backgroundColor: isDark
                  ? isProviderMode ? 'rgba(75, 48, 184, 0.1)' : 'rgba(16, 185, 129, 0.1)'
                  : isProviderMode ? 'rgba(75, 48, 184, 0.06)' : 'rgba(16, 185, 129, 0.06)',
              }]}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate(isProviderMode ? 'RequestOrganizerMode' : 'RequestProviderMode');
              }}
            >
              <View style={[styles.modeIcon, {
                backgroundColor: isProviderMode ? 'rgba(75, 48, 184, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              }]}>
                <Ionicons
                  name={isProviderMode ? 'people' : 'briefcase'}
                  size={22}
                  color={isProviderMode ? colors.brand[400] : '#10B981'}
                />
              </View>
              <View style={styles.modeContent}>
                <Text style={[styles.modeTitle, { color: colors.text }]}>
                  {isProviderMode ? 'Organizatör Modu' : 'Hizmet Sağlayıcı Modu'}
                </Text>
                <Text style={[styles.modeDesc, { color: colors.textMuted }]}>
                  {isProviderMode ? 'Etkinlik düzenlemek için talep edin' : 'Hizmet sunmak için talep edin'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
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
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  completionRing: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionText: {
    fontSize: 9,
    fontWeight: '700',
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
  },
  heroEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  verificationBadges: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // Input Card
  inputCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  inputValue: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  inputDivider: {
    height: 1,
    marginLeft: 62,
  },

  // Text Area
  textAreaCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  textArea: {
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 8,
  },

  // Social
  socialCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialContent: {
    flex: 1,
  },
  socialPlatform: {
    fontSize: 15,
    fontWeight: '500',
  },
  socialUsername: {
    fontSize: 12,
    marginTop: 2,
  },
  connectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Privacy
  privacyCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  privacyLeft: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  privacyDesc: {
    fontSize: 12,
    marginTop: 2,
  },

  // Mode Card
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  modeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  modeDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
