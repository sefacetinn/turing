import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import * as Haptics from 'expo-haptics';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region?: string;
}

const languages: Language[] = [
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Türkiye' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', region: 'United States' },
  { code: 'en-gb', name: 'English (UK)', nativeName: 'English', flag: '🇬🇧', region: 'United Kingdom' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Deutschland' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'France' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'España' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', region: 'Italia' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', region: 'Portugal' },
  { code: 'pt-br', name: 'Portuguese (BR)', nativeName: 'Português', flag: '🇧🇷', region: 'Brasil' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Nederland' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', region: 'Polska' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Россия' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', region: 'Україна' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'العربية' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: '日本' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: '한국' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', region: '中国' },
  { code: 'zh-tw', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', region: '台灣' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'भारत' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', region: 'ประเทศไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'Việt Nam' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', region: 'Ελλάδα' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', region: 'Česko' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', region: 'Sverige' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', region: 'Norge' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', region: 'Danmark' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', region: 'Suomi' },
];

const recommendedLanguages = ['tr', 'en', 'de', 'fr', 'es'];

export function LanguageScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('tr');
  const [searchQuery, setSearchQuery] = useState('');
  const [scaleAnims] = useState(() =>
    languages.reduce((acc, lang) => {
      acc[lang.code] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  );

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return languages;
    const query = searchQuery.toLowerCase();
    return languages.filter(
      (lang) =>
        lang.name.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query) ||
        lang.region?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const recommended = useMemo(() => {
    return filteredLanguages.filter((lang) => recommendedLanguages.includes(lang.code));
  }, [filteredLanguages]);

  const others = useMemo(() => {
    return filteredLanguages.filter((lang) => !recommendedLanguages.includes(lang.code));
  }, [filteredLanguages]);

  const handleSelect = (code: string) => {
    if (code === selectedLanguage) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate selection
    Animated.sequence([
      Animated.timing(scaleAnims[code], {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[code], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const language = languages.find((l) => l.code === code);

    Alert.alert(
      'Dil Değiştir',
      `Uygulama dili "${language?.nativeName}" olarak değiştirilsin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Değiştir',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setSelectedLanguage(code);
            setTimeout(() => navigation.goBack(), 500);
          },
        },
      ]
    );
  };

  const renderLanguageItem = (language: Language, isLast: boolean) => {
    const isSelected = selectedLanguage === language.code;

    return (
      <Animated.View
        key={language.code}
        style={{ transform: [{ scale: scaleAnims[language.code] }] }}
      >
        <TouchableOpacity
          style={[
            styles.languageRow,
            !isLast && [styles.rowBorder, { borderBottomColor: colors.borderLight }],
            isSelected && {
              backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.08)',
            },
          ]}
          onPress={() => handleSelect(language.code)}
          activeOpacity={0.7}
        >
          <View style={styles.languageInfo}>
            <Text style={styles.flagEmoji}>{language.flag}</Text>
            <View style={styles.languageTexts}>
              <Text style={[styles.languageName, { color: colors.text }]}>
                {language.nativeName}
              </Text>
              <Text style={[styles.languageEnglish, { color: colors.textSecondary }]}>
                {language.name}
                {language.region && ` · ${language.region}`}
              </Text>
            </View>
          </View>
          {isSelected ? (
            <View style={[styles.checkCircle, { backgroundColor: colors.brand[500] }]}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          ) : (
            <View
              style={[
                styles.radioCircle,
                { borderColor: isDark ? colors.zinc[600] : colors.zinc[300] },
              ]}
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Dil Seçimi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Dil ara..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Current Language */}
        <View style={styles.currentSection}>
          <View
            style={[
              styles.currentCard,
              {
                backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)',
                borderColor: colors.brand[500],
              },
            ]}
          >
            <View style={styles.currentInfo}>
              <Text style={styles.currentFlag}>
                {languages.find((l) => l.code === selectedLanguage)?.flag}
              </Text>
              <View>
                <Text style={[styles.currentLabel, { color: colors.textSecondary }]}>
                  Mevcut Dil
                </Text>
                <Text style={[styles.currentName, { color: colors.text }]}>
                  {languages.find((l) => l.code === selectedLanguage)?.nativeName}
                </Text>
              </View>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={colors.brand[500]} />
          </View>
        </View>

        {/* Recommended Languages */}
        {recommended.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              ÖNERİLEN
            </Text>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  ...(isDark
                    ? {}
                    : {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                      }),
                },
              ]}
            >
              {recommended.map((language, index) =>
                renderLanguageItem(language, index === recommended.length - 1)
              )}
            </View>
          </View>
        )}

        {/* All Languages */}
        {others.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              TÜM DİLLER
            </Text>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  ...(isDark
                    ? {}
                    : {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                      }),
                },
              ]}
            >
              {others.map((language, index) =>
                renderLanguageItem(language, index === others.length - 1)
              )}
            </View>
          </View>
        )}

        {/* No Results */}
        {filteredLanguages.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
              "{searchQuery}" için sonuç bulunamadı
            </Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.infoSection}>
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark ? colors.zinc[800] : colors.zinc[50],
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="information-circle" size={20} color={colors.brand[400]} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Dil değişikliği uygulamanın tüm metinlerini etkiler. Bazı içerikler sadece Türkçe
              olarak sunulmaktadır.
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.brand[500] }]}>
              {languages.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Dil Mevcut</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.success }]}>%95</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Çeviri Oranı</Text>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  currentSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  currentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  currentFlag: {
    fontSize: 32,
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentName: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
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
    padding: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  flagEmoji: {
    fontSize: 28,
  },
  languageTexts: {
    flex: 1,
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
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  noResultsText: {
    fontSize: 15,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    gap: 32,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
});
