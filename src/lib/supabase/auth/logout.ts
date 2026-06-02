"use server";

import createSupabaseServerClient from "@/lib/supabase/create-supabase-server-client";
import { redirect } from "@/i18n/navigation";

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect({ href: "/login", locale: "en" });
}
