/**
 * Media Upload Utilities
 * Handle image and video uploads to Supabase Storage
 */

import { getSupabaseBrowser } from '@/lib/supabase/client';
import type { UploadMediaResponse, MediaType } from '@/lib/types/reviews';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

interface MediaDimensions {
  width: number;
  height: number;
}

interface VideoDuration {
  duration: number;
}

/**
 * Get image dimensions
 */
async function getImageDimensions(file: File): Promise<MediaDimensions> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('Failed to read image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get video duration
 */
async function getVideoDuration(file: File): Promise<VideoDuration> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve({ duration: video.duration });
      };
      video.onerror = () => reject(new Error('Failed to read video'));
      video.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate media file
 */
export function validateMediaFile(file: File, mediaType: MediaType): { valid: boolean; error?: string } {
  if (mediaType === 'image') {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid image format. Use JPEG, PNG, or WebP.' };
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return { valid: false, error: 'Image size exceeds 10MB limit.' };
    }
  } else if (mediaType === 'video') {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid video format. Use MP4 or WebM.' };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'Video size exceeds 50MB limit.' };
    }
  }
  return { valid: true };
}

/**
 * Upload media file to Supabase Storage
 */
export async function uploadMedia(
  reviewId: string,
  file: File,
  mediaType: MediaType
): Promise<UploadMediaResponse> {
  // Validate file
  const validation = validateMediaFile(file, mediaType);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = file.name.split('.').pop();
  const filename = `${reviewId}/${mediaType}/${timestamp}-${randomStr}.${ext}`;

  // Upload to storage
  const bucketName = mediaType === 'image' ? 'review-images' : 'review-videos';
  const { data, error } = await getSupabaseBrowser().storage
    .from(bucketName)
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get metadata
  let dimensions: MediaDimensions | undefined;
  let duration: VideoDuration | undefined;

  if (mediaType === 'image') {
    dimensions = await getImageDimensions(file);
  } else {
    duration = await getVideoDuration(file);
  }

  return {
    id: crypto.randomUUID(),
    storage_path: data.path,
    media_type: mediaType,
    file_size: file.size,
    width: dimensions?.width,
    height: dimensions?.height,
    duration_seconds: duration?.duration,
  };
}

/**
 * Delete media file from Supabase Storage
 */
export async function deleteMedia(storagePath: string, mediaType: MediaType): Promise<void> {
  const bucketName = mediaType === 'image' ? 'review-images' : 'review-videos';
  const { error } = await getSupabaseBrowser().storage.from(bucketName).remove([storagePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Get signed URL for media (for private access)
 */
export async function getSignedMediaUrl(
  storagePath: string,
  mediaType: MediaType,
  expiresIn: number = 3600
): Promise<string> {
  const bucketName = mediaType === 'image' ? 'review-images' : 'review-videos';
  const { data, error } = await getSupabaseBrowser().storage
    .from(bucketName)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    throw new Error(`Failed to get signed URL: ${error.message}`);
  }

  return data.signedUrl;
}
