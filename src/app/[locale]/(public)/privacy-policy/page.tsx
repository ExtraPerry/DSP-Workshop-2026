import { LegalDocument } from "@/components/legal-document";

const sectionKeys = [
  "data_collected",
  "purpose",
  "retention",
  "rights",
  "contact",
] as const;

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      translationNamespace="Pages.PrivacyPolicyPage"
      sectionKeys={sectionKeys}
    />
  );
}
