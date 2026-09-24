import type { Metadata } from "next";
import { ApplyForm } from "@/components/ApplyForm";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Déposer mon CV",
  description: "Déposez votre CV pour rejoindre le vivier de talents Maximerit en Afrique de l'Ouest.",
  alternates: { canonical: "/candidats/deposer-mon-cv/", languages: hreflang("/candidats/deposer-mon-cv/", "/en/candidats/deposer-mon-cv/") },
};

export default function DeposerCvPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Candidats</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Déposer mon CV</h1>
      <p className="mt-4 text-lg text-muted">
        Rendez-vous visible auprès des entreprises qui recrutent dans la région — même avant l&apos;ouverture officielle d&apos;un poste.
      </p>
      <section className="mt-10 rounded-[var(--radius)] border border-border p-6">
        <h2 className="font-display text-2xl font-bold">Votre candidature</h2>
        <p className="mt-1 mb-5 text-sm text-muted">CV requis (PDF/DOCX). Vos données rejoignent notre vivier avec votre consentement.</p>
        <ApplyForm />
      </section>
    </main>
  );
}
