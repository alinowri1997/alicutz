import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";

import { AUTH_ROLES } from "@/config/firebase";
import { getFirebaseAuth } from "@/lib/firebase/client";
import type { AuthenticatedUser, UserRole } from "@/types/auth";

export async function signInAdminWithEmailPassword(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return credential.user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export async function sendAdminPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

export function subscribeToAdminAuthState(
  callback: (user: AuthenticatedUser | null) => void,
): Unsubscribe {
  return onAuthStateChanged(getFirebaseAuth(), async (user) => {
    if (!user) {
      callback(null);
      return;
    }

    const tokenResult = await user.getIdTokenResult();
    const role = (tokenResult.claims.role as UserRole | undefined) ?? AUTH_ROLES.admin;

    callback({
      uid: user.uid,
      email: user.email,
      role,
    });
  });
}
