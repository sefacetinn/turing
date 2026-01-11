import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'tr', name: 'Turkish', nativeName: 'Turkce', flag: 'TR' },
  { code: 'en', name: 'English', nativeName: 'English', flag: 'EN' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: 'DE' },
  { code: 'fr', name: 'French', nativeName: 'Francais', flag: 'FR' },
  { code: 'es', name: 'Spanish', nativeName: 'Espanol', flag: 'ES' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: 'IT' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: 'AR' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: 'RU' },
];

export function LanguageScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('tr');

  const handleSelect = (code: string) => {
    setSelectedLanguage(code);
    // In a real app, this would update the app's language
    setTimeout(() => navigation.goBack(), 300);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Dil Secimi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Uygulama Dili
          </Text>
          <View style={[styles.card, {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            ...(isDark ? {} : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 })
          }]}>
            {languages.map((language, index) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageRow,
                  index < languages.length - 1 && [styles.rowBorder, { borderBottomColor: colors.borderLight }],
                  selectedLanguage === language.code && { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.05)' }
                ]}
                onPress={() => handleSelect(language.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageInfo}>
                  <View style={[styles.flagBadge, { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] }]}>
                    <Text style={[styles.flagText, { color: colors.text }]}>{language.flag}</Text>
                  </View>
                  <View>
                    <Text style={[styles.languageName, { color: colors.text }]}>{language.nativeName}</Text>
                    <Text style={[styles.languageEnglish, { color: colors.textSecondary }]}>{language.name}</Text>
                  </View>
                </View>
                {selectedLanguage === language.code && (
                  <View style={[styles.checkCircle, { backgroundColor: colors.brand[500] }]}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Dil degisikligi uygulamanin tum metinlerini etkiler. Bazi icerikler sadece Turkce olarak sunulmaktadir.
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
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flagBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagText: {
    fontSize: 16,
    fontWeight: '700',
  },
  languageName: {
    fontSize: 15,
    fontWeight: '600',
  },
  languageEnglish: {
    fontSize: 12,
    marginTop: 2,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
