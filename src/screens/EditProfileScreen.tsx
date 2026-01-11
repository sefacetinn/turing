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
import { colors, gradients } from '../theme/colors';

export function EditProfileScreen() {
  const navigation = useNavigation<any>();

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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' }}
              style={styles.profilePhoto}
            />
            <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangePhoto}>
              <LinearGradient
                colors={gradients.primary}
                style={styles.changePhotoGradient}
              >
                <Ionicons name="camera" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleChangePhoto}>
            <Text style={styles.changePhotoText}>Fotoğrafı Değiştir</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temel Bilgiler</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ad Soyad</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={18} color={colors.zinc[500]} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Adınızı girin"
                placeholderTextColor={colors.zinc[600]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-posta</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color={colors.zinc[500]} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="E-posta adresiniz"
                placeholderTextColor={colors.zinc[600]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefon</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={18} color={colors.zinc[500]} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Telefon numaranız"
                placeholderTextColor={colors.zinc[600]}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hakkında</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Biyografi</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                value={bio}
                onChangeText={setBio}
                placeholder="Kendiniz hakkında kısa bir bilgi yazın..."
                placeholderTextColor={colors.zinc[600]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.charCount}>{bio.length}/300</Text>
          </View>
        </View>

        {/* Work Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İş Bilgileri</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Şirket / Organizasyon</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={18} color={colors.zinc[500]} />
              <TextInput
                style={styles.input}
                value={company}
                onChangeText={setCompany}
                placeholder="Şirket adı"
                placeholderTextColor={colors.zinc[600]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Konum</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={18} color={colors.zinc[500]} />
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Şehir, Ülke"
                placeholderTextColor={colors.zinc[600]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Web Sitesi</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="globe-outline" size={18} color={colors.zinc[500]} />
              <TextInput
                style={styles.input}
                value={website}
                onChangeText={setWebsite}
                placeholder="www.example.com"
                placeholderTextColor={colors.zinc[600]}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Social Links Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sosyal Medya</Text>

          <TouchableOpacity style={styles.socialLinkItem}>
            <View style={[styles.socialIcon, { backgroundColor: 'rgba(59, 89, 152, 0.15)' }]}>
              <Ionicons name="logo-facebook" size={18} color="#3b5998" />
            </View>
            <Text style={styles.socialLinkText}>Facebook Bağla</Text>
            <Ionicons name="add-circle-outline" size={20} color={colors.zinc[500]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialLinkItem}>
            <View style={[styles.socialIcon, { backgroundColor: 'rgba(225, 48, 108, 0.15)' }]}>
              <Ionicons name="logo-instagram" size={18} color="#e1306c" />
            </View>
            <Text style={styles.socialLinkText}>Instagram Bağla</Text>
            <Ionicons name="add-circle-outline" size={20} color={colors.zinc[500]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialLinkItem}>
            <View style={[styles.socialIcon, { backgroundColor: 'rgba(29, 161, 242, 0.15)' }]}>
              <Ionicons name="logo-twitter" size={18} color="#1da1f2" />
            </View>
            <Text style={styles.socialLinkText}>Twitter Bağla</Text>
            <Ionicons name="add-circle-outline" size={20} color={colors.zinc[500]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialLinkItem}>
            <View style={[styles.socialIcon, { backgroundColor: 'rgba(10, 102, 194, 0.15)' }]}>
              <Ionicons name="logo-linkedin" size={18} color="#0a66c2" />
            </View>
            <Text style={styles.socialLinkText}>LinkedIn Bağla</Text>
            <Ionicons name="add-circle-outline" size={20} color={colors.zinc[500]} />
          </TouchableOpacity>
        </View>

        {/* Verification Section */}
        <View style={styles.section}>
          <View style={styles.verificationCard}>
            <View style={styles.verificationIcon}>
              <Ionicons name="shield-checkmark" size={24} color={colors.brand[400]} />
            </View>
            <View style={styles.verificationContent}>
              <Text style={styles.verificationTitle}>Hesabınızı Doğrulayın</Text>
              <Text style={styles.verificationText}>
                Doğrulanmış hesaplar daha fazla güvenilirlik kazanır
              </Text>
            </View>
            <TouchableOpacity style={styles.verifyButton}>
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
    color: colors.text,
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
    color: colors.brand[400],
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.zinc[500],
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
    color: colors.zinc[400],
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
    color: colors.text,
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
    color: colors.text,
    minHeight: 80,
  },
  charCount: {
    fontSize: 11,
    color: colors.zinc[600],
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
    color: colors.text,
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
    color: colors.text,
  },
  verificationText: {
    fontSize: 12,
    color: colors.zinc[400],
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
