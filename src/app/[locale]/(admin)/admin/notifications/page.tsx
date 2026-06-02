"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";

export default function AdminNotificationsPage() {
  const t = useTranslations("Pages.AdminNotificationsPage");
  const { data: currentUser } = useCurrentUser();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSendBroadcast() {
    if (!currentUser || !title.trim() || !body.trim()) return;
    setIsSending(true);

    const supabase = createSupabaseBrowserClient();

    const { data: allUsers } = await supabase.from("users").select("id");

    if (allUsers && allUsers.length > 0) {
      const notifications = allUsers.map((user: { id: string }) => ({
        recipient_user_id: user.id,
        sender_user_id: currentUser.id,
        notification_type: "ADMIN_BROADCAST" as const,
        title_key: title,
        body_key: body,
      }));

      await supabase.from("notifications").insert(notifications);
    }

    setIsSending(false);
    setTitle("");
    setBody("");
    toast.success("Broadcast sent");
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

          <Button
            onClick={handleSendBroadcast}
            disabled={isSending || !title.trim() || !body.trim()}
          >
            {isSending ? "..." : t("send")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
