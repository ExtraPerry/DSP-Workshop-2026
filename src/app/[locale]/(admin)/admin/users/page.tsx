"use client";

import { useTranslations } from "next-intl";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ADMIN_USERS_QUERY_KEY = ["adminUsers"] as const;

export default function AdminUsersPage() {
  const t = useTranslations("Pages.AdminUsersPage");
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useRealtimeQuery({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("users")
        .select("*, user_roles(role)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    realtimeSubscriptions: [{ table: "users" }, { table: "user_roles" }],
  });

  async function handleSuspend(userId: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("users")
      .update({ suspended_at: new Date().toISOString() })
      .eq("id", userId);
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    toast.success("User suspended");
  }

  async function handleUnsuspend(userId: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("users")
      .update({ suspended_at: null })
      .eq("id", userId);
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    toast.success("User unsuspended");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {(!users || users.length === 0) ? (
            <p className="text-muted-foreground">{t("no_users")}</p>
          ) : (
            <div className="space-y-2">
              {users.map(
                (user: {
                  id: string;
                  first_name: string | null;
                  last_name: string | null;
                  email: string | null;
                  suspended_at: string | null;
                  user_roles: { role: string } | { role: string }[] | null;
                }) => {
                  const role = Array.isArray(user.user_roles)
                    ? user.user_roles[0]?.role
                    : user.user_roles?.role;
                  const isSuspended = Boolean(user.suspended_at);

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="font-medium hover:underline"
                          >
                            {user.first_name} {user.last_name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={role === "ADMIN" ? "default" : "secondary"}>
                          {role}
                        </Badge>
                        {isSuspended && (
                          <Badge variant="destructive">{t("suspended")}</Badge>
                        )}
                        {isSuspended ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnsuspend(user.id)}
                          >
                            {t("unsuspend")}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspend(user.id)}
                          >
                            {t("suspend")}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
