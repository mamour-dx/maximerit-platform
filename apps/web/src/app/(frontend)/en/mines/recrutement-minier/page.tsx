import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { MiningAgencyPage } from "@/components/views/mining";

export const metadata: Metadata = {
  title: "Mining recruitment agency in West Africa",
  description: "Maximerit, specialist mining recruitment in West Africa: geology, operations, finance and executive search. A qualified short-list, fast.",
  alternates: { canonical: "/en/mines/recrutement-minier/", languages: hreflang("/mines/recrutement-minier/", "/en/mines/recrutement-minier/") },
};

export default function RecrutementMinierEn() {
  return <MiningAgencyPage lang="en" />;
}
