import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { SubmitCvPage } from "@/components/views/candidates";

export const metadata: Metadata = {
  title: "Submit my CV",
  description: "Submit your CV to join the Maximerit talent pool in West Africa.",
  alternates: { canonical: "/en/candidats/deposer-mon-cv/", languages: hreflang("/candidats/deposer-mon-cv/", "/en/candidats/deposer-mon-cv/") },
};

export default function DeposerCvEn() {
  return <SubmitCvPage lang="en" />;
}
