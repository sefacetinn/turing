import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput as RNTextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';

export interface SearchInputProps extends Omit<RNTextInputProps, 'style'> {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  loading?: boolean;
  showClearButton?: boolean;
  containerStyle?: ViewStyle;
  accessibilityLabel?: string;
}

export const SearchInput = forwardRef<RNTextInput, SearchInputProps>(
  (
    {
      onSearch,
      onClear,
      loading = false,
      showClearButton = true,
      containerStyle,
      value,
      onChangeText,
      accessibilityLabel = 'Arama',
      ...props
    },
    ref
  ) => {
    const { colors, isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [localValue, setLocalValue] = useState('');

    const currentValue = value !== undefined ? value : localValue;
    const hasValue = currentValue.length > 0;

    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChangeText = (text: string) => {
      if (value === undefined) {
        setLocalValue(text);
      }
      onChangeText?.(text);
    };

    const handleClear = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (value === undefined) {
        setLocalValue('');
      }
      onChangeText?.('');
      onClear?.();
    };

    const handleSubmit = () => {
      if (currentValue.trim()) {
        onSearch?.(currentValue.trim());
      }
    };

    const getBorderColor = () => {
      if (isFocused) return colors.brand[500];
      return isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border;
    };

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(0, 0, 0, 0.04)',
            borderColor: getBorderColor(),
          },
          isFocused && styles.containerFocused,
          containerStyle,
        ]}
      >
        <Ionicons
          name="search"
          size={18}
          color={isFocused ? colors.brand[500] : colors.textMuted}
          style={styles.searchIcon}
        />

        <RNTextInput
          ref={ref}
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.textMuted}
          placeholder="Ara..."
          value={currentValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          accessibilityLabel={accessibilityLabel}
          {...props}
        />

        {loading && (
          <ActivityIndicator
            size="small"
            color={colors.brand[500]}
            style={styles.loader}
          />
        )}

        {showClearButton && hasValue && !loading && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            accessibilityLabel="Aramayi temizle"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

SearchInput.displayName = 'SearchInput';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  containerFocused: {
    borderWidth: 1.5,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  loader: {
    marginLeft: 8,
  },
});

export default SearchInput;
