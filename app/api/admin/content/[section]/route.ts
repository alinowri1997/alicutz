import {NextRequest, NextResponse} from "next/server";

import {
  adminContentSectionSchema,
  createContentSchema,
  reorderSchema,
} from "@/lib/schemas/admin-cms";
import {
  createSectionDocument,
  listSectionDocuments,
  reorderSectionDocuments,
} from "@/services/firestore/admin-content-service";
import {requireAdmin} from "@/services/auth/require-admin";

export async function GET(
  _req: NextRequest,
  {params}: {params: Promise<{section: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {section: rawSection} = await params;
    const section = adminContentSectionSchema.parse(rawSection);
    const data = await listSectionDocuments(section);

    return NextResponse.json({success: true, data}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch content.",
      },
      {status: 400},
    );
  }
}

export async function POST(
  req: NextRequest,
  {params}: {params: Promise<{section: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {section: rawSection} = await params;
    const section = adminContentSectionSchema.parse(rawSection);
    const payload = createContentSchema.parse(await req.json());
    const created = await createSectionDocument(section, payload.data, payload.id);

    return NextResponse.json({success: true, data: created}, {status: 201});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create content.",
      },
      {status: 400},
    );
  }
}

export async function PATCH(
  req: NextRequest,
  {params}: {params: Promise<{section: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {section: rawSection} = await params;
    const section = adminContentSectionSchema.parse(rawSection);
    const payload = reorderSchema.parse(await req.json());

    await reorderSectionDocuments(section, payload.ids);

    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to reorder content.",
      },
      {status: 400},
    );
  }
}
