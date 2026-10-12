import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { SubmitCvPage } from "@/components/views/candidates";

export const metadata: Metadata = {
  title: "Déposer mon CV",
  description: "Déposez votre CV pour rejoindre le vivier de talents Maximerit en Afrique de l'Ouest.",
  alternates: { canonical: "/candidats/deposer-mon-cv/", languages: hreflang("/candidats/deposer-mon-cv/", "/en/candidats/deposer-mon-cv/") },
};

export default function DeposerCv() {
  return <SubmitCvPage lang="fr" />;
}
