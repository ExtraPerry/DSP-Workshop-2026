"use client";

import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import {
  CircleUser,
  LogOut,
  LogIn,
  Zap,
  Calendar,
  BookOpen,
  Trophy,
  Users,
  Bell,
  Shield,
} from "lucide-react";
import { useCurrentUser, CURRENT_USER_QUERY_KEY } from "@/hooks/use-current-user";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { logout } from "@/lib/supabase/auth/logout";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteBrand } from "@/components/site-brand";

const navigationLinks = [
  { href: "/dashboard", labelKey: "home", icon: null },
  { href: "/matching", labelKey: "matching", icon: Zap },
  { href: "/sessions", labelKey: "sessions", icon: Calendar },
  { href: "/feed", labelKey: "feed", icon: BookOpen },
  { href: "/challenges", labelKey: "challenges", icon: Trophy },
  { href: "/friends", labelKey: "friends", icon: Users },
  { href: "/notifications", labelKey: "notifications", icon: Bell },
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
  const { isAdmin } = useCurrentUserRole();

  const displayName = currentUser
    ? formatDisplayName(currentUser.first_name, currentUser.last_name)
    : null;

  return (
    <header className="border-b border-border">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <SiteBrand />

        <NavigationMenu>
          <NavigationMenuList>
            {navigationLinks.map((navigationLink) => {
              const Icon = navigationLink.icon;
              return (
                <NavigationMenuItem key={navigationLink.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={navigationLink.href}
                      className="flex items-center gap-1.5"
                    >
                      {Icon && <Icon className="size-4" />}
                      <span className="hidden lg:inline">
                        {translations(navigationLink.labelKey)}
                      </span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
            {isAdmin && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/admin" className="flex items-center gap-1.5">
                    <Shield className="size-4" />
                    <span className="hidden lg:inline">
                      {translations("admin")}
                    </span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          {!isCurrentUserLoading && currentUser && (
            <div className="flex items-center gap-3">
              <Link
                href={`/profile/${currentUser.id}`}
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <CircleUser className="size-8 text-muted-foreground" />
                <div className="hidden flex-col sm:flex">
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
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
                  logout();
                }}
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">
                  {translations("logout")}
                </span>
              </Button>
            </div>
          )}

          {!isCurrentUserLoading && !currentUser && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">
                <LogIn className="size-4" />
                <span className="hidden sm:inline">
                  {translations("login")}
                </span>
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
