import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { AboutPage } from "@/components/views/company";

export const metadata: Metadata = {
  title: "Qui sommes-nous",
  description: "Maximerit — cabinet de recrutement, executive search et mise à disposition de talents en Afrique de l'Ouest, spécialiste Mines & Ressources.",
  alternates: { canonical: "/qui-nous-sommes/", languages: hreflang("/qui-nous-sommes/", "/en/qui-nous-sommes/") },
};

export default function About() {
  return <AboutPage lang="fr" />;
}
