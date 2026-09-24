import type { Metadata } from "next";
import Link from "next/link";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const metadata: Metadata = {
  title: "About us",
  description: "Maximerit — recruitment, executive search and staffing in West Africa, specialists in Mining & Natural Resources.",
  alternates: { canonical: "/en/qui-nous-sommes/", languages: hreflang("/qui-nous-sommes/", "/en/qui-nous-sommes/") },
};

const PILLARS = [
  ["Sector specialisation", "A fine-grained knowledge of mining roles and critical functions."],
  ["Regional knowledge", "West Africa: Senegal, Guinea, Ivory Coast, Mali, Mauritania, Burkina Faso, Ghana."],
  ["Proprietary talent pool", "A qualified, actionable talent base — not just a stack of CVs."],
  ["Speed", "The ability to produce a relevant short-list, fast."],
];

export default function AboutEn() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <SetLang lang="en" />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">About</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">About us</h1>
      <p className="mt-4 text-lg text-muted">
        Maximerit helps West African companies access the skills they need to hire, structure and run their
        operations — with a strong specialisation in Mining &amp; Natural Resources.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {PILLARS.map(([t, d]) => (
          <div key={t} className="rounded-[var(--radius)] border border-border p-5">
            <h2 className="font-semibold">{t}</h2>
            <p className="mt-1 text-sm text-muted">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <Link href="/en/contact/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Contact us</Link>
      </div>
    </main>
  );
}
