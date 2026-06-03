"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import {
  useSkills,
  useCampuses,
  useSessionTypes,
} from "@/hooks/use-lookups";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { useQueryClient } from "@tanstack/react-query";
import type { Enums } from "@/lib/supabase/database.types";
import { Constants } from "@/lib/supabase/database.types";
import { formatAdminError } from "@/lib/admin/format-admin-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { LookupCombobox } from "@/components/lookup-combobox";
import { DateTimePicker } from "@/components/date-time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

const ADMIN_SESSIONS_QUERY_KEY = ["adminSessions"] as const;
const SESSION_STATUSES = Constants.public.Enums.session_status_type;

type SessionStatus = Enums<"session_status_type">;

type AdminSessionRow = {
  id: string;
  title: string;
  description: string | null;
  status: SessionStatus;
  start_timestamp: string;
  end_timestamp: string;
  session_type_id: string;
  skill_id: string;
  campus_id: string | null;
  location: string | null;
  max_participants: number | null;
  organizer: { first_name: string | null; last_name: string | null } | null;
};

type SessionEditForm = {
  title: string;
  description: string;
  sessionTypeId: string;
  skillId: string;
  campusId: string | null;
  location: string;
  maxParticipants: string;
  startTimestamp: string;
  endTimestamp: string;
};

function sessionToEditForm(session: AdminSessionRow): SessionEditForm {
  return {
    title: session.title,
    description: session.description ?? "",
    sessionTypeId: session.session_type_id,
    skillId: session.skill_id,
    campusId: session.campus_id,
    location: session.location ?? "",
    maxParticipants:
      session.max_participants != null ? String(session.max_participants) : "",
    startTimestamp: session.start_timestamp,
    endTimestamp: session.end_timestamp,
  };
}

export default function AdminSessionsPage() {
  const t = useTranslations("Pages.AdminSessionsPage");
  const tCommon = useTranslations("Pages.AdminCommon");
  const queryClient = useQueryClient();
  const { data: skills } = useSkills();
  const { data: campuses } = useCampuses();
  const { data: sessionTypes } = useSessionTypes();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<AdminSessionRow | null>(
    null
  );
  const [editForm, setEditForm] = useState<SessionEditForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: sessions, isLoading } = useRealtimeQuery<AdminSessionRow[]>({
    queryKey: ADMIN_SESSIONS_QUERY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("sessions")
        .select(
          "*, organizer:users!sessions_organizer_user_id_fkey(first_name, last_name)"
        )
        .order("start_timestamp", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as AdminSessionRow[];
    },
    realtimeSubscriptions: [{ table: "sessions" }],
  });

  const statusLabel: Record<SessionStatus, string> = {
    PLANNED: t("status_planned"),
    IN_PROGRESS: t("status_in_progress"),
    COMPLETED: t("status_completed"),
    CANCELLED: t("status_cancelled"),
  };

  const filteredSessions = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return (sessions ?? []).filter((session) => {
      if (statusFilter !== "ALL" && session.status !== statusFilter) {
        return false;
      }
      if (!normalized) return true;
      return session.title.toLowerCase().includes(normalized);
    });
  }, [sessions, search, statusFilter]);

  function openEditDialog(session: AdminSessionRow) {
    setEditingSession(session);
    setEditForm(sessionToEditForm(session));
  }

  function closeEditDialog() {
    setEditingSession(null);
    setEditForm(null);
  }

  async function handleChangeStatus(sessionId: string, status: SessionStatus) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("sessions")
      .update({ status })
      .eq("id", sessionId);
    if (error) {
      toast.error(formatAdminError(error.message, tCommon));
      return;
    }
    queryClient.invalidateQueries({ queryKey: ADMIN_SESSIONS_QUERY_KEY });
    toast.success(t("updated"));
  }

  async function handleSaveEdit() {
    if (!editingSession || !editForm) return;
    if (
      !editForm.title.trim() ||
      !editForm.sessionTypeId ||
      !editForm.skillId ||
      !editForm.startTimestamp ||
      !editForm.endTimestamp
    ) {
      toast.error(t("edit_validation_error"));
      return;
    }

    setIsSaving(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("sessions")
      .update({
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        session_type_id: editForm.sessionTypeId,
        skill_id: editForm.skillId,
        campus_id: editForm.campusId,
        location: editForm.location.trim() || null,
        max_participants: editForm.maxParticipants
          ? parseInt(editForm.maxParticipants, 10)
          : null,
        start_timestamp: editForm.startTimestamp,
        end_timestamp: editForm.endTimestamp,
      })
      .eq("id", editingSession.id);

    setIsSaving(false);

    if (error) {
      toast.error(formatAdminError(error.message, tCommon));
      return;
    }

    queryClient.invalidateQueries({ queryKey: ADMIN_SESSIONS_QUERY_KEY });
    toast.success(t("updated"));
    closeEditDialog();
  }

  async function handleConfirmDelete() {
    if (!deletingId) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("sessions").delete().eq("id", deletingId);
    setDeletingId(null);
    if (error) {
      toast.error(formatAdminError(error.message, tCommon));
      return;
    }
    queryClient.invalidateQueries({ queryKey: ADMIN_SESSIONS_QUERY_KEY });
    toast.success(t("deleted"));
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

      <div className="flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("search_placeholder")}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filter_status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("all_statuses")}</SelectItem>
            {SESSION_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabel[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredSessions.length === 0 ? (
        <p className="text-center text-muted-foreground">{t("no_sessions")}</p>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 pt-6">
                <div>
                  <span className="font-medium">{session.title}</span>
                  <p className="text-xs text-muted-foreground">
                    {session.organizer?.first_name}{" "}
                    {session.organizer?.last_name} —{" "}
                    {new Date(session.start_timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{statusLabel[session.status]}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(session)}
                  >
                    <Pencil className="mr-1 size-4" />
                    {t("edit")}
                  </Button>
                  <Select
                    value={session.status}
                    onValueChange={(value) =>
                      handleChangeStatus(session.id, value as SessionStatus)
                    }
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder={t("change_status")} />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabel[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(session.id)}
                    aria-label={t("delete")}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(editingSession && editForm)}
        onOpenChange={(open) => !open && closeEditDialog()}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("edit_session")}</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <Field>
                <FieldLabel>{t("field_title")}</FieldLabel>
                <Input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>{t("field_description")}</FieldLabel>
                <Textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>{t("field_session_type")}</FieldLabel>
                <LookupCombobox
                  items={sessionTypes ?? []}
                  value={editForm.sessionTypeId || null}
                  onChange={(id) =>
                    setEditForm({
                      ...editForm,
                      sessionTypeId: id ?? "",
                    })
                  }
                  placeholder={t("select_session_type")}
                />
              </Field>
              <Field>
                <FieldLabel>{t("field_skill")}</FieldLabel>
                <LookupCombobox
                  items={skills ?? []}
                  value={editForm.skillId || null}
                  onChange={(id) =>
                    setEditForm({ ...editForm, skillId: id ?? "" })
                  }
                  placeholder={t("select_skill")}
                />
              </Field>
              <Field>
                <FieldLabel>{t("field_campus")}</FieldLabel>
                <LookupCombobox
                  items={campuses ?? []}
                  value={editForm.campusId}
                  onChange={(id) =>
                    setEditForm({ ...editForm, campusId: id })
                  }
                  placeholder={t("select_campus")}
                  allowClear
                />
              </Field>
              <Field>
                <FieldLabel>{t("field_location")}</FieldLabel>
                <Input
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>{t("field_max_participants")}</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={editForm.maxParticipants}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      maxParticipants: e.target.value,
                    })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>{t("field_start")}</FieldLabel>
                <DateTimePicker
                  value={editForm.startTimestamp}
                  onChange={(iso) =>
                    setEditForm({ ...editForm, startTimestamp: iso })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>{t("field_end")}</FieldLabel>
                <DateTimePicker
                  value={editForm.endTimestamp}
                  onChange={(iso) =>
                    setEditForm({ ...editForm, endTimestamp: iso })
                  }
                />
              </Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirm_delete")}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
