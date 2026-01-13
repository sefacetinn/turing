import React from 'react';
import { OrganizerEventsScreen } from './OrganizerEventsScreen';
import { ProviderEventsScreen } from './ProviderEventsScreen';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const colors = defaultColors;

interface EventsScreenProps {
  isProviderMode: boolean;
}

export function EventsScreen({ isProviderMode }: EventsScreenProps) {
  const { colors, isDark, helpers } = useTheme();

  // Render different screens based on mode
  if (isProviderMode) {
    return <ProviderEventsScreen />;
  }

  return <OrganizerEventsScreen />;
}
