/**
 * BudgetFormModule - Bütçe Form Modülü
 *
 * Bütçe bilgileri için form alanlarını render eder.
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { BudgetModuleData, ModuleConfig } from '../../../types/modules';

interface BudgetFormModuleProps {
  data?: Partial<BudgetModuleData>;
  config: ModuleConfig;
  onDataChange?: (data: Partial<BudgetModuleData>) => void;
  errors?: Record<string, string>;
}

type BudgetType = 'fixed' | 'range' | 'negotiable';

const BUDGET_TYPES: { id: BudgetType; label: string; icon: string }[] = [
  { id: 'fixed', label: 'Sabit Bütçe', icon: 'cash' },
  { id: 'range', label: 'Bütçe Aralığı', icon: 'swap-horizontal' },
  { id: 'negotiable', label: 'Pazarlık Yapılır', icon: 'chatbubbles' },
];

const PAYMENT_TERMS = [
  { id: 'advance', label: 'Peşin' },
  { id: 'on_event', label: 'Etkinlik Günü' },
  { id: 'after_event', label: 'Etkinlik Sonrası' },
  { id: 'installment', label: 'Taksitli' },
];

export const BudgetFormModule: React.FC<BudgetFormModuleProps> = ({
  data = {},
  config,
  onDataChange,
  errors = {},
}) => {
  const { colors, isDark } = useTheme();
  const [budgetType, setBudgetType] = React.useState<BudgetType>(
    data.budgetMin && data.budgetMax ? 'range' :
    data.isNegotiable ? 'negotiable' : 'fixed'
  );

  const handleChange = (field: keyof BudgetModuleData, value: any) => {
    onDataChange?.({ ...data, [field]: value });
  };

  const handleBudgetTypeChange = (type: BudgetType) => {
    setBudgetType(type);
    if (type === 'fixed') {
      handleChange('budgetMin', undefined);
      handleChange('budgetMax', undefined);
      handleChange('isNegotiable', false);
    } else if (type === 'range') {
      handleChange('organizerBudget', undefined);
      handleChange('isNegotiable', false);
    } else {
      handleChange('isNegotiable', true);
    }
  };

  const formatCurrency = (value: string): string => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    // Format with thousand separators
    return Number(numericValue).toLocaleString('tr-TR');
  };

  const parseCurrency = (value: string): number => {
    return Number(value.replace(/[^0-9]/g, '')) || 0;
  };

  return (
    <View style={styles.container}>
      {/* Budget Type Selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Bütçe Türü</Text>
        <View style={styles.typeGrid}>
          {BUDGET_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  borderColor: budgetType === type.id ? colors.primary : isDark ? '#3F3F46' : '#E2E8F0',
                  borderWidth: budgetType === type.id ? 2 : 1,
                },
              ]}
              onPress={() => handleBudgetTypeChange(type.id)}
            >
              <Ionicons
                name={type.icon as any}
                size={22}
                color={budgetType === type.id ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeName,
                  { color: budgetType === type.id ? colors.primary : colors.text },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fixed Budget Input */}
      {budgetType === 'fixed' && (
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>Bütçe</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <View style={styles.currencyInputRow}>
            <View style={[styles.currencyPrefix, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}>
              <Text style={[styles.currencyText, { color: colors.text }]}>₺</Text>
            </View>
            <TextInput
              style={[
                styles.currencyInput,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  color: colors.text,
                  borderColor: errors.organizerBudget ? '#EF4444' : isDark ? '#3F3F46' : '#E2E8F0',
                },
              ]}
              value={data.organizerBudget ? formatCurrency(String(data.organizerBudget)) : ''}
              onChangeText={(text) => handleChange('organizerBudget', parseCurrency(text))}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
          {errors.organizerBudget && <Text style={styles.errorText}>{errors.organizerBudget}</Text>}
        </View>
      )}

      {/* Budget Range Inputs */}
      {budgetType === 'range' && (
        <>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Minimum Bütçe</Text>
            <View style={styles.currencyInputRow}>
              <View style={[styles.currencyPrefix, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}>
                <Text style={[styles.currencyText, { color: colors.text }]}>₺</Text>
              </View>
              <TextInput
                style={[
                  styles.currencyInput,
                  {
                    backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                    color: colors.text,
                    borderColor: isDark ? '#3F3F46' : '#E2E8F0',
                  },
                ]}
                value={data.budgetMin ? formatCurrency(String(data.budgetMin)) : ''}
                onChangeText={(text) => handleChange('budgetMin', parseCurrency(text))}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Maksimum Bütçe</Text>
            <View style={styles.currencyInputRow}>
              <View style={[styles.currencyPrefix, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}>
                <Text style={[styles.currencyText, { color: colors.text }]}>₺</Text>
              </View>
              <TextInput
                style={[
                  styles.currencyInput,
                  {
                    backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                    color: colors.text,
                    borderColor: isDark ? '#3F3F46' : '#E2E8F0',
                  },
                ]}
                value={data.budgetMax ? formatCurrency(String(data.budgetMax)) : ''}
                onChangeText={(text) => handleChange('budgetMax', parseCurrency(text))}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>
        </>
      )}

      {/* Negotiable Budget */}
      {budgetType === 'negotiable' && (
        <View style={[styles.negotiableBox, { backgroundColor: isDark ? '#27272A' : '#FEF3C7' }]}>
          <Ionicons name="information-circle" size={20} color="#F59E0B" />
          <Text style={[styles.negotiableText, { color: colors.text }]}>
            Bütçe, hizmet sağlayıcı ile görüşülerek belirlenecektir. İsterseniz referans bir bütçe belirtebilirsiniz.
          </Text>
        </View>
      )}

      {/* Optional Reference Budget for Negotiable */}
      {budgetType === 'negotiable' && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Referans Bütçe (Opsiyonel)</Text>
          <View style={styles.currencyInputRow}>
            <View style={[styles.currencyPrefix, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}>
              <Text style={[styles.currencyText, { color: colors.text }]}>₺</Text>
            </View>
            <TextInput
              style={[
                styles.currencyInput,
                {
                  backgroundColor: isDark ? '#27272A' : '#F8FAFC',
                  color: colors.text,
                  borderColor: isDark ? '#3F3F46' : '#E2E8F0',
                },
              ]}
              value={data.organizerBudget ? formatCurrency(String(data.organizerBudget)) : ''}
              onChangeText={(text) => handleChange('organizerBudget', parseCurrency(text))}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>
      )}

      {/* Payment Terms */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Ödeme Koşulları</Text>
        <View style={styles.termsGrid}>
          {PAYMENT_TERMS.map((term) => (
            <TouchableOpacity
              key={term.id}
              style={[
                styles.termChip,
                {
                  backgroundColor: data.paymentTerms === term.id
                    ? colors.primary
                    : isDark ? '#27272A' : '#F1F5F9',
                },
              ]}
              onPress={() => handleChange('paymentTerms', term.id)}
            >
              <Text
                style={[
                  styles.termText,
                  { color: data.paymentTerms === term.id ? '#FFFFFF' : colors.text },
                ]}
              >
                {term.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Deposit Section */}
      <TouchableOpacity
        style={[
          styles.toggleRow,
          { backgroundColor: isDark ? '#27272A' : '#F8FAFC' },
        ]}
        onPress={() => handleChange('depositRequired', !data.depositRequired)}
      >
        <View style={styles.toggleInfo}>
          <Ionicons name="wallet-outline" size={22} color={colors.textSecondary} />
          <View>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Kapora Gerekli</Text>
            <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
              Rezervasyon için ön ödeme istiyorum
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.toggleSwitch,
            {
              backgroundColor: data.depositRequired ? '#10B981' : isDark ? '#3F3F46' : '#E2E8F0',
            },
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              { transform: [{ translateX: data.depositRequired ? 20 : 0 }] },
            ]}
          />
        </View>
      </TouchableOpacity>

      {/* Deposit Percentage */}
      {data.depositRequired && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Kapora Oranı (%)</Text>
          <View style={styles.percentageRow}>
            {[25, 50, 75, 100].map((percent) => (
              <TouchableOpacity
                key={percent}
                style={[
                  styles.percentChip,
                  {
                    backgroundColor: data.depositPercentage === percent
                      ? '#F59E0B'
                      : isDark ? '#27272A' : '#F1F5F9',
                  },
                ]}
                onPress={() => handleChange('depositPercentage', percent)}
              >
                <Text
                  style={[
                    styles.percentText,
                    { color: data.depositPercentage === percent ? '#FFFFFF' : colors.text },
                  ]}
                >
                  %{percent}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  typeCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  typeName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  currencyInputRow: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
  },
  currencyPrefix: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  currencyInput: {
    flex: 1,
    padding: 14,
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  negotiableBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  negotiableText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  termsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  termChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  termText: {
    fontSize: 13,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  toggleHint: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 4,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  percentageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  percentChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  percentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default BudgetFormModule;
