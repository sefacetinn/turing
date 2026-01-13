import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { SelectionChips, SwitchRow, FormSection, InputLabel } from '../components/categoryRequest';
import { categoryConfig, userEvents, categoryOptions } from '../data/categoryRequestData';

export function CategoryRequestScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { category, provider } = (route.params as { category: string; provider?: any }) || { category: 'booking' };
  const { colors, isDark, helpers } = useTheme();

  const config = categoryConfig[category] || categoryConfig.booking;
  const options = categoryOptions[category as keyof typeof categoryOptions] || {};

  // Common state
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');

  // Category-specific state (consolidated)
  const [formState, setFormState] = useState<Record<string, any>>({});

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

  const handleSubmit = () => {
    if (!selectedEvent) {
      Alert.alert('Uyarı', 'Lütfen bir etkinlik seçin');
      return;
    }
    Alert.alert(
      'Teklif Talebi Gönderildi',
      'Talebiniz ilgili sağlayıcılara iletildi. En kısa sürede teklifler alacaksınız.',
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
    return (
      <>
        <FormSection title="Etkinlik Türü">
          <SelectionChips options={opt.eventTypes} selected={formState.eventType || ''} onSelect={v => updateForm('eventType', v)} />
        </FormSection>
        <FormSection title="Mekan Türü">
          <SelectionChips options={opt.venueTypes} selected={formState.venueType || ''} onSelect={v => updateForm('venueType', v)} />
        </FormSection>
        <FormSection title="Tahmini Katılımcı">
          <SelectionChips options={opt.guestCounts} selected={formState.guestCount || ''} onSelect={v => updateForm('guestCount', v)} />
        </FormSection>
        <FormSection title="Performans Detayları">
          <InputLabel label="Set Süresi" />
          <SelectionChips options={opt.durations} selected={formState.duration || ''} onSelect={v => updateForm('duration', v)} />
          <InputLabel label="Set Sayısı" marginTop />
          <SelectionChips options={opt.setCounts} selected={formState.setCount || ''} onSelect={v => updateForm('setCount', v)} />
        </FormSection>
        <FormSection title="Ek Hizmetler">
          <SwitchRow icon="volume-high-outline" label="Ses Sistemi Gerekli" value={formState.soundSystem || false} onValueChange={v => updateForm('soundSystem', v)} />
          <SwitchRow icon="bed-outline" label="Konaklama Gerekli" value={formState.accommodation || false} onValueChange={v => updateForm('accommodation', v)} />
          <SwitchRow icon="airplane-outline" label="Ulaşım Gerekli" value={formState.travel || false} onValueChange={v => updateForm('travel', v)} />
        </FormSection>
        <FormSection title="Backstage İstekleri">
          <TextAreaInput placeholder="Sanatçının backstage talepleri varsa belirtin..." value={formState.backstageNeeds || ''} onChangeText={(v: string) => updateForm('backstageNeeds', v)} colors={colors} isDark={isDark} />
        </FormSection>
      </>
    );
  };

  const renderTechnicalFields = () => {
    const opt = categoryOptions.technical;
    return (
      <>
        <FormSection title="Mekan Bilgileri">
          <InputLabel label="Mekan Türü" />
          <SelectionChips options={opt.venueTypes} selected={formState.indoorOutdoor || ''} onSelect={v => updateForm('indoorOutdoor', v)} />
          <InputLabel label="Mekan Büyüklüğü" marginTop />
          <SelectionChips options={opt.venueSizes} selected={formState.venueSize || ''} onSelect={v => updateForm('venueSize', v)} />
        </FormSection>
        <FormSection title="Ses Sistemi İhtiyaçları" subtitle="Birden fazla seçebilirsiniz">
          <SelectionChips options={opt.soundRequirements} selected={formState.soundRequirements || []} onSelect={v => toggleMultiSelect('soundRequirements', v)} multiSelect />
        </FormSection>
        <FormSection title="Aydınlatma İhtiyaçları" subtitle="Birden fazla seçebilirsiniz">
          <SelectionChips options={opt.lightingRequirements} selected={formState.lightingRequirements || []} onSelect={v => toggleMultiSelect('lightingRequirements', v)} multiSelect />
        </FormSection>
        <FormSection title="Sahne İhtiyacı">
          <SelectionChips options={opt.stageSizes} selected={formState.stageSize || ''} onSelect={v => updateForm('stageSize', v)} />
        </FormSection>
        <FormSection title="Güç ve Kurulum">
          <InputLabel label="Mevcut Güç Kapasitesi" />
          <SelectionChips options={opt.powerOptions} selected={formState.powerAvailable || ''} onSelect={v => updateForm('powerAvailable', v)} />
          <InputLabel label="Kurulum Süresi" marginTop />
          <SelectionChips options={opt.setupTimes} selected={formState.setupTime || ''} onSelect={v => updateForm('setupTime', v)} />
        </FormSection>
      </>
    );
  };

  const renderVenueFields = () => {
    const opt = categoryOptions.venue;
    return (
      <>
        <FormSection title="Mekan Tipi">
          <SelectionChips options={opt.styles} selected={formState.venueStyle || ''} onSelect={v => updateForm('venueStyle', v)} />
        </FormSection>
        <FormSection title="Kapasite">
          <SelectionChips options={opt.capacities} selected={formState.venueCapacity || ''} onSelect={v => updateForm('venueCapacity', v)} />
        </FormSection>
        <FormSection title="Alan Tercihi">
          <SelectionChips options={opt.areaTypes} selected={formState.indoorOutdoor || ''} onSelect={v => updateForm('indoorOutdoor', v)} />
        </FormSection>
        <FormSection title="Ek Gereksinimler">
          <SwitchRow icon="restaurant-outline" label="Catering Hizmeti" value={formState.cateringIncluded || false} onValueChange={v => updateForm('cateringIncluded', v)} />
          <SwitchRow icon="car-outline" label="Otopark Gerekli" value={formState.parkingNeeded || false} onValueChange={v => updateForm('parkingNeeded', v)} />
          <SwitchRow icon="accessibility-outline" label="Engelli Erişimi" value={formState.accessibilityNeeded || false} onValueChange={v => updateForm('accessibilityNeeded', v)} />
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoryBadge}>
          <LinearGradient colors={config.gradient} style={styles.categoryIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name={config.icon as any} size={24} color="white" />
          </LinearGradient>
        </View>

        {provider && (
          <View style={[styles.providerCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border, ...(isDark ? {} : helpers.getShadow('sm')) }]}>
            <Image source={{ uri: provider.image }} style={styles.providerImage} />
            <View style={styles.providerInfo}>
              <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#fbbf24" />
                <Text style={styles.ratingText}>{provider.rating}</Text>
              </View>
            </View>
          </View>
        )}

        <FormSection title="Etkinlik Seçin" subtitle="Bu teklif hangi etkinlik için?">
          <View style={styles.eventsList}>
            {userEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={[styles.eventCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border, ...(isDark ? {} : helpers.getShadow('sm')) }, selectedEvent === event.id && { borderColor: colors.brand[500], backgroundColor: isDark ? 'rgba(147, 51, 234, 0.05)' : 'rgba(147, 51, 234, 0.08)' }]}
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
                    <Text style={[styles.eventMetaText, { color: colors.textMuted }]}>{event.location}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.newEventCard} onPress={() => navigation.navigate('CreateEvent')}>
              <View style={styles.newEventIcon}><Ionicons name="add" size={20} color={colors.brand[400]} /></View>
              <Text style={[styles.newEventText, { color: colors.brand[400] }]}>Yeni Etkinlik Oluştur</Text>
            </TouchableOpacity>
          </View>
        </FormSection>

        <FormSection title="Hizmet Tarihi">
          <SimpleInput placeholder="GG/AA/YYYY" value={eventDate} onChangeText={setEventDate} colors={colors} isDark={isDark} icon="calendar-outline" />
        </FormSection>

        {renderCategoryFields()}

        <FormSection title="Bütçe Aralığı">
          <SimpleInput placeholder="Örn: 50.000 - 100.000 TL" value={budget} onChangeText={setBudget} colors={colors} isDark={isDark} icon="cash-outline" />
        </FormSection>

        <FormSection title="Ek Notlar">
          <TextAreaInput placeholder="Özel isteklerinizi veya ek bilgileri yazın..." value={notes} onChangeText={setNotes} colors={colors} isDark={isDark} />
        </FormSection>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.bottomAction, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <LinearGradient colors={gradients.primary} style={styles.submitButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.submitButtonText}>Teklif Talebi Gönder</Text>
            <Ionicons name="paper-plane" size={18} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Helper components
function SimpleInput({ placeholder, value, onChangeText, colors, isDark, icon }: any) {
  return (
    <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
      {icon && <Ionicons name={icon} size={18} color={colors.textMuted} />}
      <TextInput style={[styles.input, { color: colors.text }]} placeholder={placeholder} placeholderTextColor={colors.textMuted} value={value} onChangeText={onChangeText} />
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
  newEventCard: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: 'rgba(147, 51, 234, 0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(147, 51, 234, 0.2)', borderStyle: 'dashed' },
  newEventIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(147, 51, 234, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  newEventText: { fontSize: 14, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  input: { flex: 1, fontSize: 14 },
  textAreaContainer: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  textArea: { fontSize: 14, minHeight: 80 },
  bottomAction: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, borderTopWidth: 1 },
  submitButton: { borderRadius: 14, overflow: 'hidden' },
  submitButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  submitButtonText: { fontSize: 15, fontWeight: '600', color: 'white' },
});
