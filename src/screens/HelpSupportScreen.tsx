import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const colors = defaultColors;

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface Category {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export function HelpSupportScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const categories: Category[] = [
    { id: 'getting_started', title: 'Başlangıç', icon: 'rocket', color: 'rgba(147, 51, 234, 0.15)' },
    { id: 'account', title: 'Hesap', icon: 'person', color: 'rgba(59, 130, 246, 0.15)' },
    { id: 'payments', title: 'Ödemeler', icon: 'card', color: 'rgba(16, 185, 129, 0.15)' },
    { id: 'events', title: 'Etkinlikler', icon: 'calendar', color: 'rgba(245, 158, 11, 0.15)' },
    { id: 'offers', title: 'Teklifler', icon: 'pricetags', color: 'rgba(236, 72, 153, 0.15)' },
    { id: 'technical', title: 'Teknik', icon: 'settings', color: 'rgba(99, 102, 241, 0.15)' },
  ];

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'Nasıl teklif alabilirim?',
      answer: 'Bir etkinlik oluşturun, ihtiyacınız olan hizmet kategorisini seçin ve "Teklif Al" butonuna tıklayın. İlgili hizmet sağlayıcılar size teklif gönderecektir.',
    },
    {
      id: '2',
      question: 'Ödeme nasıl yapılır?',
      answer: 'Teklifi onayladıktan sonra, güvenli ödeme sayfasına yönlendirilirsiniz. Kredi kartı, banka kartı veya havale/EFT ile ödeme yapabilirsiniz.',
    },
    {
      id: '3',
      question: 'Etkinliğimi iptal edebilir miyim?',
      answer: 'Evet, etkinliğinizi "Etkinliklerim" sayfasından iptal edebilirsiniz. İptal koşulları, hizmet sağlayıcının politikasına göre değişebilir.',
    },
    {
      id: '4',
      question: 'Sağlayıcı modu nedir?',
      answer: 'Sağlayıcı modu, hizmet sunmak isteyen kullanıcılar içindir. Profil sayfasından modu değiştirerek, gelen teklif taleplerine yanıt verebilirsiniz.',
    },
    {
      id: '5',
      question: 'İletişim bilgilerimi nasıl değiştiririm?',
      answer: 'Profil sayfasından "Hesap Bilgileri" seçeneğine tıklayarak e-posta, telefon ve diğer bilgilerinizi güncelleyebilirsiniz.',
    },
  ];

  const handleContact = (type: string) => {
    switch (type) {
      case 'email':
        Linking.openURL('mailto:destek@turing.app');
        break;
      case 'phone':
        Linking.openURL('tel:+902121234567');
        break;
      case 'whatsapp':
        Linking.openURL('https://wa.me/902121234567');
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Yardım & Destek</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchSection}>
          <View style={[styles.searchContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.inputBorder }]}>
            <Ionicons name="search" size={20} color={colors.zinc[500]} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Nasıl yardımcı olabiliriz?"
              placeholderTextColor={colors.zinc[600]}
            />
          </View>
        </View>

        {/* Quick Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Hızlı İletişim</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact('email')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#9333ea', '#7c3aed']}
                style={styles.contactIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="mail" size={22} color="white" />
              </LinearGradient>
              <Text style={[styles.contactLabel, { color: colors.textMuted }]}>E-posta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact('phone')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#059669', '#34d399']}
                style={styles.contactIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="call" size={22} color="white" />
              </LinearGradient>
              <Text style={[styles.contactLabel, { color: colors.textMuted }]}>Telefon</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact('whatsapp')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#25d366', '#128c7e']}
                style={styles.contactIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="logo-whatsapp" size={22} color="white" />
              </LinearGradient>
              <Text style={[styles.contactLabel, { color: colors.textMuted }]}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Kategoriler</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border, ...(isDark ? {} : helpers.getShadow('sm')) }]}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Ionicons name={category.icon} size={22} color={colors.brand[400]} />
                </View>
                <Text style={[styles.categoryTitle, { color: colors.text }]}>{category.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Sık Sorulan Sorular</Text>
          <View style={[styles.faqContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border, ...(isDark ? {} : helpers.getShadow('sm')) }]}>
            {faqs.map((faq, index) => (
              <View key={faq.id}>
                <TouchableOpacity
                  style={styles.faqItem}
                  onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                  <Ionicons
                    name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.zinc[500]}
                  />
                </TouchableOpacity>
                {expandedFAQ === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={[styles.faqAnswerText, { color: colors.textMuted }]}>{faq.answer}</Text>
                  </View>
                )}
                {index < faqs.length - 1 && <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />}
              </View>
            ))}
          </View>
        </View>

        {/* Live Chat */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.liveChatCard} activeOpacity={0.8}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.liveChatGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.liveChatContent}>
                <View style={styles.liveChatIcon}>
                  <Ionicons name="chatbubbles" size={28} color="white" />
                </View>
                <View style={styles.liveChatInfo}>
                  <Text style={styles.liveChatTitle}>Canlı Destek</Text>
                  <Text style={styles.liveChatDescription}>
                    Uzmanlarımızla anında görüşün
                  </Text>
                </View>
              </View>
              <View style={styles.liveChatStatus}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Çevrimiçi</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Kaynaklar</Text>
          <View style={[styles.resourcesCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border, ...(isDark ? {} : helpers.getShadow('sm')) }]}>
            <TouchableOpacity style={styles.resourceRow} activeOpacity={0.7}>
              <View style={styles.resourceLeft}>
                <Ionicons name="book-outline" size={20} color={colors.brand[400]} />
                <Text style={[styles.resourceText, { color: colors.text }]}>Kullanım Kılavuzu</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.zinc[600]} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />
            <TouchableOpacity style={styles.resourceRow} activeOpacity={0.7}>
              <View style={styles.resourceLeft}>
                <Ionicons name="play-circle-outline" size={20} color={colors.brand[400]} />
                <Text style={[styles.resourceText, { color: colors.text }]}>Video Eğitimler</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.zinc[600]} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />
            <TouchableOpacity style={styles.resourceRow} activeOpacity={0.7}>
              <View style={styles.resourceLeft}>
                <Ionicons name="newspaper-outline" size={20} color={colors.brand[400]} />
                <Text style={[styles.resourceText, { color: colors.text }]}>Blog Yazıları</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.zinc[600]} />
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
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
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
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  faqContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 13,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
  },
  liveChatCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  liveChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  liveChatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  liveChatIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveChatInfo: {},
  liveChatTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
  liveChatDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  liveChatStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  resourcesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  resourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resourceText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
