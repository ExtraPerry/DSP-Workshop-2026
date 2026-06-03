import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";

/**
 * Sends a friend request from one user to another. Shared by the friends page
 * search and the profile page "Add friend" button so the insert logic lives in
 * a single place. RLS already restricts inserts to the requesting user.
 */
export async function sendFriendRequest(
  requestorUserId: string,
  receiverUserId: string
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("friend_requests").insert({
    requestor_user_id: requestorUserId,
    receiver_user_id: receiverUserId,
  });

  if (error) throw error;
}
