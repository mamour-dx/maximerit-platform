import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { specialtyParams, findSpecialty } from "@/lib/mining-nav";
import { hreflang } from "@/lib/i18n";
import { MiningRolePage } from "@/components/views/mining";

type Args = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return specialtyParams();
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const r = findSpecialty(slug);
  if (!r) return {};
  return {
    title: `Recrutement ${r.specialty.label_fr} — Afrique de l'Ouest`,
    description: `Recruter un ${r.specialty.label_fr} (${r.specialty.label_en}) pour vos opérations minières en Afrique de l'Ouest — ${r.discipline.label_fr}.`,
    alternates: { canonical: `/mines/metiers/${slug}/`, languages: hreflang(`/mines/metiers/${slug}/`, `/en/mines/metiers/${slug}/`) },
  };
}

export default async function MetierPage({ params }: Args) {
  const { slug } = await params;
  const r = findSpecialty(slug);
  if (!r) notFound();
  return <MiningRolePage specialty={r.specialty} discipline={r.discipline} lang="fr" />;
}
