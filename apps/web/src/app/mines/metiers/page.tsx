import Link from "next/link";
import type { Metadata } from "next";
import { mining } from "@maximerit/domain";
import { disciplineSeg } from "@/lib/mining-nav";

export const metadata: Metadata = {
  title: "Métiers miniers",
  description: "Tous les métiers miniers recrutés par Maximerit en Afrique de l'Ouest : géologie, exploitation, finance, leadership.",
  alternates: { canonical: "/mines/metiers/" },
};

export default function MetiersListing() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted"><Link href="/mines/">Mines &amp; Ressources</Link> <span aria-hidden>›</span> <span>Métiers</span></nav>
      <h1 className="mt-3 font-display text-4xl font-bold">Métiers miniers</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">Les compétences qui font fonctionner les opérations minières, par pôle.</p>

      <div className="mt-10 space-y-10">
        {mining.disciplines.map((d) => (
          <section key={d.slug}>
            <h2 className="text-xl font-semibold">
              <Link href={d.url} className="hover:text-brand">{d.label_fr}</Link>
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {d.specialties.map((s) => (
                <Link key={s.slug} href={`/mines/metiers/${s.slug}/`} className="rounded-[var(--radius)] border border-border p-4 text-sm transition hover:border-brand">
                  <span className="font-semibold">{s.label_fr}</span>
                  <span className="mt-0.5 block text-xs text-muted">{disciplineSeg(d.url)}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
