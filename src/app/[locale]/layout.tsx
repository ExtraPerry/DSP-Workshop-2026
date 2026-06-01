import { Figtree } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { TanstackQueryClient } from "@/contexts/tanstack-query-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-figtree",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale,
    namespace: "MetaData",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <html className="h-full" lang={locale}>
      <body className={cn(`${figtree.className} font-figtree antialiased`, "")}>
        <TanstackQueryClient>
          <NextIntlClientProvider>
            {children}
            <Toaster position="bottom-right" />
          </NextIntlClientProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </TanstackQueryClient>
      </body>
    </html>
  );
}
