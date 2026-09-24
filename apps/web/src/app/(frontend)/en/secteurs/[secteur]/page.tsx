import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SECTORS, getSector } from "@/lib/content";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

type Args = { params: Promise<{ secteur: string }> };

export function generateStaticParams() {
  return SECTORS.map((s) => ({ secteur: s.slug }));
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { secteur } = await params;
  const s = getSector(secteur);
  if (!s) return {};
  return { title: s.titleEn, description: s.introEn, alternates: { canonical: `/en/secteurs/${secteur}/`, languages: hreflang(`/secteurs/${secteur}/`, `/en/secteurs/${secteur}/`) } };
}

export default async function SecteurEn({ params }: Args) {
  const { secteur } = await params;
  const s = getSector(secteur);
  if (!s) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <SetLang lang="en" />
      <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link href="/en/secteurs/">Sectors</Link> <span aria-hidden>›</span> <span>{s.titleEn}</span></nav>
      <h1 className="mt-3 font-display text-4xl font-bold">{s.titleEn}</h1>
      <p className="mt-4 text-lg text-muted">{s.introEn}</p>
      <p className="mt-4 text-muted">Skills are often transferable between these fields and our priority vertical, <Link href="/en/mines/" className="text-brand hover:underline">Mining &amp; Resources</Link>.</p>
      <div className="mt-10">
        <Link href="/en/contact/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Hire with us</Link>
      </div>
    </main>
  );
}
