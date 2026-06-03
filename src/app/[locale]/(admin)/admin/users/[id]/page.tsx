"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useUserProfile } from "@/hooks/use-user-profile";
import { deleteUserAction } from "@/lib/admin/delete-user";
import { Link, useRouter } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { formatAdminError } from "@/lib/admin/format-admin-error";

const ADMIN_USERS_QUERY_KEY = ["adminUsers"] as const;

export default function AdminUserDetailPage() {
  const t = useTranslations("Pages.AdminUsersPage");
  const tCommon = useTranslations("Pages.AdminCommon");
  const roleLabel = (role: "USER" | "ADMIN") =>
    role === "ADMIN" ? tCommon("role_admin") : tCommon("role_user");
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile(params.id);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userRole, setUserRole] = useState<"USER" | "ADMIN">("USER");

  useEffect(() => {
    if (!params.id) return;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", params.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.role === "ADMIN" || data?.role === "USER") {
          setUserRole(data.role);
        }
      });
  }, [params.id]);

  const isSuspended = Boolean(profile?.suspended_at);

  async function handleSuspend(suspend: boolean) {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("users")
      .update({ suspended_at: suspend ? new Date().toISOString() : null })
      .eq("id", profile.id);
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["userProfile", profile.id] });
    toast.success(t("updated"));
  }

  async function handleChangeRole(nextRole: "USER" | "ADMIN") {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("user_roles")
      .update({ role: nextRole })
      .eq("user_id", profile.id);
    if (error) {
      toast.error(formatAdminError(error.message, tCommon));
      return;
    }
    setUserRole(nextRole);
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    toast.success(t("updated"));
  }

  async function handleConfirmDelete() {
    if (!profile) return;
    setIsDeleting(true);
    const result = await deleteUserAction(profile.id);
    setIsDeleting(false);
    if (result.error) {
      toast.error(formatAdminError(result.error, tCommon));
      return;
    }
    toast.success(t("deleted"));
    setShowDeleteDialog(false);
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    router.push("/admin/users");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">{t("no_users")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/users">
          <ArrowLeft className="mr-1 size-4" />
          {t("back")}
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          {profile.first_name} {profile.last_name}
        </h1>
        <div className="flex flex-wrap gap-2">
          {isSuspended ? (
            <Button variant="outline" onClick={() => handleSuspend(false)}>
              {t("unsuspend")}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => handleSuspend(true)}>
              {t("suspend")}
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            {t("delete")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm text-muted-foreground">{t("email")}:</span>{" "}
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("status")}:</span>
            <Badge variant={isSuspended ? "destructive" : "secondary"}>
              {isSuspended ? t("suspended") : t("active")}
            </Badge>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">{t("bio")}:</span>{" "}
            <span>{profile.bio || "—"}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">{t("role")}:</span>
            <Select
              value={userRole}
              onValueChange={(value) =>
                handleChangeRole(value as "USER" | "ADMIN")
              }
            >
              <SelectTrigger className="mt-1 max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">{roleLabel("USER")}</SelectItem>
                <SelectItem value="ADMIN">{roleLabel("ADMIN")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">{t("user_id")}:</span>{" "}
            <code className="text-xs">{profile.id}</code>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirm_delete")}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
