import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { TransactionData, formatCurrency, analyticsColors } from '../../data/analyticsData';

interface TransactionItemProps {
  transaction: TransactionData;
  isLast?: boolean;
}

export function TransactionItem({ transaction, isLast = false }: TransactionItemProps) {
  const { colors, isDark } = useTheme();

  const isIncome = transaction.type === 'income';
  const iconColor = isIncome ? analyticsColors.income : analyticsColors.expense;
  const iconBg = isIncome ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
  const iconName = isIncome ? 'arrow-down-circle' : 'arrow-up-circle';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'cancelled':
        return colors.textMuted;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'pending':
        return 'Bekliyor';
      case 'cancelled':
        return 'İptal';
      default:
        return status;
    }
  };

  return (
    <View
      style={[
        styles.container,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {transaction.category} • {transaction.date}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: iconColor }]}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(transaction.status)}15` },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
            {getStatusLabel(transaction.status)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
  },
  meta: {
    fontSize: 11,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
