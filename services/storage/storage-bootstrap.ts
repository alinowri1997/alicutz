import "server-only";

import { FIREBASE_STORAGE_FOLDERS } from "@/config/firebase";
import { getAdminStorage } from "@/lib/firebase/admin";

const FOLDER_PLACEHOLDER_FILE = ".keep";

export async function ensureStorageFolders(): Promise<void> {
  const bucket = getAdminStorage().bucket();

  const folders = [
    FIREBASE_STORAGE_FOLDERS.heroVideo,
    FIREBASE_STORAGE_FOLDERS.hero,
    FIREBASE_STORAGE_FOLDERS.gallery,
    FIREBASE_STORAGE_FOLDERS.reviews,
    FIREBASE_STORAGE_FOLDERS.logo,
    FIREBASE_STORAGE_FOLDERS.general,
    FIREBASE_STORAGE_FOLDERS.avatars,
  ];

  await Promise.all(
    folders.map(async (folder) => {
      const path = `${folder}/${FOLDER_PLACEHOLDER_FILE}`;
      const file = bucket.file(path);
      const [exists] = await file.exists();

      if (!exists) {
        await file.save("", { resumable: false, metadata: { contentType: "text/plain" } });
      }
    }),
  );
}
