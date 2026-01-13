import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const colors = defaultColors;

export function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();

  // Profile state
  const [name, setName] = useState('Ahmet Yılmaz');
  const [email, setEmail] = useState('ahmet@example.com');
  const [phone, setPhone] = useState('+90 555 123 4567');
  const [bio, setBio] = useState('Etkinlik organizatörü ve müzik tutkunu. 10 yıldır organizasyon sektöründe çalışıyorum.');
  const [company, setCompany] = useState('Yılmaz Organizasyon');
  const [location, setLocation] = useState('İstanbul, Türkiye');
  const [website, setWebsite] = useState('www.yilmazorg.com');

  const handleSave = () => {
    Alert.alert(
      'Başarılı',
      'Profil bilgileriniz güncellendi.',
      [{ text: 'Tamam', onPress: () => navigation.goBack() }]
    );
  };

  const handleChangePhoto = () => {
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profili Düzenle</Text>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.brand[500] }]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' }}
              style={[styles.profilePhoto, { borderColor: colors.brand[500] }]}
            />
            <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangePhoto}>
              <LinearGradient
                colors={gradients.primary}
                style={[styles.changePhotoGradient, { borderColor: colors.background }]}
              >
                <Ionicons name="camera" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleChangePhoto}>
            <Text style={[styles.changePhotoText, { color: colors.brand[400] }]}>Fotoğrafı Değiştir</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Temel Bilgiler</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Ad Soyad</Text>
            <View style={[styles.inputContainer, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.inputBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.inputBorder
            }]}>
              <Ionicons name="person-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Adınızı girin"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>E-posta</Text>
            <View style={[styles.inputContainer, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.inputBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.inputBorder
            }]}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="E-posta adresiniz"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Telefon</Text>
            <View style={[styles.inputContainer, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.inputBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.inputBorder
            }]}>
              <Ionicons name="call-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Telefon numaranız"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Hakkında</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Biyografi</Text>
            <View style={[styles.textAreaContainer, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.inputBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.inputBorder
            }]}>
              <TextInput
                style={[styles.textArea, { color: colors.text }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Kendiniz hakkında kısa bir bilgi yazın..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            <Text style={[styles.charCount, { color: colors.textMuted }]}>{bio.length}/300</Text>
          </View>
        </View>

        {/* Work Info Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>İş Bilgileri</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Şirket / Organizasyon</Text>
            <View style={[styles.inputContainer, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.inputBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.inputBorder
            }]}>
              <Ionicons name="business-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={company}
                onChangeText={setCompany}
                placeholder="Şirket adı"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Konum</Text>
            <View style={[styles.inputContainer, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.inputBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.inputBorder
            }]}>
              <Ionicons name="location-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={location}
                onChangeText={setLocation}
                placeholder="Şehir, Ülke"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Web Sitesi</Text>
            <View style={[styles.inputContainer, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.inputBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.inputBorder
            }]}>
              <Ionicons name="globe-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={website}
                onChangeText={setWebsite}
                placeholder="www.example.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Social Links Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Sosyal Medya</Text>

          <TouchableOpacity style={[styles.socialLinkItem, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
            ...(isDark ? {} : helpers.getShadow('sm'))
          }]}>
            <View style={[styles.socialIcon, { backgroundColor: 'rgba(59, 89, 152, 0.15)' }]}>
              <Ionicons name="logo-facebook" size={18} color="#3b5998" />
            </View>
            <Text style={[styles.socialLinkText, { color: colors.text }]}>Facebook Bağla</Text>
            <Ionicons name="add-circle-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialLinkItem, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
            ...(isDark ? {} : helpers.getShadow('sm'))
          }]}>
            <View style={[styles.socialIcon, { backgroundColor: 'rgba(225, 48, 108, 0.15)' }]}>
              <Ionicons name="logo-instagram" size={18} color="#e1306c" />
            </View>
            <Text style={[styles.socialLinkText, { color: colors.text }]}>Instagram Bağla</Text>
            <Ionicons name="add-circle-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialLinkItem, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
            ...(isDark ? {} : helpers.getShadow('sm'))
          }]}>
            <View style={[styles.socialIcon, { backgroundColor: 'rgba(29, 161, 242, 0.15)' }]}>
              <Ionicons name="logo-twitter" size={18} color="#1da1f2" />
            </View>
            <Text style={[styles.socialLinkText, { color: colors.text }]}>Twitter Bağla</Text>
            <Ionicons name="add-circle-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialLinkItem, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
            ...(isDark ? {} : helpers.getShadow('sm'))
          }]}>
            <View style={[styles.socialIcon, { backgroundColor: 'rgba(10, 102, 194, 0.15)' }]}>
              <Ionicons name="logo-linkedin" size={18} color="#0a66c2" />
            </View>
            <Text style={[styles.socialLinkText, { color: colors.text }]}>LinkedIn Bağla</Text>
            <Ionicons name="add-circle-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Verification Section */}
        <View style={styles.section}>
          <View style={[styles.verificationCard, {
            backgroundColor: isDark ? 'rgba(147, 51, 234, 0.08)' : 'rgba(147, 51, 234, 0.06)',
            borderColor: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.15)'
          }]}>
            <View style={[styles.verificationIcon, {
              backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.1)'
            }]}>
              <Ionicons name="shield-checkmark" size={24} color={colors.brand[400]} />
            </View>
            <View style={styles.verificationContent}>
              <Text style={[styles.verificationTitle, { color: colors.text }]}>Hesabınızı Doğrulayın</Text>
              <Text style={[styles.verificationText, { color: colors.textMuted }]}>
                Doğrulanmış hesaplar daha fazla güvenilirlik kazanır
              </Text>
            </View>
            <TouchableOpacity style={[styles.verifyButton, { backgroundColor: colors.brand[500] }]}>
              <Text style={styles.verifyButtonText}>Doğrula</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.brand[500],
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.brand[500],
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  changePhotoGradient: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
    borderRadius: 16,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  textAreaContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  textArea: {
    fontSize: 14,
    minHeight: 80,
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  socialLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  socialLinkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  verificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  verificationContent: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  verificationText: {
    fontSize: 12,
    marginTop: 2,
  },
  verifyButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.brand[500],
    borderRadius: 8,
  },
  verifyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
});
