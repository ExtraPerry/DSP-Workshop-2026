"use server";

import createSupabaseServerClient from "@/lib/supabase/createSupabaseServerClient";

export async function loginWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "invalid_credentials" };
  }

  return { error: null };
}
