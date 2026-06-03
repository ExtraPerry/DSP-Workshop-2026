"use server";

import createSupabaseServerClient from "@/lib/supabase/create-supabase-server-client";
import { redirect } from "@/i18n/navigation";

type LogoutOptions = {
  redirectTo?: string | null;
};

export async function logout(options?: LogoutOptions) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  if (options?.redirectTo === null) {
    return;
  }

  redirect({ href: options?.redirectTo ?? "/", locale: "en" });
}
