import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';

interface CancelEventModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string, refundOption: string) => void;
  eventTitle: string;
  eventDate: string;
  totalSpent: number;
  confirmedProviders: number;
}

const cancellationReasons = [
  { id: 'force_majeure', label: 'Mücbir Sebep', description: 'Doğal afet, salgın, vb.' },
  { id: 'venue_issue', label: 'Mekan Sorunu', description: 'Mekan iptal veya değişiklik' },
  { id: 'artist_cancel', label: 'Sanatçı İptali', description: 'Sanatçı katılamıyor' },
  { id: 'budget', label: 'Bütçe Yetersizliği', description: 'Mali sebepler' },
  { id: 'low_sales', label: 'Düşük Bilet Satışı', description: 'Yetersiz talep' },
  { id: 'other', label: 'Diğer', description: 'Farklı bir sebep' },
];

const refundOptions = [
  { id: 'full', label: 'Tam İade', description: 'Tedarikçilere tam ödeme yapılacak' },
  { id: 'partial', label: 'Kısmi İade', description: 'Yapılan işler için ödeme' },
  { id: 'negotiate', label: 'Görüşme', description: 'Her tedarikçi ile ayrıca görüşülecek' },
];

export function CancelEventModal({
  visible,
  onClose,
  onConfirm,
  eventTitle,
  eventDate,
  totalSpent,
  confirmedProviders,
}: CancelEventModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const handleNextStep = () => {
    if (step === 1 && selectedReason && selectedRefund) {
      setStep(2);
    }
  };

  const handleConfirm = () => {
    if (confirmText.toLowerCase() === 'iptal et') {
      onConfirm(selectedReason!, selectedRefund!);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setSelectedReason(null);
    setSelectedRefund(null);
    setAdditionalNotes('');
    setConfirmText('');
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isStep1Valid = selectedReason && selectedRefund;
  const isConfirmValid = confirmText.toLowerCase() === 'iptal et';

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
              <Ionicons name="warning" size={24} color={colors.error} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Etkinlik İptali</Text>
              <Text style={styles.headerSubtitle}>{eventTitle}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {step === 1 ? (
              <>
                {/* Warning Box */}
                <View style={styles.warningBox}>
                  <Ionicons name="alert-circle" size={20} color={colors.error} />
                  <View style={styles.warningContent}>
                    <Text style={styles.warningTitle}>Bu işlem geri alınamaz!</Text>
                    <Text style={styles.warningText}>
                      Etkinlik iptal edildiğinde tüm tedarikçilere bildirim gönderilecek
                      ve sözleşmeler feshedilecektir.
                    </Text>
                  </View>
                </View>

                {/* Event Summary */}
                <View style={styles.summaryBox}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Tarih</Text>
                    <Text style={styles.summaryValue}>{eventDate}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Harcanan</Text>
                    <Text style={styles.summaryValue}>₺{totalSpent.toLocaleString('tr-TR')}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Tedarikçi</Text>
                    <Text style={styles.summaryValue}>{confirmedProviders}</Text>
                  </View>
                </View>

                {/* Cancellation Reason */}
                <Text style={styles.sectionLabel}>İptal Sebebi</Text>
                <View style={styles.optionsList}>
                  {cancellationReasons.map((reason) => (
                    <TouchableOpacity
                      key={reason.id}
                      style={[
                        styles.optionCard,
                        selectedReason === reason.id && styles.optionCardActive,
                      ]}
                      onPress={() => setSelectedReason(reason.id)}
                    >
                      <View style={[
                        styles.optionRadio,
                        selectedReason === reason.id && styles.optionRadioActive,
                      ]}>
                        {selectedReason === reason.id && (
                          <View style={styles.optionRadioInner} />
                        )}
                      </View>
                      <View style={styles.optionContent}>
                        <Text style={[
                          styles.optionLabel,
                          selectedReason === reason.id && styles.optionLabelActive,
                        ]}>
                          {reason.label}
                        </Text>
                        <Text style={styles.optionDescription}>{reason.description}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Refund Option */}
                <Text style={styles.sectionLabel}>İade Seçeneği</Text>
                <View style={styles.optionsList}>
                  {refundOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        selectedRefund === option.id && styles.optionCardActive,
                      ]}
                      onPress={() => setSelectedRefund(option.id)}
                    >
                      <View style={[
                        styles.optionRadio,
                        selectedRefund === option.id && styles.optionRadioActive,
                      ]}>
                        {selectedRefund === option.id && (
                          <View style={styles.optionRadioInner} />
                        )}
                      </View>
                      <View style={styles.optionContent}>
                        <Text style={[
                          styles.optionLabel,
                          selectedRefund === option.id && styles.optionLabelActive,
                        ]}>
                          {option.label}
                        </Text>
                        <Text style={styles.optionDescription}>{option.description}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Additional Notes */}
                <Text style={styles.sectionLabel}>Ek Notlar (Opsiyonel)</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Tedarikçilere iletmek istediğiniz ek bilgiler..."
                  placeholderTextColor={colors.zinc[600]}
                  value={additionalNotes}
                  onChangeText={setAdditionalNotes}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </>
            ) : (
              <>
                {/* Confirmation Step */}
                <View style={styles.confirmationBox}>
                  <View style={styles.confirmationIcon}>
                    <Ionicons name="trash" size={32} color={colors.error} />
                  </View>
                  <Text style={styles.confirmationTitle}>Emin misiniz?</Text>
                  <Text style={styles.confirmationText}>
                    "{eventTitle}" etkinliği kalıcı olarak iptal edilecek.
                    Bu işlemi onaylamak için aşağıya "iptal et" yazın.
                  </Text>
                </View>

                <View style={styles.confirmInputContainer}>
                  <Text style={styles.confirmInputLabel}>
                    Onaylamak için "iptal et" yazın
                  </Text>
                  <TextInput
                    style={[
                      styles.confirmInput,
                      isConfirmValid && styles.confirmInputValid,
                    ]}
                    placeholder="iptal et"
                    placeholderTextColor={colors.zinc[600]}
                    value={confirmText}
                    onChangeText={setConfirmText}
                    autoCapitalize="none"
                  />
                </View>

                {/* Impact Summary */}
                <View style={styles.impactBox}>
                  <Text style={styles.impactTitle}>Etkilenecek İşlemler:</Text>
                  <View style={styles.impactItem}>
                    <Ionicons name="close-circle" size={16} color={colors.error} />
                    <Text style={styles.impactText}>
                      {confirmedProviders} tedarikçiye iptal bildirimi
                    </Text>
                  </View>
                  <View style={styles.impactItem}>
                    <Ionicons name="close-circle" size={16} color={colors.error} />
                    <Text style={styles.impactText}>
                      Tüm sözleşmelerin feshi
                    </Text>
                  </View>
                  <View style={styles.impactItem}>
                    <Ionicons name="close-circle" size={16} color={colors.error} />
                    <Text style={styles.impactText}>
                      ₺{totalSpent.toLocaleString('tr-TR')} tutarında iade işlemi
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {step === 1 ? (
              <>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.cancelButtonText}>Vazgeç</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nextButton, !isStep1Valid && styles.nextButtonDisabled]}
                  onPress={handleNextStep}
                  disabled={!isStep1Valid}
                >
                  <Text style={[
                    styles.nextButtonText,
                    !isStep1Valid && styles.nextButtonTextDisabled
                  ]}>
                    Devam Et
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={isStep1Valid ? colors.text : colors.zinc[600]}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
                  <Ionicons name="arrow-back" size={18} color={colors.text} />
                  <Text style={styles.backButtonText}>Geri</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteButton, !isConfirmValid && styles.deleteButtonDisabled]}
                  onPress={handleConfirm}
                  disabled={!isConfirmValid}
                >
                  <Ionicons name="trash" size={18} color="white" />
                  <Text style={styles.deleteButtonText}>Etkinliği İptal Et</Text>
                </TouchableOpacity>
              </>
            )}
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.error,
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: colors.zinc[400],
    lineHeight: 20,
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.zinc[500],
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  optionsList: {
    gap: 8,
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  optionCardActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.zinc[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioActive: {
    borderColor: colors.error,
  },
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  optionLabelActive: {
    color: colors.error,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.zinc[500],
    marginTop: 2,
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: colors.text,
    height: 80,
    marginBottom: 20,
  },
  confirmationBox: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  confirmationIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  confirmationText: {
    fontSize: 14,
    color: colors.zinc[400],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  confirmInputContainer: {
    marginBottom: 24,
  },
  confirmInputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.zinc[400],
    marginBottom: 8,
  },
  confirmInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  confirmInputValid: {
    borderColor: colors.error,
  },
  impactBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  impactTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  impactText: {
    fontSize: 13,
    color: colors.zinc[400],
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  nextButtonTextDisabled: {
    color: colors.zinc[600],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: colors.error,
    gap: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});
