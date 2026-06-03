"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteBrand } from "@/components/site-brand";

const exploreLinks = [
  { href: "/", labelKey: "home" },
  { href: "/about", labelKey: "about" },
  { href: "/faq", labelKey: "faq" },
  { href: "/contact", labelKey: "contact" },
] as const;

const legalLinks = [
  { href: "/privacy-policy", labelKey: "privacy" },
  { href: "/terms-of-service", labelKey: "terms" },
  { href: "/legal-notice", labelKey: "legal_notice" },
  { href: "/accessibility", labelKey: "accessibility" },
  { href: "/cookie-policy", labelKey: "cookies" },
] as const;

export function SiteFooter() {
  const translations = useTranslations("Components.SiteFooter");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <SiteBrand />
            <p className="text-sm text-muted-foreground">
              {translations("tagline")}
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">
              {translations("explore_heading")}
            </h2>
            <ul className="space-y-2 text-sm">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {translations(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">
              {translations("legal_heading")}
            </h2>
            <ul className="space-y-2 text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {translations(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 space-y-3 border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            {translations("school_disclaimer")}
          </p>
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            {translations("copyright", { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}
