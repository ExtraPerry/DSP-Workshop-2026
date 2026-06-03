"use client";

import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import type { Enums } from "@/lib/supabase/database.types";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import { useCurrentUser } from "@/hooks/use-current-user";

export const CURRENT_USER_ROLE_QUERY_KEY = ["currentUserRole"] as const;

type UserRole = Enums<"user_roles_type">;

async function fetchCurrentUserRole(authId: string): Promise<UserRole | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("auth_id", authId)
    .maybeSingle();

  if (error) throw error;
  return data?.role ?? null;
}

/**
 * Exposes the current user's role (and an `isAdmin` convenience flag) so client
 * components like the navbar can branch on admin privileges. Reads the caller's
 * own `user_roles` row, which RLS already allows.
 */
export function useCurrentUserRole() {
  const { data: currentUser } = useCurrentUser();
  const authId = currentUser?.auth_id ?? null;

  const query = useRealtimeQuery<UserRole | null>({
    queryKey: [...CURRENT_USER_ROLE_QUERY_KEY, authId],
    queryFn: () => fetchCurrentUserRole(authId as string),
    enabled: Boolean(authId),
    realtimeSubscriptions: authId
      ? [{ table: "user_roles", filter: `auth_id=eq.${authId}` }]
      : [],
  });

  return {
    role: query.data ?? null,
    isAdmin: query.data === "ADMIN",
    isLoading: query.isLoading,
  };
}
