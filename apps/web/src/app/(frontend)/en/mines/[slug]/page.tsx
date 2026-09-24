import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { mining } from "@maximerit/domain";
import { disciplineParams, findDiscipline, disciplineSeg } from "@/lib/mining-nav";
import { countryParams, findCountry } from "@/lib/mining-countries";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

type Args = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...disciplineParams().map((d) => ({ slug: d.discipline })), ...countryParams()];
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const d = findDiscipline(slug);
  if (d) {
    const seg = disciplineSeg(d.url);
    return { title: `${d.label_en} — mining recruitment`, description: `${d.label_en} recruitment for mining operations in West Africa: ${d.specialties.length} roles.`, alternates: { canonical: `/en/mines/${seg}/`, languages: hreflang(`/mines/${seg}/`, `/en/mines/${seg}/`) } };
  }
  const c = findCountry(slug);
  if (c) {
    return { title: `Mining recruitment — ${c.labelEn}`, description: `Mining recruitment in ${c.labelEn}: ${c.commoditiesEn.join(", ")}. ${c.contextEn}`, alternates: { canonical: `/en/mines/${c.slug}/`, languages: hreflang(`/mines/${c.slug}/`, `/en/mines/${c.slug}/`) } };
  }
  return {};
}

export default async function MinesSlugEn({ params }: Args) {
  const { slug } = await params;

  const d = findDiscipline(slug);
  if (d) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <SetLang lang="en" />
        <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link href="/en/mines/">Mining &amp; Resources</Link> <span aria-hidden>›</span> <span>{d.label_en}</span></nav>
        <h1 className="mt-3 font-display text-4xl font-bold">{d.label_en}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">The {d.label_en.toLowerCase()} skills that keep mining operations running in West Africa.</p>
        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted">Roles ({d.specialties.length})</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {d.specialties.map((s) => (
            <Link key={s.slug} href={`/en/mines/metiers/${s.slug}/`} className="rounded-[var(--radius)] border border-border p-4 transition hover:border-brand">
              <span className="font-semibold">{s.label_en}</span>
              <span className="mt-0.5 block text-xs text-muted">{s.label_fr}</span>
            </Link>
          ))}
        </div>
        <div className="mt-10"><Link href="/en/contact/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Hire with us</Link></div>
      </main>
    );
  }

  const c = findCountry(slug);
  if (c) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <SetLang lang="en" />
        <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link href="/en/mines/">Mining &amp; Resources</Link> <span aria-hidden>›</span> <span>{c.labelEn}</span></nav>
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Mining recruitment · country</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Mining recruitment in {c.labelEn}</h1>
        <p className="mt-4 text-lg text-muted">{c.contextEn}</p>
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Resources &amp; commodities</h2>
          <ul className="mt-3 flex flex-wrap gap-2">{c.commoditiesEn.map((m) => (<li key={m} className="rounded-full border border-border bg-surface px-3 py-1 text-sm">{m}</li>))}</ul>
        </section>
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Pillars involved</h2>
          <div className="mt-3 flex flex-wrap gap-2">{mining.disciplines.map((disc) => (<Link key={disc.slug} href={`/en/mines/${disciplineSeg(disc.url)}/`} className="rounded-full border border-border px-3 py-1 text-sm transition hover:border-brand">{disc.label_en}</Link>))}</div>
        </section>
        <section className="mt-12 rounded-[var(--radius)] border-l-4 border-brand bg-ink p-6">
          <h2 className="font-display text-2xl font-bold">A need in {c.labelEn}?</h2>
          <p className="mt-1 mb-5 text-sm text-muted">We mobilise qualified profiles with the right field experience and mobility.</p>
          <Link href="/en/contact/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Hire with us</Link>
        </section>
      </main>
    );
  }

  notFound();
}
