"use client";

import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import type { Tables } from "@/lib/supabase/database.types";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export type DirectMessageSender = Pick<
  Tables<"users">,
  "id" | "first_name" | "last_name"
>;

export type DirectMessageWithSender = Tables<"direct_messages"> & {
  sender: DirectMessageSender | null;
};

const SENDER_FIELDS = "id, first_name, last_name";

export function directMessagesQueryKey(conversationId: string | undefined) {
  return ["directMessages", conversationId ?? null] as const;
}

async function fetchDirectMessages(
  conversationId: string
): Promise<DirectMessageWithSender[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("direct_messages")
    .select(
      `*,
       sender:users!direct_messages_sender_user_id_fkey(${SENDER_FIELDS})`
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DirectMessageWithSender[];
}

export function useDirectMessages(conversationId: string | undefined) {
  return useRealtimeQuery<DirectMessageWithSender[]>({
    queryKey: directMessagesQueryKey(conversationId),
    queryFn: () => fetchDirectMessages(conversationId as string),
    enabled: Boolean(conversationId),
    realtimeSubscriptions: conversationId
      ? [
          {
            table: "direct_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
        ]
      : [],
  });
}

export async function ensureDirectConversation(
  friendPairId: string
): Promise<string> {
  const supabase = createSupabaseBrowserClient();

  const existingResult = await supabase
    .from("direct_conversations")
    .select("id")
    .eq("friend_pair_id", friendPairId)
    .maybeSingle();

  if (existingResult.error) throw existingResult.error;
  if (existingResult.data?.id) return existingResult.data.id;

  const insertResult = await supabase
    .from("direct_conversations")
    .insert({ friend_pair_id: friendPairId })
    .select("id")
    .single();

  if (insertResult.error) throw insertResult.error;
  return insertResult.data.id;
}

export async function sendDirectMessage(
  conversationId: string,
  senderUserId: string,
  content: string
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const trimmedContent = content.trim();
  if (!trimmedContent) return;

  const { error } = await supabase.from("direct_messages").insert({
    conversation_id: conversationId,
    sender_user_id: senderUserId,
    content: trimmedContent,
  });

  if (error) throw error;
}
