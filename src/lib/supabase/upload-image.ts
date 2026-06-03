import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export const AVATARS_BUCKET = "avatars";
export const CHALLENGE_IMAGES_BUCKET = "challenge-images";

export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export function isAllowedImageMimeType(
  mimeType: string
): mimeType is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function getImageExtensionFromMimeType(mimeType: AllowedImageMimeType): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
  }
}

export function validateImageFile(file: File): string | null {
  if (!isAllowedImageMimeType(file.type)) {
    return "invalid_type";
  }
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return "too_large";
  }
  return null;
}

export function buildAvatarStoragePath(
  userId: string,
  mimeType: AllowedImageMimeType
): string {
  const extension = getImageExtensionFromMimeType(mimeType);
  return `${userId}/avatar.${extension}`;
}

export function buildChallengeImageStoragePath(
  challengeId: string,
  mimeType: AllowedImageMimeType
): string {
  const extension = getImageExtensionFromMimeType(mimeType);
  return `${challengeId}/image.${extension}`;
}

export function getStoragePathFromPublicUrl(
  bucket: string,
  publicUrl: string
): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return decodeURIComponent(publicUrl.slice(index + marker.length));
}

type UploadImageParams = {
  supabase: SupabaseClient<Database>;
  bucket: string;
  path: string;
  file: File;
  upsert?: boolean;
};

export async function uploadImageToBucket({
  supabase,
  bucket,
  path,
  file,
  upsert = true,
}: UploadImageParams): Promise<{ publicUrl: string } | { error: string }> {
  const validationError = validateImageFile(file);
  if (validationError) {
    return { error: validationError };
  }

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert,
      contentType: file.type,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: data.publicUrl };
}

export async function removeImageFromBucket(
  supabase: SupabaseClient<Database>,
  bucket: string,
  path: string
): Promise<{ error: string } | null> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    return { error: error.message };
  }
  return null;
}

export async function removeImageByPublicUrl(
  supabase: SupabaseClient<Database>,
  bucket: string,
  publicUrl: string | null | undefined
): Promise<void> {
  if (!publicUrl) {
    return;
  }
  const path = getStoragePathFromPublicUrl(bucket, publicUrl);
  if (!path) {
    return;
  }
  await removeImageFromBucket(supabase, bucket, path);
}
