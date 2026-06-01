"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { loginWithEmail } from "@/lib/supabase/auth/loginWithEmail";
import { CURRENT_USER_QUERY_KEY } from "@/hooks/useCurrentUser";
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

export default function LoginForm() {
  const t = useTranslations("Pages.LoginPage");
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const result = await loginWithEmail(value);

      if (result.error) {
        toast.error(t("errors.invalid_credentials"));
        return;
      }

      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      router.push("/");
      router.refresh();
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
                  <FieldLabel htmlFor="login-email">
                    {t("email_label")}
                  </FieldLabel>
                  <Input
                    id="login-email"
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
                  <FieldLabel htmlFor="login-password">
                    {t("password_label")}
                  </FieldLabel>
                  <Input
                    id="login-password"
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
              {t("no_account")}{" "}
              <Link href="/register" className="text-primary underline underline-offset-4 hover:opacity-80">
                {t("register_link")}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
