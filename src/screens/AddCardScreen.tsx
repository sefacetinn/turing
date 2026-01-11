import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';

export function AddCardScreen() {
  const navigation = useNavigation<any>();

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ').substr(0, 19) : '';
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  const getCardType = () => {
    const firstDigit = cardNumber.replace(/\s/g, '')[0];
    if (firstDigit === '4') return 'visa';
    if (firstDigit === '5') return 'mastercard';
    return null;
  };

  const handleSave = () => {
    // API call to save card
    navigation.goBack();
  };

  const cardType = getCardType();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kart Ekle</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Card Preview */}
          <View style={styles.cardPreviewContainer}>
            <LinearGradient
              colors={cardType === 'visa' ? ['#1a1f71', '#00579f'] : cardType === 'mastercard' ? ['#eb001b', '#f79e1b'] : ['#374151', '#1f2937']}
              style={styles.cardPreview}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardBrand}>
                  {cardType === 'visa' ? 'VISA' : cardType === 'mastercard' ? 'Mastercard' : 'Kart'}
                </Text>
                <Ionicons name="wifi" size={24} color="rgba(255,255,255,0.6)" style={{ transform: [{ rotate: '90deg' }] }} />
              </View>
              <Text style={styles.cardNumberPreview}>
                {cardNumber || '•••• •••• •••• ••••'}
              </Text>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>KART SAHİBİ</Text>
                  <Text style={styles.cardValue}>{cardHolder || 'AD SOYAD'}</Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>SON KULLANMA</Text>
                  <Text style={styles.cardValue}>{expiryDate || 'MM/YY'}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Card Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kart Numarası</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="card-outline" size={20} color={colors.zinc[500]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={colors.zinc[600]}
                  keyboardType="number-pad"
                  maxLength={19}
                />
                {cardType && (
                  <View style={styles.cardTypeIcon}>
                    <Text style={styles.cardTypeText}>
                      {cardType === 'visa' ? 'VISA' : 'MC'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Card Holder */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kart Üzerindeki İsim</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={colors.zinc[500]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  placeholder="AD SOYAD"
                  placeholderTextColor={colors.zinc[600]}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Expiry & CVV */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.inputLabel}>Son Kullanma</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar-outline" size={20} color={colors.zinc[500]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.zinc[600]}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.zinc[500]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="•••"
                    placeholderTextColor={colors.zinc[600]}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            {/* Save Card Toggle */}
            <TouchableOpacity
              style={styles.saveToggle}
              onPress={() => setSaveCard(!saveCard)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, saveCard && styles.checkboxChecked]}>
                {saveCard && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
              <Text style={styles.saveToggleText}>Bu kartı sonraki ödemeler için kaydet</Text>
            </TouchableOpacity>

            {/* Security Info */}
            <View style={styles.securityInfo}>
              <Ionicons name="shield-checkmark" size={20} color={colors.success} />
              <Text style={styles.securityText}>
                Kart bilgileriniz 256-bit SSL şifreleme ile korunmaktadır
              </Text>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.saveButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.saveButtonText}>Kartı Ekle</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
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
    color: colors.text,
  },
  cardPreviewContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  cardPreview: {
    height: 200,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  cardNumberPreview: {
    fontSize: 22,
    fontWeight: '500',
    color: 'white',
    letterSpacing: 2,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.zinc[400],
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
  },
  cardTypeIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  cardTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  saveToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.zinc[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.brand[500],
    borderColor: colors.brand[500],
  },
  saveToggleText: {
    fontSize: 14,
    color: colors.zinc[400],
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: colors.zinc[400],
  },
  footer: {
    padding: 20,
    paddingBottom: 24,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
