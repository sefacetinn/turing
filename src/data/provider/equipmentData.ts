// Equipment Inventory Data for Technical Providers

export type EquipmentCategory = 'sound' | 'lighting' | 'stage' | 'video' | 'power' | 'rigging' | 'accessories';
export type EquipmentStatus = 'available' | 'rented' | 'maintenance' | 'reserved' | 'damaged';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  subcategory: string;
  brand: string;
  model: string;
  serialNumber: string;
  image: string;
  quantity: number;
  availableQuantity: number;
  status: EquipmentStatus;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  purchaseDate: string;
  purchasePrice: number;
  rentalPrice: number; // Per day
  lastMaintenance: string;
  nextMaintenance: string;
  location: string;
  notes?: string;
  specifications: Record<string, string>;
}

export interface EquipmentRental {
  id: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  eventName: string;
  clientName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming' | 'cancelled';
  totalPrice: number;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'routine' | 'repair' | 'upgrade' | 'inspection';
  description: string;
  date: string;
  cost: number;
  technician: string;
  status: 'completed' | 'scheduled' | 'in_progress';
  notes?: string;
}

// Equipment Categories with Turkish labels
export const equipmentCategories: { key: EquipmentCategory; label: string; icon: string }[] = [
  { key: 'sound', label: 'Ses Sistemleri', icon: 'volume-high' },
  { key: 'lighting', label: 'Işık Sistemleri', icon: 'bulb' },
  { key: 'stage', label: 'Sahne & Truss', icon: 'cube' },
  { key: 'video', label: 'Video & LED', icon: 'videocam' },
  { key: 'power', label: 'Güç Sistemleri', icon: 'flash' },
  { key: 'rigging', label: 'Rigging', icon: 'git-network' },
  { key: 'accessories', label: 'Aksesuarlar', icon: 'hardware-chip' },
];

// Mock Equipment Data
export const mockEquipment: Equipment[] = [
  // Sound Equipment
  {
    id: 'eq1',
    name: 'Line Array Speaker System',
    category: 'sound',
    subcategory: 'Hoparlör',
    brand: 'L-Acoustics',
    model: 'K2',
    serialNumber: 'LA-K2-2024-001',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    quantity: 12,
    availableQuantity: 8,
    status: 'available',
    condition: 'excellent',
    purchaseDate: '2023-01-15',
    purchasePrice: 450000,
    rentalPrice: 5000,
    lastMaintenance: '2024-05-01',
    nextMaintenance: '2024-08-01',
    location: 'Depo A - Raf 1',
    specifications: {
      'Frekans Aralığı': '35Hz - 20kHz',
      'SPL Max': '145 dB',
      'Güç': '3000W',
      'Ağırlık': '45 kg',
    },
  },
  {
    id: 'eq2',
    name: 'Subwoofer',
    category: 'sound',
    subcategory: 'Bass',
    brand: 'L-Acoustics',
    model: 'KS28',
    serialNumber: 'LA-KS28-2024-001',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400',
    quantity: 8,
    availableQuantity: 6,
    status: 'available',
    condition: 'excellent',
    purchaseDate: '2023-01-15',
    purchasePrice: 280000,
    rentalPrice: 3500,
    lastMaintenance: '2024-05-01',
    nextMaintenance: '2024-08-01',
    location: 'Depo A - Raf 2',
    specifications: {
      'Frekans Aralığı': '25Hz - 100Hz',
      'SPL Max': '141 dB',
      'Güç': '2400W',
      'Ağırlık': '78 kg',
    },
  },
  {
    id: 'eq3',
    name: 'Digital Mixer',
    category: 'sound',
    subcategory: 'Mikser',
    brand: 'DiGiCo',
    model: 'SD12',
    serialNumber: 'DG-SD12-2023-001',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    quantity: 2,
    availableQuantity: 1,
    status: 'available',
    condition: 'excellent',
    purchaseDate: '2023-06-01',
    purchasePrice: 680000,
    rentalPrice: 8000,
    lastMaintenance: '2024-04-15',
    nextMaintenance: '2024-10-15',
    location: 'Depo B - Kasa 1',
    specifications: {
      'Kanal Sayısı': '96',
      'Aux': '36',
      'Matrix': '24',
      'Fader': '72',
    },
  },
  {
    id: 'eq4',
    name: 'Wireless Microphone Set',
    category: 'sound',
    subcategory: 'Mikrofon',
    brand: 'Shure',
    model: 'ULXD4Q/SM58',
    serialNumber: 'SH-ULXD-2024-001',
    image: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=400',
    quantity: 12,
    availableQuantity: 10,
    status: 'available',
    condition: 'good',
    purchaseDate: '2024-01-10',
    purchasePrice: 85000,
    rentalPrice: 1200,
    lastMaintenance: '2024-06-01',
    nextMaintenance: '2024-09-01',
    location: 'Depo B - Kasa 2',
    specifications: {
      'Frekans': '470-534 MHz',
      'Range': '100m',
      'Pil Ömrü': '9 saat',
      'Kanal': '4',
    },
  },
  // Lighting Equipment
  {
    id: 'eq5',
    name: 'Moving Head Spot',
    category: 'lighting',
    subcategory: 'Moving Head',
    brand: 'Martin',
    model: 'MAC Viper Profile',
    serialNumber: 'MR-MVP-2023-001',
    image: 'https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=400',
    quantity: 24,
    availableQuantity: 16,
    status: 'available',
    condition: 'excellent',
    purchaseDate: '2023-03-20',
    purchasePrice: 125000,
    rentalPrice: 1500,
    lastMaintenance: '2024-05-15',
    nextMaintenance: '2024-08-15',
    location: 'Depo C - Raf 1',
    specifications: {
      'Güç': '1000W',
      'Lümen': '26000',
      'Pan': '540°',
      'Tilt': '268°',
      'Gobo': '17',
    },
  },
  {
    id: 'eq6',
    name: 'LED Wash',
    category: 'lighting',
    subcategory: 'LED',
    brand: 'Robe',
    model: 'Robin 600 LEDWash',
    serialNumber: 'RB-600-2023-001',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
    quantity: 36,
    availableQuantity: 28,
    status: 'available',
    condition: 'good',
    purchaseDate: '2023-05-01',
    purchasePrice: 45000,
    rentalPrice: 800,
    lastMaintenance: '2024-04-01',
    nextMaintenance: '2024-07-01',
    location: 'Depo C - Raf 2',
    specifications: {
      'LED': '37 x RGBW',
      'Zoom': '15° - 63°',
      'Pan': '450°',
      'Tilt': '228°',
    },
  },
  {
    id: 'eq7',
    name: 'Lighting Console',
    category: 'lighting',
    subcategory: 'Kontrol',
    brand: 'MA Lighting',
    model: 'grandMA3 Light',
    serialNumber: 'MA-GM3L-2024-001',
    image: 'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=400',
    quantity: 2,
    availableQuantity: 2,
    status: 'available',
    condition: 'excellent',
    purchaseDate: '2024-02-01',
    purchasePrice: 520000,
    rentalPrice: 6000,
    lastMaintenance: '2024-06-01',
    nextMaintenance: '2024-12-01',
    location: 'Depo B - Kasa 3',
    specifications: {
      'Fader': '60',
      'Executor': '90',
      'Encoder': '15',
      'DMX Out': '8192',
    },
  },
  // Stage Equipment
  {
    id: 'eq8',
    name: 'Stage Deck',
    category: 'stage',
    subcategory: 'Platform',
    brand: 'Prolyte',
    model: 'StageDex',
    serialNumber: 'PL-SD-2023-001',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
    quantity: 100,
    availableQuantity: 80,
    status: 'available',
    condition: 'good',
    purchaseDate: '2022-08-15',
    purchasePrice: 2500,
    rentalPrice: 150,
    lastMaintenance: '2024-03-01',
    nextMaintenance: '2024-09-01',
    location: 'Depo D',
    notes: '2m x 1m platform, 80cm yükseklik ayaklı',
    specifications: {
      'Boyut': '2m x 1m',
      'Yük Kapasitesi': '750 kg/m²',
      'Malzeme': 'Alüminyum',
    },
  },
  {
    id: 'eq9',
    name: 'Truss System',
    category: 'stage',
    subcategory: 'Truss',
    brand: 'Prolyte',
    model: 'H30V',
    serialNumber: 'PL-H30V-2023-001',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400',
    quantity: 200,
    availableQuantity: 150,
    status: 'available',
    condition: 'good',
    purchaseDate: '2022-06-01',
    purchasePrice: 1800,
    rentalPrice: 100,
    lastMaintenance: '2024-02-15',
    nextMaintenance: '2024-08-15',
    location: 'Depo D',
    notes: '3m parçalar',
    specifications: {
      'Boyut': '30 x 30 cm',
      'Uzunluk': '3m',
      'Malzeme': 'Alüminyum 6082-T6',
      'Yük': '500 kg/m',
    },
  },
  // Video Equipment
  {
    id: 'eq10',
    name: 'LED Video Wall Panel',
    category: 'video',
    subcategory: 'LED Panel',
    brand: 'ROE Visual',
    model: 'Black Pearl BP2',
    serialNumber: 'ROE-BP2-2024-001',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400',
    quantity: 120,
    availableQuantity: 100,
    status: 'available',
    condition: 'excellent',
    purchaseDate: '2024-01-15',
    purchasePrice: 35000,
    rentalPrice: 500,
    lastMaintenance: '2024-06-01',
    nextMaintenance: '2024-12-01',
    location: 'Depo E',
    specifications: {
      'Pixel Pitch': '2.8mm',
      'Boyut': '500 x 500mm',
      'Parlaklık': '5000 nits',
      'Refresh': '3840 Hz',
    },
  },
  // Power Equipment
  {
    id: 'eq11',
    name: 'Generator',
    category: 'power',
    subcategory: 'Jeneratör',
    brand: 'Caterpillar',
    model: 'C18',
    serialNumber: 'CAT-C18-2023-001',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400',
    quantity: 4,
    availableQuantity: 3,
    status: 'available',
    condition: 'excellent',
    purchaseDate: '2023-04-01',
    purchasePrice: 850000,
    rentalPrice: 15000,
    lastMaintenance: '2024-05-20',
    nextMaintenance: '2024-08-20',
    location: 'Depo F',
    specifications: {
      'Güç': '500 kVA',
      'Yakıt': 'Dizel',
      'Tank': '1000L',
      'Ses Seviyesi': '75 dB(A)',
    },
  },
  {
    id: 'eq12',
    name: 'Power Distribution Box',
    category: 'power',
    subcategory: 'Dağıtım',
    brand: 'Indu-Electric',
    model: 'Event Box 400A',
    serialNumber: 'IE-EB400-2023-001',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    quantity: 8,
    availableQuantity: 6,
    status: 'available',
    condition: 'good',
    purchaseDate: '2023-02-15',
    purchasePrice: 45000,
    rentalPrice: 2000,
    lastMaintenance: '2024-04-01',
    nextMaintenance: '2024-10-01',
    location: 'Depo F',
    specifications: {
      'Giriş': '400A CEE',
      'Çıkış': '16x 32A + 8x 63A',
      'Koruma': 'IP65',
    },
  },
];

// Mock Rentals
export const mockRentals: EquipmentRental[] = [
  {
    id: 'rent1',
    equipmentId: 'eq1',
    equipmentName: 'Line Array Speaker System (4 adet)',
    quantity: 4,
    eventName: 'Summer Fest 2024',
    clientName: 'Event Pro Organizasyon',
    startDate: '2024-07-14',
    endDate: '2024-07-16',
    status: 'upcoming',
    totalPrice: 60000,
  },
  {
    id: 'rent2',
    equipmentId: 'eq5',
    equipmentName: 'Moving Head Spot (8 adet)',
    quantity: 8,
    eventName: 'Kurumsal Gala',
    clientName: 'ABC Holding',
    startDate: '2024-06-20',
    endDate: '2024-06-21',
    status: 'active',
    totalPrice: 24000,
  },
  {
    id: 'rent3',
    equipmentId: 'eq3',
    equipmentName: 'Digital Mixer',
    quantity: 1,
    eventName: 'Konser Prodüksiyonu',
    clientName: 'Music Live Events',
    startDate: '2024-06-15',
    endDate: '2024-06-18',
    status: 'completed',
    totalPrice: 32000,
  },
];

// Mock Maintenance Records
export const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'maint1',
    equipmentId: 'eq1',
    equipmentName: 'Line Array Speaker System',
    type: 'routine',
    description: 'Periyodik bakım ve temizlik',
    date: '2024-05-01',
    cost: 2500,
    technician: 'Mehmet Usta',
    status: 'completed',
  },
  {
    id: 'maint2',
    equipmentId: 'eq5',
    equipmentName: 'Moving Head Spot',
    type: 'repair',
    description: 'Motor değişimi (Pan)',
    date: '2024-04-15',
    cost: 8500,
    technician: 'Ahmet Teknisyen',
    status: 'completed',
    notes: 'Garanti kapsamında',
  },
  {
    id: 'maint3',
    equipmentId: 'eq7',
    equipmentName: 'Lighting Console',
    type: 'inspection',
    description: 'Yıllık kontrol ve kalibrasyon',
    date: '2024-08-01',
    cost: 3500,
    technician: 'MA Yetkili Servis',
    status: 'scheduled',
  },
];

// Helper Functions
export function getEquipmentByCategory(category: EquipmentCategory): Equipment[] {
  return mockEquipment.filter(e => e.category === category);
}

export function getEquipmentById(id: string): Equipment | undefined {
  return mockEquipment.find(e => e.id === id);
}

export function getAvailableEquipment(): Equipment[] {
  return mockEquipment.filter(e => e.availableQuantity > 0);
}

export function getEquipmentMaintenanceDue(): Equipment[] {
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  return mockEquipment.filter(e => new Date(e.nextMaintenance) <= thirtyDaysFromNow);
}

export function getRentalsByStatus(status: EquipmentRental['status']): EquipmentRental[] {
  return mockRentals.filter(r => r.status === status);
}

// Stats
export function getEquipmentStats() {
  const totalItems = mockEquipment.reduce((acc, e) => acc + e.quantity, 0);
  const availableItems = mockEquipment.reduce((acc, e) => acc + e.availableQuantity, 0);
  const rentedItems = totalItems - availableItems;
  const totalValue = mockEquipment.reduce((acc, e) => acc + (e.purchasePrice * e.quantity), 0);
  const maintenanceDue = getEquipmentMaintenanceDue().length;
  const activeRentals = mockRentals.filter(r => r.status === 'active').length;
  const monthlyRevenue = mockRentals
    .filter(r => r.status === 'completed' || r.status === 'active')
    .reduce((acc, r) => acc + r.totalPrice, 0);

  return {
    totalItems,
    availableItems,
    rentedItems,
    utilizationRate: Math.round((rentedItems / totalItems) * 100),
    totalValue,
    maintenanceDue,
    activeRentals,
    monthlyRevenue,
    categoryCounts: equipmentCategories.map(cat => ({
      category: cat.key,
      label: cat.label,
      count: mockEquipment.filter(e => e.category === cat.key).reduce((acc, e) => acc + e.quantity, 0),
    })),
  };
}
