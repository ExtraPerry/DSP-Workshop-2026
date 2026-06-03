"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_STORAGE_KEY = "skillswap-cookie-consent";

export function CookieConsentBanner() {
  const translations = useTranslations("Components.CookieConsent");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "accepted");
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label={translations("aria_label")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:p-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{translations("message")}</p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/cookie-policy">{translations("learn_more")}</Link>
          </Button>
          <Button size="sm" onClick={handleAccept}>
            {translations("accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
