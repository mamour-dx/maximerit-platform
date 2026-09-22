import type { Metadata } from "next";
import { ApplyForm } from "@/components/ApplyForm";

export const metadata: Metadata = {
  title: "Rejoindre le vivier Maximerit",
  description: "Intégrez le vivier de talents Maximerit : soyez sollicité pour les opportunités qui correspondent à votre profil.",
  alternates: { canonical: "/candidats/rejoindre-le-vivier/" },
};

const AVANTAGES = [
  "Être identifié pour des postes avant leur publication",
  "Un profil qualifié et exploitable, pas un CV oublié",
  "Des opportunités ciblées sur votre métier et votre mobilité",
];

export default function RejoindreVivierPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Candidats</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Rejoindre le vivier</h1>
      <p className="mt-4 text-lg text-muted">Le vivier Maximerit est un actif : plus votre profil est qualifié, plus nous pouvons vous proposer les bonnes opportunités.</p>
      <ul className="mt-6 space-y-2">
        {AVANTAGES.map((a) => (
          <li key={a} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /><span>{a}</span></li>
        ))}
      </ul>
      <section className="mt-10 rounded-[var(--radius)] border border-border p-6">
        <h2 className="font-display text-2xl font-bold">Intégrer le vivier</h2>
        <p className="mt-1 mb-5 text-sm text-muted">CV requis (PDF/DOCX) + consentement au traitement de vos données.</p>
        <ApplyForm />
      </section>
    </main>
  );
}
