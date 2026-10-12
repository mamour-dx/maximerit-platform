import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { LegalNoticePage } from "@/components/views/legal";

export const metadata: Metadata = {
  title: "Legal notice",
  description: "Legal notice for the Maximerit website.",
  alternates: { canonical: "/en/mentions-legales/", languages: hreflang("/mentions-legales/", "/en/mentions-legales/") },
  robots: { index: false },
};

export default function MentionsLegalesEn() {
  return <LegalNoticePage lang="en" />;
}
