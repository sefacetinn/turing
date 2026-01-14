import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { gradients } from '../../theme/colors';

interface ReviewTarget {
  id: string;
  name: string;
  image: string;
  type: 'provider' | 'organizer';
  serviceCategory?: string;
}

interface PendingReviewCardProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventImage: string;
  targets: ReviewTarget[];
  dueDate: string;
  onReview: (target: ReviewTarget) => void;
}

export function PendingReviewCard({
  eventId,
  eventTitle,
  eventDate,
  eventImage,
  targets,
  dueDate,
  onReview,
}: PendingReviewCardProps) {
  const { colors, isDark, helpers } = useTheme();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();
  const isUrgent = daysRemaining <= 3;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
        },
        isDark ? {} : helpers.getShadow('sm'),
      ]}
    >
      {/* Event Header */}
      <View style={styles.eventHeader}>
        <Image source={{ uri: eventImage }} style={styles.eventImage} />
        <View style={styles.eventInfo}>
          <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
            {eventTitle}
          </Text>
          <Text style={[styles.eventDate, { color: colors.textMuted }]}>
            {eventDate} • Tamamlandı
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]} />

      {/* Targets to Review */}
      <View style={styles.targetsSection}>
        <Text style={[styles.targetsLabel, { color: colors.textMuted }]}>Değerlendir:</Text>
        {targets.map((target, index) => (
          <TouchableOpacity
            key={target.id}
            style={[
              styles.targetRow,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
              },
            ]}
            onPress={() => onReview(target)}
            activeOpacity={0.7}
          >
            {target.image ? (
              <Image source={{ uri: target.image }} style={styles.targetAvatar} />
            ) : (
              <View
                style={[
                  styles.targetAvatarPlaceholder,
                  { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.1)' },
                ]}
              >
                <Text style={[styles.targetAvatarText, { color: colors.brand[400] }]}>
                  {getInitials(target.name)}
                </Text>
              </View>
            )}
            <View style={styles.targetInfo}>
              <Text style={[styles.targetName, { color: colors.text }]} numberOfLines={1}>
                {target.name}
              </Text>
              {target.serviceCategory && (
                <Text style={[styles.targetCategory, { color: colors.textMuted }]}>
                  {target.serviceCategory}
                </Text>
              )}
            </View>
            <View style={styles.reviewButton}>
              <LinearGradient
                colors={gradients.primary}
                style={styles.reviewButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.reviewButtonText}>Değerlendir</Text>
                <Ionicons name="arrow-forward" size={14} color="white" />
              </LinearGradient>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Due Date Warning */}
      <View
        style={[
          styles.dueWarning,
          {
            backgroundColor: isUrgent
              ? isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'
              : isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
          },
        ]}
      >
        <Ionicons
          name={isUrgent ? 'warning' : 'time-outline'}
          size={14}
          color={isUrgent ? colors.error : colors.warning}
        />
        <Text
          style={[
            styles.dueWarningText,
            { color: isUrgent ? colors.error : colors.warning },
          ]}
        >
          {daysRemaining > 0
            ? `${daysRemaining} gün içinde değerlendir`
            : 'Son gün!'}
        </Text>
      </View>
    </View>
  );
}

// Single target pending review (simpler version)
interface SinglePendingReviewProps {
  eventTitle: string;
  eventDate: string;
  targetName: string;
  targetImage: string;
  serviceCategory?: string;
  onReview: () => void;
}

export function SinglePendingReview({
  eventTitle,
  eventDate,
  targetName,
  targetImage,
  serviceCategory,
  onReview,
}: SinglePendingReviewProps) {
  const { colors, isDark, helpers } = useTheme();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TouchableOpacity
      style={[
        styles.singleContainer,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
        },
        isDark ? {} : helpers.getShadow('sm'),
      ]}
      onPress={onReview}
      activeOpacity={0.7}
    >
      {targetImage ? (
        <Image source={{ uri: targetImage }} style={styles.singleAvatar} />
      ) : (
        <View
          style={[
            styles.singleAvatarPlaceholder,
            { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.1)' },
          ]}
        >
          <Text style={[styles.singleAvatarText, { color: colors.brand[400] }]}>
            {getInitials(targetName)}
          </Text>
        </View>
      )}
      <View style={styles.singleInfo}>
        <Text style={[styles.singleName, { color: colors.text }]} numberOfLines={1}>
          {targetName}
        </Text>
        <Text style={[styles.singleMeta, { color: colors.textMuted }]} numberOfLines={1}>
          {serviceCategory && `${serviceCategory} • `}{eventTitle}
        </Text>
      </View>
      <View style={[styles.singleAction, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.1)' }]}>
        <Ionicons name="star-outline" size={16} color={colors.brand[400]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  eventImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  eventInfo: {
    marginLeft: 12,
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
  targetsSection: {
    padding: 14,
  },
  targetsLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  targetAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  targetAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetAvatarText: {
    fontSize: 13,
    fontWeight: '600',
  },
  targetInfo: {
    marginLeft: 12,
    flex: 1,
  },
  targetName: {
    fontSize: 14,
    fontWeight: '500',
  },
  targetCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  reviewButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  reviewButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  reviewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  dueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 6,
  },
  dueWarningText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Single version styles
  singleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  singleAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  singleAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleAvatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  singleInfo: {
    marginLeft: 12,
    flex: 1,
  },
  singleName: {
    fontSize: 14,
    fontWeight: '600',
  },
  singleMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  singleAction: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
