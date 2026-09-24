import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TOOLS, type ToolSlug } from "@/lib/tools";
import { ToolCalculator } from "@/components/tools/ToolCalculator";
import { LeadForm } from "@/components/LeadForm";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

type Args = { params: Promise<{ tool: string }> };

export function generateStaticParams() {
  return Object.keys(TOOLS).map((tool) => ({ tool }));
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { tool } = await params;
  const t = TOOLS[tool as ToolSlug];
  if (!t) return {};
  return { title: t.titleEn, alternates: { canonical: `/en/ressources/outils/${tool}/`, languages: hreflang(`/ressources/outils/${tool}/`, `/en/ressources/outils/${tool}/`) } };
}

export default async function ToolPageEn({ params }: Args) {
  const { tool } = await params;
  if (!(tool in TOOLS)) notFound();
  const t = TOOLS[tool as ToolSlug];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <SetLang lang="en" />
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">Free tool</p>
      <h1 className="mt-2 text-4xl font-bold">{t.titleEn}</h1>
      <p className="mt-3 text-muted">Indicative result. For a full analysis tailored to your context, let&apos;s talk.</p>

      <section className="mt-8">
        <ToolCalculator tool={tool as ToolSlug} lang="en" />
      </section>

      <section className="mt-12 rounded-[var(--radius)] border border-border p-6">
        <h2 className="text-2xl font-bold">Get the full analysis</h2>
        <p className="mt-1 mb-5 text-sm text-muted">A Maximerit consultant will send you a detailed estimate.</p>
        <LeadForm source={`tool:${tool}`} lang="en" ctaLabel="Get the full analysis" />
      </section>
    </main>
  );
}
