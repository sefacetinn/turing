import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { gradients } from '../../theme/colors';
import { StarRatingInput } from './StarRatingInput';
import { TagSelector, PROVIDER_REVIEW_TAGS, ORGANIZER_REVIEW_TAGS } from './TagSelector';

interface RatingTarget {
  id: string;
  name: string;
  image: string;
  type: 'provider' | 'organizer';
}

interface EventInfo {
  id: string;
  title: string;
  date: string;
  serviceCategory?: string;
}

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (review: ReviewData) => void;
  target: RatingTarget;
  event: EventInfo;
  reviewerType: 'organizer' | 'provider';
}

interface ReviewData {
  overallRating: number;
  detailedRatings: {
    communication: number;
    professionalism: number;
    quality: number;
    punctuality: number;
    valueForMoney: number;
    organization: number;
    paymentReliability: number;
    workingConditions: number;
  };
  tags: string[];
  comment: string;
  wouldWorkAgain: boolean;
}

// Rating criteria based on reviewer type
const ORGANIZER_CRITERIA = [
  { key: 'communication', label: 'İletişim' },
  { key: 'professionalism', label: 'Profesyonellik' },
  { key: 'quality', label: 'Hizmet Kalitesi' },
  { key: 'punctuality', label: 'Dakiklik' },
  { key: 'valueForMoney', label: 'Fiyat/Performans' },
];

const PROVIDER_CRITERIA = [
  { key: 'communication', label: 'İletişim' },
  { key: 'organization', label: 'Organizasyon' },
  { key: 'paymentReliability', label: 'Ödeme Güvenilirliği' },
  { key: 'workingConditions', label: 'Çalışma Koşulları' },
];

export function RatingModal({
  visible,
  onClose,
  onSubmit,
  target,
  event,
  reviewerType,
}: RatingModalProps) {
  const { colors, isDark } = useTheme();

  const [overallRating, setOverallRating] = useState(0);
  const [detailedRatings, setDetailedRatings] = useState<Record<string, number>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [wouldWorkAgain, setWouldWorkAgain] = useState<boolean | null>(null);
  const [showDetailedRatings, setShowDetailedRatings] = useState(false);

  const criteria = reviewerType === 'organizer' ? ORGANIZER_CRITERIA : PROVIDER_CRITERIA;
  const tags = reviewerType === 'organizer' ? PROVIDER_REVIEW_TAGS : ORGANIZER_REVIEW_TAGS;

  const handleDetailedRatingChange = (key: string, value: number) => {
    setDetailedRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = () => {
    if (overallRating === 0) {
      Alert.alert('Hata', 'Lütfen genel bir puan verin');
      return;
    }

    if (wouldWorkAgain === null) {
      Alert.alert('Hata', 'Lütfen tekrar çalışır mısınız sorusunu cevaplayın');
      return;
    }

    const reviewData: ReviewData = {
      overallRating,
      detailedRatings: {
        communication: detailedRatings.communication || 0,
        professionalism: detailedRatings.professionalism || 0,
        quality: detailedRatings.quality || 0,
        punctuality: detailedRatings.punctuality || 0,
        valueForMoney: detailedRatings.valueForMoney || 0,
        organization: detailedRatings.organization || 0,
        paymentReliability: detailedRatings.paymentReliability || 0,
        workingConditions: detailedRatings.workingConditions || 0,
      },
      tags: selectedTags,
      comment,
      wouldWorkAgain,
    };

    onSubmit(reviewData);
    resetForm();
  };

  const resetForm = () => {
    setOverallRating(0);
    setDetailedRatings({});
    setSelectedTags([]);
    setComment('');
    setWouldWorkAgain(null);
    setShowDetailedRatings(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Değerlendirme</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Target Info */}
            <View style={[styles.targetCard, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.05)', borderColor: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.1)' }]}>
              {target.image ? (
                <Image source={{ uri: target.image }} style={styles.targetAvatar} />
              ) : (
                <View style={[styles.targetAvatarPlaceholder, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.3)' : 'rgba(147, 51, 234, 0.2)' }]}>
                  <Text style={[styles.targetAvatarText, { color: colors.brand[400] }]}>
                    {getInitials(target.name)}
                  </Text>
                </View>
              )}
              <View style={styles.targetInfo}>
                <Text style={[styles.targetName, { color: colors.text }]}>{target.name}</Text>
                <Text style={[styles.targetMeta, { color: colors.textMuted }]}>
                  {event.serviceCategory && `${event.serviceCategory} • `}{event.title}
                </Text>
              </View>
            </View>

            {/* Overall Rating */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Genel Değerlendirme <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.overallRatingContainer}>
                <StarRatingInput
                  rating={overallRating}
                  onRatingChange={setOverallRating}
                  size="large"
                  showLabel={true}
                />
              </View>
            </View>

            {/* Detailed Ratings Toggle */}
            <TouchableOpacity
              style={[styles.detailedToggle, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}
              onPress={() => setShowDetailedRatings(!showDetailedRatings)}
            >
              <View style={styles.detailedToggleLeft}>
                <Ionicons name="options-outline" size={18} color={colors.brand[400]} />
                <Text style={[styles.detailedToggleText, { color: colors.text }]}>
                  Detaylı Puanlama
                </Text>
                <Text style={[styles.optionalText, { color: colors.textMuted }]}>(opsiyonel)</Text>
              </View>
              <Ionicons
                name={showDetailedRatings ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {/* Detailed Ratings */}
            {showDetailedRatings && (
              <View style={[styles.detailedRatingsCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]}>
                {criteria.map(criterion => (
                  <View key={criterion.key} style={styles.criterionRow}>
                    <Text style={[styles.criterionLabel, { color: colors.textSecondary }]}>
                      {criterion.label}
                    </Text>
                    <StarRatingInput
                      rating={detailedRatings[criterion.key] || 0}
                      onRatingChange={value => handleDetailedRatingChange(criterion.key, value)}
                      size="small"
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Tags */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Bu {target.type === 'provider' ? 'hizmeti' : 'organizatörü'} nasıl tanımlarsınız?
              </Text>
              <TagSelector
                tags={tags}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                maxSelection={5}
              />
              <Text style={[styles.tagHint, { color: colors.textMuted }]}>
                En fazla 5 etiket seçebilirsiniz
              </Text>
            </View>

            {/* Comment */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Yorumunuz</Text>
              <TextInput
                style={[styles.commentInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border, color: colors.text }]}
                placeholder="Deneyiminizi paylaşın..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
            </View>

            {/* Would Work Again */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Bu {target.type === 'provider' ? 'firma' : 'organizatör'} ile tekrar çalışır mısınız? <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.yesNoContainer}>
                <TouchableOpacity
                  style={[styles.yesNoOption, wouldWorkAgain === true && { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)', borderColor: colors.success }]}
                  onPress={() => setWouldWorkAgain(true)}
                >
                  <View style={[styles.radioOuter, { borderColor: wouldWorkAgain === true ? colors.success : colors.textMuted }]}>
                    {wouldWorkAgain === true && <View style={[styles.radioInner, { backgroundColor: colors.success }]} />}
                  </View>
                  <Text style={[styles.yesNoText, { color: wouldWorkAgain === true ? colors.success : colors.text }]}>
                    Evet, kesinlikle
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.yesNoOption, wouldWorkAgain === false && { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)', borderColor: colors.error }]}
                  onPress={() => setWouldWorkAgain(false)}
                >
                  <View style={[styles.radioOuter, { borderColor: wouldWorkAgain === false ? colors.error : colors.textMuted }]}>
                    {wouldWorkAgain === false && <View style={[styles.radioInner, { backgroundColor: colors.error }]} />}
                  </View>
                  <Text style={[styles.yesNoText, { color: wouldWorkAgain === false ? colors.error : colors.text }]}>
                    Hayır
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { opacity: overallRating === 0 || wouldWorkAgain === null ? 0.5 : 1 }]}
              onPress={handleSubmit}
              disabled={overallRating === 0 || wouldWorkAgain === null}
            >
              <LinearGradient
                colors={gradients.primary}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="send" size={18} color="white" />
                <Text style={styles.submitButtonText}>Gönder</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  body: {
    padding: 20,
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  targetAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  targetAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  targetInfo: {
    marginLeft: 14,
    flex: 1,
  },
  targetName: {
    fontSize: 16,
    fontWeight: '600',
  },
  targetMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  required: {
    color: '#ef4444',
  },
  overallRatingContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  detailedToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailedToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionalText: {
    fontSize: 12,
  },
  detailedRatingsCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  criterionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  criterionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  tagHint: {
    fontSize: 11,
    marginTop: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    minHeight: 100,
  },
  yesNoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  yesNoOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  yesNoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 34,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
