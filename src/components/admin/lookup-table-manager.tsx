"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { formatAdminError } from "@/lib/admin/format-admin-error";
import { getLocalizedName } from "@/lib/localized-name";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Plus, Trash2, Check } from "lucide-react";

export type ManagedLookupTable =
  | "skills"
  | "courses"
  | "campuses"
  | "academic_levels"
  | "session_types";

export type ManagedLookupRow = {
  id: string;
  name_fr: string;
  name_en: string | null;
  is_verified?: boolean;
};

type LookupTableManagerProps = {
  tableName: ManagedLookupTable;
  items: ManagedLookupRow[] | undefined;
  queryKey: QueryKey;
  supportsVerification?: boolean;
};

export function LookupTableManager({
  tableName,
  items,
  queryKey,
  supportsVerification = false,
}: LookupTableManagerProps) {
  const t = useTranslations("Pages.AdminLookupsPage");
  const tCommon = useTranslations("Pages.AdminCommon");
  const locale = useLocale();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey });
  }

  const filteredItems = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const list = items ?? [];
    if (!normalized) return list;
    return list.filter((item) =>
      getLocalizedName(item, locale).toLowerCase().includes(normalized)
    );
  }, [items, search, locale]);

  const pendingItems = supportsVerification
    ? filteredItems.filter((item) => item.is_verified === false)
    : [];
  const verifiedItems = supportsVerification
    ? filteredItems.filter((item) => item.is_verified !== false)
    : filteredItems;

  function openAddDialog() {
    setEditingId(null);
    setNameFr("");
    setNameEn("");
    setDialogOpen(true);
  }

  function openEditDialog(row: ManagedLookupRow) {
    setEditingId(row.id);
    setNameFr(row.name_fr);
    setNameEn(row.name_en ?? "");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!nameFr.trim()) return;
    const supabase = createSupabaseBrowserClient();
    const payload: Record<string, unknown> = {
      name_fr: nameFr.trim(),
      name_en: nameEn.trim() || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from(tableName)
        .update(payload as never)
        .eq("id", editingId);
      if (error) {
        toast.error(formatAdminError(error.message, tCommon));
        return;
      }
    } else {
      if (supportsVerification) payload.is_verified = true;
      const { error } = await supabase
        .from(tableName)
        .insert(payload as never);
      if (error) {
        toast.error(formatAdminError(error.message, tCommon));
        return;
      }
    }

    setDialogOpen(false);
    invalidate();
  }

  async function handleVerify(rowId: string) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from(tableName)
      .update({ is_verified: true } as never)
      .eq("id", rowId);
    if (error) {
      toast.error(formatAdminError(error.message, tCommon));
      return;
    }
    invalidate();
  }

  async function handleConfirmDelete() {
    if (!deletingId) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", deletingId);
    if (error) {
      toast.error(formatAdminError(error.message, tCommon));
      return;
    }
    setDeletingId(null);
    invalidate();
  }

  function renderRow(row: ManagedLookupRow) {
    return (
      <div
        key={row.id}
        className="flex items-center justify-between rounded-md border p-3"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">{getLocalizedName(row, locale)}</span>
          {row.name_en && (
            <span className="text-sm text-muted-foreground">
              ({row.name_en})
            </span>
          )}
          {supportsVerification && row.is_verified === false && (
            <Badge variant="outline">{t("unverified")}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {supportsVerification && row.is_verified === false && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVerify(row.id)}
            >
              <Check className="mr-1 size-4" />
              {t("verify")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditDialog(row)}
            aria-label={t("edit")}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingId(row.id)}
            aria-label={t("delete")}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("search_placeholder")}
        />
        <Button onClick={openAddDialog}>
          <Plus className="mr-1 size-4" />
          {t("add")}
        </Button>
      </div>

      {supportsVerification && pendingItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {t("pending_section")}
          </p>
          {pendingItems.map(renderRow)}
        </div>
      )}

      {verifiedItems.length === 0 && pendingItems.length === 0 ? (
        <p className="text-muted-foreground">{t("no_items")}</p>
      ) : (
        <div className="space-y-2">{verifiedItems.map(renderRow)}</div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? t("edit_title") : t("add_title")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field>
              <FieldLabel>{t("name_fr")}</FieldLabel>
              <Input
                value={nameFr}
                onChange={(event) => setNameFr(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>{t("name_en")}</FieldLabel>
              <Input
                value={nameEn}
                onChange={(event) => setNameEn(event.target.value)}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSave} disabled={!nameFr.trim()}>
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
