import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { specialtyParams, findSpecialty, disciplineSeg } from "@/lib/mining-nav";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

type Args = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return specialtyParams();
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const r = findSpecialty(slug);
  if (!r) return {};
  return {
    title: `${r.specialty.label_en} recruitment — West Africa`,
    description: `Recruiting a ${r.specialty.label_en} for your mining operations in West Africa — ${r.discipline.label_en}.`,
    alternates: { canonical: `/en/mines/metiers/${slug}/`, languages: hreflang(`/mines/metiers/${slug}/`, `/en/mines/metiers/${slug}/`) },
  };
}

export default async function MetierEn({ params }: Args) {
  const { slug } = await params;
  const r = findSpecialty(slug);
  if (!r) notFound();
  const { specialty, discipline } = r;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <SetLang lang="en" />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/en/mines/">Mining</Link> <span aria-hidden>›</span> <Link href={`/en/mines/${disciplineSeg(discipline.url)}/`}>{discipline.label_en}</Link> <span aria-hidden>›</span> <span>{specialty.label_en}</span>
      </nav>
      <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">{discipline.label_en}</p>
      <h1 className="mt-2 font-display text-4xl font-bold">{specialty.label_en} recruitment</h1>
      <p className="mt-1 text-muted">{specialty.label_fr}</p>
      <p className="mt-6 text-lg text-muted">Maximerit identifies and qualifies <strong className="text-foreground">{specialty.label_en}</strong> profiles for mining operations in West Africa — field experience, mobility, languages and availability all verified.</p>
      <section className="mt-10 rounded-[var(--radius)] border border-border p-6">
        <h2 className="font-display text-2xl font-bold">Need a {specialty.label_en}?</h2>
        <p className="mt-1 mb-5 text-sm text-muted">Get a qualified short-list from our talent pool.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/en/contact/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Hire with us</Link>
        </div>
      </section>
    </main>
  );
}
