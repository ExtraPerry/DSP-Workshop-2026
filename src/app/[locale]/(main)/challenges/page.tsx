"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getLocalizedName } from "@/lib/localized-name";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target } from "lucide-react";

export default function ChallengesPage() {
  const t = useTranslations("Pages.ChallengesPage");
  const locale = useLocale();
  const { data: currentUser } = useCurrentUser();

  const { data: userChallenges, isLoading } = useRealtimeQuery({
    queryKey: ["userChallenges", currentUser?.id],
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("user_challenges")
        .select("*, challenge:challenges(*)")
        .eq("user_id", currentUser!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(currentUser?.id),
    realtimeSubscriptions: [{ table: "user_challenges" }],
  });

  const activeChallenges =
    userChallenges?.filter(
      (uc: { status: string }) => uc.status === "IN_PROGRESS"
    ) ?? [];
  const completedChallenges =
    userChallenges?.filter(
      (uc: { status: string }) => uc.status === "COMPLETED"
    ) ?? [];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            <Target className="mr-1 size-4" />
            {t("active_tab")}
          </TabsTrigger>
          <TabsTrigger value="completed">
            <Trophy className="mr-1 size-4" />
            {t("completed_tab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeChallenges.length === 0 ? (
            <p className="text-center text-muted-foreground">
              {t("no_challenges")}
            </p>
          ) : (
            <div className="space-y-4">
              {activeChallenges.map(
                (uc: {
                  id: string;
                  current_progress: number;
                  challenge: {
                    name_fr: string;
                    name_en: string | null;
                    description_fr: string | null;
                    description_en: string | null;
                    goal_count: number;
                    points_reward: number;
                    end_date: string | null;
                  };
                }) => (
                  <Card key={uc.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {getLocalizedName(uc.challenge, locale)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t("progress")}</span>
                          <span>
                            {uc.current_progress} / {uc.challenge.goal_count}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{
                              width: `${Math.min(100, (uc.current_progress / uc.challenge.goal_count) * 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {t("reward")}: {uc.challenge.points_reward}{" "}
                            {t("points")}
                          </span>
                          {uc.challenge.end_date ? (
                            <span>
                              {t("deadline")}:{" "}
                              {new Date(uc.challenge.end_date).toLocaleDateString(locale)}
                            </span>
                          ) : (
                            <span>{t("no_deadline")}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedChallenges.length === 0 ? (
            <p className="text-center text-muted-foreground">
              {t("no_challenges")}
            </p>
          ) : (
            <div className="space-y-4">
              {completedChallenges.map(
                (uc: {
                  id: string;
                  completed_at: string | null;
                  challenge: { name_fr: string; name_en: string | null; points_reward: number };
                }) => (
                  <Card key={uc.id}>
                    <CardContent className="flex items-center justify-between pt-6">
                      <div className="flex items-center gap-3">
                        <Trophy className="size-5 text-primary" />
                        <span className="font-medium">
                          {getLocalizedName(uc.challenge, locale)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          +{uc.challenge.points_reward} {t("points")}
                        </Badge>
                        {uc.completed_at && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(uc.completed_at).toLocaleDateString(locale)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
