import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { OptimizedImage } from '../components/OptimizedImage';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useUserEvents, useProviderArtists, createOfferRequest, type FirestoreArtist } from '../hooks';
import { SelectionChips, SwitchRow, FormSection, InputLabel } from '../components/categoryRequest';
import { CalendarPickerModal } from '../components/createEvent';
import { categoryConfig, categoryOptions } from '../data/categoryRequestData';
import { draftRequests, getDraftById } from '../data/offersData';
import { ageLimitOptions, seatingTypeOptions, indoorOutdoorOptions } from '../data/createEventData';

// Helper to get label from option arrays
const getOptionLabel = (options: { id: string; label: string }[], id: string | undefined): string | null => {
  if (!id) return null;
  return options.find(o => o.id === id)?.label || null;
};

export function CategoryRequestScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { category, provider, eventId, draftId } = (route.params as {
    category: string;
    provider?: any;
    eventId?: string;
    draftId?: string;
  }) || { category: 'booking' };
  const { colors, isDark, helpers } = useTheme();
  const { user, userProfile } = useAuth();

  // Fetch user's events from Firebase
  const { events: firebaseEvents, loading: eventsLoading } = useUserEvents(user?.uid);

  // Fetch provider's artists if this is a booking/artist request
  const isBookingRequest = (category === 'booking' || category === 'artist') && provider?.id;
  const { artists: providerArtists, loading: artistsLoading } = useProviderArtists(
    isBookingRequest ? provider.id : undefined
  );

  // State for selected provider artist (for booking category)
  const [selectedProviderArtist, setSelectedProviderArtist] = useState<FirestoreArtist | null>(null);
  const hasPreselectedArtist = !!provider?.artistId;

  // Pre-select artist if one was passed in params
  React.useEffect(() => {
    if (hasPreselectedArtist && providerArtists.length > 0) {
      const preselectedArtist = providerArtists.find(a => a.id === provider.artistId);
      if (preselectedArtist) {
        setSelectedProviderArtist(preselectedArtist);
      }
    }
  }, [hasPreselectedArtist, providerArtists, provider?.artistId]);

  const config = categoryConfig[category] || categoryConfig.booking;
  const options = categoryOptions[category as keyof typeof categoryOptions] || {};

  // Load draft data if draftId is provided
  const existingDraft = draftId ? getDraftById(draftId) : null;

  // If eventId is provided (user came from event detail), auto-select it
  const hasPreselectedEvent = !!eventId;

  // Common state - initialize from draft if available
  const [selectedEvent, setSelectedEvent] = useState<string | null>(existingDraft?.eventId || eventId || null);
  const [selectedDates, setSelectedDates] = useState<string[]>(existingDraft?.formData?.selectedDates || []);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [budget, setBudget] = useState(existingDraft?.budget || '');
  const [notes, setNotes] = useState(existingDraft?.notes || '');

  // Category-specific state (consolidated) - initialize from draft if available
  const [formState, setFormState] = useState<Record<string, any>>(existingDraft?.formData || {});

  const updateForm = (key: string, value: any) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const toggleMultiSelect = (key: string, value: string) => {
    const current = formState[key] || [];
    if (current.includes(value)) {
      updateForm(key, current.filter((v: string) => v !== value));
    } else {
      updateForm(key, [...current, value]);
    }
  };

  // Format selected dates for display
  const formattedServiceDate = useMemo(() => {
    if (selectedDates.length === 0) return '';
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    if (selectedDates.length === 1) {
      const [year, month, day] = selectedDates[0].split('-');
      return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
    }
    const sorted = [...selectedDates].sort();
    const [year1, month1, day1] = sorted[0].split('-');
    const [year2, month2, day2] = sorted[sorted.length - 1].split('-');
    if (year1 === year2 && month1 === month2) {
      return `${parseInt(day1)}-${parseInt(day2)} ${months[parseInt(month1) - 1]} ${year1}`;
    }
    return `${parseInt(day1)} ${months[parseInt(month1) - 1]} - ${parseInt(day2)} ${months[parseInt(month2) - 1]} ${year2}`;
  }, [selectedDates]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!user) {
      Alert.alert('Hata', 'Lütfen giriş yapın');
      return;
    }

    if (!selectedEvent) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Uyarı', 'Lütfen bir etkinlik seçin');
      return;
    }

    // For booking requests, require artist selection
    if (isBookingRequest && !selectedProviderArtist) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Uyarı', 'Lütfen bir sanatçı seçin');
      return;
    }

    if (!provider?.id) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Uyarı', 'Tedarikçi bilgisi bulunamadı');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedEventData = firebaseEvents.find(e => e.id === selectedEvent);

      // Build request data - only include defined values (Firebase rejects undefined)
      // Include event details from the selected event
      const eventFormData: Record<string, any> = {
        ...formState,
        selectedDates,
      };

      // Add event-specific details if available
      if (selectedEventData?.venue) eventFormData.venue = selectedEventData.venue;
      if (selectedEventData?.district) eventFormData.district = selectedEventData.district;
      if (selectedEventData?.venueCapacity) eventFormData.venueCapacity = selectedEventData.venueCapacity;
      if (selectedEventData?.guestCount) eventFormData.guestCount = selectedEventData.guestCount;
      if (selectedEventData?.ageLimit) eventFormData.ageLimit = selectedEventData.ageLimit;
      if (selectedEventData?.seatingType) eventFormData.seatingType = selectedEventData.seatingType;
      if (selectedEventData?.indoorOutdoor) eventFormData.indoorOutdoor = selectedEventData.indoorOutdoor;
      if (selectedEventData?.time) eventFormData.time = selectedEventData.time;

      const requestData: any = {
        // Event info
        eventId: selectedEvent,
        eventTitle: selectedEventData?.title || '',
        // Organizer info
        organizerId: user.uid,
        organizerName: userProfile?.displayName || user.displayName || 'Organizatör',
        organizerImage: userProfile?.photoURL || userProfile?.userPhotoURL || user.photoURL || '',
        // Provider info
        providerId: provider.id,
        providerName: provider.name || '',
        providerImage: provider.image || '',
        // Request details
        serviceCategory: category,
        formData: eventFormData,
        serviceDates: selectedDates.length > 0 ? selectedDates : [],
      };

      // Add optional fields only if they have values
      if (selectedEventData?.date) requestData.eventDate = selectedEventData.date;
      if (selectedEventData?.city) requestData.eventCity = selectedEventData.city;
      if (selectedEventData?.district) requestData.eventDistrict = selectedEventData.district;
      if (selectedEventData?.venue) requestData.eventVenue = selectedEventData.venue;
      if (budget && budget.trim()) requestData.requestedBudget = budget.trim();
      if (notes && notes.trim()) requestData.notes = notes.trim();

      // Artist info (for booking requests)
      const artistId = selectedProviderArtist?.id || provider.artistId;
      const artistName = selectedProviderArtist?.stageName || selectedProviderArtist?.name || provider.artistName;
      const artistImage = selectedProviderArtist?.image || provider.artistImage;

      if (artistId) requestData.artistId = artistId;
      if (artistName) requestData.artistName = artistName;
      if (artistImage) requestData.artistImage = artistImage;

      await createOfferRequest(requestData);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Teklif Talebi Gönderildi',
        'Talebiniz tedarikçiye iletildi. En kısa sürede teklif alacaksınız.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.warn('Error creating offer request:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Teklif talebi gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!selectedEvent) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Uyarı', 'Taslak kaydetmek için lütfen bir etkinlik seçin');
      return;
    }

    const selectedEventData = firebaseEvents.find(e => e.id === selectedEvent);
    const draftData = {
      id: existingDraft?.id || `draft_${Date.now()}`,
      eventId: selectedEvent,
      eventTitle: selectedEventData?.title || '',
      category,
      categoryName: config.title.replace(' Talebi', ''),
      formData: {
        ...formState,
        selectedDates,
      },
      budget: budget || undefined,
      notes: notes || undefined,
      createdAt: existingDraft?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In a real app, this would save to storage/backend
    // Draft saved successfully

    Alert.alert(
      'Taslak Kaydedildi',
      'Talebiniz taslak olarak kaydedildi. "Tekliflerim" sayfasındaki "Taslaklar" sekmesinden devam edebilirsiniz.',
      [{ text: 'Tamam', onPress: () => navigation.goBack() }]
    );
  };

  const renderCategoryFields = () => {
    switch (category) {
      case 'booking': return renderBookingFields();
      case 'technical': return renderTechnicalFields();
      case 'venue': return renderVenueFields();
      case 'transport': return renderTransportFields();
      case 'accommodation': return renderAccommodationFields();
      case 'flight': return renderFlightFields();
      case 'security': return renderSecurityFields();
      case 'catering': return renderCateringFields();
      case 'generator': return renderGeneratorFields();
      case 'beverage': return renderBeverageFields();
      case 'medical': return renderMedicalFields();
      case 'media': return renderMediaFields();
      case 'barrier': return renderBarrierFields();
      case 'tent': return renderTentFields();
      case 'ticketing': return renderTicketingFields();
      case 'decoration': return renderDecorationFields();
      case 'production': return renderProductionFields();
      default: return null;
    }
  };

  const renderBookingFields = () => {
    const opt = categoryOptions.booking;
    // Only ask booking-specific questions - event details come from selected event
    return (
      <>
        <FormSection title="Set Süresi" subtitle="Sanatcinin sahne suresi">
          <SelectionChips options={opt.durations} selected={formState.duration || ''} onSelect={v => updateForm('duration', v)} />
        </FormSection>
        <FormSection title="Performans Detaylari">
          <SwitchRow icon="musical-notes-outline" label="Canli Performans" value={formState.livePerformance !== false} onValueChange={v => updateForm('livePerformance', v)} />
          <SwitchRow icon="mic-outline" label="DJ Set" value={formState.djSet || false} onValueChange={v => updateForm('djSet', v)} />
          <SwitchRow icon="people-outline" label="Meet & Greet" value={formState.meetGreet || false} onValueChange={v => updateForm('meetGreet', v)} />
        </FormSection>
      </>
    );
  };

  const renderTechnicalFields = () => {
    const opt = categoryOptions.technical;
    // Service-specific fields only - venue info comes from event
    return (
      <>
        <FormSection title="Ses Sistemi Ihtiyaclari" subtitle="Birden fazla secebilirsiniz">
          <SelectionChips options={opt.soundRequirements} selected={formState.soundRequirements || []} onSelect={v => toggleMultiSelect('soundRequirements', v)} multiSelect />
        </FormSection>
        <FormSection title="Aydinlatma Ihtiyaclari" subtitle="Birden fazla secebilirsiniz">
          <SelectionChips options={opt.lightingRequirements} selected={formState.lightingRequirements || []} onSelect={v => toggleMultiSelect('lightingRequirements', v)} multiSelect />
        </FormSection>
        <FormSection title="Sahne Ihtiyaci">
          <SelectionChips options={opt.stageSizes} selected={formState.stageSize || ''} onSelect={v => updateForm('stageSize', v)} />
        </FormSection>
        <FormSection title="Kurulum Bilgileri">
          <InputLabel label="Kurulum Suresi" />
          <SelectionChips options={opt.setupTimes} selected={formState.setupTime || ''} onSelect={v => updateForm('setupTime', v)} />
        </FormSection>
      </>
    );
  };

  const renderVenueFields = () => {
    const opt = categoryOptions.venue;
    // Service-specific fields - capacity and area type come from event
    return (
      <>
        <FormSection title="Mekan Tipi Tercihi">
          <SelectionChips options={opt.styles} selected={formState.venueStyle || ''} onSelect={v => updateForm('venueStyle', v)} />
        </FormSection>
        <FormSection title="Mekan Ozellikleri">
          <SwitchRow icon="restaurant-outline" label="Catering Alani" value={formState.cateringArea || false} onValueChange={v => updateForm('cateringArea', v)} />
          <SwitchRow icon="car-outline" label="Otopark" value={formState.parkingNeeded || false} onValueChange={v => updateForm('parkingNeeded', v)} />
          <SwitchRow icon="accessibility-outline" label="Engelli Erisimi" value={formState.accessibilityNeeded || false} onValueChange={v => updateForm('accessibilityNeeded', v)} />
          <SwitchRow icon="musical-notes-outline" label="Ses Sistemi Mevcut" value={formState.hasSoundSystem || false} onValueChange={v => updateForm('hasSoundSystem', v)} />
          <SwitchRow icon="flash-outline" label="Isik Sistemi Mevcut" value={formState.hasLightingSystem || false} onValueChange={v => updateForm('hasLightingSystem', v)} />
        </FormSection>
      </>
    );
  };

  const renderTransportFields = () => {
    const opt = categoryOptions.transport;
    return (
      <>
        <FormSection title="Araç Tipi">
          <SelectionChips options={opt.vehicleTypes} selected={formState.vehicleType || ''} onSelect={v => updateForm('vehicleType', v)} />
        </FormSection>
        <FormSection title="Yolcu Sayısı">
          <SelectionChips options={opt.passengerCounts} selected={formState.passengerCount || ''} onSelect={v => updateForm('passengerCount', v)} />
        </FormSection>
        <FormSection title="Güzergah">
          <SimpleInput placeholder="Kalkış noktası" value={formState.pickupLocation || ''} onChangeText={(v: string) => updateForm('pickupLocation', v)} colors={colors} isDark={isDark} icon="location-outline" />
          <SimpleInput placeholder="Varış noktası" value={formState.dropoffLocation || ''} onChangeText={(v: string) => updateForm('dropoffLocation', v)} colors={colors} isDark={isDark} icon="flag-outline" />
          <SwitchRow icon="repeat-outline" label="Dönüş Yolculuğu" value={formState.returnTrip || false} onValueChange={v => updateForm('returnTrip', v)} />
        </FormSection>
      </>
    );
  };

  const renderAccommodationFields = () => {
    const opt = categoryOptions.accommodation;
    return (
      <>
        <FormSection title="Oda Tipi">
          <SelectionChips options={opt.roomTypes} selected={formState.roomType || ''} onSelect={v => updateForm('roomType', v)} />
        </FormSection>
        <FormSection title="Yıldız Derecesi">
          <SelectionChips options={opt.starRatings} selected={formState.starRating || ''} onSelect={v => updateForm('starRating', v)} />
        </FormSection>
        <FormSection title="Oda Sayısı">
          <SelectionChips options={opt.roomCounts} selected={formState.roomCount || ''} onSelect={v => updateForm('roomCount', v)} />
        </FormSection>
        <FormSection title="Ek Hizmetler">
          <SwitchRow icon="cafe-outline" label="Kahvaltı Dahil" value={formState.breakfastIncluded || false} onValueChange={v => updateForm('breakfastIncluded', v)} />
        </FormSection>
      </>
    );
  };

  const renderFlightFields = () => {
    const opt = categoryOptions.flight;
    return (
      <>
        <FormSection title="Uçuş Sınıfı">
          <SelectionChips options={opt.classes} selected={formState.flightClass || ''} onSelect={v => updateForm('flightClass', v)} />
        </FormSection>
        <FormSection title="Bagaj">
          <SelectionChips options={opt.baggageOptions} selected={formState.baggageNeeds || ''} onSelect={v => updateForm('baggageNeeds', v)} />
        </FormSection>
        <FormSection title="Güzergah">
          <SimpleInput placeholder="Kalkış şehri" value={formState.departureCity || ''} onChangeText={(v: string) => updateForm('departureCity', v)} colors={colors} isDark={isDark} icon="airplane-outline" />
          <SimpleInput placeholder="Varış şehri" value={formState.arrivalCity || ''} onChangeText={(v: string) => updateForm('arrivalCity', v)} colors={colors} isDark={isDark} icon="location-outline" />
          <SwitchRow icon="repeat-outline" label="Gidiş-Dönüş" value={formState.roundTrip || false} onValueChange={v => updateForm('roundTrip', v)} />
        </FormSection>
      </>
    );
  };

  const renderSecurityFields = () => {
    const opt = categoryOptions.security;
    return (
      <>
        <FormSection title="Güvenlik Alanları" subtitle="Birden fazla seçebilirsiniz">
          <SelectionChips options={opt.areas} selected={formState.securityAreas || []} onSelect={v => toggleMultiSelect('securityAreas', v)} multiSelect />
        </FormSection>
        <FormSection title="Güvenlik Personeli">
          <SelectionChips options={opt.guardCounts} selected={formState.guardCount || ''} onSelect={v => updateForm('guardCount', v)} />
        </FormSection>
        <FormSection title="Vardiya Süresi">
          <SelectionChips options={opt.shiftOptions} selected={formState.shiftHours || ''} onSelect={v => updateForm('shiftHours', v)} />
        </FormSection>
        <FormSection title="Ek Seçenekler">
          <SwitchRow icon="shield-checkmark-outline" label="Silahlı Güvenlik" value={formState.armedSecurity || false} onValueChange={v => updateForm('armedSecurity', v)} />
        </FormSection>
      </>
    );
  };

  const renderCateringFields = () => {
    const opt = categoryOptions.catering;
    return (
      <>
        <FormSection title="Yemek Türleri" subtitle="Birden fazla seçebilirsiniz">
          <SelectionChips options={opt.mealTypes} selected={formState.mealType || []} onSelect={v => toggleMultiSelect('mealType', v)} multiSelect />
        </FormSection>
        <FormSection title="Diyet Seçenekleri" subtitle="Birden fazla seçebilirsiniz">
          <SelectionChips options={opt.dietaryOptions} selected={formState.dietaryRestrictions || []} onSelect={v => toggleMultiSelect('dietaryRestrictions', v)} multiSelect />
        </FormSection>
        <FormSection title="Servis Stili">
          <SelectionChips options={opt.serviceStyles} selected={formState.serviceStyle || ''} onSelect={v => updateForm('serviceStyle', v)} />
        </FormSection>
      </>
    );
  };

  const renderGeneratorFields = () => {
    const opt = categoryOptions.generator;
    return (
      <>
        <FormSection title="Güç Kapasitesi">
          <SelectionChips options={opt.powerLevels} selected={formState.powerRequirement || ''} onSelect={v => updateForm('powerRequirement', v)} />
        </FormSection>
        <FormSection title="Kullanım Süresi">
          <SelectionChips options={opt.durations} selected={formState.generatorDuration || ''} onSelect={v => updateForm('generatorDuration', v)} />
        </FormSection>
        <FormSection title="Ek Seçenekler">
          <SwitchRow icon="flash-outline" label="Yedek Jeneratör" value={formState.backupNeeded || false} onValueChange={v => updateForm('backupNeeded', v)} />
        </FormSection>
      </>
    );
  };

  const renderBeverageFields = () => {
    const opt = categoryOptions.beverage;
    return (
      <>
        <FormSection title="Bar Tipi">
          <SelectionChips options={opt.barTypes} selected={formState.barType || ''} onSelect={v => updateForm('barType', v)} />
        </FormSection>
        <FormSection title="İçecek Türleri" subtitle="Birden fazla seçebilirsiniz">
          <SelectionChips options={opt.beverageTypes} selected={formState.beverageTypes || []} onSelect={v => toggleMultiSelect('beverageTypes', v)} multiSelect />
        </FormSection>
        <FormSection title="Barmen Sayısı">
          <SelectionChips options={opt.bartenderCounts} selected={formState.bartenderCount || ''} onSelect={v => updateForm('bartenderCount', v)} />
        </FormSection>
      </>
    );
  };

  const renderMedicalFields = () => {
    const opt = categoryOptions.medical;
    return (
      <>
        <FormSection title="Medikal Hizmetler" subtitle="Birden fazla seçebilirsiniz">
          <SelectionChips options={opt.services} selected={formState.medicalServices || []} onSelect={v => toggleMultiSelect('medicalServices', v)} multiSelect />
        </FormSection>
        <FormSection title="Ek Seçenekler">
          <SwitchRow icon="car-outline" label="Ambulans Hazır Beklesin" value={formState.ambulanceStandby || false} onValueChange={v => updateForm('ambulanceStandby', v)} />
        </FormSection>
      </>
    );
  };

  const renderMediaFields = () => {
    const opt = categoryOptions.media;
    return (
      <>
        <FormSection title="Medya Hizmetleri" subtitle="Birden fazla seçebilirsiniz">
          <SelectionChips options={opt.services} selected={formState.mediaServices || []} onSelect={v => toggleMultiSelect('mediaServices', v)} multiSelect />
        </FormSection>
        <FormSection title="Teslimat Formatı" subtitle="Birden fazla seçebilirsiniz">
          <SelectionChips options={opt.deliveryFormats} selected={formState.deliveryFormat || []} onSelect={v => toggleMultiSelect('deliveryFormat', v)} multiSelect />
        </FormSection>
      </>
    );
  };

  const renderBarrierFields = () => {
    const opt = categoryOptions.barrier;
    return (
      <>
        <FormSection title="Bariyer Tipi">
          <SelectionChips options={opt.types} selected={formState.barrierType || ''} onSelect={v => updateForm('barrierType', v)} />
        </FormSection>
        <FormSection title="Toplam Uzunluk">
          <SelectionChips options={opt.lengths} selected={formState.barrierLength || ''} onSelect={v => updateForm('barrierLength', v)} />
        </FormSection>
      </>
    );
  };

  const renderTentFields = () => {
    const opt = categoryOptions.tent;
    return (
      <>
        <FormSection title="Çadır Boyutu">
          <SelectionChips options={opt.sizes} selected={formState.tentSize || ''} onSelect={v => updateForm('tentSize', v)} />
        </FormSection>
        <FormSection title="Çadır Tipi">
          <SelectionChips options={opt.types} selected={formState.tentType || ''} onSelect={v => updateForm('tentType', v)} />
        </FormSection>
        <FormSection title="Ekstra Özellikler" subtitle="Birden fazla seçebilirsiniz">
          <SelectionChips options={opt.features} selected={formState.tentFeatures || []} onSelect={v => toggleMultiSelect('tentFeatures', v)} multiSelect />
        </FormSection>
      </>
    );
  };

  const renderTicketingFields = () => {
    const opt = categoryOptions.ticketing;
    return (
      <>
        <FormSection title="Kapasite">
          <SelectionChips options={opt.capacities} selected={formState.ticketCapacity || ''} onSelect={v => updateForm('ticketCapacity', v)} />
        </FormSection>
        <FormSection title="Bilet Türleri" subtitle="Birden fazla seçebilirsiniz">
          <SelectionChips options={opt.ticketTypes} selected={formState.ticketTypes || []} onSelect={v => toggleMultiSelect('ticketTypes', v)} multiSelect />
        </FormSection>
        <FormSection title="Teknoloji" subtitle="Birden fazla seçebilirsiniz">
          <SelectionChips options={opt.techOptions} selected={formState.ticketTech || []} onSelect={v => toggleMultiSelect('ticketTech', v)} multiSelect />
        </FormSection>
      </>
    );
  };

  const renderDecorationFields = () => {
    const opt = categoryOptions.decoration;
    return (
      <>
        <FormSection title="Tema">
          <SelectionChips options={opt.themes} selected={formState.decorTheme || ''} onSelect={v => updateForm('decorTheme', v)} />
        </FormSection>
        <FormSection title="Dekorasyon Alanları" subtitle="Birden fazla seçebilirsiniz">
          <SelectionChips options={opt.areas} selected={formState.decorAreas || []} onSelect={v => toggleMultiSelect('decorAreas', v)} multiSelect />
        </FormSection>
        <FormSection title="Ek Seçenekler">
          <SwitchRow icon="flower-outline" label="Çiçek Düzenlemeleri" value={formState.floralsNeeded || false} onValueChange={v => updateForm('floralsNeeded', v)} />
        </FormSection>
      </>
    );
  };

  const renderProductionFields = () => {
    const opt = categoryOptions.production;
    return (
      <>
        <FormSection title="Prodüksiyon Hizmetleri" subtitle="Birden fazla seçebilirsiniz">
          <SelectionChips options={opt.services} selected={formState.productionServices || []} onSelect={v => toggleMultiSelect('productionServices', v)} multiSelect />
        </FormSection>
        <FormSection title="Ekip Büyüklüğü">
          <SelectionChips options={opt.crewSizes} selected={formState.crewSize || ''} onSelect={v => updateForm('crewSize', v)} />
        </FormSection>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{config.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 180 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.categoryBadge}>
          <LinearGradient colors={config.gradient} style={styles.categoryIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name={config.icon as any} size={24} color="white" />
          </LinearGradient>
        </View>

        {provider && (
          <View style={[styles.providerCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border, ...(isDark ? {} : helpers.getShadow('sm')) }]}>
            <OptimizedImage source={provider.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'} style={styles.providerImage} />
            <View style={styles.providerInfo}>
              <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
              {provider.rating !== undefined && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Text style={styles.ratingText}>{provider.rating}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Artist Selection for Booking Providers */}
        {isBookingRequest && (
          <FormSection
            title="Sanatçı Seçin"
            subtitle={hasPreselectedArtist ? "Seçilen sanatçı" : "Hangi sanatçı için teklif istiyorsunuz?"}
          >
            {artistsLoading ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.brand[400]} />
                <Text style={[styles.eventMetaText, { color: colors.textMuted, marginTop: 8 }]}>Sanatçılar yükleniyor...</Text>
              </View>
            ) : providerArtists.length === 0 ? (
              <View style={[styles.emptyEventsCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
                <Ionicons name="person-outline" size={32} color={colors.textMuted} />
                <Text style={[styles.emptyEventsText, { color: colors.textMuted }]}>Bu firmaya ait sanatçı bulunamadı</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.artistScrollList}>
                {providerArtists.map((artist) => {
                  const isSelected = selectedProviderArtist?.id === artist.id;
                  return (
                    <TouchableOpacity
                      key={artist.id}
                      style={[
                        styles.providerArtistCard,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                          borderColor: isSelected ? colors.brand[500] : (isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border),
                        },
                        isSelected && { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.08)' },
                      ]}
                      onPress={() => setSelectedProviderArtist(isSelected ? null : artist)}
                      disabled={hasPreselectedArtist}
                    >
                      <OptimizedImage source={artist.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'} style={styles.providerArtistImage} />
                      <Text style={[styles.providerArtistName, { color: colors.text }]} numberOfLines={1}>
                        {artist.stageName || artist.name}
                      </Text>
                      <Text style={[styles.providerArtistGenre, { color: colors.textMuted }]} numberOfLines={1}>
                        {artist.genre || 'Sanatçı'}
                      </Text>
                      {isSelected && (
                        <View style={styles.providerArtistCheck}>
                          <Ionicons name="checkmark-circle" size={20} color={colors.brand[500]} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </FormSection>
        )}

        {/* Event Selection - only show if no event is preselected */}
        {!hasPreselectedEvent ? (
          <FormSection title="Etkinlik Seçin" subtitle="Bu teklif hangi etkinlik için?">
            <View style={styles.eventsList}>
              {eventsLoading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.brand[400]} />
                  <Text style={[styles.eventMetaText, { color: colors.textMuted, marginTop: 8 }]}>Etkinlikler yükleniyor...</Text>
                </View>
              ) : firebaseEvents.length === 0 ? (
                <View style={[styles.emptyEventsCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
                  <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
                  <Text style={[styles.emptyEventsText, { color: colors.textMuted }]}>Henüz etkinliğiniz yok</Text>
                </View>
              ) : (
                firebaseEvents.map(event => (
                  <TouchableOpacity
                    key={event.id}
                    style={[styles.eventCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border, ...(isDark ? {} : helpers.getShadow('sm')) }, selectedEvent === event.id && { borderColor: colors.brand[500], backgroundColor: isDark ? 'rgba(75, 48, 184, 0.05)' : 'rgba(75, 48, 184, 0.08)' }]}
                    onPress={() => setSelectedEvent(event.id)}
                  >
                    <View style={styles.eventRadio}>
                      {selectedEvent === event.id ? (
                        <LinearGradient colors={gradients.primary} style={styles.eventRadioSelected}>
                          <Ionicons name="checkmark" size={12} color="white" />
                        </LinearGradient>
                      ) : (
                        <View style={[styles.eventRadioEmpty, { borderColor: colors.textMuted }]} />
                      )}
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                      <View style={styles.eventMeta}>
                        <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                        <Text style={[styles.eventMetaText, { color: colors.textMuted }]}>{event.date}</Text>
                        <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                        <Text style={[styles.eventMetaText, { color: colors.textMuted }]}>{event.city || event.venue}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
              <TouchableOpacity style={styles.newEventCard} onPress={() => navigation.navigate('CreateEvent')}>
                <View style={styles.newEventIcon}><Ionicons name="add" size={20} color={colors.brand[400]} /></View>
                <Text style={[styles.newEventText, { color: colors.brand[400] }]}>Yeni Etkinlik Oluştur</Text>
              </TouchableOpacity>
            </View>
          </FormSection>
        ) : (
          /* Show selected event info when preselected */
          <FormSection title="Etkinlik" subtitle="Bu talep aşağıdaki etkinlik için">
            {(() => {
              const preselectedEventData = firebaseEvents.find(e => e.id === eventId);
              if (preselectedEventData) {
                return (
                  <View style={[styles.eventCard, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.05)' : 'rgba(75, 48, 184, 0.08)', borderColor: colors.brand[500], ...(isDark ? {} : helpers.getShadow('sm')) }]}>
                    <View style={styles.eventRadio}>
                      <LinearGradient colors={gradients.primary} style={styles.eventRadioSelected}>
                        <Ionicons name="checkmark" size={12} color="white" />
                      </LinearGradient>
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={[styles.eventTitle, { color: colors.text }]}>{preselectedEventData.title}</Text>
                      <View style={styles.eventMeta}>
                        <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                        <Text style={[styles.eventMetaText, { color: colors.textMuted }]}>{preselectedEventData.date}</Text>
                        <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                        <Text style={[styles.eventMetaText, { color: colors.textMuted }]}>{preselectedEventData.city || preselectedEventData.venue}</Text>
                      </View>
                    </View>
                  </View>
                );
              }
              return null;
            })()}
          </FormSection>
        )}

        {/* Event Details Section - Show when event is selected */}
        {selectedEvent && (() => {
          const selectedEventData = firebaseEvents.find(e => e.id === selectedEvent);
          if (!selectedEventData) return null;

          const hasDetails = selectedEventData.venue || selectedEventData.venueCapacity ||
                           selectedEventData.guestCount || selectedEventData.ageLimit ||
                           selectedEventData.seatingType || selectedEventData.indoorOutdoor;

          if (!hasDetails) return null;

          return (
            <FormSection title="Etkinlik Detaylari" subtitle="Secilen etkinligin bilgileri">
              <View style={[styles.eventDetailsCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
                {/* Location & Venue */}
                {(selectedEventData.city || selectedEventData.venue) && (
                  <View style={styles.eventDetailRow}>
                    <View style={[styles.eventDetailIcon, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }]}>
                      <Ionicons name="location" size={16} color={colors.brand[400]} />
                    </View>
                    <View style={styles.eventDetailContent}>
                      <Text style={[styles.eventDetailLabel, { color: colors.textMuted }]}>Konum</Text>
                      <Text style={[styles.eventDetailValue, { color: colors.text }]}>
                        {[selectedEventData.venue, selectedEventData.district, selectedEventData.city].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Date & Time */}
                {selectedEventData.date && (
                  <View style={styles.eventDetailRow}>
                    <View style={[styles.eventDetailIcon, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
                      <Ionicons name="calendar" size={16} color="#10B981" />
                    </View>
                    <View style={styles.eventDetailContent}>
                      <Text style={[styles.eventDetailLabel, { color: colors.textMuted }]}>Tarih ve Saat</Text>
                      <Text style={[styles.eventDetailValue, { color: colors.text }]}>
                        {selectedEventData.date}{selectedEventData.time ? ` - ${selectedEventData.time}` : ''}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Capacity / Guest Count */}
                {(selectedEventData.venueCapacity || selectedEventData.guestCount) && (
                  <View style={styles.eventDetailRow}>
                    <View style={[styles.eventDetailIcon, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }]}>
                      <Ionicons name="people" size={16} color="#F59E0B" />
                    </View>
                    <View style={styles.eventDetailContent}>
                      <Text style={[styles.eventDetailLabel, { color: colors.textMuted }]}>Katilimci</Text>
                      <Text style={[styles.eventDetailValue, { color: colors.text }]}>
                        {selectedEventData.guestCount || selectedEventData.venueCapacity || '-'} kisi
                      </Text>
                    </View>
                  </View>
                )}

                {/* Age Limit, Seating Type, Indoor/Outdoor */}
                {(selectedEventData.ageLimit || selectedEventData.seatingType || selectedEventData.indoorOutdoor) && (
                  <View style={styles.eventDetailTagsRow}>
                    {selectedEventData.ageLimit && (
                      <View style={[styles.eventDetailTag, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)' }]}>
                        <Ionicons name="shield-checkmark-outline" size={12} color="#EF4444" />
                        <Text style={[styles.eventDetailTagText, { color: '#EF4444' }]}>
                          {getOptionLabel(ageLimitOptions, selectedEventData.ageLimit) || selectedEventData.ageLimit}
                        </Text>
                      </View>
                    )}
                    {selectedEventData.seatingType && (
                      <View style={[styles.eventDetailTag, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)' }]}>
                        <Ionicons name="accessibility-outline" size={12} color="#6366F1" />
                        <Text style={[styles.eventDetailTagText, { color: '#6366F1' }]}>
                          {getOptionLabel(seatingTypeOptions, selectedEventData.seatingType) || selectedEventData.seatingType}
                        </Text>
                      </View>
                    )}
                    {selectedEventData.indoorOutdoor && (
                      <View style={[styles.eventDetailTag, { backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.1)' }]}>
                        <Ionicons name={selectedEventData.indoorOutdoor === 'outdoor' ? 'sunny-outline' : 'business-outline'} size={12} color="#0EA5E9" />
                        <Text style={[styles.eventDetailTagText, { color: '#0EA5E9' }]}>
                          {getOptionLabel(indoorOutdoorOptions, selectedEventData.indoorOutdoor) || selectedEventData.indoorOutdoor}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </FormSection>
          );
        })()}

        <FormSection title="Hizmet Tarihi">
          <TouchableOpacity
            style={[
              styles.datePickerButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: selectedDates.length > 0 ? colors.brand[400] : (isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border),
              }
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={selectedDates.length > 0 ? colors.brand[400] : colors.textMuted}
            />
            <View style={styles.datePickerContent}>
              <Text style={[
                styles.datePickerText,
                { color: formattedServiceDate ? colors.text : colors.textMuted }
              ]}>
                {formattedServiceDate || 'Tarih seçin'}
              </Text>
              {selectedDates.length > 1 && (
                <Text style={[styles.datePickerHint, { color: colors.brand[400] }]}>
                  {selectedDates.length} gün seçildi
                </Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </FormSection>

        {renderCategoryFields()}

        <FormSection title="Bütçe" subtitle="(Opsiyonel)">
          <SimpleInput placeholder="Örn: 150.000 TL" value={budget} onChangeText={setBudget} colors={colors} isDark={isDark} icon="cash-outline" keyboardType="numeric" />
        </FormSection>

        <FormSection title="Ek Notlar">
          <TextAreaInput placeholder="Özel isteklerinizi veya ek bilgileri yazın..." value={notes} onChangeText={setNotes} colors={colors} isDark={isDark} />
        </FormSection>

        <View style={{ height: 120 }} />
      </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomAction, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={[styles.draftButton, { borderColor: colors.warning, backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)' }]}
            onPress={handleSaveDraft}
          >
            <Ionicons name="bookmark-outline" size={18} color={colors.warning} />
            <Text style={[styles.draftButtonText, { color: colors.warning }]}>Taslak</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
            <LinearGradient colors={isSubmitting ? ['#9ca3af', '#6b7280'] : gradients.primary} style={styles.submitButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.submitButtonText}>Gönderiliyor...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Teklif Talebi Gönder</Text>
                  <Ionicons name="paper-plane" size={18} color="white" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Picker Modal */}
      <CalendarPickerModal
        visible={showDatePicker}
        selectedDates={selectedDates}
        onDatesChange={setSelectedDates}
        onClose={() => setShowDatePicker(false)}
        multiSelect={true}
      />
    </SafeAreaView>
  );
}

// Helper components
function SimpleInput({ placeholder, value, onChangeText, colors, isDark, icon, keyboardType }: any) {
  return (
    <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
      {icon && <Ionicons name={icon} size={18} color={colors.textMuted} />}
      <TextInput style={[styles.input, { color: colors.text }]} placeholder={placeholder} placeholderTextColor={colors.textMuted} value={value} onChangeText={onChangeText} keyboardType={keyboardType} />
    </View>
  );
}

function TextAreaInput({ placeholder, value, onChangeText, colors, isDark }: any) {
  return (
    <View style={[styles.textAreaContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
      <TextInput style={[styles.textArea, { color: colors.text }]} placeholder={placeholder} placeholderTextColor={colors.textMuted} value={value} onChangeText={onChangeText} multiline numberOfLines={4} textAlignVertical="top" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  placeholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: 16 },
  categoryBadge: { alignItems: 'center', paddingVertical: 20 },
  categoryIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  providerCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 8, borderWidth: 1 },
  providerImage: { width: 48, height: 48, borderRadius: 12 },
  providerInfo: { flex: 1, marginLeft: 12 },
  providerName: { fontSize: 15, fontWeight: '600' },
  artistNameSubtext: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#fbbf24' },
  eventsList: { gap: 10 },
  eventCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1 },
  eventRadio: { marginRight: 12 },
  eventRadioEmpty: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  eventRadioSelected: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '500' },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  eventMetaText: { fontSize: 11, marginRight: 8 },
  newEventCard: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: 'rgba(75, 48, 184, 0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(75, 48, 184, 0.2)', borderStyle: 'dashed' },
  newEventIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(75, 48, 184, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  newEventText: { fontSize: 14, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  input: { flex: 1, fontSize: 14 },
  textAreaContainer: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  textArea: { fontSize: 14, minHeight: 80 },
  bottomAction: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 100, borderTopWidth: 1 },
  bottomButtonsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  draftButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5 },
  draftButtonText: { fontSize: 14, fontWeight: '600' },
  submitButton: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  submitButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  submitButtonText: { fontSize: 15, fontWeight: '600', color: 'white' },
  // Artist Selection Styles
  artistScrollList: { marginTop: 8 },
  // Date Picker Styles
  datePickerButton: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 8, gap: 10 },
  datePickerContent: { flex: 1 },
  datePickerText: { fontSize: 15 },
  datePickerHint: { fontSize: 11, marginTop: 2 },
  // Empty Events Card
  emptyEventsCard: { alignItems: 'center', padding: 24, borderRadius: 12, borderWidth: 1, gap: 8 },
  emptyEventsText: { fontSize: 14 },
  // Provider Artist Selection Styles
  providerArtistCard: { width: 110, padding: 12, borderRadius: 14, borderWidth: 1.5, marginRight: 12, alignItems: 'center', position: 'relative' },
  providerArtistImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 10 },
  providerArtistName: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  providerArtistGenre: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  providerArtistCheck: { position: 'absolute', top: 8, right: 8 },
  // Event Details Styles
  eventDetailsCard: { padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
  eventDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eventDetailIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  eventDetailContent: { flex: 1 },
  eventDetailLabel: { fontSize: 11, marginBottom: 2 },
  eventDetailValue: { fontSize: 14, fontWeight: '500' },
  eventDetailTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  eventDetailTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  eventDetailTagText: { fontSize: 12, fontWeight: '500' },
});
