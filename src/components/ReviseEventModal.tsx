import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';

interface ReviseEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: RevisionData) => void;
  eventTitle: string;
}

interface RevisionData {
  type: string;
  title: string;
  description: string;
  date?: string;
  venue?: string;
  budget?: string;
}

const revisionTypes = [
  { id: 'date', label: 'Tarih Değişikliği', icon: 'calendar-outline' as const },
  { id: 'venue', label: 'Mekan Değişikliği', icon: 'location-outline' as const },
  { id: 'budget', label: 'Bütçe Güncelleme', icon: 'wallet-outline' as const },
  { id: 'service', label: 'Hizmet Ekleme/Çıkarma', icon: 'list-outline' as const },
  { id: 'other', label: 'Diğer', icon: 'create-outline' as const },
];

export function ReviseEventModal({ visible, onClose, onSubmit, eventTitle }: ReviseEventModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newBudget, setNewBudget] = useState('');

  const handleSubmit = () => {
    if (!selectedType || !title || !description) return;

    onSubmit({
      type: selectedType,
      title,
      description,
      date: newDate || undefined,
      venue: newVenue || undefined,
      budget: newBudget || undefined,
    });

    // Reset form
    setSelectedType(null);
    setTitle('');
    setDescription('');
    setNewDate('');
    setNewVenue('');
    setNewBudget('');
    onClose();
  };

  const isFormValid = selectedType && title.length > 0 && description.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Etkinlik Düzenle</Text>
                <Text style={styles.headerSubtitle}>{eventTitle}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Revision Type Selection */}
              <Text style={styles.sectionLabel}>Değişiklik Türü</Text>
              <View style={styles.typeGrid}>
                {revisionTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeCard,
                      selectedType === type.id && styles.typeCardActive,
                    ]}
                    onPress={() => setSelectedType(type.id)}
                  >
                    <Ionicons
                      name={type.icon}
                      size={24}
                      color={selectedType === type.id ? colors.brand[400] : colors.zinc[500]}
                    />
                    <Text
                      style={[
                        styles.typeLabel,
                        selectedType === type.id && styles.typeLabelActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Dynamic Fields based on type */}
              {selectedType === 'date' && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Yeni Tarih</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: 20 Ağustos 2024"
                    placeholderTextColor={colors.zinc[600]}
                    value={newDate}
                    onChangeText={setNewDate}
                  />
                </View>
              )}

              {selectedType === 'venue' && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Yeni Mekan</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: Zorlu PSM"
                    placeholderTextColor={colors.zinc[600]}
                    value={newVenue}
                    onChangeText={setNewVenue}
                  />
                </View>
              )}

              {selectedType === 'budget' && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Yeni Bütçe</Text>
                  <View style={styles.currencyInputContainer}>
                    <Text style={styles.currencySymbol}>₺</Text>
                    <TextInput
                      style={styles.currencyInput}
                      placeholder="0"
                      placeholderTextColor={colors.zinc[600]}
                      value={newBudget}
                      onChangeText={setNewBudget}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              {/* Title */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Değişiklik Başlığı</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Kısa bir başlık yazın"
                  placeholderTextColor={colors.zinc[600]}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Description */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Açıklama</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Değişikliğin detaylarını açıklayın..."
                  placeholderTextColor={colors.zinc[600]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Info Note */}
              <View style={styles.infoNote}>
                <Ionicons name="information-circle-outline" size={18} color={colors.info} />
                <Text style={styles.infoNoteText}>
                  Değişiklik talebi tedarikçilere bildirilecek ve onayları istenecektir.
                </Text>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!isFormValid}
              >
                <LinearGradient
                  colors={isFormValid ? gradients.primary : ['#3f3f46', '#3f3f46']}
                  style={styles.submitButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark" size={18} color="white" />
                  <Text style={styles.submitButtonText}>Değişikliği Kaydet</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.zinc[500],
    marginTop: 4,
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  typeCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  typeCardActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.zinc[400],
    flex: 1,
  },
  typeLabelActive: {
    color: colors.brand[400],
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.zinc[400],
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.brand[400],
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
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
  submitButton: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});
