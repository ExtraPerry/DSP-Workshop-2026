import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("Pages.ContactPage");

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
    </div>
  );
}
