# Provider Hizmet Türlerine Göre Özellik Planı

## Genel Bakış

Her hizmet sağlayıcı türü için özel ekranlar ve özellikler eklenerek, sektöre özgü iş süreçleri desteklenecektir.

---

## 1. BOOKING (Sanatçı/DJ Booking) Providers

### Özel Ekranlar:
1. **ArtistRosterScreen** - Sanatçı Kadrosu Yönetimi
   - Sanatçı listesi (isim, tür, fiyat aralığı, rating)
   - Sanatçı ekleme/düzenleme
   - Sanatçı profili detayları
   - Medya galerisi (fotoğraf, video)

2. **ArtistAvailabilityScreen** - Sanatçı Müsaitlik Takvimi
   - Takvim görünümü
   - Sanatçı bazlı müsaitlik
   - Rezervasyon durumları (onaylı, beklemede, iptal)

3. **BookingContractsScreen** - Sözleşme Yönetimi
   - Sözleşme şablonları
   - Aktif sözleşmeler
   - Sözleşme geçmişi

### Dashboard Widget'ları:
- Yaklaşan performanslar
- Aktif sözleşme sayısı
- Aylık rezervasyon grafiği
- En çok talep edilen sanatçılar

---

## 2. TECHNICAL (Ses/Işık/Sahne) Providers

### Özel Ekranlar:
1. **EquipmentInventoryScreen** - Ekipman Envanteri
   - Kategorize ekipman listesi (ses, ışık, sahne, kablo)
   - Stok durumu (müsait, kiralanmış, bakımda)
   - Ekipman detayları (marka, model, seri no)
   - QR kod ile ekipman takibi

2. **TechnicalRiderScreen** - Teknik Rider Yönetimi
   - Rider şablonları
   - Etkinlik bazlı rider oluşturma
   - Güç gereksinimleri hesaplama

3. **MaintenanceScreen** - Bakım Takibi
   - Planlı bakımlar
   - Bakım geçmişi
   - Arıza raporları

### Dashboard Widget'ları:
- Ekipman kullanım durumu (pasta grafik)
- Yaklaşan bakımlar
- Kiralama takvimi
- Ekipman değeri özeti

---

## 3. VENUE (Mekan) Providers

### Özel Ekranlar:
1. **VenueAvailabilityScreen** - Mekan Müsaitlik Takvimi
   - Takvim görünümü (gün/hafta/ay)
   - Rezervasyon yönetimi
   - Fiyatlandırma (hafta içi/sonu, sezon)

2. **VenueLayoutScreen** - Mekan Düzeni
   - Kat planları
   - Oturma düzeni seçenekleri
   - Kapasite hesaplama

3. **VenueAmenitiesScreen** - Mekan Özellikleri
   - Mevcut ekipmanlar
   - Teknik altyapı
   - Ek hizmetler

### Dashboard Widget'ları:
- Doluluk oranı
- Yaklaşan etkinlikler
- Gelir grafiği
- Popüler düzen türleri

---

## 4. CATERING Providers

### Özel Ekranlar:
1. **MenuManagementScreen** - Menü Yönetimi
   - Menü kategorileri (aperatif, ana yemek, tatlı, içecek)
   - Menü öğeleri (isim, fiyat, alerjen bilgisi)
   - Paket menüler oluşturma
   - Diyet seçenekleri (vegan, glutensiz, helal)

2. **CateringCapacityScreen** - Kapasite Planlama
   - Günlük maksimum kişi kapasitesi
   - Mutfak ekibi yönetimi
   - Malzeme stok takibi

3. **CateringCalendarScreen** - Etkinlik Takvimi
   - Catering takvimi
   - Hazırlık timeline'ı
   - Teslimat planlaması

### Dashboard Widget'ları:
- Aktif siparişler
- Popüler menüler
- Kapasite doluluk
- Malzeme uyarıları

---

## 5. TRANSPORT (Ulaşım) Providers

### Özel Ekranlar:
1. **FleetManagementScreen** - Araç Filosu Yönetimi
   - Araç listesi (tip, marka, model, plaka)
   - Araç durumu (müsait, görevde, bakımda)
   - Araç özellikleri (koltuk sayısı, özellikler)

2. **DriverManagementScreen** - Şoför Yönetimi
   - Şoför listesi
   - Ehliyet ve belge takibi
   - Çalışma saatleri

3. **TripPlanningScreen** - Rota Planlama
   - Aktif transferler
   - Rota optimizasyonu
   - Zaman tahmini

### Dashboard Widget'ları:
- Filo durumu özeti
- Aktif transferler
- Şoför müsaitliği
- Kilometre/yakıt takibi

---

## 6. SECURITY (Güvenlik) Providers

### Özel Ekranlar:
1. **PersonnelManagementScreen** - Personel Yönetimi
   - Güvenlik personeli listesi
   - Yetkinlikler (silahlı, sivil, VIP koruma)
   - Belge takibi (güvenlik sertifikası, sağlık raporu)

2. **ShiftSchedulingScreen** - Vardiya Planlama
   - Vardiya takvimi
   - Personel atamaları
   - Fazla mesai takibi

3. **IncidentReportScreen** - Olay Raporları
   - Olay kayıtları
   - Rapor oluşturma
   - İstatistikler

### Dashboard Widget'ları:
- Aktif personel sayısı
- Bugünkü vardiyalar
- Yaklaşan görevler
- Olay özeti

---

## 7. ACCOMMODATION (Konaklama) Providers

### Özel Ekranlar:
1. **RoomInventoryScreen** - Oda Envanteri
   - Oda tipleri (single, double, suite)
   - Oda özellikleri
   - Fiyatlandırma

2. **ReservationCalendarScreen** - Rezervasyon Takvimi
   - Doluluk takvimi
   - Oda bazlı görünüm
   - Grup rezervasyonları

### Dashboard Widget'ları:
- Doluluk oranı
- Bugünkü giriş/çıkışlar
- Gelir özeti

---

## 8. MEDIA & PRODUCTION Providers

### Özel Ekranlar:
1. **PortfolioManagementScreen** - Portfolyo Yönetimi
   - Proje galerisi
   - Video showreel
   - Kategorize çalışmalar

2. **ProjectWorkflowScreen** - Proje Akışı
   - Aktif projeler
   - Çekim takvimi
   - Teslimat timeline'ı
   - Düzenleme aşamaları

3. **MediaEquipmentScreen** - Ekipman Yönetimi
   - Kamera/lens envanteri
   - Drone ekipmanları
   - Kurgu istasyonları

### Dashboard Widget'ları:
- Aktif projeler
- Teslimat bekleyenler
- Ekipman durumu
- Yaklaşan çekimler

---

## Uygulama Önceliği

### Faz 1 (Öncelikli):
1. EquipmentInventoryScreen (Technical) - En kritik
2. ArtistRosterScreen (Booking) - Mevcut yapıyı genişlet
3. MenuManagementScreen (Catering) - Yüksek kullanım

### Faz 2:
4. FleetManagementScreen (Transport)
5. PersonnelManagementScreen (Security)
6. VenueAvailabilityScreen (Venue)

### Faz 3:
7. Diğer ekranlar ve detay sayfaları

---

## Teknik Notlar

### Dosya Yapısı:
```
src/
├── screens/
│   └── provider/
│       ├── booking/
│       │   ├── ArtistRosterScreen.tsx
│       │   └── ArtistAvailabilityScreen.tsx
│       ├── technical/
│       │   ├── EquipmentInventoryScreen.tsx
│       │   └── MaintenanceScreen.tsx
│       ├── catering/
│       │   └── MenuManagementScreen.tsx
│       ├── transport/
│       │   └── FleetManagementScreen.tsx
│       ├── security/
│       │   └── PersonnelManagementScreen.tsx
│       └── venue/
│           └── VenueAvailabilityScreen.tsx
├── data/
│   └── provider/
│       ├── artistData.ts
│       ├── equipmentData.ts
│       ├── menuData.ts
│       ├── fleetData.ts
│       └── personnelData.ts
└── components/
    └── provider/
        ├── ArtistCard.tsx
        ├── EquipmentCard.tsx
        └── ...
```

### Navigation Entegrasyonu:
- Provider Dashboard'a kategori bazlı menü eklenecek
- Alt navigasyonda "İşletme" tab'ı eklenecek
- Her provider türü kendi ekranlarına erişebilecek
