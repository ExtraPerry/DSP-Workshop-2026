"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCampuses, useCourses } from "@/hooks/use-lookups";
import { toast } from "sonner";
import { formatAdminError } from "@/lib/admin/format-admin-error";
import { resolveNotificationText } from "@/lib/notifications/resolve-notification-text";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LookupCombobox } from "@/components/lookup-combobox";

const BROADCAST_HISTORY_KEY = ["adminBroadcastHistory"] as const;

type BroadcastGroup = {
  title_key: string;
  body_key: string;
  sent_at: string;
  recipient_count: number;
};

export default function AdminNotificationsPage() {
  const t = useTranslations("Pages.AdminNotificationsPage");
  const tCommon = useTranslations("Pages.AdminCommon");
  const tNotifications = useTranslations("Notifications");
  const locale = useLocale();
  const { data: currentUser } = useCurrentUser();
  const { data: campuses } = useCampuses();
  const { data: courses } = useCourses();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<"ALL" | "CAMPUS" | "COURSE" | "ROLE">(
    "ALL"
  );
  const [campusId, setCampusId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<"USER" | "ADMIN">("USER");
  const [isSending, setIsSending] = useState(false);

  const { data: broadcastHistory } = useRealtimeQuery({
    queryKey: BROADCAST_HISTORY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("notifications")
        .select("title_key, body_key, created_at")
        .eq("notification_type", "ADMIN_BROADCAST")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;

      const groups = new Map<string, BroadcastGroup>();
      for (const row of data ?? []) {
        const groupKey = `${row.title_key}::${row.body_key}`;
        const existing = groups.get(groupKey);
        if (!existing) {
          groups.set(groupKey, {
            title_key: row.title_key,
            body_key: row.body_key,
            sent_at: row.created_at,
            recipient_count: 1,
          });
        } else {
          existing.recipient_count += 1;
        }
      }
      return Array.from(groups.values());
    },
    realtimeSubscriptions: [{ table: "notifications" }],
  });

  const canSend = useMemo(() => {
    if (!title.trim() || !body.trim()) return false;
    if (target === "CAMPUS" && !campusId) return false;
    if (target === "COURSE" && !courseId) return false;
    return true;
  }, [title, body, target, campusId, courseId]);

  async function resolveRecipientIds(): Promise<string[]> {
    const supabase = createSupabaseBrowserClient();

    if (target === "ALL") {
      const { data } = await supabase.from("users").select("id");
      return (data ?? []).map((row) => row.id);
    }

    if (target === "CAMPUS" && campusId) {
      const { data } = await supabase
        .from("users_campuses")
        .select("user_id")
        .eq("campus_id", campusId);
      return [...new Set((data ?? []).map((row) => row.user_id))];
    }

    if (target === "COURSE" && courseId) {
      const { data } = await supabase
        .from("users_courses")
        .select("user_id")
        .eq("class_id", courseId);
      return [...new Set((data ?? []).map((row) => row.user_id))];
    }

    if (target === "ROLE") {
      const { data } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", roleFilter);
      return (data ?? []).map((row) => row.user_id);
    }

    return [];
  }

  async function handleSendBroadcast() {
    if (!currentUser || !canSend) return;
    setIsSending(true);

    const recipientIds = await resolveRecipientIds();
    if (recipientIds.length === 0) {
      setIsSending(false);
      toast.error(t("no_recipients"));
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const notifications = recipientIds.map((userId) => ({
      recipient_user_id: userId,
      sender_user_id: currentUser.id,
      notification_type: "ADMIN_BROADCAST" as const,
      title_key: title.trim(),
      body_key: body.trim(),
    }));

    const { error } = await supabase.from("notifications").insert(notifications);
    setIsSending(false);

    if (error) {
      toast.error(formatAdminError(error.message, tCommon));
      return;
    }

    setTitle("");
    setBody("");
    toast.success(t("sent_success"));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("send_broadcast")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel>{t("title_label")}</FieldLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>

          <Field>
            <FieldLabel>{t("body_label")}</FieldLabel>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
            />
          </Field>

          <Field>
            <FieldLabel>{t("target")}</FieldLabel>
            <Select
              value={target}
              onValueChange={(value) =>
                setTarget(value as "ALL" | "CAMPUS" | "COURSE" | "ROLE")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("all_users")}</SelectItem>
                <SelectItem value="CAMPUS">{t("by_campus")}</SelectItem>
                <SelectItem value="COURSE">{t("by_course")}</SelectItem>
                <SelectItem value="ROLE">{t("by_role")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {target === "CAMPUS" && (
            <Field>
              <FieldLabel>{t("select_campus")}</FieldLabel>
              <LookupCombobox
                items={campuses ?? []}
                value={campusId}
                onChange={setCampusId}
                allowClear={false}
                allowCreate={false}
              />
            </Field>
          )}

          {target === "COURSE" && (
            <Field>
              <FieldLabel>{t("select_course")}</FieldLabel>
              <LookupCombobox
                items={courses ?? []}
                value={courseId}
                onChange={setCourseId}
                allowClear={false}
                allowCreate={false}
              />
            </Field>
          )}

          {target === "ROLE" && (
            <Field>
              <FieldLabel>{t("select_role")}</FieldLabel>
              <Select
                value={roleFilter}
                onValueChange={(value) =>
                  setRoleFilter(value as "USER" | "ADMIN")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">{tCommon("role_user")}</SelectItem>
                  <SelectItem value="ADMIN">{tCommon("role_admin")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}

          <Button onClick={handleSendBroadcast} disabled={isSending || !canSend}>
            {isSending ? t("sending") : t("send")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("history")}</CardTitle>
        </CardHeader>
        <CardContent>
          {(!broadcastHistory || broadcastHistory.length === 0) ? (
            <p className="text-muted-foreground">{t("no_history")}</p>
          ) : (
            <div className="space-y-3">
              {broadcastHistory.map((entry) => (
                <div
                  key={`${entry.title_key}-${entry.sent_at}`}
                  className="rounded-md border p-3"
                >
                  <p className="font-medium">
                    {resolveNotificationText(entry.title_key, tNotifications)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {resolveNotificationText(entry.body_key, tNotifications)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(entry.sent_at).toLocaleString(locale)} —{" "}
                    {entry.recipient_count} {t("recipients")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
