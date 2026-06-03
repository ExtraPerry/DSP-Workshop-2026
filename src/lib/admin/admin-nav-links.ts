import {
  Bell,
  BookOpen,
  Calendar,
  LayoutDashboard,
  Shield,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavLabelKey =
  | "overview"
  | "users"
  | "moderation"
  | "lookups"
  | "sessions"
  | "gamification"
  | "notifications";

export type AdminNavLink = {
  href: string;
  labelKey: AdminNavLabelKey;
  icon: LucideIcon;
};

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: "/admin", labelKey: "overview", icon: LayoutDashboard },
  { href: "/admin/users", labelKey: "users", icon: Users },
  { href: "/admin/moderation", labelKey: "moderation", icon: Shield },
  { href: "/admin/lookups", labelKey: "lookups", icon: BookOpen },
  { href: "/admin/sessions", labelKey: "sessions", icon: Calendar },
  { href: "/admin/gamification", labelKey: "gamification", icon: Trophy },
  { href: "/admin/notifications", labelKey: "notifications", icon: Bell },
];

export function isAdminNavLinkActive(
  pathname: string,
  link: AdminNavLink
): boolean {
  if (link.href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }

  return (
    pathname === link.href || pathname.startsWith(`${link.href}/`)
  );
}
