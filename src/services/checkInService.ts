import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check-in status type
export interface CheckInStatus {
  eventId: string;
  isCheckedIn: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInLocation: {
    latitude: number;
    longitude: number;
  } | null;
  totalWorkingMinutes: number;
  breaks: {
    startTime: string;
    endTime: string | null;
  }[];
}

// Event location type
export interface EventLocation {
  latitude: number;
  longitude: number;
  venueName: string;
  address: string;
}

// Check-in result type
export interface CheckInResult {
  success: boolean;
  message: string;
  status?: CheckInStatus;
  distance?: number;
}

// Storage key prefix
const CHECKIN_STORAGE_KEY = '@turing_checkin_';

// Maximum distance (in meters) allowed for check-in
const MAX_CHECKIN_DISTANCE = 500; // 500 meters

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Request location permission
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('Error requesting location permission:', error);
    return false;
  }
}

// Get current location
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return location;
  } catch (error) {
    console.warn('Error getting current location:', error);
    return null;
  }
}

// Get check-in status from storage
export async function getCheckInStatus(eventId: string): Promise<CheckInStatus | null> {
  try {
    const data = await AsyncStorage.getItem(`${CHECKIN_STORAGE_KEY}${eventId}`);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.warn('Error getting check-in status:', error);
    return null;
  }
}

// Save check-in status to storage
export async function saveCheckInStatus(status: CheckInStatus): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${CHECKIN_STORAGE_KEY}${status.eventId}`,
      JSON.stringify(status)
    );
  } catch (error) {
    console.warn('Error saving check-in status:', error);
  }
}

// Format time for display
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format date for display
export function formatDateTime(date: Date): string {
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Calculate working minutes between two times
export function calculateWorkingMinutes(
  checkInTime: string,
  checkOutTime: string | null,
  breaks: { startTime: string; endTime: string | null }[]
): number {
  const checkIn = new Date(checkInTime);
  const checkOut = checkOutTime ? new Date(checkOutTime) : new Date();

  let totalMinutes = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);

  // Subtract break times
  breaks.forEach(breakItem => {
    if (breakItem.endTime) {
      const breakStart = new Date(breakItem.startTime);
      const breakEnd = new Date(breakItem.endTime);
      totalMinutes -= (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
    }
  });

  return Math.max(0, Math.round(totalMinutes));
}

// Format minutes to hours and minutes string
export function formatWorkingTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} dk`;
  } else if (mins === 0) {
    return `${hours} saat`;
  } else {
    return `${hours} saat ${mins} dk`;
  }
}

// Perform check-in
export async function performCheckIn(
  eventId: string,
  eventLocation: EventLocation,
  skipLocationCheck: boolean = false
): Promise<CheckInResult> {
  try {
    // Check if already checked in
    const existingStatus = await getCheckInStatus(eventId);
    if (existingStatus?.isCheckedIn) {
      return {
        success: false,
        message: 'Zaten check-in yapılmış durumdasınız.',
        status: existingStatus,
      };
    }

    let userLocation: Location.LocationObject | null = null;
    let distance = 0;

    if (!skipLocationCheck) {
      // Get user's current location
      userLocation = await getCurrentLocation();
      if (!userLocation) {
        return {
          success: false,
          message: 'Konum bilgisi alınamadı. Lütfen konum izinlerini kontrol edin.',
        };
      }

      // Calculate distance to venue
      distance = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        eventLocation.latitude,
        eventLocation.longitude
      );

      // Check if within allowed distance
      if (distance > MAX_CHECKIN_DISTANCE) {
        return {
          success: false,
          message: `Etkinlik mekanına çok uzaksınız (${Math.round(distance)}m). Check-in yapabilmek için ${MAX_CHECKIN_DISTANCE}m yakınında olmalısınız.`,
          distance,
        };
      }
    }

    // Create new check-in status
    const now = new Date();
    const newStatus: CheckInStatus = {
      eventId,
      isCheckedIn: true,
      checkInTime: now.toISOString(),
      checkOutTime: null,
      checkInLocation: userLocation
        ? {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          }
        : null,
      totalWorkingMinutes: 0,
      breaks: [],
    };

    // Save to storage
    await saveCheckInStatus(newStatus);

    return {
      success: true,
      message: `${eventLocation.venueName} konumunda check-in yapıldı.\nSaat: ${formatTime(now)}`,
      status: newStatus,
      distance: Math.round(distance),
    };
  } catch (error) {
    console.warn('Error performing check-in:', error);
    return {
      success: false,
      message: 'Check-in sırasında bir hata oluştu.',
    };
  }
}

// Perform check-out
export async function performCheckOut(eventId: string): Promise<CheckInResult> {
  try {
    const existingStatus = await getCheckInStatus(eventId);
    if (!existingStatus?.isCheckedIn) {
      return {
        success: false,
        message: 'Henüz check-in yapılmamış.',
      };
    }

    const now = new Date();
    const totalMinutes = calculateWorkingMinutes(
      existingStatus.checkInTime!,
      now.toISOString(),
      existingStatus.breaks
    );

    const updatedStatus: CheckInStatus = {
      ...existingStatus,
      isCheckedIn: false,
      checkOutTime: now.toISOString(),
      totalWorkingMinutes: totalMinutes,
    };

    await saveCheckInStatus(updatedStatus);

    return {
      success: true,
      message: `Check-out yapıldı.\nToplam çalışma süresi: ${formatWorkingTime(totalMinutes)}`,
      status: updatedStatus,
    };
  } catch (error) {
    console.warn('Error performing check-out:', error);
    return {
      success: false,
      message: 'Check-out sırasında bir hata oluştu.',
    };
  }
}

// Start break
export async function startBreak(eventId: string): Promise<CheckInResult> {
  try {
    const existingStatus = await getCheckInStatus(eventId);
    if (!existingStatus?.isCheckedIn) {
      return {
        success: false,
        message: 'Check-in yapılmadan mola başlatılamaz.',
      };
    }

    // Check if there's an active break
    const activeBreak = existingStatus.breaks.find(b => !b.endTime);
    if (activeBreak) {
      return {
        success: false,
        message: 'Zaten aktif bir mola var.',
        status: existingStatus,
      };
    }

    const now = new Date();
    const updatedStatus: CheckInStatus = {
      ...existingStatus,
      breaks: [
        ...existingStatus.breaks,
        { startTime: now.toISOString(), endTime: null },
      ],
    };

    await saveCheckInStatus(updatedStatus);

    return {
      success: true,
      message: `Mola başladı: ${formatTime(now)}`,
      status: updatedStatus,
    };
  } catch (error) {
    console.warn('Error starting break:', error);
    return {
      success: false,
      message: 'Mola başlatılırken bir hata oluştu.',
    };
  }
}

// End break
export async function endBreak(eventId: string): Promise<CheckInResult> {
  try {
    const existingStatus = await getCheckInStatus(eventId);
    if (!existingStatus?.isCheckedIn) {
      return {
        success: false,
        message: 'Check-in yapılmadan mola bitirilemez.',
      };
    }

    // Find active break
    const activeBreakIndex = existingStatus.breaks.findIndex(b => !b.endTime);
    if (activeBreakIndex === -1) {
      return {
        success: false,
        message: 'Aktif mola bulunamadı.',
        status: existingStatus,
      };
    }

    const now = new Date();
    const updatedBreaks = [...existingStatus.breaks];
    updatedBreaks[activeBreakIndex] = {
      ...updatedBreaks[activeBreakIndex],
      endTime: now.toISOString(),
    };

    const breakDuration = Math.round(
      (now.getTime() - new Date(updatedBreaks[activeBreakIndex].startTime).getTime()) /
        (1000 * 60)
    );

    const updatedStatus: CheckInStatus = {
      ...existingStatus,
      breaks: updatedBreaks,
    };

    await saveCheckInStatus(updatedStatus);

    return {
      success: true,
      message: `Mola bitti. Süre: ${formatWorkingTime(breakDuration)}`,
      status: updatedStatus,
    };
  } catch (error) {
    console.warn('Error ending break:', error);
    return {
      success: false,
      message: 'Mola bitirilirken bir hata oluştu.',
    };
  }
}

// Clear check-in data (for testing)
export async function clearCheckInData(eventId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${CHECKIN_STORAGE_KEY}${eventId}`);
  } catch (error) {
    console.warn('Error clearing check-in data:', error);
  }
}
