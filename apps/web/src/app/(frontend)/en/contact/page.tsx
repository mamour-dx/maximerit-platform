import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { ContactPage } from "@/components/views/company";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Maximerit — recruitment, executive search and staffing in West Africa.",
  alternates: { canonical: "/en/contact/", languages: hreflang("/contact/", "/en/contact/") },
};

export default function ContactEn() {
  return <ContactPage lang="en" />;
}
