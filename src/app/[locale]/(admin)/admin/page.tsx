"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, BookOpen, Calendar, Trophy, Bell } from "lucide-react";

export default function AdminDashboardPage() {
  const t = useTranslations("Pages.AdminPage");

  const adminLinks = [
    { href: "/admin/users", label: t("users"), icon: Users },
    { href: "/admin/moderation", label: t("moderation"), icon: Shield },
    { href: "/admin/lookups", label: t("lookups"), icon: BookOpen },
    { href: "/admin/sessions", label: t("sessions"), icon: Calendar },
    { href: "/admin/gamification", label: t("gamification"), icon: Trophy },
    { href: "/admin/notifications", label: t("notifications"), icon: Bell },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <link.icon className="size-5" />
                  {link.label}
                </CardTitle>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
