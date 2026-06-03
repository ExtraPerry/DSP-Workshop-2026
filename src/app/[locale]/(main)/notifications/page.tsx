"use client";

import { useTranslations } from "next-intl";
import {
  resolveNotificationBody,
  resolveNotificationText,
} from "@/lib/notifications/resolve-notification-text";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import { useCurrentUser } from "@/hooks/use-current-user";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck } from "lucide-react";

const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export default function NotificationsPage() {
  const t = useTranslations("Pages.NotificationsPage");
  const translateNotification = useTranslations("Notifications");
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useRealtimeQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_user_id", currentUser!.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(currentUser?.id),
    realtimeSubscriptions: [{ table: "notifications" }],
  });

  async function handleMarkAllRead() {
    if (!currentUser) return;
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_user_id", currentUser.id)
      .eq("is_read", false);
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        {notifications && notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-2 size-4" />
            {t("mark_all_read")}
          </Button>
        )}
      </div>

      {(!notifications || notifications.length === 0) && (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <Bell className="size-10" />
          <p>{t("no_notifications")}</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications?.map(
          (notification: {
            id: string;
            title_key: string;
            body_key: string;
            is_read: boolean;
            notification_type: string;
            created_at: string;
          }) => (
            <Card
              key={notification.id}
              className={notification.is_read ? "opacity-60" : ""}
            >
              <CardContent className="flex items-center gap-4 py-4">
                {!notification.is_read && (
                  <div className="size-2 shrink-0 rounded-full bg-primary" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {resolveNotificationText(
                      notification.title_key,
                      translateNotification
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {resolveNotificationBody(
                      notification,
                      translateNotification
                    )}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
