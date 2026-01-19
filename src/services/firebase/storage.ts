import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTask,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from './config';

// ============================================
// FILE UPLOAD
// ============================================

// Upload file and get download URL
export async function uploadFile(
  path: string,
  file: Blob,
  metadata?: { contentType?: string }
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Upload file with progress tracking
export function uploadFileWithProgress(
  path: string,
  file: Blob,
  onProgress: (progress: number) => void,
  metadata?: { contentType?: string }
): UploadTask {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  uploadTask.on(
    'state_changed',
    (snapshot: UploadTaskSnapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(progress);
    },
    (error) => {
      console.error('Upload error:', error);
    }
  );

  return uploadTask;
}

// Get download URL
export async function getFileURL(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
}

// Delete file
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// List all files in a folder
export async function listFiles(folderPath: string): Promise<string[]> {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    const urls = await Promise.all(
      result.items.map((itemRef) => getDownloadURL(itemRef))
    );
    return urls;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

// ============================================
// IMAGE UPLOAD HELPERS
// ============================================

// Upload profile image
export async function uploadProfileImage(
  userId: string,
  imageBlob: Blob
): Promise<string> {
  const path = `users/${userId}/profile.jpg`;
  return uploadFile(path, imageBlob, { contentType: 'image/jpeg' });
}

// Upload event image
export async function uploadEventImage(
  eventId: string,
  imageBlob: Blob,
  index: number = 0
): Promise<string> {
  const path = `events/${eventId}/image_${index}.jpg`;
  return uploadFile(path, imageBlob, { contentType: 'image/jpeg' });
}

// Upload portfolio image
export async function uploadPortfolioImage(
  providerId: string,
  imageBlob: Blob,
  index: number
): Promise<string> {
  const path = `providers/${providerId}/portfolio/image_${index}.jpg`;
  return uploadFile(path, imageBlob, { contentType: 'image/jpeg' });
}

// Upload artist image
export async function uploadArtistImage(
  artistId: string,
  imageBlob: Blob
): Promise<string> {
  const path = `artists/${artistId}/profile.jpg`;
  return uploadFile(path, imageBlob, { contentType: 'image/jpeg' });
}

// Upload contract document
export async function uploadContractDocument(
  contractId: string,
  documentBlob: Blob,
  fileName: string
): Promise<string> {
  const path = `contracts/${contractId}/${fileName}`;
  return uploadFile(path, documentBlob, { contentType: 'application/pdf' });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Convert URI to Blob (for React Native)
export async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
}

// Generate unique file name
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'jpg';
  return `${timestamp}_${random}.${extension}`;
}
