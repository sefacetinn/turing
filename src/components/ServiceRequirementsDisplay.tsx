import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import {
  CategoryRequirements,
  BookingRequirements,
  TechnicalRequirements,
  VenueRequirements,
  TransportRequirements,
  AccommodationRequirements,
  FlightRequirements,
  SecurityRequirements,
  CateringRequirements,
  GeneratorRequirements,
  BeverageRequirements,
  MedicalRequirements,
  MediaRequirements,
  BarrierRequirements,
  TentRequirements,
  TicketingRequirements,
  DecorationRequirements,
  ProductionRequirements,
} from '../types';

interface Props {
  category: string;
  requirements: CategoryRequirements;
  budget?: string;
}

// Chip component for single values
function Chip({ value }: { value: string }) {
  if (!value) return null;
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{value}</Text>
    </View>
  );
}

// Multi-chip component for arrays
function ChipList({ values }: { values: string[] }) {
  if (!values || values.length === 0) return null;
  return (
    <View style={styles.chipList}>
      {values.map((value, index) => (
        <Chip key={index} value={value} />
      ))}
    </View>
  );
}

// Boolean indicator component
function BooleanIndicator({ label, value }: { label: string; value: boolean }) {
  return (
    <View style={styles.booleanRow}>
      <Ionicons
        name={value ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={value ? colors.success : colors.zinc[600]}
      />
      <Text style={[styles.booleanText, !value && styles.booleanTextInactive]}>
        {label}
      </Text>
    </View>
  );
}

// Row component for label-value pairs
function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Chip value={value} />
    </View>
  );
}

// Row with two values side by side
function DualInfoRow({
  label1,
  value1,
  label2,
  value2,
}: {
  label1: string;
  value1?: string;
  label2: string;
  value2?: string;
}) {
  if (!value1 && !value2) return null;
  return (
    <View style={styles.dualRow}>
      {value1 && (
        <View style={styles.dualItem}>
          <Text style={styles.infoLabel}>{label1}</Text>
          <Chip value={value1} />
        </View>
      )}
      {value2 && (
        <View style={styles.dualItem}>
          <Text style={styles.infoLabel}>{label2}</Text>
          <Chip value={value2} />
        </View>
      )}
    </View>
  );
}

// Text box for longer text values
function TextBox({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.textBoxContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.textBox}>
        <Text style={styles.textBoxText}>{value}</Text>
      </View>
    </View>
  );
}

// Section header
function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

// Booking requirements display
function BookingDisplay({ req }: { req: BookingRequirements }) {
  return (
    <>
      <InfoRow label="Etkinlik Türü" value={req.eventType} />
      <DualInfoRow
        label1="Mekan Türü"
        value1={req.venueType}
        label2="Tahmini Katılımcı"
        value2={req.guestCount}
      />
      <DualInfoRow
        label1="Set Süresi"
        value1={req.duration}
        label2="Set Sayısı"
        value2={req.setCount}
      />
      <SectionHeader title="Ek Hizmetler" />
      <View style={styles.booleanGroup}>
        <BooleanIndicator label="Ses Sistemi Gerekli" value={req.soundSystem} />
        <BooleanIndicator label="Konaklama Gerekli" value={req.accommodation} />
        <BooleanIndicator label="Ulaşım Gerekli" value={req.travel} />
      </View>
      <TextBox label="Backstage İstekleri" value={req.backstageNeeds} />
    </>
  );
}

// Technical requirements display
function TechnicalDisplay({ req }: { req: TechnicalRequirements }) {
  return (
    <>
      <DualInfoRow
        label1="Mekan Türü"
        value1={req.indoorOutdoor}
        label2="Mekan Büyüklüğü"
        value2={req.venueSize}
      />
      {req.soundRequirements && req.soundRequirements.length > 0 && (
        <>
          <SectionHeader title="Ses Sistemi İhtiyaçları" />
          <ChipList values={req.soundRequirements} />
        </>
      )}
      {req.lightingRequirements && req.lightingRequirements.length > 0 && (
        <>
          <SectionHeader title="Aydınlatma İhtiyaçları" />
          <ChipList values={req.lightingRequirements} />
        </>
      )}
      <InfoRow label="Sahne Boyutu" value={req.stageSize} />
      <DualInfoRow
        label1="Güç Kapasitesi"
        value1={req.powerAvailable}
        label2="Kurulum Süresi"
        value2={req.setupTime}
      />
    </>
  );
}

// Venue requirements display
function VenueDisplay({ req }: { req: VenueRequirements }) {
  return (
    <>
      <InfoRow label="Mekan Tipi" value={req.venueStyle} />
      <DualInfoRow
        label1="Kapasite"
        value1={req.venueCapacity}
        label2="Alan Tercihi"
        value2={req.indoorOutdoor}
      />
      <SectionHeader title="Ek Gereksinimler" />
      <View style={styles.booleanGroup}>
        <BooleanIndicator label="Catering Hizmeti" value={req.cateringIncluded} />
        <BooleanIndicator label="Otopark Gerekli" value={req.parkingNeeded} />
        <BooleanIndicator label="Engelli Erişimi" value={req.accessibilityNeeded} />
      </View>
    </>
  );
}

// Transport requirements display
function TransportDisplay({ req }: { req: TransportRequirements }) {
  return (
    <>
      <SectionHeader title="Güzergah" />
      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <Ionicons name="location" size={14} color={colors.success} />
          <Text style={styles.routeText}>{req.pickupLocation || 'Belirtilmedi'}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <Ionicons name="location" size={14} color={colors.error} />
          <Text style={styles.routeText}>{req.dropoffLocation || 'Belirtilmedi'}</Text>
        </View>
      </View>
      <InfoRow label="Alış Saati" value={req.pickupTime} />
      <DualInfoRow
        label1="Yolcu Sayısı"
        value1={req.passengerCount}
        label2="Araç Tipi"
        value2={req.vehicleType}
      />
      <View style={styles.booleanGroup}>
        <BooleanIndicator label="Dönüş Yolculuğu" value={req.returnTrip} />
      </View>
    </>
  );
}

// Accommodation requirements display
function AccommodationDisplay({ req }: { req: AccommodationRequirements }) {
  return (
    <>
      <DualInfoRow
        label1="Giriş Tarihi"
        value1={req.checkInDate}
        label2="Çıkış Tarihi"
        value2={req.checkOutDate}
      />
      <DualInfoRow
        label1="Oda Sayısı"
        value1={req.roomCount}
        label2="Oda Tipi"
        value2={req.roomType}
      />
      <InfoRow label="Otel Standardı" value={req.starRating} />
      <View style={styles.booleanGroup}>
        <BooleanIndicator label="Kahvaltı Dahil" value={req.breakfastIncluded} />
      </View>
    </>
  );
}

// Flight requirements display
function FlightDisplay({ req }: { req: FlightRequirements }) {
  return (
    <>
      <SectionHeader title="Uçuş Güzergahı" />
      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <Ionicons name="airplane" size={14} color={colors.brand[400]} />
          <Text style={styles.routeText}>{req.departureCity || 'Belirtilmedi'}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <Ionicons name="location" size={14} color={colors.error} />
          <Text style={styles.routeText}>{req.arrivalCity || 'Belirtilmedi'}</Text>
        </View>
      </View>
      <DualInfoRow
        label1="Yolcu Sayısı"
        value1={req.passengerCount}
        label2="Uçuş Sınıfı"
        value2={req.flightClass}
      />
      <InfoRow label="Bagaj İhtiyacı" value={req.baggageNeeds} />
      <View style={styles.booleanGroup}>
        <BooleanIndicator label="Gidiş-Dönüş" value={req.roundTrip} />
      </View>
    </>
  );
}

// Security requirements display
function SecurityDisplay({ req }: { req: SecurityRequirements }) {
  return (
    <>
      <DualInfoRow
        label1="Personel Sayısı"
        value1={req.guardCount}
        label2="Çalışma Süresi"
        value2={req.shiftHours}
      />
      {req.securityAreas && req.securityAreas.length > 0 && (
        <>
          <SectionHeader title="Güvenlik Alanları" />
          <ChipList values={req.securityAreas} />
        </>
      )}
      <View style={styles.booleanGroup}>
        <BooleanIndicator label="Silahlı Güvenlik" value={req.armedSecurity} />
      </View>
    </>
  );
}

// Catering requirements display
function CateringDisplay({ req }: { req: CateringRequirements }) {
  return (
    <>
      <InfoRow label="Kişi Sayısı" value={req.guestCount} />
      {req.mealType && req.mealType.length > 0 && (
        <>
          <SectionHeader title="Yemek Türleri" />
          <ChipList values={req.mealType} />
        </>
      )}
      <InfoRow label="Servis Tipi" value={req.serviceStyle} />
      {req.dietaryRestrictions && req.dietaryRestrictions.length > 0 && (
        <>
          <SectionHeader title="Diyet Gereksinimleri" />
          <ChipList values={req.dietaryRestrictions} />
        </>
      )}
    </>
  );
}

// Generator requirements display
function GeneratorDisplay({ req }: { req: GeneratorRequirements }) {
  return (
    <>
      <DualInfoRow
        label1="Güç İhtiyacı"
        value1={req.powerRequirement}
        label2="Kullanım Süresi"
        value2={req.generatorDuration}
      />
      <View style={styles.booleanGroup}>
        <BooleanIndicator label="Yedek Jeneratör Gerekli" value={req.backupNeeded} />
      </View>
    </>
  );
}

// Beverage requirements display
function BeverageDisplay({ req }: { req: BeverageRequirements }) {
  return (
    <>
      <InfoRow label="Bar Tipi" value={req.barType} />
      {req.beverageTypes && req.beverageTypes.length > 0 && (
        <>
          <SectionHeader title="İçecek Türleri" />
          <ChipList values={req.beverageTypes} />
        </>
      )}
      <DualInfoRow
        label1="Kişi Sayısı"
        value1={req.guestCount}
        label2="Barmen Sayısı"
        value2={req.bartenderCount}
      />
    </>
  );
}

// Medical requirements display
function MedicalDisplay({ req }: { req: MedicalRequirements }) {
  return (
    <>
      {req.medicalServices && req.medicalServices.length > 0 && (
        <>
          <SectionHeader title="Sağlık Hizmetleri" />
          <ChipList values={req.medicalServices} />
        </>
      )}
      <DualInfoRow
        label1="Etkinlik Kapasitesi"
        value1={req.guestCount}
        label2="Etkinlik Süresi"
        value2={req.duration}
      />
      <View style={styles.booleanGroup}>
        <BooleanIndicator label="Ambulans Standby" value={req.ambulanceStandby} />
      </View>
    </>
  );
}

// Media requirements display
function MediaDisplay({ req }: { req: MediaRequirements }) {
  return (
    <>
      {req.mediaServices && req.mediaServices.length > 0 && (
        <>
          <SectionHeader title="Medya Hizmetleri" />
          <ChipList values={req.mediaServices} />
        </>
      )}
      <InfoRow label="Çekim Süresi" value={req.duration} />
      {req.deliveryFormat && req.deliveryFormat.length > 0 && (
        <>
          <SectionHeader title="Teslimat Formatı" />
          <ChipList values={req.deliveryFormat} />
        </>
      )}
    </>
  );
}

// Barrier requirements display
function BarrierDisplay({ req }: { req: BarrierRequirements }) {
  return (
    <>
      <InfoRow label="Bariyer Tipi" value={req.barrierType} />
      <DualInfoRow
        label1="Toplam Uzunluk"
        value1={req.barrierLength}
        label2="Kullanım Süresi"
        value2={req.duration}
      />
    </>
  );
}

// Tent requirements display
function TentDisplay({ req }: { req: TentRequirements }) {
  return (
    <>
      <DualInfoRow
        label1="Çadır Tipi"
        value1={req.tentType}
        label2="Kapasite"
        value2={req.tentSize}
      />
      {req.tentFeatures && req.tentFeatures.length > 0 && (
        <>
          <SectionHeader title="Ek Özellikler" />
          <ChipList values={req.tentFeatures} />
        </>
      )}
    </>
  );
}

// Ticketing requirements display
function TicketingDisplay({ req }: { req: TicketingRequirements }) {
  return (
    <>
      <InfoRow label="Etkinlik Kapasitesi" value={req.ticketCapacity} />
      {req.ticketTypes && req.ticketTypes.length > 0 && (
        <>
          <SectionHeader title="Bilet Türleri" />
          <ChipList values={req.ticketTypes} />
        </>
      )}
      {req.ticketTech && req.ticketTech.length > 0 && (
        <>
          <SectionHeader title="Teknoloji" />
          <ChipList values={req.ticketTech} />
        </>
      )}
    </>
  );
}

// Decoration requirements display
function DecorationDisplay({ req }: { req: DecorationRequirements }) {
  return (
    <>
      <DualInfoRow
        label1="Tema"
        value1={req.decorTheme}
        label2="Etkinlik Büyüklüğü"
        value2={req.guestCount}
      />
      {req.decorAreas && req.decorAreas.length > 0 && (
        <>
          <SectionHeader title="Dekorasyon Alanları" />
          <ChipList values={req.decorAreas} />
        </>
      )}
      <View style={styles.booleanGroup}>
        <BooleanIndicator label="Çiçek Düzenlemesi" value={req.floralsNeeded} />
      </View>
    </>
  );
}

// Production requirements display
function ProductionDisplay({ req }: { req: ProductionRequirements }) {
  return (
    <>
      {req.productionServices && req.productionServices.length > 0 && (
        <>
          <SectionHeader title="Prodüksiyon Hizmetleri" />
          <ChipList values={req.productionServices} />
        </>
      )}
      <DualInfoRow
        label1="Etkinlik Tipi"
        value1={req.eventType}
        label2="Ekip Büyüklüğü"
        value2={req.crewSize}
      />
      <InfoRow label="Etkinlik Süresi" value={req.duration} />
    </>
  );
}

export function ServiceRequirementsDisplay({ category, requirements, budget }: Props) {
  const renderRequirements = () => {
    switch (category) {
      case 'booking':
        return <BookingDisplay req={requirements as BookingRequirements} />;
      case 'technical':
        return <TechnicalDisplay req={requirements as TechnicalRequirements} />;
      case 'venue':
        return <VenueDisplay req={requirements as VenueRequirements} />;
      case 'transport':
        return <TransportDisplay req={requirements as TransportRequirements} />;
      case 'accommodation':
        return <AccommodationDisplay req={requirements as AccommodationRequirements} />;
      case 'flight':
        return <FlightDisplay req={requirements as FlightRequirements} />;
      case 'security':
        return <SecurityDisplay req={requirements as SecurityRequirements} />;
      case 'catering':
        return <CateringDisplay req={requirements as CateringRequirements} />;
      case 'generator':
        return <GeneratorDisplay req={requirements as GeneratorRequirements} />;
      case 'beverage':
        return <BeverageDisplay req={requirements as BeverageRequirements} />;
      case 'medical':
        return <MedicalDisplay req={requirements as MedicalRequirements} />;
      case 'media':
        return <MediaDisplay req={requirements as MediaRequirements} />;
      case 'barrier':
        return <BarrierDisplay req={requirements as BarrierRequirements} />;
      case 'tent':
        return <TentDisplay req={requirements as TentRequirements} />;
      case 'ticketing':
        return <TicketingDisplay req={requirements as TicketingRequirements} />;
      case 'decoration':
        return <DecorationDisplay req={requirements as DecorationRequirements} />;
      case 'production':
        return <ProductionDisplay req={requirements as ProductionRequirements} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="document-text" size={18} color={colors.brand[400]} />
        <Text style={styles.title}>Talep Detayları</Text>
      </View>

      <View style={styles.content}>
        {renderRequirements()}

        {budget && (
          <>
            <SectionHeader title="Bütçe Aralığı" />
            <View style={styles.budgetContainer}>
              <Ionicons name="cash-outline" size={16} color={colors.success} />
              <Text style={styles.budgetText}>{budget}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(75, 48, 184, 0.05)',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.zinc[400],
    marginTop: 8,
    marginBottom: 4,
  },
  infoRow: {
    gap: 6,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.zinc[500],
    marginBottom: 4,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(75, 48, 184, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(75, 48, 184, 0.2)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.brand[400],
  },
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dualRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dualItem: {
    flex: 1,
  },
  booleanGroup: {
    gap: 8,
    marginTop: 4,
  },
  booleanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  booleanText: {
    fontSize: 13,
    color: colors.text,
  },
  booleanTextInactive: {
    color: colors.zinc[600],
  },
  textBoxContainer: {
    gap: 6,
  },
  textBox: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  textBoxText: {
    fontSize: 13,
    color: colors.zinc[400],
    lineHeight: 18,
  },
  routeContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
    fontSize: 13,
    color: colors.text,
  },
  routeLine: {
    width: 1,
    height: 16,
    backgroundColor: colors.zinc[700],
    marginLeft: 7,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
});
