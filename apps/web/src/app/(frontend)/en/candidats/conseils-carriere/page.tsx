import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { CareerAdvicePage } from "@/components/views/candidates";

export const metadata: Metadata = {
  title: "Career advice",
  description: "Maximerit advice for your career in mining, industry and support functions across West Africa.",
  alternates: { canonical: "/en/candidats/conseils-carriere/", languages: hreflang("/candidats/conseils-carriere/", "/en/candidats/conseils-carriere/") },
};

export default function ConseilsEn() {
  return <CareerAdvicePage lang="en" />;
}
