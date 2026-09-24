import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { mining } from "@maximerit/domain";
import { disciplineParams, findDiscipline, disciplineSeg } from "@/lib/mining-nav";
import { countryParams, findCountry } from "@/lib/mining-countries";

type Args = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...disciplineParams().map((d) => ({ slug: d.discipline })), ...countryParams()];
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const d = findDiscipline(slug);
  if (d) {
    return {
      title: `${d.label_fr} — recrutement minier`,
      description: `Recrutement ${d.label_fr} pour les opérations minières en Afrique de l'Ouest : ${d.specialties.length} métiers.`,
      alternates: { canonical: `/mines/${disciplineSeg(d.url)}/` },
    };
  }
  const c = findCountry(slug);
  if (c) {
    return {
      title: `Recrutement minier — ${c.label}`,
      description: `Recrutement minier en ${c.label} : ${c.commodities.join(", ")}. ${c.context}`,
      alternates: { canonical: `/mines/${c.slug}/` },
    };
  }
  return {};
}

export default async function MinesSlugPage({ params }: Args) {
  const { slug } = await params;

  // --- Page discipline ---
  const d = findDiscipline(slug);
  if (d) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <nav aria-label="Fil d'Ariane" className="text-sm text-muted"><Link href="/mines/">Mines &amp; Ressources</Link> <span aria-hidden>›</span> <span>{d.label_fr}</span></nav>
        <h1 className="mt-3 font-display text-4xl font-bold">{d.label_fr}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">Les compétences {d.label_fr.toLowerCase()} qui font fonctionner les opérations minières en Afrique de l&apos;Ouest.</p>
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

  // --- Page pays ---
  const c = findCountry(slug);
  if (c) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <nav aria-label="Fil d'Ariane" className="text-sm text-muted"><Link href="/mines/">Mines &amp; Ressources</Link> <span aria-hidden>›</span> <span>{c.label}</span></nav>
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Recrutement minier · pays</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Recrutement minier en {c.label}</h1>
        <p className="mt-4 text-lg text-muted">{c.context}</p>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Ressources & commodities</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {c.commodities.map((m) => (<li key={m} className="rounded-full border border-border bg-surface px-3 py-1 text-sm">{m}</li>))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Pôles concernés</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {mining.disciplines.map((disc) => (
              <Link key={disc.slug} href={disc.url} className="rounded-full border border-border px-3 py-1 text-sm transition hover:border-brand">{disc.label_fr}</Link>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[var(--radius)] border-l-4 border-brand bg-ink p-6">
          <h2 className="font-display text-2xl font-bold">Un besoin en {c.label} ?</h2>
          <p className="mt-1 mb-5 text-sm text-muted">Nous mobilisons des profils qualifiés, avec l&apos;expérience terrain et la mobilité adaptées.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Confier un recrutement</Link>
            <Link href="/mines/metiers/" className="rounded-[var(--radius)] border border-border bg-background px-5 py-3 text-sm font-semibold transition hover:bg-surface">Voir les métiers</Link>
          </div>
        </section>
      </main>
    );
  }

  notFound();
}
