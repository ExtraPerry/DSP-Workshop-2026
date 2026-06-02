"use client";

import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { CircleUser, LogOut } from "lucide-react";
import { useCurrentUser, CURRENT_USER_QUERY_KEY } from "@/hooks/use-current-user";
import { logout } from "@/lib/supabase/auth/logout";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

const navigationLinks = [
  { href: "/home", labelKey: "home" as const },
  { href: "/contact", labelKey: "contact" as const },
  { href: "/about", labelKey: "about" as const },
  { href: "/faq", labelKey: "faq" as const },
] as const;

function formatDisplayName(
  firstName: string | null,
  lastName: string | null
): string | null {
  if (!firstName && !lastName) return null;
  if (!lastName) return firstName;
  if (!firstName) return `${lastName.charAt(0)}.`;
  return `${firstName} ${lastName.charAt(0)}.`;
}

export function Navbar() {
  const translations = useTranslations("Components.Navbar");
  const queryClient = useQueryClient();
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useCurrentUser();

  const displayName = currentUser
    ? formatDisplayName(currentUser.first_name, currentUser.last_name)
    : null;

  return (
    <header className="border-b border-border">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div
          className="size-10 shrink-0 rounded-lg bg-orange-200"
          aria-hidden
        />

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

        {!isCurrentUserLoading && currentUser && (
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-2">
              <CircleUser className="size-8 text-muted-foreground" />
              <div className="flex flex-col">
                {displayName && (
                  <span className="text-sm font-medium leading-tight">
                    {displayName}
                  </span>
                )}
                {currentUser.email && (
                  <span className="text-xs leading-tight text-muted-foreground">
                    {currentUser.email}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
                logout();
              }}
            >
              <LogOut className="size-4" />
              {translations("logout")}
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
