import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

export default async function LocaleNotFound() {
  const locale = await getLocale();
  const t = await getTranslations({
    locale: locale,
    namespace: "Pages.NotFoundPage",
  });

  setRequestLocale(locale);

  return (
    <>
      <h1>404</h1>
      <h2>{t("title")}</h2>
    </>
  );
}
