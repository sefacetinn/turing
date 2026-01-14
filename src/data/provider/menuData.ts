// Menu Management Data for Catering Providers

export type MenuCategory = 'appetizer' | 'main' | 'dessert' | 'beverage' | 'snack' | 'special';
export type DietaryOption = 'vegan' | 'vegetarian' | 'gluten_free' | 'halal' | 'kosher' | 'dairy_free' | 'nut_free';
export type ServiceStyle = 'buffet' | 'plated' | 'cocktail' | 'family_style' | 'food_station';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  image: string;
  price: number;
  costPerPerson: number;
  minOrder: number;
  preparationTime: number; // minutes
  isPopular: boolean;
  isAvailable: boolean;
  dietaryOptions: DietaryOption[];
  allergens: string[];
  ingredients: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface MenuPackage {
  id: string;
  name: string;
  description: string;
  image: string;
  pricePerPerson: number;
  minGuests: number;
  maxGuests: number;
  serviceStyle: ServiceStyle;
  items: {
    category: MenuCategory;
    count: number;
    items: string[]; // MenuItem IDs
  }[];
  includes: string[];
  dietaryOptions: DietaryOption[];
  isPopular: boolean;
}

export interface CateringOrder {
  id: string;
  eventName: string;
  clientName: string;
  eventDate: string;
  guestCount: number;
  packageId?: string;
  packageName?: string;
  customItems: { itemId: string; quantity: number }[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'completed' | 'cancelled';
  deliveryTime: string;
  venue: string;
  notes?: string;
}

// Menu Categories
export const menuCategories: { key: MenuCategory; label: string; icon: string }[] = [
  { key: 'appetizer', label: 'Başlangıçlar', icon: 'restaurant-outline' },
  { key: 'main', label: 'Ana Yemekler', icon: 'fast-food-outline' },
  { key: 'dessert', label: 'Tatlılar', icon: 'ice-cream-outline' },
  { key: 'beverage', label: 'İçecekler', icon: 'wine-outline' },
  { key: 'snack', label: 'Atıştırmalıklar', icon: 'cafe-outline' },
  { key: 'special', label: 'Özel Menüler', icon: 'star-outline' },
];

// Dietary Options
export const dietaryOptions: { key: DietaryOption; label: string }[] = [
  { key: 'vegan', label: 'Vegan' },
  { key: 'vegetarian', label: 'Vejetaryen' },
  { key: 'gluten_free', label: 'Glutensiz' },
  { key: 'halal', label: 'Helal' },
  { key: 'dairy_free', label: 'Süt Ürünsüz' },
  { key: 'nut_free', label: 'Fındıksız' },
];

// Mock Menu Items
export const mockMenuItems: MenuItem[] = [
  // Appetizers
  {
    id: 'menu1',
    name: 'Karides Kokteyli',
    description: 'Taze karidesler, avokado kreması ve limon soslu',
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1565608087341-404b25492fee?w=400',
    price: 85,
    costPerPerson: 45,
    minOrder: 20,
    preparationTime: 30,
    isPopular: true,
    isAvailable: true,
    dietaryOptions: ['gluten_free'],
    allergens: ['Kabuklu deniz ürünleri'],
    ingredients: ['Karides', 'Avokado', 'Limon', 'Dereotu'],
    nutritionInfo: { calories: 180, protein: 22, carbs: 8, fat: 10 },
  },
  {
    id: 'menu2',
    name: 'Zeytinyağlı Dolma',
    description: 'Geleneksel Türk usulü yaprak dolması',
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
    price: 45,
    costPerPerson: 20,
    minOrder: 30,
    preparationTime: 120,
    isPopular: true,
    isAvailable: true,
    dietaryOptions: ['vegan', 'vegetarian', 'gluten_free'],
    allergens: [],
    ingredients: ['Asma yaprağı', 'Pirinç', 'Soğan', 'Çam fıstığı'],
    nutritionInfo: { calories: 120, protein: 3, carbs: 18, fat: 6 },
  },
  {
    id: 'menu3',
    name: 'Bruschetta Trio',
    description: 'Domates, mantar ve peynirli üç çeşit bruschetta',
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400',
    price: 55,
    costPerPerson: 25,
    minOrder: 25,
    preparationTime: 20,
    isPopular: false,
    isAvailable: true,
    dietaryOptions: ['vegetarian'],
    allergens: ['Gluten', 'Süt ürünleri'],
    ingredients: ['İtalyan ekmeği', 'Domates', 'Mantar', 'Parmesan'],
  },
  // Main Courses
  {
    id: 'menu4',
    name: 'Izgara Levrek',
    description: 'Akdeniz otları ile marine edilmiş levrek fileto',
    category: 'main',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400',
    price: 145,
    costPerPerson: 75,
    minOrder: 20,
    preparationTime: 45,
    isPopular: true,
    isAvailable: true,
    dietaryOptions: ['gluten_free'],
    allergens: ['Balık'],
    ingredients: ['Levrek', 'Zeytinyağı', 'Limon', 'Akdeniz otları'],
    nutritionInfo: { calories: 280, protein: 35, carbs: 5, fat: 14 },
  },
  {
    id: 'menu5',
    name: 'Kuzu Tandır',
    description: 'Fırında yavaş pişirilmiş kuzu incik',
    category: 'main',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400',
    price: 165,
    costPerPerson: 85,
    minOrder: 15,
    preparationTime: 180,
    isPopular: true,
    isAvailable: true,
    dietaryOptions: ['halal', 'gluten_free'],
    allergens: [],
    ingredients: ['Kuzu incik', 'Patates', 'Soğan', 'Domates'],
    nutritionInfo: { calories: 450, protein: 42, carbs: 25, fat: 22 },
  },
  {
    id: 'menu6',
    name: 'Vegan Buddha Bowl',
    description: 'Kinoa, ızgara sebzeler ve humus',
    category: 'main',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    price: 95,
    costPerPerson: 45,
    minOrder: 20,
    preparationTime: 35,
    isPopular: false,
    isAvailable: true,
    dietaryOptions: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
    allergens: [],
    ingredients: ['Kinoa', 'Nohut', 'Avokado', 'Sebzeler'],
    nutritionInfo: { calories: 380, protein: 15, carbs: 48, fat: 18 },
  },
  // Desserts
  {
    id: 'menu7',
    name: 'Çikolatalı Sufle',
    description: 'Sıcak servis edilen akışkan çikolatalı kek',
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    price: 65,
    costPerPerson: 30,
    minOrder: 20,
    preparationTime: 25,
    isPopular: true,
    isAvailable: true,
    dietaryOptions: ['vegetarian'],
    allergens: ['Yumurta', 'Süt ürünleri', 'Gluten'],
    ingredients: ['Bitter çikolata', 'Yumurta', 'Tereyağı', 'Un'],
    nutritionInfo: { calories: 380, protein: 6, carbs: 42, fat: 22 },
  },
  {
    id: 'menu8',
    name: 'Meyve Tabağı',
    description: 'Mevsim meyvelerinden oluşan taze tabak',
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400',
    price: 45,
    costPerPerson: 20,
    minOrder: 25,
    preparationTime: 15,
    isPopular: false,
    isAvailable: true,
    dietaryOptions: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
    allergens: [],
    ingredients: ['Mevsim meyveleri'],
    nutritionInfo: { calories: 120, protein: 2, carbs: 28, fat: 1 },
  },
  // Beverages
  {
    id: 'menu9',
    name: 'Taze Sıkılmış Portakal Suyu',
    description: '100% doğal, taze sıkım',
    category: 'beverage',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
    price: 25,
    costPerPerson: 12,
    minOrder: 30,
    preparationTime: 10,
    isPopular: true,
    isAvailable: true,
    dietaryOptions: ['vegan', 'vegetarian', 'gluten_free'],
    allergens: [],
    ingredients: ['Taze portakal'],
  },
  {
    id: 'menu10',
    name: 'Türk Kahvesi',
    description: 'Geleneksel usul pişirilmiş Türk kahvesi',
    category: 'beverage',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
    price: 20,
    costPerPerson: 8,
    minOrder: 20,
    preparationTime: 10,
    isPopular: true,
    isAvailable: true,
    dietaryOptions: ['vegan', 'vegetarian', 'gluten_free'],
    allergens: [],
    ingredients: ['Türk kahvesi'],
  },
];

// Mock Menu Packages
export const mockMenuPackages: MenuPackage[] = [
  {
    id: 'pkg1',
    name: 'Premium Düğün Menüsü',
    description: 'Özel günleriniz için hazırlanmış lüks menü',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
    pricePerPerson: 450,
    minGuests: 100,
    maxGuests: 500,
    serviceStyle: 'plated',
    items: [
      { category: 'appetizer', count: 3, items: ['menu1', 'menu2', 'menu3'] },
      { category: 'main', count: 2, items: ['menu4', 'menu5'] },
      { category: 'dessert', count: 2, items: ['menu7', 'menu8'] },
      { category: 'beverage', count: 2, items: ['menu9', 'menu10'] },
    ],
    includes: ['Servis ekibi', 'Masa düzeni', 'Porselen tabak', 'Kristal bardak'],
    dietaryOptions: ['vegetarian', 'gluten_free'],
    isPopular: true,
  },
  {
    id: 'pkg2',
    name: 'Kurumsal Kokteyl',
    description: 'İş toplantıları ve lansman etkinlikleri için ideal',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    pricePerPerson: 280,
    minGuests: 50,
    maxGuests: 300,
    serviceStyle: 'cocktail',
    items: [
      { category: 'appetizer', count: 5, items: ['menu1', 'menu2', 'menu3'] },
      { category: 'snack', count: 3, items: [] },
      { category: 'beverage', count: 3, items: ['menu9', 'menu10'] },
    ],
    includes: ['Servis ekibi', 'Kokteyl masaları', 'Disposable servis'],
    dietaryOptions: ['vegetarian', 'vegan'],
    isPopular: true,
  },
  {
    id: 'pkg3',
    name: 'Açık Büfe Ziyafet',
    description: 'Çeşitlilik arayanlar için zengin büfe menüsü',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    pricePerPerson: 350,
    minGuests: 80,
    maxGuests: 400,
    serviceStyle: 'buffet',
    items: [
      { category: 'appetizer', count: 6, items: ['menu1', 'menu2', 'menu3'] },
      { category: 'main', count: 4, items: ['menu4', 'menu5', 'menu6'] },
      { category: 'dessert', count: 4, items: ['menu7', 'menu8'] },
      { category: 'beverage', count: 4, items: ['menu9', 'menu10'] },
    ],
    includes: ['Servis ekibi', 'Şafing dish', 'Büfe kurulumu', 'Dekorasyon'],
    dietaryOptions: ['vegetarian', 'vegan', 'gluten_free'],
    isPopular: false,
  },
];

// Mock Orders
export const mockCateringOrders: CateringOrder[] = [
  {
    id: 'order1',
    eventName: 'ABC Holding Yıllık Toplantı',
    clientName: 'ABC Holding',
    eventDate: '2024-07-20',
    guestCount: 150,
    packageId: 'pkg2',
    packageName: 'Kurumsal Kokteyl',
    customItems: [],
    totalPrice: 42000,
    status: 'confirmed',
    deliveryTime: '18:00',
    venue: 'Hilton İstanbul',
    notes: '10 kişi vegan seçenek',
  },
  {
    id: 'order2',
    eventName: 'Yıldız & Kaan Düğünü',
    clientName: 'Yıldız Ailesi',
    eventDate: '2024-08-15',
    guestCount: 300,
    packageId: 'pkg1',
    packageName: 'Premium Düğün Menüsü',
    customItems: [],
    totalPrice: 135000,
    status: 'preparing',
    deliveryTime: '19:00',
    venue: 'Four Seasons Bosphorus',
  },
  {
    id: 'order3',
    eventName: 'Tech Summit 2024',
    clientName: 'TechCorp',
    eventDate: '2024-06-25',
    guestCount: 80,
    packageId: undefined,
    customItems: [
      { itemId: 'menu1', quantity: 80 },
      { itemId: 'menu6', quantity: 30 },
      { itemId: 'menu9', quantity: 80 },
    ],
    totalPrice: 18500,
    status: 'pending',
    deliveryTime: '12:00',
    venue: 'İTÜ Kongre Merkezi',
    notes: '%30 vegan menü gerekli',
  },
];

// Helper Functions
export function getMenuItemsByCategory(category: MenuCategory): MenuItem[] {
  return mockMenuItems.filter(item => item.category === category);
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return mockMenuItems.find(item => item.id === id);
}

export function getAvailableMenuItems(): MenuItem[] {
  return mockMenuItems.filter(item => item.isAvailable);
}

export function getMenuItemsByDietaryOption(option: DietaryOption): MenuItem[] {
  return mockMenuItems.filter(item => item.dietaryOptions.includes(option));
}

export function getPackageById(id: string): MenuPackage | undefined {
  return mockMenuPackages.find(pkg => pkg.id === id);
}

export function getOrdersByStatus(status: CateringOrder['status']): CateringOrder[] {
  return mockCateringOrders.filter(order => order.status === status);
}

// Stats
export function getMenuStats() {
  const totalItems = mockMenuItems.length;
  const availableItems = mockMenuItems.filter(i => i.isAvailable).length;
  const popularItems = mockMenuItems.filter(i => i.isPopular).length;
  const activeOrders = mockCateringOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const upcomingGuests = mockCateringOrders
    .filter(o => o.status === 'confirmed' || o.status === 'preparing')
    .reduce((acc, o) => acc + o.guestCount, 0);
  const monthlyRevenue = mockCateringOrders
    .filter(o => o.status === 'completed' || o.status === 'confirmed')
    .reduce((acc, o) => acc + o.totalPrice, 0);

  return {
    totalItems,
    availableItems,
    popularItems,
    totalPackages: mockMenuPackages.length,
    activeOrders,
    upcomingGuests,
    monthlyRevenue,
    categoryCounts: menuCategories.map(cat => ({
      category: cat.key,
      label: cat.label,
      count: mockMenuItems.filter(i => i.category === cat.key).length,
    })),
  };
}
