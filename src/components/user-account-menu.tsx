"use client";

import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import {
  CircleUser,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { useCurrentUser, CURRENT_USER_QUERY_KEY } from "@/hooks/use-current-user";
import { logout } from "@/lib/supabase/auth/logout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function formatDisplayName(
  firstName: string | null,
  lastName: string | null
): string | null {
  if (!firstName && !lastName) return null;
  if (!lastName) return firstName;
  if (!firstName) return `${lastName.charAt(0)}.`;
  return `${firstName} ${lastName.charAt(0)}.`;
}

type UserAccountMenuProps = {
  /** Default: redirect to /. Pass `null` to stay on the current page (public header). */
  logoutRedirectTo?: string | null;
  onAfterLogout?: () => void;
};

export function UserAccountMenu({
  logoutRedirectTo,
  onAfterLogout,
}: UserAccountMenuProps) {
  const translations = useTranslations("Components.UserAccountMenu");
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) return null;

  const displayName = formatDisplayName(
    currentUser.first_name,
    currentUser.last_name
  );

  async function handleLogout() {
    queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
    await logout(
      logoutRedirectTo === undefined
        ? undefined
        : { redirectTo: logoutRedirectTo }
    );
    onAfterLogout?.();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-auto items-center gap-2 px-2"
          aria-label={translations("menu_label")}
        >
          <CircleUser className="size-8 text-muted-foreground" />
          <div className="hidden flex-col items-start sm:flex">
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
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel className="font-normal">
          {displayName && (
            <p className="text-sm font-medium">{displayName}</p>
          )}
          {currentUser.email && (
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/profile/${currentUser.id}`}>
            <User className="size-4" />
            {translations("profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">
            <Settings className="size-4" />
            {translations("account")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut className="size-4" />
          {translations("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
