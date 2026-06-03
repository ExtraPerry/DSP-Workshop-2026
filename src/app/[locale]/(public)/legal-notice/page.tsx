import { LegalDocument } from "@/components/legal-document";

const sectionKeys = [
  "publisher",
  "hosting",
  "intellectual_property",
  "governing_law",
] as const;

export default function LegalNoticePage() {
  return (
    <LegalDocument
      translationNamespace="Pages.LegalNoticePage"
      sectionKeys={sectionKeys}
    />
  );
}
