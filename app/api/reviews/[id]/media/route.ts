/**
 * POST /api/reviews/[id]/media - Upload media to review
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, UploadMediaResponse } from '@/lib/types/reviews';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<UploadMediaResponse>>> {
  try {
    const { id: reviewId } = await params;
    const formData = await req.formData();

    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'File is required',
          },
        },
        { status: 400 }
      );
    }

    // Determine media type from file
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'File must be an image or video',
          },
        },
        { status: 400 }
      );
    }

    // TODO: Call uploadMedia utility and store metadata in database
    // For now, return mock response
    const mediaResponse: UploadMediaResponse = {
      id: crypto.randomUUID(),
      storage_path: `reviews/${reviewId}/${file.name}`,
      media_type: isImage ? 'image' : 'video',
      file_size: file.size,
    };

    return NextResponse.json(
      {
        success: true,
        data: mediaResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: error instanceof Error ? error.message : 'Failed to upload media',
        },
      },
      { status: 500 }
    );
  }
}
