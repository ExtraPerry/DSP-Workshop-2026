import { LegalDocument } from "@/components/legal-document";

const sectionKeys = [
  "acceptance",
  "acceptable_use",
  "accounts",
  "liability",
  "changes",
] as const;

export default function TermsOfServicePage() {
  return (
    <LegalDocument
      translationNamespace="Pages.TermsOfServicePage"
      sectionKeys={sectionKeys}
    />
  );
}
