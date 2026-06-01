"use server"

import { Database } from "@/lib/supabase/database.types";
import { createClient } from "@supabase/supabase-js";

export default async function createSupabaseServerAdmin() {

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PRIVATE_SUPABASE_ADMIN_KEY!,
  );
}