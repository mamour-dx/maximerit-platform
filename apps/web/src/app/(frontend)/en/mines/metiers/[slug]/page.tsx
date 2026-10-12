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
    title: `${r.specialty.label_en} recruitment — West Africa`,
    description: `Recruiting a ${r.specialty.label_en} for your mining operations in West Africa — ${r.discipline.label_en}.`,
    alternates: { canonical: `/en/mines/metiers/${slug}/`, languages: hreflang(`/mines/metiers/${slug}/`, `/en/mines/metiers/${slug}/`) },
  };
}

export default async function MetierEn({ params }: Args) {
  const { slug } = await params;
  const r = findSpecialty(slug);
  if (!r) notFound();
  return <MiningRolePage specialty={r.specialty} discipline={r.discipline} lang="en" />;
}
