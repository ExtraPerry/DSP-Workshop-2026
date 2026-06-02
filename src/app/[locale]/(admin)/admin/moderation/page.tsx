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

const REPORTS_QUERY_KEY = ["contentReports"] as const;

export default function AdminModerationPage() {
  const t = useTranslations("Pages.AdminModerationPage");
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useRealtimeQuery({
    queryKey: REPORTS_QUERY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("content_reports")
        .select("*, reporter:users!content_reports_reporter_user_id_fkey(id, first_name, last_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    realtimeSubscriptions: [{ table: "content_reports" }],
  });

  async function handleResolve(reportId: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("content_reports")
      .update({ status: "RESOLVED" })
      .eq("id", reportId);
    queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
    toast.success("Report resolved");
  }

  async function handleDismiss(reportId: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("content_reports")
      .update({ status: "DISMISSED" })
      .eq("id", reportId);
    queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
    toast.success("Report dismissed");
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

      {(!reports || reports.length === 0) ? (
        <p className="text-center text-muted-foreground">{t("no_reports")}</p>
      ) : (
        <div className="space-y-4">
          {reports.map(
            (report: {
              id: string;
              reason: string;
              status: string;
              reported_entity_type: string;
              created_at: string;
              reporter: { first_name: string | null; last_name: string | null } | null;
            }) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {report.reported_entity_type}
                    </CardTitle>
                    <Badge
                      variant={report.status === "PENDING" ? "default" : "secondary"}
                    >
                      {report.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{report.reason}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("reporter")}: {report.reporter?.first_name}{" "}
                    {report.reporter?.last_name} —{" "}
                    {new Date(report.created_at).toLocaleString()}
                  </p>
                  {report.status === "PENDING" && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => handleResolve(report.id)}>
                        {t("resolve")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismiss(report.id)}
                      >
                        {t("dismiss")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
