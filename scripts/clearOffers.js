// Script to clear all offers from Firebase
// Run with: node scripts/clearOffers.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearOffers() {
  console.log('Fetching all offers...');

  const offersRef = collection(db, 'offers');
  const snapshot = await getDocs(offersRef);

  console.log(`Found ${snapshot.docs.length} offers to delete`);

  for (const docSnapshot of snapshot.docs) {
    console.log(`Deleting offer: ${docSnapshot.id}`);
    await deleteDoc(doc(db, 'offers', docSnapshot.id));
  }

  console.log('All offers deleted successfully!');
  process.exit(0);
}

clearOffers().catch((error) => {
  console.error('Error clearing offers:', error);
  process.exit(1);
});
