import {NextRequest, NextResponse} from "next/server";

import {
  adminContentSectionSchema,
  updateContentSchema,
  workflowSchema,
} from "@/lib/schemas/admin-cms";
import {requireAdmin} from "@/services/auth/require-admin";
import {
  applyWorkflowAction,
  deleteSectionDocument,
  getSectionDocument,
  updateSectionDocument,
} from "@/services/firestore/admin-content-service";
import {createActivityLog} from "@/services/firestore/activity-log-service";

export async function GET(
  _req: NextRequest,
  {params}: {params: Promise<{section: string; id: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {section: rawSection, id} = await params;
    const section = adminContentSectionSchema.parse(rawSection);
    const data = await getSectionDocument(section, id);

    if (!data) {
      return NextResponse.json({success: false, message: "Not found."}, {status: 404});
    }

    return NextResponse.json({success: true, data}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch document.",
      },
      {status: 400},
    );
  }
}

export async function PUT(
  req: NextRequest,
  {params}: {params: Promise<{section: string; id: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {section: rawSection, id} = await params;
    const section = adminContentSectionSchema.parse(rawSection);
    const payload = updateContentSchema.parse(await req.json());

    const updated = await updateSectionDocument(section, id, payload.data);
    await createActivityLog({
      session: auth.session,
      action: "content.update",
      targetType: "content",
      targetId: id,
      targetSection: section,
    });

    return NextResponse.json({success: true, data: updated}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update document.",
      },
      {status: 400},
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  {params}: {params: Promise<{section: string; id: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {section: rawSection, id} = await params;
    const section = adminContentSectionSchema.parse(rawSection);
    await deleteSectionDocument(section, id);
    await createActivityLog({
      session: auth.session,
      action: "content.delete",
      targetType: "content",
      targetId: id,
      targetSection: section,
    });

    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete document.",
      },
      {status: 400},
    );
  }
}

export async function PATCH(
  req: NextRequest,
  {params}: {params: Promise<{section: string; id: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {section: rawSection, id} = await params;
    const section = adminContentSectionSchema.parse(rawSection);
    const payload = workflowSchema.parse(await req.json());

    const updated = await applyWorkflowAction(section, id, payload.action);
    await createActivityLog({
      session: auth.session,
      action: `content.${payload.action}`,
      targetType: "content",
      targetId: id,
      targetSection: section,
    });

    return NextResponse.json({success: true, data: updated}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to apply workflow action.",
      },
      {status: 400},
    );
  }
}
