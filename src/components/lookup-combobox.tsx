"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLocalizedName } from "@/lib/localized-name";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type LookupComboboxItem = {
  id: string;
  name_fr: string;
  name_en: string | null;
  is_verified?: boolean;
};

type LookupComboboxProps = {
  items: LookupComboboxItem[];
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  allowClear?: boolean;
  allowCreate?: boolean;
  onCreate?: (name: string) => Promise<string>;
  disabled?: boolean;
  className?: string;
};

/**
 * Searchable, clearable lookup selector built on Command + Popover. Shows an
 * "unverified" badge for user-proposed rows and, when `allowCreate` is set,
 * offers to create a new type from the current search query.
 */
export function LookupCombobox({
  items,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  allowClear = true,
  allowCreate = false,
  onCreate,
  disabled = false,
  className,
}: LookupComboboxProps) {
  const locale = useLocale();
  const t = useTranslations("Components.LookupCombobox");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedItem = items.find((item) => item.id === value) ?? null;

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return items;
    return items.filter((item) =>
      getLocalizedName(item, locale).toLowerCase().includes(normalizedSearch)
    );
  }, [items, search, locale]);

  const hasExactMatch = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return false;
    return items.some(
      (item) => getLocalizedName(item, locale).toLowerCase() === normalizedSearch
    );
  }, [items, search, locale]);

  const canCreate =
    allowCreate && Boolean(onCreate) && search.trim().length > 0 && !hasExactMatch;

  function handleSelect(nextId: string) {
    onChange(nextId);
    setOpen(false);
    setSearch("");
  }

  function handleClear() {
    onChange(null);
    setOpen(false);
    setSearch("");
  }

  async function handleCreate() {
    if (!onCreate) return;
    const name = search.trim();
    if (!name) return;
    setIsCreating(true);
    try {
      const newId = await onCreate(name);
      handleSelect(newId);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className={cn("truncate", !selectedItem && "text-muted-foreground")}>
            {selectedItem
              ? getLocalizedName(selectedItem, locale)
              : placeholder ?? t("placeholder")}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder ?? t("search_placeholder")}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filteredItems.length === 0 && !canCreate && (
              <CommandEmpty>{t("empty")}</CommandEmpty>
            )}

            {allowClear && (
              <CommandGroup>
                <CommandItem value="__clear__" onSelect={handleClear}>
                  <X className="size-4 opacity-60" />
                  {t("any")}
                  {!value && <Check className="ml-auto size-4" />}
                </CommandItem>
              </CommandGroup>
            )}

            {filteredItems.length > 0 && (
              <CommandGroup>
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelect(item.id)}
                  >
                    <span className="truncate">
                      {getLocalizedName(item, locale)}
                    </span>
                    {item.is_verified === false && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {t("unverified")}
                      </Badge>
                    )}
                    {value === item.id && <Check className="ml-auto size-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {canCreate && (
              <CommandGroup>
                <CommandItem
                  value="__create__"
                  onSelect={handleCreate}
                  disabled={isCreating}
                >
                  <Plus className="size-4" />
                  {t("create", { name: search.trim() })}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
