import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TOOLS, type ToolSlug } from "@/lib/tools";
import { ToolCalculator } from "@/components/tools/ToolCalculator";
import { LeadForm } from "@/components/LeadForm";

type Args = { params: Promise<{ tool: string }> };

export function generateStaticParams() {
  return Object.keys(TOOLS).map((tool) => ({ tool }));
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { tool } = await params;
  const t = TOOLS[tool as ToolSlug];
  if (!t) return {};
  return { title: t.title, alternates: { canonical: `/ressources/outils/${tool}/` } };
}

export default async function ToolPage({ params }: Args) {
  const { tool } = await params;
  if (!(tool in TOOLS)) notFound();
  const t = TOOLS[tool as ToolSlug];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">Outil gratuit</p>
      <h1 className="mt-2 text-4xl font-bold">{t.title}</h1>
      <p className="mt-3 text-muted">Résultat indicatif. Pour une analyse complète adaptée à votre contexte, échangeons.</p>

      <section className="mt-8">
        <ToolCalculator tool={tool as ToolSlug} />
      </section>

      <section className="mt-12 rounded-[var(--radius)] border border-border p-6">
        <h2 className="text-2xl font-bold">Recevoir l&apos;analyse complète</h2>
        <p className="mt-1 mb-5 text-sm text-muted">Un consultant Maximerit vous transmet une estimation détaillée.</p>
        <LeadForm source={`tool:${tool}`} ctaLabel="Recevoir l'analyse complète" />
      </section>
    </main>
  );
}
