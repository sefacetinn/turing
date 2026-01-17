import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { DraftRequest } from '../../data/offersData';
import { categoryConfig } from '../../data/categoryRequestData';

interface DraftCardProps {
  draft: DraftRequest;
  onContinue: () => void;
  onDelete: () => void;
}

export function DraftCard({ draft, onContinue, onDelete }: DraftCardProps) {
  const { colors, isDark } = useTheme();

  const categoryInfo = categoryConfig[draft.category] || {
    title: draft.categoryName,
    icon: 'document-outline',
    gradient: ['#4b30b8', '#8b5cf6'],
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCompletionPercentage = () => {
    const formKeys = Object.keys(draft.formData);
    const filledKeys = formKeys.filter(key => draft.formData[key]);
    if (formKeys.length === 0) return 0;
    return Math.round((filledKeys.length / formKeys.length) * 100);
  };

  const completion = getCompletionPercentage();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.cardBackground : '#fff',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border,
        },
      ]}
      onPress={onContinue}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${categoryInfo.gradient[0]}15` },
          ]}
        >
          <Ionicons
            name={categoryInfo.icon as any}
            size={20}
            color={categoryInfo.gradient[0]}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.categoryName, { color: categoryInfo.gradient[0] }]}>
            {categoryInfo.title}
          </Text>
          <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
            {draft.eventTitle}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            Tamamlanma
          </Text>
          <Text style={[styles.progressValue, { color: colors.text }]}>
            %{completion}
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${completion}%`,
                backgroundColor: completion === 100 ? colors.success : colors.warning,
              },
            ]}
          />
        </View>
      </View>

      {/* Details */}
      {draft.budget && (
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            Bütçe: {Number(draft.budget).toLocaleString('tr-TR')} TL
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            Son düzenleme: {formatDate(draft.updatedAt)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.warning }]}
          onPress={onContinue}
        >
          <Text style={styles.continueButtonText}>Devam Et</Text>
          <Ionicons name="arrow-forward" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
