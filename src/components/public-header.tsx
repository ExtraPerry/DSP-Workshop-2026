"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { UserAccountMenu } from "@/components/user-account-menu";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useCurrentUser } from "@/hooks/use-current-user";
import { SiteBrand } from "@/components/site-brand";

const navigationLinks = [
  { href: "/", labelKey: "home" },
  { href: "/about", labelKey: "about" },
  { href: "/faq", labelKey: "faq" },
  { href: "/contact", labelKey: "contact" },
] as const;

export function PublicHeader() {
  const translations = useTranslations("Components.PublicHeader");
  const router = useRouter();
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useCurrentUser();

  return (
    <header className="border-b border-border">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Public navigation"
      >
        <SiteBrand />

        <NavigationMenu>
          <NavigationMenuList>
            {navigationLinks.map((navigationLink) => (
              <NavigationMenuItem key={navigationLink.href}>
                <NavigationMenuLink asChild>
                  <Link href={navigationLink.href}>
                    {translations(navigationLink.labelKey)}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          {!isCurrentUserLoading && !currentUser && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">{translations("login")}</Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link href="/register">{translations("register")}</Link>
          </Button>
          {!isCurrentUserLoading && currentUser && (
            <UserAccountMenu
              logoutRedirectTo={null}
              onAfterLogout={() => router.refresh()}
            />
          )}
        </div>
      </nav>
    </header>
  );
}
