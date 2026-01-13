import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import {
  StepProgress,
  SelectModal,
  DatePickerModal,
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
} from '../data/createEventData';

export function CreateEventScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [newVenue, setNewVenue] = useState<NewVenueData>(initialNewVenueData);
  const [customVenues, setCustomVenues] = useState<Venue[]>([]);
  const [eventData, setEventData] = useState<EventData>(initialEventData);

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const availableDistricts = useMemo(() => getAvailableDistricts(eventData.city), [eventData.city]);
  const availableVenues = useMemo(
    () => getAvailableVenues(eventData.city, eventData.district, customVenues),
    [eventData.city, eventData.district, customVenues]
  );
  const formattedDate = useMemo(
    () => getFormattedDate(eventData.day, eventData.month, eventData.year),
    [eventData.day, eventData.month, eventData.year]
  );
  const formattedLocation = useMemo(
    () => getFormattedLocation(eventData.city, eventData.district, eventData.venue),
    [eventData.city, eventData.district, eventData.venue]
  );

  const canProceed = () => {
    switch (currentStep) {
      case 'type': return eventData.type !== '';
      case 'details': return eventData.name !== '' && formattedDate !== '' && eventData.city !== '';
      case 'services': return eventData.services.length > 0;
      case 'budget': return eventData.budget !== '' || eventData.customBudget !== '';
      default: return true;
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
    if (!newVenue.name.trim() || !newVenue.venueType) return;
    const features: string[] = [];
    if (newVenue.hasBackstage) features.push('Kulis');
    if (newVenue.hasParking) features.push('Otopark');
    if (newVenue.hasSoundSystem) features.push('Ses Sistemi');
    if (newVenue.hasStage) features.push('Sahne');
    if (newVenue.hasAirConditioning) features.push('Klima');
    if (newVenue.hasDisabledAccess) features.push('Engelli Erişimi');

    const venueId = `${eventData.city}-${eventData.district}-custom-${Date.now()}`;
    const venue: Venue = {
      id: venueId,
      name: newVenue.name,
      capacity: newVenue.capacity || 'Belirtilmedi',
      address: newVenue.address,
      venueType: newVenue.venueType === 'indoor' ? 'Kapalı Alan' : newVenue.venueType === 'outdoor' ? 'Açık Alan' : 'Hibrit',
      features,
    };

    setCustomVenues(prev => [...prev, venue]);
    setEventData(prev => ({ ...prev, venue: venue.name }));
    setNewVenue(initialNewVenueData);
    setShowAddVenue(false);
    setActiveDropdown(null);
  };

  const createEvent = () => {
    console.log('Creating event:', eventData);
    navigation.goBack();
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
                style={[styles.dropdownButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }]}
                onPress={() => setActiveDropdown('date')}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
                <Text style={[styles.dropdownButtonText, { color: colors.textMuted }, formattedDate && { color: colors.text }]}>
                  {formattedDate || 'Tarih seçin'}
                </Text>
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
            {eventData.district && availableVenues.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Mekan</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }]}
                  onPress={() => setActiveDropdown('venue')}
                >
                  <Ionicons name="business-outline" size={20} color={colors.textMuted} />
                  <Text style={[styles.dropdownButtonText, { color: colors.textMuted }, eventData.venue && { color: colors.text }]}>
                    {eventData.venue || 'Mekan seçin'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>Tahmini Konuk Sayısı</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)', color: colors.text }]}
                placeholder="Örn: 5000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={eventData.guestCount}
                onChangeText={text => setEventData(prev => ({ ...prev, guestCount: text }))}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>Açıklama</Text>
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
                    <View key={service.id} style={[styles.reviewServiceTag, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.1)' }]}>
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
            <View style={[styles.infoCard, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.08)' : 'rgba(147, 51, 234, 0.06)' }]}>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.bottomAction, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
        {currentStep !== 'review' ? (
          <TouchableOpacity style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]} onPress={nextStep} disabled={!canProceed()}>
            <LinearGradient colors={canProceed() ? gradients.primary : (isDark ? ['#3f3f46', '#3f3f46'] : ['#d4d4d8', '#d4d4d8'])} style={styles.nextButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.nextButtonText}>Devam Et</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={createEvent}>
            <LinearGradient colors={gradients.primary} style={styles.nextButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text style={styles.nextButtonText}>Etkinlik Oluştur</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Modals */}
      <DatePickerModal
        visible={activeDropdown === 'date'}
        day={eventData.day}
        month={eventData.month}
        year={eventData.year}
        onDayChange={day => setEventData(prev => ({ ...prev, day }))}
        onMonthChange={month => setEventData(prev => ({ ...prev, month }))}
        onYearChange={year => setEventData(prev => ({ ...prev, year }))}
        onClose={() => setActiveDropdown(null)}
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
        options={availableVenues.map(v => ({ value: v.name, label: v.name, subtitle: `Kapasite: ${v.capacity}` }))}
        selectedValue={eventData.venue}
        onSelect={venue => setEventData(prev => ({ ...prev, venue }))}
        onClose={() => setActiveDropdown(null)}
      />

      <OperationModal
        visible={showOperationModal}
        selectedServices={eventData.operationSubServices}
        onToggle={toggleOperationSubService}
        onClose={() => setShowOperationModal(false)}
      />
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
  typeCardSelected: { backgroundColor: 'rgba(147, 51, 234, 0.08)' },
  typeIconContainer: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  typeName: { fontSize: 14, fontWeight: '500' },
  typeCheckmark: { position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: 10, backgroundColor: '#9333ea', alignItems: 'center', justifyContent: 'center' },
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15 },
  textArea: { minHeight: 100, textAlignVertical: 'top', paddingTop: 14 },
  dropdownButton: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  dropdownButtonText: { flex: 1, fontSize: 15 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceCard: { width: '47%', padding: 14, borderRadius: 14, borderWidth: 2, borderColor: 'transparent', alignItems: 'center' },
  serviceCardSelected: { backgroundColor: 'rgba(147, 51, 234, 0.08)' },
  serviceIconContainer: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  serviceIconSelected: { backgroundColor: 'rgba(147, 51, 234, 0.2)' },
  serviceName: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  serviceCheckmark: { position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9, backgroundColor: '#9333ea', alignItems: 'center', justifyContent: 'center' },
  serviceArrow: { position: 'absolute', top: 10, right: 10 },
  subServiceCountBadge: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: '#9333ea', alignItems: 'center', justifyContent: 'center' },
  subServiceCountText: { fontSize: 11, fontWeight: '600', color: 'white' },
  selectedCount: { fontSize: 14, textAlign: 'center', marginTop: 20 },
  budgetOptions: { gap: 10 },
  budgetCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  budgetCardSelected: { backgroundColor: 'rgba(147, 51, 234, 0.08)' },
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
  reviewServiceText: { fontSize: 12, fontWeight: '500', color: '#9333ea' },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 14 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  bottomAction: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 34, borderTopWidth: 1 },
  nextButton: { borderRadius: 14, overflow: 'hidden' },
  nextButtonDisabled: { opacity: 0.6 },
  nextButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  nextButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
});
