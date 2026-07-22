export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

export const FIREBASE_COLLECTIONS = {
  hero: "hero",
  featuredCuts: "featuredCuts",
  services: "services",
  reviews: "reviews",
  contact: "contact",
  siteSettings: "siteSettings",
  mediaLibrary: "mediaLibrary",
  settings: "settings",
  languages: "languages",
} as const;

export type FirebaseCollectionName = (typeof FIREBASE_COLLECTIONS)[keyof typeof FIREBASE_COLLECTIONS];

export const FIREBASE_STORAGE_FOLDERS = {
  heroVideo: "hero-video",
  hero: "hero",
  gallery: "gallery",
  reviews: "reviews",
  logo: "logo",
  general: "general",
  avatars: "avatars",
} as const;

export type FirebaseStorageFolder = (typeof FIREBASE_STORAGE_FOLDERS)[keyof typeof FIREBASE_STORAGE_FOLDERS];

export const AUTH_COOKIE_NAMES = {
  session: "ac_admin_session",
  role: "ac_user_role",
} as const;

export const AUTH_ROLES = {
  admin: "admin",
} as const;

export function getFirebaseAdminConfig(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase admin configuration is missing. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.");
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

export function isFirebaseClientConfigured(): boolean {
  return Boolean(
    firebaseClientConfig.apiKey &&
      firebaseClientConfig.authDomain &&
      firebaseClientConfig.projectId &&
      firebaseClientConfig.storageBucket &&
      firebaseClientConfig.messagingSenderId &&
      firebaseClientConfig.appId,
  );
}
