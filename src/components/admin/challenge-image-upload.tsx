"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import {
  buildChallengeImageStoragePath,
  CHALLENGE_IMAGES_BUCKET,
  isAllowedImageMimeType,
  removeImageByPublicUrl,
  uploadImageToBucket,
} from "@/lib/supabase/upload-image";
import { Button } from "@/components/ui/button";

type ChallengeWithImage = {
  id: string;
  image_url: string | null;
};

type ChallengeImageUploadProps = {
  challenge: ChallengeWithImage;
  queryKey: QueryKey;
};

export function ChallengeImageUpload({
  challenge,
  queryKey,
}: ChallengeImageUploadProps) {
  const t = useTranslations("Pages.AdminGamificationPage");
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    if (!isAllowedImageMimeType(file.type)) {
      toast.error(t("image_invalid_type"));
      return;
    }

    setIsUploading(true);
    const supabase = createSupabaseBrowserClient();
    const path = buildChallengeImageStoragePath(challenge.id, file.type);

    await removeImageByPublicUrl(
      supabase,
      CHALLENGE_IMAGES_BUCKET,
      challenge.image_url
    );

    const uploadResult = await uploadImageToBucket({
      supabase,
      bucket: CHALLENGE_IMAGES_BUCKET,
      path,
      file,
    });

    if ("error" in uploadResult) {
      setIsUploading(false);
      toast.error(t("image_upload_error"));
      return;
    }

    const { error: updateError } = await supabase
      .from("challenges")
      .update({ image_url: uploadResult.publicUrl })
      .eq("id", challenge.id);

    setIsUploading(false);

    if (updateError) {
      toast.error(t("image_upload_error"));
      return;
    }

    queryClient.invalidateQueries({ queryKey });
    toast.success(t("image_upload_success"));
  }

  async function handleRemoveImage() {
    setIsRemoving(true);
    const supabase = createSupabaseBrowserClient();

    await removeImageByPublicUrl(
      supabase,
      CHALLENGE_IMAGES_BUCKET,
      challenge.image_url
    );

    const { error } = await supabase
      .from("challenges")
      .update({ image_url: null })
      .eq("id", challenge.id);

    setIsRemoving(false);

    if (error) {
      toast.error(t("image_remove_error"));
      return;
    }

    queryClient.invalidateQueries({ queryKey });
    toast.success(t("image_remove_success"));
  }

  return (
    <div className="flex items-center gap-2">
      {challenge.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={challenge.image_url}
          alt=""
          className="size-12 rounded-md border object-cover"
        />
      ) : (
        <div className="flex size-12 items-center justify-center rounded-md border bg-muted text-muted-foreground">
          <ImagePlus className="size-5" />
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading || isRemoving}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? "..." : t("image_upload")}
      </Button>
      {challenge.image_url ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isUploading || isRemoving}
          onClick={handleRemoveImage}
          aria-label={t("image_remove")}
        >
          <Trash2 className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
