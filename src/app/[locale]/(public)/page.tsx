import { useTranslations } from "next-intl";
import { Zap, Calendar, Trophy } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RootLandingPage() {
  const translations = useTranslations("Pages.LandingPage");

  const features = [
    {
      icon: Zap,
      title: translations("feature_matching_title"),
      text: translations("feature_matching_text"),
    },
    {
      icon: Calendar,
      title: translations("feature_sessions_title"),
      text: translations("feature_sessions_text"),
    },
    {
      icon: Trophy,
      title: translations("feature_gamification_title"),
      text: translations("feature_gamification_text"),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="flex flex-col items-center text-center">
        <p className="text-sm font-medium text-primary">
          {translations("hero_subtitle")}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          {translations("hero_title")}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          {translations("hero_description")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/register">{translations("cta_get_started")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">{translations("cta_login")}</Link>
          </Button>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-center text-2xl font-semibold">
          {translations("features_title")}
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <Icon className="size-8 text-primary" />
                  <CardTitle className="mt-3">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.text}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
