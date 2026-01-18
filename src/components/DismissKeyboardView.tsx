import React from 'react';
import {
  TouchableWithoutFeedback,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface DismissKeyboardViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Simple wrapper that dismisses keyboard when tapped outside
 *
 * Usage:
 * <DismissKeyboardView>
 *   <TextInput />
 * </DismissKeyboardView>
 */
export function DismissKeyboardView({ children, style }: DismissKeyboardViewProps) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, style]}>{children}</View>
    </TouchableWithoutFeedback>
  );
}

interface KeyboardAwareViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Whether to also dismiss keyboard on tap */
  dismissOnTap?: boolean;
  /** Vertical offset for the KeyboardAvoidingView */
  keyboardVerticalOffset?: number;
  /** Extra padding at bottom when keyboard is visible */
  extraBottomPadding?: number;
}

/**
 * KeyboardAvoidingView wrapper with dismiss functionality
 *
 * Usage:
 * <KeyboardAwareView dismissOnTap>
 *   <ScrollView>
 *     <TextInput />
 *   </ScrollView>
 * </KeyboardAwareView>
 */
export function KeyboardAwareView({
  children,
  style,
  dismissOnTap = true,
  keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0,
  extraBottomPadding = 0,
}: KeyboardAwareViewProps) {
  const content = (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {children}
      {extraBottomPadding > 0 && <View style={{ height: extraBottomPadding }} />}
    </KeyboardAvoidingView>
  );

  if (dismissOnTap) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        {content}
      </TouchableWithoutFeedback>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
