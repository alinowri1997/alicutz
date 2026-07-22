import { collection, doc, type CollectionReference, type DocumentReference } from "firebase/firestore";

import { FIREBASE_COLLECTIONS, type FirebaseCollectionName } from "@/config/firebase";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { GalleryImage, Hero, LanguageEntry, Review, Service, Settings } from "@/types/content";

export function getTypedCollection<T>(name: FirebaseCollectionName): CollectionReference<T> {
  return collection(getFirestoreDb(), name) as CollectionReference<T>;
}

export function getTypedDocumentRef<T>(name: FirebaseCollectionName, id: string): DocumentReference<T> {
  return doc(getFirestoreDb(), name, id) as DocumentReference<T>;
}

export const contentCollections = {
  hero: getTypedCollection<Hero>(FIREBASE_COLLECTIONS.hero),
  featuredCuts: getTypedCollection<GalleryImage>(FIREBASE_COLLECTIONS.featuredCuts),
  services: getTypedCollection<Service>(FIREBASE_COLLECTIONS.services),
  reviews: getTypedCollection<Review>(FIREBASE_COLLECTIONS.reviews),
  settings: getTypedCollection<Settings>(FIREBASE_COLLECTIONS.settings),
  languages: getTypedCollection<LanguageEntry>(FIREBASE_COLLECTIONS.languages),
};
