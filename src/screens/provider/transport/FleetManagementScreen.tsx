import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import {
  Vehicle,
  Driver,
  VehicleType,
  mockVehicles,
  mockDrivers,
  mockTrips,
  getFleetStats,
  vehicleTypes,
} from '../../../data/provider/fleetData';

type TabType = 'vehicles' | 'drivers' | 'trips';

const vehicleTypeIcons: Record<VehicleType, string> = {
  sedan: 'car-sport',
  suv: 'car',
  van: 'bus',
  minibus: 'bus',
  bus: 'bus',
  limousine: 'car-sport',
  sprinter: 'bus',
};

const vehicleTypeColors: Record<VehicleType, [string, string]> = {
  sedan: ['#3B82F6', '#60A5FA'],
  suv: ['#10B981', '#34D399'],
  van: ['#F59E0B', '#FBBF24'],
  minibus: ['#9333EA', '#C084FC'],
  bus: ['#EF4444', '#F87171'],
  limousine: ['#EC4899', '#F472B6'],
  sprinter: ['#6366F1', '#818CF8'],
};

// Helper to get vehicle type label
const getVehicleTypeLabel = (type: VehicleType): string => {
  const found = vehicleTypes.find(vt => vt.key === type);
  return found?.label || type;
};

export function FleetManagementScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('vehicles');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const stats = useMemo(() => getFleetStats(), []);

  const filteredVehicles = useMemo(() => {
    if (!searchQuery) return mockVehicles;
    const query = searchQuery.toLowerCase();
    return mockVehicles.filter(v =>
      v.brand.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query) ||
      v.plate.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredDrivers = useMemo(() => {
    if (!searchQuery) return mockDrivers;
    const query = searchQuery.toLowerCase();
    return mockDrivers.filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.phone.includes(query)
    );
  }, [searchQuery]);

  const getVehicleStatusInfo = (status: Vehicle['status']) => {
    switch (status) {
      case 'available':
        return { label: 'Musait', color: '#10B981', icon: 'checkmark-circle' as const };
      case 'on_trip':
        return { label: 'Gorevde', color: '#3B82F6', icon: 'navigate' as const };
      case 'maintenance':
        return { label: 'Bakimda', color: '#F59E0B', icon: 'construct' as const };
      case 'reserved':
        return { label: 'Rezerve', color: '#9333EA', icon: 'time' as const };
      case 'out_of_service':
        return { label: 'Devre Disi', color: '#EF4444', icon: 'close-circle' as const };
      default:
        return { label: 'Bilinmiyor', color: colors.textMuted, icon: 'help-circle' as const };
    }
  };

  const getDriverStatusInfo = (status: Driver['status']) => {
    switch (status) {
      case 'available':
        return { label: 'Musait', color: '#10B981', icon: 'checkmark-circle' as const };
      case 'on_trip':
        return { label: 'Gorevde', color: '#3B82F6', icon: 'navigate' as const };
      case 'off_duty':
        return { label: 'Izinli', color: '#F59E0B', icon: 'bed' as const };
      case 'on_leave':
        return { label: 'Tatilde', color: '#9333EA', icon: 'airplane' as const };
      default:
        return { label: 'Bilinmiyor', color: colors.textMuted, icon: 'help-circle' as const };
    }
  };

  const getTripStatusInfo = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { label: 'Planli', color: '#9333EA', icon: 'time' as const };
      case 'in_progress':
        return { label: 'Devam Ediyor', color: '#3B82F6', icon: 'navigate' as const };
      case 'completed':
        return { label: 'Tamamlandi', color: '#10B981', icon: 'checkmark-circle' as const };
      case 'cancelled':
        return { label: 'Iptal', color: '#EF4444', icon: 'close-circle' as const };
      default:
        return { label: 'Bilinmiyor', color: colors.textMuted, icon: 'help-circle' as const };
    }
  };

  const renderVehicleCard = (vehicle: Vehicle) => {
    const statusInfo = getVehicleStatusInfo(vehicle.status);
    const typeGradient = vehicleTypeColors[vehicle.type];

    return (
      <TouchableOpacity
        key={vehicle.id}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => {
          Alert.alert(
            `${vehicle.brand} ${vehicle.model}`,
            `Plaka: ${vehicle.plate}\nKapasite: ${vehicle.capacity} kisi\nYakıt: ${vehicle.fuelType}\nSaatlik: ${vehicle.hourlyRate.toLocaleString('tr-TR')} TL`,
            [
              { text: 'Duzenle', onPress: () => Alert.alert('Bilgi', 'Arac duzenleme ekrani henuz hazir degil.') },
              { text: 'Kapat', style: 'cancel' },
            ]
          );
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.vehicleImageContainer}>
            <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
            <LinearGradient
              colors={typeGradient}
              style={styles.vehicleTypeBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={vehicleTypeIcons[vehicle.type] as any} size={12} color="white" />
            </LinearGradient>
          </View>

          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              {vehicle.year} - {getVehicleTypeLabel(vehicle.type)}
            </Text>
            <View style={styles.plateRow}>
              <View style={[styles.plateBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <Text style={[styles.plateText, { color: colors.text }]}>{vehicle.plate}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

        <View style={styles.cardBody}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.infoValue, { color: colors.text }]}>{vehicle.capacity} kisi</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="speedometer-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {(vehicle.mileage / 1000).toFixed(0)}K km
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="water-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.infoValue, { color: colors.text }]}>{vehicle.fuelType}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.infoValue, { color: colors.text }]}>{vehicle.year}</Text>
            </View>
          </View>

          {vehicle.features && vehicle.features.length > 0 && (
            <View style={styles.featuresRow}>
              {vehicle.features.slice(0, 4).map((feature, i) => (
                <View
                  key={i}
                  style={[styles.featureTag, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                >
                  <Text style={[styles.featureText, { color: colors.textMuted }]}>{feature}</Text>
                </View>
              ))}
              {vehicle.features.length > 4 && (
                <Text style={[styles.moreFeatures, { color: colors.textMuted }]}>
                  +{vehicle.features.length - 4}
                </Text>
              )}
            </View>
          )}

          <View style={[styles.priceRow, { backgroundColor: isDark ? 'rgba(147,51,234,0.1)' : 'rgba(147,51,234,0.05)' }]}>
            <View style={styles.priceItem}>
              <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Saatlik</Text>
              <Text style={[styles.priceValue, { color: colors.brand[400] }]}>
                {vehicle.hourlyRate.toLocaleString('tr-TR')} TL
              </Text>
            </View>
            <View style={[styles.priceDivider, { backgroundColor: colors.border }]} />
            <View style={styles.priceItem}>
              <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Gunluk</Text>
              <Text style={[styles.priceValue, { color: colors.brand[400] }]}>
                {vehicle.dailyRate.toLocaleString('tr-TR')} TL
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDriverCard = (driver: Driver) => {
    const statusInfo = getDriverStatusInfo(driver.status);
    const assignedVehicle = driver.assignedVehicleId
      ? mockVehicles.find(v => v.id === driver.assignedVehicleId)
      : null;

    return (
      <TouchableOpacity
        key={driver.id}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => {
          Alert.alert(
            driver.name,
            `Telefon: ${driver.phone}\nTecrube: ${driver.experience} yil\nEhliyet: ${driver.licenseType}\nPuan: ${driver.rating}`,
            [
              { text: 'Ara', onPress: () => Alert.alert('Bilgi', `${driver.phone} numarasi aranıyor...`) },
              { text: 'Duzenle', onPress: () => Alert.alert('Bilgi', 'Sofor duzenleme ekrani henuz hazir degil.') },
              { text: 'Kapat', style: 'cancel' },
            ]
          );
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.driverImageContainer}>
            <Image source={{ uri: driver.image }} style={styles.driverImage} />
            <View style={[styles.onlineIndicator, { backgroundColor: statusInfo.color }]} />
          </View>

          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {driver.name}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={[styles.ratingText, { color: colors.text }]}>{driver.rating}</Text>
              <Text style={[styles.tripCount, { color: colors.textMuted }]}>
                ({driver.totalTrips} sefer)
              </Text>
            </View>
            <Text style={[styles.phoneText, { color: colors.textMuted }]}>{driver.phone}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

        <View style={styles.cardBody}>
          <View style={styles.licenseRow}>
            <View style={styles.licenseItem}>
              <Text style={[styles.licenseLabel, { color: colors.textMuted }]}>Ehliyet Sinifi</Text>
              <View style={styles.licenseClasses}>
                <View
                  style={[styles.licenseClassBadge, { backgroundColor: isDark ? 'rgba(147,51,234,0.2)' : 'rgba(147,51,234,0.1)' }]}
                >
                  <Text style={[styles.licenseClassText, { color: colors.brand[400] }]}>{driver.licenseType}</Text>
                </View>
              </View>
            </View>
            <View style={styles.licenseItem}>
              <Text style={[styles.licenseLabel, { color: colors.textMuted }]}>Gecerlilik</Text>
              <Text style={[styles.licenseExpiry, { color: colors.text }]}>{driver.licenseExpiry}</Text>
            </View>
          </View>

          <View style={styles.experienceRow}>
            <View style={styles.experienceItem}>
              <Ionicons name="briefcase-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.experienceText, { color: colors.text }]}>{driver.experience} yil tecrube</Text>
            </View>
          </View>

          {assignedVehicle && (
            <View style={[styles.assignedVehicleRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
              <Ionicons name="car" size={14} color={colors.textMuted} />
              <Text style={[styles.assignedVehicleText, { color: colors.text }]}>
                {assignedVehicle.brand} {assignedVehicle.model}
              </Text>
              <Text style={[styles.assignedVehiclePlate, { color: colors.textMuted }]}>
                ({assignedVehicle.plate})
              </Text>
            </View>
          )}

          <View style={styles.languagesRow}>
            <Ionicons name="language" size={14} color={colors.textMuted} />
            <Text style={[styles.languagesText, { color: colors.textMuted }]}>
              {driver.languages.join(', ')}
            </Text>
          </View>

          {driver.certifications && driver.certifications.length > 0 && (
            <View style={styles.certificationsRow}>
              {driver.certifications.slice(0, 3).map((cert, i) => (
                <View
                  key={i}
                  style={[styles.certBadge, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)' }]}
                >
                  <Ionicons name="ribbon" size={10} color="#10B981" />
                  <Text style={[styles.certText, { color: '#10B981' }]}>{cert}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTripCard = (trip: typeof mockTrips[0]) => {
    const statusInfo = getTripStatusInfo(trip.status);
    const vehicle = mockVehicles.find(v => v.id === trip.vehicleId);
    const driver = mockDrivers.find(d => d.id === trip.driverId);

    return (
      <TouchableOpacity
        key={trip.id}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => {
          const driverName = driver?.name || 'Atanmadi';
          const vehiclePlate = vehicle?.plate || 'Atanmadi';
          Alert.alert(
            trip.eventName || 'Transfer',
            `Musteri: ${trip.clientName}\nYolcu: ${trip.passengerCount} kisi\nAlim: ${trip.pickupLocation}\nBırakma: ${trip.dropoffLocation}\nSofor: ${driverName}\nArac: ${vehiclePlate}\nUcret: ${trip.price.toLocaleString('tr-TR')} TL`,
            [
              { text: 'Detaylar', onPress: () => Alert.alert('Bilgi', 'Sefer detay ekrani henuz hazir degil.') },
              { text: 'Kapat', style: 'cancel' },
            ]
          );
        }}
      >
        <View style={styles.tripHeader}>
          <View style={styles.tripInfo}>
            <Text style={[styles.tripTitle, { color: colors.text }]}>{trip.eventName || 'Transfer'}</Text>
            <Text style={[styles.tripOrganizer, { color: colors.textMuted }]}>{trip.clientName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={[styles.routeContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]}>
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: '#10B981' }]} />
            <View style={styles.routePointInfo}>
              <Text style={[styles.routeLabel, { color: colors.textMuted }]}>Baslangic</Text>
              <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={1}>
                {trip.pickupLocation}
              </Text>
            </View>
          </View>
          <View style={[styles.routeLine, { borderColor: colors.border }]} />
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: '#EF4444' }]} />
            <View style={styles.routePointInfo}>
              <Text style={[styles.routeLabel, { color: colors.textMuted }]}>Varis</Text>
              <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={1}>
                {trip.dropoffLocation}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tripDetails}>
          <View style={styles.tripDetailItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.tripDetailText, { color: colors.text }]}>
              {trip.pickupTime.split(' ')[0]}
            </Text>
          </View>
          <View style={styles.tripDetailItem}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.tripDetailText, { color: colors.text }]}>
              {trip.pickupTime.split(' ')[1]}
            </Text>
          </View>
          <View style={styles.tripDetailItem}>
            <Ionicons name="people-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.tripDetailText, { color: colors.text }]}>{trip.passengerCount} kisi</Text>
          </View>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

        <View style={styles.tripFooter}>
          {vehicle && driver && (
            <View style={styles.tripAssignment}>
              <Image source={{ uri: driver.image }} style={styles.tripDriverImage} />
              <Text style={[styles.tripAssignmentText, { color: colors.textMuted }]}>
                {driver.name} - {vehicle.plate}
              </Text>
            </View>
          )}
          <Text style={[styles.tripPrice, { color: colors.brand[400] }]}>
            {trip.price.toLocaleString('tr-TR')} TL
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Filo Yonetimi</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              {stats.totalVehicles} arac, {stats.totalDrivers} sofor
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.1)',
              borderColor: isDark ? 'rgba(147, 51, 234, 0.3)' : 'rgba(147, 51, 234, 0.2)',
            },
          ]}
          onPress={() => {
            Alert.alert(
              'Yeni Ekle',
              'Ne eklemek istiyorsunuz?',
              [
                { text: 'Arac Ekle', onPress: () => Alert.alert('Bilgi', 'Arac ekleme formu henuz hazir degil.') },
                { text: 'Sofor Ekle', onPress: () => Alert.alert('Bilgi', 'Sofor ekleme formu henuz hazir degil.') },
                { text: 'Sefer Olustur', onPress: () => Alert.alert('Bilgi', 'Sefer olusturma formu henuz hazir degil.') },
                { text: 'Iptal', style: 'cancel' },
              ]
            );
          }}
        >
          <Ionicons name="add" size={22} color={colors.brand[400]} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }]}>
          <Ionicons name="car" size={18} color="#10B981" />
          <Text style={[styles.statCardValue, { color: '#10B981' }]}>{stats.availableVehicles}</Text>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Musait Arac</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)' }]}>
          <Ionicons name="navigate" size={18} color="#3B82F6" />
          <Text style={[styles.statCardValue, { color: '#3B82F6' }]}>{stats.onTripVehicles}</Text>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Gorevde</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)' }]}>
          <Ionicons name="person" size={18} color="#22C55E" />
          <Text style={[styles.statCardValue, { color: '#22C55E' }]}>{stats.availableDrivers}</Text>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Musait Sofor</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.08)' }]}>
          <Ionicons name="calendar" size={18} color="#9333EA" />
          <Text style={[styles.statCardValue, { color: '#9333EA' }]}>{stats.scheduledTrips}</Text>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Planli</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('vehicles')}>
          <View style={styles.tabContent}>
            <Ionicons
              name="car"
              size={16}
              color={activeTab === 'vehicles' ? colors.brand[400] : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'vehicles' ? colors.brand[400] : colors.textMuted },
              ]}
            >
              Araclar
            </Text>
          </View>
          {activeTab === 'vehicles' && (
            <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('drivers')}>
          <View style={styles.tabContent}>
            <Ionicons
              name="people"
              size={16}
              color={activeTab === 'drivers' ? colors.brand[400] : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'drivers' ? colors.brand[400] : colors.textMuted },
              ]}
            >
              Soforler
            </Text>
          </View>
          {activeTab === 'drivers' && (
            <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('trips')}>
          <View style={styles.tabContent}>
            <Ionicons
              name="navigate"
              size={16}
              color={activeTab === 'trips' ? colors.brand[400] : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'trips' ? colors.brand[400] : colors.textMuted },
              ]}
            >
              Seferler
            </Text>
          </View>
          {activeTab === 'trips' && (
            <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={
              activeTab === 'vehicles'
                ? 'Arac ara...'
                : activeTab === 'drivers'
                ? 'Sofor ara...'
                : 'Sefer ara...'
            }
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.contentList}
        contentContainerStyle={styles.contentListContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[400]} />}
      >
        {activeTab === 'vehicles' && (
          filteredVehicles.length > 0 ? (
            filteredVehicles.map(renderVehicleCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Arac bulunamadi</Text>
            </View>
          )
        )}

        {activeTab === 'drivers' && (
          filteredDrivers.length > 0 ? (
            filteredDrivers.map(renderDriverCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Sofor bulunamadi</Text>
            </View>
          )
        )}

        {activeTab === 'trips' && (
          mockTrips.length > 0 ? (
            mockTrips.map(renderTripCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="navigate-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Sefer bulunamadi</Text>
            </View>
          )
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 2,
  },
  statCardValue: { fontSize: 16, fontWeight: '700' },
  statCardLabel: { fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.3 },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    position: 'relative',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabText: { fontSize: 14, fontWeight: '500' },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 10,
    right: 10,
    height: 2,
    borderRadius: 1,
  },
  searchContainer: { paddingHorizontal: 20, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  contentList: { flex: 1 },
  contentListContainer: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  vehicleImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  vehicleImage: { width: '100%', height: '100%' },
  vehicleTypeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  driverImage: { width: '100%', height: '100%' },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardSubtitle: { fontSize: 12, marginTop: 2 },
  plateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  plateBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  plateText: { fontSize: 12, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: 13, fontWeight: '600' },
  tripCount: { fontSize: 11 },
  phoneText: { fontSize: 11, marginTop: 4 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardDivider: { height: 1, marginHorizontal: 14 },
  cardBody: { padding: 14, paddingTop: 12 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '45%' },
  infoValue: { fontSize: 12 },
  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  featureTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  featureText: { fontSize: 10 },
  moreFeatures: { fontSize: 10, alignSelf: 'center' },
  priceRow: { flexDirection: 'row', borderRadius: 10, padding: 10 },
  priceItem: { flex: 1, alignItems: 'center' },
  priceLabel: { fontSize: 10, marginBottom: 2 },
  priceValue: { fontSize: 14, fontWeight: '700' },
  priceDivider: { width: 1, marginHorizontal: 10 },
  licenseRow: { flexDirection: 'row', marginBottom: 12 },
  licenseItem: { flex: 1 },
  licenseLabel: { fontSize: 10, marginBottom: 4 },
  licenseClasses: { flexDirection: 'row', gap: 4 },
  licenseClassBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  licenseClassText: { fontSize: 11, fontWeight: '600' },
  licenseExpiry: { fontSize: 12, fontWeight: '500' },
  experienceRow: { flexDirection: 'row', marginBottom: 10 },
  experienceItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  experienceText: { fontSize: 12 },
  assignedVehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  assignedVehicleText: { fontSize: 12, fontWeight: '500' },
  assignedVehiclePlate: { fontSize: 11 },
  languagesRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  languagesText: { fontSize: 11 },
  certificationsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  certBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  certText: { fontSize: 10, fontWeight: '500' },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingBottom: 12,
  },
  tripInfo: { flex: 1 },
  tripTitle: { fontSize: 15, fontWeight: '600' },
  tripOrganizer: { fontSize: 12, marginTop: 2 },
  routeContainer: { marginHorizontal: 14, padding: 12, borderRadius: 10, marginBottom: 12 },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routePointInfo: { flex: 1 },
  routeLabel: { fontSize: 10, marginBottom: 2 },
  routeAddress: { fontSize: 12 },
  routeLine: { width: 1, height: 20, borderLeftWidth: 1, borderStyle: 'dashed', marginLeft: 4.5, marginVertical: 4 },
  tripDetails: { flexDirection: 'row', paddingHorizontal: 14, gap: 16, marginBottom: 12 },
  tripDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tripDetailText: { fontSize: 12 },
  tripFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingTop: 12,
  },
  tripAssignment: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tripDriverImage: { width: 28, height: 28, borderRadius: 14 },
  tripAssignmentText: { fontSize: 12 },
  tripPrice: { fontSize: 16, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
});
