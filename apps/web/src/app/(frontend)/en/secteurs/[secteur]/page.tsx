import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { SECTORS, getSector } from "@/lib/content";
import { SectorPage } from "@/components/views/company";

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

export default async function SecteurEnPage({ params }: Args) {
  const { secteur } = await params;
  const s = getSector(secteur);
  if (!s) notFound();
  return <SectorPage sector={s} lang="en" />;
}
