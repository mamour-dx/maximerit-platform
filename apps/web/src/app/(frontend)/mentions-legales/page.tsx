import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { LegalNoticePage } from "@/components/views/legal";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Maximerit.",
  alternates: { canonical: "/mentions-legales/", languages: hreflang("/mentions-legales/", "/en/mentions-legales/") },
  robots: { index: false },
};

export default function MentionsLegales() {
  return <LegalNoticePage lang="fr" />;
}
