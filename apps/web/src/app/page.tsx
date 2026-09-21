import Link from "next/link";
import { mining } from "@maximerit/domain";

const EXPERTISES = [
  ["Recrutement", "/entreprises/recrutement/"],
  ["Executive Search", "/entreprises/executive-search/"],
  ["Intérim & mise à disposition", "/entreprises/interim/"],
  ["Externalisation RH & Paie", "/entreprises/externalisation-rh-paie/"],
  ["Finance & Performance", "/entreprises/finance-performance/"],
  ["QHSE & ESG", "/entreprises/qhse-esg/"],
  ["Formation", "/entreprises/formation/"],
];
const SECTEURS = [
  ["Mines & Ressources", "/mines/", true],
  ["Énergie", "/secteurs/energie/", false],
  ["Pétrole & Gaz", "/secteurs/petrole-gaz/", false],
  ["BTP & Infrastructures", "/secteurs/btp-infrastructures/", false],
  ["Industrie", "/secteurs/industrie/", false],
  ["Services", "/secteurs/services/", false],
] as const;
const OUTILS = [
  ["Coût d'un poste vacant", "/ressources/outils/cout-vacance/"],
  ["Coût d'un recrutement", "/ressources/outils/cout-recrutement/"],
  ["Benchmark salaire", "/ressources/outils/benchmark-salaire/"],
  ["Mining Team Planner", "/ressources/outils/mining-team-planner/"],
];
const REFERENCES = ["Senelec", "SGS", "BMN", "Endeavour", "Teranga", "GCO"];

function TitleAccent({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-3xl font-bold sm:text-4xl">{children}</h2>
      <span className="mt-3 block h-1 w-16 rounded bg-brand" />
    </div>
  );
}

export default function Home() {
  const disciplines = mining.disciplines;
  const metiers = disciplines.reduce((n, d) => n + d.specialties.length, 0);

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Afrique de l&apos;Ouest · Mines &amp; Ressources naturelles
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-[1.1] sm:text-6xl">
            L&apos;endroit où les entreprises trouvent les compétences,
            et où les talents se rendent visibles.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Cabinet de recrutement, executive search et vivier de talents qualifiés, spécialiste des
            opérations minières et des fonctions critiques en Afrique de l&apos;Ouest.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/mines/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
              Recrutement minier
            </Link>
            <Link href="/contact/" className="rounded-[var(--radius)] border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface">
              Confier un recrutement
            </Link>
            <Link href="/candidats/deposer-mon-cv/" className="rounded-[var(--radius)] border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface">
              Déposer mon CV
            </Link>
          </div>
          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-8">
            {[[String(disciplines.length), "pôles Mining"], [`${metiers}+`, "métiers cartographiés"], ["7", "pays prioritaires"]].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-4xl font-bold text-brand">{v}</dt>
                <dd className="mt-1 text-sm text-muted">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Expertises entreprises */}
      <section id="expertises" className="scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <TitleAccent>Nos expertises entreprises</TitleAccent>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERTISES.map(([label, href]) => (
              <Link key={label} href={href} className="rounded-[var(--radius)] border border-border p-5 transition hover:border-brand hover:shadow-sm">
                <span className="text-lg font-semibold">{label}</span>
                <span className="mt-1 block text-sm text-muted">Accéder plus vite aux compétences adaptées.</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mining — verticale prioritaire (bande sombre) */}
      <section className="bg-ink text-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Verticale prioritaire</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Recrutement minier en Afrique de l&apos;Ouest</h2>
          <p className="mt-3 max-w-2xl text-white/80">Les compétences qui font fonctionner les opérations minières, organisées en quatre pôles.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {disciplines.map((d) => (
              <Link key={d.slug} href={d.url} className="rounded-[var(--radius)] border border-white/15 bg-white/5 p-5 transition hover:bg-white/10">
                <span className="font-semibold">{d.label_fr}</span>
                <span className="mt-1 block text-sm text-white/70">{d.specialties.length} métiers</span>
              </Link>
            ))}
          </div>
          <Link href="/mines/" className="mt-8 inline-block rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
            Explorer la verticale Mining
          </Link>
        </div>
      </section>

      {/* Secteurs */}
      <section id="secteurs" className="scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <TitleAccent>Secteurs couverts</TitleAccent>
          <div className="mt-8 flex flex-wrap gap-3">
            {SECTEURS.map(([label, href, priority]) => (
              <Link key={label} href={href} className={`rounded-full border px-4 py-2 text-sm font-medium transition hover:border-brand ${priority ? "border-brand text-brand" : "border-border"}`}>
                {label}{priority ? " ★" : ""}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Outils gratuits (acquisition) */}
      <section className="bg-surface">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <TitleAccent>Outils gratuits</TitleAccent>
          <p className="mt-4 max-w-2xl text-muted">Des repères concrets pour vos décisions de recrutement — résultats indicatifs, méthodologie transparente.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OUTILS.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-[var(--radius)] border border-border bg-background p-5 transition hover:border-brand">
                <span className="font-semibold">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Références (preuve) */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-6 py-16 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Nos références</h2>
          <span className="mx-auto mt-3 block h-1 w-16 rounded bg-brand" />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {REFERENCES.map((r) => (
              <span key={r} className="text-lg font-semibold text-muted">{r}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-brand text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-14 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">Un besoin de recrutement ?</h2>
            <p className="mt-2 text-white/85">Recevez une première short-list qualifiée, rapidement.</p>
          </div>
          <Link href="/contact/" className="rounded-[var(--radius)] bg-white px-6 py-3 text-sm font-semibold text-brand transition hover:bg-white/90">
            Confier un recrutement
          </Link>
        </div>
      </section>
    </main>
  );
}
