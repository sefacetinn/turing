import { OnboardingSlide, RegistrationStep } from '../types/auth';

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: "turing'e Hoş Geldiniz",
    description: 'Etkinlik ve müzik sektörünün buluşma noktası',
    icon: 'musical-notes',
    gradient: ['#4b30b8', '#a855f7'],
  },
  {
    id: '2',
    title: 'Kolayca Teklif Alın',
    description: 'Sanatçı, teknik ekipman, mekan - tek platformda',
    icon: 'document-text',
    gradient: ['#059669', '#34d399'],
  },
  {
    id: '3',
    title: 'Güvenli ve Hızlı',
    description: 'Onaylı sağlayıcılar, dijital sözleşmeler',
    icon: 'shield-checkmark',
    gradient: ['#2563eb', '#60a5fa'],
  },
  {
    id: '4',
    title: 'Başlayalım!',
    description: 'Organizatör veya sağlayıcı olarak kaydolun',
    icon: 'rocket',
    gradient: ['#db2777', '#f472b6'],
  },
];

export const ORGANIZER_STEPS: RegistrationStep[] = [
  {
    id: 'basic',
    title: 'Temel Bilgiler',
    description: 'Ad, email ve telefon bilgileriniz',
  },
  {
    id: 'company',
    title: 'Firma Bilgileri',
    description: 'Opsiyonel firma bilgileri',
  },
  {
    id: 'email-verify',
    title: 'Email Doğrulama',
    description: '6 haneli doğrulama kodu',
  },
  {
    id: 'phone-verify',
    title: 'Telefon Doğrulama',
    description: 'SMS doğrulama kodu',
  },
  {
    id: 'password',
    title: 'Şifre Belirleme',
    description: 'Güvenli şifrenizi oluşturun',
  },
];

export const PROVIDER_STEPS: RegistrationStep[] = [
  {
    id: 'basic',
    title: 'Temel Bilgiler',
    description: 'Ad, email ve telefon bilgileriniz',
  },
  {
    id: 'company',
    title: 'Firma Bilgileri',
    description: 'Firma adı, vergi no ve adres',
  },
  {
    id: 'documents',
    title: 'Belgeler',
    description: 'Vergi levhası ve imza sirküleri',
  },
  {
    id: 'bank',
    title: 'Banka Bilgileri',
    description: 'IBAN bilgisi (opsiyonel)',
  },
  {
    id: 'category',
    title: 'Hizmet Kategorisi',
    description: 'Verdiğiniz hizmetler',
  },
  {
    id: 'address',
    title: 'Adres Bilgileri',
    description: 'İl, ilçe ve tam adres',
  },
  {
    id: 'email-verify',
    title: 'Email Doğrulama',
    description: '6 haneli doğrulama kodu',
  },
  {
    id: 'phone-verify',
    title: 'Telefon Doğrulama',
    description: 'SMS doğrulama kodu',
  },
  {
    id: 'password',
    title: 'Şifre Belirleme',
    description: 'Güvenli şifrenizi oluşturun',
  },
];

export const SERVICE_CATEGORIES = [
  { id: 'booking', name: 'Sanatçı / DJ', icon: 'musical-notes' },
  { id: 'technical', name: 'Teknik Ekipman', icon: 'hardware-chip' },
  { id: 'venue', name: 'Mekan', icon: 'business' },
  { id: 'accommodation', name: 'Konaklama', icon: 'bed' },
  { id: 'transport', name: 'Ulaşım', icon: 'car' },
  { id: 'flight', name: 'Uçuş', icon: 'airplane' },
  { id: 'catering', name: 'Catering', icon: 'restaurant' },
  { id: 'operation', name: 'Operasyon', icon: 'construct' },
];

export const CITIES = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Antalya',
  'Bursa',
  'Adana',
  'Gaziantep',
  'Konya',
  'Mersin',
  'Diyarbakır',
  'Kayseri',
  'Eskişehir',
  'Samsun',
  'Denizli',
  'Şanlıurfa',
  'Malatya',
  'Trabzon',
  'Muğla',
  'Aydın',
  'Balıkesir',
];

export const ISTANBUL_DISTRICTS = [
  'Kadıköy',
  'Beşiktaş',
  'Şişli',
  'Beyoğlu',
  'Bakırköy',
  'Ataşehir',
  'Üsküdar',
  'Maltepe',
  'Kartal',
  'Pendik',
  'Sarıyer',
  'Beykoz',
  'Fatih',
  'Zeytinburnu',
  'Bahçelievler',
  'Bağcılar',
  'Küçükçekmece',
  'Başakşehir',
  'Sultanbeyli',
  'Ümraniye',
];
