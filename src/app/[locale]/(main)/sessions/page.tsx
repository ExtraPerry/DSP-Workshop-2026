"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { getLocalizedName } from "@/lib/localized-name";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, MapPin, Users } from "lucide-react";

const SESSIONS_QUERY_KEY = ["sessions"] as const;

export default function SessionsPage() {
  const t = useTranslations("Pages.SessionsPage");
  const locale = useLocale();

  const { data: sessions, isLoading } = useRealtimeQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("sessions")
        .select(
          `*, session_type:session_types(*), skill:skills(*), campus:campuses(*), organizer:users!sessions_organizer_user_id_fkey(id, first_name, last_name)`
        )
        .order("start_timestamp", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    realtimeSubscriptions: [{ table: "sessions" }],
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <Button asChild>
          <Link href="/sessions/create">
            <Plus className="mr-2 size-4" />
            {t("create_session")}
          </Link>
        </Button>
      </div>

      {(!sessions || sessions.length === 0) && (
        <p className="text-center text-muted-foreground">{t("no_sessions")}</p>
      )}

      <div className="space-y-4">
        {sessions?.map((session: Record<string, unknown>) => (
          <Link key={session.id as string} href={`/sessions/${session.id}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {session.title as string}
                  </CardTitle>
                  <Badge variant="secondary">
                    {t(`status_${(session.status as string).toLowerCase().replace("_", "_")}` as "status_planned")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    {new Date(session.start_timestamp as string).toLocaleDateString(locale)}
                  </span>
                  {session.campus && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {getLocalizedName(session.campus as { name_fr: string; name_en: string | null }, locale)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="size-4" />
                    {session.max_participants
                      ? `${t("participants")}: max ${session.max_participants}`
                      : t("participants")}
                  </span>
                  {session.skill && (
                    <Badge variant="outline">
                      {getLocalizedName(session.skill as { name_fr: string; name_en: string | null }, locale)}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
