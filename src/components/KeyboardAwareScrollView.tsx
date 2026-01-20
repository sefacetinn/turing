import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  Keyboard,
  Platform,
  Animated,
  TextInput,
  findNodeHandle,
  UIManager,
  KeyboardEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  /** Extra padding to add at the bottom when keyboard is visible */
  extraScrollHeight?: number;
  /** Enable automatic scrolling to focused input */
  enableAutoScroll?: boolean;
  /** Offset from the top of keyboard to the focused input */
  keyboardOpeningTime?: number;
  /** Whether this is inside a modal */
  isModal?: boolean;
  /** Reset scroll position when keyboard closes */
  resetScrollOnKeyboardHide?: boolean;
  /** Callback when keyboard shows */
  onKeyboardShow?: (keyboardHeight: number) => void;
  /** Callback when keyboard hides */
  onKeyboardHide?: () => void;
  /** Inner content container style */
  innerContainerStyle?: ScrollViewProps['contentContainerStyle'];
}

export function KeyboardAwareScrollView({
  children,
  extraScrollHeight = 80,
  enableAutoScroll = true,
  keyboardOpeningTime = 250,
  isModal = false,
  resetScrollOnKeyboardHide = false,
  onKeyboardShow,
  onKeyboardHide,
  innerContainerStyle,
  contentContainerStyle,
  style,
  ...props
}: KeyboardAwareScrollViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardHeightAnim = useRef(new Animated.Value(0)).current;
  const currentlyFocusedInput = useRef<number | null>(null);
  const scrollPosition = useRef(0);
  const contentHeight = useRef(0);
  const scrollViewHeight = useRef(0);

  // Track scroll position
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollPosition.current = event.nativeEvent.contentOffset.y;
    props.onScroll?.(event);
  }, [props.onScroll]);

  // Track content size
  const handleContentSizeChange = useCallback((width: number, height: number) => {
    contentHeight.current = height;
    props.onContentSizeChange?.(width, height);
  }, [props.onContentSizeChange]);

  // Track scroll view size
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    scrollViewHeight.current = event.nativeEvent.layout.height;
    props.onLayout?.(event);
  }, [props.onLayout]);

  // Get position of currently focused input
  const getInputPosition = useCallback((inputRef: number): Promise<{ x: number; y: number; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const scrollViewNode = findNodeHandle(scrollViewRef.current);
      if (!scrollViewNode) {
        reject(new Error('ScrollView not found'));
        return;
      }

      UIManager.measureLayout(
        inputRef,
        scrollViewNode,
        () => reject(new Error('Failed to measure layout')),
        (x, y, width, height) => resolve({ x, y, width, height })
      );
    });
  }, []);

  // Scroll to focused input
  const scrollToInput = useCallback(async (inputRef: number, keyboardH: number) => {
    if (!scrollViewRef.current || !enableAutoScroll) return;

    try {
      const inputPosition = await getInputPosition(inputRef);
      const inputBottom = inputPosition.y + inputPosition.height;
      const visibleHeight = scrollViewHeight.current - keyboardH;

      // Check if input is below the visible area
      if (inputBottom > visibleHeight + scrollPosition.current) {
        const scrollTo = inputBottom - visibleHeight + extraScrollHeight;

        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, scrollTo),
            animated: true,
          });
        }, keyboardOpeningTime);
      }
    } catch (error) {
      // Fallback: just add some scroll
      console.log('Could not measure input position');
    }
  }, [enableAutoScroll, extraScrollHeight, keyboardOpeningTime, getInputPosition]);

  // Handle keyboard show
  const handleKeyboardShow = useCallback((event: KeyboardEvent) => {
    const kbHeight = event.endCoordinates.height;
    setKeyboardHeight(kbHeight);
    setIsKeyboardVisible(true);

    Animated.timing(keyboardHeightAnim, {
      toValue: kbHeight,
      duration: event.duration || 250,
      useNativeDriver: false,
    }).start();

    onKeyboardShow?.(kbHeight);

    // Find currently focused input and scroll to it
    const focusedInput = TextInput.State.currentlyFocusedInput?.();
    if (focusedInput) {
      const nodeHandle = findNodeHandle(focusedInput as any);
      if (nodeHandle) {
        currentlyFocusedInput.current = nodeHandle;
        scrollToInput(nodeHandle, kbHeight);
      }
    }
  }, [keyboardHeightAnim, onKeyboardShow, scrollToInput]);

  // Handle keyboard hide
  const handleKeyboardHide = useCallback((event: KeyboardEvent) => {
    setKeyboardHeight(0);
    setIsKeyboardVisible(false);
    currentlyFocusedInput.current = null;

    Animated.timing(keyboardHeightAnim, {
      toValue: 0,
      duration: event.duration || 250,
      useNativeDriver: false,
    }).start();

    onKeyboardHide?.();

    if (resetScrollOnKeyboardHide) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [keyboardHeightAnim, onKeyboardHide, resetScrollOnKeyboardHide]);

  // Setup keyboard listeners
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [handleKeyboardShow, handleKeyboardHide]);

  // Listen for focus changes on text inputs
  useEffect(() => {
    if (!enableAutoScroll) return;

    const subscription = Keyboard.addListener('keyboardDidShow', () => {
      // Re-check focused input after keyboard is fully shown
      const focusedInput = TextInput.State.currentlyFocusedInput?.();
      if (focusedInput && isKeyboardVisible) {
        const nodeHandle = findNodeHandle(focusedInput as any);
        if (nodeHandle && nodeHandle !== currentlyFocusedInput.current) {
          currentlyFocusedInput.current = nodeHandle;
          scrollToInput(nodeHandle, keyboardHeight);
        }
      }
    });

    return () => subscription.remove();
  }, [enableAutoScroll, isKeyboardVisible, keyboardHeight, scrollToInput]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={style}
      contentContainerStyle={[
        contentContainerStyle,
        innerContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={props.showsVerticalScrollIndicator ?? false}
      onScroll={handleScroll}
      onContentSizeChange={handleContentSizeChange}
      onLayout={handleLayout}
      scrollEventThrottle={16}
      {...props}
    >
      {children}
      {/* Dynamic bottom padding for keyboard */}
      <Animated.View
        style={{
          height: keyboardHeightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        }}
      />
      {/* Extra padding for safe area and tab bar */}
      <View style={{ height: isKeyboardVisible ? extraScrollHeight : 100 }} />
    </ScrollView>
  );
}

interface KeyboardAwareContainerProps {
  children: React.ReactNode;
  style?: any;
}

/**
 * Simple container that adds bottom padding when keyboard is visible
 * Use this when you don't need scrolling but need keyboard awareness
 */
export function KeyboardAwareContainer({ children, style }: KeyboardAwareContainerProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const paddingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      Animated.timing(paddingAnim, {
        toValue: event.endCoordinates.height,
        duration: event.duration || 250,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (event) => {
      setKeyboardHeight(0);
      Animated.timing(paddingAnim, {
        toValue: 0,
        duration: event.duration || 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <Animated.View style={[styles.container, style, { paddingBottom: paddingAnim }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
