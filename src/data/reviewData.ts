// Review Data Types and Mock Data

export interface Review {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;

  // Reviewer
  reviewerId: string;
  reviewerName: string;
  reviewerImage: string;
  reviewerType: 'organizer' | 'provider';

  // Reviewee
  revieweeId: string;
  revieweeName: string;
  revieweeType: 'organizer' | 'provider';

  // Ratings
  overallRating: number;
  detailedRatings?: {
    communication?: number;
    professionalism?: number;
    quality?: number;
    punctuality?: number;
    valueForMoney?: number;
    organization?: number;
    paymentReliability?: number;
    workingConditions?: number;
  };

  // Tags and Comment
  tags: string[];
  comment?: string;
  wouldWorkAgain: boolean;

  // Meta
  createdAt: string;
  serviceCategory?: string;
  isPublic: boolean;
}

export interface PendingReview {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventImage: string;
  targets: {
    id: string;
    name: string;
    image: string;
    type: 'provider' | 'organizer';
    serviceCategory?: string;
  }[];
  dueDate: string;
}

// Mock Reviews - Reviews received by current user (Provider)
export const mockReceivedReviews: Review[] = [
  {
    id: 'r1',
    eventId: 'e1',
    eventTitle: 'Yaz Festivali 2024',
    eventDate: '15 Temmuz 2024',
    reviewerId: 'org1',
    reviewerName: 'Ahmet Yılmaz',
    reviewerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    reviewerType: 'organizer',
    revieweeId: 'prov1',
    revieweeName: 'ProSound',
    revieweeType: 'provider',
    overallRating: 5,
    detailedRatings: {
      communication: 5,
      professionalism: 5,
      quality: 5,
      punctuality: 5,
      valueForMoney: 4.5,
    },
    tags: ['professional', 'communication', 'punctual', 'quality', 'reliable'],
    comment: 'Ses sistemi kurulumu ve etkinlik boyunca destek mükemmeldi. Ekip çok profesyoneldi ve tüm isteklerimize hızlıca yanıt verdiler. Kesinlikle tekrar çalışırız!',
    wouldWorkAgain: true,
    createdAt: '18 Temmuz 2024',
    serviceCategory: 'technical',
    isPublic: true,
  },
  {
    id: 'r2',
    eventId: 'e2',
    eventTitle: 'Kurumsal Yıl Sonu',
    eventDate: '28 Aralık 2024',
    reviewerId: 'org2',
    reviewerName: 'Zeynep Demir',
    reviewerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    reviewerType: 'organizer',
    revieweeId: 'prov1',
    revieweeName: 'ProSound',
    revieweeType: 'provider',
    overallRating: 4.5,
    detailedRatings: {
      communication: 4,
      professionalism: 5,
      quality: 5,
      punctuality: 4,
      valueForMoney: 4,
    },
    tags: ['professional', 'quality', 'experienced'],
    comment: 'Kaliteli hizmet, profesyonel ekip. Kurulum biraz gecikti ama genel olarak memnun kaldık.',
    wouldWorkAgain: true,
    createdAt: '2 Ocak 2025',
    serviceCategory: 'technical',
    isPublic: true,
  },
  {
    id: 'r3',
    eventId: 'e3',
    eventTitle: 'Düğün Organizasyonu',
    eventDate: '8 Kasım 2024',
    reviewerId: 'org3',
    reviewerName: 'Mehmet Kaya',
    reviewerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    reviewerType: 'organizer',
    revieweeId: 'prov1',
    revieweeName: 'ProSound',
    revieweeType: 'provider',
    overallRating: 5,
    detailedRatings: {
      communication: 5,
      professionalism: 5,
      quality: 5,
      punctuality: 5,
      valueForMoney: 5,
    },
    tags: ['professional', 'communication', 'punctual', 'quality', 'team_player'],
    comment: 'Düğünümüzde kusursuz bir ses sistemi sağladılar. DJ ile koordinasyon mükemmeldi.',
    wouldWorkAgain: true,
    createdAt: '12 Kasım 2024',
    serviceCategory: 'technical',
    isPublic: true,
  },
  {
    id: 'r4',
    eventId: 'e4',
    eventTitle: 'Açılış Etkinliği',
    eventDate: '3 Ekim 2024',
    reviewerId: 'org4',
    reviewerName: 'Ayşe Öztürk',
    reviewerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    reviewerType: 'organizer',
    revieweeId: 'prov1',
    revieweeName: 'ProSound',
    revieweeType: 'provider',
    overallRating: 4,
    detailedRatings: {
      communication: 4,
      professionalism: 4,
      quality: 4.5,
      punctuality: 3.5,
      valueForMoney: 4,
    },
    tags: ['quality', 'experienced'],
    comment: 'Genel olarak iyi bir deneyimdi. Bazı küçük aksaklıklar oldu ama hızla çözüldü.',
    wouldWorkAgain: true,
    createdAt: '7 Ekim 2024',
    serviceCategory: 'technical',
    isPublic: true,
  },
];

// Mock Reviews - Reviews given by current user
export const mockGivenReviews: Review[] = [
  {
    id: 'g1',
    eventId: 'e1',
    eventTitle: 'Yaz Festivali 2024',
    eventDate: '15 Temmuz 2024',
    reviewerId: 'prov1',
    reviewerName: 'ProSound',
    reviewerImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
    reviewerType: 'provider',
    revieweeId: 'org1',
    revieweeName: 'Acme Events',
    revieweeType: 'organizer',
    overallRating: 5,
    detailedRatings: {
      communication: 5,
      organization: 5,
      paymentReliability: 5,
      workingConditions: 4.5,
    },
    tags: ['clear_brief', 'easy_communication', 'payment_reliable', 'well_organized', 'would_work_again'],
    comment: 'Çok organize bir ekip. Brief çok netti, ödeme zamanında yapıldı. Kesinlikle tekrar çalışırız.',
    wouldWorkAgain: true,
    createdAt: '20 Temmuz 2024',
    isPublic: true,
  },
  {
    id: 'g2',
    eventId: 'e2',
    eventTitle: 'Kurumsal Yıl Sonu',
    eventDate: '28 Aralık 2024',
    reviewerId: 'prov1',
    reviewerName: 'ProSound',
    reviewerImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
    reviewerType: 'provider',
    revieweeId: 'org2',
    revieweeName: 'XYZ Şirketi',
    revieweeType: 'organizer',
    overallRating: 4,
    detailedRatings: {
      communication: 3.5,
      organization: 4,
      paymentReliability: 4.5,
      workingConditions: 4,
    },
    tags: ['payment_reliable', 'respectful'],
    comment: 'İletişimde biraz gecikme oldu ama genel olarak iyi bir deneyimdi.',
    wouldWorkAgain: true,
    createdAt: '5 Ocak 2025',
    isPublic: true,
  },
];

// Mock Pending Reviews
export const mockPendingReviews: PendingReview[] = [
  {
    id: 'pr1',
    eventId: 'e5',
    eventTitle: 'Bahar Konseri 2025',
    eventDate: '10 Ocak 2025',
    eventImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    targets: [
      {
        id: 'org5',
        name: 'Müzik Festivali Org.',
        image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
        type: 'organizer',
      },
    ],
    dueDate: '2025-01-24',
  },
  {
    id: 'pr2',
    eventId: 'e6',
    eventTitle: 'Ürün Lansmanı',
    eventDate: '5 Ocak 2025',
    eventImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
    targets: [
      {
        id: 'org6',
        name: 'Tech Company',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200',
        type: 'organizer',
      },
    ],
    dueDate: '2025-01-19',
  },
];

// Mock Pending Reviews for Organizer (to review providers)
export const mockPendingProviderReviews: PendingReview[] = [
  {
    id: 'opr1',
    eventId: 'e7',
    eventTitle: 'Red Bull Music Academy Night',
    eventDate: '25 Mayıs 2026',
    eventImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400',
    targets: [
      {
        id: 'prov2',
        name: 'Pro Sound Istanbul',
        image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
        type: 'provider',
        serviceCategory: 'technical',
      },
      {
        id: 'prov3',
        name: 'Elite VIP Transfer',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200',
        type: 'provider',
        serviceCategory: 'transport',
      },
    ],
    dueDate: '2026-06-08',
  },
  {
    id: 'opr2',
    eventId: 'e8',
    eventTitle: 'Düğün - Zeynep & Emre',
    eventDate: '21 Eylül 2026',
    eventImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    targets: [
      {
        id: 'prov4',
        name: 'GourmetEvents Catering',
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200',
        type: 'provider',
        serviceCategory: 'catering',
      },
      {
        id: 'prov5',
        name: 'Star Booking Agency',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
        type: 'provider',
        serviceCategory: 'booking',
      },
    ],
    dueDate: '2026-10-05',
  },
];

// Organizer Received Reviews - Reviews received from providers about the organizer
export const mockOrganizerReceivedReviews: Review[] = [
  {
    id: 'or1',
    eventId: 'e1',
    eventTitle: 'Big Bang Summer Festival 2025',
    eventDate: '12 Temmuz 2025',
    reviewerId: 'prov1',
    reviewerName: 'Pro Sound Istanbul',
    reviewerImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
    reviewerType: 'provider',
    revieweeId: 'org1',
    revieweeName: 'Event Masters Turkey',
    revieweeType: 'organizer',
    overallRating: 5,
    detailedRatings: {
      communication: 5,
      organization: 5,
      paymentReliability: 5,
      workingConditions: 4.5,
    },
    tags: ['clear_brief', 'easy_communication', 'payment_reliable', 'well_organized', 'would_work_again'],
    comment: 'Çok profesyonel bir organizatör. Brief net ve anlaşılır, ödeme zamanında yapıldı. Sahada koordinasyon mükemmeldi. Kesinlikle tekrar çalışmak isteriz.',
    wouldWorkAgain: true,
    createdAt: '18 Temmuz 2025',
    serviceCategory: 'technical',
    isPublic: true,
  },
  {
    id: 'or2',
    eventId: 'e2',
    eventTitle: 'Vodafone Park Konseri',
    eventDate: '15 Haziran 2025',
    reviewerId: 'prov2',
    reviewerName: 'SecurePro Events',
    reviewerImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200',
    reviewerType: 'provider',
    revieweeId: 'org1',
    revieweeName: 'Event Masters Turkey',
    revieweeType: 'organizer',
    overallRating: 4.5,
    detailedRatings: {
      communication: 4.5,
      organization: 5,
      paymentReliability: 5,
      workingConditions: 4,
    },
    tags: ['well_organized', 'payment_reliable', 'respectful', 'would_work_again'],
    comment: 'Güvenlik planlaması çok iyi yapılmıştı. Ekibimize saygılı davranış ve zamanında ödeme.',
    wouldWorkAgain: true,
    createdAt: '20 Haziran 2025',
    serviceCategory: 'security',
    isPublic: true,
  },
  {
    id: 'or3',
    eventId: 'e3',
    eventTitle: 'Kurumsal Yıl Sonu Galası',
    eventDate: '28 Aralık 2024',
    reviewerId: 'prov3',
    reviewerName: 'GourmetEvents Catering',
    reviewerImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200',
    reviewerType: 'provider',
    revieweeId: 'org1',
    revieweeName: 'Event Masters Turkey',
    revieweeType: 'organizer',
    overallRating: 5,
    detailedRatings: {
      communication: 5,
      organization: 5,
      paymentReliability: 5,
      workingConditions: 5,
    },
    tags: ['clear_brief', 'easy_communication', 'payment_reliable', 'well_organized', 'flexible', 'would_work_again'],
    comment: 'Menü değişikliklerine esnek yaklaştılar. Mutfak alanı mükemmel hazırlanmıştı. A+ organizatör!',
    wouldWorkAgain: true,
    createdAt: '5 Ocak 2025',
    serviceCategory: 'catering',
    isPublic: true,
  },
  {
    id: 'or4',
    eventId: 'e4',
    eventTitle: 'Boğaz Düğünü',
    eventDate: '15 Eylül 2024',
    reviewerId: 'prov4',
    reviewerName: 'Elite VIP Transfer',
    reviewerImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200',
    reviewerType: 'provider',
    revieweeId: 'org1',
    revieweeName: 'Event Masters Turkey',
    revieweeType: 'organizer',
    overallRating: 4,
    detailedRatings: {
      communication: 4,
      organization: 4,
      paymentReliability: 5,
      workingConditions: 3.5,
    },
    tags: ['payment_reliable', 'respectful'],
    comment: 'İletişimde bazen gecikmeler oldu ama genel olarak iyi bir deneyimdi.',
    wouldWorkAgain: true,
    createdAt: '20 Eylül 2024',
    serviceCategory: 'transport',
    isPublic: true,
  },
  {
    id: 'or5',
    eventId: 'e5',
    eventTitle: 'İstanbul Jazz Festivali',
    eventDate: '8 Temmuz 2024',
    reviewerId: 'prov5',
    reviewerName: 'Star Booking Agency',
    reviewerImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
    reviewerType: 'provider',
    revieweeId: 'org1',
    revieweeName: 'Event Masters Turkey',
    revieweeType: 'organizer',
    overallRating: 5,
    detailedRatings: {
      communication: 5,
      organization: 5,
      paymentReliability: 5,
      workingConditions: 5,
    },
    tags: ['clear_brief', 'easy_communication', 'payment_reliable', 'well_organized', 'supportive', 'would_work_again'],
    comment: 'Sanatçı rider\'larına tam uyum sağlandı. Backstage koşulları mükemmeldi. Çok memnun kaldık.',
    wouldWorkAgain: true,
    createdAt: '15 Temmuz 2024',
    serviceCategory: 'booking',
    isPublic: true,
  },
];

// Organizer Given Reviews - Reviews given by organizer about providers
export const mockOrganizerGivenReviews: Review[] = [
  {
    id: 'og1',
    eventId: 'e1',
    eventTitle: 'Big Bang Summer Festival 2025',
    eventDate: '12 Temmuz 2025',
    reviewerId: 'org1',
    reviewerName: 'Event Masters Turkey',
    reviewerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    reviewerType: 'organizer',
    revieweeId: 'prov1',
    revieweeName: 'Pro Sound Istanbul',
    revieweeType: 'provider',
    overallRating: 5,
    detailedRatings: {
      communication: 5,
      professionalism: 5,
      quality: 5,
      punctuality: 5,
      valueForMoney: 4.5,
    },
    tags: ['professional', 'communication', 'punctual', 'quality', 'reliable'],
    comment: 'L-Acoustics sistemle muhteşem ses kalitesi sağladılar. Kurulum dakikasında tamamlandı. Kesinlikle tavsiye ederim!',
    wouldWorkAgain: true,
    createdAt: '18 Temmuz 2025',
    serviceCategory: 'technical',
    isPublic: true,
  },
  {
    id: 'og2',
    eventId: 'e2',
    eventTitle: 'Vodafone Park Konseri',
    eventDate: '15 Haziran 2025',
    reviewerId: 'org1',
    reviewerName: 'Event Masters Turkey',
    reviewerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    reviewerType: 'organizer',
    revieweeId: 'prov2',
    revieweeName: 'SecurePro Events',
    revieweeType: 'provider',
    overallRating: 5,
    detailedRatings: {
      communication: 5,
      professionalism: 5,
      quality: 5,
      punctuality: 5,
      valueForMoney: 5,
    },
    tags: ['professional', 'punctual', 'reliable', 'experienced', 'team_player'],
    comment: '35.000 kişilik konser güvenliği kusursuz yönetildi. Hiçbir aksaklık yaşanmadı. Profesyonel ekip.',
    wouldWorkAgain: true,
    createdAt: '20 Haziran 2025',
    serviceCategory: 'security',
    isPublic: true,
  },
  {
    id: 'og3',
    eventId: 'e3',
    eventTitle: 'Kurumsal Yıl Sonu Galası',
    eventDate: '28 Aralık 2024',
    reviewerId: 'org1',
    reviewerName: 'Event Masters Turkey',
    reviewerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    reviewerType: 'organizer',
    revieweeId: 'prov3',
    revieweeName: 'GourmetEvents Catering',
    revieweeType: 'provider',
    overallRating: 5,
    detailedRatings: {
      communication: 5,
      professionalism: 5,
      quality: 5,
      punctuality: 5,
      valueForMoney: 4.5,
    },
    tags: ['professional', 'quality', 'creative', 'punctual', 'reliable'],
    comment: 'Menü çeşitliliği ve sunum kalitesi beklentilerin üzerindeydi. Misafirlerden çok olumlu geri dönüş aldık.',
    wouldWorkAgain: true,
    createdAt: '5 Ocak 2025',
    serviceCategory: 'catering',
    isPublic: true,
  },
  {
    id: 'og4',
    eventId: 'e4',
    eventTitle: 'Boğaz Düğünü',
    eventDate: '15 Eylül 2024',
    reviewerId: 'org1',
    reviewerName: 'Event Masters Turkey',
    reviewerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    reviewerType: 'organizer',
    revieweeId: 'prov4',
    revieweeName: 'Elite VIP Transfer',
    revieweeType: 'provider',
    overallRating: 4.5,
    detailedRatings: {
      communication: 4,
      professionalism: 5,
      quality: 5,
      punctuality: 4.5,
      valueForMoney: 4,
    },
    tags: ['professional', 'quality', 'reliable'],
    comment: 'Araç kalitesi ve şoförlerin profesyonelliği çok iyiydi. VIP misafirler çok memnun kaldı.',
    wouldWorkAgain: true,
    createdAt: '20 Eylül 2024',
    serviceCategory: 'transport',
    isPublic: true,
  },
];

// Helper function to calculate rating breakdown
export const calculateRatingBreakdown = (reviews: Review[]) => {
  if (reviews.length === 0) return null;

  const totals: Record<string, { sum: number; count: number }> = {
    communication: { sum: 0, count: 0 },
    professionalism: { sum: 0, count: 0 },
    quality: { sum: 0, count: 0 },
    punctuality: { sum: 0, count: 0 },
    valueForMoney: { sum: 0, count: 0 },
    organization: { sum: 0, count: 0 },
    paymentReliability: { sum: 0, count: 0 },
    workingConditions: { sum: 0, count: 0 },
  };

  reviews.forEach(review => {
    if (review.detailedRatings) {
      Object.entries(review.detailedRatings).forEach(([key, value]) => {
        if (value && totals[key]) {
          totals[key].sum += value;
          totals[key].count += 1;
        }
      });
    }
  });

  const breakdown: { label: string; value: number }[] = [];

  const labelMap: Record<string, string> = {
    communication: 'İletişim',
    professionalism: 'Profesyonellik',
    quality: 'Kalite',
    punctuality: 'Dakiklik',
    valueForMoney: 'Fiyat/Performans',
    organization: 'Organizasyon',
    paymentReliability: 'Ödeme Güvenilirliği',
    workingConditions: 'Çalışma Koşulları',
  };

  Object.entries(totals).forEach(([key, data]) => {
    if (data.count > 0) {
      breakdown.push({
        label: labelMap[key] || key,
        value: data.sum / data.count,
      });
    }
  });

  return breakdown;
};

// Helper function to calculate top tags
export const calculateTopTags = (reviews: Review[]): { tag: string; count: number }[] => {
  const tagCounts: Record<string, number> = {};

  reviews.forEach(review => {
    review.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const tagLabelMap: Record<string, string> = {
    professional: 'Profesyonel',
    communication: 'İletişimi güçlü',
    punctual: 'Dakik',
    quality: 'Kaliteli iş',
    problem_solver: 'Problem çözücü',
    team_player: 'Ekip uyumlu',
    fair_price: 'Fiyatı uygun',
    creative: 'Yaratıcı',
    experienced: 'Deneyimli',
    reliable: 'Güvenilir',
    clear_brief: 'Net brief',
    easy_communication: 'İletişimi kolay',
    payment_reliable: 'Ödemede güvenilir',
    well_organized: 'İyi organize',
    respectful: 'Saygılı',
    flexible: 'Esnek',
    supportive: 'Destekleyici',
    detail_oriented: 'Detaylara özen',
    would_work_again: 'Tekrar çalışılır',
  };

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag: tagLabelMap[tag] || tag, count }))
    .sort((a, b) => b.count - a.count);
};

// Helper function to calculate average rating
export const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.overallRating, 0);
  return sum / reviews.length;
};

// Helper function to calculate would work again percentage
export const calculateWouldWorkAgainPercent = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;
  const positive = reviews.filter(r => r.wouldWorkAgain).length;
  return Math.round((positive / reviews.length) * 100);
};
