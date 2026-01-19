// Firebase Configuration
export { app, auth, db, storage } from './config';

// Schema Types
export * from './schema';

// Seed Data (for development)
export { seedAll, demoUsers } from './seed';

// Authentication
export {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  onAuthChange,
  getCurrentUser,
  getAuthErrorMessage,
  type UserProfile,
} from './auth';

// Firestore
export {
  getDocument,
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  subscribeToDocument,
  subscribeToCollection,
  getPaginatedDocuments,
  Collections,
  where,
  orderBy,
  limit,
  startAfter,
  query,
  type PaginatedResult,
} from './firestore';

// Storage
export {
  uploadFile,
  uploadFileWithProgress,
  getFileURL,
  deleteFile,
  listFiles,
  uploadProfileImage,
  uploadEventImage,
  uploadPortfolioImage,
  uploadArtistImage,
  uploadContractDocument,
  uriToBlob,
  generateFileName,
} from './storage';
