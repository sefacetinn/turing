import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  LayoutChangeEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  containerStyle?: ViewStyle;
  tooltipStyle?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

interface TooltipDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 0,
  containerStyle,
  tooltipStyle,
  textStyle,
  disabled = false,
}: TooltipProps) {
  const { colors, isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [dimensions, setDimensions] = useState<TooltipDimensions | null>(null);
  const containerRef = useRef<View>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const measureAndShow = useCallback(() => {
    if (disabled) return;

    containerRef.current?.measureInWindow((x, y, width, height) => {
      setDimensions({ x, y, width, height });

      if (delay > 0) {
        timeoutRef.current = setTimeout(() => {
          setIsVisible(true);
        }, delay);
      } else {
        setIsVisible(true);
      }
    });
  }, [delay, disabled]);

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  const getTooltipPosition = (): ViewStyle => {
    if (!dimensions) return {};

    const tooltipWidth = 200; // Approximate width
    const tooltipHeight = 40; // Approximate height
    const offset = 8;

    switch (position) {
      case 'top':
        return {
          left: dimensions.x + dimensions.width / 2 - tooltipWidth / 2,
          top: dimensions.y - tooltipHeight - offset,
        };
      case 'bottom':
        return {
          left: dimensions.x + dimensions.width / 2 - tooltipWidth / 2,
          top: dimensions.y + dimensions.height + offset,
        };
      case 'left':
        return {
          left: dimensions.x - tooltipWidth - offset,
          top: dimensions.y + dimensions.height / 2 - tooltipHeight / 2,
        };
      case 'right':
        return {
          left: dimensions.x + dimensions.width + offset,
          top: dimensions.y + dimensions.height / 2 - tooltipHeight / 2,
        };
      default:
        return {};
    }
  };

  const getArrowStyle = (): ViewStyle => {
    const arrowSize = 8;

    switch (position) {
      case 'top':
        return {
          position: 'absolute',
          bottom: -arrowSize,
          left: '50%',
          marginLeft: -arrowSize,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: isDark ? colors.zinc[700] : colors.zinc[800],
        };
      case 'bottom':
        return {
          position: 'absolute',
          top: -arrowSize,
          left: '50%',
          marginLeft: -arrowSize,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: isDark ? colors.zinc[700] : colors.zinc[800],
        };
      case 'left':
        return {
          position: 'absolute',
          right: -arrowSize,
          top: '50%',
          marginTop: -arrowSize,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftWidth: arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: isDark ? colors.zinc[700] : colors.zinc[800],
        };
      case 'right':
        return {
          position: 'absolute',
          left: -arrowSize,
          top: '50%',
          marginTop: -arrowSize,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: isDark ? colors.zinc[700] : colors.zinc[800],
        };
      default:
        return {};
    }
  };

  return (
    <>
      <TouchableOpacity
        ref={containerRef}
        onPressIn={measureAndShow}
        onPressOut={hide}
        onLongPress={measureAndShow}
        delayLongPress={200}
        style={containerStyle}
        activeOpacity={1}
        accessibilityLabel={content}
        accessibilityRole="button"
        accessibilityHint="Detayli bilgi icin basin"
      >
        {children}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={hide}
      >
        <Pressable style={styles.overlay} onPress={hide}>
          <View
            style={[
              styles.tooltipContainer,
              {
                backgroundColor: isDark ? colors.zinc[700] : colors.zinc[800],
              },
              getTooltipPosition(),
              tooltipStyle,
            ]}
          >
            <Text
              style={[styles.tooltipText, { color: 'white' }, textStyle]}
              numberOfLines={3}
            >
              {content}
            </Text>
            <View style={getArrowStyle()} />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  tooltipContainer: {
    position: 'absolute',
    maxWidth: 200,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default Tooltip;
