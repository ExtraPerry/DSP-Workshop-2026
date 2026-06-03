"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { formatAdminError } from "@/lib/admin/format-admin-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";

export type EntityFieldType = "text" | "number" | "textarea" | "date";

export type EntityField = {
  name: string;
  label: string;
  type?: EntityFieldType;
  required?: boolean;
};

type EntityRecord = { id: string } & Record<string, unknown>;

type EntityManagerProps<TItem extends EntityRecord> = {
  tableName: string;
  items: TItem[] | undefined;
  queryKey: QueryKey;
  fields: EntityField[];
  addLabel: string;
  getPrimaryText: (item: TItem) => string;
  getSecondaryText?: (item: TItem) => string;
};

/**
 * Generic admin CRUD manager for a database table driven by a list of field
 * definitions. Reused across the gamification entities (badges, challenges,
 * point actions) so the create/edit/delete logic lives in one place.
 */
export function EntityManager<TItem extends EntityRecord>({
  tableName,
  items,
  queryKey,
  fields,
  addLabel,
  getPrimaryText,
  getSecondaryText,
}: EntityManagerProps<TItem>) {
  const t = useTranslations("Pages.AdminGamificationPage");
  const tCommon = useTranslations("Pages.AdminCommon");
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey });
  }

  function openAddDialog() {
    setEditingId(null);
    setValues({});
    setDialogOpen(true);
  }

  function openEditDialog(item: TItem) {
    setEditingId(item.id);
    const initialValues: Record<string, string> = {};
    fields.forEach((field) => {
      const value = item[field.name];
      initialValues[field.name] = value == null ? "" : String(value);
    });
    setValues(initialValues);
    setDialogOpen(true);
  }

  function buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    fields.forEach((field) => {
      const raw = (values[field.name] ?? "").trim();
      if (field.type === "number") {
        payload[field.name] = raw === "" ? null : Number(raw);
      } else {
        payload[field.name] = raw === "" ? null : raw;
      }
    });
    return payload;
  }

  function hasRequiredValues(): boolean {
    return fields
      .filter((field) => field.required)
      .every((field) => (values[field.name] ?? "").trim().length > 0);
  }

  async function handleSave() {
    if (!hasRequiredValues()) return;
    const supabase = createSupabaseBrowserClient();
    const payload = buildPayload();

    if (editingId) {
      const { error } = await supabase
        .from(tableName as never)
        .update(payload as never)
        .eq("id", editingId);
      if (error) {
        toast.error(formatAdminError(error.message, tCommon));
        return;
      }
    } else {
      const { error } = await supabase
        .from(tableName as never)
        .insert(payload as never);
      if (error) {
        toast.error(formatAdminError(error.message, tCommon));
        return;
      }
    }

    setDialogOpen(false);
    invalidate();
  }

  async function handleConfirmDelete() {
    if (!deletingId) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from(tableName as never)
      .delete()
      .eq("id", deletingId);
    if (error) {
      toast.error(formatAdminError(error.message, tCommon));
      return;
    }
    setDeletingId(null);
    invalidate();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAddDialog}>
          <Plus className="mr-1 size-4" />
          {addLabel}
        </Button>
      </div>

      {!items || items.length === 0 ? (
        <p className="text-muted-foreground">{t("no_items")}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <span className="font-medium">{getPrimaryText(item)}</span>
                {getSecondaryText && (
                  <p className="text-sm text-muted-foreground">
                    {getSecondaryText(item)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(item)}
                  aria-label={t("edit")}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingId(item.id)}
                  aria-label={t("delete")}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t("edit_title") : t("add_title")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {fields.map((field) => (
              <Field key={field.name}>
                <FieldLabel>{field.label}</FieldLabel>
                {field.type === "textarea" ? (
                  <Textarea
                    value={values[field.name] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                  />
                ) : (
                  <Input
                    type={
                      field.type === "number"
                        ? "number"
                        : field.type === "date"
                          ? "date"
                          : "text"
                    }
                    value={values[field.name] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                  />
                )}
              </Field>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSave} disabled={!hasRequiredValues()}>
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
