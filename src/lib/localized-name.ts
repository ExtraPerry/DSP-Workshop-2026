type BilingualRecord = {
  name_fr: string;
  name_en: string | null;
};

/**
 * Resolves the display name of a bilingual lookup row for the active locale,
 * falling back to the French label when the English one is missing.
 */
export function getLocalizedName(
  record: BilingualRecord | null | undefined,
  locale: string
): string {
  if (!record) return "";
  if (locale === "en" && record.name_en) return record.name_en;
  return record.name_fr;
}
