import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { firebaseClientConfig, isFirebaseClientConfigured } from "@/config/firebase";

let firebaseApp: FirebaseApp | null = null;

export function getFirebaseClientApp(): FirebaseApp {
  if (!isFirebaseClientConfigured()) {
    throw new Error("Firebase client configuration is incomplete.");
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseClientConfig);
  return firebaseApp;
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseClientApp());
}

export function getFirestoreDb() {
  return getFirestore(getFirebaseClientApp());
}

export function getFirebaseStorage() {
  return getStorage(getFirebaseClientApp());
}
