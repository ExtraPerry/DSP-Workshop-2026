"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCurrentUser, CURRENT_USER_QUERY_KEY } from "@/hooks/use-current-user";
import { useUserProfile, userProfileQueryKey } from "@/hooks/use-user-profile";
import { useAcademicLevels } from "@/hooks/use-lookups";
import { getLocalizedName } from "@/lib/localized-name";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import {
  AVATARS_BUCKET,
  buildAvatarStoragePath,
  isAllowedImageMimeType,
  removeImageByPublicUrl,
  uploadImageToBucket,
} from "@/lib/supabase/upload-image";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldLabel } from "@/components/ui/field";
import { UserAvatar } from "@/components/user-avatar";

export default function ProfileEditPage() {
  const t = useTranslations("Pages.ProfileEditPage");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { data: profile, isLoading: isProfileLoading } = useUserProfile(
    currentUser?.id
  );
  const { data: academicLevels } = useAcademicLevels();

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [academicLevelId, setAcademicLevelId] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = isUserLoading || isProfileLoading;

  const effectiveFirstName = firstName ?? profile?.first_name ?? "";
  const effectiveLastName = lastName ?? profile?.last_name ?? "";
  const effectivePhone = phone ?? profile?.phone ?? "";
  const effectiveBio = bio ?? profile?.bio ?? "";
  const effectiveAcademicLevelId =
    academicLevelId ?? profile?.academic_level_id ?? "";

  const displayAvatarUrl = removeAvatar
    ? previewAvatarUrl
    : previewAvatarUrl ?? profile?.avatar_url ?? null;

  useEffect(() => {
    if (!pendingAvatarFile) {
      return;
    }
    const objectUrl = URL.createObjectURL(pendingAvatarFile);
    setPreviewAvatarUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [pendingAvatarFile]);

  function handleAvatarFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (!isAllowedImageMimeType(file.type)) {
      toast.error(t("avatar_invalid_type"));
      return;
    }
    setPendingAvatarFile(file);
    setRemoveAvatar(false);
  }

  function handleRemoveAvatar() {
    setPendingAvatarFile(null);
    setPreviewAvatarUrl(null);
    setRemoveAvatar(true);
  }

  async function handleSave() {
    if (!currentUser) return;
    setIsSaving(true);

    const supabase = createSupabaseBrowserClient();
    let avatarUrl: string | null = profile?.avatar_url ?? null;

    if (removeAvatar) {
      await removeImageByPublicUrl(supabase, AVATARS_BUCKET, profile?.avatar_url);
      avatarUrl = null;
    } else if (pendingAvatarFile && isAllowedImageMimeType(pendingAvatarFile.type)) {
      const path = buildAvatarStoragePath(currentUser.id, pendingAvatarFile.type);
      await removeImageByPublicUrl(supabase, AVATARS_BUCKET, profile?.avatar_url);

      const uploadResult = await uploadImageToBucket({
        supabase,
        bucket: AVATARS_BUCKET,
        path,
        file: pendingAvatarFile,
      });

      if ("error" in uploadResult) {
        setIsSaving(false);
        if (uploadResult.error === "invalid_type") {
          toast.error(t("avatar_invalid_type"));
        } else if (uploadResult.error === "too_large") {
          toast.error(t("avatar_too_large"));
        } else {
          toast.error(t("avatar_upload_error"));
        }
        return;
      }

      avatarUrl = uploadResult.publicUrl;
    }

    const { error } = await supabase
      .from("users")
      .update({
        first_name: effectiveFirstName || null,
        last_name: effectiveLastName || null,
        phone: effectivePhone || null,
        bio: effectiveBio || null,
        academic_level_id: effectiveAcademicLevelId || null,
        avatar_url: avatarUrl,
      })
      .eq("id", currentUser.id);

    setIsSaving(false);

    if (error) {
      toast.error(t("error"));
      return;
    }

    toast.success(t("success"));
    queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    queryClient.invalidateQueries({
      queryKey: userProfileQueryKey(currentUser.id),
    });
    router.push(`/profile/${currentUser.id}`);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel>{t("avatar_label")}</FieldLabel>
            <div className="flex flex-wrap items-center gap-4">
              <UserAvatar
                avatarUrl={displayAvatarUrl}
                firstName={effectiveFirstName}
                lastName={effectiveLastName}
                className="size-20"
                fallbackClassName="text-2xl"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t("avatar_upload")}
                </Button>
                {(displayAvatarUrl || profile?.avatar_url) && !removeAvatar ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemoveAvatar}
                  >
                    {t("avatar_remove")}
                  </Button>
                ) : null}
              </div>
            </div>
          </Field>

          <Field>
            <FieldLabel>{t("first_name")}</FieldLabel>
            <Input
              value={effectiveFirstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>{t("last_name")}</FieldLabel>
            <Input
              value={effectiveLastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>{t("email")}</FieldLabel>
            <Input value={profile?.email ?? ""} disabled />
          </Field>

          <Field>
            <FieldLabel>{t("phone")}</FieldLabel>
            <Input
              value={effectivePhone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>{t("bio")}</FieldLabel>
            <Textarea
              value={effectiveBio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("bio_placeholder")}
              rows={4}
            />
          </Field>

          <Field>
            <FieldLabel>{t("academic_level")}</FieldLabel>
            <Select
              value={effectiveAcademicLevelId}
              onValueChange={setAcademicLevelId}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("select_level")} />
              </SelectTrigger>
              <SelectContent>
                {academicLevels?.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {getLocalizedName(level, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "..." : t("save")}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/profile/${currentUser?.id}`)}
            >
              {t("cancel")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
