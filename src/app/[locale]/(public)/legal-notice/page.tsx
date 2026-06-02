import { useTranslations } from "next-intl";

export default function LegalNoticePage() {
  const t = useTranslations("Pages.LegalNoticePage");

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("content")}</p>
    </div>
  );
}
