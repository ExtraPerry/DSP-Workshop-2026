"use client";

import { useTranslations } from "next-intl";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useSkills,
  useCampuses,
  useSessionTypes,
  useProposeSkill,
  useProposeCampus,
} from "@/hooks/use-lookups";
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
import { LookupCombobox } from "@/components/lookup-combobox";
import { DateTimePicker } from "@/components/date-time-picker";
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
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const { data: skills } = useSkills();
  const { data: campuses } = useCampuses();
  const { data: sessionTypes } = useSessionTypes();
  const proposeSkill = useProposeSkill();
  const proposeCampus = useProposeCampus();

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
                onChange: z.string().min(1, t("errors.type_required")),
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                  <FieldLabel>{t("type")}</FieldLabel>
                  <LookupCombobox
                    items={sessionTypes ?? []}
                    value={field.state.value || null}
                    onChange={(id) => field.handleChange(id ?? "")}
                    placeholder={t("select_type")}
                    allowClear
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>{extractErrorMessages(field.state.meta.errors)}</FieldError>
                  )}
                </Field>
              )}
            </form.Field>

            <form.Field
              name="skillId"
              validators={{
                onChange: z.string().min(1, t("errors.skill_required")),
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                  <FieldLabel>{t("skill")}</FieldLabel>
                  <LookupCombobox
                    items={skills ?? []}
                    value={field.state.value || null}
                    onChange={(id) => field.handleChange(id ?? "")}
                    placeholder={t("select_skill")}
                    allowClear
                    allowCreate
                    onCreate={async (name) => {
                      const row = await proposeSkill.mutateAsync({
                        name,
                        createdByUserId: currentUser!.id,
                      });
                      return row.id;
                    }}
                  />
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
                  <LookupCombobox
                    items={campuses ?? []}
                    value={field.state.value || null}
                    onChange={(id) => field.handleChange(id ?? "")}
                    placeholder={t("select_campus")}
                    allowClear
                    allowCreate
                    onCreate={async (name) => {
                      const row = await proposeCampus.mutateAsync({
                        name,
                        createdByUserId: currentUser!.id,
                      });
                      return row.id;
                    }}
                  />
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
                onChange: z.string().min(1, t("errors.start_required")),
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                  <FieldLabel>{t("start_time")}</FieldLabel>
                  <DateTimePicker
                    value={field.state.value}
                    onChange={field.handleChange}
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
                onChange: z.string().min(1, t("errors.end_required")),
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                  <FieldLabel>{t("end_time")}</FieldLabel>
                  <DateTimePicker
                    value={field.state.value}
                    onChange={field.handleChange}
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
