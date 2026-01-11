import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients, categoryGradients } from '../theme/colors';

type Step = 'type' | 'details' | 'services' | 'budget' | 'review';
type DropdownType = 'date' | 'time' | 'city' | 'district' | 'venue' | null;

// Location Data
const locationData = {
  'İstanbul': {
    districts: ['Kadıköy', 'Beşiktaş', 'Şişli', 'Beyoğlu', 'Üsküdar', 'Bakırköy', 'Sarıyer', 'Maltepe'],
    venues: {
      'Kadıköy': [
        { id: 'v1', name: 'KüçükÇiftlik Park', capacity: '15.000' },
        { id: 'v2', name: 'Caddebostan Kültür Merkezi', capacity: '1.200' },
        { id: 'v3', name: 'Kadıköy Haldun Taner Sahnesi', capacity: '400' },
      ],
      'Beşiktaş': [
        { id: 'v4', name: 'Vodafone Park', capacity: '42.000' },
        { id: 'v5', name: 'Zorlu PSM', capacity: '2.500' },
        { id: 'v6', name: 'BJK Akatlar Kültür Merkezi', capacity: '800' },
      ],
      'Şişli': [
        { id: 'v7', name: 'Volkswagen Arena', capacity: '5.000' },
        { id: 'v8', name: 'Harbiye Açıkhava', capacity: '4.500' },
        { id: 'v9', name: 'Lütfi Kırdar Kongre Merkezi', capacity: '3.000' },
      ],
      'Beyoğlu': [
        { id: 'v10', name: 'Salon IKSV', capacity: '800' },
        { id: 'v11', name: 'Babylon Bomonti', capacity: '1.500' },
        { id: 'v12', name: 'Garajistanbul', capacity: '400' },
      ],
      'Üsküdar': [
        { id: 'v13', name: 'Bağlarbaşı Kongre Merkezi', capacity: '2.000' },
      ],
      'Bakırköy': [
        { id: 'v14', name: 'Bakırköy Belediye Nikah Salonu', capacity: '500' },
      ],
      'Sarıyer': [
        { id: 'v15', name: 'Sarıyer Açıkhava Tiyatrosu', capacity: '1.000' },
      ],
      'Maltepe': [
        { id: 'v16', name: 'Maltepe Sahil Etkinlik Alanı', capacity: '50.000' },
      ],
    },
  },
  'Ankara': {
    districts: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Etimesgut'],
    venues: {
      'Çankaya': [
        { id: 'v17', name: 'Congresium', capacity: '3.000' },
        { id: 'v18', name: 'CSO Ada Ankara', capacity: '2.000' },
        { id: 'v19', name: 'IF Performance Hall', capacity: '1.200' },
      ],
      'Keçiören': [
        { id: 'v20', name: 'Keçiören Belediyesi Etkinlik Alanı', capacity: '5.000' },
      ],
      'Yenimahalle': [
        { id: 'v21', name: 'Ankara Arena', capacity: '10.000' },
      ],
      'Etimesgut': [
        { id: 'v22', name: 'Etimesgut Belediyesi Kültür Merkezi', capacity: '800' },
      ],
    },
  },
  'İzmir': {
    districts: ['Konak', 'Karşıyaka', 'Bornova', 'Alsancak'],
    venues: {
      'Konak': [
        { id: 'v23', name: 'İzmir Fuar Alanı', capacity: '20.000' },
        { id: 'v24', name: 'Ahmed Adnan Saygun Sanat Merkezi', capacity: '1.500' },
      ],
      'Karşıyaka': [
        { id: 'v25', name: 'Karşıyaka Arena', capacity: '8.000' },
      ],
      'Bornova': [
        { id: 'v26', name: 'Bornova Açıkhava Tiyatrosu', capacity: '2.500' },
      ],
      'Alsancak': [
        { id: 'v27', name: 'Alsancak Stadyumu', capacity: '15.000' },
      ],
    },
  },
  'Antalya': {
    districts: ['Muratpaşa', 'Konyaaltı', 'Lara', 'Belek'],
    venues: {
      'Muratpaşa': [
        { id: 'v28', name: 'Antalya Expo Center', capacity: '10.000' },
      ],
      'Konyaaltı': [
        { id: 'v29', name: 'Konyaaltı Açıkhava', capacity: '5.000' },
      ],
      'Lara': [
        { id: 'v30', name: 'Titanic Convention Center', capacity: '3.000' },
      ],
      'Belek': [
        { id: 'v31', name: 'Regnum Carya Convention Center', capacity: '4.000' },
        { id: 'v32', name: 'Calista Luxury Resort Event Hall', capacity: '2.000' },
      ],
    },
  },
};

const cities = Object.keys(locationData);

// Date options
const months = [
  { value: '01', label: 'Ocak' },
  { value: '02', label: 'Şubat' },
  { value: '03', label: 'Mart' },
  { value: '04', label: 'Nisan' },
  { value: '05', label: 'Mayıs' },
  { value: '06', label: 'Haziran' },
  { value: '07', label: 'Temmuz' },
  { value: '08', label: 'Ağustos' },
  { value: '09', label: 'Eylül' },
  { value: '10', label: 'Ekim' },
  { value: '11', label: 'Kasım' },
  { value: '12', label: 'Aralık' },
];

const generateDays = () => {
  return Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1),
  }));
};

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 3 }, (_, i) => ({
    value: String(currentYear + i),
    label: String(currentYear + i),
  }));
};

const timeOptions = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

const eventTypes = [
  { id: 'concert', name: 'Konser', icon: 'musical-notes', gradient: categoryGradients.concert },
  { id: 'festival', name: 'Festival', icon: 'people', gradient: categoryGradients.festival },
  { id: 'corporate', name: 'Kurumsal', icon: 'business', gradient: categoryGradients.corporate },
  { id: 'municipality', name: 'Belediye', icon: 'flag', gradient: ['#0891b2', '#06b6d4'] },
  { id: 'private', name: 'Private', icon: 'wine', gradient: categoryGradients.party },
  { id: 'other', name: 'Diğer', icon: 'ellipsis-horizontal', gradient: ['#6b7280', '#4b5563'] },
];

const serviceCategories = [
  { id: 's1', name: 'DJ / Ses Sistemi', icon: 'volume-high', selected: false },
  { id: 's2', name: 'Canlı Müzik', icon: 'musical-notes', selected: false },
  { id: 's3', name: 'Aydınlatma', icon: 'bulb', selected: false },
  { id: 's4', name: 'Fotoğrafçı', icon: 'camera', selected: false },
  { id: 's5', name: 'Video', icon: 'videocam', selected: false },
  { id: 's6', name: 'Dekorasyon', icon: 'flower', selected: false },
  { id: 's7', name: 'Catering', icon: 'restaurant', selected: false },
  { id: 's8', name: 'Mekan', icon: 'location', selected: false },
];

const budgetRanges = [
  { id: 'b1', label: '₺10.000 - ₺25.000', min: 10000, max: 25000 },
  { id: 'b2', label: '₺25.000 - ₺50.000', min: 25000, max: 50000 },
  { id: 'b3', label: '₺50.000 - ₺100.000', min: 50000, max: 100000 },
  { id: 'b4', label: '₺100.000 - ₺250.000', min: 100000, max: 250000 },
  { id: 'b5', label: '₺250.000+', min: 250000, max: 1000000 },
];

export function CreateEventScreen() {
  const navigation = useNavigation<any>();
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [newVenue, setNewVenue] = useState({
    name: '',
    address: '',
    capacity: '',
    venueType: '' as 'indoor' | 'outdoor' | 'hybrid' | '',
    hasBackstage: false,
    hasParking: false,
    hasSoundSystem: false,
    hasStage: false,
    hasAirConditioning: false,
    hasDisabledAccess: false,
  });
  const [customVenues, setCustomVenues] = useState<Array<{
    id: string;
    name: string;
    capacity: string;
    address: string;
    venueType: string;
    features: string[];
  }>>([]);
  const [eventData, setEventData] = useState({
    type: '',
    name: '',
    day: '',
    month: '',
    year: '',
    time: '',
    city: '',
    district: '',
    venue: '',
    guestCount: '',
    description: '',
    services: [] as string[],
    budget: '',
    customBudget: '',
  });

  // Derived data based on selections
  const availableDistricts = useMemo(() => {
    if (!eventData.city) return [];
    return (locationData as any)[eventData.city]?.districts || [];
  }, [eventData.city]);

  const availableVenues = useMemo(() => {
    if (!eventData.city || !eventData.district) return [];
    const predefinedVenues = (locationData as any)[eventData.city]?.venues?.[eventData.district] || [];
    const districtCustomVenues = customVenues.filter(v => v.id.startsWith(`${eventData.city}-${eventData.district}`));
    return [...predefinedVenues, ...districtCustomVenues];
  }, [eventData.city, eventData.district, customVenues]);

  const handleAddVenue = () => {
    if (!newVenue.name.trim() || !newVenue.venueType) return;

    const features: string[] = [];
    if (newVenue.hasBackstage) features.push('Kulis');
    if (newVenue.hasParking) features.push('Otopark');
    if (newVenue.hasSoundSystem) features.push('Ses Sistemi');
    if (newVenue.hasStage) features.push('Sahne');
    if (newVenue.hasAirConditioning) features.push('Klima');
    if (newVenue.hasDisabledAccess) features.push('Engelli Erişimi');

    const venueId = `${eventData.city}-${eventData.district}-custom-${Date.now()}`;
    const venue = {
      id: venueId,
      name: newVenue.name,
      capacity: newVenue.capacity || 'Belirtilmedi',
      address: newVenue.address,
      venueType: newVenue.venueType === 'indoor' ? 'Kapalı Alan' : newVenue.venueType === 'outdoor' ? 'Açık Alan' : 'Hibrit',
      features,
    };

    setCustomVenues(prev => [...prev, venue]);
    setEventData(prev => ({ ...prev, venue: venue.name }));
    setNewVenue({
      name: '',
      address: '',
      capacity: '',
      venueType: '',
      hasBackstage: false,
      hasParking: false,
      hasSoundSystem: false,
      hasStage: false,
      hasAirConditioning: false,
      hasDisabledAccess: false,
    });
    setShowAddVenue(false);
    setActiveDropdown(null);
  };

  const formattedDate = useMemo(() => {
    if (eventData.day && eventData.month && eventData.year) {
      const monthLabel = months.find(m => m.value === eventData.month)?.label;
      return `${eventData.day} ${monthLabel} ${eventData.year}`;
    }
    return '';
  }, [eventData.day, eventData.month, eventData.year]);

  const formattedLocation = useMemo(() => {
    const parts = [eventData.venue, eventData.district, eventData.city].filter(Boolean);
    return parts.join(', ');
  }, [eventData.city, eventData.district, eventData.venue]);

  const steps: { key: Step; label: string; icon: string }[] = [
    { key: 'type', label: 'Tür', icon: 'layers' },
    { key: 'details', label: 'Detaylar', icon: 'document-text' },
    { key: 'services', label: 'Hizmetler', icon: 'briefcase' },
    { key: 'budget', label: 'Bütçe', icon: 'wallet' },
    { key: 'review', label: 'Özet', icon: 'checkmark-circle' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 'type':
        return eventData.type !== '';
      case 'details':
        return eventData.name !== '' && formattedDate !== '' && eventData.city !== '';
      case 'services':
        return eventData.services.length > 0;
      case 'budget':
        return eventData.budget !== '' || eventData.customBudget !== '';
      default:
        return true;
    }
  };

  const nextStep = () => {
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
    setEventData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const createEvent = () => {
    // In a real app, this would submit to an API
    console.log('Creating event:', eventData);
    navigation.goBack();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'type':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Etkinlik Türü</Text>
            <Text style={styles.stepSubtitle}>
              Düzenlemek istediğiniz etkinlik türünü seçin
            </Text>

            <View style={styles.typeGrid}>
              {eventTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    eventData.type === type.id && styles.typeCardSelected,
                  ]}
                  onPress={() => setEventData(prev => ({ ...prev, type: type.id }))}
                >
                  <LinearGradient
                    colors={type.gradient as any}
                    style={styles.typeIconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={type.icon as any} size={28} color="white" />
                  </LinearGradient>
                  <Text style={styles.typeName}>{type.name}</Text>
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
            <Text style={styles.stepTitle}>Etkinlik Detayları</Text>
            <Text style={styles.stepSubtitle}>
              Etkinliğiniz hakkında temel bilgileri girin
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Etkinlik Adı *</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Yaz Festivali 2025"
                placeholderTextColor={colors.zinc[600]}
                value={eventData.name}
                onChangeText={text => setEventData(prev => ({ ...prev, name: text }))}
              />
            </View>

            {/* Date Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tarih *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setActiveDropdown('date')}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.zinc[500]} />
                <Text style={[styles.dropdownButtonText, formattedDate && styles.dropdownButtonTextSelected]}>
                  {formattedDate || 'Tarih seçin'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.zinc[500]} />
              </TouchableOpacity>
            </View>

            {/* Time Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Saat</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setActiveDropdown('time')}
              >
                <Ionicons name="time-outline" size={20} color={colors.zinc[500]} />
                <Text style={[styles.dropdownButtonText, eventData.time && styles.dropdownButtonTextSelected]}>
                  {eventData.time || 'Saat seçin'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.zinc[500]} />
              </TouchableOpacity>
            </View>

            {/* City Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>İl *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setActiveDropdown('city')}
              >
                <Ionicons name="location-outline" size={20} color={colors.zinc[500]} />
                <Text style={[styles.dropdownButtonText, eventData.city && styles.dropdownButtonTextSelected]}>
                  {eventData.city || 'İl seçin'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.zinc[500]} />
              </TouchableOpacity>
            </View>

            {/* District Dropdown - Only show if city is selected */}
            {eventData.city && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>İlçe</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setActiveDropdown('district')}
                >
                  <Ionicons name="navigate-outline" size={20} color={colors.zinc[500]} />
                  <Text style={[styles.dropdownButtonText, eventData.district && styles.dropdownButtonTextSelected]}>
                    {eventData.district || 'İlçe seçin'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.zinc[500]} />
                </TouchableOpacity>
              </View>
            )}

            {/* Venue Dropdown - Only show if district is selected */}
            {eventData.district && availableVenues.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mekan</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setActiveDropdown('venue')}
                >
                  <Ionicons name="business-outline" size={20} color={colors.zinc[500]} />
                  <Text style={[styles.dropdownButtonText, eventData.venue && styles.dropdownButtonTextSelected]}>
                    {eventData.venue || 'Mekan seçin'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.zinc[500]} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tahmini Konuk Sayısı</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: 5000"
                placeholderTextColor={colors.zinc[600]}
                keyboardType="numeric"
                value={eventData.guestCount}
                onChangeText={text => setEventData(prev => ({ ...prev, guestCount: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Etkinlik hakkında ek detaylar..."
                placeholderTextColor={colors.zinc[600]}
                multiline
                numberOfLines={4}
                value={eventData.description}
                onChangeText={text => setEventData(prev => ({ ...prev, description: text }))}
              />
            </View>
          </View>
        );

      case 'services':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>İhtiyacınız Olan Hizmetler</Text>
            <Text style={styles.stepSubtitle}>
              Etkinliğiniz için gerekli hizmetleri seçin
            </Text>

            <View style={styles.servicesGrid}>
              {serviceCategories.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    eventData.services.includes(service.id) && styles.serviceCardSelected,
                  ]}
                  onPress={() => toggleService(service.id)}
                >
                  <View
                    style={[
                      styles.serviceIconContainer,
                      eventData.services.includes(service.id) && styles.serviceIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={service.icon as any}
                      size={24}
                      color={eventData.services.includes(service.id) ? colors.brand[400] : colors.zinc[400]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.serviceName,
                      eventData.services.includes(service.id) && styles.serviceNameSelected,
                    ]}
                  >
                    {service.name}
                  </Text>
                  {eventData.services.includes(service.id) && (
                    <View style={styles.serviceCheckmark}>
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.selectedCount}>
              {eventData.services.length} hizmet seçildi
            </Text>
          </View>
        );

      case 'budget':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Bütçe Aralığı</Text>
            <Text style={styles.stepSubtitle}>
              Etkinliğiniz için tahmini bütçenizi belirtin
            </Text>

            <View style={styles.budgetOptions}>
              {budgetRanges.map(range => (
                <TouchableOpacity
                  key={range.id}
                  style={[
                    styles.budgetCard,
                    eventData.budget === range.id && styles.budgetCardSelected,
                  ]}
                  onPress={() => setEventData(prev => ({ ...prev, budget: range.id, customBudget: '' }))}
                >
                  <Text
                    style={[
                      styles.budgetLabel,
                      eventData.budget === range.id && styles.budgetLabelSelected,
                    ]}
                  >
                    {range.label}
                  </Text>
                  {eventData.budget === range.id && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.brand[400]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.orDivider}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>veya</Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Özel Bütçe</Text>
              <View style={styles.customBudgetInput}>
                <Text style={styles.currencySymbol}>₺</Text>
                <TextInput
                  style={styles.budgetInput}
                  placeholder="Bütçenizi girin"
                  placeholderTextColor={colors.zinc[600]}
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
        const selectedServices = serviceCategories.filter(s => eventData.services.includes(s.id));

        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Etkinlik Özeti</Text>
            <Text style={styles.stepSubtitle}>
              Bilgilerinizi kontrol edin ve etkinliğinizi oluşturun
            </Text>

            <View style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Etkinlik Türü</Text>
                <View style={styles.reviewValueContainer}>
                  <Ionicons name={selectedType?.icon as any} size={16} color={colors.brand[400]} />
                  <Text style={styles.reviewValue}>{selectedType?.name}</Text>
                </View>
              </View>

              <View style={styles.reviewDivider} />

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Etkinlik Adı</Text>
                <Text style={styles.reviewValue}>{eventData.name}</Text>
              </View>

              <View style={styles.reviewDivider} />

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Tarih & Saat</Text>
                <Text style={styles.reviewValue}>
                  {formattedDate} {eventData.time && `- ${eventData.time}`}
                </Text>
              </View>

              <View style={styles.reviewDivider} />

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Konum</Text>
                <Text style={styles.reviewValue}>{formattedLocation || 'Belirtilmedi'}</Text>
              </View>

              {eventData.guestCount && (
                <>
                  <View style={styles.reviewDivider} />
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Konuk Sayısı</Text>
                    <Text style={styles.reviewValue}>{eventData.guestCount} kişi</Text>
                  </View>
                </>
              )}

              <View style={styles.reviewDivider} />

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Bütçe</Text>
                <Text style={styles.reviewValue}>
                  {selectedBudget?.label || `₺${eventData.customBudget}`}
                </Text>
              </View>

              <View style={styles.reviewDivider} />

              <View style={styles.reviewServicesRow}>
                <Text style={styles.reviewLabel}>Seçilen Hizmetler</Text>
                <View style={styles.reviewServices}>
                  {selectedServices.map(service => (
                    <View key={service.id} style={styles.reviewServiceTag}>
                      <Ionicons name={service.icon as any} size={12} color={colors.brand[400]} />
                      <Text style={styles.reviewServiceText}>{service.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={colors.brand[400]} />
              <Text style={styles.infoText}>
                Etkinlik oluşturulduktan sonra, seçtiğiniz hizmet kategorilerindeki
                sağlayıcılardan teklif almaya başlayabilirsiniz.
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Etkinlik</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <TouchableOpacity
              style={[
                styles.progressStep,
                index <= currentStepIndex && styles.progressStepActive,
              ]}
              onPress={() => index < currentStepIndex && setCurrentStep(step.key)}
              disabled={index > currentStepIndex}
            >
              <Ionicons
                name={step.icon as any}
                size={16}
                color={index <= currentStepIndex ? colors.brand[400] : colors.zinc[600]}
              />
            </TouchableOpacity>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  index < currentStepIndex && styles.progressLineActive,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        {currentStep !== 'review' ? (
          <TouchableOpacity
            style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
            onPress={nextStep}
            disabled={!canProceed()}
          >
            <LinearGradient
              colors={canProceed() ? gradients.primary : ['#3f3f46', '#3f3f46']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.nextButtonText}>Devam Et</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={createEvent}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text style={styles.nextButtonText}>Etkinlik Oluştur</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={activeDropdown === 'date'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveDropdown(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tarih Seçin</Text>
              <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                <Ionicons name="close" size={24} color={colors.zinc[400]} />
              </TouchableOpacity>
            </View>
            <View style={styles.datePickerRow}>
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Gün</Text>
                <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                  {generateDays().map(day => (
                    <TouchableOpacity
                      key={day.value}
                      style={[styles.datePickerItem, eventData.day === day.value && styles.datePickerItemSelected]}
                      onPress={() => setEventData(prev => ({ ...prev, day: day.value }))}
                    >
                      <Text style={[styles.datePickerItemText, eventData.day === day.value && styles.datePickerItemTextSelected]}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Ay</Text>
                <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                  {months.map(month => (
                    <TouchableOpacity
                      key={month.value}
                      style={[styles.datePickerItem, eventData.month === month.value && styles.datePickerItemSelected]}
                      onPress={() => setEventData(prev => ({ ...prev, month: month.value }))}
                    >
                      <Text style={[styles.datePickerItemText, eventData.month === month.value && styles.datePickerItemTextSelected]}>
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Yıl</Text>
                <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                  {generateYears().map(year => (
                    <TouchableOpacity
                      key={year.value}
                      style={[styles.datePickerItem, eventData.year === year.value && styles.datePickerItemSelected]}
                      onPress={() => setEventData(prev => ({ ...prev, year: year.value }))}
                    >
                      <Text style={[styles.datePickerItemText, eventData.year === year.value && styles.datePickerItemTextSelected]}>
                        {year.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => setActiveDropdown(null)}
            >
              <Text style={styles.modalConfirmButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={activeDropdown === 'time'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveDropdown(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Saat Seçin</Text>
              <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                <Ionicons name="close" size={24} color={colors.zinc[400]} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {timeOptions.map(time => (
                <TouchableOpacity
                  key={time}
                  style={[styles.optionItem, eventData.time === time && styles.optionItemSelected]}
                  onPress={() => {
                    setEventData(prev => ({ ...prev, time }));
                    setActiveDropdown(null);
                  }}
                >
                  <Text style={[styles.optionItemText, eventData.time === time && styles.optionItemTextSelected]}>
                    {time}
                  </Text>
                  {eventData.time === time && (
                    <Ionicons name="checkmark" size={20} color={colors.brand[400]} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* City Picker Modal */}
      <Modal
        visible={activeDropdown === 'city'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveDropdown(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>İl Seçin</Text>
              <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                <Ionicons name="close" size={24} color={colors.zinc[400]} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {cities.map(city => (
                <TouchableOpacity
                  key={city}
                  style={[styles.optionItem, eventData.city === city && styles.optionItemSelected]}
                  onPress={() => {
                    setEventData(prev => ({ ...prev, city, district: '', venue: '' }));
                    setActiveDropdown(null);
                  }}
                >
                  <Text style={[styles.optionItemText, eventData.city === city && styles.optionItemTextSelected]}>
                    {city}
                  </Text>
                  {eventData.city === city && (
                    <Ionicons name="checkmark" size={20} color={colors.brand[400]} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* District Picker Modal */}
      <Modal
        visible={activeDropdown === 'district'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveDropdown(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>İlçe Seçin</Text>
              <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                <Ionicons name="close" size={24} color={colors.zinc[400]} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {availableDistricts.map((district: string) => (
                <TouchableOpacity
                  key={district}
                  style={[styles.optionItem, eventData.district === district && styles.optionItemSelected]}
                  onPress={() => {
                    setEventData(prev => ({ ...prev, district, venue: '' }));
                    setActiveDropdown(null);
                  }}
                >
                  <Text style={[styles.optionItemText, eventData.district === district && styles.optionItemTextSelected]}>
                    {district}
                  </Text>
                  {eventData.district === district && (
                    <Ionicons name="checkmark" size={20} color={colors.brand[400]} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Venue Picker Modal */}
      <Modal
        visible={activeDropdown === 'venue'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setActiveDropdown(null);
          setShowAddVenue(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showAddVenue ? 'Yeni Mekan Ekle' : 'Mekan Seçin'}
              </Text>
              <TouchableOpacity onPress={() => {
                if (showAddVenue) {
                  setShowAddVenue(false);
                } else {
                  setActiveDropdown(null);
                }
              }}>
                <Ionicons name={showAddVenue ? 'arrow-back' : 'close'} size={24} color={colors.zinc[400]} />
              </TouchableOpacity>
            </View>

            {!showAddVenue ? (
              <>
                <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                  {availableVenues.map((venue: any) => (
                    <TouchableOpacity
                      key={venue.id}
                      style={[styles.optionItem, styles.venueItem, eventData.venue === venue.name && styles.optionItemSelected]}
                      onPress={() => {
                        setEventData(prev => ({ ...prev, venue: venue.name }));
                        setActiveDropdown(null);
                      }}
                    >
                      <View style={styles.venueInfo}>
                        <Text style={[styles.optionItemText, eventData.venue === venue.name && styles.optionItemTextSelected]}>
                          {venue.name}
                        </Text>
                        <Text style={styles.venueCapacity}>Kapasite: {venue.capacity}</Text>
                      </View>
                      {eventData.venue === venue.name && (
                        <Ionicons name="checkmark" size={20} color={colors.brand[400]} />
                      )}
                    </TouchableOpacity>
                  ))}

                  {availableVenues.length === 0 && (
                    <View style={styles.emptyVenueState}>
                      <Ionicons name="business-outline" size={40} color={colors.zinc[600]} />
                      <Text style={styles.emptyVenueText}>Bu ilçede kayıtlı mekan bulunamadı</Text>
                    </View>
                  )}
                </ScrollView>

                {/* Add Venue Button */}
                <TouchableOpacity
                  style={styles.addVenueButton}
                  onPress={() => setShowAddVenue(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.brand[400]} />
                  <Text style={styles.addVenueButtonText}>Yeni Mekan Ekle</Text>
                </TouchableOpacity>
              </>
            ) : (
              <ScrollView style={styles.addVenueForm} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Mekan Adı *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: Hilton Convention Center"
                    placeholderTextColor={colors.zinc[600]}
                    value={newVenue.name}
                    onChangeText={text => setNewVenue(prev => ({ ...prev, name: text }))}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Mekan Tipi *</Text>
                  <View style={styles.venueTypeRow}>
                    <TouchableOpacity
                      style={[styles.venueTypeButton, newVenue.venueType === 'indoor' && styles.venueTypeButtonSelected]}
                      onPress={() => setNewVenue(prev => ({ ...prev, venueType: 'indoor' }))}
                    >
                      <Ionicons name="home" size={18} color={newVenue.venueType === 'indoor' ? colors.brand[400] : colors.zinc[500]} />
                      <Text style={[styles.venueTypeText, newVenue.venueType === 'indoor' && styles.venueTypeTextSelected]}>Kapalı</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.venueTypeButton, newVenue.venueType === 'outdoor' && styles.venueTypeButtonSelected]}
                      onPress={() => setNewVenue(prev => ({ ...prev, venueType: 'outdoor' }))}
                    >
                      <Ionicons name="sunny" size={18} color={newVenue.venueType === 'outdoor' ? colors.brand[400] : colors.zinc[500]} />
                      <Text style={[styles.venueTypeText, newVenue.venueType === 'outdoor' && styles.venueTypeTextSelected]}>Açık</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.venueTypeButton, newVenue.venueType === 'hybrid' && styles.venueTypeButtonSelected]}
                      onPress={() => setNewVenue(prev => ({ ...prev, venueType: 'hybrid' }))}
                    >
                      <Ionicons name="git-merge" size={18} color={newVenue.venueType === 'hybrid' ? colors.brand[400] : colors.zinc[500]} />
                      <Text style={[styles.venueTypeText, newVenue.venueType === 'hybrid' && styles.venueTypeTextSelected]}>Hibrit</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Adres</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: Cumhuriyet Cad. No:12"
                    placeholderTextColor={colors.zinc[600]}
                    value={newVenue.address}
                    onChangeText={text => setNewVenue(prev => ({ ...prev, address: text }))}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Kapasite</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: 5000"
                    placeholderTextColor={colors.zinc[600]}
                    keyboardType="numeric"
                    value={newVenue.capacity}
                    onChangeText={text => setNewVenue(prev => ({ ...prev, capacity: text }))}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Mekan Özellikleri</Text>
                  <View style={styles.featuresGrid}>
                    <TouchableOpacity
                      style={[styles.featureItem, newVenue.hasBackstage && styles.featureItemSelected]}
                      onPress={() => setNewVenue(prev => ({ ...prev, hasBackstage: !prev.hasBackstage }))}
                    >
                      <Ionicons name="person" size={20} color={newVenue.hasBackstage ? colors.brand[400] : colors.zinc[500]} />
                      <Text style={[styles.featureText, newVenue.hasBackstage && styles.featureTextSelected]}>Kulis</Text>
                      {newVenue.hasBackstage && <Ionicons name="checkmark-circle" size={16} color={colors.brand[400]} style={styles.featureCheck} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.featureItem, newVenue.hasParking && styles.featureItemSelected]}
                      onPress={() => setNewVenue(prev => ({ ...prev, hasParking: !prev.hasParking }))}
                    >
                      <Ionicons name="car" size={20} color={newVenue.hasParking ? colors.brand[400] : colors.zinc[500]} />
                      <Text style={[styles.featureText, newVenue.hasParking && styles.featureTextSelected]}>Otopark</Text>
                      {newVenue.hasParking && <Ionicons name="checkmark-circle" size={16} color={colors.brand[400]} style={styles.featureCheck} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.featureItem, newVenue.hasSoundSystem && styles.featureItemSelected]}
                      onPress={() => setNewVenue(prev => ({ ...prev, hasSoundSystem: !prev.hasSoundSystem }))}
                    >
                      <Ionicons name="volume-high" size={20} color={newVenue.hasSoundSystem ? colors.brand[400] : colors.zinc[500]} />
                      <Text style={[styles.featureText, newVenue.hasSoundSystem && styles.featureTextSelected]}>Ses Sistemi</Text>
                      {newVenue.hasSoundSystem && <Ionicons name="checkmark-circle" size={16} color={colors.brand[400]} style={styles.featureCheck} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.featureItem, newVenue.hasStage && styles.featureItemSelected]}
                      onPress={() => setNewVenue(prev => ({ ...prev, hasStage: !prev.hasStage }))}
                    >
                      <Ionicons name="tv" size={20} color={newVenue.hasStage ? colors.brand[400] : colors.zinc[500]} />
                      <Text style={[styles.featureText, newVenue.hasStage && styles.featureTextSelected]}>Sahne</Text>
                      {newVenue.hasStage && <Ionicons name="checkmark-circle" size={16} color={colors.brand[400]} style={styles.featureCheck} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.featureItem, newVenue.hasAirConditioning && styles.featureItemSelected]}
                      onPress={() => setNewVenue(prev => ({ ...prev, hasAirConditioning: !prev.hasAirConditioning }))}
                    >
                      <Ionicons name="snow" size={20} color={newVenue.hasAirConditioning ? colors.brand[400] : colors.zinc[500]} />
                      <Text style={[styles.featureText, newVenue.hasAirConditioning && styles.featureTextSelected]}>Klima</Text>
                      {newVenue.hasAirConditioning && <Ionicons name="checkmark-circle" size={16} color={colors.brand[400]} style={styles.featureCheck} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.featureItem, newVenue.hasDisabledAccess && styles.featureItemSelected]}
                      onPress={() => setNewVenue(prev => ({ ...prev, hasDisabledAccess: !prev.hasDisabledAccess }))}
                    >
                      <Ionicons name="accessibility" size={20} color={newVenue.hasDisabledAccess ? colors.brand[400] : colors.zinc[500]} />
                      <Text style={[styles.featureText, newVenue.hasDisabledAccess && styles.featureTextSelected]}>Engelli Erişimi</Text>
                      {newVenue.hasDisabledAccess && <Ionicons name="checkmark-circle" size={16} color={colors.brand[400]} style={styles.featureCheck} />}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.modalConfirmButton, (!newVenue.name.trim() || !newVenue.venueType) && styles.modalConfirmButtonDisabled]}
                  onPress={handleAddVenue}
                  disabled={!newVenue.name.trim() || !newVenue.venueType}
                >
                  <Ionicons name="checkmark" size={18} color="white" />
                  <Text style={styles.modalConfirmButtonText}>Mekanı Ekle</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: colors.brand[400],
  },
  content: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.zinc[400],
    marginTop: 8,
    marginBottom: 24,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '47%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  typeCardSelected: {
    borderColor: colors.brand[400],
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
  },
  typeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  typeCheckmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.zinc[400],
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    gap: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '47%',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  serviceCardSelected: {
    borderColor: colors.brand[400],
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  serviceIconSelected: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.zinc[400],
    textAlign: 'center',
  },
  serviceNameSelected: {
    color: colors.text,
  },
  serviceCheckmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brand[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCount: {
    fontSize: 14,
    color: colors.zinc[500],
    textAlign: 'center',
    marginTop: 20,
  },
  budgetOptions: {
    gap: 10,
  },
  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  budgetCardSelected: {
    borderColor: colors.brand[400],
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
  },
  budgetLabel: {
    fontSize: 15,
    color: colors.zinc[400],
  },
  budgetLabelSelected: {
    color: colors.text,
    fontWeight: '500',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  orText: {
    fontSize: 13,
    color: colors.zinc[500],
    marginHorizontal: 16,
  },
  customBudgetInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.zinc[400],
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 14,
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  reviewLabel: {
    fontSize: 14,
    color: colors.zinc[500],
  },
  reviewValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  reviewServicesRow: {
    paddingVertical: 12,
  },
  reviewServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  reviewServiceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderRadius: 8,
  },
  reviewServiceText: {
    fontSize: 12,
    color: colors.brand[400],
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    borderRadius: 14,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.zinc[400],
    lineHeight: 20,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  nextButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  // Dropdown styles
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 15,
    color: colors.zinc[500],
  },
  dropdownButtonTextSelected: {
    color: colors.text,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  optionItemSelected: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderColor: colors.brand[400],
  },
  optionItemText: {
    fontSize: 15,
    color: colors.zinc[400],
  },
  optionItemTextSelected: {
    color: colors.text,
    fontWeight: '500',
  },
  venueItem: {
    paddingVertical: 12,
  },
  venueInfo: {
    flex: 1,
  },
  venueCapacity: {
    fontSize: 12,
    color: colors.zinc[500],
    marginTop: 2,
  },
  // Date picker styles
  datePickerRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  datePickerColumn: {
    flex: 1,
  },
  datePickerLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.zinc[500],
    marginBottom: 8,
    textAlign: 'center',
  },
  datePickerScroll: {
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 4,
  },
  datePickerItem: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  datePickerItemSelected: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
  },
  datePickerItemText: {
    fontSize: 15,
    color: colors.zinc[400],
  },
  datePickerItemTextSelected: {
    color: colors.brand[400],
    fontWeight: '600',
  },
  modalConfirmButton: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: colors.brand[500],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalConfirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  modalConfirmButtonDisabled: {
    opacity: 0.5,
  },
  // Add Venue styles
  emptyVenueState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyVenueText: {
    fontSize: 14,
    color: colors.zinc[500],
    marginTop: 12,
  },
  addVenueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brand[400],
    borderStyle: 'dashed',
  },
  addVenueButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.brand[400],
  },
  addVenueForm: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  venueTypeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  venueTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  venueTypeButtonSelected: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderColor: colors.brand[400],
  },
  venueTypeText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.zinc[500],
  },
  venueTypeTextSelected: {
    color: colors.brand[400],
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  featureItemSelected: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  featureText: {
    flex: 1,
    fontSize: 12,
    color: colors.zinc[500],
  },
  featureTextSelected: {
    color: colors.text,
  },
  featureCheck: {
    marginLeft: 'auto',
  },
});
