import Link from "next/link";
import type { Metadata } from "next";
import { mining } from "@maximerit/domain";
import { MINING_COUNTRIES } from "@/lib/mining-countries";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Cabinet de recrutement minier en Afrique de l'Ouest",
  description: "Maximerit, cabinet spécialisé du recrutement minier en Afrique de l'Ouest : géologie, exploitation, finance et executive search. Short-list qualifiée, rapidement.",
  alternates: { canonical: "/mines/recrutement-minier/" },
};

const PROBLEMES = [
  "Des profils rares et très demandés (géologues, ingénieurs miniers, HSE, direction).",
  "Des délais de recrutement qui pèsent sur les opérations et les projets.",
  "Des enjeux de mobilité, de langues et d'expérience terrain propres à la région.",
];
const METHODE = [
  ["Sourcing ciblé", "Vivier propriétaire + approche directe des profils rares."],
  ["Qualification", "Évaluation métier, mobilité, langues, disponibilité et commodities."],
  ["Short-list", "Une liste courte et pertinente, rapidement."],
  ["Placement & suivi", "Accompagnement jusqu'à la prise de poste."],
];
const REFERENCES = ["Senelec", "SGS", "BMN", "Endeavour", "Teranga", "GCO"];

export default function RecrutementMinier() {
  return (
    <main>
      {/* Promesse */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <nav aria-label="Fil d'Ariane" className="text-sm text-muted"><Link href="/mines/">Mines &amp; Ressources</Link> <span aria-hidden>›</span> <span>Recrutement minier</span></nav>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Cabinet de recrutement minier</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">Cabinet de recrutement minier en Afrique de l&apos;Ouest</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">Nous mobilisons les compétences qui font fonctionner les opérations minières — de l&apos;exploration à l&apos;exploitation, jusqu&apos;au leadership.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Confier un recrutement</Link>
            <Link href="/candidats/deposer-mon-cv/" className="rounded-[var(--radius)] border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface">Je suis candidat</Link>
          </div>
        </div>
      </section>

      {/* Problème */}
      <section>
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <h2 className="font-display text-3xl font-bold">Le problème</h2>
          <span className="mt-3 block h-1 w-16 rounded bg-brand" />
          <ul className="mt-6 space-y-2">
            {PROBLEMES.map((p) => (<li key={p} className="flex gap-2 text-muted"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /><span>{p}</span></li>))}
          </ul>
        </div>
      </section>

      {/* Profils recherchés */}
      <section className="bg-surface">
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <h2 className="font-display text-3xl font-bold">Profils recherchés</h2>
          <span className="mt-3 block h-1 w-16 rounded bg-brand" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mining.disciplines.map((d) => (
              <Link key={d.slug} href={d.url} className="rounded-[var(--radius)] border border-border bg-background p-5 transition hover:border-brand">
                <span className="font-semibold">{d.label_fr}</span>
                <span className="mt-1 block text-sm text-muted">{d.specialties.length} métiers</span>
              </Link>
            ))}
          </div>
          <Link href="/mines/metiers/" className="mt-6 inline-block text-sm font-semibold text-brand hover:underline">Voir tous les métiers →</Link>
        </div>
      </section>

      {/* Méthode */}
      <section>
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <h2 className="font-display text-3xl font-bold">Notre méthode</h2>
          <span className="mt-3 block h-1 w-16 rounded bg-brand" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METHODE.map(([t, d], i) => (
              <div key={t} className="rounded-[var(--radius)] border border-border p-5">
                <div className="font-display text-2xl font-bold text-brand">{i + 1}</div>
                <div className="mt-1 font-semibold">{t}</div>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preuve */}
      <section className="bg-surface">
        <div className="mx-auto w-full max-w-5xl px-6 py-14 text-center">
          <h2 className="font-display text-3xl font-bold">Ils nous font confiance</h2>
          <span className="mx-auto mt-3 block h-1 w-16 rounded bg-brand" />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {REFERENCES.map((r) => (<span key={r} className="text-lg font-semibold text-muted">{r}</span>))}
          </div>
        </div>
      </section>

      {/* Pays */}
      <section>
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <h2 className="font-display text-3xl font-bold">Où nous recrutons</h2>
          <span className="mt-3 block h-1 w-16 rounded bg-brand" />
          <div className="mt-6 flex flex-wrap gap-2">
            {MINING_COUNTRIES.map((c) => (<Link key={c.slug} href={`/mines/${c.slug}/`} className="rounded-full border border-border px-3 py-1 text-sm transition hover:border-brand">{c.label}</Link>))}
          </div>
        </div>
      </section>

      {/* CTA + formulaire */}
      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-3xl px-6 py-16">
          <h2 className="font-display text-3xl font-bold">Confier un recrutement minier</h2>
          <p className="mt-1 mb-6 text-muted">Décrivez votre besoin — nous revenons vers vous avec une première short-list.</p>
          <LeadForm source="mines-recrutement" />
        </div>
      </section>
    </main>
  );
}
