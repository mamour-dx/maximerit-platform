import Link from "next/link";
import type { Metadata } from "next";
import { mining } from "@maximerit/domain";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const metadata: Metadata = {
  title: "Maximerit — Recruitment & talent in West Africa",
  description: "Recruitment, executive search and a qualified talent pool in West Africa, specialised in Mining & Natural Resources.",
  alternates: { canonical: "/en/", languages: hreflang("/", "/en/") },
};

export default function HomeEn() {
  const disciplines = mining.disciplines;
  const metiers = disciplines.reduce((n, d) => n + d.specialties.length, 0);

  return (
    <main>
      <SetLang lang="en" />
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">West Africa · Mining &amp; Natural Resources</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-[1.1] sm:text-6xl">
            Where companies find the skills, and talent becomes visible.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Recruitment, executive search and a qualified talent pool — specialists in mining operations
            and critical functions across West Africa.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/en/mines/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Mining recruitment</Link>
            <Link href="/en/contact/" className="rounded-[var(--radius)] border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface">Hire with us</Link>
          </div>
          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-8">
            {[[String(disciplines.length), "Mining pillars"], [`${metiers}+`, "roles mapped"], ["7", "priority countries"]].map(([v, l]) => (
              <div key={l}><dt className="font-display text-4xl font-bold text-brand">{v}</dt><dd className="mt-1 text-sm text-muted">{l}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto w-full max-w-6xl border-l-4 border-brand px-6 py-16 pl-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Priority vertical</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Mining recruitment in West Africa</h2>
          <p className="mt-3 max-w-2xl text-muted">The skills that keep mining operations running, organised into four pillars.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {disciplines.map((d) => (
              <div key={d.slug} className="rounded-[var(--radius)] border border-border bg-background p-5">
                <span className="font-semibold">{d.label_en}</span>
                <span className="mt-1 block text-sm text-muted">{d.specialties.length} roles</span>
              </div>
            ))}
          </div>
          <Link href="/en/mines/" className="mt-8 inline-block rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Explore the Mining vertical</Link>
        </div>
      </section>

      <section className="bg-brand text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-14 md:flex-row md:items-center md:justify-between">
          <div><h2 className="font-display text-3xl font-bold">A hiring need?</h2><p className="mt-2 text-white/85">Get a qualified short-list, fast.</p></div>
          <Link href="/en/contact/" className="rounded-[var(--radius)] bg-white px-6 py-3 text-sm font-semibold text-brand transition hover:bg-white/90">Hire with us</Link>
        </div>
      </section>
    </main>
  );
}
