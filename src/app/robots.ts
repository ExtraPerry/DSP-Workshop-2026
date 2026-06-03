import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

const privatePathPrefixes = [
  "/admin",
  "/dashboard",
  "/account",
  "/profile",
  "/matching",
  "/sessions",
  "/feed",
  "/friends",
  "/challenges",
  "/leaderboard",
  "/notifications",
  "/login",
  "/register",
  "/verify-email",
] as const;

function buildDisallowPaths(): string[] {
  return routing.locales.flatMap((locale) =>
    privatePathPrefixes.map((pathPrefix) => `/${locale}${pathPrefix}`)
  );
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: buildDisallowPaths(),
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
