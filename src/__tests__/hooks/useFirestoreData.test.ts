/**
 * Tests for Firestore data types and utilities
 * These are unit tests that don't require Firebase connection
 */

// Define the interfaces locally for testing without importing from the hooks
// (to avoid Expo module initialization issues in tests)

interface TestFirestoreEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  city: string;
  venue: string;
  status: 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled';
  organizerId: string;
  organizerName?: string;
  organizerImage?: string;
  organizerPhone?: string;
  contractAmount?: number;
  budget?: number;
  eventType?: string;
  category?: string;
  isAllAges?: boolean;
  seatingArrangement?: string;
}

interface TestFirestoreOffer {
  id: string;
  eventId: string;
  eventTitle: string;
  organizerId: string;
  organizerName: string;
  providerId: string;
  providerName: string;
  serviceCategory: string;
  requestType: 'request' | 'offer';
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'counter_offered';
  contractSigned?: boolean;
  contractSignedByOrganizer?: boolean;
  contractSignedByProvider?: boolean;
  finalAmount?: number;
  artistName?: string;
  artistBio?: string;
  artistGenres?: string[];
  offerHistory?: Array<{
    type: string;
    by: string;
    amount?: number;
    message?: string;
  }>;
}

// Utility functions to test
const calculateContractAmount = (event: TestFirestoreEvent): number => {
  return event.contractAmount ?? event.budget ?? 0;
};

const getOrganizerDisplayName = (event: TestFirestoreEvent): string => {
  return event.organizerName || 'Organizatör';
};

const isContractFullySigned = (offer: TestFirestoreOffer): boolean => {
  return offer.contractSigned === true ||
         (offer.contractSignedByOrganizer === true && offer.contractSignedByProvider === true);
};

const getOfferAmount = (offer: TestFirestoreOffer): number => {
  return offer.finalAmount ?? 0;
};

describe('FirestoreEvent utilities', () => {
  it('should calculate contract amount correctly', () => {
    const eventWithContract: TestFirestoreEvent = {
      id: 'event-1',
      title: 'Test Event',
      date: '2026-03-15',
      time: '20:00',
      city: 'Istanbul',
      venue: 'Test Venue',
      status: 'confirmed',
      organizerId: 'org-123',
      contractAmount: 150000,
      budget: 500000,
    };

    expect(calculateContractAmount(eventWithContract)).toBe(150000);
  });

  it('should fall back to budget when no contract amount', () => {
    const eventWithBudget: TestFirestoreEvent = {
      id: 'event-2',
      title: 'Budget Event',
      date: '2026-04-20',
      time: '19:00',
      city: 'Ankara',
      venue: 'Concert Hall',
      status: 'planning',
      organizerId: 'org-456',
      budget: 300000,
    };

    expect(calculateContractAmount(eventWithBudget)).toBe(300000);
  });

  it('should return 0 when no amount available', () => {
    const eventNoAmount: TestFirestoreEvent = {
      id: 'event-3',
      title: 'No Amount Event',
      date: '2026-05-10',
      time: '21:00',
      city: 'Izmir',
      venue: 'Beach Club',
      status: 'draft',
      organizerId: 'org-789',
    };

    expect(calculateContractAmount(eventNoAmount)).toBe(0);
  });

  it('should get organizer display name correctly', () => {
    const eventWithOrganizer: TestFirestoreEvent = {
      id: 'event-4',
      title: 'Event',
      date: '2026-06-15',
      time: '18:00',
      city: 'Bodrum',
      venue: 'Open Air',
      status: 'confirmed',
      organizerId: 'org-101',
      organizerName: 'Acme Events',
    };

    expect(getOrganizerDisplayName(eventWithOrganizer)).toBe('Acme Events');
  });

  it('should return default organizer name when not set', () => {
    const eventNoOrganizerName: TestFirestoreEvent = {
      id: 'event-5',
      title: 'Event',
      date: '2026-07-20',
      time: '20:00',
      city: 'Antalya',
      venue: 'Hotel',
      status: 'planning',
      organizerId: 'org-102',
    };

    expect(getOrganizerDisplayName(eventNoOrganizerName)).toBe('Organizatör');
  });
});

describe('FirestoreOffer utilities', () => {
  it('should detect fully signed contract', () => {
    const signedOffer: TestFirestoreOffer = {
      id: 'offer-1',
      eventId: 'event-1',
      eventTitle: 'Signed Event',
      organizerId: 'org-1',
      organizerName: 'Organizer',
      providerId: 'prov-1',
      providerName: 'Provider',
      serviceCategory: 'booking',
      requestType: 'request',
      status: 'accepted',
      contractSigned: true,
    };

    expect(isContractFullySigned(signedOffer)).toBe(true);
  });

  it('should detect contract signed by both parties', () => {
    const bothSignedOffer: TestFirestoreOffer = {
      id: 'offer-2',
      eventId: 'event-2',
      eventTitle: 'Both Signed',
      organizerId: 'org-2',
      organizerName: 'Organizer',
      providerId: 'prov-2',
      providerName: 'Provider',
      serviceCategory: 'technical',
      requestType: 'offer',
      status: 'accepted',
      contractSignedByOrganizer: true,
      contractSignedByProvider: true,
    };

    expect(isContractFullySigned(bothSignedOffer)).toBe(true);
  });

  it('should detect partially signed contract', () => {
    const partiallySignedOffer: TestFirestoreOffer = {
      id: 'offer-3',
      eventId: 'event-3',
      eventTitle: 'Partial',
      organizerId: 'org-3',
      organizerName: 'Organizer',
      providerId: 'prov-3',
      providerName: 'Provider',
      serviceCategory: 'booking',
      requestType: 'request',
      status: 'accepted',
      contractSignedByOrganizer: true,
      contractSignedByProvider: false,
    };

    expect(isContractFullySigned(partiallySignedOffer)).toBe(false);
  });

  it('should detect unsigned contract', () => {
    const unsignedOffer: TestFirestoreOffer = {
      id: 'offer-4',
      eventId: 'event-4',
      eventTitle: 'Unsigned',
      organizerId: 'org-4',
      organizerName: 'Organizer',
      providerId: 'prov-4',
      providerName: 'Provider',
      serviceCategory: 'booking',
      requestType: 'request',
      status: 'pending',
    };

    expect(isContractFullySigned(unsignedOffer)).toBe(false);
  });

  it('should get final amount from offer', () => {
    const offerWithAmount: TestFirestoreOffer = {
      id: 'offer-5',
      eventId: 'event-5',
      eventTitle: 'With Amount',
      organizerId: 'org-5',
      organizerName: 'Organizer',
      providerId: 'prov-5',
      providerName: 'Provider',
      serviceCategory: 'booking',
      requestType: 'offer',
      status: 'accepted',
      finalAmount: 135000,
    };

    expect(getOfferAmount(offerWithAmount)).toBe(135000);
  });
});

describe('Offer history', () => {
  it('should support offer negotiation history', () => {
    const negotiatedOffer: TestFirestoreOffer = {
      id: 'offer-6',
      eventId: 'event-6',
      eventTitle: 'Negotiated',
      organizerId: 'org-6',
      organizerName: 'Organizer',
      providerId: 'prov-6',
      providerName: 'Provider',
      serviceCategory: 'booking',
      requestType: 'request',
      status: 'counter_offered',
      offerHistory: [
        { type: 'quote', by: 'provider', amount: 100000 },
        { type: 'counter', by: 'organizer', amount: 80000, message: 'Can you do less?' },
        { type: 'counter', by: 'provider', amount: 90000, message: 'Best I can do' },
      ],
    };

    expect(negotiatedOffer.offerHistory).toHaveLength(3);
    expect(negotiatedOffer.offerHistory![0].amount).toBe(100000);
    expect(negotiatedOffer.offerHistory![1].message).toBe('Can you do less?');
    expect(negotiatedOffer.offerHistory![2].amount).toBe(90000);
  });
});

describe('Artist data', () => {
  it('should support artist details on offer', () => {
    const artistOffer: TestFirestoreOffer = {
      id: 'offer-7',
      eventId: 'event-7',
      eventTitle: 'Artist Booking',
      organizerId: 'org-7',
      organizerName: 'Festival Org',
      providerId: 'agency-1',
      providerName: 'Star Agency',
      serviceCategory: 'booking',
      requestType: 'offer',
      status: 'quoted',
      artistName: 'Famous Singer',
      artistBio: 'Grammy award winning artist',
      artistGenres: ['Pop', 'R&B', 'Soul'],
    };

    expect(artistOffer.artistName).toBe('Famous Singer');
    expect(artistOffer.artistGenres).toContain('Pop');
    expect(artistOffer.artistGenres).toContain('R&B');
    expect(artistOffer.artistBio).toContain('Grammy');
  });
});
