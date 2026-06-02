"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { registerWithEmail } from "@/lib/supabase/auth/register-with-email";
import { useRouter, Link } from "@/i18n/navigation";
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

export default function RegisterForm() {
  const t = useTranslations("Pages.RegisterPage");
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      const result = await registerWithEmail({
        email: value.email,
        password: value.password,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      router.push("/verify-email");
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-xl">
          {t("title")}
        </CardTitle>
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
            <form.Field
              name="email"
              validators={{
                onBlur: z
                  .string()
                  .min(1, t("errors.email_required"))
                  .email(t("errors.email_invalid")),
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                  <FieldLabel htmlFor="register-email">
                    {t("email_label")}
                  </FieldLabel>
                  <Input
                    id="register-email"
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0 || undefined}
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
              name="password"
              validators={{
                onBlur: z
                  .string()
                  .min(1, t("errors.password_required"))
                  .min(8, t("errors.password_too_short")),
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                  <FieldLabel htmlFor="register-password">
                    {t("password_label")}
                  </FieldLabel>
                  <Input
                    id="register-password"
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0 || undefined}
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
                onChangeListenTo: ["password"],
                onBlur: ({ value, fieldApi }) => {
                  const passwordValue = fieldApi.form.getFieldValue("password");
                  if (!value) {
                    return t("errors.confirm_password_required");
                  }
                  if (value !== passwordValue) {
                    return t("errors.passwords_mismatch");
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                  <FieldLabel htmlFor="register-confirm-password">
                    {t("confirm_password_label")}
                  </FieldLabel>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0 || undefined}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>
                      {extractErrorMessages(field.state.meta.errors)}
                    </FieldError>
                  )}
                </Field>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting} className="w-full">
                  {isSubmitting ? "..." : t("submit_button")}
                </Button>
              )}
            </form.Subscribe>

            <p className="text-center text-sm text-muted-foreground">
              {t("has_account")}{" "}
              <Link href="/login" className="text-primary underline underline-offset-4 hover:opacity-80">
                {t("login_link")}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
