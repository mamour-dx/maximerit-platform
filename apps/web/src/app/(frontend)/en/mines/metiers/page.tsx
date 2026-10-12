import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { MiningRolesPage } from "@/components/views/mining";

export const metadata: Metadata = {
  title: "Mining roles",
  description: "All mining roles recruited by Maximerit in West Africa: geology, operations, finance, leadership.",
  alternates: { canonical: "/en/mines/metiers/", languages: hreflang("/mines/metiers/", "/en/mines/metiers/") },
};

export default function MetiersEn() {
  return <MiningRolesPage lang="en" />;
}
