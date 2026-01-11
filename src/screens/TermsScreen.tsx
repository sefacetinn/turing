import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

const termsContent = [
  {
    title: '1. Hizmet Kosullari',
    content: `Turing uygulamasini kullanarak asagidaki kosullari kabul etmis sayilirsiniz. Bu platform, etkinlik organizatorleri ile hizmet saglayicilarini bir araya getiren bir pazaryeri hizmeti sunmaktadir.

Kullanicilar, platformu yasal amaclar dogrultusunda kullanmayi, diger kullanicilarin haklarini ihlal etmemeyi ve platformun guvenligini tehlikeye atacak eylemlerden kacinmayi kabul ederler.`,
  },
  {
    title: '2. Hesap Olusturma ve Guvenlik',
    content: `Hesap olustururken dogru ve guncel bilgiler vermeniz gerekmektedir. Hesabinizin guvenliginden siz sorumlusunuz ve sifrenizi baskalaryla paylasmamalisiniz.

Suphe verilecek herhangi bir yetkisiz erisim durumunda derhal bizi bilgilendirmeniz gerekmektedir.`,
  },
  {
    title: '3. Hizmet Saglayici Yukumlulukleri',
    content: `Hizmet saglayicilari, sundukları hizmetlerin kalitesinden ve zamaninda tesliminden sorumludur. Yaniltici bilgi veya gercek disi tanitim yapmak yasaktir.

Hizmet saglayicilari, tum yasal gereklilikleri yerine getirmekle yukumludur.`,
  },
  {
    title: '4. Organizator Yukumlulukleri',
    content: `Etkinlik organizatorleri, etkinlik bilgilerinin dogrulugundan sorumludur. Odemelerin zamaninda yapilmasi ve anlasilan sartlara uyulmasi beklenmektedir.`,
  },
  {
    title: '5. Odeme ve Ucretler',
    content: `Platform uzerinden yapilan islemlerden hizmet bedeli alinabilir. Odeme kosullari ve iade politikalari ayri bir dokumanda detaylandirilmistir.

Tum fiyatlar aksi belirtilmedikce KDV haric olarak gosterilmektedir.`,
  },
  {
    title: '6. Fikri Mulkiyet',
    content: `Turing uygulamasinin tum icerik ve tasarimlari, fikri mulkiyet yasalari kapsaminda korunmaktadir. Izinsiz kullanim yasaktir.`,
  },
  {
    title: '7. Sorumluluk Sinirlamasi',
    content: `Platform, kullanicilar arasi anlasmazliklardan dogrudan sorumlu degildir. Arabuluculuk hizmeti sunulabilir ancak nihai sorumluluk taraflara aittir.`,
  },
  {
    title: '8. Degisiklikler',
    content: `Bu kullanim kosullari onceden haber verilmeksizin degistirilebilir. Onemli degisiklikler kullanicilara bildirilecektir.`,
  },
];

export function TermsScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kullanim Kosullari</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.infoCard, {
          backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.05)',
          borderColor: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.15)'
        }]}>
          <Ionicons name="document-text" size={24} color={colors.brand[400]} />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Kullanim Kosullari</Text>
            <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
              Son guncelleme: 1 Ocak 2024
            </Text>
          </View>
        </View>

        {termsContent.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {section.content}
            </Text>
          </View>
        ))}

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Bu kosullarla ilgili sorulariniz icin destek@turing.app adresine e-posta gonderebilirsiniz.
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
    marginBottom: 24,
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
