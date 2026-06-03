"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { useQueryClient } from "@tanstack/react-query";
import { deleteUserAction } from "@/lib/admin/delete-user";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatAdminError } from "@/lib/admin/format-admin-error";

const ADMIN_USERS_QUERY_KEY = ["adminUsers"] as const;

type AdminUserRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  suspended_at: string | null;
  user_roles: { role: string } | { role: string }[] | null;
};

function resolveRole(userRoles: AdminUserRow["user_roles"]): string {
  if (Array.isArray(userRoles)) return userRoles[0]?.role ?? "USER";
  return userRoles?.role ?? "USER";
}

function roleLabel(
  role: string,
  translate: (key: string) => string
): string {
  if (role === "ADMIN") return translate("role_admin");
  return translate("role_user");
}

export default function AdminUsersPage() {
  const t = useTranslations("Pages.AdminUsersPage");
  const tCommon = useTranslations("Pages.AdminCommon");
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const { data: users, isLoading } = useRealtimeQuery<AdminUserRow[]>({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("users")
        .select("*, user_roles(role)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as AdminUserRow[];
    },
    realtimeSubscriptions: [{ table: "users" }, { table: "user_roles" }],
  });

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return (users ?? []).filter((user) => {
      const role = resolveRole(user.user_roles);
      if (roleFilter !== "ALL" && role !== roleFilter) return false;
      if (!normalized) return true;
      const haystack = `${user.first_name ?? ""} ${user.last_name ?? ""} ${user.email ?? ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [users, search, roleFilter]);

  async function handleSuspend(userId: string, suspend: boolean) {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("users")
      .update({ suspended_at: suspend ? new Date().toISOString() : null })
      .eq("id", userId);
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    toast.success(t("updated"));
  }

  async function handleChangeRole(userId: string, nextRole: "USER" | "ADMIN") {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("user_roles")
      .update({ role: nextRole })
      .eq("user_id", userId);
    if (error) {
      toast.error(formatAdminError(error.message, tCommon));
      return;
    }
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    toast.success(t("updated"));
  }

  async function handleConfirmDelete() {
    if (!deletingUserId) return;
    const result = await deleteUserAction(deletingUserId);
    setDeletingUserId(null);
    if (result.error) {
      toast.error(formatAdminError(result.error, tCommon));
      return;
    }
    toast.success(t("deleted"));
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
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
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("search_placeholder")}
              className="max-w-xs"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("filter_role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("all_roles")}</SelectItem>
                <SelectItem value="USER">{tCommon("role_user")}</SelectItem>
                <SelectItem value="ADMIN">{tCommon("role_admin")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredUsers.length === 0 ? (
            <p className="text-muted-foreground">{t("no_users")}</p>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => {
                const role = resolveRole(user.user_roles);
                const isSuspended = Boolean(user.suspended_at);

                return (
                  <div
                    key={user.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                  >
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
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={role === "ADMIN" ? "default" : "secondary"}>
                        {roleLabel(role, tCommon)}
                      </Badge>
                      {isSuspended && (
                        <Badge variant="destructive">{t("suspended")}</Badge>
                      )}
                      {role === "ADMIN" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChangeRole(user.id, "USER")}
                        >
                          {t("demote")}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChangeRole(user.id, "ADMIN")}
                        >
                          {t("promote")}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuspend(user.id, !isSuspended)}
                      >
                        {isSuspended ? t("unsuspend") : t("suspend")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingUserId(user.id)}
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(deletingUserId)}
        onOpenChange={(open) => !open && setDeletingUserId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirm_delete")}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUserId(null)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
