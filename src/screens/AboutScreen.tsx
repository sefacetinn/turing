import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';

export function AboutScreen() {
  const navigation = useNavigation<any>();

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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hakkında</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Logo & App Info */}
        <View style={styles.appInfoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <LinearGradient
              colors={['#9333ea', '#7c3aed', '#6366f1']}
              style={styles.logoBox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="musical-notes" size={40} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>TURING</Text>
          <Text style={styles.appTagline}>Etkinlik & Müzik Sektörü Platformu</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Versiyon 1.0.0</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              Turing, etkinlik organizatörlerini ve hizmet sağlayıcılarını bir araya getiren yenilikçi bir platformdur.
              Konserler, festivaller, düğünler ve kurumsal etkinlikler için ihtiyacınız olan tüm hizmetleri tek bir yerden bulun.
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>10K+</Text>
              <Text style={styles.statLabel}>Aktif Kullanıcı</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5K+</Text>
              <Text style={styles.statLabel}>Hizmet Sağlayıcı</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>15K+</Text>
              <Text style={styles.statLabel}>Etkinlik</Text>
            </View>
          </View>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ekibimiz</Text>
          <View style={styles.teamCard}>
            <Text style={styles.teamText}>
              Turing, müzik ve etkinlik sektöründe deneyimli bir ekip tarafından İstanbul'da geliştirilmektedir.
              Amacımız, sektörün dijital dönüşümüne öncülük etmek ve en iyi kullanıcı deneyimini sunmaktır.
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={colors.brand[400]} />
              <Text style={styles.locationText}>İstanbul, Türkiye</Text>
            </View>
          </View>
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bizi Takip Edin</Text>
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
          <Text style={styles.sectionTitle}>Yasal</Text>
          <View style={styles.legalCard}>
            {legalLinks.map((link, index) => (
              <View key={link.id}>
                <TouchableOpacity style={styles.legalRow} activeOpacity={0.7}>
                  <View style={styles.legalLeft}>
                    <Ionicons name={link.icon as any} size={20} color={colors.zinc[500]} />
                    <Text style={styles.legalText}>{link.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.zinc[600]} />
                </TouchableOpacity>
                {index < legalLinks.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İletişim</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity style={styles.contactRow} activeOpacity={0.7}>
              <View style={styles.contactLeft}>
                <View style={[styles.contactIcon, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                  <Ionicons name="globe-outline" size={20} color={colors.brand[400]} />
                </View>
                <View>
                  <Text style={styles.contactLabel}>Web Sitesi</Text>
                  <Text style={styles.contactValue}>www.turing.app</Text>
                </View>
              </View>
              <Ionicons name="open-outline" size={18} color={colors.zinc[600]} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.contactRow} activeOpacity={0.7}>
              <View style={styles.contactLeft}>
                <View style={[styles.contactIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Ionicons name="mail-outline" size={20} color={colors.info} />
                </View>
                <View>
                  <Text style={styles.contactLabel}>E-posta</Text>
                  <Text style={styles.contactValue}>info@turing.app</Text>
                </View>
              </View>
              <Ionicons name="open-outline" size={18} color={colors.zinc[600]} />
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
                  <Text style={styles.rateTitle}>Uygulamayı Değerlendir</Text>
                  <Text style={styles.rateDescription}>Fikirleriniz bizim için önemli</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.brand[400]} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Turing. Tüm hakları saklıdır.
          </Text>
          <Text style={styles.footerSubtext}>
            Made with ❤️ in Istanbul
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
    color: colors.text,
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
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 2,
  },
  appTagline: {
    fontSize: 14,
    color: colors.zinc[400],
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
    color: colors.zinc[400],
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.zinc[400],
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
    color: colors.zinc[300],
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
    color: colors.zinc[500],
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
    color: colors.zinc[400],
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
    color: colors.zinc[500],
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
    color: colors.text,
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
    color: colors.zinc[500],
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
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
    color: colors.text,
  },
  rateDescription: {
    fontSize: 12,
    color: colors.zinc[500],
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: colors.zinc[600],
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.zinc[600],
    marginTop: 4,
  },
});
