"use client";

import { useTranslations, useLocale } from "next-intl";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSkills, useCampuses } from "@/hooks/use-lookups";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import { getLocalizedName } from "@/lib/localized-name";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

function extractErrorMessages(errors: unknown[]): string {
  return errors
    .map((error) => {
      if (typeof error === "string") return error;
      if (error && typeof error === "object" && "message" in error) {
        return (error as { message: string }).message;
      }
      return null;
    })
    .filter(Boolean)
    .join(", ");
}

export default function SessionCreatePage() {
  const t = useTranslations("Pages.SessionCreatePage");
  const locale = useLocale();
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const { data: skills } = useSkills();
  const { data: campuses } = useCampuses();

  const { data: sessionTypes } = useRealtimeQuery({
    queryKey: ["sessionTypes"],
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("session_types")
        .select("*")
        .order("name_fr");
      if (error) throw error;
      return data ?? [];
    },
    realtimeSubscriptions: [{ table: "session_types" }],
  });

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      sessionTypeId: "",
      skillId: "",
      campusId: "",
      location: "",
      maxParticipants: "",
      startTimestamp: "",
      endTimestamp: "",
    },
    onSubmit: async ({ value }) => {
      if (!currentUser) return;
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase.from("sessions").insert({
        title: value.title,
        description: value.description || null,
        session_type_id: value.sessionTypeId,
        skill_id: value.skillId,
        organizer_user_id: currentUser.id,
        campus_id: value.campusId || null,
        location: value.location || null,
        max_participants: value.maxParticipants
          ? parseInt(value.maxParticipants)
          : null,
        start_timestamp: value.startTimestamp,
        end_timestamp: value.endTimestamp,
      });

      if (error) {
        toast.error(t("error"));
        return;
      }

      toast.success(t("success"));
      router.push("/sessions");
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field
              name="title"
              validators={{
                onBlur: z.string().min(1, t("errors.title_required")),
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                  <FieldLabel>{t("session_title")}</FieldLabel>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>{extractErrorMessages(field.state.meta.errors)}</FieldError>
                  )}
                </Field>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <Field>
                  <FieldLabel>{t("description")}</FieldLabel>
                  <Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field
              name="sessionTypeId"
              validators={{
                onBlur: z.string().min(1, t("errors.type_required")),
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                  <FieldLabel>{t("type")}</FieldLabel>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_type")} />
                    </SelectTrigger>
                    <SelectContent>
                      {sessionTypes?.map((type: { id: string; name_fr: string; name_en: string | null }) => (
                        <SelectItem key={type.id} value={type.id}>
                          {getLocalizedName(type, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>{extractErrorMessages(field.state.meta.errors)}</FieldError>
                  )}
                </Field>
              )}
            </form.Field>

            <form.Field
              name="skillId"
              validators={{
                onBlur: z.string().min(1, t("errors.skill_required")),
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                  <FieldLabel>{t("skill")}</FieldLabel>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_skill")} />
                    </SelectTrigger>
                    <SelectContent>
                      {skills?.map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {getLocalizedName(skill, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>{extractErrorMessages(field.state.meta.errors)}</FieldError>
                  )}
                </Field>
              )}
            </form.Field>

            <form.Field name="campusId">
              {(field) => (
                <Field>
                  <FieldLabel>{t("campus")}</FieldLabel>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_campus")} />
                    </SelectTrigger>
                    <SelectContent>
                      {campuses?.map((campus) => (
                        <SelectItem key={campus.id} value={campus.id}>
                          {getLocalizedName(campus, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field name="location">
              {(field) => (
                <Field>
                  <FieldLabel>{t("location")}</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="maxParticipants">
              {(field) => (
                <Field>
                  <FieldLabel>{t("max_participants")}</FieldLabel>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field
              name="startTimestamp"
              validators={{
                onBlur: z.string().min(1, t("errors.start_required")),
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                  <FieldLabel>{t("start_time")}</FieldLabel>
                  <Input
                    type="datetime-local"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>{extractErrorMessages(field.state.meta.errors)}</FieldError>
                  )}
                </Field>
              )}
            </form.Field>

            <form.Field
              name="endTimestamp"
              validators={{
                onBlur: z.string().min(1, t("errors.end_required")),
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                  <FieldLabel>{t("end_time")}</FieldLabel>
                  <Input
                    type="datetime-local"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>{extractErrorMessages(field.state.meta.errors)}</FieldError>
                  )}
                </Field>
              )}
            </form.Field>

            <div className="flex gap-3 pt-4">
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? "..." : t("submit")}
                  </Button>
                )}
              </form.Subscribe>
              <Button variant="outline" onClick={() => router.push("/sessions")}>
                {t("cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
