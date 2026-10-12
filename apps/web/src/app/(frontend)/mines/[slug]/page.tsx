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
    return {
      title: `${d.label_fr} — recrutement minier`,
      description: `Recrutement ${d.label_fr} pour les opérations minières en Afrique de l'Ouest : ${d.specialties.length} métiers.`,
      alternates: { canonical: `/mines/${seg}/`, languages: hreflang(`/mines/${seg}/`, `/en/mines/${seg}/`) },
    };
  }
  const c = findCountry(slug);
  if (c) {
    return {
      title: `Recrutement minier — ${c.label}`,
      description: `Recrutement minier en ${c.label} : ${c.commodities.join(", ")}. ${c.context}`,
      alternates: { canonical: `/mines/${c.slug}/`, languages: hreflang(`/mines/${c.slug}/`, `/en/mines/${c.slug}/`) },
    };
  }
  return {};
}

export default async function MinesSlugPage({ params }: Args) {
  const { slug } = await params;
  const d = findDiscipline(slug);
  if (d) return <MiningDisciplinePage discipline={d} lang="fr" />;
  const c = findCountry(slug);
  if (c) return <MiningCountryPage country={c} lang="fr" />;
  notFound();
}
