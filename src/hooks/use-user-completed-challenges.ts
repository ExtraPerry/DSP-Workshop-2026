"use client";

import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import type { Tables } from "@/lib/supabase/database.types";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export type CompletedChallengeRow = Tables<"user_challenges"> & {
  challenge: Pick<
    Tables<"challenges">,
    "id" | "name_fr" | "name_en" | "image_url" | "points_reward"
  > | null;
};

export function userCompletedChallengesQueryKey(userId: string | undefined) {
  return ["userCompletedChallenges", userId ?? null] as const;
}

async function fetchUserCompletedChallenges(
  userId: string
): Promise<CompletedChallengeRow[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("user_challenges")
    .select(
      "id, completed_at, status, user_id, challenge:challenges(id, name_fr, name_en, image_url, points_reward)"
    )
    .eq("user_id", userId)
    .eq("status", "COMPLETED")
    .order("completed_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as CompletedChallengeRow[]) ?? [];
}

export function useUserCompletedChallenges(userId: string | undefined) {
  return useRealtimeQuery<CompletedChallengeRow[]>({
    queryKey: userCompletedChallengesQueryKey(userId),
    queryFn: () => fetchUserCompletedChallenges(userId as string),
    enabled: Boolean(userId),
    realtimeSubscriptions: userId
      ? [{ table: "user_challenges", filter: `user_id=eq.${userId}` }]
      : [],
  });
}
