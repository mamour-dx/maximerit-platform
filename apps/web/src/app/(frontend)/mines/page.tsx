import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { MiningHub } from "@/components/views/mining";

export const metadata: Metadata = {
  title: "Recrutement minier en Afrique de l'Ouest",
  description:
    "Hub Mining Maximerit : géologie & exploration, exploitation & opérations, finance et leadership. Les compétences qui font fonctionner les opérations minières.",
  alternates: { canonical: "/mines/", languages: hreflang("/mines/", "/en/mines/") },
};

export default function MinesHub() {
  return <MiningHub lang="fr" />;
}
