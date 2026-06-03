"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  ADMIN_NAV_LINKS,
  isAdminNavLinkActive,
} from "@/lib/admin/admin-nav-links";
import { cn } from "@/lib/utils";

export function AdminSubNav() {
  const translations = useTranslations("Pages.AdminPage");
  const pathname = usePathname();

  return (
    <nav
      aria-label={translations("sub_nav_label")}
      className="border-b border-border bg-muted/20"
    >
      <div className="mx-auto flex max-w-7xl justify-center px-4 py-2 sm:px-6 lg:px-8">
        <ul className="inline-flex max-w-full flex-wrap items-center justify-center gap-0.5 rounded-lg border border-border/80 bg-background p-1 shadow-sm">
          {ADMIN_NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = isAdminNavLinkActive(pathname, link);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    "hover:bg-muted hover:text-foreground",
                    isActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  <span className="whitespace-nowrap">
                    {translations(link.labelKey)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
