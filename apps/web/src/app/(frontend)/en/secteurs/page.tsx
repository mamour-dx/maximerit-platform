import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { SectorsHub } from "@/components/views/company";

export const metadata: Metadata = {
  title: "Sectors",
  description: "Mining & Resources (priority), energy, oil & gas, construction & infrastructure, industry, services.",
  alternates: { canonical: "/en/secteurs/", languages: hreflang("/secteurs/", "/en/secteurs/") },
};

export default function SecteursHubEn() {
  return <SectorsHub lang="en" />;
}
