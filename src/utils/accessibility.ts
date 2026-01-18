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
