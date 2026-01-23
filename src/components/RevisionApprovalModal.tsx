import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import {
  EventRevision,
  getRevisionTypeLabel,
  getRevisionTypeIcon,
  formatRevisionValue,
} from '../hooks/useEventRevisions';

interface RevisionApprovalModalProps {
  visible: boolean;
  revision: EventRevision | null;
  onClose: () => void;
  onApprove: (revisionId: string, comment?: string) => Promise<boolean>;
  onReject: (revisionId: string, comment?: string) => Promise<boolean>;
}

export function RevisionApprovalModal({
  visible,
  revision,
  onClose,
  onApprove,
  onReject,
}: RevisionApprovalModalProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    if (!revision) return;

    setAction('approve');
    setIsSubmitting(true);

    try {
      const success = await onApprove(revision.id, comment.trim() || undefined);
      if (success) {
        Alert.alert(
          'Onaylandı',
          'Değişiklik talebini onayladınız.',
          [{ text: 'Tamam', onPress: handleClose }]
        );
      } else {
        Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
      }
    } catch (error) {
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
      setAction(null);
    }
  };

  const handleReject = async () => {
    if (!revision) return;

    // Require comment for rejection
    if (!comment.trim()) {
      Alert.alert(
        'Yorum Gerekli',
        'Reddetme işlemi için bir açıklama yazmanız gerekmektedir.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    setAction('reject');
    setIsSubmitting(true);

    try {
      const success = await onReject(revision.id, comment.trim());
      if (success) {
        Alert.alert(
          'Reddedildi',
          'Değişiklik talebini reddettiniz.',
          [{ text: 'Tamam', onPress: handleClose }]
        );
      } else {
        Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
      }
    } catch (error) {
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
      setAction(null);
    }
  };

  const handleClose = () => {
    setComment('');
    setAction(null);
    onClose();
  };

  if (!revision) return null;

  const typeLabel = getRevisionTypeLabel(revision.type);
  const typeIcon = getRevisionTypeIcon(revision.type);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name={typeIcon as any} size={24} color={colors.brand[400]} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Değişiklik Talebi</Text>
              <Text style={styles.headerSubtitle}>{typeLabel}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Event Info */}
            <View style={styles.eventInfo}>
              <Ionicons name="calendar" size={16} color={colors.zinc[500]} />
              <Text style={styles.eventTitle}>{revision.eventTitle}</Text>
            </View>

            {/* Revision Title */}
            <Text style={styles.revisionTitle}>{revision.title}</Text>
            <Text style={styles.revisionDescription}>{revision.description}</Text>

            {/* Change Details */}
            <View style={styles.changeContainer}>
              <View style={styles.changeRow}>
                <View style={styles.changeBox}>
                  <Text style={styles.changeLabel}>Mevcut</Text>
                  <Text style={styles.changeValue}>
                    {formatRevisionValue(revision.type, revision.oldValue)}
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Ionicons name="arrow-forward" size={20} color={colors.brand[400]} />
                </View>
                <View style={[styles.changeBox, styles.newValueBox]}>
                  <Text style={styles.changeLabel}>Yeni</Text>
                  <Text style={[styles.changeValue, styles.newValue]}>
                    {formatRevisionValue(revision.type, revision.newValue)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Approval Status */}
            <View style={styles.approvalStatus}>
              <Text style={styles.approvalStatusLabel}>Onay Durumu</Text>
              <View style={styles.approvalProgress}>
                <View style={styles.approvalBar}>
                  <View
                    style={[
                      styles.approvalBarFill,
                      {
                        width: `${(revision.approvedCount / revision.totalProviders) * 100}%`,
                        backgroundColor: colors.success,
                      }
                    ]}
                  />
                  <View
                    style={[
                      styles.approvalBarFill,
                      {
                        width: `${(revision.rejectedCount / revision.totalProviders) * 100}%`,
                        backgroundColor: colors.error,
                        position: 'absolute',
                        right: 0,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.approvalText}>
                  {revision.approvedCount} / {revision.totalProviders} onayladı
                </Text>
              </View>
            </View>

            {/* Comment Input */}
            <View style={styles.commentContainer}>
              <Text style={styles.commentLabel}>
                Yorum <Text style={styles.commentOptional}>(Reddetme için zorunlu)</Text>
              </Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Varsa yorumunuzu yazın..."
                placeholderTextColor={colors.zinc[600]}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Info Note */}
            <View style={styles.infoNote}>
              <Ionicons name="information-circle-outline" size={18} color={colors.info} />
              <Text style={styles.infoNoteText}>
                Tüm tedarikçiler onayladığında değişiklik otomatik olarak uygulanacaktır.
                Herhangi bir tedarikçi reddettiğinde değişiklik iptal edilecektir.
              </Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.rejectButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleReject}
              disabled={isSubmitting}
            >
              {isSubmitting && action === 'reject' ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <>
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                  <Text style={styles.rejectButtonText}>Reddet</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.approveButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleApprove}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={isSubmitting ? ['#3f3f46', '#3f3f46'] : ['#059669', '#10b981']}
                style={styles.approveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isSubmitting && action === 'approve' ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={styles.approveButtonText}>Onayla</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 14,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.zinc[500],
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 14,
    color: colors.zinc[400],
  },
  revisionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  revisionDescription: {
    fontSize: 14,
    color: colors.zinc[400],
    lineHeight: 20,
    marginBottom: 20,
  },
  changeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  newValueBox: {
    backgroundColor: 'rgba(75, 48, 184, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(75, 48, 184, 0.2)',
  },
  changeLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.zinc[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  changeValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  newValue: {
    color: colors.brand[400],
  },
  arrowContainer: {
    width: 40,
    alignItems: 'center',
  },
  approvalStatus: {
    marginBottom: 20,
  },
  approvalStatusLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.zinc[400],
    marginBottom: 10,
  },
  approvalProgress: {
    gap: 8,
  },
  approvalBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  approvalBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  approvalText: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  commentContainer: {
    marginBottom: 16,
  },
  commentLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.zinc[400],
    marginBottom: 8,
  },
  commentOptional: {
    fontWeight: '400',
    color: colors.zinc[600],
  },
  commentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    height: 80,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    gap: 10,
    marginBottom: 10,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 13,
    color: colors.info,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: 8,
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.error,
  },
  approveButton: {
    flex: 1.5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  approveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  approveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default RevisionApprovalModal;
