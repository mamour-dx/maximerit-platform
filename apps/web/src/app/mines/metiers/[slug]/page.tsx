import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { specialtyParams, findSpecialty } from "@/lib/mining-nav";
import { hreflang } from "@/lib/i18n";

type Args = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return specialtyParams();
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const r = findSpecialty(slug);
  if (!r) return {};
  return {
    title: `Recrutement ${r.specialty.label_fr} — Afrique de l'Ouest`,
    description: `Recruter un ${r.specialty.label_fr} (${r.specialty.label_en}) pour vos opérations minières en Afrique de l'Ouest — ${r.discipline.label_fr}.`,
    alternates: { canonical: `/mines/metiers/${slug}/`, languages: hreflang(`/mines/metiers/${slug}/`, `/en/mines/metiers/${slug}/`) },
  };
}

export default async function MetierPage({ params }: Args) {
  const { slug } = await params;
  const r = findSpecialty(slug);
  if (!r) notFound();
  const { specialty, discipline } = r;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
        <Link href="/mines/">Mines</Link> <span aria-hidden>›</span> <Link href={discipline.url}>{discipline.label_fr}</Link> <span aria-hidden>›</span> <span>{specialty.label_fr}</span>
      </nav>
      <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">{discipline.label_fr}</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Recrutement {specialty.label_fr}</h1>
      <p className="mt-1 text-muted">{specialty.label_en}</p>
      <p className="mt-6 text-lg text-muted">
        Maximerit identifie et qualifie des profils <strong className="text-foreground">{specialty.label_fr}</strong> pour
        les opérations minières en Afrique de l&apos;Ouest — expérience terrain, mobilité, langues et disponibilité vérifiées.
      </p>

      <section className="mt-10 rounded-[var(--radius)] border border-border p-6">
        <h2 className="font-display text-2xl font-bold">Besoin d&apos;un {specialty.label_fr} ?</h2>
        <p className="mt-1 mb-5 text-sm text-muted">Recevez une short-list qualifiée depuis notre vivier.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Confier ce recrutement</Link>
          <Link href="/candidats/deposer-mon-cv/" className="rounded-[var(--radius)] border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface">Je suis {specialty.label_fr}</Link>
        </div>
      </section>
    </main>
  );
}
