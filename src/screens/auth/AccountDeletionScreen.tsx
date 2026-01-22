import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { clearAllSecureDataIncludingBiometric } from '../../utils/secureStorage';
import { clearAllAuthData } from '../../utils/storage';

interface AccountDeletionScreenProps {
  onConfirmDelete: () => Promise<void>;
  userEmail: string;
}

export function AccountDeletionScreen({
  onConfirmDelete,
  userEmail,
}: AccountDeletionScreenProps) {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');

  const deleteReasons = [
    { id: 'not_using', label: 'Uygulamayi artik kullanmiyorum' },
    { id: 'found_alternative', label: 'Baska bir alternatif buldum' },
    { id: 'privacy', label: 'Gizlilik endiselerim var' },
    { id: 'too_complicated', label: 'Uygulama cok karmasik' },
    { id: 'bugs', label: 'Cok fazla hata/sorun var' },
    { id: 'other', label: 'Diger' },
  ];

  const confirmationText = 'HESABIMI SIL';
  const isConfirmValid = confirmText === confirmationText;

  const toggleReason = (reasonId: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonId)
        ? prev.filter((r) => r !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleDelete = async () => {
    if (!isConfirmValid || isDeleting) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Alert.alert(
      'Son Onay',
      'Hesabiniz ve tum verileriniz kalici olarak silinecek. Bu islem geri alinamaz. Devam etmek istediginize emin misiniz?',
      [
        { text: 'Iptal', style: 'cancel' },
        {
          text: 'Hesabimi Sil',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);

            try {
              // Clear all local secure data
              await clearAllSecureDataIncludingBiometric();
              await clearAllAuthData();

              // Call the deletion handler
              await onConfirmDelete();

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(
                'Hata',
                'Hesap silinirken bir hata olustu. Lutfen daha sonra tekrar deneyin.'
              );
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Warning Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)' },
            ]}
          >
            <Ionicons name="warning" size={48} color={colors.error} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.error }]}>
            Hesabimi Sil
          </Text>

          {/* Warning Message */}
          <View
            style={[
              styles.warningBox,
              { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)' },
            ]}
          >
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={[styles.warningText, { color: colors.error }]}>
              Bu islem geri alinamaz! Hesabiniz ve asagidaki tum verileriniz kalici olarak silinecektir.
            </Text>
          </View>

          {/* Data List */}
          <View style={[styles.dataCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.dataTitle, { color: colors.text }]}>
              Silinecek veriler:
            </Text>
            {[
              'Profil bilgileriniz',
              'Etkinlikleriniz ve teklifleriniz',
              'Mesaj gecmisiniz',
              'Sozlesmeleriniz',
              'Odeme bilgileriniz',
              'Favorileriniz',
            ].map((item, index) => (
              <View key={index} style={styles.dataItem}>
                <Ionicons name="close-circle" size={16} color={colors.error} />
                <Text style={[styles.dataText, { color: colors.textSecondary }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

          {/* Reasons Section */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ayrilma sebebiniz (Istege bagli)
          </Text>
          <View style={styles.reasonsContainer}>
            {deleteReasons.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonItem,
                  {
                    backgroundColor: selectedReasons.includes(reason.id)
                      ? isDark
                        ? 'rgba(124, 58, 237, 0.2)'
                        : 'rgba(124, 58, 237, 0.1)'
                      : colors.cardBackground,
                    borderColor: selectedReasons.includes(reason.id)
                      ? colors.brand[500]
                      : colors.border,
                  },
                ]}
                onPress={() => toggleReason(reason.id)}
              >
                <Ionicons
                  name={selectedReasons.includes(reason.id) ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={selectedReasons.includes(reason.id) ? colors.brand[500] : colors.textMuted}
                />
                <Text style={[styles.reasonText, { color: colors.text }]}>
                  {reason.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ek geri bildirim (Istege bagli)
          </Text>
          <TextInput
            style={[
              styles.feedbackInput,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Deneyiminizi iyilestirmemize yardimci olun..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={feedback}
            onChangeText={setFeedback}
          />

          {/* Confirmation Input */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Onaylamak icin "{confirmationText}" yazin
          </Text>
          <TextInput
            style={[
              styles.confirmInput,
              {
                backgroundColor: colors.cardBackground,
                borderColor: isConfirmValid ? colors.success : colors.border,
                color: colors.text,
              },
            ]}
            placeholder={confirmationText}
            placeholderTextColor={colors.textMuted}
            value={confirmText}
            onChangeText={setConfirmText}
            autoCapitalize="characters"
          />

          {/* Delete Button */}
          <TouchableOpacity
            style={[
              styles.deleteButton,
              {
                backgroundColor: isConfirmValid ? colors.error : colors.zinc[700],
                opacity: isConfirmValid && !isDeleting ? 1 : 0.6,
              },
            ]}
            onPress={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            activeOpacity={0.8}
          >
            {isDeleting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.deleteButtonText}>Hesabimi Kalici Olarak Sil</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
              Vazgec
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  dataCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  dataTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dataText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  reasonsContainer: {
    marginBottom: 24,
    gap: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  reasonText: {
    fontSize: 14,
    flex: 1,
  },
  feedbackInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 24,
  },
  confirmInput: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
