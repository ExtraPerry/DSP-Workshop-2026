import { useTranslations } from "next-intl";

export default function Home() {
  const translations = useTranslations("Pages.HomePage");

  return <h1>{translations("hello_world")}</h1>;
}
