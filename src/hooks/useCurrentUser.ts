"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";

const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;
const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;

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
  const authUserIdRef = useRef<string | null>(null);

  const query = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: authData } = await supabase.auth.getUser();
      authUserIdRef.current = authData.user?.id ?? null;
      return fetchCurrentUser();
    },
    staleTime: THIRTY_MINUTES_IN_MS,
  });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
          authUserIdRef.current = null;
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

  useEffect(() => {
    if (!authUserIdRef.current) return;

    const supabase = createSupabaseBrowserClient();

    const channel = supabase
      .channel("current-user-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `auth_id=eq.${authUserIdRef.current}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, query.data]);

  return query;
}

export { CURRENT_USER_QUERY_KEY };
