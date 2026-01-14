import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const colors = defaultColors;

export function AboutScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const socialLinks = [
    { id: 'instagram', icon: 'logo-instagram', url: 'https://instagram.com/turingapp', color: '#E4405F' },
    { id: 'twitter', icon: 'logo-twitter', url: 'https://twitter.com/turingapp', color: '#1DA1F2' },
    { id: 'linkedin', icon: 'logo-linkedin', url: 'https://linkedin.com/company/turingapp', color: '#0A66C2' },
    { id: 'youtube', icon: 'logo-youtube', url: 'https://youtube.com/@turingapp', color: '#FF0000' },
  ];

  const legalLinks = [
    { id: 'terms', title: 'Kullanım Şartları', icon: 'document-text-outline' },
    { id: 'privacy', title: 'Gizlilik Politikası', icon: 'shield-outline' },
    { id: 'cookies', title: 'Çerez Politikası', icon: 'information-circle-outline' },
    { id: 'licenses', title: 'Açık Kaynak Lisansları', icon: 'code-slash-outline' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Hakkında</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Logo & App Info */}
        <View style={styles.appInfoSection}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoGlow, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.25)' : 'rgba(147, 51, 234, 0.15)' }]} />
            <Image
              source={require('../../assets/turing-icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>TURING</Text>
          <Text style={[styles.appTagline, { color: colors.textMuted }]}>Etkinlik & Müzik Sektörü Platformu</Text>
          <View style={[styles.versionBadge, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }]}>
            <Text style={[styles.versionText, { color: colors.textMuted }]}>Versiyon 1.0.0</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={[styles.descriptionCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border, ...(isDark ? {} : helpers.getShadow('sm')) }]}>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
              Turing, etkinlik organizatörlerini ve hizmet sağlayıcılarını bir araya getiren yenilikçi bir platformdur.
              Konserler, festivaller, düğünler ve kurumsal etkinlikler için ihtiyacınız olan tüm hizmetleri tek bir yerden bulun.
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }]}>
              <Text style={styles.statNumber}>10K+</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Aktif Kullanıcı</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }]}>
              <Text style={styles.statNumber}>5K+</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Hizmet Sağlayıcı</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }]}>
              <Text style={styles.statNumber}>15K+</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Etkinlik</Text>
            </View>
          </View>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Ekibimiz</Text>
          <View style={[styles.teamCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border, ...(isDark ? {} : helpers.getShadow('sm')) }]}>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
              Turing, müzik ve etkinlik sektöründe deneyimli bir ekip tarafından İstanbul'da geliştirilmektedir.
              Amacımız, sektörün dijital dönüşümüne öncülük etmek ve en iyi kullanıcı deneyimini sunmaktır.
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={colors.brand[400]} />
              <Text style={[styles.locationText, { color: colors.textMuted }]}>İstanbul, Türkiye</Text>
            </View>
          </View>
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Bizi Takip Edin</Text>
          <View style={styles.socialRow}>
            {socialLinks.map((social) => (
              <TouchableOpacity
                key={social.id}
                style={styles.socialButton}
                onPress={() => handleOpenLink(social.url)}
                activeOpacity={0.7}
              >
                <View style={[styles.socialIcon, { backgroundColor: `${social.color}20` }]}>
                  <Ionicons name={social.icon as any} size={24} color={social.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Yasal</Text>
          <View style={[styles.legalCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border, ...(isDark ? {} : helpers.getShadow('sm')) }]}>
            {legalLinks.map((link, index) => (
              <View key={link.id}>
                <TouchableOpacity style={styles.legalRow} activeOpacity={0.7}>
                  <View style={styles.legalLeft}>
                    <Ionicons name={link.icon as any} size={20} color={colors.textMuted} />
                    <Text style={[styles.legalText, { color: colors.text }]}>{link.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
                {index < legalLinks.length - 1 && <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />}
              </View>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>İletişim</Text>
          <View style={[styles.contactCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border, ...(isDark ? {} : helpers.getShadow('sm')) }]}>
            <TouchableOpacity style={styles.contactRow} activeOpacity={0.7}>
              <View style={styles.contactLeft}>
                <View style={[styles.contactIcon, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                  <Ionicons name="globe-outline" size={20} color={colors.brand[400]} />
                </View>
                <View>
                  <Text style={[styles.contactLabel, { color: colors.textMuted }]}>Web Sitesi</Text>
                  <Text style={[styles.contactValue, { color: colors.text }]}>www.turing.app</Text>
                </View>
              </View>
              <Ionicons name="open-outline" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />
            <TouchableOpacity style={styles.contactRow} activeOpacity={0.7}>
              <View style={styles.contactLeft}>
                <View style={[styles.contactIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Ionicons name="mail-outline" size={20} color={colors.info} />
                </View>
                <View>
                  <Text style={[styles.contactLabel, { color: colors.textMuted }]}>E-posta</Text>
                  <Text style={[styles.contactValue, { color: colors.text }]}>info@turing.app</Text>
                </View>
              </View>
              <Ionicons name="open-outline" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Rate App */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.rateCard} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(147, 51, 234, 0.1)', 'rgba(99, 102, 241, 0.1)']}
              style={styles.rateGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.rateContent}>
                <Ionicons name="star" size={28} color="#fbbf24" />
                <View style={styles.rateInfo}>
                  <Text style={[styles.rateTitle, { color: colors.text }]}>Uygulamayı Değerlendir</Text>
                  <Text style={[styles.rateDescription, { color: colors.textMuted }]}>Fikirleriniz bizim için önemli</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.brand[400]} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            © 2025 Turing. Tüm hakları saklıdır.
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>
            Made with love in Istanbul
          </Text>
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
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  logoGlow: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 40,
    backgroundColor: 'rgba(147, 51, 234, 0.25)',
  },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 88,
    height: 88,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  appTagline: {
    fontSize: 14,
    marginTop: 4,
  },
  versionBadge: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  versionText: {
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  descriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.brand[400],
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  teamCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  teamText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {},
  socialIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  legalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legalText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
  },
  contactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: 12,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  rateCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  rateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
    borderRadius: 16,
  },
  rateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rateInfo: {},
  rateTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rateDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
  },
  footerSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});
