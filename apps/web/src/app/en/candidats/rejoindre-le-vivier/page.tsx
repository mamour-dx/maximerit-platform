import type { Metadata } from "next";
import { ApplyForm } from "@/components/ApplyForm";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const metadata: Metadata = {
  title: "Join the Maximerit talent pool",
  description: "Join the Maximerit talent pool: be approached for the opportunities that match your profile.",
  alternates: { canonical: "/en/candidats/rejoindre-le-vivier/", languages: hreflang("/candidats/rejoindre-le-vivier/", "/en/candidats/rejoindre-le-vivier/") },
};

const BENEFITS = [
  "Be identified for roles before they are published",
  "A qualified, actionable profile — not a forgotten CV",
  "Opportunities targeted to your role and mobility",
];

export default function RejoindreVivierEn() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <SetLang lang="en" />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Candidates</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Join the talent pool</h1>
      <p className="mt-4 text-lg text-muted">The Maximerit talent pool is an asset: the more qualified your profile, the better the opportunities we can offer you.</p>
      <ul className="mt-6 space-y-2">
        {BENEFITS.map((a) => (
          <li key={a} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /><span>{a}</span></li>
        ))}
      </ul>
      <section className="mt-10 rounded-[var(--radius)] border border-border p-6">
        <h2 className="font-display text-2xl font-bold">Join the pool</h2>
        <p className="mt-1 mb-5 text-sm text-muted">CV required (PDF/DOCX) + consent to the processing of your data.</p>
        <ApplyForm lang="en" />
      </section>
    </main>
  );
}
