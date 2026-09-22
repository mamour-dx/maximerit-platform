import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Qui sommes-nous",
  description: "Maximerit — cabinet de recrutement, executive search et mise à disposition de talents en Afrique de l'Ouest, spécialiste Mines & Ressources.",
  alternates: { canonical: "/qui-nous-sommes/" },
};

const PILIERS = [
  ["Spécialisation sectorielle", "Une connaissance fine des métiers miniers et des fonctions critiques."],
  ["Connaissance régionale", "Afrique de l'Ouest : Sénégal, Guinée, Côte d'Ivoire, Mali, Mauritanie, Burkina, Ghana."],
  ["Vivier propriétaire", "Une base de talents qualifiée et exploitable, pas un simple stock de CV."],
  ["Rapidité", "Capacité à produire rapidement une short-list pertinente."],
];

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">À propos</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Qui sommes-nous</h1>
      <p className="mt-4 text-lg text-muted">
        Maximerit accompagne les entreprises d&apos;Afrique de l&apos;Ouest dans l&apos;accès aux compétences dont
        elles ont besoin pour recruter, structurer et faire fonctionner leurs opérations — avec une
        spécialisation forte sur les Mines &amp; Ressources naturelles.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {PILIERS.map(([t, d]) => (
          <div key={t} className="rounded-[var(--radius)] border border-border p-5">
            <h2 className="font-semibold">{t}</h2>
            <p className="mt-1 text-sm text-muted">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <Link href="/contact/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Nous contacter</Link>
      </div>
    </main>
  );
}
