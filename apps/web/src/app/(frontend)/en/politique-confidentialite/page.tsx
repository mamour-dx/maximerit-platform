import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { PrivacyPage } from "@/components/views/legal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Privacy policy and processing of personal data at Maximerit.",
  alternates: { canonical: "/en/politique-confidentialite/", languages: hreflang("/politique-confidentialite/", "/en/politique-confidentialite/") },
  robots: { index: false },
};

export default function ConfidentialiteEn() {
  return <PrivacyPage lang="en" />;
}
