// Fleet Management Data for Transport Providers

export type VehicleType = 'sedan' | 'suv' | 'van' | 'minibus' | 'bus' | 'limousine' | 'sprinter';
export type VehicleStatus = 'available' | 'on_trip' | 'maintenance' | 'reserved' | 'out_of_service';

export interface Vehicle {
  id: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  image: string;
  capacity: number;
  features: string[];
  status: VehicleStatus;
  currentDriverId?: string;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  mileage: number;
  lastService: string;
  nextService: string;
  insuranceExpiry: string;
  inspectionExpiry: string;
  dailyRate: number;
  hourlyRate: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  image: string;
  licenseType: string;
  licenseExpiry: string;
  experience: number; // years
  languages: string[];
  rating: number;
  totalTrips: number;
  status: 'available' | 'on_trip' | 'off_duty' | 'on_leave';
  assignedVehicleId?: string;
  certifications: string[];
}

export interface Trip {
  id: string;
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  clientName: string;
  eventName?: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  dropoffTime?: string;
  passengerCount: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  distance?: number; // km
  notes?: string;
}

// Vehicle Types
export const vehicleTypes: { key: VehicleType; label: string; icon: string; capacity: string }[] = [
  { key: 'sedan', label: 'Sedan', icon: 'car-sport', capacity: '1-3' },
  { key: 'suv', label: 'SUV', icon: 'car', capacity: '1-5' },
  { key: 'van', label: 'Van', icon: 'bus', capacity: '6-8' },
  { key: 'minibus', label: 'Minibüs', icon: 'bus', capacity: '9-16' },
  { key: 'bus', label: 'Otobüs', icon: 'bus', capacity: '17-50' },
  { key: 'limousine', label: 'Limuzin', icon: 'car-sport', capacity: '4-8' },
  { key: 'sprinter', label: 'Sprinter', icon: 'bus', capacity: '8-19' },
];

// Mock Vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    type: 'sedan',
    brand: 'Mercedes-Benz',
    model: 'S-Class',
    year: 2023,
    plate: '34 VIP 001',
    color: 'Siyah',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
    capacity: 3,
    features: ['Deri koltuk', 'Klima', 'WiFi', 'Mini bar', 'Masaj koltuğu', 'TV'],
    status: 'available',
    fuelType: 'gasoline',
    mileage: 15000,
    lastService: '2024-05-01',
    nextService: '2024-08-01',
    insuranceExpiry: '2025-01-15',
    inspectionExpiry: '2025-03-20',
    dailyRate: 8000,
    hourlyRate: 1200,
  },
  {
    id: 'v2',
    type: 'sedan',
    brand: 'BMW',
    model: '7 Series',
    year: 2023,
    plate: '34 VIP 002',
    color: 'Beyaz',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
    capacity: 3,
    features: ['Deri koltuk', 'Klima', 'WiFi', 'Sunroof', 'Harman Kardon'],
    status: 'on_trip',
    currentDriverId: 'd1',
    fuelType: 'hybrid',
    mileage: 22000,
    lastService: '2024-04-15',
    nextService: '2024-07-15',
    insuranceExpiry: '2025-02-10',
    inspectionExpiry: '2025-04-15',
    dailyRate: 7500,
    hourlyRate: 1100,
  },
  {
    id: 'v3',
    type: 'suv',
    brand: 'Range Rover',
    model: 'Autobiography',
    year: 2022,
    plate: '34 VIP 003',
    color: 'Gri',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400',
    capacity: 4,
    features: ['4x4', 'Deri koltuk', 'Klima', 'WiFi', 'Panoramik tavan'],
    status: 'available',
    fuelType: 'diesel',
    mileage: 35000,
    lastService: '2024-05-20',
    nextService: '2024-08-20',
    insuranceExpiry: '2024-12-01',
    inspectionExpiry: '2025-01-10',
    dailyRate: 9000,
    hourlyRate: 1400,
  },
  {
    id: 'v4',
    type: 'van',
    brand: 'Mercedes-Benz',
    model: 'V-Class',
    year: 2023,
    plate: '34 VIP 004',
    color: 'Siyah',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400',
    capacity: 7,
    features: ['VIP koltuk', 'Klima', 'WiFi', 'TV', 'Mini bar', 'USB şarj'],
    status: 'available',
    fuelType: 'diesel',
    mileage: 45000,
    lastService: '2024-04-01',
    nextService: '2024-07-01',
    insuranceExpiry: '2025-03-15',
    inspectionExpiry: '2025-05-20',
    dailyRate: 6000,
    hourlyRate: 900,
  },
  {
    id: 'v5',
    type: 'sprinter',
    brand: 'Mercedes-Benz',
    model: 'Sprinter VIP',
    year: 2022,
    plate: '34 VIP 005',
    color: 'Beyaz',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    capacity: 16,
    features: ['VIP koltuk', 'Klima', 'WiFi', 'TV', 'Bagaj bölmesi'],
    status: 'reserved',
    fuelType: 'diesel',
    mileage: 65000,
    lastService: '2024-05-10',
    nextService: '2024-08-10',
    insuranceExpiry: '2024-11-20',
    inspectionExpiry: '2025-02-15',
    dailyRate: 5000,
    hourlyRate: 750,
  },
  {
    id: 'v6',
    type: 'minibus',
    brand: 'Mercedes-Benz',
    model: 'Sprinter 516',
    year: 2021,
    plate: '34 TRN 006',
    color: 'Beyaz',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400',
    capacity: 19,
    features: ['Klima', 'Bagaj', 'USB şarj', 'Mikrofon'],
    status: 'available',
    fuelType: 'diesel',
    mileage: 85000,
    lastService: '2024-03-15',
    nextService: '2024-06-15',
    insuranceExpiry: '2024-10-05',
    inspectionExpiry: '2024-12-20',
    dailyRate: 4000,
    hourlyRate: 600,
  },
  {
    id: 'v7',
    type: 'bus',
    brand: 'Mercedes-Benz',
    model: 'Tourismo',
    year: 2020,
    plate: '34 TRN 007',
    color: 'Beyaz',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400',
    capacity: 46,
    features: ['Klima', 'WC', 'TV', 'WiFi', 'Buzdolabı', 'Mikrofon'],
    status: 'maintenance',
    fuelType: 'diesel',
    mileage: 150000,
    lastService: '2024-06-01',
    nextService: '2024-09-01',
    insuranceExpiry: '2025-01-30',
    inspectionExpiry: '2025-04-10',
    dailyRate: 8000,
    hourlyRate: 1200,
  },
  {
    id: 'v8',
    type: 'limousine',
    brand: 'Lincoln',
    model: 'Town Car Stretch',
    year: 2019,
    plate: '34 LUX 008',
    color: 'Siyah',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
    capacity: 8,
    features: ['Bar', 'LED ışıklar', 'Sound system', 'TV', 'Fiber optik tavan'],
    status: 'available',
    fuelType: 'gasoline',
    mileage: 45000,
    lastService: '2024-04-20',
    nextService: '2024-07-20',
    insuranceExpiry: '2024-12-15',
    inspectionExpiry: '2025-02-28',
    dailyRate: 12000,
    hourlyRate: 2000,
  },
];

// Mock Drivers
export const mockDrivers: Driver[] = [
  {
    id: 'd1',
    name: 'Ahmet Yılmaz',
    phone: '+90 532 111 2233',
    email: 'ahmet@transfer.com',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    licenseType: 'E Sınıfı',
    licenseExpiry: '2028-05-15',
    experience: 12,
    languages: ['Türkçe', 'İngilizce'],
    rating: 4.9,
    totalTrips: 1250,
    status: 'on_trip',
    assignedVehicleId: 'v2',
    certifications: ['VIP Şoför', 'İlk Yardım', 'Savunmacı Sürüş'],
  },
  {
    id: 'd2',
    name: 'Mehmet Demir',
    phone: '+90 533 222 3344',
    email: 'mehmet@transfer.com',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    licenseType: 'D Sınıfı',
    licenseExpiry: '2027-08-20',
    experience: 8,
    languages: ['Türkçe', 'İngilizce', 'Almanca'],
    rating: 4.8,
    totalTrips: 890,
    status: 'available',
    certifications: ['VIP Şoför', 'İlk Yardım'],
  },
  {
    id: 'd3',
    name: 'Ali Kaya',
    phone: '+90 534 333 4455',
    email: 'ali@transfer.com',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    licenseType: 'D Sınıfı',
    licenseExpiry: '2026-12-10',
    experience: 15,
    languages: ['Türkçe', 'İngilizce', 'Arapça'],
    rating: 4.95,
    totalTrips: 2100,
    status: 'available',
    certifications: ['VIP Şoför', 'İlk Yardım', 'Savunmacı Sürüş', 'Güvenlik Eğitimi'],
  },
  {
    id: 'd4',
    name: 'Hasan Öztürk',
    phone: '+90 535 444 5566',
    email: 'hasan@transfer.com',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    licenseType: 'E Sınıfı',
    licenseExpiry: '2029-03-25',
    experience: 6,
    languages: ['Türkçe'],
    rating: 4.7,
    totalTrips: 450,
    status: 'off_duty',
    certifications: ['İlk Yardım'],
  },
  {
    id: 'd5',
    name: 'Murat Şahin',
    phone: '+90 536 555 6677',
    email: 'murat@transfer.com',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    licenseType: 'D Sınıfı',
    licenseExpiry: '2027-07-15',
    experience: 10,
    languages: ['Türkçe', 'İngilizce', 'Rusça'],
    rating: 4.85,
    totalTrips: 1650,
    status: 'available',
    assignedVehicleId: 'v7',
    certifications: ['VIP Şoför', 'İlk Yardım', 'Otobüs Operatörü'],
  },
];

// Mock Trips
export const mockTrips: Trip[] = [
  {
    id: 't1',
    vehicleId: 'v2',
    vehicleName: 'BMW 7 Series',
    driverId: 'd1',
    driverName: 'Ahmet Yılmaz',
    clientName: 'John Smith',
    eventName: 'Konser VIP Transfer',
    pickupLocation: 'İstanbul Havalimanı',
    dropoffLocation: 'Four Seasons Bosphorus',
    pickupTime: '2024-06-20 14:30',
    passengerCount: 2,
    status: 'in_progress',
    price: 3500,
    distance: 45,
    notes: 'VIP misafir, karşılama tabelası hazır',
  },
  {
    id: 't2',
    vehicleId: 'v4',
    vehicleName: 'Mercedes V-Class',
    driverId: 'd2',
    driverName: 'Mehmet Demir',
    clientName: 'Event Pro Organizasyon',
    eventName: 'Kurumsal Toplantı',
    pickupLocation: 'Hilton İstanbul Bomonti',
    dropoffLocation: 'Sabiha Gökçen Havalimanı',
    pickupTime: '2024-06-21 09:00',
    passengerCount: 5,
    status: 'scheduled',
    price: 2800,
    distance: 55,
  },
  {
    id: 't3',
    vehicleId: 'v5',
    vehicleName: 'Mercedes Sprinter VIP',
    driverId: 'd3',
    driverName: 'Ali Kaya',
    clientName: 'Müzik Yapım A.Ş.',
    eventName: 'Festival Ekip Transferi',
    pickupLocation: 'Zorlu Center',
    dropoffLocation: 'Life Park',
    pickupTime: '2024-06-22 08:00',
    passengerCount: 12,
    status: 'scheduled',
    price: 4500,
    distance: 35,
    notes: 'Ekipman için bagaj alanı gerekli',
  },
  {
    id: 't4',
    vehicleId: 'v1',
    vehicleName: 'Mercedes S-Class',
    driverId: 'd1',
    driverName: 'Ahmet Yılmaz',
    clientName: 'Elif Yıldız',
    pickupLocation: 'Swissotel',
    dropoffLocation: 'İstanbul Havalimanı',
    pickupTime: '2024-06-19 10:00',
    dropoffTime: '2024-06-19 11:15',
    passengerCount: 1,
    status: 'completed',
    price: 2500,
    distance: 40,
  },
];

// Helper Functions
export function getVehiclesByType(type: VehicleType): Vehicle[] {
  return mockVehicles.filter(v => v.type === type);
}

export function getVehicleById(id: string): Vehicle | undefined {
  return mockVehicles.find(v => v.id === id);
}

export function getAvailableVehicles(): Vehicle[] {
  return mockVehicles.filter(v => v.status === 'available');
}

export function getDriverById(id: string): Driver | undefined {
  return mockDrivers.find(d => d.id === id);
}

export function getAvailableDrivers(): Driver[] {
  return mockDrivers.filter(d => d.status === 'available');
}

export function getTripsByStatus(status: Trip['status']): Trip[] {
  return mockTrips.filter(t => t.status === status);
}

export function getDriverTrips(driverId: string): Trip[] {
  return mockTrips.filter(t => t.driverId === driverId);
}

// Stats
export function getFleetStats() {
  const totalVehicles = mockVehicles.length;
  const availableVehicles = mockVehicles.filter(v => v.status === 'available').length;
  const onTripVehicles = mockVehicles.filter(v => v.status === 'on_trip').length;
  const maintenanceVehicles = mockVehicles.filter(v => v.status === 'maintenance').length;

  const totalDrivers = mockDrivers.length;
  const availableDrivers = mockDrivers.filter(d => d.status === 'available').length;

  const activeTrips = mockTrips.filter(t => t.status === 'in_progress').length;
  const scheduledTrips = mockTrips.filter(t => t.status === 'scheduled').length;
  const completedTrips = mockTrips.filter(t => t.status === 'completed').length;

  const monthlyRevenue = mockTrips
    .filter(t => t.status === 'completed' || t.status === 'in_progress')
    .reduce((acc, t) => acc + t.price, 0);

  const totalCapacity = mockVehicles.reduce((acc, v) => acc + v.capacity, 0);

  // Vehicles needing attention (service, insurance, inspection)
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const vehiclesNeedingAttention = mockVehicles.filter(v =>
    new Date(v.nextService) <= thirtyDaysFromNow ||
    new Date(v.insuranceExpiry) <= thirtyDaysFromNow ||
    new Date(v.inspectionExpiry) <= thirtyDaysFromNow
  ).length;

  return {
    totalVehicles,
    availableVehicles,
    onTripVehicles,
    maintenanceVehicles,
    totalDrivers,
    availableDrivers,
    activeTrips,
    scheduledTrips,
    completedTrips,
    monthlyRevenue,
    totalCapacity,
    vehiclesNeedingAttention,
    utilizationRate: Math.round((onTripVehicles / totalVehicles) * 100),
    vehicleTypeCounts: vehicleTypes.map(vt => ({
      type: vt.key,
      label: vt.label,
      count: mockVehicles.filter(v => v.type === vt.key).length,
    })),
  };
}
