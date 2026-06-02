"use client";

import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getLocalizedName } from "@/lib/localized-name";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

export default function SessionDetailPage() {
  const t = useTranslations("Pages.SessionDetailPage");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const sessionQueryKey = ["session", params.id] as const;

  const { data: session, isLoading } = useRealtimeQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("sessions")
        .select(
          `*, session_type:session_types(*), skill:skills(*), campus:campuses(*), organizer:users!sessions_organizer_user_id_fkey(id, first_name, last_name, email), session_participants(*, user:users(id, first_name, last_name, email))`
        )
        .eq("id", params.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(params.id),
    realtimeSubscriptions: [
      { table: "sessions", filter: `id=eq.${params.id}` },
      { table: "session_participants", filter: `session_id=eq.${params.id}` },
    ],
  });

  const isOrganizer = session?.organizer_user_id === currentUser?.id;
  const isParticipant = (session as { session_participants?: { user_id: string }[] })?.session_participants?.some(
    (participant: { user_id: string }) => participant.user_id === currentUser?.id
  );

  async function handleJoin() {
    if (!currentUser || !session) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("session_participants").insert({
      session_id: session.id,
      user_id: currentUser.id,
      role: "LEARNER",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: sessionQueryKey });
  }

  async function handleLeave() {
    if (!currentUser || !session) return;
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("session_participants")
      .delete()
      .eq("session_id", session.id)
      .eq("user_id", currentUser.id);
    queryClient.invalidateQueries({ queryKey: sessionQueryKey });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">{t("not_found")}</p>
      </div>
    );
  }

  const participants = (session as { session_participants?: { id: string; role: string; user: { id: string; first_name: string | null; last_name: string | null } | null }[] }).session_participants ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Button asChild variant="ghost">
        <Link href="/sessions">
          <ArrowLeft className="mr-2 size-4" />
          {t("back")}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{session.title}</CardTitle>
            <Badge>{session.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {session.description && <p>{session.description}</p>}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <span>
                {new Date(session.start_timestamp).toLocaleString(locale)} —{" "}
                {new Date(session.end_timestamp).toLocaleString(locale)}
              </span>
            </div>

            {(session as { campus?: { name_fr: string; name_en: string | null } }).campus && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground" />
                <span>{getLocalizedName((session as { campus: { name_fr: string; name_en: string | null } }).campus, locale)}</span>
              </div>
            )}

            {session.location && (
              <div className="text-sm">
                <span className="text-muted-foreground">{t("location")}:</span>{" "}
                {session.location}
              </div>
            )}

            {session.max_participants && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="size-4 text-muted-foreground" />
                <span>
                  {participants.length} / {session.max_participants}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {!isOrganizer && !isParticipant && session.status === "PLANNED" && (
              <Button onClick={handleJoin}>{t("join")}</Button>
            )}
            {isParticipant && !isOrganizer && (
              <Button variant="outline" onClick={handleLeave}>
                {t("leave")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("participants")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {participants.map((participant: { id: string; role: string; user: { id: string; first_name: string | null; last_name: string | null } | null }) => (
              <div
                key={participant.id}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {(participant.user?.first_name?.charAt(0) ?? "") +
                        (participant.user?.last_name?.charAt(0) ?? "")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {participant.user?.first_name} {participant.user?.last_name}
                  </span>
                </div>
                <Badge variant="outline">{participant.role}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
