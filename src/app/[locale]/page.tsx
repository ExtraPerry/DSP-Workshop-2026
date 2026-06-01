import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('Pages.HomePage');

  return (
      <h1>
        {t("hello_world")}
      </h1>
  );
}
