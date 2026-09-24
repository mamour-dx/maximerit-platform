import Link from "next/link";
import type { Metadata } from "next";
import { SECTORS } from "@/lib/content";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const metadata: Metadata = {
  title: "Sectors",
  description: "Mining & Resources (priority), energy, oil & gas, construction & infrastructure, industry, services.",
  alternates: { canonical: "/en/secteurs/", languages: hreflang("/secteurs/", "/en/secteurs/") },
};

export default function SecteursHubEn() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <SetLang lang="en" />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Sectors</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Sectors we cover</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/en/mines/" className="rounded-[var(--radius)] border border-brand p-5 text-brand transition hover:shadow-sm">
          <span className="text-lg font-semibold">Mining &amp; Resources ★</span>
          <span className="mt-1 block text-sm">Priority vertical — mining recruitment across West Africa.</span>
        </Link>
        {SECTORS.map((s) => (
          <Link key={s.slug} href={`/en/secteurs/${s.slug}/`} className="rounded-[var(--radius)] border border-border p-5 transition hover:border-brand hover:shadow-sm">
            <span className="text-lg font-semibold">{s.titleEn}</span>
            <span className="mt-1 block text-sm text-muted">{s.introEn}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
