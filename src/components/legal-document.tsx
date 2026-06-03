import { getTranslations } from "next-intl/server";

type LegalDocumentProps = {
  translationNamespace:
    | "Pages.PrivacyPolicyPage"
    | "Pages.TermsOfServicePage"
    | "Pages.LegalNoticePage"
    | "Pages.AccessibilityPage"
    | "Pages.CookiePolicyPage";
  sectionKeys: readonly string[];
};

export async function LegalDocument({
  translationNamespace,
  sectionKeys,
}: LegalDocumentProps) {
  const translations = await getTranslations(translationNamespace);
  const sharedTranslations = await getTranslations("Components.LegalPages");

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 pb-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{translations("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {translations("last_updated")}
        </p>
      </header>

      <div className="space-y-8">
        {sectionKeys.map((sectionKey) => (
          <section key={sectionKey} className="space-y-2">
            <h2 className="text-lg font-medium">
              {translations(`sections.${sectionKey}.title`)}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {translations(`sections.${sectionKey}.body`)}
            </p>
          </section>
        ))}
      </div>

      <p className="border-t border-border pt-6 text-xs text-muted-foreground italic">
        {sharedTranslations("school_project_note")}
      </p>
    </div>
  );
}
