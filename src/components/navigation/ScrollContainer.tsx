import React, { forwardRef } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { BOTTOM_SPACING, KEYBOARD_BEHAVIOR } from '../../constants/layout';

interface ScrollContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  keyboardAware?: boolean;
  bottomPadding?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentPadding?: number;
}

export const ScrollContainer = forwardRef<ScrollView, ScrollContainerProps>(
  (
    {
      children,
      keyboardAware = false,
      bottomPadding = true,
      refreshing,
      onRefresh,
      contentPadding = 0,
      style,
      contentContainerStyle,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();

    const scrollViewContent = (
      <ScrollView
        ref={ref}
        style={[styles.scrollView, style]}
        contentContainerStyle={[
          contentPadding > 0 && { paddingHorizontal: contentPadding },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        overScrollMode="always"
        bounces={true}
        alwaysBounceVertical={true}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing || false}
              onRefresh={onRefresh}
              tintColor={colors.brand[400]}
              colors={[colors.brand[400]]}
            />
          ) : undefined
        }
        {...props}
      >
        {children}
        {bottomPadding && <View style={styles.bottomSpacer} />}
      </ScrollView>
    );

    if (keyboardAware) {
      return (
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={KEYBOARD_BEHAVIOR}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {scrollViewContent}
        </KeyboardAvoidingView>
      );
    }

    return scrollViewContent;
  }
);

ScrollContainer.displayName = 'ScrollContainer';

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  bottomSpacer: {
    height: BOTTOM_SPACING,
  },
});
