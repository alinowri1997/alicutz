/**
 * DELETE /api/reviews/[id]/media/[mediaId] - Delete media
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/types/reviews';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const { id: reviewId, mediaId } = await params;

    // TODO: Delete media from storage and database

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete media',
        },
      },
      { status: 500 }
    );
  }
}
