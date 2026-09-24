import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Privacy policy and processing of personal data at Maximerit.",
  alternates: { canonical: "/en/politique-confidentialite/", languages: hreflang("/politique-confidentialite/", "/en/politique-confidentialite/") },
  robots: { index: false },
};

const SECTIONS = [
  ["Data collected", "Contact details (name, email, phone), professional information and the CV you send us, plus browsing data where you consent to audience measurement."],
  ["Purposes", "Processing applications, building and managing the talent pool, matching with opportunities, responding to company requests, improving the site."],
  ["Legal basis & consent", "Your explicit consent is collected for CV submission and for audience measurement. No audience measurement is performed before your agreement."],
  ["Retention", "Candidate data is kept for as long as necessary for the relationship, then archived or deleted according to our retention policy."],
  ["Your rights", "Access, rectification, deletion and export of your data. Contact us at contact@maximerit.com to exercise these rights."],
  ["Security", "CVs are stored securely and are never publicly accessible. Access is restricted to the recruitment team."],
];

export default function ConfidentialiteEn() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <SetLang lang="en" />
      <h1 className="font-display text-4xl font-bold">Privacy policy</h1>
      <div className="mt-8 space-y-6">
        {SECTIONS.map(([t, d]) => (
          <section key={t}>
            <h2 className="text-xl font-semibold">{t}</h2>
            <p className="mt-1 text-muted">{d}</p>
          </section>
        ))}
        <p className="text-xs text-muted">Document to be legally reviewed before going live.</p>
      </div>
    </main>
  );
}
