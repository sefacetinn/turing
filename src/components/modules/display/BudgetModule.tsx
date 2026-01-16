/**
 * BudgetModule - Bütçe Modülü
 *
 * Organizatör bütçesi ve teklif tutarı bilgilerini gösterir.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { BudgetModuleData, ModuleConfig } from '../../../types/modules';

interface BudgetModuleProps {
  data?: BudgetModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: BudgetModuleData) => void;
}

export const BudgetModule: React.FC<BudgetModuleProps> = ({
  data,
  config,
  mode = 'view',
  onDataChange,
}) => {
  const { colors, isDark } = useTheme();

  const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return '-';
    return `₺${amount.toLocaleString('tr-TR')}`;
  };

  const hasBudgetInfo = data?.organizerBudget || data?.budgetMin || data?.budgetMax;

  if (!data || !hasBudgetInfo) {
    return (
      <View style={[styles.noBudget, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
        <Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
        <Text style={[styles.noBudgetText, { color: colors.textSecondary }]}>
          Bütçe İletilmedi
        </Text>
        <Text style={[styles.noBudgetSubtext, { color: colors.textSecondary }]}>
          Organizatör bütçe bilgisi paylaşmadı
        </Text>
      </View>
    );
  }

  // Tek bütçe tutarı var
  if (data.organizerBudget && !data.budgetMin && !data.budgetMax) {
    return (
      <View style={[styles.budgetBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)' }]}>
        <Text style={[styles.budgetLabel, { color: '#10B981' }]}>Organizatör Bütçe Teklifi</Text>
        <Text style={[styles.budgetAmount, { color: '#10B981' }]}>
          {formatCurrency(data.organizerBudget)}
        </Text>
        {data.isNegotiable && (
          <View style={styles.negotiableBadge}>
            <Ionicons name="swap-horizontal" size={12} color="#6366F1" />
            <Text style={styles.negotiableText}>Pazarlık Yapılabilir</Text>
          </View>
        )}
      </View>
    );
  }

  // Bütçe aralığı var
  return (
    <View style={styles.container}>
      <View style={[styles.rangeBox, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)' }]}>
        <Text style={[styles.rangeLabel, { color: colors.textSecondary }]}>Bütçe Aralığı</Text>
        <View style={styles.rangeValues}>
          <View style={styles.rangeItem}>
            <Text style={[styles.rangeAmount, { color: colors.text }]}>
              {formatCurrency(data.budgetMin)}
            </Text>
            <Text style={[styles.rangeHint, { color: colors.textSecondary }]}>Min</Text>
          </View>
          <View style={styles.rangeDivider}>
            <Ionicons name="remove" size={20} color={colors.textSecondary} />
          </View>
          <View style={styles.rangeItem}>
            <Text style={[styles.rangeAmount, { color: colors.text }]}>
              {formatCurrency(data.budgetMax)}
            </Text>
            <Text style={[styles.rangeHint, { color: colors.textSecondary }]}>Max</Text>
          </View>
        </View>
        {data.isNegotiable && (
          <View style={[styles.negotiableBadge, { marginTop: 12 }]}>
            <Ionicons name="swap-horizontal" size={12} color="#6366F1" />
            <Text style={styles.negotiableText}>Pazarlık Yapılabilir</Text>
          </View>
        )}
      </View>

      {data.paymentTerms && (
        <View style={[styles.termsBox, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
          <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            {data.paymentTerms}
          </Text>
        </View>
      )}

      {data.depositRequired && data.depositPercentage && (
        <View style={[styles.depositBox, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.06)' }]}>
          <Ionicons name="wallet-outline" size={16} color="#F59E0B" />
          <Text style={[styles.depositText, { color: '#F59E0B' }]}>
            %{data.depositPercentage} Kapora Gerekli
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  noBudget: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  noBudgetText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  noBudgetSubtext: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  budgetBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 28,
    fontWeight: '700',
  },
  negotiableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
  },
  negotiableText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
  },
  rangeBox: {
    padding: 16,
    borderRadius: 12,
  },
  rangeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  rangeValues: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeItem: {
    alignItems: 'center',
  },
  rangeAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  rangeHint: {
    fontSize: 11,
    marginTop: 2,
  },
  rangeDivider: {
    marginHorizontal: 16,
  },
  termsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  termsText: {
    fontSize: 12,
    flex: 1,
  },
  depositBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  depositText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BudgetModule;
