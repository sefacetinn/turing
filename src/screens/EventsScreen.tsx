import React from 'react';
import { OrganizerEventsScreen } from './OrganizerEventsScreen';
import { ProviderEventsScreen } from './ProviderEventsScreen';

interface EventsScreenProps {
  isProviderMode: boolean;
}

export function EventsScreen({ isProviderMode }: EventsScreenProps) {
  // Render different screens based on mode
  if (isProviderMode) {
    return <ProviderEventsScreen />;
  }

  return <OrganizerEventsScreen />;
}
