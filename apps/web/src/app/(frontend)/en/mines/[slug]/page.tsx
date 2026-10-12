import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { disciplineParams, findDiscipline, disciplineSeg } from "@/lib/mining-nav";
import { countryParams, findCountry } from "@/lib/mining-countries";
import { hreflang } from "@/lib/i18n";
import { MiningCountryPage, MiningDisciplinePage } from "@/components/views/mining";

type Args = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...disciplineParams().map((d) => ({ slug: d.discipline })), ...countryParams()];
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const d = findDiscipline(slug);
  if (d) {
    const seg = disciplineSeg(d.url);
    return { title: `${d.label_en} — mining recruitment`, description: `${d.label_en} recruitment for mining operations in West Africa: ${d.specialties.length} roles.`, alternates: { canonical: `/en/mines/${seg}/`, languages: hreflang(`/mines/${seg}/`, `/en/mines/${seg}/`) } };
  }
  const c = findCountry(slug);
  if (c) {
    return { title: `Mining recruitment — ${c.labelEn}`, description: `Mining recruitment in ${c.labelEn}: ${c.commoditiesEn.join(", ")}. ${c.contextEn}`, alternates: { canonical: `/en/mines/${c.slug}/`, languages: hreflang(`/mines/${c.slug}/`, `/en/mines/${c.slug}/`) } };
  }
  return {};
}

export default async function MinesSlugEn({ params }: Args) {
  const { slug } = await params;
  const d = findDiscipline(slug);
  if (d) return <MiningDisciplinePage discipline={d} lang="en" />;
  const c = findCountry(slug);
  if (c) return <MiningCountryPage country={c} lang="en" />;
  notFound();
}
