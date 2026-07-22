import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  type UploadMetadata,
} from "firebase/storage";

import { FIREBASE_STORAGE_FOLDERS, type FirebaseStorageFolder } from "@/config/firebase";
import { getFirebaseStorage } from "@/lib/firebase/client";

function buildStoragePath(folder: FirebaseStorageFolder, filename: string): string {
  return `${folder}/${filename}`;
}

export const storageFolders = {
  heroVideo: FIREBASE_STORAGE_FOLDERS.heroVideo,
  gallery: FIREBASE_STORAGE_FOLDERS.gallery,
  avatars: FIREBASE_STORAGE_FOLDERS.avatars,
} as const;

export async function uploadToStorage(
  folder: FirebaseStorageFolder,
  file: File,
  filename: string,
  metadata?: UploadMetadata,
): Promise<{ path: string; downloadUrl: string }> {
  const path = buildStoragePath(folder, filename);
  const storageRef = ref(getFirebaseStorage(), path);
  await uploadBytes(storageRef, file, metadata);
  const downloadUrl = await getDownloadURL(storageRef);

  return {
    path,
    downloadUrl,
  };
}

export async function removeFromStorage(path: string): Promise<void> {
  const storageRef = ref(getFirebaseStorage(), path);
  await deleteObject(storageRef);
}
