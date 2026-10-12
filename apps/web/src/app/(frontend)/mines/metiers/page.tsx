import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { MiningRolesPage } from "@/components/views/mining";

export const metadata: Metadata = {
  title: "Métiers miniers",
  description: "Tous les métiers miniers recrutés par Maximerit en Afrique de l'Ouest : géologie, exploitation, finance, leadership.",
  alternates: { canonical: "/mines/metiers/", languages: hreflang("/mines/metiers/", "/en/mines/metiers/") },
};

export default function MetiersListing() {
  return <MiningRolesPage lang="fr" />;
}
