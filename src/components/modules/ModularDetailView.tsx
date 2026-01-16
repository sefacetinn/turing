/**
 * ModularDetailView - Modüler Detay Görünümü
 *
 * ProviderRequestDetailScreen'de kullanılmak üzere modüler içerik render eden bileşen.
 * Hizmet kategorisine göre dinamik modül gösterimi sağlar.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ModuleRenderer } from './ModuleRenderer';
import { useServiceByCategory, useModuleDefinition } from '../../hooks/useModules';
import { useModuleContext } from '../../context/ModuleContext';
import {
  transformOfferToModuleData,
  getModulesForCategory,
} from '../../utils/moduleDataTransformer';
import { ModuleDataMap, VenueModuleData, DisplayModuleType } from '../../types/modules';
import { ServiceCategory } from '../../types';

// Legacy types from current system
interface LegacyOffer {
  id: string;
  serviceCategory: string;
  eventTitle: string;
  role: string;
  eventDate: string;
  location: string;
  status: string;
  organizer: {
    id: string;
    name: string;
    image: string;
    rating?: number;
    reviewCount?: number;
  };
  counterOffer?: {
    amount: number;
    message?: string;
  };
}

interface LegacyVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  district?: string;
  capacity: number;
  indoorOutdoor: 'indoor' | 'outdoor' | 'mixed';
  venueType: string;
  stageWidth?: number;
  stageDepth?: number;
  stageHeight?: number;
  halls?: Array<{
    id: string;
    name: string;
    capacity: number;
    seatingType: string;
    stageWidth?: number;
    stageDepth?: number;
    stageHeight?: number;
    isMainHall?: boolean;
  }>;
  selectedHallId?: string;
  backstage?: {
    hasBackstage: boolean;
    roomCount?: number;
    hasMirror?: boolean;
    hasShower?: boolean;
    hasPrivateToilet?: boolean;
    cateringAvailable?: boolean;
    notes?: string;
  };
  hasSoundSystem?: boolean;
  hasLightingSystem?: boolean;
  hasParkingArea?: boolean;
  parkingCapacity?: number;
  images?: string[];
  contactName?: string;
  contactPhone?: string;
  rating?: number;
  reviewCount?: number;
}

interface LegacyEventDetails {
  ageLimit: string;
  participantType: string;
  concertTime: string;
  eventDuration: string;
  images: string[];
  socialMedia: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

interface ModularDetailViewProps {
  offer: LegacyOffer;
  venue: LegacyVenue;
  eventDetails: LegacyEventDetails;
  organizerBudget: number | null;
  userRole?: 'provider' | 'organizer' | 'admin';
  onModuleDataChange?: (moduleId: string, data: any) => void;
  mode?: 'view' | 'edit';
}

/**
 * Mevcut veriyi modüler formata dönüştürür ve ModuleRenderer ile render eder.
 */
export const ModularDetailView: React.FC<ModularDetailViewProps> = ({
  offer,
  venue,
  eventDetails,
  organizerBudget,
  userRole = 'provider',
  onModuleDataChange,
  mode = 'view',
}) => {
  // Hizmet kategorisine göre service config al
  const serviceConfig = useServiceByCategory(offer.serviceCategory as ServiceCategory);
  const { getModule } = useModuleContext();

  // Legacy veriyi modül formatına dönüştür
  const moduleData = useMemo<Partial<ModuleDataMap>>(() => {
    return {
      venue: {
        name: venue.name,
        address: venue.address,
        city: venue.city,
        district: venue.district,
        capacity: venue.capacity,
        indoorOutdoor: venue.indoorOutdoor,
        venueType: venue.venueType as VenueModuleData['venueType'],
        stageWidth: venue.stageWidth,
        stageDepth: venue.stageDepth,
        stageHeight: venue.stageHeight,
        backstage: venue.backstage ? {
          hasBackstage: venue.backstage.hasBackstage,
          roomCount: venue.backstage.roomCount,
          hasMirror: venue.backstage.hasMirror,
          hasShower: venue.backstage.hasShower,
          hasPrivateToilet: venue.backstage.hasPrivateToilet,
          cateringAvailable: venue.backstage.cateringAvailable,
          notes: venue.backstage.notes,
        } : undefined,
        halls: venue.halls?.map(h => ({
          id: h.id,
          name: h.name,
          capacity: h.capacity,
          seatingType: h.seatingType as 'standing' | 'seated' | 'mixed',
          stageWidth: h.stageWidth,
          stageDepth: h.stageDepth,
          stageHeight: h.stageHeight,
          isMainHall: h.isMainHall,
        })),
        images: venue.images,
        parkingCapacity: venue.parkingCapacity,
        hasSoundSystem: venue.hasSoundSystem,
        hasLightingSystem: venue.hasLightingSystem,
        hasParkingArea: venue.hasParkingArea,
        contactName: venue.contactName,
        contactPhone: venue.contactPhone,
        rating: venue.rating,
        reviewCount: venue.reviewCount,
      },
      datetime: {
        eventDate: offer.eventDate,
        eventTime: eventDetails.concertTime,
        duration: eventDetails.eventDuration,
      },
      budget: {
        organizerBudget: organizerBudget || undefined,
        currency: 'TRY',
        isNegotiable: true,
      },
      participant: {
        expectedCount: venue.capacity,
        maxCount: venue.capacity,
        ageLimit: eventDetails.ageLimit,
        participantType: eventDetails.participantType,
      },
      contact: {
        primaryContact: {
          name: offer.organizer.name,
          phone: '+905329876543',
          role: 'Organizatör',
        },
        secondaryContact: venue.contactName ? {
          name: venue.contactName,
          phone: venue.contactPhone || '',
          role: 'Mekan Yetkilisi',
        } : undefined,
        socialMedia: eventDetails.socialMedia ? {
          instagram: eventDetails.socialMedia.instagram,
          twitter: eventDetails.socialMedia.twitter,
          website: eventDetails.socialMedia.website,
        } : undefined,
      },
      media: {
        images: [...eventDetails.images, ...(venue.images || [])],
        videos: [],
      },
      rating: {
        overallRating: offer.organizer.rating || venue.rating,
        reviewCount: offer.organizer.reviewCount || venue.reviewCount,
      },
    };
  }, [offer, venue, eventDetails, organizerBudget]);

  // Service config yoksa fallback modül listesi kullan
  const modules = useMemo(() => {
    if (serviceConfig?.detailModules && serviceConfig.detailModules.length > 0) {
      return serviceConfig.detailModules;
    }

    // Fallback: Kategori bazlı varsayılan modüller
    const moduleIds = getModulesForCategory(offer.serviceCategory);
    return moduleIds
      .map((moduleId, index) => {
        const definition = getModule(moduleId as DisplayModuleType);
        if (!definition) return null;

        return {
          definition,
          config: {
            enabled: true,
            order: index + 1,
            required: false,
            collapsed: false,
            visibility: 'all' as const,
            fields: {},
          },
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);
  }, [serviceConfig, offer.serviceCategory, getModule]);

  return (
    <View style={styles.container}>
      <ModuleRenderer
        modules={modules}
        data={moduleData}
        mode={mode}
        role={userRole}
        onDataChange={onModuleDataChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ModularDetailView;
