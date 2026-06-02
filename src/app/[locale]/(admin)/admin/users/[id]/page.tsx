"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminUserDetailPage() {
  const t = useTranslations("Pages.AdminUsersPage");
  const params = useParams<{ id: string }>();
  const { data: profile, isLoading } = useUserProfile(params.id);

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
      <h1 className="text-2xl font-semibold">
        {profile.first_name} {profile.last_name}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">{t("email")}:</span>{" "}
            <span>{profile.email}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">{t("status")}:</span>{" "}
            <Badge variant="secondary">{t("active")}</Badge>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">ID:</span>{" "}
            <code className="text-xs">{profile.id}</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
