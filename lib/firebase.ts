import type {Analytics} from "firebase/analytics";

export {getFirebaseAuth, getFirebaseClientApp, getFirebaseStorage, getFirestoreDb} from "@/lib/firebase/client";
export {
  contentCollections,
  getTypedCollection,
  getTypedDocumentRef,
} from "@/lib/firebase/firestore";
export {
  sendAdminPasswordReset,
  signInAdminWithEmailPassword,
  signOutAdmin,
  subscribeToAdminAuthState,
} from "@/lib/firebase/auth";

let analyticsInstance: Analytics | null = null;
let analyticsInitPromise: Promise<Analytics | null> | null = null;

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (analyticsInstance) {
    return analyticsInstance;
  }

  if (analyticsInitPromise) {
    return analyticsInitPromise;
  }

  analyticsInitPromise = (async () => {
    const analyticsModule = await import("firebase/analytics");
    const isSupported = analyticsModule.isSupported;

    const supported = await isSupported().catch(() => false);

    if (!supported) {
      return null;
    }

    const app = (await import("@/lib/firebase/client")).getFirebaseClientApp();
    analyticsInstance = analyticsModule.getAnalytics(app);
    return analyticsInstance;
  })();

  return analyticsInitPromise;
}