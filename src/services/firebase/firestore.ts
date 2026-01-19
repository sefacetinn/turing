import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';

// ============================================
// GENERIC CRUD OPERATIONS
// ============================================

// Get single document
export async function getDocument<T>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

// Get multiple documents with query
export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
}

// Add new document
export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}

// Update document
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

// Delete document
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// ============================================
// REAL-TIME LISTENERS
// ============================================

// Listen to single document
export function subscribeToDocument<T>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
): Unsubscribe {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as T);
    } else {
      callback(null);
    }
  });
}

// Listen to collection
export function subscribeToCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void
): Unsubscribe {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (querySnapshot) => {
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
    callback(data);
  });
}

// ============================================
// PAGINATION HELPER
// ============================================

export interface PaginatedResult<T> {
  data: T[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

export async function getPaginatedDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  pageSize: number,
  lastDoc?: QueryDocumentSnapshot
): Promise<PaginatedResult<T>> {
  try {
    let q = query(collection(db, collectionName), ...constraints, limit(pageSize + 1));

    if (lastDoc) {
      q = query(collection(db, collectionName), ...constraints, startAfter(lastDoc), limit(pageSize + 1));
    }

    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageSize;

    if (hasMore) {
      docs.pop(); // Remove the extra document
    }

    return {
      data: docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[],
      lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
      hasMore,
    };
  } catch (error) {
    console.error('Error getting paginated documents:', error);
    throw error;
  }
}

// ============================================
// COLLECTION NAMES
// ============================================

export const Collections = {
  USERS: 'users',
  EVENTS: 'events',
  PROVIDERS: 'providers',
  ARTISTS: 'artists',
  OFFERS: 'offers',
  CONTRACTS: 'contracts',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  TRANSACTIONS: 'transactions',
} as const;

// Re-export query helpers
export { where, orderBy, limit, startAfter, query };
