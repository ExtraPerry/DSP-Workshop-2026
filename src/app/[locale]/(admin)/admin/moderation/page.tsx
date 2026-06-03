"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { formatAdminError } from "@/lib/admin/format-admin-error";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const REPORTS_QUERY_KEY = ["contentReports"] as const;

type ContentReport = {
  id: string;
  reason: string;
  status: string;
  reported_entity_type: string;
  reported_entity_id: string;
  created_at: string;
  reporter: { first_name: string | null; last_name: string | null } | null;
};

type ReportedContent = {
  content: string;
  authorUserId: string | null;
};

function reportEntityTypeLabel(
  entityType: string,
  translate: (key: "entity_type_post" | "entity_type_comment") => string
): string {
  if (entityType === "post") return translate("entity_type_post");
  if (entityType === "comment") return translate("entity_type_comment");
  return entityType;
}

function reportStatusLabel(
  status: string,
  translate: (
    key: "report_status_PENDING" | "report_status_RESOLVED" | "report_status_DISMISSED"
  ) => string
): string {
  if (status === "PENDING") return translate("report_status_PENDING");
  if (status === "RESOLVED") return translate("report_status_RESOLVED");
  if (status === "DISMISSED") return translate("report_status_DISMISSED");
  return status;
}

async function fetchReportedContent(
  report: ContentReport
): Promise<ReportedContent | null> {
  const supabase = createSupabaseBrowserClient();

  if (report.reported_entity_type === "post") {
    const { data } = await supabase
      .from("posts")
      .select("content, author_user_id")
      .eq("id", report.reported_entity_id)
      .maybeSingle();
    if (!data) return null;
    return { content: data.content, authorUserId: data.author_user_id };
  }

  if (report.reported_entity_type === "comment") {
    const { data } = await supabase
      .from("post_comments")
      .select("content, author_user_id")
      .eq("id", report.reported_entity_id)
      .maybeSingle();
    if (!data) return null;
    return { content: data.content, authorUserId: data.author_user_id };
  }

  return null;
}

function ReportCard({
  report,
  onResolve,
  onDismiss,
  onRemoveContent,
  onWarnOffender,
  onSuspendOffender,
}: {
  report: ContentReport;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
  onRemoveContent: (report: ContentReport) => Promise<void>;
  onWarnOffender: (userId: string, report: ContentReport) => Promise<void>;
  onSuspendOffender: (userId: string) => Promise<void>;
}) {
  const t = useTranslations("Pages.AdminModerationPage");
  const [reportedContent, setReportedContent] = useState<ReportedContent | null>(
    null
  );
  const [contentLoading, setContentLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setContentLoading(true);
    fetchReportedContent(report).then((result) => {
      if (!cancelled) {
        setReportedContent(result);
        setContentLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [report.id, report.reported_entity_id, report.reported_entity_type]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {reportEntityTypeLabel(report.reported_entity_type, t)}
          </CardTitle>
          <Badge
            variant={report.status === "PENDING" ? "default" : "secondary"}
          >
            {reportStatusLabel(report.status, t)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">
          <span className="font-medium">{t("reason")}:</span> {report.reason}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("reporter")}: {report.reporter?.first_name}{" "}
          {report.reporter?.last_name} —{" "}
          {new Date(report.created_at).toLocaleString()}
        </p>

        <div className="rounded-md border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            {t("reported_content")}
          </p>
          {contentLoading ? (
            <Skeleton className="mt-2 h-12 w-full" />
          ) : reportedContent ? (
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {reportedContent.content}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              {t("content_not_found")}
            </p>
          )}
        </div>

        {report.status === "PENDING" && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={actionLoading || !reportedContent}
              onClick={async () => {
                setActionLoading(true);
                await onRemoveContent(report);
                setActionLoading(false);
              }}
            >
              {t("remove_content")}
            </Button>
            {reportedContent?.authorUserId && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionLoading}
                  onClick={async () => {
                    setActionLoading(true);
                    await onWarnOffender(
                      reportedContent.authorUserId!,
                      report
                    );
                    setActionLoading(false);
                  }}
                >
                  {t("warn_offender")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionLoading}
                  onClick={async () => {
                    setActionLoading(true);
                    await onSuspendOffender(reportedContent.authorUserId!);
                    setActionLoading(false);
                  }}
                >
                  {t("suspend_offender")}
                </Button>
              </>
            )}
            <Button size="sm" onClick={() => onResolve(report.id)}>
              {t("resolve")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDismiss(report.id)}
            >
              {t("dismiss")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminModerationPage() {
  const t = useTranslations("Pages.AdminModerationPage");
  const tCommon = useTranslations("Pages.AdminCommon");
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useRealtimeQuery<ContentReport[]>({
    queryKey: REPORTS_QUERY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("content_reports")
        .select(
          "*, reporter:users!content_reports_reporter_user_id_fkey(id, first_name, last_name)"
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ContentReport[];
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
    toast.success(t("resolved"));
  }

  async function handleDismiss(reportId: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("content_reports")
      .update({ status: "DISMISSED" })
      .eq("id", reportId);
    queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
    toast.success(t("dismissed"));
  }

  async function handleRemoveContent(report: ContentReport) {
    const supabase = createSupabaseBrowserClient();
    if (report.reported_entity_type === "post") {
      await supabase.from("posts").delete().eq("id", report.reported_entity_id);
    } else if (report.reported_entity_type === "comment") {
      await supabase
        .from("post_comments")
        .delete()
        .eq("id", report.reported_entity_id);
    }
    await supabase
      .from("content_reports")
      .update({ status: "RESOLVED" })
      .eq("id", report.id);
    queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
    toast.success(t("content_removed"));
  }

  async function handleWarnOffender(userId: string, report: ContentReport) {
    if (!currentUser) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("notifications").insert({
      recipient_user_id: userId,
      sender_user_id: currentUser.id,
      notification_type: "ADMIN_BROADCAST",
      title_key: t("warn_notification_title"),
      body_key: t("warn_notification_body", { reason: report.reason }),
      reference_id: report.id,
      reference_type: "content_report",
    });
    if (error) {
      toast.error(formatAdminError(error.message, tCommon));
      return;
    }
    toast.success(t("offender_warned"));
  }

  async function handleSuspendOffender(userId: string) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("users")
      .update({ suspended_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) {
      toast.error(formatAdminError(error.message, tCommon));
      return;
    }
    toast.success(t("offender_suspended"));
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
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onResolve={handleResolve}
              onDismiss={handleDismiss}
              onRemoveContent={handleRemoveContent}
              onWarnOffender={handleWarnOffender}
              onSuspendOffender={handleSuspendOffender}
            />
          ))}
        </div>
      )}
    </div>
  );
}
