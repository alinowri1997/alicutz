import {NextRequest, NextResponse} from "next/server";

import {mediaRenameSchema} from "@/lib/schemas/admin-cms";
import {requireAdmin} from "@/services/auth/require-admin";
import {deleteMediaAsset, renameMediaAsset} from "@/services/storage/media-library-service";

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
