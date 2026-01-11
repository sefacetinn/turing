import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients, categoryGradients } from '../theme/colors';

type Step = 'type' | 'details' | 'services' | 'budget' | 'review';

const eventTypes = [
  { id: 'wedding', name: 'Düğün', icon: 'heart', gradient: categoryGradients.wedding },
  { id: 'corporate', name: 'Kurumsal', icon: 'business', gradient: categoryGradients.corporate },
  { id: 'concert', name: 'Konser', icon: 'musical-notes', gradient: categoryGradients.concert },
  { id: 'private', name: 'Özel Parti', icon: 'wine', gradient: categoryGradients.party },
  { id: 'festival', name: 'Festival', icon: 'people', gradient: categoryGradients.festival },
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
  const [eventData, setEventData] = useState({
    type: '',
    name: '',
    date: '',
    time: '',
    location: '',
    guestCount: '',
    description: '',
    services: [] as string[],
    budget: '',
    customBudget: '',
  });

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
        return eventData.name !== '' && eventData.date !== '' && eventData.location !== '';
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
    navigation.navigate('Events');
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
                placeholder="Örn: Yıldız Düğün Organizasyonu"
                placeholderTextColor={colors.zinc[600]}
                value={eventData.name}
                onChangeText={text => setEventData(prev => ({ ...prev, name: text }))}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Tarih *</Text>
                <TouchableOpacity style={styles.input}>
                  <Ionicons name="calendar-outline" size={20} color={colors.zinc[500]} />
                  <TextInput
                    style={styles.inputText}
                    placeholder="GG/AA/YYYY"
                    placeholderTextColor={colors.zinc[600]}
                    value={eventData.date}
                    onChangeText={text => setEventData(prev => ({ ...prev, date: text }))}
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Saat</Text>
                <TouchableOpacity style={styles.input}>
                  <Ionicons name="time-outline" size={20} color={colors.zinc[500]} />
                  <TextInput
                    style={styles.inputText}
                    placeholder="SS:DD"
                    placeholderTextColor={colors.zinc[600]}
                    value={eventData.time}
                    onChangeText={text => setEventData(prev => ({ ...prev, time: text }))}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Konum *</Text>
              <TouchableOpacity style={styles.input}>
                <Ionicons name="location-outline" size={20} color={colors.zinc[500]} />
                <TextInput
                  style={styles.inputText}
                  placeholder="Şehir veya adres girin"
                  placeholderTextColor={colors.zinc[600]}
                  value={eventData.location}
                  onChangeText={text => setEventData(prev => ({ ...prev, location: text }))}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tahmini Konuk Sayısı</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: 150"
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
                  {eventData.date} {eventData.time && `- ${eventData.time}`}
                </Text>
              </View>

              <View style={styles.reviewDivider} />

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Konum</Text>
                <Text style={styles.reviewValue}>{eventData.location}</Text>
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
});
