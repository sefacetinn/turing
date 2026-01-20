# 🎵 turing UYGULAMASI - REACT NATIVE EXPO
## Genel Çalışma Mantığı ve Mimari Dokümantasyonu

---

## 🎯 UYGULAMA TANIMI

**turing**, etkinlik ve müzik sektöründe organizatörleri ve hizmet sağlayıcıları (provider) bir araya getiren, teklif bazlı işleyişe sahip mobil uygulamadır.

### Temel İşlev
```
Organizatör → Hizmet İhtiyacı → Teklif Talebi → Provider → Teklif Gönderir → Anlaşma
```

### Teknoloji Stack
- **Framework:** React Native + Expo SDK 54
- **Navigation:** React Navigation v6 (Native Stack + Bottom Tabs)
- **State Management:** React Context API + useState
- **Styling:** StyleSheet API + Custom Theme System
- **Icons:** @expo/vector-icons (Ionicons)
- **Gradients:** expo-linear-gradient
- **Safe Area:** react-native-safe-area-context

---

## 👥 KULLANICI ROLLERİ

### 1. Organizatör (Organizer)
- Etkinlik organizatörü
- Konser, festival, düğün, kurumsal etkinlik düzenleyenler
- **İHTİYAÇLARI:** Sanatçı, teknik ekipman, mekan, ulaşım, konaklama, güvenlik vb.

### 2. Hizmet Sağlayıcı (Provider)
- Sanatçılar, müzisyenler, DJ'ler (Booking)
- Teknik ekipman firmaları (Ses, ışık, sahne)
- Ulaşım şirketleri (Transfer, özel uçak)
- Mekan sahipleri
- Otel ve konaklama hizmetleri
- Operasyon hizmetleri (Güvenlik, catering, jeneratör, vb.)

---

## 🏗️ MİMARİ YAPISI

### Dosya Yapısı
```
/Users/sefacetin/turing/
├── App.tsx                      # Ana uygulama, navigation, context
├── src/
│   ├── screens/                 # 26 ekran dosyası
│   │   ├── HomeScreen.tsx
│   │   ├── EventsScreen.tsx
│   │   ├── OrganizerEventsScreen.tsx
│   │   ├── ProviderEventsScreen.tsx
│   │   ├── EventDetailScreen.tsx
│   │   ├── OrganizerEventDetailScreen.tsx
│   │   ├── ProviderEventDetailScreen.tsx
│   │   ├── OffersScreen.tsx
│   │   ├── OfferDetailScreen.tsx
│   │   ├── MessagesScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   ├── FavoritesScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── EditProfileScreen.tsx
│   │   ├── CreateEventScreen.tsx
│   │   ├── ServiceProvidersScreen.tsx
│   │   ├── ProviderDetailScreen.tsx
│   │   ├── ArtistDetailScreen.tsx
│   │   ├── CalendarViewScreen.tsx
│   │   ├── RequestOfferScreen.tsx
│   │   ├── CategoryRequestScreen.tsx
│   │   └── OperationSubcategoriesScreen.tsx
│   │
│   ├── components/              # Paylaşılan bileşenler
│   │   ├── CancelEventModal.tsx
│   │   ├── ReviseEventModal.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingIndicator.tsx
│   │   └── index.ts
│   │
│   ├── theme/                   # Tema sistemi
│   │   └── colors.ts
│   │
│   ├── data/                    # Mock veriler
│   │   └── mockData.ts
│   │
│   ├── types/                   # TypeScript tipleri
│   │   └── index.ts
│   │
│   └── utils/                   # Yardımcı fonksiyonlar
│       ├── cityData.ts          # 81 il ve ilçeleri
│       └── artistData.ts        # Sanatçı verileri
│
├── assets/                      # Statik dosyalar
├── package.json
├── tsconfig.json
└── app.json
```

---

## 🔄 NAVİGASYON SİSTEMİ

### Ana Navigator Yapısı (App.tsx)

```typescript
App.tsx (Master Controller)
    │
    ├─── Authentication Layer
    │    └─ LoginScreen (isLoggedIn === false)
    │
    ├─── AppContext.Provider
    │    ├─ isProviderMode (boolean)
    │    └─ toggleMode (function)
    │
    └─── NavigationContainer
         └─── Tab.Navigator (MainTabs)
              ├─ HomeTab → HomeStack
              ├─ EventsTab → EventsStack
              ├─ OffersTab → OffersStack
              ├─ MessagesTab → MessagesStack
              └─ ProfileTab → ProfileStack
```

### Stack Navigator'lar

#### HomeStack
```typescript
<Stack.Navigator>
  <Stack.Screen name="HomeMain" component={HomeScreen} />
  <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
  <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
  <Stack.Screen name="Search" component={SearchScreen} />
  <Stack.Screen name="Notifications" component={NotificationsScreen} />
  <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
  <Stack.Screen name="ServiceProviders" component={ServiceProvidersScreen} />
  <Stack.Screen name="OperationSubcategories" component={OperationSubcategoriesScreen} />
  <Stack.Screen name="RequestOffer" component={RequestOfferScreen} />
  <Stack.Screen name="CategoryRequest" component={CategoryRequestScreen} />
</Stack.Navigator>
```

#### EventsStack
```typescript
<Stack.Navigator>
  <Stack.Screen name="EventsMain" component={EventsScreen} />
  <Stack.Screen name="EventDetail" component={EventDetailScreen} />
  <Stack.Screen name="OrganizerEventDetail" component={OrganizerEventDetailScreen} />
  <Stack.Screen name="ProviderEventDetail" component={ProviderEventDetailScreen} />
  <Stack.Screen name="CalendarView" component={CalendarViewScreen} />
  <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
  <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
</Stack.Navigator>
```

#### OffersStack
```typescript
<Stack.Navigator>
  <Stack.Screen name="OffersMain" component={OffersScreen} />
  <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
</Stack.Navigator>
```

#### MessagesStack
```typescript
<Stack.Navigator>
  <Stack.Screen name="MessagesMain" component={MessagesScreen} />
  <Stack.Screen name="Chat" component={ChatScreen} />
</Stack.Navigator>
```

#### ProfileStack
```typescript
<Stack.Navigator>
  <Stack.Screen name="ProfileMain" component={ProfileScreen} />
  <Stack.Screen name="Settings" component={SettingsScreen} />
  <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  <Stack.Screen name="Favorites" component={FavoritesScreen} />
</Stack.Navigator>
```

---

## 📱 BOTTOM TAB NAVİGASYON

### Görsel Yapı
```
┌─────────────────────────────────────────┐
│  🧭      📅       🏷️      💬      👤   │
│ Keşfet  Etkinlik  Teklif  Mesaj  Profil │
│         lerim     ler     lar           │
└─────────────────────────────────────────┘
```

### Tab Konfigürasyonu
```typescript
<Tab.Navigator
  screenOptions={({ route }) => ({
    headerShown: false,
    tabBarStyle: {
      backgroundColor: '#09090b',
      borderTopColor: 'rgba(255, 255, 255, 0.08)',
      borderTopWidth: 1,
      paddingTop: 4,
      paddingBottom: 4,
      height: 52,
    },
    tabBarActiveTintColor: colors.brand[400],  // #c084fc
    tabBarInactiveTintColor: colors.zinc[600], // #52525b
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: '500',
    },
    tabBarIcon: ({ focused, color }) => {
      // Focused: filled icon
      // Unfocused: outline icon
      // Background glow effect when focused
    },
  })}
>
```

### Tab İsimleri (Provider Mode'a Göre)
| Tab | Organizatör | Provider |
|-----|-------------|----------|
| HomeTab | Keşfet | Keşfet |
| EventsTab | Etkinlikler | İşlerim |
| OffersTab | Teklifler | Teklifler |
| MessagesTab | Mesajlar | Mesajlar |
| ProfileTab | Profil | Profil |

---

## 📊 STATE MANAGEMENT

### AppContext (Global State)
```typescript
interface AppContextType {
  isProviderMode: boolean;    // Organizatör vs Provider modu
  toggleMode: () => void;     // Mod değiştirme fonksiyonu
}

export const AppContext = createContext<AppContextType>({
  isProviderMode: false,
  toggleMode: () => {},
});

export const useApp = () => useContext(AppContext);
```

### Authentication States
```typescript
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [isProviderMode, setIsProviderMode] = useState(false);
```

### Kullanım Örneği
```typescript
// Herhangi bir screen'de
import { useApp } from '../../App';

function MyScreen() {
  const { isProviderMode, toggleMode } = useApp();

  if (isProviderMode) {
    return <ProviderContent />;
  }
  return <OrganizerContent />;
}
```

---

## 🗂️ HİZMET KATEGORİLERİ

### Ana Kategoriler (7 adet)
```typescript
export type ServiceCategory =
  | 'booking'      // Mor gradient    - Sanatçı & DJ
  | 'technical'    // Yeşil gradient  - Ses & Işık & Sahne
  | 'venue'        // Mavi gradient   - Etkinlik Alanları
  | 'accommodation'// Pembe gradient  - Otel & Konut
  | 'transport'    // Kırmızı gradient- VIP Transfer
  | 'flight'       // Gri gradient    - Uçuş Hizmetleri
  | 'operation';   // Turuncu gradient- Güvenlik, Catering vb.
```

### Operasyon Alt Kategorileri (12 adet)
```typescript
export type OperationSubCategory =
  | 'security'     // Güvenlik
  | 'catering'     // Catering
  | 'generator'    // Jeneratör
  | 'beverage'     // İçecek Hizmetleri
  | 'medical'      // Medikal
  | 'sanitation'   // WC & Temizlik
  | 'media'        // Fotoğraf & Video
  | 'barrier'      // Bariyer
  | 'tent'         // Çadır
  | 'ticketing'    // Biletleme
  | 'decoration'   // Dekorasyon
  | 'production';  // Prodüksiyon Yönetimi
```

### Kategori Konfigürasyonu
```typescript
const categories = [
  {
    id: 'booking',
    name: 'Booking',
    description: 'Sanatçı & DJ',
    icon: 'musical-notes',
    gradient: ['#9333EA', '#6366f1']
  },
  {
    id: 'technical',
    name: 'Teknik',
    description: 'Ses & Işık & Sahne',
    icon: 'volume-high',
    gradient: ['#059669', '#34d399']
  },
  // ... diğer kategoriler
];
```

---

## 🎨 TEMA VE RENK SİSTEMİ

### Dosya: `/src/theme/colors.ts`

### Brand Colors (Premium Purple)
```typescript
brand: {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',   // Primary active color
  500: '#a855f7',
  600: '#9333ea',   // Primary brand color
  700: '#7c3aed',
  800: '#6b21a8',
  900: '#581c87',
}
```

### Category Gradients
```typescript
gradients: {
  primary: ['#9333ea', '#7c3aed', '#6366f1'],
  booking: ['#9333EA', '#6366f1'],        // Mor
  technical: ['#059669', '#34d399'],       // Yeşil
  accommodation: ['#db2777', '#f472b6'],   // Pembe
  venue: ['#2563eb', '#60a5fa'],           // Mavi
  flight: ['#475569', '#94a3b8'],          // Gri
  transport: ['#dc2626', '#f87171'],       // Kırmızı
  operation: ['#d97706', '#fbbf24'],       // Turuncu
}
```

### Semantic Colors
```typescript
success: '#10b981',  // Yeşil
warning: '#f59e0b',  // Turuncu
error: '#ef4444',    // Kırmızı
info: '#3b82f6',     // Mavi
```

### Surface Colors (Dark Theme)
```typescript
background: '#09090b',      // Ana arka plan
surface: '#18181b',         // Kart arka planı
surfaceElevated: '#27272a', // Yükseltilmiş yüzey
border: 'rgba(255, 255, 255, 0.08)',
```

### Text Colors
```typescript
text: '#fafafa',            // Ana metin (beyaz)
textSecondary: '#a1a1aa',   // İkincil metin
textMuted: '#71717a',       // Soluk metin
```

### Zinc Scale
```typescript
zinc: {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b',
}
```

---

## 📐 STİL KALIPLARI

### Tab Button Stilleri
```typescript
// Horizontal Tab (Ana Sayfa tarzı)
tab: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.08)',
  gap: 4,
},
tabActive: {
  backgroundColor: 'rgba(147, 51, 234, 0.15)',
  borderColor: 'rgba(147, 51, 234, 0.3)',
},
tabText: {
  fontSize: 12,
  fontWeight: '500',
  color: colors.zinc[500],
},
tabTextActive: {
  color: colors.brand[400],
},
```

### Tab Container Stilleri
```typescript
// Doğru: marginBottom kullan
tabContainer: {
  flexDirection: 'row',
  paddingHorizontal: 20,
  marginBottom: 16,  // ✅ Sadece alt boşluk
  gap: 8,
},

// Yanlış: paddingVertical kullanma
tabContainer: {
  paddingVertical: 12,  // ❌ Tab alanını yükseltir
},
```

### Card Stilleri
```typescript
card: {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.05)',
},
```

### Header Stilleri
```typescript
header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingVertical: 16,
},
headerTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  color: colors.text,
},
```

---

## 🔀 AKIŞ SENARYOLARI

### Senaryo 1: Organizatör - Teknik Hizmet Teklifi Alma

```
1. HomeScreen (Organizatör)
   ↓ [Teknik kartına tıkla]

2. ServiceProvidersScreen (category: 'technical')
   ↓ [Provider seç]

3. ProviderDetailScreen
   ↓ [Teklif Al butonu]

4. RequestOfferScreen
   ↓ [Form doldur + Gönder]

5. OffersScreen (Gönderilen Teklifler)
   ↓ [Provider teklif gönderir]

6. OffersScreen (Gelen Teklifler)
   ↓ [Teklifi incele]

7. OfferDetailScreen
   ↓ [Onayla]

8. OrganizerEventsScreen (Etkinliğe hizmet eklendi)
```

### Senaryo 2: Provider - Gelen Teklif Talebi Yanıtlama

```
1. HomeScreen (Provider)
   ↓ [Gelen Teklif Talebi bildirimi]

2. OffersScreen (Gelen Talepler)
   ↓ [Talebi incele]

3. OfferDetailScreen
   ↓ [Teklif Ver butonu]

4. [Form: Fiyat, detaylar, koşullar]
   ↓ [Gönder]

5. OffersScreen (Gönderilen Teklifler)
   ↓ [Organizatör onaylar]

6. ProviderEventsScreen (Aktif İşlere eklendi)
```

### Senaryo 3: Etkinlik Oluşturma

```
1. HomeScreen
   ↓ [Etkinlik Oluştur kartına tıkla]

2. CreateEventScreen
   ↓ [Etkinlik bilgilerini doldur]
   ↓ [Hizmet kategorilerini seç]

3. OrganizerEventsScreen (Yeni etkinlik oluşturuldu)
   ↓ [Etkinliğe tıkla]

4. OrganizerEventDetailScreen
   ↓ [Hizmet durumlarını yönet]
   ↓ [Teklif Al butonları]
```

---

## 📍 İL-İLÇE SİSTEMİ

### Dosya: `/src/utils/cityData.ts`

```typescript
// 81 İl ve tüm ilçeleri
export const cityDistricts: Record<string, string[]> = {
  'İstanbul': ['Kadıköy', 'Beşiktaş', 'Şişli', ...],
  'Ankara': ['Çankaya', 'Keçiören', 'Yenimahalle', ...],
  'İzmir': ['Konak', 'Karşıyaka', 'Bornova', ...],
  // ... 81 il
};

// Sıralı il listesi
export const cities = Object.keys(cityDistricts).sort((a, b) =>
  a.localeCompare(b, 'tr')
);

// İlçeleri getir
export function getDistricts(cityName: string): string[] {
  return cityDistricts[cityName] || [];
}

// Popüler şehirler (hızlı seçim için)
export const popularCities = [
  'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa'
];
```

### Kullanım Örneği
```typescript
import { cities, getDistricts, popularCities } from '../utils/cityData';

// İl seçimi
const [selectedCity, setSelectedCity] = useState('');
const [selectedDistrict, setSelectedDistrict] = useState('');

// İlçeleri dinamik getir
const districts = getDistricts(selectedCity);

// Picker'da kullan
<Picker
  selectedValue={selectedCity}
  onValueChange={(value) => {
    setSelectedCity(value);
    setSelectedDistrict(''); // İlçeyi sıfırla
  }}
>
  {cities.map(city => (
    <Picker.Item key={city} label={city} value={city} />
  ))}
</Picker>
```

---

## 🎤 SANATÇI SİSTEMİ

### Dosya: `/src/utils/artistData.ts`

```typescript
export interface Artist {
  id: string;
  name: string;
  image?: string;
  genre?: string;
  // Rider dosyaları
  flightRiderFile?: string;
  flightRiderSize?: string;
  flightRiderDate?: string;
  technicalRiderFile?: string;
  technicalRiderSize?: string;
  technicalRiderDate?: string;
  accommodationRiderFile?: string;
  accommodationRiderSize?: string;
  accommodationRiderDate?: string;
  transportRiderFile?: string;
  transportRiderSize?: string;
  transportRiderDate?: string;
}

export const artists: Artist[] = [
  {
    id: '1',
    name: 'Mavi Gri',
    genre: 'Pop/Rock',
    image: 'https://...',
    technicalRiderFile: 'mavi_gri_technical_rider.pdf',
    // ...
  },
  // ...
];
```

---

## 💾 VERİ YAPILARI

### Event Interface
```typescript
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  city: string;
  district: string;
  venue: string;
  status: 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled';
  budget?: number;
  artistId?: string;
  artistName?: string;
  services: EventService[];
}
```

### EventService Interface
```typescript
export interface EventService {
  id: string;
  category: ServiceCategory;
  subCategory?: OperationSubCategory;
  providerId?: string;
  providerName?: string;
  status: 'pending' | 'requested' | 'offered' | 'confirmed' | 'completed';
  budget?: number;
}
```

### Offer Interface
```typescript
export interface Offer {
  id: string;
  eventId: string;
  eventTitle: string;
  providerId: string;
  providerName: string;
  category: ServiceCategory;
  subCategory?: OperationSubCategory;
  status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired';
  amount: number;
  description: string;
  createdAt: string;
  expiresAt: string;
}
```

### Provider Interface
```typescript
export interface Provider {
  id: string;
  name: string;
  category: ServiceCategory;
  subCategory?: OperationSubCategory;
  image?: string;
  rating: number;
  reviewCount: number;
  location: string;
  description?: string;
  verified: boolean;
  priceRange?: string;
  services?: string[];
}
```

---

## 📱 EKRAN YAPISI ŞABLONU

### Temel Screen Yapısı
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

export function MyScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Başlık</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tab1' && styles.tabActive]}
          onPress={() => setActiveTab('tab1')}
        >
          <Ionicons
            name={activeTab === 'tab1' ? 'list' : 'list-outline'}
            size={14}
            color={activeTab === 'tab1' ? colors.brand[400] : colors.zinc[500]}
          />
          <Text style={[styles.tabText, activeTab === 'tab1' && styles.tabTextActive]}>
            Tab 1
          </Text>
        </TouchableOpacity>
        {/* Diğer tablar... */}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* İçerik */}
        <View style={{ height: 100 }} />
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 4,
  },
  tabActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.zinc[500],
  },
  tabTextActive: {
    color: colors.brand[400],
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
```

---

## 🔔 BİLDİRİM SİSTEMİ

### Tab Badge
```typescript
<Tab.Screen
  name="OffersTab"
  component={OffersStack}
  options={{
    tabBarLabel: 'Teklifler',
    tabBarBadge: 3,  // Bildirim sayısı
    tabBarBadgeStyle: {
      backgroundColor: colors.brand[500],
      fontSize: 10,
      fontWeight: '700',
      minWidth: 18,
      height: 18,
      borderRadius: 9,
    },
  }}
/>
```

### Header Notification Badge
```typescript
<TouchableOpacity style={styles.notificationButton}>
  <Ionicons name="notifications-outline" size={20} color={colors.zinc[400]} />
  <View style={styles.notificationBadge}>
    <Text style={styles.notificationBadgeText}>3</Text>
  </View>
</TouchableOpacity>

// Stiller
notificationBadge: {
  position: 'absolute',
  top: -4,
  right: -4,
  backgroundColor: colors.error,
  width: 18,
  height: 18,
  borderRadius: 9,
  alignItems: 'center',
  justifyContent: 'center',
},
notificationBadgeText: {
  color: 'white',
  fontSize: 10,
  fontWeight: '700',
},
```

---

## 🎯 EN İYİ PRATİKLER

### 1. Mod Kontrolü
```typescript
// Her screen'de mod kontrolü yap
function MyScreen({ isProviderMode }: { isProviderMode: boolean }) {
  if (isProviderMode) {
    return <ProviderContent />;
  }
  return <OrganizerContent />;
}
```

### 2. Navigation
```typescript
// Type-safe navigation
const navigation = useNavigation<any>();

// Parametre ile navigate
navigation.navigate('ProviderDetail', { providerId: provider.id });

// Params alma
const route = useRoute<any>();
const { providerId } = route.params;
```

### 3. Safe Area
```typescript
// Her zaman SafeAreaView kullan
<SafeAreaView style={styles.container} edges={['top']}>
  {/* İçerik */}
</SafeAreaView>
```

### 4. ScrollView Bottom Padding
```typescript
// Bottom tab için alan bırak
<ScrollView>
  {/* İçerik */}
  <View style={{ height: 100 }} />
</ScrollView>
```

### 5. Gradient Kullanımı
```typescript
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../theme/colors';

<LinearGradient
  colors={gradients.booking}
  style={styles.gradientBox}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
>
  {/* İçerik */}
</LinearGradient>
```

### 6. Icon Tutarlılığı
```typescript
// Active: Filled icon
// Inactive: Outline icon
<Ionicons
  name={isActive ? 'calendar' : 'calendar-outline'}
  size={14}
  color={isActive ? colors.brand[400] : colors.zinc[500]}
/>
```

---

## 🐛 HATA YÖNETİMİ

### Loading State
```typescript
const [isLoading, setIsLoading] = useState(false);

if (isLoading) {
  return <LoadingIndicator />;
}
```

### Empty State
```typescript
import { EmptyState } from '../components';

{items.length === 0 && (
  <EmptyState
    icon="calendar-outline"
    title="Etkinlik yok"
    description="Henüz etkinlik oluşturmadınız"
    actionLabel="Etkinlik Oluştur"
    onAction={() => navigation.navigate('CreateEvent')}
  />
)}
```

---

## 📋 MOCK DATA YAPISI

### Dosya: `/src/data/mockData.ts`

```typescript
// Artists
export const artists = [
  { id: '1', name: 'Mabel Matiz', genre: 'Alternatif Pop', rating: 4.9, ... },
];

// Events
export const events = [
  { id: '1', title: 'Yaz Festivali 2024', status: 'planning', progress: 65, ... },
];

// Providers
export const providers = [
  { id: 'p1', name: 'Pro Sound Istanbul', category: 'technical', rating: 4.9, ... },
];

// Offers
export const offers = [
  { id: 'o1', eventId: '1', providerId: 'p1', status: 'pending', amount: 85000, ... },
];

// Conversations
export const conversations = [
  { id: 'c1', participantName: 'Pro Sound Istanbul', lastMessage: '...', unreadCount: 3, ... },
];

// Notifications
export const notifications = [
  { id: 'n1', type: 'offer', title: 'Yeni Teklif Alındı', read: false, ... },
];

// User Profile
export const userProfile = {
  id: 'u1', name: 'Sefa Çetin', role: 'organizer', ...
};

// Categories
export const categories = [
  { id: 'booking', name: 'Booking', icon: 'musical-notes', gradient: [...] },
];
```

---

## 🚀 GELİŞTİRİCİ NOTLARI

### Yeni Ekran Eklerken
1. `/src/screens/` altında dosya oluştur
2. `App.tsx`'te import et
3. İlgili Stack Navigator'a ekle
4. Navigation type'ı güncelle (opsiyonel)

### Yeni Kategori Eklerken
1. `/src/types/index.ts`'de ServiceCategory'ye ekle
2. `/src/theme/colors.ts`'de gradient ekle
3. `/src/data/mockData.ts`'de categories array'ine ekle
4. İlgili ekranlarda işle

### Debug İpuçları
```typescript
// Navigation state
console.log('Current route:', navigation.getState());

// Context state
const { isProviderMode } = useApp();
console.log('Provider Mode:', isProviderMode);
```

---

## 📱 RESPONSIVE TASARIM

### Boyutlar
- **Target:** iPhone 14 Pro (393 x 852)
- **Safe Area:** edges={['top']}
- **Tab Bar Height:** 52px
- **Standard Padding:** 20px horizontal

### Font Boyutları
```typescript
// Başlıklar
headerTitle: 24,      // Ana başlık
sectionTitle: 18,     // Bölüm başlığı
cardTitle: 16,        // Kart başlığı

// Metin
body: 14,             // Normal metin
small: 12,            // Küçük metin
caption: 10,          // Tab label, badge
```

---

## 📄 LİSANS VE VERSİYON

- **Versiyon:** 1.0.0
- **Expo SDK:** 54
- **React Native:** 0.76.x
- **Son Güncelleme:** Ocak 2025

---

*Bu dokümantasyon turing React Native uygulamasının mimarisini ve çalışma mantığını açıklar. Güncellemeler için CHANGELOG.md dosyasını kontrol edin.*
