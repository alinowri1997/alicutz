import "server-only";

import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import {getAuth, type Auth} from "firebase-admin/auth";
import {getFirestore, type Firestore} from "firebase-admin/firestore";
import {getStorage, type Storage} from "firebase-admin/storage";

import { getFirebaseAdminConfig } from "@/config/firebase";

let adminApp: App | null = null;

export function getFirebaseAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  if (getApps().length > 0) {
    adminApp = getApp();
    return adminApp;
  }

  const config = getFirebaseAdminConfig();

  adminApp = initializeApp({
    credential: cert({
      projectId: config.projectId,
      clientEmail: config.clientEmail,
      privateKey: config.privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return adminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getFirebaseAdminApp());
}

export function getAdminStorage(): Storage {
  return getStorage(getFirebaseAdminApp());
}
