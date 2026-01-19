# EventApp Kurulum Rehberi

Bu rehber, uygulamayı production ortamına hazırlamak için gereken adımları içerir.

## 1. Firebase Projesi Oluşturma

### Adım 1: Firebase Console'a Git
1. [Firebase Console](https://console.firebase.google.com/) adresine git
2. Google hesabınla giriş yap
3. "Proje Ekle" butonuna tıkla

### Adım 2: Proje Ayarları
1. Proje adı: `EventApp` veya istediğin bir isim
2. Google Analytics'i etkinleştir (opsiyonel)
3. "Proje Oluştur" butonuna tıkla

### Adım 3: Web Uygulaması Ekle
1. Proje ana sayfasında `</>` (Web) ikonuna tıkla
2. Uygulama adı: `EventApp Web`
3. Firebase Hosting'i şimdilik atlayabilirsin
4. "Uygulamayı kaydet" butonuna tıkla
5. Gösterilen `firebaseConfig` değerlerini kopyala

### Adım 4: .env Dosyasını Güncelle
Proje kök dizinindeki `.env` dosyasını aç ve Firebase değerlerini yapıştır:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=eventapp-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=eventapp-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=eventapp-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 2. Firebase Servislerini Etkinleştirme

### Authentication
1. Firebase Console > Authentication > Get Started
2. Sign-in method sekmesine git
3. Email/Password'ü etkinleştir
4. (Opsiyonel) Google Sign-In ekle

### Firestore Database
1. Firebase Console > Firestore Database > Create database
2. "Start in test mode" seç (production'da kuralları güncelle)
3. Konum seç: `eur3 (europe-west)` veya size yakın bir bölge

### Storage
1. Firebase Console > Storage > Get Started
2. "Start in test mode" seç
3. Konum otomatik seçilecek

## 3. Firestore Güvenlik Kuralları

Production için güvenlik kurallarını güncelle:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcı profilleri
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Etkinlikler
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        resource.data.organizerId == request.auth.uid;
    }

    // Provider'lar
    match /providers/{providerId} {
      allow read: if true;
      allow write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Sanatçılar
    match /artists/{artistId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Teklifler
    match /offers/{offerId} {
      allow read: if request.auth != null && (
        resource.data.organizerId == request.auth.uid ||
        resource.data.providerId == request.auth.uid
      );
      allow create: if request.auth != null;
      allow update: if request.auth != null && (
        resource.data.organizerId == request.auth.uid ||
        resource.data.providerId == request.auth.uid
      );
    }

    // Mesajlar
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;
    }

    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 4. EAS Build Yapılandırması

### Expo Hesabı
1. [Expo](https://expo.dev/) hesabı oluştur
2. Terminal'de giriş yap:
```bash
npx eas-cli login
```

### Proje Yapılandırması
```bash
npx eas-cli build:configure
```

### Build Alma

#### Preview Build (Test için)
```bash
# iOS
npx eas-cli build --platform ios --profile preview

# Android
npx eas-cli build --platform android --profile preview
```

#### Production Build
```bash
# iOS (App Store)
npx eas-cli build --platform ios --profile production

# Android (Play Store)
npx eas-cli build --platform android --profile production
```

## 5. App Store Gereksinimleri

### iOS (App Store Connect)
- Apple Developer Program üyeliği ($99/yıl)
- App Store Connect'te uygulama oluştur
- App icons (1024x1024)
- Screenshots (6.5", 5.5" iPhone)
- Privacy Policy URL
- App Description (Türkçe/İngilizce)

### Android (Google Play Console)
- Google Play Developer hesabı ($25 tek seferlik)
- Play Console'da uygulama oluştur
- App icons (512x512)
- Feature graphic (1024x500)
- Screenshots
- Privacy Policy URL
- App Description

## 6. Ortam Değişkenleri

Production için EAS Secrets kullan:
```bash
npx eas-cli secret:create --name FIREBASE_API_KEY --value "your-api-key"
npx eas-cli secret:create --name FIREBASE_PROJECT_ID --value "your-project-id"
# ... diğer değişkenler
```

## 7. Demo Verileri Yükleme

Development ortamında demo verileri yüklemek için:

```typescript
import { seedAll } from './src/services/firebase';

// Bir kez çalıştır
seedAll().then(() => console.log('Demo veriler yüklendi!'));
```

## Sorun Giderme

### Firebase Bağlantı Hatası
- `.env` dosyasındaki değerlerin doğruluğunu kontrol et
- Firebase Console'da servislerin etkin olduğundan emin ol

### Build Hatası
- `npx expo-doctor` çalıştır
- Node modüllerini temizle: `rm -rf node_modules && npm install`

### Authentication Hatası
- Firebase Console'da Email/Password'ün etkin olduğunu kontrol et
- Authorized domains listesine localhost ekle

---

Sorularınız için: [GitHub Issues](https://github.com/your-repo/issues)
