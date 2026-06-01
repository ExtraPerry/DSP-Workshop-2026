"use server";

import createSupabaseServerClient from "@/lib/supabase/createSupabaseServerClient";

export async function registerWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
