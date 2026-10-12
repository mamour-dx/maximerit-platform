import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { JoinPoolPage } from "@/components/views/candidates";

export const metadata: Metadata = {
  title: "Join the Maximerit talent pool",
  description: "Join the Maximerit talent pool: be approached for the opportunities that match your profile.",
  alternates: { canonical: "/en/candidats/rejoindre-le-vivier/", languages: hreflang("/candidats/rejoindre-le-vivier/", "/en/candidats/rejoindre-le-vivier/") },
};

export default function RejoindreVivierEn() {
  return <JoinPoolPage lang="en" />;
}
