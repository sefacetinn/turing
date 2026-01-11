import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

const currencies: Currency[] = [
  { code: 'TRY', name: 'Turk Lirasi', symbol: '₺' },
  { code: 'USD', name: 'Amerikan Dolari', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'Ingiliz Sterlini', symbol: '£' },
  { code: 'CHF', name: 'Isvicre Frangi', symbol: 'CHF' },
  { code: 'SAR', name: 'Suudi Arabistan Riyali', symbol: 'SAR' },
  { code: 'AED', name: 'BAE Dirhemi', symbol: 'AED' },
  { code: 'RUB', name: 'Rus Rublesi', symbol: '₽' },
];

export function CurrencyScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');

  const handleSelect = (code: string) => {
    setSelectedCurrency(code);
    // In a real app, this would update the app's currency preference
    setTimeout(() => navigation.goBack(), 300);
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Varsayilan Para Birimi
          </Text>
          <View style={[styles.card, {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            ...(isDark ? {} : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 })
          }]}>
            {currencies.map((currency, index) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyRow,
                  index < currencies.length - 1 && [styles.rowBorder, { borderBottomColor: colors.borderLight }],
                  selectedCurrency === currency.code && { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.05)' }
                ]}
                onPress={() => handleSelect(currency.code)}
                activeOpacity={0.7}
              >
                <View style={styles.currencyInfo}>
                  <View style={[styles.symbolBadge, { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] }]}>
                    <Text style={[styles.symbolText, { color: colors.brand[500] }]}>{currency.symbol}</Text>
                  </View>
                  <View>
                    <Text style={[styles.currencyCode, { color: colors.text }]}>{currency.code}</Text>
                    <Text style={[styles.currencyName, { color: colors.textSecondary }]}>{currency.name}</Text>
                  </View>
                </View>
                {selectedCurrency === currency.code && (
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
            Sectiginiz para birimi fiyat goruntulemelerinde kullanilacaktir. Odemeler hizmet saglayicinin belirledigi para biriminde yapilir.
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
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  symbolBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: {
    fontSize: 18,
    fontWeight: '700',
  },
  currencyCode: {
    fontSize: 15,
    fontWeight: '600',
  },
  currencyName: {
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
