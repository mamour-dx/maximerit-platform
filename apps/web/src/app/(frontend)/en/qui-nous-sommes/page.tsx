import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { AboutPage } from "@/components/views/company";

export const metadata: Metadata = {
  title: "About us",
  description: "Maximerit — recruitment, executive search and staffing in West Africa, specialists in Mining & Natural Resources.",
  alternates: { canonical: "/en/qui-nous-sommes/", languages: hreflang("/qui-nous-sommes/", "/en/qui-nous-sommes/") },
};

export default function AboutEn() {
  return <AboutPage lang="en" />;
}
