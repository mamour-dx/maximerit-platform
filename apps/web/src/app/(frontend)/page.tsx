import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { HomePage } from "@/components/site/HomePage";

export const metadata: Metadata = {
  alternates: { canonical: "/", languages: hreflang("/", "/en/") },
};

export default function Home() {
  return <HomePage lang="fr" />;
}
