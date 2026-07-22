import "server-only";

import {
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";

import {getAdminDb} from "@/lib/firebase/admin";
import {
  ADMIN_SINGLETON_SECTIONS,
  type AdminContentSection,
  type CmsDocument,
  type WorkflowAction,
} from "@/types/admin-cms";

const SECTION_COLLECTIONS: Record<AdminContentSection, string> = {
  hero: "hero",
  featuredCuts: "featuredCuts",
  services: "services",
  reviews: "reviews",
  contact: "contact",
  siteSettings: "siteSettings",
};

function isSingletonSection(section: AdminContentSection): boolean {
  return ADMIN_SINGLETON_SECTIONS.includes(section);
}

function serializeTimestamps<T extends object>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, raw) => {
      if (raw instanceof Timestamp) {
        return raw.toDate().toISOString();
      }

      return raw;
    }),
  ) as T;
}

function getCollection(section: AdminContentSection) {
  return getAdminDb().collection(SECTION_COLLECTIONS[section]);
}

export async function listSectionDocuments<T extends object>(
  section: AdminContentSection,
): Promise<Array<CmsDocument<T>>> {
  const snapshot = await getCollection(section).orderBy("order", "asc").get();

  return snapshot.docs.map((item, index) => {
    const raw = item.data() as Omit<CmsDocument<T>, "id" | "order"> & {order?: number};
    return serializeTimestamps({
      id: item.id,
      section,
      order: raw.order ?? index,
      status: raw.status ?? "draft",
      data: raw.data,
      publishedData: raw.publishedData ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }) as CmsDocument<T>;
  });
}

export async function getSectionDocument<T extends object>(
  section: AdminContentSection,
  id: string,
): Promise<CmsDocument<T> | null> {
  const ref = getCollection(section).doc(id);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return null;
  }

  const raw = snapshot.data() as Omit<CmsDocument<T>, "id">;

  return serializeTimestamps({
    id: snapshot.id,
    ...raw,
  }) as CmsDocument<T>;
}

export async function createSectionDocument<T extends object>(
  section: AdminContentSection,
  input: T,
  id?: string,
): Promise<CmsDocument<T>> {
  const collection = getCollection(section);

  if (isSingletonSection(section)) {
    const singletonId = id ?? "primary";
    const ref = collection.doc(singletonId);
    const existing = await ref.get();

    if (existing.exists) {
      return updateSectionDocument(section, singletonId, input);
    }

    const payload = {
      section,
      order: 0,
      status: "draft",
      data: input,
      publishedData: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await ref.set(payload);

    return {
      id: ref.id,
      section,
      order: 0,
      status: "draft",
      data: input,
      publishedData: null,
    } as CmsDocument<T>;
  }

  const countSnapshot = await collection.count().get();
  const nextOrder = countSnapshot.data().count;

  const created = await collection.add({
    section,
    order: nextOrder,
    status: "draft",
    data: input,
    publishedData: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    id: created.id,
    section,
    order: nextOrder,
    status: "draft",
    data: input,
    publishedData: null,
  } as CmsDocument<T>;
}

export async function updateSectionDocument<T extends object>(
  section: AdminContentSection,
  id: string,
  input: Partial<T>,
): Promise<CmsDocument<T>> {
  const ref = getCollection(section).doc(id);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new Error("Document not found.");
  }

  const existing = snapshot.data() as CmsDocument<T>;
  const nextData = {
    ...(existing.data as T),
    ...input,
  };

  await ref.update({
    data: nextData,
    status: "draft",
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    ...existing,
    id,
    data: nextData,
    status: "draft",
  };
}

export async function deleteSectionDocument(section: AdminContentSection, id: string): Promise<void> {
  await getCollection(section).doc(id).delete();
}

export async function reorderSectionDocuments(
  section: AdminContentSection,
  ids: string[],
): Promise<void> {
  const db = getAdminDb();
  const batch = db.batch();

  ids.forEach((id, index) => {
    const ref = getCollection(section).doc(id);
    batch.update(ref, {
      order: index,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
}

export async function applyWorkflowAction<T extends object>(
  section: AdminContentSection,
  id: string,
  action: WorkflowAction,
): Promise<CmsDocument<T>> {
  const ref = getCollection(section).doc(id);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new Error("Document not found.");
  }

  const existing = snapshot.data() as CmsDocument<T>;
  const currentData = existing.data as T;

  if (action === "publish") {
    await ref.update({
      status: "published",
      publishedData: currentData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      ...existing,
      id,
      status: "published",
      publishedData: currentData,
    };
  }

  if (action === "discard") {
    const rollbackData = (existing.publishedData as T | null) ?? currentData;

    await ref.update({
      data: rollbackData,
      status: existing.publishedData ? "published" : "draft",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      ...existing,
      id,
      data: rollbackData,
      status: existing.publishedData ? "published" : "draft",
    };
  }

  if (action === "approve") {
    const nextData = {
      ...(currentData as Record<string, unknown>),
      approved: true,
    } as T;

    await ref.update({
      data: nextData,
      status: "draft",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      ...existing,
      id,
      data: nextData,
      status: "draft",
    };
  }

  if (action === "hide") {
    const nextData = {
      ...(currentData as Record<string, unknown>),
      approved: false,
    } as T;

    await ref.update({
      data: nextData,
      status: "draft",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      ...existing,
      id,
      data: nextData,
      status: "draft",
    };
  }

  if (action === "enable" || action === "disable") {
    const nextData = {
      ...(currentData as Record<string, unknown>),
      enabled: action === "enable",
    } as T;

    await ref.update({
      data: nextData,
      status: "draft",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      ...existing,
      id,
      data: nextData,
      status: "draft",
    };
  }

  throw new Error("Unsupported workflow action.");
}
