/**
 * Firestore Seed Data
 * Bu dosya demo/test verileri ile veritabanını doldurur.
 * Sadece geliştirme ortamında kullanılmalıdır.
 */

import { collection, doc, setDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from './config';

// ============================================
// SEED DATA
// ============================================

const providers = [
  {
    id: 'provider_eventpro360',
    companyName: 'EventPro 360',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
    description: 'Profesyonel etkinlik prodüksiyon ve teknik hizmetler.',
    services: ['technical', 'sound-light', 'stage'],
    rating: 4.9,
    reviewCount: 156,
    completedJobs: 234,
    responseRate: 98,
    location: { city: 'Istanbul', address: 'Levent, Istanbul' },
    pricing: { minPrice: 50000, maxPrice: 500000, currency: 'TRY' },
    tags: ['ses sistemi', 'ışık', 'sahne', 'LED ekran'],
    isVerified: true,
    isActive: true,
    isFeatured: true,
  },
  {
    id: 'provider_lezzet',
    companyName: 'Lezzet Catering',
    logo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200',
    description: 'Premium catering ve ikram hizmetleri.',
    services: ['catering'],
    rating: 4.8,
    reviewCount: 89,
    completedJobs: 145,
    responseRate: 95,
    location: { city: 'Istanbul', address: 'Kadıköy, Istanbul' },
    pricing: { minPrice: 20000, maxPrice: 200000, currency: 'TRY' },
    tags: ['catering', 'ikram', 'kokteyl', 'gala yemeği'],
    isVerified: true,
    isActive: true,
    isFeatured: false,
  },
  {
    id: 'provider_guardpro',
    companyName: 'GuardPro Güvenlik',
    logo: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200',
    description: 'Profesyonel etkinlik güvenlik hizmetleri.',
    services: ['security'],
    rating: 4.7,
    reviewCount: 67,
    completedJobs: 189,
    responseRate: 92,
    location: { city: 'Istanbul', address: 'Şişli, Istanbul' },
    pricing: { minPrice: 10000, maxPrice: 100000, currency: 'TRY' },
    tags: ['güvenlik', 'koruma', 'VIP', 'etkinlik güvenliği'],
    isVerified: true,
    isActive: true,
    isFeatured: false,
  },
];

const artists = [
  {
    id: 'artist_tarkan',
    name: 'Tarkan',
    stageName: 'Megastar',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    genre: ['Pop', 'Dance'],
    bio: 'Türk pop müziğinin efsanevi ismi.',
    nationality: 'Türkiye',
    stats: { monthlyListeners: 5000000, followers: 8000000, rating: 5.0, reviewCount: 89 },
    pricing: { minPrice: 2000000, maxPrice: 5000000, currency: 'TRY' },
    availability: 'limited',
    isVerified: true,
    isFeatured: true,
  },
  {
    id: 'artist_sila',
    name: 'Sıla',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    genre: ['Pop', 'Soul'],
    bio: 'Güçlü vokali ve sahne performansıyla tanınan sanatçı.',
    nationality: 'Türkiye',
    stats: { monthlyListeners: 3500000, followers: 5000000, rating: 4.9, reviewCount: 67 },
    pricing: { minPrice: 800000, maxPrice: 1500000, currency: 'TRY' },
    availability: 'available',
    isVerified: true,
    isFeatured: true,
  },
  {
    id: 'artist_mabel',
    name: 'Mabel Matiz',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
    genre: ['Alternatif', 'Elektro-Pop'],
    bio: 'Türk alternatif müziğinin öncü ismi.',
    nationality: 'Türkiye',
    stats: { monthlyListeners: 2800000, followers: 3500000, rating: 4.8, reviewCount: 45 },
    pricing: { minPrice: 500000, maxPrice: 900000, currency: 'TRY' },
    availability: 'available',
    isVerified: true,
    isFeatured: false,
  },
];

const serviceCategories = [
  { id: 'booking', name: 'Booking & Sanatçı', icon: 'musical-notes' },
  { id: 'technical', name: 'Teknik Prodüksiyon', icon: 'settings' },
  { id: 'sound-light', name: 'Ses & Işık', icon: 'volume-high' },
  { id: 'catering', name: 'Catering', icon: 'restaurant' },
  { id: 'security', name: 'Güvenlik', icon: 'shield-checkmark' },
  { id: 'transport', name: 'Ulaşım & Lojistik', icon: 'car' },
  { id: 'venue', name: 'Mekan', icon: 'business' },
  { id: 'stage', name: 'Sahne Kurulum', icon: 'cube' },
];

// ============================================
// SEED FUNCTIONS
// ============================================

export async function seedProviders(): Promise<void> {
  console.log('Seeding providers...');
  const batch = writeBatch(db);

  for (const provider of providers) {
    const docRef = doc(db, 'providers', provider.id);
    batch.set(docRef, {
      ...provider,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  await batch.commit();
  console.log(`Seeded ${providers.length} providers.`);
}

export async function seedArtists(): Promise<void> {
  console.log('Seeding artists...');
  const batch = writeBatch(db);

  for (const artist of artists) {
    const docRef = doc(db, 'artists', artist.id);
    batch.set(docRef, {
      ...artist,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  await batch.commit();
  console.log(`Seeded ${artists.length} artists.`);
}

export async function seedCategories(): Promise<void> {
  console.log('Seeding service categories...');
  const batch = writeBatch(db);

  for (const category of serviceCategories) {
    const docRef = doc(db, 'categories', category.id);
    batch.set(docRef, {
      ...category,
      createdAt: Timestamp.now(),
    });
  }

  await batch.commit();
  console.log(`Seeded ${serviceCategories.length} categories.`);
}

export async function seedAll(): Promise<void> {
  console.log('Starting database seed...');

  try {
    await seedCategories();
    await seedProviders();
    await seedArtists();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.warn('Error seeding database:', error);
    throw error;
  }
}

// Demo user for testing
export const demoUsers = {
  organizer: {
    email: 'demo-organizer@turing.app',
    password: 'Demo123!',
    displayName: 'Demo Organizatör',
    role: 'organizer' as const,
    companyName: 'Demo Events',
  },
  provider: {
    email: 'demo-provider@turing.app',
    password: 'Demo123!',
    displayName: 'Demo Provider',
    role: 'provider' as const,
    companyName: 'Demo Productions',
    providerServices: ['technical', 'sound-light'],
  },
};
