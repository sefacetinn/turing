import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
  Share,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import * as Haptics from 'expo-haptics';

export function AboutScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();

  // Animated values
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleOpenLink = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: 'Turing - Etkinlik & Müzik Sektörü Platformu\n\nKonserler, festivaller ve etkinlikler için en iyi hizmetleri keşfet!\n\nhttps://turing.app/download',
        title: 'Turing',
      });
    } catch (error) {
      console.log(error);
    }
  };

  const socialLinks = [
    { id: 'instagram', icon: 'logo-instagram', url: 'https://instagram.com/turingapp', color: '#E4405F', label: 'Instagram' },
    { id: 'twitter', icon: 'logo-twitter', url: 'https://twitter.com/turingapp', color: '#1DA1F2', label: 'Twitter' },
    { id: 'linkedin', icon: 'logo-linkedin', url: 'https://linkedin.com/company/turingapp', color: '#0A66C2', label: 'LinkedIn' },
  ];

  const features = [
    { icon: 'search', title: 'Kolay Keşif', desc: 'Binlerce hizmet sağlayıcı' },
    { icon: 'shield-checkmark', title: 'Güvenli Ödeme', desc: 'SSL korumalı işlemler' },
    { icon: 'chatbubbles', title: 'Anlık İletişim', desc: 'Doğrudan mesajlaşma' },
    { icon: 'star', title: 'Değerlendirmeler', desc: 'Gerçek kullanıcı yorumları' },
  ];

  const legalLinks = [
    { id: 'terms', title: 'Kullanım Şartları', icon: 'document-text-outline' },
    { id: 'privacy', title: 'Gizlilik Politikası', icon: 'shield-outline' },
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
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={22} color={colors.brand[400]} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Logo & App Info */}
        <View style={styles.heroSection}>
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={isDark ? ['rgba(75, 48, 184, 0.3)', 'rgba(99, 102, 241, 0.2)'] : ['rgba(75, 48, 184, 0.15)', 'rgba(99, 102, 241, 0.1)']}
              style={styles.logoGlow}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Image
              source={require('../../assets/turing-icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          <Text style={[styles.appName, { color: colors.text }]}>TURING</Text>
          <Text style={[styles.appTagline, { color: colors.textMuted }]}>
            Etkinlik & Müzik Sektörü Platformu
          </Text>

          <View style={styles.versionRow}>
            <View style={[styles.versionBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
              <Text style={[styles.versionText, { color: colors.textMuted }]}>v1.0.0</Text>
            </View>
            <View style={[styles.buildBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
              <View style={styles.buildDot} />
              <Text style={[styles.buildText, { color: '#10B981' }]}>Güncel</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.brand[400] }]}>10K+</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Kullanıcı</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>5K+</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sağlayıcı</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>15K+</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Etkinlik</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Özellikler</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={[
                  styles.featureCard,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground,
                    borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border,
                  },
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }]}>
                  <Ionicons name={feature.icon as any} size={20} color={colors.brand[400]} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.textMuted }]}>{feature.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Takip Edin</Text>
          <View style={[
            styles.socialCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border,
            }
          ]}>
            {socialLinks.map((social, index) => (
              <View key={social.id}>
                <TouchableOpacity
                  style={styles.socialRow}
                  onPress={() => handleOpenLink(social.url)}
                  activeOpacity={0.7}
                >
                  <View style={styles.socialLeft}>
                    <View style={[styles.socialIcon, { backgroundColor: `${social.color}15` }]}>
                      <Ionicons name={social.icon as any} size={20} color={social.color} />
                    </View>
                    <Text style={[styles.socialLabel, { color: colors.text }]}>{social.label}</Text>
                  </View>
                  <Ionicons name="open-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
                {index < socialLinks.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>İletişim</Text>
          <View style={[
            styles.contactCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border,
            }
          ]}>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => handleOpenLink('mailto:info@turing.app')}
              activeOpacity={0.7}
            >
              <View style={styles.contactLeft}>
                <View style={[styles.contactIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <Ionicons name="mail" size={18} color="#3B82F6" />
                </View>
                <Text style={[styles.contactText, { color: colors.text }]}>info@turing.app</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]} />
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => handleOpenLink('https://turing.app')}
              activeOpacity={0.7}
            >
              <View style={styles.contactLeft}>
                <View style={[styles.contactIcon, { backgroundColor: 'rgba(75, 48, 184, 0.1)' }]}>
                  <Ionicons name="globe" size={18} color={colors.brand[400]} />
                </View>
                <Text style={[styles.contactText, { color: colors.text }]}>www.turing.app</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Rate App */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.rateCard}
            activeOpacity={0.8}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <LinearGradient
              colors={['#4B30B8', '#6366F1']}
              style={styles.rateGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.rateLeft}>
                <View style={styles.rateStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons key={star} name="star" size={16} color="#FBBF24" />
                  ))}
                </View>
                <Text style={styles.rateTitle}>Uygulamayı Değerlendir</Text>
                <Text style={styles.rateDesc}>App Store'da yorum bırakın</Text>
              </View>
              <View style={styles.rateArrow}>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Yasal</Text>
          <View style={[
            styles.legalCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border,
            }
          ]}>
            {legalLinks.map((link, index) => (
              <View key={link.id}>
                <TouchableOpacity style={styles.legalRow} activeOpacity={0.7}>
                  <View style={styles.legalLeft}>
                    <Ionicons name={link.icon as any} size={18} color={colors.textMuted} />
                    <Text style={[styles.legalText, { color: colors.text }]}>{link.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
                {index < legalLinks.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLocation}>
            <Ionicons name="location" size={14} color={colors.textMuted} />
            <Text style={[styles.footerLocationText, { color: colors.textMuted }]}>İstanbul, Türkiye</Text>
          </View>
          <Text style={[styles.footerCopyright, { color: colors.textMuted }]}>
            © 2025 Turing. Tüm hakları saklıdır.
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
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logoGlow: {
    position: 'absolute',
    top: -16,
    left: -16,
    right: -16,
    bottom: -16,
    borderRadius: 40,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 3,
  },
  appTagline: {
    fontSize: 14,
    marginTop: 6,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  buildBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  buildDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  buildText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Stats
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
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

  // Features
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureCard: {
    width: '48%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
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
    justifyContent: 'space-between',
    padding: 14,
  },
  socialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },

  // Contact
  contactCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Rate
  rateCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  rateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  rateLeft: {},
  rateStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  rateDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  rateArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Legal
  legalCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  legalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legalText: {
    fontSize: 15,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  footerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerLocationText: {
    fontSize: 12,
  },
  footerCopyright: {
    fontSize: 12,
  },
});
