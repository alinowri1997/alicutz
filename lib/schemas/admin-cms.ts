import {z} from "zod";

import {
  ADMIN_CONTENT_SECTIONS,
  ADMIN_MEDIA_FOLDERS,
  type AdminContentSection,
  type AdminMediaFolder,
} from "@/types/admin-cms";

export const adminContentSectionSchema = z.custom<AdminContentSection>((value) => {
  return typeof value === "string" && ADMIN_CONTENT_SECTIONS.includes(value as AdminContentSection);
});

export const workflowActionSchema = z.enum(["publish", "discard", "approve", "hide", "enable", "disable"]);

export const createContentSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  id: z.string().min(1).optional(),
});

export const updateContentSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

export const reorderSchema = z.object({
  action: z.literal("reorder"),
  ids: z.array(z.string().min(1)).min(1),
});

export const workflowSchema = z.object({
  action: workflowActionSchema,
});

export const mediaFolderSchema = z.custom<AdminMediaFolder>((value) => {
  return typeof value === "string" && ADMIN_MEDIA_FOLDERS.includes(value as AdminMediaFolder);
});

export const mediaRenameSchema = z.object({
  fileName: z.string().min(1),
});
