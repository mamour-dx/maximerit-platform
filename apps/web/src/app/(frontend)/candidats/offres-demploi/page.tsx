import type { Metadata } from "next";
import { JobBoard } from "@/components/jobs/JobBoard";
import { getPublishedJobs } from "@/components/jobs/data";
import { hasActiveFilters, parseJobFilters } from "@/lib/job-board";
import { hreflang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filters = parseJobFilters(await searchParams);
  return {
    title: "Offres d'emploi",
    description: "Offres d'emploi Maximerit — recrutement en Afrique de l'Ouest, verticale Mines & Ressources.",
    alternates: { canonical: "/candidats/offres-demploi/", languages: hreflang("/candidats/offres-demploi/", "/en/candidats/offres-demploi/") },
    // Pages filtrées : canonical vers la liste, non indexées (évite le contenu quasi-dupliqué).
    robots: hasActiveFilters(filters) ? { index: false, follow: true } : undefined,
  };
}

export default async function JobsListing({ searchParams }: Props) {
  const [filters, jobs] = await Promise.all([searchParams.then(parseJobFilters), getPublishedJobs("fr")]);
  return <JobBoard lang="fr" jobs={jobs} filters={filters} />;
}
