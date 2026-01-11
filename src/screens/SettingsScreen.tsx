import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

interface SettingsScreenProps {
  onLogout?: () => void;
}

export function SettingsScreen({ onLogout }: SettingsScreenProps) {
  const navigation = useNavigation<any>();

  // Notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [offerNotifications, setOfferNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);

  // Privacy settings
  const [showProfile, setShowProfile] = useState(true);
  const [showLocation, setShowLocation] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => onLogout?.()
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hesabı Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Bilgi', 'Hesap silme talebi alındı. 7 gün içinde hesabınız silinecektir.');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirimler</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <Ionicons name="notifications" size={18} color={colors.brand[400]} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Push Bildirimleri</Text>
                <Text style={styles.settingDescription}>Anlık bildirimler al</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
              thumbColor="white"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="mail" size={18} color={colors.info} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>E-posta Bildirimleri</Text>
                <Text style={styles.settingDescription}>Önemli güncellemeler için</Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
              thumbColor="white"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="pricetag" size={18} color={colors.success} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Teklif Bildirimleri</Text>
                <Text style={styles.settingDescription}>Yeni teklifler için uyarı</Text>
              </View>
            </View>
            <Switch
              value={offerNotifications}
              onValueChange={setOfferNotifications}
              trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
              thumbColor="white"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Ionicons name="chatbubble" size={18} color={colors.warning} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Mesaj Bildirimleri</Text>
                <Text style={styles.settingDescription}>Yeni mesajlar için uyarı</Text>
              </View>
            </View>
            <Switch
              value={messageNotifications}
              onValueChange={setMessageNotifications}
              trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gizlilik</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <Ionicons name="eye" size={18} color={colors.brand[400]} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Profili Göster</Text>
                <Text style={styles.settingDescription}>Profilin herkese açık</Text>
              </View>
            </View>
            <Switch
              value={showProfile}
              onValueChange={setShowProfile}
              trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
              thumbColor="white"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="location" size={18} color={colors.info} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Konum Paylaş</Text>
                <Text style={styles.settingDescription}>Yakındaki sağlayıcılar için</Text>
              </View>
            </View>
            <Switch
              value={showLocation}
              onValueChange={setShowLocation}
              trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genel</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <Ionicons name="language" size={18} color={colors.brand[400]} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Dil</Text>
                <Text style={styles.settingDescription}>Türkçe</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.zinc[600]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="moon" size={18} color={colors.info} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Tema</Text>
                <Text style={styles.settingDescription}>Koyu</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.zinc[600]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="cash" size={18} color={colors.success} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Para Birimi</Text>
                <Text style={styles.settingDescription}>TRY (₺)</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.zinc[600]} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destek</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <Ionicons name="help-circle" size={18} color={colors.brand[400]} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Yardım Merkezi</Text>
                <Text style={styles.settingDescription}>SSS ve rehberler</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.zinc[600]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="chatbubbles" size={18} color={colors.info} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Bize Ulaşın</Text>
                <Text style={styles.settingDescription}>Destek ekibimizle iletişime geçin</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.zinc[600]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Ionicons name="star" size={18} color={colors.warning} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Uygulamayı Değerlendir</Text>
                <Text style={styles.settingDescription}>App Store'da değerlendir</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.zinc[600]} />
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yasal</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(113, 113, 122, 0.15)' }]}>
                <Ionicons name="document-text" size={18} color={colors.zinc[400]} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Kullanım Koşulları</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.zinc[600]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(113, 113, 122, 0.15)' }]}>
                <Ionicons name="shield-checkmark" size={18} color={colors.zinc[400]} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Gizlilik Politikası</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.zinc[600]} />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color={colors.zinc[500]} />
            <Text style={styles.deleteText}>Hesabı Sil</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Turing v1.0.0</Text>
          <Text style={styles.versionSubtext}>Build 2024.1</Text>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.zinc[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.zinc[500],
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.error,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.zinc[500],
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.zinc[500],
  },
  versionSubtext: {
    fontSize: 11,
    color: colors.zinc[600],
    marginTop: 2,
  },
});
