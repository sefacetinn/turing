import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { OptimizedImage } from '../components/OptimizedImage';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../../App';
import { addDocument, Collections } from '../services/firebase/firestore';
import { uriToBlob, uploadFile } from '../services/firebase/storage';
import { useUserCompanies } from '../hooks/useCompany';
import {
  StepProgress,
  SelectModal,
  DatePickerModal,
  CalendarPickerModal,
  OperationModal,
} from '../components/createEvent';
import {
  Step,
  DropdownType,
  Venue,
  EventData,
  NewVenueData,
  steps,
  eventTypes,
  serviceCategories,
  operationSubcategories,
  budgetRanges,
  timeOptions,
  cities,
  getFormattedDate,
  getFormattedLocation,
  getAvailableDistricts,
  getAvailableVenues,
  initialEventData,
  initialNewVenueData,
  ageLimitOptions,
  seatingTypeOptions,
  indoorOutdoorOptions,
} from '../data/createEventData';

export function CreateEventScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, userProfile } = useAuth();
  const { isProviderMode } = useApp();
  const { primaryCompany, loading: companyLoading } = useUserCompanies(user?.uid);
  const TAB_BAR_HEIGHT = 80;
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [newVenue, setNewVenue] = useState<NewVenueData>(initialNewVenueData);
  const [customVenues, setCustomVenues] = useState<Venue[]>([]);
  const [eventData, setEventData] = useState<EventData>(initialEventData);
  const [isCreating, setIsCreating] = useState(false);

  // Inline selection state for new venue modal
  const [showCityList, setShowCityList] = useState(false);
  const [showDistrictList, setShowDistrictList] = useState(false);

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const availableDistricts = useMemo(() => getAvailableDistricts(eventData.city), [eventData.city]);
  const newVenueDistricts = useMemo(() => getAvailableDistricts(newVenue.city), [newVenue.city]);
  const availableVenues = useMemo(
    () => getAvailableVenues(eventData.city, eventData.district, customVenues),
    [eventData.city, eventData.district, customVenues]
  );

  // Format selected dates for display
  const formattedDates = useMemo(() => {
    if (eventData.selectedDates.length === 0) return '';
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    if (eventData.selectedDates.length === 1) {
      const [year, month, day] = eventData.selectedDates[0].split('-');
      return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
    }
    const sorted = [...eventData.selectedDates].sort();
    const [year1, month1, day1] = sorted[0].split('-');
    const [year2, month2, day2] = sorted[sorted.length - 1].split('-');
    if (year1 === year2 && month1 === month2) {
      return `${parseInt(day1)}-${parseInt(day2)} ${months[parseInt(month1) - 1]} ${year1}`;
    }
    return `${parseInt(day1)} ${months[parseInt(month1) - 1]} - ${parseInt(day2)} ${months[parseInt(month2) - 1]} ${year2}`;
  }, [eventData.selectedDates]);

  const formattedDate = useMemo(
    () => formattedDates || getFormattedDate(eventData.day, eventData.month, eventData.year),
    [formattedDates, eventData.day, eventData.month, eventData.year]
  );
  const formattedLocation = useMemo(
    () => getFormattedLocation(eventData.city, eventData.district, eventData.venue),
    [eventData.city, eventData.district, eventData.venue]
  );

  // Image picker function
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekmektedir.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEventData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  // Handle venue selection with auto-fill capacity
  const handleVenueSelect = (venueName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const selectedVenue = availableVenues.find(v => v.name === venueName);
    if (selectedVenue) {
      // Parse capacity (e.g., "15.000" -> "15000")
      const capacityStr = selectedVenue.capacity.replace(/\./g, '');
      setEventData(prev => ({
        ...prev,
        venue: venueName,
        venueCapacity: selectedVenue.capacity,
        guestCount: capacityStr, // Always auto-fill with venue capacity
      }));
    } else {
      setEventData(prev => ({ ...prev, venue: venueName, venueCapacity: '', guestCount: '' }));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'type': return eventData.type !== '';
      case 'details': return eventData.name !== '' && (eventData.selectedDates.length > 0 || formattedDate !== '') && eventData.city !== '';
      case 'services': return eventData.services.length > 0;
      case 'budget': return eventData.budget !== '' || eventData.customBudget !== '';
      default: return true;
    }
  };

  const nextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    } else {
      navigation.goBack();
    }
  };

  const toggleService = (serviceId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (serviceId === 'operation') {
      setShowOperationModal(true);
    } else {
      setEventData(prev => ({
        ...prev,
        services: prev.services.includes(serviceId)
          ? prev.services.filter(id => id !== serviceId)
          : [...prev.services, serviceId],
      }));
    }
  };

  const toggleOperationSubService = (subServiceId: string) => {
    setEventData(prev => {
      const newSubServices = prev.operationSubServices.includes(subServiceId)
        ? prev.operationSubServices.filter(id => id !== subServiceId)
        : [...prev.operationSubServices, subServiceId];
      const newServices = newSubServices.length > 0
        ? (prev.services.includes('operation') ? prev.services : [...prev.services, 'operation'])
        : prev.services.filter(id => id !== 'operation');
      return { ...prev, operationSubServices: newSubServices, services: newServices };
    });
  };

  const handleAddVenue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!newVenue.name.trim() || !newVenue.venueType || !newVenue.city || !newVenue.district || !newVenue.capacity) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const features: string[] = [];
    if (newVenue.hasBackstage) features.push('Kulis');
    if (newVenue.hasParking) features.push('Otopark');
    if (newVenue.hasSoundSystem) features.push('Ses Sistemi');
    if (newVenue.hasStage) features.push('Sahne');
    if (newVenue.hasAirConditioning) features.push('Klima');
    if (newVenue.hasDisabledAccess) features.push('Engelli Erişimi');

    const venueId = `${newVenue.city}-${newVenue.district}-custom-${Date.now()}`;
    const venue: Venue = {
      id: venueId,
      name: newVenue.name,
      capacity: newVenue.capacity || 'Belirtilmedi',
      address: newVenue.address,
      venueType: newVenue.venueType === 'indoor' ? 'Kapalı Alan' : newVenue.venueType === 'outdoor' ? 'Açık Alan' : 'Hibrit',
      features,
    };

    setCustomVenues(prev => [...prev, venue]);
    // Update event data with venue and its location
    setEventData(prev => ({
      ...prev,
      city: newVenue.city,
      district: newVenue.district,
      venue: venue.name,
      venueCapacity: venue.capacity,
      guestCount: newVenue.capacity.replace(/\./g, ''),
    }));
    setNewVenue(initialNewVenueData);
    setShowAddVenue(false);
    setShowCityList(false);
    setShowDistrictList(false);
    setActiveDropdown(null);
  };

  const createEvent = async () => {
    if (!eventData.name.trim()) {
      Alert.alert('Uyarı', 'Lütfen etkinlik adı girin.');
      return;
    }
    if (eventData.selectedDates.length === 0) {
      Alert.alert('Uyarı', 'Lütfen etkinlik tarihi seçin.');
      return;
    }
    if (!user) {
      Alert.alert('Hata', 'Etkinlik oluşturmak için giriş yapmalısınız.');
      return;
    }

    setIsCreating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Parse budget from string to number
      let budgetValue = 0;
      if (eventData.budget && eventData.budget !== 'Özel') {
        const budgetMatch = eventData.budget.match(/(\d+)/g);
        if (budgetMatch) {
          budgetValue = parseInt(budgetMatch[0]) * 1000;
        }
      } else if (eventData.customBudget) {
        budgetValue = parseInt(eventData.customBudget.replace(/\D/g, '')) || 0;
      }

      // Create event document - Firestore doesn't accept undefined values
      const eventDoc: Record<string, any> = {
        title: eventData.name.trim(),
        description: eventData.description || '',
        type: eventData.type || 'concert',
        date: eventData.selectedDates[0] || `${eventData.year}-${eventData.month.padStart(2, '0')}-${eventData.day.padStart(2, '0')}`,
        time: eventData.time || '20:00',
        city: eventData.city || '',
        district: eventData.district || '',
        venue: eventData.venue || '',
        budget: budgetValue,
        status: 'planning',
        organizerId: user.uid,
        // Kişisel organizatör bilgileri (fallback)
        organizerName: userProfile?.displayName || user.displayName || '',
        organizerImage: userProfile?.userPhotoURL || userProfile?.photoURL || user.photoURL || '',
        providerIds: isProviderMode ? [user.uid] : [],
        services: eventData.services.length > 0 ? eventData.services.map(serviceId => ({
          id: serviceId,
          category: serviceId,
          name: serviceCategories.find(s => s.id === serviceId)?.name || serviceId,
          status: 'pending',
        })) : [],
      };

      // Şirket bilgilerini ekle (varsa)
      if (primaryCompany) {
        eventDoc.organizerCompanyId = primaryCompany.id;
        eventDoc.organizerCompanyName = primaryCompany.name;
        if (primaryCompany.logo) {
          eventDoc.organizerCompanyLogo = primaryCompany.logo;
        }
        // Kişi bilgileri (şirket içindeki kullanıcı)
        eventDoc.organizerUserId = user.uid;
        eventDoc.organizerUserName = userProfile?.displayName || user.displayName || '';
      }

      // Add optional fields only if they have values
      if (eventData.selectedDates.length > 1) {
        eventDoc.endDate = eventData.selectedDates[eventData.selectedDates.length - 1];
      }
      if (eventData.venueCapacity) {
        eventDoc.venueCapacity = parseInt(eventData.venueCapacity.replace(/\D/g, '')) || 0;
      }
      if (eventData.guestCount) {
        eventDoc.expectedAttendees = parseInt(eventData.guestCount.replace(/\D/g, '')) || 0;
      }
      // Upload image to Firebase Storage if provided
      if (eventData.image) {
        console.log('[CreateEventScreen] Image URI:', eventData.image);
        console.log('[CreateEventScreen] Image URI type check - file://', eventData.image.startsWith('file://'), 'ph://', eventData.image.startsWith('ph://'));

        if (eventData.image.startsWith('file://') || eventData.image.startsWith('ph://') || eventData.image.startsWith('content://')) {
          try {
            console.log('[CreateEventScreen] Starting image upload...');
            const imageBlob = await uriToBlob(eventData.image);
            console.log('[CreateEventScreen] Blob created, size:', imageBlob.size);
            const imagePath = `events/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const imageUrl = await uploadFile(imagePath, imageBlob, { contentType: 'image/jpeg' });
            console.log('[CreateEventScreen] Image uploaded successfully:', imageUrl);
            eventDoc.image = imageUrl;
          } catch (uploadError: any) {
            console.error('[CreateEventScreen] Error uploading event image:', uploadError);
            console.error('[CreateEventScreen] Upload error details:', uploadError?.message, uploadError?.code);
            // Show user a warning but don't block event creation
            Alert.alert(
              'Uyarı',
              'Etkinlik görseli yüklenemedi. Etkinlik görselsiz oluşturulacak.',
              [{ text: 'Tamam' }]
            );
          }
        } else if (eventData.image.startsWith('http://') || eventData.image.startsWith('https://')) {
          // If it's already a URL (e.g., from editing), keep it
          console.log('[CreateEventScreen] Image is already a URL, keeping it');
          eventDoc.image = eventData.image;
        } else {
          console.warn('[CreateEventScreen] Unknown image URI format:', eventData.image.substring(0, 50));
        }
      } else {
        console.log('[CreateEventScreen] No image provided');
      }
      // New event detail fields
      if (eventData.ageLimit) {
        eventDoc.ageLimit = eventData.ageLimit;
      }
      if (eventData.seatingType) {
        eventDoc.seatingType = eventData.seatingType;
      }
      if (eventData.indoorOutdoor) {
        eventDoc.indoorOutdoor = eventData.indoorOutdoor;
      }

      const createdEventId = await addDocument(Collections.EVENTS, eventDoc);
      console.log('[CreateEventScreen] Event created with ID:', createdEventId);
      console.log('[CreateEventScreen] Event data:', JSON.stringify(eventDoc, null, 2));

      Alert.alert(
        'Başarılı',
        isProviderMode
          ? 'Etkinlik oluşturuldu! Etkinliklerim sayfasından takip edebilirsiniz.'
          : 'Etkinlik oluşturuldu! Şimdi hizmet sağlayıcılardan teklif alabilirsiniz.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.warn('Error creating event:', error);
      Alert.alert('Hata', 'Etkinlik oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'type':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Etkinlik Türü</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>
              Düzenlemek istediğiniz etkinlik türünü seçin
            </Text>
            <View style={styles.typeGrid}>
              {eventTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: eventData.type === type.id ? colors.brand[400] : (isDark ? 'transparent' : colors.border), ...(isDark ? {} : helpers.getShadow('sm')) },
                    eventData.type === type.id && styles.typeCardSelected,
                  ]}
                  onPress={() => setEventData(prev => ({ ...prev, type: type.id }))}
                >
                  <LinearGradient colors={type.gradient as any} style={styles.typeIconContainer} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Ionicons name={type.icon as any} size={28} color="white" />
                  </LinearGradient>
                  <Text style={[styles.typeName, { color: colors.text }]}>{type.name}</Text>
                  {eventData.type === type.id && (
                    <View style={styles.typeCheckmark}>
                      <Ionicons name="checkmark" size={14} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'details':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Etkinlik Detayları</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>
              Etkinliğiniz hakkında temel bilgileri girin
            </Text>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>Etkinlik Adı *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)', color: colors.text }]}
                placeholder="Örn: Yaz Festivali 2025"
                placeholderTextColor={colors.textMuted}
                value={eventData.name}
                onChangeText={text => setEventData(prev => ({ ...prev, name: text }))}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>Tarih *</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)',
                  borderColor: eventData.selectedDates.length > 0 ? colors.brand[400] : (isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border),
                }]}
                onPress={() => setActiveDropdown('date')}
              >
                <Ionicons name="calendar-outline" size={20} color={eventData.selectedDates.length > 0 ? colors.brand[400] : colors.textMuted} />
                <View style={styles.dateButtonContent}>
                  <Text style={[styles.dropdownButtonText, { color: colors.textMuted }, formattedDate && { color: colors.text }]}>
                    {formattedDate || 'Tarih seçin'}
                  </Text>
                  {eventData.selectedDates.length > 1 && (
                    <Text style={[styles.multiDateHint, { color: colors.brand[400] }]}>
                      {eventData.selectedDates.length} gün seçildi
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>Saat</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }]}
                onPress={() => setActiveDropdown('time')}
              >
                <Ionicons name="time-outline" size={20} color={colors.textMuted} />
                <Text style={[styles.dropdownButtonText, { color: colors.textMuted }, eventData.time && { color: colors.text }]}>
                  {eventData.time || 'Saat seçin'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>İl *</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }]}
                onPress={() => setActiveDropdown('city')}
              >
                <Ionicons name="location-outline" size={20} color={colors.textMuted} />
                <Text style={[styles.dropdownButtonText, { color: colors.textMuted }, eventData.city && { color: colors.text }]}>
                  {eventData.city || 'İl seçin'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            {eventData.city && (
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>İlçe</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }]}
                  onPress={() => setActiveDropdown('district')}
                >
                  <Ionicons name="navigate-outline" size={20} color={colors.textMuted} />
                  <Text style={[styles.dropdownButtonText, { color: colors.textMuted }, eventData.district && { color: colors.text }]}>
                    {eventData.district || 'İlçe seçin'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            )}
            {eventData.district && (
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Mekan</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)', borderColor: eventData.venue ? colors.brand[400] : (isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border) }]}
                  onPress={() => setActiveDropdown('venue')}
                >
                  <Ionicons name="business-outline" size={20} color={eventData.venue ? colors.brand[400] : colors.textMuted} />
                  <Text style={[styles.dropdownButtonText, { color: colors.textMuted }, eventData.venue && { color: colors.text }]}>
                    {eventData.venue || 'Mekan seçin'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>Tahmini Konuk Sayısı</Text>
              <View style={[styles.capacityInputContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)', borderColor: eventData.guestCount ? colors.brand[400] : (isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border) }]}>
                <TouchableOpacity
                  style={[styles.capacityButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}
                  onPress={() => {
                    const current = parseInt(eventData.guestCount) || 0;
                    const step = current >= 1000 ? 500 : 100;
                    if (current > step) {
                      setEventData(prev => ({ ...prev, guestCount: String(current - step) }));
                    }
                  }}
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.capacityInput, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={eventData.guestCount}
                  onChangeText={text => setEventData(prev => ({ ...prev, guestCount: text.replace(/[^0-9]/g, '') }))}
                  textAlign="center"
                />
                <TouchableOpacity
                  style={[styles.capacityButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}
                  onPress={() => {
                    const current = parseInt(eventData.guestCount) || 0;
                    const step = current >= 1000 ? 500 : 100;
                    setEventData(prev => ({ ...prev, guestCount: String(current + step) }));
                  }}
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              {eventData.venueCapacity && (
                <View style={styles.capacityHint}>
                  <Ionicons name="information-circle-outline" size={14} color={colors.brand[400]} />
                  <Text style={[styles.capacityHintText, { color: colors.textMuted }]}>
                    Mekan kapasitesi: {eventData.venueCapacity} kisi (otomatik dolduruldu, degistirebilirsiniz)
                  </Text>
                </View>
              )}
            </View>

            {/* Age Limit */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>Yas Siniri</Text>
              <View style={styles.optionButtonsRow}>
                {ageLimitOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)', borderColor: eventData.ageLimit === option.id ? colors.brand[400] : (isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border) },
                      eventData.ageLimit === option.id && { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }
                    ]}
                    onPress={() => setEventData(prev => ({ ...prev, ageLimit: option.id }))}
                  >
                    <Ionicons name={option.icon as any} size={18} color={eventData.ageLimit === option.id ? colors.brand[400] : colors.textMuted} />
                    <Text style={[styles.optionButtonText, { color: eventData.ageLimit === option.id ? colors.text : colors.textMuted }]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Seating Type */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>Oturma Duzeni</Text>
              <View style={styles.optionButtonsRow}>
                {seatingTypeOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)', borderColor: eventData.seatingType === option.id ? colors.brand[400] : (isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border) },
                      eventData.seatingType === option.id && { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }
                    ]}
                    onPress={() => setEventData(prev => ({ ...prev, seatingType: option.id }))}
                  >
                    <Ionicons name={option.icon as any} size={18} color={eventData.seatingType === option.id ? colors.brand[400] : colors.textMuted} />
                    <Text style={[styles.optionButtonText, { color: eventData.seatingType === option.id ? colors.text : colors.textMuted }]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Indoor/Outdoor */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>Alan Tipi</Text>
              <View style={styles.optionButtonsRow}>
                {indoorOutdoorOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)', borderColor: eventData.indoorOutdoor === option.id ? colors.brand[400] : (isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border) },
                      eventData.indoorOutdoor === option.id && { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }
                    ]}
                    onPress={() => setEventData(prev => ({ ...prev, indoorOutdoor: option.id }))}
                  >
                    <Ionicons name={option.icon as any} size={18} color={eventData.indoorOutdoor === option.id ? colors.brand[400] : colors.textMuted} />
                    <Text style={[styles.optionButtonText, { color: eventData.indoorOutdoor === option.id ? colors.text : colors.textMuted }]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>Aciklama</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)', color: colors.text }]}
                placeholder="Etkinlik hakkında ek detaylar..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                value={eventData.description}
                onChangeText={text => setEventData(prev => ({ ...prev, description: text }))}
              />
            </View>

            {/* Event Image Upload - At the bottom */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>Etkinlik Görseli</Text>
              <TouchableOpacity
                style={[styles.imageUploadArea, {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                  borderColor: eventData.image ? colors.brand[400] : (isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border),
                }]}
                onPress={pickImage}
              >
                {eventData.image ? (
                  <View style={styles.imagePreviewContainer}>
                    <OptimizedImage source={eventData.image} style={styles.imagePreview} />
                    <View style={styles.imageOverlay}>
                      <TouchableOpacity
                        style={styles.changeImageBtn}
                        onPress={pickImage}
                      >
                        <Ionicons name="camera" size={18} color="white" />
                        <Text style={styles.changeImageText}>Değiştir</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => setEventData(prev => ({ ...prev, image: null }))}
                      >
                        <Ionicons name="trash" size={18} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.imageUploadContent}>
                    <View style={[styles.imageUploadIcon, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }]}>
                      <Ionicons name="image-outline" size={28} color={colors.brand[400]} />
                    </View>
                    <Text style={[styles.imageUploadText, { color: colors.text }]}>Görsel Ekle</Text>
                    <Text style={[styles.imageUploadHint, { color: colors.textMuted }]}>
                      Etkinlik kartında başlık görseli olarak kullanılacak
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'services':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>İhtiyacınız Olan Hizmetler</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>
              Etkinliğiniz için gerekli hizmetleri seçin
            </Text>
            <View style={styles.servicesGrid}>
              {serviceCategories.map(service => {
                const isSelected = service.id === 'operation' ? eventData.operationSubServices.length > 0 : eventData.services.includes(service.id);
                return (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceCard,
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isSelected ? colors.brand[400] : (isDark ? 'transparent' : colors.border), ...(isDark ? {} : helpers.getShadow('sm')) },
                      isSelected && styles.serviceCardSelected,
                    ]}
                    onPress={() => toggleService(service.id)}
                  >
                    <View style={[styles.serviceIconContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)' }, isSelected && styles.serviceIconSelected]}>
                      <Ionicons name={service.icon as any} size={24} color={isSelected ? colors.brand[400] : colors.textMuted} />
                    </View>
                    <Text style={[styles.serviceName, { color: colors.textMuted }, isSelected && { color: colors.text }]}>{service.name}</Text>
                    {service.id === 'operation' && eventData.operationSubServices.length > 0 && (
                      <View style={styles.subServiceCountBadge}>
                        <Text style={styles.subServiceCountText}>{eventData.operationSubServices.length}</Text>
                      </View>
                    )}
                    {isSelected && service.id !== 'operation' && (
                      <View style={styles.serviceCheckmark}><Ionicons name="checkmark" size={12} color="white" /></View>
                    )}
                    {service.id === 'operation' && (
                      <View style={styles.serviceArrow}><Ionicons name="chevron-forward" size={16} color={colors.textMuted} /></View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.selectedCount, { color: colors.textSecondary }]}>
              {eventData.services.length} hizmet seçildi
              {eventData.operationSubServices.length > 0 && ` (${eventData.operationSubServices.length} operasyon alt hizmeti)`}
            </Text>
          </View>
        );

      case 'budget':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Bütçe Aralığı</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Etkinliğiniz için tahmini bütçenizi belirtin</Text>
            <View style={styles.budgetOptions}>
              {budgetRanges.map(range => (
                <TouchableOpacity
                  key={range.id}
                  style={[styles.budgetCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: eventData.budget === range.id ? colors.brand[400] : (isDark ? 'transparent' : colors.border), ...(isDark ? {} : helpers.getShadow('sm')) }, eventData.budget === range.id && styles.budgetCardSelected]}
                  onPress={() => setEventData(prev => ({ ...prev, budget: range.id, customBudget: '' }))}
                >
                  <Text style={[styles.budgetLabel, { color: colors.textMuted }, eventData.budget === range.id && { color: colors.text, fontWeight: '500' }]}>{range.label}</Text>
                  {eventData.budget === range.id && <Ionicons name="checkmark-circle" size={20} color={colors.brand[400]} />}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.orDivider}>
              <View style={[styles.orLine, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border }]} />
              <Text style={[styles.orText, { color: colors.textSecondary }]}>veya</Text>
              <View style={[styles.orLine, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border }]} />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>Özel Bütçe</Text>
              <View style={[styles.customBudgetInput, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)' }]}>
                <Text style={[styles.currencySymbol, { color: colors.textMuted }]}>₺</Text>
                <TextInput
                  style={[styles.budgetInput, { color: colors.text }]}
                  placeholder="Bütçenizi girin"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={eventData.customBudget}
                  onChangeText={text => setEventData(prev => ({ ...prev, customBudget: text, budget: '' }))}
                />
              </View>
            </View>
          </View>
        );

      case 'review':
        const selectedType = eventTypes.find(t => t.id === eventData.type);
        const selectedBudget = budgetRanges.find(b => b.id === eventData.budget);
        const selectedServices = serviceCategories.filter(s => eventData.services.includes(s.id) && s.id !== 'operation');
        const selectedOperationSubs = operationSubcategories.filter(s => eventData.operationSubServices.includes(s.id));

        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Etkinlik Özeti</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Bilgilerinizi kontrol edin</Text>
            <View style={[styles.reviewCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border, ...(isDark ? {} : helpers.getShadow('sm')) }]}>
              <ReviewRow label="Etkinlik Türü" value={selectedType?.name || ''} icon={selectedType?.icon} colors={colors} />
              <ReviewRow label="Etkinlik Adı" value={eventData.name} colors={colors} />
              <ReviewRow label="Tarih & Saat" value={`${formattedDate} ${eventData.time ? `- ${eventData.time}` : ''}`} colors={colors} />
              <ReviewRow label="Konum" value={formattedLocation || 'Belirtilmedi'} colors={colors} />
              {eventData.guestCount && <ReviewRow label="Konuk Sayısı" value={`${eventData.guestCount} kişi`} colors={colors} />}
              <ReviewRow label="Bütçe" value={selectedBudget?.label || `₺${eventData.customBudget}`} colors={colors} />
              <View style={styles.reviewServicesRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Seçilen Hizmetler</Text>
                <View style={styles.reviewServices}>
                  {selectedServices.map(service => (
                    <View key={service.id} style={[styles.reviewServiceTag, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }]}>
                      <Ionicons name={service.icon as any} size={12} color={colors.brand[400]} />
                      <Text style={styles.reviewServiceText}>{service.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {selectedOperationSubs.length > 0 && (
                <View style={styles.reviewServicesRow}>
                  <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Operasyon Hizmetleri</Text>
                  <View style={styles.reviewServices}>
                    {selectedOperationSubs.map(service => (
                      <View key={service.id} style={[styles.reviewServiceTag, { backgroundColor: isDark ? 'rgba(217, 119, 6, 0.15)' : 'rgba(217, 119, 6, 0.1)' }]}>
                        <Ionicons name={service.icon as any} size={12} color="#f59e0b" />
                        <Text style={[styles.reviewServiceText, { color: '#f59e0b' }]}>{service.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
            <View style={[styles.infoCard, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.08)' : 'rgba(75, 48, 184, 0.06)' }]}>
              <Ionicons name="information-circle" size={20} color={colors.brand[400]} />
              <Text style={[styles.infoText, { color: colors.textMuted }]}>
                Etkinlik oluşturulduktan sonra, seçtiğiniz hizmet kategorilerindeki sağlayıcılardan teklif almaya başlayabilirsiniz.
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Yeni Etkinlik</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <StepProgress currentStep={currentStep} onStepPress={setCurrentStep} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {renderStepContent()}
          <View style={{ height: 180 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomAction, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border, paddingBottom: insets.bottom + TAB_BAR_HEIGHT }]}>
        {currentStep !== 'review' ? (
          <TouchableOpacity style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]} onPress={nextStep} disabled={!canProceed()}>
            <LinearGradient colors={canProceed() ? gradients.primary : (isDark ? ['#3f3f46', '#3f3f46'] : ['#d4d4d8', '#d4d4d8'])} style={styles.nextButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.nextButtonText}>Devam Et</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.nextButton, isCreating && { opacity: 0.7 }]} onPress={createEvent} disabled={isCreating}>
            <LinearGradient colors={gradients.primary} style={styles.nextButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              {isCreating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="white" />
                  <Text style={styles.nextButtonText}>Etkinlik Oluştur</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Modals */}
      <CalendarPickerModal
        visible={activeDropdown === 'date'}
        selectedDates={eventData.selectedDates}
        onDatesChange={dates => setEventData(prev => ({ ...prev, selectedDates: dates }))}
        onClose={() => setActiveDropdown(null)}
        multiSelect={true}
      />

      <SelectModal
        visible={activeDropdown === 'time'}
        title="Saat Seçin"
        options={timeOptions.map(t => ({ value: t, label: t }))}
        selectedValue={eventData.time}
        onSelect={time => setEventData(prev => ({ ...prev, time }))}
        onClose={() => setActiveDropdown(null)}
      />

      <SelectModal
        visible={activeDropdown === 'city'}
        title="İl Seçin"
        options={cities.map(c => ({ value: c, label: c }))}
        selectedValue={eventData.city}
        onSelect={city => setEventData(prev => ({ ...prev, city, district: '', venue: '' }))}
        onClose={() => setActiveDropdown(null)}
      />

      <SelectModal
        visible={activeDropdown === 'district'}
        title="İlçe Seçin"
        options={availableDistricts.map(d => ({ value: d, label: d }))}
        selectedValue={eventData.district}
        onSelect={district => setEventData(prev => ({ ...prev, district, venue: '' }))}
        onClose={() => setActiveDropdown(null)}
      />

      <SelectModal
        visible={activeDropdown === 'venue'}
        title="Mekan Seçin"
        options={[
          ...availableVenues.map(v => ({ value: v.name, label: v.name, subtitle: `Kapasite: ${v.capacity}` })),
          { value: '__add_new__', label: '+ Yeni Mekan Ekle', subtitle: 'Manuel olarak mekan bilgisi girin' }
        ]}
        selectedValue={eventData.venue}
        onSelect={(value) => {
          if (value === '__add_new__') {
            setActiveDropdown(null);
            setShowAddVenue(true);
          } else {
            handleVenueSelect(value);
          }
        }}
        onClose={() => setActiveDropdown(null)}
      />

      <OperationModal
        visible={showOperationModal}
        selectedServices={eventData.operationSubServices}
        onToggle={toggleOperationSubService}
        onClose={() => setShowOperationModal(false)}
      />

      {/* Add New Venue Modal */}
      <Modal
        visible={showAddVenue}
        transparent
        animationType="slide"
        onRequestClose={() => {
          Keyboard.dismiss();
          setShowAddVenue(false);
          setShowCityList(false);
          setShowDistrictList(false);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              Keyboard.dismiss();
              setShowAddVenue(false);
              setShowCityList(false);
              setShowDistrictList(false);
            }}
          />
          <View style={[styles.addVenueModal, { backgroundColor: colors.background }]}>
            <View style={styles.addVenueHeader}>
              <Text style={[styles.addVenueTitle, { color: colors.text }]}>Yeni Mekan Ekle</Text>
              <TouchableOpacity onPress={() => {
                Keyboard.dismiss();
                setShowAddVenue(false);
                setShowCityList(false);
                setShowDistrictList(false);
              }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.addVenueContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* Approval Notice */}
              <View style={[styles.approvalNotice, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)' }]}>
                <Ionicons name="information-circle" size={20} color={colors.info} />
                <Text style={[styles.approvalNoticeText, { color: colors.textSecondary }]}>
                  Eklediğiniz mekan, sistem onayından sonra mekan havuzuna eklenecek ve diğer kullanıcılar tarafından da seçilebilir olacaktır.
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Mekan Adı *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)', color: colors.text }]}
                  placeholder="Örn: Grand Hotel Balo Salonu"
                  placeholderTextColor={colors.textMuted}
                  value={newVenue.name}
                  onChangeText={text => setNewVenue(prev => ({ ...prev, name: text }))}
                />
              </View>

              {/* City Selection - Inline Expandable */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>İl *</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)', borderColor: newVenue.city ? colors.brand[400] : (isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border) }]}
                  onPress={() => {
                    setShowCityList(!showCityList);
                    setShowDistrictList(false);
                  }}
                >
                  <Ionicons name="location-outline" size={20} color={newVenue.city ? colors.brand[400] : colors.textMuted} />
                  <Text style={[styles.dropdownButtonText, { color: newVenue.city ? colors.text : colors.textMuted }]}>
                    {newVenue.city || 'İl seçin'}
                  </Text>
                  <Ionicons name={showCityList ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {/* Inline City List */}
                {showCityList && (
                  <View style={[styles.inlineSelectList, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
                    <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                      {cities.map(city => (
                        <TouchableOpacity
                          key={city}
                          style={[
                            styles.inlineSelectItem,
                            { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.borderLight },
                            newVenue.city === city && { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }
                          ]}
                          onPress={() => {
                            setNewVenue(prev => ({ ...prev, city, district: '' }));
                            setShowCityList(false);
                            setShowDistrictList(false);
                          }}
                        >
                          <Text style={[styles.inlineSelectItemText, { color: newVenue.city === city ? colors.text : colors.textMuted }]}>
                            {city}
                          </Text>
                          {newVenue.city === city && (
                            <Ionicons name="checkmark" size={18} color={colors.brand[400]} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* District Selection - Inline Expandable */}
              {newVenue.city && (
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.textMuted }]}>İlçe *</Text>
                  <TouchableOpacity
                    style={[styles.dropdownButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)', borderColor: newVenue.district ? colors.brand[400] : (isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border) }]}
                    onPress={() => {
                      setShowDistrictList(!showDistrictList);
                      setShowCityList(false);
                    }}
                  >
                    <Ionicons name="navigate-outline" size={20} color={newVenue.district ? colors.brand[400] : colors.textMuted} />
                    <Text style={[styles.dropdownButtonText, { color: newVenue.district ? colors.text : colors.textMuted }]}>
                      {newVenue.district || 'İlçe seçin'}
                    </Text>
                    <Ionicons name={showDistrictList ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                  </TouchableOpacity>

                  {/* Inline District List */}
                  {showDistrictList && (
                    <View style={[styles.inlineSelectList, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
                      <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                        {newVenueDistricts.map(district => (
                          <TouchableOpacity
                            key={district}
                            style={[
                              styles.inlineSelectItem,
                              { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.borderLight },
                              newVenue.district === district && { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }
                            ]}
                            onPress={() => {
                              setNewVenue(prev => ({ ...prev, district }));
                              setShowDistrictList(false);
                            }}
                          >
                            <Text style={[styles.inlineSelectItemText, { color: newVenue.district === district ? colors.text : colors.textMuted }]}>
                              {district}
                            </Text>
                            {newVenue.district === district && (
                              <Ionicons name="checkmark" size={18} color={colors.brand[400]} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}

              {/* Detailed Address */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Detaylı Adres</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)', color: colors.text }]}
                  placeholder="Mahalle, sokak, bina no vb."
                  placeholderTextColor={colors.textMuted}
                  value={newVenue.address}
                  onChangeText={text => setNewVenue(prev => ({ ...prev, address: text }))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Kapasite *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)', color: colors.text }]}
                  placeholder="Örn: 500"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={newVenue.capacity}
                  onChangeText={text => setNewVenue(prev => ({ ...prev, capacity: text }))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Mekan Tipi *</Text>
                <View style={styles.venueTypeOptions}>
                  {[
                    { id: 'indoor', label: 'Kapalı Alan', icon: 'business' },
                    { id: 'outdoor', label: 'Açık Alan', icon: 'sunny' },
                    { id: 'hybrid', label: 'Hibrit', icon: 'apps' },
                  ].map(type => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.venueTypeOption,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                          borderColor: newVenue.venueType === type.id ? colors.brand[400] : (isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border)
                        },
                        newVenue.venueType === type.id && { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }
                      ]}
                      onPress={() => setNewVenue(prev => ({ ...prev, venueType: type.id as any }))}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={20}
                        color={newVenue.venueType === type.id ? colors.brand[400] : colors.textMuted}
                      />
                      <Text style={[
                        styles.venueTypeLabel,
                        { color: newVenue.venueType === type.id ? colors.text : colors.textMuted }
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Mekan Özellikleri</Text>
                <View style={styles.venueFeatures}>
                  {[
                    { key: 'hasStage', label: 'Sahne', icon: 'easel-outline' },
                    { key: 'hasSoundSystem', label: 'Ses Sistemi', icon: 'volume-high-outline' },
                    { key: 'hasBackstage', label: 'Kulis/Backstage', icon: 'people-outline' },
                    { key: 'hasParking', label: 'Otopark', icon: 'car-outline' },
                    { key: 'hasAirConditioning', label: 'Klima', icon: 'snow-outline' },
                    { key: 'hasDisabledAccess', label: 'Engelli Erişimi', icon: 'accessibility-outline' },
                  ].map(feature => (
                    <TouchableOpacity
                      key={feature.key}
                      style={[
                        styles.venueFeatureItem,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                          borderColor: (newVenue as any)[feature.key] ? colors.brand[400] : (isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border)
                        },
                        (newVenue as any)[feature.key] && { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }
                      ]}
                      onPress={() => setNewVenue(prev => ({ ...prev, [feature.key]: !(prev as any)[feature.key] }))}
                    >
                      <View style={styles.venueFeatureContent}>
                        <Ionicons
                          name={feature.icon as any}
                          size={18}
                          color={(newVenue as any)[feature.key] ? colors.brand[400] : colors.textMuted}
                        />
                        <Text style={[
                          styles.venueFeatureLabel,
                          { color: (newVenue as any)[feature.key] ? colors.text : colors.textMuted }
                        ]}>
                          {feature.label}
                        </Text>
                      </View>
                      <View style={[
                        styles.venueFeatureCheckbox,
                        {
                          backgroundColor: (newVenue as any)[feature.key] ? colors.brand[400] : 'transparent',
                          borderColor: (newVenue as any)[feature.key] ? colors.brand[400] : (isDark ? 'rgba(255, 255, 255, 0.2)' : colors.border)
                        }
                      ]}>
                        {(newVenue as any)[feature.key] && (
                          <Ionicons name="checkmark" size={12} color="white" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={[styles.addVenueFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
              <TouchableOpacity
                style={[styles.addVenueButton, { opacity: !newVenue.name.trim() || !newVenue.venueType || !newVenue.city || !newVenue.district || !newVenue.capacity ? 0.5 : 1 }]}
                onPress={handleAddVenue}
                disabled={!newVenue.name.trim() || !newVenue.venueType || !newVenue.city || !newVenue.district || !newVenue.capacity}
              >
                <LinearGradient
                  colors={gradients.primary}
                  style={styles.addVenueButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="add-circle" size={20} color="white" />
                  <Text style={styles.addVenueButtonText}>Mekan Ekle</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

// Helper component for review rows
function ReviewRow({ label, value, icon, colors }: { label: string; value: string; icon?: string; colors: any }) {
  return (
    <>
      <View style={styles.reviewRow}>
        <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>{label}</Text>
        <View style={styles.reviewValueContainer}>
          {icon && <Ionicons name={icon as any} size={16} color={colors.brand[400]} />}
          <Text style={[styles.reviewValue, { color: colors.text }]}>{value}</Text>
        </View>
      </View>
      <View style={[styles.reviewDivider, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  stepContent: { paddingHorizontal: 20 },
  stepTitle: { fontSize: 24, fontWeight: 'bold' },
  stepSubtitle: { fontSize: 14, marginTop: 8, marginBottom: 24 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeCard: { width: '47%', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: 'transparent', alignItems: 'center' },
  typeCardSelected: { backgroundColor: 'rgba(75, 48, 184, 0.08)' },
  typeIconContainer: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  typeName: { fontSize: 14, fontWeight: '500' },
  typeCheckmark: { position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: 10, backgroundColor: '#4b30b8', alignItems: 'center', justifyContent: 'center' },
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15 },
  textArea: { minHeight: 100, textAlignVertical: 'top', paddingTop: 14 },
  dropdownButton: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  dropdownButtonText: { flex: 1, fontSize: 15 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceCard: { width: '47%', padding: 14, borderRadius: 14, borderWidth: 2, borderColor: 'transparent', alignItems: 'center' },
  serviceCardSelected: { backgroundColor: 'rgba(75, 48, 184, 0.08)' },
  serviceIconContainer: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  serviceIconSelected: { backgroundColor: 'rgba(75, 48, 184, 0.2)' },
  serviceName: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  serviceCheckmark: { position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9, backgroundColor: '#4b30b8', alignItems: 'center', justifyContent: 'center' },
  serviceArrow: { position: 'absolute', top: 10, right: 10 },
  subServiceCountBadge: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: '#4b30b8', alignItems: 'center', justifyContent: 'center' },
  subServiceCountText: { fontSize: 11, fontWeight: '600', color: 'white' },
  selectedCount: { fontSize: 14, textAlign: 'center', marginTop: 20 },
  budgetOptions: { gap: 10 },
  budgetCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  budgetCardSelected: { backgroundColor: 'rgba(75, 48, 184, 0.08)' },
  budgetLabel: { fontSize: 15 },
  orDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  orLine: { flex: 1, height: 1 },
  orText: { marginHorizontal: 16, fontSize: 14 },
  customBudgetInput: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14 },
  currencySymbol: { fontSize: 18, fontWeight: '500', marginRight: 8 },
  budgetInput: { flex: 1, fontSize: 18, paddingVertical: 14 },
  reviewCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  reviewLabel: { fontSize: 13 },
  reviewValueContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reviewValue: { fontSize: 14, fontWeight: '500' },
  reviewDivider: { height: 1 },
  reviewServicesRow: { paddingVertical: 12 },
  reviewServices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  reviewServiceTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  reviewServiceText: { fontSize: 12, fontWeight: '500', color: '#4b30b8' },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 14 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  bottomAction: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 34, borderTopWidth: 1 },
  nextButton: { borderRadius: 14, overflow: 'hidden' },
  nextButtonDisabled: { opacity: 0.6 },
  nextButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  nextButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
  // Image Upload Styles
  imageUploadArea: { borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', overflow: 'hidden' },
  imageUploadContent: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  imageUploadIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  imageUploadText: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  imageUploadHint: { fontSize: 13, textAlign: 'center' },
  imagePreviewContainer: { position: 'relative' },
  imagePreview: { width: '100%', aspectRatio: 16 / 9, borderRadius: 14 },
  imageOverlay: { position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', gap: 8 },
  changeImageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0, 0, 0, 0.6)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  changeImageText: { color: 'white', fontSize: 13, fontWeight: '500' },
  removeImageBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(239, 68, 68, 0.8)', alignItems: 'center', justifyContent: 'center' },
  // Date Button Styles
  dateButtonContent: { flex: 1 },
  multiDateHint: { fontSize: 11, marginTop: 2 },
  // Capacity Input with +/- buttons
  capacityInputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  capacityButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  capacityInput: { flex: 1, fontSize: 18, fontWeight: '600', paddingVertical: 12 },
  // Capacity Hint
  capacityHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  capacityHintText: { fontSize: 12, flex: 1 },
  // Option Buttons Row (for Age Limit, Seating Type, Indoor/Outdoor)
  optionButtonsRow: { flexDirection: 'row', gap: 10 },
  optionButton: { flex: 1, flexDirection: 'column', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 6 },
  optionButtonText: { fontSize: 12, fontWeight: '500' },
  // Add Venue Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  addVenueModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  addVenueHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  addVenueTitle: { fontSize: 18, fontWeight: '600' },
  addVenueContent: { padding: 20 },
  addVenueFooter: { padding: 20, borderTopWidth: 1 },
  addVenueButton: { borderRadius: 14, overflow: 'hidden' },
  addVenueButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  addVenueButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
  venueTypeOptions: { flexDirection: 'row', gap: 10 },
  venueTypeOption: { flex: 1, flexDirection: 'column', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 6 },
  venueTypeLabel: { fontSize: 12, fontWeight: '500' },
  // Venue Features
  venueFeatures: { gap: 8 },
  venueFeatureItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1 },
  venueFeatureContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  venueFeatureLabel: { fontSize: 14 },
  venueFeatureCheckbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  // Approval Notice
  approvalNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, marginBottom: 20 },
  approvalNoticeText: { flex: 1, fontSize: 13, lineHeight: 18 },
  // Inline Select List
  inlineSelectList: { marginTop: 8, borderRadius: 12, borderWidth: 1, maxHeight: 200, overflow: 'hidden' },
  inlineSelectItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1 },
  inlineSelectItemText: { fontSize: 14 },
});
