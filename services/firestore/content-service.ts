import {
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  type CollectionReference,
} from "firebase/firestore";

import { contentCollections } from "@/lib/firebase/firestore";
import type { GalleryImage, Hero, LanguageEntry, Review, Service, Settings } from "@/types/content";

export interface ContentMap {
  hero: Hero;
  featuredCuts: GalleryImage;
  services: Service;
  reviews: Review;
  settings: Settings;
  languages: LanguageEntry;
}

type ContentKey = keyof ContentMap;

function getCollection<K extends ContentKey>(key: K): CollectionReference<ContentMap[K]> {
  return contentCollections[key] as CollectionReference<ContentMap[K]>;
}

export async function listContent<K extends ContentKey>(key: K): Promise<ContentMap[K][]> {
  const collectionRef = getCollection(key);
  const queryRef = query(collectionRef, orderBy("updatedAt", "desc"));
  const snapshot = await getDocs(queryRef);

  return snapshot.docs.map((item) => item.data());
}

export async function getContentById<K extends ContentKey>(key: K, id: string): Promise<ContentMap[K] | null> {
  const collectionRef = getCollection(key);
  const snapshot = await getDoc(doc(collectionRef, id));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function createContent<K extends ContentKey>(
  key: K,
  payload: Omit<ContentMap[K], "id">,
): Promise<string> {
  const collectionRef = getCollection(key);
  const created = await addDoc(collectionRef, payload);
  return created.id;
}

export async function upsertContent<K extends ContentKey>(
  key: K,
  id: string,
  payload: Omit<ContentMap[K], "id">,
): Promise<void> {
  const collectionRef = getCollection(key);
  await setDoc(doc(collectionRef, id), payload, { merge: true });
}

export async function deleteContent<K extends ContentKey>(key: K, id: string): Promise<void> {
  const collectionRef = getCollection(key);
  await deleteDoc(doc(collectionRef, id));
}
