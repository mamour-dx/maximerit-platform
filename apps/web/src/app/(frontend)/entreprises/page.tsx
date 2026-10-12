import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { ServicesHub } from "@/components/views/company";

export const metadata: Metadata = {
  title: "Entreprises — nos expertises",
  description: "Recrutement, executive search, intérim, RH & paie, finance, QHSE & ESG, formation — en Afrique de l'Ouest.",
  alternates: { canonical: "/entreprises/", languages: hreflang("/entreprises/", "/en/entreprises/") },
};

export default function EntreprisesHub() {
  return <ServicesHub lang="fr" />;
}
