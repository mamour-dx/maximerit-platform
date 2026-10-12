import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { PrivacyPage } from "@/components/views/legal";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et traitement des données personnelles chez Maximerit.",
  alternates: { canonical: "/politique-confidentialite/", languages: hreflang("/politique-confidentialite/", "/en/politique-confidentialite/") },
  robots: { index: false },
};

export default function Confidentialite() {
  return <PrivacyPage lang="fr" />;
}
