"use server";

import createSupabaseServerClient from "@/lib/supabase/createSupabaseServerClient";
import { redirect } from "@/i18n/navigation";

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect({ href: "/login", locale: "en" });
}
