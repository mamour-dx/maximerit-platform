import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { ServicesHub } from "@/components/views/company";

export const metadata: Metadata = {
  title: "For employers — our expertise",
  description: "Recruitment, executive search, contract staffing, HR & payroll, finance, QHSE & ESG, training — across West Africa.",
  alternates: { canonical: "/en/entreprises/", languages: hreflang("/entreprises/", "/en/entreprises/") },
};

export default function EntreprisesHubEn() {
  return <ServicesHub lang="en" />;
}
