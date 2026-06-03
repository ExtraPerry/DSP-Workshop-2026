import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

const publicPaths = [
  "",
  "/about",
  "/faq",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/legal-notice",
  "/accessibility",
  "/cookie-policy",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  return routing.locales.flatMap((locale) =>
    publicPaths.map((path) => {
      const pathSuffix = path === "" ? "" : path;
      const url = `${baseUrl}/${locale}${pathSuffix}`;

      const languageAlternates = Object.fromEntries(
        routing.locales.map((alternateLocale) => [
          alternateLocale,
          `${baseUrl}/${alternateLocale}${pathSuffix}`,
        ])
      );

      return {
        url,
        lastModified: new Date(),
        alternates: {
          languages: languageAlternates,
        },
      };
    })
  );
}
