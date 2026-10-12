import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { MiningHub } from "@/components/views/mining";

export const metadata: Metadata = {
  title: "Mining recruitment in West Africa",
  description: "Maximerit Mining hub: geology & exploration, operations, finance and leadership. The skills that keep mining operations running.",
  alternates: { canonical: "/en/mines/", languages: hreflang("/mines/", "/en/mines/") },
};

export default function MinesEn() {
  return <MiningHub lang="en" />;
}
