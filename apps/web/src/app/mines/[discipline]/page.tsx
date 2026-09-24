import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { disciplineParams, findDiscipline, disciplineSeg } from "@/lib/mining-nav";

type Args = { params: Promise<{ discipline: string }> };

export function generateStaticParams() {
  return disciplineParams();
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { discipline } = await params;
  const d = findDiscipline(discipline);
  if (!d) return {};
  return {
    title: `${d.label_fr} — recrutement minier`,
    description: `Recrutement ${d.label_fr} pour les opérations minières en Afrique de l'Ouest : ${d.specialties.length} métiers.`,
    alternates: { canonical: `/mines/${disciplineSeg(d.url)}/` },
  };
}

export default async function DisciplinePage({ params }: Args) {
  const { discipline } = await params;
  const d = findDiscipline(discipline);
  if (!d) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
        <Link href="/mines/">Mines &amp; Ressources</Link> <span aria-hidden>›</span> <span>{d.label_fr}</span>
      </nav>
      <h1 className="mt-3 font-display text-4xl font-bold">{d.label_fr}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Les compétences {d.label_fr.toLowerCase()} qui font fonctionner les opérations minières en Afrique de l&apos;Ouest.
      </p>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted">Métiers ({d.specialties.length})</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {d.specialties.map((s) => (
          <Link key={s.slug} href={`/mines/metiers/${s.slug}/`} className="rounded-[var(--radius)] border border-border p-4 transition hover:border-brand">
            <span className="font-semibold">{s.label_fr}</span>
            <span className="mt-0.5 block text-xs text-muted">{s.label_en}</span>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/contact/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Confier un recrutement</Link>
        <Link href="/candidats/offres-demploi/" className="rounded-[var(--radius)] border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface">Voir les offres</Link>
      </div>
    </main>
  );
}
