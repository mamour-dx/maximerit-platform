import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { JoinPoolPage } from "@/components/views/candidates";

export const metadata: Metadata = {
  title: "Rejoindre le vivier Maximerit",
  description: "Intégrez le vivier de talents Maximerit : soyez sollicité pour les opportunités qui correspondent à votre profil.",
  alternates: { canonical: "/candidats/rejoindre-le-vivier/", languages: hreflang("/candidats/rejoindre-le-vivier/", "/en/candidats/rejoindre-le-vivier/") },
};

export default function RejoindreVivier() {
  return <JoinPoolPage lang="fr" />;
}
