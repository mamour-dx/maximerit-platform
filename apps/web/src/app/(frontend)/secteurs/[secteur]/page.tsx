import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SECTORS, getSector } from "@/lib/content";
import { hreflang } from "@/lib/i18n";

type Args = { params: Promise<{ secteur: string }> };

export function generateStaticParams() {
  return SECTORS.map((s) => ({ secteur: s.slug }));
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { secteur } = await params;
  const s = getSector(secteur);
  if (!s) return {};
  return { title: s.title, description: s.intro, alternates: { canonical: `/secteurs/${secteur}/`, languages: hreflang(`/secteurs/${secteur}/`, `/en/secteurs/${secteur}/`) } };
}

export default async function SecteurPage({ params }: Args) {
  const { secteur } = await params;
  const s = getSector(secteur);
  if (!s) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted"><Link href="/secteurs/">Secteurs</Link> <span aria-hidden>›</span> <span>{s.title}</span></nav>
      <h1 className="mt-3 font-display text-4xl font-bold">{s.title}</h1>
      <p className="mt-4 text-lg text-muted">{s.intro}</p>
      <p className="mt-4 text-muted">Les compétences sont souvent transférables entre ces univers et notre verticale prioritaire <Link href="/mines/" className="text-brand hover:underline">Mines &amp; Ressources</Link>.</p>
      <div className="mt-10">
        <Link href="/contact/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Confier un recrutement</Link>
      </div>
    </main>
  );
}
