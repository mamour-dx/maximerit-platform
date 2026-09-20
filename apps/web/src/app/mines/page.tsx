import Link from "next/link";
import type { Metadata } from "next";
import { mining } from "@maximerit/domain";
import { EmptyState } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Recrutement minier en Afrique de l'Ouest",
  description:
    "Hub Mining Maximerit : géologie & exploration, exploitation & opérations, finance et leadership. Les compétences qui font fonctionner les opérations minières.",
  alternates: { canonical: "/mines/" },
};

export default function MinesHub() {
  const { disciplines } = mining;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
        <Link href="/">Accueil</Link> <span aria-hidden>›</span> <span>Mines &amp; Ressources</span>
      </nav>
      <h1 className="mt-3 text-4xl font-bold">Recrutement minier en Afrique de l&apos;Ouest</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Les compétences qui font fonctionner les opérations minières, organisées en quatre pôles.
      </p>

      {disciplines.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="Aucun pôle disponible" hint="La taxonomie Mining sera bientôt publiée." />
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {disciplines.map((d) => (
            <article key={d.slug} className="rounded-[var(--radius)] border border-border p-5">
              <h2 className="text-xl font-semibold">
                <Link href={d.url} className="hover:text-brand">{d.label_fr}</Link>
              </h2>
              <p className="mt-1 text-sm text-muted">{d.specialties.length} métiers</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {d.specialties.slice(0, 4).map((s) => (
                  <li key={s.slug} className="rounded-full bg-surface px-3 py-1 text-xs">{s.label_fr}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
