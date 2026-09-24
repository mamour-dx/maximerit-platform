import Link from "next/link";
import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Conseils carrière",
  description: "Conseils Maximerit pour votre carrière dans les mines, l'industrie et les fonctions support en Afrique de l'Ouest.",
  alternates: { canonical: "/candidats/conseils-carriere/", languages: hreflang("/candidats/conseils-carriere/", "/en/candidats/conseils-carriere/") },
};

const CONSEILS = [
  ["Un CV structuré et daté", "Faites ressortir vos expériences par projet, commodity, type de mine et pays."],
  ["Vos compétences clés", "Certifications, langues, mobilité et disponibilité : des critères décisifs pour nos clients."],
  ["Restez visible", "Déposez votre CV dans notre vivier et tenez votre profil à jour."],
];

export default function ConseilsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Candidats</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Conseils carrière</h1>
      <div className="mt-10 space-y-6">
        {CONSEILS.map(([t, d]) => (
          <div key={t}>
            <h2 className="text-xl font-semibold">{t}</h2>
            <p className="mt-1 text-muted">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/candidats/deposer-mon-cv/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Déposer mon CV</Link>
        <Link href="/candidats/offres-demploi/" className="rounded-[var(--radius)] border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface">Voir les offres</Link>
      </div>
    </main>
  );
}
