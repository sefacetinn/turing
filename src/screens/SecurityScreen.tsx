import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Clipboard from 'expo-clipboard';

interface Session {
  id: string;
  device: string;
  deviceType: 'phone' | 'laptop' | 'tablet';
  location: string;
  lastActive: string;
  current: boolean;
  ip?: string;
}

export function SecurityScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();

  // State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biyometrik');

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [show2FAVerifyModal, setShow2FAVerifyModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // 2FA
  const [twoFAMethod, setTwoFAMethod] = useState<'sms' | 'app'>('app');
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const backupCodes = ['A3K9-X7M2', 'B8N4-P6Q1', 'C2R5-Y9T3', 'D7L1-Z4W8', 'E5J6-V2S9', 'F9H3-U8K4'];

  // Delete account
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Sessions
  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', device: 'iPhone 15 Pro', deviceType: 'phone', location: 'İstanbul, TR', lastActive: 'Şu an aktif', current: true, ip: '192.168.1.100' },
    { id: '2', device: 'MacBook Pro', deviceType: 'laptop', location: 'İstanbul, TR', lastActive: '2 saat önce', current: false, ip: '192.168.1.101' },
    { id: '3', device: 'iPad Air', deviceType: 'tablet', location: 'Ankara, TR', lastActive: '3 gün önce', current: false, ip: '85.105.22.45' },
  ]);

  // Check biometric availability
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);

      if (compatible) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        }
      }
    } catch (error) {
      console.warn('Biometric check error:', error);
    }
  };

  // Biometric toggle
  const handleBiometricToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (value) {
      // Try to authenticate
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `${biometricType} ile doğrulayın`,
        cancelLabel: 'İptal',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setBiometricEnabled(true);
        Alert.alert('Başarılı', `${biometricType} etkinleştirildi`);
      } else {
        Alert.alert('Hata', 'Biyometrik doğrulama başarısız');
      }
    } else {
      setBiometricEnabled(false);
      Alert.alert('Devre Dışı', `${biometricType} devre dışı bırakıldı`);
    }
  };

  // Password validation
  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('En az 8 karakter');
    if (!/[A-Z]/.test(password)) errors.push('En az 1 büyük harf');
    if (!/[a-z]/.test(password)) errors.push('En az 1 küçük harf');
    if (!/[0-9]/.test(password)) errors.push('En az 1 rakam');
    if (!/[!@#$%^&*]/.test(password)) errors.push('En az 1 özel karakter');
    return { valid: errors.length === 0, errors };
  };

  const getPasswordStrength = (password: string): { label: string; color: string; width: number } => {
    const { errors } = validatePassword(password);
    const score = 5 - errors.length;
    if (score <= 1) return { label: 'Çok Zayıf', color: '#EF4444', width: 20 };
    if (score === 2) return { label: 'Zayıf', color: '#F97316', width: 40 };
    if (score === 3) return { label: 'Orta', color: '#F59E0B', width: 60 };
    if (score === 4) return { label: 'Güçlü', color: '#22C55E', width: 80 };
    return { label: 'Çok Güçlü', color: '#10B981', width: 100 };
  };

  // Handle password change
  const handleChangePassword = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Mevcut şifrenizi girin');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      setPasswordError(validation.errors.join(', '));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor');
      return;
    }

    setPasswordLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPasswordLoading(false);

    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi');
  };

  // Handle 2FA setup
  const handle2FAToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (value) {
      setShow2FAModal(true);
    } else {
      Alert.alert(
        '2FA Devre Dışı Bırak',
        'İki faktörlü doğrulamayı devre dışı bırakmak hesabınızın güvenliğini azaltır. Devam etmek istiyor musunuz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Devre Dışı Bırak',
            style: 'destructive',
            onPress: () => setTwoFactorEnabled(false),
          },
        ]
      );
    }
  };

  const handle2FAVerify = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Hata', 'Lütfen 6 haneli kodu girin');
      return;
    }

    setTwoFALoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTwoFALoading(false);

    setShow2FAVerifyModal(false);
    setVerificationCode('');
    setTwoFactorEnabled(true);
    setShowBackupCodesModal(true);
  };

  // Handle session management
  const handleEndSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    Alert.alert(
      'Oturumu Sonlandır',
      `"${session?.device}" cihazından oturumu kapatmak istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sonlandır',
          style: 'destructive',
          onPress: () => {
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            Alert.alert('Başarılı', 'Oturum sonlandırıldı');
          },
        },
      ]
    );
  };

  const handleEndAllSessions = () => {
    const otherSessions = sessions.filter(s => !s.current);
    if (otherSessions.length === 0) {
      Alert.alert('Bilgi', 'Sonlandırılacak başka oturum yok');
      return;
    }

    Alert.alert(
      'Tüm Oturumları Sonlandır',
      `Bu cihaz hariç ${otherSessions.length} oturumu kapatmak istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tümünü Sonlandır',
          style: 'destructive',
          onPress: () => {
            setSessions(prev => prev.filter(s => s.current));
            Alert.alert('Başarılı', 'Tüm oturumlar sonlandırıldı');
          },
        },
      ]
    );
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'HESABIMI SİL') {
      Alert.alert('Hata', 'Lütfen "HESABIMI SİL" yazın');
      return;
    }

    Alert.alert(
      'Son Onay',
      'Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Hesabı Sil',
          style: 'destructive',
          onPress: () => {
            setShowDeleteAccountModal(false);
            Alert.alert('Hesap Silindi', 'Hesabınız başarıyla silindi. Görüşmek üzere!');
            // navigation.reset for logout
          },
        },
      ]
    );
  };

  // Copy backup code
  const copyBackupCodes = async () => {
    await Clipboard.setStringAsync(backupCodes.join('\n'));
    Alert.alert('Kopyalandı', 'Yedek kodlar panoya kopyalandı');
  };

  const getDeviceIcon = (type: Session['deviceType']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'phone': return 'phone-portrait';
      case 'laptop': return 'laptop';
      case 'tablet': return 'tablet-portrait';
      default: return 'hardware-chip';
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Güvenlik</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Password Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Şifre</Text>
          <TouchableOpacity
            style={[styles.card, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
              ...(isDark ? {} : helpers.getShadow('sm'))
            }]}
            onPress={() => setShowPasswordModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(75, 48, 184, 0.15)' }]}>
                  <Ionicons name="key" size={20} color={colors.brand[400]} />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Şifre Değiştir</Text>
                  <Text style={[styles.rowDescription, { color: colors.textMuted }]}>Son değişiklik: 3 ay önce</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Two-Factor Authentication */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>İki Faktörlü Doğrulama</Text>
          <View style={[styles.card, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
            ...(isDark ? {} : helpers.getShadow('sm'))
          }]}>
            <View style={styles.toggleRow}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: twoFactorEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(156, 163, 175, 0.15)' }]}>
                  <Ionicons name="shield-checkmark" size={20} color={twoFactorEnabled ? colors.success : colors.textMuted} />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>2FA Etkinleştir</Text>
                  <Text style={[styles.rowDescription, { color: colors.textMuted }]}>
                    {twoFactorEnabled ? `${twoFAMethod === 'app' ? 'Uygulama' : 'SMS'} ile aktif` : 'SMS veya uygulama ile doğrulama'}
                  </Text>
                </View>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={handle2FAToggle}
                trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: colors.brand[600] }}
                thumbColor={twoFactorEnabled ? colors.brand[400] : isDark ? colors.zinc[400] : colors.zinc[300]}
              />
            </View>

            {twoFactorEnabled && (
              <>
                <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />
                <TouchableOpacity style={styles.subRow} activeOpacity={0.7} onPress={() => setShowBackupCodesModal(true)}>
                  <View style={styles.subRowLeft}>
                    <Ionicons name="document-text-outline" size={18} color={colors.textMuted} />
                    <Text style={[styles.subRowText, { color: colors.textMuted }]}>Yedek Kodları Göster</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />
                <TouchableOpacity style={styles.subRow} activeOpacity={0.7} onPress={() => setShow2FAModal(true)}>
                  <View style={styles.subRowLeft}>
                    <Ionicons name="settings-outline" size={18} color={colors.textMuted} />
                    <Text style={[styles.subRowText, { color: colors.textMuted }]}>Doğrulama Yöntemini Değiştir</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Biometric */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Biyometrik Giriş</Text>
          <View style={[styles.card, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
            ...(isDark ? {} : helpers.getShadow('sm'))
          }]}>
            <View style={styles.toggleRow}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: biometricEnabled ? 'rgba(59, 130, 246, 0.15)' : 'rgba(156, 163, 175, 0.15)' }]}>
                  <Ionicons name={biometricType === 'Face ID' ? 'scan' : 'finger-print'} size={20} color={biometricEnabled ? colors.info : colors.textMuted} />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{biometricType}</Text>
                  <Text style={[styles.rowDescription, { color: colors.textMuted }]}>
                    {biometricAvailable
                      ? (biometricEnabled ? 'Aktif' : 'Devre dışı')
                      : 'Bu cihazda desteklenmiyor'}
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                disabled={!biometricAvailable}
                trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: colors.brand[600] }}
                thumbColor={biometricEnabled ? colors.brand[400] : isDark ? colors.zinc[400] : colors.zinc[300]}
              />
            </View>
          </View>
        </View>

        {/* Login Alerts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Giriş Uyarıları</Text>
          <View style={[styles.card, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
            ...(isDark ? {} : helpers.getShadow('sm'))
          }]}>
            <View style={styles.toggleRow}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: loginAlerts ? 'rgba(245, 158, 11, 0.15)' : 'rgba(156, 163, 175, 0.15)' }]}>
                  <Ionicons name="alert-circle" size={20} color={loginAlerts ? colors.warning : colors.textMuted} />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Yeni Giriş Bildirimi</Text>
                  <Text style={[styles.rowDescription, { color: colors.textMuted }]}>Yeni cihazdan giriş yapıldığında bildir</Text>
                </View>
              </View>
              <Switch
                value={loginAlerts}
                onValueChange={(value) => {
                  setLoginAlerts(value);
                  Alert.alert(
                    value ? 'Etkinleştirildi' : 'Devre Dışı',
                    value
                      ? 'Yeni bir cihazdan giriş yapıldığında bildirim alacaksınız'
                      : 'Giriş bildirimleri kapatıldı'
                  );
                }}
                trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: colors.brand[600] }}
                thumbColor={loginAlerts ? colors.brand[400] : isDark ? colors.zinc[400] : colors.zinc[300]}
              />
            </View>
          </View>
        </View>

        {/* Active Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted, marginBottom: 0 }]}>Aktif Oturumlar</Text>
            {sessions.filter(s => !s.current).length > 0 && (
              <TouchableOpacity onPress={handleEndAllSessions}>
                <Text style={[styles.endAllText, { color: colors.error }]}>Tümünü Sonlandır</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.card, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
            ...(isDark ? {} : helpers.getShadow('sm'))
          }]}>
            {sessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle" size={40} color={colors.success} />
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Tüm oturumlar sonlandırıldı</Text>
              </View>
            ) : (
              sessions.map((session, index) => (
                <View key={session.id}>
                  <TouchableOpacity
                    style={styles.sessionRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      Alert.alert(
                        session.device,
                        `Konum: ${session.location}\nIP: ${session.ip}\nSon Aktivite: ${session.lastActive}`,
                        session.current
                          ? [{ text: 'Tamam' }]
                          : [
                              { text: 'Tamam' },
                              { text: 'Oturumu Sonlandır', style: 'destructive', onPress: () => handleEndSession(session.id) },
                            ]
                      );
                    }}
                  >
                    <View style={styles.sessionInfo}>
                      <View style={styles.sessionHeader}>
                        <View style={[styles.sessionIconBox, {
                          backgroundColor: session.current ? 'rgba(75, 48, 184, 0.15)' : 'rgba(156, 163, 175, 0.1)'
                        }]}>
                          <Ionicons
                            name={getDeviceIcon(session.deviceType)}
                            size={18}
                            color={session.current ? colors.brand[400] : colors.textMuted}
                          />
                        </View>
                        <View style={styles.sessionTextContainer}>
                          <View style={styles.sessionTitleRow}>
                            <Text style={[styles.sessionDevice, { color: colors.text }]}>{session.device}</Text>
                            {session.current && (
                              <View style={[styles.currentBadge, {
                                backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)'
                              }]}>
                                <Text style={[styles.currentBadgeText, { color: colors.brand[400] }]}>Bu Cihaz</Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.sessionDetails, { color: colors.textMuted }]}>
                            {session.location} • {session.lastActive}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {!session.current && (
                      <TouchableOpacity
                        style={styles.endSessionButton}
                        onPress={() => handleEndSession(session.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="close-circle" size={24} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                  {index < sessions.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />
                  )}
                </View>
              ))
            )}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Tehlikeli Bölge</Text>
          <View style={[styles.dangerCard, {
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.03)',
            borderColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.2)'
          }]}>
            <TouchableOpacity style={styles.dangerRow} activeOpacity={0.7} onPress={() => setShowDeleteAccountModal(true)}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Ionicons name="trash" size={20} color={colors.error} />
                </View>
                <View>
                  <Text style={[styles.dangerTitle, { color: colors.error }]}>Hesabı Sil</Text>
                  <Text style={[styles.dangerDescription, { color: colors.textMuted }]}>Tüm verileriniz kalıcı olarak silinir</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Password Change Modal */}
      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Şifre Değiştir</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Current Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Mevcut Şifre</Text>
                <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5' }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrentPassword}
                    placeholder="Mevcut şifreniz"
                    placeholderTextColor={colors.textMuted}
                  />
                  <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                    <Ionicons name={showCurrentPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Yeni Şifre</Text>
                <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5' }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    placeholder="Yeni şifreniz"
                    placeholderTextColor={colors.textMuted}
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                {newPassword.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={[styles.strengthBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5' }]}>
                      <View style={[styles.strengthFill, { width: `${passwordStrength.width}%`, backgroundColor: passwordStrength.color }]} />
                    </View>
                    <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>{passwordStrength.label}</Text>
                  </View>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Yeni Şifre (Tekrar)</Text>
                <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5' }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="Yeni şifreyi tekrar girin"
                    placeholderTextColor={colors.textMuted}
                  />
                  {confirmPassword.length > 0 && (
                    <Ionicons
                      name={newPassword === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={newPassword === confirmPassword ? colors.success : colors.error}
                    />
                  )}
                </View>
              </View>

              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.primaryButton, passwordLoading && styles.buttonDisabled]}
                onPress={handleChangePassword}
                disabled={passwordLoading}
              >
                <LinearGradient
                  colors={['#4B30B8', '#6366F1']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {passwordLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Şifreyi Değiştir</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2FA Setup Modal */}
      <Modal visible={show2FAModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>2FA Kurulumu</Text>
              <TouchableOpacity onPress={() => setShow2FAModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalDescription, { color: colors.textMuted }]}>
                Hesabınızı korumak için bir doğrulama yöntemi seçin
              </Text>

              {/* Method Selection */}
              <TouchableOpacity
                style={[styles.methodCard, {
                  backgroundColor: twoFAMethod === 'app' ? 'rgba(75, 48, 184, 0.1)' : (isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5'),
                  borderColor: twoFAMethod === 'app' ? colors.brand[400] : (isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5')
                }]}
                onPress={() => setTwoFAMethod('app')}
              >
                <View style={[styles.methodIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Ionicons name="apps" size={24} color="#6366F1" />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodTitle, { color: colors.text }]}>Authenticator Uygulaması</Text>
                  <Text style={[styles.methodDesc, { color: colors.textMuted }]}>Google Authenticator, Authy vb.</Text>
                </View>
                <Ionicons
                  name={twoFAMethod === 'app' ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={twoFAMethod === 'app' ? colors.brand[400] : colors.textMuted}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodCard, {
                  backgroundColor: twoFAMethod === 'sms' ? 'rgba(75, 48, 184, 0.1)' : (isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5'),
                  borderColor: twoFAMethod === 'sms' ? colors.brand[400] : (isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5')
                }]}
                onPress={() => setTwoFAMethod('sms')}
              >
                <View style={[styles.methodIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="chatbubble-ellipses" size={24} color="#10B981" />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodTitle, { color: colors.text }]}>SMS Doğrulama</Text>
                  <Text style={[styles.methodDesc, { color: colors.textMuted }]}>Telefon numaranıza kod gönderilir</Text>
                </View>
                <Ionicons
                  name={twoFAMethod === 'sms' ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={twoFAMethod === 'sms' ? colors.brand[400] : colors.textMuted}
                />
              </TouchableOpacity>

              {twoFAMethod === 'app' && (
                <View style={styles.qrSection}>
                  <View style={[styles.qrPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                    <Ionicons name="qr-code" size={100} color={colors.textMuted} />
                  </View>
                  <Text style={[styles.qrHint, { color: colors.textMuted }]}>
                    Authenticator uygulamasıyla QR kodu taratın
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setShow2FAModal(false);
                  setShow2FAVerifyModal(true);
                }}
              >
                <LinearGradient
                  colors={['#4B30B8', '#6366F1']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>Devam Et</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2FA Verify Modal */}
      <Modal visible={show2FAVerifyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Kodu Doğrula</Text>
              <TouchableOpacity onPress={() => setShow2FAVerifyModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalDescription, { color: colors.textMuted }]}>
                {twoFAMethod === 'app'
                  ? 'Authenticator uygulamasındaki 6 haneli kodu girin'
                  : 'Telefonunuza gönderilen 6 haneli kodu girin'}
              </Text>

              <View style={[styles.codeInputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                <TextInput
                  style={[styles.codeInput, { color: colors.text }]}
                  value={verificationCode}
                  onChangeText={(text) => setVerificationCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="000000"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, twoFALoading && styles.buttonDisabled]}
                onPress={handle2FAVerify}
                disabled={twoFALoading}
              >
                <LinearGradient
                  colors={['#4B30B8', '#6366F1']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {twoFALoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Doğrula</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Backup Codes Modal */}
      <Modal visible={showBackupCodesModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Yedek Kodlar</Text>
              <TouchableOpacity onPress={() => setShowBackupCodesModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={[styles.warningBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="warning" size={20} color="#F59E0B" />
                <Text style={[styles.warningText, { color: colors.text }]}>
                  Bu kodları güvenli bir yerde saklayın. Her kod yalnızca bir kez kullanılabilir.
                </Text>
              </View>

              <View style={[styles.codesGrid, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                {backupCodes.map((code, index) => (
                  <View key={index} style={styles.codeItem}>
                    <Text style={[styles.codeNumber, { color: colors.textMuted }]}>{index + 1}.</Text>
                    <Text style={[styles.codeText, { color: colors.text }]}>{code}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.copyButton} onPress={copyBackupCodes}>
                <Ionicons name="copy-outline" size={20} color={colors.brand[400]} />
                <Text style={[styles.copyButtonText, { color: colors.brand[400] }]}>Kodları Kopyala</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setShowBackupCodesModal(false)}
              >
                <LinearGradient
                  colors={['#4B30B8', '#6366F1']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>Tamam</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={showDeleteAccountModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.error }]}>Hesabı Sil</Text>
              <TouchableOpacity onPress={() => setShowDeleteAccountModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={[styles.dangerWarning, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Ionicons name="alert-circle" size={40} color="#EF4444" />
                <Text style={[styles.dangerWarningTitle, { color: colors.error }]}>Bu işlem geri alınamaz!</Text>
                <Text style={[styles.dangerWarningText, { color: colors.textMuted }]}>
                  Hesabınızı sildiğinizde tüm verileriniz, etkinlikleriniz ve teklifleriniz kalıcı olarak silinecektir.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                  Onaylamak için <Text style={{ fontWeight: '700', color: colors.error }}>HESABIMI SİL</Text> yazın
                </Text>
                <View style={[styles.inputContainer, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                  borderColor: deleteConfirmText === 'HESABIMI SİL' ? colors.error : (isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5')
                }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={deleteConfirmText}
                    onChangeText={setDeleteConfirmText}
                    placeholder="HESABIMI SİL"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.deleteButton, deleteConfirmText !== 'HESABIMI SİL' && styles.buttonDisabled]}
                onPress={handleDeleteAccount}
                disabled={deleteConfirmText !== 'HESABIMI SİL'}
              >
                <Text style={styles.deleteButtonText}>Hesabımı Kalıcı Olarak Sil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteAccountModal(false);
                  setDeleteConfirmText('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Vazgeç</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  endAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  rowInfo: {
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 74,
  },
  subRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subRowText: {
    fontSize: 14,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sessionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionTextContainer: {
    flex: 1,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionDevice: {
    fontSize: 15,
    fontWeight: '500',
  },
  currentBadge: {
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  sessionDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  endSessionButton: {
    padding: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
  },
  dangerCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    overflow: 'hidden',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  dangerDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
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
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 16,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 14,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  methodDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  qrSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  qrHint: {
    fontSize: 13,
    textAlign: 'center',
  },
  codeInputContainer: {
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  codeInput: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
    paddingVertical: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  codesGrid: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  codeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  codeNumber: {
    fontSize: 12,
    width: 20,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 8,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dangerWarning: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  dangerWarningTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dangerWarningText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
