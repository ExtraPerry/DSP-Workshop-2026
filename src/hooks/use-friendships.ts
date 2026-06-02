"use client";

import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import type { Tables } from "@/lib/supabase/database.types";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export type FriendUser = Pick<
  Tables<"users">,
  "id" | "first_name" | "last_name" | "email"
>;

export type FriendPairWithUsers = Tables<"friend_pairs"> & {
  requestor: FriendUser | null;
  receiver: FriendUser | null;
};

export type FriendRequestWithUsers = Tables<"friend_requests"> & {
  requestor: FriendUser | null;
  receiver: FriendUser | null;
};

export type Friendships = {
  friends: FriendPairWithUsers[];
  incomingRequests: FriendRequestWithUsers[];
  outgoingRequests: FriendRequestWithUsers[];
};

const FRIEND_USER_FIELDS = "id, first_name, last_name, email";

export function friendshipsQueryKey(currentUserId: string | undefined) {
  return ["friendships", currentUserId ?? null] as const;
}

async function fetchFriendships(currentUserId: string): Promise<Friendships> {
  const supabase = createSupabaseBrowserClient();

  const friendPairsResult = await supabase
    .from("friend_pairs")
    .select(
      `*,
       requestor:users!friend_pairs_requestor_user_id_fkey(${FRIEND_USER_FIELDS}),
       receiver:users!friend_pairs_receiver_user_id_fkey(${FRIEND_USER_FIELDS})`
    )
    .or(
      `requestor_user_id.eq.${currentUserId},receiver_user_id.eq.${currentUserId}`
    );

  if (friendPairsResult.error) throw friendPairsResult.error;

  const friendRequestsResult = await supabase
    .from("friend_requests")
    .select(
      `*,
       requestor:users!friend_requests_requestor_user_id_fkey(${FRIEND_USER_FIELDS}),
       receiver:users!friend_requests_receiver_user_id_fkey(${FRIEND_USER_FIELDS})`
    )
    .or(
      `requestor_user_id.eq.${currentUserId},receiver_user_id.eq.${currentUserId}`
    );

  if (friendRequestsResult.error) throw friendRequestsResult.error;

  const friendRequests = (friendRequestsResult.data ??
    []) as FriendRequestWithUsers[];

  return {
    friends: (friendPairsResult.data ?? []) as FriendPairWithUsers[],
    incomingRequests: friendRequests.filter(
      (request) => request.receiver_user_id === currentUserId
    ),
    outgoingRequests: friendRequests.filter(
      (request) => request.requestor_user_id === currentUserId
    ),
  };
}

export function useFriendships(currentUserId: string | undefined) {
  return useRealtimeQuery<Friendships>({
    queryKey: friendshipsQueryKey(currentUserId),
    queryFn: () => fetchFriendships(currentUserId as string),
    enabled: Boolean(currentUserId),
    realtimeSubscriptions: [
      { table: "friend_pairs" },
      { table: "friend_requests" },
    ],
  });
}
