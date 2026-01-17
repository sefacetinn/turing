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

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  region: 'popular' | 'europe' | 'americas' | 'asia' | 'middle_east';
  rate: number; // Rate to TRY (mock)
}

const currencies: Currency[] = [
  // Popular
  { code: 'TRY', name: 'Türk Lirası', symbol: '₺', flag: '🇹🇷', region: 'popular', rate: 1 },
  { code: 'USD', name: 'Amerikan Doları', symbol: '$', flag: '🇺🇸', region: 'popular', rate: 34.25 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', region: 'popular', rate: 37.80 },
  { code: 'GBP', name: 'İngiliz Sterlini', symbol: '£', flag: '🇬🇧', region: 'popular', rate: 44.50 },
  // Europe
  { code: 'CHF', name: 'İsviçre Frangı', symbol: 'Fr', flag: '🇨🇭', region: 'europe', rate: 39.20 },
  { code: 'SEK', name: 'İsveç Kronu', symbol: 'kr', flag: '🇸🇪', region: 'europe', rate: 3.25 },
  { code: 'NOK', name: 'Norveç Kronu', symbol: 'kr', flag: '🇳🇴', region: 'europe', rate: 3.15 },
  { code: 'DKK', name: 'Danimarka Kronu', symbol: 'kr', flag: '🇩🇰', region: 'europe', rate: 5.05 },
  { code: 'PLN', name: 'Polonya Zlotisi', symbol: 'zł', flag: '🇵🇱', region: 'europe', rate: 8.45 },
  { code: 'CZK', name: 'Çek Korunası', symbol: 'Kč', flag: '🇨🇿', region: 'europe', rate: 1.48 },
  { code: 'RUB', name: 'Rus Rublesi', symbol: '₽', flag: '🇷🇺', region: 'europe', rate: 0.38 },
  { code: 'UAH', name: 'Ukrayna Grivnası', symbol: '₴', flag: '🇺🇦', region: 'europe', rate: 0.82 },
  // Americas
  { code: 'CAD', name: 'Kanada Doları', symbol: 'C$', flag: '🇨🇦', region: 'americas', rate: 25.10 },
  { code: 'MXN', name: 'Meksika Pesosu', symbol: '$', flag: '🇲🇽', region: 'americas', rate: 1.98 },
  { code: 'BRL', name: 'Brezilya Reali', symbol: 'R$', flag: '🇧🇷', region: 'americas', rate: 5.85 },
  { code: 'ARS', name: 'Arjantin Pesosu', symbol: '$', flag: '🇦🇷', region: 'americas', rate: 0.034 },
  // Asia
  { code: 'JPY', name: 'Japon Yeni', symbol: '¥', flag: '🇯🇵', region: 'asia', rate: 0.23 },
  { code: 'CNY', name: 'Çin Yuanı', symbol: '¥', flag: '🇨🇳', region: 'asia', rate: 4.75 },
  { code: 'KRW', name: 'Güney Kore Wonu', symbol: '₩', flag: '🇰🇷', region: 'asia', rate: 0.025 },
  { code: 'INR', name: 'Hindistan Rupisi', symbol: '₹', flag: '🇮🇳', region: 'asia', rate: 0.41 },
  { code: 'SGD', name: 'Singapur Doları', symbol: 'S$', flag: '🇸🇬', region: 'asia', rate: 25.80 },
  { code: 'THB', name: 'Tayland Bahtı', symbol: '฿', flag: '🇹🇭', region: 'asia', rate: 1.02 },
  // Middle East
  { code: 'AED', name: 'BAE Dirhemi', symbol: 'د.إ', flag: '🇦🇪', region: 'middle_east', rate: 9.32 },
  { code: 'SAR', name: 'Suudi Arabistan Riyali', symbol: '﷼', flag: '🇸🇦', region: 'middle_east', rate: 9.13 },
  { code: 'QAR', name: 'Katar Riyali', symbol: 'ر.ق', flag: '🇶🇦', region: 'middle_east', rate: 9.40 },
  { code: 'KWD', name: 'Kuveyt Dinarı', symbol: 'د.ك', flag: '🇰🇼', region: 'middle_east', rate: 111.50 },
  { code: 'ILS', name: 'İsrail Şekeli', symbol: '₪', flag: '🇮🇱', region: 'middle_east', rate: 9.45 },
];

const regionLabels: Record<string, string> = {
  popular: 'Popüler',
  europe: 'Avrupa',
  americas: 'Amerika',
  asia: 'Asya',
  middle_east: 'Orta Doğu',
};

export function CurrencyScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');
  const [searchQuery, setSearchQuery] = useState('');
  const [scaleAnims] = useState(() =>
    currencies.reduce((acc, curr) => {
      acc[curr.code] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  );

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return currencies;
    const query = searchQuery.toLowerCase();
    return currencies.filter(
      (curr) =>
        curr.code.toLowerCase().includes(query) ||
        curr.name.toLowerCase().includes(query) ||
        curr.symbol.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const groupedCurrencies = useMemo(() => {
    const groups: Record<string, Currency[]> = {};
    filteredCurrencies.forEach((curr) => {
      if (!groups[curr.region]) groups[curr.region] = [];
      groups[curr.region].push(curr);
    });
    return groups;
  }, [filteredCurrencies]);

  const selectedCurrencyData = currencies.find((c) => c.code === selectedCurrency);

  const handleSelect = (code: string) => {
    if (code === selectedCurrency) return;

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

    const currency = currencies.find((c) => c.code === code);

    Alert.alert(
      'Para Birimi Değiştir',
      `Varsayılan para birimi "${currency?.name} (${currency?.code})" olarak değiştirilsin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Değiştir',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setSelectedCurrency(code);
            setTimeout(() => navigation.goBack(), 500);
          },
        },
      ]
    );
  };

  const formatRate = (rate: number): string => {
    if (rate >= 100) return rate.toFixed(2);
    if (rate >= 1) return rate.toFixed(2);
    return rate.toFixed(3);
  };

  const renderCurrencyItem = (currency: Currency, isLast: boolean) => {
    const isSelected = selectedCurrency === currency.code;
    const isTRY = currency.code === 'TRY';

    return (
      <Animated.View
        key={currency.code}
        style={{ transform: [{ scale: scaleAnims[currency.code] }] }}
      >
        <TouchableOpacity
          style={[
            styles.currencyRow,
            !isLast && [styles.rowBorder, { borderBottomColor: colors.borderLight }],
            isSelected && {
              backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.08)',
            },
          ]}
          onPress={() => handleSelect(currency.code)}
          activeOpacity={0.7}
        >
          <View style={styles.currencyInfo}>
            <Text style={styles.flagEmoji}>{currency.flag}</Text>
            <View style={styles.currencyTexts}>
              <View style={styles.codeRow}>
                <Text style={[styles.currencyCode, { color: colors.text }]}>
                  {currency.code}
                </Text>
                <Text style={[styles.currencySymbol, { color: colors.textMuted }]}>
                  {currency.symbol}
                </Text>
              </View>
              <Text style={[styles.currencyName, { color: colors.textSecondary }]}>
                {currency.name}
              </Text>
            </View>
          </View>
          <View style={styles.rightSection}>
            {!isTRY && (
              <View style={styles.rateContainer}>
                <Text style={[styles.rateValue, { color: colors.text }]}>
                  {formatRate(currency.rate)}
                </Text>
                <Text style={[styles.rateLabel, { color: colors.textMuted }]}>₺</Text>
              </View>
            )}
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
          </View>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Para Birimi</Text>
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
            placeholder="Para birimi ara..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="characters"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Current Currency */}
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
            <View style={styles.currentTop}>
              <View style={styles.currentInfo}>
                <Text style={styles.currentFlag}>{selectedCurrencyData?.flag}</Text>
                <View>
                  <Text style={[styles.currentLabel, { color: colors.textSecondary }]}>
                    Varsayılan Para Birimi
                  </Text>
                  <View style={styles.currentNameRow}>
                    <Text style={[styles.currentCode, { color: colors.text }]}>
                      {selectedCurrencyData?.code}
                    </Text>
                    <Text style={[styles.currentSymbol, { color: colors.brand[400] }]}>
                      {selectedCurrencyData?.symbol}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={colors.brand[500]} />
            </View>
            {selectedCurrency !== 'TRY' && (
              <View style={[styles.rateBox, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.6)' }]}>
                <Ionicons name="swap-horizontal" size={16} color={colors.textSecondary} />
                <Text style={[styles.rateBoxText, { color: colors.textSecondary }]}>
                  1 {selectedCurrencyData?.code} = {formatRate(selectedCurrencyData?.rate || 0)} TRY
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Grouped Currencies */}
        {Object.entries(groupedCurrencies).map(([region, currencyList]) => (
          <View key={region} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {regionLabels[region]?.toUpperCase() || region.toUpperCase()}
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
              {currencyList.map((currency, index) =>
                renderCurrencyItem(currency, index === currencyList.length - 1)
              )}
            </View>
          </View>
        ))}

        {/* No Results */}
        {filteredCurrencies.length === 0 && (
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
              Seçtiğiniz para birimi fiyat görüntülemelerinde kullanılacaktır. Ödemeler hizmet
              sağlayıcının belirlediği para biriminde yapılır.
            </Text>
          </View>
        </View>

        {/* Exchange Rate Note */}
        <View style={styles.rateNote}>
          <Ionicons name="time-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.rateNoteText, { color: colors.textMuted }]}>
            Döviz kurları günde bir güncellenir. Son güncelleme: Bugün 09:00
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.brand[500] }]}>
              {currencies.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Para Birimi</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.success }]}>5</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Bölge</Text>
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
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  currentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  currentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  currentCode: {
    fontSize: 20,
    fontWeight: '700',
  },
  currentSymbol: {
    fontSize: 18,
    fontWeight: '600',
  },
  rateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rateBoxText: {
    fontSize: 13,
    fontWeight: '500',
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
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  flagEmoji: {
    fontSize: 28,
  },
  currencyTexts: {
    flex: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currencyCode: {
    fontSize: 15,
    fontWeight: '600',
  },
  currencySymbol: {
    fontSize: 13,
    fontWeight: '500',
  },
  currencyName: {
    fontSize: 12,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  rateValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  rateLabel: {
    fontSize: 11,
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
  rateNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  rateNoteText: {
    fontSize: 12,
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
