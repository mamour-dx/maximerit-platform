import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { MiningAgencyPage } from "@/components/views/mining";

export const metadata: Metadata = {
  title: "Cabinet de recrutement minier en Afrique de l'Ouest",
  description: "Maximerit, cabinet spécialisé du recrutement minier en Afrique de l'Ouest : géologie, exploitation, finance et executive search. Short-list qualifiée, rapidement.",
  alternates: { canonical: "/mines/recrutement-minier/", languages: hreflang("/mines/recrutement-minier/", "/en/mines/recrutement-minier/") },
};

export default function RecrutementMinier() {
  return <MiningAgencyPage lang="fr" />;
}
