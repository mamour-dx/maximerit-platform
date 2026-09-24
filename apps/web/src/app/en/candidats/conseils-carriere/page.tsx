import Link from "next/link";
import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const metadata: Metadata = {
  title: "Career advice",
  description: "Maximerit advice for your career in mining, industry and support functions across West Africa.",
  alternates: { canonical: "/en/candidats/conseils-carriere/", languages: hreflang("/candidats/conseils-carriere/", "/en/candidats/conseils-carriere/") },
};

const TIPS = [
  ["A structured, dated CV", "Bring out your experience by project, commodity, mine type and country."],
  ["Your key skills", "Certifications, languages, mobility and availability: decisive criteria for our clients."],
  ["Stay visible", "Add your CV to our talent pool and keep your profile up to date."],
];

export default function ConseilsEn() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <SetLang lang="en" />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Candidates</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Career advice</h1>
      <div className="mt-10 space-y-6">
        {TIPS.map(([t, d]) => (
          <div key={t}>
            <h2 className="text-xl font-semibold">{t}</h2>
            <p className="mt-1 text-muted">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/en/candidats/deposer-mon-cv/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Submit my CV</Link>
        <Link href="/en/candidats/offres-demploi/" className="rounded-[var(--radius)] border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface">View jobs</Link>
      </div>
    </main>
  );
}
