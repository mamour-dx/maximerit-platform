import Link from "next/link";
import { mining } from "@maximerit/domain";
import { Button } from "@/components/ui/Button";

const PILIERS = [
  "Recrutement",
  "Executive Search",
  "Intérim & mise à disposition",
  "Externalisation RH & Paie",
  "Finance & Performance",
  "QHSE & ESG",
  "Formation",
];

export default function Home() {
  const disciplines = mining.disciplines;
  const metiers = disciplines.reduce((n, d) => n + d.specialties.length, 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <section className="border-b border-border pb-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          Afrique de l&apos;Ouest · Mines &amp; Ressources naturelles
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          L&apos;endroit où les entreprises viennent chercher les compétences,
          et où les talents se rendent visibles.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Cabinet de recrutement, executive search et vivier de talents qualifiés,
          spécialisé sur les opérations minières en Afrique de l&apos;Ouest.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/mines/"><Button>Recrutement minier</Button></Link>
          <Link href="/contact/"><Button variant="ghost">Confier un recrutement</Button></Link>
        </div>
      </section>

      <section className="grid gap-8 py-12 sm:grid-cols-3">
        <Stat value={String(disciplines.length)} label="pôles Mining" />
        <Stat value={`${metiers}+`} label="métiers cartographiés" />
        <Stat value="7" label="pays prioritaires" />
      </section>

      <section className="py-4">
        <h2 className="text-2xl font-bold">Nos expertises entreprises</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {PILIERS.map((p) => (
            <li key={p} className="rounded-full border border-border bg-surface px-3 py-1 text-sm">{p}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-brand">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
