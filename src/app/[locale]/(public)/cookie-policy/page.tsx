import { LegalDocument } from "@/components/legal-document";

const sectionKeys = [
  "what_are_cookies",
  "cookies_we_use",
  "managing_cookies",
  "consent",
] as const;

export default function CookiePolicyPage() {
  return (
    <LegalDocument
      translationNamespace="Pages.CookiePolicyPage"
      sectionKeys={sectionKeys}
    />
  );
}
