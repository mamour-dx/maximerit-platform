import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TOOLS, type ToolSlug } from "@/lib/tools";
import { hreflang } from "@/lib/i18n";
import { ToolPage } from "@/components/views/resources";

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

export default async function ToolPageEnRoute({ params }: Args) {
  const { tool } = await params;
  if (!(tool in TOOLS)) notFound();
  return <ToolPage lang="en" tool={tool as ToolSlug} />;
}
