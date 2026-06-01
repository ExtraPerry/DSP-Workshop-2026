import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const t = useTranslations("Pages.VerifyEmailPage");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{t("title")}</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {t("description")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("check_spam")}
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">{t("back_to_login")}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
