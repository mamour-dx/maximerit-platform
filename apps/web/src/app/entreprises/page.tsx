import Link from "next/link";
import type { Metadata } from "next";
import { SERVICES } from "@/lib/content";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Entreprises — nos expertises",
  description: "Recrutement, executive search, intérim, RH & paie, finance, QHSE & ESG, formation — en Afrique de l'Ouest.",
  alternates: { canonical: "/entreprises/", languages: hreflang("/entreprises/", "/en/entreprises/") },
};

export default function EntreprisesHub() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Entreprises</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Nos expertises</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">Accéder plus rapidement aux compétences adaptées aux réalités de l&apos;Afrique de l&apos;Ouest.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <Link key={s.slug} href={`/entreprises/${s.slug}/`} className="rounded-[var(--radius)] border border-border p-5 transition hover:border-brand hover:shadow-sm">
            <span className="text-lg font-semibold">{s.title}</span>
            <span className="mt-1 block text-sm text-muted">{s.intro}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
