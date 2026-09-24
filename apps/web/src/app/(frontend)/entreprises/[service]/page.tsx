import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SERVICES, getService } from "@/lib/content";
import { hreflang } from "@/lib/i18n";

type Args = { params: Promise<{ service: string }> };

export function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { service } = await params;
  const s = getService(service);
  if (!s) return {};
  return { title: s.title, description: s.intro, alternates: { canonical: `/entreprises/${service}/`, languages: hreflang(`/entreprises/${service}/`, `/en/entreprises/${service}/`) } };
}

export default async function ServicePage({ params }: Args) {
  const { service } = await params;
  const s = getService(service);
  if (!s) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted"><Link href="/entreprises/">Entreprises</Link> <span aria-hidden>›</span> <span>{s.title}</span></nav>
      <h1 className="mt-3 font-display text-4xl font-bold">{s.title}</h1>
      <p className="mt-4 text-lg text-muted">{s.intro}</p>
      <ul className="mt-8 space-y-2">
        {s.bullets.map((b) => (
          <li key={b} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /><span>{b}</span></li>
        ))}
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/contact/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Confier un recrutement</Link>
        {s.slug === "recrutement" && <Link href="/mines/" className="rounded-[var(--radius)] border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface">Recrutement minier</Link>}
      </div>
    </main>
  );
}
