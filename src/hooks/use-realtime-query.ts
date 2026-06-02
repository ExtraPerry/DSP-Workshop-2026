"use client";

import { useEffect, useMemo } from "react";
import {
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";

const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;

type RealtimeSubscription = {
  table: string;
  filter?: string;
};

type UseRealtimeQueryOptions<TData> = {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  realtimeSubscriptions: RealtimeSubscription[];
  enabled?: boolean;
};

/**
 * Shared data-fetching primitive: a TanStack Query whose cache is invalidated by
 * Supabase Realtime postgres_changes events. The 30 minute staleTime acts only as
 * a safety-net fallback; Realtime invalidation is the primary freshness mechanism.
 */
export function useRealtimeQuery<TData>({
  queryKey,
  queryFn,
  realtimeSubscriptions,
  enabled = true,
}: UseRealtimeQueryOptions<TData>) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime: THIRTY_MINUTES_IN_MS,
  });

  const serializedQueryKey = useMemo(() => JSON.stringify(queryKey), [queryKey]);
  const serializedSubscriptions = useMemo(
    () => JSON.stringify(realtimeSubscriptions),
    [realtimeSubscriptions]
  );

  useEffect(() => {
    if (!enabled) return;

    const subscriptions: RealtimeSubscription[] = JSON.parse(
      serializedSubscriptions
    );
    if (subscriptions.length === 0) return;

    const supabase = createSupabaseBrowserClient();
    // A unique topic per effect run guarantees a fresh, unsubscribed channel.
    // Without it, RealtimeClient.channel() deduplicates by topic and can return
    // a still-registered channel from a previous run (removeChannel is async),
    // which throws "cannot add postgres_changes callbacks after subscribe()".
    const channelTopic = `realtime:${serializedQueryKey}:${crypto.randomUUID()}`;
    const channel = supabase.channel(channelTopic);

    for (const subscription of subscriptions) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: subscription.table,
          ...(subscription.filter ? { filter: subscription.filter } : {}),
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // queryKey is captured through serializedQueryKey to keep the effect stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, enabled, serializedQueryKey, serializedSubscriptions]);

  return query;
}
