import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FaqPage() {
  const t = useTranslations("Pages.FaqPage");

  const questions = [
    { key: "what_is" },
    { key: "how_matching" },
    { key: "how_points" },
    { key: "is_free" },
  ] as const;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <div className="space-y-4">
        {questions.map((q) => (
          <Card key={q.key}>
            <CardHeader>
              <CardTitle className="text-base">
                {t(`questions.${q.key}`)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t(`questions.${q.key}_answer`)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
