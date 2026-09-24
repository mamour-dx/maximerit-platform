import Link from "next/link";
import type { Metadata } from "next";
import { SERVICES } from "@/lib/content";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const metadata: Metadata = {
  title: "For employers — our expertise",
  description: "Recruitment, executive search, contract staffing, HR & payroll, finance, QHSE & ESG, training — across West Africa.",
  alternates: { canonical: "/en/entreprises/", languages: hreflang("/entreprises/", "/en/entreprises/") },
};

export default function EntreprisesHubEn() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <SetLang lang="en" />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">For employers</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Our expertise</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">Access the right skills faster — fit to the realities of West Africa.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <Link key={s.slug} href={`/en/entreprises/${s.slug}/`} className="rounded-[var(--radius)] border border-border p-5 transition hover:border-brand hover:shadow-sm">
            <span className="text-lg font-semibold">{s.titleEn}</span>
            <span className="mt-1 block text-sm text-muted">{s.introEn}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
