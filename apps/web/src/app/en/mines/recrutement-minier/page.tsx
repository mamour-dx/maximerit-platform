import Link from "next/link";
import type { Metadata } from "next";
import { mining } from "@maximerit/domain";
import { disciplineSeg } from "@/lib/mining-nav";
import { MINING_COUNTRIES } from "@/lib/mining-countries";
import { LeadForm } from "@/components/LeadForm";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const metadata: Metadata = {
  title: "Mining recruitment agency in West Africa",
  description: "Maximerit, specialist mining recruitment in West Africa: geology, operations, finance and executive search. A qualified short-list, fast.",
  alternates: { canonical: "/en/mines/recrutement-minier/", languages: hreflang("/mines/recrutement-minier/", "/en/mines/recrutement-minier/") },
};

const METHOD = [
  ["Targeted sourcing", "Proprietary talent pool + direct approach to rare profiles."],
  ["Qualification", "Assessment of role, mobility, languages, availability and commodities."],
  ["Short-list", "A short, relevant list — fast."],
  ["Placement & follow-up", "Support through to onboarding."],
];

export default function RecrutementMinierEn() {
  return (
    <main>
      <SetLang lang="en" />
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link href="/en/mines/">Mining &amp; Resources</Link> <span aria-hidden>›</span> <span>Mining recruitment</span></nav>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Mining recruitment agency</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">Mining recruitment agency in West Africa</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">We mobilise the skills that keep mining operations running — from exploration to operations, up to leadership.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/en/contact/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Hire with us</Link>
            <Link href="/candidats/deposer-mon-cv/" className="rounded-[var(--radius)] border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface">I&apos;m a candidate</Link>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <h2 className="font-display text-3xl font-bold">Profiles we recruit</h2>
          <span className="mt-3 block h-1 w-16 rounded bg-brand" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mining.disciplines.map((d) => (
              <Link key={d.slug} href={`/en/mines/${disciplineSeg(d.url)}/`} className="rounded-[var(--radius)] border border-border bg-background p-5 transition hover:border-brand">
                <span className="font-semibold">{d.label_en}</span>
                <span className="mt-1 block text-sm text-muted">{d.specialties.length} roles</span>
              </Link>
            ))}
          </div>
          <Link href="/en/mines/metiers/" className="mt-6 inline-block text-sm font-semibold text-brand hover:underline">View all roles →</Link>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <h2 className="font-display text-3xl font-bold">Our method</h2>
          <span className="mt-3 block h-1 w-16 rounded bg-brand" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METHOD.map(([t, d], i) => (
              <div key={t} className="rounded-[var(--radius)] border border-border p-5">
                <div className="font-display text-2xl font-bold text-brand">{i + 1}</div>
                <div className="mt-1 font-semibold">{t}</div>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <h2 className="font-display text-3xl font-bold">Where we recruit</h2>
          <span className="mt-3 block h-1 w-16 rounded bg-brand" />
          <div className="mt-6 flex flex-wrap gap-2">
            {MINING_COUNTRIES.map((c) => (<Link key={c.slug} href={`/en/mines/${c.slug}/`} className="rounded-full border border-border bg-background px-3 py-1 text-sm transition hover:border-brand">{c.labelEn}</Link>))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-3xl px-6 py-16">
          <h2 className="font-display text-3xl font-bold">Hire with us</h2>
          <p className="mt-1 mb-6 text-muted">Describe your need — we&apos;ll come back with a first short-list.</p>
          <LeadForm source="mines-recrutement-en" ctaLabel="Send" />
        </div>
      </section>
    </main>
  );
}
