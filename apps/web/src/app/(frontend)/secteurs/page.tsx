import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { SectorsHub } from "@/components/views/company";

export const metadata: Metadata = {
  title: "Secteurs",
  description: "Mines & Ressources (prioritaire), énergie, pétrole & gaz, BTP & infrastructures, industrie, services.",
  alternates: { canonical: "/secteurs/", languages: hreflang("/secteurs/", "/en/secteurs/") },
};

export default function SecteursHub() {
  return <SectorsHub lang="fr" />;
}
