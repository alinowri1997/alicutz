import "server-only";

import {FieldValue, Timestamp} from "firebase-admin/firestore";

import {getAdminDb, getAdminStorage} from "@/lib/firebase/admin";
import {
  ADMIN_MEDIA_FOLDERS,
  type AdminMediaFolder,
  type MediaAsset,
} from "@/types/admin-cms";

const MEDIA_COLLECTION = "mediaLibrary";

const FOLDER_PREFIX: Record<AdminMediaFolder, string> = {
  Hero: "hero",
  Gallery: "gallery",
  Reviews: "reviews",
  Logo: "logo",
  General: "general",
};

function toSerializable<T extends Record<string, unknown>>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, raw) => {
      if (raw instanceof Timestamp) {
        return raw.toDate().toISOString();
      }

      return raw;
    }),
  ) as T;
}

function buildStoragePath(folder: AdminMediaFolder, fileName: string): string {
  const safeName = fileName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
  return `${FOLDER_PREFIX[folder]}/${Date.now()}-${safeName}`;
}

function getFolderFromPath(path: string): AdminMediaFolder {
  const [prefix] = path.split("/");

  const found = Object.entries(FOLDER_PREFIX).find(([, value]) => value === prefix)?.[0];

  if (!found) {
    return "General";
  }

  return found as AdminMediaFolder;
}

export async function listMediaAssets(folder?: AdminMediaFolder): Promise<MediaAsset[]> {
  let query = getAdminDb().collection(MEDIA_COLLECTION).orderBy("createdAt", "desc");

  if (folder) {
    query = query.where("folder", "==", folder) as typeof query;
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => toSerializable({id: doc.id, ...doc.data()}) as MediaAsset);
}

export async function uploadMediaAsset(folder: AdminMediaFolder, file: File): Promise<MediaAsset> {
  if (!ADMIN_MEDIA_FOLDERS.includes(folder)) {
    throw new Error("Invalid media folder.");
  }

  const storagePath = buildStoragePath(folder, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  const bucket = getAdminStorage().bucket();
  const target = bucket.file(storagePath);

  await target.save(buffer, {
    resumable: false,
    metadata: {
      contentType: file.type || "application/octet-stream",
    },
  });

  await target.makePublic();

  const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

  const docRef = await getAdminDb().collection(MEDIA_COLLECTION).add({
    folder,
    fileName: file.name,
    storagePath,
    contentType: file.type || "application/octet-stream",
    size: file.size,
    downloadUrl,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    id: docRef.id,
    folder,
    fileName: file.name,
    storagePath,
    contentType: file.type || "application/octet-stream",
    size: file.size,
    downloadUrl,
  };
}

export async function renameMediaAsset(id: string, fileName: string): Promise<MediaAsset> {
  const ref = getAdminDb().collection(MEDIA_COLLECTION).doc(id);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new Error("Media asset not found.");
  }

  const existing = snapshot.data() as MediaAsset;
  const oldPath = existing.storagePath;
  const nextPath = buildStoragePath(existing.folder, fileName);

  const bucket = getAdminStorage().bucket();
  const source = bucket.file(oldPath);
  const destination = bucket.file(nextPath);

  await source.copy(destination);
  await source.delete({ignoreNotFound: true});
  await destination.makePublic();

  const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${nextPath}`;

  await ref.update({
    fileName,
    storagePath: nextPath,
    downloadUrl,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    ...existing,
    id,
    fileName,
    storagePath: nextPath,
    downloadUrl,
  };
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const ref = getAdminDb().collection(MEDIA_COLLECTION).doc(id);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return;
  }

  const existing = snapshot.data() as MediaAsset;
  const bucket = getAdminStorage().bucket();
  await bucket.file(existing.storagePath).delete({ignoreNotFound: true});
  await ref.delete();
}

export async function inferFolderFromPath(path: string): Promise<AdminMediaFolder> {
  return getFolderFromPath(path);
}
