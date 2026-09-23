import Link from "next/link";
import type { Metadata } from "next";
import { mining } from "@maximerit/domain";
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
          <article key={d.slug} className="rounded-[var(--radius)] border border-border p-5">
            <h2 className="text-xl font-semibold">{d.label_en}</h2>
            <p className="mt-1 text-sm text-muted">{d.specialties.length} roles</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {d.specialties.slice(0, 4).map((s) => (<li key={s.slug} className="rounded-full bg-surface px-3 py-1 text-xs">{s.label_en}</li>))}
            </ul>
          </article>
        ))}
      </div>
      <div className="mt-10">
        <Link href="/en/contact/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Hire with us</Link>
      </div>
    </main>
  );
}
