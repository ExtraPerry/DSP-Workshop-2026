"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";

const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

async function fetchCurrentUser() {
  const supabase = createSupabaseBrowserClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authData.user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export function useCurrentUser() {
  const queryClient = useQueryClient();

  const cachedUser = queryClient.getQueryData<{ auth_id: string } | null>(
    CURRENT_USER_QUERY_KEY
  );
  const authId = cachedUser?.auth_id ?? null;

  const query = useRealtimeQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: fetchCurrentUser,
    realtimeSubscriptions: authId
      ? [{ table: "users", filter: `auth_id=eq.${authId}` }]
      : [],
  });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
          return;
        }

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [queryClient]);

  return query;
}

export { CURRENT_USER_QUERY_KEY };
