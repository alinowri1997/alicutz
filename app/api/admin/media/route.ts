import {NextRequest, NextResponse} from "next/server";

import {mediaFolderSchema} from "@/lib/schemas/admin-cms";
import {requireAdmin} from "@/services/auth/require-admin";
import {createActivityLog} from "@/services/firestore/activity-log-service";
import {listMediaAssets, uploadMediaAsset} from "@/services/storage/media-library-service";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const folderParam = req.nextUrl.searchParams.get("folder");
    const folder = folderParam ? mediaFolderSchema.parse(folderParam) : undefined;
    const data = await listMediaAssets(folder);

    return NextResponse.json({success: true, data}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load media.",
      },
      {status: 400},
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const formData = await req.formData();
    const folder = mediaFolderSchema.parse(formData.get("folder"));
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({success: false, message: "File is required."}, {status: 400});
    }

    const asset = await uploadMediaAsset(folder, file);
    await createActivityLog({
      session: auth.session,
      action: "media.upload",
      targetType: "media",
      targetId: asset.id,
      metadata: {folder},
    });

    return NextResponse.json({success: true, data: asset}, {status: 201});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload media.",
      },
      {status: 400},
    );
  }
}
