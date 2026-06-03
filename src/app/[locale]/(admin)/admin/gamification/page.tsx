"use client";

import { useTranslations } from "next-intl";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EntityManager,
  type EntityField,
} from "@/components/admin/entity-manager";
import { ChallengeImageUpload } from "@/components/admin/challenge-image-upload";
import type { Tables } from "@/lib/supabase/database.types";

const BADGES_QUERY_KEY = ["adminBadges"] as const;
const CHALLENGES_QUERY_KEY = ["adminChallenges"] as const;
const POINT_ACTIONS_QUERY_KEY = ["adminPointActions"] as const;

export default function AdminGamificationPage() {
  const t = useTranslations("Pages.AdminGamificationPage");

  const badgeFields: EntityField[] = [
    { name: "name_fr", label: t("field_name_fr"), required: true },
    { name: "name_en", label: t("field_name_en") },
    { name: "description_fr", label: t("field_description_fr"), type: "textarea" },
    { name: "description_en", label: t("field_description_en"), type: "textarea" },
    { name: "criteria_description", label: t("field_criteria"), type: "textarea" },
    { name: "points_reward", label: t("field_points"), type: "number", required: true },
  ];

  const challengeFields: EntityField[] = [
    { name: "name_fr", label: t("field_name_fr"), required: true },
    { name: "name_en", label: t("field_name_en") },
    { name: "description_fr", label: t("field_description_fr"), type: "textarea" },
    { name: "description_en", label: t("field_description_en"), type: "textarea" },
    { name: "goal_type", label: t("field_goal_type"), required: true },
    { name: "goal_count", label: t("field_goal_count"), type: "number", required: true },
    { name: "points_reward", label: t("field_points"), type: "number", required: true },
    { name: "start_date", label: t("field_start_date"), type: "date" },
    { name: "end_date", label: t("field_end_date"), type: "date" },
  ];

  const pointActionFields: EntityField[] = [
    { name: "action_key", label: t("field_action_key"), required: true },
    { name: "name_fr", label: t("field_name_fr"), required: true },
    { name: "name_en", label: t("field_name_en") },
    { name: "points_value", label: t("field_points"), type: "number", required: true },
  ];

  const { data: badges, isLoading: badgesLoading } = useRealtimeQuery({
    queryKey: BADGES_QUERY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.from("badges").select("*").order("name_fr");
      if (error) throw error;
      return data ?? [];
    },
    realtimeSubscriptions: [{ table: "badges" }],
  });

  const { data: challenges, isLoading: challengesLoading } = useRealtimeQuery({
    queryKey: CHALLENGES_QUERY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.from("challenges").select("*").order("name_fr");
      if (error) throw error;
      return data ?? [];
    },
    realtimeSubscriptions: [{ table: "challenges" }],
  });

  const { data: pointActions, isLoading: actionsLoading } = useRealtimeQuery({
    queryKey: POINT_ACTIONS_QUERY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("point_actions")
        .select("*")
        .order("action_key");
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
              <EntityManager
                tableName="badges"
                items={badges}
                queryKey={BADGES_QUERY_KEY}
                fields={badgeFields}
                addLabel={t("add_badge")}
                getPrimaryText={(item) => item.name_fr}
                getSecondaryText={(item) =>
                  `+${item.points_reward} ${t("field_points")}`
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges">
          <Card>
            <CardHeader>
              <CardTitle>{t("challenges_tab")}</CardTitle>
            </CardHeader>
            <CardContent>
              <EntityManager
                tableName="challenges"
                items={challenges}
                queryKey={CHALLENGES_QUERY_KEY}
                fields={challengeFields}
                addLabel={t("add_challenge")}
                getPrimaryText={(item) => item.name_fr}
                getSecondaryText={(item) =>
                  `${item.goal_type}: ${item.goal_count} — +${item.points_reward}`
                }
                renderRowExtra={(item: Tables<"challenges">) => (
                  <ChallengeImageUpload
                    challenge={item}
                    queryKey={CHALLENGES_QUERY_KEY}
                  />
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>{t("point_actions_tab")}</CardTitle>
            </CardHeader>
            <CardContent>
              <EntityManager
                tableName="point_actions"
                items={pointActions}
                queryKey={POINT_ACTIONS_QUERY_KEY}
                fields={pointActionFields}
                addLabel={t("add_action")}
                getPrimaryText={(item) => item.name_fr}
                getSecondaryText={(item) =>
                  `${item.action_key} — +${item.points_value}`
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
