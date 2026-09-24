import type { Metadata } from "next";
import { ApplyForm } from "@/components/ApplyForm";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const metadata: Metadata = {
  title: "Submit my CV",
  description: "Submit your CV to join the Maximerit talent pool in West Africa.",
  alternates: { canonical: "/en/candidats/deposer-mon-cv/", languages: hreflang("/candidats/deposer-mon-cv/", "/en/candidats/deposer-mon-cv/") },
};

export default function DeposerCvEn() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <SetLang lang="en" />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Candidates</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Submit my CV</h1>
      <p className="mt-4 text-lg text-muted">
        Become visible to companies hiring across the region — even before a role is officially opened.
      </p>
      <section className="mt-10 rounded-[var(--radius)] border border-border p-6">
        <h2 className="font-display text-2xl font-bold">Your application</h2>
        <p className="mt-1 mb-5 text-sm text-muted">CV required (PDF/DOCX). Your data joins our talent pool with your consent.</p>
        <ApplyForm lang="en" />
      </section>
    </main>
  );
}
