"use client";

import { useTranslations } from "next-intl";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { Link } from "@/i18n/navigation";
import { UserAvatar } from "@/components/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

interface LeaderboardEntry {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  totalPoints: number;
  badgeCount: number;
}

export default function LeaderboardPage() {
  const t = useTranslations("Pages.LeaderboardPage");

  const { data: leaderboard, isLoading } = useRealtimeQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();

      const { data: pointsData, error: pointsError } = await supabase
        .from("user_points_ledger")
        .select("user_id, points_earned");

      if (pointsError) throw pointsError;

      const pointsByUser = new Map<string, number>();
      for (const row of pointsData ?? []) {
        pointsByUser.set(
          row.user_id,
          (pointsByUser.get(row.user_id) ?? 0) + row.points_earned
        );
      }

      const userIds = Array.from(pointsByUser.keys());
      if (userIds.length === 0) return [];

      const { data: users } = await supabase
        .from("users")
        .select("id, first_name, last_name, avatar_url")
        .in("id", userIds);

      const { data: badges } = await supabase
        .from("user_badges")
        .select("user_id")
        .in("user_id", userIds);

      const badgeCountByUser = new Map<string, number>();
      for (const badge of badges ?? []) {
        badgeCountByUser.set(
          badge.user_id,
          (badgeCountByUser.get(badge.user_id) ?? 0) + 1
        );
      }

      const entries: LeaderboardEntry[] = userIds.map((userId) => {
        const user = (users ?? []).find((u: { id: string }) => u.id === userId);
        return {
          userId,
          firstName: user?.first_name ?? null,
          lastName: user?.last_name ?? null,
          avatarUrl: user?.avatar_url ?? null,
          totalPoints: pointsByUser.get(userId) ?? 0,
          badgeCount: badgeCountByUser.get(userId) ?? 0,
        };
      });

      entries.sort((a, b) => b.totalPoints - a.totalPoints);
      return entries.slice(0, 50);
    },
    realtimeSubscriptions: [
      { table: "user_points_ledger" },
      { table: "user_badges" },
    ],
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!leaderboard || leaderboard.length === 0) ? (
            <p className="text-center text-muted-foreground">{t("no_data")}</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <UserAvatar
                      avatarUrl={entry.avatarUrl}
                      firstName={entry.firstName}
                      lastName={entry.lastName}
                      className="size-8"
                      fallbackClassName="text-xs"
                    />
                    <Link
                      href={`/profile/${entry.userId}`}
                      className="font-medium hover:underline"
                    >
                      {entry.firstName} {entry.lastName}
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold">
                      {entry.totalPoints} {t("points")}
                    </span>
                    <span className="text-muted-foreground">
                      {entry.badgeCount} {t("badges")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
