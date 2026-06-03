"use server";

import createSupabaseServerClient from "@/lib/supabase/create-supabase-server-client";
import createSupabaseServerAdmin from "@/lib/supabase/create-supabase-server-admin";

type DeleteUserResult = { error?: string };

/**
 * Hard-deletes a user account. Removing the auth.users row requires the service
 * role, so this runs as a server action: it first verifies the caller is an
 * admin with the request-scoped client, then performs the deletion with the
 * admin client. Deleting the auth user cascades to the public.users row.
 */
export async function deleteUserAction(
  targetUserId: string
): Promise<DeleteUserResult> {
  const serverClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) return { error: "NOT_AUTHENTICATED" };

  const { data: callerRole } = await serverClient
    .from("user_roles")
    .select("role")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (!callerRole || callerRole.role !== "ADMIN") {
    return { error: "FORBIDDEN" };
  }

  const adminClient = await createSupabaseServerAdmin();

  const { data: targetUser } = await adminClient
    .from("users")
    .select("auth_id")
    .eq("id", targetUserId)
    .maybeSingle();

  if (!targetUser) return { error: "USER_NOT_FOUND" };

  const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(
    targetUser.auth_id
  );

  if (authDeleteError) return { error: authDeleteError.message };

  await adminClient.from("users").delete().eq("id", targetUserId);

  return {};
}
