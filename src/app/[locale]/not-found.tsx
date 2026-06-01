"use server"

import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function LocaleNotFound({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale,
    namespace: "Pages.NotFoundPage",
  });

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <>
      <h1>404</h1>
      <h2>{t("title")}</h2>
    </>
  );
}
