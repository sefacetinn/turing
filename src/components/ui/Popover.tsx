import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ViewStyle,
  Dimensions,
  Animated,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface PopoverProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: PopoverPosition;
  containerStyle?: ViewStyle;
  popoverStyle?: ViewStyle;
  showArrow?: boolean;
  arrowSize?: number;
  offset?: number;
  disabled?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  closeOnContentPress?: boolean;
}

interface PopoverDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function Popover({
  content,
  children,
  position = 'auto',
  containerStyle,
  popoverStyle,
  showArrow = true,
  arrowSize = 8,
  offset = 8,
  disabled = false,
  onOpen,
  onClose,
  closeOnContentPress = false,
}: PopoverProps) {
  const { colors, isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [dimensions, setDimensions] = useState<PopoverDimensions | null>(null);
  const [popoverSize, setPopoverSize] = useState({ width: 0, height: 0 });
  const [calculatedPosition, setCalculatedPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const containerRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const calculateBestPosition = useCallback(
    (triggerDimensions: PopoverDimensions): 'top' | 'bottom' | 'left' | 'right' => {
      if (position !== 'auto') {
        return position as 'top' | 'bottom' | 'left' | 'right';
      }

      const spaceTop = triggerDimensions.y;
      const spaceBottom = SCREEN_HEIGHT - triggerDimensions.y - triggerDimensions.height;
      const spaceLeft = triggerDimensions.x;
      const spaceRight = SCREEN_WIDTH - triggerDimensions.x - triggerDimensions.width;

      // Prefer vertical positioning
      const verticalSpace = Math.max(spaceTop, spaceBottom);
      const horizontalSpace = Math.max(spaceLeft, spaceRight);

      if (verticalSpace >= horizontalSpace) {
        return spaceBottom >= spaceTop ? 'bottom' : 'top';
      } else {
        return spaceRight >= spaceLeft ? 'right' : 'left';
      }
    },
    [position]
  );

  const show = useCallback(() => {
    if (disabled) return;

    containerRef.current?.measureInWindow((x, y, width, height) => {
      const triggerDimensions = { x, y, width, height };
      setDimensions(triggerDimensions);
      setCalculatedPosition(calculateBestPosition(triggerDimensions));
      setIsVisible(true);
      onOpen?.();

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [disabled, calculateBestPosition, onOpen, fadeAnim, scaleAnim]);

  const hide = useCallback(() => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onClose?.();
    });
  }, [onClose, fadeAnim, scaleAnim]);

  const handleContentPress = () => {
    if (closeOnContentPress) {
      hide();
    }
  };

  const getPopoverPosition = (): ViewStyle => {
    if (!dimensions) return {};

    const popoverWidth = popoverSize.width || 200;
    const popoverHeight = popoverSize.height || 100;

    switch (calculatedPosition) {
      case 'top':
        return {
          left: Math.max(
            10,
            Math.min(
              dimensions.x + dimensions.width / 2 - popoverWidth / 2,
              SCREEN_WIDTH - popoverWidth - 10
            )
          ),
          top: dimensions.y - popoverHeight - offset - (showArrow ? arrowSize : 0),
        };
      case 'bottom':
        return {
          left: Math.max(
            10,
            Math.min(
              dimensions.x + dimensions.width / 2 - popoverWidth / 2,
              SCREEN_WIDTH - popoverWidth - 10
            )
          ),
          top: dimensions.y + dimensions.height + offset + (showArrow ? arrowSize : 0),
        };
      case 'left':
        return {
          left: dimensions.x - popoverWidth - offset - (showArrow ? arrowSize : 0),
          top: Math.max(
            10,
            Math.min(
              dimensions.y + dimensions.height / 2 - popoverHeight / 2,
              SCREEN_HEIGHT - popoverHeight - 10
            )
          ),
        };
      case 'right':
        return {
          left: dimensions.x + dimensions.width + offset + (showArrow ? arrowSize : 0),
          top: Math.max(
            10,
            Math.min(
              dimensions.y + dimensions.height / 2 - popoverHeight / 2,
              SCREEN_HEIGHT - popoverHeight - 10
            )
          ),
        };
      default:
        return {};
    }
  };

  const getArrowStyle = (): ViewStyle => {
    if (!dimensions || !showArrow) return { display: 'none' };

    const popoverWidth = popoverSize.width || 200;
    const popoverHeight = popoverSize.height || 100;
    const backgroundColor = isDark ? colors.zinc[700] : colors.cardBackground;

    switch (calculatedPosition) {
      case 'top':
        return {
          position: 'absolute',
          bottom: -arrowSize,
          left: popoverWidth / 2 - arrowSize,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: backgroundColor,
        };
      case 'bottom':
        return {
          position: 'absolute',
          top: -arrowSize,
          left: popoverWidth / 2 - arrowSize,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: backgroundColor,
        };
      case 'left':
        return {
          position: 'absolute',
          right: -arrowSize,
          top: popoverHeight / 2 - arrowSize,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftWidth: arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: backgroundColor,
        };
      case 'right':
        return {
          position: 'absolute',
          left: -arrowSize,
          top: popoverHeight / 2 - arrowSize,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: backgroundColor,
        };
      default:
        return {};
    }
  };

  const handlePopoverLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== popoverSize.width || height !== popoverSize.height) {
      setPopoverSize({ width, height });
    }
  };

  return (
    <>
      <TouchableOpacity
        ref={containerRef}
        onPress={show}
        style={containerStyle}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Popover acmak icin tiklayin"
      >
        {children}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={hide}
      >
        <Pressable style={styles.overlay} onPress={hide}>
          <Animated.View
            style={[
              styles.popoverContainer,
              {
                backgroundColor: isDark ? colors.zinc[700] : colors.cardBackground,
                borderColor: colors.border,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
              getPopoverPosition(),
              popoverStyle,
            ]}
            onLayout={handlePopoverLayout}
          >
            <Pressable onPress={handleContentPress}>
              {content}
            </Pressable>
            {showArrow && <View style={getArrowStyle()} />}
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  popoverContainer: {
    position: 'absolute',
    minWidth: 120,
    maxWidth: SCREEN_WIDTH - 40,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'visible',
  },
});

export default Popover;
