import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";
import { HomePage } from "@/components/site/HomePage";

export const metadata: Metadata = {
  title: "Maximerit — Recruitment & talent in West Africa",
  description: "Recruitment, executive search and a qualified talent pool in West Africa, specialised in Mining & Natural Resources.",
  alternates: { canonical: "/en/", languages: hreflang("/", "/en/") },
};

export default function HomeEn() {
  return (
    <>
      <SetLang lang="en" />
      <HomePage lang="en" />
    </>
  );
}
