"use client";

import { useTranslations } from "next-intl";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ADMIN_SESSIONS_QUERY_KEY = ["adminSessions"] as const;

export default function AdminSessionsPage() {
  const t = useTranslations("Pages.AdminSessionsPage");
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useRealtimeQuery({
    queryKey: ADMIN_SESSIONS_QUERY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("sessions")
        .select("*, organizer:users!sessions_organizer_user_id_fkey(first_name, last_name)")
        .order("start_timestamp", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    realtimeSubscriptions: [{ table: "sessions" }],
  });

  async function handleCancel(sessionId: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("sessions")
      .update({ status: "CANCELLED" })
      .eq("id", sessionId);
    queryClient.invalidateQueries({ queryKey: ADMIN_SESSIONS_QUERY_KEY });
    toast.success("Session cancelled");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      {(!sessions || sessions.length === 0) ? (
        <p className="text-center text-muted-foreground">{t("no_sessions")}</p>
      ) : (
        <div className="space-y-3">
          {sessions.map(
            (session: {
              id: string;
              title: string;
              status: string;
              start_timestamp: string;
              organizer: { first_name: string | null; last_name: string | null } | null;
            }) => (
              <Card key={session.id}>
                <CardContent className="flex items-center justify-between pt-6">
                  <div>
                    <span className="font-medium">{session.title}</span>
                    <p className="text-xs text-muted-foreground">
                      {session.organizer?.first_name} {session.organizer?.last_name} —{" "}
                      {new Date(session.start_timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{session.status}</Badge>
                    {session.status === "PLANNED" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancel(session.id)}
                      >
                        {t("cancel_session")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
