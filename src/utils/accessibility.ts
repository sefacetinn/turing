import { AccessibilityInfo, Platform } from 'react-native';
import { useEffect, useState, useCallback } from 'react';

// Accessibility roles for semantic elements
export const a11yRoles = {
  button: 'button' as const,
  link: 'link' as const,
  header: 'header' as const,
  search: 'search' as const,
  image: 'image' as const,
  text: 'text' as const,
  adjustable: 'adjustable' as const,
  imagebutton: 'imagebutton' as const,
  keyboardkey: 'keyboardkey' as const,
  none: 'none' as const,
  menu: 'menu' as const,
  menubar: 'menubar' as const,
  menuitem: 'menuitem' as const,
  progressbar: 'progressbar' as const,
  radio: 'radio' as const,
  radiogroup: 'radiogroup' as const,
  scrollbar: 'scrollbar' as const,
  spinbutton: 'spinbutton' as const,
  switch: 'switch' as const,
  tab: 'tab' as const,
  tablist: 'tablist' as const,
  timer: 'timer' as const,
  toolbar: 'toolbar' as const,
  checkbox: 'checkbox' as const,
  combobox: 'combobox' as const,
  alert: 'alert' as const,
  grid: 'grid' as const,
  list: 'list' as const,
  summary: 'summary' as const,
};

// Hook to check if screen reader is enabled
export function useScreenReader(): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkScreenReader = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsEnabled(enabled);
    };

    checkScreenReader();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => setIsEnabled(enabled)
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return isEnabled;
}

// Hook to check if reduce motion is enabled
export function useReduceMotion(): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkReduceMotion = async () => {
      const enabled = await AccessibilityInfo.isReduceMotionEnabled();
      setIsEnabled(enabled);
    };

    checkReduceMotion();

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => setIsEnabled(enabled)
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return isEnabled;
}

// Hook to check if bold text is enabled
export function useBoldText(): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkBoldText = async () => {
      if (Platform.OS === 'ios') {
        const enabled = await AccessibilityInfo.isBoldTextEnabled();
        setIsEnabled(enabled);
      }
    };

    checkBoldText();

    if (Platform.OS === 'ios') {
      const subscription = AccessibilityInfo.addEventListener(
        'boldTextChanged',
        (enabled) => setIsEnabled(enabled)
      );

      return () => {
        subscription.remove();
      };
    }
  }, []);

  return isEnabled;
}

// Announce to screen reader
export function announce(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

// Set accessibility focus on an element
export function setFocus(reactTag: number): void {
  AccessibilityInfo.setAccessibilityFocus(reactTag);
}

// Generate accessibility props for buttons
interface ButtonA11yProps {
  label: string;
  hint?: string;
  disabled?: boolean;
  selected?: boolean;
}

export function getButtonA11yProps({
  label,
  hint,
  disabled = false,
  selected = false,
}: ButtonA11yProps) {
  return {
    accessible: true,
    accessibilityRole: 'button' as const,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: {
      disabled,
      selected,
    },
  };
}

// Generate accessibility props for links
interface LinkA11yProps {
  label: string;
  hint?: string;
}

export function getLinkA11yProps({ label, hint }: LinkA11yProps) {
  return {
    accessible: true,
    accessibilityRole: 'link' as const,
    accessibilityLabel: label,
    accessibilityHint: hint,
  };
}

// Generate accessibility props for images
interface ImageA11yProps {
  label: string;
  isDecorative?: boolean;
}

export function getImageA11yProps({ label, isDecorative = false }: ImageA11yProps) {
  if (isDecorative) {
    return {
      accessible: false,
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants' as const,
    };
  }

  return {
    accessible: true,
    accessibilityRole: 'image' as const,
    accessibilityLabel: label,
  };
}

// Generate accessibility props for headers
interface HeaderA11yProps {
  label: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function getHeaderA11yProps({ label, level = 1 }: HeaderA11yProps) {
  return {
    accessible: true,
    accessibilityRole: 'header' as const,
    accessibilityLabel: label,
    // Note: accessibilityLevel is not directly supported in RN
    // but we can use it for semantic meaning
  };
}

// Generate accessibility props for text inputs
interface InputA11yProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export function getInputA11yProps({
  label,
  hint,
  error,
  required = false,
}: InputA11yProps) {
  let accessibilityLabel = label;
  if (required) {
    accessibilityLabel += ', zorunlu alan';
  }
  if (error) {
    accessibilityLabel += `, hata: ${error}`;
  }

  return {
    accessible: true,
    accessibilityLabel,
    accessibilityHint: hint,
    accessibilityState: {
      disabled: false,
    },
  };
}

// Generate accessibility props for switches/toggles
interface SwitchA11yProps {
  label: string;
  checked: boolean;
  hint?: string;
}

export function getSwitchA11yProps({ label, checked, hint }: SwitchA11yProps) {
  return {
    accessible: true,
    accessibilityRole: 'switch' as const,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: {
      checked,
    },
  };
}

// Generate accessibility props for tabs
interface TabA11yProps {
  label: string;
  selected: boolean;
  index: number;
  total: number;
}

export function getTabA11yProps({ label, selected, index, total }: TabA11yProps) {
  return {
    accessible: true,
    accessibilityRole: 'tab' as const,
    accessibilityLabel: `${label}, sekme ${index + 1} / ${total}`,
    accessibilityState: {
      selected,
    },
  };
}

// Generate accessibility props for list items
interface ListItemA11yProps {
  label: string;
  hint?: string;
  index: number;
  total: number;
}

export function getListItemA11yProps({ label, hint, index, total }: ListItemA11yProps) {
  return {
    accessible: true,
    accessibilityLabel: `${label}, ${index + 1} / ${total}`,
    accessibilityHint: hint,
  };
}

// Generate accessibility props for progress indicators
interface ProgressA11yProps {
  label: string;
  value: number; // 0-100
}

export function getProgressA11yProps({ label, value }: ProgressA11yProps) {
  return {
    accessible: true,
    accessibilityRole: 'progressbar' as const,
    accessibilityLabel: `${label}, yüzde ${Math.round(value)}`,
    accessibilityValue: {
      min: 0,
      max: 100,
      now: value,
    },
  };
}

// Generate accessibility props for alerts/notifications
interface AlertA11yProps {
  message: string;
  isLiveRegion?: boolean;
}

export function getAlertA11yProps({ message, isLiveRegion = true }: AlertA11yProps) {
  return {
    accessible: true,
    accessibilityRole: 'alert' as const,
    accessibilityLabel: message,
    accessibilityLiveRegion: isLiveRegion ? ('polite' as const) : ('none' as const),
  };
}

// Format currency for screen readers
export function formatCurrencyForA11y(amount: number): string {
  const formatted = amount.toLocaleString('tr-TR');
  return `${formatted} Türk Lirası`;
}

// Format date for screen readers
export function formatDateForA11y(date: string): string {
  // Assuming date is in format "12 Ocak 2026"
  return date;
}

// Format time for screen readers
export function formatTimeForA11y(time: string): string {
  // Convert "14:30" to "14 30" for better reading
  return time.replace(':', ' ');
}

// Format phone number for screen readers
export function formatPhoneForA11y(phone: string): string {
  // Add spaces for digit-by-digit reading
  return phone.split('').join(' ');
}

// Semantic group wrapper props
export function getGroupA11yProps(label: string) {
  return {
    accessible: true,
    accessibilityRole: 'none' as const,
    accessibilityLabel: label,
  };
}

// Hide decorative elements from screen readers
export const decorativeA11yProps = {
  accessible: false,
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no-hide-descendants' as const,
};

// Make element accessible with combined children text
export const combineChildrenA11yProps = {
  accessible: true,
  accessibilityRole: 'text' as const,
};

/**
 * Common accessibility labels for Turkish UI
 */
export const A11Y_LABELS = {
  // Navigation
  BACK: 'Geri',
  CLOSE: 'Kapat',
  MENU: 'Menu',
  SETTINGS: 'Ayarlar',
  SEARCH: 'Ara',
  FILTER: 'Filtrele',
  SORT: 'Sirala',
  REFRESH: 'Yenile',
  MORE_OPTIONS: 'Daha fazla secenek',
  HOME: 'Ana Sayfa',
  PROFILE: 'Profil',
  NOTIFICATIONS: 'Bildirimler',

  // Common actions
  SUBMIT: 'Gonder',
  SAVE: 'Kaydet',
  CANCEL: 'Iptal',
  DELETE: 'Sil',
  EDIT: 'Duzenle',
  ADD: 'Ekle',
  SHARE: 'Paylas',
  COPY: 'Kopyala',
  DOWNLOAD: 'Indir',
  UPLOAD: 'Yukle',
  CONFIRM: 'Onayla',
  REJECT: 'Reddet',
  RETRY: 'Tekrar Dene',

  // Authentication
  LOGIN: 'Giris yap',
  LOGOUT: 'Cikis yap',
  REGISTER: 'Kayit ol',
  FORGOT_PASSWORD: 'Sifremi unuttum',
  SHOW_PASSWORD: 'Sifreyi goster',
  HIDE_PASSWORD: 'Sifreyi gizle',
  BIOMETRIC_LOGIN: 'Biyometrik giris',

  // Form elements
  EMAIL_INPUT: 'E-posta adresi',
  PASSWORD_INPUT: 'Sifre',
  NAME_INPUT: 'Ad Soyad',
  PHONE_INPUT: 'Telefon numarasi',
  SEARCH_INPUT: 'Arama alani',
  MESSAGE_INPUT: 'Mesaj alani',
  DATE_PICKER: 'Tarih secici',
  TIME_PICKER: 'Saat secici',

  // Status
  LOADING: 'Yukleniyor',
  ERROR: 'Hata',
  SUCCESS: 'Basarili',
  WARNING: 'Uyari',
  EMPTY: 'Bos',
  OFFLINE: 'Cevrimdisi',
  ONLINE: 'Cevrimici',

  // Media
  PLAY: 'Oynat',
  PAUSE: 'Duraklat',
  STOP: 'Durdur',
  MUTE: 'Sesi kapat',
  UNMUTE: 'Sesi ac',
  FULLSCREEN: 'Tam ekran',
  EXIT_FULLSCREEN: 'Tam ekrandan cik',

  // Lists & Content
  EMPTY_LIST: 'Liste bos',
  LOAD_MORE: 'Daha fazla yukle',
  PULL_TO_REFRESH: 'Yenilemek icin asagi cekin',
  NO_RESULTS: 'Sonuc bulunamadi',
  END_OF_LIST: 'Liste sonu',

  // Events & Bookings
  EVENT_CARD: 'Etkinlik karti',
  BOOKING_CARD: 'Rezervasyon karti',
  OFFER_CARD: 'Teklif karti',
  ARTIST_CARD: 'Sanatci karti',
  VENUE_CARD: 'Mekan karti',
  CREATE_EVENT: 'Etkinlik olustur',
  VIEW_DETAILS: 'Detaylari gor',
  SEND_OFFER: 'Teklif gonder',
  ACCEPT_OFFER: 'Teklifi kabul et',
  REJECT_OFFER: 'Teklifi reddet',

  // Chat
  SEND_MESSAGE: 'Mesaj gonder',
  ATTACH_FILE: 'Dosya ekle',
  VOICE_MESSAGE: 'Sesli mesaj',
  CHAT_INPUT: 'Mesaj yaz',

  // Favorites
  ADD_FAVORITE: 'Favorilere ekle',
  REMOVE_FAVORITE: 'Favorilerden kaldir',
  FAVORITE: 'Favori',
  NOT_FAVORITE: 'Favori degil',
};

/**
 * Common accessibility hints for Turkish UI
 */
export const A11Y_HINTS = {
  // Navigation
  OPENS_SCREEN: 'Yeni bir ekran acar',
  GOES_BACK: 'Onceki ekrana doner',
  OPENS_MENU: 'Menu acar',
  OPENS_MODAL: 'Acilan pencere gosterir',
  OPENS_LINK: 'Tarayicide acar',
  OPENS_CALL: 'Telefon uygulamasini acar',
  OPENS_EMAIL: 'E-posta uygulamasini acar',

  // Actions
  DOUBLE_TAP_TO_ACTIVATE: 'Etkinlestirmek icin iki kez dokun',
  DOUBLE_TAP_TO_TOGGLE: 'Degistirmek icin iki kez dokun',
  DOUBLE_TAP_TO_SELECT: 'Secmek icin iki kez dokun',
  SWIPE_TO_DELETE: 'Silmek icin sola kaydir',
  SWIPE_FOR_OPTIONS: 'Secenekler icin kaydirin',
  LONG_PRESS_FOR_OPTIONS: 'Secenekler icin uzun basin',
  PINCH_TO_ZOOM: 'Yakinlastirmak icin kistin',

  // Form
  REQUIRED_FIELD: 'Bu alan zorunludur',
  OPTIONAL_FIELD: 'Bu alan istege baglidir',
  ENTER_TEXT: 'Metin girin',
  SELECT_OPTION: 'Bir secenek secin',
  SELECT_DATE: 'Tarih secin',
  SELECT_TIME: 'Saat secin',
  CHARACTER_LIMIT: 'Karakter siniri',

  // Status
  LOADING_CONTENT: 'Icerik yukleniyor, lutfen bekleyin',
  REFRESHING: 'Icerik yenileniyor',
  SUBMITTING: 'Gonderiliyor',
  PROCESSING: 'Isleniyor',

  // Events
  TAP_FOR_EVENT_DETAILS: 'Etkinlik detaylari icin dokun',
  TAP_TO_VIEW_PROFILE: 'Profili gormek icin dokun',
  TAP_TO_START_CHAT: 'Sohbet baslatmak icin dokun',
  TAP_TO_SEND_OFFER: 'Teklif gondermek icin dokun',
};

/**
 * Hook to manage accessibility announcements
 */
export function useAccessibilityAnnouncement() {
  const announcePolite = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  const announceAssertive = useCallback((message: string) => {
    // For assertive announcements, we announce immediately
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  return { announcePolite, announceAssertive };
}

/**
 * Hook to check accessibility preferences
 */
export function useAccessibilityPreferences() {
  const isScreenReaderEnabled = useScreenReader();
  const isReduceMotionEnabled = useReduceMotion();
  const isBoldTextEnabled = useBoldText();

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    isBoldTextEnabled,
    shouldReduceMotion: isReduceMotionEnabled,
    shouldAnnounce: isScreenReaderEnabled,
  };
}
