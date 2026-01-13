import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const colors = defaultColors;

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  brand?: string;
  last4: string;
  expiry?: string;
  bankName?: string;
  isDefault: boolean;
}

export function PaymentMethodsScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', brand: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
    { id: '2', type: 'card', brand: 'Mastercard', last4: '8888', expiry: '09/25', isDefault: false },
    { id: '3', type: 'bank', bankName: 'Garanti BBVA', last4: '7890', isDefault: false },
  ]);

  const getCardIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  const getCardColor = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return ['#1a1f71', '#00579f'];
      case 'mastercard':
        return ['#eb001b', '#f79e1b'];
      default:
        return gradients.primary;
    }
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Ödeme Yöntemi Sil',
      'Bu ödeme yöntemini silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => setPaymentMethods((prev) => prev.filter((m) => m.id !== id)),
        },
      ]
    );
  };

  const handleAddCard = () => {
    navigation.navigate('AddCard');
  };

  const handleAddBank = () => {
    Alert.alert('Banka Hesabı Ekle', 'Banka hesabı ekleme özelliği yakında eklenecek.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ödeme Yöntemleri</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cards Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Kartlarım</Text>

          {paymentMethods
            .filter((m) => m.type === 'card')
            .map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.cardContainer}
                activeOpacity={0.9}
                onLongPress={() => handleDelete(card.id)}
              >
                <LinearGradient
                  colors={getCardColor(card.brand) as [string, string]}
                  style={styles.creditCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardBrand}>{card.brand}</Text>
                    {card.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Varsayılan</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.cardLabel}>Son Kullanma</Text>
                      <Text style={styles.cardExpiry}>{card.expiry}</Text>
                    </View>
                    <Ionicons name="wifi" size={24} color="rgba(255,255,255,0.6)" style={{ transform: [{ rotate: '90deg' }] }} />
                  </View>
                </LinearGradient>

                <View style={styles.cardActions}>
                  {!card.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(card.id)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color={colors.brand[400]} />
                      <Text style={[styles.actionText, { color: colors.brand[400] }]}>Varsayılan Yap</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(card.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                    <Text style={[styles.actionText, { color: colors.error }]}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}

          {/* Add Card Button */}
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
              }
            ]}
            onPress={handleAddCard}
            activeOpacity={0.7}
          >
            <View style={styles.addButtonInner}>
              <Ionicons name="add-circle" size={24} color={colors.brand[400]} />
              <Text style={[styles.addButtonText, { color: colors.brand[400] }]}>Yeni Kart Ekle</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bank Accounts Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Banka Hesapları</Text>

          {paymentMethods
            .filter((m) => m.type === 'bank')
            .map((bank) => (
              <View
                key={bank.id}
                style={[
                  styles.bankCard,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
                    ...(isDark ? {} : helpers.getShadow('sm')),
                  }
                ]}
              >
                <View style={styles.bankInfo}>
                  <View style={styles.bankIcon}>
                    <Ionicons name="business" size={24} color={colors.brand[400]} />
                  </View>
                  <View>
                    <Text style={[styles.bankName, { color: colors.text }]}>{bank.bankName}</Text>
                    <Text style={[styles.bankAccount, { color: colors.textMuted }]}>TR** **** **** **** **** {bank.last4}</Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  {!bank.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(bank.id)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color={colors.brand[400]} />
                      <Text style={[styles.actionText, { color: colors.brand[400] }]}>Varsayılan</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(bank.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                    <Text style={[styles.actionText, { color: colors.error }]}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

          {/* Add Bank Button */}
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
              }
            ]}
            onPress={handleAddBank}
            activeOpacity={0.7}
          >
            <View style={styles.addButtonInner}>
              <Ionicons name="add-circle" size={24} color={colors.brand[400]} />
              <Text style={[styles.addButtonText, { color: colors.brand[400] }]}>Banka Hesabı Ekle</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Billing History */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Fatura Geçmişi</Text>
          <View
            style={[
              styles.historyCard,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
                ...(isDark ? {} : helpers.getShadow('sm')),
              }
            ]}
          >
            <TouchableOpacity style={styles.historyRow} activeOpacity={0.7}>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyTitle, { color: colors.text }]}>Ocak 2025 Faturası</Text>
                <Text style={[styles.historyDate, { color: colors.textMuted }]}>15 Ocak 2025</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={[styles.historyAmount, { color: colors.text }]}>₺2.450</Text>
                <Ionicons name="download-outline" size={20} color={colors.brand[400]} />
              </View>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />
            <TouchableOpacity style={styles.historyRow} activeOpacity={0.7}>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyTitle, { color: colors.text }]}>Aralık 2024 Faturası</Text>
                <Text style={[styles.historyDate, { color: colors.textMuted }]}>15 Aralık 2024</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={[styles.historyAmount, { color: colors.text }]}>₺1.890</Text>
                <Ionicons name="download-outline" size={20} color={colors.brand[400]} />
              </View>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />
            <TouchableOpacity style={styles.viewAllRow} activeOpacity={0.7}>
              <Text style={[styles.viewAllText, { color: colors.brand[400] }]}>Tüm Faturaları Gör</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.brand[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.section}>
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={24} color={colors.success} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.success }]}>Güvenli Ödemeler</Text>
              <Text style={[styles.infoText, { color: colors.textMuted }]}>
                Tüm ödeme bilgileriniz 256-bit SSL şifreleme ile korunmaktadır.
              </Text>
            </View>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  creditCard: {
    padding: 20,
    borderRadius: 16,
    height: 180,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  defaultBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '500',
    color: 'white',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
  },
  cardExpiry: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderStyle: 'dashed',
    padding: 20,
  },
  addButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  bankCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    marginBottom: 12,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    fontSize: 15,
    fontWeight: '600',
  },
  bankAccount: {
    fontSize: 12,
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyDate: {
    fontSize: 12,
    marginTop: 2,
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 6,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
