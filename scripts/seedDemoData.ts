/**
 * Firebase Demo Data Seed Script
 *
 * Bu script demo hesapları ve örnek verileri Firebase'e yükler.
 *
 * Kullanım:
 * npx ts-node scripts/seedDemoData.ts
 *
 * Demo Hesapları:
 * - demo@organizer.com (Organizatör)
 * - demo@provider.com (Sağlayıcı)
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';

// Firebase config - .env'den alınacak
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Demo kullanıcıları
const DEMO_USERS = {
  organizer: {
    email: 'demo@organizer.com',
    password: 'demo123456',
    profile: {
      displayName: 'Ahmet Yılmaz',
      companyName: 'Pozitif Live',
      role: 'organizer',
      isProvider: false,
      isOrganizer: true,
      phone: '+90 532 123 4567',
      city: 'İstanbul',
      bio: 'Türkiye\'nin önde gelen etkinlik organizatörlerinden.',
      isVerified: true,
      isActive: true,
    }
  },
  provider: {
    email: 'demo@provider.com',
    password: 'demo123456',
    profile: {
      displayName: 'Ali Vural',
      companyName: 'Mega Sound Pro',
      role: 'provider',
      isProvider: true,
      isOrganizer: false,
      phone: '+90 533 987 6543',
      city: 'İstanbul',
      bio: 'Profesyonel ses ve ışık sistemleri.',
      providerServices: ['technical', 'sound-light'],
      isVerified: true,
      isActive: true,
    }
  }
};

// Demo etkinlikler
const DEMO_EVENTS = [
  {
    title: 'Big Bang Summer Festival 2026',
    description: 'Türkiye\'nin en büyük yaz festivali',
    date: '2026-07-15',
    time: '18:00',
    city: 'İstanbul',
    district: 'Beşiktaş',
    venue: 'KüçükÇiftlik Park',
    status: 'planning',
    budget: 5000000,
    expectedAttendees: 25000,
  },
  {
    title: 'Vodafone Park Konseri - Sıla',
    description: 'Sıla açık hava konseri',
    date: '2026-08-20',
    time: '21:00',
    city: 'İstanbul',
    district: 'Beşiktaş',
    venue: 'Vodafone Park',
    status: 'confirmed',
    budget: 3000000,
    expectedAttendees: 40000,
  },
  {
    title: 'Kurumsal Yılbaşı Gecesi',
    description: 'Şirket yılbaşı kutlaması',
    date: '2026-12-31',
    time: '20:00',
    city: 'İstanbul',
    district: 'Şişli',
    venue: 'Hilton Bosphorus',
    status: 'draft',
    budget: 500000,
    expectedAttendees: 500,
  }
];

// Demo teklifler
const DEMO_OFFERS = [
  {
    eventTitle: 'Big Bang Summer Festival 2026',
    serviceCategory: 'technical',
    amount: 450000,
    status: 'pending',
    message: 'Ana sahne ses sistemi için teklifimiz',
  },
  {
    eventTitle: 'Vodafone Park Konseri',
    serviceCategory: 'technical',
    amount: 280000,
    status: 'accepted',
    message: 'Konser ses ve ışık sistemi',
  }
];

async function createDemoUser(type: 'organizer' | 'provider') {
  const userData = DEMO_USERS[type];

  try {
    // Kullanıcı oluştur
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const uid = userCredential.user.uid;

    // Profil bilgilerini kaydet
    await setDoc(doc(db, 'users', uid), {
      ...userData.profile,
      uid,
      email: userData.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✓ ${type} kullanıcısı oluşturuldu: ${userData.email}`);
    return uid;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠ ${type} kullanıcısı zaten mevcut: ${userData.email}`);
    } else {
      console.error(`✗ ${type} kullanıcısı oluşturulamadı:`, error.message);
    }
    return null;
  }
}

async function createDemoEvents(organizerId: string) {
  for (const event of DEMO_EVENTS) {
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...event,
        organizerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✓ Etkinlik oluşturuldu: ${event.title}`);
    } catch (error: any) {
      console.error(`✗ Etkinlik oluşturulamadı: ${event.title}`, error.message);
    }
  }
}

async function createDemoOffers(organizerId: string, providerId: string) {
  for (const offer of DEMO_OFFERS) {
    try {
      await addDoc(collection(db, 'offers'), {
        ...offer,
        organizerId,
        providerId,
        organizerName: DEMO_USERS.organizer.profile.displayName,
        providerName: DEMO_USERS.provider.profile.displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✓ Teklif oluşturuldu: ${offer.eventTitle}`);
    } catch (error: any) {
      console.error(`✗ Teklif oluşturulamadı:`, error.message);
    }
  }
}

async function seedDemoData() {
  console.log('\n🚀 Demo verileri yükleniyor...\n');

  // Demo kullanıcıları oluştur
  const organizerId = await createDemoUser('organizer');
  const providerId = await createDemoUser('provider');

  if (organizerId && providerId) {
    // Demo etkinlikler oluştur
    console.log('\n📅 Etkinlikler oluşturuluyor...');
    await createDemoEvents(organizerId);

    // Demo teklifler oluştur
    console.log('\n💼 Teklifler oluşturuluyor...');
    await createDemoOffers(organizerId, providerId);
  }

  console.log('\n✅ Demo verileri yüklendi!\n');
  console.log('Demo hesapları:');
  console.log(`  Organizatör: ${DEMO_USERS.organizer.email} / ${DEMO_USERS.organizer.password}`);
  console.log(`  Sağlayıcı: ${DEMO_USERS.provider.email} / ${DEMO_USERS.provider.password}`);

  process.exit(0);
}

// Script'i çalıştır
seedDemoData().catch(console.error);
