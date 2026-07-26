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
  get hero(): CollectionReference<Hero> {
    return getTypedCollection<Hero>(FIREBASE_COLLECTIONS.hero);
  },
  get featuredCuts(): CollectionReference<GalleryImage> {
    return getTypedCollection<GalleryImage>(FIREBASE_COLLECTIONS.featuredCuts);
  },
  get services(): CollectionReference<Service> {
    return getTypedCollection<Service>(FIREBASE_COLLECTIONS.services);
  },
  get reviews(): CollectionReference<Review> {
    return getTypedCollection<Review>(FIREBASE_COLLECTIONS.reviews);
  },
  get settings(): CollectionReference<Settings> {
    return getTypedCollection<Settings>(FIREBASE_COLLECTIONS.settings);
  },
  get languages(): CollectionReference<LanguageEntry> {
    return getTypedCollection<LanguageEntry>(FIREBASE_COLLECTIONS.languages);
  },
};
