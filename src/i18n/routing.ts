import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "fr"],

  // Used when no locale matches. The app defaults to French; next-intl persists
  // the user's chosen locale in the NEXT_LOCALE cookie for subsequent visits.
  defaultLocale: "fr",
});
