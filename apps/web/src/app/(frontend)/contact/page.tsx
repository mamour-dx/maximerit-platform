import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { ContactPage } from "@/components/views/company";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Maximerit — recrutement, executive search et mise à disposition en Afrique de l'Ouest.",
  alternates: { canonical: "/contact/", languages: hreflang("/contact/", "/en/contact/") },
};

export default function Contact() {
  return <ContactPage lang="fr" />;
}
