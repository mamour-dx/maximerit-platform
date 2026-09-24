import Link from "next/link";
import type { Metadata } from "next";
import { mining } from "@maximerit/domain";
import { disciplineSeg } from "@/lib/mining-nav";
import { MINING_COUNTRIES } from "@/lib/mining-countries";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const metadata: Metadata = {
  title: "Mining recruitment in West Africa",
  description: "Maximerit Mining hub: geology & exploration, operations, finance and leadership. The skills that keep mining operations running.",
  alternates: { canonical: "/en/mines/", languages: hreflang("/mines/", "/en/mines/") },
};

export default function MinesEn() {
  const { disciplines } = mining;
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <SetLang lang="en" />
      <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link href="/en/">Home</Link> <span aria-hidden>›</span> <span>Mining &amp; Resources</span></nav>
      <h1 className="mt-3 font-display text-4xl font-bold">Mining recruitment in West Africa</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">The skills that keep mining operations running, organised into four pillars.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {disciplines.map((d) => (
          <Link key={d.slug} href={`/en/mines/${disciplineSeg(d.url)}/`} className="block rounded-[var(--radius)] border border-border p-5 transition hover:border-brand">
            <h2 className="text-xl font-semibold">{d.label_en}</h2>
            <p className="mt-1 text-sm text-muted">{d.specialties.length} roles</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {d.specialties.slice(0, 4).map((s) => (<li key={s.slug} className="rounded-full bg-surface px-3 py-1 text-xs">{s.label_en}</li>))}
            </ul>
          </Link>
        ))}
      </div>
      <Link href="/en/mines/metiers/" className="mt-6 inline-block text-sm font-semibold text-brand hover:underline">View all roles →</Link>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold">Mining recruitment by country</h2>
        <span className="mt-3 block h-1 w-16 rounded bg-brand" />
        <div className="mt-5 flex flex-wrap gap-2">
          {MINING_COUNTRIES.map((c) => (<Link key={c.slug} href={`/en/mines/${c.slug}/`} className="rounded-full border border-border bg-surface px-3 py-1 text-sm transition hover:border-brand">{c.labelEn}</Link>))}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/en/mines/recrutement-minier/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Mining recruitment agency</Link>
        <Link href="/en/contact/" className="rounded-[var(--radius)] border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface">Hire with us</Link>
      </div>
    </main>
  );
}
