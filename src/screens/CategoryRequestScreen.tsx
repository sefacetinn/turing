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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';

// Category configurations
const categoryConfig: Record<string, { title: string; icon: string; gradient: readonly [string, string, ...string[]] }> = {
  booking: { title: 'Sanatçı / DJ Talebi', icon: 'musical-notes', gradient: gradients.booking },
  technical: { title: 'Teknik Ekipman Talebi', icon: 'volume-high', gradient: gradients.technical },
  venue: { title: 'Mekan Talebi', icon: 'business', gradient: gradients.venue },
  accommodation: { title: 'Konaklama Talebi', icon: 'bed', gradient: gradients.accommodation },
  transport: { title: 'Ulaşım Talebi', icon: 'car', gradient: gradients.transport },
  flight: { title: 'Uçuş Talebi', icon: 'airplane', gradient: gradients.flight },
  // Operation subcategories
  security: { title: 'Güvenlik Talebi', icon: 'shield-checkmark', gradient: gradients.operation },
  catering: { title: 'Catering Talebi', icon: 'restaurant', gradient: gradients.operation },
  generator: { title: 'Jeneratör Talebi', icon: 'flash', gradient: gradients.operation },
  beverage: { title: 'İçecek Hizmetleri Talebi', icon: 'cafe', gradient: gradients.operation },
  medical: { title: 'Medikal Hizmet Talebi', icon: 'medkit', gradient: gradients.operation },
  sanitation: { title: 'Sanitasyon Talebi', icon: 'trash', gradient: gradients.operation },
  media: { title: 'Medya Hizmetleri Talebi', icon: 'camera', gradient: gradients.operation },
  barrier: { title: 'Bariyer Talebi', icon: 'remove-circle', gradient: gradients.operation },
  tent: { title: 'Çadır / Tente Talebi', icon: 'home', gradient: gradients.operation },
  ticketing: { title: 'Biletleme Talebi', icon: 'ticket', gradient: gradients.operation },
  decoration: { title: 'Dekorasyon Talebi', icon: 'color-palette', gradient: gradients.operation },
  production: { title: 'Prodüksiyon Talebi', icon: 'film', gradient: gradients.operation },
};

// Mock events
const userEvents = [
  { id: 'e1', title: 'Yaz Festivali 2024', date: '15 Temmuz 2024', location: 'İstanbul' },
  { id: 'e2', title: 'Kurumsal Gala', date: '22 Ağustos 2024', location: 'Ankara' },
  { id: 'e3', title: 'Düğün Organizasyonu', date: '1 Eylül 2024', location: 'İzmir' },
];

// Selection chips component
function SelectionChips({
  options,
  selected,
  onSelect,
  multiSelect = false
}: {
  options: string[];
  selected: string | string[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
}) {
  const isSelected = (option: string) => {
    if (multiSelect && Array.isArray(selected)) {
      return selected.includes(option);
    }
    return selected === option;
  };

  return (
    <View style={styles.chipsContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.chip, isSelected(option) && styles.chipSelected]}
          onPress={() => onSelect(option)}
        >
          <Text style={[styles.chipText, isSelected(option) && styles.chipTextSelected]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function CategoryRequestScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { category, provider } = (route.params as { category: string; provider?: any }) || { category: 'booking' };

  const config = categoryConfig[category] || categoryConfig.booking;

  // Common state
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');

  // Booking specific
  const [eventType, setEventType] = useState('');
  const [duration, setDuration] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [venueType, setVenueType] = useState('');
  const [soundSystem, setSoundSystem] = useState(false);
  const [accommodation, setAccommodation] = useState(false);
  const [travel, setTravel] = useState(false);
  const [setCount, setSetCount] = useState('1');
  const [backstageNeeds, setBackstageNeeds] = useState('');

  // Technical specific
  const [venueSize, setVenueSize] = useState('');
  const [indoorOutdoor, setIndoorOutdoor] = useState('');
  const [soundRequirements, setSoundRequirements] = useState<string[]>([]);
  const [lightingRequirements, setLightingRequirements] = useState<string[]>([]);
  const [stageSize, setStageSize] = useState('');
  const [powerAvailable, setPowerAvailable] = useState('');
  const [setupTime, setSetupTime] = useState('');

  // Venue specific
  const [venueCapacity, setVenueCapacity] = useState('');
  const [venueStyle, setVenueStyle] = useState('');
  const [cateringIncluded, setCateringIncluded] = useState(false);
  const [parkingNeeded, setParkingNeeded] = useState(false);
  const [accessibilityNeeded, setAccessibilityNeeded] = useState(false);

  // Transport specific
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [passengerCount, setPassengerCount] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [returnTrip, setReturnTrip] = useState(false);
  const [pickupTime, setPickupTime] = useState('');

  // Accommodation specific
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [roomCount, setRoomCount] = useState('');
  const [roomType, setRoomType] = useState('');
  const [breakfastIncluded, setBreakfastIncluded] = useState(false);
  const [starRating, setStarRating] = useState('');

  // Flight specific
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [flightClass, setFlightClass] = useState('');
  const [baggageNeeds, setBaggageNeeds] = useState('');
  const [roundTrip, setRoundTrip] = useState(false);

  // Security specific
  const [guardCount, setGuardCount] = useState('');
  const [shiftHours, setShiftHours] = useState('');
  const [securityAreas, setSecurityAreas] = useState<string[]>([]);
  const [armedSecurity, setArmedSecurity] = useState(false);

  // Catering specific
  const [mealType, setMealType] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [serviceStyle, setServiceStyle] = useState('');

  // Generator specific
  const [powerRequirement, setPowerRequirement] = useState('');
  const [generatorDuration, setGeneratorDuration] = useState('');
  const [backupNeeded, setBackupNeeded] = useState(false);

  // Beverage specific
  const [barType, setBarType] = useState('');
  const [beverageTypes, setBeverageTypes] = useState<string[]>([]);
  const [bartenderCount, setBartenderCount] = useState('');

  // Medical specific
  const [medicalServices, setMedicalServices] = useState<string[]>([]);
  const [ambulanceStandby, setAmbulanceStandby] = useState(false);

  // Media specific
  const [mediaServices, setMediaServices] = useState<string[]>([]);
  const [deliveryFormat, setDeliveryFormat] = useState<string[]>([]);

  // Barrier specific
  const [barrierType, setBarrierType] = useState('');
  const [barrierLength, setBarrierLength] = useState('');

  // Tent specific
  const [tentSize, setTentSize] = useState('');
  const [tentType, setTentType] = useState('');
  const [tentFeatures, setTentFeatures] = useState<string[]>([]);

  // Ticketing specific
  const [ticketCapacity, setTicketCapacity] = useState('');
  const [ticketTypes, setTicketTypes] = useState<string[]>([]);
  const [ticketTech, setTicketTech] = useState<string[]>([]);

  // Decoration specific
  const [decorTheme, setDecorTheme] = useState('');
  const [decorAreas, setDecorAreas] = useState<string[]>([]);
  const [floralsNeeded, setFloralsNeeded] = useState(false);

  // Production specific
  const [productionServices, setProductionServices] = useState<string[]>([]);
  const [crewSize, setCrewSize] = useState('');

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

  const handleMultiSelect = (value: string, current: string[], setter: (val: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter(v => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  // Render category-specific fields
  const renderCategoryFields = () => {
    switch (category) {
      case 'booking':
        return renderBookingFields();
      case 'technical':
        return renderTechnicalFields();
      case 'venue':
        return renderVenueFields();
      case 'transport':
        return renderTransportFields();
      case 'accommodation':
        return renderAccommodationFields();
      case 'flight':
        return renderFlightFields();
      case 'security':
        return renderSecurityFields();
      case 'catering':
        return renderCateringFields();
      case 'generator':
        return renderGeneratorFields();
      case 'beverage':
        return renderBeverageFields();
      case 'medical':
        return renderMedicalFields();
      case 'media':
        return renderMediaFields();
      case 'barrier':
        return renderBarrierFields();
      case 'tent':
        return renderTentFields();
      case 'ticketing':
        return renderTicketingFields();
      case 'decoration':
        return renderDecorationFields();
      case 'production':
        return renderProductionFields();
      default:
        return null;
    }
  };

  const renderBookingFields = () => (
    <>
      {/* Event Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Etkinlik Türü</Text>
        <SelectionChips
          options={['Konser', 'Festival', 'Kurumsal', 'Düğün', 'Özel Parti', 'Kulüp']}
          selected={eventType}
          onSelect={setEventType}
        />
      </View>

      {/* Venue Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mekan Türü</Text>
        <SelectionChips
          options={['Açık Alan', 'Kapalı Alan', 'Stadyum', 'Sahil', 'Otel', 'Konferans']}
          selected={venueType}
          onSelect={setVenueType}
        />
      </View>

      {/* Guest Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tahmini Katılımcı</Text>
        <SelectionChips
          options={['< 100', '100-500', '500-1000', '1000-5000', '5000+']}
          selected={guestCount}
          onSelect={setGuestCount}
        />
      </View>

      {/* Performance Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performans Detayları</Text>

        <Text style={styles.inputLabel}>Set Süresi</Text>
        <SelectionChips
          options={['30 dk', '45 dk', '60 dk', '90 dk', '120 dk', 'Özel']}
          selected={duration}
          onSelect={setDuration}
        />

        <Text style={[styles.inputLabel, { marginTop: 16 }]}>Set Sayısı</Text>
        <SelectionChips
          options={['1 Set', '2 Set', '3 Set']}
          selected={setCount}
          onSelect={setSetCount}
        />
      </View>

      {/* Additional Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ek Hizmetler</Text>

        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="volume-high-outline" size={20} color={colors.zinc[400]} />
            <Text style={styles.switchLabel}>Ses Sistemi Gerekli</Text>
          </View>
          <Switch
            value={soundSystem}
            onValueChange={setSoundSystem}
            trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
            thumbColor="white"
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="bed-outline" size={20} color={colors.zinc[400]} />
            <Text style={styles.switchLabel}>Konaklama Gerekli</Text>
          </View>
          <Switch
            value={accommodation}
            onValueChange={setAccommodation}
            trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
            thumbColor="white"
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="airplane-outline" size={20} color={colors.zinc[400]} />
            <Text style={styles.switchLabel}>Ulaşım Gerekli</Text>
          </View>
          <Switch
            value={travel}
            onValueChange={setTravel}
            trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
            thumbColor="white"
          />
        </View>
      </View>

      {/* Backstage Requirements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backstage İstekleri</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Sanatçının backstage talepleri varsa belirtin..."
            placeholderTextColor={colors.zinc[600]}
            value={backstageNeeds}
            onChangeText={setBackstageNeeds}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>
    </>
  );

  const renderTechnicalFields = () => (
    <>
      {/* Venue Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mekan Bilgileri</Text>

        <Text style={styles.inputLabel}>Mekan Türü</Text>
        <SelectionChips
          options={['Açık Alan', 'Kapalı Alan', 'Yarı Açık']}
          selected={indoorOutdoor}
          onSelect={setIndoorOutdoor}
        />

        <Text style={[styles.inputLabel, { marginTop: 16 }]}>Mekan Büyüklüğü</Text>
        <SelectionChips
          options={['Küçük (< 200m²)', 'Orta (200-500m²)', 'Büyük (500-1000m²)', 'Çok Büyük (1000m²+)']}
          selected={venueSize}
          onSelect={setVenueSize}
        />
      </View>

      {/* Sound Requirements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ses Sistemi İhtiyaçları</Text>
        <Text style={styles.sectionSubtitle}>Birden fazla seçebilirsiniz</Text>
        <SelectionChips
          options={['Line Array', 'Point Source', 'Subwoofer', 'Sahne Monitör', 'In-Ear Monitör', 'DJ Mixer', 'Mikrofon Seti']}
          selected={soundRequirements}
          onSelect={(v) => handleMultiSelect(v, soundRequirements, setSoundRequirements)}
          multiSelect
        />
      </View>

      {/* Lighting Requirements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aydınlatma İhtiyaçları</Text>
        <Text style={styles.sectionSubtitle}>Birden fazla seçebilirsiniz</Text>
        <SelectionChips
          options={['Moving Head', 'LED Par', 'LED Bar', 'Lazer', 'Sis Makinesi', 'Strobo', 'Follow Spot']}
          selected={lightingRequirements}
          onSelect={(v) => handleMultiSelect(v, lightingRequirements, setLightingRequirements)}
          multiSelect
        />
      </View>

      {/* Stage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sahne İhtiyacı</Text>
        <SelectionChips
          options={['Yok', '4x3m', '6x4m', '8x6m', '10x8m', '12x10m', 'Özel']}
          selected={stageSize}
          onSelect={setStageSize}
        />
      </View>

      {/* Power & Setup */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Güç ve Kurulum</Text>

        <Text style={styles.inputLabel}>Mevcut Güç Kapasitesi</Text>
        <SelectionChips
          options={['32A', '63A', '125A', 'Bilmiyorum', 'Jeneratör Gerekli']}
          selected={powerAvailable}
          onSelect={setPowerAvailable}
        />

        <Text style={[styles.inputLabel, { marginTop: 16 }]}>Kurulum Süresi</Text>
        <SelectionChips
          options={['2 saat', '4 saat', '1 gün', '2 gün']}
          selected={setupTime}
          onSelect={setSetupTime}
        />
      </View>
    </>
  );

  const renderVenueFields = () => (
    <>
      {/* Venue Style */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mekan Tipi</Text>
        <SelectionChips
          options={['Otel', 'Restoran', 'Bahçe', 'Teras', 'Konferans', 'Tarihi Mekan', 'Sahil', 'Çiftlik']}
          selected={venueStyle}
          onSelect={setVenueStyle}
        />
      </View>

      {/* Capacity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kapasite</Text>
        <SelectionChips
          options={['< 50', '50-100', '100-200', '200-500', '500-1000', '1000+']}
          selected={venueCapacity}
          onSelect={setVenueCapacity}
        />
      </View>

      {/* Indoor/Outdoor */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alan Tercihi</Text>
        <SelectionChips
          options={['Açık Alan', 'Kapalı Alan', 'Her İkisi', 'Farketmez']}
          selected={indoorOutdoor}
          onSelect={setIndoorOutdoor}
        />
      </View>

      {/* Additional Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ek Gereksinimler</Text>

        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="restaurant-outline" size={20} color={colors.zinc[400]} />
            <Text style={styles.switchLabel}>Catering Hizmeti</Text>
          </View>
          <Switch
            value={cateringIncluded}
            onValueChange={setCateringIncluded}
            trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
            thumbColor="white"
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="car-outline" size={20} color={colors.zinc[400]} />
            <Text style={styles.switchLabel}>Otopark Gerekli</Text>
          </View>
          <Switch
            value={parkingNeeded}
            onValueChange={setParkingNeeded}
            trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
            thumbColor="white"
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="accessibility-outline" size={20} color={colors.zinc[400]} />
            <Text style={styles.switchLabel}>Engelli Erişimi</Text>
          </View>
          <Switch
            value={accessibilityNeeded}
            onValueChange={setAccessibilityNeeded}
            trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
            thumbColor="white"
          />
        </View>
      </View>
    </>
  );

  const renderTransportFields = () => (
    <>
      {/* Locations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Güzergah Bilgileri</Text>

        <Text style={styles.inputLabel}>Alış Noktası</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={18} color={colors.zinc[500]} />
          <TextInput
            style={styles.input}
            placeholder="Adres veya konum"
            placeholderTextColor={colors.zinc[600]}
            value={pickupLocation}
            onChangeText={setPickupLocation}
          />
        </View>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>Bırakış Noktası</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={18} color={colors.zinc[500]} />
          <TextInput
            style={styles.input}
            placeholder="Adres veya konum"
            placeholderTextColor={colors.zinc[600]}
            value={dropoffLocation}
            onChangeText={setDropoffLocation}
          />
        </View>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>Alış Saati</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="time-outline" size={18} color={colors.zinc[500]} />
          <TextInput
            style={styles.input}
            placeholder="Örn: 14:00"
            placeholderTextColor={colors.zinc[600]}
            value={pickupTime}
            onChangeText={setPickupTime}
          />
        </View>
      </View>

      {/* Passenger Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yolcu Sayısı</Text>
        <SelectionChips
          options={['1-2', '3-4', '5-7', '8-12', '13-20', '20+']}
          selected={passengerCount}
          onSelect={setPassengerCount}
        />
      </View>

      {/* Vehicle Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Araç Tipi</Text>
        <SelectionChips
          options={['Sedan', 'SUV', 'VIP Van', 'Minibüs', 'Otobüs', 'Lüks Sedan']}
          selected={vehicleType}
          onSelect={setVehicleType}
        />
      </View>

      {/* Return Trip */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="swap-horizontal-outline" size={20} color={colors.zinc[400]} />
            <Text style={styles.switchLabel}>Dönüş Yolculuğu</Text>
          </View>
          <Switch
            value={returnTrip}
            onValueChange={setReturnTrip}
            trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
            thumbColor="white"
          />
        </View>
      </View>
    </>
  );

  const renderAccommodationFields = () => (
    <>
      {/* Dates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tarihler</Text>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Giriş</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={18} color={colors.zinc[500]} />
              <TextInput
                style={styles.input}
                placeholder="GG/AA/YYYY"
                placeholderTextColor={colors.zinc[600]}
                value={checkInDate}
                onChangeText={setCheckInDate}
              />
            </View>
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Çıkış</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={18} color={colors.zinc[500]} />
              <TextInput
                style={styles.input}
                placeholder="GG/AA/YYYY"
                placeholderTextColor={colors.zinc[600]}
                value={checkOutDate}
                onChangeText={setCheckOutDate}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Room Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Oda Sayısı</Text>
        <SelectionChips
          options={['1', '2', '3-5', '5-10', '10-20', '20+']}
          selected={roomCount}
          onSelect={setRoomCount}
        />
      </View>

      {/* Room Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Oda Tipi</Text>
        <SelectionChips
          options={['Tek Kişilik', 'Çift Kişilik', 'Suit', 'Aile Odası', 'Karışık']}
          selected={roomType}
          onSelect={setRoomType}
        />
      </View>

      {/* Star Rating */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Otel Standardı</Text>
        <SelectionChips
          options={['3 Yıldız', '4 Yıldız', '5 Yıldız', 'Butik Otel', 'Farketmez']}
          selected={starRating}
          onSelect={setStarRating}
        />
      </View>

      {/* Breakfast */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="cafe-outline" size={20} color={colors.zinc[400]} />
            <Text style={styles.switchLabel}>Kahvaltı Dahil</Text>
          </View>
          <Switch
            value={breakfastIncluded}
            onValueChange={setBreakfastIncluded}
            trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
            thumbColor="white"
          />
        </View>
      </View>
    </>
  );

  const renderFlightFields = () => (
    <>
      {/* Cities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uçuş Bilgileri</Text>

        <Text style={styles.inputLabel}>Kalkış Şehri</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="airplane-outline" size={18} color={colors.zinc[500]} />
          <TextInput
            style={styles.input}
            placeholder="Örn: İstanbul"
            placeholderTextColor={colors.zinc[600]}
            value={departureCity}
            onChangeText={setDepartureCity}
          />
        </View>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>Varış Şehri</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={18} color={colors.zinc[500]} />
          <TextInput
            style={styles.input}
            placeholder="Örn: Ankara"
            placeholderTextColor={colors.zinc[600]}
            value={arrivalCity}
            onChangeText={setArrivalCity}
          />
        </View>
      </View>

      {/* Passenger Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yolcu Sayısı</Text>
        <SelectionChips
          options={['1', '2', '3-5', '5-10', '10+']}
          selected={passengerCount}
          onSelect={setPassengerCount}
        />
      </View>

      {/* Class */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uçuş Sınıfı</Text>
        <SelectionChips
          options={['Ekonomi', 'Business', 'First Class', 'Özel Jet']}
          selected={flightClass}
          onSelect={setFlightClass}
        />
      </View>

      {/* Baggage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bagaj İhtiyacı</Text>
        <SelectionChips
          options={['Sadece El Bagajı', 'Standart (20kg)', 'Ekstra Bagaj', 'Özel Ekipman']}
          selected={baggageNeeds}
          onSelect={setBaggageNeeds}
        />
      </View>

      {/* Round Trip */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="swap-horizontal-outline" size={20} color={colors.zinc[400]} />
            <Text style={styles.switchLabel}>Gidiş-Dönüş</Text>
          </View>
          <Switch
            value={roundTrip}
            onValueChange={setRoundTrip}
            trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
            thumbColor="white"
          />
        </View>
      </View>
    </>
  );

  const renderSecurityFields = () => (
    <>
      {/* Guard Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Güvenlik Personeli Sayısı</Text>
        <SelectionChips
          options={['1-2', '3-5', '6-10', '11-20', '20-50', '50+']}
          selected={guardCount}
          onSelect={setGuardCount}
        />
      </View>

      {/* Shift Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Çalışma Süresi</Text>
        <SelectionChips
          options={['4 saat', '8 saat', '12 saat', '24 saat', 'Çok Günlü']}
          selected={shiftHours}
          onSelect={setShiftHours}
        />
      </View>

      {/* Security Areas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Güvenlik Alanları</Text>
        <Text style={styles.sectionSubtitle}>Birden fazla seçebilirsiniz</Text>
        <SelectionChips
          options={['Giriş Kontrolü', 'VIP Alan', 'Sahne', 'Backstage', 'Otopark', 'Çevre Güvenliği']}
          selected={securityAreas}
          onSelect={(v) => handleMultiSelect(v, securityAreas, setSecurityAreas)}
          multiSelect
        />
      </View>

      {/* Armed Security */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="shield-outline" size={20} color={colors.zinc[400]} />
            <Text style={styles.switchLabel}>Silahlı Güvenlik</Text>
          </View>
          <Switch
            value={armedSecurity}
            onValueChange={setArmedSecurity}
            trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
            thumbColor="white"
          />
        </View>
      </View>
    </>
  );

  const renderCateringFields = () => (
    <>
      {/* Guest Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kişi Sayısı</Text>
        <SelectionChips
          options={['< 50', '50-100', '100-200', '200-500', '500-1000', '1000+']}
          selected={guestCount}
          onSelect={setGuestCount}
        />
      </View>

      {/* Meal Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yemek Türleri</Text>
        <Text style={styles.sectionSubtitle}>Birden fazla seçebilirsiniz</Text>
        <SelectionChips
          options={['Kahvaltı', 'Öğle Yemeği', 'Akşam Yemeği', 'Kokteyl', 'Atıştırmalık', 'Gala Yemeği']}
          selected={mealType}
          onSelect={(v) => handleMultiSelect(v, mealType, setMealType)}
          multiSelect
        />
      </View>

      {/* Service Style */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servis Tipi</Text>
        <SelectionChips
          options={['Açık Büfe', 'Set Menü', 'Tabldot', 'Finger Food', 'Food Truck']}
          selected={serviceStyle}
          onSelect={setServiceStyle}
        />
      </View>

      {/* Dietary Restrictions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diyet Gereksinimleri</Text>
        <Text style={styles.sectionSubtitle}>Birden fazla seçebilirsiniz</Text>
        <SelectionChips
          options={['Vejetaryen', 'Vegan', 'Gluten-Free', 'Helal', 'Koşer', 'Alerjen Dikkat']}
          selected={dietaryRestrictions}
          onSelect={(v) => handleMultiSelect(v, dietaryRestrictions, setDietaryRestrictions)}
          multiSelect
        />
      </View>
    </>
  );

  const renderGeneratorFields = () => (
    <>
      {/* Power Requirement */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Güç İhtiyacı</Text>
        <SelectionChips
          options={['20 kVA', '40 kVA', '60 kVA', '100 kVA', '150 kVA', '200+ kVA', 'Bilmiyorum']}
          selected={powerRequirement}
          onSelect={setPowerRequirement}
        />
      </View>

      {/* Duration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kullanım Süresi</Text>
        <SelectionChips
          options={['4 saat', '8 saat', '12 saat', '24 saat', '2-3 gün', '1 hafta+']}
          selected={generatorDuration}
          onSelect={setGeneratorDuration}
        />
      </View>

      {/* Backup */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="flash-outline" size={20} color={colors.zinc[400]} />
            <Text style={styles.switchLabel}>Yedek Jeneratör Gerekli</Text>
          </View>
          <Switch
            value={backupNeeded}
            onValueChange={setBackupNeeded}
            trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
            thumbColor="white"
          />
        </View>
      </View>
    </>
  );

  const renderBeverageFields = () => (
    <>
      {/* Bar Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bar Tipi</Text>
        <SelectionChips
          options={['Açık Bar', 'Sınırlı Bar', 'Cash Bar', 'Sadece Alkolsüz']}
          selected={barType}
          onSelect={setBarType}
        />
      </View>

      {/* Beverage Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İçecek Türleri</Text>
        <Text style={styles.sectionSubtitle}>Birden fazla seçebilirsiniz</Text>
        <SelectionChips
          options={['Bira', 'Şarap', 'Kokteyl', 'Viski', 'Votka', 'Alkolsüz', 'Kahve/Çay']}
          selected={beverageTypes}
          onSelect={(v) => handleMultiSelect(v, beverageTypes, setBeverageTypes)}
          multiSelect
        />
      </View>

      {/* Guest Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kişi Sayısı</Text>
        <SelectionChips
          options={['< 50', '50-100', '100-200', '200-500', '500+']}
          selected={guestCount}
          onSelect={setGuestCount}
        />
      </View>

      {/* Bartender Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Barmen Sayısı</Text>
        <SelectionChips
          options={['1', '2', '3-4', '5-6', '7+']}
          selected={bartenderCount}
          onSelect={setBartenderCount}
        />
      </View>
    </>
  );

  const renderMedicalFields = () => (
    <>
      {/* Medical Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sağlık Hizmetleri</Text>
        <Text style={styles.sectionSubtitle}>Birden fazla seçebilirsiniz</Text>
        <SelectionChips
          options={['İlk Yardım Noktası', 'Sağlık Personeli', 'Doktor', 'Hemşire', 'Paramedik']}
          selected={medicalServices}
          onSelect={(v) => handleMultiSelect(v, medicalServices, setMedicalServices)}
          multiSelect
        />
      </View>

      {/* Guest Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Etkinlik Kapasitesi</Text>
        <SelectionChips
          options={['< 100', '100-500', '500-1000', '1000-5000', '5000+']}
          selected={guestCount}
          onSelect={setGuestCount}
        />
      </View>

      {/* Duration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Etkinlik Süresi</Text>
        <SelectionChips
          options={['4 saat', '8 saat', '12 saat', '24 saat', 'Çok Günlü']}
          selected={duration}
          onSelect={setDuration}
        />
      </View>

      {/* Ambulance */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="medical-outline" size={20} color={colors.zinc[400]} />
            <Text style={styles.switchLabel}>Ambulans Standby</Text>
          </View>
          <Switch
            value={ambulanceStandby}
            onValueChange={setAmbulanceStandby}
            trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
            thumbColor="white"
          />
        </View>
      </View>
    </>
  );

  const renderMediaFields = () => (
    <>
      {/* Media Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medya Hizmetleri</Text>
        <Text style={styles.sectionSubtitle}>Birden fazla seçebilirsiniz</Text>
        <SelectionChips
          options={['Fotoğraf', 'Video', 'Drone', 'Canlı Yayın', '360° Video', 'Slow Motion']}
          selected={mediaServices}
          onSelect={(v) => handleMultiSelect(v, mediaServices, setMediaServices)}
          multiSelect
        />
      </View>

      {/* Duration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Çekim Süresi</Text>
        <SelectionChips
          options={['2 saat', '4 saat', '8 saat', 'Tam Gün', '2+ Gün']}
          selected={duration}
          onSelect={setDuration}
        />
      </View>

      {/* Delivery Format */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teslimat Formatı</Text>
        <Text style={styles.sectionSubtitle}>Birden fazla seçebilirsiniz</Text>
        <SelectionChips
          options={['Raw Dosyalar', 'Düzenlenmiş', 'Sosyal Medya', 'Aftermovie', 'Highlight Reel']}
          selected={deliveryFormat}
          onSelect={(v) => handleMultiSelect(v, deliveryFormat, setDeliveryFormat)}
          multiSelect
        />
      </View>
    </>
  );

  const renderBarrierFields = () => (
    <>
      {/* Barrier Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bariyer Tipi</Text>
        <SelectionChips
          options={['Kalabalık Bariyeri', 'Yol Bariyeri', 'VIP Bariyeri', 'Sahne Bariyeri', 'Polis Bariyeri']}
          selected={barrierType}
          onSelect={setBarrierType}
        />
      </View>

      {/* Length */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Toplam Uzunluk</Text>
        <SelectionChips
          options={['< 50m', '50-100m', '100-200m', '200-500m', '500m+']}
          selected={barrierLength}
          onSelect={setBarrierLength}
        />
      </View>

      {/* Duration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kullanım Süresi</Text>
        <SelectionChips
          options={['1 gün', '2-3 gün', '1 hafta', '2+ hafta']}
          selected={duration}
          onSelect={setDuration}
        />
      </View>
    </>
  );

  const renderTentFields = () => (
    <>
      {/* Tent Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Çadır Tipi</Text>
        <SelectionChips
          options={['Pagoda', 'Stretch Tent', 'Klasik Çadır', 'Dome', 'Transparan', 'Sahne Çadırı']}
          selected={tentType}
          onSelect={setTentType}
        />
      </View>

      {/* Size */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kapasite</Text>
        <SelectionChips
          options={['< 50 kişi', '50-100', '100-200', '200-500', '500+']}
          selected={tentSize}
          onSelect={setTentSize}
        />
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ek Özellikler</Text>
        <Text style={styles.sectionSubtitle}>Birden fazla seçebilirsiniz</Text>
        <SelectionChips
          options={['Zemin Kaplama', 'Aydınlatma', 'Klima/Isıtma', 'Yan Paneller', 'Pencereler']}
          selected={tentFeatures}
          onSelect={(v) => handleMultiSelect(v, tentFeatures, setTentFeatures)}
          multiSelect
        />
      </View>
    </>
  );

  const renderTicketingFields = () => (
    <>
      {/* Capacity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Etkinlik Kapasitesi</Text>
        <SelectionChips
          options={['< 500', '500-1000', '1000-5000', '5000-10000', '10000+']}
          selected={ticketCapacity}
          onSelect={setTicketCapacity}
        />
      </View>

      {/* Ticket Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bilet Türleri</Text>
        <Text style={styles.sectionSubtitle}>Birden fazla seçebilirsiniz</Text>
        <SelectionChips
          options={['Genel Giriş', 'VIP', 'Backstage', 'Masa', 'Sezonluk', 'Early Bird']}
          selected={ticketTypes}
          onSelect={(v) => handleMultiSelect(v, ticketTypes, setTicketTypes)}
          multiSelect
        />
      </View>

      {/* Technology */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teknoloji</Text>
        <Text style={styles.sectionSubtitle}>Birden fazla seçebilirsiniz</Text>
        <SelectionChips
          options={['QR Kod', 'Bileklik', 'NFC', 'Barkod', 'Yüz Tanıma']}
          selected={ticketTech}
          onSelect={(v) => handleMultiSelect(v, ticketTech, setTicketTech)}
          multiSelect
        />
      </View>
    </>
  );

  const renderDecorationFields = () => (
    <>
      {/* Theme */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tema</Text>
        <SelectionChips
          options={['Modern', 'Klasik', 'Rustik', 'Bohem', 'Minimalist', 'Lüks', 'Tematik']}
          selected={decorTheme}
          onSelect={setDecorTheme}
        />
      </View>

      {/* Areas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dekorasyon Alanları</Text>
        <Text style={styles.sectionSubtitle}>Birden fazla seçebilirsiniz</Text>
        <SelectionChips
          options={['Giriş', 'Sahne', 'Masalar', 'Tavan', 'Duvarlar', 'Bahçe', 'Photo Corner']}
          selected={decorAreas}
          onSelect={(v) => handleMultiSelect(v, decorAreas, setDecorAreas)}
          multiSelect
        />
      </View>

      {/* Guest Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Etkinlik Büyüklüğü</Text>
        <SelectionChips
          options={['Küçük (< 50)', 'Orta (50-150)', 'Büyük (150-300)', 'Çok Büyük (300+)']}
          selected={guestCount}
          onSelect={setGuestCount}
        />
      </View>

      {/* Florals */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="flower-outline" size={20} color={colors.zinc[400]} />
            <Text style={styles.switchLabel}>Çiçek Düzenlemesi</Text>
          </View>
          <Switch
            value={floralsNeeded}
            onValueChange={setFloralsNeeded}
            trackColor={{ false: colors.zinc[700], true: colors.brand[500] }}
            thumbColor="white"
          />
        </View>
      </View>
    </>
  );

  const renderProductionFields = () => (
    <>
      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prodüksiyon Hizmetleri</Text>
        <Text style={styles.sectionSubtitle}>Birden fazla seçebilirsiniz</Text>
        <SelectionChips
          options={['Sahne Yönetimi', 'Teknik Koordinasyon', 'Artist Liaison', 'Zaman Planı', 'Backstage Yönetimi', 'Tam Prodüksiyon']}
          selected={productionServices}
          onSelect={(v) => handleMultiSelect(v, productionServices, setProductionServices)}
          multiSelect
        />
      </View>

      {/* Event Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Etkinlik Tipi</Text>
        <SelectionChips
          options={['Konser', 'Festival', 'Kurumsal', 'Gala', 'Lansman', 'Özel Etkinlik']}
          selected={eventType}
          onSelect={setEventType}
        />
      </View>

      {/* Crew Size */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ekip Büyüklüğü</Text>
        <SelectionChips
          options={['Küçük (1-3)', 'Orta (4-8)', 'Büyük (9-15)', 'Çok Büyük (15+)']}
          selected={crewSize}
          onSelect={setCrewSize}
        />
      </View>

      {/* Duration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Etkinlik Süresi</Text>
        <SelectionChips
          options={['1 gün', '2-3 gün', '1 hafta', 'Festival (3+ gün)']}
          selected={duration}
          onSelect={setDuration}
        />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{config.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <LinearGradient
            colors={config.gradient}
            style={styles.categoryIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={config.icon as any} size={24} color="white" />
          </LinearGradient>
        </View>

        {/* Provider Info (if coming from provider detail) */}
        {provider && (
          <View style={styles.providerCard}>
            <Image source={{ uri: provider.image }} style={styles.providerImage} />
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#fbbf24" />
                <Text style={styles.ratingText}>{provider.rating}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Event Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Etkinlik Seçin</Text>
          <Text style={styles.sectionSubtitle}>Bu teklif hangi etkinlik için?</Text>

          <View style={styles.eventsList}>
            {userEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventCard,
                  selectedEvent === event.id && styles.eventCardSelected
                ]}
                onPress={() => setSelectedEvent(event.id)}
              >
                <View style={styles.eventRadio}>
                  {selectedEvent === event.id ? (
                    <LinearGradient
                      colors={gradients.primary}
                      style={styles.eventRadioSelected}
                    >
                      <Ionicons name="checkmark" size={12} color="white" />
                    </LinearGradient>
                  ) : (
                    <View style={styles.eventRadioEmpty} />
                  )}
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventMeta}>
                    <Ionicons name="calendar-outline" size={12} color={colors.zinc[500]} />
                    <Text style={styles.eventMetaText}>{event.date}</Text>
                    <Ionicons name="location-outline" size={12} color={colors.zinc[500]} />
                    <Text style={styles.eventMetaText}>{event.location}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.newEventCard}
              onPress={() => navigation.navigate('CreateEvent')}
            >
              <View style={styles.newEventIcon}>
                <Ionicons name="add" size={20} color={colors.brand[400]} />
              </View>
              <Text style={styles.newEventText}>Yeni Etkinlik Oluştur</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Event Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hizmet Tarihi</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={18} color={colors.zinc[500]} />
            <TextInput
              style={styles.input}
              placeholder="GG/AA/YYYY"
              placeholderTextColor={colors.zinc[600]}
              value={eventDate}
              onChangeText={setEventDate}
            />
          </View>
        </View>

        {/* Category-specific fields */}
        {renderCategoryFields()}

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bütçe Aralığı</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="cash-outline" size={18} color={colors.zinc[500]} />
            <TextInput
              style={styles.input}
              placeholder="Örn: 50.000 - 100.000 TL"
              placeholderTextColor={colors.zinc[600]}
              value={budget}
              onChangeText={setBudget}
            />
          </View>
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ek Notlar</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Özel isteklerinizi veya ek bilgileri yazın..."
              placeholderTextColor={colors.zinc[600]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.submitButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.submitButtonText}>Teklif Talebi Gönder</Text>
            <Ionicons name="paper-plane" size={18} color="white" />
          </LinearGradient>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  categoryBadge: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  providerImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.zinc[500],
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.zinc[400],
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  textAreaContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 8,
  },
  textArea: {
    fontSize: 14,
    color: colors.text,
    minHeight: 80,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  chipSelected: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderColor: colors.brand[500],
  },
  chipText: {
    fontSize: 13,
    color: colors.zinc[400],
  },
  chipTextSelected: {
    color: colors.brand[400],
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  eventsList: {
    gap: 10,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  eventCardSelected: {
    borderColor: colors.brand[500],
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
  },
  eventRadio: {
    marginRight: 12,
  },
  eventRadioEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.zinc[600],
  },
  eventRadioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  eventMetaText: {
    fontSize: 11,
    color: colors.zinc[500],
    marginRight: 8,
  },
  newEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
    borderStyle: 'dashed',
  },
  newEventIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  newEventText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.brand[400],
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
