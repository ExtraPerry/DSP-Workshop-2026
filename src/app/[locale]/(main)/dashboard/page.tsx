"use client";

import { useTranslations, useLocale } from "next-intl";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import { getLocalizedName } from "@/lib/localized-name";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Zap, BookOpen, Trophy } from "lucide-react";

export default function DashboardPage() {
  const t = useTranslations("Pages.HomePage");
  const locale = useLocale();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();

  type UpcomingSession = {
    id: string;
    title: string;
    start_timestamp: string;
    skill: { name_fr: string; name_en: string | null } | null;
  };

  const { data: upcomingSessions } = useRealtimeQuery<UpcomingSession[]>({
    queryKey: ["upcomingSessions", currentUser?.id],
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("session_participants")
        .select("session:sessions(id, title, start_timestamp, status, skill:skills(name_fr, name_en))")
        .eq("user_id", currentUser!.id)
        .limit(5);
      if (error) throw error;
      return (data ?? [])
        .map((row: { session: UpcomingSession | null }) => row.session)
        .filter((session): session is UpcomingSession => Boolean(session));
    },
    enabled: Boolean(currentUser?.id),
    realtimeSubscriptions: [{ table: "session_participants" }, { table: "sessions" }],
  });

  const { data: mySkills } = useRealtimeQuery({
    queryKey: ["homeSkills", currentUser?.id],
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("users_skills")
        .select("*, skill:skills(name_fr, name_en)")
        .eq("user_id", currentUser!.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(currentUser?.id),
    realtimeSubscriptions: [{ table: "users_skills" }],
  });

  if (isUserLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("welcome")}, {currentUser?.first_name ?? ""}!
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-5" />
              {t("upcoming_sessions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!upcomingSessions || upcomingSessions.length === 0) ? (
              <p className="text-sm text-muted-foreground">
                {t("no_upcoming_sessions")}
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingSessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/sessions/${session.id}`}
                      className="flex items-center justify-between rounded-md border p-2 transition-colors hover:bg-muted/50"
                    >
                      <span className="text-sm font-medium">{session.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.start_timestamp).toLocaleDateString(locale)}
                      </span>
                    </Link>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="size-5" />
              {t("your_skills")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!mySkills || mySkills.length === 0) ? (
              <p className="text-sm text-muted-foreground">
                {t("no_upcoming_sessions")}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {mySkills.map(
                  (userSkill: {
                    id: string;
                    user_skill_level: number;
                    skill: { name_fr: string; name_en: string | null } | null;
                  }) => (
                    <Badge key={userSkill.id} variant="secondary">
                      {getLocalizedName(userSkill.skill, locale)} (Lv. {userSkill.user_skill_level})
                    </Badge>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("quick_actions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/matching">
                <Zap className="mr-2 size-4" />
                {t("find_match")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sessions/create">
                <Calendar className="mr-2 size-4" />
                {t("create_session")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/feed">
                <BookOpen className="mr-2 size-4" />
                {t("view_feed")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/challenges">
                <Trophy className="mr-2 size-4" />
                {t("view_challenges")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
