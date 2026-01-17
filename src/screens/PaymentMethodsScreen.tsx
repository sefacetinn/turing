import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import * as Haptics from 'expo-haptics';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  brand?: string;
  last4: string;
  expiry?: string;
  bankName?: string;
  iban?: string;
  isDefault: boolean;
  cardHolder?: string;
}

interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'payment' | 'refund' | 'payout';
}

export function PaymentMethodsScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', brand: 'Visa', last4: '4242', expiry: '12/26', isDefault: true, cardHolder: 'SEFA CETIN' },
    { id: '2', type: 'card', brand: 'Mastercard', last4: '8888', expiry: '09/25', isDefault: false, cardHolder: 'SEFA CETIN' },
    { id: '3', type: 'bank', bankName: 'Garanti BBVA', last4: '7890', iban: 'TR33 0006 1005 1978 6457 8413 26', isDefault: false },
  ]);

  const [transactions] = useState<Transaction[]>([
    { id: 't1', title: 'DJ Phantom - Performans', date: '15 Ocak 2025', amount: -2450, type: 'payment' },
    { id: 't2', title: 'İade - İptal edilen etkinlik', date: '10 Ocak 2025', amount: 1200, type: 'refund' },
    { id: 't3', title: 'Sound System Kiralama', date: '5 Ocak 2025', amount: -3800, type: 'payment' },
  ]);

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');

  // Bank form state
  const [bankName, setBankName] = useState('');
  const [iban, setIban] = useState('');

  const getCardGradient = (brand?: string): [string, string] => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return ['#1a1f71', '#4b6cb7'];
      case 'mastercard':
        return ['#eb001b', '#f79e1b'];
      default:
        return ['#4B30B8', '#6366F1'];
    }
  };

  const handleSetDefault = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleDelete = (id: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Ödeme Yöntemi Sil',
      `"${name}" silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
          },
        },
      ]
    );
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '').replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ').substr(0, 19) : '';
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  const formatIBAN = (text: string) => {
    const cleaned = text.replace(/\s/g, '').toUpperCase();
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : '';
  };

  const handleAddCard = () => {
    if (!cardNumber || !cardExpiry || !cardCVC || !cardName) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const last4 = cardNumber.replace(/\s/g, '').slice(-4);
    const newCard: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      brand: cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
      last4,
      expiry: cardExpiry,
      cardHolder: cardName.toUpperCase(),
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods((prev) => [...prev, newCard]);
    setShowAddCardModal(false);
    setCardNumber('');
    setCardExpiry('');
    setCardCVC('');
    setCardName('');
  };

  const handleAddBank = () => {
    if (!bankName || !iban) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const last4 = iban.replace(/\s/g, '').slice(-4);
    const newBank: PaymentMethod = {
      id: Date.now().toString(),
      type: 'bank',
      bankName,
      last4,
      iban: formatIBAN(iban),
      isDefault: false,
    };

    setPaymentMethods((prev) => [...prev, newBank]);
    setShowAddBankModal(false);
    setBankName('');
    setIban('');
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'payment':
        return colors.error;
      case 'refund':
        return '#10B981';
      case 'payout':
        return '#3B82F6';
      default:
        return colors.text;
    }
  };

  const cards = paymentMethods.filter((m) => m.type === 'card');
  const banks = paymentMethods.filter((m) => m.type === 'bank');

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
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Kartlarım</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAddCardModal(true);
              }}
            >
              <Ionicons name="add-circle" size={24} color={colors.brand[400]} />
            </TouchableOpacity>
          </View>

          {cards.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyCard, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}
              onPress={() => setShowAddCardModal(true)}
            >
              <Ionicons name="card-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Kart ekleyin</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsScroll}
            >
              {cards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={styles.cardWrapper}
                  activeOpacity={0.9}
                  onPress={() => handleSetDefault(card.id)}
                  onLongPress={() => handleDelete(card.id, `${card.brand} •••• ${card.last4}`)}
                >
                  <LinearGradient
                    colors={getCardGradient(card.brand)}
                    style={styles.creditCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {/* Card chip */}
                    <View style={styles.cardTop}>
                      <View style={styles.cardChip}>
                        <View style={styles.chipLine} />
                        <View style={styles.chipLine} />
                        <View style={styles.chipLine} />
                      </View>
                      {card.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Ionicons name="checkmark" size={10} color="white" />
                        </View>
                      )}
                    </View>

                    <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>

                    <View style={styles.cardBottom}>
                      <View>
                        <Text style={styles.cardLabel}>Kart Sahibi</Text>
                        <Text style={styles.cardHolder}>{card.cardHolder}</Text>
                      </View>
                      <View style={styles.cardRight}>
                        <View>
                          <Text style={styles.cardLabel}>S.K.T.</Text>
                          <Text style={styles.cardExpiry}>{card.expiry}</Text>
                        </View>
                        <Text style={styles.cardBrand}>{card.brand}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}

              {/* Add card button */}
              <TouchableOpacity
                style={[styles.addCardButton, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}
                onPress={() => setShowAddCardModal(true)}
              >
                <Ionicons name="add" size={32} color={colors.brand[400]} />
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Bank Accounts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Banka Hesapları</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAddBankModal(true);
              }}
            >
              <Ionicons name="add-circle" size={24} color={colors.brand[400]} />
            </TouchableOpacity>
          </View>

          {banks.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyBank, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground,
                borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border,
              }]}
              onPress={() => setShowAddBankModal(true)}
            >
              <View style={[styles.emptyBankIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                <Ionicons name="business-outline" size={24} color={colors.textMuted} />
              </View>
              <Text style={[styles.emptyBankText, { color: colors.textMuted }]}>Banka hesabı ekleyin</Text>
              <Ionicons name="add" size={20} color={colors.brand[400]} />
            </TouchableOpacity>
          ) : (
            banks.map((bank) => (
              <TouchableOpacity
                key={bank.id}
                style={[styles.bankCard, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground,
                  borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border,
                }]}
                activeOpacity={0.7}
                onPress={() => handleSetDefault(bank.id)}
                onLongPress={() => handleDelete(bank.id, bank.bankName || '')}
              >
                <View style={styles.bankLeft}>
                  <View style={[styles.bankIcon, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }]}>
                    <Ionicons name="business" size={20} color={colors.brand[400]} />
                  </View>
                  <View>
                    <Text style={[styles.bankName, { color: colors.text }]}>{bank.bankName}</Text>
                    <Text style={[styles.bankIban, { color: colors.textMuted }]}>•••• {bank.last4}</Text>
                  </View>
                </View>
                {bank.isDefault ? (
                  <View style={[styles.bankDefaultBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="checkmark" size={14} color="#10B981" />
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Son İşlemler</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: colors.brand[400] }]}>Tümü</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.transactionsCard, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border,
          }]}>
            {transactions.map((tx, index) => (
              <View key={tx.id}>
                <View style={styles.transactionRow}>
                  <View style={styles.txLeft}>
                    <View style={[styles.txIcon, {
                      backgroundColor: tx.type === 'payment'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : tx.type === 'refund'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(59, 130, 246, 0.1)'
                    }]}>
                      <Ionicons
                        name={tx.type === 'payment' ? 'arrow-up' : tx.type === 'refund' ? 'arrow-down' : 'wallet'}
                        size={16}
                        color={getTransactionColor(tx.type)}
                      />
                    </View>
                    <View>
                      <Text style={[styles.txTitle, { color: colors.text }]} numberOfLines={1}>{tx.title}</Text>
                      <Text style={[styles.txDate, { color: colors.textMuted }]}>{tx.date}</Text>
                    </View>
                  </View>
                  <Text style={[styles.txAmount, { color: getTransactionColor(tx.type) }]}>
                    {tx.amount > 0 ? '+' : ''}₺{Math.abs(tx.amount).toLocaleString('tr-TR')}
                  </Text>
                </View>
                {index < transactions.length - 1 && (
                  <View style={[styles.txDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.section}>
          <View style={[styles.securityBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)' }]}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={[styles.securityText, { color: colors.textMuted }]}>
              Tüm ödemeler 256-bit SSL ile şifrelenmektedir
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Card Modal */}
      <Modal visible={showAddCardModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Yeni Kart Ekle</Text>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Kart Numarası</Text>
              <TextInput
                style={[styles.modalInput, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                  color: colors.text,
                }]}
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={colors.zinc[500]}
                keyboardType="number-pad"
                maxLength={19}
              />

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Son Kullanma</Text>
                  <TextInput
                    style={[styles.modalInput, {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                      color: colors.text,
                    }]}
                    value={cardExpiry}
                    onChangeText={(t) => setCardExpiry(formatExpiry(t))}
                    placeholder="AA/YY"
                    placeholderTextColor={colors.zinc[500]}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>CVV</Text>
                  <TextInput
                    style={[styles.modalInput, {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                      color: colors.text,
                    }]}
                    value={cardCVC}
                    onChangeText={setCardCVC}
                    placeholder="•••"
                    placeholderTextColor={colors.zinc[500]}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Kart Üzerindeki İsim</Text>
              <TextInput
                style={[styles.modalInput, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                  color: colors.text,
                }]}
                value={cardName}
                onChangeText={setCardName}
                placeholder="AD SOYAD"
                placeholderTextColor={colors.zinc[500]}
                autoCapitalize="characters"
              />
            </ScrollView>

            <TouchableOpacity style={styles.modalButton} onPress={handleAddCard}>
              <LinearGradient
                colors={['#4B30B8', '#6366F1']}
                style={styles.modalButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="card" size={18} color="white" />
                <Text style={styles.modalButtonText}>Kartı Kaydet</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Bank Modal */}
      <Modal visible={showAddBankModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Banka Hesabı Ekle</Text>
              <TouchableOpacity onPress={() => setShowAddBankModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Banka Adı</Text>
              <TextInput
                style={[styles.modalInput, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                  color: colors.text,
                }]}
                value={bankName}
                onChangeText={setBankName}
                placeholder="Örn: Garanti BBVA"
                placeholderTextColor={colors.zinc[500]}
              />

              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>IBAN</Text>
              <TextInput
                style={[styles.modalInput, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                  color: colors.text,
                }]}
                value={iban}
                onChangeText={(t) => setIban(formatIBAN(t))}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                placeholderTextColor={colors.zinc[500]}
                autoCapitalize="characters"
                maxLength={32}
              />
            </ScrollView>

            <TouchableOpacity style={styles.modalButton} onPress={handleAddBank}>
              <LinearGradient
                colors={['#4B30B8', '#6366F1']}
                style={styles.modalButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="business" size={18} color="white" />
                <Text style={styles.modalButtonText}>Hesabı Kaydet</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Cards
  cardsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  cardWrapper: {
    width: 300,
  },
  creditCard: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: '#d4af37',
    borderRadius: 6,
    padding: 4,
    justifyContent: 'space-around',
  },
  chipLine: {
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 1,
  },
  defaultBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
    letterSpacing: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardHolder: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  cardExpiry: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    marginTop: 2,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  addCardButton: {
    width: 80,
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    marginHorizontal: 20,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },

  // Banks
  emptyBank: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  emptyBankIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBankText: {
    flex: 1,
    fontSize: 14,
  },
  bankCard: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  bankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    fontSize: 15,
    fontWeight: '600',
  },
  bankIban: {
    fontSize: 13,
    marginTop: 2,
  },
  bankDefaultBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Transactions
  transactionsCard: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: 180,
  },
  txDate: {
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  txDivider: {
    height: 1,
    marginHorizontal: 14,
  },

  // Security
  securityBox: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  securityText: {
    fontSize: 13,
    flex: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  modalButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
