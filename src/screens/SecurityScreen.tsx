import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export function SecurityScreen() {
  const navigation = useNavigation<any>();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const [sessions] = useState<Session[]>([
    { id: '1', device: 'iPhone 15 Pro', location: 'İstanbul, TR', lastActive: 'Şu an aktif', current: true },
    { id: '2', device: 'MacBook Pro', location: 'İstanbul, TR', lastActive: '2 saat önce', current: false },
    { id: '3', device: 'iPad Air', location: 'Ankara, TR', lastActive: '3 gün önce', current: false },
  ]);

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleEndSession = (sessionId: string) => {
    Alert.alert(
      'Oturumu Sonlandır',
      'Bu cihazdan oturumu kapatmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sonlandır', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const handleEndAllSessions = () => {
    Alert.alert(
      'Tüm Oturumları Sonlandır',
      'Bu cihaz hariç tüm oturumları kapatmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Tümünü Sonlandır', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Güvenlik</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Şifre</Text>
          <TouchableOpacity style={styles.card} onPress={handleChangePassword} activeOpacity={0.7}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                  <Ionicons name="key" size={20} color={colors.brand[400]} />
                </View>
                <View>
                  <Text style={styles.rowTitle}>Şifre Değiştir</Text>
                  <Text style={styles.rowDescription}>Son değişiklik: 3 ay önce</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.zinc[600]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Two-Factor Authentication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İki Faktörlü Doğrulama</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.success} />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>2FA Etkinleştir</Text>
                  <Text style={styles.rowDescription}>SMS veya uygulama ile doğrulama</Text>
                </View>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: colors.zinc[700], true: colors.brand[600] }}
                thumbColor={twoFactorEnabled ? colors.brand[400] : colors.zinc[400]}
              />
            </View>

            {twoFactorEnabled && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.subRow} activeOpacity={0.7}>
                  <Text style={styles.subRowText}>Yedek Kodları Göster</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.zinc[600]} />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.subRow} activeOpacity={0.7}>
                  <Text style={styles.subRowText}>Doğrulama Yöntemini Değiştir</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.zinc[600]} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Biometric */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biyometrik Giriş</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Ionicons name="finger-print" size={20} color={colors.info} />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>Face ID / Touch ID</Text>
                  <Text style={styles.rowDescription}>Biyometrik ile hızlı giriş</Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: colors.zinc[700], true: colors.brand[600] }}
                thumbColor={biometricEnabled ? colors.brand[400] : colors.zinc[400]}
              />
            </View>
          </View>
        </View>

        {/* Login Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giriş Uyarıları</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="alert-circle" size={20} color={colors.warning} />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>Yeni Giriş Bildirimi</Text>
                  <Text style={styles.rowDescription}>Yeni cihazdan giriş yapıldığında bildir</Text>
                </View>
              </View>
              <Switch
                value={loginAlerts}
                onValueChange={setLoginAlerts}
                trackColor={{ false: colors.zinc[700], true: colors.brand[600] }}
                thumbColor={loginAlerts ? colors.brand[400] : colors.zinc[400]}
              />
            </View>
          </View>
        </View>

        {/* Active Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktif Oturumlar</Text>
            <TouchableOpacity onPress={handleEndAllSessions}>
              <Text style={styles.endAllText}>Tümünü Sonlandır</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {sessions.map((session, index) => (
              <View key={session.id}>
                <View style={styles.sessionRow}>
                  <View style={styles.sessionInfo}>
                    <View style={styles.sessionHeader}>
                      <Ionicons
                        name={
                          session.device.includes('iPhone')
                            ? 'phone-portrait'
                            : session.device.includes('Mac')
                            ? 'laptop'
                            : 'tablet-portrait'
                        }
                        size={20}
                        color={session.current ? colors.brand[400] : colors.zinc[500]}
                      />
                      <Text style={styles.sessionDevice}>{session.device}</Text>
                      {session.current && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Bu Cihaz</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.sessionDetails}>
                      {session.location} • {session.lastActive}
                    </Text>
                  </View>
                  {!session.current && (
                    <TouchableOpacity
                      style={styles.endSessionButton}
                      onPress={() => handleEndSession(session.id)}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
                {index < sessions.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tehlikeli Bölge</Text>
          <View style={styles.dangerCard}>
            <TouchableOpacity style={styles.dangerRow} activeOpacity={0.7}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Ionicons name="trash" size={20} color={colors.error} />
                </View>
                <View>
                  <Text style={styles.dangerTitle}>Hesabı Sil</Text>
                  <Text style={styles.dangerDescription}>Tüm verileriniz kalıcı olarak silinir</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
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
    color: colors.text,
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
    color: colors.zinc[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  endAllText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.error,
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
    color: colors.text,
  },
  rowDescription: {
    fontSize: 12,
    color: colors.zinc[500],
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
  subRowText: {
    fontSize: 14,
    color: colors.zinc[400],
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
    gap: 10,
  },
  sessionDevice: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  currentBadge: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.brand[400],
  },
  sessionDetails: {
    fontSize: 12,
    color: colors.zinc[500],
    marginTop: 4,
    marginLeft: 30,
  },
  endSessionButton: {
    padding: 4,
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
    color: colors.error,
  },
  dangerDescription: {
    fontSize: 12,
    color: colors.zinc[500],
    marginTop: 2,
  },
});
