"use client";

import { useTranslations } from "next-intl";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminGamificationPage() {
  const t = useTranslations("Pages.AdminGamificationPage");

  const { data: badges, isLoading: badgesLoading } = useRealtimeQuery({
    queryKey: ["adminBadges"],
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.from("badges").select("*").order("name_fr");
      if (error) throw error;
      return data ?? [];
    },
    realtimeSubscriptions: [{ table: "badges" }],
  });

  const { data: challenges, isLoading: challengesLoading } = useRealtimeQuery({
    queryKey: ["adminChallenges"],
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.from("challenges").select("*").order("name_fr");
      if (error) throw error;
      return data ?? [];
    },
    realtimeSubscriptions: [{ table: "challenges" }],
  });

  const { data: pointActions, isLoading: actionsLoading } = useRealtimeQuery({
    queryKey: ["adminPointActions"],
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.from("point_actions").select("*").order("action_key");
      if (error) throw error;
      return data ?? [];
    },
    realtimeSubscriptions: [{ table: "point_actions" }],
  });

  const isLoading = badgesLoading || challengesLoading || actionsLoading;

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

      <Tabs defaultValue="badges">
        <TabsList>
          <TabsTrigger value="badges">{t("badges_tab")}</TabsTrigger>
          <TabsTrigger value="challenges">{t("challenges_tab")}</TabsTrigger>
          <TabsTrigger value="actions">{t("point_actions_tab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>{t("badges_tab")}</CardTitle>
            </CardHeader>
            <CardContent>
              {(!badges || badges.length === 0) ? (
                <p className="text-muted-foreground">{t("no_items")}</p>
              ) : (
                <div className="space-y-2">
                  {badges.map((badge: { id: string; name_fr: string; name_en: string | null; points_reward: number }) => (
                    <div key={badge.id} className="flex items-center justify-between rounded-md border p-3">
                      <span className="font-medium">{badge.name_fr}</span>
                      <span className="text-sm text-muted-foreground">+{badge.points_reward} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges">
          <Card>
            <CardHeader>
              <CardTitle>{t("challenges_tab")}</CardTitle>
            </CardHeader>
            <CardContent>
              {(!challenges || challenges.length === 0) ? (
                <p className="text-muted-foreground">{t("no_items")}</p>
              ) : (
                <div className="space-y-2">
                  {challenges.map((challenge: { id: string; name_fr: string; goal_count: number; points_reward: number }) => (
                    <div key={challenge.id} className="flex items-center justify-between rounded-md border p-3">
                      <span className="font-medium">{challenge.name_fr}</span>
                      <span className="text-sm text-muted-foreground">
                        Goal: {challenge.goal_count} — +{challenge.points_reward} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>{t("point_actions_tab")}</CardTitle>
            </CardHeader>
            <CardContent>
              {(!pointActions || pointActions.length === 0) ? (
                <p className="text-muted-foreground">{t("no_items")}</p>
              ) : (
                <div className="space-y-2">
                  {pointActions.map((action: { id: string; action_key: string; name_fr: string; points_value: number }) => (
                    <div key={action.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <span className="font-medium">{action.name_fr}</span>
                        <code className="ml-2 text-xs text-muted-foreground">{action.action_key}</code>
                      </div>
                      <span className="text-sm text-muted-foreground">+{action.points_value} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
