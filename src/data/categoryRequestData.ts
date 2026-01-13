import { gradients } from '../theme/colors';

// Category configurations
export const categoryConfig: Record<string, { title: string; icon: string; gradient: readonly [string, string, ...string[]] }> = {
  booking: { title: 'Sanatçı / DJ Talebi', icon: 'musical-notes', gradient: gradients.booking },
  technical: { title: 'Teknik Ekipman Talebi', icon: 'volume-high', gradient: gradients.technical },
  venue: { title: 'Mekan Talebi', icon: 'business', gradient: gradients.venue },
  accommodation: { title: 'Konaklama Talebi', icon: 'bed', gradient: gradients.accommodation },
  transport: { title: 'Ulaşım Talebi', icon: 'car', gradient: gradients.transport },
  flight: { title: 'Uçuş Talebi', icon: 'airplane', gradient: gradients.flight },
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
export const userEvents = [
  { id: 'e1', title: 'Yaz Festivali 2024', date: '15 Temmuz 2024', location: 'İstanbul' },
  { id: 'e2', title: 'Kurumsal Gala', date: '22 Ağustos 2024', location: 'Ankara' },
  { id: 'e3', title: 'Düğün Organizasyonu', date: '1 Eylül 2024', location: 'İzmir' },
];

// Category-specific options
export const categoryOptions = {
  booking: {
    eventTypes: ['Konser', 'Festival', 'Kurumsal', 'Düğün', 'Özel Parti', 'Kulüp'],
    venueTypes: ['Açık Alan', 'Kapalı Alan', 'Stadyum', 'Sahil', 'Otel', 'Konferans'],
    guestCounts: ['< 100', '100-500', '500-1000', '1000-5000', '5000+'],
    durations: ['30 dk', '45 dk', '60 dk', '90 dk', '120 dk', 'Özel'],
    setCounts: ['1 Set', '2 Set', '3 Set'],
  },
  technical: {
    venueTypes: ['Açık Alan', 'Kapalı Alan', 'Yarı Açık'],
    venueSizes: ['Küçük (< 200m²)', 'Orta (200-500m²)', 'Büyük (500-1000m²)', 'Çok Büyük (1000m²+)'],
    soundRequirements: ['Line Array', 'Point Source', 'Subwoofer', 'Sahne Monitör', 'In-Ear Monitör', 'DJ Mixer', 'Mikrofon Seti'],
    lightingRequirements: ['Moving Head', 'LED Par', 'LED Bar', 'Lazer', 'Sis Makinesi', 'Strobo', 'Follow Spot'],
    stageSizes: ['Yok', '4x3m', '6x4m', '8x6m', '10x8m', '12x10m', 'Özel'],
    powerOptions: ['32A', '63A', '125A', 'Bilmiyorum', 'Jeneratör Gerekli'],
    setupTimes: ['2 saat', '4 saat', '1 gün', '2 gün'],
  },
  venue: {
    styles: ['Otel', 'Restoran', 'Bahçe', 'Teras', 'Konferans', 'Tarihi Mekan', 'Sahil', 'Çiftlik'],
    capacities: ['< 50', '50-100', '100-200', '200-500', '500-1000', '1000+'],
    areaTypes: ['Açık Alan', 'Kapalı Alan', 'Her İkisi', 'Farketmez'],
  },
  transport: {
    vehicleTypes: ['Sedan', 'Van', 'Minibüs', 'Otobüs', 'VIP', 'Lüks'],
    passengerCounts: ['1-3', '4-7', '8-15', '16-30', '30+'],
  },
  accommodation: {
    roomTypes: ['Standart', 'Deluxe', 'Suite', 'Presidential'],
    starRatings: ['3 Yıldız', '4 Yıldız', '5 Yıldız', 'Butik'],
    roomCounts: ['1', '2-5', '6-10', '11-20', '20+'],
  },
  flight: {
    classes: ['Ekonomi', 'Business', 'First'],
    baggageOptions: ['Kabin', 'Kabin + 20kg', 'Kabin + 30kg', 'Ekstra Bagaj'],
  },
  security: {
    areas: ['Giriş', 'Sahne', 'VIP', 'Backstage', 'Otopark', 'Çevre'],
    guardCounts: ['1-5', '6-10', '11-20', '21-50', '50+'],
    shiftOptions: ['8 saat', '12 saat', '24 saat'],
  },
  catering: {
    mealTypes: ['Kahvaltı', 'Öğle', 'Akşam', 'Kokteyl', 'Çay-Kahve'],
    dietaryOptions: ['Vejetaryen', 'Vegan', 'Helal', 'Glütensiz', 'Şekersiz'],
    serviceStyles: ['Büfe', 'Masaya Servis', 'Kokteyl', 'Canape'],
  },
  generator: {
    powerLevels: ['10 kVA', '20 kVA', '50 kVA', '100 kVA', '200+ kVA'],
    durations: ['4 saat', '8 saat', '12 saat', '24 saat', 'Sürekli'],
  },
  beverage: {
    barTypes: ['Mobil Bar', 'Sabit Bar', 'VIP Bar', 'Kokteyl İstasyonu'],
    beverageTypes: ['Alkolsüz', 'Bira', 'Şarap', 'Kokteyl', 'Premium İçecekler'],
    bartenderCounts: ['1', '2', '3-4', '5+'],
  },
  medical: {
    services: ['İlk Yardım', 'Revir', 'Paramedik', 'Doktor', 'Ambulans'],
  },
  media: {
    services: ['Fotoğraf', 'Video', 'Drone', 'Canlı Yayın', 'Sosyal Medya'],
    deliveryFormats: ['Dijital', 'Ham Görüntü', 'Düzenlenmiş', 'Anlık Paylaşım'],
  },
  barrier: {
    types: ['Crowd Barrier', 'VIP Bariyer', 'Metal Bariyer', 'Halat Bariyer'],
    lengths: ['10-25m', '25-50m', '50-100m', '100-200m', '200m+'],
  },
  tent: {
    sizes: ['3x3m', '6x6m', '10x10m', '15x15m', '20x20m', 'Özel'],
    types: ['Şeffaf', 'Kapalı', 'Yarı Açık', 'Pagoda'],
    features: ['Klima', 'Isıtma', 'Zemin', 'Aydınlatma', 'Yan Panel'],
  },
  ticketing: {
    capacities: ['< 500', '500-1000', '1000-5000', '5000-10000', '10000+'],
    ticketTypes: ['Genel Giriş', 'Numaralı', 'VIP', 'Backstage'],
    techOptions: ['Barkod', 'QR Kod', 'RFID', 'Mobil Bilet'],
  },
  decoration: {
    themes: ['Modern', 'Klasik', 'Rustik', 'Bohem', 'Minimalist', 'Tematik'],
    areas: ['Giriş', 'Sahne', 'Masa', 'Tavan', 'Dış Mekan'],
  },
  production: {
    services: ['Sahne Yönetimi', 'Teknik Yönetim', 'Prodüksiyon Asistanı', 'Stage Manager', 'Backline'],
    crewSizes: ['1-3', '4-6', '7-10', '10+'],
  },
};
