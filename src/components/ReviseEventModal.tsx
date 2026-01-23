import React, { useState, useMemo } from 'react';
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
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { colors, gradients } from '../theme/colors';
import { CalendarPickerModal } from './createEvent/CalendarPickerModal';
import { locationData, Venue } from '../data/createEventData';
import { addDocument, updateDocument, Collections } from '../services/firebase/firestore';
import { uriToBlob, uploadFile } from '../services/firebase/storage';
import { Timestamp } from 'firebase/firestore';

// Provider info for the event
interface EventProvider {
  id: string;
  name: string;
  category: string;
  offerId?: string;
}

interface ReviseEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: RevisionData) => void;
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  eventVenue?: string;
  eventBudget?: number;
  eventCity?: string;
  eventDistrict?: string;
  eventImage?: string;
  confirmedProviders?: EventProvider[];
}

interface RevisionData {
  type: string;
  title: string;
  description: string;
  date?: string;
  venue?: string;
  budget?: string;
  image?: string;
}

const revisionTypes = [
  { id: 'image', label: 'Görsel Değişikliği', icon: 'image-outline' as const },
  { id: 'date', label: 'Tarih Değişikliği', icon: 'calendar-outline' as const },
  { id: 'venue', label: 'Mekan Değişikliği', icon: 'location-outline' as const },
  { id: 'budget', label: 'Bütçe Güncelleme', icon: 'wallet-outline' as const },
  { id: 'other', label: 'Diğer', icon: 'create-outline' as const },
];

// Format number with thousand separators (Turkish format)
const formatBudget = (value: string): string => {
  const numericValue = value.replace(/\D/g, '');
  if (!numericValue) return '';
  return parseInt(numericValue).toLocaleString('tr-TR');
};

// Parse formatted budget back to number string
const parseBudget = (value: string): string => {
  return value.replace(/\./g, '');
};

// Get all venues from all cities
const getAllVenues = (): Venue[] => {
  const allVenues: Venue[] = [];
  Object.keys(locationData).forEach(city => {
    const cityData = locationData[city];
    if (cityData.venues) {
      Object.keys(cityData.venues).forEach(district => {
        cityData.venues[district].forEach(venue => {
          allVenues.push({
            ...venue,
            id: `${city}-${district}-${venue.name}`,
          });
        });
      });
    }
  });
  return allVenues;
};

export function ReviseEventModal({
  visible,
  onClose,
  onSubmit,
  eventId,
  eventTitle,
  eventDate,
  eventVenue,
  eventBudget,
  eventCity,
  eventDistrict,
  eventImage,
  confirmedProviders = []
}: ReviseEventModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newDate, setNewDate] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [newVenue, setNewVenue] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVenuePicker, setShowVenuePicker] = useState(false);
  const [venueSearch, setVenueSearch] = useState('');

  // Image picker function
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewImage(result.assets[0].uri);
    }
  };

  // Get all available venues
  const allVenues = useMemo(() => getAllVenues(), []);

  // Filter venues based on search
  const filteredVenues = useMemo(() => {
    if (!venueSearch) return allVenues;
    const search = venueSearch.toLowerCase();
    return allVenues.filter(v =>
      v.name.toLowerCase().includes(search) ||
      v.capacity.toLowerCase().includes(search)
    );
  }, [allVenues, venueSearch]);

  const handleDateSelect = (dates: string[]) => {
    setSelectedDates(dates);
    if (dates.length > 0) {
      // Format the date for display
      const [year, month, day] = dates[0].split('-');
      const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      setNewDate(`${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`);
    }
    setShowCalendar(false);
  };

  const handleVenueSelect = (venue: Venue) => {
    setNewVenue(venue.name);
    setShowVenuePicker(false);
    setVenueSearch('');
  };

  const handleBudgetChange = (value: string) => {
    const formatted = formatBudget(value);
    setNewBudget(formatted);
  };

  const handleSubmit = async () => {
    if (!selectedType || !title || !description) return;

    setIsSaving(true);

    try {
      // Determine old and new values based on revision type
      let oldValue: string | undefined;
      let newValue: string | undefined;

      if (selectedType === 'image') {
        oldValue = eventImage;
        // Upload new image to Firebase Storage
        if (newImage && (newImage.startsWith('file://') || newImage.startsWith('ph://') || newImage.startsWith('content://'))) {
          setIsUploadingImage(true);
          try {
            const imageBlob = await uriToBlob(newImage);
            const imagePath = `events/${eventId}/image_${Date.now()}.jpg`;
            const imageUrl = await uploadFile(imagePath, imageBlob, { contentType: 'image/jpeg' });
            newValue = imageUrl;
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
            Alert.alert('Hata', 'Görsel yüklenirken bir hata oluştu.');
            setIsSaving(false);
            setIsUploadingImage(false);
            return;
          } finally {
            setIsUploadingImage(false);
          }
        }
      } else if (selectedType === 'date') {
        oldValue = eventDate;
        newValue = selectedDates[0];
      } else if (selectedType === 'venue') {
        oldValue = eventVenue;
        newValue = newVenue;
      } else if (selectedType === 'budget') {
        oldValue = eventBudget?.toString();
        newValue = parseBudget(newBudget);
      }

      // Create provider approvals map (all start as pending)
      const providerApprovals: Record<string, {
        status: 'pending' | 'approved' | 'rejected';
        respondedAt?: any;
        comment?: string;
      }> = {};

      confirmedProviders.forEach(provider => {
        providerApprovals[provider.id] = {
          status: 'pending',
        };
      });

      // Create revision document
      const revisionData = {
        eventId,
        eventTitle,
        type: selectedType,
        title,
        description,
        oldValue: oldValue || null,
        newValue: newValue || null,
        requestedAt: Timestamp.now(),
        status: confirmedProviders.length > 0 ? 'pending_approval' : 'approved',
        providerApprovals,
        totalProviders: confirmedProviders.length,
        approvedCount: 0,
        rejectedCount: 0,
      };

      // Save revision to Firestore
      const revisionId = await addDocument(Collections.EVENT_REVISIONS || 'eventRevisions', revisionData);
      console.log('[ReviseEventModal] Revision created:', revisionId);

      // If no providers to approve, apply the change directly
      if (confirmedProviders.length === 0) {
        await applyRevisionToEvent(selectedType, newValue);
        Alert.alert(
          'Değişiklik Kaydedildi',
          'Etkinlik bilgileri güncellendi.',
          [{ text: 'Tamam' }]
        );
      } else {
        // Notify providers about the revision request
        // In a real app, this would send push notifications
        Alert.alert(
          'Değişiklik Talebi Gönderildi',
          `${confirmedProviders.length} tedarikçiye bildirim gönderildi. Onay bekliyor.`,
          [{ text: 'Tamam' }]
        );
      }

      // Call the onSubmit callback
      onSubmit({
        type: selectedType,
        title,
        description,
        date: selectedDates[0] || undefined,
        venue: newVenue || undefined,
        budget: newBudget ? parseBudget(newBudget) : undefined,
      });

      // Reset form
      resetForm();
      onClose();
    } catch (error) {
      console.warn('Error saving revision:', error);
      Alert.alert('Hata', 'Değişiklik kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  // Apply revision directly to event (when no approval needed or all approved)
  const applyRevisionToEvent = async (type: string, newValue?: string) => {
    if (!newValue) return;

    const updateData: Record<string, any> = {};

    if (type === 'image') {
      updateData.image = newValue;
    } else if (type === 'date') {
      updateData.date = newValue;
    } else if (type === 'venue') {
      updateData.venue = newValue;
    } else if (type === 'budget') {
      updateData.budget = parseInt(newValue) || 0;
    }

    if (Object.keys(updateData).length > 0) {
      await updateDocument(Collections.EVENTS, eventId, updateData);
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setTitle('');
    setDescription('');
    setNewDate('');
    setSelectedDates([]);
    setNewVenue('');
    setNewBudget('');
    setNewImage(null);
  };

  // Form validation - for image type, also require a new image to be selected
  const isFormValid = selectedType && title.length > 0 && description.length > 0 &&
    (selectedType !== 'image' || newImage !== null);

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
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowCalendar(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color={colors.brand[400]} />
                    <Text style={[styles.pickerButtonText, !newDate && styles.pickerPlaceholder]}>
                      {newDate || 'Tarih Seçin'}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.zinc[500]} />
                  </TouchableOpacity>
                </View>
              )}

              {selectedType === 'venue' && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Yeni Mekan</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowVenuePicker(true)}
                  >
                    <Ionicons name="location-outline" size={20} color={colors.brand[400]} />
                    <Text style={[styles.pickerButtonText, !newVenue && styles.pickerPlaceholder]}>
                      {newVenue || 'Mekan Seçin'}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.zinc[500]} />
                  </TouchableOpacity>
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
                      onChangeText={handleBudgetChange}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              {selectedType === 'image' && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Yeni Görsel</Text>
                  <TouchableOpacity
                    style={styles.imagePickerButton}
                    onPress={pickImage}
                  >
                    {newImage ? (
                      <Image source={{ uri: newImage }} style={styles.imagePreview} />
                    ) : eventImage ? (
                      <>
                        <Image source={{ uri: eventImage }} style={styles.imagePreviewCurrent} />
                        <View style={styles.imageOverlay}>
                          <Ionicons name="camera" size={28} color="white" />
                          <Text style={styles.imageOverlayText}>Değiştirmek için dokun</Text>
                        </View>
                      </>
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={40} color={colors.zinc[500]} />
                        <Text style={styles.imagePlaceholderText}>Görsel Seç</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {newImage && (
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setNewImage(null)}
                    >
                      <Ionicons name="close-circle" size={20} color={colors.error} />
                      <Text style={styles.removeImageText}>Seçimi Kaldır</Text>
                    </TouchableOpacity>
                  )}
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
                style={[styles.submitButton, (!isFormValid || isSaving) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!isFormValid || isSaving}
              >
                <LinearGradient
                  colors={isFormValid && !isSaving ? gradients.primary : ['#3f3f46', '#3f3f46']}
                  style={styles.submitButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={18} color="white" />
                      <Text style={styles.submitButtonText}>
                        {confirmedProviders.length > 0 ? 'Onaya Gönder' : 'Değişikliği Kaydet'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Calendar Picker Modal */}
      <CalendarPickerModal
        visible={showCalendar}
        selectedDates={selectedDates}
        onDatesChange={handleDateSelect}
        onClose={() => setShowCalendar(false)}
        multiSelect={false}
      />

      {/* Venue Picker Modal */}
      <Modal
        visible={showVenuePicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowVenuePicker(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.venuePickerContainer}>
            <View style={styles.venuePickerHeader}>
              <Text style={styles.venuePickerTitle}>Mekan Seçin</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowVenuePicker(false);
                  setVenueSearch('');
                }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.venueSearchContainer}>
              <Ionicons name="search" size={18} color={colors.zinc[500]} />
              <TextInput
                style={styles.venueSearchInput}
                placeholder="Mekan ara..."
                placeholderTextColor={colors.zinc[600]}
                value={venueSearch}
                onChangeText={setVenueSearch}
              />
              {venueSearch.length > 0 && (
                <TouchableOpacity onPress={() => setVenueSearch('')}>
                  <Ionicons name="close-circle" size={18} color={colors.zinc[500]} />
                </TouchableOpacity>
              )}
            </View>

            {/* Venue List */}
            <FlatList
              data={filteredVenues}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.venueItem}
                  onPress={() => handleVenueSelect(item)}
                >
                  <View style={styles.venueItemIcon}>
                    <Ionicons name="business-outline" size={20} color={colors.brand[400]} />
                  </View>
                  <View style={styles.venueItemInfo}>
                    <Text style={styles.venueItemName}>{item.name}</Text>
                    <Text style={styles.venueItemCapacity}>Kapasite: {item.capacity}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.zinc[500]} />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.venueListContent}
              ListEmptyComponent={
                <View style={styles.emptyVenueList}>
                  <Ionicons name="location-outline" size={48} color={colors.zinc[600]} />
                  <Text style={styles.emptyVenueText}>Mekan bulunamadı</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'rgba(75, 48, 184, 0.1)',
    borderColor: 'rgba(75, 48, 184, 0.3)',
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  pickerPlaceholder: {
    color: colors.zinc[600],
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
  // Venue Picker Styles
  venuePickerContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '60%',
  },
  venuePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  venuePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  venueSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 14,
    margin: 16,
    gap: 10,
  },
  venueSearchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  venueListContent: {
    paddingHorizontal: 16,
    paddingBottom: 34,
  },
  venueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  venueItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueItemInfo: {
    flex: 1,
  },
  venueItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  venueItemCapacity: {
    fontSize: 13,
    color: colors.zinc[500],
    marginTop: 2,
  },
  emptyVenueList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyVenueText: {
    fontSize: 14,
    color: colors.zinc[500],
    marginTop: 12,
  },
  // Image picker styles
  imagePickerButton: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imagePreviewCurrent: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  imageOverlayText: {
    fontSize: 13,
    color: 'white',
    marginTop: 8,
    fontWeight: '500',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: colors.zinc[500],
    marginTop: 8,
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  removeImageText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
  },
});
