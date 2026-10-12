import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { CareerAdvicePage } from "@/components/views/candidates";

export const metadata: Metadata = {
  title: "Conseils carrière",
  description: "Conseils Maximerit pour votre carrière dans les mines, l'industrie et les fonctions support en Afrique de l'Ouest.",
  alternates: { canonical: "/candidats/conseils-carriere/", languages: hreflang("/candidats/conseils-carriere/", "/en/candidats/conseils-carriere/") },
};

export default function Conseils() {
  return <CareerAdvicePage lang="fr" />;
}
