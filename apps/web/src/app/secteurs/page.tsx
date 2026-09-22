import Link from "next/link";
import type { Metadata } from "next";
import { SECTORS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Secteurs",
  description: "Mines & Ressources (prioritaire), énergie, pétrole & gaz, BTP & infrastructures, industrie, services.",
  alternates: { canonical: "/secteurs/" },
};

export default function SecteursHub() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Secteurs</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Secteurs couverts</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/mines/" className="rounded-[var(--radius)] border border-brand p-5 text-brand transition hover:shadow-sm">
          <span className="text-lg font-semibold">Mines &amp; Ressources ★</span>
          <span className="mt-1 block text-sm">Verticale prioritaire — recrutement minier en Afrique de l&apos;Ouest.</span>
        </Link>
        {SECTORS.map((s) => (
          <Link key={s.slug} href={`/secteurs/${s.slug}/`} className="rounded-[var(--radius)] border border-border p-5 transition hover:border-brand hover:shadow-sm">
            <span className="text-lg font-semibold">{s.title}</span>
            <span className="mt-1 block text-sm text-muted">{s.intro}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
