"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { changePassword } from "@/lib/supabase/auth/change-password";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function AccountForm() {
  const t = useTranslations("Pages.AccountPage");
  const { data: currentUser } = useCurrentUser();

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      const result = await changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      });

      if (result.error === "invalid_current_password") {
        toast.error(t("errors.invalid_current_password"));
        return;
      }

      if (result.error) {
        toast.error(t("errors.update_failed"));
        return;
      }

      toast.success(t("success"));
      form.reset();
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("password_section_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="flex flex-col gap-4">
              {currentUser?.email && (
                <Field>
                  <FieldLabel>{t("email_label")}</FieldLabel>
                  <Input value={currentUser.email} disabled />
                </Field>
              )}

              <form.Field
                name="currentPassword"
                validators={{
                  onBlur: z
                    .string()
                    .min(1, t("errors.current_password_required")),
                }}
              >
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.errors.length > 0 || undefined
                    }
                  >
                    <FieldLabel htmlFor="account-current-password">
                      {t("current_password_label")}
                    </FieldLabel>
                    <Input
                      id="account-current-password"
                      type="password"
                      autoComplete="current-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={
                        field.state.meta.errors.length > 0 || undefined
                      }
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {extractErrorMessages(field.state.meta.errors)}
                      </FieldError>
                    )}
                  </Field>
                )}
              </form.Field>

              <form.Field
                name="newPassword"
                validators={{
                  onBlur: z
                    .string()
                    .min(1, t("errors.password_required"))
                    .min(8, t("errors.password_too_short")),
                }}
              >
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.errors.length > 0 || undefined
                    }
                  >
                    <FieldLabel htmlFor="account-new-password">
                      {t("new_password_label")}
                    </FieldLabel>
                    <Input
                      id="account-new-password"
                      type="password"
                      autoComplete="new-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={
                        field.state.meta.errors.length > 0 || undefined
                      }
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {extractErrorMessages(field.state.meta.errors)}
                      </FieldError>
                    )}
                  </Field>
                )}
              </form.Field>

              <form.Field
                name="confirmPassword"
                validators={{
                  onChangeListenTo: ["newPassword"],
                  onBlur: ({ value, fieldApi }) => {
                    const newPasswordValue =
                      fieldApi.form.getFieldValue("newPassword");
                    if (!value) {
                      return t("errors.confirm_password_required");
                    }
                    if (value !== newPasswordValue) {
                      return t("errors.passwords_mismatch");
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.errors.length > 0 || undefined
                    }
                  >
                    <FieldLabel htmlFor="account-confirm-password">
                      {t("confirm_password_label")}
                    </FieldLabel>
                    <Input
                      id="account-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={
                        field.state.meta.errors.length > 0 || undefined
                      }
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {extractErrorMessages(field.state.meta.errors)}
                      </FieldError>
                    )}
                  </Field>
                )}
              </form.Field>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? "..." : t("submit_button")}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
