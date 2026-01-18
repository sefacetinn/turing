import { useState, useEffect } from 'react';
import { Keyboard, KeyboardEvent, Platform, Dimensions } from 'react-native';

interface KeyboardInfo {
  isVisible: boolean;
  keyboardHeight: number;
  keyboardAnimationDuration: number;
}

/**
 * Hook to track keyboard visibility and dimensions
 *
 * Usage:
 * const { isVisible, keyboardHeight } = useKeyboard();
 */
export function useKeyboard(): KeyboardInfo {
  const [keyboardInfo, setKeyboardInfo] = useState<KeyboardInfo>({
    isVisible: false,
    keyboardHeight: 0,
    keyboardAnimationDuration: 250,
  });

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleKeyboardShow = (event: KeyboardEvent) => {
      setKeyboardInfo({
        isVisible: true,
        keyboardHeight: event.endCoordinates.height,
        keyboardAnimationDuration: event.duration || 250,
      });
    };

    const handleKeyboardHide = (event: KeyboardEvent) => {
      setKeyboardInfo({
        isVisible: false,
        keyboardHeight: 0,
        keyboardAnimationDuration: event.duration || 250,
      });
    };

    const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardInfo;
}

/**
 * Dismiss the keyboard
 */
export function dismissKeyboard() {
  Keyboard.dismiss();
}

/**
 * Get the keyboard avoiding behavior based on platform
 */
export function getKeyboardBehavior(): 'padding' | 'height' | 'position' {
  return Platform.OS === 'ios' ? 'padding' : 'height';
}

/**
 * Get the vertical offset for KeyboardAvoidingView
 * Accounts for header height if present
 */
export function getKeyboardVerticalOffset(hasHeader: boolean = false): number {
  if (Platform.OS === 'ios') {
    return hasHeader ? 88 : 0; // iOS nav bar height
  }
  return 0;
}
