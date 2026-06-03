import { LegalDocument } from "@/components/legal-document";

const sectionKeys = [
  "commitment",
  "standards",
  "feedback",
  "limitations",
] as const;

export default function AccessibilityPage() {
  return (
    <LegalDocument
      translationNamespace="Pages.AccessibilityPage"
      sectionKeys={sectionKeys}
    />
  );
}
