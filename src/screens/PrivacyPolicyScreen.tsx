import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

const privacyContent = [
  {
    title: '1. Toplanan Veriler',
    content: `Turing uygulamasi asagidaki verileri toplar:

• Kimlik Bilgileri: Ad, soyad, e-posta adresi, telefon numarasi
• Profil Bilgileri: Profil fotografi, is tanimi, hizmet alanlari
• Konum Verileri: Etkinlik konumlari ve hizmet bolgeleri
• Kullanim Verileri: Uygulama icerisindeki etkilesimleriniz
• Cihaz Bilgileri: Cihaz turu, isletim sistemi, benzersiz tanimlayicilar`,
  },
  {
    title: '2. Verilerin Kullanimi',
    content: `Topladıgimiz veriler asagidaki amaclarla kullanilir:

• Hizmetlerimizi sunmak ve iyilestirmek
• Kullanici deneyimini kisisellestirmek
• Guvenlik ve dolandiricilik onleme
• Yasal yukumlulukleri yerine getirmek
• Istatistiksel analizler yapmak`,
  },
  {
    title: '3. Veri Paylasimi',
    content: `Verileriniz asagidaki durumlar disinda ucuncu taraflarla paylasilmaz:

• Hizmet saglayicilariniz veya organizatorleriniz ile (islem geregi)
• Yasal zorunluluklar
• Sizin acik izniniz ile
• Anonim ve toplu istatistikler`,
  },
  {
    title: '4. Veri Guvenligi',
    content: `Verilerinizin guvenligini saglamak icin:

• SSL/TLS sifreleme kullaniyoruz
• Duzenli guvenlik denetimleri yapiyoruz
• Erisim kontrolu uyguluyoruz
• Verileri guvenli sunucularda sakliyoruz`,
  },
  {
    title: '5. Cerezler ve Izleme',
    content: `Uygulama ve web sitemizde cerezler ve benzer izleme teknolojileri kullanilmaktadir. Bu teknolojiler:

• Oturum yonetimi
• Tercih hatirlama
• Analitik
• Kisisellestirme

amaclaryla kullanilir.`,
  },
  {
    title: '6. Kullanici Haklari',
    content: `KVKK kapsaminda asagidaki haklara sahipsiniz:

• Verilerinize erisim talep etme
• Verilerin duzeltilmesini isteme
• Verilerin silinmesini talep etme
• Veri islemeye itiraz etme
• Veri tasinabilirligi

Bu haklarinizi kullanmak icin destek@turing.app adresine basvurabilirsiniz.`,
  },
  {
    title: '7. Veri Saklama',
    content: `Verileriniz, hizmet sunumu icin gerekli oldugu surece veya yasal gereklilikler dogrultusunda saklanir. Hesabinizi sildiginizde verileriniz 30 gun icinde sistemlerimizden kaldirilir.`,
  },
  {
    title: '8. Politika Degisiklikleri',
    content: `Bu gizlilik politikasi guncellenebilir. Onemli degisiklikler size e-posta ile bildirilecek ve uygulama icerisinde duyurulacaktir.`,
  },
];

export function PrivacyPolicyScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Gizlilik Politikasi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.infoCard, {
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
          borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'
        }]}>
          <Ionicons name="shield-checkmark" size={24} color={colors.success} />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Gizlilik Politikasi</Text>
            <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
              Son guncelleme: 1 Ocak 2024
            </Text>
          </View>
        </View>

        <View style={[styles.summaryCard, {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border
        }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Ozet</Text>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            Turing, kullanici gizliligine onem verir. Verilerinizi yalnizca hizmet sunumu icin toplar, guvenli bir sekilde saklar ve izniniz olmadan ucuncu taraflarla paylasmaz.
          </Text>
        </View>

        {privacyContent.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {section.content}
            </Text>
          </View>
        ))}

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Gizlilik ile ilgili sorulariniz icin veri@turing.app adresine e-posta gonderebilirsiniz.
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
    borderBottomWidth: 1,
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
  content: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
