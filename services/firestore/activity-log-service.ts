import "server-only";

import {FieldValue, Timestamp} from "firebase-admin/firestore";

import {getAdminDb} from "@/lib/firebase/admin";
import type {ActivityLogEntry} from "@/types/admin-cms";
import type {AdminSessionPayload} from "@/types/auth";

const ACTIVITY_COLLECTION = "activityLog";

function serialize<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, raw) => {
      if (raw instanceof Timestamp) {
        return raw.toDate().toISOString();
      }

      return raw;
    }),
  ) as T;
}

export interface CreateActivityLogInput {
  session: AdminSessionPayload;
  action: string;
  targetType: string;
  targetId?: string;
  targetSection?: string;
  metadata?: Record<string, unknown>;
}

export async function createActivityLog(input: CreateActivityLogInput): Promise<void> {
  await getAdminDb().collection(ACTIVITY_COLLECTION).add({
    actorUid: input.session.uid,
    actorEmail: input.session.email,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    targetSection: input.targetSection ?? null,
    metadata: input.metadata ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function listActivityLogs(limit: number = 50): Promise<ActivityLogEntry[]> {
  const snapshot = await getAdminDb()
    .collection(ACTIVITY_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => serialize({id: doc.id, ...doc.data()}) as ActivityLogEntry);
}
