const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

async function deleteSeedUsers() {
  try {
    // Find users with booking in providerServices
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('providerServices', 'array-contains', 'booking'));
    const snapshot = await getDocs(q);
    
    console.log('Found', snapshot.docs.length, 'booking providers:');
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      console.log('-', docSnap.id, ':', data.companyName || data.displayName, '| verified:', data.isVerified);
      
      // Delete the seed one (lowercase "Gd menajerlik" or not verified)
      if (data.companyName === 'Gd menajerlik' || 
          (data.displayName === 'Gd menajerlik' && !data.isVerified)) {
        console.log('  -> Deleting seed user:', docSnap.id);
        await deleteDoc(doc(db, 'users', docSnap.id));
        console.log('  -> Deleted!');
      }
    }
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteSeedUsers();
