import {NextRequest, NextResponse} from "next/server";

import {mediaRenameSchema} from "@/lib/schemas/admin-cms";
import {requireAdmin} from "@/services/auth/require-admin";
import {createActivityLog} from "@/services/firestore/activity-log-service";
import {deleteMediaAsset, renameMediaAsset, replaceMediaAsset} from "@/services/storage/media-library-service";

export async function PATCH(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {id} = await params;
    const payload = mediaRenameSchema.parse(await req.json());

    const updated = await renameMediaAsset(id, payload.fileName);
    await createActivityLog({
      session: auth.session,
      action: "media.rename",
      targetType: "media",
      targetId: id,
      metadata: {fileName: payload.fileName},
    });
    return NextResponse.json({success: true, data: updated}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to rename media.",
      },
      {status: 400},
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {id} = await params;
    await deleteMediaAsset(id);
    await createActivityLog({
      session: auth.session,
      action: "media.delete",
      targetType: "media",
      targetId: id,
    });

    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete media.",
      },
      {status: 400},
    );
  }
}

export async function PUT(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {id} = await params;
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({success: false, message: "File is required."}, {status: 400});
    }

    const updated = await replaceMediaAsset(id, file);
    await createActivityLog({
      session: auth.session,
      action: "media.replace",
      targetType: "media",
      targetId: id,
    });

    return NextResponse.json({success: true, data: updated}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to replace media.",
      },
      {status: 400},
    );
  }
}
